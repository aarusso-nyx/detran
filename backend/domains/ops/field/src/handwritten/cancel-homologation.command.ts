// CTG-0002 §5.8 — `POST /v1/ops/field/homologations/{id}/cancel-by-audit`.
// `cancelled` é vocabulário de modelagem (a coluna não tem check, §11.2), não
// token de workflow.
import { DetranError } from '@detran/shared';

import {
  inTransaction,
  tenantMismatch,
  tenantScope,
  validationFailed,
  type FieldDeps,
} from './field-runtime.js';

export interface CancelHomologationInput {
  reason?: string;
  audit_reference?: string;
}

export class CancelHomologationCommand {
  constructor(private readonly deps: FieldDeps) {}

  async execute(
    id: string,
    input: CancelHomologationInput,
  ): Promise<Record<string, unknown>> {
    const { tenantId } = tenantScope(this.deps);
    if (!input.reason || String(input.reason).trim() === '')
      throw validationFailed([{ path: 'reason', rule: 'required' }]);
    return inTransaction(this.deps, async (scope) => {
      const found = await scope.query<{ id: string; status: string }>(
        `select id, status from ops.ops_homologation
          where tenant_id = $1 and id = $2 for update`,
        [tenantId, id],
      );
      const homologation = found.rows[0];
      if (!homologation) throw tenantMismatch();
      if (String(homologation.status) !== 'active')
        throw new DetranError('TEAT.HOMOLOGATION_STATE_INVALID', {
          status: 409,
          context: {
            homologationId: id,
            currentState: homologation.status,
          },
          message: 'Homologação fora do estado que admite cancelamento.',
        });
      const updated = await scope.query<Record<string, unknown>>(
        `update ops.ops_homologation
            set status = 'cancelled', cancelled_reason = $2, updated_at = now()
          where id = $1
        returning id, status, cancelled_reason`,
        [id, String(input.reason)],
      );
      const row = updated.rows[0]!;
      return {
        id: String(row.id),
        status: String(row.status),
        cancelled_reason: row.cancelled_reason ?? null,
        audit_reference: input.audit_reference ?? null,
      };
    });
  }
}
