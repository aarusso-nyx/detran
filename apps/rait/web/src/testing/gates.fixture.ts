// R-0012 TASK-0011 (Inspector). Transcrição INDEPENDENTE (nunca importa `forms/`) dos 25 gates
// do contrato `work/rounds/R-0012/contracts/CTG-0002c.md` §5.1 (estrutura literal do §4, um
// bloco por gate) e do mapa comando M8 → chave de política do §3 (64 linhas; `null` para as 7
// ações só de ficha, sem chave em `RAIT_COMMAND_RULES` — fail-closed, OD-R12-027). Tipos locais
// (não importa `FormGate` de `forms/form-gate.ts`), como `policy.fixture.ts` faz com
// `RAIT_COMMAND_RULES`. `roles` de cada gate = linha real de `policy.ts` (§3, coluna "papéis"),
// na ordem em que o §4 a escreve; `gates-matrix.spec.ts` (C-2C-82…85) prova que coincide, como
// conjunto, com `ROLE_PERMISSIONS_FIXTURE` e com `readPolicyCommandRules()` (`kb.ts`).
//
// Nenhum valor inventado: cada `note`/`source`, token, comando e código vem do §4/§5 do
// contrato; tokens de caso ([WF-RAIT-001]), de sessão ([WF-RAIT-003]), de lote/disponibilidade
// ([WF-RAIT-004] §9), `ATIVO` (status do membro), `vigente`/`solicitada` (enums dos contratos
// gerados). As duas renomeações (#9 `answer` → `answer-inquiry`, #10 `extend` →
// `extend-inquiry`) são bloqueio conhecido de OD-R12-026 e ficam AFIRMADAS aqui, nunca
// corrigidas em silêncio.
import type { RaitCommand } from '../app/data/models/commands';
import type { RaitRoleCode } from './route-manifest.fixture';

export interface GatePreconditionFixture {
  readonly note: string;
  readonly source: string;
}

/** Mesma forma de `FormGate` (contrato §2.1), declarada localmente. */
export interface FormGateFixture {
  readonly preState: readonly string[] | null;
  readonly roles: readonly RaitRoleCode[];
  readonly preconditions: readonly GatePreconditionFixture[];
  readonly command: RaitCommand;
  readonly postState: string | null;
  readonly errorCodes: readonly string[];
}

/** Contrato §4.10: as oito origens de `→ ENCERRADO_DESISTENCIA` do diagrama de [WF-RAIT-001]
 * (`ADMITIDO` não consta do diagrama → OD-R12-047; não acrescentado). */
export const WITHDRAWAL_PRE_DECISION_STATES_FIXTURE = [
  'PROTOCOLADO',
  'TRIAGEM_ADMISSIBILIDADE',
  'AGUARDANDO_REMESSA_JARI',
  'DISTRIBUIDO',
  'EM_INSTRUCAO',
  'DILIGENCIA',
  'PRONTO_P_DECISAO',
  'PAUTADO',
] as const;

const SPEC_7 = 'rait-web-frontend.md §7';
const SPEC_9 = 'rait-web-frontend.md §9';

