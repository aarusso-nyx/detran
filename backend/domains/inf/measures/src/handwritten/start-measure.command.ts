// CTG-0004 §4.1 (R-0008, TASK-0009) — `POST administrative-measures/{id}/start`.
//
// M14: a medida nasce pelo CRUD/sync já em `RETIDO`; `start` só marca o
// início de campo (`started_at`) sem transitar de estado.
import { DetranError } from '@detran/shared';

import { measureStartedEvent } from './events.js';
import {
  appendEvent,
  assertMeasureAllowed,
  findRow,
  inTenantTransaction,
  patchRow,
  recordHistory,
  scopeOf,
  stringOf,
  tenantMismatch,
  type MeasureDeps,
} from './measure-runtime.js';

const ALLOWED = ['RETIDO'] as const;

export interface StartMeasureInput {
  user_ref?: string;
  reason?: string;
  details_json?: Record<string, unknown>;
}

export interface StartMeasureResult {
  id: string;
  current_status: string;
  started_at: string;
}

export class StartMeasureCommand {
  constructor(private readonly deps: MeasureDeps) {}

  async execute(
    measureId: string,
    _input: StartMeasureInput = {},
  ): Promise<StartMeasureResult> {
    const scope = scopeOf(this.deps);
    return inTenantTransaction(this.deps, async (tx) => {
      const measure = await findRow(this.deps, tx, 'measures', measureId);
      if (!measure) throw tenantMismatch({ measureId });
      const currentState = assertMeasureAllowed(
        measure,
        measureId,
        ALLOWED,
        'start',
      );

      const measureTypeId = stringOf(measure.measure_type_id);
      const measureType = await findRow(
        this.deps,
        tx,
        'measureTypes',
        measureTypeId,
      );
      if (!measureType || measureType.status !== 'active')
        throw new DetranError('TEAT.MEASURE_TYPE_NOT_IN_CATALOG', {
          status: 422,
          context: { measureTypeId },
          message: 'Tipo de medida fora do catálogo ativo.',
        });

      const startedAt = scope.occurredAt;
      const updated = await patchRow(this.deps, tx, 'measures', measureId, {
        started_at: startedAt,
      });
      await recordHistory(
        this.deps,
        tx,
        measureId,
        currentState,
        'Administrative measure started',
        scope.actorId,
      );
      await appendEvent(
        this.deps,
        tx,
        measureStartedEvent(scope, {
          measureId,
          measureTypeId,
          aitId: (measure.ait_id as string | null | undefined) ?? null,
          agentId: (measure.agent_id as string | null | undefined) ?? null,
          currentStatus: currentState,
          startedAt,
        }),
      );

      return {
        id: measureId,
        current_status: currentState,
        started_at: stringOf(updated?.started_at ?? startedAt),
      };
    });
  }
}
