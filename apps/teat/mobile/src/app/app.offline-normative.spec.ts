import { createHash } from 'node:crypto';
import { expect, it, vi } from 'vitest';
import { EncryptedStoreFixture } from '../testing/encrypted-store.fixture';
import { loadMobileRuntime } from '../testing/runtime-module';

const act = {
  entityType: 'ait',
  localEntityId: 'local-001',
  version: 1,
  idempotencyKey: 'idem-001',
  payloadHash: 'hash-001',
  payloadJson: { draft: true },
} as const;
type Receipt = Readonly<{
  localEntityId: string;
  idempotencyKey: string;
  status: 'received' | 'applied' | 'conflict' | 'rejected';
}>;
type Cursor = Readonly<{ deviceBatchId: string; batchSequence: number }>;
interface LocalStoreSurface {
  put(input: typeof act): Promise<void>;
  get(id: string): Promise<typeof act | undefined>;
  pending(): Promise<readonly (typeof act)[]>;
  applyReceipts(receipts: readonly Receipt[]): Promise<void>;
  receiptByIdempotency(key: string): Promise<Receipt | undefined>;
  cursor(): Promise<Cursor | undefined>;
  saveCursor(cursor: Cursor): Promise<void>;
}

async function localStore(
  port: EncryptedStoreFixture,
): Promise<LocalStoreSurface> {
  const runtime = await loadMobileRuntime('data/local/local-act.store');
  const Store = runtime['LocalActStore'] as new (
    encrypted: EncryptedStoreFixture,
  ) => LocalStoreSurface;
  return new Store(port);
}

it('dado MobileEncryptedStorePort exato quando LocalActStore reinicia então ato, fila, receipt e cursor sobrevivem sem adapter legado', async () => {
  const encrypted = new EncryptedStoreFixture();
  const first = await localStore(encrypted);
  await first.put(act);
  await first.saveCursor({ deviceBatchId: 'batch-001', batchSequence: 7 });
  await first.applyReceipts([
    {
      localEntityId: act.localEntityId,
      idempotencyKey: act.idempotencyKey,
      status: 'received',
    },
  ]);
  const restarted = await localStore(encrypted);
  await expect(restarted.get(act.localEntityId)).resolves.toEqual(act);
  await expect(restarted.pending()).resolves.toContainEqual(act);
  await expect(restarted.cursor()).resolves.toEqual({
    deviceBatchId: 'batch-001',
    batchSequence: 7,
  });
  await expect(
    restarted.receiptByIdempotency(act.idempotencyKey),
  ).resolves.toMatchObject({ status: 'received' });
  await restarted.applyReceipts([
    {
      localEntityId: act.localEntityId,
      idempotencyKey: act.idempotencyKey,
      status: 'applied',
    },
  ]);
  await expect(restarted.pending()).resolves.not.toContainEqual(act);
});

it('dado objeto key-value simples quando LocalActStore é criado então rejeita em vez de promovê-lo a cifrado', async () => {
  const runtime = await loadMobileRuntime('data/local/local-act.store');
  const Store = runtime['LocalActStore'] as new (store: unknown) => unknown;
  expect(() => new Store({ get: vi.fn(), set: vi.fn() })).toThrowError(
    /encrypted|port/i,
  );
});

it('dado cursor e receipts duráveis quando SyncWorker reinicia então reutiliza batch/sequence e recupera sem memória do processo', async () => {
  const runtime = await loadMobileRuntime('data/sync/sync.worker');
  const Worker = runtime['SyncWorker'] as new (
    store: LocalStoreSurface,
    client: {
      submitBatch(input: unknown): Promise<readonly Receipt[]>;
      receiptByIdempotency(
        tenant: string,
        key: string,
      ): Promise<Receipt | undefined>;
    },
    bootstrap: { snapshot(): unknown },
  ) => {
    submitNext(): Promise<readonly Receipt[]>;
    recoverReceipt(tenant: string, key: string): Promise<Receipt | undefined>;
  };
  const encrypted = new EncryptedStoreFixture();
  const store = await localStore(encrypted);
  await store.put(act);
  await store.saveCursor({ deviceBatchId: 'durable-batch', batchSequence: 11 });
  const receipt: Receipt = {
    localEntityId: act.localEntityId,
    idempotencyKey: act.idempotencyKey,
    status: 'received',
  };
  const submitBatch = vi.fn().mockResolvedValue([receipt]);
  const receiptByIdempotency = vi.fn().mockResolvedValue(receipt);
  const bootstrap = { snapshot: () => ({ protocolVersion: '1' }) };
  await new Worker(
    store,
    { submitBatch, receiptByIdempotency },
    bootstrap,
  ).submitNext();
  expect(submitBatch).toHaveBeenCalledWith(
    expect.objectContaining({
      device_batch_id: 'durable-batch',
      batch_sequence: 11,
    }),
  );
  const restarted = new Worker(
    await localStore(encrypted),
    { submitBatch, receiptByIdempotency },
    bootstrap,
  );
  await expect(
    restarted.recoverReceipt('tenant-001', act.idempotencyKey),
  ).resolves.toEqual(receipt);
  await expect(store.receiptByIdempotency(act.idempotencyKey)).resolves.toEqual(
    receipt,
  );
});

