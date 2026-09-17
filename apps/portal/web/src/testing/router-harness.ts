// R-0014 TASK-0002 (Inspector). Harness comum para specs de roteamento/guardas sobre
// `PORTAL_ROUTES` (M7/M8 do plan.md). Usa `provideRouter` + `RouterTestingHarness`
// (`@angular/router/testing`), como pedido pelo prompt (§B.3). Só usado por specs.
import type { Provider } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideLocationMocks } from '@angular/common/testing';
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
}

export async function createPortalRouterHarness(
  routes: Routes,
  providers: Provider[] = [],
): Promise<PortalRouterHarness> {
  TestBed.configureTestingModule({
    providers: [provideRouter(routes), provideLocationMocks(), ...providers],
  });
  const harness = await RouterTestingHarness.create();
  const router = TestBed.inject(Router);
  return {
    harness,
    router,
    navigate: (url: string) => harness.navigateByUrl(url),
    currentUrl: () => router.url,
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
