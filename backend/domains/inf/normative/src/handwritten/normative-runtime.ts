// CTG-0003 §6 (M13, R-0008, TASK-0007) — dependências e utilidades dos
// comandos manuscritos do catálogo e do pacote normativo.
//
// As leituras que compõem o manifesto acontecem **antes** da transação de
// escrita: a porta de repositório abre a própria transação quando existe (é o
// que os harnesses fazem), e misturar as duas coisas partiria o ciclo de
// escrita no meio.
import { createHash } from 'node:crypto';

import { DetranError, withTenantContext } from '@detran/shared';
import type { RequestContext } from '@stynx-nyx/core';
import type { Database, Transaction } from '@stynx-nyx/data';

export type NormativeRow = Record<string, unknown>;

export interface NormativeRowStore {
  list?(): Promise<NormativeRow[]>;
  listWhere?(
    predicate: (row: NormativeRow) => boolean,
  ): Promise<NormativeRow[]>;
  find?(id: string): Promise<NormativeRow | undefined>;
  findOne?(id: string): Promise<NormativeRow | undefined>;
  create?(values: NormativeRow): Promise<NormativeRow>;
  update?(
    id: string,
    patch: NormativeRow,
    tx?: unknown,
  ): Promise<NormativeRow | undefined>;
}

/** Porta de selo do pacote (CTG-0002 §4.8; semântica em CTG-0003 §3). */
export interface PackageSignature {
  signature: string;
  signer: string;
  kind: 'local-unsigned' | 'sealed';
}

export interface PackageSigner {
  sign(manifestHash: string): Promise<PackageSignature>;
}

export interface NormativeEventEnvelope {
  id: string;
  type: string;
  domainEvent: string;
  version: number;
  occurredAt: string;
  tenantId: string;
  actor: { kind: 'user' | 'system' | 'timer'; id: string };
  correlationId: string;
  aggregate: { kind: string; id: string; version: number };
  data: Record<string, unknown>;
}

export interface NormativeOutbox {
  append(
    tx: Transaction,
    envelope: NormativeEventEnvelope,
  ): Promise<{ id: string }>;
}

export interface NormativeClock {
  now(): string;
  today?(): string;
}

export interface NormativeDeps {
  database: Pick<Database, 'tx'>;
  requestContext: Pick<RequestContext, 'hasActiveContext' | 'snapshot'>;
  repositories: Record<string, NormativeRowStore | undefined>;
  packageSigner?: PackageSigner;
  outbox?: NormativeOutbox;
  clock: NormativeClock;
}

export const NORMATIVE_TABLES = {
  catalogs: 'inf.normative_catalog',
  framings: 'inf.normative_framing',
  metrologicalTables: 'inf.normative_metrological_table',
  validationRules: 'inf.normative_validation_rule',
  documentTemplates: 'inf.normative_document_template',
  agencyParameters: 'inf.normative_agency_parameter',
  packages: 'inf.normative_mobile_package',
} as const;

export type NormativeTableName = keyof typeof NORMATIVE_TABLES;

interface SqlQueryable {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
}

function sqlOf(tx: unknown): SqlQueryable | undefined {
  const candidate = tx as Partial<SqlQueryable> | null | undefined;
  return candidate && typeof candidate.query === 'function'
    ? (candidate as SqlQueryable)
    : undefined;
}

function storeOf(
  deps: NormativeDeps,
  table: NormativeTableName,
): NormativeRowStore | undefined {
  return deps.repositories[table];
}

function assertColumns(values: NormativeRow): string[] {
  const columns = Object.keys(values);
  if (columns.some((column) => !/^[a-z_]+$/.test(column)))
    throw new Error('Coluna inválida em escrita de inf');
  return columns;
}

export function tenantScope(deps: NormativeDeps): {
  tenantId: string;
  actorId: string;
} {
  if (!deps.requestContext.hasActiveContext())
    throw new Error('Um comando normativo exige contexto de requisição');
  const snapshot = deps.requestContext.snapshot();
  const tenantId = snapshot.tenantId ?? '';
  const actorId = snapshot.actorId ?? '';
  if (!tenantId || !actorId)
    throw new Error('Um comando normativo exige tenantId e actorId');
  return { tenantId, actorId };
}

export function inTenantTransaction<T>(
  deps: NormativeDeps,
  work: (tx: Transaction) => Promise<T>,
): Promise<T> {
  return withTenantContext(deps.database, deps.requestContext, work);
}

/** Leitura fora da transação de escrita (ver o cabeçalho deste arquivo). */
export function readRow(
  deps: NormativeDeps,
  table: NormativeTableName,
  id: string,
): Promise<NormativeRow | undefined> {
  const store = storeOf(deps, table);
  if (typeof store?.find === 'function') return store.find(id);
  if (typeof store?.findOne === 'function') return store.findOne(id);
  return inTenantTransaction(deps, async (tx) => {
    const sql = sqlOf(tx);
    if (!sql) return undefined;
    const result = await sql.query(
      `select * from ${NORMATIVE_TABLES[table]} where id = $1`,
      [id],
    );
    return result.rows[0];
  });
}

