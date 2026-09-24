// CTG-0002 §5 (R-0008, TASK-0005) — dependências comuns dos comandos
// manuscritos de `@detran/ops-field` e utilidades de data/tenant.
import {
  asQueryable,
  systemOpsClock,
  type OpsClock,
  type OpsRow,
  type OpsRowStore,
  type SqlQueryable,
} from '@detran/ops-core';
import { DetranError, type TeatEventOutbox } from '@detran/shared';
import type { Transaction } from '@stynx-nyx/data';

export interface DatabasePort {
  tx<T>(work: (transaction: unknown) => Promise<T>): Promise<T>;
}

export interface RequestContextPort {
  hasActiveContext(): boolean;
  snapshot(): { tenantId?: string; actorId?: string };
}

export interface ParameterPort {
  get(
    key: string,
    options?: Record<string, unknown>,
  ): Promise<{
    key?: unknown;
    tenant_id?: unknown;
    traffic_agency_id?: unknown;
    scope?: unknown;
    surface?: unknown;
    value_json?: unknown;
    value_type?: unknown;
    status?: unknown;
    source_pending?: boolean;
  }>;
}

export interface FieldDeps {
  database: DatabasePort;
  requestContext: RequestContextPort;
  repositories: Partial<Record<string, OpsRowStore>>;
  parameters?: ParameterPort;
  outbox?: TeatEventOutbox;
  clock?: OpsClock;
}

export function clockOf(deps: FieldDeps): OpsClock {
  return deps.clock ?? systemOpsClock;
}

export function todayOf(deps: FieldDeps): string {
  const clock = clockOf(deps);
  return clock.today?.() ?? clock.now().slice(0, 10);
}

export function storeOf(deps: FieldDeps, name: string): OpsRowStore {
  const store = deps.repositories[name];
  if (!store) throw new Error(`Unbound ops row store: ${name}`);
  return store;
}

export function tenantScope(deps: FieldDeps): {
  tenantId: string;
  actorId: string;
} {
  if (!deps.requestContext.hasActiveContext())
    throw new Error('Active tenant context is required');
  const snapshot = deps.requestContext.snapshot();
  if (!snapshot.tenantId) throw new Error('Active tenant context is required');
  return { tenantId: snapshot.tenantId, actorId: snapshot.actorId ?? '' };
}

export function ownedBy(rows: OpsRow[], tenantId: string): OpsRow[] {
  return rows.filter(
    (row) => !row.tenant_id || String(row.tenant_id) === tenantId,
  );
}

/** `date` do Postgres chega como `Date`; a comparação de vigência é textual. */
export function dateOf(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return localDate(value);
  return String(value).slice(0, 10);
}

function localDate(value: Date): string {
  const offset = value.getTimezoneOffset() * 60_000;
  return new Date(value.getTime() - offset).toISOString().slice(0, 10);
}

export function isoOf(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

export function tenantMismatch(): DetranError {
  return new DetranError('TEAT.TENANT_MISMATCH', {
    status: 404,
    message: 'Recurso não pertence ao tenant da requisição.',
  });
}

export function validationFailed(
  fields: ReadonlyArray<Record<string, unknown>>,
): DetranError {
  return new DetranError('TEAT.VALIDATION_FAILED', {
    status: 422,
    context: { fields },
    message: 'Dados inválidos para o comando.',
  });
}

export interface SqlScope {
  query: SqlQueryable['query'];
  transaction: Transaction;
}

export function inTransaction<T>(
  deps: FieldDeps,
  work: (scope: SqlScope) => Promise<T>,
): Promise<T> {
  return deps.database.tx(async (tx) => {
    const queryable = asQueryable(tx);
    if (!queryable) throw new Error('Field commands require a SQL transaction');
    return work({
      query: queryable.query.bind(queryable),
      transaction: tx as Transaction,
    });
  });
}
