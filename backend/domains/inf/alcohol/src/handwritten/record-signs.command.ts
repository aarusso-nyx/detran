// CTG-0004 §5.4 (R-0008, TASK-0009, RN-TEAT-132) —
// `POST procedures/{id}/psychomotor-signs`.
import { DetranError } from '@detran/shared';

import {
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

const ALLOWED = [
  'TRIAGEM',
  'ETILOMETRO_OFERECIDO',
  'IMPOSSIBILIDADE_TECNICA',
  'OUTRO_MEIO_PROVA',
] as const;
/** Pré-estados a partir dos quais o conjunto de sinais fecha a triagem
 * (CTG-0004 §5.4); nos demais os sinais só complementam outro meio de prova. */
const TRIAGE_STATES = new Set(['TRIAGEM', 'ETILOMETRO_OFERECIDO']);
const REQUIRED_OBSERVED = 2;

export interface PsychomotorSignInput {
  sign_code: string;
  description: string;
  observed?: boolean;
  sign_group?: string;
  sign_status?: string;
  method?: string;
}

export interface RecordPsychomotorSignsInput {
  signs: PsychomotorSignInput[];
  user_ref?: string;
  reason?: string;
  details_json?: Record<string, unknown>;
}

export class RecordSignsCommand {
  constructor(private readonly deps: AlcoholDeps) {}

  async execute(
    procedureId: string,
    input: RecordPsychomotorSignsInput,
  ): Promise<Record<string, unknown>> {
    scopeOf(this.deps);
    const signs = input.signs ?? [];
    const observedCount = signs.filter(
      (sign) => sign.observed !== false,
    ).length;
    if (observedCount < REQUIRED_OBSERVED)
      throw new DetranError('TEAT.ALCOHOL_SIGNS_SET_REQUIRED', {
        status: 422,
        context: {
          observed: observedCount,
          required: REQUIRED_OBSERVED,
          legalBasis: 'Res. 432 art. 5º §1º',
        },
        message: 'Sinais psicomotores exigem conjunto, nunca sinal isolado.',
      });

    return inTenantTransaction(this.deps, async (tx) => {
      const procedure = await lockRow(this.deps, tx, 'procedures', procedureId);
      if (!procedure) throw tenantMismatch({ procedureId });
      const currentState = assertAlcoholAllowed(
        procedure,
        procedureId,
        ALLOWED,
        'record-psychomotor-signs',
      );

      const created: Array<{
        id: string;
        sign_code: string;
        observed: boolean;
      }> = [];
      for (const sign of signs) {
        const observed = sign.observed ?? true;
        const row = await insertRow(this.deps, tx, 'signs', {
          procedure_id: procedureId,
          sign_code: sign.sign_code,
          description: sign.description,
          observed,
          sign_group: sign.sign_group ?? null,
          sign_status: sign.sign_status ?? null,
          method: sign.method ?? null,
        });
        created.push({
          id: stringOf(row.id),
          sign_code: sign.sign_code,
          observed,
        });
      }

      const target = TRIAGE_STATES.has(currentState)
        ? 'SINAIS_CONSTATADOS'
        : currentState;
      if (target !== currentState)
        await patchRow(this.deps, tx, 'procedures', procedureId, {
          status: target,
        });

      return {
        procedure_id: procedureId,
        procedure_status: target,
        signs: created,
      };
    });
  }
}
