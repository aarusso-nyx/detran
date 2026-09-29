// Suporte de R-0022 CTG-0001 (TASK-0002): caracterização de tenancy/RLS e SSE
// do backend sobre STYNX 1.4.0, válida nas duas fases (antes e depois das
// remoções de CTG-0003/CTG-0004). Não é arquivo de teste (vitest só coleta
// `*.e2e.spec.ts`).
//
// - Tenants/atores de isolamento: os de `tools/check-rls-smoke.ts:11-14`,
//   preparados com o mesmo `on conflict … do update` do script (CTG-0001 §0.6).
// - Controle de papel (CTG-0001 §4.2): pelo `Database` do app, dentro de
//   `withRequestContext` e `tx({ role: 'app', readonly: true })`.
// - Agendador manual (CTG-0001 §4.3): forma `schedule(fn, intervalMs?) →
//   cancel`, com cada `fn` ligada ao contexto assíncrono de quem agendou
//   (`AsyncResource.bind`), a mesma semântica de `setInterval`.
// - Leitura SSE por `http.get` no servidor real (`app.listen(0)`), padrão de
//   `portal-stream.e2e.spec.ts`; gravação das escritas do servidor por
//   resposta (instrumentação só do teste, pelo evento `request` do servidor
//   HTTP), para provar "nenhum disparo posterior escreve".
import { AsyncResource } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';
import http, { type IncomingMessage } from 'node:http';
import type { INestApplication } from '@nestjs/common';
import { Database } from '@stynx-nyx/data';
import pg from 'pg';
import { vi } from 'vitest';

export const TENANT_A = '00000000-0000-7000-8000-000000000101';
export const TENANT_B = '00000000-0000-7000-8000-000000000102';
export const ACTOR_A = '00000000-0000-4000-8000-000000000201';
export const ACTOR_B = '00000000-0000-4000-8000-000000000202';

export const OWNER_CONNECTION_STRING =
  process.env.DETRAN_TEST_DATABASE_URL ??
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5432/detran';

export function newOwnerClient(): pg.Client {
  return new pg.Client({ connectionString: OWNER_CONNECTION_STRING });
}

export async function asOwnerRole(client: pg.Client): Promise<void> {
  await client.query(`select set_config('app.role', 'owner', false)`);
}

/** Owner com `app.tenant_id` do tenant cujas linhas de fixture serão gravadas. */
export async function asOwnerIn(
  client: pg.Client,
  tenantId: string,
): Promise<void> {
  await asOwnerRole(client);
  await client.query(`select set_config('app.tenant_id', $1, false)`, [
    tenantId,
  ]);
}

/** Mesmas linhas e o mesmo `on conflict … do update` de `tools/check-rls-smoke.ts`. */
export async function seedIsolationTenants(client: pg.Client): Promise<void> {
  await asOwnerRole(client);
  await client.query(
    `insert into auth.tenants (id, slug, name) values
       ($1, 'rr', 'DETRAN RR'), ($2, 'sp', 'DETRAN SP')
     on conflict (id) do update set name = excluded.name`,
    [TENANT_A, TENANT_B],
  );
  await client.query(
    `insert into auth.users (id, tenant_id, email, display_name) values
       ($1, $3, 'rls-a@detran.invalid', 'RLS A'),
       ($2, $4, 'rls-b@detran.invalid', 'RLS B')
     on conflict (id) do update set tenant_id = excluded.tenant_id`,
    [ACTOR_A, ACTOR_B, TENANT_A, TENANT_B],
  );
  await client.query(
    `insert into auth.memberships (tenant_id, user_id) values ($1, $2), ($3, $4)
     on conflict (tenant_id, user_id) do update set is_active = true`,
    [TENANT_A, ACTOR_A, TENANT_B, ACTOR_B],
  );
}

export interface AppRoleControl {
  current_user: string;
  tenant_id: string | null;
  actor_id: string | null;
}

/**
 * Controle de papel obrigatório de CTG-0001 §4.2: a conexão que o app usa
 * para a operação sob teste é `role_app_backend`, com `app.tenant_id` e
 * `app.actor_id` do contexto.
 */
