// Harness das provas de concorrência "checa e depois grava" (hotfix fora da
// R-0022, Adenda B9). Banco clone descartável (`CREATE DATABASE … TEMPLATE`
// do banco de teste, removido ao fim), duas sessões `role_app_backend` e
// intercalação determinística com commit real: T1 conclui o comando e fica
// aberta; T2 começa; o observador espera em `pg_stat_activity` até T2
// bloquear num lock ou terminar; só então T1 commita.
import { randomUUID } from 'node:crypto';
import pg from 'pg';

const SAFE_NAME = /^[a-z0-9_]+$/;

const sleep = (ms: number) =>
  new Promise<void>((resolvePromise) => setTimeout(resolvePromise, ms));

function sourceUrl(): URL {
  const raw = process.env.DETRAN_TEST_DATABASE_URL;
  if (!raw) throw new Error('DETRAN_TEST_DATABASE_URL é obrigatório');
  return new URL(raw);
}

function withDatabase(url: URL, name: string): string {
  const next = new URL(url.toString());
  next.pathname = `/${name}`;
  next.search = '';
  return next.toString();
}

export interface RaceDatabase {
  readonly url: string;
  readonly name: string;
  drop(): Promise<void>;
}

/** Clona o banco de teste; o clone é o único banco que a prova escreve. */
export async function cloneDatabase(): Promise<RaceDatabase> {
  const source = sourceUrl();
  const template = decodeURIComponent(source.pathname.slice(1));
  const name = `${template}_race_${randomUUID().replace(/-/g, '').slice(0, 10)}`;
  if (!SAFE_NAME.test(template) || !SAFE_NAME.test(name))
    throw new Error(`Nome de banco inesperado: ${template}`);
  const adminUrl = withDatabase(source, 'postgres');
  const admin = new pg.Client({ connectionString: adminUrl });
  await admin.connect();
  try {
    for (let attempt = 0; ; attempt += 1) {
      try {
        await admin.query(`create database "${name}" template "${template}"`);
        break;
      } catch (error) {
        // 55006: o template ainda tem sessões (outra suíte encerrando).
        if ((error as { code?: string }).code !== '55006' || attempt >= 40)
          throw error;
        await sleep(250);
      }
    }
  } finally {
    await admin.end();
  }
  return {
    url: withDatabase(source, name),
    name,
    async drop() {
      const cleaner = new pg.Client({ connectionString: adminUrl });
      await cleaner.connect();
      try {
        await cleaner.query(`drop database if exists "${name}" with (force)`);
      } finally {
        await cleaner.end();
      }
    },
  };
}

export interface Deferred {
  promise: Promise<void>;
  resolve(): void;
}

export function deferred(): Deferred {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

export interface RaceQueryable {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[]; rowCount?: number | null }>;
}

/** Uma conexão do app: toda transação faz `set local role role_app_backend`
 * e fixa `app.tenant_id`/`app.actor_id` (o que `Database.tx` com
 * `role: 'app'` faz em produção). */
export class RaceSession {
  private constructor(
    readonly client: pg.Client,
    readonly pid: number,
  ) {}

  static async open(url: string, name: string): Promise<RaceSession> {
    const client = new pg.Client({
      connectionString: url,
      application_name: name,
    });
    await client.connect();
    const pid = await client.query<{ pid: number }>(
      'select pg_backend_pid() as pid',
    );
    return new RaceSession(client, pid.rows[0]!.pid);
  }

  get tx(): RaceQueryable {
    return {
      query: (sql, values) =>
        this.client.query(sql, values as unknown[]) as never,
    };
  }

  /** Porta `Database` (`tx(work)`); `beforeCommit` segura a transação aberta
   * depois do comando concluído. */
  database(
    tenantId: string,
    actorId: string,
    beforeCommit?: () => Promise<void>,
  ) {
    return {
      tx: async <T>(work: (tx: RaceQueryable) => Promise<T>): Promise<T> => {
        await this.client.query('begin');
        try {
          await this.client.query('set local role role_app_backend');
          await this.client.query(
            `select set_config('app.tenant_id', $1, true),
                    set_config('app.actor_id', $2, true)`,
            [tenantId, actorId],
          );
          const result = await work(this.tx);
          if (beforeCommit) await beforeCommit();
          await this.client.query('commit');
          return result;
        } catch (error) {
          await this.client.query('rollback');
          throw error;
        }
      },
    };
  }

  end(): Promise<void> {
    return this.client.end();
  }
}

export type Settled<T> =
  { status: 'fulfilled'; value: T } | { status: 'rejected'; reason: unknown };

export interface RaceOutcome<A, B> {
  first: Settled<A>;
  second: Settled<B>;
  /** Como T2 estava quando T1 commitou: bloqueada num lock ou já concluída. */
  secondWhileFirstOpen: 'blocked' | 'finished';
}

/**
 * T1 roda até o fim e fica aberta (`holdFirst`); T2 começa; espera-se em
 * `pg_stat_activity` até T2 bloquear (`wait_event_type = 'Lock'`) ou
 * terminar; então T1 commita e colhem-se os dois resultados.
 */
export async function interleave<A, B>(input: {
  observer: pg.Client;
  second: RaceSession;
  runFirst: (holdFirst: () => Promise<void>) => Promise<A>;
  runSecond: () => Promise<B>;
}): Promise<RaceOutcome<A, B>> {
  const firstReady = deferred();
  const release = deferred();
  const first = settle(
    input.runFirst(async () => {
      firstReady.resolve();
      await release.promise;
    }),
  );
  await Promise.race([
    firstReady.promise,
    first.then((outcome) => {
      throw new Error(
        `T1 terminou sem chegar ao commit: ${JSON.stringify(summarize(outcome))}`,
      );
    }),
  ]);
  let secondDone = false;
  const second = settle(input.runSecond()).then((outcome) => {
    secondDone = true;
    return outcome;
  });
  let state: 'blocked' | 'finished' | undefined;
  for (let probe = 0; probe < 400 && !state; probe += 1) {
    if (secondDone) {
      state = 'finished';
      break;
    }
    const activity = await input.observer.query<{
      wait_event_type: string | null;
    }>('select wait_event_type from pg_stat_activity where pid = $1', [
      input.second.pid,
    ]);
    if (activity.rows[0]?.wait_event_type === 'Lock') state = 'blocked';
    else await sleep(25);
  }
  if (!state) {
    release.resolve();
    throw new Error('T2 nem bloqueou nem terminou em 10 s');
  }
  release.resolve();
  return {
    first: await first,
    second: await second,
    secondWhileFirstOpen: state,
  };
}

function settle<T>(promise: Promise<T>): Promise<Settled<T>> {
  return promise.then(
    (value) => ({ status: 'fulfilled', value }) as const,
    (reason: unknown) => ({ status: 'rejected', reason }) as const,
  );
}

export function summarize(outcome: Settled<unknown>): Record<string, unknown> {
  if (outcome.status === 'fulfilled') return { status: 'fulfilled' };
  const error = outcome.reason as {
    code?: unknown;
    status?: unknown;
    message?: unknown;
    getStatus?: () => unknown;
  };
  return {
    status: 'rejected',
    code: error.code,
    httpStatus:
      error.status ??
      (typeof error.getStatus === 'function' ? error.getStatus() : undefined),
    message: error.message,
  };
}
