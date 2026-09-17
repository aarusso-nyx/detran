// Constantes canônicas e fakes compartilhadas pelos specs `unit` do Portal
// (R-0009 CTG-0001 §5, §10; CTG-0002 §3.2, §12, §13). Só ids e valores das
// fixtures de `backend/database/seed/70-fixtures-portal.sql` — nada inventado.
// Relógio fixo 2026-09-14 (CTG-0002 §13) em America/Manaus.
import type { Row } from './fake-sql.js';

export const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
export const TENANT_SLUG = 'am-fixtures';
export const TENANT_TZ = 'America/Manaus';

/** "Hoje" das fixtures (CTG-0001 §10; CTG-0002 §13). */
export const FIXED_TODAY = '2026-09-14';
export const FIXED_NOW = new Date('2026-09-14T12:00:00-04:00');

export const fixedClock = {
  now: () => new Date(FIXED_NOW.getTime()),
  today: (_tenantTz?: string) => FIXED_TODAY,
};

/** CTG-0001 §10.2 — sujeitos das fixtures. */
export const SUBJECTS = {
  bronze: {
    id: '00000000-0000-7000-8000-000070000001',
    cpf: '11111111111',
    cpfHash: '534a4a8eafcd8489af32356d5a7a25f88c70cfe0448539a7c42964c1b897a359',
    assurance: 'simples',
  },
  prata: {
    id: '00000000-0000-7000-8000-000070000002',
    cpf: '22222222222',
    cpfHash: 'd5996b25e580c95b90cfc8a69898b31ee8edb66bea003ac99801b8cab34c2bb4',
    assurance: 'avancada',
  },
  ouro: {
    id: '00000000-0000-7000-8000-000070000003',
    cpf: '33333333333',
    cpfHash: '90bdb56dba0745a3236c1c38f185878fcdce441ee4e5ab171dfe0e08a6170016',
    assurance: 'avancada',
  },
  qualificada: {
    id: '00000000-0000-7000-8000-000070000004',
    cpf: '44444444444',
    cpfHash: '34ce32f4cacdd770d6bb0977e066f74724b170f3ccf7002baa802170711f99df',
    assurance: 'qualificada',
  },
  procurador: {
    id: '00000000-0000-7000-8000-000070000005',
    cpf: '55555555555',
    cpfHash: 'a96fb099c9fe2b2866c515ce063539186c7103dd14b9df1a91741a7afd7f94fd',
    assurance: 'avancada',
  },
} as const;

/** CTG-0001 §10.3 — AITs de `30-fixtures-infraction.sql` referenciados pelo Portal. */
export const AITS = {
  f1: '00000000-0000-7000-8000-0000f0000001',
  f2: '00000000-0000-7000-8000-0000f0000002',
  f3: '00000000-0000-7000-8000-0000f0000003',
  f5: '00000000-0000-7000-8000-0000f0000005',
  f6: '00000000-0000-7000-8000-0000f0000006',
  f9: '00000000-0000-7000-8000-0000f0000009',
  f10: '00000000-0000-7000-8000-0000f0000010',
  f12: '00000000-0000-7000-8000-0000f0000012',
} as const;

/** Infrações correspondentes (`…d00000nn`, CTG-0001 §10.3). */
export const INFRACTIONS = {
  d1: '00000000-0000-7000-8000-0000d0000001',
  d2: '00000000-0000-7000-8000-0000d0000002',
  d3: '00000000-0000-7000-8000-0000d0000003',
  d9: '00000000-0000-7000-8000-0000d0000009',
} as const;

/** Alvos externos sem fixture canônica (`…ff…`, CTG-0001 §10.1). */
export const EXTERNAL = {
  vehicle: '00000000-0000-7000-8000-00007ff00001',
  exam: '00000000-0000-7000-8000-00007ff00002',
  crash: '00000000-0000-7000-8000-00007ff00003',
} as const;

