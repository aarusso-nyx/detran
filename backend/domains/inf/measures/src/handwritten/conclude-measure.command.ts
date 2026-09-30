// CTG-0004 §4.7 (R-0008, TASK-0009) — `POST administrative-measures/{id}/conclude`.
import { measureConcludedEvent } from './events.js';
import {
  appendEvent,
  assertMeasureAllowed,
  lockRow,
  inTenantTransaction,
  patchRow,
  recordHistory,
  scopeOf,
  stringOf,
  tenantMismatch,
  type MeasureDeps,
} from './measure-runtime.js';

const ALLOWED = ['LIBERADO_COM_PRAZO'] as const;
const TARGET = 'REGULARIZADO';

export interface ConcludeMeasureInput {
  ended_at?: string;
  user_ref?: string;
  reason?: string;
  details_json?: Record<string, unknown>;
}

export class ConcludeMeasureCommand {
  constructor(private readonly deps: MeasureDeps) {}

  async execute(
    measureId: string,
    input: ConcludeMeasureInput = {},
  ): Promise<Record<string, unknown>> {
    const scope = scopeOf(this.deps);
    return inTenantTransaction(this.deps, async (tx) => {
      const measure = await lockRow(this.deps, tx, 'measures', measureId);
      if (!measure) throw tenantMismatch({ measureId });
      const currentState = assertMeasureAllowed(
        measure,
        measureId,
        ALLOWED,
        'conclude',
      );

      const endedAt = input.ended_at ?? scope.occurredAt;
      const updated = await patchRow(this.deps, tx, 'measures', measureId, {
        current_status: TARGET,
        ended_at: endedAt,
      });
      await recordHistory(
        this.deps,
        tx,
        measureId,
        TARGET,
        'Administrative measure concluded',
        scope.actorId,
      );
      await appendEvent(
        this.deps,
        tx,
        measureConcludedEvent(scope, {
          measureId,
          fromState: currentState,
          toState: TARGET,
          endedAt,
        }),
      );

      return {
        id: measureId,
        current_status: TARGET,
        ended_at: stringOf(updated?.ended_at ?? endedAt),
      };
    });
  }
}
