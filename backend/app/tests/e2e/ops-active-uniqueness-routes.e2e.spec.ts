import { randomUUID } from 'node:crypto';
import type { NestFactory } from '@nestjs/core';
import pg from 'pg';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

/**
 * Hotfix fix/offline-numbering-shift-races, ciclo 1 da revisão — as rotas CRUD de `ops` que
 * gravam turno e reserva sem passar pelos comandos (`POST v1/ops/field/shifts`, servida por
 * `FieldOperationsController`, registrado antes do controlador gerado; `PATCH
 * v1/ops/field/shifts/:id`, gerada; `POST`/`PATCH v1/ops/offline-sync/numbering-reservations`,
 * geradas) não podem criar um segundo turno `open` do agente nem uma segunda reserva `reserved`
 * do mesmo dispositivo e turno (§5.4 e §5.10 do CTG-0002). A recusa é a de negócio do catálogo:
 * 409 `TEAT.SHIFT_ALREADY_OPEN { shiftId, deviceId }` e 409
 * `TEAT.NUMBERING_RESERVATION_ACTIVE_EXISTS { reservationId }` — nunca 500. O status vai no
 * HTTP; o corpo é o envelope de erro do app (`code`, `message`, `context`).
 *
 * As linhas do caso (agente, dispositivo, turnos, faixa e reservas) são semeadas pelo owner no
 * tenant canônico com ids novos e removidas no `afterAll`; as requisições recusadas não gravam.
 */

const { Client } = pg;

const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
const AGENCY_ID = '00000000-0000-7000-8000-0000e2000001';

const connectionString =
  process.env.DETRAN_TEST_DATABASE_URL ??
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5432/detran';
const client = new Client({ connectionString });

let app: Awaited<ReturnType<typeof NestFactory.create>>;
const previousEnv: Record<string, string | undefined> = {};

const ids = {
  agent: randomUUID(),
  device: randomUUID(),
  shiftOpen: randomUUID(),
  shiftClosed: randomUUID(),
  range: randomUUID(),
  reservationReserved: randomUUID(),
  reservationCancelled: randomUUID(),
  reservationCancelledNoShift: randomUUID(),
};

function headers(role: string): Record<string, string> {
  process.env.DETRAN_LOCAL_ROLES = role;
  return {
    authorization: 'Bearer local',
    'x-tenant-id': TENANT_ID,
    'idempotency-key': randomUUID(),
  };
}

async function count(sql: string, values: unknown[]): Promise<number> {
  await client.query(`select set_config('app.role', 'owner', false)`);
  const result = await client.query<{ count: number }>(sql, values);
  return result.rows[0]!.count;
}

async function cleanup(): Promise<void> {
  await client.query(`select set_config('app.role', 'owner', false)`);
  await client.query(
    `delete from ops.numbering_reservation where tenant_id = $1 and range_id = $2`,
    [TENANT_ID, ids.range],
  );
  await client.query(`delete from ops.ait_numbering_range where id = $1`, [
    ids.range,
  ]);
  await client.query(
    `delete from ops.ops_shift where tenant_id = $1 and agent_id = $2`,
    [TENANT_ID, ids.agent],
  );
  await client.query(`delete from ops.ops_operational_device where id = $1`, [
    ids.device,
  ]);
  await client.query(`delete from ops.ops_agent_profile where id = $1`, [
    ids.agent,
  ]);
}

