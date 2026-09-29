// R-0009 CTG-0002 §2.3, §3, §4, §5, §11 e §13 (TASK-0006) — C-0002-09…29:
// `PortalRequestsService` (create, updateDraft, submit §3.1, withdraw,
// respondDiligence, evaluate), `DRAFT_SCHEMAS` (§3.4) e
// `PORTAL_REQUESTS_EVENT_SCHEMAS` (§11). Fica vermelho até TASK-0007 criar
// `requests.service.ts`, `delegation/delegation.service.ts`, `drafts.ts`,
// `events.ts`, `protocol.ts` e `idempotency.service.ts` (§14).
//
// Tx falsa em memória (`tests/support/fake-sql.ts` — subconjunto de SQL no
// cabeçalho daquele arquivo) semeada com as fixtures canônicas de
// `70-fixtures-portal.sql` (CTG-0001 §10); `PortalIdentityService` REAL de
// `@detran/portal-identity` sobre a mesma tx (upsert do sujeito, nível por
// ato, vínculo — já verdes em CTG-0001); relógio fixo 2026-09-14; alvos
// falsos injetados no mapa `PORTAL_DELEGATION_TARGETS` (§3.2 "Teste"):
// `FakeFailingDelegationTarget` (available; `delegate` lança) e o alvo
// `adesao_sne` como espião que reproduz a semântica do
// `SneEnrollmentDelegationTarget` do app (`SNE_CONTACT_REQUIRED` sem
// e-mail/celular; `delegated` com o rascunho) — o alvo real é composição do
// `AppModule` (TASK-0007) e é provado no e2e (C-0002-67).
//
// Formas esperadas pelo spec (constrangimentos do Inspector onde o contrato
// não fixa assinatura; a ordem das dependências do construtor é livre —
// `tests/support/nest-construct.ts`):
//   service.create(tx, identity, body, headers)
//   service.updateDraft(tx, identity, requestId, body, headers)
//   service.submit(tx, identity, requestId, body, headers)          (§3.1)
//   service.withdraw(tx, identity, requestId, body, headers)
//   service.respondDiligence(tx, identity, requestId, inquiryId, body, headers)
//   service.evaluate(tx, identity, requestId, body, headers)
//   headers = { 'idempotency-key'?: string, 'if-match'?: string } (nomes em minúsculas,
//   como o Node os entrega); a resposta é o corpo do §2.3 (ou `{ status, body }`).
//   new ReadServiceDelegationTarget(serviceKey, readResource, targetKinds)
//   new UnavailableDelegationTarget(serviceKey, unavailableReason, targetKinds)  (§3.2)
import { describe, expect, it } from 'vitest';
import { PortalIdentityService, cpfHashOf } from '@detran/portal-identity';
import { DetranError, SqlTeatEventOutbox } from '@detran/shared';

import { FakeSqlDatabase, type Row } from '../../tests/support/fake-sql.js';
import { constructInjectable } from '../../tests/support/nest-construct.js';
import {
  ACT_LEVEL_POLICY_ROWS,
  AITS,
  EXTERNAL,
  FIXED_NOW,
  INFRACTION_VIEWS,
  PRESENTIAL_NOTE,
  REQUEST_FIXTURES,
  REQUEST_STATES,
  SERVICE_CATALOG,
  SNE_EFFECTS,
  SUBJECTS,
  TENANT_ID,
  TENANT_SLUG,
  TOPICS,
  fakeDatabase,
  fakeRequestContext,
  fixedClock,
  identityOf,
  outboxEnvelopes,
  type IdentityLike,
} from '../../tests/support/portal-fixtures.js';
import {
  PORTAL_DELEGATION_TARGETS,
  ReadServiceDelegationTarget,
  RequestDelegationService,
  UnavailableDelegationTarget,
  type DelegationInput,
  type DelegationResult,
  type DelegationTarget,
} from './delegation/delegation.service.js';
import { DRAFT_SCHEMAS } from './drafts.js';
import { PORTAL_REQUESTS_EVENT_SCHEMAS } from './events.js';
import { PortalIdempotencyService } from './idempotency.service.js';
import { PortalRequestsService } from './requests.service.js';

const REQ = {
  identificado: '00000000-0000-7000-8000-000070400001',
  servicoSelecionado: '00000000-0000-7000-8000-000070400002',
  elegibilidadeVerificada: '00000000-0000-7000-8000-000070400003',
  inelegivel: '00000000-0000-7000-8000-000070400004',
  emComposicao: '00000000-0000-7000-8000-000070400005',
  aguardandoNivel: '00000000-0000-7000-8000-000070400006',
  aguardandoPagamento: '00000000-0000-7000-8000-000070400007',
  protocolado: '00000000-0000-7000-8000-000070400008',
  emAndamento: '00000000-0000-7000-8000-000070400009',
  resultadoDisponivel: '00000000-0000-7000-8000-00007040000a',
  avaliacaoOferecida: '00000000-0000-7000-8000-00007040000b',
  concluido: '00000000-0000-7000-8000-00007040000c',
  desistido: '00000000-0000-7000-8000-00007040000d',
} as const;

const DRAFT_FIXTURE_ID = '00000000-0000-7000-8000-000070500001';
const REASON_R0007 = 'delegacao_indisponivel_r0007';
const REASON_PRIVACY = 'privacy_endpoint_pendente';
const REASON_SIGNED_DOCUMENT = 'documento_assinado_pendente_r0014';

const SUBJECT_BY_ID: Record<string, keyof typeof SUBJECTS> = Object.fromEntries(
  Object.entries(SUBJECTS).map(([key, subject]) => [subject.id, key]),
) as Record<string, keyof typeof SUBJECTS>;

/** CTG-0001 §10.3 — as 12 linhas de `portal.entitlement`. */
const ENTITLEMENTS: Row[] = [
  ['01', SUBJECTS.bronze.id, 'owner', 'ait', AITS.f1, 'infraction'],
  ['02', SUBJECTS.prata.id, 'owner', 'ait', AITS.f2, 'infraction'],
  ['03', SUBJECTS.prata.id, 'owner', 'ait', AITS.f3, 'infraction'],
  ['04', SUBJECTS.prata.id, 'owner', 'ait', AITS.f5, 'infraction'],
  ['05', SUBJECTS.prata.id, 'owner', 'ait', AITS.f10, 'infraction'],
  ['06', SUBJECTS.ouro.id, 'owner', 'ait', AITS.f6, 'infraction'],
  ['07', SUBJECTS.ouro.id, 'owner', 'ait', AITS.f12, 'infraction'],
  ['08', SUBJECTS.qualificada.id, 'driver', 'ait', AITS.f9, 'infraction'],
  [
    '09',
    SUBJECTS.procurador.id,
    'representative',
    'ait',
    AITS.f2,
    'representation',
  ],
  ['0a', SUBJECTS.ouro.id, 'owner', 'vehicle', EXTERNAL.vehicle, 'renavam'],
  ['0b', SUBJECTS.ouro.id, 'interested_party', 'exam', EXTERNAL.exam, 'manual'],
  [
    '0c',
    SUBJECTS.qualificada.id,
    'interested_party',
    'crash',
    EXTERNAL.crash,
    'manual',
  ],
].map(([nn, subjectId, relation, targetKind, targetId, origin]) => ({
  id: `00000000-0000-7000-8000-0000702000${nn}`,
  subject_id: subjectId,
  relation,
  target_kind: targetKind,
  target_id: targetId,
  origin,
  valid_from: '2026-01-01',
  valid_until: nn === '09' ? '2027-09-14' : null,
}));

const SUBJECT_ROWS: Row[] = Object.values(SUBJECTS).map((subject) => ({
  id: subject.id,
  cpf_hash: subject.cpfHash,
  name: `${subject.id.slice(-2)} (fixture)`,
  govbr_level_observed: null,
  assurance_level_observed: subject.assurance,
  observed_at: FIXED_NOW,
  version: 1,
}));

