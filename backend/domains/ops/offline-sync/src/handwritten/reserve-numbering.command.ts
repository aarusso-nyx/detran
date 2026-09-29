// CTG-0002 §5.10 (M8, R-0008, TASK-0005) — `POST /v1/ops/offline-sync/
// numbering-reservations/reserve`.
//
// [WF-TEAT-002]: `next_number` nunca ultrapassa `end_number` (check
// `ck_ops_ait_numbering_range_bounds` do DDL 18), então "a faixa esgotou" se
// realiza como "o último número alocado é `end_number`": a faixa fica
// `exhausted` com `next_number = end_number` (§2, nota obrigatória de M8).
import { teatEventSink } from '@detran/ops-core';
import { DetranError } from '@detran/shared';

import {
  clockOf,
  isoOf,
  numberOf,
  tenantScope,
  validationFailed,
  type OfflineSyncDeps,
} from './batch-protocol.js';
import { numberingReservationChangedEvent } from './events.js';
import { bigintOf, inTransaction } from './numbering-sql.js';

/** Chave do `parameter-catalogue.md` §TEAT (H.54: 72 horas vigentes). */
const RESERVATION_TTL_KEY = 'teat.numbering.reservation_ttl_hours';

export interface ReserveNumberingInput {
  traffic_agency_id: string;
  agent_id: string;
  device_id: string;
  shift_id: string;
  idempotency_key: string;
  range_id?: string;
  series?: string;
  requested_size?: number;
  valid_until?: string;
}

export interface ReservationView {
  id: string;
  range_id: string;
  start_number: number;
  end_number: number;
  valid_until: string;
  status: string;
}

interface ReservationRow extends Record<string, unknown> {
  id: string;
  range_id: string;
  start_number: string;
  end_number: string;
  valid_until: string;
  status: string;
  device_id: string;
  shift_id: string | null;
}

function view(row: ReservationRow): ReservationView {
  return {
    id: row.id,
    range_id: row.range_id,
    start_number: bigintOf(row.start_number),
    end_number: bigintOf(row.end_number),
    valid_until: isoOf(row.valid_until),
    status: row.status,
  };
}

export class ReserveNumberingCommand {
  constructor(private readonly deps: OfflineSyncDeps) {}

