// R-0014 TASK-0017 (Inspector). Fixtures HTTP centralizadas para os specs do par 3 (contrato
// CTG-0003c §0/§9(b)): ids canônicos de `backend/database/seed/70-fixtures-portal.sql` e corpos
// literais do contrato §2.1/§6. Reexporta os ids comuns de `http-fixtures.ts` (par 1) para não
// duplicar. Formas marcadas `source_pending` no contrato (vehicles, clearance, crash.summary,
// heldDataSummary) são construídas aqui exatamente como o contrato as transcreve — nunca um campo
// a mais, nunca um cálculo.
import {
  FIXED_CLOCK_ISO,
  SUBJECT_PRATA_ID,
  TENANT_ID,
  portalErrorBody,
} from './http-fixtures';

export { FIXED_CLOCK_ISO, SUBJECT_PRATA_ID, TENANT_ID, portalErrorBody };

// —— ids (seed 10.6/10.7/10.8; contrato §0) ——
export const AIT_SNE_ID = '00000000-0000-7000-8000-0000f0000002'; // seed 10.8 inbox_item …070c00001
export const REQUEST_ADESAO_SNE_ID = '00000000-0000-7000-8000-000070400009'; // seed 10.8 inbox_item …070c00002
export const INBOX_SNE_ITEM_ID = '00000000-0000-7000-8000-000070c00001';
export const INBOX_PROCESS_ITEM_ID = '00000000-0000-7000-8000-000070c00002';
export const SNE_ENROLLMENT_ID = '00000000-0000-7000-8000-000070e00001';
export const MANIFESTATION_ANONYMOUS_ID =
  '00000000-0000-7000-8000-000070700001';
export const MANIFESTATION_EM_ANALISE_ID =
  '00000000-0000-7000-8000-000070700003';
export const MANIFESTATION_INFO_SOLICITADA_ID =
  '00000000-0000-7000-8000-000070700004';
export const MANIFESTATION_CIENCIA_ID = '00000000-0000-7000-8000-000070700006';
export const MANIFESTATION_ENCERRADA_ID =
  '00000000-0000-7000-8000-000070700007';
export const MANIFESTATION_AVALIACAO_OFERECIDA_ID =
  '00000000-0000-7000-8000-000070700008';
export const MANIFESTATION_EXTENSION_ID =
  '00000000-0000-7000-8000-000070800001';
export const CRASH_ID = '00000000-0000-7000-8000-00007ff00003'; // @example (OD-P19: sem linha de fixture)
export const EXAM_ID = '00000000-0000-7000-8000-00007ff00002'; // @example (OD-P19: sem linha de fixture)
export const VEHICLE_ID = '00000000-0000-7000-8000-0000f0000101'; // fixture do Inspector (OD-P36: forma livre)
export const VEHICLE_OTHER_ID = '00000000-0000-7000-8000-0000f0000102';

/** `GET /v1/portal/inbox` — 2 itens (seed 10.8), na ordem do servidor. */
export const INBOX_LIST_FIXTURE = {
  items: [
    {
      id: INBOX_SNE_ITEM_ID,
      kind: 'acao_necessaria' as const,
      source: 'sne' as const,
      category: 'SNE' as const,
      subjectLine: 'Notificação de autuação disponível',
      summary: 'fixture',
      aitId: AIT_SNE_ID,
      requestId: null as string | null,
      availableOn: '2026-09-01',
      readOn: null as string | null,
      fictitiousAcknowledgementOn: '2026-10-01',
      deadline: { dueOn: '2026-10-01', ownedBy: 'citizen' as const },
    },
    {
      id: INBOX_PROCESS_ITEM_ID,
      kind: 'informativo' as const,
      source: 'portal' as const,
      category: 'PROCESSO' as const,
      subjectLine: 'Pedido em andamento',
      summary: 'fixture',
      aitId: null as string | null,
      requestId: REQUEST_ADESAO_SNE_ID,
      availableOn: '2026-09-10',
      readOn: '2026-09-11',
      fictitiousAcknowledgementOn: null as string | null,
      deadline: null as { dueOn: string; ownedBy: 'citizen' | 'agency' } | null,
    },
  ],
  total: 2,
  page: 1,
  pageSize: 20,
};

/** `POST /v1/portal/inbox/{id}/read` 200 — contrato §2.1. */
export const INBOX_READ_RESULT_FIXTURE = {
  id: INBOX_SNE_ITEM_ID,
  readOn: '2026-09-14',
  acknowledgementEvidence: null as {
    acknowledgedAt?: string;
    displayedSha256?: string;
  } | null,
};

