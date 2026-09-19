// R-0014 TASK-0017 (Inspector). CTG-0003c §6 /inicio (`InicioPageComponent`); página real, ainda
// inexistente (§1) — "Cannot find module" até TASK-0018 (esperado, §9).
import { InicioPageComponent } from './inicio.page'; // §9.
import { TestBed } from '@angular/core/testing';
import { StynxI18nModule, StynxI18nService } from '@stynx-nyx/angular-i18n';
import portalCatalog from '../../i18n/portal.pt-BR.json';
import { PORTAL_ROUTES } from '../../app.routes';
import { SessionFacade } from '../session.facade';
import { createSessionFacadeStub } from '../../../testing/session-facade.stub';
import { createPortalRouterHarness } from '../../../testing/router-harness';
import { expectA11yStateInvariants } from '../../../testing/a11y-state.spec-helper';
import {
  ME_PAIR3_FIXTURE,
  portalErrorBody,
} from '../../../testing/http-fixtures-pair3';

const catalog = portalCatalog as Record<string, string>;

async function mount() {
  const harness = await createPortalRouterHarness(PORTAL_ROUTES, [
    InicioPageComponent,
    {
      provide: SessionFacade,
      useValue: createSessionFacadeStub({
        active: true,
        assuranceLevel: 'simples',
        account: ME_PAIR3_FIXTURE,
      }),
    },
    StynxI18nModule.forRoot({
      defaultLocale: 'pt-BR',
      loadCatalog: async () => catalog,
    }),
  ]);
  await TestBed.inject(StynxI18nService).initialize();
  await harness.navigate('/inicio');
  return harness;
}

async function flushAll(harness: Awaited<ReturnType<typeof mount>>) {
  const httpMock = harness.httpMock();
  for (const url of [
    '/v1/portal/inbox',
    '/v1/portal/aits',
    '/v1/portal/requests',
  ]) {
    const req = await vi.waitFor(() =>
      httpMock.expectOne((candidate) => candidate.url === url),
    );
    req.flush({ items: [], total: 0, page: 1, pageSize: 20 } as any);
  }
}

describe('/inicio — data-screen "" (§1 inv.; M8)', () => {
  it('dado a rota /inicio então host [data-screen]=""', async () => {
    // C-3c-100 (/inicio)
    const harness = await mount();
    await flushAll(harness);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() => expect(root.getAttribute('data-screen')).toBe(''));
  });
});

describe('/inicio — a11y por estado (§6/§7.3 — cobertura integral: loading, empty, error, offline)', () => {
  it('dado loading (antes de qualquer flush) então axe sem violação serious/critical', async () => {
    const harness = await mount();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado sem pendências (empty) então axe sem violação serious/critical', async () => {
    const harness = await mount();
    await flushAll(harness);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() => expect(root.getAttribute('data-screen')).toBe(''));
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado error (uma fonte falha com 500) então axe sem violação serious/critical', async () => {
    const harness = await mount();
    const httpMock = harness.httpMock();
    const inboxReq = await vi.waitFor(() =>
      httpMock.expectOne((candidate) => candidate.url === '/v1/portal/inbox'),
    );
    inboxReq.flush(portalErrorBody('PORTAL.INTERNAL_TEST_ERROR', 500), {
      status: 500,
      statusText: 'Internal Server Error',
    });
    const aitsReq = await vi.waitFor(() =>
      httpMock.expectOne((candidate) => candidate.url === '/v1/portal/aits'),
    );
    aitsReq.flush({ items: [], total: 0, page: 1, pageSize: 20 } as any);
    const requestsReq = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) => candidate.url === '/v1/portal/requests',
      ),
    );
    requestsReq.flush({ items: [], total: 0, page: 1, pageSize: 20 } as any);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() => {
      const found = root.querySelector('[role="alert"]');
      expect(found?.textContent?.trim()).toBeTruthy();
    });
    await expectA11yStateInvariants(root, catalog, {
      errorBannerFocused: true,
    });
  });

  it('dado offline (navigator.onLine false; todas as fontes com status 0) então axe sem violação serious/critical', async () => {
    // A12(a): offline real.
    const onLineSpy = vi.spyOn(window.navigator, 'onLine', 'get');
    onLineSpy.mockReturnValue(false);
    const harness = await mount();
    const httpMock = harness.httpMock();
    for (const url of [
      '/v1/portal/inbox',
      '/v1/portal/aits',
      '/v1/portal/requests',
    ]) {
      const req = await vi.waitFor(() =>
        httpMock.expectOne((candidate) => candidate.url === url),
      );
      req.error(new ProgressEvent('error'), {
        status: 0,
        statusText: 'Unknown Error',
      });
    }
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
