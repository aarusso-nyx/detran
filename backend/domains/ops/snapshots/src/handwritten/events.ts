// CTG-0003 §5.1 e §11.7 (M16, R-0008, TASK-0007) — a consulta externa **não**
// publica evento nesta rodada: o route contract §8 não nomeia token de
// consulta (OD-T21, ratificada na adenda §13). O arquivo existe porque §11 o
// lista no layout do módulo e é onde o envelope entra quando o token for
// decidido.
//
// O molde do envelope (`backend/domains/inf/ait/src/handwritten/events.ts`,
// `additionalProperties: false` ⇒ `strictObject`) já fica montado aqui, de
// modo que declarar o primeiro evento do grupo seja só acrescentar o `data` e
// a entrada no mapa — nenhum token é inventado antes da decisão.
import { z } from 'zod';
import type { ZodType } from 'zod';

const actor = z.strictObject({
  kind: z.enum(['user', 'system', 'timer']),
  id: z.string(),
  role: z.string().optional(),
});

export function snapshotEnvelopeSchema<Data extends ZodType>(
  type: string,
  domainEvent: string,
  aggregateKind: string,
  data: Data,
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

/** Nenhum `type` SSE reservado para consultas externas nesta rodada (§11.7). */
export const SNAPSHOT_EVENT_TYPES = [] as const;

export type SnapshotEventType = (typeof SNAPSHOT_EVENT_TYPES)[number];

/** Vazio por decisão de contrato, não por omissão (§8 não nomeia o token). */
export const SNAPSHOT_EVENT_SCHEMAS: Record<string, ZodType> = {};
