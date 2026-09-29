import { afterEach, describe, expect, it, vi } from 'vitest';

import { DocumentTrustHttpAdapter } from './document-trust.http-adapter.js';

const keys = [
  'DETRAN_DOCUMENT_TRUST_HEALTH_URL',
  'DETRAN_DOCUMENT_TRUST_TOKEN',
  'DETRAN_DOCUMENT_TRUST_URL',
  'DETRAN_RUNTIME_PROFILE',
] as const;
const original = Object.fromEntries(keys.map((key) => [key, process.env[key]]));

function configure(profile = 'test'): void {
  process.env.DETRAN_RUNTIME_PROFILE = profile;
  process.env.DETRAN_DOCUMENT_TRUST_URL = 'http://trust.fixture.test/verify';
  process.env.DETRAN_DOCUMENT_TRUST_HEALTH_URL =
    'http://trust.fixture.test/health';
  process.env.DETRAN_DOCUMENT_TRUST_TOKEN = 'fixture-document-token';
}

function response(body: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: vi.fn(async () => body),
  } as unknown as Response;
}

afterEach(() => {
  vi.unstubAllGlobals();
  for (const key of keys) {
    const value = original[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

describe('R-0021 confiança documental caracterizada', () => {
  it('dado capacidades completas quando confere prontidão então usa health autenticado', async () => {
    configure();
    const fetch = vi.fn().mockResolvedValue(
      response({
        documentManifest: true,
        padesLt: true,
        tsa: true,
        withdrawalEvidence: true,
        certificateValidation: ['CRL'],
      }),
    );
    vi.stubGlobal('fetch', fetch);

    await expect(
      new DocumentTrustHttpAdapter().checkCapabilities(),
    ).resolves.toBeUndefined();
    expect(fetch).toHaveBeenCalledWith(
      'http://trust.fixture.test/health',
      expect.objectContaining({
        headers: { authorization: 'Bearer fixture-document-token' },
      }),
    );
  });
});