/** Linhas de `portal.infraction_view` das fixtures (CTG-0001 §10.8). */
export const INFRACTION_VIEWS: Row[] = [
  {
    id: '00000000-0000-7000-8000-000070f00001',
    ait_id: AITS.f2,
    subject_cpf_hash: SUBJECTS.prata.cpfHash,
    ait_number: 'FIX-0000001',
    plate: 'FIX2E01',
    occurred_at: new Date('2026-05-01T12:00:00-04:00'),
    situation: 'aguardando_defesa',
    points_status: 'none',
  },
  {
    id: '00000000-0000-7000-8000-000070f00002',
    ait_id: AITS.f3,
    subject_cpf_hash: SUBJECTS.prata.cpfHash,
    ait_number: 'FIX-0000002',
    plate: 'FIX2E02',
    occurred_at: new Date('2026-05-02T12:00:00-04:00'),
    situation: 'em_defesa',
    points_status: 'em_disputa',
  },
  {
    id: '00000000-0000-7000-8000-000070f00003',
    ait_id: AITS.f5,
    subject_cpf_hash: SUBJECTS.prata.cpfHash,
    ait_number: 'FIX-0000003',
    plate: 'FIX2E03',
    occurred_at: new Date('2026-05-03T12:00:00-04:00'),
    situation: 'penalidade_aplicada',
    points_status: 'definitivo',
  },
  {
    id: '00000000-0000-7000-8000-000070f00004',
    ait_id: AITS.f6,
    subject_cpf_hash: SUBJECTS.ouro.cpfHash,
    ait_number: 'FIX-0000004',
    plate: 'FIX2E04',
    occurred_at: new Date('2026-05-04T12:00:00-04:00'),
    situation: 'em_recurso',
    points_status: 'em_disputa',
  },
  {
    id: '00000000-0000-7000-8000-000070f00005',
    ait_id: AITS.f9,
    subject_cpf_hash: SUBJECTS.qualificada.cpfHash,
    ait_number: 'FIX-0000005',
    plate: 'FIX2E05',
    occurred_at: new Date('2026-05-05T12:00:00-04:00'),
    situation: 'encerrada',
    points_status: 'definitivo',
  },
  {
    id: '00000000-0000-7000-8000-000070f00006',
    ait_id: AITS.f12,
    subject_cpf_hash: SUBJECTS.ouro.cpfHash,
    ait_number: 'FIX-0000006',
    plate: 'FIX2E06',
    occurred_at: new Date('2026-05-06T12:00:00-04:00'),
    situation: 'cancelada',
    points_status: 'none',
  },
  {
    id: '00000000-0000-7000-8000-000070f00007',
    ait_id: AITS.f10,
    subject_cpf_hash: SUBJECTS.prata.cpfHash,
    ait_number: 'FIX-0000007',
    plate: 'FIX2E07',
    occurred_at: new Date('2026-05-07T12:00:00-04:00'),
    situation: 'arquivada',
    points_status: 'none',
  },
].map((row) => ({
  framing_label: 'fixture',
  amount: 195.23,
  deadlines_json: [],
  actions_json: [],
  notices_json: [],
  payment_json: {},
  last_event_id: '00000000-0000-0000-0000-000000000000',
  last_event_version: 0,
  ...row,
}));

export interface CatalogRow extends Row {
  id: string;
  service_key: string;
  category: string;
  availability: 'available' | 'partially_available' | 'unavailable';
  minimum_assurance: string;
  unavailable_reason: string | null;
  alternative_channel_note: string | null;
}

export const PRESENTIAL_NOTE =
  'Atendimento presencial ([REF-DETRANAM-SERVICOS])';

/** CTG-0001 §10.7 — as 15 linhas de `portal.service_catalog` (9/2/4, M12). */
export const SERVICE_CATALOG: CatalogRow[] = (
  [
    ['01', 'consulta_multas', 'inf', 'available', 'simples', null, null],
    ['02', 'consulta_cnh', 'ch', 'available', 'simples', null, null],
    ['03', 'emissao_crlv', 'est', 'available', 'simples', null, null],
    ['04', 'adesao_sne', 'inf', 'available', 'avancada', null, null],
    ['05', 'cancelamento_sne', 'inf', 'available', 'avancada', null, null],
    ['06', 'consulta_bat', 'est', 'available', 'simples', null, null],
    ['07', 'consulta_exame', 'ch', 'available', 'simples', null, null],
    ['08', 'manifestar', 'transversal', 'available', 'none', null, null],
    ['09', 'avaliar', 'transversal', 'available', 'simples', null, null],
    [
      '0a',
      'pagamento',
      'inf',
      'partially_available',
      'simples',
      null,
      'Somente guia PIX/boleto; cartão e parcelamento indisponíveis (OD-P05)',
    ],
    [
      '0b',
      'lgpd_declaracao',
      'transversal',
      'partially_available',
      'simples',
      null,
      'Somente confirmação de tratamento; declaração completa pendente (OD-P17)',
    ],
    [
      '0c',
      'defesa_previa',
      'inf',
      'unavailable',
      'avancada',
      'delegacao_indisponivel_r0007',
      PRESENTIAL_NOTE,
    ],
    [
      '0d',
      'recurso_jari',
      'inf',
      'unavailable',
      'avancada',
      'delegacao_indisponivel_r0007',
      PRESENTIAL_NOTE,
    ],
    [
      '0e',
      'recurso_cetran',
      'inf',
      'unavailable',
      'avancada',
      'delegacao_indisponivel_r0007',
      PRESENTIAL_NOTE,
    ],
    [
      '0f',
      'indicacao_condutor',
      'inf',
      'unavailable',
      'avancada',
      'delegacao_indisponivel_r0007',
      PRESENTIAL_NOTE,
    ],
  ] as const
).map(([nn, serviceKey, category, availability, minimum, reason, note]) => ({
  id: `00000000-0000-7000-8000-0000709000${nn}`,
  service_key: serviceKey,
  route: `/servicos/${serviceKey.replaceAll('_', '-')}`,
  category,
  title: serviceKey,
  summary: serviceKey,
  requirements_json: ['Conta gov.br'],
  delivery_channel: 'portal',
  legal_deadline: 'fixture',
  cost: 'gratuito',
  accessibility_note: 'Conforme declaração de acessibilidade (RN-PORTAL-113)',
  responsible_party: 'DETRAN-AM',
  normative_reference: 'fixture',
  availability,
  unavailable_reason: reason,
  alternative_channel_note: note,
  minimum_assurance: minimum,
  version: 1,
  effective_from: '2026-01-01',
}));

