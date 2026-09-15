// CTG-0001 §2 (M16) — event envelope and outbox port shared by TEAT commands.
// Envelope shape mirrors `docs/framework/arch/rait-events-sse-contract.md`
// §1 (`type` technical + `domainEvent` canonical token from the route
// contract §8). The AIT aggregate is the first to publish, so the port lives
// in `@detran/shared` rather than in a single `inf/*` package.
import type { Transaction } from '@stynx-nyx/data';

export interface TeatEventActor {
  kind: 'user' | 'system' | 'timer';
  id: string;
  role?: string;
}

export interface TeatEventAggregateRef {
  kind: string;
  id: string;
  version: number;
}

export interface TeatEventEnvelope {
  /** ULID promised by the SSE contract; `integration.outbox.id` is a uuid in
   * practice (CTG-0001 §11.1). Callers never generate this themselves
   * (CTG-0001 §13 item 5) — leave it `''`; `TeatEventOutbox.append` assigns
   * the real id of the inserted row and returns it. */
  id: string;
  /** Technical SSE type (route contract §7), e.g. `ait.changed`. */
  type: string;
  /** Canonical domain token (route contract §8), e.g. `AIT_FINALIZADO`. */
  domainEvent: string;
  version: number;
  occurredAt: string;
  tenantId: string;
  actor: TeatEventActor;
  correlationId: string;
  causationId?: string;
  aggregate: TeatEventAggregateRef;
  /** Only ids, tokens and dates (CTG-0001 §1 regra 4). */
  data: Record<string, unknown>;
}

export interface TeatEventOutbox {
  /** Appends `envelope` to `integration.outbox` inside the caller's own
   * transaction (CTG-0001 §2); idempotent per `(tenant_id, idempotency_key)`.
   * Returns the real id of the row (CTG-0001 §13 item 5) — the caller never
   * generates one. */
  append(tx: Transaction, envelope: TeatEventEnvelope): Promise<{ id: string }>;
}

export const TEAT_EVENT_OUTBOX = Symbol('TEAT_EVENT_OUTBOX');

/** `idempotency_key` for an envelope, per CTG-0001 §2. */
export function outboxIdempotencyKey(envelope: TeatEventEnvelope): string {
  return `${envelope.type}:${envelope.aggregate.id}:${envelope.aggregate.version}`;
}
