import { randomUUID } from 'node:crypto';
import http, { type IncomingMessage } from 'node:http';
import type { NestFactory } from '@nestjs/core';
import pg from 'pg';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

/**
 * CTG-0004 §7 e §11 (R-0008, TASK-0008) — C-0004-41…46: `GET /v1/ops/stream`
 * (M17). A rota não existe hoje (`teat-stream.controller.ts` nasce em
 * TASK-0009) — toda conexão abaixo recebe 404 imediatamente, nunca um corpo
 * `text/event-stream`; vermelho até TASK-0009 (regra 7 do prompt).
 *
 * Leitura em streaming via `http.get` no servidor real do app
 * (`app.listen(0)`), lendo o corpo aos pedaços com timeout — nota do
 * maestro (item f): supertest não expõe bem corpos que nunca terminam.
 *
 * C-0004-42 / §16.2 (adenda do maestro, 2026-09-16, após delivery-review
 * ciclo 1 — OD-T64, ratificada): o cenário literal do contrato ("um evento
 * `ait.changed` recebido por quem tem `inf:ait:read` e não por quem não
 * tem") não é construtível com os papéis canônicos hoje — os oito papéis
 * que `ops:stream:read` concede (CTG-0004 §8) são exatamente os nove de
 * `INF_READ_ROLES` menos `bi-analyst`, e todos eles já têm `inf:ait:read`
 * via `INF_SURFACE_RULES` (backend/domains/shared/src/policy.ts, verificado
 * por leitura direta). Não há papel TEAT canônico que possa abrir o stream
 * e não possa ler AIT. O Architect resolveu formalmente (§16.2): o critério
 * passa a ser "um assinante sem a chave de leitura do recurso de um evento
 * não o recebe", provado com `integration.item.changed`/`ops:integration:read`
 * (só `integration-operator`/`technical-admin` têm essa chave entre os oito
 * papéis do stream) — a tabela §7.2 continua valendo para
 * `ait.changed` → `inf:ait:read`; a substituição por outro par recurso/chave
 * é a prova aceita, não uma pendência.
 *
 * Perfil local: variáveis antes do `import` dinâmico de `app.module.js`
 * (mesmo padrão de `teat-evidence-normative.e2e.spec.ts`).
 */

const { Client } = pg;

const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
/** Criado em `beforeAll` (não é fixture canônica: `integration.outbox.tenant_id`
 * tem FK para `auth.tenants`, então C-0004-46 precisa de um tenant real). */
let OTHER_TENANT_ID: string;
const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
const AIT_ID = '00000000-0000-7000-8000-0000f0000001';

const connectionString =
  process.env.DETRAN_TEST_DATABASE_URL ??
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5432/detran';
const client = new Client({ connectionString });

let app: Awaited<ReturnType<typeof NestFactory.create>>;
let port: number;
const previousEnv: Record<string, string | undefined> = {};
const createdOutboxIds: string[] = [];
const openRequests: http.ClientRequest[] = [];

function headers(role: string): Record<string, string> {
  process.env.DETRAN_LOCAL_ROLES = role;
  return {
    authorization: 'Bearer local',
    'x-tenant-id': TENANT_ID,
    accept: 'text/event-stream',
  };
}

interface SseEvent {
  id?: string;
  event?: string;
  data?: string;
}

interface StreamResult {
  status: number;
  headers: Record<string, string | string[] | undefined>;
  events: SseEvent[];
}

/** Lê o stream por até `timeoutMs`, parando antes se `stopAfter` eventos chegarem. */
function readStream(
  path: string,
  requestHeaders: Record<string, string>,
  {
    timeoutMs = 3500,
    stopAfter = Infinity,
  }: { timeoutMs?: number; stopAfter?: number } = {},
): Promise<StreamResult> {
  return new Promise((resolve, reject) => {
    const req = http.get(
      { host: '127.0.0.1', port, path, headers: requestHeaders },
      (res: IncomingMessage) => {
        const events: SseEvent[] = [];
        let buffer = '';
        let current: SseEvent = {};
        let settled = false;
        const finish = () => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          req.destroy();
          resolve({
            status: res.statusCode ?? 0,
            headers: res.headers,
            events,
          });
        };
        const timer = setTimeout(finish, timeoutMs);
        if (res.statusCode !== 200) {
          finish();
          return;
        }
        res.on('data', (chunk: Buffer) => {
          buffer += chunk.toString('utf8');
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';
          for (const line of lines) {
            const trimmed = line.replace(/\r$/, '');
            if (trimmed === '') {
              if (Object.keys(current).length > 0) events.push(current);
              current = {};
              if (events.length >= stopAfter) finish();
              continue;
            }
            if (trimmed.startsWith(':')) continue; // heartbeat comment
            const separator = trimmed.indexOf(':');
            if (separator === -1) continue;
            const field = trimmed.slice(0, separator);
            const value = trimmed.slice(separator + 1).trimStart();
            if (field === 'id') current.id = value;
            else if (field === 'event') current.event = value;
            else if (field === 'data') current.data = value;
          }
        });
        res.on('end', finish);
        res.on('error', finish);
      },
    );
    openRequests.push(req);
    req.on('error', (error) => {
      if ((error as NodeJS.ErrnoException).code === 'ECONNRESET') return;
      reject(error);
    });
  });
}