/** CTG-0001 §5 (M5, A1) — matriz ato → nível, as 21 linhas. */
export const ACT_LEVELS: Record<string, string> = {
  consulta_multas: 'simples',
  consulta_cnh: 'simples',
  emissao_crlv: 'simples',
  pagamento: 'simples',
  adesao_sne: 'avancada',
  cancelamento_sne: 'avancada',
  lgpd_declaracao: 'simples',
  acompanhar_manifestacao: 'simples',
  defesa_previa: 'avancada',
  recurso_jari: 'avancada',
  recurso_cetran: 'avancada',
  indicacao_condutor: 'avancada',
  procuracao: 'avancada',
  junta_medica: 'avancada',
  'lgpd_declaracao:declaracao_completa': 'avancada',
  'lgpd_declaracao:correcao': 'avancada',
  'lgpd_declaracao:eliminacao': 'avancada',
  manifestar: 'none',
  consulta_bat: 'simples',
  consulta_exame: 'simples',
  avaliar: 'simples',
};

/** Linhas de `portal.act_level_policy` para semear na tx falsa. */
export const ACT_LEVEL_POLICY_ROWS: Row[] = Object.entries(ACT_LEVELS).map(
  ([actKey, minimum], index) => ({
    id: `00000000-0000-7000-8000-0000703000${(index + 1).toString(16).padStart(2, '0')}`,
    act_key: actKey,
    minimum_assurance: minimum,
    legal_basis: 'fixture',
    decision_ref: 'fixture',
    enabled: true,
    effective_from: '2026-01-01',
    effective_to: null,
  }),
);

