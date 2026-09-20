import 'reflect-metadata';
import { createHash, randomUUID } from 'node:crypto';
import http, { type IncomingMessage } from 'node:http';
import type { NestFactory } from '@nestjs/core';
import pg from 'pg';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

/**
 * CTG-0002 / TASK-0006 — REDs comportamentais para os comandos manuscritos
 * de BOAT. Cada caso sobe o AppModule e chama a rota HTTP contratada; não há
 * import dinâmico ou símbolo especulativo. Enquanto TASK-0007 não montar os
 * comandos, os 404 são falhas deliberadas destas asserções de comportamento.
 */

const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
const BOAT_AGENCY = '00000000-0000-7000-8000-0000e2000001';
const BOAT_DEVICE = '00000000-0000-7000-8000-0000e4000002';
const BOAT_DRAFT = '00000000-0000-7000-8000-0000a1000001';
const BOAT_REGISTERED = '00000000-0000-7000-8000-0000a1000003';
const BOAT_NOT_CLOSED = '00000000-0000-7000-8000-0000a1000005';
const BOAT_INTEGRATED_RECEIVED = '00000000-0000-7000-8000-0000a1000007';
const BOAT_TERMINAL_NATIONAL = '00000000-0000-7000-8000-0000a1000011';
const BOAT_RENAEST_SUBMISSION = '00000000-0000-7000-8000-0000a4000001';
const BOAT_PENDING_WITH_VICTIM = '00000000-0000-7000-8000-0000a1000004';
const { Client } = pg;
const TEST_DATABASE_URL =
  process.env.DETRAN_TEST_DATABASE_URL ??
  process.env.DATABASE_URL ??
  `postgresql://${process.env.DB_USER ?? 'postgres'}:${process.env.DB_PASSWORD ?? 'postgres'}@${process.env.DB_HOST ?? 'localhost'}:${process.env.DB_PORT ?? '5432'}/${process.env.DB_NAME ?? 'detran_r10'}`;
const client = new Client({ connectionString: TEST_DATABASE_URL });
const REPORT_BYTES = Buffer.from('%PDF-1.7\nfixture-e2e\n%%EOF');
const REPORT_HASH = createHash('sha256').update(REPORT_BYTES).digest('hex');

let app: Awaited<ReturnType<typeof NestFactory.create>>;
let idempotencySequence = 0;
let port = 0;
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
 * CTG-0002 §3 fixa a forma externa; os campos de `record` vêm da DTO e da
 * fixture BOAT, sem criar um DTO paralelo de sincronização antes de TASK-0008.
 */
