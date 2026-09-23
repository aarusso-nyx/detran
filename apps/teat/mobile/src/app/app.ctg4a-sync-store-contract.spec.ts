import { provideHttpClient, HttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { expect, it, vi } from 'vitest';
import { EncryptedStoreFixture } from '../testing/encrypted-store.fixture';
import { loadMobileRuntime } from '../testing/runtime-module';

type SyncItem = Readonly<{
  entity_type: 'ait';
  local_entity_id: string;
  idempotency_key: string;
  payload_hash: string;
  payload_json: Record<string, unknown>;
}>;
type SubmitSyncBatchDto = Readonly<{
  traffic_agency_id: string;
  device_id: string;
  agent_id: string;
  device_batch_id: string;
  batch_sequence?: number;
  items: readonly SyncItem[];
}>;
type SyncReceiptWire = Readonly<{
  local_entity_id: string;
  idempotency_key?: string;
  status: 'received' | 'applied' | 'conflict' | 'rejected';
  server_entity_id?: string;
}>;
type SyncBatchResponse = Readonly<{
  batchId: string;
  batch_sequence?: number | null;
  accepted_items: number;
  receipts: readonly SyncReceiptWire[];
  warnings?: readonly string[];
}>;

const queueItem: SyncItem = {
  entity_type: 'ait',
  local_entity_id: '00000000-0000-4000-8000-000000000001',
  idempotency_key: 'sync-idem-001',
  payload_hash: 'sha256:payload',
  payload_json: { draft: true },
};

function memoryIndexedDb(): {
  indexedDB: IDBFactory;
  stores: Map<string, Map<IDBValidKey, unknown>>;
} {
  const stores = new Map<string, Map<IDBValidKey, unknown>>();
  let writeTail = Promise.resolve();
  type MemoryTransaction = Record<string, unknown> & {
    enqueue<T>(request: IDBRequest<T>, operation: () => T): void;
  };
  const objectStore = (name: string, transaction?: MemoryTransaction) => {
    const values = stores.get(name) ?? new Map<IDBValidKey, unknown>();
    stores.set(name, values);
    const request = <T>(operation: () => T) => {
      const value = {
        result: undefined,
        error: null,
        onsuccess: null,
        onerror: null,
      } as unknown as IDBRequest<T>;
      if (transaction === undefined) {
        queueMicrotask(() => {
          Object.defineProperty(value, 'result', {
            configurable: true,
            value: operation(),
          });
          value.onsuccess?.(new Event('success'));
        });
      } else {
        transaction.enqueue(value, operation);
      }
      return value;
    };
    return {
      put: (value: unknown, key?: IDBValidKey) => {
        const record = value as { id?: IDBValidKey };
        const resolvedKey = key ?? record.id ?? '';
        return request(() => {
          values.set(resolvedKey, value);
          return resolvedKey;
        });
      },
      get: (key: IDBValidKey) => request(() => values.get(key)),
      getAll: () => request(() => [...values.values()]),
      delete: (key: IDBValidKey) => request(() => values.delete(key)),
      clear: () => request(() => values.clear()),
    } as unknown as IDBObjectStore;
  };
  const database = {
    objectStoreNames: { contains: (name: string) => stores.has(name) },
    createObjectStore: (name: string) => objectStore(name),
    transaction: (name: string, mode: IDBTransactionMode = 'readonly') => {
      const start = mode === 'readwrite' ? writeTail : Promise.resolve();
      let release: (() => void) | undefined;
      if (mode === 'readwrite') {
        writeTail = start.then(
          () =>
            new Promise<void>((resolve) => {
              release = resolve;
            }),
        );
      }
      let pending = 0;
      let completionTimer: ReturnType<typeof setTimeout> | undefined;
      const transaction: MemoryTransaction = {
        error: null,
        oncomplete: null,
        onerror: null,
        onabort: null,
        enqueue: <T>(request: IDBRequest<T>, operation: () => T) => {
          pending += 1;
          if (completionTimer !== undefined) clearTimeout(completionTimer);
          void start.then(() =>
            queueMicrotask(() => {
              Object.defineProperty(request, 'result', {
                configurable: true,
                value: operation(),
              });
              request.onsuccess?.(new Event('success'));
              pending -= 1;
              completionTimer = setTimeout(() => {
                if (pending !== 0) return;
                (transaction['oncomplete'] as (() => void) | null)?.();
                release?.();
              }, 0);
            }),
          );
        },
      };
      transaction['objectStore'] = () => objectStore(name, transaction);
      return transaction as unknown as IDBTransaction;
    },
  } as unknown as IDBDatabase;
  const indexedDB = {
    open: () => {
      const request = {
        result: database,
        error: null,
        onsuccess: null,
        onerror: null,
        onupgradeneeded: null,
      } as unknown as IDBOpenDBRequest;
      queueMicrotask(() => {
        request.onupgradeneeded?.(
          new Event('upgradeneeded') as IDBVersionChangeEvent,
        );
        request.onsuccess?.(new Event('success'));
      });
      return request;
    },
  } as unknown as IDBFactory;
  return { indexedDB, stores };
}

it('F002 SyncWorker envia o DTO OpenAPI exato, consome envelope 200 e avança cursor somente após persistir receipts', async () => {
  const runtime = await loadMobileRuntime('data/sync/sync.worker');
  const events: string[] = [];
  const store = {
    pending: vi.fn().mockResolvedValue([queueItem]),
    applyReceipts: vi.fn(async () => {
      events.push('receipts');
    }),
    receiptByIdempotency: vi.fn(),
    cursor: vi
      .fn()
      .mockResolvedValue({ deviceBatchId: 'batch-001', batchSequence: 9 }),
    saveCursor: vi.fn(async () => {
      events.push('cursor');
    }),
  };
  const response: SyncBatchResponse = {
    batchId: '00000000-0000-4000-8000-000000000009',
    batch_sequence: 9,
    accepted_items: 1,
    receipts: [
      {
        local_entity_id: queueItem.local_entity_id,
        idempotency_key: queueItem.idempotency_key,
        status: 'received',
      },
    ],
  };
  const client = {
    submitBatch: vi.fn(
      async (input: SubmitSyncBatchDto): Promise<SyncBatchResponse> => {
        expect(input).toEqual({
          traffic_agency_id: 'agency-001',
          device_id: 'device-001',
          agent_id: 'agent-001',
          device_batch_id: 'batch-001',
          batch_sequence: 9,
          items: [queueItem],
        });
        expect(input).not.toHaveProperty('bootstrap');
        return response;
      },
    ),
    receiptByIdempotency: vi.fn(),
  };
  const bootstrap = {
    snapshot: () => ({
      context: {
        trafficAgencyId: 'agency-001',
        device: { id: 'device-001' },
        agent: { id: 'agent-001' },
      },
    }),
  };
  const Worker = runtime['SyncWorker'] as new (...args: readonly unknown[]) => {
    submitNext(): Promise<readonly unknown[]>;
  };
  const receipts = await new Worker(store, client, bootstrap, {
    uuid: () => 'batch-002',
  }).submitNext();
  expect(receipts).toEqual([
    {
      localEntityId: queueItem.local_entity_id,
      idempotencyKey: queueItem.idempotency_key,
      status: 'received',
    },
  ]);
  expect(events).toEqual(['receipts', 'cursor']);
  expect(store.saveCursor).toHaveBeenCalledWith({
    deviceBatchId: 'batch-002',
    batchSequence: 10,
  });
});

it('F002 persiste o primeiro cursor antes do POST e reutiliza exatamente o mesmo cursor depois de falha', async () => {
  const runtime = await loadMobileRuntime('data/sync/sync.worker');
  const events: string[] = [];
  let persistedCursor:
    { deviceBatchId: string; batchSequence: number } | undefined;
  const store = {
    pending: vi.fn().mockResolvedValue([queueItem]),
    applyReceipts: vi.fn(),
    receiptByIdempotency: vi.fn(),
    cursor: vi.fn(async () => persistedCursor),
    saveCursor: vi.fn(async (cursor: typeof persistedCursor) => {
      events.push('cursor');
      persistedCursor = cursor;
    }),
  };
  const submitted: SubmitSyncBatchDto[] = [];
  const client = {
    submitBatch: vi.fn(async (input: SubmitSyncBatchDto) => {
      events.push('post');
      submitted.push(input);
      if (submitted.length === 1) throw new Error('network-down');
      return {
        batchId: 'server-batch',
        accepted_items: 1,
        receipts: [
          {
            local_entity_id: queueItem.local_entity_id,
            idempotency_key: queueItem.idempotency_key,
            status: 'received' as const,
          },
        ],
      };
    }),
    receiptByIdempotency: vi.fn(),
  };
  const Worker = runtime['SyncWorker'] as new (...args: readonly unknown[]) => {
    submitNext(): Promise<readonly unknown[]>;
  };
  const ids = { uuid: vi.fn(() => 'sync-batch-first') };
  const worker = new Worker(
    store,
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
  );

  await expect(worker.submitNext()).rejects.toThrow('network-down');
  expect(
    events.slice(0, 2),
    'cursor inicial precisa ser durável antes do primeiro POST',
  ).toEqual(['cursor', 'post']);
  expect(persistedCursor).toEqual({
    deviceBatchId: 'sync-batch-first',
    batchSequence: 1,
  });
  await expect(worker.submitNext()).resolves.toHaveLength(1);
  expect(submitted[0]).toMatchObject({
    device_batch_id: 'sync-batch-first',
    batch_sequence: 1,
  });
  expect(submitted[1]).toMatchObject({
    device_batch_id: 'sync-batch-first',
    batch_sequence: 1,
  });
  expect(ids.uuid).toHaveBeenCalledTimes(2); // inicial + avanço somente depois do 200 persistido
});

it('F002 OfflineSyncClient desserializa receipt snake_case e recovery só trata o 404 contratado como ausência', async () => {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting()],
  });
  const runtime = await loadMobileRuntime('data/sync/sync.worker');
  const clientRuntime = await loadMobileRuntime('data/api/offline-sync.client');
  const Client = clientRuntime['OfflineSyncClient'] as new (
    http: HttpClient,
  ) => {
    receiptByIdempotency(tenant: string, key: string): Promise<unknown>;
  };
  const Worker = runtime['SyncWorker'] as new (...args: readonly unknown[]) => {
    recoverReceipt(tenant: string, key: string): Promise<unknown>;
  };
  const applied: unknown[] = [];
  const store = {
    pending: vi.fn(),
    cursor: vi.fn(),
    saveCursor: vi.fn(),
    receiptByIdempotency: vi.fn(async () => ({
      localEntityId: 'forbidden-local-fallback',
    })),
    applyReceipts: vi.fn(async (receipts: readonly unknown[]) =>
      applied.push(...receipts),
    ),
  };
  const worker = new Worker(
    store,
    new Client(TestBed.inject(HttpClient)),
    { snapshot: vi.fn() },
    { uuid: vi.fn() },
  );
  const http = TestBed.inject(HttpTestingController);

  const recovered = worker.recoverReceipt('tenant-001', 'idem-001');
  http
    .expectOne(
      '/v1/ops/offline-sync/receipts/tenant-001/by-idempotency/idem-001',
    )
    .flush({
      local_entity_id: 'local-001',
      idempotency_key: 'idem-001',
      status: 'applied',
      server_entity_id: 'server-001',
      error_code: null,
      error_message: null,
    });
  await expect(recovered).resolves.toEqual({
    localEntityId: 'local-001',
    idempotencyKey: 'idem-001',
    status: 'applied',
    serverEntityId: 'server-001',
  });
  expect(applied).toEqual([
    {
      localEntityId: 'local-001',
      idempotencyKey: 'idem-001',
      status: 'applied',
      serverEntityId: 'server-001',
    },
  ]);

  const absent = worker.recoverReceipt('tenant-001', 'idem-absent');
  http
    .expectOne(
      '/v1/ops/offline-sync/receipts/tenant-001/by-idempotency/idem-absent',
    )
    .flush(
      { code: 'TEAT.SYNC_RECEIPT_NOT_FOUND' },
      { status: 404, statusText: 'Not Found' },
    );
  await expect(absent).resolves.toBeUndefined();
  expect(store.receiptByIdempotency).not.toHaveBeenCalled();

  const unrelated = worker.recoverReceipt('tenant-001', 'idem-other');
  http
    .expectOne(
      '/v1/ops/offline-sync/receipts/tenant-001/by-idempotency/idem-other',
    )
    .flush(
      { code: 'TEAT.OTHER_NOT_FOUND' },
      { status: 404, statusText: 'Not Found' },
    );
  await expect(unrelated).rejects.toMatchObject({ status: 404 });
  http.verify();
});

