import { createHash } from 'node:crypto';

import { describe, expect, it } from 'vitest';

const TENANT = '00000000-0000-7000-8000-00000000a001';
const BATCH = '00000000-0000-7000-8000-000028000001';
const CHAIR = '00000000-0000-4000-8000-0000b0000011';
const DOCUMENT = '00000000-0000-7000-8000-000012000001';
const CONTENT_HASH = 'a'.repeat(64);
const SIGNATURE_REF = 'opaque-batch-minutes-signature-reference';

type DrawSnapshot = {
  tenantId: string;
  batchId: string;
  judgingBody: 'jari';
  poolId: string;
  seed: string;
  algorithmVersion: 'draw-v1';
  orderedCaseIds: readonly string[];
  orderedEligibleMemberIdsByCase: Record<string, readonly string[]>;
  memberLoads: Record<string, number>;
  initialIndex: number;
  assignments: Record<string, string>;
  tieBreak: 'seeded-order-then-member-id';
};
type Manifest = {
  tenantId: string;
  batchId: string;
  documentId: string;
  contentHash: string;
  snapshotHash: string;
  documentKind: 'BATCH_DISTRIBUTION_MINUTES';
  expectedSignerPersonId: string;
  snapshotVersion: 'draw-v1';
};
type VerifiedReceipt = Manifest & {
  signerPersonId: string;
  padesLevel: 'PAdES-B-LT';
  tsaAt: string;
  certificateValidationSource: 'OCSP' | 'CRL';
  certificateValidationStatus: 'GOOD' | 'REVOKED';
  certificateValidatedAt: string;
};
type TrustFixture = Record<string, unknown> & {
  batchState: 'LOTE_SORTEADO';
  memberBound: true;
  batchVersion: number;
  manifest?: Manifest;
  drawSnapshot: DrawSnapshot;
  verifiedReceipt: VerifiedReceipt;
};

type Effects = { writes: string[]; events: string[]; audits: string[] };
type Runtime = {
  execute(input: Record<string, unknown>): Promise<{
    data: Record<string, unknown>;
    events: Array<{ type: string }>;
    etag: string;
  }>;
};

async function subject(fixture: Record<string, unknown>) {
  const effects: Effects = { writes: [], events: [], audits: [] };
  const module = (await import(
    new URL(
      '../../src/handwritten/rait-worklist-command.service.js',
      import.meta.url,
    ).href
  )) as {
    createWorklistCommandRuntime(input: {
      clock: { now(): Date };
      effects: Effects;
      fixture: Record<string, unknown>;
      transaction<T>(work: () => Promise<T>): Promise<T>;
    }): Runtime;
  };
  return {
    effects,
    runtime: module.createWorklistCommandRuntime({
      clock: { now: () => new Date('2026-09-14T12:00:00.000Z') },
      effects,
      fixture,
      transaction: async (work) => work(),
    }),
  };
}

function approveRequest(payload: Record<string, unknown> = {}) {
  return {
    command: 'approve-batch',
    targetId: BATCH,
    tenantId: TENANT,
    actorId: CHAIR,
    roles: ['rait-chair'],
    payload: { signedMinutesRef: SIGNATURE_REF, ...payload },
    headers: {
      'Idempotency-Key': 'ctg2-batch-minutes-approve',
      'If-Match': '"7"',
    },
  };
}

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, canonical(item)]),
    );
  }
  return value;
}

function canonicalSnapshotHash(snapshot: DrawSnapshot): string {
  return createHash('sha256')
    .update(JSON.stringify(canonical(snapshot)))
    .digest('hex');
}

function serverOwnedSnapshot(
  overrides: Partial<DrawSnapshot> = {},
): DrawSnapshot {
  const caseId = '00000000-0000-7000-8000-000010000018';
  const firstMember = '00000000-0000-7000-8000-000021000008';
  const secondMember = '00000000-0000-7000-8000-000021000009';
  return {
    tenantId: TENANT,
    batchId: BATCH,
    judgingBody: 'jari',
    poolId: '00000000-0000-7000-8000-000020000002',
    seed: 'server-owned-seed',
    algorithmVersion: 'draw-v1',
    orderedCaseIds: [caseId],
    orderedEligibleMemberIdsByCase: {
      [caseId]: [firstMember, secondMember],
    },
    memberLoads: { [firstMember]: 1, [secondMember]: 1 },
    initialIndex: 0,
    assignments: { [caseId]: firstMember },
    tieBreak: 'seeded-order-then-member-id',
    ...overrides,
  };
}

function validFixture(overrides: Partial<TrustFixture> = {}): TrustFixture {
  const drawSnapshot = overrides.drawSnapshot ?? serverOwnedSnapshot();
  const snapshotHash = canonicalSnapshotHash(drawSnapshot);
  const manifest: Manifest = {
    tenantId: TENANT,
    batchId: BATCH,
    documentId: DOCUMENT,
    contentHash: CONTENT_HASH,
    snapshotHash,
    documentKind: 'BATCH_DISTRIBUTION_MINUTES',
    expectedSignerPersonId: CHAIR,
    snapshotVersion: 'draw-v1',
    ...overrides.manifest,
  };
  const verifiedReceipt: VerifiedReceipt = {
    ...manifest,
    signerPersonId: CHAIR,
    padesLevel: 'PAdES-B-LT',
    tsaAt: '2026-09-14T12:00:00.000Z',
    certificateValidationSource: 'OCSP',
    certificateValidationStatus: 'GOOD',
    certificateValidatedAt: '2026-09-14T12:00:00.000Z',
    ...overrides.verifiedReceipt,
  };
  return {
    batchState: 'LOTE_SORTEADO',
    memberBound: true,
    batchVersion: 7,
    manifest,
    drawSnapshot,
    verifiedReceipt,
    ...overrides,
  };
}