function canonicalCrashPayload(
  localEntityId: string,
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  const { record: recordOverrides, ...shapeOverrides } = overrides;
  return {
    record:
      recordOverrides === null
        ? null
        : {
            traffic_agency_id: BOAT_AGENCY,
            crash_type: 'source_pending',
            severity: 'SEM_VITIMA',
            occurred_at: '2030-01-01T10:00:00-04:00',
            recorded_at: '2030-01-01T11:00:00-04:00',
            location_description: 'fixture BOAT sync',
            municipality_code: '1302603',
            uf: 'AM',
            road_condition: 'source_pending',
            weather_condition: 'source_pending',
            lighting_condition: 'source_pending',
            signage_condition: 'source_pending',
            source_local_id: localEntityId,
            ...(recordOverrides as Record<string, unknown> | undefined),
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
    ...shapeOverrides,
  };
}

function syncBatchBody(
  payload: Record<string, unknown>,
  overrides: Record<string, unknown> = {},
): { body: Record<string, unknown>; idempotencyKey: string } {
  const idempotencyKey = `boat-crash-sync-${randomUUID()}`;
  const localEntityId = String(overrides.local_entity_id ?? randomUUID());
  return {
    idempotencyKey,
    body: {
      traffic_agency_id: BOAT_AGENCY,
      device_id: BOAT_DEVICE,
      agent_id: ACTOR_ID,
      device_batch_id: `boat-crash-${randomUUID()}`,
      items: [
        {
          entity_type: 'crash-record',
          local_entity_id: localEntityId,
          idempotency_key: idempotencyKey,
          created_locally_at: '2026-09-14T13:05:00.000Z',
          payload_json: payload,
          payload_hash: canonicalHash(payload),
          ...overrides,
        },
      ],
    },
  };
}

async function cleanupSyncItem(
  idempotencyKey: string,
  localEntityId: string,
): Promise<void> {
  await client.query(
    `delete from integration.outbox
      where tenant_id = $1
        and (idempotency_key = $2 or payload->'data'->>'localEntityId' = $3
          or aggregate_id in (
            select id::text from est.crash_record
             where tenant_id = $1 and source_local_id = $3
          ))`,
    [TENANT_ID, idempotencyKey, localEntityId],
  );
  await client.query(
    `delete from ops.sync_receipt where tenant_id = $1 and idempotency_key = $2`,
    [TENANT_ID, idempotencyKey],
  );
  await client.query(
    `delete from ops.sync_queue_item where tenant_id = $1 and idempotency_key = $2`,
    [TENANT_ID, idempotencyKey],
  );
  await client.query(
    `delete from est.crash_link
      where crash_record_id in (
        select id from est.crash_record
         where tenant_id = $1 and source_local_id = $2
      )`,
    [TENANT_ID, localEntityId],
  );
  await client.query(
    `delete from est.crash_record where tenant_id = $1 and source_local_id = $2`,
    [TENANT_ID, localEntityId],
  );
}

function headers(
  role: string,
  extra: Record<string, string> = {},
): Record<string, string> {
  process.env.DETRAN_LOCAL_ROLES = role;
  idempotencySequence += 1;
  return {
    authorization: 'Bearer local',
    'x-tenant-id': TENANT_ID,
    'idempotency-key': `boat-crash-e2e-${idempotencySequence}`,
    ...extra,
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
  ]) {
    previousEnv[key] = process.env[key];
  }
  process.env.DETRAN_RUNTIME_PROFILE = 'test';
  process.env.DETRAN_LOCAL_TENANT_ID = TENANT_ID;
  process.env.DETRAN_LOCAL_ACTOR_ID = ACTOR_ID;
  process.env.DETRAN_LOCAL_ROLES = 'field-agent';
  process.env.DATABASE_URL = TEST_DATABASE_URL;
  process.env.STYNX_OWNER_DATABASE_URL = TEST_DATABASE_URL;
  process.env.STYNX_APP_DATABASE_URL = TEST_DATABASE_URL;
  process.env.STYNX_READER_DATABASE_URL = TEST_DATABASE_URL;

  await client.connect();
  await client.query(`select set_config('app.role', 'owner', false)`);
  const { Test } = await import('@nestjs/testing');
  const { DOCUMENTS_FACADE } = await import('@detran/shared');
  const { AppModule } = await import('../../src/app.module.js');
  const documents = new Map<string, Buffer>();
  const module = await Test.createTestingModule({
    imports: [AppModule.forRoot()],
  })
    .overrideProvider(DOCUMENTS_FACADE)
    .useValue({
      render: async () => {
        const documentId = randomUUID();
        documents.set(documentId, REPORT_BYTES);
        return {
          documentId,
          kind: 'RELATORIO_PRELIMINAR_SINISTRO',
          storageKey: `e2e/${documentId}.pdf`,
          contentHash: REPORT_HASH,
          pdfaConformance: 'PDF/A-2b',
          supersedesDocumentId: null,
        };
      },
      sign: async () => {
        throw new Error('Default D1 forbids signing');
      },
      seal: async (documentId: string) => ({
        documentId,
        kind: 'RELATORIO_PRELIMINAR_SINISTRO',
        storageKey: `e2e/${documentId}.pdf`,
        contentHash: REPORT_HASH,
        pdfaConformance: 'PDF/A-2b',
        supersedesDocumentId: null,
        signatureRef: null,
        sealedAt: '2026-09-20T00:00:00.000Z',
      }),
      read: async (documentId: string) => {
        const bytes = documents.get(documentId);
        if (!bytes) throw new Error('Document not found');
        return bytes;
      },
    })
    .compile();
  app = module.createNestApplication({ logger: false });
  await app.init();
  await app.listen(0);
  const address = app.getHttpServer().address();
  port = typeof address === 'object' && address ? address.port : 0;
}, 30000);

