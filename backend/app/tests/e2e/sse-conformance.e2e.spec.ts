import { randomUUID } from 'node:crypto';
import type http from 'node:http';
import { DASHBOARD_EVENT_TYPES } from '@detran/dashboard-monitor';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import {
  ACTOR_ID as PORTAL_ACTOR_ID,
  CPF,
  TENANT_ID as PORTAL_TENANT_ID,
  clearCitizenEnv,
  cpfHash,
  seedLocalParameters,
  seedLocalTenant,
  setCitizen,
} from './portal-e2e.support.js';
import {
  ACTOR_A,
  HEARTBEAT_MS,
  TENANT_A,
  TENANT_B,
  appRoleControl,
  asOwnerRole,
  bootStreamApp,
  deleteOutbox,
  insertOutbox,
  newOwnerClient,
  openStream,
  seedIsolationTenants,
  settle,
  type ManualScheduler,
  type OpenStream,
  type OutboxFixture,
  type StreamApp,
} from './r22-sse-tenancy.support.js';

/**
 * R-0022 CTG-0001 §5 (TASK-0002) — C-01-12…C-01-19: caracterização dos quatro
 * fluxos SSE do backend sobre STYNX 1.4.0, válida sem edição depois do pin
 * 1.5.0 e das remoções de CTG-0004 (CTG-0001 §0.1): só rota, cabeçalhos,
 * status, corpo e banco; a única ligação com `src/` são os quatro tokens da
 * porta de agendamento (CTG-0001 §8 R-1), importados pelo _helper_
 * `bootStreamApp`. Nenhum `it.fails`.
 *
 * Fluxos (CTG-0001 §1.2): F1 TEAT `GET /v1/ops/stream`; F2 Portal
 * `GET /v1/portal/stream`; F3 DASHBOARD `GET /v1/dashboard/stream`; F4 RAIT
 * `GET /v1/inf/rait/stream`.
 *
 * Tenants (CTG-0001 §0.6): F1, F3 e F4 abrem como o tenant A de
 * `tools/check-rls-smoke.ts` (`…101`, ator A `…201`, _membership_ só em A);
 * F2 abre como o tenant/persona do _harness_ do Portal (`…0001`, ator
 * `…0002`, CPF prata), porque só ele cria o sujeito cidadão. B é sempre o
 * tenant B do smoke (`…102`). Cada "A" roda num app próprio com a _claim_ do
 * verificador local fixada (T-14).
 *
 * RLS real (CTG-0001 §4.2): a abertura e cada _tick_ correm pelo `Database` do
 * app (`STYNX_APP_DATABASE_URL`); o controle de papel de cada app prova
 * `role_app_backend` com `app.tenant_id`/`app.actor_id` do contexto. O cliente
 * owner só grava e apaga linhas de `integration.outbox` preparadas aqui.
 *
 * Relógio (CTG-0001 §4.3): agendador manual por token, cada `fn` ligada ao
 * contexto assíncrono de quem agendou; heartbeat × leitura pelo `intervalMs`
 * (`20000` × ausente). Janela de 24 h: `created_at` no passado gravado pelo
 * owner (relógio do banco), 1 h e 25 h (D-B-03: nenhuma linha na fronteira).
 */

type FlowId = 'F1' | 'F2' | 'F3' | 'F4';

interface Flow {
  id: FlowId;
  path: string;
  /** Tenant "A" da conexão e ator do contexto. */
  tenant: string;
  actor: string;
  allowedRole: string;
  deniedRole: string;
  /** `event:` esperado para a linha elegível de `eligible`. */
  expectedEvent: string;
  target(): StreamApp;
  scheduler(): ManualScheduler;
  headers(role: string): Record<string, string>;
  eligible(
    tenantId: string,
    extra?: { ageHours?: number; data?: Record<string, unknown> },
  ): OutboxFixture;
}

const client = newOwnerClient();
const openRequests: http.ClientRequest[] = [];
const createdOutbox: string[] = [];
const subjectsBefore = new Set<string>();
const previousEnv: Record<string, string | undefined> = {};
let appA: StreamApp;
let appPortal: StreamApp;

/** AIT `INTEGRADO` canônico (`rait-fixtures.md` §2) e caso 07 (§3). */
const AIT_01 = '00000000-0000-7000-8000-0000f0000001';
const CASE_07 = '00000000-0000-7000-8000-000010000007';
const PRATA_HASH = cpfHash(CPF.prata);

