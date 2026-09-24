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

export interface ScopedAitReservation extends MobileNumberingReservation {
  readonly tenantId: string;
  readonly agentId: string;
  readonly deviceId: string;
  readonly shiftId: string;
}

export interface AitDraftScope {
  readonly tenantId: string;
  readonly agentId: string;
  readonly deviceId: string;
  readonly shiftId: string;
}

export type LocalAitDraft = MobileEntityDraft<'ait'> &
  Readonly<{ localRevision: number }>;

interface AitDraftSelector extends AitDraftScope {
  readonly localEntityId: string;
  readonly idempotencyKey: string;
  readonly reservationId: string;
  readonly rangeId: string;
  readonly series: string;
  readonly initialCommandDigest: string;
}

export interface PinAitNumberInput {
  readonly reservationId: string;
  readonly now: string;
  readonly scope: Readonly<AitDraftScope>;
  readonly draft: Omit<
    MobileEntityDraft<'ait'>,
    'reservedNumber' | 'reservationId' | 'status' | 'localRevision'
  > &
    Readonly<{ status: 'draft' }>;
}

export interface PinAitNumberAtomicOperation {
  readonly expectedReservation: ScopedAitReservation;
  readonly replacementReservation: ScopedAitReservation;
  readonly draft: LocalAitDraft;
  readonly openDraftKey: string;
  readonly selector: AitDraftSelector;
}

interface AtomicAitStorePort extends MobileEncryptedStorePort {
  installAitReservationAuthoritiesAtomic(
    authorities: readonly ScopedAitReservation[],
  ): Promise<void>;
  pinAitNumberAndPutFirstDraftAtomic(
    operation: PinAitNumberAtomicOperation,
  ): Promise<'created' | 'replayed'>;
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
  aitOpenDraft: 'ait-open-draft',
  aitDraftSelector: 'ait-draft-selector',
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

  constructor(private readonly databaseName: string = DATABASE_NAME) {}

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

  async pinAitNumberAndPutFirstDraftAtomic(
    operation: PinAitNumberAtomicOperation,
  ): Promise<'created' | 'replayed'> {
    const marker = {
      localId: operation.draft.localId,
      reservationId: operation.draft.reservationId,
      idempotencyKey: operation.draft.idempotencyKey,
      tenantId: operation.draft.tenantId,
      agentId: operation.draft.agentId,
      deviceId: operation.draft.deviceId,
      shiftId: operation.draft.shiftId,
    };
    const [database, expected, replacement, draft, openDraft, selector] =
      await Promise.all([
        this.database(),
        this.seal(
          COLLECTIONS.reservation,
          operation.expectedReservation.reservationId,
          operation.expectedReservation,
        ),
        this.seal(
          COLLECTIONS.reservation,
          operation.replacementReservation.reservationId,
          operation.replacementReservation,
        ),
        this.seal(COLLECTIONS.draft, operation.draft.localId, operation.draft),
        this.seal(COLLECTIONS.aitOpenDraft, operation.openDraftKey, marker),
        this.seal(
          COLLECTIONS.aitDraftSelector,
          operation.openDraftKey,
          operation.selector,
        ),
      ]);
    const transaction = database.transaction(RECORDS, 'readwrite');
    const completion = transactionComplete(transaction);
    const records = transaction.objectStore(RECORDS);
    const [
      currentReservation,
      currentDraft,
      currentOpenDraft,
      currentSelector,
    ] = (await Promise.all([
      requestResult(records.get(expected.id)),
      requestResult(records.get(draft.id)),
      requestResult(records.get(openDraft.id)),
      requestResult(records.get(selector.id)),
    ])) as [
      EncryptedRecord | undefined,
      EncryptedRecord | undefined,
      EncryptedRecord | undefined,
      EncryptedRecord | undefined,
    ];
    const exactReplay =
      currentReservation?.canonicalDigest === replacement.canonicalDigest &&
      currentDraft?.canonicalDigest === draft.canonicalDigest &&
      currentOpenDraft?.canonicalDigest === openDraft.canonicalDigest &&
      currentSelector?.canonicalDigest === selector.canonicalDigest;
    if (exactReplay) {
      await completion;
      return 'replayed';
    }
    const canCreate =
      currentReservation?.canonicalDigest === expected.canonicalDigest &&
      currentDraft === undefined &&
      currentOpenDraft === undefined &&
      currentSelector === undefined;
    if (!canCreate) {
      transaction.abort();
      await completion.catch(() => undefined);
      throw new Error('local-store-identity-conflict');
    }
    records.put(replacement);
    records.put(draft);
    records.put(openDraft);
    records.put(selector);
    await completion;
    return 'created';
  }