beforeAll(async () => {
  for (const key of [
    'DETRAN_RUNTIME_PROFILE',
    'DETRAN_LOCAL_TENANT_ID',
    'DETRAN_LOCAL_ACTOR_ID',
    'DETRAN_LOCAL_ROLES',
  ]) {
    previousEnv[key] = process.env[key];
  }
  process.env.DETRAN_RUNTIME_PROFILE = 'test';
  process.env.DETRAN_LOCAL_TENANT_ID = TENANT_ID;
  process.env.DETRAN_LOCAL_ACTOR_ID = ACTOR_ID;
  process.env.DETRAN_LOCAL_ROLES = 'technical-admin';

  await client.connect();
  await client.query(`select set_config('app.role', 'owner', false)`);
  await client.query(`select set_config('app.tenant_id', $1, false)`, [
    TENANT_ID,
  ]);
  await client.query(
    `insert into ops.ops_agent_profile
       (id, tenant_id, traffic_agency_id, user_ref, registration_number,
        functional_status, credential_valid_until)
     values ($1, $2, $3, $4, $5, 'active', '2027-12-31')`,
    [ids.agent, TENANT_ID, AGENCY_ID, ACTOR_ID, `MAT-${ids.agent.slice(0, 8)}`],
  );
  await client.query(
    `insert into ops.ops_operational_device
       (id, tenant_id, traffic_agency_id, hardware_identifier_hash, os_name,
        status, app_version, tamper_flag)
     values ($1, $2, $3, $4, 'android', 'authorized', '1.0.0', false)`,
    [ids.device, TENANT_ID, AGENCY_ID, `sha256:uniq-${ids.device}`],
  );
  await client.query(
    `insert into ops.ops_shift
       (id, tenant_id, traffic_agency_id, agent_id, device_id, started_at,
        ended_at, status)
     values ($1, $3, $4, $5, $6, '2026-09-14T08:00:00-04:00', null, 'open'),
            ($2, $3, $4, $5, $6, '2026-09-13T08:00:00-04:00',
             '2026-09-13T17:00:00-04:00', 'closed')`,
    [
      ids.shiftOpen,
      ids.shiftClosed,
      TENANT_ID,
      AGENCY_ID,
      ids.agent,
      ids.device,
    ],
  );
  await client.query(
    `insert into ops.ait_numbering_range
       (id, tenant_id, traffic_agency_id, series, start_number, end_number,
        next_number, status, usage_mode)
     values ($1, $2, $3, $4, 2029000001, 2029001000, 2029000011, 'active',
             'source_pending')`,
    [ids.range, TENANT_ID, AGENCY_ID, `U${ids.range.slice(0, 8)}`],
  );
  await client.query(
    `insert into ops.numbering_reservation
       (id, tenant_id, range_id, traffic_agency_id, agent_id, device_id, shift_id,
        idempotency_key, start_number, end_number, valid_until, status)
     values ($1, $3, $4, $5, $6, $7, $8, $9, 2029000001, 2029000005,
             '2026-12-31T23:59:59-04:00', 'reserved'),
            ($2, $3, $4, $5, $6, $7, $8, $10, 2029000006, 2029000010,
             '2026-12-31T23:59:59-04:00', 'cancelled')`,
    [
      ids.reservationReserved,
      ids.reservationCancelled,
      TENANT_ID,
      ids.range,
      AGENCY_ID,
      ids.agent,
      ids.device,
      ids.shiftOpen,
      `uniq-reserved-${ids.range.slice(0, 8)}`,
      `uniq-cancelled-${ids.range.slice(0, 8)}`,
    ],
  );
  // Reserva liquidada sem turno: estado admitido (a exigência de turno vale para `reserved`).
  await client.query(
    `insert into ops.numbering_reservation
       (id, tenant_id, range_id, traffic_agency_id, agent_id, device_id, shift_id,
        idempotency_key, start_number, end_number, valid_until, status)
     values ($1, $2, $3, $4, $5, $6, null, $7, 2029000013, 2029000014,
             '2026-12-31T23:59:59-04:00', 'cancelled')`,
    [
      ids.reservationCancelledNoShift,
      TENANT_ID,
      ids.range,
      AGENCY_ID,
      ids.agent,
      ids.device,
      `uniq-cancelled-no-shift-${ids.range.slice(0, 8)}`,
    ],
  );

  const { NestFactory: factory } = await import('@nestjs/core');
  const { AppModule } = await import('../../src/app.module.js');
  app = await factory.create(AppModule.forRoot(), {
    logger: false,
    abortOnError: false,
  });
  await app.init();
}, 60_000);

