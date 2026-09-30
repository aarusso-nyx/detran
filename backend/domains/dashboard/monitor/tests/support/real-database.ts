// `Database` REAL da plataforma (`@stynx-nyx/data`, a mesma classe que o app
// injeta) montada à mão, sem módulo Nest: `RequestContext`/`SystemContext`/
// `ClsService` verdadeiros, um `pg.Pool` sob `role_app_backend` (mesma
// conexão que `STYNX_APP_DATABASE_URL`) e a exata semântica de `tx`
// aninhada (savepoints `stynx_sp_N` na conexão ambiente). Serve às provas de
// hotfix B9 "chamada que abre `Database.tx` dentro de `Database.tx` externa".
import { AsyncLocalStorage } from 'node:async_hooks';
import { createRequire } from 'node:module';
import pg from 'pg';

import {
  RequestContext,
  RequestContextMutator,
  SystemContext,
} from '@stynx-nyx/core';
import { Database } from '@stynx-nyx/data';

const requireFromCore = createRequire(
  createRequire(import.meta.url).resolve('@stynx-nyx/core'),
);
const { ClsService } = requireFromCore('nestjs-cls') as {
  ClsService: new (als: AsyncLocalStorage<unknown>) => unknown;
};

export interface RealDatabaseHandle {
  readonly database: Database;
  readonly requestContext: RequestContext;
  readonly mutator: RequestContextMutator;
  /** `withRequestContext` da plataforma. */
  run<T>(
    scope: { tenantId: string; actorId: string },
    work: () => Promise<T>,
  ): Promise<T>;
  end(): Promise<void>;
}

function appConnectionString(): string {
  if (process.env.STYNX_APP_DATABASE_URL)
    return process.env.STYNX_APP_DATABASE_URL;
  const raw = process.env.DETRAN_TEST_DATABASE_URL ?? process.env.DATABASE_URL;
  if (!raw)
    throw new Error('DETRAN_TEST_DATABASE_URL ou STYNX_APP_DATABASE_URL');
  const url = new URL(raw);
  url.searchParams.set('options', '-c role=role_app_backend');
  return url.toString();
}

export function createRealDatabase(): RealDatabaseHandle {
  const cls = new ClsService(new AsyncLocalStorage());
  const requestContext = new RequestContext(cls as never);
  const mutator = new RequestContextMutator(cls as never);
  const systemContext = new SystemContext(requestContext, mutator, undefined);
  const pool = new pg.Pool({
    connectionString: appConnectionString(),
    max: 4,
  });
  pool.on('error', () => undefined);
  const pools = { get: () => pool };
  const database = new Database(
    requestContext,
    systemContext,
    pools as never,
    cls as never,
    {} as never,
    undefined as never,
    mutator,
  );
  return {
    database,
    requestContext,
    mutator,
    run: (scope, work) => database.withRequestContext(scope, work),
    end: () => pool.end(),
  };
}
