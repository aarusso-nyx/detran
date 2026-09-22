// API pública manuscrita de @detran/inf-infraction
// (work/rounds/R-0006/contracts/CTG-0001.md §6.1), reexportada pelo `src/index.ts`
// gerado via `module.handwrittenExports` do BP-INF-INFRACTION-001 (ADR-0007:
// código gerado não se edita). Nesta rodada só há código puro — nenhuma rota,
// nenhum job, nenhum acesso a banco (rotas e varredura são de R-0007).
export { RaitError } from './errors.js';
export type { RaitErrorOptions } from './errors.js';
export { INFRACTION_EVENT_SCHEMAS } from './events.js';
export type { InfractionEventSchemas } from './events.js';
export {
  assertTransition,
  resolveTransition,
} from './guards/infraction.guard.js';
export type {
  InfractionStateSnapshot,
  InfractionTrigger,
} from './guards/infraction.guard.js';
export {
  INFRACTION_CLOSED_TRIGGERS,
  INFRACTION_TERMINAL_STATES,
  INFRACTION_TRANSITION_QUALIFIERS,
  INFRACTION_TRANSITIONS,
} from './guards/infraction.transitions.js';
export type {
  InfractionTransition,
  InfractionTriggerKind,
} from './guards/infraction.transitions.js';
export {
  INFRACTION_COMMANDS,
  InfractionCommandService,
  triggerForCommand,
} from './infraction-command.service.js';
export type {
  InfractionCommand,
  InfractionCommandInput,
  InfractionCommandResult,
} from './infraction-command.service.js';
export { InfractionCommandsController } from './infraction-commands.controller.js';
export { InfractionEventConsumer } from './infraction-event.consumer.js';
export type { InfractionInboundEvent } from './infraction-event.consumer.js';
export { InfractionDeadlineSweep } from './infraction-deadline.sweep.js';
