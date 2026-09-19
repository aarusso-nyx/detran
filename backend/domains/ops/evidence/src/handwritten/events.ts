// CTG-0003 §8 (M16, R-0008, TASK-0007) — envelopes dos eventos de evidência,
// custódia e pacote probatório, e os esquemas zod que os descrevem.
//
// `type` técnico + `domainEvent` canônico do route contract §8
// (`rait-events-sse-contract.md` §1); `id` é sempre da outbox (CTG-0001 §13
// item 5). Nenhum efeito sem token em §8 publica evento (§11.7 / OD-T21).
//
// Molde: `backend/domains/inf/ait/src/handwritten/events.ts` —
// `additionalProperties: false` ⇒ `strictObject`. Diferença do molde: neste
// grupo **nem `type` nem `domainEvent` são chave única** (`evidence.changed`
// cobre dois `domainEvent`; `CUSTODIA_EVENTO` sai por dois `type`), então o
// mapa é chaveado pelo par `<type>:<domainEvent>`.
import { z } from 'zod';
import type { ZodType } from 'zod';
import { teatEnvelope } from '@detran/ops-core';
import type { TeatEventEnvelope } from '@detran/shared';

import {
  CUSTODY_EVENT_TYPES,
  EVIDENCE_ACCESS_REQUESTER_ROLES,
  type EvidenceScope,
} from './evidence-runtime.js';

const actor = z.strictObject({
  kind: z.enum(['user', 'system', 'timer']),
  id: z.string(),
  role: z.string().optional(),
});