/** Os 25 gates (contrato §5.1, na ordem da tabela; conteúdo literal do §4). */
export const GATES_FIXTURE: Readonly<Record<string, FormGateFixture>> = {
  // §4.1
  INTAKE_FISICO_GATE: {
    preState: null,
    roles: ['rait-secretary'],
    preconditions: [
      { note: 'conteúdo mínimo ou pendência aberta', source: SPEC_7 },
      {
        note: 'um AIT por requerimento; CPF/CNPJ válidos; data do marco ≤ hoje',
        source: SPEC_9,
      },
      {
        note: 'marco de tempestividade pelo canal utilizado, nunca pela chegada ao julgador',
        source: 'RN-RAIT-106',
      },
    ],
    command: 'rait-case:protocol',
    postState: 'PROTOCOLADO',
    errorCodes: [
      'RAIT.INTAKE_MULTIPLE_AIT',
      'RAIT.INTAKE_DUPLICATE_INSTANCE',
      'RAIT.INTAKE_INFRACTION_STATE_INVALID',
      'RAIT.INTAKE_CHANNEL_MARK_MISSING',
      'RAIT.INTAKE_MINIMUM_CONTENT',
      'RAIT.DOCUMENT_INVALID',
      'RAIT.DATE_IN_FUTURE',
      'RAIT.PARTY_LEGITIMACY_INVALID',
      'RAIT.FILE_TYPE_UNSUPPORTED',
      'RAIT.FILE_TOO_LARGE',
      'RAIT.VALIDATION_FAILED',
      'RAIT.IDEMPOTENCY_REPLAY',
    ],
  },
  // §4.2
  TRIAGEM_GATE: {
    preState: ['TRIAGEM_ADMISSIBILIDADE'],
    roles: ['rait-analyst', 'rait-secretary'],
    preconditions: [
      { note: 'TRIAGEM_ADMISSIBILIDADE', source: SPEC_7 },
      { note: 'tempestividade somente leitura', source: SPEC_9 },
    ],
    command: 'rait-case:triage',
    postState: null,
    errorCodes: [
      'RAIT.TRIAGE_TIMELINESS_READONLY',
      'RAIT.PROCURATION_UNVERIFIED',
      'RAIT.CASE_STATE_INVALID',
      'RAIT.VALIDATION_FAILED',
    ],
  },
  TRIAGEM_ADMIT_GATE: {
    preState: ['TRIAGEM_ADMISSIBILIDADE'],
    roles: ['rait-analyst'],
    preconditions: [
      { note: '4 vereditos registrados', source: SPEC_7 },
      {
        note: 'passa nos 4 critérios de admissibilidade',
        source: 'WF-RAIT-001 §Transições',
      },
    ],
    command: 'rait-case:admit',
    postState: 'ADMITIDO',
    errorCodes: [
      'RAIT.TRIAGE_INCOMPLETE',
      'RAIT.INTAKE_SIGNATURE_MISSING',
      'RAIT.CASE_STATE_INVALID',
    ],
  },
  TRIAGEM_REJECT_GATE: {
    preState: ['TRIAGEM_ADMISSIBILIDADE'],
    roles: ['rait-analyst'],
    preconditions: [
      { note: '4 vereditos registrados', source: SPEC_7 },
      {
        note: 'não conhecimento exige fundamento citando o inciso do art. 4º da Res. 900',
        source: SPEC_9,
      },
    ],
    command: 'rait-case:reject',
    postState: 'NAO_CONHECIDO',
    errorCodes: [
      'RAIT.TRIAGE_INCOMPLETE',
      'RAIT.NON_ADMISSION_REASON_REQUIRED',
      'RAIT.CASE_STATE_INVALID',
    ],
  },
  // §4.3
  DILIGENCIA_GATE: {
    preState: ['EM_INSTRUCAO'],
    roles: ['rait-analyst', 'rait-rapporteur'],
    preconditions: [
      { note: 'EM_INSTRUCAO / DILIGENCIA', source: SPEC_7 },
      {
        note: 'destinatário "requerente" bloqueado para documento do órgão',
        source: SPEC_9,
      },
      {
        note: 'diligência sem prazo nunca é permitida',
        source: 'IU-RAIT-010 §6; RN-RAIT-004',
      },
    ],
    command: 'rait-case:open-inquiry',
    postState: 'DILIGENCIA',
    errorCodes: [
      'RAIT.INQUIRY_ADDRESSEE_FORBIDDEN',
      'RAIT.CASE_OFFICIAL_DOCUMENT_REQUIRED',
      'RAIT.CASE_STATE_INVALID',
    ],
  },
  DILIGENCIA_ANSWER_GATE: {
    preState: ['DILIGENCIA'],
    roles: ['rait-analyst', 'rait-rapporteur'],
    preconditions: [
      {
        note: 'resposta tempestiva anexada',
        source: 'WF-RAIT-001 §Transições',
      },
    ],
    command: 'rait-case:answer',
    postState: 'EM_INSTRUCAO',
    errorCodes: ['RAIT.INQUIRY_ALREADY_CLOSED', 'RAIT.CASE_STATE_INVALID'],
  },
  DILIGENCIA_EXTEND_GATE: {
    preState: ['DILIGENCIA'],
    roles: ['rait-analyst', 'rait-rapporteur'],
    preconditions: [
      { note: 'prorrogação 1x', source: SPEC_9 },
      {
        note: 'Prorrogação única; nova prorrogação exige ato motivado',
        source: 'IU-RAIT-010 §6',
      },
    ],
    command: 'rait-case:extend',
    postState: 'DILIGENCIA',
    errorCodes: [
      'RAIT.INQUIRY_EXTENSION_LIMIT',
      'RAIT.INQUIRY_ALREADY_CLOSED',
      'RAIT.CASE_STATE_INVALID',
    ],
  },
  // §4.4
  MINUTA_GATE: {
    preState: ['EM_INSTRUCAO'],
    roles: ['rait-analyst'],
    preconditions: [
      { note: 'minuta com dispositivo', source: SPEC_7 },
      { note: 'quem instrui não é quem assina', source: 'IU-RAIT-011 §6' },
    ],
    command: 'rait-case:submit-draft',
    postState: 'PRONTO_P_DECISAO',
    errorCodes: ['RAIT.DRAFT_INCOMPLETE', 'RAIT.CASE_STATE_INVALID'],
  },
  // §4.5
  DECISAO_AUTORIDADE_GATE: {
    preState: ['PRONTO_P_DECISAO'],
    roles: ['rait-signing-authority'],
    preconditions: [
      { note: 'PRONTO_P_DECISAO, circunscrição, escala', source: SPEC_7 },
      { note: 'circunscrição = do AIT; escala do dia', source: SPEC_9 },
      {
        note: 'a assinatura é pessoal e territorial',
        source: 'IU-RAIT-012 §6; RN-RAIT-143',
      },
    ],
    command: 'rait-decision:sign',
    postState: 'DECIDIDO_AUTORIDADE',
    errorCodes: [
      'RAIT.DECISION_JURISDICTION',
      'RAIT.DECISION_NOT_ON_DUTY',
      'RAIT.DECISION_GROUNDS_REQUIRED',
      'RAIT.DECISION_KIND_INVALID_FOR_INSTANCE',
      'RAIT.DRAFT_AUTHOR_CANNOT_SIGN',
      'RAIT.SIGNATURE_FAILED',
      'RAIT.SIGNATURE_CERT_MISMATCH',
      'RAIT.DECISION_ALREADY_SIGNED',
      'RAIT.EXTINCTION_DECISION_LATE',
      'RAIT.FORBIDDEN_CASE_SCOPE',
      'RAIT.CASE_STATE_INVALID',
    ],
  },
  DECISAO_AUTORIDADE_RETURN_GATE: {
    preState: ['PRONTO_P_DECISAO'],
    roles: ['rait-signing-authority'],
    preconditions: [{ note: '1ª devolução', source: SPEC_7 }],
    command: 'rait-decision:return-draft',
    postState: 'PRONTO_P_DECISAO',
    errorCodes: ['RAIT.DRAFT_RETURN_LIMIT', 'RAIT.CASE_STATE_INVALID'],
  },
  // §4.6
  PARECER_VOTO_GATE: {
    preState: ['EM_INSTRUCAO'],
    roles: ['rait-rapporteur'],
    preconditions: [
      { note: 'EM_INSTRUCAO', source: SPEC_7 },
      { note: 'voto obrigatório', source: SPEC_9 },
    ],
    command: 'rait-opinion:register',
    postState: 'PRONTO_P_DECISAO',
    errorCodes: [
      'RAIT.DRAFT_INCOMPLETE',
      'RAIT.DECISION_GROUNDS_REQUIRED',
      'RAIT.CASE_STATE_INVALID',
      'RAIT.MEMBER_IMPEDED',
    ],
  },
  // §4.7
  LOTE_SORTEIO_GATE: {
    preState: null,
    roles: ['rait-secretary'],
    preconditions: [
      { note: 'casos sem relator', source: SPEC_7 },
      {
        note: 'lote semanal (proposta); LOTE_ABERTO',
        source: 'WF-RAIT-004 §5 passo 1',
      },
    ],
    command: 'rait-batch:open',
    postState: 'LOTE_ABERTO',
    errorCodes: ['RAIT.BATCH_STATE_INVALID', 'RAIT.IDEMPOTENCY_REPLAY'],
  },
  LOTE_SORTEIO_DRAW_GATE: {
    preState: ['LOTE_ABERTO'],
    roles: ['rait-secretary'],
    preconditions: [
      {
        note: 'membros elegíveis ATIVO e DISPONIVEL/EM_PLANTAO; exclui quem lavrou o AIT ou tem impedimento/suspeição',
        source: 'WF-RAIT-004 §5 passos 2–3',
      },
    ],
    command: 'rait-batch:draw',
    postState: 'LOTE_SORTEADO',
    errorCodes: [
      'RAIT.BATCH_NO_ELIGIBLE_MEMBERS',
      'RAIT.BATCH_STATE_INVALID',
      'RAIT.MEMBER_IMPEDED',
      'RAIT.MEMBER_NOT_AVAILABLE',
      'RAIT.ASSIGNMENT_ALREADY_ACTIVE',
    ],
  },
  LOTE_SORTEIO_APPROVE_GATE: {
    preState: ['LOTE_SORTEADO'],
    roles: ['rait-chair'],
    preconditions: [
      {
        note: 'ata assinada pelo presidente (PAdES+TSA)',
        source: 'WF-RAIT-004 §5 passo 4',
      },
    ],
    command: 'rait-batch:approve',
    postState: 'LOTE_ACEITO',
    errorCodes: ['RAIT.BATCH_SEED_TAMPERED', 'RAIT.BATCH_STATE_INVALID'],
  },
  // §4.8
  PAUTA_GATE: {
    preState: ['FORMANDO_PAUTA'],
    roles: ['rait-chair'],
    preconditions: [
      { note: 'itens com parecer; N3/CRÍTICO incluídos', source: SPEC_7 },
      {
        note: 'casos PRONTO_P_DECISAO → PAUTADO',
        source: 'rait-web-frontend.md §6.6',
      },
      {
        note: 'convocação com no mínimo 5 dias úteis de antecedência (pendente regimento)',
        source: 'WF-RAIT-003 §Convocação',
      },
    ],
    command: 'rait-agenda:close',
    postState: 'PAUTA_FECHADA',
    errorCodes: [
      'RAIT.AGENDA_ITEM_WITHOUT_OPINION',
      'RAIT.AGENDA_CRITICAL_MISSING',
      'RAIT.AGENDA_SHORT_NOTICE',
      'RAIT.AGENDA_ITEM_DUPLICATE',
      'RAIT.SESSION_STATE_INVALID',
    ],
  },
  // §4.9
  SESSAO_AO_VIVO_GATE: {
    preState: ['VOTACAO'],
    roles: ['rait-rapporteur', 'rait-chair'],
    preconditions: [
      { note: 'item em votação, não impedido', source: SPEC_7 },
      {
        note: 'membro impedido num item não vota nem conta para o quorum daquele item',
        source: 'RN-RAIT-140',
      },
    ],
    command: 'rait-session:vote',
    postState: null,
    errorCodes: [
      'RAIT.VOTE_MEMBER_IMPEDED',
      'RAIT.VOTE_ITEM_NOT_OPEN',
      'RAIT.VOTE_DUPLICATE',
      'RAIT.SESSION_QUORUM_MISSING',
      'RAIT.SESSION_STATE_INVALID',
    ],
  },
  SESSAO_AO_VIVO_CASTING_VOTE_GATE: {
    preState: ['DESEMPATE_PRESIDENTE'],
    roles: ['rait-chair'],
    preconditions: [
      {
        note: 'votos empatados — voto de qualidade do presidente',
        source: 'WF-RAIT-003 §Votação e empate',
      },
    ],
    command: 'rait-session:casting-vote',
    postState: null,
    errorCodes: [
      'RAIT.CASTING_VOTE_NOT_TIED',
      'RAIT.CASTING_VOTE_NOT_CHAIR',
      'RAIT.SESSION_STATE_INVALID',
    ],
  },
  SESSAO_AO_VIVO_OPEN_GATE: {
    preState: ['CONVOCACAO_ENVIADA'],
    roles: ['rait-chair'],
    preconditions: [
      { note: 'quorum confirmado', source: SPEC_7 },
      {
        note: 'maioria simples dos integrantes com o presidente ou seu suplente; no CETRAN, paridade',
        source: 'RN-RAIT-142',
      },
    ],
    command: 'rait-session:open',
    postState: 'SESSAO_ABERTA',
    errorCodes: [
      'RAIT.SESSION_QUORUM_MISSING',
      'RAIT.BENCH_INSUFFICIENT',
      'RAIT.SESSION_STATE_INVALID',
    ],
  },
  // §4.10
  DESISTENCIA_GATE: {
    preState: WITHDRAWAL_PRE_DECISION_STATES_FIXTURE,
    roles: ['rait-secretary'],
    preconditions: [
      { note: 'pré-decisão, termo assinado', source: SPEC_7 },
      {
        note: 'O requerente pode desistir por escrito até o julgamento',
        source: 'RN-RAIT-004',
      },
    ],
    command: 'rait-case:withdraw',
    postState: 'ENCERRADO_DESISTENCIA',
    errorCodes: [
      'RAIT.WITHDRAWAL_AFTER_DECISION',
      'RAIT.WITHDRAWAL_LEGITIMACY',
      'RAIT.CASE_STATE_INVALID',
    ],
  },
  // §4.11 (sem token de rascunho no contrato → OD-R12-048)
  ESCALA_GATE: {
    preState: null,
    roles: ['rait-coordinator', 'rait-chair'],
    preconditions: [
      { note: 'plantonista por dia', source: SPEC_7 },
      { note: 'plantonista por dia útil', source: SPEC_9 },
      {
        note: 'só membros DISPONIVEL puxam casos; ausência programada rebaixa WIP a zero',
        source: 'WF-RAIT-004 §3',
      },
    ],
    command: 'rait-schedule:publish',
    postState: null,
    errorCodes: [
      'RAIT.SCHEDULE_NO_DUTY_MEMBER',
      'RAIT.SCHEDULE_PERIOD_LOCKED',
      'RAIT.IDEMPOTENCY_REPLAY',
    ],
  },
  // §4.12
  MANDATO_GATE: {
    preState: null,
    roles: ['rait-hr'],
    preconditions: [
      { note: 'ato publicado', source: SPEC_7 },
      { note: 'sem posse não há distribuição', source: 'IU-RAIT-047 §6' },
    ],
    command: 'rait-member:mandate',
    postState: 'ATIVO',
    errorCodes: [
      'RAIT.MANDATE_ACT_REQUIRED',
      'RAIT.MANDATE_DUAL_BODY',
      'RAIT.MANDATE_OVERLAP',
      'RAIT.MANDATE_ACTIVE_ASSIGNMENTS',
      'RAIT.IDEMPOTENCY_REPLAY',
    ],
  },
  // §4.13
  REATRIBUICAO_GATE: {
    preState: ['DISTRIBUIDO', 'EM_INSTRUCAO', 'DILIGENCIA'],
    roles: ['rait-coordinator', 'rait-manager', 'rait-chair'],
    preconditions: [
      { note: 'motivo tipado', source: SPEC_7 },
      { note: 'nunca ao impedido', source: SPEC_9 },
    ],
    command: 'rait-assignment:reassign',
    postState: null,
    errorCodes: [
      'RAIT.REASSIGN_REASON_REQUIRED',
      'RAIT.REASSIGN_TO_SAME_MEMBER',
      'RAIT.MEMBER_IMPEDED',
      'RAIT.MEMBER_NOT_AVAILABLE',
      'RAIT.CASE_STATE_INVALID',
    ],
  },
  // §4.14
  ATO_SUSPENSAO_GATE: {
    preState: null,
    roles: ['rait-signing-authority', 'rait-chair'],
    preconditions: [
      { note: 'prova de força maior', source: SPEC_7 },
      {
        note: 'nunca automática; a suspensão é ato motivado e auditado',
        source: 'IU-RAIT-064 §6; RN-RAIT-105',
      },
    ],
    command: 'rait-suspension-act:create',
    postState: 'vigente',
    errorCodes: [
      'RAIT.SUSPENSION_LEGAL_TIMER',
      'RAIT.SUSPENSION_EVIDENCE_REQUIRED',
      'RAIT.DEADLINE_LEGAL_READONLY',
      'RAIT.IDEMPOTENCY_REPLAY',
    ],
  },
  // §4.15
  PARAMETRO_GATE: {
    preState: null,
    roles: ['agency-admin'],
    preconditions: [
      { note: 'motivo e vigência', source: SPEC_7 },
      { note: 'prazos legais somente leitura', source: SPEC_9 },
    ],
    command: 'rait-parameter:update',
    postState: null,
    errorCodes: [
      'RAIT.PARAMETER_LEGAL_READONLY',
      'RAIT.PARAMETER_EFFECTIVE_DATE_PAST',
      'RAIT.PARAMETER_SOURCE_PENDING',
      'RAIT.DEADLINE_LEGAL_READONLY',
    ],
  },
  // §4.16
  EXPORTACAO_GATE: {
    preState: null,
    roles: ['AUDITOR'],
    preconditions: [
      { note: 'finalidade', source: SPEC_7 },
      {
        note: 'finalidade obrigatória; nominal em massa exige aprovação do DPO',
        source: SPEC_9,
      },
    ],
    command: 'rait-export:create',
    postState: 'solicitada',
    errorCodes: [
      'RAIT.EXPORT_PURPOSE_REQUIRED',
      'RAIT.EXPORT_DPO_APPROVAL_REQUIRED',
      'RAIT.IDEMPOTENCY_REPLAY',
    ],
  },
};

