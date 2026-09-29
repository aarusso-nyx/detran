import 'reflect-metadata';
import { createHash, randomUUID } from 'node:crypto';
import http, { type ClientRequest, type IncomingMessage } from 'node:http';
import type { INestApplication } from '@nestjs/common';
import pg from 'pg';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

/**
 * R-0022 CTG-0009 §4 (TASK-0017) — caracterização HTTP do offline-sync sobre
 * STYNX 1.4.0, arquivo fixo **E**. Todo caso vale antes e depois da migração
 * (TASK-0018): observa só rotas, status, envelopes, códigos e o SSE público do
 * TEAT, nunca o nome de tabela do armazenamento. Setup de R-0021 CTG-0001 §3
 * (env antes do `import()` dinâmico, `AppModule.forRoot()`, `supertest`) com o
 * _applier_ real da composição, envolto só para C-09-21 (sobrescrita de
 * `SYNC_ENTITY_APPLIERS`, P-API do CTG-0009 §8).
 *
 * Isolamento: tenant canônico `…a001` e as _fixtures_ canônicas que o harness
 * de offline cita (agência `…e2000001`, turno `…e3000001`, enquadramento,
 * catálogo, conflito `…eb100001`); cada caso usa dispositivos, chaves, lotes,
 * séries de faixa e blocos de numeração próprios (`RUN`). Faixas nascem pela
 * rota CRUD gerada `POST /v1/ops/offline-sync/numbering-ranges` (regra 5). O
 * _owner_ só grava linhas de parâmetro de escopo de agência em `ops.parameter`
 * e limpa.
 */

const { Client } = pg;

/** Tenant, persona e _fixtures_ canônicas (00/25/26-fixtures-*.sql). */
const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
const AGENCY_ID = '00000000-0000-7000-8000-0000e2000001';
const SHIFT_OPEN = '00000000-0000-7000-8000-0000e3000001';
const FRAMING_ID = '00000000-0000-7000-8000-0000e1000001';
const CATALOG_ID = '00000000-0000-7000-8000-0000e0000001';
const CONFLICT_CONCURRENCY = '00000000-0000-7000-8000-0000eb100001';
/** `handed_off_at` do _handoff_ canônico `…e3100001` (26-fixtures-teat-field.sql). */
const CANONICAL_HANDOFF_AT = Date.parse('2026-09-14T16:00:00.000Z');
/** `local_evidence_id` da _fixture_ `pending_upload` (27-fixtures-teat-evidence.sql). */
const EVIDENCE_PENDING_LOCAL_ID = '00000000-0000-7000-8000-0000ef100011';

/** Os seis `type` de #14 (`events.ts`), montados como no produtor. */
const OFFLINE_EVENT_TYPES = [
  'sync' + '.batch.received',
  'sync' + '.conflict.opened',
  'sync' + '.conflict.resolved',
  'numbering.reservation.changed',
  'ait.changed',
  'ait.concurrency-suspected',
] as const;
const [
  SYNC_BATCH_RECEIVED,
  SYNC_CONFLICT_OPENED,
  SYNC_CONFLICT_RESOLVED,
  NUMBERING_CHANGED,
  AIT_CHANGED,
  AIT_CONCURRENCY_SUSPECTED,
] = OFFLINE_EVENT_TYPES;

/**
 * CTG-0009 §4 regra 4 — lista fechada do armazenamento das duas fases, com
 * guarda `to_regclass`. **E** só a usa na limpeza do _owner_.
 */
const OFFLINE_SYNC_STORAGE = [
  'ops.ait_numbering_range',
  'ops.numbering_reservation',
  'ops.numbering_consumption',
  'ops.sync_batch',
  'ops.sync_queue_item',
  'ops.sync_receipt',
  'ops.sync_conflict',
  'offline.numbering_ranges',
  'offline.numbering_reservations',
  'offline.numbering_consumption',
  'offline.sync_batches',
  'offline.sync_batch_transport_keys',
  'offline.sync_item_receipts',
  'offline.sync_item_attempts',
  'offline.sync_queue_items',
  'offline.sync_conflicts',
  'offline.sync_conflict_evidence',
] as const;

const connectionString = process.env.DETRAN_TEST_DATABASE_URL;
if (!connectionString)
  throw new Error('DETRAN_TEST_DATABASE_URL is required for R-0022 e2e');

const client = new Client({ connectionString });
const RUN = `r22-ofs-${randomUUID().slice(0, 8)}`;
const RUN_SERIES = `R22${randomUUID().slice(0, 6).toUpperCase()}`;
/** Bloco de numeração do arquivo: nenhum AIT repete número entre execuções. */
const RUN_BASE = 3_400_000_000 + Math.floor(Math.random() * 500_000) * 1000;
/**
 * Fatias de tempo dos atos AIT, 30 min umas das outras e em minuto cheio: o
 * item legado que um caso deixa `received` nunca cai na janela de concorrência
 * de outro caso, e os limites da janela não dependem da precisão de leitura.
 */
const SLOT_ORIGIN = Math.ceil((Date.now() + 120_000) / 60_000) * 60_000;
const SLOT_MS = 30 * 60_000;

let app: INestApplication;
let port = 0;
let startedAt = '';
let rangeCounter = 0;
const previousEnv: Record<string, string | undefined> = {};
const parameterRowIds: string[] = [];
const aitIds = new Set<string>();
const crashLocalIds = new Set<string>();
/** `local_entity_id` dos itens cujo _applier_ falha depois do efeito (C-09-21). */
const failAfterApply = new Set<string>();

type Body = Record<string, unknown>;
type Row = Record<string, unknown>;

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

function iso(ms: number): string {
  return new Date(ms).toISOString();
}

function slot(index: number): number {
  return SLOT_ORIGIN + index * SLOT_MS;
}

function headers(role: string): Record<string, string> {
  process.env.DETRAN_LOCAL_ROLES = role;
  return {
    authorization: 'Bearer local',
    'x-tenant-id': TENANT_ID,
    'idempotency-key': `${RUN}-${randomUUID()}`,
  };
}

function server() {
  return app.getHttpServer();
}

function key(label: string): string {
  return `${RUN}-${label}-${randomUUID().slice(0, 8)}`;
}

// ---------------------------------------------------------------- payloads

/** Campos do AIT canônico `…f8000060`; número de uma reserva deste arquivo. */
function aitPayload(input: {
  number: number;
  deviceId: string;
  at: number;
}): Body {
  const ait: Body = {
    traffic_agency_id: AGENCY_ID,
    ait_number: String(input.number),
    agent_id: ACTOR_ID,
    shift_id: SHIFT_OPEN,
    device_id: input.deviceId,
    framing_id: FRAMING_ID,
    catalog_id: CATALOG_ID,
    infraction_at: iso(input.at - 30_000),
    issued_at: iso(input.at),
    issuance_mode: 'eletronico',
    constatation_type: 'abordagem',
    location_description: `${RUN} fixture AIT`,
    uf: 'AM',
  };
  return { ait: { ...ait, content_hash: canonicalHash(ait) } };
}

