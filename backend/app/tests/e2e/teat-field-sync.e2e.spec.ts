import { createHash, randomUUID } from 'node:crypto';
import type { NestFactory } from '@nestjs/core';
import pg from 'pg';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

/**
 * CTG-0002 §1, §5 e §10 (R-0008, TASK-0004) — C-0002-43…50: as rotas de campo e
 * sincronização sob o app unificado, com a guarda de política nos dois sentidos
 * (papel mínimo → 200/201, papel fora da regra → 403) e a fronteira de rota
 * `v1/ops/…` da §1.
 *
 * Nenhuma dessas rotas existe hoje: elas nascem em TASK-0005 (§11), e o prefixo
 * `v1/` dos controladores manuscritos de `ops` é corrigido em TASK-0005
 * (`ops/field`) e TASK-0007 (`ops/evidence`, `ops/snapshots`). Até lá cada caso
 * falha pelo comportamento ausente — 404 onde se espera 200/403.
 *
 * O perfil local resolve `DETRAN_LOCAL_TENANT_ID`/`DETRAN_LOCAL_ACTOR_ID` no
 * carregamento do módulo (`detran-runtime.ts`), então as duas variáveis são
 * definidas **antes** do `await import('../../src/app.module.js')`, e removidas
 * no `afterAll` para não vazarem para os outros arquivos e2e (o pool roda todos
 * no mesmo processo, `fileParallelism: false`).
 */

const { Client } = pg;

/** Tenant e persona canônicos das fixtures (00/25/26-fixtures-*.sql). */
const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
const OTHER_TENANT_ID = '00000000-0000-7000-8000-00000000a002';
const AGENCY_ID = '00000000-0000-7000-8000-0000e2000001';
const DEVICE_AUTHORIZED = '00000000-0000-7000-8000-0000e4000002';
const DEVICE_TAMPERED = '00000000-0000-7000-8000-0000e4000004';
const SHIFT_OPEN = '00000000-0000-7000-8000-0000e3000001';
const RESERVATION_RESERVED = '00000000-0000-7000-8000-0000e6000001';
const HOMOLOGATION_ACTIVE = '00000000-0000-7000-8000-0000e2200001';
const HOMOLOGATION_EXPIRED_REPORT = '00000000-0000-7000-8000-0000e2200002';
const CONFLICT_CONCURRENCY = '00000000-0000-7000-8000-0000eb100001';
const APP_VERSION = '1.0.0';

const connectionString =
  process.env.DETRAN_TEST_DATABASE_URL ??
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5432/detran';
const client = new Client({ connectionString });