afterAll(async () => {
  await app?.close();
  await client.end();
  for (const [key, value] of Object.entries(previousEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

describe('CTG-0002 — comandos HTTP BOAT', () => {
  it('dado RASCUNHO e If-Match quando start é executado por field-agent então C-2-02 e C-2-03 avançam a versão, devolvem ETag e publicam SINISTRO_INICIADO', async () => {
    const before = await client.query<{ count: string }>(
      `select count(*)::text as count
         from integration.outbox
        where tenant_id = $1 and topic = 'SINISTRO_INICIADO'`,
      [TENANT_ID],
    );
    try {
      const response = await request(app.getHttpServer())
        .post(`/v1/est/crash/records/${BOAT_DRAFT}/start`)
        .set(headers('field-agent', { 'if-match': '1' }))
        .send({});
      expect(response.status, JSON.stringify(response.body)).toBe(200);
      expect(response.body).toMatchObject({
        id: BOAT_DRAFT,
        state: 'EM_ATENDIMENTO',
        version: 2,
      });
      expect(response.headers.etag).toBe('"2"');
      const after = await client.query<{ count: string }>(
        `select count(*)::text as count
           from integration.outbox
          where tenant_id = $1 and topic = 'SINISTRO_INICIADO'`,
        [TENANT_ID],
      );
      expect(Number(after.rows[0]?.count)).toBe(
        Number(before.rows[0]?.count) + 1,
      );
    } finally {
      await client.query(
        `update est.crash_record
            set state = 'RASCUNHO', version = 1
          where id = $1`,
        [BOAT_DRAFT],
      );
    }
  });

  it('dado RASCUNHO sem If-Match quando start é executado então C-2-03 recusa BOAT.IF_MATCH_REQUIRED', async () => {
    const response = await request(app.getHttpServer())
      .post(`/v1/est/crash/records/${BOAT_DRAFT}/start`)
      .set(headers('field-agent'))
      .send({});
    expect(response.status, JSON.stringify(response.body)).toBe(428);
    expect(response.body.code).toBe('BOAT.IF_MATCH_REQUIRED');
  });

  it('dado RASCUNHO com versão divergente quando start é executado então C-2-03 recusa BOAT.VERSION_CONFLICT', async () => {
    const response = await request(app.getHttpServer())
      .post(`/v1/est/crash/records/${BOAT_DRAFT}/start`)
      .set(headers('field-agent', { 'if-match': '2' }))
      .send({});
    expect(response.status, JSON.stringify(response.body)).toBe(412);
    expect(response.body.code).toBe('BOAT.VERSION_CONFLICT');
  });

  it('dado REGISTRADO quando start é executado então C-2-02 recusa BOAT.CRASH_STATE_INVALID', async () => {
    const response = await request(app.getHttpServer())
      .post(`/v1/est/crash/records/${BOAT_REGISTERED}/start`)
      .set(headers('field-agent', { 'if-match': '1' }))
      .send({});
    expect(response.status, JSON.stringify(response.body)).toBe(409);
    expect(response.body.code).toBe('BOAT.CRASH_STATE_INVALID');
  });

  it('dado papel sem permissão quando start é executado então C-2-02 recusa com 403', async () => {
    const response = await request(app.getHttpServer())
      .post(`/v1/est/crash/records/${BOAT_DRAFT}/start`)
      .set(headers('processing-operator', { 'if-match': '1' }))
      .send({});
    expect(response.status, JSON.stringify(response.body)).toBe(403);
  });

  it('dado VALIDADO quando transmit é executado então C-2-04 recusa BOAT.TRANSMIT_NOT_CLOSED e não cria outbox', async () => {
    const before = await client.query<{ count: string }>(
      `select count(*)::text as count
         from integration.outbox
        where tenant_id = $1 and aggregate_id = $2`,
      [TENANT_ID, BOAT_NOT_CLOSED],
    );
    const response = await request(app.getHttpServer())
      .post(`/v1/est/crash/records/${BOAT_NOT_CLOSED}/transmit`)
      .set(headers('traffic-authority', { 'if-match': '1' }))
      .send({});
    expect(response.status, JSON.stringify(response.body)).toBe(409);
    expect(response.body.code).toBe('BOAT.TRANSMIT_NOT_CLOSED');
    const after = await client.query<{ count: string }>(
      `select count(*)::text as count
         from integration.outbox
        where tenant_id = $1 and aggregate_id = $2`,
      [TENANT_ID, BOAT_NOT_CLOSED],
    );
    expect(after.rows[0]?.count).toBe(before.rows[0]?.count);
  });

  it('dado espelho REJEITADO quando correct é executado então C-2-07 recusa BOAT.RECTIFY_TERMINAL', async () => {
    const response = await request(app.getHttpServer())
      .post(`/v1/est/crash/records/${BOAT_TERMINAL_NATIONAL}/renaest/correct`)
      .set(headers('processing-operator', { 'if-match': '1' }))
      .send({
        reason: 'retificação impossível para espelho terminal',
        changes: {},
      });
    expect(response.status, JSON.stringify(response.body)).toBe(409);
    expect(response.body.code).toBe('BOAT.RECTIFY_TERMINAL');
  });

  it('dado INTEGRADO sem motivo quando correct é executado então C-2-07 recusa BOAT.RECTIFY_REASON_REQUIRED', async () => {
    const response = await request(app.getHttpServer())
      .post(
        '/v1/est/crash/records/00000000-0000-7000-8000-0000a1000010/renaest/correct',
      )
      .set(headers('processing-operator', { 'if-match': '1' }))
      .send({ changes: {} });
    expect(response.status, JSON.stringify(response.body)).toBe(422);
    expect(response.body.code).toBe('BOAT.RECTIFY_REASON_REQUIRED');
  });

  it('dado recibo RENAEST RECEBIDO quando o espelho é lido então C-2-05 expõe o protocolo e preserva INTEGRADO local', async () => {
    const response = await request(app.getHttpServer())
      .get(`/v1/est/crash/records/${BOAT_INTEGRATED_RECEIVED}/renaest`)
      .set(headers('processing-operator'));
    expect(response.status, JSON.stringify(response.body)).toBe(200);
    const mirror = JSON.stringify(response.body);
    expect(mirror).toContain('INTEGRADO');
    expect(mirror).toContain('RECEBIDO');
    expect(mirror).toContain('R10-RENAEST-INITIAL-0001');
    expect(mirror).not.toMatch(/health_notes|hospital_destination/);
  });

  it('dado T-BOAT-TRANSM quando a configuração operacional é consultada então C-2-08 mantém somente a periodicidade monthly e não fixa layout nacional', async () => {
    const timer = await client.query<{
      parameter_key: string;
      default_period: string;
      owner: string;
      decision_ref: string;
    }>(
      `select parameter_key, default_period, owner, decision_ref
         from est.crash_timer_ref
        where code = 'T-BOAT-TRANSM' and trigger_state = 'FECHADO'
          and status = 'vigente'`,
    );
    expect(timer.rows).toEqual([
      {
        parameter_key: 'est.renaest.transmit_period',
        default_period: 'monthly',
        owner: 'sinistro',
        decision_ref: 'OD-B04/DT-017',
      },
    ]);
  });

  it('dado RASCUNHO sem vítima quando conduta art176 é registrada então C-2-02 recusa BOAT.DUTY_REGIME_MISMATCH', async () => {
    const response = await request(app.getHttpServer())
      .post(`/v1/est/crash/records/${BOAT_DRAFT}/scene-duties`)
      .set(headers('field-agent', { 'if-match': '1' }))
      .send({ regime: 'art176', duty_code: '176_I', complied: true });
    expect(response.status, JSON.stringify(response.body)).toBe(422);
    expect(response.body.code).toBe('BOAT.DUTY_REGIME_MISMATCH');
  });

  it('dado PENDENTE_COMPLEMENTO com vítima quando conduta art178 é registrada então C-2-02 recusa BOAT.DUTY_REGIME_MISMATCH', async () => {
    const response = await request(app.getHttpServer())
      .post(`/v1/est/crash/records/${BOAT_PENDING_WITH_VICTIM}/scene-duties`)
      .set(headers('field-agent', { 'if-match': '1' }))
      .send({ regime: 'art178', duty_code: '178', complied: true });
    expect(response.status, JSON.stringify(response.body)).toBe(422);
    expect(response.body.code).toBe('BOAT.DUTY_REGIME_MISMATCH');
  });

  it('dado registro BOAT quando o relatório é solicitado então C-2-13 entrega PDF/A pela rota contratada', async () => {
    const response = await request(app.getHttpServer())
      .get(`/v1/est/crash/records/${BOAT_REGISTERED}/report`)
      .set(headers('field-agent'));
    expect(response.status, JSON.stringify(response.body)).toBe(200);
    expect(response.headers['content-type']).toContain('application/pdf');
    expect(response.body.subarray(0, 4).toString('utf8')).toBe('%PDF');
    expect(response.headers.etag).toMatch(/^"sha256:[a-f0-9]{64}"$/u);
    expect(response.headers['content-disposition']).toContain(
      'relatorio-preliminar-sinistro.pdf',
    );
  });

  it('dada a rota do relatório quando cada papel canônico tenta acessar então só a matriz contratada e o admin global passam', async () => {
    const { DETRAN_ROLES } = await import('@detran/shared');
    const granted = new Set([
      'field-agent',
      'processing-operator',
      'traffic-authority',
      // Administradores globais vinculantes de policy.ts.
      'ADMIN',
      'GESTOR_DETRAN',
      'SUPORTE',
      'technical-admin',
    ]);
    for (const role of DETRAN_ROLES) {
      const response = await request(app.getHttpServer())
        .get(`/v1/est/crash/records/${BOAT_REGISTERED}/report`)
        .set(headers(role));
      expect(response.status, `${role}: ${JSON.stringify(response.body)}`).toBe(
        granted.has(role) ? 200 : 403,
      );
    }
  });

  it('dado tenant divergente quando pede relatório então falha fechado antes da fachada', async () => {
    const otherTenant = '00000000-0000-7000-8000-00000000a002';
    process.env.DETRAN_LOCAL_TENANT_ID = otherTenant;
    try {
      const response = await request(app.getHttpServer())
        .get(`/v1/est/crash/records/${BOAT_REGISTERED}/report`)
        .set(headers('field-agent', { 'x-tenant-id': otherTenant }));
      expect(response.status).toBe(403);
      expect(response.body).toEqual({
        message: 'Principal is not entitled for tenant context',
        error: 'Forbidden',
        statusCode: 403,
      });
    } finally {
      process.env.DETRAN_LOCAL_TENANT_ID = TENANT_ID;
    }
  });

  it('dado crash-record canônico quando sincronizado então C-2-09 aplica recibo, fila, agregado e outbox na mesma transação', async () => {
    const localEntityId = randomUUID();
    const { body, idempotencyKey } = syncBatchBody(
      canonicalCrashPayload(localEntityId),
      { local_entity_id: localEntityId },
    );
    try {
      const response = await request(app.getHttpServer())
        .post('/v1/ops/offline-sync/sync-batches')
        .set(headers('field-agent'))
        .send(body);
      expect(response.status, JSON.stringify(response.body)).toBe(200);
      expect(response.body.receipts[0]).toMatchObject({
        status: 'applied',
        error_code: null,
        server_entity_id: expect.any(String),
      });

      const serverEntityId = response.body.receipts[0]?.server_entity_id;
      const [queue, receipt, aggregate, outbox] = await Promise.all([
        client.query<{ status: string; server_entity_id: string | null }>(
          `select status, server_entity_id from ops.sync_queue_item
            where tenant_id = $1 and idempotency_key = $2`,
          [TENANT_ID, idempotencyKey],
        ),
        client.query<{ status: string; server_entity_id: string | null }>(
          `select status, server_entity_id from ops.sync_receipt
            where tenant_id = $1 and idempotency_key = $2`,
          [TENANT_ID, idempotencyKey],
        ),
        client.query<{ id: string }>(
          `select id from est.crash_record
            where tenant_id = $1 and id = $2 and source_local_id = $3`,
          [TENANT_ID, serverEntityId, localEntityId],
        ),
        client.query<{ count: string }>(
          `select count(*)::text as count from integration.outbox
            where tenant_id = $1 and aggregate_id = $2`,
          [TENANT_ID, serverEntityId],
        ),
      ]);
      expect(queue.rows[0]).toMatchObject({
        status: 'applied',
        server_entity_id: serverEntityId,
      });
      expect(receipt.rows[0]).toMatchObject({
        status: 'applied',
        server_entity_id: serverEntityId,
      });
      expect(aggregate.rows).toHaveLength(1);
      expect(Number(outbox.rows[0]?.count ?? 0)).toBeGreaterThan(0);
    } finally {
      await cleanupSyncItem(idempotencyKey, localEntityId);
    }
  });

  it('dado payload canônico sem record quando sincronizado então C-2-09 reverte o agregado e C-2-11 registra BOAT.SYNC_INVALID_CRASH_RECORD', async () => {
    const localEntityId = randomUUID();
    const { body, idempotencyKey } = syncBatchBody(
      canonicalCrashPayload(localEntityId, { record: null }),
      { local_entity_id: localEntityId },
    );
    try {
      const response = await request(app.getHttpServer())
        .post('/v1/ops/offline-sync/sync-batches')
        .set(headers('field-agent'))
        .send(body);
      expect(response.status, JSON.stringify(response.body)).toBe(200);
      expect(response.body.receipts[0]).toMatchObject({
        status: 'rejected',
        error_code: 'BOAT.SYNC_INVALID_CRASH_RECORD',
        server_entity_id: null,
      });
      const [queue, receipt, aggregate] = await Promise.all([
        client.query<{ status: string; error_code: string | null }>(
          `select status, error_code from ops.sync_queue_item
            where tenant_id = $1 and idempotency_key = $2`,
          [TENANT_ID, idempotencyKey],
        ),
        client.query<{ status: string; reason_code: string | null }>(
          `select status, reason_code from ops.sync_receipt
            where tenant_id = $1 and idempotency_key = $2`,
          [TENANT_ID, idempotencyKey],
        ),
        client.query<{ count: string }>(
          `select count(*)::text as count from est.crash_record
            where tenant_id = $1 and source_local_id = $2`,
          [TENANT_ID, localEntityId],
        ),
      ]);
      expect(queue.rows[0]).toMatchObject({
        status: 'rejected',
        error_code: 'BOAT.SYNC_INVALID_CRASH_RECORD',
      });
      expect(receipt.rows[0]).toMatchObject({
        status: 'rejected',
        reason_code: 'BOAT.SYNC_INVALID_CRASH_RECORD',
      });
      expect(Number(aggregate.rows[0]?.count ?? 0)).toBe(0);
    } finally {
      await cleanupSyncItem(idempotencyKey, localEntityId);
    }
  });

  it('dada gravidade SEM_VITIMA com vítima no item quando sincronizado então C-2-11 rejeita BOAT.SYNC_VICTIMS_INCONSISTENT sem efeito parcial', async () => {
    const localEntityId = randomUUID();
    const { body, idempotencyKey } = syncBatchBody(
      canonicalCrashPayload(localEntityId, {
        victims: [{ severity: 'COM_VITIMA_FERIDA' }],
      }),
      { local_entity_id: localEntityId },
    );
    try {
      const response = await request(app.getHttpServer())
        .post('/v1/ops/offline-sync/sync-batches')
        .set(headers('field-agent'))
        .send(body);
      expect(response.status, JSON.stringify(response.body)).toBe(200);
      expect(response.body.receipts[0]).toMatchObject({
        status: 'rejected',
        error_code: 'BOAT.SYNC_VICTIMS_INCONSISTENT',
      });
      const [queue, aggregate] = await Promise.all([
        client.query<{ status: string; error_code: string | null }>(
          `select status, error_code from ops.sync_queue_item
            where tenant_id = $1 and idempotency_key = $2`,
          [TENANT_ID, idempotencyKey],
        ),
        client.query<{ count: string }>(
          `select count(*)::text as count from est.crash_record
            where tenant_id = $1 and source_local_id = $2`,
          [TENANT_ID, localEntityId],
        ),
      ]);
      expect(queue.rows[0]).toMatchObject({
        status: 'rejected',
        error_code: 'BOAT.SYNC_VICTIMS_INCONSISTENT',
      });
      expect(Number(aggregate.rows[0]?.count ?? 0)).toBe(0);
    } finally {
      await cleanupSyncItem(idempotencyKey, localEntityId);
    }
  });

  it('dada evidência local ainda pendente quando sincronizada então C-2-11 aplica o item com BOAT.SYNC_EVIDENCE_PENDING', async () => {
    const localEntityId = randomUUID();
    const { body, idempotencyKey } = syncBatchBody(
      canonicalCrashPayload(localEntityId, {
        // `local_evidence_id` da fixture pending_upload em 27-fixtures-teat-evidence.sql.
        evidenceLocalIds: ['00000000-0000-7000-8000-0000ef100011'],
      }),
      { local_entity_id: localEntityId },
    );
    try {
      const response = await request(app.getHttpServer())
        .post('/v1/ops/offline-sync/sync-batches')
        .set(headers('field-agent'))
        .send(body);
      expect(response.status, JSON.stringify(response.body)).toBe(200);
      expect(response.body.receipts[0]).toMatchObject({
        status: 'applied',
        server_entity_id: expect.any(String),
      });
      expect(JSON.stringify(response.body)).toContain(
        'BOAT.SYNC_EVIDENCE_PENDING',
      );
      const queue = await client.query<{
        status: string;
        server_entity_id: string | null;
      }>(
        `select status, server_entity_id from ops.sync_queue_item
          where tenant_id = $1 and idempotency_key = $2`,
        [TENANT_ID, idempotencyKey],
      );
      expect(queue.rows[0]).toMatchObject({ status: 'applied' });
      expect(queue.rows[0]?.server_entity_id).not.toBeNull();
    } finally {
      await cleanupSyncItem(idempotencyKey, localEntityId);
    }
  });

  it('dado vínculo AIT ausente quando sincronizado então C-2-10 aplica o item e devolve BOAT.SYNC_LINK_UNRESOLVED como aviso', async () => {
    const localEntityId = randomUUID();
    const { body, idempotencyKey } = syncBatchBody(
      canonicalCrashPayload(localEntityId, {
        links: [{ kind: 'ait', target_id: randomUUID() }],
      }),
      { local_entity_id: localEntityId },
    );
    try {
      const response = await request(app.getHttpServer())
        .post('/v1/ops/offline-sync/sync-batches')
        .set(headers('field-agent'))
        .send(body);
      expect(response.status, JSON.stringify(response.body)).toBe(200);
      expect(response.body.receipts[0]).toMatchObject({
        status: 'applied',
        server_entity_id: expect.any(String),
      });
      expect(JSON.stringify(response.body)).toContain(
        'BOAT.SYNC_LINK_UNRESOLVED',
      );
      const [queue, aggregate] = await Promise.all([
        client.query<{ status: string; server_entity_id: string | null }>(
          `select status, server_entity_id from ops.sync_queue_item
            where tenant_id = $1 and idempotency_key = $2`,
          [TENANT_ID, idempotencyKey],
        ),
        client.query<{ count: string }>(
          `select count(*)::text as count from est.crash_record
            where tenant_id = $1 and source_local_id = $2`,
          [TENANT_ID, localEntityId],
        ),
      ]);
      expect(queue.rows[0]).toMatchObject({ status: 'applied' });
      expect(queue.rows[0]?.server_entity_id).not.toBeNull();
      expect(Number(aggregate.rows[0]?.count ?? 0)).toBe(1);
    } finally {
      await cleanupSyncItem(idempotencyKey, localEntityId);
    }
  });

  it('dada chave natural já materializada por outro item quando sincronizada então C-2-11 conserva o primeiro agregado e devolve conflito BOAT.SYNC_DUPLICATE_NATURAL_KEY', async () => {
    const firstLocalEntityId = randomUUID();
    const secondLocalEntityId = randomUUID();
    const naturalKey = {
      occurred_at: '2030-01-02T10:00:00-04:00',
      recorded_at: '2030-01-02T11:00:00-04:00',
    };
    const first = syncBatchBody(
      canonicalCrashPayload(firstLocalEntityId, { record: naturalKey }),
      { local_entity_id: firstLocalEntityId },
    );
    const second = syncBatchBody(
      canonicalCrashPayload(secondLocalEntityId, { record: naturalKey }),
      { local_entity_id: secondLocalEntityId },
    );
    try {
      const firstResponse = await request(app.getHttpServer())
        .post('/v1/ops/offline-sync/sync-batches')
        .set(headers('field-agent'))
        .send(first.body);
      expect(firstResponse.status, JSON.stringify(firstResponse.body)).toBe(
        200,
      );
      expect(firstResponse.body.receipts[0]).toMatchObject({
        status: 'applied',
        server_entity_id: expect.any(String),
      });

      const secondResponse = await request(app.getHttpServer())
        .post('/v1/ops/offline-sync/sync-batches')
        .set(headers('field-agent'))
        .send(second.body);
      expect(secondResponse.status, JSON.stringify(secondResponse.body)).toBe(
        200,
      );
      expect(secondResponse.body.receipts[0]).toMatchObject({
        status: 'conflict',
        error_code: 'BOAT.SYNC_DUPLICATE_NATURAL_KEY',
        server_entity_id: null,
      });
      const [firstAggregate, secondQueue] = await Promise.all([
        client.query<{ count: string }>(
          `select count(*)::text as count from est.crash_record
            where tenant_id = $1 and source_local_id = $2`,
          [TENANT_ID, firstLocalEntityId],
        ),
        client.query<{ status: string; error_code: string | null }>(
          `select status, error_code from ops.sync_queue_item
            where tenant_id = $1 and idempotency_key = $2`,
          [TENANT_ID, second.idempotencyKey],
        ),
      ]);
      expect(Number(firstAggregate.rows[0]?.count ?? 0)).toBe(1);
      expect(secondQueue.rows[0]).toMatchObject({
        status: 'conflict',
        error_code: 'BOAT.SYNC_DUPLICATE_NATURAL_KEY',
      });
    } finally {
      await cleanupSyncItem(first.idempotencyKey, firstLocalEntityId);
      await cleanupSyncItem(second.idempotencyKey, secondLocalEntityId);
    }
  });

  it('dado SINISTRO_FECHADO na outbox quando o SSE é consumido então C-2-14 publica crash.changed sem dado de saúde', async () => {
    const outboxId = randomUUID();
    await client.query(
      `insert into integration.outbox
         (id, tenant_id, topic, aggregate_type, aggregate_id, payload,
          idempotency_key, status, created_at, available_at)
       values ($1, $2, 'crash.changed', 'crash-record', $3, $4::jsonb,
               $5, 'pending', now() + interval '1 second', now())`,
      [
        outboxId,
        TENANT_ID,
        BOAT_REGISTERED,
        JSON.stringify({
          type: 'crash.changed',
          domainEvent: 'SINISTRO_FECHADO',
          aggregate: {
            kind: 'crash-record',
            id: BOAT_REGISTERED,
            version: 1,
          },
          data: { state: 'FECHADO' },
        }),
        `boat-crash-sse-${outboxId}`,
      ],
    );
    try {
      const stream = await new Promise<{
        status: number;
        body: string;
      }>((resolve, reject) => {
        const req = http.get(
          {
            host: '127.0.0.1',
            port,
            path: '/v1/ops/stream',
            headers: headers('field-agent', {
              accept: 'text/event-stream',
            }),
          },
          (response: IncomingMessage) => {
            let body = '';
            const timer = setTimeout(() => {
              req.destroy();
              resolve({ status: response.statusCode ?? 0, body });
            }, 1500);
            response.on('data', (chunk: Buffer) => {
              body += chunk.toString('utf8');
              if (body.includes('event: crash.changed')) {
                clearTimeout(timer);
                req.destroy();
                resolve({ status: response.statusCode ?? 0, body });
              }
            });
            response.on('error', reject);
          },
        );
        req.on('error', (error) => {
          if ((error as NodeJS.ErrnoException).code !== 'ECONNRESET')
            reject(error);
        });
      });
      expect(stream.status).toBe(200);
      expect(stream.body).toContain('event: crash.changed');
      expect(stream.body).toContain('"state":"FECHADO"');
      expect(stream.body).not.toContain(TENANT_ID);
      expect(stream.body).not.toMatch(/health_notes|hospital_destination/);
    } finally {
      await client.query(`delete from integration.outbox where id = $1`, [
        outboxId,
      ]);
    }
  });

  it('dado atualização RENAEST na outbox quando o SSE é consumido então C-2-14 publica crash.renaest.changed sem expor dado de saúde', async () => {
    const outboxId = randomUUID();
    await client.query(
      `insert into integration.outbox
         (id, tenant_id, topic, aggregate_type, aggregate_id, payload,
          idempotency_key, status, created_at, available_at)
       values ($1, $2, 'crash.renaest.changed', 'crash-renaest-submission', $3,
               $4::jsonb, $5, 'pending', now() + interval '1 second', now())`,
      [
        outboxId,
        TENANT_ID,
        BOAT_RENAEST_SUBMISSION,
        JSON.stringify({
          type: 'crash.renaest.changed',
          domainEvent: 'SINISTRO_SITUACAO_NACIONAL',
          aggregate: {
            kind: 'crash-renaest-submission',
            id: BOAT_RENAEST_SUBMISSION,
            version: 1,
          },
          data: {
            crashRecordId: BOAT_INTEGRATED_RECEIVED,
            nationalStatus: 'RECEBIDO',
            protocol: 'R10-RENAEST-INITIAL-0001',
          },
        }),
        `boat-renaest-sse-${outboxId}`,
      ],
    );
    try {
      const stream = await new Promise<{ status: number; body: string }>(
        (resolve, reject) => {
          const req = http.get(
            {
              host: '127.0.0.1',
              port,
              path: '/v1/ops/stream',
              headers: headers('processing-operator', {
                accept: 'text/event-stream',
              }),
            },
            (response: IncomingMessage) => {
              let body = '';
              const timer = setTimeout(() => {
                req.destroy();
                resolve({ status: response.statusCode ?? 0, body });
              }, 1500);
              response.on('data', (chunk: Buffer) => {
                body += chunk.toString('utf8');
                if (body.includes('event: crash.renaest.changed')) {
                  clearTimeout(timer);
                  req.destroy();
                  resolve({ status: response.statusCode ?? 0, body });
                }
              });
              response.on('error', reject);
            },
          );
          req.on('error', (error) => {
            if ((error as NodeJS.ErrnoException).code !== 'ECONNRESET')
              reject(error);
          });
        },
      );
      expect(stream.status).toBe(200);
      expect(stream.body).toContain('event: crash.renaest.changed');
      expect(stream.body).toContain('"nationalStatus":"RECEBIDO"');
      expect(stream.body).toContain('R10-RENAEST-INITIAL-0001');
      expect(stream.body).not.toContain(TENANT_ID);
      expect(stream.body).not.toMatch(/health_notes|hospital_destination/);
    } finally {
      await client.query(`delete from integration.outbox where id = $1`, [
        outboxId,
      ]);
    }
  });
});