class FakeFailingDelegationTarget implements DelegationTarget {
  readonly calls: DelegationInput[] = [];
  constructor(
    readonly serviceKey: string,
    readonly targetKinds: readonly (
      'ait' | 'case' | 'vehicle' | 'exam' | 'crash' | 'none'
    )[],
    private readonly error: () => Error = () => {
      const error = new Error('alvo falso: falha simulada');
      error.name = 'FakeFailingDelegationTarget';
      return error;
    },
  ) {}
  availability(): string | null {
    return null;
  }
  async delegate(input: DelegationInput): Promise<DelegationResult> {
    this.calls.push(input);
    throw this.error();
  }
}

/** Alvo disponível que delega (C-0002-20 e espião de `adesao_sne`). */
class FakeAvailableTarget implements DelegationTarget {
  readonly calls: DelegationInput[] = [];
  constructor(
    readonly serviceKey: string,
    readonly targetKinds: readonly (
      'ait' | 'case' | 'vehicle' | 'exam' | 'crash' | 'none'
    )[],
    private readonly result: (input: DelegationInput) => DelegationResult,
  ) {}
  availability(): string | null {
    return null;
  }
  async delegate(input: DelegationInput): Promise<DelegationResult> {
    this.calls.push(input);
    return this.result(input);
  }
}

/** Reproduz a semântica do alvo do app (§3.2 `adesao_sne`): erros do serviço viram 502. */
function fakeSneTarget(): FakeAvailableTarget {
  return new FakeAvailableTarget('adesao_sne', ['none'], (input) => {
    const draft = input.draft as { email?: string; phone?: string };
    if (!draft.email && !draft.phone) {
      throw new DetranError('PORTAL.SNE_CONTACT_REQUIRED', {
        status: 422,
        context: { missing: ['email', 'phone'] },
      });
    }
    return {
      domain: 'portal',
      command: 'portal:sne-enrollment:enroll',
      externalId: '00000000-0000-7000-8000-000070e00001',
      status: 'delegated',
    };
  });
}

function defaultTargets(
  overrides: Record<string, DelegationTarget> = {},
): Map<string, DelegationTarget> {
  const targets = new Map<string, DelegationTarget>();
  const unavailable = (
    key: string,
    reason: string,
    kinds: DelegationTarget['targetKinds'],
  ) => targets.set(key, new UnavailableDelegationTarget(key, reason, kinds));
  unavailable('defesa_previa', REASON_R0007, ['ait']);
  unavailable('recurso_jari', REASON_R0007, ['ait', 'case']);
  unavailable('recurso_cetran', REASON_R0007, ['case']);
  unavailable('indicacao_condutor', REASON_R0007, ['ait']);
  unavailable('pagamento', REASON_R0007, ['ait']);
  unavailable('junta_medica', REASON_R0007, ['exam']);
  unavailable('lgpd_declaracao', REASON_PRIVACY, ['none']);
  unavailable('emissao_crlv', REASON_SIGNED_DOCUMENT, ['vehicle']);
  unavailable('inf:rait-case:answer-inquiry', REASON_R0007, ['case']);
  targets.set('adesao_sne', fakeSneTarget());
  targets.set(
    'cancelamento_sne',
    new FakeAvailableTarget('cancelamento_sne', ['none'], () => ({
      domain: 'portal',
      command: 'portal:sne-enrollment:cancel',
      externalId: '00000000-0000-7000-8000-000070e00001',
      status: 'delegated',
    })),
  );
  targets.set(
    'consulta_multas',
    new ReadServiceDelegationTarget('consulta_multas', 'ait', ['none', 'ait']),
  );
  targets.set(
    'consulta_cnh',
    new ReadServiceDelegationTarget('consulta_cnh', 'document', ['none']),
  );
  targets.set(
    'consulta_bat',
    new ReadServiceDelegationTarget('consulta_bat', 'crash', ['crash']),
  );
  targets.set(
    'consulta_exame',
    new ReadServiceDelegationTarget('consulta_exame', 'exam', ['exam']),
  );
  for (const [key, target] of Object.entries(overrides))
    targets.set(key, target);
  return targets;
}

interface Harness {
  db: FakeSqlDatabase;
  service: PortalRequestsService;
  call: <T = Row>(method: string, ...args: unknown[]) => Promise<T>;
}

function harness(
  options: {
    targets?: Record<string, DelegationTarget>;
    catalog?: (rows: Row[]) => Row[];
    fixtures?: (rows: Row[]) => Row[];
  } = {},
): Harness {
  const db = new FakeSqlDatabase({
    tenantId: TENANT_ID,
    tenant: { slug: TENANT_SLUG },
    now: fixedClock.now,
    sequences: { 'portal.protocol_seq': 14 },
  });
  db.seed('portal.subject', SUBJECT_ROWS);
  db.seed('portal.entitlement', ENTITLEMENTS);
  db.seed('portal.act_level_policy', ACT_LEVEL_POLICY_ROWS);
  db.seed(
    'portal.service_catalog',
    (options.catalog ?? ((rows) => rows))(SERVICE_CATALOG),
  );
  db.seed('portal.infraction_view', INFRACTION_VIEWS);
  db.seed(
    'portal.request',
    (options.fixtures ?? ((rows) => rows))(
      REQUEST_FIXTURES.map((row) => ({ ...row })),
    ),
  );
  db.seed('portal.request_draft', [
    {
      id: DRAFT_FIXTURE_ID,
      request_id: REQ.emComposicao,
      version: 1,
      payload_json: {},
      saved_at: FIXED_NOW,
    },
  ]);
  db.seed(
    'portal.protocol',
    [
      REQ.protocolado,
      REQ.emAndamento,
      REQ.resultadoDisponivel,
      REQ.avaliacaoOferecida,
      REQ.concluido,
    ].map((requestId, index) => ({
      id: `00000000-0000-7000-8000-0000706000${(index + 1).toString(16).padStart(2, '0')}`,
      request_id: requestId,
      number: `AM-FIXTURES-2026-${String(index + 1).padStart(7, '0')}`,
      issued_at: new Date(`2026-09-0${index + 1}T12:00:00-04:00`),
      receipt_hash: 'a'.repeat(64),
    })),
  );

  const identity = new PortalIdentityService(fixedClock as never);
  const delegation = constructInjectable(RequestDelegationService, {
    PORTAL_DELEGATION_TARGETS: defaultTargets(options.targets),
  });
  const idempotency = constructInjectable(PortalIdempotencyService, {
    PortalClock: fixedClock,
  });
  const outbox = new SqlTeatEventOutbox();
  const providers = {
    PortalIdentityService: identity,
    RequestDelegationService: delegation,
    PortalIdempotencyService: idempotency,
    PortalClock: fixedClock,
    Database: fakeDatabase(db.tx),
    RequestContext: fakeRequestContext(),
    SqlTeatEventOutbox: outbox,
    TEAT_EVENT_OUTBOX: outbox,
  };
  const service = constructInjectable(PortalRequestsService, providers);
  const call = async <T = Row>(
    method: string,
    ...args: unknown[]
  ): Promise<T> => {
    const fn = (service as unknown as Record<string, unknown>)[method];
    if (typeof fn !== 'function') {
      throw new Error(
        `PortalRequestsService não expõe ${method} (CTG-0002 §14)`,
      );
    }
    const result = (await (
      fn as (...values: unknown[]) => Promise<unknown>
    ).call(service, db.tx, ...args)) as Row;
    return result &&
      typeof result === 'object' &&
      'body' in result &&
      !('requestId' in result)
      ? (result.body as T)
      : (result as T);
  };
  return { db, service, call };
}

let keyCounter = 0;
const key = () => {
  keyCounter += 1;
  return `k-${keyCounter}`;
};
const headers = (extra: Record<string, string> = {}) => ({
  'idempotency-key': key(),
  ...extra,
});

const SIGNATURE = { signature: { method: 'govbr', signatureRef: 'ref' } };
const CONSEQUENCE_ACK = {
  consequenceAck: { textVersion: '1', acceptedAt: '2026-09-14T15:00:00.000Z' },
};
const SNE_DRAFT = {
  email: 'prata@fixtures.invalid',
  consent: { textVersion: '1', effectsAck: [...SNE_EFFECTS] },
};