/** Forma canônica de `boat-crash-commands.e2e.spec.ts`, chave natural própria. */
function crashPayload(localEntityId: string, overrides: Body = {}): Body {
  const { record: recordOverrides, ...shapeOverrides } = overrides;
  const minute = Math.floor(Math.random() * 500_000) * 60_000;
  return {
    record:
      recordOverrides === null
        ? null
        : {
            traffic_agency_id: AGENCY_ID,
            crash_type: 'source_pending',
            severity: 'SEM_VITIMA',
            occurred_at: iso(Date.parse('2032-01-01T10:00:00Z') + minute),
            recorded_at: iso(Date.parse('2032-01-01T11:00:00Z') + minute),
            location_description: `${RUN} fixture BOAT`,
            municipality_code: '1302603',
            uf: 'AM',
            road_condition: 'source_pending',
            weather_condition: 'source_pending',
            lighting_condition: 'source_pending',
            signage_condition: 'source_pending',
            source_local_id: localEntityId,
            ...(recordOverrides as Body | undefined),
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

function item(
  entityType: string,
  payload: Body,
  options: {
    idempotencyKey?: string | null;
    localEntityId?: string;
    at?: number;
    payloadHash?: string;
  } = {},
): Body {
  const localEntityId = options.localEntityId ?? randomUUID();
  if (entityType === 'crash-record') crashLocalIds.add(localEntityId);
  return {
    entity_type: entityType,
    local_entity_id: localEntityId,
    ...(options.idempotencyKey === null
      ? {}
      : { idempotency_key: options.idempotencyKey ?? key('item') }),
    created_locally_at: iso(options.at ?? Date.now()),
    payload_json: payload,
    payload_hash: options.payloadHash ?? canonicalHash(payload),
  };
}

/** Tipo suportado sem destino montado na composição do app (M5). */
function unwiredItem(options: Parameters<typeof item>[2] = {}): Body {
  const payload = { measure: { note: `${RUN} ${randomUUID()}` } };
  return item('administrative-measure', payload, options);
}

function batch(
  deviceId: string,
  items: Body[],
  extra: Body = {},
): Body & { device_batch_id: string } {
  return {
    traffic_agency_id: AGENCY_ID,
    device_id: deviceId,
    agent_id: ACTOR_ID,
    device_batch_id: key('batch'),
    items,
    ...extra,
  } as Body & { device_batch_id: string };
}

// ------------------------------------------------------------ HTTP helpers

async function submit(body: Body, role = 'field-agent') {
  const response = await request(server())
    .post('/v1/ops/offline-sync/sync-batches')
    .set(headers(role))
    .send(body);
  const items = (body.items ?? []) as Body[];
  for (const [index, receipt] of (
    (response.body?.receipts ?? []) as Row[]
  ).entries()) {
    if (items[index]?.entity_type === 'ait' && receipt.server_entity_id)
      aitIds.add(String(receipt.server_entity_id));
  }
  return response;
}

async function createRange(size: number): Promise<{
  id: string;
  start: number;
  end: number;
}> {
  if (size > 50) throw new Error('o bloco de faixa do arquivo é 50');
  const start = RUN_BASE + rangeCounter * 50 + 1;
  rangeCounter += 1;
  const response = await request(server())
    .post('/v1/ops/offline-sync/numbering-ranges')
    .set(headers('agency-admin'))
    .send({
      traffic_agency_id: AGENCY_ID,
      series: `${RUN_SERIES}-${rangeCounter}`,
      start_number: start,
      end_number: start + size - 1,
      next_number: start,
      status: 'active',
      usage_mode: 'source_pending',
    });
  expect(response.status, JSON.stringify(response.body)).toBe(201);
  return { id: String(response.body.id), start, end: start + size - 1 };
}

async function reserve(body: Body, role = 'field-agent') {
  return request(server())
    .post('/v1/ops/offline-sync/numbering-reservations/reserve')
    .set(headers(role))
    .send(body);
}

function reserveBody(rangeId: string, extra: Body = {}): Body {
  return {
    traffic_agency_id: AGENCY_ID,
    agent_id: ACTOR_ID,
    device_id: randomUUID(),
    shift_id: randomUUID(),
    idempotency_key: key('reservation'),
    range_id: rangeId,
    ...extra,
  };
}

/** Reserva de AIT: o turno canônico é o que o _applier_ real confere. */
async function aitReservation(
  rangeId: string,
  deviceId: string,
  size = 1,
): Promise<{ id: string; start_number: number; end_number: number }> {
  const response = await reserve(
    reserveBody(rangeId, {
      device_id: deviceId,
      shift_id: SHIFT_OPEN,
      requested_size: size,
    }),
  );
  expect(response.status, JSON.stringify(response.body)).toBe(201);
  return response.body;
}

async function settle(id: string, action: string, role = 'field-agent') {
  return request(server())
    .post(`/v1/ops/offline-sync/numbering-reservations/${id}/${action}`)
    .set(headers(role))
    .send({ user_ref: ACTOR_ID, reason: `${RUN} ${action}` });
}

async function reconcile(id: string, claimed: number[], role = 'field-agent') {
  return request(server())
    .post(`/v1/ops/offline-sync/numbering-reservations/${id}/reconcile`)
    .set(headers(role))
    .send({ user_ref: ACTOR_ID, claimed_numbers: claimed });
}

async function consumption(id: string) {
  return request(server())
    .get(`/v1/ops/offline-sync/numbering-reservations/${id}/consumption`)
    .set(headers('field-agent'));
}

async function receiptByKey(idempotencyKey: string, tenantId = TENANT_ID) {
  return request(server())
    .get(
      `/v1/ops/offline-sync/receipts/${tenantId}/by-idempotency/${encodeURIComponent(idempotencyKey)}`,
    )
    .set(headers('field-agent'));
}

async function receiptList(query: Body = {}, tenantId = TENANT_ID) {
  return request(server())
    .get(`/v1/ops/offline-sync/receipts/${tenantId}`)
    .query(query)
    .set(headers('field-agent'));
}

async function queueItems(deviceId: string): Promise<Row[]> {
  const response = await request(server())
    .get('/v1/ops/offline-sync/sync-queue-items')
    .query({ device_id: deviceId })
    .set(headers('field-supervisor'));
  expect(response.status, JSON.stringify(response.body)).toBe(200);
  return response.body.items as Row[];
}

async function conflicts(deviceId: string): Promise<Row[]> {
  const response = await request(server())
    .get('/v1/ops/offline-sync/sync-conflicts')
    .query({ device_id: deviceId })
    .set(headers('field-supervisor'));
  expect(response.status, JSON.stringify(response.body)).toBe(200);
  return response.body.conflicts as Row[];
}

async function resolve(id: string, body: Body, role = 'field-supervisor') {
  return request(server())
    .post(`/v1/ops/offline-sync/sync-conflicts/${id}/resolve`)
    .set(headers(role))
    .send(body);
}

/**
 * Linha de parâmetro de escopo de agência (regra 5: o _owner_ só grava linhas
 * de parâmetro de escopo), clonada da linha canônica do tenant; o valor é o
 * dado do caso.
 */
async function scopedParameter(
  parameterKey: string,
  agencyId: string,
  value: number | null,
): Promise<string> {
  await client.query(`select set_config('app.role', 'owner', false)`);
  const inserted = await client.query<{ id: string }>(
    `insert into ops.parameter
       (tenant_id, traffic_agency_id, scope, surface, key, value_json,
        value_type, status, source_pending, legal_readonly, decision_ref,
        legal_basis, reason, version, effective_from, effective_to, changed_by)
     select tenant_id, $2, 'agency', surface, key, $3::jsonb, value_type,
            status, $4, legal_readonly, decision_ref, legal_basis, reason,
            version, effective_from, effective_to, changed_by
       from ops.parameter
      where tenant_id = $1 and key = $5 and traffic_agency_id is null
     returning id`,
    [TENANT_ID, agencyId, JSON.stringify(value), value === null, parameterKey],
  );
  const id = inserted.rows[0]?.id;
  if (!id) throw new Error(`linha de tenant ausente para ${parameterKey}`);
  parameterRowIds.push(id);
  return id;
}

async function updateParameter(id: string, value: number | null) {
  await client.query(`select set_config('app.role', 'owner', false)`);
  await client.query(
    `update ops.parameter set value_json = $2::jsonb, source_pending = $3
      where id = $1`,
    [id, JSON.stringify(value), value === null],
  );
}

// ---------------------------------------------------------------- SSE

interface StreamEvent {
  id: string;
  type: string;
  data: {
    aggregate?: { id?: string; kind?: string; version?: number };
    data?: Record<string, unknown>;
  };
}

interface Stream {
  events: StreamEvent[];
  waitFor(
    predicate: (events: StreamEvent[]) => boolean,
    timeoutMs?: number,
  ): Promise<StreamEvent[]>;
  settle(ms?: number): Promise<void>;
  close(): void;
}

/** Leitura SSE do TEAT (`/v1/ops/stream`), como em `boat-crash-commands`. */
async function openStream(role = 'field-supervisor'): Promise<Stream> {
  const events: StreamEvent[] = [];
  let buffer = '';
  let connected = false;
  let req: ClientRequest | undefined;
  const status = await new Promise<number>((resolveStatus, reject) => {
    req = http.get(
      {
        host: '127.0.0.1',
        port,
        path: '/v1/ops/stream',
        headers: { ...headers(role), accept: 'text/event-stream' },
      },
      (response: IncomingMessage) => {
        response.on('data', (chunk: Buffer) => {
          buffer += chunk.toString('utf8');
          let index = buffer.indexOf('\n\n');
          while (index >= 0) {
            const block = buffer.slice(0, index);
            buffer = buffer.slice(index + 2);
            const lines = block.split('\n');
            if (lines.some((line) => line.startsWith(':'))) connected = true;
            const type = lines
              .find((line) => line.startsWith('event:'))
              ?.slice(6)
              .trim();
            const id = lines
              .find((line) => line.startsWith('id:'))
              ?.slice(3)
              .trim();
            const data = lines
              .filter((line) => line.startsWith('data:'))
              .map((line) => line.slice(5).trim())
              .join('\n');
            if (type && data) {
              connected = true;
              events.push({ id: id ?? '', type, data: JSON.parse(data) });
            }
            index = buffer.indexOf('\n\n');
          }
        });
        resolveStatus(response.statusCode ?? 0);
      },
    );
    req.on('error', (error) => {
      if ((error as NodeJS.ErrnoException).code !== 'ECONNRESET') reject(error);
    });
  });
  expect(status).toBe(200);
  const deadline = Date.now() + 10_000;
  while (!connected && Date.now() < deadline)
    await new Promise((done) => setTimeout(done, 50));
  return {
    events,
    async waitFor(predicate, timeoutMs = 20_000) {
      const until = Date.now() + timeoutMs;
      while (!predicate(events) && Date.now() < until)
        await new Promise((done) => setTimeout(done, 100));
      return events;
    },
    async settle(ms = 2500) {
      await new Promise((done) => setTimeout(done, ms));
    },
    close() {
      req?.destroy();
    },
  };
}

function ofType(events: StreamEvent[], type: string): StreamEvent[] {
  return events.filter((event) => event.type === type);
}

// --------------------------------------------------------------- lifecycle

interface ApplierLike {
  entityType: string;
  validate(payload: unknown): unknown;
  apply(
    applierItem: { localEntityId: string } & Record<string, unknown>,
    tx: unknown,
  ): Promise<{ serverEntityId: string }>;
}

/**
 * C-09-21 — o _applier_ real, envolto: delega tudo e só falha, **depois** do
 * efeito de domínio, para os itens marcados. O código lançado é do catálogo
 * (`OUTCOME_BY_CODE`), para que o desfecho seja o de uma falha de domínio real.
 */
function wrapAppliers(real: readonly ApplierLike[]): ApplierLike[] {
  return real.map((applier) => ({
    entityType: applier.entityType,
    validate: (payload: unknown) => applier.validate(payload),
    async apply(applierItem, tx) {
      const result = await applier.apply(applierItem, tx);
      if (failAfterApply.has(applierItem.localEntityId))
        throw Object.assign(new Error('falha injetada depois do efeito'), {
          code: 'TEAT.NUMBERING_NUMBER_ALREADY_APPLIED',
          context: { localEntityId: applierItem.localEntityId },
        });
      return result;
    },
  }));
}

beforeAll(async () => {
  for (const name of [
    'DETRAN_RUNTIME_PROFILE',
    'DETRAN_LOCAL_TENANT_ID',
    'DETRAN_LOCAL_ACTOR_ID',
    'DETRAN_LOCAL_ROLES',
    'DATABASE_URL',
    'STYNX_OWNER_DATABASE_URL',
    'STYNX_APP_DATABASE_URL',
    'STYNX_READER_DATABASE_URL',
  ])
    previousEnv[name] = process.env[name];
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
  startedAt = (await client.query<{ now: string }>('select now()::text as now'))
    .rows[0]!.now;

  const { Test } = await import('@nestjs/testing');
  const { Database } = await import('@stynx-nyx/data');
  const { RequestContext } = await import('@stynx-nyx/core');
  const { SYNC_ENTITY_APPLIERS } = await import('@detran/ops-core');
  const { TEAT_SYNC_APPLIERS_PROVIDER } =
    await import('../../src/teat-sync.providers.js');
  const { AppModule } = await import('../../src/app.module.js');
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule.forRoot()],
  })
    .overrideProvider(SYNC_ENTITY_APPLIERS)
    .useFactory({
      factory: (database: unknown, requestContext: unknown) =>
        wrapAppliers(
          TEAT_SYNC_APPLIERS_PROVIDER.useFactory(
            database as never,
            requestContext as never,
          ) as unknown as readonly ApplierLike[],
        ),
      inject: [Database, RequestContext],
    })
    .compile();
  app = moduleRef.createNestApplication({ logger: false });
  await app.init();
  await app.listen(0);
  const address = app.getHttpServer().address();
  port = typeof address === 'object' && address ? address.port : 0;
}, 120_000);

