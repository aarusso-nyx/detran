import { webcrypto } from 'node:crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  BOAT_ENCRYPTED_STORE_CRYPTO,
  BoatBrowserEncryptedStoreAdapter,
  type BoatSealedRecord,
  type BoatSealedRecordBackend,
} from './browser-encrypted-store.adapter.js';
import { isBoatPortError } from './boat-port-error.js';

const subtle = webcrypto.subtle as unknown as SubtleCrypto;
const getRandomValues = webcrypto.getRandomValues.bind(
  webcrypto,
) as unknown as <T extends ArrayBufferView>(array: T) => T;

function memoryBackend() {
  const records = new Map<string, BoatSealedRecord>();
  let key: CryptoKey | undefined;
  const backend: BoatSealedRecordBackend = {
    readRecord: vi.fn(async (id: string) => records.get(id)),
    writeRecord: vi.fn(async (record: BoatSealedRecord) => {
      records.set(record.id, record);
    }),
    readKey: vi.fn(async () => key),
    writeKey: vi.fn(async (next: CryptoKey) => {
      key = next;
    }),
  };
  return { backend, records, key: () => key };
}

function failingBackend(failure: unknown): BoatSealedRecordBackend {
  const fail = async (): Promise<never> => {
    throw failure;
  };
  return {
    readRecord: fail,
    writeRecord: fail,
    readKey: fail,
    writeKey: fail,
  };
}

function store(backend: BoatSealedRecordBackend) {
  return new BoatBrowserEncryptedStoreAdapter({
    backend,
    subtle,
    getRandomValues,
  });
}

async function rejection(promise: Promise<unknown>): Promise<unknown> {
  try {
    await promise;
  } catch (error) {
    return error;
  }
  throw new Error('a promessa deveria ter sido rejeitada');
}

