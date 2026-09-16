// CTG-0004 §9 (M16, R-0008, TASK-0009) — envelopes dos eventos de medidas
// administrativas. `type` técnico + `domainEvent` canônico do route contract
// §8 (`rait-events-sse-contract.md` §1); `id` é sempre da outbox (CTG-0001
// §13 item 5). Nenhum efeito sem token em §8 publica evento (§14 item 6 /
// OD-T21).
import type { TeatEventEnvelope } from '@detran/shared';

import { measureEnvelope, type MeasureScope } from './measure-runtime.js';

export interface MeasureStartedData extends Record<string, unknown> {
  measureId: string;
  measureTypeId: string;
  aitId: string | null;
  agentId: string | null;
  currentStatus: string;
  startedAt: string;
}

export interface MeasureConcludedData extends Record<string, unknown> {
  measureId: string;
  fromState: string;
  toState: string;
  endedAt: string;
}

/**
 * CTG-0004 §16.1/§16.6 (ratificado, OD-T65): `release` a partir de `RETIDO`
 * vai **sempre** para `LIBERADO_LOCAL`, publicando `measure.changed` com
 * `domainEvent: 'MEDIDA_LIBERADA'` (convenção de §9, junto de
 * `MEDIDA_INICIADA`/`MEDIDA_CONCLUIDA`/`TERMO_EMITIDO`). O ramo
 * `LIBERADO_COM_PRAZO → REGULARIZADO` não usa este evento: reusa
 * `MEDIDA_CONCLUIDA` (mesmo estado final de `conclude`).
 */
export interface MeasureReleasedData extends Record<string, unknown> {
  measureId: string;
  fromState: string;
  toState: string;
  releasedAt: string;
}

export function measureReleasedEvent(
  scope: MeasureScope,
  data: MeasureReleasedData,
): TeatEventEnvelope {
  return measureEnvelope({
    type: 'measure.changed',
    domainEvent: 'MEDIDA_LIBERADA',
    tenantId: scope.tenantId,
    actorId: scope.actorId,
    occurredAt: scope.occurredAt,
    aggregate: {
      kind: 'administrative-measure',
      id: data.measureId,
      version: 1,
    },
    data: { ...data },
  });
}

export interface MeasureTermIssuedData extends Record<string, unknown> {
  measureId: string;
  termId: string;
  termType: string;
  termNumber: string;
  issuedAt: string;
  withdrawalDeadlineAt: string | null;
  ctbDeadlineAt: string | null;
  contentHash: string;
}

export function measureStartedEvent(
  scope: MeasureScope,
  data: MeasureStartedData,
): TeatEventEnvelope {
  return measureEnvelope({
    type: 'measure.changed',
    domainEvent: 'MEDIDA_INICIADA',
    tenantId: scope.tenantId,
    actorId: scope.actorId,
    occurredAt: scope.occurredAt,
    aggregate: {
      kind: 'administrative-measure',
      id: data.measureId,
      version: 1,
    },
    data: { ...data },
  });
}

export function measureConcludedEvent(
  scope: MeasureScope,
  data: MeasureConcludedData,
): TeatEventEnvelope {
  return measureEnvelope({
    type: 'measure.changed',
    domainEvent: 'MEDIDA_CONCLUIDA',
    tenantId: scope.tenantId,
    actorId: scope.actorId,
    occurredAt: scope.occurredAt,
    aggregate: {
      kind: 'administrative-measure',
      id: data.measureId,
      version: 1,
    },
    data: { ...data },
  });
}

export function measureTermIssuedEvent(
  scope: MeasureScope,
  data: MeasureTermIssuedData,
): TeatEventEnvelope {
  return measureEnvelope({
    type: 'measure.changed',
    domainEvent: 'TERMO_EMITIDO',
    tenantId: scope.tenantId,
    actorId: scope.actorId,
    occurredAt: scope.occurredAt,
    aggregate: {
      kind: 'administrative-measure',
      id: data.measureId,
      version: 1,
    },
    data: { ...data },
  });
}
