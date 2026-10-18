import { createHash, randomUUID } from 'node:crypto';
import type { NestFactory } from '@nestjs/core';
import pg from 'pg';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
const AGENCY_ID = '00000000-0000-7000-8000-0000e2000001';
const DEVICE_ID = '00000000-0000-7000-8000-0000e4000002';
const connectionString = process.env.DETRAN_TEST_DATABASE_URL;

if (!connectionString)
  throw new Error('DETRAN_TEST_DATABASE_URL is required for R-0021 e2e');

const client = new pg.Client({ connectionString });
let app: Awaited<ReturnType<typeof NestFactory.create>>;
const previousEnv: Record<string, string | undefined> = {};
const tenantBId = randomUUID();
const tenantBRangeId = randomUUID();
const tenantBReservationId = randomUUID();
const tenantBQueueItemId = randomUUID();
const tenantBConflictId = randomUUID();

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => item !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableJson(item)}`)
      .join(',')}}`;
  }
  return JSON.stringify(value) ?? 'null';
}

function body(localEntityId: string, itemKey: string): Record<string, unknown> {
  const offset = Number.parseInt(randomUUID().slice(0, 6), 16) % 3600;
  const occurredAt = `2031-01-01T10:${String(Math.floor(offset / 60)).padStart(2, '0')}:${String(offset % 60).padStart(2, '0')}-04:00`;
  const payload = {
    record: {
      traffic_agency_id: AGENCY_ID,
      crash_type: 'source_pending',
      severity: 'SEM_VITIMA',
      occurred_at: occurredAt,
      recorded_at: '2031-01-01T11:00:00-04:00',
      location_description: 'R-0021 HTTP fixture',
      municipality_code: '1302603',
      uf: 'AM',
      road_condition: 'source_pending',
      weather_condition: 'source_pending',
      lighting_condition: 'source_pending',
      signage_condition: 'source_pending',
      source_local_id: localEntityId,
    },
    vehicles: [],
    people: [],
    victims: [],
    sceneDuties: [],
    damages: [],
    witnesses: [],
    sketch: null,
    evidenceLocalIds: [],
    links: [],
  };
  return {
    traffic_agency_id: AGENCY_ID,
    device_id: DEVICE_ID,
    agent_id: ACTOR_ID,
    device_batch_id: `r21-http-${randomUUID().slice(0, 8)}`,
    items: [
      {
        entity_type: 'crash-record',
        local_entity_id: localEntityId,
        idempotency_key: itemKey,
        created_locally_at: '2026-09-14T13:05:00.000Z',
        payload_json: payload,
        payload_hash: `sha256:${createHash('sha256')
          .update(stableJson(payload))
          .digest('hex')}`,
      },
    ],
  };
}

function headers(
  idempotencyKey: string,
  role = 'field-agent',
): Record<string, string> {
  process.env.DETRAN_LOCAL_ROLES = role;
  return {
    authorization: 'Bearer local',
    'x-tenant-id': TENANT_ID,
    'idempotency-key': idempotencyKey,
  };
}

