import { createHash } from 'node:crypto';
import { expect, it, vi } from 'vitest';
import { EncryptedStoreFixture } from '../testing/encrypted-store.fixture';
import { loadMobileRuntime } from '../testing/runtime-module';

const actDraft = {
  localId: 'local-001',
  entityType: 'administrative-measure',
  tenantId: 'tenant-001',
  orgUnitId: 'agency-001',
  agentId: 'agent-001',
  deviceId: 'device-001',
  shiftId: 'shift-001',
  status: 'draft',
  reservedNumber: 101,
  reservationId: 'reservation-001',
  idempotencyKey: 'idem-001',
  normativePackageId: 'pkg-001',
  normativePackageVersion: '2026.09',
  localContentHash: 'sha256:act',
  payload: { draft: true },
  location: {
    latitude: -15,
    longitude: -47,
    accuracyMeters: 3,
    capturedAt: '2026-09-22T00:00:00Z',
    source: 'gps',
  },
  evidence: [],
  createdAt: '2026-09-22T00:00:00Z',
  updatedAt: '2026-09-22T00:00:00Z',
} as const;
const actQueue = {
  queueItemId: 'local-001:v1',
  entityType: 'administrative-measure',
  localEntityId: 'local-001',
  status: 'pending',
  attempts: 0,
  idempotencyKey: 'idem-001',
  payloadHash: 'sha256:act',
  payloadJson: { draft: true },
  deviceId: 'device-001',
  agentId: 'agent-001',
  tenantId: 'tenant-001',
  orgUnitId: 'agency-001',
  normativePackageId: 'pkg-001',
  reservedNumber: 101,
  location: actDraft.location,
  createdLocallyAt: '2026-09-22T00:00:00Z',
} as const;
type Receipt = Readonly<{
  localEntityId: string;
  idempotencyKey: string;
  status: 'received' | 'applied' | 'conflict' | 'rejected';
}>;
type Cursor = Readonly<{ deviceBatchId: string; batchSequence: number }>;
interface LocalStoreSurface {
  putDraft(input: typeof actDraft): Promise<void>;
  draft(id: string): Promise<typeof actDraft | undefined>;
  putQueueItem(input: typeof actQueue): Promise<void>;
  pending(): Promise<readonly (typeof actQueue)[]>;
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
  await first.putDraft(actDraft);
  await first.putQueueItem(actQueue);
  await first.saveCursor({ deviceBatchId: 'batch-001', batchSequence: 7 });
  const restarted = await localStore(encrypted);
  await expect(restarted.draft(actDraft.localId)).resolves.toEqual(actDraft);
  await expect(restarted.pending()).resolves.toContainEqual(actQueue);
  await expect(restarted.cursor()).resolves.toEqual({
    deviceBatchId: 'batch-001',
    batchSequence: 7,
  });
  await restarted.applyReceipts([
    {
      localEntityId: actQueue.localEntityId,
      idempotencyKey: actQueue.idempotencyKey,
      status: 'applied',
    },
  ]);
  await expect(
    restarted.receiptByIdempotency(actQueue.idempotencyKey),
  ).resolves.toMatchObject({
    status: 'applied',
  });
  await expect(restarted.pending()).resolves.not.toContainEqual(actQueue);
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
      submitBatch(input: unknown): Promise<unknown>;
      receiptByIdempotency(
        tenant: string,
        key: string,
      ): Promise<Receipt | undefined>;
    },
    bootstrap: { snapshot(): unknown },
    ids: { uuid(prefix: string): string },
  ) => {
    submitNext(): Promise<readonly Receipt[]>;
    recoverReceipt(tenant: string, key: string): Promise<Receipt | undefined>;
  };
  const encrypted = new EncryptedStoreFixture();
  const store = await localStore(encrypted);
  await store.putQueueItem(actQueue);
  await store.saveCursor({ deviceBatchId: 'durable-batch', batchSequence: 11 });
  const receipt: Receipt = {
    localEntityId: actQueue.localEntityId,
    idempotencyKey: actQueue.idempotencyKey,
    status: 'received',
  };
  const submitBatch = vi.fn().mockResolvedValue({
    batchId: 'server-batch-001',
    accepted_items: 1,
    receipts: [
      {
        local_entity_id: receipt.localEntityId,
        idempotency_key: receipt.idempotencyKey,
        status: receipt.status,
      },
    ],
  });
  const receiptByIdempotency = vi.fn().mockResolvedValue(receipt);
  const bootstrap = {
    snapshot: () => ({
      context: {
        trafficAgencyId: 'agency-001',
        device: { id: 'device-001' },
        agent: { id: 'agent-001' },
      },
    }),
  };
  const ids = { uuid: vi.fn().mockReturnValue('next-batch') };
  await new Worker(
    store,
    { submitBatch, receiptByIdempotency },
    bootstrap,
    ids,
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
    ids,
  );
  await expect(
    restarted.recoverReceipt('tenant-001', actQueue.idempotencyKey),
  ).resolves.toEqual(receipt);
  await expect(
    store.receiptByIdempotency(actQueue.idempotencyKey),
  ).resolves.toEqual(receipt);
});

