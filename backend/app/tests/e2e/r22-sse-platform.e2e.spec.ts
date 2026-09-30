import { AsyncResource } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';
import type http from 'node:http';
import type { INestApplication } from '@nestjs/common';
import { DASHBOARD_EVENT_TYPES } from '@detran/dashboard-monitor';
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
  ACTOR_ID as DASHBOARD_ACTOR_ID,
  SEED as DASHBOARD_SEED,
  TENANT_ID as DASHBOARD_TENANT_ID,
} from './dashboard-e2e.support.js';
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
  asOwnerIn,
  asOwnerRole,
  deleteOutbox,
  newOwnerClient,
  openStream,
  seedIsolationTenants,
  settle,
  type OpenStream,
  type OutboxFixture,
} from './r22-sse-tenancy.support.js';

/**
 * R-0022 CTG-0004 §5 (TASK-0025, Inspector, antes de TASK-0007) —
 * C-04-04…C-04-14: critérios de plataforma dos quatro fluxos SSE do backend
 * servidos pelo `StynxEventStreamService` 1.5.0 (CTG-0004 §1–§4), com as
 * decisões do Owner de B12 (OD-R22-50…55). Tríade com vermelho verificável:
 * os casos que o código atual (enquadramento local sobre 1.4.0/1.5.0) não
 * cumpre falham agora, sem `it.fails`/`skip`, e a lista exata está em
 * `work/rounds/R-0022/reports/TASK-0025.expected-red.txt`; TASK-0007 a zera.
 *
 * Só rota, cabeçalhos, status, corpo e banco. Ligações com `src/`, todas
 * previstas no contrato: os quatro tokens da porta de agendamento (CTG-0004
 * R-3), os quatro serviços de leitura (dublê por _spy_ no módulo de teste,
 * C-04-13; a fonte de R-5 delega a eles) e o produtor de frescor
 * `DashboardFreshnessService` (C-04-08, OD-R22-50: o fato próprio
 * `integration.health` é gravado pelo produtor, fronteira de TASK-0007).
 *
 * Tenants e atores (CTG-0004 §5): F1, F3 e F4 abrem como o tenant A de
 * `tools/check-rls-smoke.ts` (`…101`, ator `…201`); F2 como o tenant/persona
 * do _harness_ do Portal (`…0001`, ator `…0002`, CPF prata), único que cria o
 * sujeito cidadão; B é sempre o tenant B do smoke (`…102`). A prova do
 * produtor de frescor (C-04-08) usa o tenant/persona do _harness_ do
 * DASHBOARD (`…a001`, ator `…b0000001`), único com a fonte canônica
 * `teat.offline-sync` (`81-fixtures-dashboard-state.sql`) e os parâmetros
 * `dashboard.heartbeat_divisor`/`stale_hide_multiplier` (`05-parameters.sql`).
 * Nenhum tenant ou persona novo. RLS real: abertura e leituras pelo
 * `Database` do app (`role_app_backend`), com o controle de papel de
 * CTG-0001 §4.2 abaixo; o cliente owner só grava e apaga fixtures.
 *
 * F4 abre como `rait-manager` (tem `inf:rait-stream:read` e
 * `inf:rait-case:read`, não é papel restrito a _pool_), para que nenhum caso
 * dependa da cláusula de _pool_ de OD-R22-04, em checkpoint (C-04-11, relatório
 * de TASK-0025).
 *
 * Agendador: um por token, forma `schedule(fn, intervalMs?) → cancel`
 * (CTG-0001 §4.3). Cada inscrição guarda a `fn` crua e a ligada ao contexto
 * de quem agendou (`AsyncResource.bind`); só C-04-04 dispara a crua, fora do
 * ALS da requisição (UPS-SSE-05). Heartbeat × leitura pelo `intervalMs`
 * (`20000` × ausente, R-3). O serviço publicado agenda `() => { void tick(); }`:
 * disparar não espera a leitura, por isso toda entrega é aguardada pelo corpo.
 */

type FlowId = 'F1' | 'F2' | 'F3' | 'F4';
type OutboxStatus = 'pending' | 'processing' | 'acked' | 'error';

interface PlatformSubscription {
  readonly raw: () => unknown;
  readonly bound: () => unknown;
  readonly intervalMs: number | undefined;
  cancelled: boolean;
}

/** Agendador manual por token (CTG-0001 §4.3), com disparo ligado ou cru. */
class PlatformScheduler {
  readonly intervalMs = 1000;
  readonly subscriptions: PlatformSubscription[] = [];

  readonly schedule = (
    fn: () => void | Promise<void>,
    intervalMs?: number,
  ): (() => void) => {
    const subscription: PlatformSubscription = {
      raw: fn,
      bound: AsyncResource.bind(fn),
      intervalMs,
      cancelled: false,
    };
    this.subscriptions.push(subscription);
    return () => {
      subscription.cancelled = true;
    };
  };

  heartbeats(): PlatformSubscription[] {
    return this.subscriptions.filter(
      (subscription) => subscription.intervalMs === HEARTBEAT_MS,
    );
  }

