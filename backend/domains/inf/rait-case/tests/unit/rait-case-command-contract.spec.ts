import { describe, expect, it, vi } from 'vitest';

import {
  DETRAN_ACTION_METADATA_KEY,
  DETRAN_RESOURCE_METADATA_KEY,
} from '@detran/shared';

type Request = {
  command: string;
  targetId: string;
  payload: Record<string, unknown>;
  headers: Record<string, string>;
};
type CaseRow = {
  id: string;
  state: string;
  version: number;
  instance: string;
  pending_completion?: boolean;
};
type InquiryRow = {
  id: string;
  case_id: string;
  state: string;
  version: number;
  answered_at: string | null;
  extension_count: number;
};

const TENANT = '00000000-0000-7000-8000-00000000a001';
const ACTOR = '00000000-0000-4000-8000-0000b0000001';
const CASE = '00000000-0000-7000-8000-000010000002';
const POOL = '00000000-0000-7000-8000-000020000001';
const INQUIRY = '00000000-0000-7000-8000-000015000001';
const DRAFT = '00000000-0000-7000-8000-000038000001';
const DOCUMENT = '00000000-0000-7000-8000-000012000001';
const AIT = '00000000-0000-7000-8000-0000f0000002';
const ORIGIN_CASE = '00000000-0000-7000-8000-000010000010';
const AGENCY = '00000000-0000-7000-8000-0000e2000001';
const JURISDICTION = '00000000-0000-7000-8000-00000000a201';
const MEMBER = '00000000-0000-7000-8000-000021000001';
const SCHEDULE = '00000000-0000-7000-8000-000027000001';
let activeRole = '';

const VALID_PAYLOADS: Record<string, Record<string, unknown>> = {
  admit: {},
  'non-admission': {
    reason: 'intempestivo',
    legalBasis: 'CTB art. 285',
  },
  remit: {},
  receive: { receivedOn: '2026-09-14', body: 'jari' },
  ready: { draftId: DRAFT },
  decide: {
    decisionKind: 'indeferida',
    grounds: 'fundamentação canônica',
    signatureRef: 'opaque-reference',
  },
  'return-draft': { draftId: DRAFT, guidance: 'orientação canônica' },
  withdraw: { withdrawalDocumentId: DOCUMENT },
  redirect: {
    targetBody: '00000000-0000-7000-8000-0000e2000099',
    reason: 'orgao_incompetente',
    receiptDocumentId: DOCUMENT,
  },
  'resolve-pending': { pendingId: DRAFT, documentIds: [DOCUMENT] },
  'claim-next': {},
  answer: { documentIds: [DOCUMENT], answeredOn: '2026-09-14' },
  extend: { reason: 'fundamento canônico' },
  expire: {},
};

const request = (
  command: string,
  role: string,
  payload: Record<string, unknown> = VALID_PAYLOADS[command] ?? {},
  targetId = CASE,
): Request => {
  activeRole = role;
  return {
    command,
    targetId,
    payload,
    headers: { 'If-Match': '"1"', 'Idempotency-Key': `opaque-${command}` },
  };
};

