// R-0014 TASK-0017 (Inspector). CTG-0003c §6 /acessibilidade (`AcessibilidadePageComponent`,
// estática); página real, ainda inexistente (§1) — "Cannot find module" até TASK-0018 (esperado,
// §9).
import { AcessibilidadePageComponent } from './acessibilidade.page'; // §9.
import { TestBed } from '@angular/core/testing';
import { StynxI18nModule, StynxI18nService } from '@stynx-nyx/angular-i18n';
import portalCatalog from '../../i18n/portal.pt-BR.json';
import { PORTAL_ROUTES } from '../../app.routes';
import { SessionFacade } from '../session.facade';
import { createSessionFacadeStub } from '../../../testing/session-facade.stub';
import { createPortalRouterHarness } from '../../../testing/router-harness';
import { expectA11yStateInvariants } from '../../../testing/a11y-state.spec-helper';

const catalog = portalCatalog as Record<string, string>;

async function mount() {
  const harness = await createPortalRouterHarness(PORTAL_ROUTES, [
    AcessibilidadePageComponent,
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
  await harness.navigate('/acessibilidade');
  return harness;
}

describe('/acessibilidade — declaração estática (§6; RN-113) [negativo]', () => {
  it('dado a página então data-screen "", cita WCAG 2.1 AA e eMAG, e links para /ouvidoria/nova e /carta-servicos', async () => {
    // C-3c-100/C-3c-109 (/acessibilidade)
    const harness = await mount();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() => expect(root.getAttribute('data-screen')).toBe(''));
    expect(root.textContent).toContain(
      catalog['portal.shell.acessibilidade.standard'],
    );
    expect(
      root.querySelector('a[routerLink="/ouvidoria/nova"]'),
    ).not.toBeNull();
    expect(
      root.querySelector('a[routerLink="/carta-servicos"]'),
    ).not.toBeNull();
  });
});

describe('/acessibilidade — a11y (§7.3)', () => {
  it('dado a página estática então axe sem violação serious/critical', async () => {
    const harness = await mount();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() => expect(root.getAttribute('data-screen')).toBe(''));
    await expectA11yStateInvariants(root, catalog);
  });
});
