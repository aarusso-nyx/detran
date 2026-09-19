// Eventos publicados por `@detran/portal-identity` (work/rounds/R-0009/
// contracts/CTG-0002.md §11; plan R-0009 M21): `NIVEL_ASSINATURA_ELEVADO`
// (type `portal.identity.elevated` — inalcançável nesta rodada, OD-P15) e
// `REPRESENTACAO_VALIDADA` (type `portal.representation.validated`, emitido
// pelo `validateRepresentation` interno). Padrão de
// `inf/infraction/src/handwritten/events.ts`; os `type` são montados por
// concatenação (precedente `ops/offline-sync`: `verify:parameter-catalogue`
// leria o literal `portal.<x>.<y>` como chave de parâmetro).
import { z } from 'zod';
import type { ZodType } from 'zod';
import type { TeatEventEnvelope } from '@detran/shared';

const PORTAL_TOPIC_PREFIX = 'portal';

// Tokens copiados de identity.service.ts (`PORTAL_ASSURANCE_LEVELS`,
// `PORTAL_ELEVATION_METHODS`) — este arquivo não importa o serviço para não
// fechar um ciclo (o serviço publica os eventos daqui).
const ASSURANCE_LEVELS = ['simples', 'avancada', 'qualificada'] as const;
const ELEVATION_METHODS = ['biographic', 'biometric', 'icp'] as const;

export const PORTAL_IDENTITY_ELEVATED_TYPE = `${PORTAL_TOPIC_PREFIX}.identity.elevated`;
export const PORTAL_REPRESENTATION_VALIDATED_TYPE = `${PORTAL_TOPIC_PREFIX}.representation.validated`;

export const PORTAL_SUBJECT_AGGREGATE_KIND = 'portal.subject';
export const PORTAL_REPRESENTATION_AGGREGATE_KIND = 'portal.representation';

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

const nivelAssinaturaElevado = envelope(
  PORTAL_IDENTITY_ELEVATED_TYPE,
  'NIVEL_ASSINATURA_ELEVADO',
  PORTAL_SUBJECT_AGGREGATE_KIND,
  z.strictObject({
    subjectId: z.uuid(),
    subjectCpfHash: sha256,
    fromLevel: z.enum(ASSURANCE_LEVELS),
    toLevel: z.enum(ASSURANCE_LEVELS),
    method: z.enum(ELEVATION_METHODS),
    elevatedAt: z.iso.datetime(),
  }),
);

const representacaoValidada = envelope(
  PORTAL_REPRESENTATION_VALIDATED_TYPE,
  'REPRESENTACAO_VALIDADA',
  PORTAL_REPRESENTATION_AGGREGATE_KIND,
  z.strictObject({
    representationId: z.uuid(),
    representativeSubjectId: z.uuid(),
    representedCpfHash: sha256,
    scope: z.enum(['ait', 'all']),
    validUntil: z.iso.date().nullable(),
    validatedAt: z.iso.datetime(),
  }),
);

export const PORTAL_IDENTITY_EVENT_SCHEMAS: Readonly<Record<string, ZodType>> =
  {
    [PORTAL_IDENTITY_ELEVATED_TYPE]: nivelAssinaturaElevado,
    [PORTAL_REPRESENTATION_VALIDATED_TYPE]: representacaoValidada,
  };

export type NivelAssinaturaElevadoData = z.infer<
  typeof nivelAssinaturaElevado
>['data'];
export type RepresentacaoValidadaData = z.infer<
  typeof representacaoValidada
>['data'];

export interface PortalIdentityEventContext {
  occurredAt: string;
  actorId: string;
  correlationId: string;
}

function portalEnvelope(
  type: string,
  domainEvent: string,
  aggregate: TeatEventEnvelope['aggregate'],
  data: Record<string, unknown>,
  context: PortalIdentityEventContext,
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

export const portalIdentityEvents = {
  nivelAssinaturaElevado(
    subjectId: string,
    version: number,
    data: NivelAssinaturaElevadoData,
    context: PortalIdentityEventContext,
  ): TeatEventEnvelope {
    return portalEnvelope(
      PORTAL_IDENTITY_ELEVATED_TYPE,
      'NIVEL_ASSINATURA_ELEVADO',
      { kind: PORTAL_SUBJECT_AGGREGATE_KIND, id: subjectId, version },
      data,
      context,
    );
  },
  /** `portal.representation` não tem `version` (D-CTG2-1): uma publicação por validação. */
  representacaoValidada(
    representationId: string,
    data: RepresentacaoValidadaData,
    context: PortalIdentityEventContext,
  ): TeatEventEnvelope {
    return portalEnvelope(
      PORTAL_REPRESENTATION_VALIDATED_TYPE,
      'REPRESENTACAO_VALIDADA',
      {
        kind: PORTAL_REPRESENTATION_AGGREGATE_KIND,
        id: representationId,
        version: 1,
      },
      data,
      context,
    );
  },
};