async function createRequest(
  h: Harness,
  identity: IdentityLike,
  body: Record<string, unknown>,
): Promise<{ requestId: string; version: number; state: string }> {
  const created = await h.call<{
    requestId: string;
    version: number;
    state: string;
  }>('create', identity, body, headers());
  expect(created.state).toBe('PEDIDO_EM_COMPOSICAO');
  return created;
}

function requestRow(h: Harness, id: string): Row {
  const row = h.db
    .rows('portal.request')
    .find((candidate) => candidate.id === id);
  if (!row) throw new Error(`request ${id} ausente`);
  return row;
}

function domainEvents(h: Harness, topic: string): string[] {
  return outboxEnvelopes(h.db, topic).map((envelope) =>
    String(envelope.domainEvent),
  );
}

describe('CTG-0002 §3.1 — submit: protocolo imediato, delegação e 502 (C-0002-09…16)', () => {
  it("C-0002-09 — dado request PEDIDO_EM_COMPOSICAO de consulta_multas e alvo falso que lança quando submit então portal.protocol, state 'PROTOCOLADO', delegation_status 'failed', delegation_error = código, SOLICITACAO_PROTOCOLADA na outbox, idempotência 502 e 502 PORTAL.DELEGATION_FAILED { protocol, retryPolicy: 'pendencia_interna' }", async () => {
    const failing = new FakeFailingDelegationTarget('consulta_multas', [
      'none',
      'ait',
    ]);
    const h = harness({ targets: { consulta_multas: failing } });
    const prata = identityOf('prata');
    const { requestId } = await createRequest(h, prata, {
      serviceKey: 'consulta_multas',
      targetKind: 'none',
      channel: 'portal',
    });

    const submitHeaders = headers();
    await expect(
      h.call('submit', prata, requestId, SIGNATURE, submitHeaders),
    ).rejects.toMatchObject({
      code: 'PORTAL.DELEGATION_FAILED',
      status: 502,
      context: {
        protocol: 'AM-FIXTURES-2026-0000015',
        retryPolicy: 'pendencia_interna',
      },
    });

    const protocol = h.db
      .rows('portal.protocol')
      .find((row) => row.request_id === requestId);
    expect(protocol).toMatchObject({
      number: 'AM-FIXTURES-2026-0000015',
      channel: 'portal',
    });
    expect(String(protocol!.receipt_hash)).toMatch(/^[0-9a-f]{64}$/);
    expect(requestRow(h, requestId)).toMatchObject({
      state: 'PROTOCOLADO',
      delegation_status: 'failed',
      delegation_error: 'FakeFailingDelegationTarget',
    });
    expect(failing.calls).toHaveLength(1);
    expect(domainEvents(h, TOPICS.requestChanged)).toContain(
      'SOLICITACAO_PROTOCOLADA',
    );
    const record = h.db
      .rows('portal.idempotency_record')
      .find(
        (row) =>
          row.key ===
          `${SUBJECTS.prata.id}:${submitHeaders['idempotency-key']}`,
      );
    expect(record).toMatchObject({ status: 502 });
    expect((record!.response_json as Row).code).toBe(
      'PORTAL.DELEGATION_FAILED',
    );
  });

  it("C-0002-10 — dado request adesao_sne com rascunho sem email/phone quando submit com consequenceAck então protocola ANTES e 502 DELEGATION_FAILED com delegation_error 'PORTAL.SNE_CONTACT_REQUIRED'", async () => {
    const h = harness();
    const ouro = identityOf('ouro');
    const { requestId } = await createRequest(h, ouro, {
      serviceKey: 'adesao_sne',
      targetKind: 'none',
      channel: 'portal',
    });
    await h.call(
      'updateDraft',
      ouro,
      requestId,
      { consent: SNE_DRAFT.consent },
      headers({ 'if-match': '"1"' }),
    );

    await expect(
      h.call(
        'submit',
        ouro,
        requestId,
        { ...SIGNATURE, ...CONSEQUENCE_ACK },
        headers(),
      ),
    ).rejects.toMatchObject({ code: 'PORTAL.DELEGATION_FAILED', status: 502 });

    expect(
      h.db.rows('portal.protocol').some((row) => row.request_id === requestId),
    ).toBe(true);
    expect(requestRow(h, requestId)).toMatchObject({
      state: 'PROTOCOLADO',
      delegation_status: 'failed',
      delegation_error: 'PORTAL.SNE_CONTACT_REQUIRED',
    });
  });

  it("C-0002-11 — dado identity 'simples' e ato adesao_sne ('avancada') quando submit então 'AGUARDANDO_NIVEL_ASSINATURA' persistido, minimum_assurance 'avancada', 403 ASSURANCE_INSUFFICIENT { actKey, resumeRoute } e NENHUM registro de idempotência", async () => {
    const h = harness();
    const ouroSimples = identityOf('ouro', 'simples');
    const { requestId } = await createRequest(h, ouroSimples, {
      serviceKey: 'adesao_sne',
      targetKind: 'none',
      channel: 'portal',
    });

    await expect(
      h.call(
        'submit',
        ouroSimples,
        requestId,
        { ...SIGNATURE, ...CONSEQUENCE_ACK },
        headers(),
      ),
    ).rejects.toMatchObject({
      code: 'PORTAL.ASSURANCE_INSUFFICIENT',
      status: 403,
      context: {
        actKey: 'adesao_sne',
        required: 'avancada',
        current: 'simples',
        resumeRoute: `/v1/portal/requests/${requestId}`,
      },
    });

    expect(requestRow(h, requestId)).toMatchObject({
      state: 'AGUARDANDO_NIVEL_ASSINATURA',
      minimum_assurance: 'avancada',
      version: 2,
    });
    expect(
      h.db.rows('portal.protocol').some((row) => row.request_id === requestId),
    ).toBe(false);
    expect(
      h.db
        .rows('portal.idempotency_record')
        .filter((row) => String(row.route).includes('submit')),
    ).toHaveLength(0);
  });

  it("C-0002-12 — dado request AGUARDANDO_NIVEL_ASSINATURA e identity 'avancada' quando submit então PROTOCOLADO → EM_ANDAMENTO_NO_ORGAO (A1(c))", async () => {
    const h = harness();
    h.db.seed('portal.request_draft', [
      {
        request_id: REQ.aguardandoNivel,
        version: 1,
        payload_json: SNE_DRAFT,
        saved_at: FIXED_NOW,
      },
    ]);
    const bronzeElevado = identityOf('bronze', 'avancada');
    const response = await h.call<{
      state: string;
      delegation: Row;
      protocol: Row;
    }>(
      'submit',
      bronzeElevado,
      REQ.aguardandoNivel,
      { ...SIGNATURE, ...CONSEQUENCE_ACK },
      headers(),
    );
    expect(response.state).toBe('EM_ANDAMENTO_NO_ORGAO');
    expect(response.delegation).toMatchObject({ status: 'delegated' });
    expect(response.protocol).toMatchObject({ channel: 'portal' });
    expect(requestRow(h, REQ.aguardandoNivel)).toMatchObject({
      state: 'EM_ANDAMENTO_NO_ORGAO',
      delegation_status: 'delegated',
      delegation_domain: 'portal',
      delegation_command: 'portal:sne-enrollment:enroll',
    });
    expect(domainEvents(h, TOPICS.requestChanged)).toContain(
      'SOLICITACAO_PROTOCOLADA',
    );
  });

  it("C-0002-13 — dado consulta_multas (ReadServiceDelegationTarget) quando submit então delegation_status 'not_applicable', state final 'AVALIACAO_OFERECIDA', version incrementada por transição e resposta.state = 'AVALIACAO_OFERECIDA'", async () => {
    const h = harness();
    const prata = identityOf('prata');
    const { requestId } = await createRequest(h, prata, {
      serviceKey: 'consulta_multas',
      targetKind: 'none',
      channel: 'portal',
    });

    const response = await h.call<{
      state: string;
      version: number;
      delegation: Row;
      protocol: Row;
    }>('submit', prata, requestId, SIGNATURE, headers());
    expect(response.state).toBe('AVALIACAO_OFERECIDA');
    expect(response.delegation).toMatchObject({ status: 'not_applicable' });
    expect(response.protocol).toMatchObject({
      number: 'AM-FIXTURES-2026-0000015',
      channel: 'portal',
    });
    // 1 (create) → PROTOCOLADO 2 → EM_ANDAMENTO_NO_ORGAO 3 → RESULTADO_DISPONIVEL 4 → AVALIACAO_OFERECIDA 5
    expect(requestRow(h, requestId)).toMatchObject({
      state: 'AVALIACAO_OFERECIDA',
      delegation_status: 'not_applicable',
      delegation_domain: 'portal',
      delegation_command: 'portal:ait:read',
      version: 5,
    });
    expect(response.version).toBe(5);
  });

  it('C-0002-14 — dado adesao_sne sem consequenceAck quando submit então 422 PORTAL.REQUEST_CONSEQUENCE_ACK_REQUIRED { textVersion: null } e nenhum protocolo', async () => {
    const h = harness();
    const ouro = identityOf('ouro');
    const { requestId } = await createRequest(h, ouro, {
      serviceKey: 'adesao_sne',
      targetKind: 'none',
      channel: 'portal',
    });
    await h.call(
      'updateDraft',
      ouro,
      requestId,
      SNE_DRAFT,
      headers({ 'if-match': '"1"' }),
    );

    await expect(
      h.call('submit', ouro, requestId, SIGNATURE, headers()),
    ).rejects.toMatchObject({
      code: 'PORTAL.REQUEST_CONSEQUENCE_ACK_REQUIRED',
      status: 422,
      context: { textVersion: null },
    });
    expect(
      h.db.rows('portal.protocol').some((row) => row.request_id === requestId),
    ).toBe(false);
    expect(requestRow(h, requestId).state).toBe('PEDIDO_EM_COMPOSICAO');
  });

  it("C-0002-15 — dado adesao_sne com consequenceAck quando submit então portal.consequence_ack (kind 'sne', text_version) e o alvo de adesão chamado com o rascunho", async () => {
    const sne = fakeSneTarget();
    const h = harness({ targets: { adesao_sne: sne } });
    const ouro = identityOf('ouro');
    const { requestId } = await createRequest(h, ouro, {
      serviceKey: 'adesao_sne',
      targetKind: 'none',
      channel: 'portal',
    });
    await h.call(
      'updateDraft',
      ouro,
      requestId,
      SNE_DRAFT,
      headers({ 'if-match': '"1"' }),
    );

    const response = await h.call<{ state: string }>(
      'submit',
      ouro,
      requestId,
      {
        ...SIGNATURE,
        consequenceAck: {
          textVersion: 'v-2026',
          acceptedAt: '2026-09-14T15:00:00.000Z',
        },
      },
      headers(),
    );
    expect(response.state).toBe('EM_ANDAMENTO_NO_ORGAO');
    const ack = h.db
      .rows('portal.consequence_ack')
      .find((row) => row.request_id === requestId);
    expect(ack).toMatchObject({ kind: 'sne', text_version: 'v-2026' });
    expect(sne.calls).toHaveLength(1);
    expect(sne.calls[0]!.draft).toEqual(SNE_DRAFT);
    expect(sne.calls[0]!.protocol).toMatchObject({
      number: expect.stringMatching(/^AM-FIXTURES-2026-\d{7}$/),
    });
  });

  it("C-0002-16 — dado cada um dos 11 estados fora de allowed quando submit então 409 PORTAL.REQUEST_STATE_INVALID { state, allowed: ['PEDIDO_EM_COMPOSICAO','AGUARDANDO_NIVEL_ASSINATURA'] }", async () => {
    const allowed = ['PEDIDO_EM_COMPOSICAO', 'AGUARDANDO_NIVEL_ASSINATURA'];
    const rejected = REQUEST_STATES.filter((state) => !allowed.includes(state));
    expect(rejected).toHaveLength(11);
    for (const state of rejected) {
      const h = harness();
      const fixture = REQUEST_FIXTURES.find((row) => row.state === state)!;
      const owner = identityOf(
        SUBJECT_BY_ID[String(fixture.subject_id)]!,
        'avancada',
      );
      await expect(
        h.call(
          'submit',
          owner,
          fixture.id,
          { ...SIGNATURE, ...CONSEQUENCE_ACK },
          headers(),
        ),
        `estado ${state}`,
      ).rejects.toMatchObject({
        code: 'PORTAL.REQUEST_STATE_INVALID',
        status: 409,
        context: { state, allowed },
      });
    }
  });
});

