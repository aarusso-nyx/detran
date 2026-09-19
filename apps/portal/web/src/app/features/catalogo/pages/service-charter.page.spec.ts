// R-0014 TASK-0017 (Inspector). CTG-0003c §6 T-25 (`ServiceCharterPageComponent`); página real,
// ainda inexistente (§1) — "Cannot find module" até TASK-0018 (esperado, §9). Rota `anonimo`
// (lista e detalhe pela mesma página, route-manifest.fixture #2/#3).
import { ServiceCharterPageComponent } from './service-charter.page'; // §9.
import { TestBed } from '@angular/core/testing';
import { StynxI18nModule, StynxI18nService } from '@stynx-nyx/angular-i18n';
import portalCatalog from '../../../i18n/portal.pt-BR.json';
import { PORTAL_ROUTES } from '../../../app.routes';
import { SessionFacade } from '../../../core/session.facade';
import { createSessionFacadeStub } from '../../../../testing/session-facade.stub';
import { createPortalRouterHarness } from '../../../../testing/router-harness';
import { expectA11yStateInvariants } from '../../../../testing/a11y-state.spec-helper';
import {
  PORTAL_SERVICE_CATALOG_FIXTURE,
  SERVICE_DEFESA_PREVIA_UNAVAILABLE_FIXTURE,
  portalErrorBody,
} from '../../../../testing/http-fixtures-pair3';

const catalog = portalCatalog as Record<string, string>;

async function mount(path = '/carta-servicos') {
  const harness = await createPortalRouterHarness(PORTAL_ROUTES, [
    ServiceCharterPageComponent,
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
  await harness.navigate(path);
  return harness;
}

async function flushList(harness: Awaited<ReturnType<typeof mount>>) {
  const httpMock = harness.httpMock();
  const req = await vi.waitFor(() =>
    httpMock.expectOne((candidate) => candidate.url === '/v1/portal/services'),
  );
  req.flush(PORTAL_SERVICE_CATALOG_FIXTURE as any);
}

describe('T-25 — data-screen e 15 itens com nível do ato, nunca cor de selo (§1 inv.; RN-102 b; RN-108) [negativo]', () => {
  it('dado a lista de fixture então 15 itens, cada um com o nível do ato e o DOM não contém bronze|prata|ouro', async () => {
    // C-3c-100/C-3c-65 (T-25)
    const harness = await mount();
    await flushList(harness);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() => {
      const items = root.querySelectorAll('[data-service-key]');
      expect(items.length).toBe(15);
    });
    expect(/bronze|prata|ouro/i.test(root.textContent ?? '')).toBe(false);
    const sneItem = root.querySelector('[data-service-key="adesao_sne"]');
    expect(sneItem?.textContent).toContain(
      catalog['portal.situation.assurance.avancada'],
    );
  });
});

describe('T-25 — indisponível não mostra botão de ir para o serviço (§3.9; §6) [negativo]', () => {
  it('dado defesa_previa unavailable então data-token delegacao_indisponivel_r0007, AlternativeChannelNote e sem botão ir', async () => {
    // C-3c-63 (DOM)
    const harness = await mount('/carta-servicos/defesa_previa');
    const httpMock = harness.httpMock();
    const req = await vi.waitFor(() =>
      httpMock.expectOne('/v1/portal/services/defesa_previa'),
    );
    req.flush(SERVICE_DEFESA_PREVIA_UNAVAILABLE_FIXTURE);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.getAttribute('data-screen')).toBe('T-25'),
    );
    await vi.waitFor(() => {
      expect(
        root.querySelector('[data-token="delegacao_indisponivel_r0007"]'),
      ).not.toBeNull();
    });
    expect(
      root.querySelector('portal-alternative-channel-note'),
    ).not.toBeNull();
    expect(root.querySelector('[data-cmd-ir]')).toBeNull();
  });
});

