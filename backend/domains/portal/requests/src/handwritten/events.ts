// Eventos publicados por `@detran/portal-requests` (work/rounds/R-0009/
// contracts/CTG-0002.md §11; plan R-0009 M21): `SOLICITACAO_CRIADA`,
// `SOLICITACAO_PROTOCOLADA`, `SOLICITACAO_DESISTIDA`, `SOLICITACAO_CONCLUIDA`
// (type `portal.request.changed`, união discriminada em `domainEvent`) e
// `AVALIACAO_REGISTRADA` (type `portal.evaluation.registered`). Padrão de
// `inf/infraction/src/handwritten/events.ts`: envelope de
// rait-events-sse-contract.md §1, `strictObject` em toda parte — `data` só com
// ids, tokens, datas e o `cpf_hash` do sujeito (escopo do SSE, §9).
//
// Os `type` técnicos `portal.<x>.<y>` são montados por concatenação, nunca
// como literal: `tools/parameters/verify.mjs --check-usage` leria o literal
// como chave de `ops.parameter` não registrada (precedente de
// `ops/offline-sync/src/handwritten/events.ts`).
import { z } from 'zod';
import type { ZodType } from 'zod';
import type { TeatEventEnvelope } from '@detran/shared';

import { REQUEST_STATES } from './guards/request.transitions.js';

const PORTAL_TOPIC_PREFIX = 'portal';

export const PORTAL_REQUEST_CHANGED_TYPE = `${PORTAL_TOPIC_PREFIX}.request.changed`;
export const PORTAL_EVALUATION_REGISTERED_TYPE = `${PORTAL_TOPIC_PREFIX}.evaluation.registered`;

export const PORTAL_REQUEST_AGGREGATE_KIND = 'portal.request';
export const PORTAL_EVALUATION_AGGREGATE_KIND = 'portal.evaluation';

const requestState = z.enum(REQUEST_STATES);
const targetKind = z.enum(['ait', 'case', 'vehicle', 'exam', 'crash', 'none']);
const sha256 = z.string().regex(/^[0-9a-f]{64}$/);

const actor = z.strictObject({
  kind: z.enum(['user', 'system', 'timer']),
  id: z.string(),
  role: z.string().optional(),
});

function envelope<D extends ZodType>(
  type: string,
  domainEvent: string,
  aggregateKind: string,
  data: D,
) {
  return z.strictObject({
    id: z.string(),
    type: z.literal(type),
    domainEvent: z.literal(domainEvent),
    version: z.int().min(1),
    occurredAt: z.iso.datetime(),
    tenantId: z.uuid(),
    actor,
    correlationId: z.string(),
    causationId: z.string().optional(),
    aggregate: z.strictObject({
      kind: z.literal(aggregateKind),
      id: z.uuid(),
      version: z.int().min(1),
    }),
    data,
  });
}

const requestCommon = {
  requestId: z.uuid(),
  serviceKey: z.string(),
  subjectId: z.uuid(),
  subjectCpfHash: sha256,
};

const solicitacaoCriada = envelope(
  PORTAL_REQUEST_CHANGED_TYPE,
  'SOLICITACAO_CRIADA',
  PORTAL_REQUEST_AGGREGATE_KIND,
  z.strictObject({
    ...requestCommon,
    targetKind,
    targetId: z.uuid().nullable(),
    fromState: z.null(),
    toState: z.literal('PEDIDO_EM_COMPOSICAO'),
    occurredAt: z.iso.datetime(),
  }),
);

const solicitacaoProtocolada = envelope(
  PORTAL_REQUEST_CHANGED_TYPE,
  'SOLICITACAO_PROTOCOLADA',
  PORTAL_REQUEST_AGGREGATE_KIND,
  z.strictObject({
    ...requestCommon,
    protocolNumber: z.string(),
    issuedAt: z.iso.datetime(),
    receiptHash: sha256,
    fromState: requestState,
    toState: z.literal('PROTOCOLADO'),
  }),
);

const solicitacaoDesistida = envelope(
  PORTAL_REQUEST_CHANGED_TYPE,
  'SOLICITACAO_DESISTIDA',
  PORTAL_REQUEST_AGGREGATE_KIND,
  z.strictObject({
    ...requestCommon,
    fromState: requestState,
    toState: z.literal('DESISTIDO'),
    withdrawnAt: z.iso.datetime(),
  }),
);

const solicitacaoConcluida = envelope(
  PORTAL_REQUEST_CHANGED_TYPE,
  'SOLICITACAO_CONCLUIDA',
  PORTAL_REQUEST_AGGREGATE_KIND,
  z.strictObject({
    ...requestCommon,
    fromState: z.literal('AVALIACAO_OFERECIDA'),
    toState: z.literal('CONCLUIDO'),
    evaluationId: z.uuid(),
  }),
);