function hex(bytes: ArrayBuffer): string {
  return [...new Uint8Array(bytes)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

afterEach(() => vi.unstubAllGlobals());

describe('BoatBrowserEncryptedStoreAdapter', () => {
  it('dado backend em memória quando set e get são chamados então devolve o valor gravado', async () => {
    const { backend } = memoryBackend();
    const adapter = store(backend);
    await adapter.set('rascunho', '{"conteudo":"ação é sigilosa"}');
    await expect(adapter.get('rascunho')).resolves.toBe(
      '{"conteudo":"ação é sigilosa"}',
    );
  });

  it('dado chave nunca gravada quando get é chamado então devolve undefined e não inventa valor', async () => {
    const { backend } = memoryBackend();
    await expect(store(backend).get('ausente')).resolves.toBeUndefined();
  });

  it('dado valor gravado quando o registro selado é inspecionado então o texto claro não aparece e o formato segue o contrato', async () => {
    const { backend, records, key } = memoryBackend();
    const value = 'segredo-de-campo-123';
    await store(backend).set('k1', value);
    const record = records.get('boat-kv:k1');
    expect(record).toBeDefined();
    expect(record?.id).toBe('boat-kv:k1');
    expect(record?.collection).toBe('boat-kv');
    expect(new Uint8Array(record!.initializationVector)).toHaveLength(12);
    const ciphertext = hex(record!.ciphertext);
    expect(ciphertext).not.toContain(Buffer.from(value).toString('hex'));
    const plaintext = await subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: new Uint8Array(record!.initializationVector),
      },
      key()!,
      record!.ciphertext,
    );
    expect(new TextDecoder().decode(plaintext)).toBe(JSON.stringify(value));
    const digest = await subtle.digest(
      'SHA-256',
      new TextEncoder().encode(JSON.stringify(value)),
    );
    expect(record?.canonicalDigest).toBe(hex(digest));
    expect(record?.canonicalDigest).toMatch(/^[0-9a-f]{64}$/);
  });

  it('dado chave de selagem gerada quando inspecionada então é AES-GCM de 256 bits não extraível', async () => {
    const { backend, key } = memoryBackend();
    await store(backend).set('k', 'v');
    const algorithm = key()?.algorithm as AesKeyAlgorithm;
    expect(algorithm.name).toBe('AES-GCM');
    expect(algorithm.length).toBe(256);
    expect(key()?.extractable).toBe(false);
    expect(key()?.usages.sort()).toEqual(['decrypt', 'encrypt']);
  });

  it('dado duas gravações na mesma instância quando a chave é carregada então é gerada e persistida uma única vez', async () => {
    const { backend } = memoryBackend();
    const adapter = store(backend);
    await adapter.set('a', '1');
    await adapter.set('b', '2');
    await adapter.get('a');
    expect(backend.writeKey).toHaveBeenCalledTimes(1);
  });

  it('dado backend com chave já persistida quando uma nova instância lê então decifra sem gerar outra chave', async () => {
    const { backend } = memoryBackend();
    await store(backend).set('a', 'valor-a');
    const second = store(backend);
    await expect(second.get('a')).resolves.toBe('valor-a');
    expect(backend.writeKey).toHaveBeenCalledTimes(1);
  });

  it('dado o mesmo valor gravado duas vezes quando os IVs são comparados então diferem e getRandomValues recebe 12 bytes', async () => {
    const { backend, records } = memoryBackend();
    const spy = vi.fn(getRandomValues);
    const adapter = new BoatBrowserEncryptedStoreAdapter({
      backend,
      subtle,
      getRandomValues: spy,
    });
    await adapter.set('k1', 'igual');
    await adapter.set('k2', 'igual');
    const first = hex(records.get('boat-kv:k1')!.initializationVector);
    const second = hex(records.get('boat-kv:k2')!.initializationVector);
    expect(first).not.toBe(second);
    expect(spy).toHaveBeenCalled();
    expect(spy.mock.calls.every(([array]) => array.byteLength === 12)).toBe(
      true,
    );
  });

  it('dado backend que falha com SecurityError quando set é chamado então rejeita com permission-denied', async () => {
    const adapter = store(
      failingBackend(new DOMException('bloqueado', 'SecurityError')),
    );
    const error = await rejection(adapter.set('k', 'v'));
    expect(isBoatPortError(error)).toBe(true);
    expect(error).toMatchObject({
      port: 'MobileEncryptedStorePort',
      code: 'permission-denied',
    });
  });

  it('dado backend que falha com SecurityError quando get é chamado então rejeita com permission-denied', async () => {
    const adapter = store(
      failingBackend(new DOMException('bloqueado', 'SecurityError')),
    );
    expect(await rejection(adapter.get('k'))).toMatchObject({
      code: 'permission-denied',
    });
  });

  it('dado backend que falha com outro erro quando set é chamado então rejeita com unavailable e preserva a causa', async () => {
    const cause = new Error('quota');
    const error = await rejection(store(failingBackend(cause)).set('k', 'v'));
    expect(error).toMatchObject({
      port: 'MobileEncryptedStorePort',
      code: 'unavailable',
    });
    expect((error as Error).cause).toBe(cause);
  });

  it('dado subtle ausente quando set e get são chamados então rejeitam com unavailable', async () => {
    const { backend } = memoryBackend();
    const adapter = new BoatBrowserEncryptedStoreAdapter({
      backend,
      subtle: undefined,
      getRandomValues,
    });
    expect(await rejection(adapter.set('k', 'v'))).toMatchObject({
      code: 'unavailable',
    });
    expect(await rejection(adapter.get('k'))).toMatchObject({
      code: 'unavailable',
    });
  });

  it('dado indexedDB ausente e backend padrão quando set é chamado então rejeita com unavailable', async () => {
    vi.stubGlobal('indexedDB', undefined);
    const adapter = new BoatBrowserEncryptedStoreAdapter({
      subtle,
      getRandomValues,
    });
    expect(await rejection(adapter.set('k', 'v'))).toMatchObject({
      port: 'MobileEncryptedStorePort',
      code: 'unavailable',
    });
    expect(await rejection(adapter.get('k'))).toMatchObject({
      code: 'unavailable',
    });
  });

  it('dado texto cifrado adulterado quando get é chamado então rejeita com integrity-failure e não devolve valor', async () => {
    const { backend, records } = memoryBackend();
    const adapter = store(backend);
    await adapter.set('k', 'valor-integro');
    const record = records.get('boat-kv:k')!;
    const tampered = new Uint8Array(record.ciphertext.slice(0));
    tampered[0] = (tampered[0] ?? 0) ^ 0xff;
    records.set('boat-kv:k', {
      ...record,
      ciphertext: tampered.buffer as ArrayBuffer,
    });
    const error = await rejection(adapter.get('k'));
    expect(error).toMatchObject({
      port: 'MobileEncryptedStorePort',
      code: 'integrity-failure',
    });
  });

  it('dado chave vazia quando set e get são chamados então rejeitam com invalid-input sem tocar o backend', async () => {
    const { backend } = memoryBackend();
    const adapter = store(backend);
    expect(await rejection(adapter.set('', 'v'))).toMatchObject({
      code: 'invalid-input',
    });
    expect(await rejection(adapter.get(''))).toMatchObject({
      code: 'invalid-input',
    });
    expect(backend.writeRecord).not.toHaveBeenCalled();
    expect(backend.readRecord).not.toHaveBeenCalled();
  });

  it('dado o adaptador de homologação quando inspecionado então traz rótulo explícito e os valores de selagem do TEAT', () => {
    const adapter = new BoatBrowserEncryptedStoreAdapter();
    expect(adapter.adapterName).toBe('boat-indexeddb-webcrypto');
    expect(adapter.mode).toBe('homologacao');
    expect(adapter.securityLevel).toBe('software-sealed');
    expect(adapter.encrypted).toBe(true);
    expect(adapter.encryptionScope).toBe('device');
  });

  it('dado BOAT_ENCRYPTED_STORE_CRYPTO quando inspecionado então está congelado com os valores do contrato', () => {
    expect(Object.isFrozen(BOAT_ENCRYPTED_STORE_CRYPTO)).toBe(true);
    expect(BOAT_ENCRYPTED_STORE_CRYPTO).toMatchObject({
      algorithm: 'AES-GCM',
      keyLength: 256,
      extractable: false,
      ivBytes: 12,
      digest: 'SHA-256',
      collection: 'boat-kv',
      recordsStore: 'encrypted-records',
      metadataStore: 'cryptographic-metadata',
      databaseVersion: 1,
    });
  });
});
