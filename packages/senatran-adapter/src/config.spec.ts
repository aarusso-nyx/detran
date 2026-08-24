import { describe, expect, it } from 'vitest';

import { featureEnvName, loadSenatranConfig } from './config.js';

describe('SENATRAN provider configuration', () => {
  it('defaults to the fully enabled mock provider except reserved RENAVAM', () => {
    const config = loadSenatranConfig({});
    expect(config.provider).toBe('mock');
    expect(config.baseUrl).toBe('http://localhost:3000');
    expect(config.features).toEqual({
      renainf: true,
      renaest: true,
      renach: true,
      sne: true,
      cdt: true,
      'wsdenatran-read': true,
      renavam: false,
    });
    expect(config.retry.maxAttempts).toBe(3);
  });

  it('rejects an unknown provider', () => {
    expect(() => loadSenatranConfig({ SENATRAN_PROVIDER: 'local' })).toThrow(
      'must be mock or real',
    );
  });

  it('fails closed when real credentials are absent', () => {
    expect(() => loadSenatranConfig({ SENATRAN_PROVIDER: 'real' })).toThrow(
      'SENATRAN_REAL_BASE_URL',
    );
  });

  it('derives explicit feature flag names per real surface', () => {
    expect(featureEnvName('wsdenatran-read')).toBe(
      'SENATRAN_REAL_ENABLE_WSDENATRAN_READ',
    );
    expect(featureEnvName('renaest')).toBe('SENATRAN_REAL_ENABLE_RENAEST');
  });
});
