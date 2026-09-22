// Eventos publicados pelo ciclo (CTG-0002 §12; envelope de
// `rait-events-sse-contract.md` §1). Os tipos técnicos são montados por
// concatenação (`topic(...)`, padrão `backend/app/src/portal-stream.service.ts`)
// — nunca literal `dashboard.<x>.<y>` fora de `consumedEvents` (§1.3 regra 8,
// A14). `publish(tx, envelope)` insere na `integration.outbox` na mesma
// transação do efeito: `topic` = `type`, `aggregate_type` = `dashboard.<kind>`,
// `idempotency_key` = `<type>:<aggregate.id>:<aggregate.version>` (uma linha
// por transição; chave única `(tenant_id, idempotency_key)` do DDL 04),
// `status = 'pending'`. `data` só ids, tokens, datas, números e booleanos —
// `note`/`description` ficam na trilha, fora do evento.
import { randomUUID } from 'node:crypto';
import { query, type CycleSqlTransaction } from './tokens.js';

/** Tipo técnico por concatenação (`portal-stream.service.ts`). */
export function topic(...parts: readonly string[]): string {
  return parts.join('.');
}

/** Os seis tipos de §12. */
export const DASHBOARD_EVENT_TYPES = {
  alertChanged: topic('dashboard', 'alert', 'changed'),
  dutyChanged: topic('dashboard', 'duty', 'changed'),
  sourceFreshness: topic('dashboard', 'source', 'freshness'),
  exportRegistered: topic('dashboard', 'export', 'registered'),
  reportChanged: topic('dashboard', 'report', 'changed'),
  indicatorConfigChanged: topic('dashboard', 'indicator-config', 'changed'),
} as const;

export type DashboardEventType =
  (typeof DASHBOARD_EVENT_TYPES)[keyof typeof DASHBOARD_EVENT_TYPES];

/** `aggregate.kind` por tipo (§12) → `aggregate_type = dashboard.<kind>`. */
export type DashboardAggregateKind =
  | 'alert'
  | 'duty_cycle'
  | 'source'
  | 'export_log'
  | 'generated_report'
  | 'indicator_config';

export interface DashboardEventActor {
  kind: 'user' | 'system' | 'timer';
  id?: string;
  role?: string;
}

export type DashboardEventDataValue = string | number | boolean | null;

/** Envelope completo como a outbox o guarda (§12; `version` do evento = 1). */
export interface DashboardEventEnvelope {
  id: string;
  type: string;
  domainEvent: string;
  version: 1;
  occurredAt: string;
  tenantId: string;
  actor: DashboardEventActor;
  correlationId?: string;
  causationId?: string;
  aggregate: { kind: DashboardAggregateKind; id: string; version: number };
  data: Record<string, DashboardEventDataValue>;
}

export interface DashboardEnvelopeInput {
  type: string;
  domainEvent: string;
  tenantId: string;
  occurredAt: Date;
  actor: DashboardEventActor;
  aggregate: { kind: DashboardAggregateKind; id: string; version: number };
  data: Record<string, DashboardEventDataValue | undefined>;
  correlationId?: string;
  causationId?: string | null;
}

/** Monta o envelope (id `randomUUID`, `version = 1`) sem chaves `undefined`
 *  em `data`/`actor`/`correlationId`/`causationId`. */
export function envelopeOf(
  input: DashboardEnvelopeInput,
): DashboardEventEnvelope {
  const data: Record<string, DashboardEventDataValue> = {};
  for (const [key, value] of Object.entries(input.data)) {
    if (value !== undefined) data[key] = value;
  }
  const actor: DashboardEventActor = { kind: input.actor.kind };
  if (input.actor.id !== undefined) actor.id = input.actor.id;
  if (input.actor.role !== undefined) actor.role = input.actor.role;
  const envelope: DashboardEventEnvelope = {
    id: randomUUID(),
    type: input.type,
    domainEvent: input.domainEvent,
    version: 1,
    occurredAt: input.occurredAt.toISOString(),
    tenantId: input.tenantId,
    actor,
    aggregate: { ...input.aggregate },
    data,
  };
  if (input.correlationId !== undefined) {
    envelope.correlationId = input.correlationId;
  }
  if (input.causationId !== undefined && input.causationId !== null) {
    envelope.causationId = input.causationId;
  }
  return envelope;
}

export function idempotencyKeyOf(envelope: DashboardEventEnvelope): string {
  return `${envelope.type}:${envelope.aggregate.id}:${envelope.aggregate.version}`;
}

/** Inserção na outbox (§12) — a única escrita deste módulo. */
export async function publish(
  tx: CycleSqlTransaction,
  envelope: DashboardEventEnvelope,
): Promise<void> {
  await query(
    tx,
    `insert into integration.outbox
       (tenant_id, topic, aggregate_type, aggregate_id, payload, idempotency_key, status)
     values ($1, $2, $3, $4, $5, $6, 'pending')`,
    [
      envelope.tenantId,
      envelope.type,
      `dashboard.${envelope.aggregate.kind}`,
      envelope.aggregate.id,
      JSON.stringify(envelope),
      idempotencyKeyOf(envelope),
    ],
  );
}