describe('CTG-0002 §2.3 — create: catálogo, alvo, vínculo, rascunho em aberto (C-0002-17…22)', () => {
  it("C-0002-17 — dado serviceKey 'defesa_previa' (catálogo unavailable) quando create então 422 PORTAL.SERVICE_UNAVAILABLE { unavailableReason: 'delegacao_indisponivel_r0007', alternativeChannelNote: <do catálogo> }", async () => {
    const h = harness();
    await expect(
      h.call(
        'create',
        identityOf('prata'),
        {
          serviceKey: 'defesa_previa',
          targetKind: 'ait',
          targetId: AITS.f2,
          channel: 'portal',
        },
        headers(),
      ),
    ).rejects.toMatchObject({
      code: 'PORTAL.SERVICE_UNAVAILABLE',
      status: 422,
      context: {
        unavailableReason: REASON_R0007,
        alternativeChannelNote: PRESENTIAL_NOTE,
      },
    });
    expect(
      h.db
        .rows('portal.request')
        .filter((row) => row.service_key === 'defesa_previa'),
    ).toHaveLength(0);
  });

  it("C-0002-18 — dado 'lgpd_declaracao' então 'privacy_endpoint_pendente'; dado 'emissao_crlv' então 'documento_assinado_pendente_r0014'; dado 'pagamento' (partially_available) então 'delegacao_indisponivel_r0007' (alvo, passo 5)", async () => {
    const h = harness();
    await expect(
      h.call(
        'create',
        identityOf('prata'),
        {
          serviceKey: 'lgpd_declaracao',
          targetKind: 'none',
          channel: 'portal',
        },
        headers(),
      ),
    ).rejects.toMatchObject({
      code: 'PORTAL.SERVICE_UNAVAILABLE',
      context: {
        unavailableReason: REASON_PRIVACY,
        alternativeChannelNote:
          'Somente confirmação de tratamento; declaração completa pendente (OD-P17)',
      },
    });
    await expect(
      h.call(
        'create',
        identityOf('ouro'),
        {
          serviceKey: 'emissao_crlv',
          targetKind: 'vehicle',
          targetId: EXTERNAL.vehicle,
          channel: 'portal',
        },
        headers(),
      ),
    ).rejects.toMatchObject({
      code: 'PORTAL.SERVICE_UNAVAILABLE',
      context: {
        unavailableReason: REASON_SIGNED_DOCUMENT,
        alternativeChannelNote: null,
      },
    });
    await expect(
      h.call(
        'create',
        identityOf('prata'),
        {
          serviceKey: 'pagamento',
          targetKind: 'ait',
          targetId: AITS.f2,
          channel: 'portal',
        },
        headers(),
      ),
    ).rejects.toMatchObject({
      code: 'PORTAL.SERVICE_UNAVAILABLE',
      context: {
        unavailableReason: REASON_R0007,
        alternativeChannelNote:
          'Somente guia PIX/boleto; cartão e parcelamento indisponíveis (OD-P05)',
      },
    });
  });

  it("C-0002-19 — dado 'manifestar' | 'avaliar' quando create então 422 PORTAL.INELIGIBLE { reason: 'servico_com_rota_propria', alternative, serviceKey }", async () => {
    const h = harness();
    for (const [serviceKey, alternative] of [
      ['manifestar', '/v1/portal/manifestations'],
      ['avaliar', '/v1/portal/evaluations'],
    ] as const) {
      await expect(
        h.call(
          'create',
          identityOf('prata'),
          { serviceKey, targetKind: 'none', channel: 'portal' },
          headers(),
        ),
      ).rejects.toMatchObject({
        code: 'PORTAL.INELIGIBLE',
        status: 422,
        context: {
          reason: 'servico_com_rota_propria',
          alternative,
          serviceKey,
        },
      });
    }
  });

  it("C-0002-20 — dado create consulta_multas com targetId sem vínculo então 404 PORTAL.NOT_FOUND { kind: 'ait' }; dado alvo falso DISPONÍVEL para indicacao_condutor, ait em infraction_view e sem vínculo então 422 PORTAL.ENTITLEMENT_REQUIRED { targetKind: 'ait', howToProve: 'procuracao' }", async () => {
    const h = harness();
    // …f0000001 é do bronze (…70200001); prata não tem vínculo
    await expect(
      h.call(
        'create',
        identityOf('prata'),
        {
          serviceKey: 'consulta_multas',
          targetKind: 'ait',
          targetId: AITS.f1,
          channel: 'portal',
        },
        headers(),
      ),
    ).rejects.toMatchObject({
      code: 'PORTAL.NOT_FOUND',
      status: 404,
      context: { kind: 'ait' },
    });

    const available = new FakeAvailableTarget(
      'indicacao_condutor',
      ['ait'],
      () => ({
        domain: 'inf',
        command: 'inf:infraction:indicate-driver',
        externalId: null,
        status: 'delegated',
      }),
    );
    const h2 = harness({
      targets: { indicacao_condutor: available },
      catalog: (rows) =>
        rows.map((row) =>
          row.service_key === 'indicacao_condutor'
            ? {
                ...row,
                availability: 'available',
                unavailable_reason: null,
                alternative_channel_note: null,
              }
            : row,
        ),
    });
    // …f0000002 existe em portal.infraction_view (…70f00001) e é da prata; ouro não tem vínculo
    await expect(
      h2.call(
        'create',
        identityOf('ouro'),
        {
          serviceKey: 'indicacao_condutor',
          targetKind: 'ait',
          targetId: AITS.f2,
          channel: 'portal',
        },
        headers(),
      ),
    ).rejects.toMatchObject({
      code: 'PORTAL.ENTITLEMENT_REQUIRED',
      status: 422,
      context: { targetKind: 'ait', howToProve: 'procuracao' },
    });
    // alvo inexistente na projeção → 404 (disfarce, M10), nunca 422
    await expect(
      h2.call(
        'create',
        identityOf('ouro'),
        {
          serviceKey: 'indicacao_condutor',
          targetKind: 'ait',
          targetId: AITS.f1,
          channel: 'portal',
        },
        headers(),
      ),
    ).rejects.toMatchObject({
      code: 'PORTAL.NOT_FOUND',
      status: 404,
      context: { kind: 'ait' },
    });
  });

  it('C-0002-21 — dado request em PEDIDO_EM_COMPOSICAO do mesmo (serviceKey, targetKind, targetId) quando create então 409 PORTAL.REQUEST_DRAFT_EXISTS { requestId }', async () => {
    const h = harness();
    await expect(
      h.call(
        'create',
        identityOf('prata'),
        { serviceKey: 'adesao_sne', targetKind: 'none', channel: 'portal' },
        headers(),
      ),
    ).rejects.toMatchObject({
      code: 'PORTAL.REQUEST_DRAFT_EXISTS',
      status: 409,
      context: { requestId: REQ.emComposicao },
    });
  });

  it("C-0002-22 — dado serviceKey inexistente então 404 { kind: 'service' }; dado targetKind não admitido pelo serviço então 400 VALIDATION_FAILED { fields: ['targetKind'] }; dado targetKind 'none' com targetId então 400 { fields: ['targetId'] }", async () => {
    const h = harness();
    await expect(
      h.call(
        'create',
        identityOf('prata'),
        { serviceKey: 'nao_existe', targetKind: 'none', channel: 'portal' },
        headers(),
      ),
    ).rejects.toMatchObject({
      code: 'PORTAL.NOT_FOUND',
      status: 404,
      context: { kind: 'service' },
    });
    await expect(
      h.call(
        'create',
        identityOf('prata'),
        {
          serviceKey: 'consulta_cnh',
          targetKind: 'ait',
          targetId: AITS.f2,
          channel: 'portal',
        },
        headers(),
      ),
    ).rejects.toMatchObject({
      code: 'PORTAL.VALIDATION_FAILED',
      status: 400,
      context: { fields: ['targetKind'] },
    });
    await expect(
      h.call(
        'create',
        identityOf('prata'),
        {
          serviceKey: 'consulta_multas',
          targetKind: 'none',
          targetId: AITS.f2,
          channel: 'portal',
        },
        headers(),
      ),
    ).rejects.toMatchObject({
      code: 'PORTAL.VALIDATION_FAILED',
      status: 400,
      context: { fields: ['targetId'] },
    });
  });

  it('§2.3 create (complemento unitário de C-0002-64) — dado create bem-sucedido então 201 { requestId, state, requirements, minimumAssurance, version: 1 }, linha em request_draft version 1 e SOLICITACAO_CRIADA com subjectCpfHash', async () => {
    const h = harness();
    const created = await h.call<Row>(
      'create',
      identityOf('prata'),
      { serviceKey: 'consulta_multas', targetKind: 'none', channel: 'portal' },
      headers(),
    );
    expect(created).toMatchObject({
      state: 'PEDIDO_EM_COMPOSICAO',
      minimumAssurance: 'simples',
      version: 1,
      prefilled: {},
    });
    expect(created.requirements).toEqual(['Conta gov.br']);
    const draft = h.db
      .rows('portal.request_draft')
      .find((row) => row.request_id === created.requestId);
    expect(draft).toMatchObject({ version: 1, payload_json: {} });
    const [event] = outboxEnvelopes(h.db, TOPICS.requestChanged).filter(
      (envelope) => envelope.domainEvent === 'SOLICITACAO_CRIADA',
    );
    expect(event?.data).toMatchObject({
      requestId: created.requestId,
      serviceKey: 'consulta_multas',
      fromState: null,
      toState: 'PEDIDO_EM_COMPOSICAO',
      subjectId: SUBJECTS.prata.id,
      subjectCpfHash: cpfHashOf(SUBJECTS.prata.cpf),
    });
    expect(event?.aggregate).toMatchObject({
      kind: 'portal.request',
      id: created.requestId,
      version: 1,
    });
    expect(JSON.stringify(event?.data)).not.toContain(TENANT_ID);
  });
});