  reads(): PlatformSubscription[] {
    return this.subscriptions.filter(
      (subscription) => subscription.intervalMs === undefined,
    );
  }

  /**
   * Dispara as leituras ativas. `unbound`: a `fn` crua, chamada do contexto
   * assíncrono do teste (sem o ALS da requisição). `concurrent`: dois
   * disparos por inscrição sem `await` entre eles. Rejeição de uma leitura é
   * absorvida aqui: o critério é o efeito no corpo, não a promessa.
   */
  async fireReads(
    options: { unbound?: boolean; concurrent?: boolean } = {},
  ): Promise<void> {
    const active = this.reads().filter(
      (subscription) => !subscription.cancelled,
    );
    const call = (subscription: PlatformSubscription): Promise<unknown> => {
      try {
        return Promise.resolve(
          options.unbound ? subscription.raw() : subscription.bound(),
        );
      } catch (error) {
        return Promise.reject(error);
      }
    };
    if (options.concurrent) {
      const first = active.map(call);
      const second = active.map(call);
      await Promise.allSettled([...first, ...second]);
      return;
    }
    for (const subscription of active)
      await Promise.allSettled([call(subscription)]);
  }

  reset(): void {
    this.subscriptions.length = 0;
  }
}

interface ReadService {
  listSince(...args: never[]): Promise<unknown>;
}

interface PlatformApp {
  app: INestApplication;
  port: number;
  schedulers: Record<FlowId, PlatformScheduler>;
  readers: Record<FlowId, ReadService>;
  /** Produtor de frescor do grafo deste app (C-04-08). */
  freshness: {
    observe(
      tx: unknown,
      sourceKey: string,
      seenAt: Date,
      ctx: {
        tenantId: string;
        now: Date;
        actor: { kind: 'system' };
      },
    ): Promise<void>;
  };
  database: {
    withRequestContext<T>(
      scope: { tenantId: string; actorId: string },
      fn: () => Promise<T>,
    ): Promise<T>;
    tx<T>(
      fn: (tx: unknown) => Promise<T>,
      options?: { role?: string; readonly?: boolean },
    ): Promise<T>;
  };
}

/**
 * App real (`app.listen(0)`) com a _claim_ do verificador local fixada em
 * `claimTenantId` (T-14, grafo de módulos novo) e um `PlatformScheduler` por
 * token de porta. Tokens, serviços de leitura e produtor vêm do mesmo grafo
 * do `AppModule` importado.
 */
async function bootPlatformApp(claimTenantId: string): Promise<PlatformApp> {
  const previous = process.env.DETRAN_LOCAL_TENANT_ID;
  process.env.DETRAN_LOCAL_TENANT_ID = claimTenantId;
  vi.resetModules();
  try {
    const { Test } = await import('@nestjs/testing');
    const { Database } = await import('@stynx-nyx/data');
    const { AppModule } = await import('../../src/app.module.js');
    const teat = await import('../../src/teat-stream.service.js');
    const portal = await import('../../src/portal-stream.service.js');
    const dashboard = await import('../../src/dashboard-stream.service.js');
    const rait =
      await import('../../src/handwritten/rait/rait-stream.service.js');
    const { DashboardFreshnessService } =
      await import('@detran/dashboard-monitor');
    const schedulers: Record<FlowId, PlatformScheduler> = {
      F1: new PlatformScheduler(),
      F2: new PlatformScheduler(),
      F3: new PlatformScheduler(),
      F4: new PlatformScheduler(),
    };
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule.forRoot()],
    })
      .overrideProvider(teat.TEAT_STREAM_POLLER)
      .useValue(schedulers.F1)
      .overrideProvider(portal.PORTAL_STREAM_POLLER)
      .useValue(schedulers.F2)
      .overrideProvider(dashboard.DASHBOARD_STREAM_POLLER)
      .useValue(schedulers.F3)
      .overrideProvider(rait.RAIT_STREAM_POLLER)
      .useValue(schedulers.F4)
      .compile();
    const app = moduleRef.createNestApplication({
      logger: false,
      abortOnError: false,
    });
    await app.init();
    await app.listen(0);
    const address = app.getHttpServer().address();
    const lookup = <T>(token: unknown): T =>
      app.get(token as never, { strict: false }) as T;
    return {
      app,
      port: typeof address === 'object' && address ? address.port : 0,
      schedulers,
      readers: {
        F1: lookup<ReadService>(teat.TeatStreamService),
        F2: lookup<ReadService>(portal.PortalStreamService),
        F3: lookup<ReadService>(dashboard.DashboardStreamService),
        F4: lookup<ReadService>(rait.RaitStreamService),
      },
      freshness: lookup<PlatformApp['freshness']>(DashboardFreshnessService),
      database: lookup<PlatformApp['database']>(Database),
    };
  } finally {
    if (previous === undefined) delete process.env.DETRAN_LOCAL_TENANT_ID;
    else process.env.DETRAN_LOCAL_TENANT_ID = previous;
  }
}