afterAll(async () => {
  await app?.close();
  await client.query(`select set_config('app.role', 'owner', false)`);
  // Regra 4: limpeza do armazenamento só pela lista fechada, com guarda. O
  // arquivo roda sozinho no banco (`fileParallelism: false`): o que o tenant
  // canônico ganhou no armazenamento depois de `startedAt` é deste arquivo.
  let pending: string[] = [];
  for (const table of OFFLINE_SYNC_STORAGE) {
    const found = await client.query<{ name: string | null }>(
      'select to_regclass($1)::text as name',
      [table],
    );
    if (found.rows[0]?.name) pending.push(table);
  }
  for (let pass = 0; pass < 6 && pending.length > 0; pass += 1) {
    const failed: string[] = [];
    for (const table of pending) {
      try {
        await client.query(
          `delete from ${table} where tenant_id = $1 and created_at >= $2`,
          [TENANT_ID, startedAt],
        );
      } catch {
        failed.push(table);
      }
    }
    pending = failed;
  }
  if (aitIds.size > 0) {
    await client.query(
      'delete from inf.ait_status_history where ait_id = any($1::uuid[])',
      [[...aitIds]],
    );
    await client.query('delete from inf.ait_ait where id = any($1::uuid[])', [
      [...aitIds],
    ]);
  }
  if (crashLocalIds.size > 0) {
    await client.query(
      `delete from est.crash_link
        where crash_record_id in (
          select id from est.crash_record
           where tenant_id = $1 and source_local_id = any($2::text[]))`,
      [TENANT_ID, [...crashLocalIds]],
    );
    await client.query(
      `delete from est.crash_record
        where tenant_id = $1 and source_local_id = any($2::text[])`,
      [TENANT_ID, [...crashLocalIds]],
    );
  }
  await client.query(
    'delete from integration.outbox where tenant_id = $1 and created_at >= $2',
    [TENANT_ID, startedAt],
  );
  // O kernel grava a chave já resumida; o recorte é o mesmo da outbox.
  await client.query(
    `delete from integration.idempotency_keys
      where tenant_id = $1 and created_at >= $2`,
    [TENANT_ID, startedAt],
  );
  if (parameterRowIds.length > 0)
    await client.query('delete from ops.parameter where id = any($1::uuid[])', [
      parameterRowIds,
    ]);
  await client.end();
  for (const [name, value] of Object.entries(previousEnv)) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
}, 120_000);

/** Os sete campos atuais do recibo na resposta do lote. */
const RECEIPT_FIELDS = [
  'details_json',
  'error_code',
  'error_message',
  'idempotency_key',
  'local_entity_id',
  'server_entity_id',
  'status',
];

/** Um item `ait` legado (sem chave) fica `received`: é o outro lado do par. */
async function legacyAit(deviceId: string, at: number, agencyId: string) {
  const localEntityId = randomUUID();
  const response = await submit(
    batch(
      deviceId,
      [
        item(
          'ait',
          { ait: { note: `${RUN} legado` } },
          { idempotencyKey: null, localEntityId, at },
        ),
      ],
      { traffic_agency_id: agencyId },
    ),
  );
  expect(response.status, JSON.stringify(response.body)).toBe(200);
  expect(response.body.receipts[0]).toMatchObject({
    status: 'received',
    error_code: 'TEAT.SYNC_LEGACY_ITEM_NOT_APPLIED',
  });
  return {
    localEntityId,
    idempotencyKey: `legacy:${deviceId}:${localEntityId}`,
    response,
  };
}

/** AIT válido para o _applier_ real, com reserva própria no turno canônico. */
async function validAit(deviceId: string, at: number, agencyId: string) {
  const range = await createRange(1);
  const reservation = await aitReservation(range.id, deviceId);
  const aitItem = item(
    'ait',
    aitPayload({ number: reservation.start_number, deviceId, at }),
    { at },
  );
  const response = await submit(
    batch(deviceId, [aitItem], { traffic_agency_id: agencyId }),
  );
  expect(response.status, JSON.stringify(response.body)).toBe(200);
  return { item: aitItem, reservation, response };
}

/** Conflito `integrity` real: a mesma chave volta com outro hash. */
async function integrityConflict(): Promise<{
  conflictId: string;
  deviceId: string;
  itemId: string;
}> {
  const deviceId = randomUUID();
  const itemKey = key('integrity');
  const original = unwiredItem({ idempotencyKey: itemKey });
  expect((await submit(batch(deviceId, [original]))).status).toBe(200);
  const changed = unwiredItem({
    idempotencyKey: itemKey,
    localEntityId: String(original.local_entity_id),
  });
  const response = await submit(batch(deviceId, [changed]));
  expect(response.body.receipts[0]).toMatchObject({
    status: 'rejected',
    error_code: 'TEAT.SYNC_INTEGRITY_ERROR',
  });
  const [opened] = await conflicts(deviceId);
  expect(opened).toMatchObject({ conflict_type: 'integrity' });
  return {
    conflictId: String(opened!.id),
    deviceId,
    itemId: String(opened!.sync_queue_item_id),
  };
}

// =================================================================== cases

describe('CTG-0009 C-09-01 — lote TEAT e BOAT e validação de forma', () => {
  it('C-09-01 — dado AIT válido e crash-record válido no mesmo lote quando POST sync-batches então 200 com o envelope de cinco chaves e recibos applied de sete campos', async () => {
    const range = await createRange(1);
    const deviceId = randomUUID();
    const reservation = await aitReservation(range.id, deviceId);
    const crashLocalId = randomUUID();
    const body = batch(deviceId, [
      item(
        'ait',
        aitPayload({ number: reservation.start_number, deviceId, at: slot(0) }),
        { at: slot(0) },
      ),
      item('crash-record', crashPayload(crashLocalId), {
        localEntityId: crashLocalId,
      }),
    ]);
    const response = await submit(body);
    expect(response.status, JSON.stringify(response.body)).toBe(200);
    expect(Object.keys(response.body).sort()).toEqual([
      'accepted_items',
      'batchId',
      'batch_sequence',
      'receipts',
      'warnings',
    ]);
    expect(response.body).toMatchObject({
      batchId: expect.any(String),
      batch_sequence: null,
      accepted_items: 2,
      warnings: expect.any(Array),
    });
    expect(response.body.receipts).toHaveLength(2);
    for (const receipt of response.body.receipts as Row[]) {
      expect(Object.keys(receipt).sort()).toEqual(RECEIPT_FIELDS);
      expect(receipt).toMatchObject({
        status: 'applied',
        error_code: null,
        server_entity_id: expect.any(String),
      });
    }
  });

  it('C-09-01 — dado corpo com items vazio e agent_id inválido quando POST sync-batches então 400 TEAT.VALIDATION_FAILED com fields[{path, rule, params}] e nada materializado', async () => {
    const stream = await openStream();
    try {
      const deviceId = randomUUID();
      const body = batch(deviceId, [], { agent_id: 'nao-e-uuid' });
      const response = await submit(body);
      expect(response.status).toBe(400);
      expect(response.body.code).toBe('TEAT.VALIDATION_FAILED');
      const fields = response.body.context.fields as Row[];
      expect(fields.map((field) => field.path).sort()).toEqual([
        'agent_id',
        'items',
      ]);
      for (const field of fields) {
        expect(Object.keys(field).sort()).toEqual(['params', 'path', 'rule']);
        expect(field.rule).toEqual(expect.any(String));
      }
      expect(await queueItems(deviceId)).toEqual([]);
      await stream.settle();
      expect(
        stream.events.filter(
          (event) => event.data.data?.deviceBatchId === body.device_batch_id,
        ),
      ).toEqual([]);
    } finally {
      stream.close();
    }
  }, 60_000);
});

describe('CTG-0009 C-09-02/03 — idempotência e replay sem novo efeito', () => {
  it('C-09-02 — dado Idempotency-Key repetida quando reenvia o mesmo corpo, depois outro corpo, depois a mesma chave de item em outro device_batch_id então mesma resposta, 422 do kernel e recibo applied sem novo agregado', async () => {
    const deviceId = randomUUID();
    const localId = randomUUID();
    const body = batch(deviceId, [
      item('crash-record', crashPayload(localId), { localEntityId: localId }),
    ]);
    const kernelHeaders = headers('field-agent');
    const first = await request(server())
      .post('/v1/ops/offline-sync/sync-batches')
      .set(kernelHeaders)
      .send(body);
    expect(first.status, JSON.stringify(first.body)).toBe(200);
    expect(first.body.receipts[0]).toMatchObject({ status: 'applied' });
    const serverEntityId = first.body.receipts[0].server_entity_id;

    const replay = await request(server())
      .post('/v1/ops/offline-sync/sync-batches')
      .set(kernelHeaders)
      .send(body);
    expect(replay.status).toBe(200);
    expect(replay.body).toEqual(first.body);

    const divergent = await request(server())
      .post('/v1/ops/offline-sync/sync-batches')
      .set(kernelHeaders)
      .send({ ...body, device_batch_id: key('divergent') });
    expect(divergent.status).toBe(422);

    const otherBatch = await submit({ ...body, device_batch_id: key('other') });
    expect(otherBatch.status, JSON.stringify(otherBatch.body)).toBe(200);
    expect(otherBatch.body.batchId).not.toBe(first.body.batchId);
    expect(otherBatch.body.receipts[0]).toMatchObject({
      status: 'applied',
      server_entity_id: serverEntityId,
    });
    expect(await queueItems(deviceId)).toHaveLength(1);
  });

  it('C-09-03 — dado AIT aplicado quando o lote e o item são reenviados então nenhum novo item, recibo, consumo ou evento aparece', async () => {
    const stream = await openStream();
    try {
      const range = await createRange(1);
      const deviceId = randomUUID();
      const reservation = await aitReservation(range.id, deviceId);
      const aitItem = item(
        'ait',
        aitPayload({ number: reservation.start_number, deviceId, at: slot(1) }),
        { at: slot(1) },
      );
      const body = batch(deviceId, [aitItem]);
      const first = await submit(body);
      expect(first.status, JSON.stringify(first.body)).toBe(200);
      expect(first.body.receipts[0]).toMatchObject({ status: 'applied' });
      const aitId = String(first.body.receipts[0].server_entity_id);
      await stream.waitFor(
        (events) =>
          ofType(events, AIT_CHANGED).some(
            (event) => event.data.aggregate?.id === aitId,
          ) &&
          ofType(events, SYNC_BATCH_RECEIVED).some(
            (event) => event.data.data?.batchId === first.body.batchId,
          ),
      );

      const batchReplay = await submit(body);
      expect(batchReplay.status).toBe(200);
      expect(batchReplay.body).toMatchObject({
        batchId: first.body.batchId,
        receipts: first.body.receipts,
      });
      const itemReplay = await submit({ ...body, device_batch_id: key('b2') });
      expect(itemReplay.status).toBe(200);
      expect(itemReplay.body.receipts).toEqual(first.body.receipts);
      await stream.settle();

      expect(await queueItems(deviceId)).toHaveLength(1);
      const receipts = await receiptList();
      expect(
        (receipts.body.receipts as Row[]).filter(
          (receipt) => receipt.idempotency_key === aitItem.idempotency_key,
        ),
      ).toHaveLength(1);
      const used = await consumption(reservation.id);
      expect(used.body.consumption).toEqual([
        expect.objectContaining({
          number: reservation.start_number,
          status: 'aplicado',
          server_entity_id: aitId,
        }),
      ]);
      expect(
        ofType(stream.events, AIT_CHANGED).filter(
          (event) => event.data.aggregate?.id === aitId,
        ),
      ).toHaveLength(1);
      expect(
        ofType(stream.events, SYNC_BATCH_RECEIVED).filter(
          (event) => event.data.data?.localEntityId === aitItem.local_entity_id,
        ),
      ).toHaveLength(1);
    } finally {
      stream.close();
    }
  }, 60_000);
});