export async function appRoleControl(
  app: INestApplication,
  tenantId: string,
  actorId: string,
): Promise<AppRoleControl> {
  const database = app.get(Database);
  return database.withRequestContext({ tenantId, actorId }, () =>
    database.tx(
      async (transaction) => {
        const result = await (
          transaction as unknown as {
            query<T>(sql: string): Promise<{ rows: T[] }>;
          }
        ).query<AppRoleControl>(
          `select current_user::text as current_user,
                  current_setting('app.tenant_id', true) as tenant_id,
                  current_setting('app.actor_id', true) as actor_id`,
        );
        return result.rows[0]!;
      },
      { role: 'app', readonly: true },
    ),
  );
}

export interface ManualSubscription {
  readonly fn: () => unknown;
  readonly intervalMs: number | undefined;
  cancelled: boolean;
  cancelCalls: number;
}

/** Agendador manual para os quatro tokens de porta (CTG-0001 §4.3). */
export class ManualScheduler {
  readonly intervalMs = 1000;
  readonly subscriptions: ManualSubscription[] = [];

  constructor(private readonly heartbeatIntervalMs: number) {}

  readonly schedule = (
    fn: () => void | Promise<void>,
    intervalMs?: number,
  ): (() => void) => {
    const subscription: ManualSubscription = {
      fn: AsyncResource.bind(fn),
      intervalMs,
      cancelled: false,
      cancelCalls: 0,
    };
    this.subscriptions.push(subscription);
    return () => {
      subscription.cancelled = true;
      subscription.cancelCalls += 1;
    };
  };

  heartbeats(): ManualSubscription[] {
    return this.subscriptions.filter(
      (subscription) => subscription.intervalMs === this.heartbeatIntervalMs,
    );
  }

  reads(): ManualSubscription[] {
    return this.subscriptions.filter(
      (subscription) => subscription.intervalMs === undefined,
    );
  }

  /** Dispara as leituras ativas e aguarda cada uma (sem `await` entre elas se `concurrent`). */
  async fireReads(options: { concurrent?: boolean } = {}): Promise<void> {
    const active = this.reads().filter(
      (subscription) => !subscription.cancelled,
    );
    if (options.concurrent) {
      const first = active.map((subscription) => subscription.fn());
      const second = active.map((subscription) => subscription.fn());
      await Promise.all([...first, ...second]);
      return;
    }
    for (const subscription of active) await subscription.fn();
  }

  async fireHeartbeats(): Promise<void> {
    for (const subscription of this.heartbeats())
      if (!subscription.cancelled) await subscription.fn();
  }

  reset(): void {
    this.subscriptions.length = 0;
  }
}

/** Escritas do servidor por conexão (`x-r22-conn`), inclusive depois do fechamento. */
export class ServerWriteLog {
  private readonly writes = new Map<string, string[]>();

  attach(app: INestApplication): void {
    const server = app.getHttpServer() as http.Server;
    server.prependListener(
      'request',
      (request: IncomingMessage, response: http.ServerResponse) => {
        const connection = request.headers['x-r22-conn'];
        if (typeof connection !== 'string') return;
        const log: string[] = [];
        this.writes.set(connection, log);
        const originalWrite = response.write.bind(response);
        response.write = ((chunk: unknown, ...rest: unknown[]) => {
          log.push(String(chunk));
          return (originalWrite as (...args: unknown[]) => boolean)(
            chunk,
            ...rest,
          );
        }) as typeof response.write;
      },
    );
  }

  of(connection: string): readonly string[] {
    return this.writes.get(connection) ?? [];
  }
}

export interface SseEvent {
  id?: string;
  event?: string;
  data?: string;
  dataLines: number;
}