describe('CTG-0002 §2.3 — withdraw, draft, respond, evaluate (C-0002-23…26)', () => {
  it("C-0002-23 — dado withdraw sem If-Match então 428; com If-Match errado então 412 { expected, received }; correto em PEDIDO_EM_COMPOSICAO então 'DESISTIDO', withdrawn_at = relógio, consequence_ack kind 'desistencia', SOLICITACAO_DESISTIDA", async () => {
    const h = harness();
    const prata = identityOf('prata');
    await expect(
      h.call('withdraw', prata, REQ.emComposicao, { confirm: true }, headers()),
    ).rejects.toMatchObject({
      code: 'PORTAL.IF_MATCH_REQUIRED',
      status: 428,
    });
    await expect(
      h.call(
        'withdraw',
        prata,
        REQ.emComposicao,
        { confirm: true },
        headers({ 'if-match': '"7"' }),
      ),
    ).rejects.toMatchObject({
      code: 'PORTAL.VERSION_CONFLICT',
      status: 412,
      context: { expected: 1, received: 7 },
    });
    const response = await h.call<Row>(
      'withdraw',
      prata,
      REQ.emComposicao,
      { confirm: true, reason: 'mudei de ideia' },
      headers({ 'if-match': '"1"' }),
    );
    expect(response).toMatchObject({
      requestId: REQ.emComposicao,
      state: 'DESISTIDO',
      version: 2,
    });
    expect(new Date(String(response.withdrawnAt)).getTime()).toBe(
      FIXED_NOW.getTime(),
    );
    const row = requestRow(h, REQ.emComposicao);
    expect(row.state).toBe('DESISTIDO');
    expect(new Date(String(row.withdrawn_at)).getTime()).toBe(
      FIXED_NOW.getTime(),
    );
    expect(
      h.db
        .rows('portal.consequence_ack')
        .find((ack) => ack.request_id === REQ.emComposicao),
    ).toMatchObject({ kind: 'desistencia' });
    expect(domainEvents(h, TOPICS.requestChanged)).toContain(
      'SOLICITACAO_DESISTIDA',
    );
  });

  it('§2.3 withdraw (complemento unitário de C-0002-69) — dado withdraw em EM_ANDAMENTO_NO_ORGAO então 409 { state, allowed[3] }; dado { confirm: false } então 400', async () => {
    const h = harness();
    await expect(
      h.call(
        'withdraw',
        identityOf('qualificada'),
        REQ.emAndamento,
        { confirm: true },
        headers({ 'if-match': '"1"' }),
      ),
    ).rejects.toMatchObject({
      code: 'PORTAL.REQUEST_STATE_INVALID',
      status: 409,
      context: {
        state: 'EM_ANDAMENTO_NO_ORGAO',
        allowed: [
          'PEDIDO_EM_COMPOSICAO',
          'AGUARDANDO_NIVEL_ASSINATURA',
          'AGUARDANDO_PAGAMENTO',
        ],
      },
    });
    await expect(
      h.call(
        'withdraw',
        identityOf('prata'),
        REQ.emComposicao,
        { confirm: false },
        headers({ 'if-match': '"1"' }),
      ),
    ).rejects.toMatchObject({ code: 'PORTAL.VALIDATION_FAILED', status: 400 });
  });

  it("C-0002-24 — dado draft em PEDIDO_EM_COMPOSICAO com If-Match então request.version+1 e nova linha request_draft com version = request.version; fora do estado então 409 { allowed: ['PEDIDO_EM_COMPOSICAO'] }; corpo fora de DRAFT_SCHEMAS[serviceKey] então 400", async () => {
    const h = harness();
    const prata = identityOf('prata');
    const response = await h.call<Row>(
      'updateDraft',
      prata,
      REQ.emComposicao,
      SNE_DRAFT,
      headers({ 'if-match': '"1"' }),
    );
    expect(response).toMatchObject({ requestId: REQ.emComposicao, version: 2 });
    expect(requestRow(h, REQ.emComposicao).version).toBe(2);
    const drafts = h.db
      .rows('portal.request_draft')
      .filter((row) => row.request_id === REQ.emComposicao);
    expect(drafts.map((row) => row.version).sort()).toEqual([1, 2]);
    expect(drafts.find((row) => row.version === 2)).toMatchObject({
      payload_json: SNE_DRAFT,
    });
    expect(
      new Date(
        String(drafts.find((row) => row.version === 2)!.saved_at),
      ).getTime(),
    ).toBe(FIXED_NOW.getTime());

    await expect(
      h.call(
        'updateDraft',
        identityOf('ouro'),
        REQ.protocolado,
        SNE_DRAFT,
        headers({ 'if-match': '"1"' }),
      ),
    ).rejects.toMatchObject({
      code: 'PORTAL.REQUEST_STATE_INVALID',
      status: 409,
      context: { state: 'PROTOCOLADO', allowed: ['PEDIDO_EM_COMPOSICAO'] },
    });
    await expect(
      h.call(
        'updateDraft',
        prata,
        REQ.emComposicao,
        { foo: 1 },
        headers({ 'if-match': '"2"' }),
      ),
    ).rejects.toMatchObject({ code: 'PORTAL.VALIDATION_FAILED', status: 400 });
    await expect(
      h.call('updateDraft', prata, REQ.emComposicao, SNE_DRAFT, headers()),
    ).rejects.toMatchObject({
      code: 'PORTAL.IF_MATCH_REQUIRED',
      status: 428,
    });
  });

  it("C-0002-25 — dado respond em estado ≠ EM_ANDAMENTO_NO_ORGAO então 409 { allowed: ['EM_ANDAMENTO_NO_ORGAO'] }; em EM_ANDAMENTO_NO_ORGAO então 422 SERVICE_UNAVAILABLE 'delegacao_indisponivel_r0007'", async () => {
    const h = harness();
    const inquiryId = '00000000-0000-7000-8000-000070007308';
    const body = { text: 'resposta', attachmentIds: [] };
    await expect(
      h.call(
        'respondDiligence',
        identityOf('prata'),
        REQ.emComposicao,
        inquiryId,
        body,
        headers(),
      ),
    ).rejects.toMatchObject({
      code: 'PORTAL.REQUEST_STATE_INVALID',
      status: 409,
      context: {
        state: 'PEDIDO_EM_COMPOSICAO',
        allowed: ['EM_ANDAMENTO_NO_ORGAO'],
      },
    });
    await expect(
      h.call(
        'respondDiligence',
        identityOf('qualificada'),
        REQ.emAndamento,
        inquiryId,
        body,
        headers(),
      ),
    ).rejects.toMatchObject({
      code: 'PORTAL.SERVICE_UNAVAILABLE',
      status: 422,
      context: { unavailableReason: REASON_R0007 },
    });
    expect(requestRow(h, REQ.emAndamento).state).toBe('EM_ANDAMENTO_NO_ORGAO');
    await expect(
      h.call(
        'respondDiligence',
        identityOf('qualificada'),
        REQ.emAndamento,
        inquiryId,
        body,
        {},
      ),
    ).rejects.toMatchObject({
      code: 'PORTAL.VALIDATION_FAILED',
      status: 400,
      context: { fields: ['Idempotency-Key'] },
    });
  });

  it("C-0002-26 — dado evaluate em AVALIACAO_OFERECIDA então portal.evaluation (subject_kind 'request'), state 'CONCLUIDO', AVALIACAO_REGISTRADA e SOLICITACAO_CONCLUIDA; segunda avaliação então 409 EVALUATION_ALREADY_SUBMITTED; em outro estado então 409 REQUEST_STATE_INVALID", async () => {
    const h = harness();
    const qualificada = identityOf('qualificada');
    const scores = {
      satisfaction: 5,
      quality: 4,
      deadline: 5,
      clarity: 4,
      channel: 5,
    };
    const response = await h.call<Row>(
      'evaluate',
      qualificada,
      REQ.avaliacaoOferecida,
      { scores, comment: 'ok' },
      headers(),
    );
    expect(response).toMatchObject({
      requestId: REQ.avaliacaoOferecida,
      state: 'CONCLUIDO',
    });
    expect(typeof response.evaluationId).toBe('string');
    const evaluation = h.db
      .rows('portal.evaluation')
      .find((row) => row.subject_id === REQ.avaliacaoOferecida);
    expect(evaluation).toMatchObject({
      subject_kind: 'request',
      scores_json: scores,
      comment: 'ok',
    });
    expect(requestRow(h, REQ.avaliacaoOferecida)).toMatchObject({
      state: 'CONCLUIDO',
      version: 2,
    });
    const registered = outboxEnvelopes(h.db, TOPICS.evaluationRegistered);
    expect(registered).toHaveLength(1);
    expect(registered[0]!.data).toMatchObject({
      subjectKind: 'request',
      subjectId: REQ.avaliacaoOferecida,
    });
    expect(registered[0]!.data).not.toHaveProperty('scores');
    expect(registered[0]!.data).not.toHaveProperty('comment');
    expect(domainEvents(h, TOPICS.requestChanged)).toContain(
      'SOLICITACAO_CONCLUIDA',
    );

    // segunda avaliação: a máquina já está em CONCLUIDO; o passo 5 (unique) é provado
    // recolocando a linha em AVALIACAO_OFERECIDA (só a fixture muda, não o serviço)
    requestRow(h, REQ.avaliacaoOferecida).state = 'AVALIACAO_OFERECIDA';
    await expect(
      h.call(
        'evaluate',
        qualificada,
        REQ.avaliacaoOferecida,
        { scores },
        headers(),
      ),
    ).rejects.toMatchObject({
      code: 'PORTAL.EVALUATION_ALREADY_SUBMITTED',
      status: 409,
    });

    await expect(
      h.call('evaluate', qualificada, REQ.emAndamento, { scores }, headers()),
    ).rejects.toMatchObject({
      code: 'PORTAL.REQUEST_STATE_INVALID',
      status: 409,
      context: {
        state: 'EM_ANDAMENTO_NO_ORGAO',
        allowed: ['AVALIACAO_OFERECIDA'],
      },
    });
  });

  it('§2.3 ownership (complemento unitário de C-0002-70) — dado request de outro sujeito quando get/submit/withdraw então 404 PORTAL.NOT_FOUND { kind: "request" } (disfarce, M10)', async () => {
    const h = harness();
    const ouro = identityOf('ouro');
    await expect(
      h.call('submit', ouro, REQ.emComposicao, SIGNATURE, headers()),
    ).rejects.toMatchObject({
      code: 'PORTAL.NOT_FOUND',
      status: 404,
      context: { kind: 'request' },
    });
    await expect(
      h.call(
        'withdraw',
        ouro,
        REQ.emComposicao,
        { confirm: true },
        headers({ 'if-match': '"1"' }),
      ),
    ).rejects.toMatchObject({
      code: 'PORTAL.NOT_FOUND',
      status: 404,
      context: { kind: 'request' },
    });
  });
});

