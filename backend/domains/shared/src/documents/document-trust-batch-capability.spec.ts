import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const TENANT = '00000000-0000-7000-8000-00000000a001';
const BATCH = '00000000-0000-7000-8000-000028000001';
const DOCUMENT = '00000000-0000-7000-8000-000012000001';
const CHAIR = '00000000-0000-4000-8000-0000b0000011';
const CONTENT_HASH = 'a'.repeat(64);
const SNAPSHOT_HASH = 'b'.repeat(64);
const SIGNATURE_REF = 'opaque-batch-minutes-signature-reference';
const HEALTH_URL = 'http://trust.test/health';
const VERIFY_URL = 'http://trust.test/verify';

type BatchMinutesVerifier = {
  verifyBatchMinutesEvidence(input: {
    tenantId: string;
    batchId: string;
    signatureRef: string;
    documentId: string;
    contentHash: string;
    snapshotHash: string;
    expectedSignerPersonId: string;
  }): Promise<Record<string, unknown>>;
};

async function adapter(): Promise<BatchMinutesVerifier> {
  const module = (await import(
    new URL('./document-trust.http-adapter.ts', import.meta.url).href
  )) as { DocumentTrustHttpAdapter: new () => BatchMinutesVerifier };
  return new module.DocumentTrustHttpAdapter();
}

function response(body: Record<string, unknown>, ok = true, status = 200) {
  return {
    ok,
    status,
    json: vi.fn(async () => body),
  } as unknown as Response;
}

const capabilities = {
  batchDistributionMinutes: true,
  padesLt: true,
  tsa: true,
  certificateValidation: ['OCSP'],
};

const receipt = {
  tenantId: TENANT,
  batchId: BATCH,
  signatureRef: SIGNATURE_REF,
  documentId: DOCUMENT,
  contentHash: CONTENT_HASH,
  snapshotHash: SNAPSHOT_HASH,
  documentKind: 'BATCH_DISTRIBUTION_MINUTES',
  signerPersonId: CHAIR,
  padesLevel: 'PAdES-B-LT',
  tsaAt: '2026-09-14T12:00:00.000Z',
  tsaValidationStatus: 'GOOD',
  certificateValidationSource: 'OCSP',
  certificateValidationStatus: 'GOOD',
  certificateValidatedAt: '2026-09-14T12:00:00.000Z',
};

const input = {
  tenantId: TENANT,
  batchId: BATCH,
  signatureRef: SIGNATURE_REF,
  documentId: DOCUMENT,
  contentHash: CONTENT_HASH,
  snapshotHash: SNAPSHOT_HASH,
  expectedSignerPersonId: CHAIR,
};

const healthRequest = expect.objectContaining({
  headers: { authorization: 'Bearer fixture-token' },
  signal: expect.any(AbortSignal),
});

describe('CTG-0002 — capacidade documental da ata de distribuição', () => {
  beforeEach(() => {
    vi.stubEnv('DETRAN_RUNTIME_PROFILE', 'test');
    vi.stubEnv('DETRAN_DOCUMENT_TRUST_URL', VERIFY_URL);
    vi.stubEnv('DETRAN_DOCUMENT_TRUST_HEALTH_URL', HEALTH_URL);
    vi.stubEnv('DETRAN_DOCUMENT_TRUST_TOKEN', 'fixture-token');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  for (const [name, health] of [
    [
      'capacidade batchDistributionMinutes ausente',
      { ...capabilities, batchDistributionMinutes: undefined },
    ],
    [
      'capacidade batchDistributionMinutes falsa',
      { ...capabilities, batchDistributionMinutes: false },
    ],
    ['PAdES-B-LT indisponível', { ...capabilities, padesLt: false }],
    ['TSA indisponível', { ...capabilities, tsa: false }],
    ['OCSP/CRL indisponível', { ...capabilities, certificateValidation: [] }],
    ['resposta de health parcial', { batchDistributionMinutes: true }],
  ] as const) {
    it(`dado ${name} quando a ata é verificada então falha fechada antes do recibo`, async () => {
      const fetch = vi.fn(async () => response(health));
      vi.stubGlobal('fetch', fetch);

      await expect(
        (await adapter()).verifyBatchMinutesEvidence(input),
      ).rejects.toBeDefined();
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(HEALTH_URL, healthRequest);
    });
  }

  it('dado HTTP não-2xx no health quando a ata é verificada então não consulta recibo', async () => {
    const fetch = vi.fn(async () => response({}, false, 503));
    vi.stubGlobal('fetch', fetch);

    await expect(
      (await adapter()).verifyBatchMinutesEvidence(input),
    ).rejects.toBeDefined();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(HEALTH_URL, healthRequest);
  });

  it('dado serviço indisponível no health quando a ata é verificada então não gera recibo positivo', async () => {
    const fetch = vi.fn(async () =>
      Promise.reject(new Error('service unavailable')),
    );
    vi.stubGlobal('fetch', fetch);

    await expect(
      (await adapter()).verifyBatchMinutesEvidence(input),
    ).rejects.toBeDefined();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(HEALTH_URL, healthRequest);
  });

  it('dado capacidade específica válida seguida de recibo válido quando a ata é verificada então aceita sem exigir evidência de retirada', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(response(capabilities))
      .mockResolvedValueOnce(response(receipt));
    vi.stubGlobal('fetch', fetch);

    await expect(
      (await adapter()).verifyBatchMinutesEvidence(input),
    ).resolves.toEqual(receipt);
    expect(fetch).toHaveBeenNthCalledWith(1, HEALTH_URL, healthRequest);
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      VERIFY_URL,
      expect.objectContaining({
        body: JSON.stringify({ kind: 'batch-minutes-evidence', ...input }),
      }),
    );
  });
});