const REQUEST_CHANGED = 'portal.request.changed';
const INBOX_ITEM = 'portal.inbox.item';

function sessionHeaders(
  tenantId: string,
  role: string,
): Record<string, string> {
  clearCitizenEnv();
  process.env.DETRAN_LOCAL_ROLES = role;
  process.env.DETRAN_LOCAL_ACTOR_ID = ACTOR_A;
  return {
    authorization: 'Bearer local',
    'x-tenant-id': tenantId,
    accept: 'text/event-stream',
  };
}

/** Envelope `dashboard.alert.changed` (campos de `dashboard-stream.e2e.spec.ts`). */
function alertData(fields: {
  sourceApp: 'rait' | 'portal';
  objectLayer: 'N1' | 'N2';
  objectRef: string | null;
}): Record<string, unknown> {
  return {
    alertId: randomUUID(),
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
  };
}

const F1: Flow = {
  id: 'F1',
  path: '/v1/ops/stream',
  tenant: TENANT_A,
  actor: ACTOR_A,
  allowedRole: 'field-agent',
  deniedRole: 'CANDIDATO',
  expectedEvent: 'ait.changed',
  target: () => appA,
  scheduler: () => appA.schedulers.teat,
  headers: (role) => sessionHeaders(TENANT_A, role),
  eligible: (tenantId, extra = {}) => ({
    tenantId,
    topic: 'ait.changed',
    domainEvent: 'AIT_CHANGED',
    aggregate: { kind: 'ait', id: AIT_01, version: 1 },
    data: { aitId: AIT_01, ...extra.data },
    ageHours: extra.ageHours,
  }),
};

const F2: Flow = {
  id: 'F2',
  path: '/v1/portal/stream',
  tenant: PORTAL_TENANT_ID,
  actor: PORTAL_ACTOR_ID,
  allowedRole: 'CIDADAO',
  deniedRole: 'field-agent',
  expectedEvent: 'request.changed',
  target: () => appPortal,
  scheduler: () => appPortal.schedulers.portal,
  headers: (role) => {
    clearCitizenEnv();
    setCitizen({ cpf: CPF.prata, level: 'avancada', roles: role });
    process.env.DETRAN_LOCAL_ACTOR_ID = PORTAL_ACTOR_ID;
    return {
      authorization: 'Bearer local',
      'x-tenant-id': PORTAL_TENANT_ID,
      accept: 'text/event-stream',
    };
  },
  eligible: (tenantId, extra = {}) => {
    const requestId = randomUUID();
    return {
      tenantId,
      topic: REQUEST_CHANGED,
      domainEvent: 'SOLICITACAO_PROTOCOLADA',
      aggregate: { kind: 'portal.request', id: requestId, version: 2 },
      data: {
        requestId,
        serviceKey: 'defesa_previa',
        fromState: 'PEDIDO_EM_COMPOSICAO',
        toState: 'PROTOCOLADO',
        subjectCpfHash: PRATA_HASH,
        ...extra.data,
      },
      ageHours: extra.ageHours,
    };
  },
};

const F3: Flow = {
  id: 'F3',
  path: '/v1/dashboard/stream',
  tenant: TENANT_A,
  actor: ACTOR_A,
  allowedRole: 'dash-operator',
  deniedRole: 'bi-analyst',
  expectedEvent: 'alert.changed',
  target: () => appA,
  scheduler: () => appA.schedulers.dashboard,
  headers: (role) => sessionHeaders(TENANT_A, role),
  eligible: (tenantId, extra = {}) => {
    const data = alertData({
      sourceApp: 'portal',
      objectLayer: 'N1',
      objectRef: null,
    });
    return {
      tenantId,
      topic: DASHBOARD_EVENT_TYPES.alertChanged,
      domainEvent: 'ALERTA_RECONHECIDO',
      aggregate: { kind: 'alert', id: String(data.alertId), version: 2 },
      data: { ...data, ...extra.data },
      ageHours: extra.ageHours,
    };
  },
};