it('F008 LocalActStore persiste cada agregado em uma das oito coleções cifradas exatas', async () => {
  const runtime = await loadMobileRuntime('data/local/local-act.store');
  const Store = runtime['LocalActStore'] as new (
    port: EncryptedStoreFixture,
  ) => Record<string, unknown>;
  const encrypted = new EncryptedStoreFixture();
  const store = new Store(encrypted);
  const requiredMethods = [
    'putDraft',
    'draft',
    'putQueueItem',
    'pending',
    'putEvidence',
    'putReservation',
    'putPackage',
    'putPrintReceipt',
    'applyReceipts',
    'receiptByIdempotency',
    'cursor',
    'saveCursor',
  ] as const;
  for (const method of requiredMethods) {
    expect
      .soft(store[method], `LocalActStore.${method}`)
      .toBeTypeOf('function');
  }
  if (requiredMethods.some((method) => typeof store[method] !== 'function'))
    return;

  await (store['putDraft'] as (value: unknown) => Promise<void>)({
    id: 'draft-1',
  });
  await (store['putQueueItem'] as (value: unknown) => Promise<void>)(queueItem);
  await (store['putEvidence'] as (value: unknown) => Promise<void>)({
    id: 'evidence-1',
  });
  await (store['putReservation'] as (value: unknown) => Promise<void>)({
    id: 'reservation-1',
  });
  await (store['putPackage'] as (value: unknown) => Promise<void>)({
    id: 'package-1',
  });
  await (store['putPrintReceipt'] as (value: unknown) => Promise<void>)({
    id: 'print-1',
  });
  await (
    store['applyReceipts'] as (value: readonly unknown[]) => Promise<void>
  )([
    {
      localEntityId: queueItem.local_entity_id,
      idempotencyKey: queueItem.idempotency_key,
      status: 'received',
    },
  ]);
  await (store['saveCursor'] as (value: unknown) => Promise<void>)({
    deviceBatchId: 'batch-1',
    batchSequence: 1,
  });
  for (const collection of [
    'draft',
    'queue',
    'evidence',
    'reservation',
    'package',
    'print-receipt',
    'sync-receipt',
    'sync-cursor',
  ]) {
    expect(
      await encrypted.list(collection),
      `coleção cifrada ${collection}`,
    ).not.toHaveLength(0);
  }
});

