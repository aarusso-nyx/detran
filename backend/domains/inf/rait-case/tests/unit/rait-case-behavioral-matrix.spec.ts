import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { TimerExpiredData } from '@detran/inf-deadlines';

const TENANT = '00000000-0000-7000-8000-00000000a001';
const OTHER_TENANT = '00000000-0000-7000-8000-00000000a002';
const ACTOR = '00000000-0000-4000-8000-0000b0000001';
const CASE = '00000000-0000-7000-8000-000010000002';
const POOL = '00000000-0000-7000-8000-000020000001';
const INQUIRY = '00000000-0000-7000-8000-000015000001';
const DRAFT = '00000000-0000-7000-8000-000038000001';
const DOCUMENT = '00000000-0000-7000-8000-000012000001';
const AIT = '00000000-0000-7000-8000-0000f0000002';
const ORIGIN_CASE = '00000000-0000-7000-8000-000010000009';
const AGENCY = '00000000-0000-7000-8000-00000000a101';
const JURISDICTION = '00000000-0000-7000-8000-00000000a201';
const NOTICE_NA = '00000000-0000-7000-8000-000016000001';
const NOTICE_NP = '00000000-0000-7000-8000-000016000002';
const T_DEC_DEADLINE = '00000000-0000-7000-8000-000014000002';

type CaseScenario = {
  [key: string]: unknown;
  id: string;
  state: string;
  version: number;
  instance: string;
};
type InquiryScenario = {
  [key: string]: unknown;
  id: string;
  case_id: string;
  state: string;
  version: number;
  answered_at: string | null;
  extension_count: number;
};

type Row = Record<string, unknown>;
type Tables = Record<string, Row[]>;
const NOW = '2026-09-14T12:00:00.000Z';
const DEADLINE = '00000000-0000-7000-8000-000014000001';
const MEMBER = '00000000-0000-7000-8000-000021000001';
const AUTHORITY_MEMBER = '00000000-0000-7000-8000-000021000006';
const SCHEDULE = '00000000-0000-7000-8000-000027000001';
const AUTHORITY_SCHEDULE = '00000000-0000-7000-8000-000027000006';
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(NOW));
});
afterEach(() => vi.useRealTimers());

function baseTables(caseRow: CaseScenario): Tables {
  const owned = { tenant_id: TENANT, case_id: caseRow.id };
  return {
    rait_admissibility: [
      'tempestividade',
      'legitimidade',
      'assinatura',
      'pedido_compativel',
    ].map((criterion) => ({ ...owned, criterion, verdict: true })),
    rait_document: [
      {
        ...owned,
        id: DOCUMENT,
        kind: 'requerimento',
        origin: 'requerente',
        content_hash: 'fixture-hash',
      },
    ],
    rait_draft: [
      {
        ...owned,
        id: DRAFT,
        version: 1,
        author_id: '00000000-0000-4000-8000-0000b0000003',
        document_id: DOCUMENT,
        content_hash: 'fixture-hash',
        status: 'submetida',
        submitted_at: NOW,
        return_count: 0,
      },
      {
        tenant_id: TENANT,
        case_id: ORIGIN_CASE,
        id: '00000000-0000-7000-8000-000038000009',
        version: 1,
        author_id: '00000000-0000-4000-8000-0000b0000003',
        document_id: DOCUMENT,
        content_hash: 'fixture-origin-hash',
        status: 'assinada',
        submitted_at: NOW,
        return_count: 0,
      },
    ],
    rait_party: [
      {
        ...owned,
        role: 'requerente',
        legitimacy_basis: 'proprietario',
        representation_verified: true,
      },
    ],
    rait_pending_content: [
      {
        ...owned,
        id: DRAFT,
        missing_items: ['documento'],
        due_on: '2026-09-23',
        closed_at: null,
        outcome: null,
      },
    ],
    rait_pool: [
      {
        id: POOL,
        tenant_id: TENANT,
        instance: caseRow.instance,
        circuit: caseRow.instance === 'defesa_previa' ? 1 : 2,
        active: true,
        strategy: 'pull',
        priority_policy: 'ordem_unica',
        unit_id: null,
        updated_at: null,
        created_at: NOW,
      },
    ],
    rait_pool_member: [
      {
        id: MEMBER,
        tenant_id: TENANT,
        pool_id: POOL,
        person_id: ACTOR,
        member_role: 'analista',
        status: 'ATIVO',
        agency_jurisdiction_id: JURISDICTION,
        is_substitute: false,
        jurisdiction: 'AM',
      },
      {
        id: AUTHORITY_MEMBER,
        tenant_id: TENANT,
        pool_id: POOL,
        person_id: ACTOR,
        member_role: 'autoridade',
        status: 'ATIVO',
        agency_jurisdiction_id: JURISDICTION,
        is_substitute: false,
        jurisdiction: 'AM',
      },
    ],
    rait_schedule: [
      {
        id: SCHEDULE,
        tenant_id: TENANT,
        pool_id: POOL,
        member_id: MEMBER,
        kind: 'escala_semanal',
        period_start: '2026-09-14',
        period_end: '2026-09-20',
        published_at: NOW,
        availability: 'DISPONIVEL',
        wip_limit: 1,
      },
      {
        id: AUTHORITY_SCHEDULE,
        tenant_id: TENANT,
        pool_id: POOL,
        member_id: AUTHORITY_MEMBER,
        kind: 'escala_assinatura',
        period_start: '2026-09-14',
        period_end: '2026-09-20',
        published_at: NOW,
        availability: 'DISPONIVEL',
        wip_limit: 1,
      },
    ],
    rait_assignment: [],
    rait_decision: [
      {
        id: '00000000-0000-7000-8000-000039000009',
        tenant_id: TENANT,
        case_id: ORIGIN_CASE,
        signature_ref: 'fixture-origin-signature',
      },
    ],
    rait_schedule_slot: [
      {
        tenant_id: TENANT,
        schedule_id: SCHEDULE,
        slot_on: '2026-09-14',
        availability: 'DISPONIVEL',
      },
      {
        tenant_id: TENANT,
        schedule_id: AUTHORITY_SCHEDULE,
        slot_on: '2026-09-14',
        availability: 'DISPONIVEL',
      },
    ],
    ait_ait: [
      {
        id: AIT,
        tenant_id: TENANT,
        traffic_agency_id: AGENCY,
        ait_number: 'AM-2026-000002',
      },
    ],
    infraction: [{ id: DRAFT, tenant_id: TENANT, ait_id: AIT }],
    notice: [
      {
        id: NOTICE_NA,
        tenant_id: TENANT,
        infraction_id: DRAFT,
        kind: 'NA',
        status: 'expedida',
        document_id: DOCUMENT,
        acknowledgement_id: '00000000-0000-7000-8000-000016000011',
      },
      {
        id: NOTICE_NP,
        tenant_id: TENANT,
        infraction_id: DRAFT,
        kind: 'NP',
        status: 'expedida',
        document_id: DOCUMENT,
        acknowledgement_id: '00000000-0000-7000-8000-000016000012',
      },
    ],
    notice_acknowledgement: [
      { tenant_id: TENANT, notice_id: NOTICE_NA },
      { tenant_id: TENANT, notice_id: NOTICE_NP },
    ],
    evidence_link: [
      {
        tenant_id: TENANT,
        entity_type: 'inf.ait_ait',
        entity_id: AIT,
        mandatory: true,
        evidence_id: '00000000-0000-7000-8000-000032000099',
        status: 'validated',
        storage_uri: 's3://fixture/rait-evidence',
        hash_algorithm: 'sha256',
        hash_value: 'fixture-evidence-hash',
        role: 'deliberately-not-authoritative',
      },
    ],
    agency_jurisdiction: [
      {
        id: JURISDICTION,
        tenant_id: TENANT,
        traffic_agency_id: AGENCY,
      },
    ],
    rait_deadline: [
      {
        ...owned,
        id: DEADLINE,
        timer_code: 'T-DIL',
        started_on: '2026-09-01',
        due_on: '2026-09-23',
        raw_due_on: '2026-09-23',
        satisfied_at: null,
        extension_count: 0,
      },
      {
        ...owned,
        id: T_DEC_DEADLINE,
        timer_code: 'T-DEC',
        started_on: '2026-01-01',
        due_on: '2026-12-28',
        raw_due_on: '2026-12-28',
        satisfied_at: null,
        extension_count: 0,
      },
    ],
  };
}

