// R-0014 TASK-0017 (Inspector). CTG-0003c §6 /conta (`ContaPageComponent`, sem facade própria);
// página real, ainda inexistente (§1) — "Cannot find module" até TASK-0018 (esperado, §9).
import { ContaPageComponent } from './conta.page'; // §9.
import { TestBed } from '@angular/core/testing';
import { StynxI18nModule, StynxI18nService } from '@stynx-nyx/angular-i18n';
import portalCatalog from '../../i18n/portal.pt-BR.json';
import { PORTAL_ROUTES } from '../../app.routes';
import { SessionFacade } from '../session.facade';
import { createSessionFacadeStub } from '../../../testing/session-facade.stub';
import { createPortalRouterHarness } from '../../../testing/router-harness';
import { expectA11yStateInvariants } from '../../../testing/a11y-state.spec-helper';
import { ME_PAIR3_FIXTURE } from '../../../testing/http-fixtures-pair3';

const catalog = portalCatalog as Record<string, string>;

async function mount(
  options: { loading?: boolean; loadError?: unknown; account?: unknown } = {},
) {
  const sessionFacade = createSessionFacadeStub({
    active: true,
    assuranceLevel: 'avancada',
    account: options.account ?? ME_PAIR3_FIXTURE,
    representations: ME_PAIR3_FIXTURE.representations.map((item) => ({
      id: item.id,
      label: item.representedName,
      scope: item.scope,
      validUntil: item.validUntil,
    })),
    loading: options.loading ?? false,
  });
  if (options.loadError) {
    (sessionFacade.loadErrorSignal as any).set(options.loadError);
  }
  const harness = await createPortalRouterHarness(PORTAL_ROUTES, [
    ContaPageComponent,
    { provide: SessionFacade, useValue: sessionFacade },
    StynxI18nModule.forRoot({
      defaultLocale: 'pt-BR',
      loadCatalog: async () => catalog,
    }),
  ]);
  await TestBed.inject(StynxI18nService).initialize();
  await harness.navigate('/conta');
  return harness;
}

describe('/conta — data-screen "", cpf sem máscara e sem seleção de representação (§1 inv.; RN-118; OD-P48) [negativo]', () => {
  it('dado me com 1 representação então cpf sem máscara, portal.situation.assurance.avancada, 1 <li> em data-representations e nenhum controle de seleção', async () => {
    // C-3c-68
    const harness = await mount();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() => expect(root.getAttribute('data-screen')).toBe(''));
    expect(root.textContent).toContain(ME_PAIR3_FIXTURE.cpf);
    expect(root.textContent).not.toContain('***');
    expect(root.textContent).toContain(
      catalog['portal.situation.assurance.avancada'],
    );
    const representations = root.querySelectorAll('[data-representations] li');
    expect(representations.length).toBe(1);
    expect(
      root.querySelector('input[type="radio"][name="representation"]'),
    ).toBeNull();
    expect(root.querySelector('select[name="representation"]')).toBeNull();
  });
});

describe('/conta — links (§3.10)', () => {
  it('dado a página então links para /privacidade/meus-dados, /notificacoes/preferencias e /sne', async () => {
    const harness = await mount();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() => expect(root.getAttribute('data-screen')).toBe(''));
    expect(
      root.querySelector('a[routerLink="/privacidade/meus-dados"]'),
    ).not.toBeNull();
    expect(
      root.querySelector('a[routerLink="/notificacoes/preferencias"]'),
    ).not.toBeNull();
    expect(root.querySelector('a[routerLink="/sne"]')).not.toBeNull();
  });
});

describe('/conta — a11y por estado (§6/§7.3 — cobertura integral: loading, ready, error, offline)', () => {
  it('dado loading (SessionFacade.loading true) então axe sem violação serious/critical', async () => {
    const harness = await mount({ loading: true, account: null });
    const root = harness.harness.routeNativeElement as HTMLElement;
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado a conta carregada (ready) então axe sem violação serious/critical', async () => {
    const harness = await mount();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() => expect(root.getAttribute('data-screen')).toBe(''));
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado error (loadError genérico) então axe sem violação serious/critical', async () => {
    const harness = await mount({
      account: null,
      loadError: {
        code: 'PORTAL.INTERNAL',
        status: 500,
        messageKey: null,
        context: {},
        fields: [],
        retryAfter: null,
      },
    });
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() => expect(root.getAttribute('data-screen')).toBe(''));
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado offline (navigator.onLine false; loadError com status 0) então axe sem violação serious/critical', async () => {
    // A12(a): offline real.
    const onLineSpy = vi.spyOn(window.navigator, 'onLine', 'get');
    onLineSpy.mockReturnValue(false);
    const harness = await mount({
      account: null,
      loadError: {
        code: null,
        status: 0,
        messageKey: null,
        context: {},
        fields: [],
        retryAfter: null,
      },
    });
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() => expect(root.getAttribute('data-screen')).toBe(''));
    await expectA11yStateInvariants(root, catalog);
    onLineSpy.mockRestore();
  });
});