describe('CTG-0002 §3.4 — DRAFT_SCHEMAS (C-0002-27)', () => {
  const minimal: Record<string, Record<string, unknown>> = {
    defesa_previa: {
      facts: 'f',
      grounds: 'g',
      attachmentIds: [],
      requestType: 'cancelamento',
    },
    recurso_jari: { grounds: 'g', attachmentIds: [] },
    recurso_cetran: { attachmentIds: [] },
    indicacao_condutor: {
      driver: {
        cpf: '55555555555',
        cnhNumber: '1',
        cnhUf: 'AM',
        category: 'B',
        name: 'n',
      },
      signatures: { owner: 'govbr', driver: 'pending' },
      consequenceAck: {
        textVersion: '1',
        acceptedAt: '2026-09-14T15:00:00.000Z',
      },
    },
    pagamento: { tier: 'desconto_80', method: 'pix' },
    adesao_sne: {
      email: 'a@b.invalid',
      consent: { textVersion: '1', effectsAck: [...SNE_EFFECTS] },
    },
    cancelamento_sne: {},
    junta_medica: { examId: EXTERNAL.exam, reason: 'r', attachmentIds: [] },
    lgpd_declaracao: { scope: 'confirmacao' },
    consulta_multas: {},
    consulta_cnh: {},
    consulta_bat: {},
    consulta_exame: {},
    emissao_crlv: {},
  };

  it('C-0002-27 — dado DRAFT_SCHEMAS então cada corpo de §3.4 aceita o exemplo mínimo e rejeita campo extra (strictObject); consulta_* aceitam só {}', () => {
    expect(Object.keys(DRAFT_SCHEMAS).sort()).toEqual(
      Object.keys(minimal).sort(),
    );
    for (const [serviceKey, example] of Object.entries(minimal)) {
      const schema = DRAFT_SCHEMAS[serviceKey as keyof typeof DRAFT_SCHEMAS];
      expect(
        schema.safeParse(example).success,
        `${serviceKey} aceita o mínimo`,
      ).toBe(true);
      expect(
        schema.safeParse({ ...example, extra: 1 }).success,
        `${serviceKey} rejeita extra`,
      ).toBe(false);
    }
    for (const serviceKey of [
      'consulta_multas',
      'consulta_cnh',
      'consulta_bat',
      'consulta_exame',
      'emissao_crlv',
    ] as const) {
      expect(DRAFT_SCHEMAS[serviceKey].safeParse({}).success).toBe(true);
      expect(DRAFT_SCHEMAS[serviceKey].safeParse({ any: 'x' }).success).toBe(
        false,
      );
    }
    expect(
      DRAFT_SCHEMAS.adesao_sne.safeParse({
        ...minimal.adesao_sne,
        channel: 'email',
      }).success,
      'adesao_sne sem channel',
    ).toBe(false);
    expect(
      DRAFT_SCHEMAS.adesao_sne.safeParse({
        consent: { textVersion: '1', effectsAck: SNE_EFFECTS.slice(0, 3) },
      }).success,
    ).toBe(false);
    expect(
      DRAFT_SCHEMAS.pagamento.safeParse({ tier: 'desconto_99', method: 'pix' })
        .success,
    ).toBe(false);
    expect(
      DRAFT_SCHEMAS.lgpd_declaracao.safeParse({
        scope: 'declaracao_completa',
        fields: ['nome'],
      }).success,
    ).toBe(true);
  });
});