it('dado bootstrap ausente ou cursor ausente quando SyncWorker submete então bloqueia sem bootstrap e cria cursor durável quando autorizado', async () => {
  const runtime = await loadMobileRuntime('data/sync/sync.worker');
  const Worker = runtime['SyncWorker'] as new (
    store: LocalStoreSurface,
    client: {
      submitBatch: ReturnType<typeof vi.fn>;
      receiptByIdempotency: ReturnType<typeof vi.fn>;
    },
    bootstrap: { snapshot(): unknown },
    ids: { uuid(prefix: string): string },
  ) => { submitNext(): Promise<readonly Receipt[]> };
  const client = {
    submitBatch: vi.fn().mockResolvedValue({
      batchId: 'server-batch-002',
      accepted_items: 1,
      receipts: [],
    }),
    receiptByIdempotency: vi.fn(),
  };
  const ids = { uuid: vi.fn().mockReturnValue('generated-batch-001') };
  const withoutBootstrap = await localStore(new EncryptedStoreFixture());
  await withoutBootstrap.putQueueItem(actQueue);
  await withoutBootstrap.saveCursor({
    deviceBatchId: 'batch-1',
    batchSequence: 1,
  });
  await expect(
    new Worker(
      withoutBootstrap,
      client,
      {
        snapshot: () => undefined,
      },
      ids,
    ).submitNext(),
  ).rejects.toBeDefined();
  const withoutCursor = await localStore(new EncryptedStoreFixture());
  await withoutCursor.putQueueItem(actQueue);
  expect(client.submitBatch).not.toHaveBeenCalled();
  await expect(
    new Worker(
      withoutCursor,
      client,
      {
        snapshot: () => ({
          context: {
            trafficAgencyId: 'agency-001',
            device: { id: 'device-001' },
            agent: { id: 'agent-001' },
          },
        }),
      },
      ids,
    ).submitNext(),
  ).resolves.toEqual([]);
  expect(client.submitBatch).toHaveBeenCalledWith(
    expect.objectContaining({
      device_batch_id: 'generated-batch-001',
      batch_sequence: 1,
    }),
  );
  await expect(withoutCursor.cursor()).resolves.toEqual({
    deviceBatchId: 'generated-batch-001',
    batchSequence: 2,
  });
});

interface NormativeSurface {
  install(
    id: string,
    input: {
      packageVersion: string;
      headers: { 'Idempotency-Key': string };
    },
  ): Promise<{
    id: string;
    manifestHash: string;
    validUntil: string;
    manifest: unknown;
  }>;
  usable(now: string): Promise<unknown>;
  revalidate(now: string): Promise<'usable' | 'warning-expired' | 'blocked'>;
}
async function normativeService(
  encrypted: EncryptedStoreFixture,
  envelope: unknown,
  validation: unknown,
  authority: {
    id: string;
    version: string;
    manifestHash: string;
    validUntil: string;
  },
): Promise<NormativeSurface> {
  const runtime = await loadMobileRuntime(
    'data/normative/normative-package.service',
  );
  const Service = runtime['NormativePackageService'] as new (
    store: EncryptedStoreFixture,
    client: unknown,
    bootstrap: unknown,
  ) => NormativeSurface;
  return new Service(
    encrypted,
    {
      packageContent: vi.fn().mockResolvedValue(envelope),
      validatePackage: vi.fn().mockResolvedValue(validation),
    },
    { snapshot: () => ({ normativePackage: authority }) },
  );
}

it('dados pacote válido, ausente, divergente e expirado quando instalado/revalidado então só integridade válida sobrevive ao reinício', async () => {
  const validUntil = '2999-01-01T00:00:00Z';
  const manifest = {
    package_version: '2026.09',
    valid_until: validUntil,
    normative_rules: ['RN-TEAT-139'],
  };
  const hash = createHash('sha256')
    .update(JSON.stringify(manifest))
    .digest('hex');
  const authority = {
    id: 'pkg-valid',
    version: '2026.09',
    manifestHash: hash,
    validUntil,
  };
  const input = {
    packageVersion: '2026.09',
    headers: { 'Idempotency-Key': 'pkg-install-001' },
  };
  const encrypted = new EncryptedStoreFixture();
  const valid = await normativeService(
    encrypted,
    { manifest, manifest_hash: hash, signature: 'signed-manifest' },
    { valid: true, reason: 'VALIDADO_PKG' },
    authority,
  );
  await expect(valid.install('pkg-valid', input)).resolves.toMatchObject({
    id: 'pkg-valid',
    manifestHash: hash,
  });
  await expect(valid.revalidate('2026-09-22T00:00:00Z')).resolves.toBe(
    'usable',
  );
  await expect(valid.revalidate(validUntil)).resolves.toBe('warning-expired');
  await expect(
    (await normativeService(encrypted, {}, {}, authority)).install(
      'pkg-valid',
      input,
    ),
  ).rejects.toBeDefined();
  const divergent = await normativeService(
    new EncryptedStoreFixture(),
    { manifest, manifest_hash: 'wrong', signature: 'signed-manifest' },
    { valid: true, reason: 'VALIDADO_PKG' },
    authority,
  );
  await expect(divergent.install('pkg-valid', input)).rejects.toBeDefined();
  encrypted.corrupt('package', 'active', {
    id: 'pkg-valid',
    version: '2026.09',
    manifestHash: hash,
    validUntil,
    manifest: { ...manifest, normative_rules: ['CORRUPTED'] },
    signature: {
      value: 'signed-manifest',
      signer: 'source_pending',
      kind: 'local-unsigned',
    },
  });
  const restarted = await normativeService(encrypted, {}, {}, authority);
  await expect(
    restarted.usable('2026-09-22T00:00:00Z'),
  ).resolves.toBeUndefined();
  await expect(restarted.revalidate('2026-09-22T00:00:00Z')).resolves.toBe(
    'blocked',
  );
});