describe('CTG-0009 C-09-04 — reserva de numeração', () => {
  it('C-09-04 — dado a mesma idempotency_key quando o mesmo pedido volta e depois outro pedido então a mesma reserva e 409 TEAT.IDEMPOTENCY_REPLAY; outra chave no mesmo dispositivo e turno então 409 TEAT.NUMBERING_RESERVATION_ACTIVE_EXISTS', async () => {
    const range = await createRange(10);
    const body = reserveBody(range.id);
    const first = await reserve(body);
    expect(first.status, JSON.stringify(first.body)).toBe(201);
    expect(first.body).toMatchObject({
      range_id: range.id,
      start_number: range.start,
      end_number: range.start,
      status: 'reserved',
    });
    const again = await reserve(body);
    expect(again.status).toBe(201);
    expect(again.body).toEqual(first.body);

    const different = await reserve({ ...body, requested_size: 2 });
    expect(different.status).toBe(409);
    expect(different.body).toMatchObject({
      code: 'TEAT.IDEMPOTENCY_REPLAY',
      context: { idempotencyKey: body.idempotency_key },
    });

    const active = await reserve({
      ...body,
      idempotency_key: key('reservation'),
    });
    expect(active.status).toBe(409);
    expect(active.body).toMatchObject({
      code: 'TEAT.NUMBERING_RESERVATION_ACTIVE_EXISTS',
      context: { reservationId: first.body.id },
    });
  });

  it('C-09-04 — dado faixa de três números quando reserva 2 e depois mais 2 então a segunda recebe 422 TEAT.NUMBERING_RANGE_EXHAUSTED', async () => {
    const range = await createRange(3);
    const first = await reserve(reserveBody(range.id, { requested_size: 2 }));
    expect(first.status, JSON.stringify(first.body)).toBe(201);
    expect(first.body).toMatchObject({
      start_number: range.start,
      end_number: range.start + 1,
    });
    const exhausted = await reserve(
      reserveBody(range.id, { requested_size: 2 }),
    );
    expect(exhausted.status).toBe(422);
    expect(exhausted.body).toMatchObject({
      code: 'TEAT.NUMBERING_RANGE_EXHAUSTED',
      context: { rangeId: range.id },
    });
  });

  it('C-09-04 — dado N reservas concorrentes em dispositivos distintos quando disparadas juntas então os intervalos são disjuntos e ficam dentro da faixa', async () => {
    const range = await createRange(40);
    const responses = await Promise.all(
      Array.from({ length: 8 }, () =>
        reserve(reserveBody(range.id, { requested_size: 3 })),
      ),
    );
    const intervals = responses.map((response) => {
      expect(response.status, JSON.stringify(response.body)).toBe(201);
      return [
        Number(response.body.start_number),
        Number(response.body.end_number),
      ] as const;
    });
    const sorted = [...intervals].sort((left, right) => left[0] - right[0]);
    for (const [index, [start, end]] of sorted.entries()) {
      expect(end - start + 1).toBe(3);
      expect(start).toBeGreaterThanOrEqual(range.start);
      expect(end).toBeLessThanOrEqual(range.end);
      if (index > 0) expect(start).toBeGreaterThan(sorted[index - 1]![1]);
    }
  });
});

describe('CTG-0009 C-09-05 — cancel, block e close', () => {
  it('C-09-05 — dado reserva reserved quando cancel, block e close então cancelled, blocked e consumed; repetição devolve o mesmo estado sem novo evento; eventos v1 na reserva e v2 na liquidação', async () => {
    const stream = await openStream();
    try {
      const range = await createRange(10);
      const expected: Record<string, string> = {
        cancel: 'cancelled',
        block: 'blocked',
        close: 'consumed',
      };
      const ids: Record<string, string> = {};
      for (const action of Object.keys(expected)) {
        const reserved = await reserve(reserveBody(range.id));
        expect(reserved.status).toBe(201);
        const id = String(reserved.body.id);
        ids[action] = id;
        const settled = await settle(id, action);
        expect(settled.status, JSON.stringify(settled.body)).toBe(200);
        expect(settled.body).toMatchObject({ id, status: expected[action] });
        const repeated = await settle(id, action);
        expect(repeated.status).toBe(200);
        expect(repeated.body).toEqual({ id, status: expected[action] });
      }
      await stream.waitFor((events) =>
        Object.values(ids).every(
          (id) =>
            ofType(events, NUMBERING_CHANGED).filter(
              (event) => event.data.aggregate?.id === id,
            ).length >= 2,
        ),
      );
      await stream.settle();
      for (const [action, id] of Object.entries(ids)) {
        const mine = ofType(stream.events, NUMBERING_CHANGED).filter(
          (event) => event.data.aggregate?.id === id,
        );
        expect(mine.map((event) => event.data.aggregate?.version)).toEqual([
          1, 2,
        ]);
        expect(mine.map((event) => event.data.data?.action)).toEqual([
          'reserve',
          action,
        ]);
      }
    } finally {
      stream.close();
    }
  }, 60_000);

  it('C-09-05 — dado reserva expired (pela rota CRUD gerada) quando block ou close então blocked e consumed', async () => {
    const range = await createRange(10);
    for (const [action, expected] of [
      ['block', 'blocked'],
      ['close', 'consumed'],
    ] as const) {
      const reserved = await reserve(reserveBody(range.id));
      const expired = await request(server())
        .patch(
          `/v1/ops/offline-sync/numbering-reservations/${reserved.body.id}`,
        )
        .set(headers('technical-admin'))
        .send({ status: 'expired' });
      expect(expired.status, JSON.stringify(expired.body)).toBe(200);
      const settled = await settle(String(reserved.body.id), action);
      expect(settled.status, JSON.stringify(settled.body)).toBe(200);
      expect(settled.body).toMatchObject({ status: expected });
    }
  });

  it('C-09-05 — dado reserva fora do estado de origem quando cancel ou close então 422 TEAT.VALIDATION_FAILED status/transition', async () => {
    const range = await createRange(10);
    const reserved = await reserve(reserveBody(range.id));
    const id = String(reserved.body.id);
    expect((await settle(id, 'block')).status).toBe(200);
    for (const action of ['cancel', 'close']) {
      const denied = await settle(id, action);
      expect(denied.status).toBe(422);
      expect(denied.body).toMatchObject({
        code: 'TEAT.VALIDATION_FAILED',
        context: { fields: [{ path: 'status', rule: 'transition' }] },
      });
    }
  });

  it('C-09-05 — dado reserva com todos os números aplicados quando cancel então 422 status/fully_consumed', async () => {
    const deviceId = randomUUID();
    const applied = await validAit(deviceId, slot(2), AGENCY_ID);
    expect(
      applied.response.body.receipts[0],
      JSON.stringify(applied.response.body),
    ).toMatchObject({ status: 'applied' });
    const denied = await settle(applied.reservation.id, 'cancel');
    expect(denied.status).toBe(422);
    expect(denied.body).toMatchObject({
      code: 'TEAT.VALIDATION_FAILED',
      context: { fields: [{ path: 'status', rule: 'fully_consumed' }] },
    });
  });

  it('C-09-05 — dado duas reservas da mesma faixa quando cancela a que não é cauda e depois a cauda então só a cauda devolve released_from/released_to', async () => {
    const range = await createRange(10);
    const inner = await reserve(reserveBody(range.id, { requested_size: 2 }));
    const tail = await reserve(reserveBody(range.id, { requested_size: 2 }));
    const innerCancel = await settle(String(inner.body.id), 'cancel');
    expect(innerCancel.status).toBe(200);
    expect(innerCancel.body).toEqual({
      id: inner.body.id,
      status: 'cancelled',
    });
    const tailCancel = await settle(String(tail.body.id), 'cancel');
    expect(tailCancel.status).toBe(200);
    expect(tailCancel.body).toEqual({
      id: tail.body.id,
      status: 'cancelled',
      released_from: tail.body.start_number,
      released_to: tail.body.end_number,
    });
  });
});