/** Nome do export do gate → chave de política real (`policy.ts`), contrato §5.1 coluna
 * "chave policy.ts" (25 linhas, mesma ordem). */
export const GATE_POLICY_KEY_FIXTURE: Readonly<Record<string, string>> = {
  INTAKE_FISICO_GATE: 'inf:rait-case:protocol',
  TRIAGEM_GATE: 'inf:rait-case:triage',
  TRIAGEM_ADMIT_GATE: 'inf:rait-case:admit',
  TRIAGEM_REJECT_GATE: 'inf:rait-case:reject',
  DILIGENCIA_GATE: 'inf:rait-case:open-inquiry',
  DILIGENCIA_ANSWER_GATE: 'inf:rait-case:answer-inquiry',
  DILIGENCIA_EXTEND_GATE: 'inf:rait-case:extend-inquiry',
  MINUTA_GATE: 'inf:rait-case:submit-draft',
  DECISAO_AUTORIDADE_GATE: 'inf:rait-decision:sign',
  DECISAO_AUTORIDADE_RETURN_GATE: 'inf:rait-decision:return-draft',
  PARECER_VOTO_GATE: 'inf:rait-opinion:register',
  LOTE_SORTEIO_GATE: 'inf:rait-batch:open',
  LOTE_SORTEIO_DRAW_GATE: 'inf:rait-batch:draw',
  LOTE_SORTEIO_APPROVE_GATE: 'inf:rait-batch:approve',
  PAUTA_GATE: 'inf:rait-agenda:close',
  SESSAO_AO_VIVO_GATE: 'inf:rait-session:vote',
  SESSAO_AO_VIVO_CASTING_VOTE_GATE: 'inf:rait-session:casting-vote',
  SESSAO_AO_VIVO_OPEN_GATE: 'inf:rait-session:open',
  DESISTENCIA_GATE: 'inf:rait-case:withdraw',
  ESCALA_GATE: 'inf:rait-schedule:publish',
  MANDATO_GATE: 'inf:rait-member:mandate',
  REATRIBUICAO_GATE: 'inf:rait-assignment:reassign',
  ATO_SUSPENSAO_GATE: 'inf:rait-suspension-act:create',
  PARAMETRO_GATE: 'inf:rait-parameter:update',
  EXPORTACAO_GATE: 'inf:rait-export:create',
};

