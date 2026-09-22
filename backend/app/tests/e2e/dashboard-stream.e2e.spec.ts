import type http from 'node:http';
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
  ACTOR_ID,
  LOCAL,
  SEED,
  SqlCapture,
  TENANT_ID,
  TOPICS,
  accessLogRows,
  asOwner,
  createDashboardApp,
  dbNow,
  headers,
  importModule,
  insertOutboxRow,
  newClient,
  openStream,
  insertSuiteSources,
  resetDashboardE2eRows,
  restoreEnv,
  type OpenStream,
} from './dashboard-e2e.support.js';

/**
 * R-0011 CTG-0002 §11 (M23) — `GET /v1/dashboard/stream`: C-0002-100
 * (TASK-0014). Padrão de `portal-stream.e2e.spec.ts`: servidor real
 * (`app.listen(0)`), leitura em streaming por `http.get`, poller MANUAL
 * injetado (nenhum `setInterval` no teste) — o token do poller segue o padrão
 * `PORTAL_STREAM_POLLER` de `portal-stream.service.ts` (`DASHBOARD_STREAM_POLLER`,
 * OD-D59: nome não fixado em §14.2). Heartbeat = `HEARTBEAT_INTERVAL_MS` de
 * `teat-stream.service.ts` (§11). O filtro por camada/escopo é provado sobre o
 * SQL capturado de `listSince` (§11: `payload->'data'->>'objectLayer'` e
 * `payload->'data'->>'sourceApp'` no predicado). Fica vermelho até TASK-0013
 * criar `backend/app/src/dashboard-stream.{service,controller}.ts`.
 */
const client = newClient();
let app: INestApplication;
let port = 0;
let since = '';
let HEARTBEAT_INTERVAL_MS = 0;
let capture: SqlCapture;
const openRequests: http.ClientRequest[] = [];
const createdOutboxIds: string[] = [];

interface ManualSubscription {
  fn: () => void | Promise<void>;
  intervalMs: number | undefined;
  unsubscribe: ReturnType<typeof vi.fn>;
}

/** `TeatStreamPoller` manual (mesma porta do TEAT/Portal, §11). */
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

function stream(
  role: string,
  extra: Record<string, string> = {},
  path = '/v1/dashboard/stream',
): OpenStream {
  return openStream(
    port,
    path,
    { ...headers(role, extra), accept: 'text/event-stream' },
    openRequests,
  );
}

/** Evento `dashboard.alert.changed` no envelope de §12 (data só ids/tokens). */
async function alertChangedRow(
  domainEvent: string,
  alertId: string,
  fields: {
    sourceApp: 'rait' | 'pec' | 'portal';
    objectLayer: 'N1' | 'N2';
    objectRef: string | null;
    version?: number;
  },
  createdAt?: string,
): Promise<string> {
  const id = await insertOutboxRow(
    client,
    TOPICS.alertChanged,
    domainEvent,
    { kind: 'alert', id: alertId, version: fields.version ?? 2 },
    {
      alertId,
      indicatorCode: 'IND-DASH-101',
      track: 'extinction',
      fromState: 'NOTIFICADO',
      toState: 'RECONHECIDO',
      severity: 'N2',
      block: 'A',
      sourceApp: fields.sourceApp,
      objectKind: 'case',
      objectLayer: fields.objectLayer,
      objectRef: fields.objectRef,
      ownerRole: 'rait-manager',
      escalationLevel: 0,
      occurredAt: new Date().toISOString(),
    },
    createdAt,
  );
  createdOutboxIds.push(id);
  return id;
}

function frameData(event: { data?: string }): {
  domainEvent: string;
  data: Record<string, unknown>;
} {
  return JSON.parse(event.data ?? '{}') as {
    domainEvent: string;
    data: Record<string, unknown>;
  };
}

beforeAll(async () => {
  await client.connect();
  since = await dbNow(client);
  await resetDashboardE2eRows(client, since);
  await insertSuiteSources(client);
  const dashboardStream = (await importModule(
    '../../src/dashboard-stream.service.js',
  )) as { DASHBOARD_STREAM_POLLER: symbol };
  const teat = (await importModule('../../src/teat-stream.service.js')) as {
    HEARTBEAT_INTERVAL_MS: number;
  };
  HEARTBEAT_INTERVAL_MS = teat.HEARTBEAT_INTERVAL_MS;
  capture = new SqlCapture(client);
  app = await createDashboardApp([
    { token: dashboardStream.DASHBOARD_STREAM_POLLER, value: poller.port },
  ]);
  await app.listen(0);
  const address = app.getHttpServer().address();
  port = typeof address === 'object' && address ? address.port : 0;
}, 60_000);

