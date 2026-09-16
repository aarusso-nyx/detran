// CTG-0002 §4 e §5 (R-0008, TASK-0005) — utilidades compartilhadas pelos
// comandos manuscritos de `ops`: a superfície mínima de repositório por
// tabela, o acesso SQL dentro de uma transação já aberta, o relógio injetado
// (CODESTYLE: nunca `Date.now()` em domínio) e o sumidouro de eventos.
import {
  SqlTeatEventOutbox,
  type TeatEventEnvelope,
  type TeatEventOutbox,
} from '@detran/shared';
import type { Transaction } from '@stynx-nyx/data';

export type OpsRow = Record<string, unknown>;

/**
 * Superfície mínima de uma tabela de `ops` usada pelos comandos: é a de
 * `OpsTenantRepository` (SQL sob RLS, ADR-0002) e a mesma que os harnesses de
 * teste implementam. Nenhum comando escreve SQL de tabela fora de uma
 * transação de domínio; tudo o mais passa por aqui.
 */
export interface OpsRowStore {
  list(): Promise<OpsRow[]>;
  find(id: string): Promise<OpsRow | undefined>;
  create(values: OpsRow): Promise<OpsRow>;
  /**
   * `tx` é a transação em curso: quando vem, a escrita acontece **nela** e a
   * porta não abre transação própria — é assim que a escrituração do item
   * commita junto com o efeito de domínio (CTG-0002 §4.3 passo 4). Mesmo
   * padrão dos repositórios gerados (`repository.update(id, dto, transaction)`).
   */
  update(id: string, patch: OpsRow, tx?: unknown): Promise<OpsRow | undefined>;
}

export interface SqlQueryable {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
}

/**
 * `Transaction` real do kernel sempre expõe `.query`; dublês de unidade que só
 * provam a guarda, não. Quem chama decide o que fazer sem SQL — nunca lança.
 */
export function asQueryable(tx: unknown): SqlQueryable | undefined {
  const candidate = tx as Partial<SqlQueryable> | null | undefined;
  return candidate && typeof candidate.query === 'function'
    ? (candidate as SqlQueryable)
    : undefined;
}

/**
 * Escreve uma linha pela porta de repositório.
 *
 * Valores de coluna `jsonb` que são **listas** não têm forma única na porta: um
 * repositório SQL sobre `node-postgres` converte um array JS em literal de
 * array do Postgres (`{"x"}`), que `jsonb` recusa, enquanto um repositório
 * que entende JSON guarda a lista como está. A escrita tenta a forma
 * estruturada e, se a porta a recusar, repete uma vez com as listas
 * serializadas em texto JSON.
 */
export async function createOpsRow(
  store: OpsRowStore,
  values: OpsRow,
): Promise<OpsRow> {
  try {
    return await store.create(values);
  } catch (cause) {
    const serialized = Object.fromEntries(
      Object.entries(values).map(([key, value]) => [
        key,
        Array.isArray(value) ? JSON.stringify(value) : value,
      ]),
    );
    if (stableKeys(serialized) === stableKeys(values)) throw cause;
    return store.create(serialized);
  }
}

function stableKeys(values: OpsRow): string {
  return Object.entries(values)
    .map(([key, value]) => `${key}:${typeof value}:${Array.isArray(value)}`)
    .join('|');
}

export interface OpsClock {
  now(): string;
  today?(): string;
}

/** Relógio de produção; os comandos recebem o relógio, nunca o criam. */
export const systemOpsClock: OpsClock = {
  now: () => new Date().toISOString(),
  today: () => new Date().toISOString().slice(0, 10),
};

export function todayOf(clock: OpsClock): string {
  return clock.today?.() ?? clock.now().slice(0, 10);
}

/**
 * Sumidouro de eventos dos comandos de `ops`.
 *
 * A persistência canônica do envelope é `integration.outbox`, na transação do
 * comando (`SqlTeatEventOutbox`, CTG-0001 §2). Uma porta `TeatEventOutbox`
 * injetada é sempre notificada; quando ela **não** é a implementação SQL
 * canônica (decoradores, observadores e dublês), o envelope continua indo para
 * a outbox, de modo que o invariante "evento na mesma transação do efeito"
 * não depende de quem foi injetado. A idempotência é da própria outbox
 * (`unique (tenant_id, idempotency_key)`), então a dupla escrita nunca duplica
 * linha.
 */
export function teatEventSink(injected?: TeatEventOutbox): TeatEventOutbox {
  const sql = new SqlTeatEventOutbox();
  if (injected instanceof SqlTeatEventOutbox) return injected;
  return {
    async append(
      tx: Transaction,
      envelope: TeatEventEnvelope,
    ): Promise<{ id: string }> {
      const observed = await injected?.append(tx, envelope);
      const persisted = await sql.append(tx, envelope);
      return { id: persisted.id || (observed?.id ?? '') };
    },
  };
}

export interface TeatEnvelopeInput {
  type: string;
  domainEvent: string;
  tenantId: string;
  actorId: string;
  occurredAt: string;
  aggregate: { kind: string; id: string; version: number };
  data: Record<string, unknown>;
  correlationId?: string;
}

/** Envelope do `rait-events-sse-contract.md` §1; `id` é da outbox (§13.5). */
export function teatEnvelope(input: TeatEnvelopeInput): TeatEventEnvelope {
  return {
    id: '',
    type: input.type,
    domainEvent: input.domainEvent,
    version: 1,
    occurredAt: input.occurredAt,
    tenantId: input.tenantId,
    actor: { kind: 'user', id: input.actorId },
    correlationId: input.correlationId ?? input.aggregate.id,
    aggregate: input.aggregate,
    data: input.data,
  };
}
