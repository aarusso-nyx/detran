// CTG-0004 §2, §4.2 (R-0008, TASK-0009, RN-TEAT-124) —
// `POST administrative-measures/{id}/retentions`.
import { DetranError } from '@detran/shared';

import {
  assertMeasureAllowed,
  lockRow,
  inTenantTransaction,
  insertRow,
  recordHistory,
  scopeOf,
  stringOf,
  tenantMismatch,
  type MeasureDeps,
} from './measure-runtime.js';

const ALLOWED = ['RETIDO'] as const;
const RETENTION_LIMIT_DAYS = 30;

export interface RecordRetentionInput {
  vehicle_snapshot_id: string;
  retention_reason: string;
  regularization_deadline_days?: number;
  user_ref?: string;
  reason?: string;
  details_json?: Record<string, unknown>;
}

function dateOnly(value: unknown, fallback: string): string {
  const iso = stringOf(value || fallback);
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime())
    ? fallback.slice(0, 10)
    : parsed.toISOString().slice(0, 10);
}

export class RecordRetentionCommand {
  constructor(private readonly deps: MeasureDeps) {}

  async execute(
    measureId: string,
    input: RecordRetentionInput,
  ): Promise<Record<string, unknown>> {
    const scope = scopeOf(this.deps);
    if (
      input.regularization_deadline_days !== undefined &&
      input.regularization_deadline_days > RETENTION_LIMIT_DAYS
    ) {
      throw new DetranError('TEAT.MEASURE_RETENTION_LIMIT_EXCEEDED', {
        status: 422,
        context: {
          days: input.regularization_deadline_days,
          limit: RETENTION_LIMIT_DAYS,
          legalBasis: 'CTB art. 270 §2º',
        },
        message: 'Prazo de regularização da retenção acima do limite legal.',
      });
    }

    return inTenantTransaction(this.deps, async (tx) => {
      const measure = await lockRow(this.deps, tx, 'measures', measureId);
      if (!measure) throw tenantMismatch({ measureId });
      assertMeasureAllowed(measure, measureId, ALLOWED, 'register-retention');

      let regularizationDeadlineAt: string | null = null;
      if (input.regularization_deadline_days !== undefined) {
        const startOn = dateOnly(
          measure.started_at,
          scope.occurredAt.slice(0, 10),
        );
        const due = await this.deps.deadlines.computeMeasureDue(
          'T-REG30',
          startOn,
          scope.tenantId,
        );
        regularizationDeadlineAt = due.dueOn;
      }

      const retention = await insertRow(this.deps, tx, 'retentions', {
        measure_id: measureId,
        vehicle_snapshot_id: input.vehicle_snapshot_id,
        retention_reason: input.retention_reason,
        regularization_deadline_days:
          input.regularization_deadline_days ?? null,
        regularization_deadline_at: regularizationDeadlineAt,
      });
      await recordHistory(
        this.deps,
        tx,
        measureId,
        'RETIDO',
        'Retention recorded',
        scope.actorId,
      );

      return {
        id: stringOf(retention.id),
        measure_id: measureId,
        vehicle_snapshot_id: input.vehicle_snapshot_id,
        regularization_deadline_at: regularizationDeadlineAt,
        regularization_deadline_days:
          input.regularization_deadline_days ?? null,
      };
    });
  }
}