describe('CTG-0009 C-09-06/18 — reconciliação e consumo', () => {
  it('C-09-06 — dado reserva de três números com o primeiro aplicado quando reconcilia com o segundo reclamado então uma linha por número, missing/unexpected e GET consumption em number asc', async () => {
    const range = await createRange(3);
    const deviceId = randomUUID();
    const reservation = await aitReservation(range.id, deviceId, 3);
    const start = reservation.start_number;
    const applied = await submit(
      batch(deviceId, [
        item('ait', aitPayload({ number: start, deviceId, at: slot(3) }), {
          at: slot(3),
        }),
      ]),
    );
    expect(
      applied.body.receipts[0],
      JSON.stringify(applied.body),
    ).toMatchObject({ status: 'applied' });
    const aitId = applied.body.receipts[0].server_entity_id;

    const outOfRange = await reconcile(reservation.id, [start + 5]);
    expect(outOfRange.status).toBe(422);
    expect(outOfRange.body).toMatchObject({
      code: 'TEAT.NUMBERING_RECONCILE_MISMATCH',
      context: { outOfRange: [start + 5] },
    });

    const reconciled = await reconcile(reservation.id, [start + 1]);
    expect(reconciled.status, JSON.stringify(reconciled.body)).toBe(200);
    expect(reconciled.body).toMatchObject({
      reservation_id: reservation.id,
      start_number: start,
      end_number: start + 2,
      missing_on_server: [start + 1],
      unexpected_on_server: [start],
    });
    expect(
      (reconciled.body.consumption as Row[]).map((row) => [
        row.number,
        row.status,
      ]),
    ).toEqual([
      [start, 'aplicado'],
      [start + 1, 'consumido_localmente'],
      [start + 2, 'disponivel'],
    ]);

    const read = await consumption(reservation.id);
    expect(read.status).toBe(200);
    expect(read.body).toMatchObject({
      reservation_id: reservation.id,
      status: 'reserved',
    });
    expect(read.body.consumption).toEqual([
      expect.objectContaining({
        number: start,
        status: 'aplicado',
        server_entity_id: aitId,
      }),
      expect.objectContaining({
        number: start + 1,
        status: 'consumido_localmente',
        server_entity_id: null,
      }),
      expect.objectContaining({
        number: start + 2,
        status: 'disponivel',
        server_entity_id: null,
      }),
    ]);
  });

  it('C-09-06 — dado reserva consumed quando reconcilia então 200; dada reserva cancelled então 422 status/transition', async () => {
    const range = await createRange(10);
    const closed = await reserve(reserveBody(range.id));
    expect((await settle(String(closed.body.id), 'close')).status).toBe(200);
    const fromConsumed = await reconcile(String(closed.body.id), []);
    expect(fromConsumed.status, JSON.stringify(fromConsumed.body)).toBe(200);
    expect(fromConsumed.body.consumption).toEqual([
      expect.objectContaining({ status: 'disponivel' }),
    ]);

    const cancelled = await reserve(reserveBody(range.id));
    expect((await settle(String(cancelled.body.id), 'cancel')).status).toBe(
      200,
    );
    const denied = await reconcile(String(cancelled.body.id), []);
    expect(denied.status).toBe(422);
    expect(denied.body).toMatchObject({
      code: 'TEAT.VALIDATION_FAILED',
      context: { fields: [{ path: 'status', rule: 'transition' }] },
    });
  });

  it('C-09-18 — dado reserva reconciliada quando GET consumption então reflete a reconciliação feita', async () => {
    const range = await createRange(10);
    const reserved = await reserve(
      reserveBody(range.id, { requested_size: 2 }),
    );
    const id = String(reserved.body.id);
    const start = Number(reserved.body.start_number);
    expect((await consumption(id)).body.consumption).toEqual([]);
    expect((await reconcile(id, [start])).status).toBe(200);
    const read = await consumption(id);
    expect(
      (read.body.consumption as Row[]).map((row) => [row.number, row.status]),
    ).toEqual([
      [start, 'consumido_localmente'],
      [start + 1, 'disponivel'],
    ]);
  });
});

describe('CTG-0009 C-09-07/18 — recibos', () => {
  it('C-09-07 — dado chave inexistente quando GET by-idempotency então 404 TEAT.SYNC_RECEIPT_NOT_FOUND {idempotencyKey}', async () => {
    const missing = key('missing');
    const response = await receiptByKey(missing);
    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      code: 'TEAT.SYNC_RECEIPT_NOT_FOUND',
      context: { idempotencyKey: missing },
    });
  });

  it('C-09-07 — dado {tenantId} diferente do principal quando GET por chave e lista então 404 TEAT.TENANT_MISMATCH sem conteúdo', async () => {
    const unwired = unwiredItem();
    expect((await submit(batch(randomUUID(), [unwired]))).status).toBe(200);
    const otherTenant = randomUUID();
    for (const response of [
      await receiptByKey(String(unwired.idempotency_key), otherTenant),
      await receiptList({}, otherTenant),
    ]) {
      expect(response.status).toBe(404);
      expect(response.body.code).toBe('TEAT.TENANT_MISMATCH');
      expect(response.body).not.toHaveProperty('receipts');
      expect(JSON.stringify(response.body)).not.toContain(
        String(unwired.idempotency_key),
      );
    }
  });

  it('C-09-18 — dado um lote aplicado quando GET by-idempotency então status e server_entity_id iguais aos do recibo do lote (ACK perdido recuperado)', async () => {
    const localId = randomUUID();
    const crash = item('crash-record', crashPayload(localId), {
      localEntityId: localId,
    });
    const response = await submit(batch(randomUUID(), [crash]));
    expect(response.status, JSON.stringify(response.body)).toBe(200);
    const recovered = await receiptByKey(String(crash.idempotency_key));
    expect(recovered.status).toBe(200);
    expect(recovered.body).toMatchObject({
      idempotency_key: crash.idempotency_key,
      status: response.body.receipts[0].status,
      server_entity_id: response.body.receipts[0].server_entity_id,
    });
  });

  it('C-09-18 — dado recibos de estados diferentes quando lista com filtro status então só esse estado, em created_at desc', async () => {
    const deviceId = randomUUID();
    for (let index = 0; index < 3; index += 1)
      expect((await submit(batch(deviceId, [unwiredItem()]))).status).toBe(200);
    const listed = await receiptList({ status: 'received' });
    expect(listed.status).toBe(200);
    const receipts = listed.body.receipts as Row[];
    expect(receipts.length).toBeGreaterThanOrEqual(3);
    expect(receipts.every((receipt) => receipt.status === 'received')).toBe(
      true,
    );
    const createdAt = receipts.map((receipt) => String(receipt.created_at));
    expect(createdAt).toEqual([...createdAt].sort().reverse());
    const rejected = await receiptList({ status: 'rejected' });
    expect(rejected.status).toBe(200);
    expect(
      (rejected.body.receipts as Row[]).every(
        (receipt) => receipt.status === 'rejected',
      ),
    ).toBe(true);
  });

  it('C-09-18 — dado itens de dois dispositivos quando GET sync-queue-items filtra device_id então só os do dispositivo', async () => {
    const deviceId = randomUUID();
    const otherDevice = randomUUID();
    expect((await submit(batch(deviceId, [unwiredItem()]))).status).toBe(200);
    expect((await submit(batch(otherDevice, [unwiredItem()]))).status).toBe(
      200,
    );
    const listed = await queueItems(deviceId);
    expect(listed).toHaveLength(1);
    expect(listed[0]).toMatchObject({ device_id: deviceId });
  });
});

describe('CTG-0009 C-09-08 — item aplicado', () => {
  it('C-09-08 — dado AIT válido quando sincronizado então agregado, fila applied com server_entity_id, recibo applied com applied_at e os eventos do item aparecem juntos', async () => {
    const stream = await openStream();
    try {
      const deviceId = randomUUID();
      const { item: aitItem, response } = await validAit(
        deviceId,
        slot(4),
        AGENCY_ID,
      );
      expect(
        response.body.receipts[0],
        JSON.stringify(response.body),
      ).toMatchObject({
        status: 'applied',
        server_entity_id: expect.any(String),
      });
      const aitId = String(response.body.receipts[0].server_entity_id);
      const [queued] = await queueItems(deviceId);
      expect(queued).toMatchObject({
        status: 'applied',
        server_entity_id: aitId,
      });
      const receipt = await receiptByKey(String(aitItem.idempotency_key));
      expect(receipt.body).toMatchObject({
        status: 'applied',
        server_entity_id: aitId,
        applied_at: expect.any(String),
      });
      const events = await stream.waitFor(
        (all) =>
          ofType(all, AIT_CHANGED).some(
            (event) => event.data.aggregate?.id === aitId,
          ) &&
          ofType(all, SYNC_BATCH_RECEIVED).some(
            (event) => event.data.data?.serverEntityId === aitId,
          ),
      );
      expect(
        ofType(events, SYNC_BATCH_RECEIVED).find(
          (event) => event.data.data?.serverEntityId === aitId,
        )?.data.data,
      ).toMatchObject({
        batchId: response.body.batchId,
        itemId: queued!.id,
        receiptStatus: 'applied',
        errorCode: null,
      });
      expect(
        ofType(events, AIT_CHANGED).find(
          (event) => event.data.aggregate?.id === aitId,
        )?.data.data,
      ).toMatchObject({ aitId, toState: 'RECEBIDO' });
    } finally {
      stream.close();
    }
  }, 60_000);
});