let app: Awaited<ReturnType<typeof NestFactory.create>>;
let startedAt: string;
const previousEnv: Record<string, string | undefined> = {};

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => item !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableJson(item)}`);
    return `{${entries.join(',')}}`;
  }
  return JSON.stringify(value) ?? 'null';
}

function canonicalHash(payload: unknown): string {
  return `sha256:${createHash('sha256').update(stableJson(payload)).digest('hex')}`;
}

/**
 * O kernel aplica `@Idempotent()` a toda ação não-leitura: corpo divergente sob
 * a mesma `Idempotency-Key` devolve 422 (CTG-0001 §13 item 6). Cada requisição
 * leva uma chave nova, salvo quando o teste é justamente de replay.
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

const crashRecordPayload = { crash: { local_protocol: 'BOAT-0001' } };

function syncBatchBody(): Record<string, unknown> {
  return {
    traffic_agency_id: AGENCY_ID,
    device_id: DEVICE_AUTHORIZED,
    agent_id: ACTOR_ID,
    device_batch_id: `e2e-${randomUUID().slice(0, 8)}`,
    items: [
      {
        // `crash-record` é reconhecido como suportado e não tem destino nesta
        // rodada (§4.3): o lote responde 200 e nada de domínio é tocado.
        entity_type: 'crash-record',
        local_entity_id: randomUUID(),
        idempotency_key: `e2e-item-${randomUUID().slice(0, 8)}`,
        created_locally_at: '2026-09-14T13:05:00.000Z',
        payload_json: crashRecordPayload,
        payload_hash: canonicalHash(crashRecordPayload),
      },
    ],
  };
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
  const now = await client.query<{ now: string }>('select now()::text as now');
  startedAt = now.rows[0]!.now;

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
  await client.query(`select set_config('app.role', 'owner', false)`);
  // Remove o que os comandos criarem e devolve as fixtures de 26-fixtures-teat-field.sql
  // ao estado semeado, para que o arquivo rode isolado e em qualquer ordem.
  for (const table of [
    'integration.outbox',
    'ops.numbering_consumption',
    'ops.ops_device_event',
    'ops.ops_session_handoff',
  ]) {
    await client.query(
      `delete from ${table} where tenant_id = $1 and created_at > $2`,
      [TENANT_ID, startedAt],
    );
  }
  await client.query(
    `delete from ops.sync_conflict where tenant_id = $1 and created_at > $2`,
    [TENANT_ID, startedAt],
  );
  await client.query(
    `delete from ops.sync_receipt where tenant_id = $1 and created_at > $2`,
    [TENANT_ID, startedAt],
  );
  await client.query(
    `delete from ops.sync_queue_item where tenant_id = $1 and created_at > $2`,
    [TENANT_ID, startedAt],
  );
  await client.query(
    `delete from ops.sync_batch where tenant_id = $1 and created_at > $2`,
    [TENANT_ID, startedAt],
  );
  await client.query(
    `delete from ops.numbering_reservation where tenant_id = $1 and created_at > $2`,
    [TENANT_ID, startedAt],
  );
  await client.query(
    `update ops.ops_operational_device set status = 'authorized' where id = $1`,
    [DEVICE_TAMPERED],
  );
  await client.query(
    `update ops.numbering_reservation set status = 'reserved' where id = $1`,
    [RESERVATION_RESERVED],
  );
  await client.query(
    `update ops.ops_shift set device_id = $2, status = 'open', ended_at = null where id = $1`,
    [SHIFT_OPEN, DEVICE_AUTHORIZED],
  );
  await client.query(
    `update ops.ops_homologation
        set laudo_emitido_em = '2021-12-01', laudo_valido_ate = '2025-12-31',
            status = 'active'
      where id = $1`,
    [HOMOLOGATION_EXPIRED_REPORT],
  );
  await client.query(
    `update ops.ops_homologation
        set status = 'active', cancelled_reason = null
      where id = $1`,
    [HOMOLOGATION_ACTIVE],
  );
  await client.query(
    `update ops.sync_conflict
        set status = 'open', resolution_action = null,
            resolution_details_json = null, resolved_at = null,
            resolved_by_user_ref = null
      where id = $1`,
    [CONFLICT_CONCURRENCY],
  );
  await client.end();
  for (const [key, value] of Object.entries(previousEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

describe('CTG-0002 §5.1/§5.13 — política de leitura e submissão (C-0002-43/44)', () => {
  it('C-0002-43 — dado DETRAN_LOCAL_ROLES=field-agent quando GET /v1/ops/mobile-bootstrap então 200', async () => {
    const response = await request(server())
      .get('/v1/ops/mobile-bootstrap')
      .query({ device_id: DEVICE_AUTHORIZED, app_version: APP_VERSION })
      .set(headers('field-agent'));
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      protocolVersion: 'teat-mobile-bootstrap.v1',
    });
  });

  it('C-0002-43 — dado DETRAN_LOCAL_ROLES=agency-admin quando GET /v1/ops/mobile-bootstrap então 403', async () => {
    const response = await request(server())
      .get('/v1/ops/mobile-bootstrap')
      .query({ device_id: DEVICE_AUTHORIZED, app_version: APP_VERSION })
      .set(headers('agency-admin'));
    expect(response.status).toBe(403);
  });

  it('C-0002-44 — dado DETRAN_LOCAL_ROLES=field-agent quando POST /v1/ops/offline-sync/sync-batches então 200 com receipts e warnings', async () => {
    const response = await request(server())
      .post('/v1/ops/offline-sync/sync-batches')
      .set(headers('field-agent'))
      .send(syncBatchBody());
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      receipts: expect.any(Array),
      warnings: expect.any(Array),
    });
    expect(response.body.receipts[0]).toMatchObject({
      status: 'received',
      error_code: 'TEAT.SYNC_DESTINATION_NOT_WIRED',
    });
  });

  it('C-0002-44 — dado DETRAN_LOCAL_ROLES=field-supervisor quando POST /v1/ops/offline-sync/sync-batches então 403', async () => {
    const response = await request(server())
      .post('/v1/ops/offline-sync/sync-batches')
      .set(headers('field-supervisor'))
      .send(syncBatchBody());
    expect(response.status).toBe(403);
  });

  it('§5.13 — dado GET receipts/{tenantId} de outro tenant então 404 TEAT.TENANT_MISMATCH', async () => {
    const response = await request(server())
      .get(`/v1/ops/offline-sync/receipts/${OTHER_TENANT_ID}`)
      .set(headers('field-agent'));
    expect(response.status).toBe(404);
    expect(response.body.code).toBe('TEAT.TENANT_MISMATCH');
  });

  it('§5.13 — dado by-idempotency com uma chave inexistente então 404 TEAT.SYNC_RECEIPT_NOT_FOUND', async () => {
    const response = await request(server())
      .get(
        `/v1/ops/offline-sync/receipts/${TENANT_ID}/by-idempotency/item-inexistente`,
      )
      .set(headers('field-agent'));
    expect(response.status).toBe(404);
    expect(response.body.code).toBe('TEAT.SYNC_RECEIPT_NOT_FOUND');
  });

  it('§5.13 — dado by-idempotency com a chave item-001 das fixtures então 200 com o recibo applied (recuperação de ACK perdido)', async () => {
    const response = await request(server())
      .get(`/v1/ops/offline-sync/receipts/${TENANT_ID}/by-idempotency/item-001`)
      .set(headers('field-agent'));
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      idempotency_key: 'item-001',
      status: 'applied',
    });
  });
});

/**
 * CTG-0002 §5.13 (R-0008, TASK-0004 iteração 3) — achado 4 da delivery-review:
 * a validação de forma do `SubmitSyncBatchDto` acontece **antes** de qualquer
 * materialização e devolve 400 `TEAT.VALIDATION_FAILED` com `context.fields[]`,
 * nunca o corpo padrão do `ValidationPipe`.
 */
describe('CTG-0002 §5.13 — validação de forma do lote no HTTP (achado 4)', () => {
  /**
   * Nenhum `sync_batch`/`sync_queue_item` pode nascer de um corpo inválido. A
   * contagem é por `device_batch_id` e por `idempotency_key` do próprio corpo:
   * o tenant é compartilhado com os demais casos deste arquivo, que criam lotes
   * válidos de propósito.
   */
  async function expectNothingMaterialized(
    deviceBatchId: string,
    itemKey: string,
  ): Promise<void> {
    await client.query(`select set_config('app.role', 'owner', false)`);
    const batches = await client.query<{ count: string }>(
      `select count(*)::text as count from ops.sync_batch
        where tenant_id = $1 and device_batch_id = $2`,
      [TENANT_ID, deviceBatchId],
    );
    expect(Number(batches.rows[0]!.count)).toBe(0);
    const items = await client.query<{ count: string }>(
      `select count(*)::text as count from ops.sync_queue_item
        where tenant_id = $1 and idempotency_key = $2`,
      [TENANT_ID, itemKey],
    );
    expect(Number(items.rows[0]!.count)).toBe(0);
  }

  /** `idempotency_key` do único item que `syncBatchBody()` monta. */
  function itemKeyOf(body: Record<string, unknown>): string {
    return (body.items as { idempotency_key: string }[])[0]!.idempotency_key;
  }

  it('dado items ausente então 400 TEAT.VALIDATION_FAILED com context.fields[] apontando items, e nada materializado', async () => {
    const body = syncBatchBody();
    const deviceBatchId = body.device_batch_id as string;
    const itemKey = itemKeyOf(body);
    delete body.items;
    const response = await request(server())
      .post('/v1/ops/offline-sync/sync-batches')
      .set(headers('field-agent'))
      .send(body);
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      code: 'TEAT.VALIDATION_FAILED',
      context: expect.objectContaining({
        fields: expect.arrayContaining([
          expect.objectContaining({ path: 'items' }),
        ]),
      }),
    });
    await expectNothingMaterialized(deviceBatchId, itemKey);
  });

  it('dado items vazio então 400 TEAT.VALIDATION_FAILED com context.fields[] apontando items, e nada materializado', async () => {
    const body = syncBatchBody();
    const deviceBatchId = body.device_batch_id as string;
    const itemKey = itemKeyOf(body);
    body.items = [];
    const response = await request(server())
      .post('/v1/ops/offline-sync/sync-batches')
      .set(headers('field-agent'))
      .send(body);
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      code: 'TEAT.VALIDATION_FAILED',
      context: expect.objectContaining({
        fields: expect.arrayContaining([
          expect.objectContaining({ path: 'items' }),
        ]),
      }),
    });
    await expectNothingMaterialized(deviceBatchId, itemKey);
  });

  it('dado batch_sequence não inteiro então 400 TEAT.VALIDATION_FAILED com context.fields[] apontando batch_sequence, e nada materializado', async () => {
    const body = syncBatchBody();
    const deviceBatchId = body.device_batch_id as string;
    const itemKey = itemKeyOf(body);
    body.batch_sequence = 1.5;
    const response = await request(server())
      .post('/v1/ops/offline-sync/sync-batches')
      .set(headers('field-agent'))
      .send(body);
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      code: 'TEAT.VALIDATION_FAILED',
      context: expect.objectContaining({
        fields: expect.arrayContaining([
          expect.objectContaining({ path: 'batch_sequence' }),
        ]),
      }),
    });
    await expectNothingMaterialized(deviceBatchId, itemKey);
  });

  it('dado batch_sequence menor que 1 então 400 TEAT.VALIDATION_FAILED, e nada materializado', async () => {
    const body = syncBatchBody();
    const deviceBatchId = body.device_batch_id as string;
    const itemKey = itemKeyOf(body);
    body.batch_sequence = 0;
    const response = await request(server())
      .post('/v1/ops/offline-sync/sync-batches')
      .set(headers('field-agent'))
      .send(body);
    expect(response.status).toBe(400);
    expect(response.body.code).toBe('TEAT.VALIDATION_FAILED');
    await expectNothingMaterialized(deviceBatchId, itemKey);
  });

  it('dado device_batch_id ausente então 400 TEAT.VALIDATION_FAILED com context.fields[] apontando device_batch_id, e nada materializado', async () => {
    const body = syncBatchBody();
    const deviceBatchId = body.device_batch_id as string;
    const itemKey = itemKeyOf(body);
    delete body.device_batch_id;
    const response = await request(server())
      .post('/v1/ops/offline-sync/sync-batches')
      .set(headers('field-agent'))
      .send(body);
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      code: 'TEAT.VALIDATION_FAILED',
      context: expect.objectContaining({
        fields: expect.arrayContaining([
          expect.objectContaining({ path: 'device_batch_id' }),
        ]),
      }),
    });
    await expectNothingMaterialized(deviceBatchId, itemKey);
  });
});

describe('CTG-0002 §5.13 — resolução de conflito (C-0002-45/46)', () => {
  it('C-0002-45 — dado DETRAN_LOCAL_ROLES=field-supervisor quando resolve com manual_review então 200 e o conflito continua open', async () => {
    const response = await request(server())
      .post(
        `/v1/ops/offline-sync/sync-conflicts/${CONFLICT_CONCURRENCY}/resolve`,
      )
      .set(headers('field-supervisor'))
      .send({
        resolved_by_user_ref: ACTOR_ID,
        resolution_action: 'manual_review',
        description: 'Encaminhado à autoridade de trânsito para apuração',
      });
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: CONFLICT_CONCURRENCY,
      status: 'open',
      resolution_action: 'manual_review',
    });
    const row = await client.query<{ status: string }>(
      'select status from ops.sync_conflict where id = $1',
      [CONFLICT_CONCURRENCY],
    );
    expect(row.rows[0]?.status).toBe('open');
  });

  it('C-0002-46 — dado um conflito concurrency quando resolve com accept_server então 409 TEAT.SYNC_ITEM_CONFLICT com context.conflictType concurrency', async () => {
    const response = await request(server())
      .post(
        `/v1/ops/offline-sync/sync-conflicts/${CONFLICT_CONCURRENCY}/resolve`,
      )
      .set(headers('field-supervisor'))
      .send({
        resolved_by_user_ref: ACTOR_ID,
        resolution_action: 'accept_server',
      });
    expect(response.status).toBe(409);
    expect(response.body).toMatchObject({
      code: 'TEAT.SYNC_ITEM_CONFLICT',
      context: expect.objectContaining({ conflictType: 'concurrency' }),
    });
  });

  it('§5.13 — dado DETRAN_LOCAL_ROLES=field-agent quando resolve então 403 (a resolução é do supervisor/operador)', async () => {
    const response = await request(server())
      .post(
        `/v1/ops/offline-sync/sync-conflicts/${CONFLICT_CONCURRENCY}/resolve`,
      )
      .set(headers('field-agent'))
      .send({
        resolved_by_user_ref: ACTOR_ID,
        resolution_action: 'manual_review',
      });
    expect(response.status).toBe(403);
  });
});

describe('CTG-0002 §5.7/§5.9 — postura de dispositivo e homologação (C-0002-47/48)', () => {
  it('C-0002-47 — dado DETRAN_LOCAL_ROLES=technical-admin quando POST /v1/ops/field/devices/{id}/block então 200', async () => {
    const response = await request(server())
      .post(`/v1/ops/field/devices/${DEVICE_TAMPERED}/block`)
      .set(headers('technical-admin'))
      .send({ reason: 'Indício de adulteração detectado pelo bootstrap' });
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: DEVICE_TAMPERED,
      status: 'blocked',
    });
  });

  it('C-0002-47 — dado DETRAN_LOCAL_ROLES=field-supervisor quando POST /v1/ops/field/devices/{id}/block então 403', async () => {
    const response = await request(server())
      .post(`/v1/ops/field/devices/${DEVICE_TAMPERED}/block`)
      .set(headers('field-supervisor'))
      .send({ reason: 'Indício de adulteração detectado pelo bootstrap' });
    expect(response.status).toBe(403);
  });

  it('C-0002-48 — dado DETRAN_LOCAL_ROLES=agency-admin quando POST /v1/ops/field/homologations/{id}/renew então 200 com laudo_valido_ate quadrienal', async () => {
    const response = await request(server())
      .post(`/v1/ops/field/homologations/${HOMOLOGATION_EXPIRED_REPORT}/renew`)
      .set(headers('agency-admin'))
      .send({
        laudo_emitido_em: '2026-09-14',
        emissor_independente: 'Instituto Independente de Ensaios',
      });
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: HOMOLOGATION_EXPIRED_REPORT,
      status: 'active',
      laudo_emitido_em: '2026-09-14',
      laudo_valido_ate: '2030-09-14',
    });
  });

  it('C-0002-48 — dado DETRAN_LOCAL_ROLES=traffic-authority quando POST /v1/ops/field/homologations/{id}/renew então 403', async () => {
    const response = await request(server())
      .post(`/v1/ops/field/homologations/${HOMOLOGATION_EXPIRED_REPORT}/renew`)
      .set(headers('traffic-authority'))
      .send({
        laudo_emitido_em: '2026-09-14',
        emissor_independente: 'Instituto Independente de Ensaios',
      });
    expect(response.status).toBe(403);
  });

  it('§5.8 — dado DETRAN_LOCAL_ROLES=agency-admin quando POST /v1/ops/field/homologations/{id}/cancel-by-audit então 200 com status cancelled e cancelled_reason', async () => {
    const response = await request(server())
      .post(
        `/v1/ops/field/homologations/${HOMOLOGATION_ACTIVE}/cancel-by-audit`,
      )
      .set(headers('agency-admin'))
      .send({
        reason: 'Auditoria constatou desvio de escopo da homologação',
        audit_reference: 'AUD-2026-0001',
      });
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: HOMOLOGATION_ACTIVE,
      status: 'cancelled',
      cancelled_reason: 'Auditoria constatou desvio de escopo da homologação',
    });
  });

  it('§5.8 — dado DETRAN_LOCAL_ROLES=field-supervisor quando POST /v1/ops/field/homologations/{id}/cancel-by-audit então 403', async () => {
    const response = await request(server())
      .post(
        `/v1/ops/field/homologations/${HOMOLOGATION_ACTIVE}/cancel-by-audit`,
      )
      .set(headers('field-supervisor'))
      .send({ reason: 'Auditoria constatou desvio de escopo da homologação' });
    expect(response.status).toBe(403);
  });
});

describe('CTG-0002 §5.6 — handoff de sessão (C-0002-49)', () => {
  it('C-0002-49 — dado DETRAN_LOCAL_ROLES=processing-operator quando POST /v1/ops/mobile-bootstrap/sessions/handoff então 403', async () => {
    const response = await request(server())
      .post('/v1/ops/mobile-bootstrap/sessions/handoff')
      .set(headers('processing-operator'))
      .send({
        failed_device_id: DEVICE_AUTHORIZED,
        reason: 'Falha de bateria do coletor em campo',
      });
    expect(response.status).toBe(403);
  });

  it('C-0002-49 — dado DETRAN_LOCAL_ROLES=field-agent quando POST /v1/ops/mobile-bootstrap/sessions/handoff então 200 com handoff_id e cancelled_reservations', async () => {
    const response = await request(server())
      .post('/v1/ops/mobile-bootstrap/sessions/handoff')
      .set(headers('field-agent'))
      .send({
        failed_device_id: DEVICE_AUTHORIZED,
        reason: 'Falha de bateria do coletor em campo',
      });
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      shift_id: SHIFT_OPEN,
      failed_device_id: DEVICE_AUTHORIZED,
      cancelled_reservations: expect.arrayContaining([RESERVATION_RESERVED]),
    });
  });
});

describe('CTG-0002 §1 — fronteira de rota dos controladores manuscritos de ops (C-0002-50)', () => {
  /**
   * Enumera o roteador do Express montado pelo Nest. A forma da propriedade
   * mudou entre versões (`router` em Express 5, `_router` em Express 4), então
   * as duas são aceitas; se nenhuma estiver acessível, o caso cai na sonda HTTP
   * do teste seguinte, que já é suficiente para o critério.
   */
  function mountedPaths(): string[] {
    const instance = app.getHttpAdapter().getInstance() as {
      router?: { stack?: { route?: { path?: string } }[] };
      _router?: { stack?: { route?: { path?: string } }[] };
    };
    const stack = instance.router?.stack ?? instance._router?.stack ?? [];
    return stack
      .map((layer) => layer.route?.path)
      .filter((path): path is string => typeof path === 'string');
  }

  it('C-0002-50 — dado o app montado quando as rotas de ops são enumeradas então todas começam por /v1/ops/ (§1: os controladores manuscritos ainda montam em /ops)', () => {
    const offending = mountedPaths().filter(
      (path) => path.startsWith('/ops/') || path === '/ops',
    );
    expect(
      offending,
      `rotas manuscritas de ops fora de /v1/ops/ (§1; correção em TASK-0005 para ops/field e TASK-0007 para ops/evidence e ops/snapshots): ${offending.join(', ')}`,
    ).toEqual([]);
  });

  it('C-0002-50 — dado o app montado quando as rotas legadas /ops/... são consultadas então nenhuma responde (404)', async () => {
    for (const path of [
      '/ops/agents',
      '/ops/devices',
      '/ops/teams',
      '/ops/homologations',
      '/ops/app-versions',
      '/ops/evidence/evidence',
      '/ops/snapshots/people',
    ]) {
      const response = await request(server())
        .get(path)
        .set(headers('technical-admin'));
      expect(response.status, `${path} ainda responde fora de /v1/ops/`).toBe(
        404,
      );
    }
  });

  it('§1 — dado o app montado quando /v1/ops/field/agents é consultado então a rota manuscrita responde no prefixo correto', async () => {
    const response = await request(server())
      .get('/v1/ops/field/agents')
      .set(headers('technical-admin'));
    expect(response.status).toBe(200);
  });
});