/**
 * This port recognizes query intent and parameter position, never fixture ids.
 * It intentionally has no business guards: those must come from the plant.
 */
function scenarioPort(
  caseRow: CaseScenario,
  inquiry?: InquiryScenario,
  serverToday = '2026-09-30',
) {
  caseRow = {
    tenant_id: TENANT,
    ait_id: AIT,
    origin_case_id: ORIGIN_CASE,
    agency_jurisdiction_id: JURISDICTION,
    protocol_number: 'RAIT-2026-000002',
    protocolled_at: NOW,
    pending_completion: true,
    judge_body_received_at: null,
    cetran_received_at: null,
    ...caseRow,
  };
  const tables = baseTables(caseRow);
  const writes: Array<{ sql: string; values: readonly unknown[] }> = [];
  const outbox: Array<readonly unknown[]> = [];
  const audit: Array<readonly unknown[]> = [];
  const replay = new Map<string, { fingerprint: string; response: unknown }>();
  const query = vi.fn(
    async (rawSql: string, values: readonly unknown[] = []) => {
      const sql = rawSql.toLowerCase().replace(/\s+/g, ' ').trim();
      if (sql.startsWith('select request_fingerprint')) {
        const saved = replay.get(String(values[1]));
        return {
          rows: saved
            ? [
                {
                  request_fingerprint: saved.fingerprint,
                  response_body: saved.response,
                },
              ]
            : [],
        };
      }
      if (/\bfrom inf\.rait_case\b/.test(sql)) {
        const target = sql.match(/\bid\s*=\s*\$(\d+)/);
        const requested = target ? values[Number(target[1]) - 1] : undefined;
        const selectedState = sql.match(/\bstate\s*=\s*'([^']+)'/)?.[1];
        const eligible =
          selectedState === undefined ||
          caseRow.state.toLowerCase() === selectedState;
        if (requested === ORIGIN_CASE)
          return {
            rows: [
              {
                ...caseRow,
                id: ORIGIN_CASE,
                instance: 'defesa_previa',
                state: 'DECIDIDO_AUTORIDADE',
              },
            ],
          };
        return {
          rows:
            eligible &&
            caseRow.tenant_id === TENANT &&
            (requested === undefined || requested === caseRow.id)
              ? [{ ...caseRow }]
              : [],
        };
      }
      if (/\bfrom inf\.rait_inquiry\b/.test(sql))
        return {
          rows: inquiry && values.includes(inquiry.id) ? [{ ...inquiry }] : [],
        };
      if (/\bfrom inf\.rait_pool_member\b/.test(sql)) {
        const expectedRole = sql.includes("member_role = 'autoridade'")
          ? 'autoridade'
          : sql.includes("member_role = 'analista'")
            ? 'analista'
            : undefined;
        return {
          rows: tables
            .rait_pool_member!.filter(
              (row) =>
                row.tenant_id === TENANT &&
                (!expectedRole || row.member_role === expectedRole) &&
                (!values[1] ||
                  row.person_id === values[1] ||
                  row.pool_id === values[1]),
            )
            .map((row) => ({ ...row })),
        };
      }
      if (/\bfrom inf\.rait_schedule\b/.test(sql)) {
        const expectedKind = sql.includes("kind = 'escala_semanal'")
          ? 'escala_semanal'
          : values.includes('escala_assinatura')
            ? 'escala_assinatura'
            : undefined;
        const memberId =
          expectedKind === 'escala_semanal' ? values[2] : values[1];
        return {
          rows: tables
            .rait_schedule!.filter(
              (row) =>
                row.tenant_id === TENANT &&
                (!expectedKind || row.kind === expectedKind) &&
                (!memberId || row.member_id === memberId),
            )
            .map((row) => ({ ...row })),
        };
      }
      if (sql.startsWith('select')) {
        const table = sql.match(/\bfrom (?:inf|ops)\.(\w+)/)?.[1];
        if (table && tables[table]) {
          let rows = tables[table].filter((row) => row.tenant_id === TENANT);
          for (const match of sql.matchAll(/\b(\w+)\s*=\s*\$(\d+)/g)) {
            const column = match[1]!;
            if (rows.some((row) => column in row))
              rows = rows.filter(
                (row) => row[column] === values[Number(match[2]) - 1],
              );
          }
          if (table === 'rait_deadline' && sql.includes('current_date'))
            rows = rows.filter((row) => {
              const dueOn =
                row.due_on instanceof Date
                  ? row.due_on.toISOString().slice(0, 10)
                  : String(row.due_on);
              return dueOn <= serverToday;
            });
          if (/count\(/.test(sql))
            return { rows: [{ count: String(rows.length), wip: rows.length }] };
          return { rows: rows.map((row) => ({ ...row })) };
        }
      }
      if (sql.startsWith('update inf.rait_case')) {
        caseRow.state = String(values[0]);
        caseRow.version += 1;
        writes.push({ sql, values });
        return { rows: [{ ...caseRow }] };
      }
      if (sql.startsWith('update inf.rait_inquiry')) {
        writes.push({ sql, values });
        if (!inquiry) return { rows: [] };
        inquiry = {
          ...inquiry,
          extension_count:
            inquiry.extension_count + (values[0] === 'extend' ? 1 : 0),
          answered_at:
            values[0] === 'answer' || values[0] === 'expire'
              ? NOW
              : inquiry.answered_at,
        };
        return {
          rows: [
            {
              ...inquiry,
              due_on: values[2] ?? '2026-09-23',
              outcome:
                values[0] === 'answer'
                  ? 'respondida'
                  : values[0] === 'expire'
                    ? 'expirada'
                    : null,
            },
          ],
        };
      }
      if (sql.startsWith('insert into inf.rait_assignment')) {
        writes.push({ sql, values });
        return { rows: [{ id: DRAFT }] };
      }
      if (
        sql.startsWith('insert into inf.rait_decision') ||
        sql.startsWith('insert into inf.rait_redirect') ||
        sql.startsWith('update inf.rait_draft') ||
        sql.startsWith('update inf.rait_pending_content') ||
        sql.startsWith('update inf.rait_assignment') ||
        sql.startsWith('insert into inf.rait_case_event')
      ) {
        writes.push({ sql, values });
        return { rows: [] };
      }
      if (sql.startsWith('insert into integration.outbox')) {
        outbox.push(values);
        return { rows: [] };
      }
      if (sql.startsWith('select audit.write')) {
        audit.push(values);
        return { rows: [] };
      }
      if (sql.startsWith('insert into integration.idempotency_keys')) {
        replay.set(String(values[1]), {
          fingerprint: String(values[2]),
          response: JSON.parse(String(values[4])),
        });
      }
      return { rows: [] };
    },
  );
  const database = {
    tx: vi.fn(async (work: (tx: { query: typeof query }) => Promise<unknown>) =>
      work({ query }),
    ),
  };
  return { database, query, writes, outbox, audit, tables, caseRow };
}

