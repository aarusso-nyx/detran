// R-0014 TASK-0017 (Inspector). CTG-0003c §6 T-12 (`InboxPageComponent`); página real, ainda
// inexistente (§1) — "Cannot find module" até TASK-0018 (esperado, §9). `PortalStreamTransport`
// substituído por `useValue` (stub) para a degradação do tempo real (C-3c-102).
import { InboxPageComponent } from './inbox.page'; // §9: "Cannot find module" esperado.
import { TestBed } from '@angular/core/testing';
import { StynxI18nModule, StynxI18nService } from '@stynx-nyx/angular-i18n';
import portalCatalog from '../../../i18n/portal.pt-BR.json';
import { PORTAL_ROUTES } from '../../../app.routes';
import { SessionFacade } from '../../../core/session.facade';
import {
  RealtimeService,
  PortalStreamTransport,
} from '../../../core/realtime.service';
import { createSessionFacadeStub } from '../../../../testing/session-facade.stub';
import { createPortalRouterHarness } from '../../../../testing/router-harness';
import { createPortalStreamTransportStub } from '../../../../testing/portal-stream-transport.stub';
import { expectA11yStateInvariants } from '../../../../testing/a11y-state.spec-helper';
import {
  INBOX_LIST_FIXTURE,
  portalErrorBody,
} from '../../../../testing/http-fixtures-pair3';

const catalog = portalCatalog as Record<string, string>;

async function mount() {
  const transport = createPortalStreamTransportStub();
  const harness = await createPortalRouterHarness(PORTAL_ROUTES, [
    InboxPageComponent,
    {
      provide: SessionFacade,
      useValue: createSessionFacadeStub({
        active: true,
        assuranceLevel: 'simples',
      }),
    },
    { provide: PortalStreamTransport, useValue: { open: transport.open } },
    StynxI18nModule.forRoot({
      defaultLocale: 'pt-BR',
      loadCatalog: async () => catalog,
    }),
  ]);
  await TestBed.inject(StynxI18nService).initialize();
  await harness.navigate('/notificacoes');
  return { harness, transport };
}

async function flush(
  harness: Awaited<ReturnType<typeof mount>>['harness'],
  body: unknown,
) {
  const httpMock = harness.httpMock();
  const req = await vi.waitFor(() =>
    httpMock.expectOne((candidate) => candidate.url === '/v1/portal/inbox'),
  );
  req.flush(body as any);
}

describe('T-12 — data-screen e componente real (§1 inv.; M8)', () => {
  it('dado a rota /notificacoes então host [data-screen]="T-12" e não é PlaceholderPageComponent', async () => {
    // C-3c-100 (T-12)
    const { harness } = await mount();
    await flush(harness, INBOX_LIST_FIXTURE);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.getAttribute('data-screen')).toBe('T-12'),
    );
  });
});

describe('T-12 — tempo real degradado ([RN-PORTAL-124]; §6)', () => {
  it('dado transporte SSE em erro então banner role=status sem_tempo_real e a lista continua com os 2 itens [negativo: nenhum estado de erro bloqueante]', async () => {
    // C-3c-102
    const { harness, transport } = await mount();
    await flush(harness, INBOX_LIST_FIXTURE);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.querySelectorAll('[data-id]').length).toBe(2),
    );
    const realtime = TestBed.inject(RealtimeService) as any;
    realtime.start();
    TestBed.tick();
    transport
      .current()!
      .error(Object.assign(new Error('offline'), { status: 0 }));
    await vi.waitFor(() => {
      const status = root.querySelector('[role="status"]');
      expect(status?.textContent).toContain(
        catalog['portal.screens.t12.state.sem_tempo_real'],
      );
    });
    expect(root.querySelectorAll('[data-id]').length).toBe(2);
    await expectA11yStateInvariants(root, catalog);
  });
});

describe('T-12 — a11y por estado (§7.2/§7.3 — cobertura integral: loading, ready, empty, error, unavailable, offline)', () => {
  it('dado loading então h1 único, região de estado e axe sem violação serious/critical', async () => {
    const { harness } = await mount();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado com itens (ready) então axe sem violação serious/critical', async () => {
    const { harness } = await mount();
    await flush(harness, INBOX_LIST_FIXTURE);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.querySelectorAll('[data-id]').length).toBe(2),
    );
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado vazio então axe sem violação serious/critical', async () => {
    const { harness } = await mount();
    await flush(harness, { items: [], total: 0, page: 1, pageSize: 20 });
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(catalog['portal.screens.t12.empty']),
    );
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado error (500, código fora do catálogo) então h1 único, região de estado, foco no banner e axe sem violação serious/critical', async () => {
    const { harness } = await mount();
    const httpMock = harness.httpMock();
    const req = await vi.waitFor(() =>
      httpMock.expectOne((candidate) => candidate.url === '/v1/portal/inbox'),
    );
    req.flush(portalErrorBody('PORTAL.INTERNAL_TEST_ERROR', 500), {
      status: 500,
      statusText: 'Internal Server Error',
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

  it('dado unavailable (503 SERVICE_UNAVAILABLE) então h1 único, região de estado, foco no banner e axe sem violação serious/critical', async () => {
    const { harness } = await mount();
    const httpMock = harness.httpMock();
    const req = await vi.waitFor(() =>
      httpMock.expectOne((candidate) => candidate.url === '/v1/portal/inbox'),
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

  it('dado offline (status 0, navigator.onLine false) então h1 único, região de estado, foco no banner e axe sem violação serious/critical', async () => {
    const { harness } = await mount();
    const onLineSpy = vi.spyOn(window.navigator, 'onLine', 'get');
    onLineSpy.mockReturnValue(false);
    const httpMock = harness.httpMock();
    const req = await vi.waitFor(() =>
      httpMock.expectOne((candidate) => candidate.url === '/v1/portal/inbox'),
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
