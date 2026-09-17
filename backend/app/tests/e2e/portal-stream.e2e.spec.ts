import { randomUUID } from 'node:crypto';
import http, { type IncomingMessage } from 'node:http';
import type { INestApplication } from '@nestjs/common';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  AITS,
  CPF,
  LOCAL,
  TENANT_ID,
  asOwner,
  clearCitizenEnv,
  cpfHash,
  createPortalApp,
  importModule,
  newClient,
  resetLocalPortalRows,
  seedLocalTenant,
  setCitizen,
  subjectIdOf,
} from './portal-e2e.support.js';

/**
 * R-0009 CTG-0002 §2.7, §9 e §13 (TASK-0006) — C-0002-82: `GET /v1/portal/stream`
 * (M18) no padrão de teat-stream.e2e.spec.ts (servidor real via `app.listen(0)`,
 * leitura em streaming por `http.get`) com o poller MANUAL injetado em
 * `PORTAL_STREAM_POLLER` (§9: nenhum `setInterval` no controlador): as linhas
 * da outbox só chegam quando o teste dispara o tick, e o heartbeat só quando o
 * teste dispara a inscrição de heartbeat. Sem `PortalClock` fixo aqui: a
 * janela de replay (24 h) e o cursor inicial são o `now()` do banco, como no
 * TEAT. Fica vermelho até TASK-0008 criar `portal-stream.controller.ts`/
 * `portal-stream.service.ts` e registrar o provider no `AppModule` (§14).
 */
const client = newClient();
let app: INestApplication;
let port: number;
const openRequests: http.ClientRequest[] = [];
const createdOutboxIds: string[] = [];
const prata = { cpf: CPF.prata, level: 'avancada' as const };
const CASE_ID = '00000000-0000-7000-8000-007000700207';
const LINKED_REQUEST_ID = '00000000-0000-7000-8000-0000704000e8';
const OTHER_HASH = cpfHash(CPF.ouro);
let subjectId = '';
let HEARTBEAT_INTERVAL_MS = 0;

interface ManualSubscription {
  fn: () => void | Promise<void>;
  intervalMs: number | undefined;
  unsubscribe: ReturnType<typeof vi.fn>;
}

/** `TeatStreamPoller` manual (mesma porta reutilizada pelo Portal, §9). */
const poller = {
  subscriptions: [] as ManualSubscription[],
  port: {
    intervalMs: 1000,
    schedule: vi.fn((fn: () => void | Promise<void>, intervalMs?: number) => {
      const unsubscribe = vi.fn();
      poller.subscriptions.push({ fn, intervalMs, unsubscribe });
      return unsubscribe;
    }),
  },
  async firePolling(): Promise<void> {
    for (const subscription of [...poller.subscriptions]) {
      if (subscription.intervalMs !== HEARTBEAT_INTERVAL_MS)
        await subscription.fn();
    }
  },
  async fireHeartbeat(): Promise<void> {
    for (const subscription of [...poller.subscriptions]) {
      if (subscription.intervalMs === HEARTBEAT_INTERVAL_MS)
        await subscription.fn();
    }
  },
};

interface SseEvent {
  id?: string;
  event?: string;
  data?: string;
}

interface OpenStream {
  status: () => number;
  headers: () => Record<string, string | string[] | undefined>;
  events: SseEvent[];
  comments: string[];
  opened: Promise<void>;
  waitFor: (predicate: () => boolean, timeoutMs?: number) => Promise<void>;
  close: () => void;
}

