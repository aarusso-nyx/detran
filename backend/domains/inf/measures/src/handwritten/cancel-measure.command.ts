// CTG-0004 §4.7, §14 item 2 (R-0008, TASK-0009, OD-T37) —
// `POST administrative-measures/{id}/cancel`.
//
// [WF-TEAT-004] não tem estado de cancelamento: a rota existe (route
// contract §6) e responde sempre 409 `TEAT.MEASURE_STATE_INVALID` com
// `allowed: []` — nenhum estado admite `cancel`. `source_pending` (OD-T37).
import {
  lockRow,
  inTenantTransaction,
  measureStateInvalid,
  stringOf,
  tenantMismatch,
  type MeasureDeps,
} from './measure-runtime.js';

export interface CancelMeasureInput {
  reason: string;
  user_ref?: string;
  details_json?: Record<string, unknown>;
}

export class CancelMeasureCommand {
  constructor(private readonly deps: MeasureDeps) {}

  async execute(measureId: string, _input: CancelMeasureInput): Promise<never> {
    return inTenantTransaction(this.deps, async (tx) => {
      const measure = await lockRow(this.deps, tx, 'measures', measureId);
      if (!measure) throw tenantMismatch({ measureId });
      const currentState = stringOf(measure.current_status);
      throw measureStateInvalid(measureId, currentState, [], 'cancel');
    });
  }
}
