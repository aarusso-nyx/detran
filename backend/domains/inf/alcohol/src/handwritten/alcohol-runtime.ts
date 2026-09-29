// CTG-0004 §3, §5, §12 (R-0008, TASK-0009) — dependências e utilidades comuns
// aos comandos manuscritos de alcoolemia. Mesmo padrão de
// `inf/measures/src/handwritten/measure-runtime.ts` (CTG-0004 §4): porta
// `AlcoholRowStore` mínima por tabela, com fallback a SQL parametrizado na
// transação do comando quando a porta não expõe a operação (produção,
// `repositories: {}`).
import { DetranError, withTenantContext } from '@detran/shared';
import type { TeatEventEnvelope, TeatEventOutbox } from '@detran/shared';
import type { RequestContext } from '@stynx-nyx/core';
import type { Database, Transaction } from '@stynx-nyx/data';

export type AlcoholRow = Record<string, unknown>;

export interface AlcoholRowStore {
  list?(): Promise<AlcoholRow[]>;
  find?(id: string): Promise<AlcoholRow | undefined>;
  findOne?(id: string): Promise<AlcoholRow | undefined>;
  findByProcedure?(procedureId: string): Promise<AlcoholRow[]>;
  create?(values: AlcoholRow): Promise<AlcoholRow>;
  update?(
    id: string,
    patch: AlcoholRow,
    tx?: unknown,
  ): Promise<AlcoholRow | undefined>;
}

export interface AlcoholDeps {
  database: Pick<Database, 'tx'>;
  requestContext: Pick<RequestContext, 'hasActiveContext' | 'snapshot'>;
  repositories: Record<string, AlcoholRowStore | undefined>;
  outbox?: TeatEventOutbox;
  clock: { now(): string };
}

export interface AlcoholScope {
  tenantId: string;
  actorId: string;
  occurredAt: string;
}

/** Tabelas tocadas pelos comandos desta tarefa (CTG-0004 §5). */
export const ALCOHOL_TABLES = {
  procedures: 'inf.alcohol_procedure',
  tests: 'inf.alcohol_test',
  refusals: 'inf.alcohol_refusal',
  signs: 'inf.alcohol_psychomotor_sign',
  forwardings: 'inf.alcohol_forwarding',
  breathalyzers: 'inf.alcohol_breathalyzer',
  metrologicalTables: 'inf.normative_metrological_table',
  // CTG-0004 §16.4 (adenda, iteração 3): a validação da tabela metrológica
  // agora também confere o `normative_catalog` dela — precisa do fallback
  // SQL desta tabela quando a porta não a expõe (mesmo padrão das demais).
  catalogs: 'inf.normative_catalog',
} as const;

export type AlcoholTableName = keyof typeof ALCOHOL_TABLES;

export function tenantScope(deps: AlcoholDeps): {
  tenantId: string;
  actorId: string;
} {
  if (!deps.requestContext.hasActiveContext())
    throw new Error('Um comando de alcoolemia exige contexto de requisição');
  const snapshot = deps.requestContext.snapshot();
  const tenantId = snapshot.tenantId ?? '';
  const actorId = snapshot.actorId ?? '';
  if (!tenantId || !actorId)
    throw new Error('Um comando de alcoolemia exige tenantId e actorId');
  return { tenantId, actorId };
}

export function scopeOf(deps: AlcoholDeps): AlcoholScope {
  const { tenantId, actorId } = tenantScope(deps);
  return { tenantId, actorId, occurredAt: deps.clock.now() };
}

export function inTenantTransaction<T>(
  deps: AlcoholDeps,
  work: (tx: Transaction) => Promise<T>,
): Promise<T> {
  return withTenantContext(deps.database, deps.requestContext, work);
}