export interface OpenStream {
  readonly connection: string;
  status(): number;
  headers(): Record<string, string | string[] | undefined>;
  body(): string;
  readonly events: SseEvent[];
  readonly comments: string[];
  /** Ordem de chegada: `comment:<texto>` ou `event:<id>`. */
  readonly sequence: string[];
  readonly opened: Promise<void>;
  readonly ended: Promise<void>;
  waitFor(predicate: () => boolean, timeoutMs?: number): Promise<void>;
  close(): void;
}

let connectionCounter = 0;

export function openStream(
  port: number,
  path: string,
  requestHeaders: Record<string, string>,
  registry: http.ClientRequest[],
): OpenStream {
  connectionCounter += 1;
  const connection = `r22-${process.pid}-${connectionCounter}`;
  const events: SseEvent[] = [];
  const comments: string[] = [];
  const sequence: string[] = [];
  let status = 0;
  let raw = '';
  let responseHeaders: Record<string, string | string[] | undefined> = {};
  let resolveOpened!: () => void;
  let resolveEnded!: () => void;
  const opened = new Promise<void>((resolve) => {
    resolveOpened = resolve;
  });
  const ended = new Promise<void>((resolve) => {
    resolveEnded = resolve;
  });
  const req = http.get(
    {
      host: '127.0.0.1',
      port,
      path,
      headers: { ...requestHeaders, 'x-r22-conn': connection },
    },
    (res: IncomingMessage) => {
      status = res.statusCode ?? 0;
      responseHeaders = res.headers;
      let buffer = '';
      let current: SseEvent = { dataLines: 0 };
      res.on('data', (chunk: Buffer) => {
        const text = chunk.toString('utf8');
        raw += text;
        if (status !== 200) return;
        buffer += text;
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          const trimmed = line.replace(/\r$/, '');
          if (trimmed === '') {
            if (current.id !== undefined || current.event !== undefined) {
              events.push(current);
              sequence.push(`event:${current.id ?? ''}`);
            }
            current = { dataLines: 0 };
            continue;
          }
          if (trimmed.startsWith(':')) {
            comments.push(trimmed);
            sequence.push(`comment:${trimmed}`);
            if (trimmed === ': connected') resolveOpened();
            continue;
          }
          const separator = trimmed.indexOf(':');
          if (separator === -1) continue;
          const field = trimmed.slice(0, separator);
          const value = trimmed.slice(separator + 1).trimStart();
          if (field === 'id') current.id = value;
          else if (field === 'event') current.event = value;
          else if (field === 'data') {
            current.data = value;
            current.dataLines += 1;
          }
        }
      });
      if (status !== 200) resolveOpened();
      res.on('end', () => {
        resolveOpened();
        resolveEnded();
      });
      res.on('error', () => {
        resolveOpened();
        resolveEnded();
      });
      res.on('close', () => {
        resolveOpened();
        resolveEnded();
      });
    },
  );
  req.on('error', (error) => {
    if ((error as NodeJS.ErrnoException).code !== 'ECONNRESET') {
      resolveOpened();
      resolveEnded();
    }
  });
  registry.push(req);
  return {
    connection,
    status: () => status,
    headers: () => responseHeaders,
    body: () => raw,
    events,
    comments,
    sequence,
    opened,
    ended,
    waitFor: (predicate, timeoutMs = 5000) =>
      new Promise((resolve, reject) => {
        const startedAt = Date.now();
        const check = (): void => {
          if (predicate()) {
            resolve();
            return;
          }
          if (Date.now() - startedAt > timeoutMs) {
            reject(new Error('stream: condição não satisfeita a tempo'));
            return;
          }
          setTimeout(check, 20);
        };
        check();
      }),
    close: () => req.destroy(),
  };
}

export const settle = (ms = 150): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/** Intervalo do heartbeat fixado por C-01-13 (`intervalMs = 20000`). */
export const HEARTBEAT_MS = 20_000;

export interface StreamSchedulers {
  teat: ManualScheduler;
  portal: ManualScheduler;
  dashboard: ManualScheduler;
  rait: ManualScheduler;
}

export interface StreamApp {
  app: INestApplication;
  port: number;
  schedulers: StreamSchedulers;
  writes: ServerWriteLog;
}