interface Flow {
  id: FlowId;
  path: string;
  tenant: string;
  actor: string;
  role: string;
  target(): PlatformApp;
  scheduler(): PlatformScheduler;
  headers(role?: string): Record<string, string>;
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
let appA: PlatformApp;
let appPortal: PlatformApp;
let appDashboard: PlatformApp;

/** AIT `INTEGRADO` canônico (`rait-fixtures.md` §2) e caso 07 (§3). */
const AIT_01 = '00000000-0000-7000-8000-0000f0000001';
const CASE_07 = '00000000-0000-7000-8000-000010000007';
const PRATA_HASH = cpfHash(CPF.prata);
const TEAT_OFFLINE_SYNC = 'teat.offline-sync';
/**
 * Latência aceitável de preparação da fonte (a mesma `L` de
 * `backend/domains/dashboard/monitor/tests/integration/cycle-freshness.integration.spec.ts`).
 * Só habilita o produtor (`observe` sai cedo com `L` nulo, M13); o critério
 * não depende do valor: com `seenAt = now`, qualquer `L ≥ 0` dá `FRESCO`.
 */
const PREPARATION_LATENCY_MINUTES = 60;

function sessionHeaders(
  tenantId: string,
  actorId: string,
  role: string,
): Record<string, string> {
  clearCitizenEnv();
  process.env.DETRAN_LOCAL_ROLES = role;
  process.env.DETRAN_LOCAL_ACTOR_ID = actorId;
  return {
    authorization: 'Bearer local',
    'x-tenant-id': tenantId,
    accept: 'text/event-stream',
  };
}

/** Envelope `dashboard.alert.changed` (campos de `dashboard-stream.e2e.spec.ts`). */
function alertData(): Record<string, unknown> {
  return {
    alertId: randomUUID(),
    indicatorCode: 'IND-DASH-101',
    track: 'extinction',
    fromState: 'NOTIFICADO',
    toState: 'RECONHECIDO',
    severity: 'N2',
    block: 'A',
    sourceApp: 'portal',
    objectKind: 'case',
    objectLayer: 'N1',
    objectRef: null,
    ownerRole: 'rait-manager',
    escalationLevel: 0,
    occurredAt: new Date().toISOString(),
  };
}

/** Envelope `dashboard.source.freshness` (campos de `freshness.service.ts`). */
function freshnessFixture(
  tenantId: string,
  source: { sourceKey: string; app: string },
): OutboxFixture {
  const sourceId = randomUUID();
  return {
    tenantId,
    topic: DASHBOARD_EVENT_TYPES.sourceFreshness,
    domainEvent: 'FONTE_FRESCOR_ALTERADO',
    aggregate: { kind: 'source', id: sourceId, version: 2 },
    data: {
      sourceId,
      sourceKey: source.sourceKey,
      app: source.app,
      fromState: 'FRESCO',
      toState: 'ATRASADO',
      hidden: false,
      lastSeenAt: new Date().toISOString(),
      staleSince: null,
      acceptableLatencyMinutes: null,
      occurredAt: new Date().toISOString(),
    },
  };
}

/** Envelope RAIT (`rait-events-sse-contract.md` §1): `aggregate.kind` decide a chave (CTG-0004 §4). */
function raitFixture(
  tenantId: string,
  type: string,
  domainEvent: string,
  kind: string,
  data: Record<string, unknown> = {},
): OutboxFixture {
  const id = kind === 'case' ? CASE_07 : randomUUID();
  return {
    tenantId,
    topic: type,
    domainEvent,
    aggregate: { kind, id, version: 1 },
    data: { caseId: CASE_07, ...data },
  };
}

const F1: Flow = {
  id: 'F1',
  path: '/v1/ops/stream',
  tenant: TENANT_A,
  actor: ACTOR_A,
  role: 'field-agent',
  target: () => appA,
  scheduler: () => appA.schedulers.F1,
  headers: (role = 'field-agent') => sessionHeaders(TENANT_A, ACTOR_A, role),
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
  role: 'CIDADAO',
  target: () => appPortal,
  scheduler: () => appPortal.schedulers.F2,
  headers: (role = 'CIDADAO') => {
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
      topic: 'portal.request.changed',
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
  role: 'dash-operator',
  target: () => appA,
  scheduler: () => appA.schedulers.F3,
  headers: (role = 'dash-operator') => sessionHeaders(TENANT_A, ACTOR_A, role),
  eligible: (tenantId, extra = {}) => {
    const data = alertData();
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
  role: 'rait-manager',
  target: () => appA,
  scheduler: () => appA.schedulers.F4,
  headers: (role = 'rait-manager') => sessionHeaders(TENANT_A, ACTOR_A, role),
  eligible: (tenantId, extra = {}) => ({
    ...raitFixture(
      tenantId,
      'rait.case.changed',
      'RAIT_CASO_ESTADO_ALTERADO',
      'case',
      extra.data,
    ),
    ageHours: extra.ageHours,
  }),
};

const FLOWS: readonly Flow[] = [F1, F2, F3, F4];
const EACH_FLOW = FLOWS.map((flow) => [flow.id, flow] as const);

/**
 * Linha de `integration.outbox` gravada pelo owner (só preparação), no
 * envelope de `insertOutbox` do apoio, com `status` e `created_at` de
 * microssegundos não nulos quando pedido (C-04-12, C-04-14).
 */
async function insertRow(
  fixture: OutboxFixture,
  options: { status?: OutboxStatus; microseconds?: boolean } = {},
): Promise<string> {
  await asOwnerIn(client, fixture.tenantId);
  const envelope = {
    type: fixture.type ?? fixture.topic,
    domainEvent: fixture.domainEvent,
    version: 1,
    occurredAt: new Date().toISOString(),
    tenantId: fixture.tenantId,
    actor: { kind: 'system', id: null },
    correlationId: randomUUID(),
    aggregate: fixture.aggregate,
    data: fixture.data,
  };
  const result = await client.query<{ id: string }>(
    `insert into integration.outbox
       (tenant_id, topic, aggregate_type, aggregate_id, payload, idempotency_key, status, created_at, available_at)
     select $1, $2, $3, $4, $5::jsonb, $6, $7, stamp, stamp
       from (select case when $9::boolean
                         then date_trunc('milliseconds', clock_timestamp()) + interval '437 microseconds'
                         else now() - make_interval(hours => $8::int)
                    end as stamp) as moment
     returning id::text as id`,
    [
      fixture.tenantId,
      fixture.topic,
      fixture.aggregate.kind,
      fixture.aggregate.id,
      JSON.stringify(envelope),
      `r22-platform:${fixture.topic}:${randomUUID()}`,
      options.status ?? 'pending',
      fixture.ageHours ?? 0,
      options.microseconds ?? false,
    ],
  );
  const id = result.rows[0]!.id;
  createdOutbox.push(id);
  return id;
}

/**
 * Transação do produtor sob `role_app_backend` com `app.tenant_id`/
 * `app.actor_id` do tenant (forma de `tools/check-rls-smoke.ts`), numa
 * conexão própria. Não usa `Database.tx` do app como transação externa:
 * `DashboardFreshnessService.params()` abre duas `Database.tx` aninhadas em
 * `Promise.all`, e dentro de uma transação externa do app a segunda falha
 * com `savepoint "stynx_sp_2" does not exist` (achado registrado no
 * relatório de TASK-0025). Fora dela, cada leitura de parâmetro é uma
 * transação própria do app, sob o mesmo contexto.
 */
async function inAppRoleTransaction<T>(
  tenantId: string,
  actorId: string,
  work: (tx: {
    query(
      statement: string,
      values?: readonly unknown[],
    ): Promise<{ rows: Record<string, unknown>[]; rowCount?: number | null }>;
  }) => Promise<T>,
): Promise<T> {
  const appClient = newOwnerClient();
  await appClient.connect();
  try {
    await appClient.query('begin');
    await appClient.query('set local role role_app_backend');
    await appClient.query(
      `select set_config('app.tenant_id', $1, true), set_config('app.actor_id', $2, true)`,
      [tenantId, actorId],
    );
    const control = await appClient.query<{ current_user: string }>(
      'select current_user::text as current_user',
    );
    expect(control.rows[0]?.current_user).toBe('role_app_backend');
    const result = await work({
      query: (statement, values) =>
        appClient.query(statement, values as unknown[] | undefined),
    });
    await appClient.query('commit');
    return result;
  } catch (error) {
    await appClient.query('rollback').catch(() => undefined);
    throw error;
  } finally {
    await appClient.end();
  }
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
    extra?: Record<string, string | string[]>;
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
      ...flow.headers(options.role ?? flow.role),
      ...(options.extra as Record<string, string> | undefined),
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
    await settle(100);
  }
  return stream;
}

/** Dispara a leitura, espera `ids` e dá um segundo disparo com folga. */
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

async function isClosed(stream: OpenStream, ms = 200): Promise<boolean> {
  return Promise.race([
    stream.ended.then(() => true),
    settle(ms).then(() => false),
  ]);
}

/** Corpo sem página HTML, pilha, SQL ou nome de exceção (OD-R22-42/55). */
function expectNoInternalDetail(body: string): void {
  expect(body).not.toMatch(
    /<html|<!doctype|\n\s+at |stack|invalid input syntax|QueryFailedError|TypeError|Error:/i,
  );
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

  appA = await bootPlatformApp(TENANT_A);
  appPortal = await bootPlatformApp(PORTAL_TENANT_ID);
  appDashboard = await bootPlatformApp(DASHBOARD_TENANT_ID);
}, 240_000);

afterEach(async () => {
  vi.restoreAllMocks();
  for (const req of openRequests.splice(0)) req.destroy();
  // Fechamentos liberam a contagem de conexões do F3 antes do próximo caso.
  await settle(150);
  await deleteOutbox(client, createdOutbox.splice(0));
});

afterAll(async () => {
  await appA?.app.close();
  await appPortal?.app.close();
  await appDashboard?.app.close();
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

describe('CTG-0001 §4.2 — controle de papel da conexão do app (sse-platform)', () => {
  it('dado o Database de cada app quando withRequestContext(tenant, ator) e tx app readonly então current_user = role_app_backend e app.tenant_id/app.actor_id do contexto', async () => {
    for (const [target, tenantId, actorId] of [
      [appA, TENANT_A, ACTOR_A],
      [appPortal, PORTAL_TENANT_ID, PORTAL_ACTOR_ID],
      [appDashboard, DASHBOARD_TENANT_ID, DASHBOARD_ACTOR_ID],
    ] as const) {
      expect(await appRoleControl(target.app, tenantId, actorId)).toEqual({
        current_user: 'role_app_backend',
        tenant_id: tenantId,
        actor_id: actorId,
      });
    }
  });
});

describe('C-04-04 — escopo explícito por conexão (UPS-SSE-05)', () => {
  it.each(EACH_FLOW)(
    'C-04-04 — dado %s aberto como A quando a leitura dispara num contexto assíncrono sem o ALS da requisição (fn sem AsyncResource.bind) então a linha de A chega e a de B nunca',
    async (_id, flow) => {
      const stream = await openReady(flow);
      expect(stream.status(), stream.body()).toBe(200);
      const own = await insertRow(flow.eligible(flow.tenant));
      const foreign = await insertRow(flow.eligible(TENANT_B));
      await flow.scheduler().fireReads({ unbound: true });
      await stream.waitFor(() =>
        stream.events.some((event) => event.id === own),
      );
      await settle(200);
      await flow.scheduler().fireReads({ unbound: true });
      await settle(200);
      expect(eventIds(stream, [own, foreign])).toEqual([own]);
    },
  );
});

describe('C-04-05 — Last-Event-ID que não é UUID (OD-R22-42)', () => {
  it.each(EACH_FLOW)(
    'C-04-05 — dado %s e Last-Event-ID nao-e-uuid quando abre então 200 com `: connected`, nada anterior à abertura é reenviado e um evento novo depois da abertura chega; nunca 5xx, HTML ou pilha',
    async (_id, flow) => {
      const before = await insertRow(flow.eligible(flow.tenant));
      const stream = await openReady(flow, {
        extra: { 'last-event-id': 'nao-e-uuid' },
      });
      expect(stream.status(), stream.body()).toBe(200);
      expect(stream.sequence[0]).toBe('comment:: connected');
      const after = await insertRow(flow.eligible(flow.tenant));
      await deliver(flow, stream, [after]);
      expect(eventIds(stream, [before, after])).toEqual([after]);
      expectNoInternalDetail(stream.body());
    },
  );
});

describe('C-04-06 — Last-Event-ID vazio, longo ou repetido (OD-R22-55)', () => {
  it.each(EACH_FLOW)(
    'C-04-06 — dado %s quando Last-Event-ID é vazio ou tem 4097 caracteres então 400 SSE_INVALID_LAST_EVENT_ID publicado sem corpo SSE; com dois cabeçalhos Last-Event-ID nunca 5xx; nenhum dos três expõe detalhe interno',
    async (_id, flow) => {
      const cases: Array<[string, string | string[]]> = [
        ['vazio', ''],
        ['4097 caracteres', 'a'.repeat(4097)],
        ['dois cabeçalhos', [randomUUID(), randomUUID()]],
      ];
      const observed: Array<{
        label: string;
        status: number;
        code: string | string[] | undefined;
        contentType: string;
        body: string;
      }> = [];
      for (const [label, value] of cases) {
        const stream = openStream(
          flow.target().port,
          flow.path,
          {
            ...flow.headers(),
            'last-event-id': value as string,
          },
          openRequests,
        );
        await stream.opened;
        if (stream.status() !== 200) await stream.ended;
        else await settle(100);
        stream.close();
        observed.push({
          label,
          status: stream.status(),
          code: stream.headers()['x-stynx-error-code'],
          contentType: String(stream.headers()['content-type']),
          body: stream.body().slice(0, 200),
        });
      }
      // O status observado de cada valor fica registrado na mensagem (C-04-06).
      const record = JSON.stringify(
        observed.map(({ label, status, code }) => ({ label, status, code })),
      );
      for (const entry of observed) {
        expect(entry.status, record).toBeLessThan(500);
        expectNoInternalDetail(entry.body);
        if (entry.label === 'dois cabeçalhos') {
          if (entry.status === 400)
            expect(entry.code, record).toBe('SSE_INVALID_LAST_EVENT_ID');
          continue;
        }
        expect(entry.status, record).toBe(400);
        expect(entry.code, record).toBe('SSE_INVALID_LAST_EVENT_ID');
        expect(entry.body, record).not.toContain(': connected');
        expect(entry.contentType, record).not.toContain('text/event-stream');
      }
    },
  );
});

describe('C-04-07 — limite de conexões do DASHBOARD (OD-R22-05, OD-R22-51)', () => {
  it('C-04-07 — dado F3 com cinco conexões do mesmo (tenant, ator) quando abre a sexta então 429 com Retry-After = 1 e sem corpo SSE; ao fechar uma, a próxima 200', async () => {
    const streams: OpenStream[] = [];
    for (let index = 0; index < 5; index += 1) {
      const stream = await openReady(F3, { reset: index === 0 });
      expect(stream.status(), `conexão ${index + 1}`).toBe(200);
      streams.push(stream);
    }
    const sixth = openStream(appA.port, F3.path, F3.headers(), openRequests);
    await sixth.ended;
    expect(sixth.status()).toBe(429);
    expect(sixth.headers()['retry-after']).toBe('1');
    expect(sixth.body()).not.toContain(': connected');
    expect(String(sixth.headers()['content-type'])).not.toContain(
      'text/event-stream',
    );

    streams[0]!.close();
    await settle(200);
    const again = await openReady(F3, { reset: false });
    expect(again.status()).toBe(200);
  });
});

describe('C-04-08 — um frame por linha no DASHBOARD (OD-R22-05, OD-R22-50)', () => {
  it('C-04-08 — dado F3 com linhas source.freshness de teat.offline-sync, senatran-adapter e pec e um alert.changed quando a leitura dispara então cada linha gera exatamente um frame, os de frescor com event: source.freshness, e nenhum id se repete', async () => {
    const stream = await openReady(F3);
    expect(stream.status(), stream.body()).toBe(200);
    const teat = await insertRow(
      freshnessFixture(TENANT_A, {
        sourceKey: TEAT_OFFLINE_SYNC,
        app: 'teat',
      }),
    );
    const adapter = await insertRow(
      freshnessFixture(TENANT_A, {
        sourceKey: 'senatran-adapter.telemetry',
        app: 'senatran-adapter',
      }),
    );
    const pec = await insertRow(
      freshnessFixture(TENANT_A, { sourceKey: 'pec.deadlines', app: 'pec' }),
    );
    const alert = await insertRow(F3.eligible(TENANT_A));
    const rows = [teat, adapter, pec, alert];
    await deliver(F3, stream, rows);
    const frames = stream.events.filter((event) =>
      rows.includes(event.id ?? ''),
    );
    expect(frames.map((event) => event.id)).toEqual(rows);
    expect(new Set(stream.events.map((event) => event.id)).size).toBe(
      stream.events.length,
    );
    for (const id of [teat, adapter, pec])
      expect(frames.find((event) => event.id === id)?.event).toBe(
        'source.freshness',
      );
  });

  it('C-04-08 — dado a fonte canônica teat.offline-sync (tenant a001) quando o produtor de frescor grava uma mudança de estado então integration.health chega como frame de linha própria, com id distinto do frame source.freshness, e nenhum id se repete', async () => {
    const sourceId = DASHBOARD_SEED.source.teatOfflineSync;
    await asOwnerIn(client, DASHBOARD_TENANT_ID);
    const original = (
      await client.query<Record<string, unknown>>(
        `select state, last_seen_at, last_read_at, acceptable_latency_minutes,
                heartbeat_contract, stale_since, hidden, version
           from dashboard.source where tenant_id = $1 and id = $2`,
        [DASHBOARD_TENANT_ID, sourceId],
      )
    ).rows[0];
    expect(original, 'fonte canônica 81000402 ausente').toBeDefined();
    const startedAt = (
      await client.query<{ now: string }>(
        'select clock_timestamp()::text as now',
      )
    ).rows[0]!.now;
    await client.query(
      `update dashboard.source set acceptable_latency_minutes = $3
        where tenant_id = $1 and id = $2`,
      [DASHBOARD_TENANT_ID, sourceId, PREPARATION_LATENCY_MINUTES],
    );
    const scheduler = appDashboard.schedulers.F3;
    try {
      scheduler.reset();
      const stream = openStream(
        appDashboard.port,
        `${F3.path}?topics=integration.health,source.freshness`,
        sessionHeaders(
          DASHBOARD_TENANT_ID,
          DASHBOARD_ACTOR_ID,
          'dash-operator',
        ),
        openRequests,
      );
      await stream.opened;
      expect(stream.status(), stream.body()).toBe(200);
      await waitUntil(() => scheduler.reads().length > 0);
      await settle(100);

      const seenAt = new Date();
      await appDashboard.database.withRequestContext(
        { tenantId: DASHBOARD_TENANT_ID, actorId: DASHBOARD_ACTOR_ID },
        () =>
          inAppRoleTransaction(DASHBOARD_TENANT_ID, DASHBOARD_ACTOR_ID, (tx) =>
            appDashboard.freshness.observe(tx, TEAT_OFFLINE_SYNC, seenAt, {
              tenantId: DASHBOARD_TENANT_ID,
              now: seenAt,
              actor: { kind: 'system' },
            }),
          ),
      );
      await asOwnerRole(client);
      const produced = (
        await client.query<{ id: string; topic: string }>(
          `select id::text as id, topic from integration.outbox
            where tenant_id = $1 and created_at >= $2::timestamptz
            order by created_at, id`,
          [DASHBOARD_TENANT_ID, startedAt],
        )
      ).rows;
      createdOutbox.push(...produced.map((row) => row.id));
      const freshnessRow = produced.find(
        (row) => row.topic === DASHBOARD_EVENT_TYPES.sourceFreshness,
      );
      expect(freshnessRow, JSON.stringify(produced)).toBeDefined();

      await scheduler.fireReads();
      await stream.waitFor(() =>
        ['source.freshness', 'integration.health'].every((name) =>
          stream.events.some((event) => event.event === name),
        ),
      );
      await settle(200);
      await scheduler.fireReads();
      await settle(200);
      const freshnessFrames = stream.events.filter(
        (event) => event.event === 'source.freshness',
      );
      const healthFrames = stream.events.filter(
        (event) => event.event === 'integration.health',
      );
      expect(freshnessFrames.map((event) => event.id)).toEqual([
        freshnessRow!.id,
      ]);
      expect(healthFrames).toHaveLength(1);
      expect(healthFrames[0]!.id).not.toBe(freshnessRow!.id);
      expect(produced.map((row) => row.id)).toContain(healthFrames[0]!.id);
      expect(new Set(stream.events.map((event) => event.id)).size).toBe(
        stream.events.length,
      );
      for (const event of stream.events)
        expect(event.data ?? '').not.toContain(DASHBOARD_TENANT_ID);
    } finally {
      await asOwnerIn(client, DASHBOARD_TENANT_ID);
      await client.query(
        `update dashboard.source
            set state = $3, last_seen_at = $4, last_read_at = $5,
                acceptable_latency_minutes = $6, heartbeat_contract = $7,
                stale_since = $8, hidden = $9, version = $10
          where tenant_id = $1 and id = $2`,
        [
          DASHBOARD_TENANT_ID,
          sourceId,
          original!.state,
          original!.last_seen_at,
          original!.last_read_at,
          original!.acceptable_latency_minutes,
          original!.heartbeat_contract,
          original!.stale_since,
          original!.hidden,
          original!.version,
        ],
      );
    }
  });
});

describe('C-04-09 — nome de evento do RAIT = type do envelope (OD-R22-04)', () => {
  it('C-04-09 — dado F4 com rait-manager quando chegam rait.case.changed e rait.assignment.changed então event: rait.case.changed e event: rait.assignment.changed; com ?topics=case só o de caso', async () => {
    const filtered = await openReady(F4, { query: '?topics=case' });
    const unfiltered = await openReady(F4, { reset: false });
    expect(filtered.status(), filtered.body()).toBe(200);
    expect(unfiltered.status(), unfiltered.body()).toBe(200);
    const caseRow = await insertRow(F4.eligible(TENANT_A));
    const assignment = await insertRow(
      raitFixture(
        TENANT_A,
        'rait.assignment.changed',
        'RAIT_ATRIBUICAO_ALTERADA',
        'assignment',
      ),
    );
    await deliver(F4, unfiltered, [caseRow, assignment]);
    await filtered.waitFor(() =>
      filtered.events.some((event) => event.id === caseRow),
    );
    await settle(200);
    expect(eventIds(filtered, [caseRow, assignment])).toEqual([caseRow]);
    expect(filtered.events.find((event) => event.id === caseRow)?.event).toBe(
      'rait.case.changed',
    );
    expect(
      unfiltered.events.find((event) => event.id === assignment)?.event,
    ).toBe('rait.assignment.changed');
    expect(unfiltered.body()).toMatch(
      new RegExp(
        `id: ${caseRow}\\nevent: rait\\.case\\.changed\\ndata: \\{[^\\n]*\\}\\n\\n`,
      ),
    );
  });
});

describe('C-04-10 — filtro por chave de leitura do agregado no RAIT (OD-R22-04, OD-R22-52)', () => {
  it('C-04-10 — dado F4 com rait-manager (inf:rait-case:read; sem inf:rait-integration:read nem inf:rait-agenda-item:read) quando chegam rait.case.changed, rait.clock.flag-changed, rait.outbox.* e rait.agenda-item.changed então recebe caso e relógio e nunca outbox nem item de pauta', async () => {
    const stream = await openReady(F4);
    expect(stream.status(), stream.body()).toBe(200);
    const caseRow = await insertRow(F4.eligible(TENANT_A));
    const clock = await insertRow(
      raitFixture(
        TENANT_A,
        'rait.clock.flag-changed',
        'RAIT_ALERTA_PRESCRICAO',
        'clock',
      ),
    );
    // `rait.outbox.*`: o catálogo §2 não define tipo com aggregate.kind = outbox
    // (source_pending); o critério vale para qualquer sufixo do prefixo.
    const outbox = await insertRow(
      raitFixture(TENANT_A, 'rait.outbox.changed', 'RAIT_OUTBOX', 'outbox'),
    );
    const agendaItem = await insertRow(
      raitFixture(
        TENANT_A,
        'rait.agenda-item.changed',
        'RAIT_ITEM_PAUTA_ALTERADO',
        'agenda-item',
      ),
    );
    await deliver(F4, stream, [caseRow, clock]);
    expect(eventIds(stream, [caseRow, clock, outbox, agendaItem])).toEqual([
      caseRow,
      clock,
    ]);
  });

  it('C-04-10 — dado F4 com AUDITOR (inf:rait-integration:read e inf:rait-case:read) quando chegam rait.outbox.* e rait.clock.flag-changed então recebe os dois (controle positivo das chaves)', async () => {
    const stream = await openReady(F4, { role: 'AUDITOR' });
    expect(stream.status(), stream.body()).toBe(200);
    const outbox = await insertRow(
      raitFixture(TENANT_A, 'rait.outbox.changed', 'RAIT_OUTBOX', 'outbox'),
    );
    const clock = await insertRow(
      raitFixture(
        TENANT_A,
        'rait.clock.flag-changed',
        'RAIT_ALERTA_PRESCRICAO',
        'clock',
      ),
    );
    await deliver(F4, stream, [outbox, clock]);
    expect(eventIds(stream, [outbox, clock])).toEqual([outbox, clock]);
  });
});

describe('C-04-12 — precisão do cursor (CTG-0004 R-5 (d))', () => {
  it.each(EACH_FLOW)(
    'C-04-12 — dado %s aberto quando uma linha com created_at de microssegundos não nulos chega e a leitura dispara três vezes sucessivas então a linha é entregue exatamente uma vez',
    async (_id, flow) => {
      const stream = await openReady(flow);
      expect(stream.status(), stream.body()).toBe(200);
      const row = await insertRow(flow.eligible(flow.tenant), {
        microseconds: true,
      });
      await asOwnerRole(client);
      const stamp = (
        await client.query<{ micro: string }>(
          `select (extract(microseconds from created_at)::bigint % 1000)::text as micro
             from integration.outbox where id = $1`,
          [row],
        )
      ).rows[0]!.micro;
      expect(stamp).not.toBe('0');
      await flow.scheduler().fireReads();
      await stream.waitFor(() =>
        stream.events.some((event) => event.id === row),
      );
      await settle(200);
      await flow.scheduler().fireReads();
      await settle(200);
      await flow.scheduler().fireReads();
      await settle(200);
      expect(eventIds(stream, [row])).toEqual([row]);
    },
  );
});

describe('C-04-13 — leituras serializadas e resilientes (UPS-SSE-07)', () => {
  it.each(EACH_FLOW)(
    'C-04-13 — dado %s aberto quando dois disparos de leitura saem sem await entre eles então cada linha é entregue uma única vez e em ordem',
    async (_id, flow) => {
      const stream = await openReady(flow);
      expect(stream.status(), stream.body()).toBe(200);
      const rows = [
        await insertRow(flow.eligible(flow.tenant)),
        await insertRow(flow.eligible(flow.tenant)),
        await insertRow(flow.eligible(flow.tenant)),
      ];
      await flow.scheduler().fireReads({ concurrent: true });
      await stream.waitFor(() => eventIds(stream, rows).length >= 3);
      await settle(300);
      await flow.scheduler().fireReads();
      await settle(200);
      expect(eventIds(stream, rows)).toEqual(rows);
    },
  );

  it.each(EACH_FLOW)(
    'C-04-13 — dado %s aberto quando a leitura do serviço lança uma vez então a conexão continua aberta e o disparo seguinte entrega a linha uma vez',
    async (_id, flow) => {
      const stream = await openReady(flow);
      expect(stream.status(), stream.body()).toBe(200);
      const reader = flow.target().readers[flow.id];
      const spy = vi
        .spyOn(reader, 'listSince')
        .mockImplementationOnce(() =>
          Promise.reject(new Error('r22-platform: leitura indisponível')),
        );
      const row = await insertRow(flow.eligible(flow.tenant));
      await flow.scheduler().fireReads();
      await settle(200);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(await isClosed(stream)).toBe(false);
      await flow.scheduler().fireReads();
      await stream.waitFor(() =>
        stream.events.some((event) => event.id === row),
      );
      await settle(200);
      expect(spy.mock.calls.length).toBeGreaterThanOrEqual(2);
      expect(eventIds(stream, [row])).toEqual([row]);
      expect(await isClosed(stream)).toBe(false);
    },
  );
});

describe('C-04-14 — status de despacho preservado no RAIT (OD-R22-21 (a))', () => {
  it('C-04-14 — dado F4 com rait-manager quando chegam linhas com status error, pending, processing e acked então a de error nunca é entregue e as outras três chegam em ordem', async () => {
    const stream = await openReady(F4);
    expect(stream.status(), stream.body()).toBe(200);
    const failed = await insertRow(F4.eligible(TENANT_A), { status: 'error' });
    const pending = await insertRow(F4.eligible(TENANT_A), {
      status: 'pending',
    });
    const processing = await insertRow(F4.eligible(TENANT_A), {
      status: 'processing',
    });
    const acked = await insertRow(F4.eligible(TENANT_A), { status: 'acked' });
    await deliver(F4, stream, [pending, processing, acked]);
    expect(eventIds(stream, [failed, pending, processing, acked])).toEqual([
      pending,
      processing,
      acked,
    ]);
  });
});
