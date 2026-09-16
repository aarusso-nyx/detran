// CTG-0003 §5 (M12, R-0008, TASK-0007) — dependências e utilidades do comando
// de consulta externa. Nenhum cliente HTTP mora aqui: toda consulta sai por
// `SNAPSHOT_QUERY_PORTS` (`packages/senatran-adapter`, ADR-0003).
import { createHash } from 'node:crypto';

import {
  asQueryable,
  type OpsClock,
  type SqlQueryable,
} from '@detran/ops-core';
import { DetranError, withTenantContext } from '@detran/shared';
import type { RequestContext } from '@stynx-nyx/core';
import type { Database, Transaction } from '@stynx-nyx/data';

export type SnapshotRow = Record<string, unknown>;

export interface SnapshotRowStore {
  list?(): Promise<SnapshotRow[]>;
  find?(id: string): Promise<SnapshotRow | undefined>;
  findOne?(id: string): Promise<SnapshotRow | undefined>;
  create?(values: SnapshotRow): Promise<SnapshotRow>;
  update?(
    id: string,
    patch: SnapshotRow,
    tx?: unknown,
  ): Promise<SnapshotRow | undefined>;
}

/**
 * Fatia de leitura de `WsdenatranReadPort`/`RenachPort` e a forma de
 * `VehicleRecord`/`DriverRecord` (`packages/senatran-adapter/src/domain.ts`),
 * declaradas estruturalmente: `createSenatranAdapter().ports` as satisfaz sem
 * que `@detran/ops-snapshots` passe a depender do pacote do adapter — a
 * fronteira do ADR-0003 continua sendo o adapter, e nenhum cliente HTTP entra
 * neste módulo.
 */
export interface VehicleRecord {
  plate?: string;
  chassis?: string;
  renavam?: string;
  jurisdictionState?: string;
  makeModelCode?: string;
  makeModelDescription?: string;
  ownerDocument?: string;
  ownerName?: string;
}

export interface DriverRecord {
  cpf?: string;
  name?: string;
  birthDate?: string;
  licenseNumber?: string;
  currentCategory?: string;
  licenseState?: string;
  licenseStatus?: string;
  licenseExpiresAt?: string;
  motherName?: string;
}

export interface SnapshotQueryPorts {
  wsdenatranRead: {
    findVehicleByPlate(plate: string): Promise<VehicleRecord | undefined>;
  };
  renach: {
    findDriverByCpf(cpf: string): Promise<DriverRecord | undefined>;
    findDriverByLicense(
      licenseNumber: string,
    ): Promise<DriverRecord | undefined>;
  };
}

export interface SnapshotsDeps {
  database: Pick<Database, 'tx'>;
  requestContext: Pick<RequestContext, 'hasActiveContext' | 'snapshot'>;
  repositories: Record<string, SnapshotRowStore | undefined>;
  ports: SnapshotQueryPorts;
  clock: OpsClock;
}

export const SNAPSHOT_TABLES = {
  vehicles: 'ops.snapshots_vehicle',
  persons: 'ops.snapshots_person',
  personDocuments: 'ops.snapshots_person_document',
  vehicleSnapshots: 'ops.snapshots_vehicle_snapshot',
  externalQueries: 'ops.snapshots_external_query',
} as const;

export type SnapshotTableName = keyof typeof SNAPSHOT_TABLES;

export function tenantScope(deps: SnapshotsDeps): {
  tenantId: string;
  actorId: string;
} {
  if (!deps.requestContext.hasActiveContext())
    throw new Error('Um comando de snapshots exige contexto de requisição');
  const snapshot = deps.requestContext.snapshot();
  const tenantId = snapshot.tenantId ?? '';
  const actorId = snapshot.actorId ?? '';
  if (!tenantId || !actorId)
    throw new Error('Um comando de snapshots exige tenantId e actorId');
  return { tenantId, actorId };
}

export function inTenantTransaction<T>(
  deps: SnapshotsDeps,
  work: (tx: Transaction) => Promise<T>,
): Promise<T> {
  return withTenantContext(deps.database, deps.requestContext, work);
}

function storeOf(
  deps: SnapshotsDeps,
  table: SnapshotTableName,
): SnapshotRowStore | undefined {
  return deps.repositories[table];
}

function sqlOf(tx: unknown): SqlQueryable | undefined {
  return asQueryable(tx as Transaction);
}

