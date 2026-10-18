// Composição do modo prévia (R-0033 TASK-0003; `frontend-preview-mode.md` §1, §2, §4, D-13, D-16;
// P-17). A mesma configuração de `src/main.ts`, com estas diferenças e nenhuma outra:
//
// 1. `provideHttpClient(withInterceptors([previewHttpBlockInterceptor]), withInterceptorsFromDi())`
//    — o bloqueio de rede é o PRIMEIRO interceptor da cadeia (antes dos interceptors de DI que o kit
//    registra: request-id, bearer, erro, tenant); só `GET assets/**` passa.
// 2. `i18n.loadCatalog` = catálogo do app sobreposto por `preview.pt-BR.json` (D-13: interseção de
//    chaves vazia), os dois JSON importados estaticamente (sem `fetch`).
// 3. Substituições (fronteira M2): `StynxSessionService`, `RaitSessionFacade`, `RaitClock`,
//    `RaitStreamTransport` e os 8 clientes de `data/api` — mais `STYNX_AUTH_PROVIDER` = `null`
//    (D-16, abaixo). Facades e páginas NUNCA são fornecidas aqui; `RaitHttp` fica inalcançável
//    porque todo `list*`/`get*` é sobrescrito.
//
// Kit 1.4.0 (verificado nas declarações e no `fesm2022`): `provideStynxAuth` registra
// `provideAuth` do `angular-auth-oidc-client` SEM `withAppInitializerAuthCheck` — nenhum
// inicializador dispara OIDC no bootstrap; o único `APP_INITIALIZER` além do i18n é o da tenancy
// (resolve o tenant da URL, sem rede). A sessão sintética nunca chama `loginRedirect`.
import {
  provideHttpClient,
  withInterceptors,
  withInterceptorsFromDi,
} from '@angular/common/http';
import {
  DOCUMENT,
  inject,
  provideEnvironmentInitializer,
  type EnvironmentProviders,
  type Provider,
} from '@angular/core';
import {
  TitleStrategy,
  provideRouter,
  withComponentInputBinding,
} from '@angular/router';
import { provideDetranAuthenticatedApp } from '@detran/ui';
import { STYNX_AUTH_PROVIDER } from '@stynx-nyx/angular';
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import { RAIT_ROUTES } from '../app.routes';
import { LOGIN_ROUTE } from '../core/guards/auth.guard';
import { readRuntimeConfig } from '../core/runtime-config';
import { RaitSessionFacade } from '../core/session.facade';
import { RaitShellSearch } from '../core/shell-search';
import { RaitStreamTransport } from '../core/stream-transport';
import { RaitTitleStrategy } from '../core/title.strategy';
import { CaseClient } from '../data/api/case.client';
import { CollectionClient } from '../data/api/collection.client';
import { InfractionClient } from '../data/api/infraction.client';
import { IntegrationClient } from '../data/api/integration.client';
import { NotificationClient } from '../data/api/notification.client';
import { OrgClient } from '../data/api/org.client';
import { SessionClient } from '../data/api/session.client';
import { WorklistClient } from '../data/api/worklist.client';
import { RaitClock } from '../data/clock';
import { CaseShellSearch } from '../data/shell-search/case-shell-search';
import appCatalog from '../i18n/rait.pt-BR.json';
import { PreviewCaseClient } from './adapters/preview-case.client';
import { PreviewCollectionClient } from './adapters/preview-collection.client';
import { PreviewInfractionClient } from './adapters/preview-infraction.client';
import { PreviewIntegrationClient } from './adapters/preview-integration.client';
import { PreviewNotificationClient } from './adapters/preview-notification.client';
import { PreviewOrgClient } from './adapters/preview-org.client';
import { PreviewSessionClient } from './adapters/preview-session.client';
import { PreviewWorklistClient } from './adapters/preview-worklist.client';
import { PreviewClock } from './preview-clock';
import { previewHttpBlockInterceptor } from './preview-http-block.interceptor';
import {
  PreviewSessionFacade,
  PreviewStynxSessionService,
} from './preview-session';
import { PreviewStreamTransport } from './preview-stream-transport';
import previewOverlay from './preview.pt-BR.json';

