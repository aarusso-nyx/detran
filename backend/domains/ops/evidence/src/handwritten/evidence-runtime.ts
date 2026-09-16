// CTG-0003 §4 (M11, R-0008, TASK-0007) — dependências e utilidades comuns aos
// comandos manuscritos de evidência e custódia.
//
// Os comandos nunca escrevem SQL de tabela fora da transação do comando: a
// porta `EvidenceRowStore` é a superfície mínima por tabela (a mesma de
// `OpsTenantRepository` e a que os harnesses de teste implementam, CTG-0002
// §4 / `@detran/ops-core`). Quando a porta não expõe a operação — é o caso do
// wiring de produção, que injeta só leitura — a escrita acontece por SQL
// parametrizado **na transação em curso**, que é o que o invariante "mesma
// transação" da §4.2 exige.
import { randomUUID } from 'node:crypto';

import {
  asQueryable,
  type OpsClock,
  type SqlQueryable,
} from '@detran/ops-core';
import type { AppliedEntityPort, EvidenceStoragePort } from '@detran/ops-core';
import {
  DetranError,
  withTenantContext,
  type TeatEventOutbox,
} from '@detran/shared';
import type { RequestContext } from '@stynx-nyx/core';
import type { Database, Transaction } from '@stynx-nyx/data';

export type EvidenceRow = Record<string, unknown>;

/**
 * Vocabulário de modelagem de `evidence_custody_event.event_type` (§11.8 —
 * onze tokens, sem check na coluna) e rol fechado do art. 13 para
 * `evidence_access_request.requester_role` (RN-TEAT-142, check
 * `ck_ops_evidence_access_requester_role`). Moram aqui, e não no comando que
 * os consome, porque `handwritten/events.ts` também precisa deles para os
 * esquemas zod — e o comando importa `events.ts`.
 */
export const CUSTODY_EVENT_TYPES = [
  'uploaded',
  'validated',
  'rejected',
  'linked',
  'packaged',
  'access_approved',
  'access_denied',
  'access_delivered',
  'purged_unverified',
  'quarantined',
  'restored',
] as const;

export type CustodyEventType = (typeof CUSTODY_EVENT_TYPES)[number];

export function isCustodyEventType(value: string): value is CustodyEventType {
  return (CUSTODY_EVENT_TYPES as readonly string[]).includes(value);
}

export const EVIDENCE_ACCESS_REQUESTER_ROLES = [
  'magistrado',
  'ministerio-publico',
  'defensoria-publica',
  'autoridade-policial',
  'autoridade-administrativa',
] as const;

export type EvidenceAccessRequesterRole =
  (typeof EVIDENCE_ACCESS_REQUESTER_ROLES)[number];

export function isEvidenceAccessRequesterRole(
  value: string,
): value is EvidenceAccessRequesterRole {
  return (EVIDENCE_ACCESS_REQUESTER_ROLES as readonly string[]).includes(value);
}

export function requesterNotInRol(requesterRole: string): DetranError {
  return new DetranError('TEAT.EVIDENCE_ACCESS_REQUESTER_NOT_IN_ROL', {
    status: 422,
    context: { requesterRole, allowed: [...EVIDENCE_ACCESS_REQUESTER_ROLES] },
    message: 'Requerente fora do rol do art. 13 da Portaria.',
  });
}

/** Superfície mínima de uma tabela de `ops` usada pelos comandos. */
export interface EvidenceRowStore {
  list?(): Promise<EvidenceRow[]>;
  find?(id: string): Promise<EvidenceRow | undefined>;
  findOne?(id: string): Promise<EvidenceRow | undefined>;
  create?(values: EvidenceRow): Promise<EvidenceRow>;
  update?(
    id: string,
    patch: EvidenceRow,
    tx?: unknown,
  ): Promise<EvidenceRow | undefined>;
}

export interface EvidenceDeps {
  database: Pick<Database, 'tx'>;
  requestContext: Pick<RequestContext, 'hasActiveContext' | 'snapshot'>;
  repositories: Record<string, EvidenceRowStore | undefined>;
  appliedEntityPorts?: readonly AppliedEntityPort[];
  evidenceStorage?: EvidenceStoragePort;
  outbox?: TeatEventOutbox;
  clock: OpsClock;
}

export interface EvidenceScope {
  tenantId: string;
  actorId: string;
  occurredAt: string;
}

