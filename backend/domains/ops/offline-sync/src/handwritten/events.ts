// CTG-0002 §7 (M16) — envelopes publicados por `@detran/ops-offline-sync`.
// Mesmo formato de `rait-events-sse-contract.md` §1 e do molde de
// `inf/ait/src/handwritten/events.ts` (`additionalProperties: false` ⇒
// `strictObject`). O mapa exportado é chaveado por `domainEvent`, e não por
// `type`, porque `sync.batch.received` e `numbering.reservation.changed`
// cobrem mais de um token de domínio ao longo do grupo.
//
// Os `type` técnicos da família `sync.*` são montados por concatenação, nunca
// como literal único: `tools/parameters/verify.mjs --check-usage` trata todo
// literal `sync.<x>.<y>` como chave de `ops.parameter` não registrada — e
// estes são `type` de envelope SSE, não parâmetro (mesmo tratamento já dado em
// `inf/ait/src/handwritten/events.ts`).
import { teatEnvelope } from '@detran/ops-core';
import type { TeatEventEnvelope } from '@detran/shared';
import { z } from 'zod';
import type { ZodType } from 'zod';

export const SYNC_BATCH_RECEIVED_TYPE = 'sync' + '.batch.received';
export const SYNC_CONFLICT_OPENED_TYPE = 'sync' + '.conflict.opened';
export const SYNC_CONFLICT_RESOLVED_TYPE = 'sync' + '.conflict.resolved';
export const NUMBERING_RESERVATION_CHANGED_TYPE =
  'numbering.reservation.changed';
export const AIT_CHANGED_TYPE = 'ait.changed';
export const AIT_CONCURRENCY_SUSPECTED_TYPE = 'ait.concurrency-suspected';

const actor = z.strictObject({
  kind: z.enum(['user', 'system', 'timer']),
  id: z.string(),
  role: z.string().optional(),
});

function envelope(
  type: string,
  domainEvent: string,
  aggregateKind: string,
  data: ZodType,
) {
  return z.strictObject({
    id: z.string(),
    type: z.literal(type),
    domainEvent: z.literal(domainEvent),
    version: z.int().min(1),
    occurredAt: z.iso.datetime(),
    tenantId: z.string(),
    actor,
    correlationId: z.string(),
    causationId: z.string().optional(),
    aggregate: z.strictObject({
      kind: z.literal(aggregateKind),
      id: z.string(),
      version: z.int().min(1),
    }),
    data,
  });
}

const syncItemRecebido = envelope(
  SYNC_BATCH_RECEIVED_TYPE,
  'SYNC_ITEM_RECEBIDO',
  'sync-queue-item',
  z.strictObject({
    batchId: z.string().nullable(),
    deviceBatchId: z.string(),
    batchSequence: z.number().nullable(),
    itemId: z.string(),
    entityType: z.string(),
    localEntityId: z.string(),
    receiptStatus: z.enum(['received', 'applied', 'conflict', 'rejected']),
    errorCode: z.string().nullable(),
    serverEntityId: z.string().nullable(),
  }),
);

const syncConflitoAberto = envelope(
  SYNC_CONFLICT_OPENED_TYPE,
  'SYNC_CONFLITO_ABERTO',
  'sync-conflict',
  z.strictObject({
    conflictId: z.string(),
    conflictType: z.enum(['integrity', 'domain', 'concurrency']),
    syncQueueItemId: z.string(),
    reasonCode: z.string(),
    openedAt: z.iso.datetime(),
  }),
);

const syncConflitoResolvido = envelope(
  SYNC_CONFLICT_RESOLVED_TYPE,
  'SYNC_CONFLITO_RESOLVIDO',
  'sync-conflict',
  z.strictObject({
    conflictId: z.string(),
    conflictType: z.enum(['integrity', 'domain', 'concurrency']),
    resolutionAction: z.string(),
    resolvedAt: z.iso.datetime(),
  }),
);

const numeracaoReservada = envelope(
  NUMBERING_RESERVATION_CHANGED_TYPE,
  'NUMERACAO_RESERVADA',
  'numbering-reservation',
  z.strictObject({
    reservationId: z.string(),
    rangeId: z.string(),
    agentId: z.string().nullable(),
    deviceId: z.string().nullable(),
    shiftId: z.string().nullable(),
    startNumber: z.number().nullable(),
    endNumber: z.number().nullable(),
    validUntil: z.string().nullable(),
    status: z.string(),
    action: z.string(),
  }),
);

const aitRecebido = envelope(
  AIT_CHANGED_TYPE,
  'AIT_RECEBIDO',
  'ait',
  z.strictObject({
    aitId: z.string(),
    fromState: z.string(),
    toState: z.literal('RECEBIDO'),
    receiptProtocol: z.string(),
    receivedAt: z.iso.datetime(),
  }),
);

const aitSuspeitoConcorrencia = envelope(
  AIT_CONCURRENCY_SUSPECTED_TYPE,
  'AIT_SUSPEITO_CONCORRENCIA',
  'ait',
  z.strictObject({
    aitId: z.string(),
    agentId: z.string(),
    deviceId: z.string(),
    otherDeviceId: z.string().nullable(),
    windowStart: z.iso.datetime(),
    windowEnd: z.iso.datetime(),
    conflictId: z.string().nullable(),
  }),
);

/** Os seis `domainEvent` publicados pelo grupo (CTG-0002 §7). */
export interface OfflineSyncEventSchemas extends Record<string, ZodType> {
  SYNC_ITEM_RECEBIDO: ZodType;
  SYNC_CONFLITO_ABERTO: ZodType;
  SYNC_CONFLITO_RESOLVIDO: ZodType;
  NUMERACAO_RESERVADA: ZodType;
  AIT_RECEBIDO: ZodType;
  AIT_SUSPEITO_CONCORRENCIA: ZodType;
}