it('F008 rejeita overwrite divergente da mesma identidade e mantém o registro anterior', async () => {
  const runtime = await loadMobileRuntime('data/local/local-act.store');
  const Store = runtime['LocalActStore'] as new (
    port: EncryptedStoreFixture,
  ) => {
    putDraft(value: unknown): Promise<void>;
    draft(id: string): Promise<unknown>;
  };
  const store = new Store(new EncryptedStoreFixture());
  const original = {
    localId: 'draft-conflict',
    entityType: 'ait',
    idempotencyKey: 'idem-001',
    localContentHash: 'sha256:one',
    status: 'draft',
    payload: { plate: 'AAA1A11' },
  };
  await store.putDraft(original);
  await expect(
    store.putDraft({
      ...original,
      idempotencyKey: 'idem-002',
      localContentHash: 'sha256:two',
    }),
  ).rejects.toThrow('local-store-identity-conflict');
  await expect(store.draft('draft-conflict')).resolves.toEqual(original);
});

it('F008 BrowserEncryptedStoreAdapter cifra oito coleções, sobrevive restart e rejeita colisão sem sobrescrever', async () => {
  const originalIndexedDb = globalThis.indexedDB;
  const fake = memoryIndexedDb();
  Object.defineProperty(globalThis, 'indexedDB', {
    configurable: true,
    value: fake.indexedDB,
  });
  try {
    const runtime = await loadMobileRuntime('data/local/local-act.store');
    const Adapter = runtime['BrowserEncryptedStoreAdapter'] as new () => {
      put<T>(collection: string, key: string, value: T): Promise<void>;
      get<T>(collection: string, key: string): Promise<T | undefined>;
    };
    const first = new Adapter();
    const secret = 'PLAINTEXT-MUST-NOT-APPEAR';
    for (const collection of [
      'draft',
      'queue',
      'evidence',
      'reservation',
      'package',
      'print-receipt',
      'sync-receipt',
      'sync-cursor',
    ]) {
      await first.put(collection, `${collection}-id`, {
        id: `${collection}-id`,
        secret,
      });
    }
    const records = [
      ...(fake.stores.get('encrypted-records')?.values() ?? []),
    ] as ReadonlyArray<{
      id: string;
      collection: string;
      ciphertext: ArrayBuffer;
      initializationVector: ArrayBuffer;
    }>;
    expect(records).toHaveLength(8);
    expect(
      records.every(
        (record) =>
          record.ciphertext.byteLength > 0 &&
          record.initializationVector.byteLength === 12,
      ),
    ).toBe(true);
    expect(
      records.some((record) =>
        new TextDecoder().decode(record.ciphertext).includes(secret),
      ),
    ).toBe(false);
    expect(JSON.stringify(records)).not.toContain(secret);

    const restarted = new Adapter();
    await expect(restarted.get('draft', 'draft-id')).resolves.toEqual({
      id: 'draft-id',
      secret,
    });
    const Store = runtime['LocalActStore'] as new (
      port: InstanceType<typeof Adapter>,
    ) => {
      putDraft(value: unknown): Promise<void>;
      draft(id: string): Promise<unknown>;
    };
    const store = new Store(restarted);
    const original = {
      localId: 'identity-1',
      entityType: 'ait',
      idempotencyKey: 'idem-1',
      localContentHash: 'hash-1',
      status: 'draft',
    };
    await store.putDraft(original);
    await expect(
      store.putDraft({
        ...original,
        idempotencyKey: 'idem-2',
        localContentHash: 'hash-2',
      }),
    ).rejects.toThrow('local-store-identity-conflict');
    await expect(store.draft('identity-1')).resolves.toEqual(original);
  } finally {
    Object.defineProperty(globalThis, 'indexedDB', {
      configurable: true,
      value: originalIndexedDb,
    });
  }
});

