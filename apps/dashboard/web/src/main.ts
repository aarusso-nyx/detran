// Bootstrap do console (CTG-0002.md §1; detran-ui-guide.md §1): só
// `provideDetranAuthenticatedApp` (STYNX core + OIDC/sessão + tenancy + i18n pt-BR),
// `provideHttpClient` com o interceptor de frescor, `provideRouter` com binding de inputs e a
// estratégia de título. Sem service worker (console interno não é PWA) e sem provider de
// autenticação/tenant fora do bootstrap do kit.
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import {
  TitleStrategy,
  provideRouter,
  withComponentInputBinding,
} from '@angular/router';
import { provideDetranAuthenticatedApp } from '@detran/ui';
import { AppComponent } from './app/app.component';
import { DASHBOARD_ROUTES } from './app/app.routes';
import { LOGIN_ROUTE } from './app/core/guards/auth.guard';
import { freshnessInterceptor } from './app/core/interceptors/freshness.interceptor';
import { readRuntimeConfig } from './app/core/runtime-config';
import { DashboardTitleStrategy } from './app/core/title.strategy';

const runtime = readRuntimeConfig();
const origin = window.location.origin;

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptors([freshnessInterceptor])),
    provideRouter(DASHBOARD_ROUTES, withComponentInputBinding()),
    provideDetranAuthenticatedApp({
      // Mesma origem: o browser só fala com `/v1/dashboard/*` (contrato §1 regra 1).
      angular: { apiBaseUrl: '', sessionMode: 'bearer' },
      oidc: {
        oidc: {
          authority: runtime.oidcAuthority,
          clientId: runtime.clientId,
          redirectUrl: `${origin}/monitoramento/auth/callback`,
          postLogoutRedirectUri: `${origin}/monitoramento`,
        },
        loginRedirectRoute: LOGIN_ROUTE,
      },
      tenancy: { defaultTenantResolver: () => runtime.tenantId || null },
      i18n: {
        loadCatalog: () =>
          import('./app/i18n/dashboard.pt-BR.json').then((m) => m.default),
      },
    }),
    { provide: TitleStrategy, useClass: DashboardTitleStrategy },
  ],
}).catch((error: unknown) => {
  throw error;
});
