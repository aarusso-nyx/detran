// CTG-0002 §4.5 e §4.6 (M7, R-0008, TASK-0005) — applier `ait` do protocolo de
// sincronização. Grava o estado direto na transação do item (M2): não chama a
// rota `receive-protocol` e não fala com SENATRAN (ADR-0003).
import {
  asQueryable,
  teatEnvelope,
  teatEventSink,
  type SqlQueryable,
  type SyncApplierRejection,
  type SyncEntityApplier,
  type SyncEntityApplierItem,
} from '@detran/ops-core';
import { DetranError, type TeatEventOutbox } from '@detran/shared';
import type { Transaction } from '@stynx-nyx/data';
import { z } from 'zod';

/** §4.5 — payload canônico do `ait`, espelho das DTOs geradas menos `tenant_id`. */
const aitSyncPayload = z.strictObject({
  ait: z.strictObject({
    traffic_agency_id: z.uuid(),
    executing_agency_id: z.uuid().nullish(),
    ait_number: z.string().max(80),
    series: z.string().max(40).default(''),
    agent_id: z.uuid(),
    shift_id: z.uuid(),
    operation_id: z.uuid().nullish(),
    device_id: z.uuid(),
    framing_id: z.uuid(),
    catalog_id: z.uuid(),
    infraction_at: z.iso.datetime(),
    issued_at: z.iso.datetime(),
    issuance_mode: z.string().max(40),
    constatation_type: z.string().max(80),
    had_approach: z.boolean().default(false),
    no_approach_reason: z.string().nullish(),
    location_description: z.string(),
    location_json: z.record(z.string(), z.unknown()).nullish(),
    gps_accuracy_m: z.number().nullish(),
    municipality_code: z.string().max(20).nullish(),
    uf: z.string().length(2),
    road: z.string().max(40).nullish(),
    km: z.number().nullish(),
    direction: z.string().max(60).nullish(),
    mandatory_observation: z.string().nullish(),
    complementary_observation: z.string().nullish(),
    content_hash: z.string().max(128),
    system_signature_ref: z.string().nullish(),
    speed_measurement_id: z.uuid().nullish(),
  }),
  vehicles: z
    .array(
      z.strictObject({
        vehicle_snapshot_id: z.uuid(),
        role: z.string().max(60),
        visually_confirmed_by_agent: z.boolean().default(false),
        observed_divergence: z.string().nullish(),
      }),
    )
    .default([]),
  people: z
    .array(
      z.strictObject({
        person_id: z.uuid(),
        role: z.string().max(60),
        identified_by: z.string().max(80),
        external_query_id: z.uuid().nullish(),
        signed: z.boolean().default(false),
        refused_signature: z.boolean().default(false),
        notes: z.string().nullish(),
      }),
    )
    .default([]),
  signatures: z
    .array(
      z.strictObject({
        person_id: z.uuid().nullish(),
        signature_type: z.enum(['signed', 'refused', 'impossibility']),
        signature_evidence_id: z.uuid().nullish(),
        signed_at: z.iso.datetime().optional(),
        location_json: z.record(z.string(), z.unknown()).nullish(),
        refusal_or_impossibility_reason: z.string().nullish(),
      }),
    )
    .default([]),
  print_events: z
    .array(
      z.strictObject({
        event_type: z.string().max(60),
        device_id: z.uuid().nullish(),
        printer_identifier: z.string().max(120).nullish(),
        receipt_hash: z.string().max(128).nullish(),
        failure_reason: z.string().nullish(),
      }),
    )
    .default([]),
});

type AitSyncPayload = z.infer<typeof aitSyncPayload>;

interface Clock {
  now(): string;
}

export interface AitSyncApplierDeps {
  database?: { tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> };
  requestContext?: {
    hasActiveContext(): boolean;
    snapshot(): { tenantId?: string; actorId?: string };
  };
  outbox?: TeatEventOutbox;
  clock?: Clock;
}