/** Tabelas tocadas pelos comandos desta tarefa (CTG-0003 §4). */
export const EVIDENCE_TABLES = {
  evidence: 'ops.evidence_evidence',
  storageIntents: 'ops.storage_intent',
  evidenceLinks: 'ops.evidence_link',
  custodyEvents: 'ops.evidence_custody_event',
  probativePackages: 'ops.evidence_probative_package',
  probativePackageItems: 'ops.evidence_probative_package_item',
  accessRequests: 'ops.evidence_access_request',
} as const;

export type EvidenceTableName = keyof typeof EVIDENCE_TABLES;

export function tenantScope(deps: EvidenceDeps): {
  tenantId: string;
  actorId: string;
} {
  if (!deps.requestContext.hasActiveContext())
    throw new Error('Um comando de evidência exige contexto de requisição');
  const snapshot = deps.requestContext.snapshot();
  const tenantId = snapshot.tenantId ?? '';
  const actorId = snapshot.actorId ?? '';
  if (!tenantId || !actorId)
    throw new Error('Um comando de evidência exige tenantId e actorId');
  return { tenantId, actorId };
}

export function scopeOf(deps: EvidenceDeps): EvidenceScope {
  const { tenantId, actorId } = tenantScope(deps);
  return { tenantId, actorId, occurredAt: deps.clock.now() };
}

/** `withTenantContext` (role `app`, RLS na volta) — nunca conexão de owner. */
export function inTenantTransaction<T>(
  deps: EvidenceDeps,
  work: (tx: Transaction) => Promise<T>,
): Promise<T> {
  return withTenantContext(deps.database, deps.requestContext, work);
}

function storeOf(
  deps: EvidenceDeps,
  table: EvidenceTableName,
): EvidenceRowStore | undefined {
  return deps.repositories[table];
}

function sqlOf(tx: unknown): SqlQueryable | undefined {
  return asQueryable(tx as Transaction);
}

function assertColumns(values: EvidenceRow): string[] {
  const columns = Object.keys(values);
  if (columns.some((column) => !/^[a-z_]+$/.test(column)))
    throw new Error('Coluna inválida em escrita de ops');
  return columns;
}

export async function findRow(
  deps: EvidenceDeps,
  tx: unknown,
  table: EvidenceTableName,
  id: string,
): Promise<EvidenceRow | undefined> {
  const store = storeOf(deps, table);
  if (typeof store?.find === 'function') return store.find(id);
  if (typeof store?.findOne === 'function') return store.findOne(id);
  const sql = sqlOf(tx);
  if (!sql) return undefined;
  const result = await sql.query(
    `select * from ${EVIDENCE_TABLES[table]} where id = $1`,
    [id],
  );
  return result.rows[0];
}

export async function listRows(
  deps: EvidenceDeps,
  tx: unknown,
  table: EvidenceTableName,
): Promise<EvidenceRow[]> {
  const store = storeOf(deps, table);
  if (typeof store?.list === 'function') return store.list();
  const sql = sqlOf(tx);
  if (!sql) return [];
  const result = await sql.query(
    `select * from ${EVIDENCE_TABLES[table]} order by created_at desc`,
  );
  return result.rows;
}

/**
 * Leitura por coluna: a porta de repositório só sabe `list`/`find`, então o
 * filtro acontece em memória quando ela existe e vira `where` parametrizado
 * quando a escrita é da transação (wiring de produção).
 */
export async function findRowsWhere(
  deps: EvidenceDeps,
  tx: unknown,
  table: EvidenceTableName,
  column: string,
  value: unknown,
): Promise<EvidenceRow[]> {
  if (!/^[a-z_]+$/.test(column)) throw new Error('Coluna inválida em filtro');
  const store = storeOf(deps, table);
  if (typeof store?.list === 'function')
    return (await store.list()).filter((row) => row[column] === value);
  const sql = sqlOf(tx);
  if (!sql) return [];
  const result = await sql.query(
    `select * from ${EVIDENCE_TABLES[table]} where ${column} = $1`,
    [value],
  );
  return result.rows;
}