  async installAitReservationAuthoritiesAtomic(
    authorities: readonly ScopedAitReservation[],
  ): Promise<void> {
    const [database, ...records] = await Promise.all([
      this.database(),
      ...authorities.map((authority) =>
        this.seal(COLLECTIONS.reservation, authority.reservationId, authority),
      ),
    ]);
    const transaction = database.transaction(RECORDS, 'readwrite');
    const completion = transactionComplete(transaction);
    const objectStore = transaction.objectStore(RECORDS);
    const current = (await Promise.all(
      records.map((record) => requestResult(objectStore.get(record.id))),
    )) as Array<EncryptedRecord | undefined>;
    const conflict = current.some(
      (existing, index) =>
        existing !== undefined &&
        existing.canonicalDigest !== records[index]?.canonicalDigest,
    );
    if (conflict) {
      transaction.abort();
      await completion.catch(() => undefined);
      throw new Error('local-store-identity-conflict');
    }
    records.forEach((record, index) => {
      if (current[index] === undefined) objectStore.put(record);
    });
    await completion;
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
      const request = indexedDB.open(this.databaseName, DATABASE_VERSION);
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

function isAitQueueItem(item: unknown): boolean {
  if (typeof item !== 'object' || item === null) return false;
  const record = item as Readonly<Record<string, unknown>>;
  return record['entityType'] === 'ait' || record['entity_type'] === 'ait';
}

function aitDraftScopeKey(scope: AitDraftScope): string {
  if (!nonEmptyScope(scope)) throw new Error('ait-draft-scope-required');
  return `${scope.tenantId}:${scope.agentId}:${scope.deviceId}:${scope.shiftId}`;
}

async function aitInitialCommandDigest(
  input: PinAitNumberInput,
): Promise<string> {
  if (
    !sameAitDraftScope(input.draft, input.scope) ||
    typeof input.draft.localId !== 'string' ||
    input.draft.localId.length === 0 ||
    typeof input.draft.idempotencyKey !== 'string' ||
    input.draft.idempotencyKey.length === 0
  ) {
    throw new Error('ait-draft-command-invalid');
  }
  const draft = Object.fromEntries(
    Object.entries(input.draft).filter(
      ([key]) =>
        ![
          'localId',
          'createdAt',
          'updatedAt',
          'reservedNumber',
          'reservationId',
          'localRevision',
        ].includes(key),
    ),
  );
  const payload = input.draft.payload as Readonly<Record<string, unknown>>;
  draft['payload'] = Object.fromEntries(
    Object.entries(payload).filter(([key]) => key !== 'reserved_number'),
  );
  const bytes = new TextEncoder().encode(
    JSON.stringify(
      canonicalValue({
        reservationId: input.reservationId,
        scope: input.scope,
        draft,
      }),
    ),
  );
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
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
    if (draft.entityType === 'ait') {
      throw new Error('atomic-ait-number-pinning-required');
    }
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

  async resumeAitDraft(scope: AitDraftScope): Promise<LocalAitDraft> {
    const key = aitDraftScopeKey(scope);
    const [selector, marker] = await Promise.all([
      this.store.get<AitDraftSelector>(COLLECTIONS.aitDraftSelector, key),
      this.store.get<AitDraftSelector & { localId: string }>(
        COLLECTIONS.aitOpenDraft,
        key,
      ),
    ]);
    if (
      selector === undefined ||
      marker === undefined ||
      !/^[0-9a-f]{64}$/.test(selector.initialCommandDigest ?? '') ||
      typeof selector.localEntityId !== 'string' ||
      selector.localEntityId.length === 0 ||
      typeof selector.idempotencyKey !== 'string' ||
      selector.idempotencyKey.length === 0 ||
      typeof selector.reservationId !== 'string' ||
      selector.reservationId.length === 0 ||
      typeof selector.rangeId !== 'string' ||
      selector.rangeId.length === 0 ||
      typeof selector.series !== 'string' ||
      selector.series.length === 0 ||
      !sameAitDraftScope(selector, scope) ||
      !sameAitDraftScope(marker, scope) ||
      marker.localId !== selector.localEntityId ||
      marker.reservationId !== selector.reservationId ||
      marker.idempotencyKey !== selector.idempotencyKey
    ) {
      throw new Error('ait-draft-selector-inconsistent');
    }
    const draft = await this.store.get<LocalAitDraft>(
      COLLECTIONS.draft,
      selector.localEntityId,
    );
    if (
      draft === undefined ||
      draft.entityType !== 'ait' ||
      draft.status !== 'draft' ||
      draft.localId !== selector.localEntityId ||
      draft.reservationId !== selector.reservationId ||
      draft.idempotencyKey !== selector.idempotencyKey ||
      !sameAitDraftScope(draft, scope) ||
      !Number.isSafeInteger(draft.reservedNumber) ||
      !Number.isSafeInteger(draft.localRevision) ||
      draft.localRevision < 1
    ) {
      throw new Error('ait-draft-selector-inconsistent');
    }
    const reservation = await this.reservationAuthority(selector.reservationId);
    if (
      reservation === undefined ||
      !sameAitDraftScope(reservation, scope) ||
      reservation.rangeId !== selector.rangeId ||
      reservation.series !== selector.series ||
      !Number.isSafeInteger(reservation.startNumber) ||
      !Number.isSafeInteger(reservation.endNumber) ||
      !Number.isSafeInteger(reservation.nextNumber) ||
      draft.reservedNumber < reservation.startNumber ||
      draft.reservedNumber > reservation.endNumber ||
      reservation.nextNumber !== draft.reservedNumber + 1 ||
      reservation.status !==
        (draft.reservedNumber === reservation.endNumber
          ? 'consumed'
          : 'reserved')
    ) {
      throw new Error('ait-draft-selector-inconsistent');
    }
    return draft;
  }

  private async replayAitPin(
    input: PinAitNumberInput,
    initialCommandDigest: string,
    key: string,
  ): Promise<LocalAitDraft | undefined> {
    const selector = await this.store.get<AitDraftSelector>(
      COLLECTIONS.aitDraftSelector,
      key,
    );
    if (selector === undefined) return undefined;
    const persisted = await this.resumeAitDraft(input.scope);
    if (
      selector.idempotencyKey !== input.draft.idempotencyKey ||
      selector.reservationId !== input.reservationId ||
      selector.initialCommandDigest !== initialCommandDigest ||
      persisted.localId !== selector.localEntityId
    ) {
      throw new Error('local-store-identity-conflict');
    }
    return persisted;
  }

  transitionDraft(
    expected: MobileEntityDraft<LocalEntityType>,
    replacement: MobileEntityDraft<LocalEntityType>,
  ): Promise<void> {
    const key = recordKey(expected, ['localId', 'id']);
    if (recordKey(replacement, ['localId', 'id']) !== key) {
      return Promise.reject(new Error('local-store-identity-conflict'));
    }
    const touchesAit =
      expected.entityType === 'ait' || replacement.entityType === 'ait';
    if (touchesAit && !isValidAitRevisionTransition(expected, replacement)) {
      return Promise.reject(new Error('ait-draft-revision-conflict'));
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
    if (touchesAit) {
      return Promise.reject(new Error('atomic-ait-revision-required'));
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
    if (isAitQueueItem(item)) {
      throw new Error('atomic-ait-finalization-required');
    }
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
        .map(({ idempotencyKey }) => idempotencyKey)
        .filter((key) => typeof key === 'string' && key.length > 0),
    );
    const pending = queue.filter((item) => {
      const historical = item as MobileSyncQueueItem<LocalEntityType> & {
        readonly idempotency_key?: string;
      };
      const key = historical.idempotencyKey ?? historical.idempotency_key;
      return typeof key !== 'string' || key.length === 0 || !terminal.has(key);
    });
    if (pending.some(isAitQueueItem)) {
      throw new Error('unverified-ait-queue-item');
    }
    return pending;
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

  reservationAuthority(
    reservationId: string,
  ): Promise<ScopedAitReservation | undefined> {
    return this.store.get(COLLECTIONS.reservation, reservationId);
  }

  async installAitReservationAuthority(
    authority: ScopedAitReservation,
  ): Promise<void> {
    await this.installAitReservationAuthorities([authority]);
  }

  async installAitReservationAuthorities(
    authorities: readonly ScopedAitReservation[],
  ): Promise<void> {
    const ids = new Set<string>();
    const existing = await Promise.all(
      authorities.map(async (authority) => {
        if (
          !isAuthoritativeAitReservation(authority) ||
          ids.has(authority.reservationId)
        ) {
          throw new Error('authoritative-ait-reservation-required');
        }
        ids.add(authority.reservationId);
        return this.store.get<ScopedAitReservation>(
          COLLECTIONS.reservation,
          authority.reservationId,
        );
      }),
    );
    for (const [index, authority] of authorities.entries()) {
      const installed = existing[index];
      if (installed === undefined) continue;
      if (
        !sameReservationAuthority(installed, authority) ||
        !isPreservedReservationCursorValid(installed, authority)
      ) {
        throw new Error('local-store-identity-conflict');
      }
    }
    const missing = authorities.filter(
      (_authority, index) => existing[index] === undefined,
    );
    if (missing.length === 0) return;
    const atomic = this.store as Partial<AtomicAitStorePort>;
    if (typeof atomic.installAitReservationAuthoritiesAtomic !== 'function') {
      throw new Error('atomic-ait-reservation-install-required');
    }
    await atomic.installAitReservationAuthoritiesAtomic(missing);
  }

  async pinAitNumberAndPutFirstDraft(
    input: PinAitNumberInput,
  ): Promise<LocalAitDraft> {
    const atomic = this.store as Partial<AtomicAitStorePort>;
    if (typeof atomic.pinAitNumberAndPutFirstDraftAtomic !== 'function') {
      throw new Error('atomic-ait-number-pinning-required');
    }
    const openDraftKey = aitDraftScopeKey(input.scope);
    const initialCommandDigest = await aitInitialCommandDigest(input);
    const replay = await this.replayAitPin(
      input,
      initialCommandDigest,
      openDraftKey,
    );
    if (replay !== undefined) return replay;
    const existing = await this.store.get<MobileEntityDraft<'ait'>>(
      COLLECTIONS.draft,
      input.draft.localId,
    );
    if (existing !== undefined) {
      throw new Error('ait-draft-selector-inconsistent');
    }
    const reservation = await this.store.get<ScopedAitReservation>(
      COLLECTIONS.reservation,
      input.reservationId,
    );
    if (!isUsableAitReservation(reservation, input)) {
      throw new Error('usable-ait-numbering-reservation-required');
    }
    const pinned: LocalAitDraft = {
      ...input.draft,
      localRevision: 1,
      reservedNumber: reservation.nextNumber,
      reservationId: reservation.reservationId,
      payload: {
        ...input.draft.payload,
        reserved_number: String(reservation.nextNumber),
      },
    };
    const replacement: ScopedAitReservation = {
      ...reservation,
      nextNumber: reservation.nextNumber + 1,
      ...(reservation.nextNumber === reservation.endNumber
        ? { status: 'consumed' as const }
        : {}),
    };
    let result: 'created' | 'replayed';
    try {
      result = await atomic.pinAitNumberAndPutFirstDraftAtomic({
        expectedReservation: reservation,
        replacementReservation: replacement,
        draft: pinned,
        openDraftKey,
        selector: {
          ...input.scope,
          localEntityId: pinned.localId,
          idempotencyKey: pinned.idempotencyKey,
          reservationId: pinned.reservationId,
          rangeId: reservation.rangeId,
          series: reservation.series,
          initialCommandDigest,
        },
      });
    } catch (error) {
      if (
        !(error instanceof Error) ||
        error.message !== 'local-store-identity-conflict'
      ) {
        throw error;
      }
      const winner = await this.replayAitPin(
        input,
        initialCommandDigest,
        openDraftKey,
      );
      if (winner !== undefined) return winner;
      throw error;
    }
    if (result === 'replayed') {
      const persisted = await this.store.get<LocalAitDraft>(
        COLLECTIONS.draft,
        input.draft.localId,
      );
      if (persisted === undefined || !canonicallyEqual(persisted, pinned)) {
        throw new Error('local-store-identity-conflict');
      }
      return persisted;
    }
    return pinned;
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

function isUsableAitReservation(
  reservation: ScopedAitReservation | undefined,
  input: PinAitNumberInput,
): reservation is ScopedAitReservation {
  if (reservation === undefined) return false;
  const now = Date.parse(input.now);
  return (
    Number.isFinite(now) &&
    reservation.entityType === 'ait' &&
    reservation.status === 'reserved' &&
    typeof reservation.series === 'string' &&
    reservation.series.trim().length > 0 &&
    Number.isSafeInteger(reservation.startNumber) &&
    Number.isSafeInteger(reservation.endNumber) &&
    Number.isSafeInteger(reservation.nextNumber) &&
    reservation.nextNumber >= reservation.startNumber &&
    reservation.nextNumber <= reservation.endNumber &&
    Number.isFinite(Date.parse(reservation.validUntil)) &&
    Date.parse(reservation.validUntil) > now &&
    nonEmptyScope(input.scope) &&
    reservation.tenantId === input.scope.tenantId &&
    reservation.agentId === input.scope.agentId &&
    reservation.deviceId === input.scope.deviceId &&
    reservation.shiftId === input.scope.shiftId &&
    input.draft.tenantId === input.scope.tenantId &&
    input.draft.agentId === input.scope.agentId &&
    input.draft.deviceId === input.scope.deviceId &&
    input.draft.shiftId === input.scope.shiftId
  );
}

function sameAitDraftScope(
  value: AitDraftScope,
  scope: AitDraftScope,
): boolean {
  return (
    value.tenantId === scope.tenantId &&
    value.agentId === scope.agentId &&
    value.deviceId === scope.deviceId &&
    value.shiftId === scope.shiftId
  );
}

function isValidAitRevisionTransition(
  expected: MobileEntityDraft<LocalEntityType>,
  replacement: MobileEntityDraft<LocalEntityType>,
): boolean {
  const prior = expected as LocalAitDraft;
  const next = replacement as LocalAitDraft;
  return (
    prior.entityType === 'ait' &&
    replacement.entityType === 'ait' &&
    prior.status === 'draft' &&
    next.status === 'draft' &&
    Number.isSafeInteger(prior.localRevision) &&
    prior.localRevision >= 1 &&
    Number.isSafeInteger(next.localRevision) &&
    next.localRevision === prior.localRevision + 1 &&
    prior.localId === next.localId &&
    prior.reservationId === next.reservationId &&
    prior.reservedNumber === next.reservedNumber &&
    prior.idempotencyKey === next.idempotencyKey &&
    prior.orgUnitId === next.orgUnitId &&
    prior.normativePackageId === next.normativePackageId &&
    prior.normativePackageVersion === next.normativePackageVersion &&
    prior.createdAt === next.createdAt &&
    canonicallyEqual(prior.location, next.location) &&
    sameAitDraftScope(prior, next)
  );
}

function isAuthoritativeAitReservation(
  authority: ScopedAitReservation,
): boolean {
  return (
    authority.entityType === 'ait' &&
    authority.status === 'reserved' &&
    nonEmptyScope(authority) &&
    typeof authority.reservationId === 'string' &&
    authority.reservationId.trim().length > 0 &&
    typeof authority.rangeId === 'string' &&
    authority.rangeId.trim().length > 0 &&
    typeof authority.series === 'string' &&
    authority.series.trim().length > 0 &&
    Number.isSafeInteger(authority.startNumber) &&
    Number.isSafeInteger(authority.endNumber) &&
    authority.startNumber <= authority.endNumber &&
    authority.nextNumber === authority.startNumber &&
    Number.isFinite(Date.parse(authority.validUntil))
  );
}

function sameReservationAuthority(
  existing: ScopedAitReservation,
  authority: ScopedAitReservation,
): boolean {
  return [
    'reservationId',
    'rangeId',
    'entityType',
    'series',
    'startNumber',
    'endNumber',
    'validUntil',
    'tenantId',
    'agentId',
    'deviceId',
    'shiftId',
  ].every(
    (field) =>
      existing[field as keyof ScopedAitReservation] ===
      authority[field as keyof ScopedAitReservation],
  );
}

function isPreservedReservationCursorValid(
  existing: ScopedAitReservation,
  authority: ScopedAitReservation,
): boolean {
  return (
    Number.isSafeInteger(existing.nextNumber) &&
    existing.nextNumber >= authority.startNumber &&
    existing.nextNumber <= authority.endNumber + 1 &&
    ((existing.nextNumber <= authority.endNumber &&
      existing.status === 'reserved') ||
      (existing.nextNumber === authority.endNumber + 1 &&
        existing.status === 'consumed'))
  );
}

function nonEmptyScope(scope: PinAitNumberInput['scope']): boolean {
  return [scope.tenantId, scope.agentId, scope.deviceId, scope.shiftId].every(
    (value) => typeof value === 'string' && value.trim().length > 0,
  );
}
