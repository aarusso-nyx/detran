// R-0022 CTG-0006 §4 — caracterização da confiança documental pela porta DETRAN
// (S-04, S-05, S-08, S-09). Válida antes e depois da migração para
// `@stynx-nyx/signature`: só negativos (rejeição, ausência de resultado e de
// segredo, código DETRAN onde S-08 fixa) e a superfície pública; nenhum caso
// importa o pacote STYNX nem afirma texto de mensagem ou ordem de chamadas HTTP
// do mecanismo que sai.
import { afterEach, describe, expect, it, vi } from 'vitest';

import { DocumentTrustVerifier } from './document-trust.js';
import { DocumentTrustHttpAdapter } from './document-trust.http-adapter.js';

const TOKEN = 'fixture-document-token';
const TENANT = '00000000-0000-7000-8000-00000000a001';
const OTHER_TENANT = 'fixture-other-tenant';
const BATCH = '00000000-0000-7000-8000-000028000001';
const SESSION = '00000000-0000-7000-8000-000030000003';
const MINUTES = '00000000-0000-7000-8000-000034000001';
const DOCUMENT = '00000000-0000-7000-8000-000012000001';
const CHAIR = '00000000-0000-4000-8000-0000b0000011';
const RAPPORTEUR = '00000000-0000-4000-8000-0000b0000012';
const CASE = 'fixture-rait-case';
const PARTY = 'fixture-withdrawal-party';
const CONTENT_HASH = 'a'.repeat(64);
const SNAPSHOT_HASH = 'b'.repeat(64);
const MANIFEST_HASH = 'c'.repeat(64);
const SIGNATURE_REF = 'fixture-signature-reference';

const RAIT_CODES = [
  'RAIT.SIGNATURE_FAILED',
  'RAIT.SIGNATURE_CERT_MISMATCH',
  'RAIT.BATCH_SEED_TAMPERED',
];

const keys = [
  'DETRAN_DOCUMENT_TRUST_HEALTH_URL',
  'DETRAN_DOCUMENT_TRUST_TOKEN',
  'DETRAN_DOCUMENT_TRUST_URL',
  'DETRAN_RUNTIME_PROFILE',
] as const;
const original = Object.fromEntries(keys.map((key) => [key, process.env[key]]));

function configure(profile = 'production'): void {
  process.env.DETRAN_RUNTIME_PROFILE = profile;
  process.env.DETRAN_DOCUMENT_TRUST_URL = 'https://trust.fixture.test/verify';
  process.env.DETRAN_DOCUMENT_TRUST_HEALTH_URL =
    'https://trust.fixture.test/health';
  process.env.DETRAN_DOCUMENT_TRUST_TOKEN = TOKEN;
}

function response(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: vi.fn(async () => body),
  } as unknown as Response;
}

/** Health completo, seguido da resposta de verificação sob teste. */
function stubTrust(verification: unknown, health: unknown = capabilities) {
  const fetch = vi
    .fn()
    .mockImplementation(async (url: string) =>
      response(url.includes('health') ? health : verification),
    );
  vi.stubGlobal('fetch', fetch);
  return fetch;
}

function statusOf(error: unknown): unknown {
  const candidate = error as { getStatus?: () => number; status?: number };
  return typeof candidate.getStatus === 'function'
    ? candidate.getStatus()
    : candidate.status;
}

function isDetranError(error: unknown): boolean {
  const code = (error as { code?: unknown } | null)?.code;
  return (
    error instanceof Error &&
    typeof code === 'string' &&
    code.startsWith('RAIT.')
  );
}

async function rejection(work: () => Promise<unknown>): Promise<unknown> {
  let resolved: unknown;
  const error = await work().then(
    (value: unknown) => {
      resolved = value;
      return undefined;
    },
    (caught: unknown) => caught,
  );
  expect(resolved).toBeUndefined();
  expect(error).toBeInstanceOf(Error);
  const serialized = `${JSON.stringify(error)} ${String((error as Error).message)}`;
  expect(serialized).not.toContain(TOKEN);
  return error;
}

/** C-06-05/08: rejeição; se DetranError, código e status do conjunto S-08. */
async function expectRaitRejection(
  work: () => Promise<unknown>,
  allowed: readonly string[] = RAIT_CODES,
): Promise<void> {
  const error = await rejection(work);
  const serialized = `${JSON.stringify(error)} ${String((error as Error).message)}`;
  expect(serialized).not.toContain(CONTENT_HASH);
  expect(serialized).not.toContain(SNAPSHOT_HASH);
  if (isDetranError(error)) {
    expect(allowed).toContain((error as { code: string }).code);
    expect([502, 422]).toContain(statusOf(error));
  }
}

