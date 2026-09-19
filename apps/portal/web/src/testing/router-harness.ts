// R-0014 TASK-0002 (Inspector). Harness comum para specs de roteamento/guardas sobre
// `PORTAL_ROUTES` (M7/M8 do plan.md). Usa `provideRouter` + `RouterTestingHarness`
// (`@angular/router/testing`), como pedido pelo prompt (§B.3). Só usado por specs.
//
// R-0014 TASK-0015 (Inspector, CTG-0003b §9(a)): estendido com `provideHttpClient()` +
// `provideHttpClientTesting()` — as 13 páginas reais do par 2 injetam a facade do módulo →
// `PortalClient` → `HttpClient`, e a matriz de guardas do CTG-0001 (`app.guards-matrix.spec.ts`)
// passa a renderizá-las (hoje renderiza `PlaceholderPageComponent`, que não usa `HttpClient`).
// `HttpClientTesting` é aditivo: nenhum spec existente injeta `HttpClient` hoje, então nada muda
// para os 50 arquivos anteriores; `HttpTestingController` fica disponível via `httpMock()` para
// quem quiser flushar ou verificar (opcional — nenhum spec existente chama `verify()` sobre este
// harness, então uma requisição não flushada de uma página real não quebra os specs de guarda).
import { TestBed } from '@angular/core/testing';
import { provideLocationMocks } from '@angular/common/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideRouter, Router, type Routes } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

/** Id fixo usado em todo teste de guarda/entitlement (prompt TASK-0002 §B.3). */
export const FIXED_ENTITY_ID = '00000000-0000-7000-8000-0000000000aa';

export interface PortalRouterHarness {
  readonly harness: RouterTestingHarness;
  readonly router: Router;
  navigate(url: string): Promise<unknown>;
  /** URL final do router após navegação (inclui redirecionamentos de guarda). */
  currentUrl(): string;
  /** `HttpTestingController` do harness (CTG-0003b §9(a)) — para flushar leituras de páginas reais. */
  httpMock(): HttpTestingController;
}

/**
 * `ModuleWithProviders` (`StynxI18nModule.forRoot(...)`) ou um componente standalone (classe)
 * passados na mesma lista — Angular exige os dois em `imports:`, nunca em `providers:` (colocar
 * um `ModuleWithProviders` em `providers:` lança "Invalid provider for the NgModule" em runtime,
 * mesmo compilando). `createPortalRouterHarness` roteia cada entrada automaticamente para não
 * exigir que cada chamador separe as duas listas.
 */
function isModuleOrStandalone(entry: unknown): boolean {
  return (
    typeof entry === 'function' ||
    (typeof entry === 'object' && entry !== null && 'ngModule' in entry)
  );
}

export async function createPortalRouterHarness(
  routes: Routes,
  // `unknown[]` (não `Provider[]`): CTG-0003b §9(a) — alguns specs precisam passar
  // `StynxI18nModule.forRoot(...)` (`ModuleWithProviders`) e componentes standalone reais (para
  // forçar a resolução do módulo em runtime — §9); ambos são roteados para `imports:` por
  // `isModuleOrStandalone` acima. `TestModuleMetadata.providers`/`imports` reais do Angular são
  // `any[]`, então isto só relaxa o tipo desta função — nenhum chamador existente muda.
  entries: readonly unknown[] = [],
): Promise<PortalRouterHarness> {
  const imports = entries.filter(isModuleOrStandalone);
  const providers = entries.filter((entry) => !isModuleOrStandalone(entry));
  TestBed.configureTestingModule({
    imports,
    providers: [
      provideRouter(routes),
      provideLocationMocks(),
      provideHttpClient(),
      provideHttpClientTesting(),
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

/** Substitui todo segmento `:param` do path do manifesto pelo id fixo. */
export function substituteRouteParams(
  path: string,
  id: string = FIXED_ENTITY_ID,
): string {
  return path
    .split('/')
    .map((segment) => (segment.startsWith(':') ? id : segment))
    .join('/');
}

/**
 * Elemento com o atributo `data-screen` no fragmento renderizado pela rota ativa
 * (host do `PlaceholderPageComponent`, ou um descendente — M8: `data-screen="T-nn"` |
 * `data-screen=""`).
 */
export function screenElement(harness: RouterTestingHarness): Element | null {
  const root = harness.routeNativeElement;
  if (!root) return null;
  if (root.hasAttribute('data-screen')) return root;
  return root.querySelector('[data-screen]');
}
