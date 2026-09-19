// CTG-0002 §7 (M16) — envelopes publicados por `@detran/ops-field`.
// Mesmo formato de `rait-events-sse-contract.md` §1 e do molde de
// `inf/ait/src/handwritten/events.ts` (`additionalProperties: false` ⇒
// `strictObject`); o mapa é chaveado por `domainEvent` porque `shift.changed`
// cobre abertura e fechamento de turno.
import { teatEnvelope } from '@detran/ops-core';
import type { TeatEventEnvelope } from '@detran/shared';
import { z } from 'zod';
import type { ZodType } from 'zod';

export const SHIFT_CHANGED_TYPE = 'shift.changed';
export const DEVICE_POSTURE_CHANGED_TYPE = 'device.posture-changed';

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

const turnoAberto = envelope(
  SHIFT_CHANGED_TYPE,
  'TURNO_ABERTO',
  'shift',
  z.strictObject({
    shiftId: z.string(),
    agentId: z.string(),
    deviceId: z.string(),
    operationalUnitId: z.string().nullable(),
    startedAt: z.iso.datetime(),
  }),
);

const turnoFechado = envelope(
  SHIFT_CHANGED_TYPE,
  'TURNO_FECHADO',
  'shift',
  z.strictObject({
    shiftId: z.string(),
    agentId: z.string(),
    deviceId: z.string(),
    endedAt: z.iso.datetime(),
    pendingCount: z.int().min(0),
    reservationsClosed: z.array(z.string()),
    reservationsCancelled: z.array(z.string()),
  }),
);

const dispositivoBloqueado = envelope(
  DEVICE_POSTURE_CHANGED_TYPE,
  'DISPOSITIVO_BLOQUEADO',
  'operational-device',
  z.strictObject({
    deviceId: z.string(),
    agentId: z.string().nullable(),
    fromStatus: z.string(),
    toStatus: z.string(),
    eventType: z.string(),
  }),
);

/** Os três `domainEvent` publicados pelo grupo (CTG-0002 §7). */
export interface FieldEventSchemas extends Record<string, ZodType> {
  TURNO_ABERTO: ZodType;
  TURNO_FECHADO: ZodType;
  DISPOSITIVO_BLOQUEADO: ZodType;
}

export const FIELD_EVENT_SCHEMAS: FieldEventSchemas = {
  TURNO_ABERTO: turnoAberto,
  TURNO_FECHADO: turnoFechado,
  DISPOSITIVO_BLOQUEADO: dispositivoBloqueado,
};

/** Falha cedo quando um envelope foge da forma declarada da §7. */
export function assertEventShape(envelope: TeatEventEnvelope): void {
  const schema = FIELD_EVENT_SCHEMAS[envelope.domainEvent];
  if (!schema)
    throw new Error(`Unknown field domain event ${envelope.domainEvent}`);
  schema.parse(envelope);
}

export interface EventScope {
  tenantId: string;
  actorId: string;
  occurredAt: string;
}

export function shiftOpenedEvent(
  scope: EventScope,
  data: {
    shiftId: string;
    agentId: string;
    deviceId: string;
    operationalUnitId: string | null;
    startedAt: string;
  },
): TeatEventEnvelope {
  return teatEnvelope({
    type: SHIFT_CHANGED_TYPE,
    domainEvent: 'TURNO_ABERTO',
    tenantId: scope.tenantId,
    actorId: scope.actorId,
    occurredAt: scope.occurredAt,
    aggregate: { kind: 'shift', id: data.shiftId, version: 1 },
    data: { ...data },
  });
}

export function shiftClosedEvent(
  scope: EventScope,
  data: {
    shiftId: string;
    agentId: string;
    deviceId: string;
    endedAt: string;
    pendingCount: number;
    reservationsClosed: string[];
    reservationsCancelled: string[];
  },
): TeatEventEnvelope {
  return teatEnvelope({
    type: SHIFT_CHANGED_TYPE,
    domainEvent: 'TURNO_FECHADO',
    tenantId: scope.tenantId,
    actorId: scope.actorId,
    occurredAt: scope.occurredAt,
    // O turno fecha na sua segunda versão: a chave de idempotência da outbox é
    // `type:aggregateId:version`, então abertura e fechamento precisam de
    // versões distintas para coexistirem.
    aggregate: { kind: 'shift', id: data.shiftId, version: 2 },
    data: { ...data },
  });
}

export function devicePostureChangedEvent(
  scope: EventScope,
  data: {
    deviceId: string;
    agentId: string | null;
    fromStatus: string;
    toStatus: string;
    eventType: string;
  },
  aggregateVersion = 1,
): TeatEventEnvelope {
  return teatEnvelope({
    type: DEVICE_POSTURE_CHANGED_TYPE,
    domainEvent: 'DISPOSITIVO_BLOQUEADO',
    tenantId: scope.tenantId,
    actorId: scope.actorId,
    occurredAt: scope.occurredAt,
    aggregate: {
      kind: 'operational-device',
      id: data.deviceId,
      version: aggregateVersion,
    },
    data: { ...data },
  });
}
