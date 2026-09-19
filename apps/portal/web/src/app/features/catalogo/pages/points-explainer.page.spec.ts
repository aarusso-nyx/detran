// R-0014 TASK-0017 (Inspector). CTG-0003c §6 T-15 (`PointsExplainerPageComponent`); página real,
// ainda inexistente (§1) — "Cannot find module" até TASK-0018 (esperado, §9). Sem leitura
// ([DIVERGE-22]; OD-P90) — página estática.
import { PointsExplainerPageComponent } from './points-explainer.page'; // §9.
import { TestBed } from '@angular/core/testing';
import { StynxI18nModule, StynxI18nService } from '@stynx-nyx/angular-i18n';
import portalCatalog from '../../../i18n/portal.pt-BR.json';
import { PORTAL_ROUTES } from '../../../app.routes';
import { SessionFacade } from '../../../core/session.facade';
import { createSessionFacadeStub } from '../../../../testing/session-facade.stub';
import { createPortalRouterHarness } from '../../../../testing/router-harness';
import { expectA11yStateInvariants } from '../../../../testing/a11y-state.spec-helper';

const catalog = portalCatalog as Record<string, string>;

async function mount() {
  const harness = await createPortalRouterHarness(PORTAL_ROUTES, [
    PointsExplainerPageComponent,
    {
      provide: SessionFacade,
      useValue: createSessionFacadeStub({ active: false }),
    },
    StynxI18nModule.forRoot({
      defaultLocale: 'pt-BR',
      loadCatalog: async () => catalog,
    }),
  ]);
  await TestBed.inject(StynxI18nService).initialize();
  await harness.navigate('/pontuacao/como-funciona');
  return harness;
}

describe('T-15 — página estática sem leitura ([DIVERGE-22]) [negativo]', () => {
  it('dado a rota /pontuacao/como-funciona então data-screen T-15, title+intro, role=status unavailable_in_version e nenhum GET é feito', async () => {
    // C-3c-100/C-3c-108 (T-15)
    const harness = await mount();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.getAttribute('data-screen')).toBe('T-15'),
    );
    expect(root.textContent).toContain(catalog['portal.screens.t15.title']);
    expect(root.textContent).toContain(catalog['portal.screens.t15.intro']);
    const status = root.querySelector('[role="status"]');
    expect(status?.textContent).toContain(
      catalog['portal.states.unavailable_in_version'],
    );
    harness.httpMock().expectNone(() => true);
  });
});

describe('T-15 — a11y (§7.3)', () => {
  it('dado a página estática então axe sem violação serious/critical', async () => {
    const harness = await mount();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.getAttribute('data-screen')).toBe('T-15'),
    );
    await expectA11yStateInvariants(root, catalog);
  });
});
