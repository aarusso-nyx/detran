// Bootstrap do console RAIT (spec §1 "Bootstrap"; detran-ui-guide.md §1; plan.md M1; contrato
// CTG-0002a §1/§4): só `provideDetranAuthenticatedApp` (STYNX core + OIDC/sessão + tenancy +
// i18n pt-BR), `provideHttpClient`, `provideRouter` com binding de inputs e a `TitleStrategy`
// do app. Sem service worker (o console é interno; spec §8 "offline não suportado").
// Configuração de runtime lida de `public/runtime-config.js` (três chaves, sem segredo).
import { provideHttpClient } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import {
  TitleStrategy,
  provideRouter,
  withComponentInputBinding,
} from '@angular/router';
import { provideDetranAuthenticatedApp } from '@detran/ui';
import { AppComponent } from './app/app.component';
import { RAIT_ROUTES } from './app/app.routes';
import { LOGIN_ROUTE } from './app/core/guards/auth.guard';
import { readRuntimeConfig } from './app/core/runtime-config';
import { RaitShellSearch } from './app/core/shell-search';
import { RaitTitleStrategy } from './app/core/title.strategy';
import { CaseShellSearch } from './app/data/shell-search/case-shell-search';

const runtime = readRuntimeConfig();
const origin = window.location.origin;

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideRouter(RAIT_ROUTES, withComponentInputBinding()),
    provideDetranAuthenticatedApp({
      // Mesma origem: o browser só fala com `/v1/inf/rait/*` (spec §1; ADR-0003).
      angular: { apiBaseUrl: '', sessionMode: 'bearer' },
      oidc: {
        oidc: {
          authority: runtime.oidcAuthority,
          clientId: runtime.clientId,
          redirectUrl: `${origin}${LOGIN_ROUTE}`,
          postLogoutRedirectUri: `${origin}/`,
        },
        // A2/OD-R12-006: `/auth/callback` inicia o OIDC sem `code`/`state` e o conclui com eles.
        loginRedirectRoute: LOGIN_ROUTE,
      },
      // O `Host` decide o tenant no servidor (ADR-0002/0005); `tenantId` só semeia a sessão e o
      // header `X-Tenant-Id` que o STYNX envia (OD-R12-009).
      tenancy: { defaultTenantResolver: () => runtime.tenantId || null },
      i18n: {
        loadCatalog: () =>
          import('./app/i18n/rait.pt-BR.json').then((m) => m.default),
      },
    }),
    { provide: TitleStrategy, useClass: RaitTitleStrategy },
    // Busca do shell por protocolo via `CaseClient` (contrato CTG-0002b §3.6; OD-R12-030 b).
    { provide: RaitShellSearch, useClass: CaseShellSearch },
  ],
}).catch((error: unknown) => {
  console.error(error);
});
