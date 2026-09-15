import { NestFactory } from '@nestjs/core';
import pg from 'pg';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { AppModule } from '../../src/app.module.js';

const { Client } = pg;
const localTenantId = '00000000-0000-7000-8000-000000000001';
const otherTenantId = '00000000-0000-7000-8000-000000000302';
const trafficAgencyId = '00000000-0000-4000-8000-000000000303';
const otherTenantUnitId = '00000000-0000-7000-8000-000000000304';
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
    `insert into ops.agency_unit (id, tenant_id, traffic_agency_id, name)
     values ($1, $2, $3, 'Unidade cross-tenant E2E')
     on conflict (id) do update set tenant_id = excluded.tenant_id`,
    [otherTenantUnitId, otherTenantId, trafficAgencyId],
  );
  app = await NestFactory.create(AppModule.forRoot(), { logger: false });
  await app.init();
});

afterAll(async () => {
  await app?.close();
  await client.query('delete from ops.agency_unit where id = $1', [
    otherTenantUnitId,
  ]);
  await client.end();
  delete process.env.DETRAN_LOCAL_ROLES;
});

describe('montagem HTTP dos módulos ops', () => {
  it('dado o app unificado quando os recursos ops são consultados então nenhum endpoint montado retorna 404', async () => {
    const paths = [
      '/v1/ops/agency/units',
      '/v1/ops/agency/jurisdictions',
      '/v1/ops/agency/competences',
      '/v1/ops/field/agents',
      '/v1/ops/field/shifts',
      '/v1/ops/snapshots/people',
      '/v1/ops/evidence/evidence',
      '/v1/ops/offline-sync/sync-queue-items',
    ];

    for (const path of paths) {
      const response = await request(app.getHttpServer())
        .get(path)
        .set('authorization', 'Bearer local')
        .set('x-tenant-id', localTenantId);
      expect(response.status, `${path} não foi montado`).toBe(200);
    }
  });

  it('dado o app unificado quando uma leitura ops usa outro tenant então a resposta não expõe dados cross-tenant', async () => {
    const response = await request(app.getHttpServer())
      .get('/v1/ops/agency/units')
      .set('authorization', 'Bearer local')
      .set('x-tenant-id', localTenantId);
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
});