  async execute(input: ReserveNumberingInput): Promise<ReservationView> {
    const { tenantId, actorId } = tenantScope(this.deps);
    const clock = clockOf(this.deps);
    const now = clock.now();
    const size = input.requested_size ? numberOf(input.requested_size) : 1;
    const validUntil =
      input.valid_until ?? (await this.defaultValidUntil(input, now));
    const scope = { tenantId, actorId, occurredAt: now };

    return inTransaction(this.deps, async ({ query, transaction }) => {
      const replay = await query<ReservationRow>(
        `select * from ops.numbering_reservation
          where tenant_id = $1 and idempotency_key = $2`,
        [tenantId, String(input.idempotency_key)],
      );
      const existing = replay.rows[0];
      if (existing) {
        const sameRequest =
          String(existing.device_id) === String(input.device_id) &&
          String(existing.shift_id ?? '') === String(input.shift_id ?? '') &&
          bigintOf(existing.end_number) -
            bigintOf(existing.start_number) +
            1 ===
            size;
        if (!sameRequest)
          throw new DetranError('TEAT.IDEMPOTENCY_REPLAY', {
            status: 409,
            context: { idempotencyKey: String(input.idempotency_key) },
            message: 'Chave de idempotência já usada com outro pedido.',
          });
        return view(existing);
      }

      // Serializa as reservas do turno: a linha do turno é travada antes da
      // faixa (a mesma ordem do fechamento de turno, que trava o turno e
      // depois reserva e faixa), então duas reservas do mesmo turno em faixas
      // diferentes não passam juntas pela checagem abaixo, e nenhuma nasce
      // no meio da liquidação do fechamento.
      await query(
        `select id from ops.ops_shift
          where tenant_id = $1 and id = $2 for no key update`,
        [tenantId, input.shift_id ?? null],
      );
      const range = await this.lockRange(query, tenantId, input);
      const active = await query<{ id: string }>(
        `select id from ops.numbering_reservation
          where tenant_id = $1 and device_id = $2
            and shift_id is not distinct from $3 and status = 'reserved'
          limit 1`,
        [tenantId, String(input.device_id), input.shift_id ?? null],
      );
      if (active.rows[0])
        throw new DetranError('TEAT.NUMBERING_RESERVATION_ACTIVE_EXISTS', {
          status: 409,
          context: { reservationId: active.rows[0].id },
          message: 'Já existe reserva vigente para o dispositivo e turno.',
        });

      const start = bigintOf(range.next_number);
      const end = start + size - 1;
      const rangeEnd = bigintOf(range.end_number);
      if (range.status !== 'active' || end > rangeEnd)
        throw new DetranError('TEAT.NUMBERING_RANGE_EXHAUSTED', {
          status: 422,
          context: { rangeId: range.id, series: range.series },
          message: 'Faixa de numeração esgotada.',
        });

      await query(
        `update ops.ait_numbering_range
            set next_number = $2, status = $3, updated_at = now()
          where id = $1`,
        [
          range.id,
          end < rangeEnd ? end + 1 : rangeEnd,
          end < rangeEnd ? 'active' : 'exhausted',
        ],
      );
      const inserted = await query<ReservationRow>(
        `insert into ops.numbering_reservation
           (range_id, traffic_agency_id, agent_id, device_id, shift_id,
            idempotency_key, start_number, end_number, reserved_at, valid_until,
            status)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'reserved')
         returning *`,
        [
          range.id,
          String(input.traffic_agency_id),
          String(input.agent_id),
          String(input.device_id),
          input.shift_id ?? null,
          String(input.idempotency_key),
          start,
          end,
          now,
          validUntil,
        ],
      );
      const row = inserted.rows[0]!;
      await teatEventSink(this.deps.outbox).append(
        transaction,
        numberingReservationChangedEvent(scope, {
          reservationId: row.id,
          rangeId: row.range_id,
          agentId: String(input.agent_id),
          deviceId: String(input.device_id),
          shiftId: input.shift_id ?? null,
          startNumber: start,
          endNumber: end,
          validUntil: isoOf(row.valid_until),
          status: 'reserved',
          action: 'reserve',
        }),
      );
      return view(row);
    });
  }

  private async lockRange(
    query: (
      sql: string,
      values?: readonly unknown[],
    ) => Promise<{ rows: Record<string, unknown>[] }>,
    tenantId: string,
    input: ReserveNumberingInput,
  ): Promise<{
    id: string;
    series: string;
    next_number: string;
    end_number: string;
    status: string;
  }> {
    const result = input.range_id
      ? await query(
          `select * from ops.ait_numbering_range
            where tenant_id = $1 and id = $2 for update`,
          [tenantId, String(input.range_id)],
        )
      : await query(
          `select * from ops.ait_numbering_range
            where tenant_id = $1 and traffic_agency_id = $2
              and series = $3 and status = 'active'
            order by created_at
            limit 1 for update`,
          [
            tenantId,
            String(input.traffic_agency_id),
            String(input.series ?? ''),
          ],
        );
    const row = result.rows[0] as
      | {
          id: string;
          series: string;
          next_number: string;
          end_number: string;
          status: string;
        }
      | undefined;
    if (!row)
      throw new DetranError('TEAT.NUMBERING_RANGE_EXHAUSTED', {
        status: 422,
        context: {
          rangeId: input.range_id ?? null,
          series: input.series ?? null,
        },
        message: 'Nenhuma faixa de numeração vigente para a série.',
      });
    return row;
  }

  /**
   * §5.10 pré-condição 5 — TTL do catálogo, nunca constante no código. Sem a
   * linha vigente não há prazo a aplicar: o pedido precisa trazer
   * `valid_until`.
   */
  private async defaultValidUntil(
    input: ReserveNumberingInput,
    now: string,
  ): Promise<string> {
    const row = await this.deps.parameters
      ?.get(RESERVATION_TTL_KEY, {
        agencyId: String(input.traffic_agency_id),
      })
      .catch(() => undefined);
    const hours =
      row?.value_json == null ? Number.NaN : numberOf(row.value_json);
    if (!Number.isFinite(hours))
      throw validationFailed([{ path: 'valid_until', rule: 'required' }]);
    return new Date(new Date(now).getTime() + hours * 3_600_000).toISOString();
  }
}