function storeOf(
  deps: AlcoholDeps,
  table: AlcoholTableName,
): AlcoholRowStore | undefined {
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

function assertColumns(values: AlcoholRow): string[] {
  const columns = Object.keys(values);
  if (columns.some((column) => !/^[a-z_]+$/.test(column)))
    throw new Error('Coluna inválida em escrita de alcoolemia');
  return columns;
}

function normalize(value: unknown): unknown {
  if (value === null || value === undefined) return null;
  if (typeof value === 'object' && !(value instanceof Date))
    return JSON.stringify(value);
  return value;
}

export async function findRow(
  deps: AlcoholDeps,
  tx: unknown,
  table: AlcoholTableName,
  id: string,
): Promise<AlcoholRow | undefined> {
  const store = storeOf(deps, table);
  if (typeof store?.find === 'function') return store.find(id);
  if (typeof store?.findOne === 'function') return store.findOne(id);
  const sql = asQueryable(tx);
  if (!sql) return undefined;
  const result = await sql.query(
    `select * from ${ALCOHOL_TABLES[table]} where id = $1`,
    [id],
  );
  return result.rows[0];
}

/**
 * Leitura do procedimento pai com `for update`: a checagem de estado e a
 * escrita que dela depende ficam na mesma linha bloqueada (sem ela, dois
 * comandos concorrentes em READ COMMITTED passam na mesma checagem).
 */
export async function lockRow(
  deps: AlcoholDeps,
  tx: unknown,
  table: AlcoholTableName,
  id: string,
): Promise<AlcoholRow | undefined> {
  const store = storeOf(deps, table);
  if (typeof store?.find === 'function' || typeof store?.findOne === 'function')
    return findRow(deps, tx, table, id);
  const sql = asQueryable(tx);
  if (!sql) return undefined;
  const result = await sql.query(
    `select * from ${ALCOHOL_TABLES[table]} where id = $1 for update`,
    [id],
  );
  return result.rows[0];
}

export async function findRowsWhere(
  deps: AlcoholDeps,
  tx: unknown,
  table: AlcoholTableName,
  column: string,
  value: unknown,
): Promise<AlcoholRow[]> {
  if (!/^[a-z_]+$/.test(column)) throw new Error('Coluna inválida em filtro');
  const store = storeOf(deps, table);
  if (typeof store?.findByProcedure === 'function' && column === 'procedure_id')
    return store.findByProcedure(String(value));
  if (typeof store?.list === 'function')
    return (await store.list()).filter((row) => row[column] === value);
  const sql = asQueryable(tx);
  if (!sql) return [];
  const result = await sql.query(
    `select * from ${ALCOHOL_TABLES[table]} where ${column} = $1`,
    [value],
  );
  return result.rows;
}

/** Primeira linha `status='active'` da tabela — sem porta de leitura por
 * filtro estruturado, a busca cai numa listagem e filtra em memória
 * (mesma técnica de `findRowsWhere`), e em produção vira SQL direto. */
export async function findActiveRow(
  deps: AlcoholDeps,
  tx: unknown,
  table: AlcoholTableName,
): Promise<AlcoholRow | undefined> {
  const rows = await findRowsWhere(deps, tx, table, 'status', 'active');
  return rows[0];
}

export async function insertRow(
  deps: AlcoholDeps,
  tx: unknown,
  table: AlcoholTableName,
  values: AlcoholRow,
): Promise<AlcoholRow> {
  const store = storeOf(deps, table);
  if (typeof store?.create === 'function') return store.create(values);
  const sql = asQueryable(tx);
  if (!sql)
    throw new Error(`Sem porta nem transação para escrever em ${table}`);
  const columns = assertColumns(values);
  const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
  const result = await sql.query(
    `insert into ${ALCOHOL_TABLES[table]} (${columns.join(', ')})
     values (${placeholders}) returning *`,
    columns.map((column) => normalize(values[column])),
  );
  return (result.rows[0] ?? values) as AlcoholRow;
}

export async function patchRow(
  deps: AlcoholDeps,
  tx: unknown,
  table: AlcoholTableName,
  id: string,
  patch: AlcoholRow,
): Promise<AlcoholRow | undefined> {
  const store = storeOf(deps, table);
  if (typeof store?.update === 'function') return store.update(id, patch, tx);
  const sql = asQueryable(tx);
  if (!sql) throw new Error(`Sem porta nem transação para atualizar ${table}`);
  const columns = assertColumns(patch);
  const assignments = columns
    .map((column, index) => `${column} = $${index + 2}`)
    .join(', ');
  const result = await sql.query(
    `update ${ALCOHOL_TABLES[table]}
        set ${assignments}, updated_at = now()
      where id = $1 returning *`,
    [id, ...columns.map((column) => normalize(patch[column]))],
  );
  return result.rows[0];
}

export function stringOf(value: unknown): string {
  return typeof value === 'string' ? value : String(value ?? '');
}

export function numberOf(value: unknown): number | null {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim() !== '') return Number(value);
  return null;
}

export function tenantMismatch(context: Record<string, unknown>): DetranError {
  return new DetranError('TEAT.TENANT_MISMATCH', {
    status: 404,
    context,
    message: 'Recurso inexistente no tenant do contexto.',
  });
}

/** 409 `TEAT.ALCOHOL_STATE_INVALID` (CTG-0004 §3). */
export function alcoholStateInvalid(
  procedureId: string,
  currentState: string,
  allowed: readonly string[],
  command: string,
): DetranError {
  return new DetranError('TEAT.ALCOHOL_STATE_INVALID', {
    status: 409,
    context: { procedureId, currentState, allowed: [...allowed], command },
    message: 'Procedimento de alcoolemia fora do estado exigido pelo comando.',
  });
}

export function assertAlcoholAllowed(
  procedure: AlcoholRow,
  procedureId: string,
  allowed: readonly string[],
  command: string,
): string {
  const currentState = stringOf(procedure.status);
  if (!allowed.includes(currentState))
    throw alcoholStateInvalid(procedureId, currentState, allowed, command);
  return currentState;
}

export async function appendEvent(
  deps: AlcoholDeps,
  tx: Transaction,
  envelope: TeatEventEnvelope,
): Promise<void> {
  await deps.outbox?.append(tx, envelope);
}

/** Réplica mínima de `teatEnvelope` (mesmo motivo de `measure-runtime.ts`:
 * `inf/alcohol` não depende de `ops-core`). */
export function alcoholEnvelope(input: {
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
