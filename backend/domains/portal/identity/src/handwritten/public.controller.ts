// Rotas públicas do Portal (work/rounds/R-0009/contracts/CTG-0001.md §8 e §9;
// portal-route-contract.md §2; plan R-0009 M11, M12). Classe inteira
// `@Public()`: sem `@Resource`/`@Action`, sem sessão. O tenant vem da
// resolução pelo Host/`X-Tenant-Id` feita pelo app (detran-runtime.ts §9) e
// chega pelo `RequestContext`; a transação é `Database.tx({ role: 'app' })`
// (nunca owner — ADR-0002): `brand_profile` não tem RLS por desenho (M11) e
// `service_catalog` é lida sob RLS com `app.tenant_id` do contexto.
import { Controller, Get, Param } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import { Public } from '@detran/shared';

import { PortalError } from './errors.js';
import type { PortalRequiredAssurance } from './identity.service.js';

export interface PortalBrandResponse {
  displayName: string;
  shortName: string;
  legalName: string;
  primaryColor: string;
  supportUrl: string | null;
  privacyUrl: string | null;
  accessibilityUrl: string | null;
  serviceContact: string | null;
  locale: string;
  timeZone: string;
}

export type PortalServiceAvailability =
  'available' | 'partially_available' | 'unavailable';

export interface PortalServiceResponse {
  serviceKey: string;
  route: string;
  category: string;
  title: string;
  summary: string;
  requirements: string[];
  deliveryChannel: string;
  legalDeadline: string;
  cost: string;
  accessibilityNote: string;
  responsibleParty: string;
  normativeReference: string;
  availability: PortalServiceAvailability;
  /** Só presente quando `availability = 'unavailable'` (§8). */
  unavailableReason?: string;
  alternativeChannelNote: string | null;
  minimumAssurance: PortalRequiredAssurance;
  version: number;
  effectiveFrom: string;
}

interface BrandRow extends Record<string, unknown> {
  display_name: string;
  short_name: string;
  legal_name: string;
  primary_color: string;
  support_url: string | null;
  privacy_url: string | null;
  accessibility_url: string | null;
  service_contact: string | null;
  locale: string;
  time_zone: string;
}

interface ServiceRow extends Record<string, unknown> {
  service_key: string;
  route: string;
  category: string;
  title: string;
  summary: string;
  requirements_json: unknown;
  delivery_channel: string;
  legal_deadline: string;
  cost: string;
  accessibility_note: string;
  responsible_party: string;
  normative_reference: string;
  availability: PortalServiceAvailability;
  unavailable_reason: string | null;
  alternative_channel_note: string | null;
  minimum_assurance: PortalRequiredAssurance;
  version: number;
  effective_from: string;
}

/** As 10 colunas de `GET brand` (DDL manuscrito 19-portal-platform.sql). */
const BRAND_SQL = `select display_name, short_name, legal_name, primary_color,
          support_url, privacy_url, accessibility_url, service_contact,
          locale, time_zone
     from portal.brand_profile
    where tenant_id = $1`;

const SERVICE_COLUMNS = `service_key, route, category, title, summary,
          requirements_json, delivery_channel, legal_deadline, cost,
          accessibility_note, responsible_party, normative_reference,
          availability, unavailable_reason, alternative_channel_note,
          minimum_assurance, version,
          to_char(effective_from, 'YYYY-MM-DD') as effective_from`;

/** RLS é a última linha, não a primeira (CODESTYLE): `tenant_id` explícito. */
const SERVICES_SQL = `select ${SERVICE_COLUMNS}
     from portal.service_catalog
    where tenant_id = $1
    order by category asc, service_key asc`;

const SERVICE_SQL = `select ${SERVICE_COLUMNS}
     from portal.service_catalog
    where tenant_id = $1 and service_key = $2
    limit 1`;

function brandOf(row: BrandRow): PortalBrandResponse {
  return {
    displayName: row.display_name,
    shortName: row.short_name,
    legalName: row.legal_name,
    primaryColor: row.primary_color,
    supportUrl: row.support_url,
    privacyUrl: row.privacy_url,
    accessibilityUrl: row.accessibility_url,
    serviceContact: row.service_contact,
    locale: row.locale,
    timeZone: row.time_zone,
  };
}

function serviceOf(row: ServiceRow): PortalServiceResponse {
  return {
    serviceKey: row.service_key,
    route: row.route,
    category: row.category,
    title: row.title,
    summary: row.summary,
    requirements: Array.isArray(row.requirements_json)
      ? row.requirements_json.filter(
          (item): item is string => typeof item === 'string',
        )
      : [],
    deliveryChannel: row.delivery_channel,
    legalDeadline: row.legal_deadline,
    cost: row.cost,
    accessibilityNote: row.accessibility_note,
    responsibleParty: row.responsible_party,
    normativeReference: row.normative_reference,
    availability: row.availability,
    ...(row.availability === 'unavailable' && row.unavailable_reason !== null
      ? { unavailableReason: row.unavailable_reason }
      : {}),
    alternativeChannelNote: row.alternative_channel_note,
    minimumAssurance: row.minimum_assurance,
    version: row.version,
    effectiveFrom: row.effective_from,
  };
}

@Controller('v1/portal')
@Public()
export class PortalPublicController {
  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}

  @Get('brand')
  brand(): Promise<PortalBrandResponse> {
    return this.read(async (tx, tenantId) => {
      const result = await tx.query<BrandRow>(BRAND_SQL, [tenantId]);
      const row = result.rows[0];
      if (!row) {
        throw new PortalError('PORTAL.NOT_FOUND', {
          status: 404,
          context: { kind: 'brand' },
        });
      }
      return brandOf(row);
    });
  }

  @Get('services')
  services(): Promise<PortalServiceResponse[]> {
    return this.read(async (tx, tenantId) => {
      const result = await tx.query<ServiceRow>(SERVICES_SQL, [tenantId]);
      return result.rows.map(serviceOf);
    });
  }

  /** `serviceKey` comparado literalmente, sem normalização de caixa (§8). */
  @Get('services/:serviceKey')
  service(
    @Param('serviceKey') serviceKey: string,
  ): Promise<PortalServiceResponse> {
    return this.read(async (tx, tenantId) => {
      const result = await tx.query<ServiceRow>(SERVICE_SQL, [
        tenantId,
        serviceKey,
      ]);
      const row = result.rows[0];
      if (!row) {
        throw new PortalError('PORTAL.NOT_FOUND', {
          status: 404,
          context: { kind: 'service' },
        });
      }
      return serviceOf(row);
    });
  }

  /**
   * Tenant resolvido pelo app (§9) e semeado no `RequestContext`; ausência
   * aqui é defeito de wiring (a resolução já respondeu 421/403 antes).
   */
  private read<T>(
    work: (tx: Transaction, tenantId: string) => Promise<T>,
  ): Promise<T> {
    const tenantId = this.requestContext.hasActiveContext()
      ? this.requestContext.snapshot().tenantId
      : undefined;
    if (!tenantId) {
      throw new PortalError('PORTAL.INTERNAL', { status: 500, context: {} });
    }
    return this.database.tx((tx) => work(tx, tenantId), {
      role: 'app',
      readonly: true,
    });
  }
}