it('dado bootstrap ausente ou cursor ausente quando SyncWorker submete então falha fechado antes do HTTP', async () => {
  const runtime = await loadMobileRuntime('data/sync/sync.worker');
  const Worker = runtime['SyncWorker'] as new (
    store: LocalStoreSurface,
    client: {
      submitBatch: ReturnType<typeof vi.fn>;
      receiptByIdempotency: ReturnType<typeof vi.fn>;
    },
    bootstrap: { snapshot(): unknown },
  ) => { submitNext(): Promise<readonly Receipt[]> };
  const client = { submitBatch: vi.fn(), receiptByIdempotency: vi.fn() };
  const withoutBootstrap = await localStore(new EncryptedStoreFixture());
  await withoutBootstrap.put(act);
  await withoutBootstrap.saveCursor({
    deviceBatchId: 'batch-1',
    batchSequence: 1,
  });
  await expect(
    new Worker(withoutBootstrap, client, {
      snapshot: () => undefined,
    }).submitNext(),
  ).rejects.toBeDefined();
  const withoutCursor = await localStore(new EncryptedStoreFixture());
  await withoutCursor.put(act);
  await expect(
    new Worker(withoutCursor, client, { snapshot: () => ({}) }).submitNext(),
  ).rejects.toBeDefined();
  expect(client.submitBatch).not.toHaveBeenCalled();
});

interface NormativeSurface {
  install(id: string): Promise<{
    id: string;
    manifestHash: string;
    validUntil: string;
    content: unknown;
  }>;
  usable(now: string): Promise<unknown>;
  revalidate(now: string): Promise<'usable' | 'warning-expired' | 'blocked'>;
}
async function normativeService(
  encrypted: EncryptedStoreFixture,
  envelope: unknown,
  validation: unknown,
): Promise<NormativeSurface> {
  const runtime = await loadMobileRuntime(
    'data/normative/normative-package.service',
  );
  const Service = runtime['NormativePackageService'] as new (
    store: EncryptedStoreFixture,
    client: unknown,
    provisioning: unknown,
    bootstrap: unknown,
  ) => NormativeSurface;
  return new Service(
    encrypted,
    {
      packageContent: vi.fn().mockResolvedValue(envelope),
      validatePackage: vi.fn().mockResolvedValue(validation),
    },
    undefined,
    undefined,
  );
}

it('dados pacote válido, ausente, divergente e expirado quando instalado/revalidado então só integridade válida sobrevive ao reinício', async () => {
  const content = { normative_rules: ['RN-TEAT-139'] };
  const hash = createHash('sha256')
    .update(JSON.stringify(content))
    .digest('hex');
  const validUntil = '2999-01-01T00:00:00Z';
  const encrypted = new EncryptedStoreFixture();
  const valid = await normativeService(
    encrypted,
    { content, manifestHash: hash, validUntil },
    { manifestHash: hash, validUntil },
  );
  await expect(valid.install('pkg-valid')).resolves.toMatchObject({
    id: 'pkg-valid',
    manifestHash: hash,
  });
  await expect(valid.revalidate('2026-09-22T00:00:00Z')).resolves.toBe(
    'usable',
  );
  await expect(valid.revalidate(validUntil)).resolves.toBe('warning-expired');
  await expect(
    (await normativeService(encrypted, {}, {})).install('pkg-absent'),
  ).rejects.toBeDefined();
  const divergent = await normativeService(
    new EncryptedStoreFixture(),
    { content, manifestHash: 'wrong', validUntil },
    { manifestHash: 'wrong', validUntil },
  );
  await expect(divergent.install('pkg-wrong')).rejects.toBeDefined();
  encrypted.corrupt('teat-normative-package', 'active', {
    id: 'pkg-valid',
    manifestHash: hash,
    validUntil,
    content: { normative_rules: ['CORRUPTED'] },
  });
  const restarted = await normativeService(encrypted, {}, {});
  await expect(
    restarted.usable('2026-09-22T00:00:00Z'),
  ).resolves.toBeUndefined();
  await expect(restarted.revalidate('2026-09-22T00:00:00Z')).resolves.toBe(
    'blocked',
  );
});
