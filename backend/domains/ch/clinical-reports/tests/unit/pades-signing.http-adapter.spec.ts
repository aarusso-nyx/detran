import { afterEach, describe, expect, it, vi } from 'vitest';

import { PadesSigningHttpAdapter } from '../../src/pades-signing.http-adapter.js';

const keys = [
  'DETRAN_CLINICAL_SIGNING_HEALTH_URL',
  'DETRAN_CLINICAL_SIGNING_TOKEN',
  'DETRAN_CLINICAL_SIGNING_URL',
  'DETRAN_RUNTIME_PROFILE',
] as const;
const original = Object.fromEntries(keys.map((key) => [key, process.env[key]]));

afterEach(() => {
  vi.unstubAllGlobals();
  for (const key of keys) {
    const value = original[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

function configure(): void {
  process.env.DETRAN_RUNTIME_PROFILE = 'production';
  process.env.DETRAN_CLINICAL_SIGNING_URL = 'https://trust.example.test/sign';
  process.env.DETRAN_CLINICAL_SIGNING_HEALTH_URL =
    'https://trust.example.test/capabilities';
  process.env.DETRAN_CLINICAL_SIGNING_TOKEN = 'external-secret';
}

describe('PadesSigningHttpAdapter trust readiness', () => {
  it('accepts the complete external trust capability set', async () => {
    configure();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          pades: true,
          tsa: true,
          lta: true,
          certificateValidation: ['OCSP'],
        }),
    });
    vi.stubGlobal('fetch', fetchMock);
    await expect(
      new PadesSigningHttpAdapter().checkCapabilities(),
    ).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith(
      'https://trust.example.test/capabilities',
      expect.objectContaining({
        headers: { authorization: 'Bearer external-secret' },
      }),
    );
  });

  it('rejects cleartext trust endpoints outside local/test', async () => {
    configure();
    process.env.DETRAN_CLINICAL_SIGNING_URL = 'http://trust.example.test/sign';
    await expect(
      new PadesSigningHttpAdapter().checkCapabilities(),
    ).rejects.toThrow('must use HTTPS');
  });
});