describe('CTG-0009 C-09-09 — concorrência entre dispositivos', () => {
  it('C-09-09 — dado janela ligada e dois ait do mesmo agente em dispositivos distintos dentro dela quando o segundo chega então recibo conflict TEAT.SYNC_CONCURRENCY_SUSPECT com o contexto, conflito concurrency nos dois itens e os eventos', async () => {
    const stream = await openStream();
    try {
      const agencyId = randomUUID();
      await scopedParameter('sync.concurrency_window_minutes', agencyId, 10);
      const first = randomUUID();
      const second = randomUUID();
      const at = slot(5);
      const secondAt = at + 3 * 60_000;
      const legacy = await legacyAit(first, at, agencyId);
      const current = await validAit(second, secondAt, agencyId);
      expect(current.response.body.warnings).toEqual([]);
      const receipt = current.response.body.receipts[0] as Row;
      const [firstItem] = await queueItems(first);
      const [secondItem] = await queueItems(second);
      expect(receipt).toMatchObject({
        status: 'conflict',
        error_code: 'TEAT.SYNC_CONCURRENCY_SUSPECT',
        server_entity_id: expect.any(String),
      });
      expect(receipt.details_json).toMatchObject({
        otherDeviceId: first,
        windowStart: iso(secondAt - 10 * 60_000),
        windowEnd: iso(secondAt + 10 * 60_000),
        windowMinutes: 10,
        conflictingQueueItemIds: [firstItem!.id],
      });
      const otherSide = await receiptByKey(legacy.idempotencyKey);
      expect(otherSide.body).toMatchObject({
        status: 'conflict',
        reason_code: 'TEAT.SYNC_CONCURRENCY_SUSPECT',
      });
      expect(otherSide.body.details_json).toMatchObject({
        otherDeviceId: second,
        windowStart: iso(at - 10 * 60_000),
        windowEnd: iso(at + 10 * 60_000),
        windowMinutes: 10,
        conflictingQueueItemIds: [secondItem!.id],
      });
      for (const [deviceId, queued] of [
        [first, firstItem],
        [second, secondItem],
      ] as const) {
        expect(await conflicts(deviceId)).toEqual([
          expect.objectContaining({
            sync_queue_item_id: queued!.id,
            conflict_type: 'concurrency',
            reason_code: 'TEAT.SYNC_CONCURRENCY_SUSPECT',
            status: 'open',
          }),
        ]);
      }
      const aitId = String(receipt.server_entity_id);
      const pair = [String(firstItem!.id), String(secondItem!.id)];
      const events = await stream.waitFor(
        (all) =>
          ofType(all, SYNC_CONFLICT_OPENED).filter((event) =>
            pair.includes(String(event.data.data?.syncQueueItemId)),
          ).length === 2 &&
          ofType(all, AIT_CONCURRENCY_SUSPECTED).some(
            (event) => event.data.aggregate?.id === aitId,
          ),
      );
      expect(
        ofType(events, SYNC_CONFLICT_OPENED)
          .filter((event) =>
            pair.includes(String(event.data.data?.syncQueueItemId)),
          )
          .map((event) => event.data.data?.conflictType),
      ).toEqual(['concurrency', 'concurrency']);
      expect(
        ofType(events, AIT_CONCURRENCY_SUSPECTED).find(
          (event) => event.data.aggregate?.id === aitId,
        )?.data.data,
      ).toMatchObject({ aitId, deviceId: second, otherDeviceId: first });
    } finally {
      stream.close();
    }
  }, 90_000);

  it('C-09-09 — dado handoff válido entre os dois atos quando o segundo chega então nenhuma suspeita', async () => {
    const agencyId = randomUUID();
    await scopedParameter('sync.concurrency_window_minutes', agencyId, 10);
    const first = randomUUID();
    const second = randomUUID();
    const legacy = await legacyAit(
      first,
      CANONICAL_HANDOFF_AT - 2 * 60_000,
      agencyId,
    );
    const current = await validAit(
      second,
      CANONICAL_HANDOFF_AT + 60_000,
      agencyId,
    );
    expect(current.response.body.receipts[0].error_code).not.toBe(
      'TEAT.SYNC_CONCURRENCY_SUSPECT',
    );
    expect((await receiptByKey(legacy.idempotencyKey)).body).toMatchObject({
      status: 'received',
      reason_code: 'TEAT.SYNC_LEGACY_ITEM_NOT_APPLIED',
    });
    for (const deviceId of [first, second])
      expect(
        (await conflicts(deviceId)).filter(
          (conflict) => conflict.conflict_type === 'concurrency',
        ),
      ).toEqual([]);
  });

  it('C-09-09 — dado os dois atos no mesmo dispositivo quando o segundo chega então nenhuma suspeita', async () => {
    const agencyId = randomUUID();
    await scopedParameter('sync.concurrency_window_minutes', agencyId, 10);
    const deviceId = randomUUID();
    const at = slot(6);
    const legacy = await legacyAit(deviceId, at, agencyId);
    const current = await validAit(deviceId, at + 3 * 60_000, agencyId);
    expect(current.response.body.receipts[0]).toMatchObject({
      status: 'applied',
      error_code: null,
    });
    expect((await receiptByKey(legacy.idempotencyKey)).body.status).toBe(
      'received',
    );
    expect(await conflicts(deviceId)).toEqual([]);
  });
});

describe('CTG-0009 C-09-10 — resolução de conflito', () => {
  it('C-09-10 — dado conflito integrity quando manual_review, accept_server, reject e retry_after_correction então open sem resolved_at, resolved com item rejected e resolved com item pending, com sync.conflict.resolved', async () => {
    const stream = await openStream();
    try {
      const accepted = await integrityConflict();
      const review = await resolve(accepted.conflictId, {
        resolved_by_user_ref: ACTOR_ID,
        resolution_action: 'manual_review',
        description: `${RUN} análise`,
      });
      expect(review.status, JSON.stringify(review.body)).toBe(200);
      expect(review.body).toEqual({
        id: accepted.conflictId,
        status: 'open',
        resolution_action: 'manual_review',
        resolved_at: null,
      });

      const rejected = await integrityConflict();
      const retried = await integrityConflict();
      const expectations = [
        [accepted, 'accept_server', 'rejected'],
        [rejected, 'reject', 'rejected'],
        [retried, 'retry_after_correction', 'pending'],
      ] as const;
      for (const [conflict, action, itemStatus] of expectations) {
        const response = await resolve(conflict.conflictId, {
          resolved_by_user_ref: ACTOR_ID,
          resolution_action: action,
        });
        expect(response.status, JSON.stringify(response.body)).toBe(200);
        expect(response.body).toMatchObject({
          id: conflict.conflictId,
          status: 'resolved',
          resolution_action: action,
          resolved_at: expect.any(String),
        });
        const [queued] = await queueItems(conflict.deviceId);
        expect(queued).toMatchObject({
          id: conflict.itemId,
          status: itemStatus,
        });
      }
      const ids = expectations.map(([conflict]) => conflict.conflictId);
      const events = await stream.waitFor(
        (all) =>
          ofType(all, SYNC_CONFLICT_RESOLVED).filter((event) =>
            ids.includes(String(event.data.aggregate?.id)),
          ).length === 3,
      );
      for (const [conflict, action] of expectations)
        expect(
          ofType(events, SYNC_CONFLICT_RESOLVED).find(
            (event) => event.data.aggregate?.id === conflict.conflictId,
          )?.data.data,
        ).toMatchObject({
          conflictId: conflict.conflictId,
          conflictType: 'integrity',
          resolutionAction: action,
        });
    } finally {
      stream.close();
    }
  }, 90_000);

  it('C-09-10 — dado conflito concurrency canônico quando accept_server então 409 TEAT.SYNC_ITEM_CONFLICT', async () => {
    const response = await resolve(CONFLICT_CONCURRENCY, {
      resolved_by_user_ref: ACTOR_ID,
      resolution_action: 'accept_server',
    });
    expect(response.status).toBe(409);
    expect(response.body).toMatchObject({
      code: 'TEAT.SYNC_ITEM_CONFLICT',
      context: { conflictType: 'concurrency' },
    });
  });

  it('C-09-10 — dado ação fora do conjunto ou sem resolved_by_user_ref quando resolve então 422 enum e 422 required', async () => {
    const conflict = await integrityConflict();
    const invalid = await resolve(conflict.conflictId, {
      resolved_by_user_ref: ACTOR_ID,
      resolution_action: 'device_wins',
    });
    expect(invalid.status).toBe(422);
    expect(invalid.body).toMatchObject({
      code: 'TEAT.VALIDATION_FAILED',
      context: { fields: [{ path: 'resolution_action', rule: 'enum' }] },
    });
    const missing = await resolve(conflict.conflictId, {
      resolution_action: 'reject',
    });
    expect(missing.status).toBe(422);
    expect(missing.body).toMatchObject({
      code: 'TEAT.VALIDATION_FAILED',
      context: {
        fields: [{ path: 'resolved_by_user_ref', rule: 'required' }],
      },
    });
  });
});

describe('CTG-0009 C-09-11 — papel e tenant nas rotas', () => {
  it('C-09-11 — dado papel fora da regra quando chama cada rota de escrita então 403 e a reserva continua reserved', async () => {
    const range = await createRange(10);
    const reserved = await reserve(reserveBody(range.id));
    const id = String(reserved.body.id);
    const denied = [
      await submit(batch(randomUUID(), [unwiredItem()]), 'field-supervisor'),
      await reserve(reserveBody(range.id), 'agency-admin'),
      await settle(id, 'cancel', 'agency-admin'),
      await settle(id, 'block', 'agency-admin'),
      await settle(id, 'close', 'agency-admin'),
      await reconcile(id, [], 'agency-admin'),
      await resolve(
        CONFLICT_CONCURRENCY,
        { resolved_by_user_ref: ACTOR_ID, resolution_action: 'manual_review' },
        'agency-admin',
      ),
      await resolve(
        CONFLICT_CONCURRENCY,
        { resolved_by_user_ref: ACTOR_ID, resolution_action: 'manual_review' },
        'field-agent',
      ),
    ];
    for (const response of denied) expect(response.status).toBe(403);
    expect((await consumption(id)).body).toMatchObject({ status: 'reserved' });
  });

  it('C-09-11 — dado id que não pertence ao tenant do principal quando lê ou altera reserva, consumo, conflito e recibo então 404 TEAT.TENANT_MISMATCH', async () => {
    const foreign = randomUUID();
    const responses = [
      await settle(foreign, 'cancel'),
      await settle(foreign, 'block'),
      await settle(foreign, 'close'),
      await reconcile(foreign, []),
      await consumption(foreign),
      await resolve(foreign, {
        resolved_by_user_ref: ACTOR_ID,
        resolution_action: 'manual_review',
      }),
      await receiptList({}, randomUUID()),
    ];
    for (const response of responses) {
      expect(response.status).toBe(404);
      expect(response.body.code).toBe('TEAT.TENANT_MISMATCH');
    }
  });
});

