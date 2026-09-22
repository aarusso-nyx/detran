// Listas em runtime dos tokens dos contratos gerados (contrato CTG-0002b §2 `tokens.ts`): cada
// lista é PROVADA contra o tipo do contrato — `satisfies readonly X[]` impede token estranho e
// `Exhaustive<…>` falha o typecheck se faltar um token. Não é tabela paralela (spec §8 "enums dos
// contratos são a única fonte de tokens"): a ordem é a do contrato gerado. A UI só traduz
// rótulos por `tokenKey` (glossário §2.1; A1).
import type {
  RaitAdmissibilityCriterion,
  RaitCaseState,
  RaitCommunicationChannel,
  RaitDecisionKind,
  RaitDocumentOrigin,
  RaitInquiryAddressee,
  RaitInstance,
  RaitTimerCode,
} from './case.models';
import type {
  RaitAvailability,
  RaitBatchState,
  RaitBenchState,
  RaitClockCode,
  RaitImpedimentKind,
  RaitMemberStatus,
  RaitReleaseReason,
  RaitRiskFlag,
  RaitUnitState,
} from './worklist.models';
import type {
  RaitJudgingBody,
  RaitOpinionVote,
  RaitSessionState,
  RaitVoteValue,
} from './session.models';

/** `true` só quando a lista cobre a união inteira; senão `never` (erro de tipo). */
type Exhaustive<Union extends string, List extends readonly string[]> =
  Exclude<Union, List[number]> extends never ? true : never;

export const RAIT_CASE_STATES = [
  'PROTOCOLADO',
  'TRIAGEM_ADMISSIBILIDADE',
  'NAO_CONHECIDO',
  'ADMITIDO',
  'AGUARDANDO_REMESSA_JARI',
  'DISTRIBUIDO',
  'EM_INSTRUCAO',
  'DILIGENCIA',
  'PRONTO_P_DECISAO',
  'DECIDIDO_AUTORIDADE',
  'PAUTADO',
  'JULGADO_SESSAO',
  'COMUNICADO',
  'TRANSITADO',
  'REMETIDO_2A_INSTANCIA',
  'ENCERRADO_DESISTENCIA',
] as const satisfies readonly RaitCaseState[];
const _caseStates: Exhaustive<RaitCaseState, typeof RAIT_CASE_STATES> = true;

export const RAIT_INSTANCES = [
  'defesa_previa',
  'jari',
  'cetran',
] as const satisfies readonly RaitInstance[];
const _instances: Exhaustive<RaitInstance, typeof RAIT_INSTANCES> = true;

export const RAIT_RISK_FLAGS = [
  'SEM_RISCO',
  'ALERTA_N1',
  'ALERTA_N2',
  'ALERTA_N3',
  'CRITICO',
  'PRESCRITO_OPERACIONAL',
] as const satisfies readonly RaitRiskFlag[];
const _riskFlags: Exhaustive<RaitRiskFlag, typeof RAIT_RISK_FLAGS> = true;

export const RAIT_SESSION_STATES = [
  'FORMANDO_PAUTA',
  'PAUTA_FECHADA',
  'CONVOCACAO_ENVIADA',
  'SESSAO_ABERTA',
  'SESSAO_ADIADA',
  'RELATORIA_LIDA',
  'SUSTENTACAO_ORAL',
  'VOTACAO',
  'DESEMPATE_PRESIDENTE',
  'DECISAO_PROCLAMADA',
  'ATA_LAVRADA',
  'ATA_ASSINADA',
] as const satisfies readonly RaitSessionState[];
const _sessionStates: Exhaustive<RaitSessionState, typeof RAIT_SESSION_STATES> =
  true;

export const RAIT_BATCH_STATES = [
  'LOTE_ABERTO',
  'LOTE_SORTEADO',
  'LOTE_ACEITO',
] as const satisfies readonly RaitBatchState[];
const _batchStates: Exhaustive<RaitBatchState, typeof RAIT_BATCH_STATES> = true;

export const RAIT_BENCH_STATES = [
  'BANCA_PREVISTA',
  'BANCA_CONFIRMADA',
  'BANCA_INSUFICIENTE',
] as const satisfies readonly RaitBenchState[];
const _benchStates: Exhaustive<RaitBenchState, typeof RAIT_BENCH_STATES> = true;

export const RAIT_UNIT_STATES = [
  'TURMA_ATIVA',
  'TURMA_EM_CONSTITUICAO',
  'TURMA_SUSPENSA',
] as const satisfies readonly RaitUnitState[];
const _unitStates: Exhaustive<RaitUnitState, typeof RAIT_UNIT_STATES> = true;

