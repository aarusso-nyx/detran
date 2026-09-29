import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  BOAT_ENCRYPTED_STORE_CRYPTO,
  BoatBrowserEncryptedStoreAdapter,
} from './browser-encrypted-store.adapter.js';

const TEAT_SOURCE = readFileSync(
  fileURLToPath(
    new URL(
      '../../../../../teat/mobile/src/app/data/local/local-act.store.ts',
      import.meta.url,
    ),
  ),
  'utf8',
);

function literal(pattern: RegExp): string {
  const match = pattern.exec(TEAT_SOURCE);
  if (match?.[1] === undefined) {
    throw new Error(`literal do TEAT não encontrado: ${pattern}`);
  }
  return match[1];
}

describe('paridade BoatBrowserEncryptedStoreAdapter x BrowserEncryptedStoreAdapter (OD-R28-003)', () => {
  it('dado o TEAT quando a geração de chave é lida então algoritmo, tamanho, extraível e usos coincidem com o BOAT', () => {
    const generate =
      /generateKey\(\s*\{\s*name:\s*'([^']+)',\s*length:\s*(\d+)\s*\},\s*(true|false),\s*\[([^\]]*)\]/.exec(
        TEAT_SOURCE,
      );
    expect(generate).not.toBeNull();
    expect(BOAT_ENCRYPTED_STORE_CRYPTO.algorithm).toBe(generate?.[1]);
    expect(BOAT_ENCRYPTED_STORE_CRYPTO.keyLength).toBe(Number(generate?.[2]));
    expect(BOAT_ENCRYPTED_STORE_CRYPTO.extractable).toBe(
      generate?.[3] === 'true',
    );
    expect(generate?.[4]).toContain("'encrypt'");
    expect(generate?.[4]).toContain("'decrypt'");
  });

  it('dado o TEAT quando IV e digest são lidos então bytes do IV e algoritmo de digest coincidem com o BOAT', () => {
    expect(BOAT_ENCRYPTED_STORE_CRYPTO.ivBytes).toBe(
      Number(literal(/getRandomValues\(new Uint8Array\((\d+)\)\)/)),
    );
    expect(BOAT_ENCRYPTED_STORE_CRYPTO.digest).toBe(
      literal(/crypto\.subtle\.digest\('([^']+)'/),
    );
  });

  it('dado o TEAT quando stores e versão são lidos então nomes e versão coincidem com o BOAT', () => {
    expect(BOAT_ENCRYPTED_STORE_CRYPTO.recordsStore).toBe(
      literal(/const RECORDS = '([^']+)'/),
    );
    expect(BOAT_ENCRYPTED_STORE_CRYPTO.metadataStore).toBe(
      literal(/const METADATA = '([^']+)'/),
    );
    expect(BOAT_ENCRYPTED_STORE_CRYPTO.databaseVersion).toBe(
      Number(literal(/const DATABASE_VERSION = (\d+)/)),
    );
  });

  it('dado o TEAT quando o selo do adaptador é lido então securityLevel, encryptionScope e encrypted coincidem com o BOAT', () => {
    const boat = new BoatBrowserEncryptedStoreAdapter();
    expect(boat.securityLevel).toBe(
      literal(/readonly securityLevel = '([^']+)'/),
    );
    expect(boat.encryptionScope).toBe(
      literal(/readonly encryptionScope = '([^']+)'/),
    );
    expect(boat.encrypted).toBe(
      literal(/readonly encrypted = (true|false)/) === 'true',
    );
  });

  it('dado o TEAT quando o registro selado é lido então o formato de id e os campos coincidem com o contrato do BOAT', () => {
    expect(TEAT_SOURCE).toContain('id: `${collection}:${key}`');
    for (const field of [
      'collection',
      'canonicalDigest',
      'initializationVector',
      'ciphertext',
    ]) {
      expect(TEAT_SOURCE).toMatch(new RegExp(`readonly ${field}:`));
    }
  });

  it('dado o TEAT e o BOAT quando os pontos de diferença são lidos então nome do adaptador e coleção são distintos', () => {
    const boat = new BoatBrowserEncryptedStoreAdapter();
    expect(literal(/readonly adapterName = '([^']+)'/)).toBe(
      'teat-indexeddb-webcrypto',
    );
    expect(boat.adapterName).toBe('boat-indexeddb-webcrypto');
    expect(boat.adapterName).not.toBe('teat-indexeddb-webcrypto');
    expect(literal(/const DATABASE_NAME = '([^']+)'/)).toBe(
      'detran-teat-mobile',
    );
  });
});