async function caseSubject(state: string, instance: string, role: string) {
  const port = scenarioPort({ id: CASE, state, version: 1, instance });
  const { RaitCaseCommandService } =
    await import('../../src/handwritten/rait-case-command.service.js');
  const engine = {
    arm: vi.fn(async () => ({ id: DEADLINE, dueOn: '2026-09-24' })),
    extend: vi.fn(async () => ({ id: DEADLINE, dueOn: '2026-10-14' })),
    timeliness: vi.fn(async () => ({
      timely: true,
      dueOn: '2026-09-23',
      basis: 'fixture',
    })),
    sweep: vi.fn(),
    computeDue: vi.fn(),
  };
  const factory = { create: vi.fn(() => engine) };
  const trust = {
    verifyDraftManifest: vi.fn(async () => ({
      documentId: DOCUMENT,
      contentHash: 'fixture-hash',
      kind: 'DECISAO_DEFESA',
      sections: ['fatos', 'fundamentos', 'dispositivo'] as const,
    })),
    verifySignatureEvidence: vi.fn(async () => ({
      signatureRef: 'opaque-reference',
      documentId: DOCUMENT,
      contentHash: 'fixture-hash',
      signerPersonId: ACTOR,
      documentKind: 'DECISAO_DEFESA',
      padesLevel: 'PAdES-B-LT',
      tsaAt: NOW,
      certificateValidationSource: 'OCSP',
      certificateValidationStatus: 'GOOD',
      certificateValidatedAt: NOW,
    })),
    verifyWithdrawalEvidence: vi.fn(async () => ({
      tenantId: TENANT,
      caseId: CASE,
      documentId: DOCUMENT,
      contentHash: 'fixture-hash',
      signerPartyId: ACTOR,
      verificationMethod: 'physical_verified' as const,
      evidenceRef: 'fixture-withdrawal',
      verifiedAt: NOW,
    })),
  };
  return {
    ...port,
    engine,
    factory,
    trust,
    service: Reflect.construct(RaitCaseCommandService, [
      port.database as never,
      {
        hasActiveContext: () => true,
        snapshot: () => ({ tenantId: TENANT, actorId: ACTOR }),
        tenantContext: {
          current: () => ({ tenantId: TENANT, actorId: ACTOR, roles: [role] }),
        },
      },
      factory,
      trust,
      {
        capture: vi.fn(() => ({
          now: () => new Date(NOW),
          today: () => '2026-09-14',
        })),
      },
    ]) as InstanceType<typeof RaitCaseCommandService>,
  };
}

async function inquirySubject(
  role: string,
  overrides: Partial<InquiryScenario> = {},
  options: { serverToday?: string } = {},
) {
  const port = scenarioPort(
    { id: CASE, state: 'DILIGENCIA', version: 1, instance: 'jari' },
    {
      id: INQUIRY,
      case_id: CASE,
      state: 'DILIGENCIA',
      version: 1,
      answered_at: null,
      extension_count: 0,
      due_on: '2026-09-23',
      outcome: null,
      ...overrides,
    },
    options.serverToday,
  );
  const { RaitInquiryCommandService } =
    await import('../../src/handwritten/rait-inquiry-command.service.js');
  const engine = {
    arm: vi.fn(),
    extend: vi.fn(async () => ({ id: DEADLINE, dueOn: '2026-10-14' })),
    sweep: vi.fn(),
    computeDue: vi.fn(),
  };
  const factory = { create: vi.fn(() => engine) };
  const trust = {
    verifyDraftManifest: vi.fn(),
    verifySignatureEvidence: vi.fn(),
  };
  return {
    ...port,
    engine,
    factory,
    trust,
    service: Reflect.construct(RaitInquiryCommandService, [
      port.database as never,
      {
        hasActiveContext: () => true,
        snapshot: () => ({ tenantId: TENANT, actorId: ACTOR }),
        tenantContext: {
          current: () => ({ tenantId: TENANT, actorId: ACTOR, roles: [role] }),
        },
      },
      factory,
      trust,
    ]) as InstanceType<typeof RaitInquiryCommandService>,
  };
}

const input = (
  command: string,
  targetId: string,
  payload: Record<string, unknown>,
  key = `opaque-${command}`,
) => ({
  command,
  targetId,
  payload,
  headers: { 'If-Match': '"1"', 'Idempotency-Key': key },
});

type TimerCommandInput = Omit<ReturnType<typeof input>, 'headers'> & {
  headers: Record<string, string>;
};

const CASE_COMMANDS = [
  ['admit', 'TRIAGEM_ADMISSIBILIDADE', 'jari', 'rait-analyst', {}, 'ADMITIDO'],
  [
    'non-admission',
    'TRIAGEM_ADMISSIBILIDADE',
    'jari',
    'rait-analyst',
    { reason: 'intempestivo', legalBasis: 'CTB art. 285' },
    'NAO_CONHECIDO',
  ],
  [
    'remit',
    'ADMITIDO',
    'jari',
    'rait-secretary',
    {},
    'AGUARDANDO_REMESSA_JARI',
  ],
  [
    'receive',
    'AGUARDANDO_REMESSA_JARI',
    'jari',
    'rait-secretary',
    { receivedOn: '2026-09-14', body: 'jari' },
    'DISTRIBUIDO',
  ],
  [
    'ready',
    'EM_INSTRUCAO',
    'jari',
    'rait-analyst',
    { draftId: DRAFT },
    'PRONTO_P_DECISAO',
  ],
  [
    'decide',
    'PRONTO_P_DECISAO',
    'defesa_previa',
    'rait-signing-authority',
    {
      decisionKind: 'indeferida',
      grounds: 'fundamentação canônica',
      signatureRef: 'opaque-reference',
    },
    'DECIDIDO_AUTORIDADE',
  ],
  [
    'return-draft',
    'PRONTO_P_DECISAO',
    'jari',
    'rait-signing-authority',
    { draftId: DRAFT, guidance: 'orientação canônica' },
    'PRONTO_P_DECISAO',
  ],
  [
    'withdraw',
    'EM_INSTRUCAO',
    'jari',
    'rait-secretary',
    { withdrawalDocumentId: DOCUMENT },
    'ENCERRADO_DESISTENCIA',
  ],
  [
    'redirect',
    'TRIAGEM_ADMISSIBILIDADE',
    'jari',
    'rait-secretary',
    {
      targetBody: '00000000-0000-7000-8000-0000e2000099',
      reason: 'orgao_incompetente',
      receiptDocumentId: DOCUMENT,
    },
    'TRIAGEM_ADMISSIBILIDADE',
  ],
  [
    'resolve-pending',
    'TRIAGEM_ADMISSIBILIDADE',
    'jari',
    'rait-secretary',
    { pendingId: DRAFT, documentIds: [DOCUMENT] },
    'TRIAGEM_ADMISSIBILIDADE',
  ],
  ['claim-next', 'DISTRIBUIDO', 'jari', 'rait-analyst', {}, 'EM_INSTRUCAO'],
] as const;

const INQUIRY_COMMANDS = [
  [
    'answer',
    'rait-analyst',
    { documentIds: [DOCUMENT], answeredOn: '2026-09-14' },
    'EM_INSTRUCAO',
  ],
  [
    'extend',
    'rait-rapporteur',
    { reason: 'fundamento canônico' },
    'DILIGENCIA',
  ],
] as const;

