// CTG-0004 §9 (M16, R-0008, TASK-0009) — envelopes dos eventos de
// alcoolemia. `id` é sempre da outbox (CTG-0001 §13 item 5). Nenhum efeito
// sem token em §8 publica evento (§14 item 6 / OD-T21) — só os dois listados
// abaixo existem nesta rodada.
import type { TeatEventEnvelope } from '@detran/shared';

import { alcoholEnvelope, type AlcoholScope } from './alcohol-runtime.js';

export interface AlcoholTestRegisteredData extends Record<string, unknown> {
  procedureId: string;
  testId: string;
  breathalyzerId: string | null;
  testedAt: string;
  resultMgL: number;
  maxErrorMgL: number;
  consideredMgL: number;
  outcome: string;
  toState: string;
}

export interface AlcoholRefusalRegisteredData extends Record<string, unknown> {
  procedureId: string;
  refusalId: string;
  kind: string;
  refusedAt: string;
  toState: string;
}

export function alcoholTestRegisteredEvent(
  scope: AlcoholScope,
  data: AlcoholTestRegisteredData,
): TeatEventEnvelope {
  return alcoholEnvelope({
    type: 'alcohol.changed',
    domainEvent: 'ALCOOLEMIA_TESTE_REGISTRADO',
    tenantId: scope.tenantId,
    actorId: scope.actorId,
    occurredAt: scope.occurredAt,
    aggregate: { kind: 'alcohol-procedure', id: data.procedureId, version: 1 },
    data: { ...data },
  });
}

export function alcoholRefusalRegisteredEvent(
  scope: AlcoholScope,
  data: AlcoholRefusalRegisteredData,
): TeatEventEnvelope {
  return alcoholEnvelope({
    type: 'alcohol.changed',
    domainEvent: 'ALCOOLEMIA_RECUSA_REGISTRADA',
    tenantId: scope.tenantId,
    actorId: scope.actorId,
    occurredAt: scope.occurredAt,
    aggregate: { kind: 'alcohol-procedure', id: data.procedureId, version: 1 },
    data: { ...data },
  });
}