describe('T-25 — a11y por estado (§6/§7.3 — cobertura integral: lista carregando/ready/erro_recuperavel/indisponivel/offline; detalhe ready/sem_permissao/indisponivel)', () => {
  it('dado carregando (lista, antes do flush) então axe sem violação serious/critical', async () => {
    const harness = await mount();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado a lista (ready) então axe sem violação serious/critical', async () => {
    const harness = await mount();
    await flushList(harness);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.getAttribute('data-screen')).toBe('T-25'),
    );
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado erro_recuperavel (lista, 500) então axe sem violação serious/critical', async () => {
    const harness = await mount();
    const httpMock = harness.httpMock();
    const req = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) => candidate.url === '/v1/portal/services',
      ),
    );
    req.flush(portalErrorBody('PORTAL.INTERNAL_TEST_ERROR', 500), {
      status: 500,
      statusText: 'Internal Server Error',
    });
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.screens.t25.state.erro_recuperavel'],
      ),
    );
    await expectA11yStateInvariants(root, catalog, {
      errorBannerFocused: true,
    });
  });

  it('dado indisponivel (lista, 503) então axe sem violação serious/critical', async () => {
    const harness = await mount();
    const httpMock = harness.httpMock();
    const req = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) => candidate.url === '/v1/portal/services',
      ),
    );
    req.flush(portalErrorBody('PORTAL.SERVICE_UNAVAILABLE', 503), {
      status: 503,
      statusText: 'Service Unavailable',
    });
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() => {
      const found = root.querySelector('[role="alert"]');
      expect(found?.textContent?.trim()).toBeTruthy();
    });
    await expectA11yStateInvariants(root, catalog, {
      errorBannerFocused: true,
    });
  });

  it('dado offline (lista; navigator.onLine false) então axe sem violação serious/critical', async () => {
    // A12(a): offline real.
    const onLineSpy = vi.spyOn(window.navigator, 'onLine', 'get');
    onLineSpy.mockReturnValue(false);
    const harness = await mount();
    const httpMock = harness.httpMock();
    const req = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) => candidate.url === '/v1/portal/services',
      ),
    );
    req.error(new ProgressEvent('error'), {
      status: 0,
      statusText: 'Unknown Error',
    });
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(catalog['portal.states.offline']),
    );
    await expectA11yStateInvariants(root, catalog, {
      errorBannerFocused: true,
    });
    onLineSpy.mockRestore();
  });

  it('dado o detalhe disponível (ready) então axe sem violação serious/critical', async () => {
    const harness = await mount('/carta-servicos/adesao_sne');
    const httpMock = harness.httpMock();
    const req = await vi.waitFor(() =>
      httpMock.expectOne('/v1/portal/services/adesao_sne'),
    );
    const adesaoSneItem = PORTAL_SERVICE_CATALOG_FIXTURE.find(
      (item) => item.serviceKey === 'adesao_sne',
    )!;
    req.flush(adesaoSneItem as any);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.getAttribute('data-screen')).toBe('T-25'),
    );
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado o detalhe indisponível (defesa_previa) então axe sem violação serious/critical', async () => {
    const harness = await mount('/carta-servicos/defesa_previa');
    const httpMock = harness.httpMock();
    const req = await vi.waitFor(() =>
      httpMock.expectOne('/v1/portal/services/defesa_previa'),
    );
    req.flush(SERVICE_DEFESA_PREVIA_UNAVAILABLE_FIXTURE);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.getAttribute('data-screen')).toBe('T-25'),
    );
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado o detalhe sem_permissao (404 NOT_FOUND kind service) então axe sem violação serious/critical', async () => {
    const harness = await mount('/carta-servicos/inexistente');
    const httpMock = harness.httpMock();
    const req = await vi.waitFor(() =>
      httpMock.expectOne('/v1/portal/services/inexistente'),
    );
    req.flush(portalErrorBody('PORTAL.NOT_FOUND', 404, { kind: 'service' }), {
      status: 404,
      statusText: 'Not Found',
    });
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.screens.t25.state.sem_permissao'],
      ),
    );
    await expectA11yStateInvariants(root, catalog);
  });
});