function openStream(
  path: string,
  requestHeaders: Record<string, string>,
): OpenStream {
  const events: SseEvent[] = [];
  const comments: string[] = [];
  let status = 0;
  let responseHeaders: Record<string, string | string[] | undefined> = {};
  let resolveOpened!: () => void;
  const opened = new Promise<void>((resolve) => {
    resolveOpened = resolve;
  });
  const req = http.get(
    { host: '127.0.0.1', port, path, headers: requestHeaders },
    (res: IncomingMessage) => {
      status = res.statusCode ?? 0;
      responseHeaders = res.headers;
      let buffer = '';
      let current: SseEvent = {};
      if (status !== 200) {
        resolveOpened();
        res.resume();
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
            continue;
          }
          if (trimmed.startsWith(':')) {
            comments.push(trimmed);
            if (trimmed === ': connected') resolveOpened();
            continue;
          }
          const separator = trimmed.indexOf(':');
          if (separator === -1) continue;
          const field = trimmed.slice(0, separator);
          const value = trimmed.slice(separator + 1).trimStart();
          if (field === 'id') current.id = value;
          else if (field === 'event') current.event = value;
          else if (field === 'data') current.data = value;
        }
      });
      res.on('end', resolveOpened);
      res.on('error', resolveOpened);
    },
  );
  req.on('error', (error) => {
    if ((error as NodeJS.ErrnoException).code !== 'ECONNRESET') throw error;
  });
  openRequests.push(req);
  return {
    status: () => status,
    headers: () => responseHeaders,
    events,
    comments,
    opened,
    waitFor: (predicate, timeoutMs = 3000) =>
      new Promise((resolve, reject) => {
        const startedAt = Date.now();
        const check = () => {
          if (predicate()) return resolve();
          if (Date.now() - startedAt > timeoutMs)
            return reject(new Error('stream: condição não satisfeita a tempo'));
          setTimeout(check, 25);
        };
        check();
      }),
    close: () => req.destroy(),
  };
}

function citizenHeaders(): Record<string, string> {
  setCitizen(prata);
  return {
    authorization: 'Bearer local',
    'x-tenant-id': TENANT_ID,
    accept: 'text/event-stream',
  };
}

async function insertOutboxRow(
  topic: string,
  domainEvent: string | undefined,
  aggregate: { kind: string; id: string; version: number },
  data: Record<string, unknown>,
  createdAt?: string,
): Promise<string> {
  await asOwner(client);
  const envelope = {
    type: topic,
    ...(domainEvent ? { domainEvent } : {}),
    version: 1,
    occurredAt: new Date().toISOString(),
    tenantId: TENANT_ID,
    actor: { kind: 'user', id: subjectId },
    correlationId: randomUUID(),
    aggregate,
    data,
  };
  const result = await client.query<{ id: string }>(
    `with new_row as (select gen_random_uuid() as id)
     insert into integration.outbox (id, tenant_id, topic, aggregate_type, aggregate_id, payload, idempotency_key, status, created_at, available_at)
     select new_row.id, $1, $2, $3, $4, jsonb_set($5::jsonb, '{id}', to_jsonb(new_row.id::text)), $6, 'pending', coalesce($7::timestamptz, now()), coalesce($7::timestamptz, now())
       from new_row
     returning id`,
    [
      TENANT_ID,
      topic,
      aggregate.kind,
      aggregate.id,
      JSON.stringify(envelope),
      `${topic}:${aggregate.id}:${aggregate.version}:${randomUUID()}`,
      createdAt ?? null,
    ],
  );
  const id = result.rows[0]!.id;
  createdOutboxIds.push(id);
  return id;
}

const REQUEST_CHANGED = 'portal.request.changed';
const DECISION_PUBLISHED = 'rait.decision.published';
const PAYMENT_CONFIRMED = 'inf.payment.confirmed';
const INFRACTION_CHANGED = 'inf.infraction.changed';

beforeAll(async () => {
  process.env.DETRAN_RUNTIME_PROFILE = 'test';
  process.env.DETRAN_LOCAL_ROLES = 'CIDADAO';
  await client.connect();
  await seedLocalTenant(client);
  await resetLocalPortalRows(client);

  const stream = (await importModule('../../src/portal-stream.service.js')) as {
    PORTAL_STREAM_POLLER: symbol;
  };
  const teat = (await importModule('../../src/teat-stream.service.js')) as {
    HEARTBEAT_INTERVAL_MS: number;
  };
  HEARTBEAT_INTERVAL_MS = teat.HEARTBEAT_INTERVAL_MS;
  app = await createPortalApp(
    [{ token: stream.PORTAL_STREAM_POLLER, value: poller.port }],
    { fixedClock: false },
  );
  await app.listen(0);
  const address = app.getHttpServer().address();
  port = typeof address === 'object' && address ? address.port : 0;

  subjectId = await subjectIdOf(app, prata);
  await asOwner(client);
  await client.query(
    `insert into portal.infraction_view (id, tenant_id, ait_id, subject_cpf_hash, ait_number, plate, occurred_at, framing_label, amount, situation, deadlines_json, points_status, actions_json, notices_json, payment_json, last_event_id, last_event_version)
     values ($1, $2, $3, $4, 'FIX-00000e1', 'FIX2EE1', '2026-05-01T12:00:00-04:00', 'fixture', 195.23, 'aguardando_defesa', '[]'::jsonb, 'none', '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, '00000000-0000-0000-0000-000000000000', 0)`,
    [LOCAL.infractionView(1), TENANT_ID, AITS.f2, cpfHash(CPF.prata)],
  );
  await client.query(
    `insert into portal.request (id, tenant_id, state, service_key, subject_id, target_kind, target_id, channel, delegation_domain, delegation_command, delegation_external_id, delegation_status, minimum_assurance, version)
     values ($1, $2, 'EM_ANDAMENTO_NO_ORGAO', 'defesa_previa', $3, 'ait', $4, 'portal', 'inf', 'inf:rait-case:protocol', $5, 'delegated', 'avancada', 4)`,
    [LINKED_REQUEST_ID, TENANT_ID, subjectId, AITS.f2, CASE_ID],
  );
}, 60_000);