function assertColumns(values: SnapshotRow): string[] {
  const columns = Object.keys(values);
  if (columns.some((column) => !/^[a-z_]+$/.test(column)))
    throw new Error('Coluna inválida em escrita de ops');
  return columns;
}

export async function listRows(
  deps: SnapshotsDeps,
  tx: unknown,
  table: SnapshotTableName,
): Promise<SnapshotRow[]> {
  const store = storeOf(deps, table);
  if (typeof store?.list === 'function') return store.list();
  const sql = sqlOf(tx);
  if (!sql) return [];
  const result = await sql.query(
    `select * from ${SNAPSHOT_TABLES[table]} order by created_at desc`,
  );
  return result.rows;
}

export async function findRowsWhere(
  deps: SnapshotsDeps,
  tx: unknown,
  table: SnapshotTableName,
  column: string,
  value: unknown,
): Promise<SnapshotRow[]> {
  if (!/^[a-z_]+$/.test(column)) throw new Error('Coluna inválida em filtro');
  const store = storeOf(deps, table);
  if (typeof store?.list === 'function')
    return (await store.list()).filter((row) => row[column] === value);
  const sql = sqlOf(tx);
  if (!sql) return [];
  const result = await sql.query(
    `select * from ${SNAPSHOT_TABLES[table]} where ${column} = $1`,
    [value],
  );
  return result.rows;
}

export async function insertRow(
  deps: SnapshotsDeps,
  tx: unknown,
  table: SnapshotTableName,
  values: SnapshotRow,
): Promise<SnapshotRow> {
  const store = storeOf(deps, table);
  if (typeof store?.create === 'function') return store.create(values);
  const sql = sqlOf(tx);
  if (!sql)
    throw new Error(`Sem porta nem transação para escrever em ${table}`);
  const columns = assertColumns(values);
  const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
  const result = await sql.query(
    `insert into ${SNAPSHOT_TABLES[table]} (${columns.join(', ')})
     values (${placeholders}) returning *`,
    columns.map((column) => normalize(values[column])),
  );
  return (result.rows[0] ?? values) as SnapshotRow;
}

export async function patchRow(
  deps: SnapshotsDeps,
  tx: unknown,
  table: SnapshotTableName,
  id: string,
  patch: SnapshotRow,
): Promise<SnapshotRow | undefined> {
  const store = storeOf(deps, table);
  if (typeof store?.update === 'function') return store.update(id, patch, tx);
  const sql = sqlOf(tx);
  if (!sql) throw new Error(`Sem porta nem transação para atualizar ${table}`);
  const columns = assertColumns(patch);
  const assignments = columns
    .map((column, index) => `${column} = $${index + 2}`)
    .join(', ');
  const result = await sql.query(
    `update ${SNAPSHOT_TABLES[table]}
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
 * §14.3 — órgão do principal, lido de `ops.ops_agent_profile` pelo
 * `user_ref` do contexto, sob RLS (a linha só é visível dentro do tenant).
 * Sem perfil, devolve `undefined`: o chamador decide, e nunca se inventa um
 * órgão (o id do tenant **não** é órgão).
 */
export async function agencyOfPrincipal(
  deps: SnapshotsDeps,
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

export function stableJson(value: unknown): string {
  return JSON.stringify(sortDeep(value));
}

function sortDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((entry) => sortDeep(entry));
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    const source = value as Record<string, unknown>;
    return Object.fromEntries(
      Object.keys(source)
        .sort()
        .map((key) => [key, sortDeep(source[key])]),
    );
  }
  return value;
}

/** `parameters_hash = 'sha256:' + sha256hex(<JSON canônico dos parâmetros>)`. */
export function parametersHashOf(parameters: unknown): string {
  return `sha256:${createHash('sha256')
    .update(stableJson(parameters), 'utf8')
    .digest('hex')}`;
}

/**
 * Forma dos `parameters` sai como **400** (§5.1); regra de domínio sem fonte
 * — o órgão da §14.3 — sai como **422**.
 */
export function validationFailed(
  fields: readonly { path: string; rule: string }[],
  status: 400 | 422 = 400,
): DetranError {
  return new DetranError('TEAT.VALIDATION_FAILED', {
    status,
    context: { fields: [...fields] },
    message: 'Requisição inválida para a regra do comando.',
  });
}
