import { Inject, Injectable, InjectionToken } from '@angular/core';
import type {
  MobileEncryptedStorePort,
  MobileEntityDraft,
  MobileEvidenceDraft,
  MobileNumberingReservation,
  MobilePrintReceipt,
  MobileSyncQueueItem,
} from '@stynx-nyx/mobile-runtime';

export type LocalEntityType =
  | 'ait'
  | 'administrative-measure'
  | 'alcohol-signs-term'
  | 'ait-cancel-request'
  | 'ait-cancel-posfinal-request'
  | 'crash-record';

export interface QueueReceipt {
  readonly localEntityId: string;
  readonly idempotencyKey: string;
  readonly status: 'received' | 'applied' | 'conflict' | 'rejected';
  readonly serverEntityId?: string;
  readonly errorCode?: string;
  readonly errorMessage?: string;
}

export interface SyncCursor {
  readonly deviceBatchId: string;
  readonly batchSequence: number;
}

export interface InstalledPackageRecord {
  readonly id: string;
}

const COLLECTIONS = {
  draft: 'draft',
  queue: 'queue',
  evidence: 'evidence',
  reservation: 'reservation',
  package: 'package',
  printReceipt: 'print-receipt',
  syncReceipt: 'sync-receipt',
  syncCursor: 'sync-cursor',
} as const;

interface EncryptedRecord {
  readonly id: string;
  readonly collection: string;
  readonly canonicalDigest: string;
  readonly initializationVector: ArrayBuffer;
  readonly ciphertext: ArrayBuffer;
}

const DATABASE_NAME = 'detran-teat-mobile';
const DATABASE_VERSION = 1;
const RECORDS = 'encrypted-records';
const METADATA = 'cryptographic-metadata';
const DEVICE_KEY = 'device-sealing-key';

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error('indexeddb-request-failed'));
  });
}

function transactionComplete(transaction: IDBTransaction): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(transaction.error ?? new Error('indexeddb-transaction-failed'));
    transaction.onabort = () =>
      reject(transaction.error ?? new Error('indexeddb-transaction-aborted'));
  });
}

export class BrowserEncryptedStoreAdapter implements MobileEncryptedStorePort {
  readonly adapterName = 'teat-indexeddb-webcrypto';
  readonly encrypted = true;
  readonly encryptionScope = 'device' as const;
  readonly securityLevel = 'software-sealed' as const;
  private databasePromise?: Promise<IDBDatabase>;
  private keyPromise?: Promise<CryptoKey>;

  async put<T>(collection: string, key: string, value: T): Promise<void> {
    const [database, record] = await Promise.all([
      this.database(),
      this.seal(collection, key, value),
    ]);
    const transaction = database.transaction(RECORDS, 'readwrite');
    transaction.objectStore(RECORDS).put(record);
    await transactionComplete(transaction);
  }

  async putIfAbsentOrEquivalent<T>(
    collection: string,
    key: string,
    value: T,
  ): Promise<void> {
    const [database, record] = await Promise.all([
      this.database(),
      this.seal(collection, key, value),
    ]);
    const transaction = database.transaction(RECORDS, 'readwrite');
    const completion = transactionComplete(transaction);
    const objectStore = transaction.objectStore(RECORDS);
    let conflict = false;
    await new Promise<void>((resolve, reject) => {
      const request = objectStore.get(record.id) as IDBRequest<
        EncryptedRecord | undefined
      >;
      request.onsuccess = () => {
        const existing = request.result;
        if (existing === undefined) {
          objectStore.put(record);
        } else if (existing.canonicalDigest !== record.canonicalDigest) {
          conflict = true;
        }
        resolve();
      };
      request.onerror = () =>
        reject(request.error ?? new Error('indexeddb-request-failed'));
    });
    await completion;
    if (conflict) throw new Error('local-store-identity-conflict');
  }

  async replaceIfEquivalent<T>(
    collection: string,
    key: string,
    expected: T,
    replacement: T,
  ): Promise<void> {
    const [database, expectedRecord, replacementRecord] = await Promise.all([
      this.database(),
      this.seal(collection, key, expected),
      this.seal(collection, key, replacement),
    ]);
    const transaction = database.transaction(RECORDS, 'readwrite');
    const completion = transactionComplete(transaction);
    const objectStore = transaction.objectStore(RECORDS);
    let conflict = false;
    await new Promise<void>((resolve, reject) => {
      const request = objectStore.get(replacementRecord.id) as IDBRequest<
        EncryptedRecord | undefined
      >;
      request.onsuccess = () => {
        const existing = request.result;
        if (existing?.canonicalDigest === expectedRecord.canonicalDigest) {
          objectStore.put(replacementRecord);
        } else if (
          existing?.canonicalDigest !== replacementRecord.canonicalDigest
        ) {
          conflict = true;
        }
        resolve();
      };
      request.onerror = () =>
        reject(request.error ?? new Error('indexeddb-request-failed'));
    });
    await completion;
    if (conflict) throw new Error('local-store-identity-conflict');
  }