/** `GET /v1/portal/sne/enrollment` — aderido (seed 10.8). */
export const SNE_ENROLLMENT_ADERIDO_FIXTURE = {
  enrolled: true,
  since: '2026-08-01',
  channel: 'email' as const,
  cancelable: true,
};

/** `GET /v1/portal/sne/enrollment` — sem linha (nunca 404; contrato §2.4). */
export const SNE_ENROLLMENT_NAO_ADERIDO_FIXTURE = {
  enrolled: false,
  since: null as string | null,
  channel: null as string | null,
  cancelable: false,
};

/** `POST /v1/portal/sne/enrollment` 201. */
export const SNE_ENROLLED_FIXTURE = {
  enrolled: true,
  since: FIXED_CLOCK_ISO,
  channel: 'email' as const,
  cancelable: true,
};

/** `DELETE /v1/portal/sne/enrollment` 200. */
export const SNE_CANCELLED_FIXTURE = {
  enrolled: false,
  since: null as string | null,
  channel: 'email' as const,
  cancelable: false,
  cancelledAt: FIXED_CLOCK_ISO,
};

/** `POST /v1/portal/push-subscriptions` 201. */
export const PUSH_SUBSCRIPTION_CREATED_FIXTURE = {
  id: 'push-sub-fixture-1',
  endpoint: 'https://push.invalid/fixture-1',
  createdAt: FIXED_CLOCK_ISO,
};

/** `GET /v1/portal/documents/cnh` — categoria C (contrato §2.1; [DIVERGE-8]). */
export const CNH_READ_FIXTURE = {
  license: {
    status: 'valida' as const,
    validUntil: null as string | null,
    categories: [] as readonly string[],
    restrictions: [] as readonly string[],
  },
  qrVerification: null as string | null,
  documentBytes: null as string | null,
  category: 'C' as const,
  cachedAt: FIXED_CLOCK_ISO,
};

/** `GET /v1/portal/vehicles` — 1 veículo (OD-P36: forma livre, transcrita do contrato §7). */
export const VEHICLE_LIST_FIXTURE = {
  items: [{ vehicleId: VEHICLE_ID, plate: 'FIX3E01', model: 'Fixture Model' }],
  cachedAt: FIXED_CLOCK_ISO,
};

export const VEHICLE_LIST_EMPTY_FIXTURE = {
  items: [] as readonly unknown[],
  cachedAt: FIXED_CLOCK_ISO,
};

/** `GET vehicles/{id}/clearance` — débito + restrição + suspenso (contrato §7; C-3c-30). */
export const VEHICLE_CLEARANCE_BLOCKED_FIXTURE = {
  items: [
    {
      kind: 'multa' as const,
      amount: 195.23,
      status: 'em_aberto',
      blocking: true,
      reason: null as string | null,
    },
  ],
  restrictions: [] as readonly { kind: string; blocking: boolean }[],
  suspendedEnforceability: [{ aitId: AIT_SNE_ID }],
  canIssue: false,
  cachedAt: FIXED_CLOCK_ISO,
};

export const VEHICLE_CLEARANCE_CLEAR_FIXTURE = {
  items: [] as readonly unknown[],
  restrictions: [] as readonly unknown[],
  suspendedEnforceability: [] as readonly unknown[],
  canIssue: true,
  cachedAt: FIXED_CLOCK_ISO,
};

/** `POST vehicles/{id}/crlv-e` 2xx (OD-P59 ext.; contrato §2.1). */
export const CRLV_ISSUED_FIXTURE = {
  documentBytes: null as string | null,
  qrVerification: 'qr-fixture',
  issuedAt: FIXED_CLOCK_ISO,
  validUntil: '2027-01-01',
  vehicleId: VEHICLE_ID,
};

/** `GET /v1/portal/crashes` — sem fixture de linha (OD-P19); dois itens de teste. */
export const CRASH_LIST_FIXTURE = {
  items: [
    {
      crashId: CRASH_ID,
      stateLabel: 'em elaboração de boletim (fixture)',
      thirdPartyFieldsSuppressed: false,
      summary: { dinamica: 'colisão traseira (fixture)' },
    },
  ],
  total: 1,
  page: 1,
  pageSize: 20,
};

export const CRASH_DETAIL_FIXTURE = {
  crashId: CRASH_ID,
  stateLabel: 'em elaboração de boletim (fixture)',
  summary: { dinamica: 'colisão traseira (fixture)', gravidade: 'leve' },
  thirdPartyFieldsSuppressed: false,
};

export const CRASH_DETAIL_SUPPRESSED_FIXTURE = {
  crashId: CRASH_ID,
  stateLabel: 'concluído (fixture)',
  summary: { dinamica: 'colisão (fixture)' },
  thirdPartyFieldsSuppressed: true,
};

