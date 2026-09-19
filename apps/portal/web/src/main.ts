// Bootstrap do Portal (plan.md M4/M9/M13; detran-ui-guide.md §1): só `provideDetranAuthenticatedApp`
// (STYNX core + OIDC/sessão + tenancy + i18n pt-BR), `provideHttpClient`, `provideRouter` com
// binding de inputs e o service worker (M14) fora do modo de desenvolvimento. Configuração
// de runtime lida de `public/runtime-config.js` (três chaves, sem segredo).
import { provideHttpClient } from '@angular/common/http';
import { isDevMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import {
  TitleStrategy,
  provideRouter,
  withComponentInputBinding,
} from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { provideDetranAuthenticatedApp } from '@detran/ui';
import { AppComponent } from './app/app.component';
import { PORTAL_ROUTES } from './app/app.routes';
import { readRuntimeConfig } from './app/core/runtime-config';
import { PortalTitleStrategy } from './app/core/title.strategy';

const runtime = readRuntimeConfig();
const origin = window.location.origin;

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideRouter(PORTAL_ROUTES, withComponentInputBinding()),
    provideDetranAuthenticatedApp({
      // Mesma origem: o browser só fala com `/v1/portal/*` (portal-frontends.md §1).
      angular: { apiBaseUrl: '', sessionMode: 'bearer' },
      oidc: {
        oidc: {
          authority: runtime.oidcAuthority,
          clientId: runtime.clientId,
          redirectUrl: `${origin}/auth/callback`,
          postLogoutRedirectUri: `${origin}/`,
        },
        loginRedirectRoute: '/',
      },
      // O `Host` decide o tenant no servidor (contrato §1.5); `tenantId` só semeia a sessão e o
      // header `X-Tenant-Id` que o STYNX envia.
      tenancy: { defaultTenantResolver: () => runtime.tenantId || null },
      i18n: {
        loadCatalog: () =>
          import('./app/i18n/portal.pt-BR.json').then((m) => m.default),
      },
    }),
    provideServiceWorker('ngsw-worker.js', { enabled: !isDevMode() }),
    { provide: TitleStrategy, useClass: PortalTitleStrategy },
  ],
}).catch((error: unknown) => {
  console.error(error);
});
