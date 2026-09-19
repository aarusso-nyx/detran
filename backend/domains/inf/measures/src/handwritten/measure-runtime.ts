// CTG-0004 §4, §12 (R-0008, TASK-0009) — dependências e utilidades comuns aos
// comandos manuscritos de medidas administrativas.
//
// Os comandos nunca escrevem SQL de tabela fora da transação do comando: a
// porta `MeasureRowStore` é a superfície mínima por tabela (a mesma forma de
// `OpsRowStore`/`EvidenceRowStore`, CTG-0002 §4 / CTG-0003 §4, e a que os
// harnesses de teste de `tests/integration/harness.ts` implementam). No
// caminho de produção (`measure-lifecycle.provider.ts`) a porta é injetada
// vazia (`repositories: {}`), e toda leitura/escrita acontece por SQL
// parametrizado **na transação do comando** (`withTenantContext`, role
// `app`, RLS na volta) — mesmo padrão de `ops/evidence` (CTG-0003 §4,
// "repositories fica vazio de propósito").
import { DetranError, withTenantContext } from '@detran/shared';
import type { TeatEventEnvelope, TeatEventOutbox } from '@detran/shared';
import type { RequestContext } from '@stynx-nyx/core';
import type { Database, Transaction } from '@stynx-nyx/data';

export type MeasureRow = Record<string, unknown>;

export interface MeasureRowStore {
  list?(): Promise<MeasureRow[]>;
  find?(id: string): Promise<MeasureRow | undefined>;
  findOne?(id: string): Promise<MeasureRow | undefined>;
  create?(values: MeasureRow): Promise<MeasureRow>;
  update?(
    id: string,
    patch: MeasureRow,
    tx?: unknown,
  ): Promise<MeasureRow | undefined>;
}

/**
 * Porta de prazos de medida (OD-T38, CTG-0004 §14 item 3): assinatura de três
 * argumentos usada pelos comandos — `deadlines.ts` no mesmo diretório expõe a
 * função pura de cinco argumentos e a fábrica que fecha sobre `Calendar` e
 * `MEASURE_TIMER_CATALOG` para produzir esta porta.
 */
export interface MeasureDeadlinesPort {
  computeMeasureDue(
    code: 'T-REG30' | 'T-REG15' | 'T-DEPOSITO6M',
    startOn: string,
    tenantId: string,
  ): Promise<{ rawDueOn: string; dueOn: string }>;
}

/** `parameter-catalogue.md` §TEAT: `teat.monitored_custody` (DT-015). */
export interface MeasureFeatureFlags {
  isEnabled(flag: string): boolean;
}

/**
 * Token de injeção da porta acima (CTG-0004 §15.2, adenda pós-TASK-0009
 * iteração 1): o domínio nunca lê `process.env` diretamente — o app provê o
 * valor real a partir de `detranFeatureFlagSet()`
 * (`backend/app/src/teat-measures.providers.ts`).
 */
export const MEASURE_FEATURE_FLAGS = Symbol('MEASURE_FEATURE_FLAGS');

export interface MeasureDeps {
  database: Pick<Database, 'tx'>;
  requestContext: Pick<RequestContext, 'hasActiveContext' | 'snapshot'>;
  repositories: Record<string, MeasureRowStore | undefined>;
  outbox?: TeatEventOutbox;
  clock: { now(): string };
  deadlines: MeasureDeadlinesPort;
  featureFlags: MeasureFeatureFlags;
}

export interface MeasureScope {
  tenantId: string;
  actorId: string;
  occurredAt: string;
}

/** Tabelas tocadas pelos comandos desta tarefa (CTG-0004 §4). */
export const MEASURE_TABLES = {
  measures: 'inf.administrative_measure',
  measureTypes: 'inf.measure_type',
  terms: 'inf.administrative_term',
  retentions: 'inf.measure_retention',
  removals: 'inf.measure_removal',
  inventories: 'inf.vehicle_inventory',
  history: 'inf.measure_status_history',
  towProviders: 'inf.tow_provider',
  yards: 'inf.yard',
} as const;