/** `GET /v1/portal/exams` — sem fixture de linha (OD-P19). */
export const EXAM_LIST_FIXTURE = {
  items: [
    {
      examId: EXAM_ID,
      legalLabel: 'apto com restrições',
      validUntil: '2031-05-01',
      boardDueOn: null as string | null,
    },
  ],
  total: 1,
  page: 1,
  pageSize: 20,
};

export const EXAM_DETAIL_FIXTURE = {
  examId: EXAM_ID,
  legalLabel: 'inapto',
  validUntil: null as string | null,
  boardDueOn: '2026-10-14',
};

/** `GET /v1/portal/manifestations` — lista (anônimas não são listáveis). */
export const MANIFESTATION_LIST_FIXTURE = {
  items: [
    {
      manifestationId: MANIFESTATION_EM_ANALISE_ID,
      state: 'EM_ANALISE' as const,
      protocol: 'AM-FIXTURES-2026-0000007',
      kind: 'sugestao' as const,
      receivedAt: '2026-09-01T12:00:00-04:00',
      deadlines: { agencyDueOn: '2026-10-01', extended: null },
      decision: null as {
        text: string | null;
        decidedAt: string | null;
      } | null,
      evaluationOffered: false,
      evaluated: false,
    },
  ],
  total: 1,
  page: 1,
  pageSize: 20,
};

/** `GET manifestations/{id}` — ENCERRADA com prorrogação (seed 10.6/10.6-ext; C-3c-46). */
export const MANIFESTATION_ENCERRADA_FIXTURE = {
  manifestationId: MANIFESTATION_ENCERRADA_ID,
  state: 'ENCERRADA' as const,
  protocol: 'AM-FIXTURES-2026-000000b',
  kind: 'reclamacao' as const,
  receivedAt: '2026-07-20T12:00:00-04:00',
  deadlines: {
    agencyDueOn: '2026-08-19',
    extended: {
      justification: 'fixture: prorrogação justificada',
      on: '2026-08-15',
      newDueOn: '2026-09-18',
    },
  },
  decision: { text: 'fixture', decidedAt: '2026-09-05T12:00:00-04:00' },
  evaluationOffered: false,
  evaluated: false,
  text: 'Texto da manifestação (fixture)',
  confidential: false,
};

/** `GET manifestations/{id}` — CIENCIA_AO_USUARIO (seed 10.6; C-3c-47). */
export const MANIFESTATION_CIENCIA_FIXTURE = {
  manifestationId: MANIFESTATION_CIENCIA_ID,
  state: 'CIENCIA_AO_USUARIO' as const,
  protocol: 'AM-FIXTURES-2026-000000a',
  kind: 'elogio' as const,
  receivedAt: '2026-08-10T12:00:00-04:00',
  deadlines: { agencyDueOn: '2026-09-09', extended: null },
  decision: { text: 'fixture', decidedAt: '2026-09-01T12:00:00-04:00' },
  evaluationOffered: false,
  evaluated: false,
  text: 'Texto da manifestação (fixture)',
  confidential: false,
};

/** `GET manifestations/{id}` — EM_ANALISE (sem botão de ciência; C-3c-47 negativo). */
export const MANIFESTATION_EM_ANALISE_FIXTURE = {
  manifestationId: MANIFESTATION_EM_ANALISE_ID,
  state: 'EM_ANALISE' as const,
  protocol: 'AM-FIXTURES-2026-0000007',
  kind: 'sugestao' as const,
  receivedAt: '2026-09-01T12:00:00-04:00',
  deadlines: { agencyDueOn: '2026-10-01', extended: null },
  decision: null as { text: string | null; decidedAt: string | null } | null,
  evaluationOffered: false,
  evaluated: false,
  text: 'Texto da manifestação (fixture)',
  confidential: false,
};

/** `POST /v1/portal/manifestations` 201 — contrato §2.1. */
export const MANIFESTATION_CREATED_FIXTURE = {
  manifestationId: MANIFESTATION_ANONYMOUS_ID,
  protocol: 'AM-FIXTURES-2026-000000e',
  receivedAt: FIXED_CLOCK_ISO,
  state: 'COMPROVANTE_EMITIDO' as const,
  agencyDueOn: '2026-10-14',
  anonymous: false,
};

/** `POST manifestations/{id}/acknowledge` 200 — ETag "2" (contrato §2.3; C-3c-13/47). */
export const MANIFESTATION_ACKNOWLEDGED_FIXTURE = {
  manifestationId: MANIFESTATION_CIENCIA_ID,
  state: 'AVALIACAO_OFERECIDA' as const,
  acknowledgedAt: FIXED_CLOCK_ISO,
  evaluationOffered: true,
  version: 2,
};

