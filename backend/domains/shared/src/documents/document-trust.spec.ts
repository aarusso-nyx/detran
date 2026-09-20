import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const TENANT = '00000000-0000-7000-8000-00000000a001';
const DOCUMENT = '00000000-0000-7000-8000-000012000001';
const SIGNER = '00000000-0000-4000-8000-0000b0000006';
const HASH = 'a'.repeat(64);

type TrustAdapter = {
  checkCapabilities(): Promise<void>;
  verifyDraftManifest(input: {
    tenantId: string;
    documentId: string;
    contentHash: string;
  }): Promise<Record<string, unknown>>;
  verifySignatureEvidence(input: {
    tenantId: string;
    signatureRef: string;
    documentId: string;
    contentHash: string;
    expectedSignerPersonId: string;
  }): Promise<Record<string, unknown>>;
  verifyWithdrawalEvidence?: (input: {
    tenantId: string;
    caseId: string;
    documentId: string;
    contentHash: string;
    eligiblePartyIds: readonly string[];
  }) => Promise<Record<string, unknown>>;
};

async function adapter(): Promise<TrustAdapter> {
  const modulePath = new URL(
    './document-trust.http-adapter.ts',
    import.meta.url,
  ).href;
  const module = (await import(modulePath)) as {
    DocumentTrustHttpAdapter: new () => TrustAdapter;
  };
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
  documentManifest: true,
  padesLt: true,
  tsa: true,
  withdrawalEvidence: true,
  certificateValidation: ['OCSP'],
};

const draftReceipt = {
  documentId: DOCUMENT,
  contentHash: HASH,
  kind: 'DECISAO_DEFESA',
  sections: ['fatos', 'fundamentos', 'dispositivo'],
};

const signatureReceipt = {
  signatureRef: 'opaque-signature-reference',
  documentId: DOCUMENT,
  contentHash: HASH,
  signerPersonId: SIGNER,
  documentKind: 'DECISAO_DEFESA',
  padesLevel: 'PAdES-B-LT',
  tsaAt: '2026-09-14T12:00:00.000Z',
  certificateValidationSource: 'OCSP',
  certificateValidationStatus: 'GOOD',
  certificateValidatedAt: '2026-09-14T12:00:00.000Z',
};