export type MeasureTableName = keyof typeof MEASURE_TABLES;

export function tenantScope(deps: MeasureDeps): {
  tenantId: string;
  actorId: string;
} {
  if (!deps.requestContext.hasActiveContext())
    throw new Error('Um comando de medida exige contexto de requisição');
  const snapshot = deps.requestContext.snapshot();
  const tenantId = snapshot.tenantId ?? '';
  const actorId = snapshot.actorId ?? '';
  if (!tenantId || !actorId)
    throw new Error('Um comando de medida exige tenantId e actorId');
  return { tenantId, actorId };
}

export function scopeOf(deps: MeasureDeps): MeasureScope {
  const { tenantId, actorId } = tenantScope(deps);
  return { tenantId, actorId, occurredAt: deps.clock.now() };
}

/** `withTenantContext` (role `app`, RLS na volta) — nunca conexão de owner. */
export function inTenantTransaction<T>(
  deps: MeasureDeps,
  work: (tx: Transaction) => Promise<T>,
): Promise<T> {
  return withTenantContext(deps.database, deps.requestContext, work);
}

function storeOf(
  deps: MeasureDeps,
  table: MeasureTableName,
): MeasureRowStore | undefined {
  return deps.repositories[table];
}

interface SqlQueryable {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
}

function asQueryable(tx: unknown): SqlQueryable | undefined {
  const candidate = tx as Partial<SqlQueryable> | null | undefined;
  return candidate && typeof candidate.query === 'function'
    ? (candidate as SqlQueryable)
    : undefined;
}

function assertColumns(values: MeasureRow): string[] {
  const columns = Object.keys(values);
  if (columns.some((column) => !/^[a-z_]+$/.test(column)))
    throw new Error('Coluna inválida em escrita de medida');
  return columns;
}

/** `jsonb` recebe JSON textual; os demais valores vão como estão. */
function normalize(value: unknown): unknown {
  if (value === null || value === undefined) return null;
  if (typeof value === 'object' && !(value instanceof Date))
    return JSON.stringify(value);
  return value;
}

export async function findRow(
  deps: MeasureDeps,
  tx: unknown,
  table: MeasureTableName,
  id: string,
): Promise<MeasureRow | undefined> {
  const store = storeOf(deps, table);
  if (typeof store?.find === 'function') return store.find(id);
  if (typeof store?.findOne === 'function') return store.findOne(id);
  const sql = asQueryable(tx);
  if (!sql) return undefined;
  const result = await sql.query(
    `select * from ${MEASURE_TABLES[table]} where id = $1`,
    [id],
  );
  return result.rows[0];
}

export async function findRowsWhere(
  deps: MeasureDeps,
  tx: unknown,
  table: MeasureTableName,
  column: string,
  value: unknown,
): Promise<MeasureRow[]> {
  if (!/^[a-z_]+$/.test(column)) throw new Error('Coluna inválida em filtro');
  const store = storeOf(deps, table);
  if (typeof store?.list === 'function')
    return (await store.list()).filter((row) => row[column] === value);
  const sql = asQueryable(tx);
  if (!sql) return [];
  const result = await sql.query(
    `select * from ${MEASURE_TABLES[table]} where ${column} = $1`,
    [value],
  );
  return result.rows;
}

export async function insertRow(
  deps: MeasureDeps,
  tx: unknown,
  table: MeasureTableName,
  values: MeasureRow,
): Promise<MeasureRow> {
  const store = storeOf(deps, table);
  if (typeof store?.create === 'function') return store.create(values);
  const sql = asQueryable(tx);
  if (!sql)
    throw new Error(`Sem porta nem transação para escrever em ${table}`);
  const columns = assertColumns(values);
  const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
  const result = await sql.query(
    `insert into ${MEASURE_TABLES[table]} (${columns.join(', ')})
     values (${placeholders}) returning *`,
    columns.map((column) => normalize(values[column])),
  );
  return (result.rows[0] ?? values) as MeasureRow;
}

