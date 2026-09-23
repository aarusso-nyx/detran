import type { Route } from '@angular/router';

import {
  CONTEXTUAL_PRODUCT_GUARDS,
  EXPLICIT_OPERATIONAL_GUARDS,
  EXPLICIT_PRODUCT_GUARDS,
  PRODUCT_GUARDS,
} from '../core/guards.js';
import type { TeatWebRole } from '../core/roles.js';
import { BoatExtensionOutletComponent } from '../shared/boat-extension-outlet.component.js';
import { ProductPageComponent } from '../shared/product-page.component.js';

export interface ProductRouteContract {
  readonly path: string;
  readonly sheet: string;
  readonly uxCode: string;
  readonly allowedRoles: readonly TeatWebRole[];
  readonly titleKey: string;
  readonly module: string;
  readonly client: string;
  readonly page: string;
  readonly contextual?: boolean;
  readonly sse?: boolean;
  readonly boat?: boolean;
  readonly explicitGuards?: boolean;
}

export const consumedEvents = [
  'ait.changed',
  'ait.concurrency-suspected',
  'sync.batch.received',
  'sync.conflict.opened',
  'sync.conflict.resolved',
  'numbering.reservation.changed',
  'device.posture-changed',
  'package.published',
  'integration.item.changed',
  'evidence.access-request.changed',
] as const;

const AIT_EVENTS = consumedEvents.filter((topic) => topic.startsWith('ait.'));

export function productRoute(contract: ProductRouteContract): Route {
  return {
    path: contract.path,
    loadComponent: async () =>
      contract.boat ? BoatExtensionOutletComponent : ProductPageComponent,
    canMatch: [
      ...(contract.explicitGuards
        ? EXPLICIT_PRODUCT_GUARDS
        : contract.contextual
          ? CONTEXTUAL_PRODUCT_GUARDS
          : PRODUCT_GUARDS),
    ],
    data: {
      sheet: contract.sheet,
      uxCode: contract.uxCode,
      allowedRoles: contract.allowedRoles,
      titleKey: contract.titleKey,
      module: contract.module,
      client: contract.client,
      page: contract.page,
      sse: contract.sse === true,
      extension: contract.boat === true ? 'BOAT' : undefined,
      sseDeniedReason:
        contract.boat === true && contract.sse === true
          ? 'source_pending'
          : undefined,
      endpoint: endpointFor(contract),
      runtimeClient: runtimeClientFor(contract),
      sseTopics:
        contract.sse === true && contract.boat !== true
          ? contract.client === 'ait'
            ? AIT_EVENTS
            : consumedEvents
          : undefined,
    },
  };
}

export function operationalRoute(
  path: string,
  allowedRoles: readonly TeatWebRole[],
  titleKey: string,
): Route {
  return {
    path,
    loadComponent: async () => ProductPageComponent,
    canMatch: [...EXPLICIT_OPERATIONAL_GUARDS],
    data: { allowedRoles, titleKey, module: 'core' },
  };
}

function endpointFor(contract: ProductRouteContract): string | undefined {
  if (contract.boat === true || contract.path === 'login') return undefined;
  return {
    entry: '/v1/dashboard/alerts',
    operations: '/v1/ops/field/operations',
    fiscalizacao: '/v1/inf/ait/aits',
    measures: '/v1/inf/measures/administrative-measures',
    alcohol: '/v1/inf/alcohol/procedures',
    evidence: '/v1/ops/evidence/evidence',
    audit: '/v1/audit/events',
    bi: '/v1/dashboard/bi-panels',
    admin: '/v1/ops/agency/units',
    normative: '/v1/inf/normative/catalogs',
    technical: '/v1/ops/integrations/outbox',
  }[contract.module];
}

function runtimeClientFor(contract: ProductRouteContract): string | undefined {
  if (contract.boat === true || contract.path === 'login') return undefined;
  return {
    entry: 'dashboard',
    operations: 'ops',
    fiscalizacao: 'ait',
    measures: 'measures',
    alcohol: 'alcohol',
    evidence: 'evidence',
    audit: 'kernel STYNX',
    bi: 'dashboard',
    admin: 'agency',
    normative: 'normative',
    technical: 'integrations',
  }[contract.module];
}
