import type {
  RaitBatchRead,
  RaitBatchItemRead,
  RaitAssignmentRead,
  RaitImpedimentRead,
  RaitBenchRead,
  RaitClockRead,
  RaitClockAlertRead,
} from '../api/worklist.client';
import type {
  RaitCaseRead,
  RaitDocumentRead,
  RaitAdmissibilityRead,
  RaitDeadlineRead,
  RaitDraftRead,
  RaitDecisionRead,
  RaitCommunicationRead,
  RaitCaseEventRead,
} from '../api/case.client';
// Agregados de leitura do app (contrato CTG-0002b §4.3): composição de recursos gerados ou
// contagens de listas — nunca campos de payload inventados (M8). Cada campo é um recurso de
// `data/models` ou uma contagem de registros carregados (cap 500, OD-R12-031).
import type {
  RaitAgendaItem,
  RaitAttendance,
  RaitMinutes,
  RaitSession,
  RaitVote,
} from '../models';

/** Ficha 002: contagens de registros carregados (cap 500), rotuladas assim; nenhum "vencendo em
 * N dias" (motor de prazos, [RN-RAIT-005]; OD-R12-031). */
export interface ShiftSummary {
  readonly queued: number;
  readonly inInquiry: number;
  readonly resumable: number;
  readonly openAlerts: number;
}

export interface SigningBundle {
  readonly case: RaitCaseRead;
  readonly drafts: readonly RaitDraftRead[];
  readonly documents: readonly RaitDocumentRead[];
  readonly admissibility: readonly RaitAdmissibilityRead[];
  readonly deadlines: readonly RaitDeadlineRead[];
  readonly decision: RaitDecisionRead | null;
}

export interface SessionBundle {
  readonly session: RaitSession;
  readonly items: readonly RaitAgendaItem[];
  readonly attendance: readonly RaitAttendance[];
  readonly votes: readonly RaitVote[];
  readonly bench: RaitBenchRead | null;
  readonly minutes: RaitMinutes | null;
  readonly cases: ReadonlyMap<string, RaitCaseRead>;
}

export interface BatchBundle {
  readonly batch: RaitBatchRead;
  readonly items: readonly RaitBatchItemRead[];
  readonly impediments: readonly RaitImpedimentRead[];
  readonly cases: ReadonlyMap<string, RaitCaseRead>;
}

export interface RadarCaseBundle {
  readonly case: RaitCaseRead;
  readonly clocks: readonly RaitClockRead[];
  readonly alerts: readonly RaitClockAlertRead[];
  readonly assignments: readonly RaitAssignmentRead[];
  readonly events: readonly RaitCaseEventRead[];
}

export interface SealedDossier {
  readonly case: RaitCaseRead;
  readonly documents: readonly RaitDocumentRead[];
  readonly decisions: readonly RaitDecisionRead[];
  readonly communications: readonly RaitCommunicationRead[];
  readonly events: readonly RaitCaseEventRead[];
}
