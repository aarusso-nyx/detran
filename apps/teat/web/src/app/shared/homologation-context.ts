/** In-memory-only identity and data for the explicit UI homologation entry. */
import { inject, type Provider } from '@angular/core';
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import { STYNX_I18N_OPTIONS, StynxI18nService } from '@stynx-nyx/angular-i18n';
import { TenantContextService } from '@stynx-nyx/angular-tenancy';
import { of, throwError } from 'rxjs';

import catalog from '../i18n/teat.pt-BR.json';
import { WebClientRegistry } from '../data/web-client.registry.js';
import {
  createTeatWebHomologationPersona,
  TEAT_WEB_HOMOLOGATION_PERSONA,
} from './homologation-persona.port.js';
import { TEAT_WEB_HOMOLOGATION_SCENARIO } from './homologation-scenario.port.js';
import { createTeatWebHomologationScenario } from './homologation-scenario.port.js';
import {
  createTeatWebHomologationAitAccept,
  TEAT_WEB_HOMOLOGATION_AIT_ACCEPT,
} from './homologation-ait-accept.port.js';

const TENANT_ID = 'homologation-demo-tenant';

const MODULE_BY_RESOURCE: Readonly<Record<string, string>> = {
  'dashboard:/v1/dashboard/alerts': 'entry',
  'ops:/v1/ops/field/operations': 'operations',
  'ait:/v1/inf/ait/aits': 'fiscalizacao',
  'measures:/v1/inf/measures/administrative-measures': 'measures',
  'alcohol:/v1/inf/alcohol/procedures': 'alcohol',
  'evidence:/v1/ops/evidence/evidence': 'evidence',
  'kernel STYNX:/v1/audit/events': 'audit',
  'dashboard:/v1/dashboard/bi-panels': 'bi',
  'agency:/v1/ops/agency/units': 'admin',
  'normative:/v1/inf/normative/catalogs': 'normative',
  'integrations:/v1/ops/integrations/outbox': 'technical',
};

export function provideTeatWebHomologationContext(): readonly Provider[] {
  return [
    {
      provide: TEAT_WEB_HOMOLOGATION_SCENARIO,
      useFactory: createTeatWebHomologationScenario,
    },
    {
      provide: TEAT_WEB_HOMOLOGATION_AIT_ACCEPT,
      useFactory: createTeatWebHomologationAitAccept,
    },
    {
      provide: TEAT_WEB_HOMOLOGATION_PERSONA,
      useFactory: createTeatWebHomologationPersona,
    },
    {
      provide: StynxSessionService,
      useFactory: () => {
        const persona = inject(TEAT_WEB_HOMOLOGATION_PERSONA);
        return {
          active: () => true,
          roles: () => [persona.role()],
          hasAnyRole: (allowed: readonly string[]) =>
            allowed.includes(persona.role()),
          state: () => ({
            active: true,
            claims: {
              sub: 'homologation-demo-operator',
              roles: [persona.role()],
            },
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
    {
      provide: WebClientRegistry,
      useFactory: () => {
        const scenario = inject(TEAT_WEB_HOMOLOGATION_SCENARIO, {
          optional: true,
        });
        return {
          query: (client: string, endpoint: string) => {
            const module = MODULE_BY_RESOURCE[`${client}:${endpoint}`];
            if (module === undefined) {
              return throwError(
                () => new Error('web-homologation-resource-unknown'),
              );
            }
            if (scenario?.mode() === 'error') {
              return throwError(
                () => new Error('web-homologation-simulated-error'),
              );
            }
            if (scenario?.mode() === 'empty') return of([]);
            return of([
              {
                id: `homologation-demo-${module}`,
                tenant_id: TENANT_ID,
                version: 1,
                current_status: 'VALIDANDO',
                ait_number: 'SIMULADO-SEM-VALOR-LEGAL',
                demo_module: module,
                demo_endpoint: endpoint,
                demo_notice: 'HOMOLOGAÇÃO — SIMULADO',
              },
            ]);
          },
        };
      },
    },
  ];
}
