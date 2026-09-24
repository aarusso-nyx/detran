import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import {
  provideZonelessChangeDetection,
  type ApplicationConfig,
} from '@angular/core';
import { provideRouter, withRouterConfig, type Routes } from '@angular/router';
import { provideDetranAuthenticatedApp } from '@detran/ui';
import { BOAT_PT_BR_CATALOG } from '@detran/boat-mobile';
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import { TenantContextService } from '@stynx-nyx/angular-tenancy';

import catalog from './i18n/teat.pt-BR.json';
import { TEAT_ROUTES } from './app.routes.js';
import {
  DefaultTeatWebRouteContextResolver,
  TEAT_WEB_ROUTE_CONTEXT,
  TEAT_WEB_ROUTE_CONTEXT_RESOLVER,
  TEAT_WEB_SESSION,
  TEAT_WEB_TENANT,
  type TeatWebSession,
} from './core/guards.js';

interface TeatRuntimeConfig {
  readonly tenantId?: string;
  readonly oidcAuthority?: string;
  readonly clientId?: string;
}

const runtimeConfig = (
  globalThis as typeof globalThis & {
    readonly __TEAT_RUNTIME_CONFIG__?: TeatRuntimeConfig;
  }
).__TEAT_RUNTIME_CONFIG__ ?? { tenantId: '', oidcAuthority: '', clientId: '' };

const browserOrigin =
  typeof location === 'undefined' ? 'http://localhost' : location.origin;

function sessionRole(session: StynxSessionService): string | undefined {
  const state = session.state();
  const roles = state.claims?.['roles'];
  if (Array.isArray(roles)) {
    return roles.find((role): role is string => typeof role === 'string');
  }
  const groups = state.claims?.['cognito:groups'];
  return Array.isArray(groups)
    ? groups.find((role): role is string => typeof role === 'string')
    : undefined;
}

function provideSessionContext(session: StynxSessionService): TeatWebSession {
  return {
    get authenticated() {
      return session.active();
    },
    get role() {
      return sessionRole(session);
    },
  };
}

export function createTeatWebAppConfig(routes: Routes): ApplicationConfig {
  return {
    providers: [
      provideZonelessChangeDetection(),
      provideHttpClient(withInterceptorsFromDi()),
      provideRouter(
        routes,
        withRouterConfig({ onSameUrlNavigation: 'reload' }),
      ),
      {
        provide: TEAT_WEB_SESSION,
        useFactory: provideSessionContext,
        deps: [StynxSessionService],
      },
      {
        provide: TEAT_WEB_TENANT,
        useFactory: (tenant: TenantContextService) => ({
          get tenantId() {
            return tenant.tenantId() ?? undefined;
          },
        }),
        deps: [TenantContextService],
      },
      {
        provide: TEAT_WEB_ROUTE_CONTEXT_RESOLVER,
        useExisting: DefaultTeatWebRouteContextResolver,
      },
      {
        provide: TEAT_WEB_ROUTE_CONTEXT,
        useFactory: (
          resolver: {
            readonly state: () => {
              readonly tenantId?: string;
              readonly resolved: boolean;
              readonly available: boolean;
            };
          },
          tenant: TenantContextService,
        ) => ({
          get available() {
            const resolution = resolver.state();
            const currentTenant = tenant.tenantId();
            return (
              resolution.resolved &&
              resolution.available &&
              typeof currentTenant === 'string' &&
              resolution.tenantId === currentTenant
            );
          },
        }),
        deps: [TEAT_WEB_ROUTE_CONTEXT_RESOLVER, TenantContextService],
      },
    ],
  };
}

export const appConfig: ApplicationConfig = createTeatWebAppConfig(TEAT_ROUTES);

export const teatAuthenticatedProvider = provideDetranAuthenticatedApp({
  angular: { apiBaseUrl: '', sessionMode: 'bearer' },
  oidc: {
    oidc: {
      authority: runtimeConfig.oidcAuthority ?? '',
      clientId: runtimeConfig.clientId ?? '',
      redirectUrl: `${browserOrigin}/ux/web/login`,
      postLogoutRedirectUri: browserOrigin,
      responseType: 'code',
      scope: 'openid profile',
    },
    loginRedirectRoute: '/ux/web/login',
    permissionDeniedPath: '/acesso-negado',
  },
  tenancy: {
    defaultTenantResolver: () => runtimeConfig.tenantId || null,
  },
  i18n: {
    defaultLocale: 'pt-BR',
    supportedLocales: ['pt-BR'],
    loadCatalog: async () => ({ ...catalog, ...BOAT_PT_BR_CATALOG }),
  },
});