afterAll(async () => {
  await app?.close();
  await cleanup();
  await client.end();
  for (const [key, value] of Object.entries(previousEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

const openShifts = () =>
  count(
    `select count(*)::integer as count from ops.ops_shift
      where tenant_id = $1 and agent_id = $2 and status = 'open'`,
    [TENANT_ID, ids.agent],
  );

const activeReservations = () =>
  count(
    `select count(*)::integer as count from ops.numbering_reservation
      where tenant_id = $1 and device_id = $2 and shift_id = $3
        and status = 'reserved'`,
    [TENANT_ID, ids.device, ids.shiftOpen],
  );

describe('rotas CRUD de ops — unicidade de turno aberto e de reserva ativa', () => {
  it('dado um agente com turno aberto quando POST /v1/ops/field/shifts cria outro turno open então 409 TEAT.SHIFT_ALREADY_OPEN com shiftId e deviceId do turno aberto e nenhum turno novo', async () => {
    const response = await request(app.getHttpServer())
      .post('/v1/ops/field/shifts')
      .set(headers('technical-admin'))
      .send({
        traffic_agency_id: AGENCY_ID,
        agent_id: ids.agent,
        device_id: ids.device,
        started_at: '2026-09-14T09:00:00-04:00',
        status: 'open',
      });
    expect(response.status, JSON.stringify(response.body)).toBe(409);
    expect(response.body).toMatchObject({
      code: 'TEAT.SHIFT_ALREADY_OPEN',
      context: { shiftId: ids.shiftOpen, deviceId: ids.device },
    });
    expect(await openShifts()).toBe(1);
  });

  it('dado um agente com turno aberto quando PATCH /v1/ops/field/shifts/:id reabre um turno fechado dele então 409 TEAT.SHIFT_ALREADY_OPEN e o turno continua closed', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/v1/ops/field/shifts/${ids.shiftClosed}`)
      .set(headers('technical-admin'))
      .send({ status: 'open' });
    expect(response.status, JSON.stringify(response.body)).toBe(409);
    expect(response.body).toMatchObject({
      code: 'TEAT.SHIFT_ALREADY_OPEN',
      context: { shiftId: ids.shiftOpen, deviceId: ids.device },
    });
    expect(await openShifts()).toBe(1);
  });

  it('dado uma reserva reserved do dispositivo e turno quando POST /v1/ops/offline-sync/numbering-reservations cria outra reserved então 409 TEAT.NUMBERING_RESERVATION_ACTIVE_EXISTS com reservationId e nenhuma reserva nova', async () => {
    const response = await request(app.getHttpServer())
      .post('/v1/ops/offline-sync/numbering-reservations')
      .set(headers('technical-admin'))
      .send({
        range_id: ids.range,
        traffic_agency_id: AGENCY_ID,
        agent_id: ids.agent,
        device_id: ids.device,
        shift_id: ids.shiftOpen,
        idempotency_key: `uniq-crud-${randomUUID().slice(0, 8)}`,
        start_number: 2029000011,
        end_number: 2029000012,
        valid_until: '2026-12-31T23:59:59-04:00',
        status: 'reserved',
      });
    expect(response.status, JSON.stringify(response.body)).toBe(409);
    expect(response.body).toMatchObject({
      code: 'TEAT.NUMBERING_RESERVATION_ACTIVE_EXISTS',
      context: { reservationId: ids.reservationReserved },
    });
    expect(await activeReservations()).toBe(1);
  });

  it('dado uma reserva reserved do dispositivo e turno quando PATCH /v1/ops/offline-sync/numbering-reservations/:id reativa uma reserva cancelada do mesmo turno então 409 TEAT.NUMBERING_RESERVATION_ACTIVE_EXISTS e ela continua cancelled', async () => {
    const response = await request(app.getHttpServer())
      .patch(
        `/v1/ops/offline-sync/numbering-reservations/${ids.reservationCancelled}`,
      )
      .set(headers('technical-admin'))
      .send({ status: 'reserved' });
    expect(response.status, JSON.stringify(response.body)).toBe(409);
    expect(response.body).toMatchObject({
      code: 'TEAT.NUMBERING_RESERVATION_ACTIVE_EXISTS',
      context: { reservationId: ids.reservationReserved },
    });
    expect(await activeReservations()).toBe(1);
  });

  // Ciclo 2 da revisão: o índice único trata NULL como distinto, então uma reserva `reserved`
  // sem turno escaparia da unicidade por dispositivo e turno. §5.10 do CTG-0002 exige
  // `shift_id` na reserva: `reserved` sem turno é recusada (422 `TEAT.VALIDATION_FAILED`,
  // `fields: [{ path: 'shift_id', rule: 'required' }]`), nunca gravada.
  const reservedWithoutShift = () =>
    count(
      `select count(*)::integer as count from ops.numbering_reservation
        where tenant_id = $1 and device_id = $2 and shift_id is null
          and status = 'reserved'`,
      [TENANT_ID, ids.device],
    );

  it('dado um dispositivo quando POST /v1/ops/offline-sync/numbering-reservations cria duas reservas reserved com shift_id null então as duas recebem 422 TEAT.VALIDATION_FAILED em shift_id e nenhuma reserva sem turno nasce', async () => {
    for (const [index, start] of [2029000015, 2029000017].entries()) {
      const response = await request(app.getHttpServer())
        .post('/v1/ops/offline-sync/numbering-reservations')
        .set(headers('technical-admin'))
        .send({
          range_id: ids.range,
          traffic_agency_id: AGENCY_ID,
          agent_id: ids.agent,
          device_id: ids.device,
          shift_id: null,
          idempotency_key: `uniq-null-${index}-${randomUUID().slice(0, 8)}`,
          start_number: start,
          end_number: start + 1,
          valid_until: '2026-12-31T23:59:59-04:00',
          status: 'reserved',
        });
      expect(response.status, JSON.stringify(response.body)).toBe(422);
      expect(response.body).toMatchObject({
        code: 'TEAT.VALIDATION_FAILED',
        context: { fields: [{ path: 'shift_id', rule: 'required' }] },
      });
    }
    expect(await reservedWithoutShift()).toBe(0);
  });

  it('dado reservas do dispositivo quando PATCH /v1/ops/offline-sync/numbering-reservations/:id tira o turno de uma reserved ou reativa uma cancelada sem turno então 422 TEAT.VALIDATION_FAILED em shift_id e nada muda', async () => {
    const detach = await request(app.getHttpServer())
      .patch(
        `/v1/ops/offline-sync/numbering-reservations/${ids.reservationReserved}`,
      )
      .set(headers('technical-admin'))
      .send({ shift_id: null });
    const reactivate = await request(app.getHttpServer())
      .patch(
        `/v1/ops/offline-sync/numbering-reservations/${ids.reservationCancelledNoShift}`,
      )
      .set(headers('technical-admin'))
      .send({ status: 'reserved' });
    for (const response of [detach, reactivate]) {
      expect(response.status, JSON.stringify(response.body)).toBe(422);
      expect(response.body).toMatchObject({
        code: 'TEAT.VALIDATION_FAILED',
        context: { fields: [{ path: 'shift_id', rule: 'required' }] },
      });
    }
    expect(await reservedWithoutShift()).toBe(0);
    expect(await activeReservations()).toBe(1);
  });
});
