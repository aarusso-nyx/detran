import { afterEach, describe, expect, it, vi } from 'vitest';

import { PadesSigningHttpAdapter } from '../../src/pades-signing.http-adapter.js';

const keys = [
  'DETRAN_CLINICAL_SIGNING_HEALTH_URL',
  'DETRAN_CLINICAL_SIGNING_TOKEN',
  'DETRAN_CLINICAL_SIGNING_URL',
  'DETRAN_RUNTIME_PROFILE',
] as const;
const original = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
const request = {
  documentType: 'REPORT' as const,
  contentSha256: 'a'.repeat(64),
  content: { encounterId: 'fixture-clinical-encounter' },
  signer: {
    professionalId: 'fixture-clinical-professional',
    name: 'Professional fixture',
    council: 'CRM/fixture',
  },
  minimumSignatureLevel: 'QUALIFIED' as const,
};
const receipt = {
  contentSha256: request.contentSha256,
  storageDocumentId: 'fixture-storage-document',
  artifactSha256: 'b'.repeat(64),
  signatureLevel: 'QUALIFIED',
  signatureFormat: 'PAdES-TSA',
  signedAt: '2026-09-27T12:00:00.000Z',
  tsaTime: '2026-09-27T12:00:01.000Z',
  certificateValidationSource: 'OCSP',
  certificateValidationStatus: 'GOOD',
  certificateValidatedAt: '2026-09-27T12:00:02.000Z',
};

function configure(): void {
  process.env.DETRAN_RUNTIME_PROFILE = 'production';
  process.env.DETRAN_CLINICAL_SIGNING_URL = 'https://trust.fixture.test/sign';
  process.env.DETRAN_CLINICAL_SIGNING_HEALTH_URL =
    'https://trust.fixture.test/health';
  process.env.DETRAN_CLINICAL_SIGNING_TOKEN = 'fixture-bearer-token';
}

function response(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: vi.fn(async () => body),
  } as unknown as Response;
}

async function expectRedacted(work: () => Promise<unknown>): Promise<void> {
  const error = await work().then(
    () => undefined,
    (caught: unknown) => caught,
  );
  expect(error).toBeInstanceOf(Error);
  expect(JSON.stringify(error)).not.toContain('fixture-bearer-token');
}

afterEach(() => {
  vi.unstubAllGlobals();
  for (const key of keys) {
    const value = original[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

describe('R-0021 assinatura clínica caracterizada', () => {
  it('dado recibo clínico completo quando renderiza e assina então preserva evidência e envia corpo HTTP com Bearer', async () => {
    configure();
    const fetch = vi.fn().mockResolvedValue(response(receipt));
    vi.stubGlobal('fetch', fetch);

    await expect(
      new PadesSigningHttpAdapter().renderAndSign(request),
    ).resolves.toEqual(receipt);
    expect(fetch).toHaveBeenCalledWith(
      'https://trust.fixture.test/sign',
      expect.objectContaining({
        method: 'POST',
        headers: {
          authorization: 'Bearer fixture-bearer-token',
          'content-type': 'application/json',
        },
        body: JSON.stringify(request),
      }),
    );
  });

  it('dado backend ausente ou HTTP não-2xx quando assina então não produz recibo', async () => {
    configure();
    delete process.env.DETRAN_CLINICAL_SIGNING_TOKEN;
    await expectRedacted(() =>
      new PadesSigningHttpAdapter().renderAndSign(request),
    );

    configure();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response({}, false, 503)));
    await expectRedacted(() =>
      new PadesSigningHttpAdapter().renderAndSign(request),
    );
  });
});