function expectNoSuccessEffects(effects: Effects) {
  expect(effects.writes).toEqual([]);
  expect(effects.events).toEqual([]);
  expect(effects.audits).toEqual([]);
}

describe('CTG-0002 — homologação da ata de distribuição', () => {
  it('dado snapshot e manifestação canônicos quando approve-batch é executado então homologa sem mover o lote para LOTE_ACEITO', async () => {
    const fixture = validFixture();
    const { runtime, effects } = await subject(fixture);

    const result = await runtime.execute(approveRequest());

    expect(result.data).toMatchObject({
      state: 'LOTE_SORTEADO',
      minutes_document_id: DOCUMENT,
      homologated_by: CHAIR,
      snapshot_hash: canonicalSnapshotHash(fixture.drawSnapshot),
    });
    expect(result.events).toEqual(expect.any(Array));
    expect(effects.writes).toEqual(['HOMOLOGADO']);
  });

  for (const [name, fixture, payload, code] of [
    [
      'manifestação ausente',
      { ...validFixture(), manifest: undefined },
      {},
      'RAIT.SIGNATURE_FAILED',
    ],
    [
      'snapshot adulterado',
      validFixture({
        drawSnapshot: serverOwnedSnapshot({
          initialIndex: 1,
        }),
        manifest: {
          ...validFixture().manifest!,
        },
      }),
      {},
      'RAIT.BATCH_SEED_TAMPERED',
    ],
    [
      'ordem adulterada',
      validFixture({
        drawSnapshot: serverOwnedSnapshot({
          orderedCaseIds: ['00000000-0000-7000-8000-000010000019'],
        }),
        manifest: {
          ...validFixture().manifest!,
        },
      }),
      {},
      'RAIT.BATCH_SEED_TAMPERED',
    ],
    [
      'seed adulterada',
      validFixture({
        drawSnapshot: serverOwnedSnapshot({ seed: 'client-seed' }),
        manifest: {
          ...validFixture().manifest!,
        },
      }),
      {},
      'RAIT.BATCH_SEED_TAMPERED',
    ],
    [
      'serviço documental indisponível',
      { ...validFixture(), documentTrustUnavailable: true },
      {},
      'RAIT.SIGNATURE_FAILED',
    ],
    [
      'recibo de TSA inválido',
      {
        ...validFixture(),
        verifiedReceipt: {
          ...(validFixture().verifiedReceipt as Record<string, unknown>),
          tsaAt: '',
        },
      },
      {},
      'RAIT.SIGNATURE_FAILED',
    ],
    [
      'certificado revogado',
      {
        ...validFixture(),
        verifiedReceipt: {
          ...(validFixture().verifiedReceipt as Record<string, unknown>),
          certificateValidationStatus: 'REVOKED',
        },
      },
      {},
      'RAIT.SIGNATURE_CERT_MISMATCH',
    ],
    [
      'presidente divergente',
      {
        ...validFixture(),
        verifiedReceipt: {
          ...(validFixture().verifiedReceipt as Record<string, unknown>),
          signerPersonId: '00000000-0000-4000-8000-0000b0000018',
        },
      },
      {},
      'RAIT.SIGNATURE_CERT_MISMATCH',
    ],
    [
      'documento vindo do cliente',
      validFixture(),
      { documentId: DOCUMENT },
      'RAIT.VALIDATION_FAILED',
    ],
    [
      'hash vindo do cliente',
      validFixture(),
      { contentHash: CONTENT_HASH },
      'RAIT.VALIDATION_FAILED',
    ],
    [
      'snapshot vindo do cliente',
      validFixture(),
      { snapshotHash: canonicalSnapshotHash(serverOwnedSnapshot()) },
      'RAIT.VALIDATION_FAILED',
    ],
    [
      'presidente vindo do cliente',
      validFixture(),
      { expectedSignerPersonId: CHAIR },
      'RAIT.VALIDATION_FAILED',
    ],
  ] as const) {
    it(`dado ${name} quando approve-batch é executado então ${code} não confirma escrita, outbox ou auditoria`, async () => {
      const { runtime, effects } = await subject(fixture);

      await expect(
        runtime.execute(approveRequest(payload)),
      ).rejects.toMatchObject({
        code,
      });
      expectNoSuccessEffects(effects);
    });
  }

  it('dado replay idêntico da homologação quando approve-batch é repetido então devolve a resposta original sem novo efeito', async () => {
    const { runtime, effects } = await subject(validFixture());
    const request = approveRequest();

    const first = await runtime.execute(request);
    await expect(runtime.execute(request)).resolves.toEqual(first);
    expect(effects.writes).toEqual(['HOMOLOGADO']);
    expect(effects.events).toEqual([]);
    expect(effects.audits).toEqual([]);
  });

  it('dada corrida que altera versão ou manifestação após a verificação quando approve-batch tenta gravar então RAIT.VERSION_CONFLICT não confirma efeito', async () => {
    const { runtime, effects } = await subject({
      ...validFixture(),
      manifestVersionAtVerification: 7,
      manifestVersionAtCommit: 8,
    });

    await expect(runtime.execute(approveRequest())).rejects.toMatchObject({
      code: 'RAIT.VERSION_CONFLICT',
    });
    expectNoSuccessEffects(effects);
  });
});
