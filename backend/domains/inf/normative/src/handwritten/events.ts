// CTG-0003 §8 (M16, R-0008, TASK-0007) — envelopes do catálogo e do pacote
// normativo, e os esquemas zod que os descrevem. `retire` (de catálogo e de
// pacote) não tem token no route contract §8 e por isso não publica (§11.7 /
// OD-T21).
//
// Molde: `backend/domains/inf/ait/src/handwritten/events.ts` —
// `additionalProperties: false` ⇒ `strictObject`. Aqui `type` e `domainEvent`
// são chaves únicas, então o mapa segue o molde e é chaveado por
// `domainEvent`.
import { z } from 'zod';
import type { ZodType } from 'zod';

import type {
  NormativeEventEnvelope,
  NormativeRow,
} from './normative-runtime.js';

export interface NormativeScope {
  tenantId: string;
  actorId: string;
  occurredAt: string;
}

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

const catalogoPublicado = envelopeSchema(
  'catalog.published',
  'CATALOGO_PUBLICADO',
  'normative-catalog',
  z.strictObject({
    catalogId: z.string(),
    name: z.string(),
    version: z.string(),
    // `normative_catalog.published_at` e `valid_from` são colunas `date`.
    publishedAt: z.string(),
    validFrom: z.string().nullable(),
  }),
);

const pacoteMobilePublicado = envelopeSchema(
  'package.published',
  'PACOTE_MOBILE_PUBLICADO',
  'normative-package',
  z.strictObject({
    packageId: z.string(),
    catalogId: z.string(),
    packageVersion: z.string(),
    manifestHash: z.string(),
    publishedAt: z.iso.datetime(),
    // `normative_mobile_package.valid_until` é coluna `date`.
    validUntil: z.string().nullable(),
  }),
);

/** Os dois `domainEvent` do grupo (CTG-0003 §8). */
export interface NormativeEventSchemas extends Record<string, ZodType> {
  CATALOGO_PUBLICADO: ZodType;
  PACOTE_MOBILE_PUBLICADO: ZodType;
}

export const NORMATIVE_EVENT_SCHEMAS: NormativeEventSchemas = {
  CATALOGO_PUBLICADO: catalogoPublicado,
  PACOTE_MOBILE_PUBLICADO: pacoteMobilePublicado,
};

export type CatalogPublishedData = z.infer<typeof catalogoPublicado>['data'];
export type PackagePublishedData = z.infer<
  typeof pacoteMobilePublicado
>['data'];

function envelope(
  scope: NormativeScope,
  input: {
    type: string;
    domainEvent: string;
    aggregate: { kind: string; id: string; version: number };
    data: Record<string, unknown>;
  },
): NormativeEventEnvelope {
  return {
    id: '',
    type: input.type,
    domainEvent: input.domainEvent,
    version: 1,
    occurredAt: scope.occurredAt,
    tenantId: scope.tenantId,
    actor: { kind: 'user', id: scope.actorId },
    correlationId: input.aggregate.id,
    aggregate: input.aggregate,
    data: input.data,
  };
}

export function catalogPublishedEvent(
  scope: NormativeScope,
  data: CatalogPublishedData,
): NormativeEventEnvelope {
  return envelope(scope, {
    type: 'catalog.published',
    domainEvent: 'CATALOGO_PUBLICADO',
    aggregate: { kind: 'normative-catalog', id: data.catalogId, version: 1 },
    data: { ...data },
  });
}

export function packagePublishedEvent(
  scope: NormativeScope,
  data: PackagePublishedData,
  version = 1,
): NormativeEventEnvelope {
  return envelope(scope, {
    type: 'package.published',
    domainEvent: 'PACOTE_MOBILE_PUBLICADO',
    aggregate: { kind: 'normative-package', id: data.packageId, version },
    data: { ...data },
  });
}

export function rowValue(row: NormativeRow, column: string): string | null {
  const value = row[column];
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value.toISOString();
  return String(value);
}