export async function insertRow(
  deps: EvidenceDeps,
  tx: unknown,
  table: EvidenceTableName,
  values: EvidenceRow,
): Promise<EvidenceRow> {
  const store = storeOf(deps, table);
  if (typeof store?.create === 'function') return store.create(values);
  const sql = sqlOf(tx);
  if (!sql)
    throw new Error(`Sem porta nem transação para escrever em ${table}`);
  const columns = assertColumns(values);
  const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
  const result = await sql.query(
    `insert into ${EVIDENCE_TABLES[table]} (${columns.join(', ')})
     values (${placeholders}) returning *`,
    columns.map((column) => normalize(values[column])),
  );
  return (result.rows[0] ?? values) as EvidenceRow;
}

export async function patchRow(
  deps: EvidenceDeps,
  tx: unknown,
  table: EvidenceTableName,
  id: string,
  patch: EvidenceRow,
): Promise<EvidenceRow | undefined> {
  const store = storeOf(deps, table);
  if (typeof store?.update === 'function') return store.update(id, patch, tx);
  const sql = sqlOf(tx);
  if (!sql) throw new Error(`Sem porta nem transação para atualizar ${table}`);
  const columns = assertColumns(patch);
  const assignments = columns
    .map((column, index) => `${column} = $${index + 2}`)
    .join(', ');
  const result = await sql.query(
    `update ${EVIDENCE_TABLES[table]}
        set ${assignments}, updated_at = now()
      where id = $1 returning *`,
    [id, ...columns.map((column) => normalize(patch[column]))],
  );
  return result.rows[0];
}

/** `jsonb` recebe JSON textual; os demais valores vão como estão. */
function normalize(value: unknown): unknown {
  if (value === null || value === undefined) return null;
  if (typeof value === 'object' && !(value instanceof Date))
    return JSON.stringify(value);
  return value;
}

export function newId(): string {
  return randomUUID();
}

export function stringOf(value: unknown): string {
  return typeof value === 'string' ? value : String(value ?? '');
}

export function isoOf(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  return stringOf(value);
}

export function objectKeyOf(tenantId: string, evidenceId: string): string {
  return `evidence/${tenantId}/${evidenceId}`;
}

/** CTG-0003 §13 item 5 (OD-T29): estado inválido de evidência é 422. */
export function stateTransitionFailed(): DetranError {
  return validationFailed([{ path: 'status', rule: 'transition' }]);
}

/**
 * §14.1: forma de DTO sai como **400**; regra de domínio violada (guarda de
 * estado, OD-T29) continua **422**.
 */
export function validationFailed(
  fields: readonly { path: string; rule: string }[],
  status: 400 | 422 = 422,
): DetranError {
  return new DetranError('TEAT.VALIDATION_FAILED', {
    status,
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

export function quarantined(evidenceId: string): DetranError {
  return new DetranError('TEAT.EVIDENCE_QUARANTINED', {
    status: 409,
    context: { evidenceId },
    message: 'Evidência em quarentena.',
  });
}

/**
 * A porta responde "a entidade já foi aplicada no servidor?" (CTG-0002 §4.8).
 * Sem porta para o tipo, a resposta é "não aplicada": nunca se presume o
 * contrário.
 */
export async function assertEntityApplied(
  deps: EvidenceDeps,
  tx: Transaction,
  entityType: string,
  entityId: string,
): Promise<void> {
  const port = deps.appliedEntityPorts?.find(
    (candidate) => candidate.entityType === entityType,
  );
  const applied = port ? await port.isApplied(entityId, tx) : false;
  if (applied) return;
  throw new DetranError('TEAT.EVIDENCE_ENTITY_NOT_APPLIED', {
    status: 409,
    context: { entityType, entityId },
    message: 'Entidade ainda não aplicada no servidor.',
  });
}

/**
 * Ordem do próximo fato de custódia do agregado — a versão do envelope
 * (`outboxIdempotencyKey`, CTG-0001 §2). Contada antes da escrita do evento.
 */
export async function nextCustodyVersion(
  deps: EvidenceDeps,
  tx: unknown,
  evidenceId: string,
): Promise<number> {
  const existing = await findRowsWhere(
    deps,
    tx,
    'custodyEvents',
    'evidence_id',
    evidenceId,
  );
  return existing.length + 1;
}

export async function appendEvent(
  deps: EvidenceDeps,
  tx: Transaction,
  envelope: Parameters<TeatEventOutbox['append']>[1],
): Promise<void> {
  await deps.outbox?.append(tx, envelope);
}
