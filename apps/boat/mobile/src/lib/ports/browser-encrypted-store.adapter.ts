import type { MobileEncryptedStorePort } from '../ports.js';
import {
  BoatPortError,
  type BoatHomologationAdapter,
} from './boat-port-error.js';

/**
 * Parâmetros de selagem, com paridade com `BrowserEncryptedStoreAdapter` do
 * TEAT (OD-R28-003, CTG-0002 §Paridade). Só banco e nome do adaptador diferem.
 */
export const BOAT_ENCRYPTED_STORE_CRYPTO = Object.freeze({
  algorithm: 'AES-GCM',
  keyLength: 256,
  extractable: false,
  keyUsages: Object.freeze(['encrypt', 'decrypt'] as const),
  ivBytes: 12,
  digest: 'SHA-256',
  collection: 'boat-kv',
  databaseName: 'detran-boat-mobile',
  databaseVersion: 1,
  recordsStore: 'encrypted-records',
  metadataStore: 'cryptographic-metadata',
  metadataKey: 'device-sealing-key',
} as const);

export interface BoatSealedRecord {
  readonly id: string;
  readonly collection: string;
  readonly canonicalDigest: string;
  readonly initializationVector: ArrayBuffer;
  readonly ciphertext: ArrayBuffer;
}

export interface BoatSealedRecordBackend {
  readRecord(id: string): Promise<BoatSealedRecord | undefined>;
  writeRecord(record: BoatSealedRecord): Promise<void>;
  readKey(): Promise<CryptoKey | undefined>;
  writeKey(key: CryptoKey): Promise<void>;
}

/**
 * Fonte de aleatoriedade do IV. Aceita a assinatura genérica de
 * `crypto.getRandomValues` (CTG-0002) e também um dublê não genérico, pois o
 * adaptador só usa o preenchimento do `Uint8Array` e ignora o retorno.
 */
export type BoatRandomValues =
  | (<T extends ArrayBufferView>(array: T) => T)
  | ((array: Uint8Array<ArrayBuffer>) => unknown);

export interface BoatBrowserEncryptedStoreAdapterOptions {
  readonly databaseName?: string;
  readonly backend?: BoatSealedRecordBackend;
  readonly subtle?: SubtleCrypto;
  readonly getRandomValues?: BoatRandomValues;
}

interface SealingRuntime {
  readonly backend: BoatSealedRecordBackend;
  readonly subtle: SubtleCrypto;
  readonly getRandomValues: BoatRandomValues;
}

const PORT = 'MobileEncryptedStorePort';

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

/** Backend padrão: IndexedDB com os stores e a versão do TEAT. */
class IndexedDbSealedRecordBackend implements BoatSealedRecordBackend {
  private databasePromise?: Promise<IDBDatabase>;

  constructor(
    private readonly factory: IDBFactory,
    private readonly databaseName: string,
  ) {}

  async readRecord(id: string): Promise<BoatSealedRecord | undefined> {
    const { recordsStore } = BOAT_ENCRYPTED_STORE_CRYPTO;
    const transaction = (await this.database()).transaction(
      recordsStore,
      'readonly',
    );
    return (await requestResult(
      transaction.objectStore(recordsStore).get(id),
    )) as BoatSealedRecord | undefined;
  }

  async writeRecord(record: BoatSealedRecord): Promise<void> {
    const { recordsStore } = BOAT_ENCRYPTED_STORE_CRYPTO;
    const transaction = (await this.database()).transaction(
      recordsStore,
      'readwrite',
    );
    transaction.objectStore(recordsStore).put(record);
    await transactionComplete(transaction);
  }

  async readKey(): Promise<CryptoKey | undefined> {
    const { metadataStore, metadataKey } = BOAT_ENCRYPTED_STORE_CRYPTO;
    const transaction = (await this.database()).transaction(
      metadataStore,
      'readonly',
    );
    return (await requestResult(
      transaction.objectStore(metadataStore).get(metadataKey),
    )) as CryptoKey | undefined;
  }

