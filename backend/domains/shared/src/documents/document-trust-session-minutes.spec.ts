import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const TENANT = '00000000-0000-7000-8000-00000000a001';
const SESSION = '00000000-0000-7000-8000-000030000003';
const MINUTES = '00000000-0000-7000-8000-000034000001';
const DOCUMENT = '00000000-0000-7000-8000-000012000049';
const CHAIR = '00000000-0000-4000-8000-0000b0000011';
const RAPPORTEUR = '00000000-0000-4000-8000-0000b0000012';
const CONTENT_HASH = 'a'.repeat(64);
const SNAPSHOT_HASH = 'b'.repeat(64);
const MANIFEST_HASH = 'c'.repeat(64);
const SIGNATURE_REF = 'opaque-session-minutes-signature-reference';
const HEALTH_URL = 'http://trust.test/health';
const VERIFY_URL = 'http://trust.test/verify';

type SessionMinutesPort = {
  prepareSessionMinutesManifest(input: {
    tenantId: string;
    sessionId: string;
    minutesId: string;
    snapshotHash: string;
    snapshotVersion: 'session-minutes-v1';
    requiredSignerPersonIds: readonly string[];
    idempotencyKey: string;
  }): Promise<Record<string, unknown>>;
  getSessionMinutesManifest(input: {
    tenantId: string;
    sessionId: string;
    minutesId: string;
    snapshotHash: string;
  }): Promise<Record<string, unknown>>;
  verifySessionMinutesEvidence(input: {
    tenantId: string;
    sessionId: string;
    minutesId: string;
    signatureRef: string;
    documentId: string;
    contentHash: string;
    snapshotHash: string;
    expectedSignerPersonId: string;
  }): Promise<Record<string, unknown>>;
};

async function adapter(): Promise<SessionMinutesPort> {
  const module = (await import(
    new URL('./document-trust.http-adapter.ts', import.meta.url).href
  )) as { DocumentTrustHttpAdapter: new () => SessionMinutesPort };
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
  sessionMinutes: true,
  padesLt: true,
  tsa: true,
  certificateValidation: ['OCSP'],
  multipleReceipts: true,
  recoverableManifest: true,
};

const manifest = {
  tenantId: TENANT,
  aggregateId: SESSION,
  documentId: DOCUMENT,
  contentHash: CONTENT_HASH,
  snapshotHash: SNAPSHOT_HASH,
  manifestHash: MANIFEST_HASH,
  documentKind: 'SESSION_MINUTES',
  manifestVersion: 'session-minutes-v1',
  preparedAt: '2026-09-19T12:00:00.000Z',
};

const receipt = {
  tenantId: TENANT,
  sessionId: SESSION,
  minutesId: MINUTES,
  signatureRef: SIGNATURE_REF,
  documentId: DOCUMENT,
  contentHash: CONTENT_HASH,
  snapshotHash: SNAPSHOT_HASH,
  documentKind: 'SESSION_MINUTES',
  signerPersonId: CHAIR,
  padesLevel: 'PAdES-B-LT',
  tsaAt: '2026-09-19T12:01:00.000Z',
  tsaValidationStatus: 'GOOD',
  certificateValidationSource: 'OCSP',
  certificateValidationStatus: 'GOOD',
  certificateValidatedAt: '2026-09-19T12:01:01.000Z',
};

const prepareInput = {
  tenantId: TENANT,
  sessionId: SESSION,
  minutesId: MINUTES,
  snapshotHash: SNAPSHOT_HASH,
  snapshotVersion: 'session-minutes-v1' as const,
  requiredSignerPersonIds: [CHAIR, RAPPORTEUR],
  idempotencyKey: 'server-derived-session-minutes-key',
};

const verifyInput = {
  tenantId: TENANT,
  sessionId: SESSION,
  minutesId: MINUTES,
  signatureRef: SIGNATURE_REF,
  documentId: DOCUMENT,
  contentHash: CONTENT_HASH,
  snapshotHash: SNAPSHOT_HASH,
  expectedSignerPersonId: CHAIR,
};

