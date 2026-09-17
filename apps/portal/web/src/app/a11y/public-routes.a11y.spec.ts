// R-0014 TASK-0002 (Inspector). Aplica `expectNoSeriousA11yViolations` às rotas `anonimo`
// do manifesto (route-manifest.md), renderizadas via `RouterTestingHarness` sobre
// `PORTAL_ROUTES` real (prompt §B.6).
import { PORTAL_ROUTES } from '../app.routes';
import { PORTAL_ROUTE_MANIFEST_FIXTURE } from '../../testing/route-manifest.fixture';
import {
  createPortalRouterHarness,
  substituteRouteParams,
} from '../../testing/router-harness';
import { SessionFacade } from '../core/session.facade';
import { SESSION_FACADE_PRESETS } from '../../testing/session-facade.stub';
import { expectNoSeriousA11yViolations } from './axe.spec-helper';

const anonymousRoutes = PORTAL_ROUTE_MANIFEST_FIXTURE.filter(
  (entry) => entry.access === 'anonimo',
);

describe('a11y (axe-core) das rotas anônimas do manifesto', () => {
  for (const entry of anonymousRoutes) {
    const url = `/${substituteRouteParams(entry.path)}`;
    const label = entry.path === '' ? '(home)' : entry.path;

    it(`dado a rota anônima ${label} quando renderizada então axe não reporta violação serious/critical`, async () => {
      const { harness } = await createPortalRouterHarness(PORTAL_ROUTES, [
        {
          provide: SessionFacade,
          useValue: SESSION_FACADE_PRESETS.anonimo(),
        },
      ]);
      await harness.navigateByUrl(url);
      const root = harness.routeNativeElement;
      expect(root, `rota ${label} não renderizou`).not.toBeNull();
      await expectNoSeriousA11yViolations(root as Element);
    });
  }
});
