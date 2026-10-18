import { randomUUID } from 'node:crypto';
import type { NestFactory } from '@nestjs/core';
import pg from 'pg';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

/**
 * CTG-0004 §4/§5/§7.3 e §11 (R-0008, TASK-0008) — C-0004-35…40 e C-0004-50
 * (item 50 do §11 cita este arquivo explicitamente; a tabela-resumo do §11
 * lista C-0004-47…50 em `policy-routes.e2e.spec.ts` — divergência de
 * transcrição do próprio contrato, registrada no relatório; sigo o texto do
 * item, mais específico).
 *
 * `MeasureCommandsController` e `AlcoholCommandsController` existem hoje mas
 * **não estão montados** pelos módulos gerados (CTG-0004 §14 item 12 nota;
 * confirmado por leitura direta de `measures.module.ts`/`alcohol.module.ts`
 * — nenhum dos dois lista o controlador manuscrito em `controllers`), e
 * `TeatIntegrationsController`/`ops:integration:*` ainda não existem (§8).
 * Todos os casos de política abaixo respondem **404** hoje (rota ausente),
 * não 200/403 — comportamento ausente, vermelho até TASK-0009 (regra 7 do
 * prompt: nunca ajustar o teste ao comportamento atual). C-0004-40 é
 * exceção: a flag `teat.speed_meters` já é `false` por padrão e o módulo já
 * não monta, então esse caso passa hoje.
 *
 * Perfil local: `DETRAN_LOCAL_TENANT_ID`/`DETRAN_LOCAL_ACTOR_ID` antes do
 * `import` dinâmico de `app.module.js` (mesmo padrão de
 * `teat-evidence-normative.e2e.spec.ts`).
 */

const { Client } = pg;

const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
const MEASURE_RETIDO = '00000000-0000-7000-8000-0000ed000001';
const MEASURE_LIBERADO_COM_PRAZO = '00000000-0000-7000-8000-0000ed000003';
const AGENCY_ID = '00000000-0000-7000-8000-0000e2000001';
const SHIFT_ID = '00000000-0000-7000-8000-0000e3000001';
const DEVICE_ID = '00000000-0000-7000-8000-0000e4000002';
const MEASURE_TYPE_ACTIVE = '00000000-0000-7000-8000-0000ec000001';
const VEHICLE_SNAPSHOT_ID = '00000000-0000-7000-8000-0000ef600001';
const PROCEDURE_TRIAGEM = '00000000-0000-7000-8000-0000ee000002';
const PROCEDURE_RESULTADO_ADMINISTRATIVO =
  '00000000-0000-7000-8000-0000ee000006';
const BREATHALYZER_VALID = '00000000-0000-7000-8000-0000ea000001';

const connectionString =
  process.env.DETRAN_TEST_DATABASE_URL ??
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5432/detran';
const client = new Client({ connectionString });

let app: Awaited<ReturnType<typeof NestFactory.create>>;
const previousEnv: Record<string, string | undefined> = {};

/**
 * O kernel aplica `@Idempotent()` a toda ação não-leitura (CTG-0001 §13
 * item 6): corpo divergente sob a mesma `Idempotency-Key` devolve 422. Cada
 * requisição leva uma chave nova.
 */
function headers(role: string): Record<string, string> {
  process.env.DETRAN_LOCAL_ROLES = role;
  return {
    authorization: 'Bearer local',
    'x-tenant-id': TENANT_ID,
    'idempotency-key': randomUUID(),
  };
}

function server() {
  return app.getHttpServer();
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
  process.env.DETRAN_LOCAL_ROLES = 'field-agent';

  await client.connect();
  await client.query(`select set_config('app.role', 'owner', false)`);

  const { NestFactory: factory } = await import('@nestjs/core');
  const { AppModule } = await import('../../src/app.module.js');
  app = await factory.create(AppModule.forRoot(), {
    logger: false,
    abortOnError: false,
  });
  await app.init();
});