export async function patchRow(
  deps: MeasureDeps,
  tx: unknown,
  table: MeasureTableName,
  id: string,
  patch: MeasureRow,
): Promise<MeasureRow | undefined> {
  const store = storeOf(deps, table);
  if (typeof store?.update === 'function') return store.update(id, patch, tx);
  const sql = asQueryable(tx);
  if (!sql) throw new Error(`Sem porta nem transação para atualizar ${table}`);
  const columns = assertColumns(patch);
  const assignments = columns
    .map((column, index) => `${column} = $${index + 2}`)
    .join(', ');
  const result = await sql.query(
    `update ${MEASURE_TABLES[table]}
        set ${assignments}, updated_at = now()
      where id = $1 returning *`,
    [id, ...columns.map((column) => normalize(patch[column]))],
  );
  return result.rows[0];
}

export function stringOf(value: unknown): string {
  return typeof value === 'string' ? value : String(value ?? '');
}

export function tenantMismatch(context: Record<string, unknown>): DetranError {
  return new DetranError('TEAT.TENANT_MISMATCH', {
    status: 404,
    context,
    message: 'Recurso inexistente no tenant do contexto.',
  });
}

/** 409 `TEAT.MEASURE_STATE_INVALID` (CTG-0004 §1). */
export function measureStateInvalid(
  measureId: string,
  currentState: string,
  allowed: readonly string[],
  command: string,
): DetranError {
  return new DetranError('TEAT.MEASURE_STATE_INVALID', {
    status: 409,
    context: { measureId, currentState, allowed: [...allowed], command },
    message: 'Medida administrativa fora do estado exigido pelo comando.',
  });
}

export function assertMeasureAllowed(
  measure: MeasureRow,
  measureId: string,
  allowed: readonly string[],
  command: string,
): string {
  const currentState = stringOf(measure.current_status);
  if (!allowed.includes(currentState))
    throw measureStateInvalid(measureId, currentState, allowed, command);
  return currentState;
}

/**
 * Registra uma linha de `measure_status_history` (CTG-0004 §4). O relógio é
 * o mesmo do escopo (`scope.occurredAt`), nunca `Date.now()`.
 */
export function recordHistory(
  deps: MeasureDeps,
  tx: unknown,
  measureId: string,
  status: string,
  reason: string,
  actorId?: string,
): Promise<MeasureRow> {
  return insertRow(deps, tx, 'history', {
    measure_id: measureId,
    status,
    user_ref: actorId ?? null,
    reason,
  });
}

export async function appendEvent(
  deps: MeasureDeps,
  tx: Transaction,
  envelope: TeatEventEnvelope,
): Promise<void> {
  await deps.outbox?.append(tx, envelope);
}

/**
 * Réplica mínima de `teatEnvelope` (CTG-0001 §2 / `@detran/ops-core`):
 * `inf/measures` não depende de `ops-core` (CTG-0004 §12 não lista essa
 * dependência), então o construtor do envelope mora aqui — mesma forma,
 * `id` sempre vazio (a outbox o preenche, CTG-0001 §13 item 5).
 */
export function measureEnvelope(input: {
  type: string;
  domainEvent: string;
  tenantId: string;
  actorId: string;
  occurredAt: string;
  aggregate: { kind: string; id: string; version: number };
  data: Record<string, unknown>;
}): TeatEventEnvelope {
  return {
    id: '',
    type: input.type,
    domainEvent: input.domainEvent,
    version: 1,
    occurredAt: input.occurredAt,
    tenantId: input.tenantId,
    actor: { kind: 'user', id: input.actorId },
    correlationId: input.aggregate.id,
    aggregate: input.aggregate,
    data: input.data,
  };
}