interface ReservationRow extends Record<string, unknown> {
  id: string;
  range_id: string;
  shift_id: string | null;
  status: string;
  valid_until: string;
}

/** `fields[]` do recibo: caminho do payload, nunca a mensagem do zod (§4.5). */
function fieldsOf(error: z.ZodError): string[] {
  return error.issues.flatMap((issue) => {
    const path = issue.path.map((part) => String(part));
    if (issue.code === 'unrecognized_keys')
      return (issue as unknown as { keys: string[] }).keys.map((key) =>
        [...path, key].join('.'),
      );
    return [path.join('.')];
  });
}

export class AitSyncApplier implements SyncEntityApplier {
  readonly entityType = 'ait';

  constructor(private readonly deps: AitSyncApplierDeps = {}) {}

  validate(payload: unknown): SyncApplierRejection | null {
    const parsed = aitSyncPayload.safeParse(payload);
    if (parsed.success) return null;
    return {
      code: 'TEAT.SYNC_INVALID_CANONICAL_AIT',
      fields: fieldsOf(parsed.error),
    };
  }

  async apply(
    item: SyncEntityApplierItem,
    tx: Transaction,
  ): Promise<{ serverEntityId: string }> {
    const queryable = asQueryable(tx);
    if (!queryable)
      throw new Error('The ait sync applier requires a SQL transaction');
    const payload = await this.payloadOf(queryable, item);
    const ait = payload.ait;
    const number = Number(ait.ait_number);
    const reservation = await this.guardNumbering(queryable, item, ait, number);
    const serverEntityId = await this.insertAit(queryable, item, payload);
    await this.insertSatellites(queryable, serverEntityId, payload);
    await this.insertHistory(queryable, item, serverEntityId, ait);
    await queryable.query(
      `insert into ops.numbering_consumption
         (reservation_id, range_id, number, local_entity_id, idempotency_key,
          server_entity_id, finalized_at, status, reconciled_at)
       values ($1, $2, $3, $4, $5, $6, $7, 'aplicado', now())
       on conflict (tenant_id, range_id, number)
       do update set local_entity_id = excluded.local_entity_id,
                     idempotency_key = excluded.idempotency_key,
                     server_entity_id = excluded.server_entity_id,
                     finalized_at = excluded.finalized_at,
                     status = 'aplicado', updated_at = now()`,
      [
        reservation.id,
        reservation.range_id,
        number,
        item.localEntityId,
        item.idempotencyKey,
        serverEntityId,
        ait.issued_at,
      ],
    );
    await this.publish(tx, item, serverEntityId);
    return { serverEntityId };
  }

  private async payloadOf(
    queryable: SqlQueryable,
    item: SyncEntityApplierItem,
  ): Promise<AitSyncPayload> {
    const result = await queryable.query<{ payload_json: unknown }>(
      'select payload_json from ops.sync_queue_item where id = $1',
      [item.id],
    );
    const parsed = aitSyncPayload.safeParse(result.rows[0]?.payload_json);
    if (!parsed.success)
      throw new DetranError('TEAT.SYNC_INVALID_CANONICAL_AIT', {
        status: 422,
        context: { fields: fieldsOf(parsed.error) },
        message: 'Payload canônico do AIT inválido.',
      });
    return parsed.data;
  }

