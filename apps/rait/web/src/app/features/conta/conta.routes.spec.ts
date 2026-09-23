// R-0012 TASK-0014 (Inspector, iteração restrita 3). CTG-0002b.md §6/§8 — C-2B-61, C-2B-83.
// `features/conta/pages/account.page.ts` ainda não existe (TASK-0015): falha de módulo esperada.
import { describe, expect, it } from 'vitest';
import { pageProviders } from '../../../testing/facade.stub';
import {
  createRaitRouterHarness,
  screenElement,
  substituteRouteParams,
} from '../../../testing/router-harness';
import { RAIT_ALL_ROLES } from '../../../testing/route-manifest.fixture';
import { PlaceholderPageComponent } from '../../shared/placeholder-page.component';
import { AccountPageComponent } from './pages/account.page';
import { CONTA_ROUTES } from './conta.routes';

describe('conta — C-2B-61 (todos os papéis)', () => {
  RAIT_ALL_ROLES.forEach((role) => {
    it(`dado "conta" ativada com ${role} quando renderizada então AccountPageComponent`, async () => {
      const harness = await createRaitRouterHarness(pageProviders(role));
      await harness.navigateByUrl(`/${substituteRouteParams('conta')}`);
      expect(screenElement(harness)?.tagName.toLowerCase()).not.toBe(
        'rait-placeholder-page',
      );
      expect(harness.routeDebugElement?.componentInstance).toBeInstanceOf(
        AccountPageComponent,
      );
    });
  });
});

describe('conta.routes — C-2B-83', () => {
  it('dado CONTA_ROUTES quando lido então "conta" → AccountPageComponent; nenhum PlaceholderPageComponent', () => {
    const byPath = new Map(CONTA_ROUTES.map((route) => [route.path, route]));
    expect(byPath.get('conta')?.component).toBe(AccountPageComponent);
    for (const route of CONTA_ROUTES) {
      expect(route.component).not.toBe(PlaceholderPageComponent);
    }
  });
});