export function readRows(
  deps: NormativeDeps,
  table: NormativeTableName,
  predicate: (row: NormativeRow) => boolean = () => true,
): Promise<NormativeRow[]> {
  const store = storeOf(deps, table);
  if (typeof store?.listWhere === 'function') return store.listWhere(predicate);
  if (typeof store?.list === 'function')
    return store.list().then((rows) => rows.filter(predicate));
  return inTenantTransaction(deps, async (tx) => {
    const sql = sqlOf(tx);
    if (!sql) return [];
    const result = await sql.query(
      `select * from ${NORMATIVE_TABLES[table]} order by id`,
    );
    return result.rows.filter(predicate);
  });
}

export async function insertRow(
  deps: NormativeDeps,
  tx: unknown,
  table: NormativeTableName,
  values: NormativeRow,
): Promise<NormativeRow> {
  const store = storeOf(deps, table);
  if (typeof store?.create === 'function') return store.create(values);
  const sql = sqlOf(tx);
  if (!sql)
    throw new Error(`Sem porta nem transação para escrever em ${table}`);
  const columns = assertColumns(values);
  const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
  const result = await sql.query(
    `insert into ${NORMATIVE_TABLES[table]} (${columns.join(', ')})
     values (${placeholders}) returning *`,
    columns.map((column) => normalize(values[column])),
  );
  return (result.rows[0] ?? values) as NormativeRow;
}

export async function patchRow(
  deps: NormativeDeps,
  tx: unknown,
  table: NormativeTableName,
  id: string,
  patch: NormativeRow,
): Promise<NormativeRow | undefined> {
  const store = storeOf(deps, table);
  if (typeof store?.update === 'function') return store.update(id, patch, tx);
  const sql = sqlOf(tx);
  if (!sql) throw new Error(`Sem porta nem transação para atualizar ${table}`);
  const columns = assertColumns(patch);
  const assignments = columns
    .map((column, index) => `${column} = $${index + 2}`)
    .join(', ');
  const result = await sql.query(
    `update ${NORMATIVE_TABLES[table]}
        set ${assignments}, updated_at = now()
      where id = $1 returning *`,
    [id, ...columns.map((column) => normalize(patch[column]))],
  );
  return result.rows[0];
}

function normalize(value: unknown): unknown {
  if (value === null || value === undefined) return null;
  if (typeof value === 'object' && !(value instanceof Date))
    return JSON.stringify(value);
  return value;
}

/**
 * §14.3 — órgão do principal, lido de `ops.ops_agent_profile` pelo `user_ref`
 * do contexto, sob RLS. Sem perfil, devolve `undefined`: o chamador decide, e
 * nunca se inventa um órgão (o id do tenant **não** é órgão).
 */
export async function agencyOfPrincipal(
  deps: NormativeDeps,
  actorId: string,
): Promise<string | undefined> {
  return inTenantTransaction(deps, async (tx) => {
    const sql = sqlOf(tx);
    if (!sql) return undefined;
    const result = await sql.query<{ traffic_agency_id: string }>(
      `select traffic_agency_id from ops.ops_agent_profile
        where user_ref = $1
        order by created_at
        limit 1`,
      [actorId],
    );
    const agencyId = result.rows[0]?.traffic_agency_id;
    return agencyId ? String(agencyId) : undefined;
  });
}

export function stringOf(value: unknown): string {
  return typeof value === 'string' ? value : String(value ?? '');
}

export function isoOf(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  return stringOf(value);
}

export function dateOf(value: unknown): string {
  return isoOf(value).slice(0, 10);
}

export function todayOf(clock: NormativeClock): string {
  return clock.today?.() ?? clock.now().slice(0, 10);
}

export function sha256Hex(payload: string): string {
  return createHash('sha256').update(payload, 'utf8').digest('hex');
}

export function validationFailed(
  fields: readonly { path: string; rule: string }[],
): DetranError {
  return new DetranError('TEAT.VALIDATION_FAILED', {
    status: 422,
    context: { fields: [...fields] },
    message: 'Requisição inválida para a regra do comando.',
  });
}

export function tenantMismatch(context: Record<string, unknown>): DetranError {
  return new DetranError('TEAT.TENANT_MISMATCH', {
    status: 404,
    context,
    message: 'Recurso inexistente no tenant do contexto.',
  });
}

export function packageStateInvalid(
  packageId: string,
  currentState: string,
  allowed: readonly string[],
): DetranError {
  return new DetranError('TEAT.PACKAGE_STATE_INVALID', {
    status: 409,
    context: { packageId, currentState, allowed: [...allowed] },
    message: 'Pacote normativo fora do estado admitido pelo comando.',
  });
}

export function catalogStateInvalid(
  catalogId: string,
  currentState: string,
  allowed: readonly string[],
): DetranError {
  return new DetranError('TEAT.CATALOG_STATE_INVALID', {
    status: 409,
    context: { catalogId, currentState, allowed: [...allowed] },
    message: 'Catálogo normativo fora do estado admitido pelo comando.',
  });
}

export function catalogNotActive(
  catalogId: string,
  currentState: string,
): DetranError {
  return new DetranError('TEAT.PACKAGE_CATALOG_NOT_ACTIVE', {
    status: 422,
    context: { catalogId, currentState },
    message: 'O catálogo do pacote não está ativo.',
  });
}

export function manifestMismatch(
  packageId: string,
  expected: string,
  received: string,
): DetranError {
  return new DetranError('TEAT.PACKAGE_MANIFEST_MISMATCH', {
    status: 422,
    context: { packageId, expected, received },
    message: 'Manifesto do pacote divergente do gravado.',
  });
}
