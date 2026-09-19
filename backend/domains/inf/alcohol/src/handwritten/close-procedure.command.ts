// CTG-0004 §5.6 (R-0008, TASK-0009, RN-TEAT-137) — `POST procedures/{id}/close`.
import { DetranError } from '@detran/shared';

import {
  assertAlcoholAllowed,
  findRow,
  findRowsWhere,
  inTenantTransaction,
  numberOf,
  patchRow,
  stringOf,
  tenantMismatch,
  type AlcoholDeps,
} from './alcohol-runtime.js';

const ALLOWED = [
  'RECUSA_REGISTRADA',
  'RESULTADO_ABAIXO_LIMITE',
  'RESULTADO_ADMINISTRATIVO',
  'RESULTADO_CRIME',
  'SINAIS_CONSTATADOS',
  'OUTRO_MEIO_PROVA',
] as const;
const CRIME_THRESHOLD = 0.34;
const TERMINAL_FOR_RESULT: Record<string, string> = {
  RESULTADO_ABAIXO_LIMITE: 'SEM_AUTUACAO_ALCOOLEMIA',
  RESULTADO_ADMINISTRATIVO: 'AIT_165_LAVRADO',
  RESULTADO_CRIME: 'ENCAMINHADO_POLICIA_JUDICIARIA',
};

export interface CloseAlcoholProcedureInput {
  outcome?: string;
  user_ref?: string;
  reason?: string;
  details_json?: Record<string, unknown>;
}

export class CloseProcedureCommand {
  constructor(private readonly deps: AlcoholDeps) {}

  async execute(
    procedureId: string,
    input: CloseAlcoholProcedureInput = {},
  ): Promise<Record<string, unknown>> {
    return inTenantTransaction(this.deps, async (tx) => {
      const procedure = await findRow(this.deps, tx, 'procedures', procedureId);
      if (!procedure) throw tenantMismatch({ procedureId });
      const currentState = assertAlcoholAllowed(
        procedure,
        procedureId,
        ALLOWED,
        'close',
      );

      let effectiveResult: string;
      let terminal: string;
      if (currentState === 'RECUSA_REGISTRADA') {
        effectiveResult = 'RECUSA_REGISTRADA';
        terminal = 'AIT_165A_LAVRADO';
      } else if (currentState === 'SINAIS_CONSTATADOS') {
        // Res. 432 art. 6º, III: o resultado é administrativo por força de
        // lei, sem depender do `outcome` informado.
        effectiveResult = 'RESULTADO_ADMINISTRATIVO';
        terminal = TERMINAL_FOR_RESULT[effectiveResult]!;
      } else if (currentState === 'OUTRO_MEIO_PROVA') {
        if (!input.outcome || !TERMINAL_FOR_RESULT[input.outcome])
          throw new DetranError('TEAT.ALCOHOL_TERM_MINIMUM_CONTENT', {
            status: 422,
            context: { missing: ['outcome'] },
            message: 'Encerramento por outro meio de prova exige o desfecho.',
          });
        effectiveResult = input.outcome;
        terminal = TERMINAL_FOR_RESULT[effectiveResult]!;
      } else {
        effectiveResult = currentState;
        terminal = TERMINAL_FOR_RESULT[currentState]!;
      }

      if (effectiveResult === 'RESULTADO_CRIME') {
        const forwardings = await findRowsWhere(
          this.deps,
          tx,
          'forwardings',
          'procedure_id',
          procedureId,
        );
        if (forwardings.length === 0) {
          const tests = await findRowsWhere(
            this.deps,
            tx,
            'tests',
            'procedure_id',
            procedureId,
          );
          const consideredMgL =
            numberOf(tests[tests.length - 1]?.considered_mg_l) ?? 0;
          throw new DetranError('TEAT.ALCOHOL_FORWARDING_REQUIRED_FOR_CRIME', {
            status: 422,
            context: { procedureId, consideredMgL, threshold: CRIME_THRESHOLD },
            message: 'Resultado de crime exige encaminhamento registrado.',
          });
        }
      }

      const updated = await patchRow(this.deps, tx, 'procedures', procedureId, {
        status: terminal,
        outcome: terminal,
      });

      return {
        id: procedureId,
        status: stringOf(updated?.status ?? terminal),
        outcome: stringOf(updated?.outcome ?? terminal),
      };
    });
  }
}