const avaliacaoRegistrada = envelope(
  PORTAL_EVALUATION_REGISTERED_TYPE,
  'AVALIACAO_REGISTRADA',
  PORTAL_EVALUATION_AGGREGATE_KIND,
  z.strictObject({
    evaluationId: z.uuid(),
    subjectKind: z.enum(['request', 'manifestation']),
    subjectId: z.uuid(),
    submittedAt: z.iso.datetime(),
    citizenSubjectId: z.uuid(),
    subjectCpfHash: sha256,
  }),
);

/** `type` → schema (o de `portal.request.changed` é a união por `domainEvent`). */
export const PORTAL_REQUESTS_EVENT_SCHEMAS: Readonly<Record<string, ZodType>> =
  {
    [PORTAL_REQUEST_CHANGED_TYPE]: z.discriminatedUnion('domainEvent', [
      solicitacaoCriada,
      solicitacaoProtocolada,
      solicitacaoDesistida,
      solicitacaoConcluida,
    ]),
    [PORTAL_EVALUATION_REGISTERED_TYPE]: avaliacaoRegistrada,
  };

export type SolicitacaoCriadaData = z.infer<typeof solicitacaoCriada>['data'];
export type SolicitacaoProtocoladaData = z.infer<
  typeof solicitacaoProtocolada
>['data'];
export type SolicitacaoDesistidaData = z.infer<
  typeof solicitacaoDesistida
>['data'];
export type SolicitacaoConcluidaData = z.infer<
  typeof solicitacaoConcluida
>['data'];
export type AvaliacaoRegistradaData = z.infer<
  typeof avaliacaoRegistrada
>['data'];

export interface PortalEventContext {
  occurredAt: string;
  actorId: string;
  correlationId: string;
}

function portalEnvelope(
  type: string,
  domainEvent: string,
  aggregate: TeatEventEnvelope['aggregate'],
  data: Record<string, unknown>,
  context: PortalEventContext,
): TeatEventEnvelope {
  return {
    id: '',
    type,
    domainEvent,
    version: 1,
    occurredAt: context.occurredAt,
    tenantId: '',
    actor: { kind: 'user', id: context.actorId },
    correlationId: context.correlationId,
    aggregate,
    data,
  };
}

/** Fábricas por `domainEvent` — `aggregate.version` = versão APÓS a transição (§11). */
export const portalRequestEvents = {
  criada(
    requestId: string,
    version: number,
    data: SolicitacaoCriadaData,
    context: PortalEventContext,
  ): TeatEventEnvelope {
    return portalEnvelope(
      PORTAL_REQUEST_CHANGED_TYPE,
      'SOLICITACAO_CRIADA',
      { kind: PORTAL_REQUEST_AGGREGATE_KIND, id: requestId, version },
      data,
      context,
    );
  },
  protocolada(
    requestId: string,
    version: number,
    data: SolicitacaoProtocoladaData,
    context: PortalEventContext,
  ): TeatEventEnvelope {
    return portalEnvelope(
      PORTAL_REQUEST_CHANGED_TYPE,
      'SOLICITACAO_PROTOCOLADA',
      { kind: PORTAL_REQUEST_AGGREGATE_KIND, id: requestId, version },
      data,
      context,
    );
  },
  desistida(
    requestId: string,
    version: number,
    data: SolicitacaoDesistidaData,
    context: PortalEventContext,
  ): TeatEventEnvelope {
    return portalEnvelope(
      PORTAL_REQUEST_CHANGED_TYPE,
      'SOLICITACAO_DESISTIDA',
      { kind: PORTAL_REQUEST_AGGREGATE_KIND, id: requestId, version },
      data,
      context,
    );
  },
  concluida(
    requestId: string,
    version: number,
    data: SolicitacaoConcluidaData,
    context: PortalEventContext,
  ): TeatEventEnvelope {
    return portalEnvelope(
      PORTAL_REQUEST_CHANGED_TYPE,
      'SOLICITACAO_CONCLUIDA',
      { kind: PORTAL_REQUEST_AGGREGATE_KIND, id: requestId, version },
      data,
      context,
    );
  },
  avaliacaoRegistrada(
    evaluationId: string,
    data: AvaliacaoRegistradaData,
    context: PortalEventContext,
  ): TeatEventEnvelope {
    return portalEnvelope(
      PORTAL_EVALUATION_REGISTERED_TYPE,
      'AVALIACAO_REGISTRADA',
      { kind: PORTAL_EVALUATION_AGGREGATE_KIND, id: evaluationId, version: 1 },
      data,
      context,
    );
  },
};