describe('CTG-0009 C-09-12 — sequência e integridade', () => {
  it('C-09-12 — dado dispositivo sem lote quando o primeiro sequenciado é 2, depois 1, depois 1 de novo então 422 SEQUENCE_GAP, 200 e 409 SEQUENCE_REPLAYED; data.batchId dos eventos é o da resposta', async () => {
    const stream = await openStream();
    try {
      const deviceId = randomUUID();
      const gap = batch(deviceId, [unwiredItem()], { batch_sequence: 2 });
      const gapResponse = await submit(gap);
      expect(gapResponse.status).toBe(422);
      expect(gapResponse.body).toMatchObject({
        code: 'TEAT.SYNC_BATCH_SEQUENCE_GAP',
        context: {
          expectedSequence: 1,
          received: 2,
          deviceBatchId: gap.device_batch_id,
        },
      });
      const firstBody = batch(deviceId, [unwiredItem()], {
        batch_sequence: 1,
      });
      const first = await submit(firstBody);
      expect(first.status, JSON.stringify(first.body)).toBe(200);
      expect(first.body.batch_sequence).toBe(1);
      const replayed = batch(deviceId, [unwiredItem()], { batch_sequence: 1 });
      const replayedResponse = await submit(replayed);
      expect(replayedResponse.status).toBe(409);
      expect(replayedResponse.body).toMatchObject({
        code: 'TEAT.SYNC_BATCH_SEQUENCE_REPLAYED',
        context: {
          expectedSequence: 2,
          received: 1,
          deviceBatchId: replayed.device_batch_id,
        },
      });
      const events = await stream.waitFor((all) =>
        ofType(all, SYNC_BATCH_RECEIVED).some(
          (event) =>
            event.data.data?.deviceBatchId === firstBody.device_batch_id,
        ),
      );
      expect(
        ofType(events, SYNC_BATCH_RECEIVED)
          .filter(
            (event) =>
              event.data.data?.deviceBatchId === firstBody.device_batch_id,
          )
          .map((event) => [
            event.data.data?.batchId,
            event.data.data?.batchSequence,
          ]),
      ).toEqual([[first.body.batchId, 1]]);
    } finally {
      stream.close();
    }
  }, 60_000);

  it('C-09-12 — dado payload_hash diferente do hash canônico de payload_json quando sincronizado então recibo rejected TEAT.SYNC_INTEGRITY_ERROR', async () => {
    const payload = { measure: { note: `${RUN} integridade` } };
    const wrongHash = canonicalHash({ other: true });
    const unwired = item('administrative-measure', payload, {
      payloadHash: wrongHash,
    });
    const response = await submit(batch(randomUUID(), [unwired]));
    expect(response.status).toBe(200);
    expect(response.body.receipts[0]).toMatchObject({
      status: 'rejected',
      error_code: 'TEAT.SYNC_INTEGRITY_ERROR',
      details_json: {
        idempotencyKey: unwired.idempotency_key,
        storedHash: canonicalHash(payload),
        receivedHash: wrongHash,
      },
    });
  });
});

describe('CTG-0009 C-09-13 — BOAT pelo protocolo', () => {
  it('C-09-13 — dado crash-record válido, inválido, com evidência pendente e com vínculo AIT ausente quando sincronizados então applied, rejected sem agregado e applied com os avisos', async () => {
    const deviceId = randomUUID();
    const valid = randomUUID();
    const invalid = randomUUID();
    const evidence = randomUUID();
    const link = randomUUID();
    const response = await submit(
      batch(deviceId, [
        item('crash-record', crashPayload(valid), { localEntityId: valid }),
        item('crash-record', crashPayload(invalid, { record: null }), {
          localEntityId: invalid,
        }),
        item(
          'crash-record',
          crashPayload(evidence, {
            evidenceLocalIds: [EVIDENCE_PENDING_LOCAL_ID],
          }),
          { localEntityId: evidence },
        ),
        item(
          'crash-record',
          crashPayload(link, {
            links: [{ kind: 'ait', target_id: randomUUID() }],
          }),
          { localEntityId: link },
        ),
      ]),
    );
    expect(response.status, JSON.stringify(response.body)).toBe(200);
    const [validReceipt, invalidReceipt, evidenceReceipt, linkReceipt] =
      response.body.receipts as Row[];
    expect(validReceipt).toMatchObject({
      status: 'applied',
      server_entity_id: expect.any(String),
    });
    expect(invalidReceipt).toMatchObject({
      status: 'rejected',
      error_code: 'BOAT.SYNC_INVALID_CRASH_RECORD',
      server_entity_id: null,
    });
    expect(evidenceReceipt).toMatchObject({
      status: 'applied',
      server_entity_id: expect.any(String),
    });
    expect(linkReceipt).toMatchObject({
      status: 'applied',
      server_entity_id: expect.any(String),
    });
    expect(JSON.stringify(response.body)).toContain(
      'BOAT.SYNC_EVIDENCE_PENDING',
    );
    expect(JSON.stringify(response.body)).toContain(
      'BOAT.SYNC_LINK_UNRESOLVED',
    );
    const invalidQueued = (await queueItems(deviceId)).find(
      (queued) => queued.local_entity_id === invalid,
    );
    expect(invalidQueued).toMatchObject({
      status: 'rejected',
      server_entity_id: null,
      error_code: 'BOAT.SYNC_INVALID_CRASH_RECORD',
    });
  });

  it('C-09-13 — dada chave natural já materializada quando outro crash-record chega então recibo conflict BOAT.SYNC_DUPLICATE_NATURAL_KEY sem conflito na fila do supervisor', async () => {
    const deviceId = randomUUID();
    const first = randomUUID();
    const second = randomUUID();
    const occurredAt = iso(
      Date.parse('2033-01-01T10:00:00Z') +
        Math.floor(Math.random() * 500_000) * 60_000,
    );
    const naturalKey = { occurred_at: occurredAt, recorded_at: occurredAt };
    const firstResponse = await submit(
      batch(deviceId, [
        item('crash-record', crashPayload(first, { record: naturalKey }), {
          localEntityId: first,
        }),
      ]),
    );
    expect(firstResponse.body.receipts[0]).toMatchObject({
      status: 'applied',
    });
    const secondResponse = await submit(
      batch(deviceId, [
        item('crash-record', crashPayload(second, { record: naturalKey }), {
          localEntityId: second,
        }),
      ]),
    );
    expect(secondResponse.body.receipts[0]).toMatchObject({
      status: 'conflict',
      error_code: 'BOAT.SYNC_DUPLICATE_NATURAL_KEY',
      server_entity_id: null,
    });
    expect(await conflicts(deviceId)).toEqual([]);
  });
});

describe('CTG-0009 C-09-14/15/16 — compatibilidade offline vinculante', () => {
  it('C-09-14 — dado lote com 101 itens de tipo suportado sem destino montado quando sincronizado então 200, 101 recibos received TEAT.SYNC_DESTINATION_NOT_WIRED e nenhum 400 por tamanho', async () => {
    const items = Array.from({ length: 101 }, () => unwiredItem());
    const response = await submit(batch(randomUUID(), items));
    expect(response.status, JSON.stringify(response.body).slice(0, 500)).toBe(
      200,
    );
    expect(response.body.accepted_items).toBe(101);
    expect(response.body.receipts).toHaveLength(101);
    for (const receipt of response.body.receipts as Row[])
      expect(receipt).toMatchObject({
        status: 'received',
        error_code: 'TEAT.SYNC_DESTINATION_NOT_WIRED',
      });
  }, 90_000);

  it('C-09-15 — dado item sem idempotency_key em lote sem batch_sequence quando enviado e reenviado então recibo received legado com a chave sintética, sem novo item, e o próximo lote sequenciado ainda é 1', async () => {
    const deviceId = randomUUID();
    const legacy = unwiredItem({ idempotencyKey: null });
    const first = await submit(batch(deviceId, [legacy]));
    expect(first.status, JSON.stringify(first.body)).toBe(200);
    expect(first.body.batch_sequence).toBeNull();
    const syntheticKey = `legacy:${deviceId}:${String(legacy.local_entity_id)}`;
    expect(first.body.receipts[0]).toMatchObject({
      status: 'received',
      error_code: 'TEAT.SYNC_LEGACY_ITEM_NOT_APPLIED',
      idempotency_key: syntheticKey,
      server_entity_id: null,
    });
    const resent = await submit(batch(deviceId, [legacy]));
    expect(resent.status).toBe(200);
    expect(resent.body.receipts).toEqual(first.body.receipts);
    expect(await queueItems(deviceId)).toHaveLength(1);
    const sequenced = await submit(
      batch(deviceId, [unwiredItem()], { batch_sequence: 1 }),
    );
    expect(sequenced.status, JSON.stringify(sequenced.body)).toBe(200);
    expect(sequenced.body.batch_sequence).toBe(1);
  });

  it('C-09-16 — dado lote fechado quando retransmitido com o mesmo conjunto, com chave a mais, a menos ou outra sequência então mesmo batchId e recibos, ou 409 TEAT.SYNC_BATCH_REPLAY_CONTEXT_MISMATCH', async () => {
    const deviceId = randomUUID();
    const items = [unwiredItem(), unwiredItem()];
    const body = batch(deviceId, items, { batch_sequence: 1 });
    const first = await submit(body);
    expect(first.status, JSON.stringify(first.body)).toBe(200);
    const replay = await submit(body);
    expect(replay.status).toBe(200);
    expect(replay.body).toEqual(first.body);
    for (const variant of [
      { ...body, items: [...items, unwiredItem()] },
      { ...body, items: [items[0]] },
      { ...body, batch_sequence: 2 },
    ]) {
      const response = await submit(variant);
      expect(response.status).toBe(409);
      expect(response.body).toMatchObject({
        code: 'TEAT.SYNC_BATCH_REPLAY_CONTEXT_MISMATCH',
        context: { deviceBatchId: body.device_batch_id },
      });
    }
    expect(await queueItems(deviceId)).toHaveLength(2);
  });
});

describe('CTG-0009 C-09-17 — conflito de hash', () => {
  it('C-09-17 — dado chave aceita quando volta com outro payload_hash então recibo rejected com os dois hashes, conflito integrity aberto e o recibo original inalterado', async () => {
    const deviceId = randomUUID();
    const itemKey = key('hash');
    const original = unwiredItem({ idempotencyKey: itemKey });
    expect((await submit(batch(deviceId, [original]))).status).toBe(200);
    const before = await receiptByKey(itemKey);
    expect(before.status).toBe(200);
    const changed = unwiredItem({
      idempotencyKey: itemKey,
      localEntityId: String(original.local_entity_id),
    });
    const response = await submit(batch(deviceId, [changed]));
    expect(response.body.receipts[0]).toMatchObject({
      status: 'rejected',
      error_code: 'TEAT.SYNC_INTEGRITY_ERROR',
      details_json: {
        idempotencyKey: itemKey,
        storedHash: original.payload_hash,
        receivedHash: changed.payload_hash,
      },
    });
    expect(await conflicts(deviceId)).toEqual([
      expect.objectContaining({
        conflict_type: 'integrity',
        reason_code: 'TEAT.SYNC_INTEGRITY_ERROR',
        local_hash: changed.payload_hash,
        server_hash: original.payload_hash,
        allowed_resolution_actions: [
          'accept_server',
          'reject',
          'retry_after_correction',
        ],
        status: 'open',
      }),
    ]);
    const after = await receiptByKey(itemKey);
    expect(after.body).toEqual(before.body);
  });
});

