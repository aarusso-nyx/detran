---
id: ARCH-DETRAN-UI-GUIDE
title: Guia de uso do @detran/ui sobre STYNX 1.3.1 (Angular 22) para o console RAIT
status: draft
apps: [rait, teat, portal, dashboard]
updated: 2026-09-13
---

# Guia do kit `@detran/ui`

O kit (`packages/ui`, ADR-0006) é uma camada fina sobre os pacotes Angular do STYNX. Este guia
diz **o que existe, como usar e o que não reimplementar**. A API abaixo é a do código atual de
`packages/ui/src/lib/`; a recompilação para Angular 22 / STYNX 1.3.1 acontece em WP-0 sem
mudança de assinatura.

## 1. Bootstrap

```ts
// apps/rait/web/src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideDetranAuthenticatedApp } from '@detran/ui';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { environment } from './environments/environment';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideRouter(routes, withComponentInputBinding()),
    provideDetranAuthenticatedApp({
      angular: { apiBaseUrl: environment.apiBaseUrl, defaultLocale: 'pt-BR' },
      oidc: {
        oidc: {
          authority: environment.oidcAuthority,
          clientId: environment.oidcClientId,
        },
      },
      tenancy: { headerName: 'X-Tenant-Id', persistSelection: true },
      i18n: {
        loadCatalog: () =>
          import('../i18n/rait.pt-BR.json').then((m) => m.default),
      },
    }),
  ],
});
```

`provideDetranAuthenticatedApp` compõe `provideStynxDefaults` (base URL, interceptors de auth,
request-id, tenant e erro), `provideStynxAuth` (OIDC Cognito, sessão, `authGuard`,
`permissionGuard`) e `StynxI18nModule.forRoot` (pt-BR único). Nunca registre esses providers por
fora. Importe `@detran/ui/styles` uma vez no `styles.css` da aplicação.

## 2. O que o kit exporta

| Export                                                                                                                                                                                                     | Uso                                                                                                                                                                                                            |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DetranAppShellComponent` (`detran-app-shell`)                                                                                                                                                             | shell com topbar, sidenav e `router-outlet`; inputs `applicationName`, `homeLink`, `navigation: DetranNavItem[]`; slots `[detran-topbar-actions]`, `[detran-sidenav-footer]`; já monta `stynx-toast-container` |
| `DetranBreadcrumbsComponent`                                                                                                                                                                               | `items: DetranBreadcrumb[]` gerados do `title` das rotas                                                                                                                                                       |
| `DetranEmptyStateComponent`, `DetranLoadingStateComponent`, `DetranErrorStateComponent`                                                                                                                    | estados vazio/carregando/erro em pt-BR; `DetranErrorStateComponent` é o alvo do `ErrorBoundary`                                                                                                                |
| `DETRAN_THEME_TOKENS`, `setDetranTheme('light'                                                                                                                                                             | 'dark')`                                                                                                                                                                                                       | tema via `data-detran-theme`; persistência é do app (`localStorage`) |
| re-exports STYNX UI: `StynxTableComponent`, `StynxPaginationComponent`, `StynxToastContainerComponent`, `StynxToastService`, `StynxBannerComponent`, `StynxLoadingSpinnerComponent`, `EmptyStateComponent` | primitivos; não reimplementar                                                                                                                                                                                  |
| re-exports i18n: `StynxTranslatePipe`, `StynxI18nService`, `StynxIntlDatePipe`, `StynxIntlNumberPipe`, `StynxIntlCurrencyPipe`, tipos `StynxCatalog`, `StynxI18nModuleOptions`                             | todo texto e formatação                                                                                                                                                                                        |

Guardas e diretivas do STYNX usadas diretamente no app: `authGuard`, `permissionGuard('inf:rait-case:read')`,
`*hasPermission="'inf:rait-decision:sign'"` (de `@stynx-nyx/angular-auth`);
`TenantContextService` (`@stynx-nyx/angular-tenancy`); `ErrorBannerService`, `ToastService`
(`@stynx-nyx/angular`). As permissões do principal são as chaves `inf:rait-*:*` de `policy.ts`
(`permissionsForRoles`), então `permissionGuard` e `*hasPermission` usam **as mesmas chaves do
backend**, sem tabela paralela no frontend.

## 3. Padrões de tela do RAIT

1. **Lista**: `StynxTableComponent` com colunas tipadas, `pageSize` ≤ 50, `StynxPaginationComponent`
   ligado à URL (`?q=&ordem=&filtro=&pagina=`); ordem vem do backend; linha ativa com atalhos `j/k`.
2. **Detalhe com abas** (`/casos/:id`): layout com `CaseHeader` fixo + `router-outlet` filho; cada aba
   é rota lazy com resolver próprio.
3. **Ação com efeito jurídico**: `StynxConfirmDialogComponent` (de `@stynx-nyx/angular-ui`) com a
   frase do efeito ("Ao admitir, o efeito suspensivo é instaurado") e a base legal
   (`LegalBasisTooltip`); o botão só existe se `*hasPermission` for verdadeiro.
4. **Erro**: nunca `alert`; `ErrorBoundary` mapeia `StynxError.code` → `messageKey` → texto; 409/412
   recarregam a facade; 422 abre diálogo; 403 remove a ação.
5. **Feedback**: `StynxToastService.success/error/info` com texto do catálogo i18n.
6. **Tema**: componentes usam só as variáveis `--detran-*` e `--stynx-*` de `styles/index.css`;
   nada de cor literal; risco codificado por ícone + texto + cor.
7. **Formulários**: `ReactiveFormsModule` + schema zod do WP-E; erro de forma inline sob o campo;
   `aria-describedby` apontando à mensagem.

## 4. O que não fazer

- Não importar `@stynx-nyx/*` que o kit não reexporta sem registrar no guia (evita divergência de
  versão); exceções permitidas: `angular-auth` (guards/diretiva), `angular-tenancy`, `angular`
  (serviços).
- Não criar componentes de tabela, paginação, toast, banner, spinner ou empty-state.
- Não usar `HttpClient` direto nas páginas: só clientes gerados via facade.
- Não persistir tenant, sessão ou tema fora do que o STYNX/kit já persiste.
- Não usar `zone.js` APIs nem `NgZone`; o app segue o modo de detecção que o STYNX 1.3.1
  configura (ver `wp0-stynx-1-3-1-migration.md`).

## 5. Testes de componente

`vitest` + `jsdom` (como `packages/ui/test/detran-ui.spec.ts`), `TestBed` com
`provideDetranAuthenticatedApp` substituído por providers de teste (`provideStynxDefaults` com
`apiBaseUrl` fictício, `SessionService` stub com papéis das fixtures). Helpers de harness do STYNX
ficam em `@stynx-nyx/angular-ui/testing` (subpath documentado no `MIGRATING.md` do STYNX).
