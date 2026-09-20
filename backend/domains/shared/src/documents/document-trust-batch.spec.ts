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

function response(body: Record<string, unknown>) {
  return {
    ok: true,
    status: 200,
    json: vi.fn(async () => body),
  } as unknown as Response;
}

const capabilities = {
  batchDistributionMinutes: true,
  padesLt: true,
  tsa: true,
  certificateValidation: ['OCSP'],
};

function trustFetch(verifyReceipt: Record<string, unknown>) {
  return vi.fn(async (url: string) =>
    response(url === HEALTH_URL ? capabilities : verifyReceipt),
  );
}

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

describe('CTG-0002 — fronteira documental da ata de distribuição', () => {
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

  it('dado o contrato público quando a ata BATCH_DISTRIBUTION_MINUTES é verificada então expõe operação dedicada, e não DECISAO_DEFESA', async () => {
    const subject = await adapter();

    expect(subject.verifyBatchMinutesEvidence).toBeTypeOf('function');
  });

  it('dado recibo criptográfico canônico quando a ata é verificada então vincula tenant, lote, documento, hashes, presidente, PAdES-B-LT, TSA e OCSP/CRL', async () => {
    const fetch = trustFetch(receipt);
    vi.stubGlobal('fetch', fetch);

    await expect(
      (await adapter()).verifyBatchMinutesEvidence({
        tenantId: TENANT,
        batchId: BATCH,
        signatureRef: SIGNATURE_REF,
        documentId: DOCUMENT,
        contentHash: CONTENT_HASH,
        snapshotHash: SNAPSHOT_HASH,
        expectedSignerPersonId: CHAIR,
      }),
    ).resolves.toEqual(receipt);
    expect(fetch).toHaveBeenNthCalledWith(
      1,
      HEALTH_URL,
      expect.objectContaining({
        headers: { authorization: 'Bearer fixture-token' },
      }),
    );
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      VERIFY_URL,
      expect.objectContaining({
        body: JSON.stringify({
          kind: 'batch-minutes-evidence',
          tenantId: TENANT,
          batchId: BATCH,
          signatureRef: SIGNATURE_REF,
          documentId: DOCUMENT,
          contentHash: CONTENT_HASH,
          snapshotHash: SNAPSHOT_HASH,
          expectedSignerPersonId: CHAIR,
        }),
      }),
    );
  });

  for (const [name, expectedCode, alteredReceipt] of [
    [
      'tenant',
      'RAIT.SIGNATURE_FAILED',
      { ...receipt, tenantId: '00000000-0000-7000-8000-00000000a002' },
    ],
    [
      'lote',
      'RAIT.SIGNATURE_FAILED',
      { ...receipt, batchId: '00000000-0000-7000-8000-000028000002' },
    ],
    [
      'documento',
      'RAIT.SIGNATURE_FAILED',
      { ...receipt, documentId: '00000000-0000-7000-8000-000012000002' },
    ],
    [
      'hash do conteúdo',
      'RAIT.SIGNATURE_FAILED',
      { ...receipt, contentHash: 'c'.repeat(64) },
    ],
    [
      'hash do snapshot',
      'RAIT.BATCH_SEED_TAMPERED',
      { ...receipt, snapshotHash: 'd'.repeat(64) },
    ],
    [
      'espécie',
      'RAIT.SIGNATURE_FAILED',
      { ...receipt, documentKind: 'DECISAO_DEFESA' },
    ],
    [
      'signatário',
      'RAIT.SIGNATURE_CERT_MISMATCH',
      { ...receipt, signerPersonId: '00000000-0000-4000-8000-0000b0000018' },
    ],
    [
      'certificado',
      'RAIT.SIGNATURE_CERT_MISMATCH',
      { ...receipt, certificateValidationStatus: 'REVOKED' },
    ],
    [
      'TSA',
      'RAIT.SIGNATURE_FAILED',
      { ...receipt, tsaAt: '', tsaValidationStatus: 'INVALID' },
    ],
  ] as const) {
    it(`dado recibo com ${name} divergente quando a ata é verificada então ${expectedCode}`, async () => {
      vi.stubGlobal('fetch', trustFetch(alteredReceipt));

      await expect(
        (await adapter()).verifyBatchMinutesEvidence({
          tenantId: TENANT,
          batchId: BATCH,
          signatureRef: SIGNATURE_REF,
          documentId: DOCUMENT,
          contentHash: CONTENT_HASH,
          snapshotHash: SNAPSHOT_HASH,
          expectedSignerPersonId: CHAIR,
        }),
      ).rejects.toMatchObject({ code: expectedCode });
    });
  }
});