  /**
   * §4.6 — guarda de numeração, nesta ordem. A reserva é lida `for update`:
   * cancelar, bloquear, fechar, reconciliar e liquidar no fechamento de turno
   * também a travam, então a guarda e o consumo `aplicado` gravado adiante
   * nunca se intercalam com a liquidação que devolve a cauda à faixa.
   */
  private async guardNumbering(
    queryable: SqlQueryable,
    item: SyncEntityApplierItem,
    ait: AitSyncPayload['ait'],
    number: number,
  ): Promise<ReservationRow> {
    const found = await queryable.query<ReservationRow>(
      `select id, range_id, shift_id, status, valid_until
         from ops.numbering_reservation
        where tenant_id = $1 and device_id = $2
          and $3::bigint between start_number and end_number
        order by reserved_at desc
        limit 1
        for update`,
      [item.tenantId, item.deviceId, number],
    );
    const reservation = found.rows[0];
    if (!reservation)
      throw new DetranError('TEAT.NUMBERING_RESERVATION_FOREIGN_SHIFT', {
        status: 422,
        context: { reservationId: null, shiftId: ait.shift_id },
        message: 'Número fora de qualquer reserva do dispositivo.',
      });
    if (String(reservation.shift_id ?? '') !== String(ait.shift_id))
      throw new DetranError('TEAT.NUMBERING_RESERVATION_FOREIGN_SHIFT', {
        status: 422,
        context: { reservationId: reservation.id, shiftId: ait.shift_id },
        message: 'Reserva pertence a outro turno.',
      });
    const expiredStatus = ['expired', 'cancelled', 'blocked'].includes(
      String(reservation.status),
    );
    const expiredByTime =
      new Date(String(reservation.valid_until)).getTime() <
      new Date(item.createdLocallyAt).getTime();
    if (expiredStatus || expiredByTime)
      throw new DetranError('TEAT.NUMBERING_RESERVATION_EXPIRED', {
        status: 422,
        context: { reservationId: reservation.id, number },
        message: 'Reserva de numeração sem vigência para o ato.',
      });
    const applied = await queryable.query<{ server_entity_id: string | null }>(
      `select server_entity_id from ops.numbering_consumption
        where tenant_id = $1 and range_id = $2 and number = $3
          and status = 'aplicado'
        limit 1`,
      [item.tenantId, reservation.range_id, number],
    );
    if (applied.rows[0])
      throw new DetranError('TEAT.NUMBERING_NUMBER_ALREADY_APPLIED', {
        status: 422,
        context: { number, aitId: applied.rows[0].server_entity_id },
        message: 'Número já consumido por AIT aplicado.',
      });
    return reservation;
  }

  private async insertAit(
    queryable: SqlQueryable,
    item: SyncEntityApplierItem,
    payload: AitSyncPayload,
  ): Promise<string> {
    const ait = payload.ait;
    const status = item.concurrencySuspect
      ? 'SUSPEITO_CONCORRENCIA'
      : 'RECEBIDO';
    const inserted = await queryable.query<{ id: string }>(
      `insert into inf.ait_ait
         (traffic_agency_id, executing_agency_id, ait_number, series, agent_id,
          shift_id, operation_id, device_id, framing_id, catalog_id,
          infraction_at, issued_at, issuance_mode, constatation_type,
          had_approach, no_approach_reason, location_description, location_json,
          gps_accuracy_m, municipality_code, uf, road, km, direction,
          mandatory_observation, complementary_observation, current_status,
          version, speed_measurement_id, content_hash, system_signature_ref,
          receipt_protocol)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
               $15, $16, $17, $18::jsonb, $19, $20, $21, $22, $23, $24, $25,
               $26, $27, 1, $28, $29, $30, $31)
       returning id`,
      [
        ait.traffic_agency_id,
        ait.executing_agency_id ?? null,
        ait.ait_number,
        ait.series,
        ait.agent_id,
        ait.shift_id,
        ait.operation_id ?? null,
        ait.device_id,
        ait.framing_id,
        ait.catalog_id,
        ait.infraction_at,
        ait.issued_at,
        ait.issuance_mode,
        ait.constatation_type,
        ait.had_approach,
        ait.no_approach_reason ?? null,
        ait.location_description,
        ait.location_json ? JSON.stringify(ait.location_json) : null,
        ait.gps_accuracy_m ?? null,
        ait.municipality_code ?? null,
        ait.uf,
        ait.road ?? null,
        ait.km ?? null,
        ait.direction ?? null,
        ait.mandatory_observation ?? null,
        ait.complementary_observation ?? null,
        status,
        ait.speed_measurement_id ?? null,
        ait.content_hash,
        ait.system_signature_ref ?? null,
        item.receiptId,
      ],
    );
    return inserted.rows[0]!.id;
  }