/** Scenario-owned SQL persistence. Guards and state choices belong exclusively to the service. */
function transactionalPort(scenario: { case: CaseRow; inquiry?: InquiryRow }) {
  const idempotency = new Map<
    string,
    { fingerprint: string; response: unknown }
  >();
  const outbox: Array<readonly unknown[]> = [];
  const audits: Array<readonly unknown[]> = [];
  const updates: Array<{ sql: string; values: readonly unknown[] }> = [];
  const queries: Array<{ sql: string; values: readonly unknown[] }> = [];
  const admissibility = [
    'tempestividade',
    'legitimidade',
    'assinatura',
    'pedido_compativel',
  ].map((criterion) => ({ criterion, verdict: true }));
  const query = vi.fn(async (sql: string, values: readonly unknown[] = []) => {
    queries.push({ sql, values });
    if (sql.startsWith('select request_fingerprint')) {
      const saved = idempotency.get(String(values[1]));
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
    if (sql.includes('from inf.rait_case') && values[1] === ORIGIN_CASE)
      return {
        rows: [
          {
            id: ORIGIN_CASE,
            tenant_id: TENANT,
            ait_id: AIT,
            state: 'DECIDIDO_AUTORIDADE',
            version: 1,
            instance: 'defesa_previa',
          },
        ],
      };
    if (sql.startsWith('select id, state, version, instance'))
      return {
        rows: [
          {
            tenant_id: TENANT,
            ait_id: AIT,
            origin_case_id: ORIGIN_CASE,
            agency_jurisdiction_id: JURISDICTION,
            protocol_number: 'RAIT-UNIT-0001',
            protocolled_at: '2026-09-14T12:00:00.000Z',
            pending_completion: true,
            ...scenario.case,
          },
        ],
      };
    if (sql.startsWith('select inquiry.id'))
      return { rows: scenario.inquiry ? [{ ...scenario.inquiry }] : [] };
    if (sql.includes('from inf.rait_admissibility'))
      return { rows: admissibility.map((row) => ({ ...row })) };
    if (sql.includes('from inf.rait_decision'))
      return {
        rows:
          values[1] === ORIGIN_CASE
            ? [
                {
                  id: '00000000-0000-7000-8000-000039000009',
                  signature_ref: 'fixture-origin-signature',
                },
              ]
            : [],
      };
    if (sql.includes('from inf.rait_agenda_item')) return { rows: [] };
    if (sql.includes('from inf.rait_party'))
      return {
        rows: [
          {
            id: ACTOR,
            role: 'requerente',
            legitimacy_basis: 'proprietario',
            representation_verified: true,
          },
        ],
      };
    if (sql.includes('from inf.rait_document'))
      return {
        rows: [
          {
            id: DOCUMENT,
            document_id: DOCUMENT,
            kind: 'requerimento',
            origin: 'requerente',
            content_hash: 'fixture-hash',
          },
        ],
      };
    if (sql.includes('from inf.rait_draft'))
      return {
        rows: [
          values[1] === ORIGIN_CASE
            ? {
                id: '00000000-0000-7000-8000-000038000009',
                author_id: '00000000-0000-4000-8000-0000b0000003',
                document_id: DOCUMENT,
                content_hash: 'fixture-origin-hash',
                status: 'assinada',
                submitted_at: '2026-09-14T12:00:00.000Z',
                return_count: 0,
              }
            : {
                id: DRAFT,
                author_id: '00000000-0000-4000-8000-0000b0000003',
                document_id: DOCUMENT,
                content_hash: 'fixture-hash',
                status: 'submetida',
                submitted_at: '2026-09-14T12:00:00.000Z',
                return_count: 0,
              },
        ],
      };
    if (sql.includes('from inf.rait_pending_content'))
      return { rows: [{ id: DRAFT, due_on: '2026-12-31' }] };
    if (sql.includes('from inf.rait_deadline'))
      return {
        rows: [
          {
            id: DRAFT,
            due_on: '2026-12-31',
            timer_code: sql.includes('T-DIL') ? 'T-DIL' : 'T-DEC',
          },
        ],
      };
    if (sql.includes('from inf.ait_ait'))
      return { rows: [{ id: AIT, traffic_agency_id: AGENCY }] };
    if (sql.includes('from ops.evidence_link'))
      return {
        rows: [
          {
            mandatory: true,
            evidence_id: '00000000-0000-7000-8000-000032000099',
            status: 'validated',
            storage_uri: 's3://fixture/rait-evidence',
            hash_algorithm: 'sha256',
            hash_value: 'fixture-evidence-hash',
          },
        ],
      };
    if (sql.includes('from inf.notice'))
      return {
        rows: [
          {
            id: '00000000-0000-7000-8000-000016000001',
            kind: 'NA',
            status: 'expedida',
            document_id: DOCUMENT,
            acknowledgement_id: '00000000-0000-7000-8000-000016000011',
          },
          {
            id: '00000000-0000-7000-8000-000016000002',
            kind: 'NP',
            status: 'expedida',
            document_id: DOCUMENT,
            acknowledgement_id: '00000000-0000-7000-8000-000016000012',
          },
        ],
      };
    if (sql.includes('from ops.agency_jurisdiction'))
      return { rows: [{ id: JURISDICTION, traffic_agency_id: AGENCY }] };
    if (sql.includes('from inf.rait_pool_member'))
      return {
        rows: [
          {
            id: MEMBER,
            pool_id: POOL,
            person_id: ACTOR,
            member_role: 'analista',
            status: 'ATIVO',
            agency_jurisdiction_id: JURISDICTION,
            is_substitute: false,
          },
        ],
      };
    if (sql.includes('from inf.rait_schedule_slot'))
      return { rows: [{ availability: 'DISPONIVEL' }] };
    if (sql.includes('from inf.rait_schedule'))
      return {
        rows: [
          {
            id: SCHEDULE,
            availability: 'DISPONIVEL',
            wip_limit: 2,
          },
        ],
      };
    if (sql.includes('from inf.rait_pool'))
      return {
        rows: [
          {
            id: POOL,
            instance: scenario.case.instance,
            unit_id: null,
            strategy: 'pull',
            active: true,
          },
        ],
      };
    if (sql.includes('count(*)::text as count'))
      return { rows: [{ count: '0' }] };
    if (sql.includes('from inf.rait_case item') && sql.includes('skip locked'))
      return { rows: [{ ...scenario.case }] };
    if (sql.startsWith('update inf.rait_case')) {
      scenario.case = {
        ...scenario.case,
        state: String(values[0]),
        version: scenario.case.version + 1,
      };
      updates.push({ sql, values });
      return { rows: [{ ...scenario.case }] };
    }
    if (sql.startsWith('insert into inf.rait_assignment')) {
      updates.push({ sql, values });
      return { rows: [{ id: DRAFT }] };
    }
    if (sql.startsWith('update inf.rait_inquiry')) {
      updates.push({ sql, values });
      if (scenario.inquiry) {
        scenario.inquiry = {
          ...scenario.inquiry,
          version: scenario.inquiry.version + 1,
          extension_count:
            scenario.inquiry.extension_count + (values[0] === 'extend' ? 1 : 0),
        };
      }
      return { rows: scenario.inquiry ? [{ ...scenario.inquiry }] : [] };
    }
    if (sql.startsWith('insert into integration.outbox')) {
      outbox.push(values);
      return { rows: [] };
    }
    if (sql.startsWith('select audit.write')) {
      audits.push(values);
      return { rows: [] };
    }
    if (sql.startsWith('insert into integration.idempotency_keys')) {
      idempotency.set(String(values[1]), {
        fingerprint: String(values[2]),
        response: JSON.parse(String(values[4])),
      });
    }
    return { rows: [] };
  });
  const database = {
    tx: vi.fn(async (work: (tx: { query: typeof query }) => Promise<unknown>) =>
      work({ query }),
    ),
  };
  return {
    database,
    query,
    queries,
    updates,
    outbox,
    audits,
    admissibility,
  };
}

async function caseRuntime(
  state: string,
  instance = 'jari',
  pendingCompletion = true,
) {
  const port = transactionalPort({
    case: {
      id: CASE,
      state,
      version: 1,
      instance,
      pending_completion: pendingCompletion,
    },
  });
  const { RaitCaseCommandService } =
    await import('../../src/handwritten/rait-case-command.service.js');
  const engine = {
    arm: vi.fn(async () => ({ id: DRAFT, dueOn: '2026-09-24' })),
    extend: vi.fn(async () => ({ id: DRAFT, dueOn: '2026-10-14' })),
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
      sections: ['fatos', 'fundamentos', 'dispositivo'],
    })),
    verifySignatureEvidence: vi.fn(async () => ({
      signatureRef: 'opaque-reference',
      documentId: DOCUMENT,
      contentHash: 'fixture-hash',
      signerPersonId: ACTOR,
    })),
    verifyWithdrawalEvidence: vi.fn(async () => ({
      tenantId: TENANT,
      caseId: CASE,
      documentId: DOCUMENT,
      contentHash: 'fixture-hash',
      signerPartyId: ACTOR,
      verificationMethod: 'physical_verified',
      evidenceRef: 'fixture-evidence',
      verifiedAt: '2026-09-15T12:00:00.000Z',
    })),
  };
  return {
    ...port,
    service: new RaitCaseCommandService(
      port.database as never,
      {
        hasActiveContext: () => true,
        snapshot: () => ({
          requestId: 'unit-case-command',
          tenantId: TENANT,
          actorId: ACTOR,
          startedAt: new Date('2026-09-15T12:00:00.000Z'),
        }),
        tenantContext: { current: () => ({ roles: [activeRole] }) },
      } as never,
      factory as never,
      trust as never,
      {
        capture: vi.fn(() => ({
          now: () => new Date('2026-09-15T12:00:00.000Z'),
          today: () => '2026-09-15',
        })),
      } as never,
    ),
  };
}
async function inquiryRuntime(overrides: Partial<InquiryRow> = {}) {
  const port = transactionalPort({
    case: { id: CASE, state: 'DILIGENCIA', version: 1, instance: 'jari' },
    inquiry: {
      id: INQUIRY,
      case_id: CASE,
      state: 'DILIGENCIA',
      version: 1,
      answered_at: null,
      extension_count: 0,
      ...overrides,
    },
  });
  const { RaitInquiryCommandService } =
    await import('../../src/handwritten/rait-inquiry-command.service.js');
  const engine = {
    arm: vi.fn(),
    extend: vi.fn(async () => ({ id: DRAFT, dueOn: '2026-10-14' })),
    sweep: vi.fn(),
    computeDue: vi.fn(),
  };
  const factory = { create: vi.fn(() => engine) };
  return {
    ...port,
    service: new RaitInquiryCommandService(
      port.database as never,
      {
        hasActiveContext: () => true,
        snapshot: () => ({
          requestId: 'unit-inquiry-command',
          tenantId: TENANT,
          actorId: ACTOR,
          startedAt: new Date('2026-09-15T12:00:00.000Z'),
        }),
        tenantContext: { current: () => ({ roles: [activeRole] }) },
      } as never,
      factory as never,
    ),
  };
}