  async get<T>(collection: string, key: string): Promise<T | undefined> {
    const database = await this.database();
    const transaction = database.transaction(RECORDS, 'readonly');
    const record = (await requestResult(
      transaction.objectStore(RECORDS).get(`${collection}:${key}`),
    )) as EncryptedRecord | undefined;
    if (record === undefined) return undefined;
    return this.decrypt<T>(record);
  }

  async list<T>(collection: string): Promise<T[]> {
    const database = await this.database();
    const transaction = database.transaction(RECORDS, 'readonly');
    const records = (await requestResult(
      transaction.objectStore(RECORDS).getAll(),
    )) as EncryptedRecord[];
    return Promise.all(
      records
        .filter((record) => record.collection === collection)
        .map((record) => this.decrypt<T>(record)),
    );
  }

  async remove(collection: string, key: string): Promise<void> {
    const database = await this.database();
    const transaction = database.transaction(RECORDS, 'readwrite');
    transaction.objectStore(RECORDS).delete(`${collection}:${key}`);
    await transactionComplete(transaction);
  }

  async clear(): Promise<void> {
    const database = await this.database();
    const transaction = database.transaction(RECORDS, 'readwrite');
    transaction.objectStore(RECORDS).clear();
    await transactionComplete(transaction);
  }

  private database(): Promise<IDBDatabase> {
    this.databasePromise ??= new Promise<IDBDatabase>((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        reject(new Error('indexeddb-unavailable'));
        return;
      }
      const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(RECORDS))
          database.createObjectStore(RECORDS, { keyPath: 'id' });
        if (!database.objectStoreNames.contains(METADATA))
          database.createObjectStore(METADATA);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () =>
        reject(request.error ?? new Error('indexeddb-open-failed'));
    });
    return this.databasePromise;
  }

  private sealingKey(): Promise<CryptoKey> {
    this.keyPromise ??= this.loadOrCreateSealingKey();
    return this.keyPromise;
  }

  private async loadOrCreateSealingKey(): Promise<CryptoKey> {
    const database = await this.database();
    const read = database.transaction(METADATA, 'readonly');
    const existing = (await requestResult(
      read.objectStore(METADATA).get(DEVICE_KEY),
    )) as CryptoKey | undefined;
    if (existing !== undefined) return existing;
    const key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt'],
    );
    const write = database.transaction(METADATA, 'readwrite');
    write.objectStore(METADATA).put(key, DEVICE_KEY);
    await transactionComplete(write);
    return key;
  }

  private async decrypt<T>(record: EncryptedRecord): Promise<T> {
    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(record.initializationVector) },
      await this.sealingKey(),
      record.ciphertext,
    );
    return JSON.parse(new TextDecoder().decode(plaintext)) as T;
  }

  private async seal<T>(
    collection: string,
    key: string,
    value: T,
  ): Promise<EncryptedRecord> {
    const initializationVector = crypto.getRandomValues(new Uint8Array(12));
    const canonical = JSON.stringify(canonicalValue(value));
    const [ciphertext, digest] = await Promise.all([
      crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: initializationVector },
        await this.sealingKey(),
        new TextEncoder().encode(JSON.stringify(value)),
      ),
      crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical)),
    ]);
    return {
      id: `${collection}:${key}`,
      collection,
      canonicalDigest: [...new Uint8Array(digest)]
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join(''),
      initializationVector: initializationVector.buffer as ArrayBuffer,
      ciphertext,
    };
  }
}

export const TEAT_MOBILE_ENCRYPTED_STORE =
  new InjectionToken<MobileEncryptedStorePort>('TEAT_MOBILE_ENCRYPTED_STORE', {
    providedIn: 'root',
    factory: () => new BrowserEncryptedStoreAdapter(),
  });

function recordKey(value: object, fields: readonly string[]): string {
  const record = value as Readonly<Record<string, unknown>>;
  const key = fields
    .map((field) => record[field])
    .find((entry) => typeof entry === 'string');
  if (typeof key !== 'string' || key === '') {
    throw new Error('local-store-key-required');
  }
  return key;
}

function canonicalValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (typeof value !== 'object' || value === null) return value;
  return Object.fromEntries(
    Object.entries(value as Readonly<Record<string, unknown>>)
      .filter(([, entry]) => entry !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => [key, canonicalValue(entry)]),
  );
}

function canonicallyEqual(left: unknown, right: unknown): boolean {
  return (
    JSON.stringify(canonicalValue(left)) ===
    JSON.stringify(canonicalValue(right))
  );
}

@Injectable({ providedIn: 'root' })
export class LocalActStore {
  private mutationTail: Promise<void> = Promise.resolve();
  // Explicit constructor injection preserves direct construction against the STYNX port.
  constructor(
    // eslint-disable-next-line @angular-eslint/prefer-inject
    @Inject(TEAT_MOBILE_ENCRYPTED_STORE)
    private readonly store: MobileEncryptedStorePort,
  ) {
    if (
      store.encrypted !== true ||
      !['device', 'session'].includes(store.encryptionScope)
    ) {
      throw new Error('mobile-encrypted-store-port-required');
    }
  }