/** As 13 linhas de `portal.request` (CTG-0001 §10.5), uma por estado. */
export const REQUEST_FIXTURES: Row[] = [
  {
    id: '00000000-0000-7000-8000-000070400001',
    state: 'IDENTIFICADO',
    service_key: 'consulta_multas',
    subject_id: SUBJECTS.bronze.id,
    target_kind: 'none',
    target_id: null,
    minimum_assurance: 'none',
    delegation_status: 'not_applicable',
  },
  {
    id: '00000000-0000-7000-8000-000070400002',
    state: 'SERVICO_SELECIONADO',
    service_key: 'consulta_multas',
    subject_id: SUBJECTS.bronze.id,
    target_kind: 'none',
    target_id: null,
    minimum_assurance: 'none',
    delegation_status: 'not_applicable',
  },
  {
    id: '00000000-0000-7000-8000-000070400003',
    state: 'ELEGIBILIDADE_VERIFICADA',
    service_key: 'consulta_multas',
    subject_id: SUBJECTS.bronze.id,
    target_kind: 'none',
    target_id: null,
    minimum_assurance: 'none',
    delegation_status: 'not_applicable',
  },
  {
    id: '00000000-0000-7000-8000-000070400004',
    state: 'INELEGIVEL',
    service_key: 'indicacao_condutor',
    subject_id: SUBJECTS.prata.id,
    target_kind: 'ait',
    target_id: AITS.f10,
    minimum_assurance: 'none',
    delegation_status: 'not_applicable',
  },
  {
    id: '00000000-0000-7000-8000-000070400005',
    state: 'PEDIDO_EM_COMPOSICAO',
    service_key: 'adesao_sne',
    subject_id: SUBJECTS.prata.id,
    target_kind: 'none',
    target_id: null,
    minimum_assurance: 'none',
    delegation_status: 'pending',
  },
  {
    id: '00000000-0000-7000-8000-000070400006',
    state: 'AGUARDANDO_NIVEL_ASSINATURA',
    service_key: 'adesao_sne',
    subject_id: SUBJECTS.bronze.id,
    target_kind: 'none',
    target_id: null,
    minimum_assurance: 'avancada',
    delegation_status: 'pending',
  },
  {
    id: '00000000-0000-7000-8000-000070400007',
    state: 'AGUARDANDO_PAGAMENTO',
    service_key: 'emissao_crlv',
    subject_id: SUBJECTS.ouro.id,
    target_kind: 'vehicle',
    target_id: EXTERNAL.vehicle,
    minimum_assurance: 'simples',
    delegation_status: 'pending',
  },
  {
    id: '00000000-0000-7000-8000-000070400008',
    state: 'PROTOCOLADO',
    service_key: 'adesao_sne',
    subject_id: SUBJECTS.ouro.id,
    target_kind: 'none',
    target_id: null,
    minimum_assurance: 'avancada',
    delegation_status: 'failed',
    delegation_error: 'fixture: falha simulada',
  },
  {
    id: '00000000-0000-7000-8000-000070400009',
    state: 'EM_ANDAMENTO_NO_ORGAO',
    service_key: 'adesao_sne',
    subject_id: SUBJECTS.qualificada.id,
    target_kind: 'none',
    target_id: null,
    minimum_assurance: 'avancada',
    delegation_status: 'delegated',
    delegation_domain: 'portal',
    delegation_command: 'portal:sne-enrollment:enroll',
  },
  {
    id: '00000000-0000-7000-8000-00007040000a',
    state: 'RESULTADO_DISPONIVEL',
    service_key: 'consulta_exame',
    subject_id: SUBJECTS.ouro.id,
    target_kind: 'exam',
    target_id: EXTERNAL.exam,
    minimum_assurance: 'simples',
    delegation_status: 'delegated',
  },
  {
    id: '00000000-0000-7000-8000-00007040000b',
    state: 'AVALIACAO_OFERECIDA',
    service_key: 'consulta_bat',
    subject_id: SUBJECTS.qualificada.id,
    target_kind: 'crash',
    target_id: EXTERNAL.crash,
    minimum_assurance: 'simples',
    delegation_status: 'delegated',
  },
  {
    id: '00000000-0000-7000-8000-00007040000c',
    state: 'CONCLUIDO',
    service_key: 'adesao_sne',
    subject_id: SUBJECTS.prata.id,
    target_kind: 'none',
    target_id: null,
    minimum_assurance: 'avancada',
    delegation_status: 'delegated',
  },
  {
    id: '00000000-0000-7000-8000-00007040000d',
    state: 'DESISTIDO',
    service_key: 'emissao_crlv',
    subject_id: SUBJECTS.ouro.id,
    target_kind: 'vehicle',
    target_id: EXTERNAL.vehicle,
    minimum_assurance: 'simples',
    delegation_status: 'not_applicable',
    withdrawn_at: new Date('2026-09-10T12:00:00-04:00'),
  },
].map((row) => ({
  channel: 'portal',
  version: 1,
  created_at: FIXED_NOW,
  ...row,
}));

/** Os 13 tokens de `portal.request.state` (DDL 62; CTG-0001 §6.1). */
export const REQUEST_STATES = [
  'IDENTIFICADO',
  'SERVICO_SELECIONADO',
  'ELEGIBILIDADE_VERIFICADA',
  'INELEGIVEL',
  'PEDIDO_EM_COMPOSICAO',
  'AGUARDANDO_NIVEL_ASSINATURA',
  'AGUARDANDO_PAGAMENTO',
  'PROTOCOLADO',
  'EM_ANDAMENTO_NO_ORGAO',
  'RESULTADO_DISPONIVEL',
  'AVALIACAO_OFERECIDA',
  'CONCLUIDO',
  'DESISTIDO',
] as const;

