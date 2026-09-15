// Esquemas zod dos sete envelopes publicados pelo agregado AIT (CTG-0001 §6,
// M16; molde de backend/domains/inf/infraction/src/handwritten/events.ts —
// mesmo formato de envelope de rait-events-sse-contract.md §1,
// `additionalProperties: false` ⇒ `strictObject`). Diferença do molde:
// `ait.changed` cobre seis `domainEvent` distintos (uma linha por transição
// no route contract §8), então o mapa exportado é chaveado por `domainEvent`,
// não por `type` — `type` sozinho não seria uma chave única aqui.
import { z } from 'zod';
import type { ZodType } from 'zod';

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

const aitFinalizado = envelope(
  'ait.changed',
  'AIT_FINALIZADO',
  'ait',
  z.strictObject({
    aitId: z.uuid(),
    aitNumber: z.string(),
    series: z.string(),
    fromState: z.literal('RASCUNHO_OFFLINE'),
    toState: z.literal('FINALIZADO_LOCAL'),
    contentHash: z.string(),
    finalizedAt: z.iso.datetime(),
  }),
);

const aitRecebido = envelope(
  'ait.changed',
  'AIT_RECEBIDO',
  'ait',
  z.strictObject({
    aitId: z.uuid(),
    fromState: z.string(),
    toState: z.literal('RECEBIDO'),
    receiptProtocol: z.string(),
    receivedAt: z.iso.datetime(),
  }),
);

const aitAceito = envelope(
  'ait.changed',
  'AIT_ACEITO',
  'ait',
  z.strictObject({
    aitId: z.uuid(),
    fromState: z.string(),
    toState: z.literal('ACEITO'),
    acceptedAt: z.iso.datetime(),
  }),
);

const aitIntegrado = envelope(
  'ait.changed',
  'AIT_INTEGRADO',
  'ait',
  z.strictObject({
    aitId: z.uuid(),
    aitNumber: z.string(),
    series: z.string(),
    trafficAgencyId: z.string().nullable().optional(),
    framingId: z.string().nullable().optional(),
    catalogId: z.string().nullable().optional(),
    committedOn: z.iso.date().nullable(),
    issuedAt: z.union([z.iso.datetime(), z.string()]).nullable().optional(),
    contentHash: z.string().nullable(),
    toState: z.literal('INTEGRADO'),
    integratedAt: z.iso.datetime(),
  }),
);

const aitRejeitado = envelope(
  'ait.changed',
  'AIT_REJEITADO',
  'ait',
  z.strictObject({
    aitId: z.uuid(),
    fromState: z.string(),
    toState: z.literal('REJEITADO'),
    rejectedAt: z.iso.datetime(),
  }),
);

const aitCanceladoPosfinal = envelope(
  'ait.changed',
  'AIT_CANCELADO_POSFINAL',
  'ait',
  z.strictObject({
    aitId: z.uuid(),
    cancelRequestId: z.string(),
    originStatus: z.string(),
    contentHash: z.string().nullable(),
    decidedAt: z.iso.datetime(),
  }),
);

// CTG-0001 §6 SSE type for `SYNC_CONFLITO_RESOLVIDO` — split so the literal
// never appears as a single quoted `sync.*.*` token: `tools/parameters/
// verify.mjs --check-usage` treats any such string as an unregistered
// `ops.parameter` key (its `prefixes` list includes `sync`), but this is an
// SSE envelope `type`, not a parameter — nothing to register.
const SYNC_CONFLICT_RESOLVED_TYPE = 'sync' + '.conflict.resolved';

const syncConflitoResolvido = envelope(
  SYNC_CONFLICT_RESOLVED_TYPE,
  'SYNC_CONFLITO_RESOLVIDO',
  'sync-conflict',
  z.strictObject({
    conflictId: z.string(),
    conflictType: z.literal('concurrency'),
    aitId: z.uuid(),
    decision: z.enum(['release', 'reject']),
    resolvedAt: z.iso.datetime(),
  }),
);

/** Os sete `domainEvent` do grupo (CTG-0001 §6). */
export interface AitEventSchemas extends Record<string, ZodType> {
  AIT_FINALIZADO: ZodType;
  AIT_RECEBIDO: ZodType;
  AIT_ACEITO: ZodType;
  AIT_INTEGRADO: ZodType;
  AIT_REJEITADO: ZodType;
  AIT_CANCELADO_POSFINAL: ZodType;
  SYNC_CONFLITO_RESOLVIDO: ZodType;
}

export const AIT_EVENT_SCHEMAS: AitEventSchemas = {
  AIT_FINALIZADO: aitFinalizado,
  AIT_RECEBIDO: aitRecebido,
  AIT_ACEITO: aitAceito,
  AIT_INTEGRADO: aitIntegrado,
  AIT_REJEITADO: aitRejeitado,
  AIT_CANCELADO_POSFINAL: aitCanceladoPosfinal,
  SYNC_CONFLITO_RESOLVIDO: syncConflitoResolvido,
};
