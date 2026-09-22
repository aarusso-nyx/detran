// Índice do ciclo de `@detran/dashboard-monitor` (BP-DASH-MONITOR-001 1.1.0
// `handwrittenExports: ["handwritten/cycle/index"]`; CTG-0002 §14.1; A13:
// reexport por nome, nunca `export *`; nenhum identificador reexportado duas
// vezes — o `src/index.ts` gerado faz `export *` dos três índices). A
// superfície (`handwritten/surface/**`, TASK-0013) consome o ciclo só por
// aqui (§14.3); o ciclo nunca importa a superfície.
export {
  ACK_TIMER_BY_SEVERITY,
  AGENCY_ADMIN_ROLE,
  ALERT_SEVERITIES,
  ALERT_STATES,
  ALERT_TRACKS,
  AUDITOR_ROLE,
  DASHBOARD_BLOCKS,
  DASHBOARD_CALENDAR,
  DASHBOARD_CLOCK,
  DASHBOARD_SWEEPER_DEPENDENCIES,
  DASHBOARD_SWEEP_DEFAULT_INTERVAL_MS,
  DASHBOARD_SWEEP_DISCOVERY,
  DASHBOARD_SWEEP_INTERVAL_MS,
  DASHBOARD_TIMER_CODES,
  DASHBOARD_TIMER_DEFINITIONS,
  DASH_OPERATOR_ROLE,
  DUTY_STATES,
  FRESHNESS_STATES,
  MILESTONE_TIMERS,
  ROOT_CAUSE_CATEGORIES,
  booleanParameterValue,
  dashboardParameterKey,
  numericParameterValue,
  readBooleanParameter,
  readNumericParameter,
} from './tokens.js';
export type {
  AlertSeverity,
  AlertState,
  AlertTrack,
  ChainStatus,
  DashboardBlock,
  DashboardLayer,
  DashboardTimerCode,
  DashboardTimerDefinition,
  DashboardTimerOwnerKind,
  DashboardTimerStatus,
  DashboardTimerUnit,
  DetectionLevel,
  DutyDeadlineKind,
  DutyState,
  FreshnessState,
  RootCauseCategory,
} from './tokens.js';

export { assertDashIfMatch } from './if-match.js';

export {
  DASHBOARD_EVENT_TYPES,
  envelopeOf,
  idempotencyKeyOf,
  publish,
  topic,
} from './events.js';
export type {
  DashboardAggregateKind,
  DashboardEnvelopeInput,
  DashboardEventActor,
  DashboardEventDataValue,
  DashboardEventEnvelope,
  DashboardEventType,
} from './events.js';

export {
  alertTransitionsFrom,
  allowedAlertTargets,
  assertAlertState,
  assertAlertTransition,
  assertDutyTransition,
  isTerminalAlertState,
  isTerminalDutyState,
  loadAlertTransitions,
  loadDutyTransitions,
} from './transitions.js';
export type {
  AlertTransitionActor,
  AlertTransitionRow,
  AlertTransitionSubject,
  DutyTransitionActor,
  DutyTransitionRow,
  DutyTransitionSubject,
} from './transitions.js';

export {
  DashboardClockService,
  addDays,
  civilDateOf,
  endOfCivilDay,
  startOfCivilDay,
  zonedInstant,
} from './clock.service.js';
export type { ArmDashboardTimer, DashboardTimer } from './clock.service.js';

export { DashboardClockSweeper } from './clock.sweeper.js';
export type {
  DashboardSweepDatabase,
  DashboardSweepDiscovery,
  DashboardSweepReport,
  DashboardSweepRequestContext,
  DashboardSweepTarget,
  DashboardSweeperDependencies,
} from './clock.sweeper.js';

export {
  DashboardAlertService,
  PRESCRIPTION_FLAG_LEVELS,
  ladderLevelOf,
  parseThreshold,
  prescriptionLevelOf,
} from './alert.service.js';
export type {
  AlertTimerView,
  AlertTrailView,
  AlertView,
  CycleContext,
  DetectResult,
  DetectionCell,
  IncidentView,
  ThresholdJson,
  ThresholdLevels,
} from './alert.service.js';

export {
  DashboardDutyService,
  hasLegalDeadline,
  previousPeriodOf,
} from './duty.service.js';
export type { DutyCycleRow, DutyCycleView, DutyRow } from './duty.service.js';

export {
  BLOCK_BY_SOURCE_KEY,
  DashboardFreshnessService,
  SOURCE_KEY_BY_PROJECTION,
  freshnessOf,
  sourceKeyFor,
} from './freshness.service.js';
export type {
  FreshnessContext,
  FreshnessInput,
  FreshnessMeta,
  FreshnessParams,
  FreshnessResult,
  SourceFreshnessState,
  UnavailableStrategy,
} from './freshness.service.js';

export {
  ALERT_COLUMNS,
  DashboardNotifier,
  alertEventData,
  appendAlertTrail,
  loadEscalationChain,
  localDateOf,
  parseNotifiedNote,
} from './notifier.js';
export type {
  AlertRow,
  ChainRecipient,
  EscalationChainRow,
  NotifierContext,
  TrailLineInput,
} from './notifier.js';

export {
  AckAlertSchema,
  ArchiveDutySchema,
  CloseAlertSchema,
  PrepareDutySchema,
  ProveDutySchema,
  RootCauseSchema,
  SHA256_HEX_PATTERN,
  SubmitDutySchema,
  TreatAlertSchema,
  parseDto,
} from './dto.js';
export type {
  AckAlertDto,
  ArchiveDutyDto,
  CloseAlertDto,
  PrepareDutyDto,
  ProveDutyDto,
  RootCauseDto,
  SubmitDutyDto,
  TreatAlertDto,
} from './dto.js';