const expiredEffect: TimerExpiredData = {
  ownerKind: 'case',
  ownerId: CASE,
  timerCode: 'T-DIL',
  dueOn: '2026-09-23',
  effect: 'transicao',
};
async function executeInquiry(
  subject: Awaited<ReturnType<typeof inquirySubject>>,
  request: {
    command: string;
    targetId: string;
    payload: Record<string, unknown>;
    headers: Record<string, string>;
  },
) {
  if (request.command !== 'expire') return subject.service.execute(request);
  const internal = subject.service as unknown as {
    executeTimer?: (
      request: {
        command: string;
        targetId: string;
        payload: Record<string, unknown>;
        headers: Record<string, string>;
      },
      effect: TimerExpiredData,
    ) => Promise<Awaited<ReturnType<typeof subject.service.execute>>>;
  };
  expect(
    internal.executeTimer,
    'CTG-0001: fronteira interna do efeito TimerExpiredData deve existir',
  ).toBeTypeOf('function');
  return internal.executeTimer!({ ...request, headers: {} }, expiredEffect);
}

const eventTypes: Record<string, string[]> = {
  admit: ['rait.case.changed', 'rait.case.admitted'],
  'non-admission': ['rait.case.changed'],
  remit: ['rait.case.changed'],
  receive: ['rait.case.received', 'rait.case.changed'],
  ready: ['rait.case.changed'],
  decide: ['rait.case.changed'],
  'return-draft': ['rait.case.changed'],
  withdraw: ['rait.case.withdrawn', 'rait.case.changed'],
  redirect: [],
  'resolve-pending': ['rait.case.changed'],
  'claim-next': ['rait.assignment.changed', 'rait.case.changed'],
  answer: ['rait.inquiry.changed', 'rait.case.changed'],
  extend: ['rait.inquiry.changed', 'rait.case.changed'],
  expire: ['rait.inquiry.changed', 'rait.case.changed'],
};

async function expectRejectedWithoutEffects(
  subject: {
    service: { execute(input: unknown): Promise<unknown> };
    writes: unknown[];
    outbox: unknown[];
    audit: unknown[];
  },
  request: unknown,
  code: string,
  status: number,
  baseline = [0, 0, 0],
) {
  const outcome = await subject.service.execute(request).then(
    () => undefined,
    (error: unknown) => error as { code?: string; status?: number },
  );
  expect(outcome).toMatchObject({ code, status });
  expect(subject.writes).toHaveLength(baseline[0]);
  expect(subject.outbox).toHaveLength(baseline[1]);
  expect(subject.audit).toHaveLength(baseline[2]);
}

describe('CTG-0001 §3 — matriz comportamental integral de envelope e isolamento', () => {
  for (const [command, state, instance, role, payload, next] of CASE_COMMANDS) {
    const target = command === 'claim-next' ? POOL : CASE;
    it(`dado ${command} válido quando é confirmado então devolve ETag, evento e auditoria completos`, async () => {
      const subject = await caseSubject(state, instance, role);
      if (command === 'non-admission')
        subject.tables.rait_admissibility![0]!.verdict = false;
      const result = await subject.service.execute(
        input(command, target, payload),
      );
      expect(result).toMatchObject({
        data: { state: next, version: command === 'redirect' ? 1 : 2 },
        etag: command === 'redirect' ? '"1"' : '"2"',
      });
      expect(subject.audit).toHaveLength(1);
      expect(result.events.map((event) => event.type).sort()).toEqual(
        [...eventTypes[command]!].sort(),
      );
      expect(subject.outbox).toHaveLength(result.events.length);
    });
    it(`dado payload inválido quando ${command} é solicitado então rejeita sem efeito parcial`, async () => {
      const subject = await caseSubject(state, instance, role);
      await expectRejectedWithoutEffects(
        subject,
        input(command, target, { unexpected: true }),
        'RAIT.VALIDATION_FAILED',
        400,
      );
    });
    it(`dado If-Match ausente ou divergente quando ${command} é solicitado então retorna 428 ou 412 sem efeito`, async () => {
      if (command === 'claim-next') {
        const subject = await caseSubject(state, instance, role);
        await expect(
          subject.service.execute({
            ...input(command, target, payload),
            headers: { 'Idempotency-Key': 'claim-without-match' },
          }),
        ).resolves.toMatchObject({ etag: '"2"' });
        return;
      }
      const missing = await caseSubject(state, instance, role);
      await expectRejectedWithoutEffects(
        missing,
        {
          ...input(command, target, payload),
          headers: { 'Idempotency-Key': 'missing' },
        },
        'RAIT.IF_MATCH_REQUIRED',
        428,
      );
      const stale = await caseSubject(state, instance, role);
      await expectRejectedWithoutEffects(
        stale,
        {
          ...input(command, target, payload),
          headers: { 'If-Match': '"2"', 'Idempotency-Key': 'stale' },
        },
        'RAIT.VERSION_CONFLICT',
        412,
      );
    });
    it(`dado a mesma chave quando ${command} é repetido igual ou divergente então não duplica nem aceita replay`, async () => {
      const subject = await caseSubject(state, instance, role);
      const first = input(command, target, payload, 'repeat');
      if (command === 'non-admission')
        subject.tables.rait_admissibility![0]!.verdict = false;
      const result = await subject.service.execute(first);
      await expect(subject.service.execute(first)).resolves.toEqual(result);
      const effects = [
        subject.writes.length,
        subject.outbox.length,
        subject.audit.length,
      ];
      await expectRejectedWithoutEffects(
        subject,
        input(command, DOCUMENT, payload, 'repeat'),
        'RAIT.IDEMPOTENCY_REPLAY',
        409,
        effects,
      );
      expect([
        subject.writes.length,
        subject.outbox.length,
        subject.audit.length,
      ]).toEqual(effects);
    });
  }

  for (const [command, role, payload, next] of INQUIRY_COMMANDS) {
    it(`dado ${command} válido quando é confirmado então devolve ETag, eventos e auditoria completos`, async () => {
      const subject = await inquirySubject(role);
      await expect(
        executeInquiry(subject, input(command, INQUIRY, payload)),
      ).resolves.toMatchObject({
        data: { caseId: CASE, caseVersion: 2 },
        etag: '"2"',
      });
      expect(subject.audit).toHaveLength(1);
      expect(subject.outbox).toHaveLength(eventTypes[command]!.length);
    });
    it(`dado payload inválido quando ${command} é solicitado então rejeita sem efeito parcial`, async () => {
      const subject = await inquirySubject(role);
      await expectRejectedWithoutEffects(
        {
          ...subject,
          service: {
            execute: (request) =>
              executeInquiry(subject, request as ReturnType<typeof input>),
          },
        },
        input(command, INQUIRY, { unexpected: true }),
        'RAIT.VALIDATION_FAILED',
        400,
      );
    });
    it(`dado If-Match ausente ou divergente quando ${command} é solicitado então retorna 428 ou 412 sem efeito`, async () => {
      const missing = await inquirySubject(role);
      await expectRejectedWithoutEffects(
        {
          ...missing,
          service: {
            execute: (request) =>
              executeInquiry(missing, request as ReturnType<typeof input>),
          },
        },
        {
          ...input(command, INQUIRY, payload),
          headers: { 'Idempotency-Key': 'missing' },
        },
        'RAIT.IF_MATCH_REQUIRED',
        428,
      );
      const stale = await inquirySubject(role);
      await expectRejectedWithoutEffects(
        {
          ...stale,
          service: {
            execute: (request) =>
              executeInquiry(stale, request as ReturnType<typeof input>),
          },
        },
        {
          ...input(command, INQUIRY, payload),
          headers: { 'If-Match': '"2"', 'Idempotency-Key': 'stale' },
        },
        'RAIT.VERSION_CONFLICT',
        412,
      );
    });
    it(`dado a mesma chave quando ${command} é repetido igual ou divergente então não duplica nem aceita replay`, async () => {
      const subject = await inquirySubject(role);
      const first = input(command, INQUIRY, payload, 'repeat-inquiry');
      const result = await executeInquiry(subject, first);
      await expect(executeInquiry(subject, first)).resolves.toEqual(result);
      const effects = [
        subject.writes.length,
        subject.outbox.length,
        subject.audit.length,
      ];
      await expectRejectedWithoutEffects(
        {
          ...subject,
          service: {
            execute: (request) =>
              executeInquiry(subject, request as ReturnType<typeof input>),
          },
        },
        input(command, DOCUMENT, payload, 'repeat-inquiry'),
        'RAIT.IDEMPOTENCY_REPLAY',
        409,
        effects,
      );
    });
  }

  it('dado o pool de claim-next quando há caso elegível então usa poolId só no pool e bloqueia/muta somente o caseId escolhido', async () => {
    const subject = await caseSubject('DISTRIBUIDO', 'jari', 'rait-analyst');
    const result = await subject.service.execute(input('claim-next', POOL, {}));
    expect(result).toMatchObject({ data: { id: CASE, state: 'EM_INSTRUCAO' } });
    expect(
      subject.query.mock.calls.some(
        ([sql, values]) =>
          String(sql).includes('pool_id = $2') && values?.[1] === POOL,
      ),
    ).toBe(true);
    expect(subject.audit[0]?.[5]).toBe(CASE);
  });
});