it('F008 payload divergente conflita mesmo com IDs, hash e idempotência iguais', async () => {
  const runtime = await loadMobileRuntime('data/local/local-act.store');
  const Store = runtime['LocalActStore'] as new (
    port: EncryptedStoreFixture,
  ) => {
    putDraft(value: unknown): Promise<void>;
    draft(id: string): Promise<unknown>;
    putQueueItem(value: unknown): Promise<void>;
  };
  const encrypted = new EncryptedStoreFixture();
  const store = new Store(encrypted);
  const draft = {
    localId: 'same-draft',
    entityType: 'ait',
    tenantId: 'tenant-001',
    idempotencyKey: 'same-idem',
    localContentHash: 'same-hash',
    status: 'draft',
    payload: { plate: 'AAA1A11' },
  };
  await store.putDraft(draft);
  const draftCollision = await store
    .putDraft({ ...draft, payload: { plate: 'BBB2B22' } })
    .then(
      () => ({ rejected: false as const }),
      (error: unknown) => ({ rejected: true as const, error }),
    );
  expect.soft(draftCollision).toMatchObject({
    rejected: true,
    error: expect.objectContaining({
      message: 'local-store-identity-conflict',
    }),
  });
  expect.soft(await store.draft('same-draft')).toEqual(draft);

  const queue = {
    queueItemId: 'same-queue',
    localEntityId: 'same-draft',
    entityType: 'ait',
    idempotencyKey: 'same-idem',
    payloadHash: 'same-hash',
    payloadJson: { plate: 'AAA1A11' },
  };
  await store.putQueueItem(queue);
  const queueCollision = await store
    .putQueueItem({ ...queue, payloadJson: { plate: 'BBB2B22' } })
    .then(
      () => ({ rejected: false as const }),
      (error: unknown) => ({ rejected: true as const, error }),
    );
  expect.soft(queueCollision).toMatchObject({
    rejected: true,
    error: expect.objectContaining({
      message: 'local-store-identity-conflict',
    }),
  });
  expect.soft(await encrypted.get('queue', 'same-queue')).toEqual(queue);
});

