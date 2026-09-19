// R-0014 TASK-0017 (Inspector). CTG-0003c §6 T-18 (`CrashListPageComponent`); página real, ainda
// inexistente (§1) — "Cannot find module" até TASK-0018 (esperado, §9).
import { CrashListPageComponent } from './crash-list.page'; // §9: "Cannot find module" esperado.
import { TestBed } from '@angular/core/testing';
import { StynxI18nModule, StynxI18nService } from '@stynx-nyx/angular-i18n';
import portalCatalog from '../../../i18n/portal.pt-BR.json';
import { PORTAL_ROUTES } from '../../../app.routes';
import { SessionFacade } from '../../../core/session.facade';
import { ServiceCatalogFacade } from '../../../core/service-catalog.facade';
import { createSessionFacadeStub } from '../../../../testing/session-facade.stub';
import { createServiceCatalogFacadeStub } from '../../../../testing/service-catalog-facade.stub';
import { createPortalRouterHarness } from '../../../../testing/router-harness';
import { expectA11yStateInvariants } from '../../../../testing/a11y-state.spec-helper';
import {
  CRASH_LIST_FIXTURE,
  portalErrorBody,
} from '../../../../testing/http-fixtures-pair3';

const catalog = portalCatalog as Record<string, string>;

async function mount() {
  const harness = await createPortalRouterHarness(PORTAL_ROUTES, [
    CrashListPageComponent,
    {
      provide: SessionFacade,
      useValue: createSessionFacadeStub({
        active: true,
        assuranceLevel: 'simples',
      }),
    },
    {
      provide: ServiceCatalogFacade,
      useValue: createServiceCatalogFacadeStub({ status: 'available' }),
    },
    StynxI18nModule.forRoot({
      defaultLocale: 'pt-BR',
      loadCatalog: async () => catalog,
    }),
  ]);
  await TestBed.inject(StynxI18nService).initialize();
  await harness.navigate('/sinistros');
  return harness;
}

async function flush(
  harness: Awaited<ReturnType<typeof mount>>,
  body: unknown,
) {
  const httpMock = harness.httpMock();
  const req = await vi.waitFor(() =>
    httpMock.expectOne((candidate) => candidate.url === '/v1/portal/crashes'),
  );
  req.flush(body as any);
}

describe('T-18 — data-screen e busca local anunciada ([DIVERGE-14]; §1 inv.)', () => {
  it('dado a rota /sinistros então host [data-screen]="T-18" e a região da lista é aria-live polite', async () => {
    // C-3c-100 (T-18)
    const harness = await mount();
    await flush(harness, CRASH_LIST_FIXTURE);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.getAttribute('data-screen')).toBe('T-18'),
    );
    expect(root.querySelector('[aria-live="polite"]')).not.toBeNull();
  });
});

describe('T-18 — a11y por estado (§6/§7.3 — cobertura integral: loading, ready, empty, unavailable, offline)', () => {
  it('dado loading (antes do flush) então axe sem violação serious/critical', async () => {
    const harness = await mount();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado com itens (ready) então axe sem violação serious/critical', async () => {
    const harness = await mount();
    await flush(harness, CRASH_LIST_FIXTURE);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.getAttribute('data-screen')).toBe('T-18'),
    );
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado vazio então axe sem violação serious/critical', async () => {
    const harness = await mount();
    await flush(harness, { items: [], total: 0, page: 1, pageSize: 20 });
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(catalog['portal.screens.t18.empty']),
    );
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado unavailable (503) então axe sem violação serious/critical', async () => {
    const harness = await mount();
    const httpMock = harness.httpMock();
    const req = await vi.waitFor(() =>
      httpMock.expectOne((candidate) => candidate.url === '/v1/portal/crashes'),
    );
    req.flush(portalErrorBody('PORTAL.NATIONAL_READ_UNAVAILABLE', 503), {
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

  it('dado offline (navigator.onLine false) então axe sem violação serious/critical', async () => {
    // A12(a): offline real.
    const onLineSpy = vi.spyOn(window.navigator, 'onLine', 'get');
    onLineSpy.mockReturnValue(false);
    const harness = await mount();
    const httpMock = harness.httpMock();
    const req = await vi.waitFor(() =>
      httpMock.expectOne((candidate) => candidate.url === '/v1/portal/crashes'),
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
});