describe('CTG-0001 §4 — guardas vinculantes e efeitos sem fallback de fixture', () => {
  const guards: ReadonlyArray<
    readonly [string, string, string, string, Record<string, unknown>, string]
  > = [
    [
      'admit',
      'TRIAGEM_ADMISSIBILIDADE',
      'jari',
      'rait-analyst',
      {},
      'RAIT.TRIAGE_INCOMPLETE',
    ],
    [
      'admit',
      'TRIAGEM_ADMISSIBILIDADE',
      'jari',
      'rait-analyst',
      {},
      'RAIT.INTAKE_SIGNATURE_MISSING',
    ],
    [
      'non-admission',
      'TRIAGEM_ADMISSIBILIDADE',
      'jari',
      'rait-analyst',
      { reason: 'pedido_incompativel', legalBasis: 'CTB' },
      'RAIT.NON_ADMISSION_REASON_REQUIRED',
    ],
    [
      'remit',
      'ADMITIDO',
      'jari',
      'rait-secretary',
      {},
      'RAIT.REMIT_CHECKLIST_INCOMPLETE',
    ],
    [
      'receive',
      'AGUARDANDO_REMESSA_JARI',
      'jari',
      'rait-secretary',
      { receivedOn: '2026-09-14', body: 'cetran' },
      'RAIT.FORBIDDEN_ORGAO',
    ],
    [
      'ready',
      'EM_INSTRUCAO',
      'jari',
      'rait-analyst',
      { draftId: DRAFT },
      'RAIT.DRAFT_INCOMPLETE',
    ],
    [
      'decide',
      'PRONTO_P_DECISAO',
      'defesa_previa',
      'rait-signing-authority',
      {
        decisionKind: 'indeferida',
        grounds: '',
        signatureRef: 'opaque-reference',
      },
      'RAIT.DECISION_GROUNDS_REQUIRED',
    ],
    [
      'return-draft',
      'PRONTO_P_DECISAO',
      'jari',
      'rait-signing-authority',
      { draftId: DRAFT, guidance: 'canônica' },
      'RAIT.DRAFT_RETURN_LIMIT',
    ],
    [
      'withdraw',
      'EM_INSTRUCAO',
      'jari',
      'rait-secretary',
      { withdrawalDocumentId: DOCUMENT },
      'RAIT.WITHDRAWAL_LEGITIMACY',
    ],
    [
      'resolve-pending',
      'TRIAGEM_ADMISSIBILIDADE',
      'jari',
      'rait-secretary',
      { pendingId: DRAFT, documentIds: [DOCUMENT] },
      'RAIT.PENDING_CONTENT_EXPIRED',
    ],
    [
      'admit',
      'TRIAGEM_ADMISSIBILIDADE',
      'jari',
      'rait-analyst',
      {},
      'RAIT.TRIAGE_TIMELINESS_READONLY',
    ],
    [
      'receive',
      'AGUARDANDO_REMESSA_JARI',
      'jari',
      'rait-secretary',
      { receivedOn: '2026-09-14', body: 'jari' },
      'RAIT.RECEIPT_ALREADY_REGISTERED',
    ],
    [
      'decide',
      'PRONTO_P_DECISAO',
      'defesa_previa',
      'rait-signing-authority',
      {
        decisionKind: 'indeferida',
        grounds: 'canônica',
        signatureRef: 'opaque-reference',
      },
      'RAIT.DECISION_NOT_ON_DUTY',
    ],
    [
      'decide',
      'PRONTO_P_DECISAO',
      'defesa_previa',
      'rait-signing-authority',
      {
        decisionKind: 'indeferida',
        grounds: 'canônica',
        signatureRef: 'opaque-reference',
      },
      'RAIT.DRAFT_AUTHOR_CANNOT_SIGN',
    ],
    [
      'decide',
      'PRONTO_P_DECISAO',
      'defesa_previa',
      'rait-signing-authority',
      {
        decisionKind: 'provido',
        grounds: 'canônica',
        signatureRef: 'opaque-reference',
      },
      'RAIT.DECISION_KIND_INVALID_FOR_INSTANCE',
    ],
  ];
  for (const [command, state, instance, role, payload, code] of guards) {
    it(`dado a guarda ${code} quando ${command} recebe cenário inválido então não atualiza, insere, publica nem audita`, async () => {
      const subject = await caseSubject(state, instance, role);
      switch (code) {
        case 'RAIT.TRIAGE_INCOMPLETE':
          subject.tables.rait_admissibility!.pop();
          break;
        case 'RAIT.INTAKE_SIGNATURE_MISSING':
          subject.tables.rait_admissibility!.find(
            (row) => row.criterion === 'assinatura',
          )!.verdict = false;
          break;
        case 'RAIT.NON_ADMISSION_REASON_REQUIRED':
          subject.tables.rait_admissibility![0]!.verdict = false;
          break;
        case 'RAIT.REMIT_CHECKLIST_INCOMPLETE':
          subject.tables.rait_document = [];
          break;
        case 'RAIT.DRAFT_INCOMPLETE':
          subject.tables.rait_draft![0]!.document_id = null;
          subject.tables.rait_draft![0]!.status = 'rascunho';
          break;
        case 'RAIT.DRAFT_RETURN_LIMIT':
          subject.tables.rait_draft![0]!.return_count = 1;
          subject.tables.rait_draft![0]!.status = 'devolvida';
          break;
        case 'RAIT.WITHDRAWAL_LEGITIMACY':
          subject.tables.rait_party![0]!.legitimacy_basis = null;
          subject.tables.rait_party![0]!.representation_verified = false;
          break;
        case 'RAIT.PENDING_CONTENT_EXPIRED':
          subject.tables.rait_pending_content![0]!.due_on = '2026-09-13';
          break;
        case 'RAIT.TRIAGE_TIMELINESS_READONLY':
          subject.engine.timeliness.mockResolvedValue({
            timely: false,
            dueOn: '2026-09-13',
            basis: 'fixture',
          });
          break;
        case 'RAIT.RECEIPT_ALREADY_REGISTERED':
          subject.caseRow.judge_body_received_at = '2026-09-13T12:00:00.000Z';
          break;
        case 'RAIT.DECISION_NOT_ON_DUTY':
          subject.tables.rait_schedule = [];
          break;
        case 'RAIT.DRAFT_AUTHOR_CANNOT_SIGN':
          subject.tables.rait_draft![0]!.author_id = ACTOR;
          break;
      }
      await expectRejectedWithoutEffects(
        subject,
        input(command, CASE, payload),
        code,
        code === 'RAIT.FORBIDDEN_ORGAO'
          ? 403
          : code === 'RAIT.DECISION_JURISDICTION' ||
              code === 'RAIT.DRAFT_AUTHOR_CANNOT_SIGN'
            ? 403
            : code === 'RAIT.SIGNATURE_FAILED'
              ? 502
              : code === 'RAIT.PENDING_CONTENT_EXPIRED' ||
                  code === 'RAIT.RECEIPT_ALREADY_REGISTERED'
                ? 409
                : 422,
      );
    });
  }
  for (const [command, role, payload] of INQUIRY_COMMANDS) {
    it(`dado diligência expirada quando ${command} é solicitado então a guarda impede todo efeito`, async () => {
      const subject = await inquirySubject(role, {
        answered_at: '2026-09-14T00:00:00.000Z',
        outcome: 'expirada',
        due_on: '2026-09-13',
      });
      await expectRejectedWithoutEffects(
        {
          ...subject,
          service: {
            execute: (request) =>
              executeInquiry(subject, request as ReturnType<typeof input>),
          },
        },
        input(command, INQUIRY, payload),
        'RAIT.INQUIRY_ALREADY_CLOSED',
        409,
      );
    });
  }
  for (const [code, status] of [
    ['RAIT.QUEUE_EMPTY', 409],
    ['RAIT.ASSIGNMENT_WIP_LIMIT', 422],
    ['RAIT.ASSIGNMENT_ALREADY_ACTIVE', 409],
    ['RAIT.ORDER_OVERRIDE_FORBIDDEN', 403],
  ] as const) {
    it(`dado override ${code} quando claim-next é solicitado então retorna o código contratual sem efeito`, async () => {
      const subject = await caseSubject('DISTRIBUIDO', 'jari', 'rait-analyst');
      if (code === 'RAIT.QUEUE_EMPTY')
        subject.caseRow.state = 'ENCERRADO_DESISTENCIA';
      if (code === 'RAIT.ASSIGNMENT_WIP_LIMIT')
        subject.tables.rait_schedule![0]!.wip_limit = 0;
      if (code === 'RAIT.ASSIGNMENT_ALREADY_ACTIVE')
        subject.tables.rait_assignment = [
          {
            id: DRAFT,
            tenant_id: TENANT,
            case_id: CASE,
            pool_id: POOL,
            member_id: MEMBER,
            active: true,
            released_at: null,
          },
        ];
      await expectRejectedWithoutEffects(
        subject,
        input(
          'claim-next',
          POOL,
          code === 'RAIT.ORDER_OVERRIDE_FORBIDDEN' ? { caseId: DOCUMENT } : {},
        ),
        code,
        status,
      );
    });
  }

  for (const [command, eventCount, eventType] of [
    ['admit', 2, 'rait.case.admitted'],
    ['receive', 2, 'rait.case.received'],
    ['withdraw', 2, 'rait.case.withdrawn'],
    ['claim-next', 2, 'rait.assignment.changed'],
    ['answer', 2, 'rait.inquiry.changed'],
    ['extend', 2, 'rait.inquiry.changed'],
    ['expire', 2, 'rait.inquiry.changed'],
  ] as const) {
    it(`dado ${command} bem-sucedido quando completa então emite exatamente ${eventCount} eventos incluindo ${eventType}`, async () => {
      const isInquiry = ['answer', 'extend', 'expire'].includes(command);
      const subject = isInquiry
        ? await inquirySubject(
            command === 'extend' ? 'rait-rapporteur' : 'rait-analyst',
          )
        : await caseSubject(
            command === 'admit'
              ? 'TRIAGEM_ADMISSIBILIDADE'
              : command === 'receive'
                ? 'AGUARDANDO_REMESSA_JARI'
                : command === 'withdraw'
                  ? 'EM_INSTRUCAO'
                  : 'DISTRIBUIDO',
            'jari',
            command === 'admit' || command === 'claim-next'
              ? 'rait-analyst'
              : 'rait-secretary',
          );
      const target =
        command === 'claim-next' ? POOL : isInquiry ? INQUIRY : CASE;
      const payload =
        command === 'receive'
          ? { receivedOn: '2026-09-14', body: 'jari' }
          : command === 'withdraw'
            ? { withdrawalDocumentId: DOCUMENT }
            : command === 'answer'
              ? { documentIds: [DOCUMENT], answeredOn: '2026-09-14' }
              : command === 'extend'
                ? { reason: 'canônica' }
                : {};
      const result = isInquiry
        ? await executeInquiry(
            subject as Awaited<ReturnType<typeof inquirySubject>>,
            input(command, target, payload),
          )
        : await subject.service.execute(input(command, target, payload));
      expect(result).toMatchObject({
        events: expect.arrayContaining([
          expect.objectContaining({ type: eventType }),
        ]),
      });
      expect((result as { events: unknown[] }).events).toHaveLength(eventCount);
      expect(subject.outbox).toHaveLength(eventCount);
    });
  }
});

