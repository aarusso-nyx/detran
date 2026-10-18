// CTG-0004 §4.6 (R-0008, TASK-0009) e §16.1 (adenda, iteração 3) — `POST
// measures/retentions/{id}/release`.
//
// Dois ramos, ambos gravando `inf.measure_status_history` e publicando
// `measure.changed` na mesma transação (achado #1 da delivery-review ciclo
// 1: iterações 1/2 não gravavam nem histórico nem evento nesta rota):
//   RETIDO             → LIBERADO_LOCAL : sempre — a leitura antiga do §4.6
//                         (retenção com `regularization_deadline_at` →
//                         LIBERADO_COM_PRAZO) foi substituída por §16.1;
//                         esse estado só é alcançado por `apply-term`.
//   LIBERADO_COM_PRAZO → REGULARIZADO : `regularized_at` informado nesta
//                         chamada ou já gravado na retenção — a retenção já
//                         tem `released_at` desde a primeira liberação, por
//                         isso o guard de "já liberada" só vale no ramo
//                         RETIDO, não neste.
import { DetranError } from '@detran/shared';

import { measureConcludedEvent, measureReleasedEvent } from './events.js';
import {
  appendEvent,
  findRow,
  lockRow,
  inTenantTransaction,
  measureStateInvalid,
  patchRow,
  recordHistory,
  scopeOf,
  stringOf,
  tenantMismatch,
  type MeasureDeps,
} from './measure-runtime.js';

/** `pg` devolve `timestamptz` como `Date`, não string — `stringOf` (genérico
 * a todo o runtime) faria `String(date)` (formato local, não ISO) e o SQL de
 * volta rejeitaria a coluna. Só este comando lê de volta uma coluna de data
 * já gravada (`retention.regularized_at`) para reusá-la numa escrita. */
function isoStringOf(value: unknown): string {
  return value instanceof Date ? value.toISOString() : stringOf(value);
}

const ALLOWED = ['RETIDO', 'LIBERADO_COM_PRAZO'] as const;

export interface ReleaseRetentionInput {
  released_at?: string;
  regularized_at?: string;
  user_ref?: string;
  reason?: string;
  details_json?: Record<string, unknown>;
}

export class ReleaseRetentionCommand {
  constructor(private readonly deps: MeasureDeps) {}

  async execute(
    retentionId: string,
    input: ReleaseRetentionInput = {},
  ): Promise<Record<string, unknown>> {
    const scope = scopeOf(this.deps);
    return inTenantTransaction(this.deps, async (tx) => {
      const retention = await findRow(this.deps, tx, 'retentions', retentionId);
      if (!retention) throw tenantMismatch({ retentionId });
      const measureId = stringOf(retention.measure_id);
      const measure = await lockRow(this.deps, tx, 'measures', measureId);
      if (!measure) throw tenantMismatch({ measureId });

      const currentState = stringOf(measure.current_status);
      if (!ALLOWED.includes(currentState as (typeof ALLOWED)[number]))
        throw measureStateInvalid(measureId, currentState, ALLOWED, 'release');

      if (currentState === 'LIBERADO_COM_PRAZO') {
        const regularizedAt =
          input.regularized_at ||
          (retention.regularized_at
            ? isoStringOf(retention.regularized_at)
            : '');
        if (!regularizedAt)
          throw new DetranError('TEAT.MEASURE_STATE_INVALID', {
            status: 409,
            context: {
              measureId,
              currentState,
              allowed: [...ALLOWED],
              command: 'release',
            },
            message:
              'Regularização exige regularized_at informado ou já gravado na retenção.',
          });

        const updatedRetention = input.regularized_at
          ? await patchRow(this.deps, tx, 'retentions', retentionId, {
              regularized_at: regularizedAt,
            })
          : retention;
        await patchRow(this.deps, tx, 'measures', measureId, {
          current_status: 'REGULARIZADO',
          ended_at: regularizedAt,
        });
        await recordHistory(
          this.deps,
          tx,
          measureId,
          'REGULARIZADO',
          'Retenção regularizada',
          scope.actorId,
        );
        await appendEvent(
          this.deps,
          tx,
          measureConcludedEvent(scope, {
            measureId,
            fromState: currentState,
            toState: 'REGULARIZADO',
            endedAt: regularizedAt,
          }),
        );

        return {
          id: retentionId,
          measure_id: measureId,
          released_at: isoStringOf(
            updatedRetention?.released_at ?? retention.released_at,
          ),
          current_status: 'REGULARIZADO',
        };
      }

      // currentState === 'RETIDO' (única outra opção de ALLOWED).
      if (retention.released_at)
        throw new DetranError('TEAT.MEASURE_STATE_INVALID', {
          status: 409,
          context: {
            retentionId,
            currentState: 'released',
            command: 'release',
          },
          message: 'Retenção já liberada.',
        });

      // §16.1 (adenda, iteração 3): de RETIDO, `release` vai sempre a
      // LIBERADO_LOCAL — a leitura antiga do §4.6 (retenção com
      // `regularization_deadline_at` → LIBERADO_COM_PRAZO) foi substituída;
      // LIBERADO_COM_PRAZO só é alcançado por outro comando (`apply-term`).
      const target = 'LIBERADO_LOCAL';
      const releasedAt = input.released_at ?? scope.occurredAt;
      const updatedRetention = await patchRow(
        this.deps,
        tx,
        'retentions',
        retentionId,
        { released_at: releasedAt, release_user_ref: scope.actorId },
      );
      await patchRow(this.deps, tx, 'measures', measureId, {
        current_status: target,
      });
      await recordHistory(
        this.deps,
        tx,
        measureId,
        target,
        'Retenção liberada',
        scope.actorId,
      );
      await appendEvent(
        this.deps,
        tx,
        measureReleasedEvent(scope, {
          measureId,
          fromState: currentState,
          toState: target,
          releasedAt,
        }),
      );

      return {
        id: retentionId,
        measure_id: measureId,
        released_at: isoStringOf(updatedRetention?.released_at ?? releasedAt),
        current_status: target,
      };
    });
  }
}