describe('CTG-0002 §3.2 — delegações reais (C-0002-28, R-0007)', () => {
  it('dado defesa_previa apta quando submit então persiste externalId do raitCaseProtocol', async () => {
    const h = harness({
      catalog: (rows) =>
        rows.map((row) =>
          row.service_key === 'defesa_previa'
            ? { ...row, availability: 'available', unavailable_reason: null }
            : row,
        ),
    });
    const { requestId } = await createRequest(h, identityOf('prata'), {
      serviceKey: 'defesa_previa',
      targetKind: 'ait',
      targetId: AITS.f2,
      channel: 'portal',
    });
    await h.call(
      'updateDraft',
      identityOf('prata'),
      requestId,
      {
        facts: 'fatos comprovados',
        grounds: 'fundamentos comprovados',
        attachmentIds: [],
        requestType: 'cancelamento',
      },
      headers({ 'if-match': '"1"' }),
    );

    const submitted = await h.call<Row>(
      'submit',
      identityOf('prata'),
      requestId,
      SIGNATURE,
      headers(),
    );
    expect(submitted).toMatchObject({
      state: 'EM_ANDAMENTO_NO_ORGAO',
      delegation: { status: 'delegated', externalId: expect.any(String) },
    });
    expect(requestRow(h, requestId)).toMatchObject({
      delegation_command: 'inf:rait-case:protocol',
      delegation_external_id: expect.any(String),
    });
  });

  it('dado indicacao_condutor apta quando submit então persiste externalId do infractionIndicateDriver', async () => {
    const h = harness({
      catalog: (rows) =>
        rows.map((row) =>
          row.service_key === 'indicacao_condutor'
            ? { ...row, availability: 'available', unavailable_reason: null }
            : row,
        ),
    });
    const { requestId } = await createRequest(h, identityOf('prata'), {
      serviceKey: 'indicacao_condutor',
      targetKind: 'ait',
      targetId: AITS.f2,
      channel: 'portal',
    });
    await h.call(
      'updateDraft',
      identityOf('prata'),
      requestId,
      {
        driver: {
          cpf: '55555555555',
          cnhNumber: '1',
          cnhUf: 'AM',
          category: 'B',
          name: 'n',
        },
        signatures: { owner: 'govbr', driver: 'govbr' },
        consequenceAck: {
          textVersion: '1',
          acceptedAt: '2026-09-14T15:00:00.000Z',
        },
      },
      headers({ 'if-match': '"1"' }),
    );

    const submitted = await h.call<Row>(
      'submit',
      identityOf('prata'),
      requestId,
      SIGNATURE,
      headers(),
    );
    expect(submitted).toMatchObject({
      state: 'EM_ANDAMENTO_NO_ORGAO',
      delegation: { status: 'delegated', externalId: expect.any(String) },
    });
    expect(requestRow(h, requestId)).toMatchObject({
      delegation_command: 'inf:infraction:indicate-driver',
      delegation_external_id: expect.any(String),
    });
  });

  it('dado pagamento PIX apto quando submit então persiste externalId de collectionDocumentIssue', async () => {
    const h = harness({
      catalog: (rows) =>
        rows.map((row) =>
          row.service_key === 'pagamento'
            ? { ...row, availability: 'available', unavailable_reason: null }
            : row,
        ),
    });
    const { requestId } = await createRequest(h, identityOf('prata'), {
      serviceKey: 'pagamento',
      targetKind: 'ait',
      targetId: AITS.f2,
      channel: 'portal',
    });
    await h.call(
      'updateDraft',
      identityOf('prata'),
      requestId,
      { tier: 'desconto_80', method: 'pix' },
      headers({ 'if-match': '"1"' }),
    );

    const submitted = await h.call<Row>(
      'submit',
      identityOf('prata'),
      requestId,
      SIGNATURE,
      headers(),
    );
    expect(submitted).toMatchObject({
      state: 'EM_ANDAMENTO_NO_ORGAO',
      delegation: { status: 'delegated', externalId: expect.any(String) },
    });
    expect(requestRow(h, requestId)).toMatchObject({
      delegation_command: 'inf:collection:issue',
      delegation_external_id: expect.any(String),
    });
  });

  it('dado diligência em andamento quando respond então permanece 422 fail-closed sob OD-R27-004', async () => {
    const h = harness();
    const unavailable = await h
      .call(
        'respondDiligence',
        identityOf('qualificada'),
        REQ.emAndamento,
        '00000000-0000-7000-8000-000070007308',
        { text: 'resposta', attachmentIds: [] },
        headers(),
      )
      .then(
        () => undefined,
        (error: unknown) =>
          error as { code?: string; status?: number; context?: unknown },
      );
    expect(unavailable).toMatchObject({
      code: 'PORTAL.SERVICE_UNAVAILABLE',
      status: 422,
    });
    // CTG-0003 não fixa o campo que carrega a decisão; exige apenas o vínculo.
    expect(JSON.stringify(unavailable?.context)).toMatch(
      /OD[-_ ]?R27[-_ ]?004/,
    );
  });

  it('dado caso RAIT em curso quando withdraw então só marca DESISTIDO depois do raitCaseWithdraw', async () => {
    const h = harness();
    await h.call(
      'withdraw',
      identityOf('prata'),
      REQ.emComposicao,
      { confirm: true },
      headers({ 'if-match': '"1"' }),
    );
    expect(requestRow(h, REQ.emComposicao)).toMatchObject({
      state: 'DESISTIDO',
      delegation_command: 'inf:rait-case:withdraw',
      delegation_external_id: expect.any(String),
    });
  });

  it('dado AGUARDANDO_PAGAMENTO sem produtor comprovado quando PAGAMENTO_CONFIRMADO então permanece source_pending sob OD-R27-003', () => {
    const h = harness();
    expect(requestRow(h, REQ.aguardandoPagamento)).toMatchObject({
      state: 'AGUARDANDO_PAGAMENTO',
    });
    expect(domainEvents(h, TOPICS.paymentConfirmed)).toEqual([]);
  });
  it.todo(
    'dado emissao_crlv com débito quando submit então AGUARDANDO_PAGAMENTO — R-0007/R-0014',
  );
});

