// Agregados de leitura do app (contrato CTG-0002b §4.3): composição de recursos gerados ou
// contagens de listas — nunca campos de payload inventados (M8). Cada campo é um recurso de
// `data/models` ou uma contagem de registros carregados (cap 500, OD-R12-031).
import type {
  RaitAdmissibility,
  RaitAgendaItem,
  RaitAssignment,
  RaitAttendance,
  RaitBatch,
  RaitBatchItem,
  RaitBench,
  RaitCase,
  RaitCaseEvent,
  RaitClock,
  RaitClockAlert,
  RaitCommunication,
  RaitDeadline,
  RaitDecision,
  RaitDocument,
  RaitDraft,
  RaitImpediment,
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
  readonly case: RaitCase;
  readonly drafts: readonly RaitDraft[];
  readonly documents: readonly RaitDocument[];
  readonly admissibility: readonly RaitAdmissibility[];
  readonly deadlines: readonly RaitDeadline[];
  readonly decision: RaitDecision | null;
}

export interface SessionBundle {
  readonly session: RaitSession;
  readonly items: readonly RaitAgendaItem[];
  readonly attendance: readonly RaitAttendance[];
  readonly votes: readonly RaitVote[];
  readonly bench: RaitBench | null;
  readonly minutes: RaitMinutes | null;
  readonly cases: ReadonlyMap<string, RaitCase>;
}

export interface BatchBundle {
  readonly batch: RaitBatch;
  readonly items: readonly RaitBatchItem[];
  readonly impediments: readonly RaitImpediment[];
  readonly cases: ReadonlyMap<string, RaitCase>;
}

export interface RadarCaseBundle {
  readonly case: RaitCase;
  readonly clocks: readonly RaitClock[];
  readonly alerts: readonly RaitClockAlert[];
  readonly assignments: readonly RaitAssignment[];
  readonly events: readonly RaitCaseEvent[];
}

export interface SealedDossier {
  readonly case: RaitCase;
  readonly documents: readonly RaitDocument[];
  readonly decisions: readonly RaitDecision[];
  readonly communications: readonly RaitCommunication[];
  readonly events: readonly RaitCaseEvent[];
}