export const OFFLINE_SYNC_EVENT_SCHEMAS: OfflineSyncEventSchemas = {
  SYNC_ITEM_RECEBIDO: syncItemRecebido,
  SYNC_CONFLITO_ABERTO: syncConflitoAberto,
  SYNC_CONFLITO_RESOLVIDO: syncConflitoResolvido,
  NUMERACAO_RESERVADA: numeracaoReservada,
  AIT_RECEBIDO: aitRecebido,
  AIT_SUSPEITO_CONCORRENCIA: aitSuspeitoConcorrencia,
};

/** Falha cedo quando um envelope foge da forma declarada da §7. */
export function assertEventShape(envelope: TeatEventEnvelope): void {
  const schema = OFFLINE_SYNC_EVENT_SCHEMAS[envelope.domainEvent];
  if (!schema)
    throw new Error(
      `Unknown offline-sync domain event ${envelope.domainEvent}`,
    );
  schema.parse(envelope);
}

export interface EventScope {
  tenantId: string;
  actorId: string;
  occurredAt: string;
}

export function syncItemReceivedEvent(
  scope: EventScope,
  data: {
    batchId: string | null;
    deviceBatchId: string;
    batchSequence: number | null;
    itemId: string;
    entityType: string;
    localEntityId: string;
    receiptStatus: string;
    errorCode: string | null;
    serverEntityId: string | null;
  },
): TeatEventEnvelope {
  return teatEnvelope({
    type: SYNC_BATCH_RECEIVED_TYPE,
    domainEvent: 'SYNC_ITEM_RECEBIDO',
    tenantId: scope.tenantId,
    actorId: scope.actorId,
    occurredAt: scope.occurredAt,
    aggregate: { kind: 'sync-queue-item', id: data.itemId, version: 1 },
    data: { ...data },
  });
}

export function syncConflictOpenedEvent(
  scope: EventScope,
  data: {
    conflictId: string;
    conflictType: string;
    syncQueueItemId: string;
    reasonCode: string;
    openedAt: string;
  },
): TeatEventEnvelope {
  return teatEnvelope({
    type: SYNC_CONFLICT_OPENED_TYPE,
    domainEvent: 'SYNC_CONFLITO_ABERTO',
    tenantId: scope.tenantId,
    actorId: scope.actorId,
    occurredAt: scope.occurredAt,
    aggregate: { kind: 'sync-conflict', id: data.conflictId, version: 1 },
    data: { ...data },
  });
}

export function syncConflictResolvedEvent(
  scope: EventScope,
  data: {
    conflictId: string;
    conflictType: string;
    resolutionAction: string;
    resolvedAt: string;
  },
): TeatEventEnvelope {
  return teatEnvelope({
    type: SYNC_CONFLICT_RESOLVED_TYPE,
    domainEvent: 'SYNC_CONFLITO_RESOLVIDO',
    tenantId: scope.tenantId,
    actorId: scope.actorId,
    occurredAt: scope.occurredAt,
    aggregate: { kind: 'sync-conflict', id: data.conflictId, version: 1 },
    data: { ...data },
  });
}

export function numberingReservationChangedEvent(
  scope: EventScope,
  data: {
    reservationId: string;
    rangeId: string;
    agentId: string | null;
    deviceId: string | null;
    shiftId: string | null;
    startNumber: number | null;
    endNumber: number | null;
    validUntil: string | null;
    status: string;
    action: string;
  },
  /**
   * Versão do agregado depois do ato: a reserva nasce em 1 e é liquidada em 2.
   * A chave de idempotência da outbox é `type:aggregateId:version`, então o
   * envelope da liquidação precisa de versão própria para não ser descartado
   * como repetição do envelope da reserva.
   */
  aggregateVersion = 1,
): TeatEventEnvelope {
  return teatEnvelope({
    type: NUMBERING_RESERVATION_CHANGED_TYPE,
    domainEvent: 'NUMERACAO_RESERVADA',
    tenantId: scope.tenantId,
    actorId: scope.actorId,
    occurredAt: scope.occurredAt,
    aggregate: {
      kind: 'numbering-reservation',
      id: data.reservationId,
      version: aggregateVersion,
    },
    data: { ...data },
  });
}

export function aitReceivedEvent(
  scope: EventScope,
  data: {
    aitId: string;
    fromState: string;
    receiptProtocol: string;
    receivedAt: string;
  },
): TeatEventEnvelope {
  return teatEnvelope({
    type: AIT_CHANGED_TYPE,
    domainEvent: 'AIT_RECEBIDO',
    tenantId: scope.tenantId,
    actorId: scope.actorId,
    occurredAt: scope.occurredAt,
    aggregate: { kind: 'ait', id: data.aitId, version: 1 },
    data: { ...data, toState: 'RECEBIDO' },
  });
}

export function aitConcurrencySuspectedEvent(
  scope: EventScope,
  data: {
    aitId: string;
    agentId: string;
    deviceId: string;
    otherDeviceId: string | null;
    windowStart: string;
    windowEnd: string;
    conflictId: string | null;
  },
): TeatEventEnvelope {
  return teatEnvelope({
    type: AIT_CONCURRENCY_SUSPECTED_TYPE,
    domainEvent: 'AIT_SUSPEITO_CONCORRENCIA',
    tenantId: scope.tenantId,
    actorId: scope.actorId,
    occurredAt: scope.occurredAt,
    aggregate: { kind: 'ait', id: data.aitId, version: 1 },
    data: { ...data },
  });
}