export const RAIT_MEMBER_STATUSES = [
  'ATIVO',
  'IMPEDIDO',
  'ADVERTIDO',
  'AFASTADO_TEMP',
  'MANDATO_ENCERRADO',
] as const satisfies readonly RaitMemberStatus[];
const _memberStatuses: Exhaustive<
  RaitMemberStatus,
  typeof RAIT_MEMBER_STATUSES
> = true;

export const RAIT_AVAILABILITIES = [
  'DISPONIVEL',
  'EM_PLANTAO',
  'AUSENTE_PROGRAMADO',
] as const satisfies readonly RaitAvailability[];
const _availabilities: Exhaustive<
  RaitAvailability,
  typeof RAIT_AVAILABILITIES
> = true;

export const RAIT_CLOCK_CODES = [
  'A',
  'B',
  'C',
  'D',
] as const satisfies readonly RaitClockCode[];
const _clockCodes: Exhaustive<RaitClockCode, typeof RAIT_CLOCK_CODES> = true;

export const RAIT_TIMER_CODES = [
  'T-REM10',
  'T-DIL',
  'T-R2',
  'T-JUL-24M',
  'T-PAR-3A',
  'T-DEC',
  'T-VOTO',
  'T-CONV',
] as const satisfies readonly RaitTimerCode[];
const _timerCodes: Exhaustive<RaitTimerCode, typeof RAIT_TIMER_CODES> = true;

export const RAIT_DECISION_KINDS = [
  'acolhida',
  'indeferida',
  'provido',
  'negado',
  'nao_conhecido',
] as const satisfies readonly RaitDecisionKind[];
const _decisionKinds: Exhaustive<RaitDecisionKind, typeof RAIT_DECISION_KINDS> =
  true;

export const RAIT_OPINION_VOTES = [
  'provimento',
  'nao_provimento',
  'nao_conhecimento',
] as const satisfies readonly RaitOpinionVote[];
const _opinionVotes: Exhaustive<RaitOpinionVote, typeof RAIT_OPINION_VOTES> =
  true;

export const RAIT_VOTE_VALUES = [
  'provimento',
  'nao_provimento',
  'nao_conhecimento',
  'abstencao',
] as const satisfies readonly RaitVoteValue[];
const _voteValues: Exhaustive<RaitVoteValue, typeof RAIT_VOTE_VALUES> = true;

export const RAIT_IMPEDIMENT_KINDS = [
  'impedimento',
  'suspeicao',
] as const satisfies readonly RaitImpedimentKind[];
const _impedimentKinds: Exhaustive<
  RaitImpedimentKind,
  typeof RAIT_IMPEDIMENT_KINDS
> = true;

export const RAIT_RELEASE_REASONS = [
  'impedimento',
  'afastamento',
  'rebalanceamento',
  'risco_prescricao',
  'concluido',
] as const satisfies readonly RaitReleaseReason[];
const _releaseReasons: Exhaustive<
  RaitReleaseReason,
  typeof RAIT_RELEASE_REASONS
> = true;

export const RAIT_COMMUNICATION_CHANNELS = [
  'sne',
  'postal',
  'pessoal',
  'edital',
  'portal',
  'balcao',
] as const satisfies readonly RaitCommunicationChannel[];
const _channels: Exhaustive<
  RaitCommunicationChannel,
  typeof RAIT_COMMUNICATION_CHANNELS
> = true;

export const RAIT_ADMISSIBILITY_CRITERIA = [
  'tempestividade',
  'legitimidade',
  'assinatura',
  'pedido_compativel',
] as const satisfies readonly RaitAdmissibilityCriterion[];
const _criteria: Exhaustive<
  RaitAdmissibilityCriterion,
  typeof RAIT_ADMISSIBILITY_CRITERIA
> = true;

export const RAIT_DOCUMENT_ORIGINS = [
  'requerente',
  'oficio',
] as const satisfies readonly RaitDocumentOrigin[];
const _origins: Exhaustive<RaitDocumentOrigin, typeof RAIT_DOCUMENT_ORIGINS> =
  true;

export const RAIT_INQUIRY_ADDRESSEES = [
  'requerente',
  'orgao_autuador',
] as const satisfies readonly RaitInquiryAddressee[];
const _addressees: Exhaustive<
  RaitInquiryAddressee,
  typeof RAIT_INQUIRY_ADDRESSEES
> = true;

export const RAIT_JUDGING_BODIES = [
  'jari',
  'cetran',
] as const satisfies readonly RaitJudgingBody[];
const _judgingBodies: Exhaustive<RaitJudgingBody, typeof RAIT_JUDGING_BODIES> =
  true;