beforeAll(async () => {
  for (const key of [
    'DETRAN_RUNTIME_PROFILE',
    'DETRAN_LOCAL_TENANT_ID',
    'DETRAN_LOCAL_ACTOR_ID',
    'DETRAN_LOCAL_ROLES',
    'DATABASE_URL',
    'STYNX_OWNER_DATABASE_URL',
    'STYNX_APP_DATABASE_URL',
    'STYNX_READER_DATABASE_URL',
  ])
    previousEnv[key] = process.env[key];
  process.env.DETRAN_RUNTIME_PROFILE = 'test';
  process.env.DETRAN_LOCAL_TENANT_ID = TENANT_ID;
  process.env.DETRAN_LOCAL_ACTOR_ID = ACTOR_ID;
  process.env.DETRAN_LOCAL_ROLES = 'field-agent';
  process.env.DATABASE_URL = connectionString;
  process.env.STYNX_OWNER_DATABASE_URL = connectionString;
  process.env.STYNX_APP_DATABASE_URL = connectionString;
  process.env.STYNX_READER_DATABASE_URL = connectionString;
  await client.connect();
  await client.query(`select set_config('app.role', 'owner', false)`);
  await client.query(
    `insert into auth.tenants (id, slug, name) values ($1, $2, $3)`,
    [tenantBId, `r21-http-b-${tenantBId.slice(0, 8)}`, 'R-0021 HTTP B'],
  );
  await client.query(
    `insert into ops.ait_numbering_range
       (id, tenant_id, traffic_agency_id, series, start_number, end_number,
        next_number, status, usage_mode)
     values ($1, $2, $3, 'R21', 2027000001, 2027000010, 2027000001,
             'active', 'source_pending')`,
    [tenantBRangeId, tenantBId, randomUUID()],
  );
  await client.query(
    `insert into ops.numbering_reservation
       (id, tenant_id, range_id, traffic_agency_id, agent_id, device_id,
        shift_id, idempotency_key, start_number, end_number, valid_until,
        status)
     values ($1, $2, $3, $4, $5, $6, $7, $8, 2027000001, 2027000001,
             '2026-12-31T23:59:59-04:00', 'reserved')`,
    [
      tenantBReservationId,
      tenantBId,
      tenantBRangeId,
      randomUUID(),
      randomUUID(),
      randomUUID(),
      // §5.10: reserva `reserved` sempre tem turno.
      randomUUID(),
      `r21-http-b-reservation-${randomUUID().slice(0, 8)}`,
    ],
  );
  await client.query(
    `insert into ops.sync_queue_item
       (id, tenant_id, traffic_agency_id, device_id, agent_id, entity_type,
        local_entity_id, status, created_locally_at, idempotency_key,
        payload_hash, payload_json)
     values ($1, $2, $3, $4, $5, 'ait', $6, 'received',
             '2026-09-14T13:05:00.000Z', $7, 'sha256:r21-http-b',
             '{}'::jsonb)`,
    [
      tenantBQueueItemId,
      tenantBId,
      randomUUID(),
      randomUUID(),
      randomUUID(),
      randomUUID(),
      `r21-http-b-item-${randomUUID().slice(0, 8)}`,
    ],
  );
  await client.query(
    `insert into ops.sync_conflict
       (id, tenant_id, sync_queue_item_id, conflict_type, reason_code,
        retryable, allowed_resolution_actions, description, status)
     values ($1, $2, $3, 'integrity', 'TEAT.SYNC_INTEGRITY_ERROR', false,
             '["accept_server","reject","retry_after_correction"]'::jsonb,
             'R-0021 HTTP tenant B fixture', 'open')`,
    [tenantBConflictId, tenantBId, tenantBQueueItemId],
  );
  const { NestFactory: factory } = await import('@nestjs/core');
  const { AppModule } = await import('../../src/app.module.js');
  app = await factory.create(AppModule.forRoot(), { logger: false });
  await app.init();
});