  async putDraft(draft: MobileEntityDraft<LocalEntityType>): Promise<void> {
    await this.putOnce(
      COLLECTIONS.draft,
      recordKey(draft, ['localId', 'id']),
      draft,
    );
  }

  draft(
    localEntityId: string,
  ): Promise<MobileEntityDraft<LocalEntityType> | undefined> {
    return this.store.get(COLLECTIONS.draft, localEntityId);
  }

  transitionDraft(
    expected: MobileEntityDraft<LocalEntityType>,
    replacement: MobileEntityDraft<LocalEntityType>,
  ): Promise<void> {
    const key = recordKey(expected, ['localId', 'id']);
    if (recordKey(replacement, ['localId', 'id']) !== key) {
      return Promise.reject(new Error('local-store-identity-conflict'));
    }
    const atomic = this.store as MobileEncryptedStorePort & {
      replaceIfEquivalent?: (
        collection: string,
        key: string,
        expected: MobileEntityDraft<LocalEntityType>,
        replacement: MobileEntityDraft<LocalEntityType>,
      ) => Promise<void>;
    };
    if (atomic.replaceIfEquivalent !== undefined) {
      return atomic.replaceIfEquivalent(
        COLLECTIONS.draft,
        key,
        expected,
        replacement,
      );
    }
    return this.exclusiveMutation(async () => {
      const current = await this.store.get<MobileEntityDraft<LocalEntityType>>(
        COLLECTIONS.draft,
        key,
      );
      if (current === undefined || !canonicallyEqual(current, expected)) {
        throw new Error('local-store-identity-conflict');
      }
      await this.store.put(COLLECTIONS.draft, key, replacement);
    });
  }

  async putQueueItem(
    item: MobileSyncQueueItem<LocalEntityType>,
  ): Promise<void> {
    await this.putOnce(
      COLLECTIONS.queue,
      recordKey(item, ['queueItemId', 'localEntityId', 'local_entity_id']),
      item,
    );
  }

  private exclusiveMutation<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.mutationTail.then(operation, operation);
    this.mutationTail = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }

  private putOnce<T>(collection: string, key: string, value: T): Promise<void> {
    const atomic = this.store as MobileEncryptedStorePort & {
      putIfAbsentOrEquivalent?: (
        collection: string,
        key: string,
        value: T,
      ) => Promise<void>;
    };
    if (atomic.putIfAbsentOrEquivalent !== undefined) {
      return atomic.putIfAbsentOrEquivalent(collection, key, value);
    }
    return this.exclusiveMutation(async () => {
      const existing = await this.store.get<T>(collection, key);
      if (existing !== undefined) {
        if (!canonicallyEqual(existing, value)) {
          throw new Error('local-store-identity-conflict');
        }
        return;
      }
      await this.store.put(collection, key, value);
    });
  }

  async pending(): Promise<readonly MobileSyncQueueItem<LocalEntityType>[]> {
    const queue = await this.store.list<MobileSyncQueueItem<LocalEntityType>>(
      COLLECTIONS.queue,
    );
    const receipts = await this.store.list<QueueReceipt>(
      COLLECTIONS.syncReceipt,
    );
    const terminal = new Set(
      receipts
        .filter(({ status }) => status === 'applied' || status === 'rejected')
        .map(({ idempotencyKey }) => idempotencyKey),
    );
    return queue.filter((item) => !terminal.has(item.idempotencyKey));
  }

  putEvidence(evidence: MobileEvidenceDraft): Promise<void> {
    return this.putOnce(
      COLLECTIONS.evidence,
      recordKey(evidence, ['localEvidenceId', 'id']),
      evidence,
    );
  }

  putReservation(reservation: MobileNumberingReservation): Promise<void> {
    return this.putOnce(
      COLLECTIONS.reservation,
      recordKey(reservation, ['reservationId', 'id']),
      reservation,
    );
  }

  putPackage(value: InstalledPackageRecord): Promise<void> {
    return this.putOnce(
      COLLECTIONS.package,
      recordKey(value, ['id', 'packageId']),
      value,
    );
  }

  putPrintReceipt(receipt: MobilePrintReceipt): Promise<void> {
    return this.putOnce(
      COLLECTIONS.printReceipt,
      recordKey(receipt, ['receiptId', 'id']),
      receipt,
    );
  }

  async applyReceipts(receipts: readonly QueueReceipt[]): Promise<void> {
    for (const receipt of receipts) {
      await this.putOnce(
        COLLECTIONS.syncReceipt,
        receipt.idempotencyKey,
        receipt,
      );
    }
  }

  receiptByIdempotency(key: string): Promise<QueueReceipt | undefined> {
    return this.store.get(COLLECTIONS.syncReceipt, key);
  }

  cursor(): Promise<SyncCursor | undefined> {
    return this.store.get(COLLECTIONS.syncCursor, 'active');
  }

  saveCursor(cursor: SyncCursor): Promise<void> {
    return this.store.put(COLLECTIONS.syncCursor, 'active', cursor);
  }
}
