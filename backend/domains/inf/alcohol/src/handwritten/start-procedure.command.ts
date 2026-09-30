// CTG-0004 §5.1 (R-0008, TASK-0009) — `POST procedures/{id}/start`.
import {
  assertAlcoholAllowed,
  lockRow,
  inTenantTransaction,
  patchRow,
  scopeOf,
  stringOf,
  tenantMismatch,
  type AlcoholDeps,
} from './alcohol-runtime.js';

const ALLOWED = ['ABORDAGEM'] as const;
const TARGET = 'TRIAGEM';

export interface StartProcedureInput {
  user_ref?: string;
  reason?: string;
  details_json?: Record<string, unknown>;
}

export class StartProcedureCommand {
  constructor(private readonly deps: AlcoholDeps) {}

  async execute(
    procedureId: string,
    input: StartProcedureInput = {},
  ): Promise<Record<string, unknown>> {
    scopeOf(this.deps);
    return inTenantTransaction(this.deps, async (tx) => {
      const procedure = await lockRow(this.deps, tx, 'procedures', procedureId);
      if (!procedure) throw tenantMismatch({ procedureId });
      assertAlcoholAllowed(procedure, procedureId, ALLOWED, 'start');

      const updated = await patchRow(this.deps, tx, 'procedures', procedureId, {
        status: TARGET,
        notes: input.reason ?? (procedure.notes as string | null) ?? null,
      });

      return {
        id: procedureId,
        status: stringOf(updated?.status ?? TARGET),
      };
    });
  }
}