afterAll(async () => {
  await app?.close();
  await client.end();
  for (const [key, value] of Object.entries(previousEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

describe('CTG-0004 §4.1 — administrative-measures/{id}/start (C-0004-35)', () => {
  it('C-0004-35 — dado DETRAN_LOCAL_ROLES=field-agent quando POST .../administrative-measures/{id}/start então 200', async () => {
    const response = await request(server())
      .post(`/v1/inf/measures/administrative-measures/${MEASURE_RETIDO}/start`)
      .set(headers('field-agent'))
      .send({});
    expect(response.status, JSON.stringify(response.body)).toBe(200);
  });

  it('C-0004-35 — dado DETRAN_LOCAL_ROLES=traffic-authority quando POST .../start então 403', async () => {
    const response = await request(server())
      .post(`/v1/inf/measures/administrative-measures/${MEASURE_RETIDO}/start`)
      .set(headers('traffic-authority'))
      .send({});
    expect(response.status).toBe(403);
  });
});

/**
 * OD-T61: C-0004-36 (`conclude`) e C-0004-37 (`release`) usavam a mesma
 * medida `…ed000003`/retenção `…ed100001` — agora que o Engineer montou os
 * comandos de verdade (TASK-0009 iteração 1), o `conclude` bem-sucedido
 * transiciona a medida para `REGULARIZADO`, o que quebraria o `release`
 * (exige `RETIDO`/`LIBERADO_COM_PRAZO`) se rodasse depois. `conclude`
 * restaura `…ed000003` a `LIBERADO_COM_PRAZO` no `afterAll` (padrão de
 * `teat-field-sync.e2e.spec.ts`); `release` cria sua própria medida e
 * retenção no arranjo e as apaga no `afterAll` — nenhum dos dois depende do
 * estado deixado pelo outro.
 */
describe('CTG-0004 §4.7 — administrative-measures/{id}/conclude (C-0004-36)', () => {
  afterAll(async () => {
    await client.query(`select set_config('app.role', 'owner', false)`);
    await client.query(
      `update inf.administrative_measure
         set current_status = 'LIBERADO_COM_PRAZO', ended_at = null
       where id = $1`,
      [MEASURE_LIBERADO_COM_PRAZO],
    );
  });

  it('C-0004-36 — dado DETRAN_LOCAL_ROLES=traffic-authority quando POST .../conclude então 200', async () => {
    const response = await request(server())
      .post(
        `/v1/inf/measures/administrative-measures/${MEASURE_LIBERADO_COM_PRAZO}/conclude`,
      )
      .set(headers('traffic-authority'))
      .send({});
    expect(response.status).toBe(200);
  });

  it('C-0004-36 — dado DETRAN_LOCAL_ROLES=field-agent quando POST .../conclude então 403', async () => {
    const response = await request(server())
      .post(
        `/v1/inf/measures/administrative-measures/${MEASURE_LIBERADO_COM_PRAZO}/conclude`,
      )
      .set(headers('field-agent'))
      .send({});
    expect(response.status).toBe(403);
  });
});

describe('CTG-0004 §4.6 — measures/retentions/{id}/release (C-0004-37)', () => {
  const releaseMeasureId = randomUUID();
  const releaseRetentionId = randomUUID();

  beforeAll(async () => {
    await client.query(`select set_config('app.role', 'owner', false)`);
    await client.query(
      `insert into inf.administrative_measure
         (id, tenant_id, traffic_agency_id, measure_type_id, agent_id, shift_id,
          device_id, started_at, reason, current_status)
       values ($1, $2, $3, $4, $5, $6, $7, now(), 'Fixture isolada — C-0004-37', 'RETIDO')`,
      [
        releaseMeasureId,
        TENANT_ID,
        AGENCY_ID,
        MEASURE_TYPE_ACTIVE,
        ACTOR_ID,
        SHIFT_ID,
        DEVICE_ID,
      ],
    );
    await client.query(
      `insert into inf.measure_retention
         (id, tenant_id, measure_id, vehicle_snapshot_id, retention_reason)
       values ($1, $2, $3, $4, 'Fixture isolada — C-0004-37')`,
      [releaseRetentionId, TENANT_ID, releaseMeasureId, VEHICLE_SNAPSHOT_ID],
    );
  });

  afterAll(async () => {
    await client.query(`select set_config('app.role', 'owner', false)`);
    // Ordem por causa de fk_inf_measure_history: `release` bem-sucedido
    // grava measure_status_history (§16.1), então essa tabela some antes
    // de administrative_measure.
    await client.query(
      `delete from inf.measure_status_history where measure_id = $1`,
      [releaseMeasureId],
    );
    await client.query(`delete from inf.measure_retention where id = $1`, [
      releaseRetentionId,
    ]);
    await client.query(`delete from inf.administrative_measure where id = $1`, [
      releaseMeasureId,
    ]);
  });

  it('C-0004-37 — dado DETRAN_LOCAL_ROLES=field-supervisor quando POST .../retentions/{id}/release então 200', async () => {
    const response = await request(server())
      .post(`/v1/inf/measures/retentions/${releaseRetentionId}/release`)
      .set(headers('field-supervisor'))
      .send({});
    expect(response.status).toBe(200);
  });

  // OD-T62: DetranPolicyGuard é genérico e devolve 403 sem `code` — só a
  // rota concreta (não escrita ainda para este caso) nomearia
  // TEAT.MEASURE_RELEASE_NOT_ALLOWED. Asserto só o status; o código por
  // rota fica como OD para o catálogo/kernel (registrado no relatório).
  it('C-0004-37 — dado DETRAN_LOCAL_ROLES=processing-operator quando POST .../release então 403', async () => {
    const response = await request(server())
      .post(`/v1/inf/measures/retentions/${releaseRetentionId}/release`)
      .set(headers('processing-operator'))
      .send({});
    expect(response.status).toBe(403);
  });
});

describe('CTG-0004 §5.2 — alcohol/procedures/{id}/tests (C-0004-38)', () => {
  it('C-0004-38 — dado DETRAN_LOCAL_ROLES=field-agent quando POST .../tests então 201', async () => {
    const response = await request(server())
      .post(`/v1/inf/alcohol/procedures/${PROCEDURE_TRIAGEM}/tests`)
      .set(headers('field-agent'))
      .send({
        breathalyzer_id: BREATHALYZER_VALID,
        result_mg_l: 0.3,
        tested_at: '2026-09-14T10:00:00-04:00',
      });
    expect(response.status).toBe(201);
  });

  it('C-0004-38 — dado DETRAN_LOCAL_ROLES=processing-operator quando POST .../tests então 403', async () => {
    const response = await request(server())
      .post(`/v1/inf/alcohol/procedures/${PROCEDURE_TRIAGEM}/tests`)
      .set(headers('processing-operator'))
      .send({
        breathalyzer_id: BREATHALYZER_VALID,
        result_mg_l: 0.3,
        tested_at: '2026-09-14T10:00:00-04:00',
      });
    expect(response.status).toBe(403);
  });
});

describe('CTG-0004 §5.6 — alcohol/procedures/{id}/close (C-0004-39)', () => {
  it('C-0004-39 — dado DETRAN_LOCAL_ROLES=field-supervisor quando POST .../close então 200', async () => {
    const response = await request(server())
      .post(
        `/v1/inf/alcohol/procedures/${PROCEDURE_RESULTADO_ADMINISTRATIVO}/close`,
      )
      .set(headers('field-supervisor'))
      .send({});
    expect(response.status).toBe(200);
  });

  it('C-0004-39 — dado DETRAN_LOCAL_ROLES=traffic-authority quando POST .../close então 403', async () => {
    const response = await request(server())
      .post(
        `/v1/inf/alcohol/procedures/${PROCEDURE_RESULTADO_ADMINISTRATIVO}/close`,
      )
      .set(headers('traffic-authority'))
      .send({});
    expect(response.status).toBe(403);
  });
});

describe('CTG-0004 §6 — speed/measurements atrás da flag (C-0004-40)', () => {
  it('C-0004-40 — dado teat.speed_meters=false (default) quando POST /v1/inf/speed/measurements então 404 (módulo não montado), nunca 403', async () => {
    const response = await request(server())
      .post('/v1/inf/speed/measurements')
      .set(headers('field-agent'))
      .send({});
    expect(response.status).toBe(404);
  });
});

describe('CTG-0004 §7.3 — ops/integrations/outbox e retry (C-0004-50)', () => {
  it('C-0004-50 — dado DETRAN_LOCAL_ROLES=integration-operator quando GET /v1/ops/integrations/outbox então 200', async () => {
    const response = await request(server())
      .get('/v1/ops/integrations/outbox')
      .set(headers('integration-operator'));
    expect(response.status).toBe(200);
  });

  it('C-0004-50 — dado DETRAN_LOCAL_ROLES=field-agent quando GET /v1/ops/integrations/outbox então 403', async () => {
    const response = await request(server())
      .get('/v1/ops/integrations/outbox')
      .set(headers('field-agent'));
    expect(response.status).toBe(403);
  });

  it('C-0004-50 — dado um item integration.outbox status=pending quando POST outbox/{id}/retry então 409 TEAT.INTEGRATION_ITEM_NOT_FAILED', async () => {
    await client.query(`select set_config('app.role', 'owner', false)`);
    const pendingItem = await client.query<{ id: string }>(
      `insert into integration.outbox
         (tenant_id, topic, aggregate_type, aggregate_id, payload, idempotency_key, status)
       values ($1, 'ait.changed', 'ait', $2, '{}'::jsonb, $3, 'pending')
       returning id`,
      [TENANT_ID, MEASURE_RETIDO, `c-0004-50-${randomUUID().slice(0, 8)}`],
    );
    const itemId = pendingItem.rows[0]!.id;
    try {
      const response = await request(server())
        .post(`/v1/ops/integrations/outbox/${itemId}/retry`)
        .set(headers('integration-operator'))
        .send({});
      expect(response.status).toBe(409);
      expect(response.body?.code).toBe('TEAT.INTEGRATION_ITEM_NOT_FAILED');
    } finally {
      await client.query(`delete from integration.outbox where id = $1`, [
        itemId,
      ]);
    }
  });
});