describe('CTG-0001 — DocumentTrustHttpAdapter fail-closed', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('DETRAN_DOCUMENT_TRUST_URL', 'http://trust.test/verify');
    vi.stubEnv('DETRAN_DOCUMENT_TRUST_HEALTH_URL', 'http://trust.test/health');
    vi.stubEnv('DETRAN_DOCUMENT_TRUST_TOKEN', 'fixture-token');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('dado o contrato compartilhado quando carregado então DocumentTrustVerifier é token runtime concreto', async () => {
    const contractPath = new URL('./document-trust.ts', import.meta.url).href;
    const contract = (await import(contractPath)) as Record<string, unknown>;
    expect(contract.DocumentTrustVerifier).toBeTypeOf('function');
  });

  it('dado configuração ausente quando a capacidade é consultada então falha fechado', async () => {
    vi.stubEnv('DETRAN_DOCUMENT_TRUST_TOKEN', '');
    await expect((await adapter()).checkCapabilities()).rejects.toBeDefined();
  });

  it('dado perfil production quando o endpoint não usa HTTPS então falha fechado antes da chamada', async () => {
    vi.stubEnv('DETRAN_RUNTIME_PROFILE', 'production');
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    await expect((await adapter()).checkCapabilities()).rejects.toBeDefined();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('dado capabilities completas quando readiness é consultado então exige manifesto, PAdES-B-LT, TSA e OCSP ou CRL', async () => {
    const fetch = vi.fn(async () => response(capabilities));
    vi.stubGlobal('fetch', fetch);
    await expect(
      (await adapter()).checkCapabilities(),
    ).resolves.toBeUndefined();
    expect(fetch).toHaveBeenCalledWith(
      'http://trust.test/health',
      expect.objectContaining({
        headers: { authorization: 'Bearer fixture-token' },
        signal: expect.any(AbortSignal),
      }),
    );
  });

  for (const [field, value] of [
    ['documentManifest', false],
    ['padesLt', false],
    ['tsa', false],
    ['withdrawalEvidence', false],
    ['certificateValidation', []],
  ] as const) {
    it(`dado capability ${field} ausente quando readiness é consultado então falha fechado`, async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => response({ ...capabilities, [field]: value })),
      );
      await expect((await adapter()).checkCapabilities()).rejects.toBeDefined();
    });
  }

  it('dado timeout ou HTTP não 2xx quando o substrato é consultado então a indisponibilidade não vira sucesso', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => response({}, false, 503)),
    );
    await expect((await adapter()).checkCapabilities()).rejects.toBeDefined();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Promise.reject(new Error('timeout'))),
    );
    await expect(
      (await adapter()).verifyDraftManifest({
        tenantId: TENANT,
        documentId: DOCUMENT,
        contentHash: HASH,
      }),
    ).rejects.toBeDefined();
  });

  it('dado manifesto literal completo quando a minuta é verificada então devolve somente o recibo vinculado', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => response(draftReceipt)),
    );
    await expect(
      (await adapter()).verifyDraftManifest({
        tenantId: TENANT,
        documentId: DOCUMENT,
        contentHash: HASH,
      }),
    ).resolves.toEqual(draftReceipt);
  });

  for (const receipt of [
    { ...draftReceipt, documentId: 'outro-documento' },
    { ...draftReceipt, contentHash: 'b'.repeat(64) },
    { ...draftReceipt, kind: 'OUTRO' },
    { ...draftReceipt, sections: ['fatos', 'dispositivo'] },
  ]) {
    it('dado manifesto divergente quando a minuta é verificada então retorna RAIT.SIGNATURE_FAILED sem conteúdo sensível', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => response(receipt)),
      );
      const error = await (
        await adapter()
      )
        .verifyDraftManifest({
          tenantId: TENANT,
          documentId: DOCUMENT,
          contentHash: HASH,
        })
        .then(
          () => undefined,
          (caught: unknown) => caught as Record<string, unknown>,
        );
      expect(error).toMatchObject({ code: 'RAIT.SIGNATURE_FAILED' });
      expect(JSON.stringify(error)).not.toContain(HASH);
    });
  }

  it('dado recibo PAdES-B-LT completo quando a assinatura é verificada então vincula documento, hash, ator, TSA e certificado', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => response(signatureReceipt)),
    );
    await expect(
      (await adapter()).verifySignatureEvidence({
        tenantId: TENANT,
        signatureRef: 'opaque-signature-reference',
        documentId: DOCUMENT,
        contentHash: HASH,
        expectedSignerPersonId: SIGNER,
      }),
    ).resolves.toEqual(signatureReceipt);
  });

  it('dado signatário ou validação de certificado divergente quando a assinatura é verificada então retorna RAIT.SIGNATURE_CERT_MISMATCH', async () => {
    for (const receipt of [
      { ...signatureReceipt, signerPersonId: ACTOR_DIFFERENT },
      { ...signatureReceipt, certificateValidationStatus: 'REVOKED' },
    ]) {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => response(receipt)),
      );
      await expect(
        (await adapter()).verifySignatureEvidence({
          tenantId: TENANT,
          signatureRef: 'opaque-signature-reference',
          documentId: DOCUMENT,
          contentHash: HASH,
          expectedSignerPersonId: SIGNER,
        }),
      ).rejects.toMatchObject({ code: 'RAIT.SIGNATURE_CERT_MISMATCH' });
    }
  });

  it('dado recibo com documento, hash, tipo, PAdES ou TSA divergente quando verificado então retorna RAIT.SIGNATURE_FAILED', async () => {
    for (const receipt of [
      { ...signatureReceipt, documentId: 'outro-documento' },
      { ...signatureReceipt, contentHash: 'b'.repeat(64) },
      { ...signatureReceipt, documentKind: 'OUTRO' },
      { ...signatureReceipt, padesLevel: 'PAdES-B-B' },
      { ...signatureReceipt, tsaAt: '' },
    ]) {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => response(receipt)),
      );
      await expect(
        (await adapter()).verifySignatureEvidence({
          tenantId: TENANT,
          signatureRef: 'opaque-signature-reference',
          documentId: DOCUMENT,
          contentHash: HASH,
          expectedSignerPersonId: SIGNER,
        }),
      ).rejects.toMatchObject({ code: 'RAIT.SIGNATURE_FAILED' });
    }
  });

  it('dado termo físico ou digital quando a desistência é verificada então capability e recibo vinculam tenant, caso, documento, hash e parte elegível', async () => {
    const caseId = '00000000-0000-7000-8000-000010000007';
    const partyId = '00000000-0000-7000-8000-000011000007';
    const receipt = {
      tenantId: TENANT,
      caseId,
      documentId: DOCUMENT,
      contentHash: HASH,
      signerPartyId: partyId,
      verificationMethod: 'physical_verified',
      evidenceRef: 'opaque-withdrawal-evidence',
      verifiedAt: '2026-09-15T12:00:00.000Z',
    };
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(response(capabilities))
        .mockResolvedValueOnce(response(receipt)),
    );
    const subject = await adapter();
    expect(subject.verifyWithdrawalEvidence).toBeTypeOf('function');
    await expect(
      subject.verifyWithdrawalEvidence?.({
        tenantId: TENANT,
        caseId,
        documentId: DOCUMENT,
        contentHash: HASH,
        eligiblePartyIds: [partyId],
      }),
    ).resolves.toEqual(receipt);
  });
});

const ACTOR_DIFFERENT = '00000000-0000-4000-8000-0000b0000099';
