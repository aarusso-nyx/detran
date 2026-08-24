import { describe, expect, it } from 'vitest';

import {
  SENATRAN_MAGIC_KEYS,
  findMagicKey,
  loadSenatranSeedManifest,
} from './test-kit.js';

describe('SENATRAN mock test kit', () => {
  it('loads and validates the in-repo seed manifest', async () => {
    const manifest = await loadSenatranSeedManifest();
    expect(manifest.masterSeed).toBe('0x5e17a');
    expect(manifest.counts.veiculos).toBe(120);
  });

  it('finds a magic fixture by kind and status', async () => {
    const manifest = await loadSenatranSeedManifest();
    expect(findMagicKey(manifest, 'placa', 402)).toBe(
      SENATRAN_MAGIC_KEYS.businessErrorPlate,
    );
  });

  it('rejects a missing magic fixture', async () => {
    const manifest = await loadSenatranSeedManifest();
    expect(() => findMagicKey(manifest, 'plate', 418)).toThrow(
      'No SENATRAN magic key',
    );
  });
});