describe('CTG-0002 §11 — PORTAL_REQUESTS_EVENT_SCHEMAS (C-0002-29)', () => {
  const requestId = REQ.emComposicao;
  const base = {
    id: '00000000-0000-7000-8000-000070007001',
    version: 1,
    occurredAt: '2026-09-14T16:00:00.000Z',
    tenantId: TENANT_ID,
    actor: { kind: 'user', id: SUBJECTS.prata.id },
    correlationId: '00000000-0000-4000-8000-00000000c0f1',
  };
  const common = {
    requestId,
    serviceKey: 'consulta_multas',
    subjectId: SUBJECTS.prata.id,
    subjectCpfHash: SUBJECTS.prata.cpfHash,
  };
  const examples: Array<{
    type: string;
    domainEvent: string;
    aggregate: Row;
    data: Row;
  }> = [
    {
      type: TOPICS.requestChanged,
      domainEvent: 'SOLICITACAO_CRIADA',
      aggregate: { kind: 'portal.request', id: requestId, version: 1 },
      data: {
        ...common,
        targetKind: 'none',
        targetId: null,
        fromState: null,
        toState: 'PEDIDO_EM_COMPOSICAO',
        occurredAt: '2026-09-14T16:00:00.000Z',
      },
    },
    {
      type: TOPICS.requestChanged,
      domainEvent: 'SOLICITACAO_PROTOCOLADA',
      aggregate: { kind: 'portal.request', id: requestId, version: 2 },
      data: {
        ...common,
        protocolNumber: 'AM-FIXTURES-2026-0000015',
        issuedAt: '2026-09-14T16:00:00.000Z',
        receiptHash: 'a'.repeat(64),
        fromState: 'PEDIDO_EM_COMPOSICAO',
        toState: 'PROTOCOLADO',
      },
    },
    {
      type: TOPICS.requestChanged,
      domainEvent: 'SOLICITACAO_DESISTIDA',
      aggregate: { kind: 'portal.request', id: requestId, version: 2 },
      data: {
        ...common,
        fromState: 'PEDIDO_EM_COMPOSICAO',
        toState: 'DESISTIDO',
        withdrawnAt: '2026-09-14T16:00:00.000Z',
      },
    },
    {
      type: TOPICS.requestChanged,
      domainEvent: 'SOLICITACAO_CONCLUIDA',
      aggregate: { kind: 'portal.request', id: requestId, version: 6 },
      data: {
        ...common,
        fromState: 'AVALIACAO_OFERECIDA',
        toState: 'CONCLUIDO',
        evaluationId: '00000000-0000-7000-8000-000071100001',
      },
    },
    {
      type: TOPICS.evaluationRegistered,
      domainEvent: 'AVALIACAO_REGISTRADA',
      aggregate: {
        kind: 'portal.evaluation',
        id: '00000000-0000-7000-8000-000071100001',
        version: 1,
      },
      data: {
        evaluationId: '00000000-0000-7000-8000-000071100001',
        subjectKind: 'request',
        subjectId: requestId,
        submittedAt: '2026-09-14T16:00:00.000Z',
        citizenSubjectId: SUBJECTS.prata.id,
        subjectCpfHash: SUBJECTS.prata.cpfHash,
      },
    },
  ];

  it('C-0002-29 — dado PORTAL_REQUESTS_EVENT_SCHEMAS então os exemplos de §12 validam; `data` com campo de texto livre é rejeitado; idempotency_key muda a cada transição (version+1)', () => {
    expect(Object.keys(PORTAL_REQUESTS_EVENT_SCHEMAS).sort()).toEqual(
      [TOPICS.evaluationRegistered, TOPICS.requestChanged].sort(),
    );
    for (const example of examples) {
      const schema = PORTAL_REQUESTS_EVENT_SCHEMAS[example.type]!;
      const envelope = { ...base, ...example };
      const parsed = schema.safeParse(envelope);
      expect(
        parsed.success,
        `${example.domainEvent}: ${JSON.stringify(parsed.error?.issues)}`,
      ).toBe(true);
      expect(
        schema.safeParse({
          ...envelope,
          data: { ...example.data, note: 'texto livre do cidadão' },
        }).success,
        `${example.domainEvent} rejeita texto livre`,
      ).toBe(false);
    }
    // domainEvent fora da união discriminada
    expect(
      PORTAL_REQUESTS_EVENT_SCHEMAS[TOPICS.requestChanged]!.safeParse({
        ...base,
        ...examples[0],
        domainEvent: 'SOLICITACAO_INVENTADA',
      }).success,
    ).toBe(false);
  });

  it('C-0002-29 — dado create e submit de consulta_multas então cada transição publica com aggregate.version distinto (idempotency_key nova por transição)', async () => {
    const h = harness();
    const prata = identityOf('prata');
    const { requestId: created } = await createRequest(h, prata, {
      serviceKey: 'consulta_multas',
      targetKind: 'none',
      channel: 'portal',
    });
    await h.call('submit', prata, created, SIGNATURE, headers());
    const rows = h.db
      .rows('integration.outbox')
      .filter((row) => row.aggregate_id === created);
    const keys = rows.map((row) => String(row.idempotency_key));
    expect(new Set(keys).size).toBe(keys.length);
    const versions = rows.map((row) =>
      Number(
        (row.payload as { aggregate: { version: number } }).aggregate.version,
      ),
    );
    expect(new Set(versions).size).toBe(versions.length);
    for (const row of rows) {
      const payload = row.payload as {
        type: string;
        aggregate: { id: string; version: number };
      };
      expect(row.idempotency_key).toBe(
        `${payload.type}:${payload.aggregate.id}:${payload.aggregate.version}`,
      );
    }
  });
});
