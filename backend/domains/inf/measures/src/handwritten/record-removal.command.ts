// CTG-0004 §2, §4.3 (R-0008, TASK-0009, RN-TEAT-125, DT-015) —
// `POST administrative-measures/{id}/removals`.
import { DetranError } from '@detran/shared';

import {
  assertMeasureAllowed,
  findRow,
  lockRow,
  inTenantTransaction,
  insertRow,
  patchRow,
  recordHistory,
  scopeOf,
  stringOf,
  tenantMismatch,
  type MeasureDeps,
} from './measure-runtime.js';

const ALLOWED = ['RETIDO', 'LIBERADO_COM_PRAZO', 'CONVERTIDO_REMOCAO'] as const;
const REMOVAL_LIMIT_DAYS = 15;
const MONITORED_CUSTODY_FLAG = 'teat.monitored_custody';
const MONITORED_CUSTODY_DESTINATIONS = new Set([
  'guarda_monitorada',
  'GUARDA_MONITORADA',
]);

export interface RecordRemovalInput {
  vehicle_snapshot_id: string;
  tow_provider_id?: string;
  yard_id?: string;
  requested_at?: string;
  destination_description?: string;
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

export class RecordRemovalCommand {
  constructor(private readonly deps: MeasureDeps) {}

  async execute(
    measureId: string,
    input: RecordRemovalInput,
  ): Promise<Record<string, unknown>> {
    const scope = scopeOf(this.deps);

    if (
      input.regularization_deadline_days !== undefined &&
      input.regularization_deadline_days > REMOVAL_LIMIT_DAYS
    ) {
      throw new DetranError('TEAT.MEASURE_RETENTION_LIMIT_EXCEEDED', {
        status: 422,
        context: {
          days: input.regularization_deadline_days,
          limit: REMOVAL_LIMIT_DAYS,
          legalBasis: 'CTB art. 271 §9º-A',
        },
        message: 'Prazo de regularização da remoção acima do limite legal.',
      });
    }

    return inTenantTransaction(this.deps, async (tx) => {
      let measure = await lockRow(this.deps, tx, 'measures', measureId);
      if (!measure) throw tenantMismatch({ measureId });
      let currentState = assertMeasureAllowed(
        measure,
        measureId,
        ALLOWED,
        'register-removal',
      );

      if (input.tow_provider_id) {
        const towProvider = await findRow(
          this.deps,
          tx,
          'towProviders',
          input.tow_provider_id,
        );
        if (!towProvider || towProvider.status !== 'active')
          throw new DetranError('TEAT.MEASURE_TOW_PROVIDER_INACTIVE', {
            status: 422,
            context: { towProviderId: input.tow_provider_id },
            message: 'Prestador de guincho fora de operação.',
          });
      }
      if (input.yard_id) {
        const yard = await findRow(this.deps, tx, 'yards', input.yard_id);
        if (!yard || yard.status !== 'active')
          throw new DetranError('TEAT.MEASURE_YARD_INACTIVE', {
            status: 422,
            context: { yardId: input.yard_id },
            message: 'Pátio fora de operação.',
          });
      }

      const isMonitoredCustody = MONITORED_CUSTODY_DESTINATIONS.has(
        input.destination_description ?? '',
      );
      if (
        isMonitoredCustody &&
        !this.deps.featureFlags.isEnabled(MONITORED_CUSTODY_FLAG)
      ) {
        throw new DetranError('TEAT.MEASURE_MONITORED_CUSTODY_DISABLED', {
          status: 422,
          context: { destination: input.destination_description },
          message: 'Guarda monitorada desligada por parâmetro (DT-015).',
        });
      }

      if (currentState !== 'CONVERTIDO_REMOCAO') {
        await recordHistory(
          this.deps,
          tx,
          measureId,
          'CONVERTIDO_REMOCAO',
          'Retention converted to removal',
          scope.actorId,
        );
        measure =
          (await patchRow(this.deps, tx, 'measures', measureId, {
            current_status: 'CONVERTIDO_REMOCAO',
          })) ?? measure;
        currentState = 'CONVERTIDO_REMOCAO';
      }

      const requestedAt = input.requested_at ?? scope.occurredAt;
      const startOn = dateOnly(requestedAt, scope.occurredAt.slice(0, 10));
      const due = await this.deps.deadlines.computeMeasureDue(
        'T-REG15',
        startOn,
        scope.tenantId,
      );
      const regularizationDeadlineAt =
        input.regularization_deadline_days !== undefined ? due.dueOn : null;

      const removal = await insertRow(this.deps, tx, 'removals', {
        measure_id: measureId,
        vehicle_snapshot_id: input.vehicle_snapshot_id,
        tow_provider_id: input.tow_provider_id ?? null,
        yard_id: input.yard_id ?? null,
        requested_at: requestedAt,
        destination_description: input.destination_description ?? null,
        regularization_deadline_days:
          input.regularization_deadline_days ?? null,
        regularization_deadline_at: regularizationDeadlineAt,
      });

      const target =
        isMonitoredCustody &&
        this.deps.featureFlags.isEnabled(MONITORED_CUSTODY_FLAG)
          ? 'GUARDA_MONITORADA'
          : 'REMOVIDO';
      await recordHistory(
        this.deps,
        tx,
        measureId,
        target,
        'Removal recorded',
        scope.actorId,
      );
      await patchRow(this.deps, tx, 'measures', measureId, {
        current_status: target,
      });

      return {
        id: stringOf(removal.id),
        measure_id: measureId,
        current_status: target,
        regularization_deadline_at: regularizationDeadlineAt,
      };
    });
  }
}