async function insertOutboxRow(
  tenantId: string,
  topic: string,
  domainEvent: string,
  aggregateId: string,
  createdAt?: string,
): Promise<string> {
  await client.query(`select set_config('app.role', 'owner', false)`);
  const envelope = {
    type: topic,
    domainEvent,
    version: 1,
    occurredAt: new Date().toISOString(),
    tenantId,
    actor: { kind: 'user', id: ACTOR_ID },
    correlationId: randomUUID(),
    aggregate: { kind: 'ait', id: aggregateId, version: 1 },
    data: { aitId: aggregateId },
  };
  const result = await client.query<{ id: string }>(
    `insert into integration.outbox
       (tenant_id, topic, aggregate_type, aggregate_id, payload, idempotency_key, status, created_at, available_at)
     values ($1, $2, 'ait', $3, $4::jsonb, $5, 'pending', coalesce($6::timestamptz, now()), coalesce($6::timestamptz, now()))
     returning id`,
    [
      tenantId,
      topic,
      aggregateId,
      JSON.stringify(envelope),
      `${topic}:${aggregateId}:${randomUUID()}`,
      createdAt ?? null,
    ],
  );
  const id = result.rows[0]!.id;
  createdOutboxIds.push(id);
  return id;
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
  OTHER_TENANT_ID = randomUUID();
  await client.query(
    `insert into auth.tenants (id, slug, name) values ($1, $2, $3)`,
    [
      OTHER_TENANT_ID,
      `teat-stream-other-${OTHER_TENANT_ID.slice(0, 8)}`,
      'Other tenant (C-0004-46)',
    ],
  );

  const { NestFactory: factory } = await import('@nestjs/core');
  const { AppModule } = await import('../../src/app.module.js');
  app = await factory.create(AppModule.forRoot(), {
    logger: false,
    abortOnError: false,
  });
  await app.init();
  await app.listen(0);
  const address = app.getHttpServer().address();
  port = typeof address === 'object' && address ? address.port : 0;
});

afterEach(async () => {
  for (const req of openRequests.splice(0)) req.destroy();
  if (createdOutboxIds.length > 0) {
    await client.query(`select set_config('app.role', 'owner', false)`);
    await client.query(
      `delete from integration.outbox where id = any($1::uuid[])`,
      [createdOutboxIds.splice(0)],
    );
  }
});

