// @detran/inf-deadlines — motor de prazos como biblioteca (ADR-0016 §2,
// docs/framework/arch/rait-deadline-engine.md). API pública fixada em
// work/rounds/R-0006/contracts/CTG-0001.md §5. Sem rotas, sem job e sem acesso a
// banco: quem consome injeta `Clock`, `Calendar`, `TimerCatalog` e `TimerStore`.
export { InMemoryCalendar } from './calendar.js';
export { FixedClock } from './clock.js';
export { createDeadlineEngine } from './engine.js';
export type { DeadlineEngineDeps } from './engine.js';
export { DeadlineError } from './errors.js';
export type { DeadlineErrorOptions } from './errors.js';
export { InMemoryDeadlineEvents } from './events.js';
export {
  addCalendarDays,
  addCalendarMonths,
  addCalendarYears,
  isWeekend,
  weekdayOf,
} from './local-date.js';
export {
  INFRACTION_TIMER_DEFINITIONS,
  StaticTimerCatalog,
} from './timer-catalog.js';
export { InMemoryTimerStore } from './timer-store.js';
export type {
  ArmInput,
  Calendar,
  CalendarJson,
  Clock,
  Deadline,
  DeadlineEngine,
  DeadlineEvent,
  DeadlineEvents,
  ExpiryEffect,
  ExpiryKind,
  LocalDate,
  SuspensionAct,
  SweepReport,
  TimelinessInput,
  TimelinessResult,
  TimerCatalog,
  TimerCode,
  TimerDefinition,
  TimerDurationUnit,
  TimerExpiredData,
  TimerOwnerKind,
  TimerRescheduledData,
  TimerStatus,
  TimerStore,
} from './types.js';
