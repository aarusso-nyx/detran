// R-0022 CTG-0006 §5.2 (M-06-P) e Adenda A §A.1/§A.5 — paridade da confiança
// documental depois da troca para `@stynx-nyx/signature` 1.5.x (TASK-0021,
// parte 1). Estes casos só valem depois de TASK-0009 parte B: o protocolo de
// recibo HTTP sai (§1.2, M-06-02) e `DocumentTrustHttpAdapter` construído sem
// argumentos, sem as dependências injetadas pela composição (OD-R22-13 (a)),
// rejeita toda operação migrada (§A.5: "fail-closed; não é fallback").
// `verifyDraftManifest` fica fora: S-09 mantém a minuta como está.
//
// Nenhum caso afirma texto de mensagem. Negativos afirmam rejeição, ausência de
// resultado, ausência de segredo e, se `DetranError`, o conjunto de códigos S-08.
import { afterEach, describe, expect, it, vi } from 'vitest';

import { DocumentTrustHttpAdapter } from './document-trust.http-adapter.js';

const TOKEN = 'fixture-document-token';
const TENANT = '00000000-0000-7000-8000-00000000a001';
const BATCH = '00000000-0000-7000-8000-000028000001';
const SESSION = '00000000-0000-7000-8000-000030000003';
const MINUTES = '00000000-0000-7000-8000-000034000001';
const DOCUMENT = '00000000-0000-7000-8000-000012000001';
const CHAIR = '00000000-0000-4000-8000-0000b0000011';
const CASE = 'fixture-rait-case';
const PARTY = 'fixture-withdrawal-party';
const CONTENT_HASH = 'a'.repeat(64);
const SNAPSHOT_HASH = 'b'.repeat(64);
const MANIFEST_HASH = 'c'.repeat(64);
const SIGNATURE_REF = 'fixture-signature-reference';
const INSTANT = '2026-09-15T12:00:00.000Z';

const RAIT_CODES = [
  'RAIT.SIGNATURE_FAILED',
  'RAIT.SIGNATURE_CERT_MISMATCH',
  'RAIT.BATCH_SEED_TAMPERED',
];

/** Discriminadores do protocolo de recibo que sai (CTG-0006 §1.2, M-06-02). */
const RECEIPT_KINDS = [
  'signature-evidence',
  'batch-minutes-evidence',
  'session-minutes-evidence',
  'withdrawal-evidence',
  'session-minutes-manifest',
  'get-session-minutes-manifest',
  'prepare-batch-minutes-manifest',
  'get-batch-minutes-manifest',
];

const keys = [
  'DETRAN_DOCUMENT_TRUST_HEALTH_URL',
  'DETRAN_DOCUMENT_TRUST_TOKEN',
  'DETRAN_DOCUMENT_TRUST_URL',
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

/** Portão S-05 satisfeito (OD-R22-68 (a): as variáveis seguem como portão). */
function configure(profile: string): void {
  process.env.DETRAN_RUNTIME_PROFILE = profile;
  process.env.DETRAN_DOCUMENT_TRUST_URL = 'https://trust.fixture.test/verify';
  process.env.DETRAN_DOCUMENT_TRUST_HEALTH_URL =
    'https://trust.fixture.test/health';
  process.env.DETRAN_DOCUMENT_TRUST_TOKEN = TOKEN;
}

function response(body: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: vi.fn(async () => body),
  } as unknown as Response;
}

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

/**
 * Serviço de recibo que responde com saúde completa e com o recibo completo e
 * coerente de cada discriminador, exatamente o que hoje produz resultado
 * positivo. Depois da troca, nenhum desses recibos pode produzir resultado.
 */
function stubCompleteReceiptService() {
  const fetch = vi.fn(async (url: string, init?: RequestInit) => {
    if (url.includes('health')) return response(capabilities);
    const body = JSON.parse(String(init?.body ?? '{}')) as Record<
      string,
      unknown
    >;
    return response(receiptFor(body));
  });
  vi.stubGlobal('fetch', fetch);
  return fetch;
}