function envelopeSchema<Data extends ZodType>(
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

const evidenciaCapturada = envelopeSchema(
  'evidence.changed',
  'EVIDENCIA_CAPTURADA',
  'evidence',
  z.strictObject({
    evidenceId: z.string(),
    entityType: z.string(),
    entityId: z.string(),
    evidenceType: z.string(),
    hashValue: z.string(),
    capturedAt: z.string().nullable(),
    uploadedAt: z.iso.datetime(),
  }),
);

const evidenciaVinculada = envelopeSchema(
  'evidence.changed',
  'EVIDENCIA_VINCULADA',
  'evidence',
  z.strictObject({
    evidenceId: z.string(),
    linkId: z.string(),
    entityType: z.string(),
    entityId: z.string(),
    role: z.string(),
    mandatory: z.boolean().optional(),
  }),
);

const custodiaEvento = envelopeSchema(
  'custody.event',
  'CUSTODIA_EVENTO',
  'evidence',
  z.strictObject({
    evidenceId: z.string(),
    custodyEventId: z.string(),
    eventType: z.enum(CUSTODY_EVENT_TYPES),
    eventAt: z.string(),
  }),
);

const custodiaEventoAcesso = envelopeSchema(
  'evidence.access-request.changed',
  'CUSTODIA_EVENTO',
  'evidence',
  z.strictObject({
    evidenceId: z.string(),
    accessRequestId: z.string(),
    custodyEventId: z.string(),
    eventType: z.literal('access_delivered'),
    requesterRole: z.enum(EVIDENCE_ACCESS_REQUESTER_ROLES),
    eventAt: z.iso.datetime(),
  }),
);

const pacoteProbatorioGerado = envelopeSchema(
  'probative-package.generated',
  'PACOTE_PROBATORIO_GERADO',
  'probative-package',
  z.strictObject({
    packageId: z.string(),
    entityType: z.string(),
    entityId: z.string(),
    purpose: z.string(),
    manifestHash: z.string(),
    itemCount: z.int().min(1),
  }),
);

/** Os cinco envelopes do grupo, por `<type>:<domainEvent>` (CTG-0003 §8). */
export interface EvidenceEventSchemas extends Record<string, ZodType> {
  'evidence.changed:EVIDENCIA_CAPTURADA': ZodType;
  'evidence.changed:EVIDENCIA_VINCULADA': ZodType;
  'custody.event:CUSTODIA_EVENTO': ZodType;
  'evidence.access-request.changed:CUSTODIA_EVENTO': ZodType;
  'probative-package.generated:PACOTE_PROBATORIO_GERADO': ZodType;
}

export const EVIDENCE_EVENT_SCHEMAS: EvidenceEventSchemas = {
  'evidence.changed:EVIDENCIA_CAPTURADA': evidenciaCapturada,
  'evidence.changed:EVIDENCIA_VINCULADA': evidenciaVinculada,
  'custody.event:CUSTODIA_EVENTO': custodiaEvento,
  'evidence.access-request.changed:CUSTODIA_EVENTO': custodiaEventoAcesso,
  'probative-package.generated:PACOTE_PROBATORIO_GERADO':
    pacoteProbatorioGerado,
};

export type EvidenceCapturedData = z.infer<typeof evidenciaCapturada>['data'];
export type EvidenceLinkedData = z.infer<typeof evidenciaVinculada>['data'];
export type CustodyEventData = z.infer<typeof custodiaEvento>['data'];
export type AccessDeliveredData = z.infer<typeof custodiaEventoAcesso>['data'];
export type ProbativePackageGeneratedData = z.infer<
  typeof pacoteProbatorioGerado
>['data'];

/**
 * `outboxIdempotencyKey` é `<type>:<aggregate.id>:<aggregate.version>`
 * (CTG-0001 §2): dois fatos distintos do mesmo agregado precisam de versões
 * distintas, senão o segundo envelope some no `on conflict do nothing` da
 * outbox. Por isso a versão é sempre a ordem do fato dentro do agregado
 * (OD-T58, ratificada na adenda §13).
 */
function aggregateOf(kind: string, id: string, version = 1) {
  return { kind, id, version };
}

export function evidenceCapturedEvent(
  scope: EvidenceScope,
  data: EvidenceCapturedData,
): TeatEventEnvelope {
  return teatEnvelope({
    type: 'evidence.changed',
    domainEvent: 'EVIDENCIA_CAPTURADA',
    tenantId: scope.tenantId,
    actorId: scope.actorId,
    occurredAt: scope.occurredAt,
    aggregate: aggregateOf('evidence', data.evidenceId),
    data: { ...data },
  });
}

export function evidenceLinkedEvent(
  scope: EvidenceScope,
  data: EvidenceLinkedData,
  version = 1,
): TeatEventEnvelope {
  return teatEnvelope({
    type: 'evidence.changed',
    domainEvent: 'EVIDENCIA_VINCULADA',
    tenantId: scope.tenantId,
    actorId: scope.actorId,
    occurredAt: scope.occurredAt,
    aggregate: aggregateOf('evidence', data.evidenceId, version),
    data: { ...data },
  });
}

export function custodyRecordedEvent(
  scope: EvidenceScope,
  data: CustodyEventData,
  version = 1,
): TeatEventEnvelope {
  return teatEnvelope({
    type: 'custody.event',
    domainEvent: 'CUSTODIA_EVENTO',
    tenantId: scope.tenantId,
    actorId: scope.actorId,
    occurredAt: scope.occurredAt,
    aggregate: aggregateOf('evidence', data.evidenceId, version),
    data: { ...data },
  });
}

export function accessDeliveredEvent(
  scope: EvidenceScope,
  data: AccessDeliveredData,
  version = 1,
): TeatEventEnvelope {
  return teatEnvelope({
    type: 'evidence.access-request.changed',
    domainEvent: 'CUSTODIA_EVENTO',
    tenantId: scope.tenantId,
    actorId: scope.actorId,
    occurredAt: scope.occurredAt,
    aggregate: aggregateOf('evidence', data.evidenceId, version),
    data: { ...data },
  });
}

export function probativePackageGeneratedEvent(
  scope: EvidenceScope,
  data: ProbativePackageGeneratedData,
): TeatEventEnvelope {
  return teatEnvelope({
    type: 'probative-package.generated',
    domainEvent: 'PACOTE_PROBATORIO_GERADO',
    tenantId: scope.tenantId,
    actorId: scope.actorId,
    occurredAt: scope.occurredAt,
    aggregate: aggregateOf('probative-package', data.packageId),
    data: { ...data },
  });
}
