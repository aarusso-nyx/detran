// CTG-0002 §5.5 (M10) — `POST /v1/ops/mobile-bootstrap/shifts/{id}/close`.
//
// `ops_shift` não tem coluna `version` (§11.7/OD-T27): não há `If-Match` nem
// `ETag`; a concorrência é contida pela guarda `status='open'` mais
// `select … for update`.
import { teatEventSink } from '@detran/ops-core';
import { DetranError } from '@detran/shared';

import { shiftClosedEvent } from './events.js';
import {
  clockOf,
  inTransaction,
  isoOf,
  tenantMismatch,
  tenantScope,
  type FieldDeps,
  type SqlScope,
} from './field-runtime.js';

export interface CloseShiftInput {
  device_id?: string;
  app_version?: string;
  installation_id?: string;
  protocol_version?: string;
  ended_at: string;
  latitude?: number;
  longitude?: number;
  accuracy_m?: number;
  reason?: string;
  numbering_reconciliations?: Array<{
    reservation_id: string;
    claimed_numbers: number[];
  }>;
}

interface ShiftRow extends Record<string, unknown> {
  id: string;
  agent_id: string;
  device_id: string;
  started_at: string;
  status: string;
}

interface ReservationRow extends Record<string, unknown> {
  id: string;
  range_id: string;
  start_number: string;
  end_number: string;
}

export class CloseShiftCommand {
  constructor(private readonly deps: FieldDeps) {}

  async execute(
    shiftId: string,
    input: CloseShiftInput,
  ): Promise<Record<string, unknown>> {
    const { tenantId, actorId } = tenantScope(this.deps);
    const now = clockOf(this.deps).now();
    return inTransaction(this.deps, async (scope) => {
      const found = await scope.query<ShiftRow>(
        `select * from ops.ops_shift where tenant_id = $1 and id = $2 for update`,
        [tenantId, shiftId],
      );
      const shift = found.rows[0];
      if (!shift) throw tenantMismatch();
      if (String(shift.status) !== 'open')
        throw new DetranError('TEAT.SHIFT_NOT_OPEN', {
          status: 409,
          context: { shiftId },
          message: 'Turno não está aberto.',
        });

      const pending = await scope.query<{ count: string }>(
        `select count(*)::text as count from ops.sync_queue_item
          where tenant_id = $1 and device_id = $2 and status = 'received'
            and created_locally_at >= $3 and created_locally_at <= $4`,
        [tenantId, shift.device_id, shift.started_at, input.ended_at],
      );
      const pendingCount = Number(pending.rows[0]?.count ?? '0');
      if (pendingCount > 0 && !input.reason)
        throw new DetranError('TEAT.SHIFT_CLOSE_PENDING_QUEUE', {
          status: 422,
          context: { pendingCount },
          message: 'Fila de sincronização pendente no fechamento do turno.',
        });

      const reservations = await this.settleReservations(
        scope,
        tenantId,
        shift,
        input,
        now,
      );
      const location =
        input.latitude === undefined && input.longitude === undefined
          ? null
          : {
              latitude: input.latitude ?? null,
              longitude: input.longitude ?? null,
              accuracy_m: input.accuracy_m ?? null,
            };
      await scope.query(
        `update ops.ops_shift
            set status = 'closed', ended_at = $2, end_location_json = $3::jsonb,
                updated_at = now()
          where id = $1`,
        [shift.id, input.ended_at, location ? JSON.stringify(location) : null],
      );
      await scope.query(
        `insert into ops.ops_device_event
           (device_id, agent_id, event_type, event_at, details_json)
         values ($1, $2, 'shift_close', $3, $4::jsonb)`,
        [
          shift.device_id,
          shift.agent_id,
          now,
          JSON.stringify({ shiftId: String(shift.id), pendingCount }),
        ],
      );
      await teatEventSink(this.deps.outbox).append(
        scope.transaction,
        shiftClosedEvent(
          { tenantId, actorId, occurredAt: now },
          {
            shiftId: String(shift.id),
            agentId: String(shift.agent_id),
            deviceId: String(shift.device_id),
            endedAt: String(input.ended_at),
            pendingCount,
            reservationsClosed: reservations
              .filter((row) => row.status === 'consumed')
              .map((row) => row.id),
            reservationsCancelled: reservations
              .filter((row) => row.status === 'cancelled')
              .map((row) => row.id),
          },
        ),
      );
      return {
        id: String(shift.id),
        status: 'closed',
        ended_at: isoOf(input.ended_at),
        reservations,
      };
    });
  }

