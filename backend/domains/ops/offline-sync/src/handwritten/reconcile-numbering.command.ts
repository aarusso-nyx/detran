// CTG-0002 §3, §5.12 e §12 (adenda do maestro) — `reconcile` e
// `GET …/{id}/consumption`.
//
// Com o delta `BP-OPS-OFFLINE-SYNC-001` v1.1.0 as colunas de ato de
// `ops.numbering_consumption` são anuláveis, então a reconciliação grava **uma
// linha por número do intervalo**: `aplicado` (ato no servidor, colunas de ato
// preenchidas), `consumido_localmente` (reclamado sem ato) e `disponivel` (não
// reclamado). Um número consumido no servidor é aquele que já tem linha
// `aplicado` — a linha nasce na mesma transação do AIT (§4.6), então é o
// registro do consumo, não uma segunda verdade.
import {
  tenantMismatch,
  tenantScope,
  validationFailed,
  type OfflineSyncDeps,
} from './batch-protocol.js';
import { DetranError } from '@detran/shared';

import { bigintOf, inTransaction, type SqlScope } from './numbering-sql.js';

export interface ReconcileNumberingInput {
  user_ref?: string;
  claimed_numbers?: number[];
}

export interface ConsumptionView {
  number: number;
  status: string;
  server_entity_id: string | null;
  finalized_at: string | null;
}

export interface ReconcileNumberingResponse {
  reservation_id: string;
  start_number: number;
  end_number: number;
  consumption: ConsumptionView[];
  missing_on_server: number[];
  unexpected_on_server: number[];
}

interface ReservationRow extends Record<string, unknown> {
  id: string;
  range_id: string;
  start_number: string;
  end_number: string;
  status: string;
}

interface ConsumptionRow extends Record<string, unknown> {
  number: string;
  status: string;
  server_entity_id: string | null;
  finalized_at: string | null;
}

export class ReconcileNumberingCommand {
  constructor(private readonly deps: OfflineSyncDeps) {}

  async execute(
    id: string,
    input: ReconcileNumberingInput,
  ): Promise<ReconcileNumberingResponse> {
    const { tenantId } = tenantScope(this.deps);
    return inTransaction(this.deps, async (scope) => {
      const reservation = await this.load(scope, tenantId, id);
      if (!['reserved', 'consumed'].includes(reservation.status))
        throw validationFailed([{ path: 'status', rule: 'transition' }]);
      const start = bigintOf(reservation.start_number);
      const end = bigintOf(reservation.end_number);
      const claimed = [
        ...new Set((input.claimed_numbers ?? []).map((value) => Number(value))),
      ].sort((left, right) => left - right);
      const outOfRange = claimed.filter(
        (number) => number < start || number > end,
      );
      if (outOfRange.length > 0)
        throw new DetranError('TEAT.NUMBERING_RECONCILE_MISMATCH', {
          status: 422,
          context: { outOfRange },
          message: 'Números reclamados fora do intervalo da reserva.',
        });

      const applied = await this.appliedRows(scope, tenantId, reservation.id);
      const missingOnServer: number[] = [];
      const unexpectedOnServer: number[] = [];
      const consumption: ConsumptionView[] = [];
      for (let number = start; number <= end; number += 1) {
        const act = applied.get(number);
        const isClaimed = claimed.includes(number);
        if (act) {
          if (!isClaimed) unexpectedOnServer.push(number);
          consumption.push({
            number,
            status: 'aplicado',
            server_entity_id: act.server_entity_id,
            finalized_at: act.finalized_at,
          });
          continue;
        }
        if (isClaimed) missingOnServer.push(number);
        const status = isClaimed ? 'consumido_localmente' : 'disponivel';
        await scope.query(
          `insert into ops.numbering_consumption
             (reservation_id, range_id, number, status, reconciled_at)
           values ($1, $2, $3, $4, now())
           on conflict (tenant_id, range_id, number)
           do update set status = excluded.status, reconciled_at = now(),
                         updated_at = now()`,
          [reservation.id, reservation.range_id, number, status],
        );
        consumption.push({
          number,
          status,
          server_entity_id: null,
          finalized_at: null,
        });
      }

      await scope.query(
        `update ops.numbering_reservation
            set reconciliation_json =
                  coalesce(reconciliation_json, '{}'::jsonb) || $2::jsonb,
                updated_at = now()
          where id = $1`,
        [
          reservation.id,
          JSON.stringify({
            user_ref: input.user_ref ?? null,
            claimed_numbers: claimed,
            missing_on_server: missingOnServer,
            unexpected_on_server: unexpectedOnServer,
            at: new Date().toISOString(),
          }),
        ],
      );

      return {
        reservation_id: reservation.id,
        start_number: start,
        end_number: end,
        consumption,
        missing_on_server: missingOnServer,
        unexpected_on_server: unexpectedOnServer,
      };
    });
  }

  /** §5.12 — `GET …/{id}/consumption`, ordem `number asc`. */
  async consumption(id: string): Promise<{
    reservation_id: string;
    status: string;
    consumption: ConsumptionView[];
  }> {
    const { tenantId } = tenantScope(this.deps);
    return inTransaction(this.deps, async (scope) => {
      const reservation = await this.load(scope, tenantId, id);
      const rows = await scope.query<ConsumptionRow>(
        `select number::text as number, status, server_entity_id, finalized_at
           from ops.numbering_consumption
          where tenant_id = $1 and reservation_id = $2
          order by number asc`,
        [tenantId, reservation.id],
      );
      return {
        reservation_id: reservation.id,
        status: reservation.status,
        consumption: rows.rows.map((row) => ({
          number: bigintOf(row.number),
          status: row.status,
          server_entity_id: row.server_entity_id,
          finalized_at: row.finalized_at,
        })),
      };
    });
  }

  private async load(
    scope: SqlScope,
    tenantId: string,
    id: string,
  ): Promise<ReservationRow> {
    const result = await scope.query<ReservationRow>(
      `select * from ops.numbering_reservation where tenant_id = $1 and id = $2`,
      [tenantId, id],
    );
    const row = result.rows[0];
    if (!row) throw tenantMismatch();
    return row;
  }

  private async appliedRows(
    scope: SqlScope,
    tenantId: string,
    reservationId: string,
  ): Promise<Map<number, ConsumptionRow>> {
    const result = await scope.query<ConsumptionRow>(
      `select number::text as number, status, server_entity_id, finalized_at
         from ops.numbering_consumption
        where tenant_id = $1 and reservation_id = $2 and status = 'aplicado'`,
      [tenantId, reservationId],
    );
    return new Map(result.rows.map((row) => [bigintOf(row.number), row]));
  }
}

/** Leitura pública de `GET …/{id}/consumption` (§5.12). */
export class NumberingConsumptionQuery {
  private readonly command: ReconcileNumberingCommand;

  constructor(deps: OfflineSyncDeps) {
    this.command = new ReconcileNumberingCommand(deps);
  }

  readConsumption(id: string) {
    return this.command.consumption(id);
  }
}