  async writeKey(key: CryptoKey): Promise<void> {
    const { metadataStore, metadataKey } = BOAT_ENCRYPTED_STORE_CRYPTO;
    const transaction = (await this.database()).transaction(
      metadataStore,
      'readwrite',
    );
    transaction.objectStore(metadataStore).put(key, metadataKey);
    await transactionComplete(transaction);
  }

  private database(): Promise<IDBDatabase> {
    this.databasePromise ??= new Promise<IDBDatabase>((resolve, reject) => {
      const { databaseVersion, recordsStore, metadataStore } =
        BOAT_ENCRYPTED_STORE_CRYPTO;
      const request = this.factory.open(this.databaseName, databaseVersion);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(recordsStore))
          database.createObjectStore(recordsStore, { keyPath: 'id' });
        if (!database.objectStoreNames.contains(metadataStore))
          database.createObjectStore(metadataStore);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () =>
        reject(request.error ?? new Error('indexeddb-open-failed'));
    });
    this.databasePromise.catch(() => {
      this.databasePromise = undefined;
    });
    return this.databasePromise;
  }
}

function exceptionName(error: unknown): string | undefined {
  if (typeof error !== 'object' || error === null) return undefined;
  const name = (error as { readonly name?: unknown }).name;
  return typeof name === 'string' ? name : undefined;
}

/** Falha de armazenamento: `SecurityError` → `permission-denied`; resto → `unavailable`. */
function storageError(error: unknown): BoatPortError {
  if (error instanceof BoatPortError) return error;
  return exceptionName(error) === 'SecurityError'
    ? new BoatPortError(PORT, 'permission-denied', { cause: error })
    : new BoatPortError(PORT, 'unavailable', { cause: error });
}

async function storage<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    throw storageError(error);
  }
}

