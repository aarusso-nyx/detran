import { randomUUID } from 'node:crypto';
import type { NestFactory } from '@nestjs/core';
import pg from 'pg';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

/** C-2-13/C-2-14 — o produtor BOAT deve emitir envelope canônico antes de
 * qualquer projeção aceitar o evento. RED até TASK-0014 separar schemaVersion
 * de aggregate.version; `payload.type` continua sendo somente transporte SSE. */
const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
const BOAT_DRAFT = '00000000-0000-7000-8000-0000a1000001';
const DATABASE_URL =
  process.env.DETRAN_TEST_DATABASE_URL ??
  `postgresql://${process.env.DB_USER ?? 'postgres'}:${process.env.DB_PASSWORD ?? 'postgres'}@${process.env.DB_HOST ?? 'localhost'}:${process.env.DB_PORT ?? '5432'}/${process.env.DB_NAME ?? 'detran_boat_r0010_projection_test'}`;
const client = new pg.Client({ connectionString: DATABASE_URL });
let app: Awaited<ReturnType<typeof NestFactory.create>>;
let clientConnected = false;
const previousEnv: Record<string, string | undefined> = {};
let startedAt: string;

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
  process.env.DATABASE_URL = DATABASE_URL;
  process.env.STYNX_OWNER_DATABASE_URL = DATABASE_URL;
  process.env.STYNX_APP_DATABASE_URL = DATABASE_URL;
  process.env.STYNX_READER_DATABASE_URL = DATABASE_URL;
  await client.connect();
  clientConnected = true;
  await client.query("select set_config('app.role', 'owner', false)");
  const clock = await client.query<{ now: string }>(
    'select now()::text as now',
  );
  startedAt = clock.rows[0]!.now;
  const { NestFactory: factory } = await import('@nestjs/core');
  const { AppModule } = await import('../../src/app.module.js');
  app = await factory.create(AppModule.forRoot(), { logger: false });
  await app.init();
});

afterAll(async () => {
  await app?.close();
  if (!clientConnected) return;
  await client.query("select set_config('app.role', 'owner', false)");
  await client.query(
    `delete from integration.outbox
      where tenant_id = $1 and aggregate_id = $2 and created_at > $3`,
    [TENANT_ID, BOAT_DRAFT, startedAt],
  );
  await client.query(
    `update est.crash_record set state = 'RASCUNHO', version = 1 where id = $1`,
    [BOAT_DRAFT],
  );
  await client.end();
  for (const [key, value] of Object.entries(previousEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

describe('C-2-13 — emissão BOAT para projeções', () => {
  it('dado RASCUNHO quando start publica evento então o envelope possui schemaVersion inteiro separado de aggregate.version', async () => {
    try {
      const started = await request(app.getHttpServer())
        .post(`/v1/est/crash/records/${BOAT_DRAFT}/start`)
        .set({
          authorization: 'Bearer local',
          'x-tenant-id': TENANT_ID,
          'idempotency-key': `boat-projection-${randomUUID()}`,
          'if-match': '1',
        })
        .send({});
      expect(started.status, JSON.stringify(started.body)).toBe(200);
      const recorded = await request(app.getHttpServer())
        .post(`/v1/est/crash/records/${BOAT_DRAFT}/record`)
        .set({
          authorization: 'Bearer local',
          'x-tenant-id': TENANT_ID,
          'idempotency-key': `boat-projection-${randomUUID()}`,
          'if-match': '2',
        })
        .send({ pending: false });
      expect(recorded.status, JSON.stringify(recorded.body)).toBe(201);
      const events = await client.query<{ payload: Record<string, unknown> }>(
        `select distinct on (payload->'aggregate'->>'version') payload
           from integration.outbox
          where tenant_id = $1 and aggregate_id = $2
            and payload->>'domainEvent' in ('SINISTRO_INICIADO', 'SINISTRO_REGISTRADO')
          order by payload->'aggregate'->>'version', created_at`,
        [TENANT_ID, BOAT_DRAFT],
      );
      expect(events.rows).toHaveLength(2);
      const schemas = events.rows.map((event) => event.payload.schemaVersion);
      const aggregateVersions = events.rows.map(
        (event) =>
          (event.payload.aggregate as { version?: unknown } | undefined)
            ?.version,
      );
      expect(schemas).toEqual([expect.any(Number), expect.any(Number)]);
      expect(new Set(schemas).size).toBe(1);
      expect(aggregateVersions).toEqual([
        expect.any(Number),
        expect.any(Number),
      ]);
      expect(new Set(aggregateVersions).size).toBe(2);
    } finally {
      await client.query(
        `delete from integration.outbox
          where tenant_id = $1 and aggregate_id = $2 and created_at > $3`,
        [TENANT_ID, BOAT_DRAFT, startedAt],
      );
      await client.query(
        `update est.crash_record set state = 'RASCUNHO', version = 1 where id = $1`,
        [BOAT_DRAFT],
      );
    }
  });
});
