// CTG-0004 §5.5, §14 item 8 (R-0008, TASK-0009) —
// `POST procedures/{id}/forwardings`. `forwarding_type` é vocabulário de
// modelagem desta rodada (a coluna não tem check), não token canônico.
import { DetranError } from '@detran/shared';

import {
  assertAlcoholAllowed,
  findRow,
  inTenantTransaction,
  insertRow,
  patchRow,
  scopeOf,
  stringOf,
  tenantMismatch,
  type AlcoholDeps,
} from './alcohol-runtime.js';

const ALLOWED = [
  'IMPOSSIBILIDADE_TECNICA',
  'RESULTADO_CRIME',
  'RESULTADO_ADMINISTRATIVO',
  'SINAIS_CONSTATADOS',
] as const;
const FORWARDING_TYPES = [
  'exame_sangue',
  'exame_clinico',
  'exame_laboratorial',
  'policia_judiciaria',
] as const;
const EXAM_TYPES = new Set<string>([
  'exame_sangue',
  'exame_clinico',
  'exame_laboratorial',
]);

export interface RecordAlcoholForwardingInput {
  forwarding_type: string;
  destination: string;
  forwarded_at?: string;
  protocol?: string;
  notes?: string;
  user_ref?: string;
  reason?: string;
  details_json?: Record<string, unknown>;
}

export class ForwardProcedureCommand {
  constructor(private readonly deps: AlcoholDeps) {}

  async execute(
    procedureId: string,
    input: RecordAlcoholForwardingInput,
  ): Promise<Record<string, unknown>> {
    const scope = scopeOf(this.deps);
    if (
      !(FORWARDING_TYPES as readonly string[]).includes(input.forwarding_type)
    )
      throw new DetranError('TEAT.ENUM_INVALID', {
        status: 422,
        context: {
          field: 'forwarding_type',
          allowed: [...FORWARDING_TYPES],
        },
        message: 'Tipo de encaminhamento fora do vocabulário desta rodada.',
      });

    return inTenantTransaction(this.deps, async (tx) => {
      const procedure = await findRow(this.deps, tx, 'procedures', procedureId);
      if (!procedure) throw tenantMismatch({ procedureId });
      const currentState = assertAlcoholAllowed(
        procedure,
        procedureId,
        ALLOWED,
        'forward',
      );

      const forwardedAt = input.forwarded_at ?? scope.occurredAt;
      const forwarding = await insertRow(this.deps, tx, 'forwardings', {
        procedure_id: procedureId,
        forwarding_type: input.forwarding_type,
        destination: input.destination,
        forwarded_at: forwardedAt,
        protocol: input.protocol ?? null,
        notes: input.notes ?? null,
      });

      const target =
        currentState === 'IMPOSSIBILIDADE_TECNICA' &&
        EXAM_TYPES.has(input.forwarding_type)
          ? 'OUTRO_MEIO_PROVA'
          : currentState;
      if (target !== currentState)
        await patchRow(this.deps, tx, 'procedures', procedureId, {
          status: target,
        });

      return {
        id: stringOf(forwarding.id),
        procedure_id: procedureId,
        forwarding_type: input.forwarding_type,
        destination: input.destination,
        procedure_status: target,
      };
    });
  }
}