afterAll(async () => {
  await app?.close();
  await client.query(`select set_config('app.role', 'owner', false)`);
  await client.query(`delete from auth.tenants where id = $1`, [
    OTHER_TENANT_ID,
  ]);
  await client.end();
  for (const [key, value] of Object.entries(previousEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

describe('CTG-0004 §7.1 — GET /v1/ops/stream: guarda de política (C-0004-41)', () => {
  it('C-0004-41 — dado DETRAN_LOCAL_ROLES=field-agent quando GET /v1/ops/stream então 200 com content-type text/event-stream', async () => {
    const result = await readStream('/v1/ops/stream', headers('field-agent'), {
      timeoutMs: 1500,
    });
    expect(result.status).toBe(200);
    expect(String(result.headers['content-type'])).toContain(
      'text/event-stream',
    );
  });

  it('C-0004-41 — dado um papel PEC (CANDIDATO) quando GET /v1/ops/stream então 403', async () => {
    const result = await readStream('/v1/ops/stream', headers('CANDIDATO'), {
      timeoutMs: 1500,
    });
    expect(result.status).toBe(403);
  });
});

describe('CTG-0004 §7.2/§16.2 — filtro por papel/recurso (C-0004-42, OD-T64 ratificada)', () => {
  it('dado um evento integration.item.changed então integration-operator (tem ops:integration:read) o recebe', async () => {
    const streamPromise = readStream(
      '/v1/ops/stream',
      headers('integration-operator'),
      { timeoutMs: 3000, stopAfter: 1 },
    );
    await new Promise((resolve) => setTimeout(resolve, 200));
    await insertOutboxRow(
      TENANT_ID,
      'integration.item.changed',
      'INTEGRATION_ITEM_CHANGED',
      AIT_ID,
    );
    const result = await streamPromise;
    expect(
      result.events.some((event) => event.event === 'integration.item.changed'),
    ).toBe(true);
  });

  it('dado o mesmo evento então field-agent (sem ops:integration:read) não o recebe', async () => {
    const streamPromise = readStream('/v1/ops/stream', headers('field-agent'), {
      timeoutMs: 2000,
    });
    await new Promise((resolve) => setTimeout(resolve, 200));
    await insertOutboxRow(
      TENANT_ID,
      'integration.item.changed',
      'INTEGRATION_ITEM_CHANGED',
      AIT_ID,
    );
    const result = await streamPromise;
    expect(
      result.events.some((event) => event.event === 'integration.item.changed'),
    ).toBe(false);
  });
});

describe('CTG-0004 §7.1 — replay por Last-Event-ID (C-0004-43, C-0004-44)', () => {
  it('C-0004-43 — dado Last-Event-ID de um evento de 1h atrás então o replay reenvia, em ordem, só os posteriores', async () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const lastEventId = await insertOutboxRow(
      TENANT_ID,
      'ait.changed',
      'AIT_CHANGED',
      AIT_ID,
      oneHourAgo,
    );
    const laterId = await insertOutboxRow(
      TENANT_ID,
      'ait.changed',
      'AIT_CHANGED',
      AIT_ID,
    );
    // `?topics=ait.changed` isola este caso de outros eventos reais no
    // mesmo tenant (measure.changed/alcohol.changed de
    // teat-measures-alcohol.e2e.spec.ts, que roda antes deste arquivo e
    // publica de verdade agora que os comandos existem) — sem o filtro, o
    // primeiro evento após o cursor pode não ser o `laterId` deste caso.
    const result = await readStream(
      '/v1/ops/stream?topics=ait.changed',
      { ...headers('field-agent'), 'last-event-id': lastEventId },
      { timeoutMs: 2000, stopAfter: 1 },
    );
    expect(result.events.map((event) => event.id)).toEqual([laterId]);
  });

  it('C-0004-44 — dado Last-Event-ID de um evento de 25h atrás então 204', async () => {
    const twentyFiveHoursAgo = new Date(
      Date.now() - 25 * 60 * 60 * 1000,
    ).toISOString();
    const staleId = await insertOutboxRow(
      TENANT_ID,
      'ait.changed',
      'AIT_CHANGED',
      AIT_ID,
      twentyFiveHoursAgo,
    );
    const result = await readStream(
      '/v1/ops/stream',
      { ...headers('field-agent'), 'last-event-id': staleId },
      { timeoutMs: 1500 },
    );
    expect(result.status).toBe(204);
  });
});

describe('CTG-0004 §7.1 — filtro ?topics= (C-0004-45)', () => {
  it('C-0004-45 — dado ?topics=ait.changed então só eventos desse tipo chegam', async () => {
    const streamPromise = readStream(
      '/v1/ops/stream?topics=ait.changed',
      headers('integration-operator'),
      { timeoutMs: 3000, stopAfter: 1 },
    );
    await new Promise((resolve) => setTimeout(resolve, 200));
    await insertOutboxRow(
      TENANT_ID,
      'integration.item.changed',
      'INTEGRATION_ITEM_CHANGED',
      AIT_ID,
    );
    await insertOutboxRow(TENANT_ID, 'ait.changed', 'AIT_CHANGED', AIT_ID);
    const result = await streamPromise;
    expect(result.events.every((event) => event.event === 'ait.changed')).toBe(
      true,
    );
    expect(result.events.length).toBeGreaterThan(0);
  });
});

describe('CTG-0004 §7.1 — isolamento de tenant (C-0004-46)', () => {
  it('C-0004-46 — dado um evento de outro tenant então ele nunca chega ao assinante, e tenantId não aparece em data', async () => {
    // `?topics=ait.changed`: isola de outros eventos reais e legítimos do
    // PRÓPRIO tenant a001 (measure.changed/alcohol.changed publicados por
    // teat-measures-alcohol.e2e.spec.ts) — sem o filtro, `toHaveLength(0)`
    // falharia por ruído que nada tem a ver com isolamento de tenant.
    const streamPromise = readStream(
      '/v1/ops/stream?topics=ait.changed',
      headers('field-agent'),
      { timeoutMs: 2000 },
    );
    await new Promise((resolve) => setTimeout(resolve, 200));
    await insertOutboxRow(
      OTHER_TENANT_ID,
      'ait.changed',
      'AIT_CHANGED',
      AIT_ID,
    );
    const result = await streamPromise;
    expect(result.events).toHaveLength(0);
    for (const event of result.events) {
      expect(event.data ?? '').not.toContain(OTHER_TENANT_ID);
    }
  });
});