/** Contrato §3: as 64 linhas de `RAIT_COMMANDS` (ordem do arquivo) → chave de política ou
 * `null` (7 ações só de ficha, sem chave — fail-closed, OD-R12-027). */
export const COMMAND_POLICY_KEY_FIXTURE: Readonly<
  Record<RaitCommand, string | null>
> = {
  'rait-case:protocol': 'inf:rait-case:protocol',
  'rait-case:claim-next': 'inf:rait-case:claim-next',
  'rait-case:triage': 'inf:rait-case:triage',
  'rait-case:admit': 'inf:rait-case:admit',
  'rait-case:reject': 'inf:rait-case:reject',
  'rait-case:remit-jari': 'inf:rait-case:remit-jari',
  'rait-case:receive-judging-body': 'inf:rait-case:receive-judging-body',
  'rait-case:open-inquiry': 'inf:rait-case:open-inquiry',
  'rait-case:answer': 'inf:rait-case:answer-inquiry', // #9 renomeada (OD-R12-026)
  'rait-case:extend': 'inf:rait-case:extend-inquiry', // #10 renomeada (OD-R12-026)
  'rait-case:submit-draft': 'inf:rait-case:submit-draft',
  'rait-decision:sign': 'inf:rait-decision:sign',
  'rait-decision:return-draft': 'inf:rait-decision:return-draft',
  'rait-batch:open': 'inf:rait-batch:open',
  'rait-batch:draw': 'inf:rait-batch:draw',
  'rait-batch:approve': 'inf:rait-batch:approve',
  'rait-batch:accept': 'inf:rait-batch:accept',
  'rait-batch:impede': 'inf:rait-batch:impede',
  'rait-opinion:register': 'inf:rait-opinion:register',
  'rait-agenda:close': 'inf:rait-agenda:close',
  'rait-session:open': 'inf:rait-session:open',
  'rait-session:adjourn': 'inf:rait-session:adjourn',
  'rait-session:vote': 'inf:rait-session:vote',
  'rait-session:casting-vote': 'inf:rait-session:casting-vote',
  'rait-session:view-request': 'inf:rait-session:view-request',
  'rait-session:proclaim': 'inf:rait-session:proclaim',
  'rait-minutes:generate': 'inf:rait-minutes:generate',
  'rait-minutes:sign': 'inf:rait-minutes:sign',
  'rait-minutes:publish': 'inf:rait-minutes:publish',
  'rait-appeal:authority-decide': 'inf:rait-appeal:authority-decide',
  'rait-appeal:waive': 'inf:rait-appeal:waive',
  'rait-case:withdraw': 'inf:rait-case:withdraw',
  'rait-assignment:reassign': 'inf:rait-assignment:reassign',
  'rait-impediment:declare': 'inf:rait-impediment:declare',
  'rait-impediment:suspicion': 'inf:rait-impediment:suspicion',
  'rait-schedule:publish': 'inf:rait-schedule:publish',
  'rait-member:mandate': 'inf:rait-member:mandate',
  'rait-jeton:generate': 'inf:rait-jeton:generate',
  'rait-jeton:approve': 'inf:rait-jeton:approve',
  'rait-unit:constitute': 'inf:rait-unit:constitute',
  'rait-unit:activate': 'inf:rait-unit:activate',
  'rait-clock:acknowledge-alert': 'inf:rait-clock:acknowledge-alert',
  'rait-extinction:declare': 'inf:rait-extinction:declare',
  'rait-suspension-act:create': 'inf:rait-suspension-act:create',
  'rait-parameter:update': 'inf:rait-parameter:update',
  'rait-export:create': 'inf:rait-export:create',
  'rait-document:attach-official': null, // #47 só ficha 009
  'rait-case:resolve-pending-content': 'inf:rait-case:resolve-pending-content',
  'rait-case:redirect': 'inf:rait-case:redirect',
  'rait-impediment:decide': null, // #50 só ficha 016
  'rait-attendance:confirm': null, // #51 só ficha 035
  'rait-attendance:summon-substitute': null, // #52 só ficha 035
  'rait-session:register-view-vote': null, // #53 só ficha 037
  'rait-session:convene-extraordinary':
    'inf:rait-session:convene-extraordinary',
  'rait-pool:update': null, // #55 só ficha 048
  'rait-capacity-plan:publish': 'inf:rait-capacity-plan:publish',
  'rait-quality-sample:review': 'inf:rait-quality-sample:review',
  'rait-integration:retry': 'inf:rait-integration:retry',
  'rait-integration:reconcile': 'inf:rait-integration:reconcile',
  'rait-collection:issue': 'inf:rait-collection:issue',
  'rait-refund:order': 'inf:rait-refund:order',
  'rait-debt:handoff': 'inf:rait-debt:handoff',
  'rait-payment:reconcile': 'inf:rait-payment:reconcile',
  'rait-calendar:update': null, // #64 só ficha 063
};