afterEach(async () => {
  for (const req of openRequests.splice(0)) req.destroy();
  poller.subscriptions.length = 0;
  clearCitizenEnv();
  if (createdOutboxIds.length > 0) {
    await asOwner(client);
    await client.query(
      `delete from integration.outbox where id = any($1::uuid[])`,
      [createdOutboxIds.splice(0)],
    );
  }
});

afterAll(async () => {
  await app?.close();
  await client.end();
  delete process.env.DETRAN_LOCAL_ROLES;
  delete process.env.DETRAN_LOCAL_ASSURANCE_LEVEL;
  delete process.env.DETRAN_LOCAL_CPF;
  delete process.env.DETRAN_LOCAL_GOVBR_LEVEL;
  delete process.env.DETRAN_PORTAL_HOST_RESOLUTION;
});

describe('CTG-0002 §9 — GET /v1/portal/stream (C-0002-82)', () => {
  it('C-0002-82 — dado conexão CIDADAO então 200 text/event-stream com `: connected`; dado papel fora da matriz então 403; dado sem sessão então 401/403', async () => {
    const stream = openStream('/v1/portal/stream', citizenHeaders());
    await stream.opened;
    expect(stream.status()).toBe(200);
    expect(String(stream.headers()['content-type'])).toContain(
      'text/event-stream',
    );
    expect(stream.comments).toContain(': connected');
    expect(poller.port.schedule).toHaveBeenCalled();
    stream.close();

    setCitizen({ cpf: CPF.prata, level: 'avancada', roles: 'field-agent' });
    const denied = openStream('/v1/portal/stream', {
      authorization: 'Bearer local',
      'x-tenant-id': TENANT_ID,
      accept: 'text/event-stream',
    });
    await denied.opened;
    expect(denied.status()).toBe(403);
    denied.close();

    const anonymous = openStream('/v1/portal/stream', {
      'x-tenant-id': TENANT_ID,
      accept: 'text/event-stream',
    });
    await anonymous.opened;
    expect([401, 403]).toContain(anonymous.status());
    anonymous.close();
  });

  it("C-0002-82 — dado linhas 'portal.request.changed' (hash do sujeito e de outro), 'rait.decision.published' e 'inf.payment.confirmed' quando o poller manual dispara então só os frames do sujeito, reformatados por tipo, nunca com tenantId", async () => {
    const stream = openStream('/v1/portal/stream', citizenHeaders());
    await stream.opened;
    expect(stream.status()).toBe(200);

    const requestId = LINKED_REQUEST_ID;
    const mine = await insertOutboxRow(
      REQUEST_CHANGED,
      'SOLICITACAO_PROTOCOLADA',
      { kind: 'portal.request', id: requestId, version: 2 },
      {
        requestId,
        serviceKey: 'defesa_previa',
        fromState: 'PEDIDO_EM_COMPOSICAO',
        toState: 'PROTOCOLADO',
        subjectId,
        subjectCpfHash: cpfHash(CPF.prata),
        protocolNumber: 'LOCAL-E2E-2026-9000009',
      },
    );
    const otherRequestId = randomUUID();
    await insertOutboxRow(
      REQUEST_CHANGED,
      'SOLICITACAO_CRIADA',
      { kind: 'portal.request', id: otherRequestId, version: 1 },
      {
        requestId: otherRequestId,
        serviceKey: 'consulta_multas',
        fromState: null,
        toState: 'PEDIDO_EM_COMPOSICAO',
        subjectId: randomUUID(),
        subjectCpfHash: OTHER_HASH,
      },
    );
    const decision = await insertOutboxRow(
      DECISION_PUBLISHED,
      'RAIT_DECISAO_PUBLICADA',
      { kind: 'case', id: CASE_ID, version: 3 },
      {
        caseId: CASE_ID,
        decisionId: '00000000-0000-7000-8000-007000700409',
        decisionKind: 'indeferido',
        publishedOn: '2026-09-12',
        channel: 'portal',
      },
    );
    await insertOutboxRow(
      DECISION_PUBLISHED,
      'RAIT_DECISAO_PUBLICADA',
      { kind: 'case', id: randomUUID(), version: 3 },
      {
        caseId: randomUUID(),
        decisionId: randomUUID(),
        decisionKind: 'deferido',
        publishedOn: '2026-09-12',
        channel: 'portal',
      },
    );
    const payment = await insertOutboxRow(
      PAYMENT_CONFIRMED,
      'PAGAMENTO_CONFIRMADO',
      { kind: 'payment', id: randomUUID(), version: 1 },
      {
        paymentId: randomUUID(),
        documentId: randomUUID(),
        infractionId: '00000000-0000-7000-8000-0000d0000002',
        aitId: AITS.f2,
        tier: 'desconto_80',
        paidOn: '2026-09-10',
        amount: 156.18,
      },
    );
    await insertOutboxRow(
      PAYMENT_CONFIRMED,
      'PAGAMENTO_CONFIRMADO',
      { kind: 'payment', id: randomUUID(), version: 1 },
      {
        paymentId: randomUUID(),
        documentId: randomUUID(),
        infractionId: '00000000-0000-7000-8000-0000d0000001',
        aitId: AITS.f1,
        tier: 'desconto_80',
        paidOn: '2026-09-10',
        amount: 156.18,
      },
    );
    await insertOutboxRow(
      INFRACTION_CHANGED,
      'INFRACAO_ESTADO_ALTERADO',
      { kind: 'infraction', id: randomUUID(), version: 2 },
      {
        infractionId: '00000000-0000-7000-8000-0000d0000002',
        aitId: AITS.f2,
        fromState: 'AIT_LAVRADO',
        toState: 'NOTIFICADO_AUTUACAO',
      },
    );

    await poller.firePolling();
    await stream.waitFor(() => stream.events.length >= 3);
    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(stream.events.map((event) => [event.id, event.event])).toEqual([
      [mine, 'request.changed'],
      [decision, 'decision.published'],
      [payment, 'payment.confirmed'],
    ]);
    const frames = stream.events.map(
      (event) =>
        JSON.parse(event.data ?? '{}') as {
          aggregate: unknown;
          data: Record<string, unknown>;
        },
    );
    expect(frames[0]!.data).toEqual({
      requestId,
      situation: 'PROTOCOLADO',
      nextAction: {
        by: 'agency',
        label: 'portal.requests.nextAction.PROTOCOLADO',
        dueOn: null,
      },
    });
    expect(frames[0]!.aggregate).toEqual({
      kind: 'portal.request',
      id: requestId,
      version: 2,
    });
    expect(frames[1]!.data).toEqual({ requestId });
    expect(frames[2]!.data).toEqual({ aitId: AITS.f2 });
    for (const event of stream.events) {
      expect(event.data).not.toContain(TENANT_ID);
      expect(event.data).not.toContain(cpfHash(CPF.prata));
      expect(event.data).not.toMatch(
        /NOTIFICADO_AUTUACAO|AIT_LAVRADO|indeferido/,
      );
    }
    stream.close();
  });

  it('C-0002-82 — dado ?topics=payment.confirmed então só esse tipo chega; tipo desconhecido em topics é ignorado', async () => {
    const stream = openStream(
      '/v1/portal/stream?topics=payment.confirmed,tipo.desconhecido',
      citizenHeaders(),
    );
    await stream.opened;
    await insertOutboxRow(
      REQUEST_CHANGED,
      'SOLICITACAO_DESISTIDA',
      { kind: 'portal.request', id: LINKED_REQUEST_ID, version: 5 },
      {
        requestId: LINKED_REQUEST_ID,
        serviceKey: 'defesa_previa',
        fromState: 'PEDIDO_EM_COMPOSICAO',
        toState: 'DESISTIDO',
        withdrawnAt: new Date().toISOString(),
        subjectId,
        subjectCpfHash: cpfHash(CPF.prata),
      },
    );
    const payment = await insertOutboxRow(
      PAYMENT_CONFIRMED,
      'PAGAMENTO_CONFIRMADO',
      { kind: 'payment', id: randomUUID(), version: 1 },
      {
        paymentId: randomUUID(),
        documentId: randomUUID(),
        infractionId: '00000000-0000-7000-8000-0000d0000002',
        aitId: AITS.f2,
        tier: 'desconto_80',
        paidOn: '2026-09-10',
        amount: 156.18,
      },
    );
    await poller.firePolling();
    await stream.waitFor(() => stream.events.length >= 1);
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(stream.events.map((event) => [event.id, event.event])).toEqual([
      [payment, 'payment.confirmed'],
    ]);
    stream.close();
  });

  it('C-0002-82 — dado Last-Event-ID = id da primeira linha então reproduz as posteriores em ordem (created_at, id); dado id com created_at há 25 h então 204', async () => {
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const first = await insertOutboxRow(
      REQUEST_CHANGED,
      'SOLICITACAO_CRIADA',
      { kind: 'portal.request', id: LINKED_REQUEST_ID, version: 1 },
      {
        requestId: LINKED_REQUEST_ID,
        serviceKey: 'defesa_previa',
        fromState: null,
        toState: 'PEDIDO_EM_COMPOSICAO',
        subjectId,
        subjectCpfHash: cpfHash(CPF.prata),
      },
      hourAgo,
    );
    const second = await insertOutboxRow(
      REQUEST_CHANGED,
      'SOLICITACAO_PROTOCOLADA',
      { kind: 'portal.request', id: LINKED_REQUEST_ID, version: 2 },
      {
        requestId: LINKED_REQUEST_ID,
        serviceKey: 'defesa_previa',
        fromState: 'PEDIDO_EM_COMPOSICAO',
        toState: 'PROTOCOLADO',
        subjectId,
        subjectCpfHash: cpfHash(CPF.prata),
      },
    );
    const third = await insertOutboxRow(
      PAYMENT_CONFIRMED,
      'PAGAMENTO_CONFIRMADO',
      { kind: 'payment', id: randomUUID(), version: 1 },
      {
        paymentId: randomUUID(),
        documentId: randomUUID(),
        infractionId: '00000000-0000-7000-8000-0000d0000002',
        aitId: AITS.f2,
        tier: 'desconto_80',
        paidOn: '2026-09-10',
        amount: 156.18,
      },
    );

    const replay = openStream(
      '/v1/portal/stream?topics=request.changed,payment.confirmed',
      { ...citizenHeaders(), 'last-event-id': first },
    );
    await replay.opened;
    expect(replay.status()).toBe(200);
    await replay.waitFor(() => replay.events.length >= 2);
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(replay.events.map((event) => event.id)).toEqual([second, third]);
    expect(replay.events.map((event) => event.event)).toEqual([
      'request.changed',
      'payment.confirmed',
    ]);
    replay.close();

    const twentyFiveHoursAgo = new Date(
      Date.now() - 25 * 60 * 60 * 1000,
    ).toISOString();
    const stale = await insertOutboxRow(
      REQUEST_CHANGED,
      'SOLICITACAO_CRIADA',
      { kind: 'portal.request', id: LINKED_REQUEST_ID, version: 9 },
      {
        requestId: LINKED_REQUEST_ID,
        serviceKey: 'defesa_previa',
        fromState: null,
        toState: 'PEDIDO_EM_COMPOSICAO',
        subjectId,
        subjectCpfHash: cpfHash(CPF.prata),
      },
      twentyFiveHoursAgo,
    );
    const outside = openStream('/v1/portal/stream', {
      ...citizenHeaders(),
      'last-event-id': stale,
    });
    await outside.opened;
    expect(outside.status()).toBe(204);
    outside.close();
  });

  it('C-0002-82 — dado a inscrição de heartbeat quando dispara então `: heartbeat`; ao fechar a conexão as inscrições são canceladas', async () => {
    const stream = openStream('/v1/portal/stream', citizenHeaders());
    await stream.opened;
    expect(
      poller.subscriptions.some(
        (subscription) => subscription.intervalMs === HEARTBEAT_INTERVAL_MS,
      ),
    ).toBe(true);
    await poller.fireHeartbeat();
    await stream.waitFor(() => stream.comments.includes(': heartbeat'));
    expect(stream.comments).toContain(': heartbeat');
    const subscriptions = [...poller.subscriptions];
    stream.close();
    await new Promise((resolve) => setTimeout(resolve, 200));
    for (const subscription of subscriptions)
      expect(subscription.unsubscribe).toHaveBeenCalled();
  });
});
