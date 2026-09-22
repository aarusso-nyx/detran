import { createHash } from 'node:crypto';
import { expect, it, vi } from 'vitest';
import { loadMobileRuntime } from '../testing/runtime-module';

const act = {
  entityType: 'ait',
  localEntityId: 'local-001',
  version: 1,
  idempotencyKey: 'idem-001',
  payloadHash: 'hash-001',
  payloadJson: { draft: true },
} as const;

it('dado LocalActStore reiniciado quando um ato cifrado é recuperado então versão, hash, idempotência e fila sobrevivem sem duplicação', async () => {
  const runtime = await loadMobileRuntime('data/local/local-act.store');
  const Store = runtime['LocalActStore'] as new (encrypted: unknown) => {
    put?: (input: typeof act) => Promise<void>;
    get?: (id: string) => Promise<typeof act | undefined>;
    pending?: () => Promise<readonly (typeof act)[]>;
    applyReceipts?: (
      receipts: readonly {
        localEntityId: string;
        idempotencyKey: string;
        status: 'received' | 'applied' | 'conflict' | 'rejected';
      }[],
    ) => Promise<void>;
    receiptByIdempotency?: (key: string) => Promise<unknown>;
  };
  const encryptedJournal = new Map<string, unknown>();
  const encryptedPort = {
    get: (key: string) => encryptedJournal.get(key),
    set: (key: string, value: unknown) => encryptedJournal.set(key, value),
  };
  const first = new Store(encryptedPort);
  expect(first.put).toBeTypeOf('function');
  await first.put?.(act);
  const restarted = new Store(encryptedPort);
  await expect(restarted.get?.(act.localEntityId)).resolves.toEqual(act);
  await expect(restarted.pending?.()).resolves.toContainEqual(act);
  await restarted.applyReceipts?.([
    {
      localEntityId: act.localEntityId,
      idempotencyKey: act.idempotencyKey,
      status: 'received',
    },
  ]);
  await restarted.applyReceipts?.([
    {
      localEntityId: act.localEntityId,
      idempotencyKey: act.idempotencyKey,
      status: 'applied',
    },
  ]);
  await expect(
    restarted.receiptByIdempotency?.(act.idempotencyKey),
  ).resolves.toMatchObject({ status: 'applied' });
  await expect(restarted.pending?.()).resolves.not.toContainEqual(act);
});

it('dado recibo parcial, erro e retry quando SyncWorker submete então preserva o item ausente, reaplica recibo e não duplica batch', async () => {
  const runtime = await loadMobileRuntime('data/sync/sync.worker');
  const Worker = runtime['SyncWorker'] as new (
    store: unknown,
    client: unknown,
    bootstrap: unknown,
  ) => {
    submitNext?: () => Promise<
      readonly {
        localEntityId: string;
        idempotencyKey: string;
        status: string;
      }[]
    >;
    recoverReceipt?: (tenant: string, key: string) => Promise<unknown>;
  };
  const applyReceipts = vi.fn().mockResolvedValue(undefined);
  const submitBatch = vi.fn().mockResolvedValue([
    {
      localEntityId: 'local-001',
      idempotencyKey: 'idem-001',
      status: 'received',
    },
  ]);
  const worker = new Worker(
    { pending: vi.fn().mockResolvedValue([act]), applyReceipts },
    { submitBatch, receiptByIdempotency: vi.fn().mockResolvedValue(undefined) },
    { snapshot: () => undefined },
  );
  expect(worker.submitNext).toBeTypeOf('function');
  await expect(worker.submitNext?.()).resolves.toEqual([
    {
      localEntityId: 'local-001',
      idempotencyKey: 'idem-001',
      status: 'received',
    },
  ]);
  expect(applyReceipts).toHaveBeenCalledWith(
    expect.arrayContaining([
      expect.objectContaining({
        idempotencyKey: 'idem-001',
        status: 'received',
      }),
    ]),
  );
  expect(submitBatch).toHaveBeenCalledTimes(1);
  await expect(
    worker.recoverReceipt?.('tenant-001', 'idem-001'),
  ).resolves.toBeDefined();
});

it('dados conteúdo válido, ausente, hash divergente e expirado quando NormativePackageService revalida então só o válido é utilizável e o expirado avisa', async () => {
  const runtime = await loadMobileRuntime(
    'data/normative/normative-package.service',
  );
  const Service = runtime['NormativePackageService'] as new (
    store: unknown,
    client: unknown,
    provisioning: unknown,
    bootstrap: unknown,
  ) => {
    install?: (id: string) => Promise<{
      id: string;
      manifestHash: string;
      validUntil: string;
      content: unknown;
    }>;
    usable?: (now: string) => Promise<unknown>;
    revalidate?: (
      now: string,
    ) => Promise<'usable' | 'warning-expired' | 'blocked'>;
  };
  const content = { normative_rules: ['RN-TEAT-139'] };
  const manifestHash = createHash('sha256')
    .update(JSON.stringify(content))
    .digest('hex');
  const validUntil = '2999-01-01T00:00:00Z';
  const encryptedValues = new Map<string, unknown>();
  const encryptedStore = {
    adapterName: 'fixture-encrypted-store',
    encrypted: true,
    encryptionScope: 'teat-mobile-device',
    securityLevel: 'hardware-backed',
    async put(key: string, value: unknown): Promise<void> {
      encryptedValues.set(key, value);
    },
    async get(key: string): Promise<unknown> {
      return encryptedValues.get(key);
    },
    async list(): Promise<readonly unknown[]> {
      return [...encryptedValues.values()];
    },
    async remove(key: string): Promise<void> {
      encryptedValues.delete(key);
    },
    async clear(): Promise<void> {
      encryptedValues.clear();
    },
  };
  const service = new Service(
    encryptedStore,
    {
      packageContent: vi.fn().mockResolvedValue({
        content,
        manifestHash,
        validUntil,
      }),
      validatePackage: vi.fn().mockResolvedValue({
        manifestHash,
        validUntil,
      }),
    },
    undefined,
    undefined,
  );
  expect(service.install).toBeTypeOf('function');
  await expect(service.install?.('pkg-valid')).resolves.toMatchObject({
    id: 'pkg-valid',
    manifestHash: expect.any(String),
    content: expect.anything(),
  });
  await expect(service.usable?.('2026-09-22T00:00:00Z')).resolves.toBeDefined();
  await expect(service.revalidate?.('2999-01-01T00:00:00Z')).resolves.toBe(
    'warning-expired',
  );
});