  /**
   * §5.5 — cada reserva `reserved` do turno é liquidada: com consumo aplicado
   * fecha (`consumed`); sem nenhum, cancela (`cancelled`) e devolve a cauda à
   * faixa quando a reserva é a cauda corrente.
   */
  private async settleReservations(
    scope: SqlScope,
    tenantId: string,
    shift: ShiftRow,
    input: CloseShiftInput,
    now: string,
  ): Promise<Array<{ id: string; status: string }>> {
    const result = await scope.query<ReservationRow>(
      `select id, range_id, start_number::text as start_number,
              end_number::text as end_number
         from ops.numbering_reservation
        where tenant_id = $1 and shift_id = $2 and status = 'reserved'
        for update`,
      [tenantId, shift.id],
    );
    const settled: Array<{ id: string; status: string }> = [];
    for (const reservation of result.rows) {
      const claimed = (input.numbering_reconciliations ?? []).find(
        (entry) => String(entry.reservation_id) === String(reservation.id),
      );
      if (claimed) await this.reconcile(scope, reservation, claimed);
      const applied = await scope.query<{ number: string }>(
        `select number::text as number from ops.numbering_consumption
          where tenant_id = $1 and reservation_id = $2 and status = 'aplicado'`,
        [tenantId, reservation.id],
      );
      const status = applied.rows.length > 0 ? 'consumed' : 'cancelled';
      await scope.query(
        `update ops.numbering_reservation
            set status = $2,
                reconciliation_json =
                  coalesce(reconciliation_json, '{}'::jsonb) ||
                  jsonb_build_object('lifecycle', $3::jsonb),
                updated_at = now()
          where id = $1`,
        [
          reservation.id,
          status,
          JSON.stringify({
            action: status === 'consumed' ? 'close' : 'cancel',
            user_ref: shift.agent_id,
            reason: input.reason ?? null,
            at: now,
          }),
        ],
      );
      if (status === 'cancelled')
        await this.releaseTail(
          scope,
          reservation,
          applied.rows.map((row) => Number(row.number)),
        );
      settled.push({ id: String(reservation.id), status });
    }
    return settled;
  }

  private async reconcile(
    scope: SqlScope,
    reservation: ReservationRow,
    claimed: { reservation_id: string; claimed_numbers: number[] },
  ): Promise<void> {
    const start = Number(reservation.start_number);
    const end = Number(reservation.end_number);
    const numbers = [...new Set(claimed.claimed_numbers.map(Number))].sort(
      (left, right) => left - right,
    );
    const outOfRange = numbers.filter(
      (number) => number < start || number > end,
    );
    if (outOfRange.length > 0)
      throw new DetranError('TEAT.NUMBERING_RECONCILE_MISMATCH', {
        status: 422,
        context: { outOfRange },
        message: 'Números reclamados fora do intervalo da reserva.',
      });
    for (const number of numbers) {
      await scope.query(
        `insert into ops.numbering_consumption
           (reservation_id, range_id, number, status, reconciled_at)
         values ($1, $2, $3, 'consumido_localmente', now())
         on conflict (tenant_id, range_id, number) do nothing`,
        [reservation.id, reservation.range_id, number],
      );
    }
  }

  private async releaseTail(
    scope: SqlScope,
    reservation: ReservationRow,
    consumed: readonly number[],
  ): Promise<void> {
    const range = await scope.query<{ id: string; next_number: string }>(
      `select id, next_number::text as next_number
         from ops.ait_numbering_range where id = $1 for update`,
      [reservation.range_id],
    );
    const row = range.rows[0];
    if (!row) return;
    const start = Number(reservation.start_number);
    const end = Number(reservation.end_number);
    if (Number(row.next_number) !== end + 1) return;
    const releaseFrom =
      (consumed.length ? Math.max(...consumed) : start - 1) + 1;
    if (releaseFrom > end) return;
    await scope.query(
      `update ops.ait_numbering_range
          set next_number = $2, status = 'active', updated_at = now()
        where id = $1`,
      [row.id, releaseFrom],
    );
  }
}
