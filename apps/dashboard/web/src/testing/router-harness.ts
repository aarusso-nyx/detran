// R-0016 TASK-0004 (Inspector). Harness comum para specs de roteamento/guardas sobre
// `DASHBOARD_ROUTES` (`CTG-0002.md` §12), forma de `apps/portal/web/src/testing/router-harness.ts`.
// Importa `DASHBOARD_ROUTES`, `freshnessInterceptor` e `LOGIN_ROUTE` de `src/app/**`
// (TASK-0005/0006, ainda inexistentes nesta entrega — falha esperada de módulo, §14.2 regra 2):
// o harness exercita o roteamento REAL, comparado aos valores esperados das fixtures.
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideLocationMocks } from '@angular/common/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, type Routes } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { STYNX_ANGULAR_AUTH_OPTIONS } from '@stynx-nyx/angular-auth';
import { DASHBOARD_ROUTES } from '../app/app.routes.js';
import { LOGIN_ROUTE } from '../app/core/guards/auth.guard.js';
import { freshnessInterceptor } from '../app/core/interceptors/freshness.interceptor.js';

/** Id fixo usado em todo teste de rota/comando (padrão R-0014; `CTG-0002.md` §12). */
export const FIXED_ENTITY_ID = '00000000-0000-7000-8000-0000000000aa';
export const FIXED_SYSTEM = 'renach-outbox';
export const FIXED_PERIOD = '2026-09';

/** Substitui todo segmento `:param` do path do manifesto por um token fixo de teste. */
export function substituteRouteParams(path: string): string {
  return path
    .split('/')
    .map((segment) => {
      if (segment === ':id') return FIXED_ENTITY_ID;
      if (segment === ':system') return FIXED_SYSTEM;
      if (segment === ':period') return FIXED_PERIOD;
      return segment;
    })
    .join('/');
}

export interface DashboardRouterHarness {
  readonly harness: RouterTestingHarness;
  readonly router: Router;
  navigate(url: string): Promise<unknown>;
  /** URL final do router após navegação (inclui redirecionamentos de guarda). */
  currentUrl(): string;
  httpMock(): HttpTestingController;
}

/**
 * `ModuleWithProviders` ou componente standalone na mesma lista de `entries` (padrão do Portal):
 * roteado automaticamente para `imports:` — os demais entram em `providers:`.
 */
function isModuleOrStandalone(entry: unknown): boolean {
  return (
    typeof entry === 'function' ||
    (typeof entry === 'object' && entry !== null && 'ngModule' in entry)
  );
}

export async function createDashboardRouterHarness(
  entries: readonly unknown[] = [],
  routes: Routes = DASHBOARD_ROUTES,
): Promise<DashboardRouterHarness> {
  const imports = entries.filter(isModuleOrStandalone);
  const providers = entries.filter((entry) => !isModuleOrStandalone(entry));
  TestBed.configureTestingModule({
    imports,
    providers: [
      provideRouter(routes),
      provideLocationMocks(),
      provideHttpClient(withInterceptors([freshnessInterceptor])),
      provideHttpClientTesting(),
      {
        provide: STYNX_ANGULAR_AUTH_OPTIONS,
        useValue: { loginRedirectRoute: LOGIN_ROUTE },
      },
      ...providers,
    ],
  });
  const harness = await RouterTestingHarness.create();
  const router = TestBed.inject(Router);
  return {
    harness,
    router,
    navigate: (url: string) => harness.navigateByUrl(url),
    currentUrl: () => router.url,
    httpMock: () => TestBed.inject(HttpTestingController),
  };
}

/** Elemento com o atributo `data-screen` no fragmento renderizado pela rota ativa. */
export function screenElement(harness: RouterTestingHarness): Element | null {
  const root = harness.routeNativeElement;
  if (!root) return null;
  if (root.hasAttribute('data-screen')) return root;
  return root.querySelector('[data-screen]');
}
