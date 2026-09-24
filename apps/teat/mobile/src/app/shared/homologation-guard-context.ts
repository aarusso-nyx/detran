/** Explicit, in-memory UI scenario. It is never a field authority grant. */
import { inject, type Provider } from '@angular/core';
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import { STYNX_I18N_OPTIONS, StynxI18nService } from '@stynx-nyx/angular-i18n';
import { TenantContextService } from '@stynx-nyx/angular-tenancy';

import type {
  BootstrapSnapshot,
  GuardContext,
  ProvisioningReadiness,
} from '../core/bootstrap.store.js';
import catalog from '../i18n/teat.pt-BR.json';
import { TEAT_MOBILE_HOMOLOGATION_PERSONA } from './homologation-persona.port.js';
import { TEAT_MOBILE_HOMOLOGATION_SHIFT } from './homologation-shift.port.js';

const TENANT_ID = 'homologation-demo-tenant';
const AGENT_ID = 'homologation-demo-agent';
const DEVICE_ID = 'homologation-demo-device';
const ROLES = ['field-agent'] as const;

export function createHomologationGuardContext(): GuardContext {
  const persona = inject(TEAT_MOBILE_HOMOLOGATION_PERSONA, { optional: true });
  const shift = inject(TEAT_MOBILE_HOMOLOGATION_SHIFT, { optional: true });
  const now = new Date();
  const capturedAt = now.toISOString();
  const validUntil = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
  const bootstrap: BootstrapSnapshot = {
    protocolVersion: 'demo-1',
    requestedProtocolVersion: 'demo-1',
    snapshot: {
      capturedAt,
      validUntil,
      maxAgeSeconds: 3600,
      authority: { kind: 'homologation-only' },
    },
    context: {
      tenantId: TENANT_ID,
      trafficAgencyId: 'homologation-demo-agency',
      agent: {
        id: AGENT_ID,
        operationalUnitId: 'homologation-demo-unit',
        status: 'active',
      },
      device: {
        id: DEVICE_ID,
        status: 'authorized',
        homologated: true,
        tamperDetected: false,
        appVersion: 'homologation',
      },
      activeShift: { id: 'homologation-demo-shift', status: 'open' },
      session: {
        id: 'homologation-demo-session',
        startedAt: capturedAt,
        exclusive: true,
      },
    },
    catalog: {
      operationalUnits: [],
      teams: [],
      patrolVehicles: [],
      operations: [],
      measurementInstruments: [],
    },
    normativePackage: {
      id: 'homologation-demo-package',
      catalogId: 'homologation-demo-catalog',
      version: 'demo-1',
      manifestHash: 'homologation-demo-not-a-signature',
      status: 'demonstration',
      publishedAt: capturedAt,
      validUntil,
    },
    numberingReservations: [{ id: 'homologation-demo-reservation' }],
    readiness: { preShiftReady: true, offlineReady: true, blockers: [] },
    capabilities: {
      canOpenShift: true,
      canOperateOffline: true,
      canReserveNumbering: true,
    },
  };
  const provisioning: ProvisioningReadiness = {
    device_id: DEVICE_ID,
    ready: true,
    remaining_acts: 1,
    remaining_numbering_count: 1,
    blockers: [],
    evaluated_at: capturedAt,
  };
  return {
    principal: () => ({ id: AGENT_ID, roles: [persona?.role() ?? ROLES[0]] }),
    tenantId: () => TENANT_ID,
    allowedRoles: () => [persona?.role() ?? ROLES[0]],
    bootstrap: () =>
      shift?.phase() === 'pre-shift'
        ? {
            ...bootstrap,
            context: { ...bootstrap.context, activeShift: null, session: null },
            numberingReservations: [],
            readiness: {
              preShiftReady: true,
              offlineReady: false,
              blockers: ['NUMBERING_RESERVATION_REQUIRED', 'SHIFT_NOT_OPEN'],
            },
            capabilities: {
              canOpenShift: true,
              canOperateOffline: false,
              canReserveNumbering: false,
            },
          }
        : bootstrap,
    provisioning: () => provisioning,
  };
}

export function provideTeatMobileHomologationSession(): readonly Provider[] {
  return [
    {
      provide: StynxSessionService,
      useFactory: () => {
        const persona = inject(TEAT_MOBILE_HOMOLOGATION_PERSONA, {
          optional: true,
        });
        return {
          active: () => true,
          state: () => ({
            active: true,
            claims: { sub: AGENT_ID, roles: [persona?.role() ?? ROLES[0]] },
          }),
          login: async () => undefined,
          completeLogin: async () => ({ tenantId: TENANT_ID }),
          logout: async () => undefined,
        };
      },
    },
    {
      provide: TenantContextService,
      useValue: { tenantId: () => TENANT_ID },
    },
    {
      provide: STYNX_I18N_OPTIONS,
      useValue: { defaultLocale: 'pt-BR', loadCatalog: async () => catalog },
    },
    StynxI18nService,
  ];
}