it('F008 duas escritas concorrentes da mesma identidade têm um único vencedor atômico', async () => {
  const originalIndexedDb = globalThis.indexedDB;
  const fake = memoryIndexedDb();
  Object.defineProperty(globalThis, 'indexedDB', {
    configurable: true,
    value: fake.indexedDB,
  });
  try {
    const runtime = await loadMobileRuntime('data/local/local-act.store');
    const Adapter = runtime[
      'BrowserEncryptedStoreAdapter'
    ] as new () => InstanceType<typeof EncryptedStoreFixture>;
    const Store = runtime['LocalActStore'] as new (
      port: InstanceType<typeof EncryptedStoreFixture>,
    ) => {
      putDraft(value: unknown): Promise<void>;
      draft(id: string): Promise<unknown>;
    };
    const initializer = new Adapter();
    await initializer.put('package', 'race-key-seed', { id: 'race-key-seed' });
    const storeA = new Store(new Adapter());
    const storeB = new Store(new Adapter());
    const identity = {
      localId: 'race-draft',
      entityType: 'ait',
      tenantId: 'tenant-001',
      idempotencyKey: 'race-idem',
      localContentHash: 'race-hash',
      status: 'draft',
    };
    const variants = [
      { ...identity, payload: { sequence: 1 } },
      { ...identity, payload: { sequence: 2 } },
    ] as const;
    const outcomes = await Promise.allSettled([
      storeA.putDraft(variants[0]),
      storeB.putDraft(variants[1]),
    ]);
    expect(
      outcomes.filter(({ status }) => status === 'fulfilled'),
    ).toHaveLength(1);
    expect(outcomes.filter(({ status }) => status === 'rejected')).toHaveLength(
      1,
    );
  } finally {
    Object.defineProperty(globalThis, 'indexedDB', {
      configurable: true,
      value: originalIndexedDb,
    });
  }
});

