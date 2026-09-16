// CTG-0002 §2 e §5.11 (M8, R-0008, TASK-0005) — `cancel` · `block` · `close`
// de uma reserva de numeração.
//
// A tabela não tem colunas de motivo/data de liquidação (§11.11): o ato vai em
// `reconciliation_json.lifecycle`. O catálogo não tem código de estado inválido
// de reserva (§11.12/OD-T29): transição negada é 422 `TEAT.VALIDATION_FAILED`
// com `fields:[{ path:'status', rule:'transition' }]`.
import { teatEventSink } from '@detran/ops-core';

import {
  clockOf,
  isoOf,
  tenantMismatch,
  tenantScope,
  validationFailed,
  type OfflineSyncDeps,
} from './batch-protocol.js';
import { numberingReservationChangedEvent } from './events.js';
import { bigintOf, inTransaction, type SqlScope } from './numbering-sql.js';

export type SettleAction = 'cancel' | 'block' | 'close';

export interface SettleNumberingInput {
  user_ref?: string;
  reason?: string;
}

export interface SettleNumberingResponse {
  id: string;
  status: string;
  released_from?: number;
  released_to?: number;
}

/** §2 — estados admitidos por comando; o quarto é o desfecho idempotente. */
const TRANSITIONS: Readonly<
  Record<
    SettleAction,
    { from: readonly string[]; to: string; idempotent: string }
  >
> = {
  cancel: { from: ['reserved'], to: 'cancelled', idempotent: 'cancelled' },
  block: {
    from: ['reserved', 'expired'],
    to: 'blocked',
    idempotent: 'blocked',
  },
  close: {
    from: ['reserved', 'expired'],
    to: 'consumed',
    idempotent: 'consumed',
  },
};

interface ReservationRow extends Record<string, unknown> {
  id: string;
  range_id: string;
  agent_id: string;
  device_id: string;
  shift_id: string | null;
  start_number: string;
  end_number: string;
  valid_until: string;
  status: string;
  reconciliation_json: Record<string, unknown> | null;
}

export class SettleNumberingCommand {
  constructor(private readonly deps: OfflineSyncDeps) {}

  cancel(id: string, input: SettleNumberingInput) {
    return this.execute(id, input, 'cancel');
  }

  block(id: string, input: SettleNumberingInput) {
    return this.execute(id, input, 'block');
  }

  close(id: string, input: SettleNumberingInput) {
    return this.execute(id, input, 'close');
  }

  async execute(
    id: string,
    input: SettleNumberingInput,
    action: SettleAction,
  ): Promise<SettleNumberingResponse> {
    const { tenantId, actorId } = tenantScope(this.deps);
    const now = clockOf(this.deps).now();
    const transition = TRANSITIONS[action];
    return inTransaction(this.deps, async (scope) => {
      const reservation = await this.load(scope, tenantId, id);
      if (reservation.status === transition.idempotent)
        return { id: reservation.id, status: reservation.status };
      if (!transition.from.includes(reservation.status))
        throw validationFailed([{ path: 'status', rule: 'transition' }]);

      const consumed = await this.appliedNumbers(scope, tenantId, reservation);
      const start = bigintOf(reservation.start_number);
      const end = bigintOf(reservation.end_number);
      if (action === 'cancel' && consumed.length === end - start + 1)
        throw validationFailed([{ path: 'status', rule: 'fully_consumed' }]);

      const lifecycle = {
        action,
        user_ref: input.user_ref ?? null,
        reason: input.reason ?? null,
        at: now,
      };
      await scope.query(
        `update ops.numbering_reservation
            set status = $2,
                reconciliation_json =
                  coalesce(reconciliation_json, '{}'::jsonb) ||
                  jsonb_build_object('lifecycle', $3::jsonb),
                updated_at = now()
          where id = $1`,
        [reservation.id, transition.to, JSON.stringify(lifecycle)],
      );
      if (action !== 'close')
        await scope.query(
          `update ops.numbering_consumption
              set status = $3, updated_at = now()
            where tenant_id = $1 and reservation_id = $2 and status <> 'aplicado'`,
          [
            tenantId,
            reservation.id,
            action === 'block' ? 'bloqueado' : 'expirado',
          ],
        );

      const released =
        action === 'cancel'
          ? await this.releaseTail(scope, reservation, consumed)
          : undefined;

      await teatEventSink(this.deps.outbox).append(
        scope.transaction,
        numberingReservationChangedEvent(
          { tenantId, actorId, occurredAt: now },
          {
            reservationId: reservation.id,
            rangeId: reservation.range_id,
            agentId: reservation.agent_id,
            deviceId: reservation.device_id,
            shiftId: reservation.shift_id,
            startNumber: start,
            endNumber: end,
            validUntil: isoOf(reservation.valid_until),
            status: transition.to,
            action,
          },
          2,
        ),
      );
      return { id: reservation.id, status: transition.to, ...released };
    });
  }

  private async load(
    scope: SqlScope,
    tenantId: string,
    id: string,
  ): Promise<ReservationRow> {
    const result = await scope.query<ReservationRow>(
      `select * from ops.numbering_reservation
        where tenant_id = $1 and id = $2 for update`,
      [tenantId, id],
    );
    const row = result.rows[0];
    if (!row) throw tenantMismatch();
    return row;
  }

  private async appliedNumbers(
    scope: SqlScope,
    tenantId: string,
    reservation: ReservationRow,
  ): Promise<number[]> {
    const result = await scope.query<{ number: string }>(
      `select number::text as number from ops.numbering_consumption
        where tenant_id = $1 and reservation_id = $2 and status = 'aplicado'
        order by number`,
      [tenantId, reservation.id],
    );
    return result.rows.map((row) => bigintOf(row.number));
  }

  /**
   * §5.11 — a cauda só volta à faixa quando a reserva **é** a cauda corrente
   * (`end_number = range.next_number − 1`). Lacunas interiores nunca são
   * realocadas ([RN-TEAT-113] não define devolução).
   */
  private async releaseTail(
    scope: SqlScope,
    reservation: ReservationRow,
    consumed: readonly number[],
  ): Promise<{ released_from?: number; released_to?: number }> {
    const range = await scope.query<{
      id: string;
      next_number: string;
      status: string;
    }>(
      `select id, next_number::text as next_number, status
         from ops.ait_numbering_range where id = $1 for update`,
      [reservation.range_id],
    );
    const row = range.rows[0];
    if (!row) return {};
    const start = bigintOf(reservation.start_number);
    const end = bigintOf(reservation.end_number);
    if (bigintOf(row.next_number) !== end + 1) return {};
    const highestConsumed = consumed.length ? Math.max(...consumed) : start - 1;
    const releaseFrom = highestConsumed + 1;
    if (releaseFrom > end) return {};
    await scope.query(
      `update ops.ait_numbering_range
          set next_number = $2, status = 'active', updated_at = now()
        where id = $1`,
      [row.id, releaseFrom],
    );
    return { released_from: releaseFrom, released_to: end };
  }
}