/**
 * App real (`app.listen(0)`) com a _claim_ do verificador local fixada em
 * `claimTenantId` (T-14: `DETRAN_LOCAL_TENANT_ID` lido no carregamento de
 * `detran-runtime.ts`, por isso num grafo de módulos novo) e um agendador
 * manual por token de porta (CTG-0001 §4.3, R-1). Os tokens vêm do mesmo
 * grafo do `AppModule` importado.
 */
export async function bootStreamApp(claimTenantId: string): Promise<StreamApp> {
  const previous = process.env.DETRAN_LOCAL_TENANT_ID;
  process.env.DETRAN_LOCAL_TENANT_ID = claimTenantId;
  vi.resetModules();
  try {
    const { Test } = await import('@nestjs/testing');
    const { AppModule } = await import('../../src/app.module.js');
    const { TEAT_STREAM_POLLER } =
      await import('../../src/teat-stream.service.js');
    const { PORTAL_STREAM_POLLER } =
      await import('../../src/portal-stream.service.js');
    const { DASHBOARD_STREAM_POLLER } =
      await import('../../src/dashboard-stream.service.js');
    const { RAIT_STREAM_POLLER } =
      await import('../../src/handwritten/rait/rait-stream.service.js');
    const schedulers: StreamSchedulers = {
      teat: new ManualScheduler(HEARTBEAT_MS),
      portal: new ManualScheduler(HEARTBEAT_MS),
      dashboard: new ManualScheduler(HEARTBEAT_MS),
      rait: new ManualScheduler(HEARTBEAT_MS),
    };
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule.forRoot()],
    })
      .overrideProvider(TEAT_STREAM_POLLER)
      .useValue(schedulers.teat)
      .overrideProvider(PORTAL_STREAM_POLLER)
      .useValue(schedulers.portal)
      .overrideProvider(DASHBOARD_STREAM_POLLER)
      .useValue(schedulers.dashboard)
      .overrideProvider(RAIT_STREAM_POLLER)
      .useValue(schedulers.rait)
      .compile();
    const app = moduleRef.createNestApplication({
      logger: false,
      abortOnError: false,
    });
    await app.init();
    await app.listen(0);
    const writes = new ServerWriteLog();
    writes.attach(app);
    const address = app.getHttpServer().address();
    return {
      app,
      port: typeof address === 'object' && address ? address.port : 0,
      schedulers,
      writes,
    };
  } finally {
    if (previous === undefined) delete process.env.DETRAN_LOCAL_TENANT_ID;
    else process.env.DETRAN_LOCAL_TENANT_ID = previous;
  }
}

export interface OutboxFixture {
  tenantId: string;
  topic: string;
  /** `type` do envelope; ausente = `topic`. */
  type?: string;
  domainEvent: string;
  aggregate: { kind: string; id: string; version: number };
  data: Record<string, unknown>;
  /** `created_at` no passado (relógio do banco), CTG-0001 §4.3. */
  ageHours?: number;
}

/**
 * Linha de `integration.outbox` gravada pelo owner (só preparação), no
 * envelope dos produtores (`tenantId` no topo, nunca em `data`).
 */
export async function insertOutbox(
  client: pg.Client,
  fixture: OutboxFixture,
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
     values ($1, $2, $3, $4, $5::jsonb, $6, 'pending',
             now() - make_interval(hours => $7::int), now() - make_interval(hours => $7::int))
     returning id::text as id`,
    [
      fixture.tenantId,
      fixture.topic,
      fixture.aggregate.kind,
      fixture.aggregate.id,
      JSON.stringify(envelope),
      `r22:${fixture.topic}:${randomUUID()}`,
      fixture.ageHours ?? 0,
    ],
  );
  return result.rows[0]!.id;
}

export async function deleteOutbox(
  client: pg.Client,
  ids: string[],
): Promise<void> {
  if (ids.length === 0) return;
  await asOwnerRole(client);
  await client.query(
    `delete from integration.outbox where id = any($1::uuid[])`,
    [ids],
  );
}
