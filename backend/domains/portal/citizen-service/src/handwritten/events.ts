// Eventos publicados por `@detran/portal-citizen-service` (work/rounds/R-0009/
// contracts/CTG-0002.md §11; plan R-0009 M13, M21): `MANIFESTACAO_REGISTRADA`
// e `MANIFESTACAO_ENCERRADA` (type `portal.manifestation.changed`, união
// discriminada em `domainEvent`). `AVALIACAO_REGISTRADA` é publicado com a
// fábrica de `@detran/portal-requests` (mesmo type `portal.evaluation.registered`).
// Padrão de `inf/infraction/src/handwritten/events.ts`: `strictObject` em toda
// parte — `data` só ids, tokens, datas e o `cpf_hash` do sujeito; o texto da
// manifestação nunca sai.
//
// Os `type` técnicos `portal.<x>.<y>` são montados por concatenação, nunca
// como literal (`tools/parameters/verify.mjs --check-usage`).
import { z } from 'zod';
import type { ZodType } from 'zod';
import type { TeatEventEnvelope } from '@detran/shared';

import { MANIFESTATION_STATES } from './guards/manifestation.transitions.js';

const PORTAL_TOPIC_PREFIX = 'portal';

export const PORTAL_MANIFESTATION_CHANGED_TYPE = `${PORTAL_TOPIC_PREFIX}.manifestation.changed`;
export const PORTAL_MANIFESTATION_AGGREGATE_KIND = 'portal.manifestation';

/** Taxonomia da Lei 13.460 art. 2º V (H.52 mantém `solicitacao`; DDL 64). */
export const MANIFESTATION_KINDS = [
  'reclamacao',
  'denuncia',
  'sugestao',
  'elogio',
  'solicitacao',
] as const;
export type ManifestationKind = (typeof MANIFESTATION_KINDS)[number];

const sha256 = z.string().regex(/^[0-9a-f]{64}$/);
const localDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

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

const manifestacaoRegistrada = envelope(
  PORTAL_MANIFESTATION_CHANGED_TYPE,
  'MANIFESTACAO_REGISTRADA',
  PORTAL_MANIFESTATION_AGGREGATE_KIND,
  z.strictObject({
    manifestationId: z.uuid(),
    protocol: z.string(),
    kind: z.enum(MANIFESTATION_KINDS),
    anonymous: z.boolean(),
    subjectId: z.uuid().nullable(),
    subjectCpfHash: sha256.nullable(),
    receivedAt: z.iso.datetime(),
    agencyDueOn: localDate,
    toState: z.literal('COMPROVANTE_EMITIDO'),
  }),
);

const manifestacaoEncerrada = envelope(
  PORTAL_MANIFESTATION_CHANGED_TYPE,
  'MANIFESTACAO_ENCERRADA',
  PORTAL_MANIFESTATION_AGGREGATE_KIND,
  z.strictObject({
    manifestationId: z.uuid(),
    protocol: z.string(),
    acknowledgedAt: z.iso.datetime(),
    fromState: z.literal('CIENCIA_AO_USUARIO'),
    toState: z.literal('AVALIACAO_OFERECIDA'),
    subjectId: z.uuid(),
    subjectCpfHash: sha256,
  }),
);

export const PORTAL_CITIZEN_SERVICE_EVENT_SCHEMAS: Readonly<
  Record<string, ZodType>
> = {
  [PORTAL_MANIFESTATION_CHANGED_TYPE]: z.discriminatedUnion('domainEvent', [
    manifestacaoRegistrada,
    manifestacaoEncerrada,
  ]),
};

export type ManifestacaoRegistradaData = z.infer<
  typeof manifestacaoRegistrada
>['data'];
export type ManifestacaoEncerradaData = z.infer<
  typeof manifestacaoEncerrada
>['data'];

export type ManifestationStateToken = (typeof MANIFESTATION_STATES)[number];

export interface PortalCitizenEventContext {
  occurredAt: string;
  actorId: string;
  correlationId: string;
}

function portalEnvelope(
  domainEvent: string,
  manifestationId: string,
  version: number,
  data: Record<string, unknown>,
  context: PortalCitizenEventContext,
): TeatEventEnvelope {
  return {
    id: '',
    type: PORTAL_MANIFESTATION_CHANGED_TYPE,
    domainEvent,
    version: 1,
    occurredAt: context.occurredAt,
    tenantId: '',
    actor: { kind: 'user', id: context.actorId },
    correlationId: context.correlationId,
    aggregate: {
      kind: PORTAL_MANIFESTATION_AGGREGATE_KIND,
      id: manifestationId,
      version,
    },
    data,
  };
}

/** Fábricas por `domainEvent` — `aggregate.version` = versão APÓS a transição (§11). */
export const portalManifestationEvents = {
  registrada(
    manifestationId: string,
    version: number,
    data: ManifestacaoRegistradaData,
    context: PortalCitizenEventContext,
  ): TeatEventEnvelope {
    return portalEnvelope(
      'MANIFESTACAO_REGISTRADA',
      manifestationId,
      version,
      data,
      context,
    );
  },
  encerrada(
    manifestationId: string,
    version: number,
    data: ManifestacaoEncerradaData,
    context: PortalCitizenEventContext,
  ): TeatEventEnvelope {
    return portalEnvelope(
      'MANIFESTACAO_ENCERRADA',
      manifestationId,
      version,
      data,
      context,
    );
  },
};