const CASE_COMMANDS = [
  [
    'admit',
    'TRIAGEM_ADMISSIBILIDADE',
    'jari',
    'rait-analyst',
    {},
    'ADMITIDO',
    'INF_RAIT_CASE_ADMIT',
    'inf.rait_case',
  ],
  [
    'non-admission',
    'TRIAGEM_ADMISSIBILIDADE',
    'jari',
    'rait-analyst',
    { reason: 'intempestivo', legalBasis: 'CTB art. 285' },
    'NAO_CONHECIDO',
    'INF_RAIT_CASE_REJECT',
    'inf.rait_case',
  ],
  [
    'remit',
    'ADMITIDO',
    'jari',
    'rait-secretary',
    {},
    'AGUARDANDO_REMESSA_JARI',
    'INF_RAIT_CASE_REMIT',
    'inf.rait_case',
  ],
  [
    'receive',
    'AGUARDANDO_REMESSA_JARI',
    'jari',
    'rait-secretary',
    { receivedOn: '2026-09-14', body: 'jari' },
    'DISTRIBUIDO',
    'INF_RAIT_CASE_RECEIVE',
    'inf.rait_case',
  ],
  [
    'ready',
    'EM_INSTRUCAO',
    'jari',
    'rait-analyst',
    { draftId: DRAFT },
    'PRONTO_P_DECISAO',
    'INF_RAIT_CASE_READY',
    'inf.rait_case',
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
    'INF_RAIT_DECISION_SIGN',
    'inf.rait_decision',
  ],
  [
    'return-draft',
    'PRONTO_P_DECISAO',
    'jari',
    'rait-signing-authority',
    { draftId: DRAFT, guidance: 'orientação canônica' },
    'PRONTO_P_DECISAO',
    'INF_RAIT_DECISION_RETURN_DRAFT',
    'inf.rait_draft',
  ],
  [
    'withdraw',
    'EM_INSTRUCAO',
    'jari',
    'rait-secretary',
    { withdrawalDocumentId: DOCUMENT },
    'ENCERRADO_DESISTENCIA',
    'INF_RAIT_CASE_WITHDRAW',
    'inf.rait_case',
  ],
  [
    'claim-next',
    'DISTRIBUIDO',
    'jari',
    'rait-analyst',
    {},
    'EM_INSTRUCAO',
    'INF_RAIT_CASE_CLAIM_NEXT',
    'inf.rait_case',
  ],
] as const;