const F4: Flow = {
  id: 'F4',
  path: '/v1/inf/rait/stream',
  tenant: TENANT_A,
  actor: ACTOR_A,
  allowedRole: 'rait-analyst',
  deniedRole: 'CANDIDATO',
  // Adenda TASK-0025 (CTG-0004 §6, OD-R22-04): `event:` do F4 = `type` do
  // envelope (antes: 2º segmento do topic, `case`).
  expectedEvent: 'rait.case.changed',
  target: () => appA,
  scheduler: () => appA.schedulers.rait,
  headers: (role) => sessionHeaders(TENANT_A, role),
  eligible: (tenantId, extra = {}) => ({
    tenantId,
    topic: 'rait.case.changed',
    domainEvent: 'RAIT_CASO_ALTERADO',
    aggregate: { kind: 'case', id: CASE_07, version: 1 },
    data: { caseId: CASE_07, ...extra.data },
    ageHours: extra.ageHours,
  }),
};

const FLOWS: readonly Flow[] = [F1, F2, F3, F4];

async function track(fixture: OutboxFixture): Promise<string> {
  const id = await insertOutbox(client, fixture);
  createdOutbox.push(id);
  return id;
}

function waitUntil(predicate: () => boolean, timeoutMs = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();
    const check = (): void => {
      if (predicate()) return resolve();
      if (Date.now() - startedAt > timeoutMs)
        return reject(new Error('condição não satisfeita a tempo'));
      setTimeout(check, 20);
    };
    check();
  });
}

/** Abre o fluxo e espera as duas inscrições da conexão (heartbeat e leitura). */
async function openReady(
  flow: Flow,
  options: {
    role?: string;
    query?: string;
    extra?: Record<string, string>;
    reset?: boolean;
  } = {},
): Promise<OpenStream> {
  const scheduler = flow.scheduler();
  if (options.reset !== false) scheduler.reset();
  const heartbeatsBefore = scheduler.heartbeats().length;
  const readsBefore = scheduler.reads().length;
  const stream = openStream(
    flow.target().port,
    `${flow.path}${options.query ?? ''}`,
    {
      ...flow.headers(options.role ?? flow.allowedRole),
      ...options.extra,
    },
    openRequests,
  );
  await stream.opened;
  if (stream.status() === 200) {
    await waitUntil(
      () =>
        scheduler.heartbeats().length > heartbeatsBefore &&
        scheduler.reads().length > readsBefore,
    );
    // Leitura inicial da abertura concluída antes de qualquer gravação do teste.
    await settle(100);
  }
  return stream;
}

/**
 * Dispara a leitura e espera `ids` chegarem; depois, com as leituras em curso
 * já concluídas (F1/F4 não serializam _ticks_, D-B-02, que não é critério
 * aqui), um segundo disparo e folga.
 */
async function deliver(
  flow: Flow,
  stream: OpenStream,
  ids: readonly string[],
): Promise<void> {
  await flow.scheduler().fireReads();
  await stream.waitFor(() =>
    ids.every((id) => stream.events.some((event) => event.id === id)),
  );
  await settle(200);
  await flow.scheduler().fireReads();
  await settle(200);
}

function eventIds(stream: OpenStream, among: readonly string[]): string[] {
  return stream.events
    .map((event) => event.id ?? '')
    .filter((id) => among.includes(id));
}

function assertNoTenantInData(stream: OpenStream): void {
  for (const event of stream.events) {
    expect(event.data ?? '').not.toContain('tenantId');
    for (const tenant of [TENANT_A, TENANT_B, PORTAL_TENANT_ID])
      expect(event.data ?? '').not.toContain(tenant);
  }
}

beforeAll(async () => {
  for (const key of [
    'DETRAN_RUNTIME_PROFILE',
    'DETRAN_LOCAL_TENANT_ID',
    'DETRAN_LOCAL_ACTOR_ID',
    'DETRAN_LOCAL_ROLES',
    'DETRAN_LOCAL_CPF',
    'DETRAN_LOCAL_ASSURANCE_LEVEL',
    'DETRAN_PORTAL_HOST_RESOLUTION',
  ]) {
    previousEnv[key] = process.env[key];
  }
  process.env.DETRAN_RUNTIME_PROFILE = 'test';
  delete process.env.DETRAN_PORTAL_HOST_RESOLUTION;

  await client.connect();
  await seedIsolationTenants(client);
  await seedLocalTenant(client);
  await seedLocalParameters(client);
  await asOwnerRole(client);
  for (const row of (
    await client.query<{ id: string }>(
      `select id::text as id from portal.subject where tenant_id = any($1::uuid[])`,
      [[TENANT_A, TENANT_B, PORTAL_TENANT_ID]],
    )
  ).rows)
    subjectsBefore.add(row.id);

  appA = await bootStreamApp(TENANT_A);
  appPortal = await bootStreamApp(PORTAL_TENANT_ID);
}, 180_000);

