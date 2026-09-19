// R-0014 TASK-0017 (Inspector). CTG-0003c §6 / (home; `HomePageComponent`, arquivo "altera" do
// §1 — já existe em disco desde CTG-0001/CTG-0002; ganha o catálogo real neste par). Diferente
// dos arquivos "novo", este spec roda contra a implementação REAL: até TASK-0018 ele falha por
// asserção genuína (o catálogo ainda não é renderizado), nunca por "Cannot find module" — como
// `data/portal.client.pair3.spec.ts` faz para `PortalClient` (§9). `ServiceCatalogFacade`
// (abstrata) só expõe `availability()`; `items()` é da classe concreta
// `PortalServiceCatalogFacade` (`core/service-catalog.facade.ts`, congelada — fora da fronteira
// do Engineer, §9), que embrulha `PortalClient.services()`: o teste flusha o `HttpTestingController`
// em vez de stubar a facade.
import { TestBed } from '@angular/core/testing';
import { StynxI18nModule, StynxI18nService } from '@stynx-nyx/angular-i18n';
import portalCatalog from '../../i18n/portal.pt-BR.json';
import { PORTAL_ROUTES } from '../../app.routes';
import { HomePageComponent } from './home.page';
import { SessionFacade } from '../session.facade';
import { createSessionFacadeStub } from '../../../testing/session-facade.stub';
import { createPortalRouterHarness } from '../../../testing/router-harness';
import { expectNoSeriousA11yViolations } from '../../a11y/axe.spec-helper';
import {
  PORTAL_SERVICE_CATALOG_FIXTURE,
  portalErrorBody,
} from '../../../testing/http-fixtures-pair3';

const catalog = portalCatalog as Record<string, string>;

async function mount() {
  const harness = await createPortalRouterHarness(PORTAL_ROUTES, [
    HomePageComponent,
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
  await harness.navigate('/');
  return harness;
}

async function flushServices(
  harness: Awaited<ReturnType<typeof mount>>,
  body: unknown,
) {
  const httpMock = harness.httpMock();
  const req = await vi.waitFor(() =>
    httpMock.expectOne((candidate) => candidate.url === '/v1/portal/services'),
  );
  req.flush(body as any);
}

describe('/ (home) — catálogo real (§3.10; RN-113 3; OD-P50)', () => {
  it('dado GET services de fixture então 15 itens com portal.services.<key>, data-availability e, para defesa_previa e pagamento (só rotas :aitId no manifesto), link a /autos (§3.9; A12(e))', async () => {
    // C-3c-69 (1.ª parte)
    const harness = await mount();
    await flushServices(harness, PORTAL_SERVICE_CATALOG_FIXTURE);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.querySelectorAll('[data-service-key]').length).toBe(15),
    );
    const items = root.querySelectorAll('[data-service-key]');
    for (const item of Array.from(items)) {
      expect(item.hasAttribute('data-availability')).toBe(true);
    }
    // defesa_previa (available) e pagamento (partially_available): ambos só têm entradas
    // parametrizadas por :aitId no route-manifest (app.route-manifest.ts) — nunca uma rota direta
    // — logo a rota funcional (core/functional-route.ts, functionalRouteFor) é /autos, não a Carta
    // de Serviços.
    const defesaItem = root.querySelector('[data-service-key="defesa_previa"]');
    expect(defesaItem?.querySelector('a[routerLink="/autos"]')).not.toBeNull();
    expect(
      defesaItem?.querySelector(
        'a[routerLink="/carta-servicos/defesa_previa"]',
      ),
    ).toBeNull();
    const pagamentoItem = root.querySelector('[data-service-key="pagamento"]');
    expect(
      pagamentoItem?.querySelector('a[routerLink="/autos"]'),
    ).not.toBeNull();
    expect(
      pagamentoItem?.querySelector('a[routerLink="/carta-servicos/pagamento"]'),
    ).toBeNull();
  });

  it('dado GET services 500 então portal.states.error e o botão gov.br continua presente [negativo: OD-P50]', async () => {
    // C-3c-69 (2.ª parte)
    const harnessError = await mount();
    const httpMock = harnessError.httpMock();
    const req = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) => candidate.url === '/v1/portal/services',
      ),
    );
    req.flush(portalErrorBody('PORTAL.INTERNAL', 500), {
      status: 500,
      statusText: 'Internal Server Error',
    });
    const rootError = harnessError.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(rootError.textContent).toContain(catalog['portal.states.error']),
    );
    expect(rootError.querySelector('button.portal-primary')).not.toBeNull();
  });
});

describe('/ (home) — link para /acessibilidade (RN-113 3; LBI art. 63 §1º)', () => {
  it('dado a home então um link com aria-label para /acessibilidade usando portal.shell.footer.acessibilidade', async () => {
    // C-3c-109 (home)
    const harness = await mount();
    await flushServices(harness, PORTAL_SERVICE_CATALOG_FIXTURE);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.querySelectorAll('[data-service-key]').length).toBe(15),
    );
    const link = root.querySelector('a[routerLink="/acessibilidade"]');
    expect(link).not.toBeNull();
    expect(link?.getAttribute('aria-label')).toBe(
      catalog['portal.shell.footer.acessibilidade'],
    );
  });
});

describe('/ (home) — a11y por estado (§6/§7.3 — cobertura integral: loading, ready, error, offline)', () => {
  it('dado loading (antes do flush) então axe sem violação serious/critical', async () => {
    const harness = await mount();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await expectNoSeriousA11yViolations(root);
  });

  it('dado o catálogo carregado (ready) então axe sem violação serious/critical', async () => {
    const harness = await mount();
    await flushServices(harness, PORTAL_SERVICE_CATALOG_FIXTURE);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.querySelectorAll('[data-service-key]').length).toBe(15),
    );
    await expectNoSeriousA11yViolations(root);
  });

  it('dado error (500) então axe sem violação serious/critical', async () => {
    const harness = await mount();
    const httpMock = harness.httpMock();
    const req = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) => candidate.url === '/v1/portal/services',
      ),
    );
    req.flush(portalErrorBody('PORTAL.INTERNAL', 500), {
      status: 500,
      statusText: 'Internal Server Error',
    });
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(catalog['portal.states.error']),
    );
    await expectNoSeriousA11yViolations(root);
  });

  it('dado offline (navigator.onLine false) então axe sem violação serious/critical', async () => {
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
    await expectNoSeriousA11yViolations(root);
    onLineSpy.mockRestore();
  });
});