describe('CTG-0009 C-09-19 — TTL da reserva pelo catálogo', () => {
  it('C-09-19 — dado a linha teat.numbering.reservation_ttl_hours do escopo quando reserva sem valid_until então valid_until acompanha o valor da linha, 422 com a linha nula e o valid_until do pedido quando vem', async () => {
    const agencyId = randomUUID();
    const rowId = await scopedParameter(
      'teat.numbering.reservation_ttl_hours',
      agencyId,
      5,
    );
    const range = await createRange(10);
    for (const hours of [5, 7]) {
      await updateParameter(rowId, hours);
      const t0 = Date.now();
      const response = await reserve(
        reserveBody(range.id, { traffic_agency_id: agencyId }),
      );
      const t1 = Date.now();
      expect(response.status, JSON.stringify(response.body)).toBe(201);
      const validUntil = Date.parse(String(response.body.valid_until));
      expect(validUntil).toBeGreaterThanOrEqual(t0 + hours * 3_600_000);
      expect(validUntil).toBeLessThanOrEqual(t1 + hours * 3_600_000);
    }
    await updateParameter(rowId, null);
    const withoutTtl = await reserve(
      reserveBody(range.id, { traffic_agency_id: agencyId }),
    );
    expect(withoutTtl.status).toBe(422);
    expect(withoutTtl.body).toMatchObject({
      code: 'TEAT.VALIDATION_FAILED',
      context: { fields: [{ path: 'valid_until', rule: 'required' }] },
    });
    const explicit = iso(Date.now() + 48 * 3_600_000);
    const withValidUntil = await reserve(
      reserveBody(range.id, {
        traffic_agency_id: agencyId,
        valid_until: explicit,
      }),
    );
    expect(withValidUntil.status, JSON.stringify(withValidUntil.body)).toBe(
      201,
    );
    expect(withValidUntil.body.valid_until).toBe(explicit);
  });
});

describe('CTG-0009 C-09-20 — janela de concorrência pelo catálogo', () => {
  it('C-09-20 — dado sync.concurrency_window_minutes nulo no escopo quando dois ait concorrentes chegam então warnings SYNC_CONCURRENCY_WINDOW_SOURCE_PENDING e nenhum conflito', async () => {
    const agencyId = randomUUID();
    await scopedParameter('sync.concurrency_window_minutes', agencyId, null);
    const first = randomUUID();
    const second = randomUUID();
    const at = slot(7);
    const legacy = await legacyAit(first, at, agencyId);
    expect(legacy.response.body.warnings).toEqual([
      'SYNC_CONCURRENCY_WINDOW_SOURCE_PENDING',
    ]);
    const current = await validAit(second, at + 3 * 60_000, agencyId);
    expect(current.response.body.warnings).toEqual([
      'SYNC_CONCURRENCY_WINDOW_SOURCE_PENDING',
    ]);
    expect(current.response.body.receipts[0]).toMatchObject({
      status: 'applied',
    });
    for (const deviceId of [first, second])
      expect(await conflicts(deviceId)).toEqual([]);
  });

  it('C-09-20 — dado dois ait a 3 minutos quando a janela do escopo é 2 e depois 10 então sem suspeita e depois com suspeita', async () => {
    for (const [minutes, slotIndex, suspected] of [
      [2, 8, false],
      [10, 9, true],
    ] as const) {
      const agencyId = randomUUID();
      await scopedParameter(
        'sync.concurrency_window_minutes',
        agencyId,
        minutes,
      );
      const first = randomUUID();
      const second = randomUUID();
      const at = slot(slotIndex);
      await legacyAit(first, at, agencyId);
      const current = await validAit(second, at + 3 * 60_000, agencyId);
      expect(current.response.body.warnings).toEqual([]);
      expect(current.response.body.receipts[0]).toMatchObject({
        status: suspected ? 'conflict' : 'applied',
        error_code: suspected ? 'TEAT.SYNC_CONCURRENCY_SUSPECT' : null,
      });
      expect((await conflicts(second)).length).toBe(suspected ? 1 : 0);
    }
  }, 60_000);
});

describe('CTG-0009 C-09-21 — rollback real do item', () => {
  it('C-09-21 — dado applier real que falha depois do efeito de domínio quando o lote chega então nenhum agregado, consumo ou evento de aplicação; recibo e fila rejected com o código; sync.batch.received de recusa existe; o outro item segue', async () => {
    const stream = await openStream();
    try {
      const range = await createRange(1);
      const deviceId = randomUUID();
      const reservation = await aitReservation(range.id, deviceId);
      const failing = item(
        'ait',
        aitPayload({
          number: reservation.start_number,
          deviceId,
          at: slot(10),
        }),
        { at: slot(10) },
      );
      failAfterApply.add(String(failing.local_entity_id));
      const crashId = randomUUID();
      const response = await submit(
        batch(deviceId, [
          failing,
          item('crash-record', crashPayload(crashId), {
            localEntityId: crashId,
          }),
        ]),
      );
      expect(response.status, JSON.stringify(response.body)).toBe(200);
      expect(response.body.receipts[0]).toMatchObject({
        status: 'rejected',
        error_code: 'TEAT.NUMBERING_NUMBER_ALREADY_APPLIED',
        server_entity_id: null,
      });
      expect(response.body.receipts[1]).toMatchObject({
        status: 'applied',
        server_entity_id: expect.any(String),
      });
      const failedQueued = (await queueItems(deviceId)).find(
        (queued) => queued.local_entity_id === failing.local_entity_id,
      );
      expect(failedQueued).toMatchObject({
        status: 'rejected',
        server_entity_id: null,
        error_code: 'TEAT.NUMBERING_NUMBER_ALREADY_APPLIED',
      });
      expect((await consumption(reservation.id)).body.consumption).toEqual([]);
      const events = await stream.waitFor((all) =>
        ofType(all, SYNC_BATCH_RECEIVED).some(
          (event) => event.data.data?.itemId === failedQueued!.id,
        ),
      );
      await stream.settle();
      expect(
        ofType(events, SYNC_BATCH_RECEIVED)
          .filter((event) => event.data.data?.itemId === failedQueued!.id)
          .map((event) => event.data.data),
      ).toEqual([
        expect.objectContaining({
          receiptStatus: 'rejected',
          errorCode: 'TEAT.NUMBERING_NUMBER_ALREADY_APPLIED',
          serverEntityId: null,
        }),
      ]);
      expect(ofType(events, AIT_CHANGED)).toEqual([]);

      // O número não ficou preso a um AIT revertido: o mesmo número aplica.
      failAfterApply.delete(String(failing.local_entity_id));
      const retry = await submit(
        batch(deviceId, [
          item(
            'ait',
            aitPayload({
              number: reservation.start_number,
              deviceId,
              at: slot(10),
            }),
            { at: slot(10) },
          ),
        ]),
      );
      expect(retry.body.receipts[0], JSON.stringify(retry.body)).toMatchObject({
        status: 'applied',
      });
    } finally {
      stream.close();
    }
  }, 60_000);
});

describe('CTG-0009 C-09-24/25 — agente de negócio e tenant do contexto', () => {
  it('C-09-24 — dado agent_id diferente do principal no lote e na reserva quando enviados então o agent_id persistido e publicado é o do corpo', async () => {
    const stream = await openStream();
    try {
      const businessAgent = randomUUID();
      expect(businessAgent).not.toBe(ACTOR_ID);
      const deviceId = randomUUID();
      const response = await submit(
        batch(deviceId, [unwiredItem()], { agent_id: businessAgent }),
      );
      expect(response.status).toBe(200);
      const [queued] = await queueItems(deviceId);
      expect(queued).toMatchObject({ agent_id: businessAgent });
      const range = await createRange(10);
      const reserved = await reserve(
        reserveBody(range.id, { agent_id: businessAgent }),
      );
      expect(reserved.status).toBe(201);
      const events = await stream.waitFor((all) =>
        ofType(all, NUMBERING_CHANGED).some(
          (event) => event.data.aggregate?.id === reserved.body.id,
        ),
      );
      expect(
        ofType(events, NUMBERING_CHANGED).find(
          (event) => event.data.aggregate?.id === reserved.body.id,
        )?.data.data,
      ).toMatchObject({ agentId: businessAgent });
    } finally {
      stream.close();
    }
  }, 60_000);

  it('C-09-25 — dado tenant_id de outro tenant no corpo quando o lote chega então tudo persiste no tenant do contexto', async () => {
    const deviceId = randomUUID();
    const otherTenant = randomUUID();
    const unwired = unwiredItem();
    const response = await submit(
      batch(deviceId, [unwired], { tenant_id: otherTenant }),
    );
    expect(response.status, JSON.stringify(response.body)).toBe(200);
    const [queued] = await queueItems(deviceId);
    expect(queued).toMatchObject({ tenant_id: TENANT_ID });
    expect(
      (await receiptByKey(String(unwired.idempotency_key))).body,
    ).toMatchObject({ tenant_id: TENANT_ID, status: 'received' });
    const foreign = await receiptByKey(
      String(unwired.idempotency_key),
      otherTenant,
    );
    expect(foreign.status).toBe(404);
    expect(foreign.body.code).toBe('TEAT.TENANT_MISMATCH');
  });
});

describe('CTG-0009 C-09-26 — eventos pela trilha pública', () => {
  it('C-09-26 — dado os fluxos de reserva, lote, concorrência e resolução quando o SSE do TEAT é lido então os seis tipos de #14 aparecem e nenhum outro tipo aparece por causa deles', async () => {
    const stream = await openStream();
    try {
      const agencyId = randomUUID();
      await scopedParameter('sync.concurrency_window_minutes', agencyId, 10);
      const first = randomUUID();
      const second = randomUUID();
      const at = slot(11);
      await legacyAit(first, at, agencyId);
      const suspect = await validAit(second, at + 3 * 60_000, agencyId);
      expect(suspect.response.body.receipts[0]).toMatchObject({
        status: 'conflict',
      });
      const plain = await validAit(randomUUID(), slot(12), AGENCY_ID);
      expect(plain.response.body.receipts[0]).toMatchObject({
        status: 'applied',
      });
      const integrity = await integrityConflict();
      expect(
        (
          await resolve(integrity.conflictId, {
            resolved_by_user_ref: ACTOR_ID,
            resolution_action: 'reject',
          })
        ).status,
      ).toBe(200);
      const events = await stream.waitFor((all) =>
        OFFLINE_EVENT_TYPES.every((type) => ofType(all, type).length > 0),
      );
      await stream.settle();
      for (const type of OFFLINE_EVENT_TYPES)
        expect(ofType(events, type).length, type).toBeGreaterThan(0);
      expect(
        [...new Set(stream.events.map((event) => event.type))].filter(
          (type) => !(OFFLINE_EVENT_TYPES as readonly string[]).includes(type),
        ),
      ).toEqual([]);
    } finally {
      stream.close();
    }
  }, 90_000);
});