function receiptFor(body: Record<string, unknown>): Record<string, unknown> {
  const certificate = {
    certificateValidationSource: 'OCSP',
    certificateValidationStatus: 'GOOD',
    certificateValidatedAt: INSTANT,
  };
  switch (body.kind) {
    case 'session-minutes-manifest':
    case 'get-session-minutes-manifest':
      return {
        tenantId: body.tenantId,
        aggregateId: body.sessionId,
        documentId: DOCUMENT,
        contentHash: CONTENT_HASH,
        snapshotHash: body.snapshotHash,
        manifestHash: MANIFEST_HASH,
        documentKind: 'SESSION_MINUTES',
        manifestVersion: 'session-minutes-v1',
        preparedAt: INSTANT,
      };
    case 'prepare-batch-minutes-manifest':
    case 'get-batch-minutes-manifest':
      return {
        tenantId: body.tenantId,
        aggregateId: body.batchId,
        documentId: DOCUMENT,
        contentHash: CONTENT_HASH,
        snapshotHash: body.snapshotHash,
        manifestHash: MANIFEST_HASH,
        documentKind: 'BATCH_DISTRIBUTION_MINUTES',
        manifestVersion: 'draw-v1',
        preparedAt: INSTANT,
      };
    case 'session-minutes-evidence':
      return {
        tenantId: body.tenantId,
        sessionId: body.sessionId,
        minutesId: body.minutesId,
        signatureRef: body.signatureRef,
        documentId: body.documentId,
        contentHash: body.contentHash,
        snapshotHash: body.snapshotHash,
        documentKind: 'SESSION_MINUTES',
        signerPersonId: body.expectedSignerPersonId,
        padesLevel: 'PAdES-B-LT',
        tsaAt: INSTANT,
        tsaValidationStatus: 'GOOD',
        ...certificate,
      };
    case 'batch-minutes-evidence':
      return {
        tenantId: body.tenantId,
        batchId: body.batchId,
        signatureRef: body.signatureRef,
        documentId: body.documentId,
        contentHash: body.contentHash,
        snapshotHash: body.snapshotHash,
        documentKind: 'BATCH_DISTRIBUTION_MINUTES',
        signerPersonId: body.expectedSignerPersonId,
        padesLevel: 'PAdES-B-LT',
        tsaAt: INSTANT,
        tsaValidationStatus: 'GOOD',
        ...certificate,
      };
    case 'withdrawal-evidence':
      return {
        tenantId: body.tenantId,
        caseId: body.caseId,
        documentId: body.documentId,
        contentHash: body.contentHash,
        signerPartyId: PARTY,
        verificationMethod: 'digital_verified',
        evidenceRef: 'fixture-withdrawal-evidence',
        verifiedAt: INSTANT,
      };
    default:
      return {
        signatureRef: body.signatureRef,
        documentId: body.documentId,
        contentHash: body.contentHash,
        signerPersonId: body.expectedSignerPersonId,
        documentKind: 'DECISAO_DEFESA',
        padesLevel: 'PAdES-B-LT',
        tsaAt: INSTANT,
        ...certificate,
      };
  }
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

/**
 * Rejeição sem resultado, sem token e sem hash de entrada; se `DetranError`,
 * código e status do conjunto S-08; e nenhum pedido do protocolo de recibo.
 */
async function expectFailClosedWithoutReceiptProtocol(
  fetch: ReturnType<typeof stubCompleteReceiptService>,
  work: () => Promise<unknown>,
): Promise<void> {
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
  expect(serialized).not.toContain(CONTENT_HASH);
  expect(serialized).not.toContain(SNAPSHOT_HASH);
  if (isDetranError(error)) {
    expect(RAIT_CODES).toContain((error as { code: string }).code);
    expect([502, 422]).toContain(statusOf(error));
  }
  const receiptRequests = fetch.mock.calls.filter(([, init]) => {
    const body = (init as RequestInit | undefined)?.body;
    if (typeof body !== 'string') return false;
    const kind = (JSON.parse(body) as { kind?: unknown }).kind;
    return RECEIPT_KINDS.includes(String(kind));
  });
  expect(receiptRequests).toEqual([]);
}

type Operation = {
  id: string;
  name: string;
  run: (adapter: DocumentTrustHttpAdapter) => Promise<unknown>;
};

const operations: Operation[] = [
  {
    id: 'M-06-P2',
    name: 'checkCapabilities',
    run: (adapter) => adapter.checkCapabilities(),
  },
  {
    id: 'M-06-P3',
    name: 'prepareSessionMinutesManifest',
    run: (adapter) =>
      adapter.prepareSessionMinutesManifest({
        tenantId: TENANT,
        sessionId: SESSION,
        minutesId: MINUTES,
        snapshotHash: SNAPSHOT_HASH,
        snapshotVersion: 'session-minutes-v1',
        requiredSignerPersonIds: [CHAIR],
        idempotencyKey: 'fixture-session-minutes-idempotency',
      }),
  },
  {
    id: 'M-06-P3',
    name: 'getSessionMinutesManifest',
    run: (adapter) =>
      adapter.getSessionMinutesManifest({
        tenantId: TENANT,
        sessionId: SESSION,
        minutesId: MINUTES,
        snapshotHash: SNAPSHOT_HASH,
      }),
  },
  {
    id: 'M-06-P3',
    name: 'verifySessionMinutesEvidence',
    run: (adapter) =>
      adapter.verifySessionMinutesEvidence({
        tenantId: TENANT,
        sessionId: SESSION,
        minutesId: MINUTES,
        signatureRef: SIGNATURE_REF,
        documentId: DOCUMENT,
        contentHash: CONTENT_HASH,
        snapshotHash: SNAPSHOT_HASH,
        expectedSignerPersonId: CHAIR,
      }),
  },
  {
    id: 'M-06-P3',
    name: 'prepareBatchMinutesManifest',
    run: (adapter) =>
      adapter.prepareBatchMinutesManifest({
        tenantId: TENANT,
        batchId: BATCH,
        snapshotHash: SNAPSHOT_HASH,
        snapshotVersion: 'draw-v1',
        idempotencyKey: 'fixture-batch-minutes-idempotency',
      }),
  },
  {
    id: 'M-06-P3',
    name: 'getBatchMinutesManifest',
    run: (adapter) =>
      adapter.getBatchMinutesManifest({
        tenantId: TENANT,
        batchId: BATCH,
        snapshotHash: SNAPSHOT_HASH,
      }),
  },
  {
    id: 'M-06-P4',
    name: 'verifySignatureEvidence',
    run: (adapter) =>
      adapter.verifySignatureEvidence({
        tenantId: TENANT,
        signatureRef: SIGNATURE_REF,
        documentId: DOCUMENT,
        contentHash: CONTENT_HASH,
        expectedSignerPersonId: CHAIR,
      }),
  },
  {
    id: 'M-06-P4',
    name: 'verifyBatchMinutesEvidence',
    run: (adapter) =>
      adapter.verifyBatchMinutesEvidence({
        tenantId: TENANT,
        batchId: BATCH,
        signatureRef: SIGNATURE_REF,
        documentId: DOCUMENT,
        contentHash: CONTENT_HASH,
        snapshotHash: SNAPSHOT_HASH,
        expectedSignerPersonId: CHAIR,
      }),
  },
  {
    id: 'M-06-P5',
    name: 'verifyWithdrawalEvidence',
    run: (adapter) =>
      adapter.verifyWithdrawalEvidence({
        tenantId: TENANT,
        caseId: CASE,
        documentId: DOCUMENT,
        contentHash: CONTENT_HASH,
        eligiblePartyIds: [PARTY],
      }),
  },
];

describe('R-0022 CTG-0006 M-06-P — confiança documental sem injeção (fail-closed, §A.5)', () => {
  for (const profile of ['test', 'production'] as const) {
    for (const operation of operations) {
      it(`${operation.id} dado DocumentTrustHttpAdapter construído sem argumentos em ${profile} e serviço de recibo que devolve recibo completo quando ${operation.name} é chamado então rejeita sem resultado e sem usar o protocolo de recibo`, async () => {
        configure(profile);
        const fetch = stubCompleteReceiptService();

        await expectFailClosedWithoutReceiptProtocol(fetch, () =>
          operation.run(new DocumentTrustHttpAdapter()),
        );
      });
    }
  }
});