describe('TASK-0049 — trust documental da ata de sessão', () => {
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

  it('dado a fronteira pública quando a ata SESSION_MINUTES é preparada, recuperada e verificada então expõe operações próprias, sem reutilizar DECISAO_DEFESA ou lote', async () => {
    const subject = await adapter();

    expect(subject.prepareSessionMinutesManifest).toBeTypeOf('function');
    expect(subject.getSessionMinutesManifest).toBeTypeOf('function');
    expect(subject.verifySessionMinutesEvidence).toBeTypeOf('function');
  });

  it('dado snapshot e conjunto de presidente mais relatores derivados no servidor quando a manifestação é preparada então envia somente a espécie SESSION_MINUTES e devolve os hashes vinculados', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(response(capabilities))
      .mockResolvedValueOnce(response(manifest));
    vi.stubGlobal('fetch', fetch);

    await expect(
      (await adapter()).prepareSessionMinutesManifest(prepareInput),
    ).resolves.toEqual(manifest);
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
          kind: 'session-minutes-manifest',
          ...prepareInput,
        }),
      }),
    );
  });

  it('dado o mesmo snapshot imutável quando a manifestação é recuperada então não prepara novo documento nem altera documento, conteúdo ou manifesto', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(response(capabilities))
      .mockResolvedValueOnce(response(manifest));
    vi.stubGlobal('fetch', fetch);

    await expect(
      (await adapter()).getSessionMinutesManifest({
        tenantId: TENANT,
        sessionId: SESSION,
        minutesId: MINUTES,
        snapshotHash: SNAPSHOT_HASH,
      }),
    ).resolves.toEqual(manifest);
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      VERIFY_URL,
      expect.objectContaining({
        body: JSON.stringify({
          kind: 'get-session-minutes-manifest',
          tenantId: TENANT,
          sessionId: SESSION,
          minutesId: MINUTES,
          snapshotHash: SNAPSHOT_HASH,
        }),
      }),
    );
  });

  it('dado recibo PAdES-B-LT válido do presidente quando a ata é verificada então confere tenant, sessão, ata, documento, hashes, TSA e OCSP ou CRL sem alegar criptografia real do fake', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(response(capabilities))
      .mockResolvedValueOnce(response(receipt));
    vi.stubGlobal('fetch', fetch);

    await expect(
      (await adapter()).verifySessionMinutesEvidence(verifyInput),
    ).resolves.toEqual(receipt);
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      VERIFY_URL,
      expect.objectContaining({
        body: JSON.stringify({
          kind: 'session-minutes-evidence',
          ...verifyInput,
        }),
      }),
    );
  });

  for (const [name, altered] of [
    [
      'sessão',
      { ...receipt, sessionId: '00000000-0000-7000-8000-000030000099' },
    ],
    ['ata', { ...receipt, minutesId: '00000000-0000-7000-8000-000034000099' }],
    [
      'documento',
      { ...receipt, documentId: '00000000-0000-7000-8000-000012000099' },
    ],
    ['hash de conteúdo', { ...receipt, contentHash: 'd'.repeat(64) }],
    ['hash do snapshot', { ...receipt, snapshotHash: 'e'.repeat(64) }],
    ['espécie', { ...receipt, documentKind: 'BATCH_DISTRIBUTION_MINUTES' }],
    ['signatário', { ...receipt, signerPersonId: RAPPORTEUR }],
    ['certificado', { ...receipt, certificateValidationStatus: 'REVOKED' }],
  ] as const) {
    it(`dado recibo com ${name} divergente quando a ata é verificada então RAIT.SIGNATURE_FAILED ou RAIT.SIGNATURE_CERT_MISMATCH`, async () => {
      const fetch = vi
        .fn()
        .mockResolvedValueOnce(response(capabilities))
        .mockResolvedValueOnce(response(altered));
      vi.stubGlobal('fetch', fetch);

      await expect(
        (await adapter()).verifySessionMinutesEvidence(verifyInput),
      ).rejects.toMatchObject({
        code: expect.stringMatching(
          /^RAIT\.SIGNATURE_(FAILED|CERT_MISMATCH)$/u,
        ),
      });
    });
  }
});