/** `POST /v1/portal/evaluations` 201 — contrato §2.1. */
export const EVALUATION_CREATED_FIXTURE = {
  evaluationId: 'evaluation-fixture-1',
  subjectKind: 'request' as const,
  subjectId: REQUEST_ADESAO_SNE_ID,
  state: 'AVALIADA' as const,
  submittedAt: FIXED_CLOCK_ISO,
  publicNotice: 'portal.evaluations.publicIndicator',
};

/** `GET /v1/portal/identity/me` do par 3 — `preferences: null` (OD-P38/OD-P87). */
export const ME_PAIR3_FIXTURE = {
  subjectId: SUBJECT_PRATA_ID,
  cpf: '00000000191', // seed 10.2: só cpf_hash é persistido — dígitos de teste (nunca cpf real)
  name: 'Cidadã Prata (fixture)',
  assuranceLevel: 'avancada' as const,
  govbrLevelObservedAt: '2026-09-14T12:00:00-04:00',
  actRequirements: [
    { actKey: 'defesa_previa', minimumAssurance: 'avancada', allowed: true },
    { actKey: 'adesao_sne', minimumAssurance: 'avancada', allowed: true },
    {
      actKey: 'lgpd_declaracao:declaracao_completa',
      minimumAssurance: 'avancada',
      allowed: true,
    },
  ],
  representations: [
    {
      id: '00000000-0000-7000-8000-000070100001',
      representedName: 'Cidadã Prata (fixture)',
      scope: 'ait' as const,
      validUntil: '2027-09-14',
    },
  ],
  preferences: null as unknown,
  heldDataSummary: [] as readonly Record<string, unknown>[],
};

export const ME_PAIR3_WITH_DATA_FIXTURE = {
  ...ME_PAIR3_FIXTURE,
  heldDataSummary: [{ campo: 'fixture' }] as readonly Record<string, unknown>[],
};

/** `GET /v1/portal/services` — 15 itens (seed 10.7: junta_medica ausente do catálogo). */
export const PORTAL_SERVICE_CATALOG_FIXTURE = [
  'consulta_multas',
  'defesa_previa',
  'recurso_jari',
  'recurso_cetran',
  'indicacao_condutor',
  'pagamento',
  'adesao_sne',
  'cancelamento_sne',
  'consulta_cnh',
  'emissao_crlv',
  'consulta_bat',
  'consulta_exame',
  'manifestar',
  'avaliar',
  'lgpd_declaracao',
].map((serviceKey) => ({
  serviceKey,
  path: `/servicos/${serviceKey.replace(/_/g, '-')}`,
  category: 'fixture',
  title: `${serviceKey} (fixture)`,
  summary: `${serviceKey} (fixture)`,
  requirements: [] as readonly string[],
  deliveryChannel: 'portal',
  legalDeadline: 'source_pending (OD-P26)',
  cost: 'gratuito',
  accessibilityNote: 'Conforme declaração de acessibilidade (RN-PORTAL-113)',
  responsibleParty: 'DETRAN-AM',
  normativeReference: 'fixture',
  availability:
    serviceKey === 'lgpd_declaracao' || serviceKey === 'pagamento'
      ? ('partially_available' as const)
      : ('available' as const),
  unavailableReason: null as string | null,
  alternativeChannelNote:
    serviceKey === 'lgpd_declaracao'
      ? 'Somente confirmação de tratamento; declaração completa pendente (OD-P17)'
      : (null as string | null),
  minimumAssurance:
    serviceKey === 'adesao_sne' || serviceKey === 'cancelamento_sne'
      ? ('avancada' as const)
      : ('simples' as const),
  version: 1,
  effectiveFrom: '2026-01-01',
}));

/** `GET services/defesa_previa` — item indisponível (C-3c-63; A4 do plan.md). */
export const SERVICE_DEFESA_PREVIA_UNAVAILABLE_FIXTURE = {
  serviceKey: 'defesa_previa',
  path: '/servicos/defesa-previa',
  category: 'fixture',
  title: 'Defesa prévia (fixture)',
  summary: 'Defesa prévia (fixture)',
  requirements: [] as readonly string[],
  deliveryChannel: 'portal',
  legalDeadline: 'source_pending (OD-P26)',
  cost: 'gratuito',
  accessibilityNote: 'Conforme declaração de acessibilidade (RN-PORTAL-113)',
  responsibleParty: 'DETRAN-AM',
  normativeReference: 'fixture',
  availability: 'unavailable' as const,
  unavailableReason: 'delegacao_indisponivel_r0007',
  alternativeChannelNote: 'Atendimento presencial (fixture)',
  minimumAssurance: 'avancada' as const,
  version: 1,
  effectiveFrom: '2026-01-01',
};
