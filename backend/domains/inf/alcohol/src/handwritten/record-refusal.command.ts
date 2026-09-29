// CTG-0004 §5.3 (R-0008, TASK-0009, RN-TEAT-134) —
// `POST procedures/{id}/refusals`.
import { DetranError } from '@detran/shared';

import { alcoholRefusalRegisteredEvent } from './events.js';
import {
  appendEvent,
  assertAlcoholAllowed,
  lockRow,
  inTenantTransaction,
  insertRow,
  patchRow,
  scopeOf,
  stringOf,
  tenantMismatch,
  type AlcoholDeps,
} from './alcohol-runtime.js';

const ALLOWED = ['TRIAGEM', 'ETILOMETRO_OFERECIDO'] as const;
const TARGET_BY_KIND: Record<string, string> = {
  refusal: 'RECUSA_REGISTRADA',
  technical_impossibility: 'IMPOSSIBILIDADE_TECNICA',
};

export interface RecordAlcoholRefusalInput {
  refused_at?: string;
  refusal_description: string;
  witness_person_id?: string;
  evidence_id?: string;
  kind?: 'refusal' | 'technical_impossibility';
  user_ref?: string;
  reason?: string;
  details_json?: Record<string, unknown>;
}

export class RecordRefusalCommand {
  constructor(private readonly deps: AlcoholDeps) {}

  async execute(
    procedureId: string,
    input: RecordAlcoholRefusalInput,
  ): Promise<Record<string, unknown>> {
    const scope = scopeOf(this.deps);
    const kind = input.kind;
    if (!kind || !TARGET_BY_KIND[kind])
      throw new DetranError('TEAT.ALCOHOL_REFUSAL_KIND_REQUIRED', {
        status: 400,
        context: {},
        message: 'Recusa exige o tipo (recusa ou impossibilidade técnica).',
      });

    return inTenantTransaction(this.deps, async (tx) => {
      const procedure = await lockRow(this.deps, tx, 'procedures', procedureId);
      if (!procedure) throw tenantMismatch({ procedureId });
      assertAlcoholAllowed(procedure, procedureId, ALLOWED, 'record-refusal');

      const refusedAt = input.refused_at ?? scope.occurredAt;
      const target = TARGET_BY_KIND[kind];
      const refusal = await insertRow(this.deps, tx, 'refusals', {
        procedure_id: procedureId,
        refused_at: refusedAt,
        kind,
        refusal_description: input.refusal_description,
        witness_person_id: input.witness_person_id ?? null,
        evidence_id: input.evidence_id ?? null,
      });
      await patchRow(this.deps, tx, 'procedures', procedureId, {
        status: target,
        outcome: kind,
      });
      await appendEvent(
        this.deps,
        tx,
        alcoholRefusalRegisteredEvent(scope, {
          procedureId,
          refusalId: stringOf(refusal.id),
          kind,
          refusedAt,
          toState: target,
        }),
      );

      return {
        id: stringOf(refusal.id),
        procedure_id: procedureId,
        kind,
        procedure_status: target,
      };
    });
  }
}