afterAll(async () => {
  await app?.close();
  await client.query(`select set_config('app.role', 'owner', false)`);
  await client.query(
    `delete from integration.outbox
      where tenant_id = $1 and idempotency_key like 'r21-http-%'`,
    [TENANT_ID],
  );
  await client.query(
    `delete from integration.idempotency_keys
      where tenant_id = $1 and idem_key like 'r21-http-%'`,
    [TENANT_ID],
  );
  await client.query(
    `delete from ops.sync_receipt
      where tenant_id = $1 and idempotency_key like 'r21-http-%'`,
    [TENANT_ID],
  );
  await client.query(
    `delete from ops.sync_queue_item
      where tenant_id = $1 and idempotency_key like 'r21-http-%'`,
    [TENANT_ID],
  );
  await client.query(
    `delete from ops.sync_batch
      where tenant_id = $1 and device_batch_id like 'r21-http-%'`,
    [TENANT_ID],
  );
  await client.query(
    `delete from est.crash_record
      where tenant_id = $1 and location_description = 'R-0021 HTTP fixture'`,
    [TENANT_ID],
  );
  await client.query(`delete from ops.sync_conflict where id = $1`, [
    tenantBConflictId,
  ]);
  await client.query(`delete from ops.sync_queue_item where id = $1`, [
    tenantBQueueItemId,
  ]);
  await client.query(`delete from ops.numbering_reservation where id = $1`, [
    tenantBReservationId,
  ]);
  await client.query(`delete from ops.ait_numbering_range where id = $1`, [
    tenantBRangeId,
  ]);
  await client.query(`delete from auth.tenants where id = $1`, [tenantBId]);
  await client.end();
  for (const [key, value] of Object.entries(previousEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

describe('CTG-0001 C-01-21 — idempotência HTTP de offline-sync', () => {
  it('dado Idempotency-Key repetida quando reenvia o mesmo lote e depois um corpo divergente então reproduz a resposta e recusa a divergência com 422', async () => {
    const idempotencyKey = `r21-http-${randomUUID()}`;
    const itemKey = `r21-http-${randomUUID()}`;
    const firstBody = body(randomUUID(), itemKey);
    const first = await request(app.getHttpServer())
      .post('/v1/ops/offline-sync/sync-batches')
      .set(headers(idempotencyKey))
      .send(firstBody);
    expect(first.status, JSON.stringify(first.body)).toBe(200);
    expect(first.body.receipts[0]).toMatchObject({ status: 'applied' });

    const replay = await request(app.getHttpServer())
      .post('/v1/ops/offline-sync/sync-batches')
      .set(headers(idempotencyKey))
      .send(firstBody);
    expect(replay.status).toBe(200);
    expect(replay.body).toEqual(first.body);

    const anotherBatch = {
      ...firstBody,
      device_batch_id: `${firstBody.device_batch_id as string}-another-batch`,
    };
    const itemReplay = await request(app.getHttpServer())
      .post('/v1/ops/offline-sync/sync-batches')
      .set(headers(`r21-http-${randomUUID()}`))
      .send(anotherBatch);
    expect(itemReplay.status, JSON.stringify(itemReplay.body)).toBe(200);
    expect(itemReplay.body.receipts[0]).toMatchObject({ status: 'applied' });
    const persisted = await client.query<{ queue: string; crashes: string }>(
      `select
         (select count(*)::text from ops.sync_queue_item
           where tenant_id = $1 and idempotency_key = $2) as queue,
         (select count(*)::text from est.crash_record
           where tenant_id = $1 and source_local_id = $3) as crashes`,
      [
        TENANT_ID,
        itemKey,
        (firstBody.items as { local_entity_id: string }[])[0]!.local_entity_id,
      ],
    );
    expect(persisted.rows[0]).toEqual({ queue: '1', crashes: '1' });

    const divergent = {
      ...firstBody,
      device_batch_id: `${firstBody.device_batch_id as string}-divergent`,
    };
    const rejected = await request(app.getHttpServer())
      .post('/v1/ops/offline-sync/sync-batches')
      .set(headers(idempotencyKey))
      .send(divergent);
    expect(rejected.status).toBe(422);
  });
});

describe('CTG-0001 C-01-28 — isolamento HTTP de offline-sync', () => {
  it('dado reserva e conflito reais do tenant B quando o principal A os cancela ou resolve então ambos retornam 404 TEAT.TENANT_MISMATCH', async () => {
    const reservation = await request(app.getHttpServer())
      .post(
        `/v1/ops/offline-sync/numbering-reservations/${tenantBReservationId}/cancel`,
      )
      .set(headers(`r21-http-${randomUUID()}`, 'field-agent'))
      .send({ reason: 'Tentativa cruzada de tenant' });
    expect(reservation.status).toBe(404);
    expect(reservation.body.code).toBe('TEAT.TENANT_MISMATCH');

    const conflict = await request(app.getHttpServer())
      .post(`/v1/ops/offline-sync/sync-conflicts/${tenantBConflictId}/resolve`)
      .set(headers(`r21-http-${randomUUID()}`, 'field-supervisor'))
      .send({
        resolved_by_user_ref: ACTOR_ID,
        resolution_action: 'manual_review',
        description: 'Tentativa cruzada de tenant',
      });
    expect(conflict.status).toBe(404);
    expect(conflict.body.code).toBe('TEAT.TENANT_MISMATCH');
  });
});