afterEach(() => {
  vi.unstubAllGlobals();
  for (const key of keys) {
    const value = original[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

const capabilities = {
  documentManifest: true,
  padesLt: true,
  tsa: true,
  withdrawalEvidence: true,
  batchDistributionMinutes: true,
  sessionMinutes: true,
  multipleReceipts: true,
  recoverableManifest: true,
  certificateValidation: ['OCSP'],
};

const signatureInput = {
  tenantId: TENANT,
  signatureRef: SIGNATURE_REF,
  documentId: DOCUMENT,
  contentHash: CONTENT_HASH,
  expectedSignerPersonId: CHAIR,
};
const signatureEvidence = {
  signatureRef: SIGNATURE_REF,
  documentId: DOCUMENT,
  contentHash: CONTENT_HASH,
  signerPersonId: CHAIR,
  documentKind: 'DECISAO_DEFESA',
  padesLevel: 'PAdES-B-LT',
  tsaAt: '2026-09-27T12:00:00.000Z',
  certificateValidationSource: 'OCSP',
  certificateValidationStatus: 'GOOD',
  certificateValidatedAt: '2026-09-27T12:00:01.000Z',
};

const batchInput = {
  tenantId: TENANT,
  batchId: BATCH,
  signatureRef: SIGNATURE_REF,
  documentId: DOCUMENT,
  contentHash: CONTENT_HASH,
  snapshotHash: SNAPSHOT_HASH,
  expectedSignerPersonId: CHAIR,
};
const batchEvidence = {
  tenantId: TENANT,
  batchId: BATCH,
  signatureRef: SIGNATURE_REF,
  documentId: DOCUMENT,
  contentHash: CONTENT_HASH,
  snapshotHash: SNAPSHOT_HASH,
  documentKind: 'BATCH_DISTRIBUTION_MINUTES',
  signerPersonId: CHAIR,
  padesLevel: 'PAdES-B-LT',
  tsaAt: '2026-09-27T12:00:00.000Z',
  tsaValidationStatus: 'GOOD',
  certificateValidationSource: 'OCSP',
  certificateValidationStatus: 'GOOD',
  certificateValidatedAt: '2026-09-27T12:00:01.000Z',
};

const sessionInput = {
  tenantId: TENANT,
  sessionId: SESSION,
  minutesId: MINUTES,
  signatureRef: SIGNATURE_REF,
  documentId: DOCUMENT,
  contentHash: CONTENT_HASH,
  snapshotHash: SNAPSHOT_HASH,
  expectedSignerPersonId: CHAIR,
};
const sessionEvidence = {
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
  tsaAt: '2026-09-27T12:00:00.000Z',
  tsaValidationStatus: 'GOOD',
  certificateValidationSource: 'OCSP',
  certificateValidationStatus: 'GOOD',
  certificateValidatedAt: '2026-09-27T12:00:01.000Z',
};

const prepareSessionInput = {
  tenantId: TENANT,
  sessionId: SESSION,
  minutesId: MINUTES,
  snapshotHash: SNAPSHOT_HASH,
  snapshotVersion: 'session-minutes-v1' as const,
  requiredSignerPersonIds: [CHAIR, RAPPORTEUR],
  idempotencyKey: 'fixture-session-minutes-key',
};
const getSessionInput = {
  tenantId: TENANT,
  sessionId: SESSION,
  minutesId: MINUTES,
  snapshotHash: SNAPSHOT_HASH,
};
const sessionManifest = {
  tenantId: TENANT,
  aggregateId: SESSION,
  documentId: DOCUMENT,
  contentHash: CONTENT_HASH,
  snapshotHash: SNAPSHOT_HASH,
  manifestHash: MANIFEST_HASH,
  documentKind: 'SESSION_MINUTES',
  manifestVersion: 'session-minutes-v1',
  preparedAt: '2026-09-27T12:00:00.000Z',
};

const prepareBatchInput = {
  tenantId: TENANT,
  batchId: BATCH,
  snapshotHash: SNAPSHOT_HASH,
  snapshotVersion: 'draw-v1' as const,
  idempotencyKey: 'fixture-batch-minutes-key',
};
const getBatchInput = {
  tenantId: TENANT,
  batchId: BATCH,
  snapshotHash: SNAPSHOT_HASH,
};
const batchManifest = {
  ...sessionManifest,
  aggregateId: BATCH,
  documentKind: 'BATCH_DISTRIBUTION_MINUTES',
  manifestVersion: 'draw-v1',
};

const withdrawalInput = {
  tenantId: TENANT,
  caseId: CASE,
  documentId: DOCUMENT,
  contentHash: CONTENT_HASH,
  eligiblePartyIds: [PARTY],
};
const withdrawalEvidence = {
  tenantId: TENANT,
  caseId: CASE,
  documentId: DOCUMENT,
  contentHash: CONTENT_HASH,
  signerPartyId: PARTY,
  verificationMethod: 'digital_verified',
  evidenceRef: 'fixture-withdrawal-evidence',
  verifiedAt: '2026-09-27T12:00:00.000Z',
};

const draftInput = {
  tenantId: TENANT,
  documentId: DOCUMENT,
  contentHash: CONTENT_HASH,
};

const NINE_OPERATIONS = [
  'prepareSessionMinutesManifest',
  'getSessionMinutesManifest',
  'verifySessionMinutesEvidence',
  'prepareBatchMinutesManifest',
  'getBatchMinutesManifest',
  'verifyDraftManifest',
  'verifySignatureEvidence',
  'verifyBatchMinutesEvidence',
  'verifyWithdrawalEvidence',
] as const satisfies readonly (keyof DocumentTrustVerifier)[];

function invokeAll(
  adapter: DocumentTrustHttpAdapter,
): Array<[string, () => Promise<unknown>]> {
  return [
    [
      'prepareSessionMinutesManifest',
      () => adapter.prepareSessionMinutesManifest(prepareSessionInput),
    ],
    [
      'getSessionMinutesManifest',
      () => adapter.getSessionMinutesManifest(getSessionInput),
    ],
    [
      'verifySessionMinutesEvidence',
      () => adapter.verifySessionMinutesEvidence(sessionInput),
    ],
    [
      'prepareBatchMinutesManifest',
      () => adapter.prepareBatchMinutesManifest(prepareBatchInput),
    ],
    [
      'getBatchMinutesManifest',
      () => adapter.getBatchMinutesManifest(getBatchInput),
    ],
    ['verifyDraftManifest', () => adapter.verifyDraftManifest(draftInput)],
    [
      'verifySignatureEvidence',
      () => adapter.verifySignatureEvidence(signatureInput),
    ],
    [
      'verifyBatchMinutesEvidence',
      () => adapter.verifyBatchMinutesEvidence(batchInput),
    ],
    [
      'verifyWithdrawalEvidence',
      () => adapter.verifyWithdrawalEvidence(withdrawalInput),
    ],
  ];
}

describe('R-0022 CTG-0006 — confiança documental caracterizada pela porta DETRAN', () => {
  // C-06-04 (documental)
  for (const profile of ['staging-like', 'production'] as const) {
    for (const name of [
      'DETRAN_DOCUMENT_TRUST_URL',
      'DETRAN_DOCUMENT_TRUST_HEALTH_URL',
    ] as const) {
      it(`C-06-04 dado ${name} com http: em ${profile} quando cada uma das nove operações é chamada então rejeita sem nenhuma chamada a fetch`, async () => {
        configure(profile);
        process.env[name] = String(process.env[name]).replace(
          'https:',
          'http:',
        );
        const fetch = vi.fn().mockResolvedValue(response(capabilities));
        vi.stubGlobal('fetch', fetch);
        const adapter = new DocumentTrustHttpAdapter();

        const operations = invokeAll(adapter);
        expect(operations.map(([operation]) => operation)).toEqual([
          ...NINE_OPERATIONS,
        ]);
        for (const [, work] of operations) await rejection(work);
        await rejection(() => adapter.checkCapabilities());
        expect(fetch).not.toHaveBeenCalled();
      });
    }
  }

  // C-06-05
  it.each([
    [
      'documento',
      { ...signatureEvidence, documentId: 'fixture-other-document' },
    ],
    ['hash de conteúdo', { ...signatureEvidence, contentHash: 'd'.repeat(64) }],
    ['espécie', { ...signatureEvidence, documentKind: 'PARECER' }],
    ['signatário', { ...signatureEvidence, signerPersonId: RAPPORTEUR }],
    [
      'certificado',
      { ...signatureEvidence, certificateValidationStatus: 'REVOKED' },
    ],
    ['PAdES', { ...signatureEvidence, padesLevel: 'PAdES-B-LTA' }],
    ['TSA', { ...signatureEvidence, tsaAt: '' }],
    ['referência', { ...signatureEvidence, signatureRef: 'fixture-other-ref' }],
  ])(
    'C-06-05 dado evidência de decisão com %s divergente quando verifySignatureEvidence então rejeita sem resultado, com código RAIT do conjunto S-08',
    async (_name, evidence) => {
      configure();
      stubTrust(evidence);

      await expectRaitRejection(() =>
        new DocumentTrustHttpAdapter().verifySignatureEvidence(signatureInput),
      );
    },
  );

  // C-06-05
  it.each([
    ['tenant', { ...batchEvidence, tenantId: OTHER_TENANT }],
    ['lote', { ...batchEvidence, batchId: 'fixture-other-batch' }],
    ['documento', { ...batchEvidence, documentId: 'fixture-other-document' }],
    ['hash de conteúdo', { ...batchEvidence, contentHash: 'd'.repeat(64) }],
    ['hash do snapshot', { ...batchEvidence, snapshotHash: 'e'.repeat(64) }],
    ['espécie', { ...batchEvidence, documentKind: 'SESSION_MINUTES' }],
    ['signatário', { ...batchEvidence, signerPersonId: RAPPORTEUR }],
    [
      'certificado',
      { ...batchEvidence, certificateValidationStatus: 'REVOKED' },
    ],
    ['PAdES', { ...batchEvidence, padesLevel: 'PAdES-B-LTA' }],
    ['TSA', { ...batchEvidence, tsaAt: '' }],
  ])(
    'C-06-05 dado evidência de ata de lote com %s divergente quando verifyBatchMinutesEvidence então rejeita sem resultado, com código RAIT do conjunto S-08',
    async (_name, evidence) => {
      configure();
      stubTrust(evidence);

      await expectRaitRejection(() =>
        new DocumentTrustHttpAdapter().verifyBatchMinutesEvidence(batchInput),
      );
    },
  );

  // C-06-06
  it('C-06-06 dado a porta pública quando inspecionada então DocumentTrustHttpAdapter é DocumentTrustVerifier e expõe as nove operações distintas', () => {
    const adapter = new DocumentTrustHttpAdapter();

    expect(adapter).toBeInstanceOf(DocumentTrustVerifier);
    expect(new Set(NINE_OPERATIONS).size).toBe(9);
    for (const operation of NINE_OPERATIONS) {
      expect(adapter[operation]).toBeTypeOf('function');
    }
    expect(adapter.checkCapabilities).toBeTypeOf('function');
  });

  // C-06-06: cada capacidade só é exigida pelas operações que dela dependem.
  const capabilityCases: Array<
    [string, Record<string, unknown>, Array<'health' | 'batch' | 'session'>]
  > = [
    [
      'documentManifest falso',
      { ...capabilities, documentManifest: false },
      ['health'],
    ],
    [
      'documentManifest ausente',
      { ...capabilities, documentManifest: undefined },
      ['health'],
    ],
    [
      'padesLt falso',
      { ...capabilities, padesLt: false },
      ['health', 'batch', 'session'],
    ],
    [
      'padesLt ausente',
      { ...capabilities, padesLt: undefined },
      ['health', 'batch', 'session'],
    ],
    [
      'tsa falso',
      { ...capabilities, tsa: false },
      ['health', 'batch', 'session'],
    ],
    [
      'tsa ausente',
      { ...capabilities, tsa: undefined },
      ['health', 'batch', 'session'],
    ],
    [
      'withdrawalEvidence falso',
      { ...capabilities, withdrawalEvidence: false },
      ['health'],
    ],
    [
      'withdrawalEvidence ausente',
      { ...capabilities, withdrawalEvidence: undefined },
      ['health'],
    ],
    [
      'batchDistributionMinutes falso',
      { ...capabilities, batchDistributionMinutes: false },
      ['batch'],
    ],
    [
      'batchDistributionMinutes ausente',
      { ...capabilities, batchDistributionMinutes: undefined },
      ['batch'],
    ],
    [
      'sessionMinutes falso',
      { ...capabilities, sessionMinutes: false },
      ['session'],
    ],
    [
      'sessionMinutes ausente',
      { ...capabilities, sessionMinutes: undefined },
      ['session'],
    ],
    [
      'multipleReceipts falso',
      { ...capabilities, multipleReceipts: false },
      ['session'],
    ],
    [
      'multipleReceipts ausente',
      { ...capabilities, multipleReceipts: undefined },
      ['session'],
    ],
    [
      'recoverableManifest falso',
      { ...capabilities, recoverableManifest: false },
      ['session'],
    ],
    [
      'recoverableManifest ausente',
      { ...capabilities, recoverableManifest: undefined },
      ['session'],
    ],
    [
      'certificateValidation vazio',
      { ...capabilities, certificateValidation: [] },
      ['health', 'batch', 'session'],
    ],
  ];
  it.each(capabilityCases)(
    'C-06-06 dado health com %s quando a confiança é consultada então as operações que exigem a capacidade rejeitam sem resultado',
    async (_name, health, affected) => {
      configure();
      const adapter = new DocumentTrustHttpAdapter();

      if (affected.includes('health')) {
        stubTrust({}, health);
        await rejection(() => adapter.checkCapabilities());
      }
      if (affected.includes('batch')) {
        stubTrust(batchEvidence, health);
        await expectRaitRejection(() =>
          adapter.verifyBatchMinutesEvidence(batchInput),
        );
      }
      if (affected.includes('session')) {
        stubTrust(sessionEvidence, health);
        await expectRaitRejection(
          () => adapter.verifySessionMinutesEvidence(sessionInput),
          ['RAIT.SIGNATURE_FAILED'],
        );
      }
    },
  );

  // C-06-06
  it('C-06-06 dado health HTTP 503 quando a confiança é consultada então checkCapabilities e as atas rejeitam sem resultado', async () => {
    configure();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response({}, false, 503)));
    const adapter = new DocumentTrustHttpAdapter();

    await rejection(() => adapter.checkCapabilities());
    await expectRaitRejection(() =>
      adapter.verifyBatchMinutesEvidence(batchInput),
    );
    await expectRaitRejection(
      () => adapter.verifySessionMinutesEvidence(sessionInput),
      ['RAIT.SIGNATURE_FAILED'],
    );
  });

  // C-06-06
  it('C-06-06 dado fetch rejeitado quando a confiança é consultada então checkCapabilities e as atas rejeitam sem resultado', async () => {
    configure();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('fixture service unavailable')),
    );
    const adapter = new DocumentTrustHttpAdapter();

    await rejection(() => adapter.checkCapabilities());
    await expectRaitRejection(() =>
      adapter.verifyBatchMinutesEvidence(batchInput),
    );
    await expectRaitRejection(
      () => adapter.verifySessionMinutesEvidence(sessionInput),
      ['RAIT.SIGNATURE_FAILED'],
    );
  });

  // C-06-07
  const manifestTampering: Array<[string, Record<string, unknown>]> = [
    ['tenant divergente', { tenantId: OTHER_TENANT }],
    ['agregado divergente', { aggregateId: 'fixture-other-aggregate' }],
    ['snapshot divergente', { snapshotHash: 'e'.repeat(64) }],
    ['contentHash fora de 64 hex', { contentHash: 'not-a-hash' }],
    ['manifestHash fora de 64 hex', { manifestHash: 'F'.repeat(64) }],
    ['preparedAt vazio', { preparedAt: '' }],
  ];
  it.each([
    ...manifestTampering,
    ['espécie trocada', { documentKind: 'BATCH_DISTRIBUTION_MINUTES' }],
    [
      'manifestVersion diferente de session-minutes-v1',
      { manifestVersion: 'draw-v1' },
    ],
  ] as Array<[string, Record<string, unknown>]>)(
    'C-06-07 dado manifesto de ata de sessão com %s quando preparado ou recuperado então rejeita sem manifesto',
    async (_name, change) => {
      configure();
      const adapter = new DocumentTrustHttpAdapter();

      stubTrust({ ...sessionManifest, ...change });
      await expectRaitRejection(() =>
        adapter.prepareSessionMinutesManifest(prepareSessionInput),
      );
      stubTrust({ ...sessionManifest, ...change });
      await expectRaitRejection(() =>
        adapter.getSessionMinutesManifest(getSessionInput),
      );
    },
  );

  // C-06-07
  it.each([
    ...manifestTampering,
    ['espécie trocada', { documentKind: 'SESSION_MINUTES' }],
    ['manifestVersion vazia', { manifestVersion: '' }],
  ] as Array<[string, Record<string, unknown>]>)(
    'C-06-07 dado manifesto de ata de lote com %s quando preparado ou recuperado então rejeita sem manifesto',
    async (_name, change) => {
      configure();
      const adapter = new DocumentTrustHttpAdapter();

      stubTrust({ ...batchManifest, ...change });
      await expectRaitRejection(() =>
        adapter.prepareBatchMinutesManifest(prepareBatchInput),
      );
      stubTrust({ ...batchManifest, ...change });
      await expectRaitRejection(() =>
        adapter.getBatchMinutesManifest(getBatchInput),
      );
    },
  );

  // C-06-08
  it.each([
    ['sem signerPersonId', { ...sessionEvidence, signerPersonId: undefined }],
    [
      'com relator no lugar do presidente',
      { ...sessionEvidence, signerPersonId: RAPPORTEUR },
    ],
    ['sem tsaAt', { ...sessionEvidence, tsaAt: undefined }],
    [
      'com tsaValidationStatus diferente de GOOD',
      { ...sessionEvidence, tsaValidationStatus: 'REVOKED' },
    ],
    [
      'sem certificateValidatedAt',
      { ...sessionEvidence, certificateValidatedAt: undefined },
    ],
  ])(
    'C-06-08 dado evidência de ata de sessão %s quando verifySessionMinutesEvidence então rejeita sem resultado, com código RAIT do conjunto S-08',
    async (_name, evidence) => {
      configure();
      stubTrust(evidence);

      await expectRaitRejection(() =>
        new DocumentTrustHttpAdapter().verifySessionMinutesEvidence(
          sessionInput,
        ),
      );
    },
  );

  // C-06-08
  it('C-06-08 dado evidência de ata de lote com signatureRef vazio quando verifyBatchMinutesEvidence então rejeita sem resultado, com código RAIT do conjunto S-08', async () => {
    configure();
    stubTrust({ ...batchEvidence, signatureRef: '' });

    await expectRaitRejection(() =>
      new DocumentTrustHttpAdapter().verifyBatchMinutesEvidence(batchInput),
    );
  });

  // C-06-09
  it.each([
    [
      'documentId diferente',
      withdrawalInput,
      { ...withdrawalEvidence, documentId: 'fixture-other-document' },
    ],
    [
      'caseId diferente',
      withdrawalInput,
      { ...withdrawalEvidence, caseId: 'fixture-other-case' },
    ],
    [
      'contentHash diferente',
      withdrawalInput,
      { ...withdrawalEvidence, contentHash: 'd'.repeat(64) },
    ],
    [
      'tenantId diferente',
      withdrawalInput,
      { ...withdrawalEvidence, tenantId: OTHER_TENANT },
    ],
    [
      'signerPartyId fora de eligiblePartyIds',
      withdrawalInput,
      { ...withdrawalEvidence, signerPartyId: 'fixture-other-party' },
    ],
    [
      'eligiblePartyIds vazio',
      { ...withdrawalInput, eligiblePartyIds: [] },
      withdrawalEvidence,
    ],
    [
      'verificationMethod fora do conjunto',
      withdrawalInput,
      { ...withdrawalEvidence, verificationMethod: 'self_declared' },
    ],
    [
      'evidenceRef vazio',
      withdrawalInput,
      { ...withdrawalEvidence, evidenceRef: '' },
    ],
  ])(
    'C-06-09 dado evidência de retirada com %s quando verifyWithdrawalEvidence então rejeita sem VerifiedWithdrawalEvidence',
    async (_name, input, evidence) => {
      configure();
      stubTrust(evidence);

      await expectRaitRejection(
        () => new DocumentTrustHttpAdapter().verifyWithdrawalEvidence(input),
        ['RAIT.SIGNATURE_FAILED'],
      );
    },
  );

  // C-06-10 (documental)
  for (const padesLevel of ['PAdES-B-B', 'PAdES-B-T'] as const) {
    it(`C-06-10 dado evidência com padesLevel ${padesLevel} quando decisão, ata de lote ou ata de sessão é verificada então rejeita sem resultado`, async () => {
      configure();
      const adapter = new DocumentTrustHttpAdapter();

      stubTrust({ ...signatureEvidence, padesLevel });
      await expectRaitRejection(() =>
        adapter.verifySignatureEvidence(signatureInput),
      );
      stubTrust({ ...batchEvidence, padesLevel });
      await expectRaitRejection(() =>
        adapter.verifyBatchMinutesEvidence(batchInput),
      );
      stubTrust({ ...sessionEvidence, padesLevel });
      await expectRaitRejection(() =>
        adapter.verifySessionMinutesEvidence(sessionInput),
      );
    });
  }
});