const CASE_EVENT_COUNTS: Record<string, number> = {
  admit: 2,
  'non-admission': 1,
  remit: 1,
  receive: 2,
  ready: 1,
  decide: 1,
  'return-draft': 1,
  withdraw: 2,
  'claim-next': 2,
};

describe('CTG-0001 — comandos do caso na porta SQL transacional', () => {
  for (const [
    command,
    initial,
    instance,
    role,
    payload,
    next,
    auditAction,
    auditEntity,
  ] of CASE_COMMANDS) {
    it(`dado fixture canônica em ${initial} quando ${command} é executado então bloqueia, atualiza, publica e audita uma vez`, async () => {
      const runtime = await caseRuntime(initial, instance);
      if (command === 'non-admission')
        runtime.admissibility[0]!.verdict = false;
      const targetId = command === 'claim-next' ? POOL : CASE;
      const result = await runtime.service.execute(
        request(command, role, payload, targetId),
      );
      expect(result.data).toMatchObject({ state: next, version: 2 });
      expect(result.etag).toBe('"2"');
      expect(
        runtime.queries.filter(({ sql }) =>
          sql.startsWith('update inf.rait_case'),
        ),
      ).toHaveLength(1);
      expect(runtime.outbox).toHaveLength(CASE_EVENT_COUNTS[command]);
      expect(result.events).toHaveLength(CASE_EVENT_COUNTS[command]);
      expect(runtime.audits).toEqual([
        [
          TENANT,
          ACTOR,
          role,
          auditAction,
          auditEntity,
          command === 'claim-next' ? CASE : targetId,
          JSON.stringify({ command }),
        ],
      ]);
      const entityId = runtime.audits[0]?.[5];
      expect(entityId).toEqual(
        expect.stringMatching(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[47][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
        ),
      );
      expect(
        runtime.queries.find(({ sql }) => sql.startsWith('select audit.write'))
          ?.sql,
      ).toBe(
        'select audit.write($1, $2, $3, $4, $5, $6, $7, null, null, null)',
      );
      expect(runtime.queries.every(({ values }) => values.length > 0)).toBe(
        true,
      );
      expect(
        runtime.queries.some(
          ({ sql, values }) =>
            sql.includes('for update') && values[0] === TENANT,
        ),
      ).toBe(true);
      expect(runtime.outbox[0]?.[0]).toBe(TENANT);
      expect(
        runtime.outbox.some((event) => event[1] === 'rait.case.changed'),
      ).toBe(true);
    });
  }

  it('dado prioridade legal apurada quando claim-next é executado então ordena por rank e desempates canônicos', async () => {
    const runtime = await caseRuntime('DISTRIBUIDO');
    await runtime.service.execute(
      request('claim-next', 'rait-analyst', {}, POOL),
    );

    const queueQueries = runtime.queries.filter(
      ({ sql }) =>
        sql.includes('from inf.rait_case item') && sql.includes('skip locked'),
    );
    expect(queueQueries).toHaveLength(1);
    // SQL1-F3 / RN-RAIT-141: NULL and unknown legacy tokens receive rank 0.
    expect(queueQueries[0]?.sql).toMatch(
      /order\s+by\s+case\s+item\.legal_priority\s+when\s+'level_2'\s+then\s+2\s+when\s+'level_1'\s+then\s+1\s+else\s+0\s+end\s+desc\s*,\s*item\.protocolled_at\s+asc\s*,\s*item\.id\s+asc/i,
    );
  });

  for (const [command, state, role, code] of [
    ['admit', 'EM_INSTRUCAO', 'rait-analyst', 'RAIT.CASE_STATE_INVALID'],
    [
      'non-admission',
      'EM_INSTRUCAO',
      'rait-analyst',
      'RAIT.CASE_STATE_INVALID',
    ],
    ['remit', 'EM_INSTRUCAO', 'rait-secretary', 'RAIT.REMIT_NOT_ADMITTED'],
    ['receive', 'ADMITIDO', 'rait-secretary', 'RAIT.CASE_STATE_INVALID'],
    ['ready', 'ADMITIDO', 'rait-analyst', 'RAIT.CASE_STATE_INVALID'],
    [
      'decide',
      'EM_INSTRUCAO',
      'rait-signing-authority',
      'RAIT.CASE_STATE_INVALID',
    ],
    [
      'return-draft',
      'EM_INSTRUCAO',
      'rait-signing-authority',
      'RAIT.CASE_STATE_INVALID',
    ],
    [
      'withdraw',
      'DECIDIDO_AUTORIDADE',
      'rait-secretary',
      'RAIT.WITHDRAWAL_AFTER_DECISION',
    ],
    ['redirect', 'EM_INSTRUCAO', 'rait-secretary', 'RAIT.CASE_STATE_INVALID'],
    [
      'resolve-pending',
      'EM_INSTRUCAO',
      'rait-secretary',
      'RAIT.CASE_STATE_INVALID',
    ],
    ['claim-next', 'EM_INSTRUCAO', 'rait-analyst', 'RAIT.QUEUE_EMPTY'],
  ] as const) {
    it(`dado ${state} quando ${command} é executado então retorna ${code} sem escrita`, async () => {
      const runtime = await caseRuntime(
        state,
        command === 'decide' ? 'defesa_previa' : 'jari',
      );
      await expect(
        runtime.service.execute(
          request(
            command,
            role,
            VALID_PAYLOADS[command],
            command === 'claim-next' ? POOL : CASE,
          ),
        ),
      ).rejects.toMatchObject({ status: 409, code });
      expect(runtime.updates).toHaveLength(0);
      expect(runtime.outbox).toHaveLength(0);
      expect(runtime.audits).toHaveLength(0);
    });
  }

  it('dado redirect sem transição quando executado então não emite case.changed', async () => {
    const runtime = await caseRuntime('TRIAGEM_ADMISSIBILIDADE', 'jari', false);
    await runtime.service.execute(
      request('redirect', 'rait-secretary', {
        targetBody: '00000000-0000-7000-8000-0000e2000099',
        reason: 'orgao_incompetente',
        receiptDocumentId: DOCUMENT,
      }),
    );
    expect(runtime.outbox).toHaveLength(0);
  });
  it('dado resolve-pending quando conclui a pendência então emite case.changed uma vez', async () => {
    const runtime = await caseRuntime('TRIAGEM_ADMISSIBILIDADE');
    await runtime.service.execute(
      request('resolve-pending', 'rait-secretary', {
        pendingId: DRAFT,
        documentIds: [DOCUMENT],
      }),
    );
    expect(runtime.outbox).toHaveLength(1);
    expect(runtime.outbox[0]?.[1]).toBe('rait.case.changed');
  });
  it('dado uma chave opaca repetida quando admit é reexecutado então preserva uma só atualização, outbox e auditoria', async () => {
    const runtime = await caseRuntime('TRIAGEM_ADMISSIBILIDADE');
    const input = request('admit', 'rait-analyst');
    const first = await runtime.service.execute(input);
    await expect(runtime.service.execute(input)).resolves.toEqual(first);
    expect(runtime.updates).toHaveLength(1);
    expect(runtime.outbox).toHaveLength(2);
    expect(runtime.audits).toHaveLength(1);
  });
  it('dado chave opaca já usada com target diferente quando executado então retorna replay sem outra escrita', async () => {
    const runtime = await caseRuntime('TRIAGEM_ADMISSIBILIDADE');
    await runtime.service.execute(request('admit', 'rait-analyst'));
    await expect(
      runtime.service.execute(request('admit', 'rait-analyst', {}, POOL)),
    ).rejects.toMatchObject({ status: 409, code: 'RAIT.IDEMPOTENCY_REPLAY' });
    expect(runtime.outbox).toHaveLength(2);
  });
  it('dado If-Match ausente ou divergente quando admit é executado então retorna 428 ou 412 sem escrita', async () => {
    const missing = await caseRuntime('TRIAGEM_ADMISSIBILIDADE');
    await expect(
      missing.service.execute({
        ...request('admit', 'rait-analyst'),
        headers: { 'Idempotency-Key': 'opaque-missing' },
      }),
    ).rejects.toMatchObject({ status: 428, code: 'RAIT.IF_MATCH_REQUIRED' });
    const stale = await caseRuntime('TRIAGEM_ADMISSIBILIDADE');
    await expect(
      stale.service.execute({
        ...request('admit', 'rait-analyst'),
        headers: { 'If-Match': '"7"', 'Idempotency-Key': 'opaque-stale' },
      }),
    ).rejects.toMatchObject({
      status: 412,
      code: 'RAIT.VERSION_CONFLICT',
      context: { currentVersion: 1 },
    });
    expect(missing.query).not.toHaveBeenCalled();
    expect(stale.updates).toHaveLength(0);
  });
});

describe('CTG-0001 — diligências na porta SQL transacional', () => {
  for (const [command, role, payload, state, eventCount] of [
    [
      'answer',
      'rait-analyst',
      { documentIds: [DOCUMENT], answeredOn: '2026-09-14' },
      'EM_INSTRUCAO',
      2,
    ],
    [
      'extend',
      'rait-rapporteur',
      { reason: 'fundamento canônico' },
      'DILIGENCIA',
      2,
    ],
  ] as const) {
    it(`dado diligência aberta quando ${command} é executado então atualiza com lock, outbox e audit.write`, async () => {
      const runtime = await inquiryRuntime();
      const result = await runtime.service.execute(
        request(command, role, payload, INQUIRY),
      );
      expect(result.data).toMatchObject({
        caseId: CASE,
        caseVersion: 2,
      });
      expect(result.events).toHaveLength(eventCount);
      expect(runtime.outbox).toHaveLength(eventCount);
      expect(runtime.audits).toEqual([
        [
          TENANT,
          ACTOR,
          role,
          `INF_RAIT_INQUIRY_${command.toUpperCase()}`,
          'inf.rait_inquiry',
          INQUIRY,
          JSON.stringify({ command }),
        ],
      ]);
      expect(
        runtime.queries.find(({ sql }) => sql.startsWith('select audit.write'))
          ?.sql,
      ).toBe(
        'select audit.write($1, $2, $3, $4, $5, $6, $7, null, null, null)',
      );
      expect(
        runtime.queries.some(
          ({ sql, values }) =>
            sql.includes('for update of inquiry, item') &&
            values[0] === TENANT &&
            values[1] === INQUIRY,
        ),
      ).toBe(true);
    });
  }
  it('dado diligência respondida quando answer é executado então retorna RAIT.INQUIRY_ALREADY_CLOSED sem escrita', async () => {
    const runtime = await inquiryRuntime({
      answered_at: '2026-09-14T00:00:00.000Z',
    });
    await expect(
      runtime.service.execute(
        request('answer', 'rait-analyst', VALID_PAYLOADS.answer, INQUIRY),
      ),
    ).rejects.toMatchObject({
      status: 409,
      code: 'RAIT.INQUIRY_ALREADY_CLOSED',
    });
    expect(runtime.outbox).toHaveLength(0);
    expect(runtime.audits).toHaveLength(0);
  });
  it('dado diligência já estendida quando extend é executado então retorna RAIT.INQUIRY_EXTENSION_LIMIT sem escrita', async () => {
    const runtime = await inquiryRuntime({ extension_count: 1 });
    await expect(
      runtime.service.execute(
        request('extend', 'rait-analyst', { reason: 'canônica' }, INQUIRY),
      ),
    ).rejects.toMatchObject({
      status: 422,
      code: 'RAIT.INQUIRY_EXTENSION_LIMIT',
    });
    expect(runtime.outbox).toHaveLength(0);
  });
  it('dado principal humano quando expire é chamado então retorna RAIT.FORBIDDEN_ACTION antes da transação', async () => {
    const runtime = await inquiryRuntime();
    await expect(
      runtime.service.execute(request('expire', 'rait-analyst', {}, INQUIRY)),
    ).rejects.toMatchObject({ status: 403, code: 'RAIT.FORBIDDEN_ACTION' });
    expect(runtime.query).not.toHaveBeenCalled();
  });
});

describe('CTG-0001 — controladores por metadata e execução', () => {
  it('dado os controladores quando carregados então expõem os recursos e ações canônicos', async () => {
    const { RaitCaseCommandsController } =
      await import('../../src/handwritten/rait-case-commands.controller.js');
    const { RaitInquiryCommandsController } =
      await import('../../src/handwritten/rait-inquiry-commands.controller.js');
    expect(
      Reflect.getMetadata(
        DETRAN_RESOURCE_METADATA_KEY,
        RaitCaseCommandsController,
      ),
    ).toBe('inf:rait-case');
    expect(
      Reflect.getMetadata(
        DETRAN_RESOURCE_METADATA_KEY,
        RaitInquiryCommandsController,
      ),
    ).toBe('inf:rait-inquiry');
    expect(
      Reflect.getMetadata(
        DETRAN_ACTION_METADATA_KEY,
        RaitCaseCommandsController.prototype.decide,
      ),
    ).toBe('sign');
    expect(
      Reflect.getMetadata(
        DETRAN_RESOURCE_METADATA_KEY,
        RaitCaseCommandsController.prototype.decide,
      ),
    ).toBe('inf:rait-decision');
    expect(
      Reflect.getMetadata(
        DETRAN_ACTION_METADATA_KEY,
        RaitInquiryCommandsController.prototype.answer,
      ),
    ).toBe('answer-inquiry');
    expect(
      Reflect.getMetadata(
        DETRAN_RESOURCE_METADATA_KEY,
        RaitInquiryCommandsController.prototype.answer,
      ),
    ).toBe('inf:rait-case');
    expect(
      Reflect.getMetadata(
        DETRAN_RESOURCE_METADATA_KEY,
        RaitInquiryCommandsController.prototype.extend,
      ),
    ).toBe('inf:rait-case');
  });
  it('dado controller quando executa admit então delega corpo e cabeçalhos e propaga ETag', async () => {
    const { RaitCaseCommandsController } =
      await import('../../src/handwritten/rait-case-commands.controller.js');
    const execute = vi.fn(async () => ({
      data: { id: CASE },
      events: [],
      etag: '"2"',
    }));
    const setHeader = vi.fn();
    const controller = new RaitCaseCommandsController({ execute } as never);
    await expect(
      controller.admit(CASE, {}, '"1"', 'opaque-controller', { setHeader }),
    ).resolves.toMatchObject({ data: { id: CASE } });
    expect(execute).toHaveBeenCalledWith(
      expect.objectContaining({
        command: 'admit',
        targetId: CASE,
        payload: {},
        headers: { 'If-Match': '"1"', 'Idempotency-Key': 'opaque-controller' },
      }),
    );
    expect(setHeader).toHaveBeenCalledWith('ETag', '"2"');
  });
});

describe('CTG-0001 — fronteira autenticada e DI Nest', () => {
  it('dado principal autenticado quando controller protocola então o encaminha separado de payload e cabeçalhos', async () => {
    const { RaitCaseCommandsController } =
      await import('../../src/handwritten/rait-case-commands.controller.js');
    const protocol = vi.fn(async () => ({
      data: { id: CASE },
      events: [],
      etag: '"1"',
    }));
    const setHeader = vi.fn();
    const principal = {
      id: ACTOR,
      roles: ['rait-secretary'],
      permissions: ['*'],
      tenants: [TENANT],
    };
    const controller = new RaitCaseCommandsController({
      protocol,
    } as never) as unknown as {
      protocol(
        payload: Record<string, unknown>,
        key: string | undefined,
        response: { setHeader(name: string, value: string): unknown },
        request: { principal: typeof principal },
      ): Promise<unknown>;
    };

    await controller.protocol(
      {
        ait_id: AIT,
        protocol_number: 'RAIT-UNIT-IDENTITY-0001',
        instance: 'defesa_previa',
        circuit: 1,
        intake_channel: 'portal',
        protocolled_at: '2026-09-15T12:00:00.000Z',
        documents: [],
        proofs: [],
      },
      'opaque-protocol-identity',
      { setHeader },
      { principal },
    );

    expect(protocol).toHaveBeenCalledWith({
      payload: expect.any(Object),
      headers: { 'Idempotency-Key': 'opaque-protocol-identity' },
      principal,
    });
    expect(setHeader).toHaveBeenCalledWith('ETag', '"1"');
  });

  it.each([
    ['principal ausente', undefined],
    [
      'principal com ator divergente',
      {
        id: '00000000-0000-4000-8000-0000b0000008',
        roles: ['rait-secretary'],
        permissions: [],
        tenants: [TENANT],
      },
    ],
  ])(
    'dado %s quando serviço protocola então falha antes de abrir transação',
    async (_caseName, principal) => {
      activeRole = 'rait-secretary';
      const runtime = await caseRuntime('TRIAGEM_ADMISSIBILIDADE');
      await expect(
        runtime.service.protocol({
          payload: {
            ait_id: AIT,
            protocol_number: 'RAIT-UNIT-IDENTITY-0002',
            instance: 'defesa_previa',
            circuit: 1,
            intake_channel: 'portal',
            protocolled_at: '2026-09-15T12:00:00.000Z',
            documents: [],
            proofs: [],
          },
          headers: { 'Idempotency-Key': 'opaque-protocol-principal' },
          principal,
        } as never),
      ).rejects.toMatchObject({ status: 403, code: 'RAIT.FORBIDDEN_ACTION' });
      expect(runtime.query).not.toHaveBeenCalled();
    },
  );

  it('dado um comando quando o body tenta fornecer identidade autenticada então rejeita antes da transação', async () => {
    for (const field of ['tenantId', 'actorId', 'roles', 'policy'] as const) {
      const runtime = await caseRuntime('TRIAGEM_ADMISSIBILIDADE');
      await expect(
        runtime.service.execute(
          request('admit', 'rait-analyst', { [field]: 'untrusted' }),
        ),
      ).rejects.toMatchObject({ status: 400, code: 'RAIT.VALIDATION_FAILED' });
      expect(runtime.query).not.toHaveBeenCalled();
    }
  });

  it('dado os serviços de comando quando carregados pelo Nest então declaram providers concretos e Injectable', async () => {
    const { Database } = await import('@stynx-nyx/data');
    const { RequestContext } = await import('@stynx-nyx/core');
    const { RaitCaseCommandService } =
      await import('../../src/handwritten/rait-case-command.service.js');
    const { RaitInquiryCommandService } =
      await import('../../src/handwritten/rait-inquiry-command.service.js');
    const { RaitDeadlineEngineFactory } =
      await import('../../src/handwritten/rait-case-command.service.js');
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
      RaitDeadlineEngineFactory,
      RaitDocumentTrustVerifier,
      RaitOperationClock,
    ]);
    expect(
      Reflect.getMetadata('design:paramtypes', RaitInquiryCommandService),
    ).toEqual([Database, RequestContext, RaitDeadlineEngineFactory]);
  });
});