describe('CTG-0001 §5 e §6 — prazos e DI/RLS concretos', () => {
  it('dado remit e extend quando são bem-sucedidos então delegam respectivamente T-REM10 e T-DIL ao DeadlineEngine', async () => {
    const remit = await caseSubject('ADMITIDO', 'jari', 'rait-secretary');
    await remit.service.execute(input('remit', CASE, {}));
    expect(remit.engine.arm).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'T-REM10',
        ownerKind: 'case',
        ownerId: CASE,
        tenantId: TENANT,
        startOn: '2026-09-14',
      }),
    );
    expect(remit.engine.computeDue).not.toHaveBeenCalled();
    const extend = await inquirySubject('rait-rapporteur');
    await extend.service.execute(
      input('extend', INQUIRY, { reason: 'canônica' }),
    );
    expect(extend.engine.extend).toHaveBeenCalledWith(DEADLINE, 'canônica');
    expect(extend.engine.computeDue).not.toHaveBeenCalled();
    expect(extend.engine.sweep).not.toHaveBeenCalled();
    expect(
      extend.writes.some(
        (write) =>
          write.sql.includes('rait_inquiry') &&
          write.values.includes('2026-10-14'),
      ),
    ).toBe(true);
  });
  it('dado expire quando recebe efeito do motor então aceita somente o efeito produzido e não um principal humano', async () => {
    const subject = await inquirySubject('rait-analyst');
    await expect(
      executeInquiry(subject, input('expire', INQUIRY, {})),
    ).resolves.toMatchObject({
      data: { outcome: 'expirada', caseId: CASE, caseVersion: 2 },
    });
    expect(subject.engine.sweep).not.toHaveBeenCalled();
    expect(subject.engine.computeDue).not.toHaveBeenCalled();
  });
  it('dado Clock fixo posterior ao vencimento e servidor em dia anterior quando expire consome o efeito então não depende de current_date', async () => {
    const subject = await inquirySubject(
      'rait-analyst',
      { due_on: '2026-09-23' },
      { serverToday: '2026-09-01' },
    );
    await expect(
      executeInquiry(subject, input('expire', INQUIRY, {})),
    ).resolves.toMatchObject({
      data: { outcome: 'expirada', caseVersion: 2 },
    });
    const deadlineQuery = subject.query.mock.calls.find(([sql]) =>
      String(sql).includes('from inf.rait_deadline'),
    );
    expect(String(deadlineQuery?.[0])).not.toContain('current_date');
  });
  it('dado evento antigo após extensão quando expire é consumido então rejeita sem efeito', async () => {
    const subject = await inquirySubject('rait-analyst', {
      due_on: '2026-10-14',
    });
    subject.tables.rait_deadline!.find(
      (row) => row.timer_code === 'T-DIL',
    )!.due_on = '2026-10-14';
    const internal = subject.service as unknown as {
      executeTimer(
        request: TimerCommandInput,
        effect: TimerExpiredData,
      ): Promise<unknown>;
    };
    await expect(
      internal.executeTimer(
        { ...input('expire', INQUIRY, {}), headers: {} },
        expiredEffect,
      ),
    ).rejects.toMatchObject({ code: 'RAIT.CASE_STATE_INVALID', status: 409 });
    expect(subject.writes).toHaveLength(0);
    expect(subject.outbox).toHaveLength(0);
    expect(subject.audit).toHaveLength(0);
  });
  it('dado evento vigente quando expire é repetido então aplica uma vez e responde replay idempotente', async () => {
    const effect: TimerExpiredData = {
      ...expiredEffect,
      dueOn: '2026-10-14',
    };
    const subject = await inquirySubject(
      'rait-analyst',
      { due_on: effect.dueOn },
      { serverToday: '2026-10-20' },
    );
    subject.tables.rait_deadline!.find(
      (row) => row.timer_code === 'T-DIL',
    )!.due_on = effect.dueOn;
    const internal = subject.service as unknown as {
      executeTimer(
        request: TimerCommandInput,
        timerEffect: TimerExpiredData,
      ): Promise<unknown>;
    };
    const request: TimerCommandInput = {
      ...input('expire', INQUIRY, {}),
      headers: {},
    };
    const first = await internal.executeTimer(request, effect);
    await expect(internal.executeTimer(request, effect)).resolves.toEqual(
      first,
    );
    expect(subject.outbox).toHaveLength(2);
    expect(subject.audit).toHaveLength(1);
  });
  it('dado os serviços quando o Nest os constrói então usam Database e RequestContext concretos e são Injectable', async () => {
    const { Database } = await import('@stynx-nyx/data');
    const { RequestContext } = await import('@stynx-nyx/core');
    const module =
      await import('../../src/handwritten/rait-case-command.service.js');
    const { RaitCaseCommandService } = module;
    const factory = (module as Record<string, unknown>)
      .RaitDeadlineEngineFactory;
    expect(factory).toBeTypeOf('function');
    const { RaitInquiryCommandService } =
      await import('../../src/handwritten/rait-inquiry-command.service.js');
    const { RaitDocumentTrustVerifier } =
      await import('../../src/handwritten/rait-document-trust.verifier.js');
    const { RaitOperationClock } =
      await import('../../src/handwritten/rait-operation-clock.js');
    expect(Reflect.getMetadata('__injectable__', RaitCaseCommandService)).toBe(
      true,
    );
    expect(
      Reflect.getMetadata('design:paramtypes', RaitCaseCommandService),
    ).toEqual([
      Database,
      RequestContext,
      factory,
      RaitDocumentTrustVerifier,
      RaitOperationClock,
    ]);
    expect(
      Reflect.getMetadata('design:paramtypes', RaitInquiryCommandService),
    ).toEqual([Database, RequestContext, factory]);
    expect(Reflect.getMetadata('__injectable__', factory as object)).toBe(true);
    expect(Reflect.getMetadata('design:paramtypes', factory as object)).toEqual(
      [],
    );
  });
  it('dado a ponte RAIT de confiança quando o Nest a constrói então RaitDocumentTrustVerifier é provider concreto e Injectable', async () => {
    const verifierPath = new URL(
      '../../src/handwritten/rait-document-trust.verifier.ts',
      import.meta.url,
    ).href;
    const module = (await import(verifierPath)) as Record<string, unknown>;
    const verifier = module.RaitDocumentTrustVerifier;
    expect(verifier).toBeTypeOf('function');
    expect(Reflect.getMetadata('__injectable__', verifier as object)).toBe(
      true,
    );
  });
  it('dado identificador de outro tenant quando qualquer comando busca o alvo então RLS não revela nem muta o recurso', async () => {
    const subject = await caseSubject(
      'TRIAGEM_ADMISSIBILIDADE',
      'jari',
      'rait-analyst',
    );
    subject.caseRow.tenant_id = OTHER_TENANT;
    await expectRejectedWithoutEffects(
      subject,
      input('admit', CASE, {}),
      'RAIT.TENANT_MISMATCH',
      404,
    );
  });
});

