// CTG-0004 §4.4 (R-0008, TASK-0009, RN-TEAT-126) —
// `POST administrative-measures/{id}/inventories`.
import { DetranError } from '@detran/shared';

import { INVENTORY_REQUIRED_KEYS, missingKeys } from './term-content.js';
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

const ALLOWED = [
  'REMOVIDO',
  'EM_DEPOSITO',
  'GUARDA_MONITORADA',
  'VIOLACAO_MONITORAMENTO',
  'NOTIFICADO',
] as const;

export interface RecordInventoryInput {
  vehicle_snapshot_id: string;
  inventory_json: Record<string, unknown>;
  damage_description?: string;
  signed_by_person_id?: string;
  user_ref?: string;
  reason?: string;
  details_json?: Record<string, unknown>;
}

export class RecordInventoryCommand {
  constructor(private readonly deps: MeasureDeps) {}

  async execute(
    measureId: string,
    input: RecordInventoryInput,
  ): Promise<Record<string, unknown>> {
    const scope = scopeOf(this.deps);
    const missing = missingKeys(input.inventory_json, INVENTORY_REQUIRED_KEYS);
    if (missing.length > 0)
      throw new DetranError('TEAT.MEASURE_TERM_MINIMUM_CONTENT', {
        status: 422,
        context: { missing },
        message:
          'Auto de inventário sem os elementos mínimos do §1º do art. 14.',
      });

    return inTenantTransaction(this.deps, async (tx) => {
      const measure = await lockRow(this.deps, tx, 'measures', measureId);
      if (!measure) throw tenantMismatch({ measureId });
      const currentState = assertMeasureAllowed(
        measure,
        measureId,
        ALLOWED,
        'inventory-vehicle',
      );

      const inventory = await insertRow(this.deps, tx, 'inventories', {
        measure_id: measureId,
        vehicle_snapshot_id: input.vehicle_snapshot_id,
        inventory_json: input.inventory_json,
        damage_description: input.damage_description ?? null,
        signed_by_person_id: input.signed_by_person_id ?? null,
      });
      await recordHistory(
        this.deps,
        tx,
        measureId,
        currentState,
        'Vehicle inventory recorded',
        scope.actorId,
      );

      return {
        id: stringOf(inventory.id),
        measure_id: measureId,
        vehicle_snapshot_id: input.vehicle_snapshot_id,
      };
    });
  }
}