afterEach(async () => {
  for (const req of openRequests.splice(0)) req.destroy();
  // Fechamentos liberam a contagem de conexões do F3 antes do próximo caso.
  await settle(150);
  await deleteOutbox(client, createdOutbox.splice(0));
});

afterAll(async () => {
  await appA?.app.close();
  await appPortal?.app.close();
  await asOwnerRole(client);
  const createdSubjects = (
    await client.query<{ id: string }>(
      `select id::text as id from portal.subject where tenant_id = any($1::uuid[])`,
      [[TENANT_A, TENANT_B, PORTAL_TENANT_ID]],
    )
  ).rows
    .map((row) => row.id)
    .filter((id) => !subjectsBefore.has(id));
  if (createdSubjects.length > 0) {
    await client.query(
      `delete from portal.idempotency_record where subject_id = any($1::uuid[])`,
      [createdSubjects],
    );
    await client.query(
      `delete from portal.subject where id = any($1::uuid[])`,
      [createdSubjects],
    );
  }
  await client.end();
  for (const [key, value] of Object.entries(previousEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

describe('CTG-0001 §4.2 — controle de papel da conexão do app', () => {
  it('dado o Database de cada app quando withRequestContext(A, ator A) e tx app readonly então current_user = role_app_backend e app.tenant_id/app.actor_id do contexto', async () => {
    expect(await appRoleControl(appA.app, TENANT_A, ACTOR_A)).toEqual({
      current_user: 'role_app_backend',
      tenant_id: TENANT_A,
      actor_id: ACTOR_A,
    });
    expect(
      await appRoleControl(appPortal.app, PORTAL_TENANT_ID, PORTAL_ACTOR_ID),
    ).toEqual({
      current_user: 'role_app_backend',
      tenant_id: PORTAL_TENANT_ID,
      actor_id: PORTAL_ACTOR_ID,
    });
  });
});

describe('C-01-12 — enquadramento em F1–F4', () => {
  it.each(FLOWS.map((flow) => [flow.id, flow] as const))(
    'C-01-12 — dado %s com o papel que lê o fluxo quando abre e uma linha elegível chega então 200, cabeçalhos SSE, `: connected` antes de qualquer frame e frame id/event/uma linha data JSON/linha em branco; dado papel sem a chave de leitura então 403 sem corpo SSE',
    async (_id, flow) => {
      const stream = await openReady(flow);
      expect(stream.status(), stream.body()).toBe(200);
      const headers = stream.headers();
      expect(String(headers['content-type'])).toContain('text/event-stream');
      expect(String(headers['cache-control'])).toBe('no-cache');
      expect(String(headers.connection).toLowerCase()).toBe('keep-alive');
      expect(stream.sequence[0]).toBe('comment:: connected');

      const id = await track(flow.eligible(flow.tenant));
      await deliver(flow, stream, [id]);
      const event = stream.events.find((candidate) => candidate.id === id)!;
      expect(event.event).toBe(flow.expectedEvent);
      expect(event.dataLines).toBe(1);
      expect(() => JSON.parse(event.data ?? '')).not.toThrow();
      expect(stream.sequence.indexOf('comment:: connected')).toBeLessThan(
        stream.sequence.indexOf(`event:${id}`),
      );
      expect(stream.body()).toMatch(
        new RegExp(
          `id: ${id}\\nevent: ${flow.expectedEvent}\\ndata: \\{[^\\n]*\\}\\n\\n`,
        ),
      );
      stream.close();

      const denied = openStream(
        flow.target().port,
        flow.path,
        flow.headers(flow.deniedRole),
        openRequests,
      );
      await denied.ended;
      expect(denied.status(), denied.body()).toBe(403);
      expect(denied.body()).not.toContain(': connected');
      expect(String(denied.headers()['content-type'])).not.toContain(
        'text/event-stream',
      );
    },
  );
});

describe('C-01-13 — heartbeat e cancelamento em F1–F4', () => {
  it.each(FLOWS.map((flow) => [flow.id, flow] as const))(
    'C-01-13 — dado %s aberto quando a inscrição de 20000 ms dispara então `: heartbeat`; quando o cliente fecha então heartbeat e leitura são canceladas e nenhum disparo posterior escreve',
    async (_id, flow) => {
      const scheduler = flow.scheduler();
      const stream = await openReady(flow);
      expect(stream.status()).toBe(200);
      const heartbeats = scheduler.heartbeats();
      const reads = scheduler.reads();
      expect(heartbeats).toHaveLength(1);
      expect(heartbeats[0]!.intervalMs).toBe(HEARTBEAT_MS);
      expect(reads).toHaveLength(1);
      expect(reads[0]!.intervalMs).toBeUndefined();

      await scheduler.fireHeartbeats();
      await stream.waitFor(() => stream.comments.includes(': heartbeat'));

      stream.close();
      await waitUntil(() => heartbeats[0]!.cancelled && reads[0]!.cancelled);
      const written = flow.target().writes.of(stream.connection).length;
      await track(flow.eligible(flow.tenant));
      await heartbeats[0]!.fn();
      await reads[0]!.fn();
      await settle(200);
      expect(flow.target().writes.of(stream.connection)).toHaveLength(written);
    },
  );
});

describe('C-01-14 — Last-Event-ID do mesmo tenant em F1–F4', () => {
  it.each(FLOWS.map((flow) => [flow.id, flow] as const))(
    'C-01-14 — dado %s e Last-Event-ID de uma linha de 1 h quando abre então reenvia só as posteriores em ordem (created_at, id)',
    async (_id, flow) => {
      const hourOld = await track(flow.eligible(flow.tenant, { ageHours: 1 }));
      const second = await track(flow.eligible(flow.tenant));
      const third = await track(flow.eligible(flow.tenant));
      const mine = [hourOld, second, third];
      const stream = await openReady(flow, {
        extra: { 'last-event-id': hourOld },
      });
      expect(stream.status(), stream.body()).toBe(200);
      await stream.waitFor(() => eventIds(stream, mine).length >= 2);
      await settle(200);
      expect(eventIds(stream, mine)).toEqual([second, third]);
    },
  );

  it.each(FLOWS.map((flow) => [flow.id, flow] as const))(
    'C-01-14 — dado %s e Last-Event-ID de uma linha de 25 h quando abre então 204 sem corpo e sem `: connected`',
    async (_id, flow) => {
      const stale = await track(flow.eligible(flow.tenant, { ageHours: 25 }));
      const stream = openStream(
        flow.target().port,
        flow.path,
        { ...flow.headers(flow.allowedRole), 'last-event-id': stale },
        openRequests,
      );
      await stream.ended;
      expect(stream.status()).toBe(204);
      expect(stream.body()).toBe('');
    },
  );

  it.each(FLOWS.map((flow) => [flow.id, flow] as const))(
    'C-01-14 — dado %s e Last-Event-ID de UUID inexistente quando abre então 200, nada anterior à abertura é reenviado e um evento novo depois da abertura chega',
    async (_id, flow) => {
      const before = await track(flow.eligible(flow.tenant));
      const stream = await openReady(flow, {
        extra: { 'last-event-id': randomUUID() },
      });
      expect(stream.status(), stream.body()).toBe(200);
      const after = await track(flow.eligible(flow.tenant));
      await deliver(flow, stream, [after]);
      expect(eventIds(stream, [before, after])).toEqual([after]);
    },
  );
});

describe('C-01-15 — evento de B nunca entregue a A em F1–F4 (RLS real)', () => {
  it.each(FLOWS.map((flow) => [flow.id, flow] as const))(
    'C-01-15 — dado %s aberto como A sob role_app_backend quando o owner grava uma linha elegível de A e uma de B e a leitura dispara então o frame de A chega e o de B nunca; nenhum data contém id de tenant',
    async (_id, flow) => {
      expect(
        await appRoleControl(flow.target().app, flow.tenant, flow.actor),
      ).toEqual({
        current_user: 'role_app_backend',
        tenant_id: flow.tenant,
        actor_id: flow.actor,
      });
      const stream = await openReady(flow);
      expect(stream.status()).toBe(200);
      const own = await track(flow.eligible(flow.tenant));
      const foreign = await track(flow.eligible(TENANT_B));
      await asOwnerRole(client);
      const persisted = await client.query<{ tenant_id: string }>(
        `select tenant_id::text as tenant_id from integration.outbox where id = $1`,
        [foreign],
      );
      expect(persisted.rows[0]?.tenant_id).toBe(TENANT_B);

      await deliver(flow, stream, [own]);
      expect(eventIds(stream, [own, foreign])).toEqual([own]);
      assertNoTenantInData(stream);
    },
  );
});

describe('C-01-16 — Last-Event-ID de B numa conexão de A em F1–F4', () => {
  it.each(FLOWS.map((flow) => [flow.id, flow] as const))(
    'C-01-16 — dado %s e Last-Event-ID de uma linha de B de 25 h quando A abre então 200 (tratado como desconhecido, nunca 204) e nenhuma linha de B posterior é reenviada',
    async (_id, flow) => {
      const foreignOld = await track(flow.eligible(TENANT_B, { ageHours: 25 }));
      const foreignLater = await track(
        flow.eligible(TENANT_B, { ageHours: 1 }),
      );
      const stream = await openReady(flow, {
        extra: { 'last-event-id': foreignOld },
      });
      expect(stream.status(), stream.body()).toBe(200);
      expect(stream.sequence[0]).toBe('comment:: connected');
      const own = await track(flow.eligible(flow.tenant));
      const foreignAfter = await track(flow.eligible(TENANT_B));
      await deliver(flow, stream, [own]);
      expect(
        eventIds(stream, [foreignOld, foreignLater, foreignAfter, own]),
      ).toEqual([own]);
      assertNoTenantInData(stream);
    },
  );
});

describe('C-01-17 — filtros e projeção no servidor', () => {
  it('C-01-17 — dado F1 com field-agent quando chegam integration.item.changed (sem ops:integration:read), um tipo fora de STREAM_RESOURCE_BY_TYPE e ait.changed então só ait.changed; dado ?topics=ait.changed com integration-operator então só ait.changed, e sem topics o mesmo papel recebe integration.item.changed', async () => {
    const stream = await openReady(F1);
    const denied = await track({
      ...F1.eligible(TENANT_A),
      topic: 'integration.item.changed',
      domainEvent: 'INTEGRATION_ITEM_CHANGED',
    });
    const outOfMap = await track({
      ...F1.eligible(TENANT_A),
      topic: 'rait.case.changed',
      domainEvent: 'RAIT_CASO_ALTERADO',
    });
    const readable = await track(F1.eligible(TENANT_A));
    await deliver(F1, stream, [readable]);
    expect(eventIds(stream, [denied, outOfMap, readable])).toEqual([readable]);
    assertNoTenantInData(stream);
    stream.close();

    const filtered = await openReady(F1, {
      role: 'integration-operator',
      query: '?topics=ait.changed',
    });
    const unfiltered = await openReady(F1, {
      role: 'integration-operator',
      reset: false,
    });
    const integration = await track({
      ...F1.eligible(TENANT_A),
      topic: 'integration.item.changed',
      domainEvent: 'INTEGRATION_ITEM_CHANGED',
    });
    const ait = await track(F1.eligible(TENANT_A));
    await deliver(F1, filtered, [ait]);
    await unfiltered.waitFor(() =>
      unfiltered.events.some((event) => event.id === integration),
    );
    expect(eventIds(filtered, [integration, ait])).toEqual([ait]);
    expect(eventIds(unfiltered, [integration, ait])).toEqual([
      integration,
      ait,
    ]);
    assertNoTenantInData(filtered);
    assertNoTenantInData(unfiltered);
  });

  it('C-01-17 — dado F2 com o CIDADAO prata quando chegam linhas do seu hash e do hash ouro então só as do sujeito, com data reformatado por tipo; dado ?topics=request.changed então inbox.item do sujeito não chega (e chega sem o filtro)', async () => {
    const stream = await openReady(F2);
    const mine = await track(F2.eligible(PORTAL_TENANT_ID));
    const other = await track(
      F2.eligible(PORTAL_TENANT_ID, {
        data: { subjectCpfHash: cpfHash(CPF.ouro) },
      }),
    );
    await deliver(F2, stream, [mine]);
    expect(eventIds(stream, [mine, other])).toEqual([mine]);
    const frame = JSON.parse(
      stream.events.find((event) => event.id === mine)!.data ?? '{}',
    ) as { data: Record<string, unknown> };
    expect(Object.keys(frame.data).sort()).toEqual([
      'nextAction',
      'requestId',
      'situation',
    ]);
    expect(frame.data.situation).toBe('PROTOCOLADO');
    expect(
      stream.events.find((event) => event.id === mine)!.data,
    ).not.toContain(PRATA_HASH);
    assertNoTenantInData(stream);
    stream.close();

    const filtered = await openReady(F2, { query: '?topics=request.changed' });
    const unfiltered = await openReady(F2, { reset: false });
    const inboxId = randomUUID();
    const inbox = await track({
      tenantId: PORTAL_TENANT_ID,
      topic: INBOX_ITEM,
      domainEvent: 'CAIXA_ITEM_CRIADO',
      aggregate: { kind: 'portal.inbox', id: inboxId, version: 1 },
      data: { id: inboxId, subjectCpfHash: PRATA_HASH },
    });
    const request = await track(F2.eligible(PORTAL_TENANT_ID));
    await deliver(F2, filtered, [request]);
    await unfiltered.waitFor(() =>
      [inbox, request].every((id) =>
        unfiltered.events.some((event) => event.id === id),
      ),
    );
    expect(eventIds(filtered, [inbox, request])).toEqual([request]);
    expect(unfiltered.events.find((event) => event.id === inbox)?.event).toBe(
      'inbox.item',
    );
    assertNoTenantInData(filtered);
    assertNoTenantInData(unfiltered);
  });

  it('C-01-17 — dado F3 quando dash-operator (N1) escuta então linha N2 não chega; rait-manager (N2) sem X-Purpose recebe a N2 com objectRef nulo; X-Purpose inválida então 400; ?topics=duty.changed restringe', async () => {
    const operator = await openReady(F3);
    const n2 = await track({
      ...F3.eligible(TENANT_A),
      data: alertData({
        sourceApp: 'rait',
        objectLayer: 'N2',
        objectRef: CASE_07,
      }),
    });
    const n1 = await track(F3.eligible(TENANT_A));
    await deliver(F3, operator, [n1]);
    expect(eventIds(operator, [n2, n1])).toEqual([n1]);
    operator.close();

    const manager = await openReady(F3, { role: 'rait-manager' });
    expect(manager.status()).toBe(200);
    const n2Again = await track({
      ...F3.eligible(TENANT_A),
      data: alertData({
        sourceApp: 'rait',
        objectLayer: 'N2',
        objectRef: CASE_07,
      }),
    });
    await deliver(F3, manager, [n2Again]);
    const redacted = JSON.parse(
      manager.events.find((event) => event.id === n2Again)!.data ?? '{}',
    ) as { data: Record<string, unknown> };
    expect(redacted.data.objectRef).toBeNull();
    expect(manager.body()).not.toContain(CASE_07);
    manager.close();

    const invalid = openStream(
      appA.port,
      F3.path,
      { ...F3.headers('rait-manager'), 'x-purpose': 'finalidade-invalida-r22' },
      openRequests,
    );
    await invalid.ended;
    expect(invalid.status(), invalid.body()).toBe(400);
    expect(invalid.body()).not.toContain(': connected');

    const filtered = await openReady(F3, { query: '?topics=duty.changed' });
    const unfiltered = await openReady(F3, { reset: false });
    const alert = await track(F3.eligible(TENANT_A));
    const dutyCycleId = randomUUID();
    const duty = await track({
      tenantId: TENANT_A,
      topic: DASHBOARD_EVENT_TYPES.dutyChanged,
      domainEvent: 'DEVER_COMPROVADO',
      aggregate: { kind: 'duty_cycle', id: dutyCycleId, version: 2 },
      data: {
        dutyCycleId,
        dutyCode: 'DUTY-01',
        indicatorCode: 'IND-DASH-201',
        period: '2026-08',
        fromState: 'SUBMETIDO_PUBLICADO',
        toState: 'COMPROVADO',
        deadlineOn: '2026-09-20',
        late: false,
        occurredAt: new Date().toISOString(),
      },
    });
    await deliver(F3, filtered, [duty]);
    await unfiltered.waitFor(() =>
      [alert, duty].every((id) =>
        unfiltered.events.some((event) => event.id === id),
      ),
    );
    expect(eventIds(filtered, [alert, duty])).toEqual([duty]);
    assertNoTenantInData(filtered);
    assertNoTenantInData(unfiltered);
  });

  // Adenda TASK-0025 (CTG-0004 §6, OD-R22-04): nomes `event:` do F4 = `type`
  // do envelope (antes: `case`/`assignment`); `?topics=case` continua pelo 2º
  // segmento do topic.
  it('C-01-17 — dado F4 com ?topics=case quando chegam rait.case.changed (com tenantId, cpf, cpf_hash e bankData) e rait.assignment.changed então só event: rait.case.changed, sem tenantId/cpf/cpf_hash/bankData; sem topics chega também event: rait.assignment.changed', async () => {
    const filtered = await openReady(F4, { query: '?topics=case' });
    const unfiltered = await openReady(F4, { reset: false });
    const caseRow = await track(
      F4.eligible(TENANT_A, {
        data: {
          tenantId: TENANT_A,
          cpf: CPF.prata,
          cpf_hash: PRATA_HASH,
          bankData: { fixture: 'r22' },
        },
      }),
    );
    const assignment = await track({
      ...F4.eligible(TENANT_A),
      topic: 'rait.assignment.changed',
      domainEvent: 'RAIT_ATRIBUICAO_ALTERADA',
    });
    await deliver(F4, filtered, [caseRow]);
    await unfiltered.waitFor(() =>
      [caseRow, assignment].every((id) =>
        unfiltered.events.some((event) => event.id === id),
      ),
    );
    expect(eventIds(filtered, [caseRow, assignment])).toEqual([caseRow]);
    expect(filtered.events.find((event) => event.id === caseRow)?.event).toBe(
      'rait.case.changed',
    );
    expect(
      unfiltered.events.find((event) => event.id === assignment)?.event,
    ).toBe('rait.assignment.changed');
    for (const stream of [filtered, unfiltered]) {
      assertNoTenantInData(stream);
      for (const event of stream.events) {
        for (const token of ['"cpf"', 'cpf_hash', 'bankData', CPF.prata])
          expect(event.data ?? '').not.toContain(token);
      }
    }
  });
});

describe('C-01-18 — ticks serializados em F2 e F3', () => {
  it.each([F2, F3].map((flow) => [flow.id, flow] as const))(
    'C-01-18 — dado %s aberto quando dois disparos de leitura saem sem await entre eles então cada linha é emitida uma única vez e em ordem',
    async (_id, flow) => {
      const stream = await openReady(flow);
      const rows = [
        await track(flow.eligible(flow.tenant)),
        await track(flow.eligible(flow.tenant)),
        await track(flow.eligible(flow.tenant)),
      ];
      await flow.scheduler().fireReads({ concurrent: true });
      await stream.waitFor(() => eventIds(stream, rows).length >= 3);
      await settle(300);
      expect(eventIds(stream, rows)).toEqual(rows);
    },
  );
});

describe('C-01-19 — limites só em F3', () => {
  it('C-01-19 — dado F3 com cinco conexões do mesmo usuário quando abre a sexta então 429; ao fechar uma, a próxima 200; evento com data > 8 KB então `: dropped <id>` e nenhum frame desse id', async () => {
    const streams: OpenStream[] = [];
    for (let index = 0; index < 5; index += 1) {
      const stream = await openReady(F3, { reset: index === 0 });
      expect(stream.status(), `conexão ${index + 1}`).toBe(200);
      streams.push(stream);
    }
    const sixth = openStream(
      appA.port,
      F3.path,
      F3.headers(F3.allowedRole),
      openRequests,
    );
    await sixth.ended;
    expect(sixth.status()).toBe(429);
    expect(sixth.body()).not.toContain(': connected');

    streams[0]!.close();
    await settle(200);
    const again = await openReady(F3, { reset: false });
    expect(again.status()).toBe(200);

    const large = await track(
      F3.eligible(TENANT_A, { data: { filler: 'x'.repeat(9000) } }),
    );
    const small = await track(F3.eligible(TENANT_A));
    await deliver(F3, again, [small]);
    expect(again.comments).toContain(`: dropped ${large}`);
    expect(eventIds(again, [large, small])).toEqual([small]);
  });

  it.each([F1, F2, F4].map((flow) => [flow.id, flow] as const))(
    'C-01-19 — dado %s com cinco conexões do mesmo usuário quando abre a sexta então 200; evento com payload > 8 KB é entregue',
    async (_id, flow) => {
      const streams: OpenStream[] = [];
      for (let index = 0; index < 6; index += 1) {
        const stream = await openReady(flow, { reset: index === 0 });
        expect(stream.status(), `conexão ${index + 1}`).toBe(200);
        streams.push(stream);
      }
      const large = await track(
        flow.eligible(flow.tenant, { data: { filler: 'x'.repeat(9000) } }),
      );
      const last = streams[5]!;
      await deliver(flow, last, [large]);
      expect(eventIds(last, [large])).toEqual([large]);
      if (flow.id !== 'F2')
        expect(
          Buffer.byteLength(
            last.events.find((event) => event.id === large)!.data ?? '',
          ),
        ).toBeGreaterThan(8 * 1024);
    },
  );
});
