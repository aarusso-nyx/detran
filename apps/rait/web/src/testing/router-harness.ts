// R-0012 TASK-0005 (Inspector). Harness comum para specs de roteamento/guardas sobre
// `RAIT_ROUTES` (contrato `CTG-0002a.md` §10). `provideRouter` + `RouterTestingHarness`
// (`@angular/router/testing`), como no padrão `apps/portal/web/src/testing/router-harness.ts`.
// `STYNX_ANGULAR_AUTH_OPTIONS.loginRedirectRoute` é fixado aqui com o mesmo valor de
// `core/guards/auth.guard.ts` (`LOGIN_ROUTE = '/auth/callback'`, `CTG-0002a.md` §4, OD-R12-006)
// — duplicado como literal, não importado, para que este harness não dependa de nenhum símbolo
// de produção além de `RAIT_ROUTES` (a própria árvore sob teste).
import { provideLocationMocks } from '@angular/common/testing';
import type { Provider } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { STYNX_ANGULAR_AUTH_OPTIONS } from '@stynx-nyx/angular-auth';
import { STYNX_I18N_OPTIONS } from '@stynx-nyx/angular-i18n';
// Produção (TASK-0006): ainda não existe — falha de módulo esperada nesta entrega.
import { RAIT_ROUTES } from '../app/app.routes';

/** = `core/guards/auth.guard.ts` `LOGIN_ROUTE` (`CTG-0002a.md` §4, OD-R12-006). */
const LOGIN_ROUTE = '/auth/callback';

/** Id fixo para todo parâmetro dinâmico (`:id`/`:caseId`/`:loteId`), padrão R-0014. */
export const FIXED_ENTITY_ID = '00000000-0000-7000-8000-0000000000aa';

/** `:orgao` → `'jari'`; qualquer outro segmento `:param` → `FIXED_ENTITY_ID` (§10). */
export function substituteRouteParams(path: string): string {
  return path
    .split('/')
    .map((segment) => {
      if (!segment.startsWith(':')) return segment;
      return segment === ':orgao' ? 'jari' : FIXED_ENTITY_ID;
    })
    .join('/');
}

export function createRaitRouterHarness(
  providers: Provider[],
): Promise<RouterTestingHarness> {
  TestBed.configureTestingModule({
    providers: [
      provideRouter(RAIT_ROUTES),
      provideLocationMocks(),
      {
        provide: STYNX_ANGULAR_AUTH_OPTIONS,
        useValue: { oidc: {}, loginRedirectRoute: LOGIN_ROUTE },
      },
      // `StynxI18nService` (injetado por `stynxTranslate`) exige `STYNX_I18N_OPTIONS` no
      // construtor (sem provider, `NullInjectorError` derrubaria todo spec de rota que ative um
      // componente com `| stynxTranslate`). Catálogo vazio: `translate(key)` cai no fallback
      // `catalogState()[key] ?? key` da própria lib e devolve a chave — o bastante para os
      // specs de roteamento, que verificam `data-screen`/URL, não texto traduzido. Specs que
      // precisam do texto (i18n-test-catalog.ts) montam o próprio catálogo de marcadores.
      {
        provide: STYNX_I18N_OPTIONS,
        useValue: { defaultLocale: 'pt-BR', loadCatalog: async () => ({}) },
      },
      ...providers,
    ],
  });
  return RouterTestingHarness.create();
}

/**
 * Elemento com o atributo `data-screen` no fragmento renderizado pela rota ativa (host do
 * `PlaceholderPageComponent`/`PlaceholderLayoutComponent`, ou um descendente).
 */
export function screenElement(harness: RouterTestingHarness): Element | null {
  const root = harness.routeNativeElement;
  if (!root) return null;
  if (root.hasAttribute('data-screen')) return root;
  return root.querySelector('[data-screen]');
}