/** D-13: `{ ...catálogoDoApp, ...preview.pt-BR.json }`. */
function previewCatalog(): Record<string, string> {
  return { ...appCatalog, ...previewOverlay };
}

/**
 * TASK-0006 (contrato §1 item 2, "rede bloqueada"): sem `<link rel="icon">` o navegador pede
 * `/favicon.ico` por conta própria — requisição fora de `GET assets/**`, que o interceptor não vê,
 * responde 404 e aparece como `console.error` em toda primeira carga (`capture.mjs` a trata como
 * violação). A prévia declara um ícone vazio `data:,` (nenhuma requisição) antes do `load`; só
 * quando o documento não declara ícone algum. `src/index.html` e o bundle `production` não mudam.
 */
function declareEmptyFavicon(): void {
  const document = inject(DOCUMENT);
  if (document.head.querySelector('link[rel~="icon"]') !== null) return;
  const link = document.createElement('link');
  link.rel = 'icon';
  link.href = 'data:,';
  document.head.appendChild(link);
}

export function providePreviewMode(): Array<Provider | EnvironmentProviders> {
  const runtime = readRuntimeConfig();
  const origin = window.location.origin;
  return [
    provideHttpClient(
      withInterceptors([previewHttpBlockInterceptor]),
      withInterceptorsFromDi(),
    ),
    provideRouter(RAIT_ROUTES, withComponentInputBinding()),
    provideDetranAuthenticatedApp({
      // Igual a `src/main.ts`; na prévia o interceptor bloqueia `/v1/**` antes de qualquer envio.
      angular: { apiBaseUrl: '', sessionMode: 'bearer' },
      oidc: {
        oidc: {
          authority: runtime.oidcAuthority,
          clientId: runtime.clientId,
          redirectUrl: `${origin}${LOGIN_ROUTE}`,
          postLogoutRedirectUri: `${origin}/`,
        },
        loginRedirectRoute: LOGIN_ROUTE,
      },
      tenancy: { defaultTenantResolver: () => runtime.tenantId || null },
      i18n: {
        loadCatalog: () => Promise.resolve(previewCatalog()),
      },
    }),
    { provide: TitleStrategy, useClass: RaitTitleStrategy },
    { provide: RaitShellSearch, useClass: CaseShellSearch },
    // Fronteira de substituição (M2).
    { provide: StynxSessionService, useClass: PreviewStynxSessionService },
    // D-16: a sessão sintética não tem token. Com `STYNX_AUTH_PROVIDER` = a sessão, o
    // `AuthInterceptor` do kit adia TODA requisição por `Promise.resolve(getAccessToken())` — o
    // `GET assets/**` permitido deixaria de chegar ao backend de forma síncrona (P-05). Sem
    // provedor, o interceptor do kit repassa a requisição sem `Authorization` (o mesmo efeito de
    // um token `null`). Único uso do token no kit 1.4.0: `AuthInterceptor`.
    { provide: STYNX_AUTH_PROVIDER, useValue: null },
    { provide: RaitSessionFacade, useClass: PreviewSessionFacade },
    { provide: RaitClock, useClass: PreviewClock },
    { provide: RaitStreamTransport, useClass: PreviewStreamTransport },
    { provide: CaseClient, useClass: PreviewCaseClient },
    { provide: WorklistClient, useClass: PreviewWorklistClient },
    { provide: SessionClient, useClass: PreviewSessionClient },
    { provide: OrgClient, useClass: PreviewOrgClient },
    { provide: InfractionClient, useClass: PreviewInfractionClient },
    { provide: IntegrationClient, useClass: PreviewIntegrationClient },
    { provide: NotificationClient, useClass: PreviewNotificationClient },
    { provide: CollectionClient, useClass: PreviewCollectionClient },
    provideEnvironmentInitializer(declareEmptyFavicon),
  ];
}