/** Os 9 tokens de `portal.manifestation.state` (DDL 64; CTG-0001 §6.4). */
export const MANIFESTATION_STATES = [
  'MANIFESTACAO_REGISTRADA',
  'COMPROVANTE_EMITIDO',
  'EM_ANALISE',
  'INFORMACAO_SOLICITADA_AO_AGENTE',
  'DECISAO_FINAL_ELABORADA',
  'CIENCIA_AO_USUARIO',
  'ENCERRADA',
  'AVALIACAO_OFERECIDA',
  'AVALIADA',
] as const;

export interface IdentityLike {
  cpf: string;
  assuranceLevel: 'simples' | 'avancada' | 'qualificada';
  govbrLevel?: string;
}

export function identityOf(
  subject: keyof typeof SUBJECTS,
  level?: IdentityLike['assuranceLevel'],
): IdentityLike {
  return {
    cpf: SUBJECTS[subject].cpf,
    assuranceLevel:
      level ?? (SUBJECTS[subject].assurance as IdentityLike['assuranceLevel']),
  };
}

/** `RequestContext` falso do STYNX: `correlationId` = requestId da requisição. */
export function fakeRequestContext(
  requestId = '00000000-0000-4000-8000-00000000c0f1',
) {
  return {
    hasActiveContext: () => true,
    snapshot: () => ({
      tenantId: TENANT_ID,
      actorId: SUBJECTS.prata.id,
      requestId,
    }),
    run: <T>(_ctx: unknown, work: () => T) => work(),
  };
}

/** `Database` falso: toda transação é a tx da `FakeSqlDatabase`. */
export function fakeDatabase(tx: unknown) {
  return {
    tx: async <T>(...args: unknown[]): Promise<T> => {
      const work = args.find((arg) => typeof arg === 'function') as (
        t: unknown,
      ) => Promise<T>;
      return work(tx);
    },
  };
}

export const NIL_UUID = '00000000-0000-0000-0000-000000000000';

/**
 * `type` técnicos do Portal (CTG-0002 §9, §11) e consumidos (§7.2, §7.5).
 * Vivem aqui (pasta `tests/`, fora da varredura de `verify:parameter-catalogue`)
 * para que os specs em `src/` nunca escrevam o literal `portal.<x>.<y>`.
 */
export const TOPICS = {
  requestChanged: 'portal.request.changed',
  identityElevated: 'portal.identity.elevated',
  representationValidated: 'portal.representation.validated',
  inboxRead: 'portal.inbox.read',
  inboxItem: 'portal.inbox.item',
  notificationAcknowledged: 'portal.notification.acknowledged',
  manifestationChanged: 'portal.manifestation.changed',
  evaluationRegistered: 'portal.evaluation.registered',
  sneEnrollmentChanged: 'portal.sne-enrollment.changed',
  infractionChanged: 'inf.infraction.changed',
  penaltyFinal: 'inf.infraction.penalty-final',
  noticeDispatched: 'inf.notice.dispatched',
  noticeAcknowledged: 'inf.notice.acknowledged',
  paymentConfirmed: 'inf.payment.confirmed',
  raitCaseCreated: 'rait.case.created',
  raitCaseChanged: 'rait.case.changed',
  raitCaseAdmitted: 'rait.case.admitted',
  raitCaseReceived: 'rait.case.received',
  raitCaseTransited: 'rait.case.transited',
  raitCaseWithdrawn: 'rait.case.withdrawn',
  raitDecisionPublished: 'rait.decision.published',
  raitInquiryChanged: 'rait.inquiry.changed',
  crashChanged: 'est.crash.changed',
  examChanged: 'ch.exam.changed',
} as const;

/** Chaves i18n de `nextAction.label` (§3.5) e da frase da avaliação (§2.6). */
export const I18N = {
  nextAction: (state: string) => `portal.requests.nextAction.${state}`,
  publicIndicator: 'portal.evaluations.publicIndicator',
} as const;

/** Os quatro efeitos do consentimento SNE (CTG-0002 §2.4 `SNE_EFFECTS`). */
export const SNE_EFFECTS = [
  'ciencia_ficta',
  'canal_exclusivo',
  'desconto_60',
  'cancelamento',
] as const;

/** Envelopes gravados na outbox falsa por `topic` (payload já com `id` real). */
export function outboxEnvelopes(
  db: { rows(table: string): Row[] },
  topic?: string,
): Array<Row & { domainEvent?: string; data?: Row; aggregate?: Row }> {
  return db
    .rows('integration.outbox')
    .filter((row) => topic === undefined || row.topic === topic)
    .map(
      (row) =>
        row.payload as Row & {
          domainEvent?: string;
          data?: Row;
          aggregate?: Row;
        },
    );
}