it('F008 atomicidade adapter-level cobre todos os put e receipts entre conexões independentes', async () => {
  const originalIndexedDb = globalThis.indexedDB;
  const fake = memoryIndexedDb();
  Object.defineProperty(globalThis, 'indexedDB', {
    configurable: true,
    value: fake.indexedDB,
  });
  try {
    const runtime = await loadMobileRuntime('data/local/local-act.store');
    const Adapter = runtime[
      'BrowserEncryptedStoreAdapter'
    ] as new () => InstanceType<typeof EncryptedStoreFixture>;
    type AtomicStore = {
      putDraft(value: unknown): Promise<void>;
      putQueueItem(value: unknown): Promise<void>;
      putEvidence(value: unknown): Promise<void>;
      putReservation(value: unknown): Promise<void>;
      putPackage(value: unknown): Promise<void>;
      putPrintReceipt(value: unknown): Promise<void>;
      applyReceipts(value: readonly unknown[]): Promise<void>;
    };
    const Store = runtime['LocalActStore'] as new (
      port: InstanceType<typeof EncryptedStoreFixture>,
    ) => AtomicStore;
    const initializer = new Adapter();
    await initializer.put('package', 'atomic-key-seed', {
      id: 'atomic-key-seed',
    });
    const left = new Store(new Adapter());
    const right = new Store(new Adapter());
    const cases: ReadonlyArray<{
      label: string;
      run(
        store: AtomicStore,
        value: Readonly<Record<string, unknown>>,
      ): Promise<void>;
      first: Readonly<Record<string, unknown>>;
      second: Readonly<Record<string, unknown>>;
    }> = [
      {
        label: 'draft',
        run: (store, value) => store.putDraft(value),
        first: {
          localId: 'atomic-draft',
          entityType: 'ait',
          idempotencyKey: 'atomic-idem',
          localContentHash: 'same-hash',
          status: 'draft',
          payload: { v: 1 },
        },
        second: {
          localId: 'atomic-draft',
          entityType: 'ait',
          idempotencyKey: 'atomic-idem',
          localContentHash: 'same-hash',
          status: 'draft',
          payload: { v: 2 },
        },
      },
      {
        label: 'queue',
        run: (store, value) => store.putQueueItem(value),
        first: {
          queueItemId: 'atomic-queue',
          localEntityId: 'atomic-draft',
          idempotencyKey: 'atomic-idem',
          payloadHash: 'same-hash',
          payloadJson: { v: 1 },
        },
        second: {
          queueItemId: 'atomic-queue',
          localEntityId: 'atomic-draft',
          idempotencyKey: 'atomic-idem',
          payloadHash: 'same-hash',
          payloadJson: { v: 2 },
        },
      },
      {
        label: 'evidence',
        run: (store, value) => store.putEvidence(value),
        first: {
          localEvidenceId: 'atomic-evidence',
          contentHash: 'hash-1',
          status: 'captured',
        },
        second: {
          localEvidenceId: 'atomic-evidence',
          contentHash: 'hash-2',
          status: 'captured',
        },
      },
      {
        label: 'reservation',
        run: (store, value) => store.putReservation(value),
        first: {
          reservationId: 'atomic-reservation',
          status: 'available',
          version: 1,
        },
        second: {
          reservationId: 'atomic-reservation',
          status: 'consumed',
          version: 1,
        },
      },
      {
        label: 'package',
        run: (store, value) => store.putPackage(value),
        first: {
          id: 'atomic-package',
          version: '1',
          manifestHash: 'hash-1',
          status: 'installed',
        },
        second: {
          id: 'atomic-package',
          version: '1',
          manifestHash: 'hash-2',
          status: 'installed',
        },
      },
      {
        label: 'print receipt',
        run: (store, value) => store.putPrintReceipt(value),
        first: {
          receiptId: 'atomic-print',
          status: 'printed',
          contentHash: 'hash-1',
        },
        second: {
          receiptId: 'atomic-print',
          status: 'printed',
          contentHash: 'hash-2',
        },
      },
      {
        label: 'sync receipt',
        run: (store, value) => store.applyReceipts([value]),
        first: {
          localEntityId: 'atomic-draft',
          idempotencyKey: 'atomic-receipt',
          status: 'received',
          serverEntityId: 'server-1',
        },
        second: {
          localEntityId: 'atomic-draft',
          idempotencyKey: 'atomic-receipt',
          status: 'conflict',
          serverEntityId: 'server-1',
        },
      },
    ];
    for (const candidate of cases) {
      const outcomes = await Promise.allSettled([
        candidate.run(left, candidate.first),
        candidate.run(right, candidate.second),
      ]);
      expect
        .soft(
          outcomes.filter(({ status }) => status === 'fulfilled'),
          `${candidate.label}: somente um commit`,
        )
        .toHaveLength(1);
      expect
        .soft(
          outcomes.filter(({ status }) => status === 'rejected'),
          `${candidate.label}: colisão rejeitada`,
        )
        .toHaveLength(1);
    }
  } finally {
    Object.defineProperty(globalThis, 'indexedDB', {
      configurable: true,
      value: originalIndexedDb,
    });
  }
});