afterEach(async () => {
  for (const req of openRequests.splice(0)) req.destroy();
  poller.subscriptions.length = 0;
  capture.pause();
  if (createdOutboxIds.length > 0) {
    await asOwner(client);
    await client.query(
      `delete from integration.outbox where id = any($1::uuid[])`,
      [createdOutboxIds.splice(0)],
    );
  }
  // As conexões fechadas liberam a contagem por usuário (§11) antes do próximo caso.
  await new Promise((resolve) => setTimeout(resolve, 100));
});

afterAll(async () => {
  capture?.stop();
  await app?.close();
  await resetDashboardE2eRows(client, since);
  await client.end();
  restoreEnv();
});

describe('CTG-0002 §11 — GET /v1/dashboard/stream (C-0002-100)', () => {
  it('C-0002-100 — dado dash-operator então 200 text/event-stream com `: connected`; dado bi-analyst então 403 (política dashboard:alert:read)', async () => {
    const opened = stream('dash-operator');
    await opened.opened;
    expect(opened.status()).toBe(200);
    expect(String(opened.headers()['content-type'])).toContain(
      'text/event-stream',
    );
    expect(opened.comments).toContain(': connected');
    expect(poller.port.schedule).toHaveBeenCalled();
    opened.close();

    const denied = stream('bi-analyst');
    await denied.opened;
    expect(denied.status()).toBe(403);
    denied.close();
  });

  it('C-0002-100 — dado Last-Event-ID de uma linha criada há 25 h então 204 (além de REPLAY_WINDOW_MS)', async () => {
    const twentyFiveHoursAgo = new Date(
      Date.now() - 25 * 60 * 60 * 1000,
    ).toISOString();
    const stale = await alertChangedRow(
      'ALERTA_RECONHECIDO',
      SEED.alert.reconhecidoIrregularity,
      { sourceApp: 'portal', objectLayer: 'N1', objectRef: null },
      twentyFiveHoursAgo,
    );
    const outside = stream('dash-operator', { 'last-event-id': stale });
    await outside.opened;
    expect(outside.status()).toBe(204);
    outside.close();
  });

  it('C-0002-100 — dado Last-Event-ID de uma linha de 1 h atrás então reproduz as posteriores em ordem (created_at, id)', async () => {
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const first = await alertChangedRow(
      'ALERTA_RECONHECIDO',
      SEED.alert.reconhecidoIrregularity,
      { sourceApp: 'portal', objectLayer: 'N1', objectRef: null },
      hourAgo,
    );
    const second = await alertChangedRow(
      'ALERTA_EM_TRATAMENTO',
      SEED.alert.reconhecidoIrregularity,
      { sourceApp: 'portal', objectLayer: 'N1', objectRef: null, version: 3 },
    );
    const third = await insertOutboxRow(
      client,
      TOPICS.dutyChanged,
      'DEVER_COMPROVADO',
      { kind: 'duty_cycle', id: LOCAL.missing('01'), version: 2 },
      {
        dutyCycleId: LOCAL.missing('01'),
        dutyCode: 'DUTY-01',
        indicatorCode: 'IND-DASH-201',
        period: '2026-08',
        fromState: 'SUBMETIDO_PUBLICADO',
        toState: 'COMPROVADO',
        deadlineOn: '2026-09-20',
        late: false,
        occurredAt: new Date().toISOString(),
      },
    );
    createdOutboxIds.push(third);
    const replay = stream('dash-operator', { 'last-event-id': first });
    await replay.opened;
    expect(replay.status()).toBe(200);
    await replay.waitFor(() => replay.events.length >= 2);
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(replay.events.map((event) => [event.id, event.event])).toEqual([
      [second, 'alert.changed'],
      [third, 'duty.changed'],
    ]);
    replay.close();
  });

  it('C-0002-100 — dado a inscrição de heartbeat quando dispara então `: heartbeat` (HEARTBEAT_INTERVAL_MS = 20 s); ao fechar, as inscrições são canceladas', async () => {
    expect(HEARTBEAT_INTERVAL_MS).toBe(20_000);
    const opened = stream('dash-operator');
    await opened.opened;
    expect(
      poller.subscriptions.some(
        (subscription) => subscription.intervalMs === HEARTBEAT_INTERVAL_MS,
      ),
    ).toBe(true);
    await poller.fireHeartbeat();
    await opened.waitFor(() => opened.comments.includes(': heartbeat'));
    const subscriptions = [...poller.subscriptions];
    opened.close();
    await new Promise((resolve) => setTimeout(resolve, 200));
    for (const subscription of subscriptions)
      expect(subscription.unsubscribe).toHaveBeenCalled();
  });

  it('C-0002-100 — dado dash-operator (N1) quando um ack chega à outbox então um frame event: alert.changed com data.objectRef = null; ALERTA_ESCALONADO chega como alert.escalated; nunca tenantId', async () => {
    const opened = stream('dash-operator');
    await opened.opened;
    const ack = await alertChangedRow(
      'ALERTA_RECONHECIDO',
      SEED.alert.notificadoIrregularity,
      { sourceApp: 'portal', objectLayer: 'N1', objectRef: null },
    );
    const escalated = await alertChangedRow(
      'ALERTA_ESCALONADO',
      SEED.alert.notificadoIrregularity,
      { sourceApp: 'portal', objectLayer: 'N1', objectRef: null, version: 3 },
    );
    await poller.firePolling();
    await opened.waitFor(() => opened.events.length >= 2);
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(opened.events.map((event) => [event.id, event.event])).toEqual([
      [ack, 'alert.changed'],
      [escalated, 'alert.escalated'],
    ]);
    const frame = frameData(opened.events[0]!);
    expect(frame.domainEvent).toBe('ALERTA_RECONHECIDO');
    expect(frame.data.objectRef).toBeNull();
    for (const event of opened.events) {
      expect(event.data).not.toContain(TENANT_ID);
      expect(event.data).not.toContain('tenantId');
    }
    opened.close();
  });

  it('C-0002-100 — dado evento N2 (objectRef presente) quando dash-operator (N1) escuta então o filtro por camada é no SQL (objectLayer no predicado) e nenhum frame N2 chega', async () => {
    const opened = stream('dash-operator');
    await opened.opened;
    await alertChangedRow(
      'ALERTA_RECONHECIDO',
      SEED.alert.notificadoExtinction,
      { sourceApp: 'rait', objectLayer: 'N2', objectRef: SEED.raitCaseRef },
    );
    const visible = await alertChangedRow(
      'ALERTA_RECONHECIDO',
      SEED.alert.notificadoIrregularity,
      { sourceApp: 'portal', objectLayer: 'N1', objectRef: null },
    );
    capture.start();
    await poller.firePolling();
    capture.pause();
    await opened.waitFor(() => opened.events.length >= 1);
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(opened.events.map((event) => event.id)).toEqual([visible]);
    const listSince = capture.statements.filter(
      (sql) => /integration\.outbox/i.test(sql) && /select/i.test(sql),
    );
    expect(listSince.length).toBeGreaterThan(0);
    for (const sql of listSince) {
      expect(sql).toMatch(/payload->'data'->>'objectLayer'/);
      expect(sql).toMatch(/payload->'data'->>'sourceApp'/);
    }
    for (const event of opened.events)
      expect(event.data).not.toContain(SEED.raitCaseRef);
    opened.close();
  });

  it('C-0002-100 — dado rait-manager com X-Purpose quando eventos rait e pec chegam então objectRef presente só para sourceApp = rait (escopo no SQL) e access_log com resource GET stream, layer N2, row_count 0', async () => {
    const before = await dbNow(client);
    const opened = stream('rait-manager', { 'x-purpose': 'supervisao' });
    await opened.opened;
    expect(opened.status()).toBe(200);
    const rait = await alertChangedRow(
      'ALERTA_RECONHECIDO',
      SEED.alert.notificadoExtinction,
      { sourceApp: 'rait', objectLayer: 'N2', objectRef: SEED.raitCaseRef },
    );
    await alertChangedRow('ALERTA_RECONHECIDO', LOCAL.missing('02'), {
      sourceApp: 'pec',
      objectLayer: 'N2',
      objectRef: LOCAL.missing('03'),
    });
    await poller.firePolling();
    await opened.waitFor(() => opened.events.length >= 1);
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(opened.events.map((event) => event.id)).toEqual([rait]);
    expect(frameData(opened.events[0]!).data.objectRef).toBe(SEED.raitCaseRef);

    const access = await accessLogRows(client, before, {
      resource: 'GET stream',
    });
    expect(access).toHaveLength(1);
    expect(access[0]).toMatchObject({
      user_ref: ACTOR_ID,
      user_role: 'rait-manager',
      layer: 'N2',
      purpose: 'supervisao',
      row_count: 0,
    });
    opened.close();
  });

  it('C-0002-100 — dado rait-manager (N2) sem X-Purpose no handshake então o data de um evento N2 é redigido (objectRef: null) no serviço', async () => {
    const opened = stream('rait-manager');
    await opened.opened;
    expect(opened.status()).toBe(200);
    const rait = await alertChangedRow(
      'ALERTA_RECONHECIDO',
      SEED.alert.notificadoExtinction,
      { sourceApp: 'rait', objectLayer: 'N2', objectRef: SEED.raitCaseRef },
    );
    await poller.firePolling();
    await opened.waitFor(() => opened.events.length >= 1);
    expect(opened.events[0]!.id).toBe(rait);
    expect(frameData(opened.events[0]!).data.objectRef).toBeNull();
    opened.close();
  });

  it('C-0002-100 — dado ?topics=duty.changed então só esse tipo chega; integration.health deriva de source.freshness só para teat/adapter', async () => {
    const filtered = stream(
      'dash-operator',
      {},
      '/v1/dashboard/stream?topics=duty.changed',
    );
    await filtered.opened;
    await alertChangedRow(
      'ALERTA_RECONHECIDO',
      SEED.alert.notificadoIrregularity,
      { sourceApp: 'portal', objectLayer: 'N1', objectRef: null },
    );
    const duty = await insertOutboxRow(
      client,
      TOPICS.dutyChanged,
      'DEVER_JANELA_ABERTA',
      { kind: 'duty_cycle', id: LOCAL.missing('04'), version: 1 },
      {
        dutyCycleId: LOCAL.missing('04'),
        dutyCode: 'DUTY-01',
        indicatorCode: 'IND-DASH-201',
        period: '2026-10',
        fromState: null,
        toState: 'JANELA_ABERTA',
        deadlineOn: '2026-11-20',
        late: false,
        occurredAt: new Date().toISOString(),
      },
    );
    createdOutboxIds.push(duty);
    await poller.firePolling();
    await filtered.waitFor(() => filtered.events.length >= 1);
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(filtered.events.map((event) => [event.id, event.event])).toEqual([
      [duty, 'duty.changed'],
    ]);
    filtered.close();

    const health = stream(
      'dash-operator',
      {},
      '/v1/dashboard/stream?topics=integration.health,source.freshness',
    );
    await health.opened;
    const teat = await insertOutboxRow(
      client,
      TOPICS.sourceFreshness,
      'FONTE_FRESCOR_ALTERADO',
      { kind: 'source', id: SEED.source.teatOfflineSync, version: 2 },
      {
        sourceId: SEED.source.teatOfflineSync,
        sourceKey: 'teat.offline-sync',
        app: 'teat',
        fromState: 'FRESCO',
        toState: 'ATRASADO',
        hidden: false,
        lastSeenAt: '2026-09-10T12:00:00.000Z',
        staleSince: null,
        acceptableLatencyMinutes: null,
        occurredAt: new Date().toISOString(),
      },
    );
    createdOutboxIds.push(teat);
    const pec = await insertOutboxRow(
      client,
      TOPICS.sourceFreshness,
      'FONTE_FRESCOR_ALTERADO',
      { kind: 'source', id: SEED.source.pecDeadlines, version: 2 },
      {
        sourceId: SEED.source.pecDeadlines,
        sourceKey: 'pec.deadlines',
        app: 'pec',
        fromState: 'INDISPONIVEL',
        toState: 'FRESCO',
        hidden: false,
        lastSeenAt: '2026-09-10T12:00:00.000Z',
        staleSince: null,
        acceptableLatencyMinutes: null,
        occurredAt: new Date().toISOString(),
      },
    );
    createdOutboxIds.push(pec);
    await poller.firePolling();
    await health.waitFor(() => health.events.length >= 3);
    await new Promise((resolve) => setTimeout(resolve, 150));
    const byId = new Map<string, string[]>();
    for (const event of health.events) {
      const list = byId.get(event.id ?? '') ?? [];
      list.push(event.event ?? '');
      byId.set(event.id ?? '', list);
    }
    expect(byId.get(teat)?.sort()).toEqual([
      'integration.health',
      'source.freshness',
    ]);
    expect(byId.get(pec)).toEqual(['source.freshness']);
    health.close();
  });

  it('C-0002-100 — dado cinco conexões abertas do mesmo usuário quando abre a sexta então 429; ao fechar uma, a próxima volta a 200', async () => {
    const streams: OpenStream[] = [];
    for (let index = 0; index < 5; index += 1) {
      const opened = stream('dash-operator');
      await opened.opened;
      expect(opened.status(), `conexão ${index + 1}`).toBe(200);
      streams.push(opened);
    }
    const sixth = stream('dash-operator');
    await sixth.opened;
    expect(sixth.status()).toBe(429);
    sixth.close();

    streams[0]!.close();
    await new Promise((resolve) => setTimeout(resolve, 200));
    const again = stream('dash-operator');
    await again.opened;
    expect(again.status()).toBe(200);
    again.close();
    for (const opened of streams) opened.close();
  });
});
