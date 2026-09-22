// API pública manuscrita de @detran/portal-projections (work/rounds/R-0009/
// contracts/CTG-0002.md §14; plan R-0009 M24; ADR-0020), reexportada pelo
// `src/index.ts` gerado via `module.handwrittenExports` de
// BP-PORTAL-PROJECTIONS-001 (ADR-0007): controladores, os cinco projetores e o
// replay, o cache das leituras nacionais e os tokens de composição do app.
export * from './aits.controller.js';
export {
  CRASH_AGGREGATE_KIND,
  touchSkeletonRow,
  CrashViewProjector,
} from './crash-view.projection.js';
export * from './crashes.controller.js';
export * from './documents.controller.js';
export {
  EXAM_AGGREGATE_KIND,
  ExamViewProjector,
} from './exam-view.projection.js';
export * from './exams.controller.js';
export {
  INFRACTION_SITUATIONS,
  INFRACTION_SITUATION_MAP,
  POINTS_STATUS_BY_SITUATION,
  INFRACTION_ACTIONS,
  ACTION_PHASE_MATRIX,
  ACTION_SERVICE_KEY,
  PAYMENT_METHOD_PARAMETERS,
  INFRACTION_VIEW_SOURCE,
  SqlInfractionViewSource,
  ACTION_REASONS,
  InfractionViewProjector,
} from './infraction-view.projection.js';
export type {
  Situation,
  PointsStatus,
  InfractionAction,
  InfractionActionEntry,
  InfractionNoticeEntry,
  AitIdentity,
  InfractionDeadline,
  InfractionViewSource,
} from './infraction-view.projection.js';
export * from './national-reads.service.js';
export {
  twelveMonthWindowStart,
  PointsViewProjector,
} from './points-view.projection.js';
export type {
  PointsMonthEntry,
  PointsVehicleEntry,
} from './points-view.projection.js';
export {
  RAIT_INQUIRY_CHANGED_TYPE,
  PROCESS_TIMELINE_DOMAIN_EVENTS,
  ProcessTimelineProjector,
} from './process-timeline.projection.js';
export type {
  TimelineEntry,
  TimelineDeadline,
  TimelineDecision,
} from './process-timeline.projection.js';
export * from './projection-contract.js';
export * from './projectors.service.js';
