import { randomUUID } from 'node:crypto';
import { NestFactory } from '@nestjs/core';
import pg from 'pg';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { AppModule } from '../../src/app.module.js';

const { Client } = pg;
const tenantId = '00000000-0000-7000-8000-000000000001';
const actorId = '00000000-0000-4000-8000-000000000002';
const connectionString =
  process.env.DETRAN_TEST_DATABASE_URL ??
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5432/detran';
const client = new Client({ connectionString });
let app: Awaited<ReturnType<typeof NestFactory.create>>;

beforeAll(async () => {
  process.env.DETRAN_RUNTIME_PROFILE = 'test';
  process.env.DETRAN_LOCAL_ROLES = 'ADMIN';
  await client.connect();
  await client.query(`select set_config('app.role', 'owner', false)`);
  await client.query(
    `insert into auth.tenants (id, slug, name) values ($1, 'local-e2e', 'Local E2E')
     on conflict (id) do update set name = excluded.name`,
    [tenantId],
  );
  await client.query(
    `insert into auth.users (id, tenant_id, email, display_name)
     values ($1, $2, 'local-e2e@detran.invalid', 'Local E2E')
     on conflict (id) do update set tenant_id = excluded.tenant_id`,
    [actorId, tenantId],
  );
  await client.query(
    `insert into auth.memberships (tenant_id, user_id) values ($1, $2)
     on conflict (tenant_id, user_id) do update set is_active = true`,
    [tenantId, actorId],
  );
  app = await NestFactory.create(AppModule.forRoot(), { logger: false });
  await app.init();
});

afterAll(async () => {
  await app?.close();
  await client.end();
  delete process.env.DETRAN_LOCAL_ROLES;
});

describe('PEC durable idempotency HTTP contract', () => {
  it('AC-PEC-KERNEL-IDEMPOTENCY replays one response and rejects key reuse with another body', async () => {
    const key = randomUUID();
    const target = `/v1/ch/admin/process-parameters/e2e.${randomUUID()}`;
    const headers = {
      authorization: 'Bearer local',
      'x-tenant-id': tenantId,
      'idempotency-key': key,
    };
    const first = await request(app.getHttpServer())
      .put(target)
      .set(headers)
      .send({ value: { enabled: true } });
    expect(first.status).toBe(200);

    const replay = await request(app.getHttpServer())
      .put(target)
      .set(headers)
      .send({ value: { enabled: true } });
    expect(replay.status).toBe(200);
    expect(replay.headers['idempotency-replayed']).toBe('true');
    expect(replay.body).toEqual(first.body);

    const mismatch = await request(app.getHttpServer())
      .put(target)
      .set(headers)
      .send({ value: { enabled: false } });
    expect(mismatch.status).toBe(422);
  });
});
