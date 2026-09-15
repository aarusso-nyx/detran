import { randomUUID } from 'node:crypto';
import { NestFactory } from '@nestjs/core';
import pg from 'pg';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { AppModule } from '../../src/app.module.js';

/**
 * WP-T0 gate: the handwritten AIT lifecycle commands must be mounted by the
 * unified app (AitModule registers AitCommandsController + AitLifecycleService,
 * AppModule mounts the inf modules) and answer on
 * `POST /v1/inf/ait/aits/{id}/finalize` under the local runtime profile.
 */
const { Client } = pg;
// Same ids as the local runtime profile defaults (detran-runtime.ts), which are
// resolved at import time.
const tenantId = '00000000-0000-7000-8000-000000000001';
const actorId = '00000000-0000-4000-8000-000000000002';
const connectionString =
  process.env.DETRAN_TEST_DATABASE_URL ??
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5432/detran';
const client = new Client({ connectionString });
let app: Awaited<ReturnType<typeof NestFactory.create>>;
let fixture: {
  catalogId: string;
  framingId: string;
  vehicleId: string;
  personId: string;
};

beforeAll(async () => {
  process.env.DETRAN_RUNTIME_PROFILE = 'test';
  process.env.DETRAN_LOCAL_ROLES = 'field-agent';
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
  await client.query(`select set_config('app.tenant_id', $1, false)`, [
    tenantId,
  ]);
  await client.query(`select set_config('app.actor_id', $1, false)`, [actorId]);
  const catalog = await client.query<{ id: string }>(
    `insert into inf.normative_catalog (tenant_id, traffic_agency_id, name, catalog_type, version, valid_from, status)
     values ($1, $1, 'CTB', 'traffic-code', $2, '2026-01-01', 'active') returning id`,
    [tenantId, `e2e-${randomUUID().slice(0, 8)}`],
  );
  const framing = await client.query<{ id: string }>(
    `insert into inf.normative_framing (tenant_id, catalog_id, framing_code, description, approach_class, status)
     values ($1, $2, '74550', 'Infraction framing', 'caso_2', 'active') returning id`,
    [tenantId, catalog.rows[0]!.id],
  );
  const vehicle = await client.query<{ id: string }>(
    `insert into ops.snapshots_vehicle (tenant_id, plate, source) values ($1, 'BRA2E19', 'e2e') returning id`,
    [tenantId],
  );
  const person = await client.query<{ id: string }>(
    `insert into ops.snapshots_person (tenant_id, person_type, name, source) values ($1, 'natural', 'Driver', 'e2e') returning id`,
    [tenantId],
  );
  fixture = {
    catalogId: catalog.rows[0]!.id,
    framingId: framing.rows[0]!.id,
    vehicleId: vehicle.rows[0]!.id,
    personId: person.rows[0]!.id,
  };
  app = await NestFactory.create(AppModule.forRoot(), {
    logger: false,
    abortOnError: false,
  });
  await app.init();
});

afterAll(async () => {
  await app?.close();
  await client.end();
  delete process.env.DETRAN_LOCAL_ROLES;
});

describe('inf/ait routes mounted in the unified app (WP-T0)', () => {
  const headers = () => ({
    authorization: 'Bearer local',
    'x-tenant-id': tenantId,
    'idempotency-key': randomUUID(),
  });

  it('creates a draft through the generated CRUD route and finalizes it through the handwritten command route', async () => {
    const server = app.getHttpServer();
    const created = await request(server)
      .post('/v1/inf/ait/aits')
      .set(headers())
      .send({
        traffic_agency_id: tenantId,
        ait_number: `${Date.now()}`.slice(-6),
        series: 'E',
        agent_id: randomUUID(),
        shift_id: randomUUID(),
        device_id: randomUUID(),
        framing_id: fixture.framingId,
        catalog_id: fixture.catalogId,
        infraction_at: '2026-09-13T10:00:00.000Z',
        issued_at: '2026-09-13T10:01:00.000Z',
        issuance_mode: 'online',
        constatation_type: 'approach',
        location_description: 'Av. Brasil',
        uf: 'AM',
        current_status: 'RASCUNHO_OFFLINE',
      });
    expect(created.status, JSON.stringify(created.body)).toBe(201);
    const id = created.body.id as string;

    await request(server)
      .post(`/v1/inf/ait/aits/${id}/vehicles`)
      .set(headers())
      .send({
        vehicle_snapshot_id: fixture.vehicleId,
        role: 'infractor',
        visually_confirmed_by_agent: true,
      })
      .expect(201);
    await request(server)
      .post(`/v1/inf/ait/aits/${id}/people`)
      .set(headers())
      .send({
        person_id: fixture.personId,
        role: 'driver',
        identified_by: 'document',
      })
      .expect(201);
    await request(server)
      .post(`/v1/inf/ait/aits/${id}/science`)
      .set(headers())
      .send({ person_id: fixture.personId, signature_type: 'digital' })
      .expect(201);

    const finalized = await request(server)
      .post(`/v1/inf/ait/aits/${id}/finalize`)
      .set(headers())
      .send({});
    expect(finalized.status, JSON.stringify(finalized.body)).toBe(201);
    expect(finalized.body.current_status).toBe('FINALIZADO_LOCAL');
    expect(finalized.body.content_hash).toBeTruthy();
  });

  it('denies the finalize command to a role outside the policy matrix', async () => {
    process.env.DETRAN_LOCAL_ROLES = 'bi-analyst';
    const denied = await request(app.getHttpServer())
      .post(`/v1/inf/ait/aits/${randomUUID()}/finalize`)
      .set(headers())
      .send({});
    process.env.DETRAN_LOCAL_ROLES = 'field-agent';
    expect(denied.status).toBe(403);
  });
});