describe('CTG-0001 emenda — confiança, F-J-0, jurisdição e precedência', () => {
  for (const [representation, dueOn, expired] of [
    ['string anterior', '2026-09-13', true],
    ['Date anterior', new Date('2026-09-13T00:00:00.000Z'), true],
    ['string igual', '2026-09-14', false],
    ['Date igual', new Date('2026-09-14T00:00:00.000Z'), false],
    ['string posterior', '2026-09-15', false],
    ['Date posterior', new Date('2026-09-15T00:00:00.000Z'), false],
  ] as const) {
    it(`dado due_on ${representation} quando resolve-pending compara ao Clock então preserva a mesma fronteira civil`, async () => {
      const subject = await caseSubject(
        'TRIAGEM_ADMISSIBILIDADE',
        'jari',
        'rait-secretary',
      );
      subject.tables.rait_pending_content![0]!.due_on = dueOn;
      const operation = subject.service.execute(
        input('resolve-pending', CASE, {
          pendingId: DRAFT,
          documentIds: [DOCUMENT],
        }),
      );
      if (expired) {
        await expect(operation).rejects.toMatchObject({
          code: 'RAIT.PENDING_CONTENT_EXPIRED',
          status: 409,
        });
        expect(subject.writes).toHaveLength(0);
        expect(subject.outbox).toHaveLength(0);
        expect(subject.audit).toHaveLength(0);
      } else {
        await expect(operation).resolves.toMatchObject({
          data: { version: 2 },
          etag: '"2"',
        });
      }
    });
  }

  it('dado minuta submetida quando ready é executado então a porta documental atesta identidade, hash, tipo e três seções antes de escrever', async () => {
    const subject = await caseSubject(
      'EM_INSTRUCAO',
      'defesa_previa',
      'rait-analyst',
    );
    await subject.service.execute(input('ready', CASE, { draftId: DRAFT }));
    expect(subject.trust.verifyDraftManifest).toHaveBeenCalledWith({
      tenantId: TENANT,
      documentId: DOCUMENT,
      contentHash: 'fixture-hash',
    });
    expect(
      subject.trust.verifyDraftManifest.mock.invocationCallOrder[0],
    ).toBeLessThan(
      subject.query.mock.invocationCallOrder.find((order, index) => {
        const sql = String(subject.query.mock.calls[index]?.[0] ?? '');
        return sql.toLowerCase().startsWith('update');
      }) ?? Number.POSITIVE_INFINITY,
    );
  });

  it('dado decisão válida quando decide é executado então a porta vincula assinatura, documento, hash e actorId antes de inserir', async () => {
    const subject = await caseSubject(
      'PRONTO_P_DECISAO',
      'defesa_previa',
      'rait-signing-authority',
    );
    await subject.service.execute(
      input('decide', CASE, {
        decisionKind: 'indeferida',
        grounds: 'fundamentação canônica',
        signatureRef: 'opaque-reference',
      }),
    );
    expect(subject.trust.verifySignatureEvidence).toHaveBeenCalledWith({
      tenantId: TENANT,
      signatureRef: 'opaque-reference',
      documentId: DOCUMENT,
      contentHash: 'fixture-hash',
      expectedSignerPersonId: ACTOR,
    });
  });

  it('dado recibo documental divergente quando decide verifica a assinatura então falha antes de qualquer mutação', async () => {
    const subject = await caseSubject(
      'PRONTO_P_DECISAO',
      'defesa_previa',
      'rait-signing-authority',
    );
    subject.trust.verifySignatureEvidence.mockRejectedValue(
      Object.assign(new Error('invalid receipt'), {
        code: 'RAIT.SIGNATURE_FAILED',
        status: 502,
      }),
    );
    await expectRejectedWithoutEffects(
      subject,
      input('decide', CASE, {
        decisionKind: 'indeferida',
        grounds: 'fundamentação canônica',
        signatureRef: 'opaque-reference',
      }),
      'RAIT.SIGNATURE_FAILED',
      502,
    );
  });

  it('dado checklist F-J-0 sem evidência obrigatória quando remit é executado então informa TEAT_EVIDENCE e ignora role como critério', async () => {
    const subject = await caseSubject('ADMITIDO', 'jari', 'rait-secretary');
    subject.tables.evidence_link = [];
    const error = await subject.service.execute(input('remit', CASE, {})).then(
      () => undefined,
      (caught: unknown) =>
        caught as {
          code?: string;
          context?: { missing?: string[] };
        },
    );
    expect(error).toMatchObject({
      code: 'RAIT.REMIT_CHECKLIST_INCOMPLETE',
      context: { missing: expect.arrayContaining(['TEAT_EVIDENCE']) },
    });
    const evidenceQuery = subject.query.mock.calls.find(([sql]) =>
      String(sql).includes('ops.evidence_link'),
    );
    expect(evidenceQuery?.[0]).toEqual(expect.stringContaining('entity_type'));
    expect(evidenceQuery?.[0]).toEqual(
      expect.stringContaining('ops.evidence_evidence'),
    );
    expect(evidenceQuery?.[0]).toEqual(expect.stringContaining('status'));
    expect(evidenceQuery?.[0]).toEqual(expect.stringContaining('storage_uri'));
    expect(evidenceQuery?.[0]).toEqual(
      expect.stringContaining('hash_algorithm'),
    );
    expect(evidenceQuery?.[0]).toEqual(expect.stringContaining('hash_value'));
    expect(evidenceQuery?.[0]).not.toMatch(/\brole\s*=/iu);
  });

  it('dado autoridade de circunscrição diferente quando decide é solicitado então retorna RAIT.DECISION_JURISDICTION sem efeito', async () => {
    const subject = await caseSubject(
      'PRONTO_P_DECISAO',
      'defesa_previa',
      'rait-signing-authority',
    );
    subject.tables.rait_pool_member![0] = {
      ...subject.tables.rait_pool_member![0]!,
      person_id: ACTOR,
      member_role: 'autoridade',
      agency_jurisdiction_id: OTHER_TENANT,
    };
    await expectRejectedWithoutEffects(
      subject,
      input('decide', CASE, {
        decisionKind: 'indeferida',
        grounds: 'fundamentação canônica',
        signatureRef: 'opaque-reference',
      }),
      'RAIT.DECISION_JURISDICTION',
      403,
    );
  });

  it('dado autoridade substituta designada mas slot diário ausente quando decide é solicitado então o slot prevalece e retorna RAIT.DECISION_NOT_ON_DUTY', async () => {
    const subject = await caseSubject(
      'PRONTO_P_DECISAO',
      'defesa_previa',
      'rait-signing-authority',
    );
    subject.tables.rait_pool_member![0] = {
      ...subject.tables.rait_pool_member![0]!,
      person_id: ACTOR,
      member_role: 'autoridade',
      agency_jurisdiction_id: JURISDICTION,
      is_substitute: true,
    };
    subject.tables.rait_schedule_slot = [
      {
        tenant_id: TENANT,
        schedule_id: DRAFT,
        slot_on: '2026-09-14',
        availability: 'AUSENTE_PROGRAMADO',
      },
    ];
    await expectRejectedWithoutEffects(
      subject,
      input('decide', CASE, {
        decisionKind: 'indeferida',
        grounds: 'fundamentação canônica',
        signatureRef: 'opaque-reference',
      }),
      'RAIT.DECISION_NOT_ON_DUTY',
      422,
    );
  });

  it('dado T-DEC vencido quando decide é solicitado então retorna RAIT.EXTINCTION_DECISION_LATE sem recalcular prazo', async () => {
    const subject = await caseSubject(
      'PRONTO_P_DECISAO',
      'defesa_previa',
      'rait-signing-authority',
    );
    subject.tables.rait_deadline!.find(
      (row) => row.timer_code === 'T-DEC',
    )!.due_on = '2026-09-13';
    await expectRejectedWithoutEffects(
      subject,
      input('decide', CASE, {
        decisionKind: 'indeferida',
        grounds: 'fundamentação canônica',
        signatureRef: 'opaque-reference',
      }),
      'RAIT.EXTINCTION_DECISION_LATE',
      422,
    );
    expect(subject.engine.computeDue).not.toHaveBeenCalled();
  });

  it('dado instância incompatível e fundamentos ausentes quando decide é solicitado então a espécie/instância precede fundamentos', async () => {
    const subject = await caseSubject(
      'PRONTO_P_DECISAO',
      'jari',
      'rait-signing-authority',
    );
    await expectRejectedWithoutEffects(
      subject,
      input('decide', CASE, {
        decisionKind: 'provido',
        grounds: '',
        signatureRef: 'opaque-reference',
      }),
      'RAIT.DECISION_KIND_INVALID_FOR_INSTANCE',
      422,
    );
  });

  it('dado claim-next sem versão do pool quando If-Match falta ou diverge então nenhum valor do header é consumido', async () => {
    for (const headers of [
      { 'Idempotency-Key': 'claim-no-match' },
      { 'If-Match': 'not-an-etag', 'Idempotency-Key': 'claim-invalid-match' },
    ] as Array<Record<string, string>>) {
      const subject = await caseSubject('DISTRIBUIDO', 'jari', 'rait-analyst');
      await expect(
        subject.service.execute({
          command: 'claim-next',
          targetId: POOL,
          payload: {},
          headers,
        }),
      ).resolves.toMatchObject({ data: { id: CASE }, etag: '"2"' });
    }
  });

  it('dado TimerExpiredData quando expire é consumido então dispensa headers de cliente e usa chave derivada estável', async () => {
    const subject = await inquirySubject('rait-analyst');
    const internal = subject.service as unknown as {
      executeTimer(
        request: {
          command: string;
          targetId: string;
          payload: Record<string, unknown>;
          headers: Record<string, string>;
        },
        effect: TimerExpiredData,
      ): Promise<unknown>;
    };
    await expect(
      internal.executeTimer(
        {
          command: 'expire',
          targetId: INQUIRY,
          payload: {},
          headers: {},
        },
        expiredEffect,
      ),
    ).resolves.toBeDefined();
    expect(
      subject.query.mock.calls.some(([, values]) =>
        (values as readonly unknown[] | undefined)?.includes(
          `timer-expired:case:${CASE}:T-DIL:2026-09-23`,
        ),
      ),
    ).toBe(true);
  });
});