  private async insertSatellites(
    queryable: SqlQueryable,
    aitId: string,
    payload: AitSyncPayload,
  ): Promise<void> {
    for (const vehicle of payload.vehicles)
      await queryable.query(
        `insert into inf.ait_vehicle
           (ait_id, vehicle_snapshot_id, role, visually_confirmed_by_agent,
            observed_divergence)
         values ($1, $2, $3, $4, $5)`,
        [
          aitId,
          vehicle.vehicle_snapshot_id,
          vehicle.role,
          vehicle.visually_confirmed_by_agent,
          vehicle.observed_divergence ?? null,
        ],
      );
    for (const person of payload.people)
      await queryable.query(
        `insert into inf.ait_person
           (ait_id, person_id, role, identified_by, external_query_id, signed,
            refused_signature, notes)
         values ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          aitId,
          person.person_id,
          person.role,
          person.identified_by,
          person.external_query_id ?? null,
          person.signed,
          person.refused_signature,
          person.notes ?? null,
        ],
      );
    for (const signature of payload.signatures)
      await queryable.query(
        `insert into inf.ait_signature
           (ait_id, person_id, signature_type, signature_evidence_id, signed_at,
            location_json, refusal_or_impossibility_reason)
         values ($1, $2, $3, $4, $5, $6::jsonb, $7)`,
        [
          aitId,
          signature.person_id ?? null,
          signature.signature_type,
          signature.signature_evidence_id ?? null,
          signature.signed_at ?? null,
          signature.location_json
            ? JSON.stringify(signature.location_json)
            : null,
          signature.refusal_or_impossibility_reason ?? null,
        ],
      );
    for (const print of payload.print_events)
      await queryable.query(
        `insert into inf.ait_print_event
           (ait_id, event_type, device_id, printer_identifier, receipt_hash,
            failure_reason)
         values ($1, $2, $3, $4, $5, $6)`,
        [
          aitId,
          print.event_type,
          print.device_id ?? null,
          print.printer_identifier ?? null,
          print.receipt_hash ?? null,
          print.failure_reason ?? null,
        ],
      );
  }

  private async insertHistory(
    queryable: SqlQueryable,
    item: SyncEntityApplierItem,
    aitId: string,
    ait: AitSyncPayload['ait'],
  ): Promise<void> {
    const receivedAt = this.deps.clock?.now() ?? ait.issued_at;
    const status = item.concurrencySuspect
      ? 'SUSPEITO_CONCORRENCIA'
      : 'RECEBIDO';
    for (const [token, changedAt] of [
      ['TRANSMITIDO', item.createdLocallyAt],
      [status, receivedAt],
    ] as const)
      await queryable.query(
        `insert into inf.ait_status_history
           (ait_id, status, changed_at, user_ref, system_name)
         values ($1, $2, $3, $4, 'detran-backend')`,
        [aitId, token, changedAt, ait.agent_id],
      );
  }

  private async publish(
    tx: Transaction,
    item: SyncEntityApplierItem,
    aitId: string,
  ): Promise<void> {
    if (item.concurrencySuspect) return;
    const occurredAt = this.deps.clock?.now() ?? new Date().toISOString();
    await teatEventSink(this.deps.outbox).append(
      tx,
      teatEnvelope({
        type: 'ait.changed',
        domainEvent: 'AIT_RECEBIDO',
        tenantId: item.tenantId,
        actorId: item.agentId,
        occurredAt,
        aggregate: { kind: 'ait', id: aitId, version: 1 },
        data: {
          aitId,
          fromState: 'TRANSMITIDO',
          toState: 'RECEBIDO',
          receiptProtocol: item.receiptId,
          receivedAt: occurredAt,
        },
      }),
    );
  }
}
