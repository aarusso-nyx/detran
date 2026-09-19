// R-0014 TASK-0015 (Inspector). CTG-0003b §6 T-06 (`RequestListPageComponent`); página real,
// ainda inexistente (§1) — "Cannot find module" até TASK-0016 (esperado, §9).
import { RequestListPageComponent } from './request-list.page'; // §9: importação direta força "Cannot find module" (falha esperada até TASK-0016).
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
import { portalErrorBody } from '../../../../testing/http-fixtures';

const catalog = portalCatalog as Record<string, string>;

async function mount() {
  const harness = await createPortalRouterHarness(PORTAL_ROUTES, [
    RequestListPageComponent,
    {
      provide: SessionFacade,
      useValue: createSessionFacadeStub({
        active: true,
        assuranceLevel: 'avancada',
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
  await harness.navigate('/processos');
  return harness;
}

async function flush(
  harness: Awaited<ReturnType<typeof mount>>,
  body: unknown,
) {
  const httpMock = harness.httpMock();
  const req = await vi.waitFor(() =>
    httpMock.expectOne((candidate) => candidate.url === '/v1/portal/requests'),
  );
  req.flush(body as any);
}

describe('T-06 — lista ordenada por urgência ([UC-PORTAL-005] 3a)', () => {
  it('dado 3 itens (dueOn 2026-10-14/null/2026-09-30) então linhas na ordem de urgência, cada uma com protocol, services.<serviceKey>, badge ou situation.request.<STATE>, next_action.<by>, deadline-card só quando dueOn, link /processos/<id>; aria-live polite na região ao reordenar', async () => {
    // C-3b-88
    const harness = await mount();
    await flush(harness, {
      items: [
        {
          requestId: 'r-a',
          protocol: 'AM-1',
          serviceKey: 'adesao_sne',
          targetLabel: null,
          situation: 'EM_ANDAMENTO_NO_ORGAO',
          nextAction: {
            by: 'agency',
            label: 'portal.requests.nextAction.EM_ANDAMENTO_NO_ORGAO',
            dueOn: '2026-10-14',
          },
          updatedAt: '2026-09-01T12:00:00-04:00',
        },
        {
          requestId: 'r-b',
          protocol: 'AM-2',
          serviceKey: 'defesa_previa',
          targetLabel: null,
          situation: 'CONCLUIDO',
          nextAction: {
            by: 'none',
            label: 'portal.requests.nextAction.CONCLUIDO',
            dueOn: null,
          },
          updatedAt: '2026-09-05T12:00:00-04:00',
        },
        {
          requestId: 'r-c',
          protocol: 'AM-3',
          serviceKey: 'pagamento',
          targetLabel: null,
          situation: 'PROTOCOLADO',
          nextAction: {
            by: 'citizen',
            label: 'portal.requests.nextAction.PROTOCOLADO',
            dueOn: '2026-09-30',
          },
          updatedAt: '2026-09-02T12:00:00-04:00',
        },
      ],
      total: 3,
      page: 1,
      pageSize: 20,
    });
    const root = harness.harness.routeNativeElement as HTMLElement;
    const rows = await vi.waitFor(() => {
      const found = Array.from(root.querySelectorAll('[data-request-id]'));
      expect(found.length).toBe(3);
      return found;
    });
    expect(rows.map((row) => row.getAttribute('data-request-id'))).toEqual([
      'r-c',
      'r-a',
      'r-b',
    ]);
    for (const [row, expected] of [
      [rows[0], { protocol: 'AM-3', serviceKey: 'pagamento' }],
    ] as const) {
      expect(row.textContent).toContain(expected.protocol);
      expect(row.textContent).toContain(
        catalog[`portal.services.${expected.serviceKey}`],
      );
    }
    expect(rows[1].querySelector('portal-deadline-card')).not.toBeNull();
    expect(rows[2].querySelector('portal-deadline-card')).toBeNull();
    for (const row of rows) {
      expect(row.querySelector('a[routerLink^="/processos/"]')).not.toBeNull();
    }
    const region = root.querySelector('[aria-live="polite"]');
    expect(region).not.toBeNull();
  });
});

describe('T-06 — rótulo do servidor validado ([UC-PORTAL-005] AC-3) [negativo]', () => {
  it('dado nextAction.label rait.x (fora de portal.requests.nextAction.) então o texto não é renderizado e data-next-action-label="rait.x"', async () => {
    // C-3b-89 (1.ª metade)
    const harness = await mount();
    await flush(harness, {
      items: [
        {
          requestId: 'r-x',
          protocol: 'AM-9',
          serviceKey: 'pagamento',
          targetLabel: null,
          situation: 'PROTOCOLADO',
          nextAction: { by: 'citizen', label: 'rait.x', dueOn: null },
          updatedAt: '2026-09-01T12:00:00-04:00',
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
    });
    const root = harness.harness.routeNativeElement as HTMLElement;
    const row = await vi.waitFor(() => {
      const found = root.querySelector('[data-request-id="r-x"]');
      expect(found).not.toBeNull();
      return found as HTMLElement;
    });
    expect(row.textContent).not.toContain('rait.x');
    expect(
      row.querySelector('[data-next-action-label="rait.x"]'),
    ).not.toBeNull();
  });
});

describe('T-06 — lista vazia ([UC-PORTAL-005] 2a/2b)', () => {
  it('dado total 0 então t06.state.empty e link /autos', async () => {
    // C-3b-89 (2.ª metade)
    const harness = await mount();
    await flush(harness, { items: [], total: 0, page: 1, pageSize: 20 });
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.screens.t06.state.empty'],
      ),
    );
    expect(root.querySelector('a[routerLink="/autos"]')).not.toBeNull();
  });
});

describe('T-06 — a11y por estado (§7; A10(j) — cobertura integral: loading, ready, empty, unavailable, error, offline)', () => {
  it('dado loading (antes de qualquer flush) então h1 único, região de estado e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-06, loading)
    const harness = await mount();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado com itens então h1 único, região de estado e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-06, ready)
    const harness = await mount();
    await flush(harness, {
      items: [
        {
          requestId: 'r-a',
          protocol: 'AM-1',
          serviceKey: 'adesao_sne',
          targetLabel: null,
          situation: 'EM_ANDAMENTO_NO_ORGAO',
          nextAction: {
            by: 'agency',
            label: 'portal.requests.nextAction.EM_ANDAMENTO_NO_ORGAO',
            dueOn: null,
          },
          updatedAt: '2026-09-01T12:00:00-04:00',
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
    });
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.querySelector('[data-request-id]')).not.toBeNull(),
    );
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado vazio então h1 único, região de estado e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-06, empty)
    const harness = await mount();
    await flush(harness, { items: [], total: 0, page: 1, pageSize: 20 });
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.screens.t06.state.empty'],
      ),
    );
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado unavailable (503 NATIONAL_READ_UNAVAILABLE) então h1 único, região de estado, foco no banner e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-06, unavailable)
    const harness = await mount();
    const httpMock = harness.httpMock();
    const req = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) => candidate.url === '/v1/portal/requests',
      ),
    );
    req.flush(
      portalErrorBody('PORTAL.NATIONAL_READ_UNAVAILABLE', 503, {
        retryAfter: 30,
      }),
      { status: 503, statusText: 'Service Unavailable' },
    );
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() => {
      const found = root.querySelector('[role="alert"]');
      expect(found?.textContent?.trim()).toBeTruthy();
    });
    await expectA11yStateInvariants(root, catalog, {
      errorBannerFocused: true,
    });
  });

  it('dado error (500, código fora do catálogo) então h1 único, região de estado, foco no banner e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-06, error)
    const harness = await mount();
    const httpMock = harness.httpMock();
    const req = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) => candidate.url === '/v1/portal/requests',
      ),
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

  it('dado offline (status 0, navigator.onLine false) então h1 único, região de estado, foco no banner e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-06, offline; M14)
    const harness = await mount();
    const onLineSpy = vi.spyOn(window.navigator, 'onLine', 'get');
    onLineSpy.mockReturnValue(false);
    const httpMock = harness.httpMock();
    const req = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) => candidate.url === '/v1/portal/requests',
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
});