function hex(bytes: ArrayBuffer): string {
  return [...new Uint8Array(bytes)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Armazenamento cifrado web de homologação: cópia com paridade de
 * `BrowserEncryptedStoreAdapter` (TEAT) sobre a interface de `ports.ts`.
 */
export class BoatBrowserEncryptedStoreAdapter
  implements MobileEncryptedStorePort, BoatHomologationAdapter
{
  readonly adapterName = 'boat-indexeddb-webcrypto';
  readonly mode = 'homologacao';
  readonly securityLevel = 'software-sealed';
  readonly encrypted = true;
  readonly encryptionScope = 'device';
  private defaultBackend?: BoatSealedRecordBackend;
  private keyPromise?: Promise<CryptoKey>;

  constructor(
    private readonly options: BoatBrowserEncryptedStoreAdapterOptions = {},
  ) {}

  async set(key: string, value: string): Promise<void> {
    const runtime = this.runtime(key);
    const record = await this.seal(runtime, key, value);
    await storage(() => runtime.backend.writeRecord(record));
  }

  async get(key: string): Promise<string | undefined> {
    const runtime = this.runtime(key);
    const record = await storage(() =>
      runtime.backend.readRecord(this.recordId(key)),
    );
    if (record === undefined) return undefined;
    const sealingKey = await this.sealingKey(runtime);
    let plaintext: ArrayBuffer;
    try {
      plaintext = await runtime.subtle.decrypt(
        {
          name: BOAT_ENCRYPTED_STORE_CRYPTO.algorithm,
          iv: new Uint8Array(record.initializationVector),
        },
        sealingKey,
        record.ciphertext,
      );
    } catch (error) {
      throw new BoatPortError(
        PORT,
        exceptionName(error) === 'OperationError'
          ? 'integrity-failure'
          : 'unavailable',
        { cause: error },
      );
    }
    let value: unknown;
    try {
      value = JSON.parse(new TextDecoder().decode(plaintext));
    } catch (error) {
      throw new BoatPortError(PORT, 'integrity-failure', { cause: error });
    }
    if (typeof value !== 'string') {
      throw new BoatPortError(PORT, 'integrity-failure');
    }
    return value;
  }

  private recordId(key: string): string {
    return `${BOAT_ENCRYPTED_STORE_CRYPTO.collection}:${key}`;
  }

  /** Valida a chave e lê as dependências de navegador na chamada. */
  private runtime(key: string): SealingRuntime {
    if (typeof key !== 'string' || key === '') {
      throw new BoatPortError(PORT, 'invalid-input');
    }
    const subtle =
      'subtle' in this.options
        ? this.options.subtle
        : globalThis.crypto?.subtle;
    const getRandomValues =
      'getRandomValues' in this.options
        ? this.options.getRandomValues
        : this.defaultGetRandomValues();
    const backend =
      'backend' in this.options
        ? this.options.backend
        : this.indexedDbBackend();
    if (
      subtle === undefined ||
      subtle === null ||
      typeof getRandomValues !== 'function' ||
      backend === undefined
    ) {
      throw new BoatPortError(PORT, 'unavailable');
    }
    return { backend, subtle, getRandomValues };
  }

  private defaultGetRandomValues(): BoatRandomValues | undefined {
    const cryptoApi = globalThis.crypto;
    if (typeof cryptoApi?.getRandomValues !== 'function') return undefined;
    return (array: Uint8Array<ArrayBuffer>) => cryptoApi.getRandomValues(array);
  }

  private indexedDbBackend(): BoatSealedRecordBackend | undefined {
    if (this.defaultBackend !== undefined) return this.defaultBackend;
    const factory = globalThis.indexedDB;
    if (factory === undefined || factory === null) return undefined;
    this.defaultBackend = new IndexedDbSealedRecordBackend(
      factory,
      this.options.databaseName ?? BOAT_ENCRYPTED_STORE_CRYPTO.databaseName,
    );
    return this.defaultBackend;
  }

  /** Chave carregada ou gerada uma vez por instância (promessa memorizada). */
  private sealingKey(runtime: SealingRuntime): Promise<CryptoKey> {
    if (this.keyPromise === undefined) {
      const pending = this.loadOrCreateSealingKey(runtime);
      this.keyPromise = pending;
      pending.catch(() => {
        if (this.keyPromise === pending) this.keyPromise = undefined;
      });
    }
    return this.keyPromise;
  }

  private async loadOrCreateSealingKey(
    runtime: SealingRuntime,
  ): Promise<CryptoKey> {
    const existing = await storage(() => runtime.backend.readKey());
    if (existing !== undefined) return existing;
    const { algorithm, keyLength, extractable, keyUsages } =
      BOAT_ENCRYPTED_STORE_CRYPTO;
    let key: CryptoKey;
    try {
      key = await runtime.subtle.generateKey(
        { name: algorithm, length: keyLength },
        extractable,
        [...keyUsages],
      );
    } catch (error) {
      throw new BoatPortError(PORT, 'unavailable', { cause: error });
    }
    await storage(() => runtime.backend.writeKey(key));
    return key;
  }

  private async seal(
    runtime: SealingRuntime,
    key: string,
    value: string,
  ): Promise<BoatSealedRecord> {
    const sealingKey = await this.sealingKey(runtime);
    const { algorithm, ivBytes, digest, collection } =
      BOAT_ENCRYPTED_STORE_CRYPTO;
    try {
      const initializationVector = new Uint8Array(ivBytes);
      runtime.getRandomValues(initializationVector);
      // O canônico de uma string é a própria string serializada.
      const serialized = new TextEncoder().encode(JSON.stringify(value));
      const [ciphertext, canonicalDigest] = await Promise.all([
        runtime.subtle.encrypt(
          { name: algorithm, iv: initializationVector },
          sealingKey,
          serialized,
        ),
        runtime.subtle.digest(digest, serialized),
      ]);
      return {
        id: this.recordId(key),
        collection,
        canonicalDigest: hex(canonicalDigest),
        initializationVector: initializationVector.buffer as ArrayBuffer,
        ciphertext,
      };
    } catch (error) {
      throw new BoatPortError(PORT, 'unavailable', { cause: error });
    }
  }
}
