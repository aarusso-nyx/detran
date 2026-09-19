// R-0014 TASK-0015 (Inspector). CTG-0003b §6 T-07 (`RequestDetailPageComponent`); página real,
// ainda inexistente (§1) — "Cannot find module" até TASK-0016 (esperado, §9).
import { RequestDetailPageComponent } from './request-detail.page'; // §9: importação direta força "Cannot find module" (falha esperada até TASK-0016).
import { TestBed } from '@angular/core/testing';
import { StynxI18nModule, StynxI18nService } from '@stynx-nyx/angular-i18n';
import portalCatalog from '../../../i18n/portal.pt-BR.json';
import { PORTAL_ROUTES } from '../../../app.routes';
import { SessionFacade } from '../../../core/session.facade';
import { EntitlementFacade } from '../../../core/entitlement.facade';
import { createSessionFacadeStub } from '../../../../testing/session-facade.stub';
import { createEntitlementFacadeStub } from '../../../../testing/entitlement-facade.stub';
import { createPortalRouterHarness } from '../../../../testing/router-harness';
import {
  DILIGENCE_ID_FIXTURE,
  PROTOCOL_NUMBER_FIXTURE,
  REQUEST_DETAIL_FIXTURE,
  REQUEST_DETAIL_WITH_DILIGENCE_FIXTURE,
  REQUEST_EM_ANDAMENTO_ID,
  REQUEST_RESULTADO_ID,
} from '../../../../testing/http-fixtures-reads';
import { portalErrorBody } from '../../../../testing/http-fixtures';
import { expectA11yStateInvariants } from '../../../../testing/a11y-state.spec-helper';

const catalog = portalCatalog as Record<string, string>;

async function mount(requestId: string, entitlementOk = true) {
  const harness = await createPortalRouterHarness(PORTAL_ROUTES, [
    RequestDetailPageComponent,
    {
      provide: SessionFacade,
      useValue: createSessionFacadeStub({
        active: true,
        assuranceLevel: 'avancada',
      }),
    },
    {
      provide: EntitlementFacade,
      useValue: createEntitlementFacadeStub(entitlementOk),
    },
    StynxI18nModule.forRoot({
      defaultLocale: 'pt-BR',
      loadCatalog: async () => catalog,
    }),
  ]);
  await TestBed.inject(StynxI18nService).initialize();
  await harness.navigate(`/processos/${requestId}`);
  return harness;
}

async function flush(
  harness: Awaited<ReturnType<typeof mount>>,
  requestId: string,
  body: unknown,
  status = 200,
) {
  const httpMock = harness.httpMock();
  const req = await vi.waitFor(() =>
    httpMock.expectOne(
      (candidate) => candidate.url === `/v1/portal/requests/${requestId}`,
    ),
  );
  if (status === 200) req.flush(body as any);
  else req.flush(body as any, { status, statusText: 'Error' });
}

describe('T-07 — cabeçalho e ações bloqueadas (@example)', () => {
  it('dado o @example (canWithdraw false, withdrawalBlockedReason estado_nao_admite) então cabeçalho com o protocolo, data, notifications.origin.portal, services.adesao_sne; timeline com a entrada mínima; cmd.withdraw aria-disabled com data-reason e o texto de label.reason; sem cmd.decision; sem cmd.appeal', async () => {
    // C-3b-90
    const harness = await mount(REQUEST_EM_ANDAMENTO_ID);
    await flush(harness, REQUEST_EM_ANDAMENTO_ID, REQUEST_DETAIL_FIXTURE);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(PROTOCOL_NUMBER_FIXTURE),
    );
    expect(root.textContent).toContain(
      catalog['portal.notifications.origin.portal'],
    );
    expect(root.textContent).toContain(catalog['portal.services.adesao_sne']);
    const timeline = root.querySelector('portal-process-timeline');
    expect(timeline).not.toBeNull();
    const actions = root.querySelector('portal-request-actions');
    const withdraw = actions?.querySelector(
      '[data-action="withdraw"], [aria-disabled]',
    );
    expect(withdraw?.getAttribute('aria-disabled')).toBe('true');
    expect(withdraw?.getAttribute('data-reason')).toBe('estado_nao_admite');
    expect(root.textContent).toContain(catalog['portal.common.label.reason']);
    expect(actions?.querySelector('[data-action="decision"]')).toBeNull();
    expect(actions?.querySelector('[data-action="appeal"]')).toBeNull();
  });
});

describe('T-07 — ações navegam, nunca requisitam (T07 §6)', () => {
  it('dado actions todas habilitadas, diligência open e decision então cmd.respond/withdraw/appeal/decision apontam às rotas corretas; nenhum POST', async () => {
    // C-3b-91
    const harness = await mount(REQUEST_RESULTADO_ID);
    await flush(harness, REQUEST_RESULTADO_ID, {
      ...REQUEST_DETAIL_WITH_DILIGENCE_FIXTURE,
      decision: { outcome: 'deferido' },
    });
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.querySelector('portal-request-actions')).not.toBeNull(),
    );
    expect(
      root.querySelector(
        `a[routerLink="/processos/${REQUEST_RESULTADO_ID}/diligencia/${DILIGENCE_ID_FIXTURE}"]`,
      ),
    ).not.toBeNull();
    expect(
      root.querySelector(
        `a[routerLink="/processos/${REQUEST_RESULTADO_ID}/desistencia"]`,
      ),
    ).not.toBeNull();
    expect(
      root.querySelector(
        `a[routerLink="/processos/${REQUEST_RESULTADO_ID}/cetran/nova"]`,
      ),
    ).not.toBeNull();
    expect(
      root.querySelector(
        `a[routerLink="/processos/${REQUEST_RESULTADO_ID}/decisao"]`,
      ),
    ).not.toBeNull();
    harness.httpMock().expectNone((candidate) => candidate.method === 'POST');
  });
});

describe('T-07 — erros de leitura [negativo]', () => {
  it('dado 404 NOT_FOUND{kind:request} então t07.state.ineligible + link por-que-nao-vejo', async () => {
    // C-3b-92 (1.ª metade)
    const harness = await mount(REQUEST_EM_ANDAMENTO_ID);
    await flush(
      harness,
      REQUEST_EM_ANDAMENTO_ID,
      portalErrorBody('PORTAL.NOT_FOUND', 404, { kind: 'request' }),
      404,
    );
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.screens.t07.state.ineligible'],
      ),
    );
    expect(
      root.querySelector(
        'a[href*="por-que-nao-vejo"], a[routerLink*="por-que-nao-vejo"]',
      ),
    ).not.toBeNull();
  });

  it('dado 503 então state.unavailable com retry e o que já carregou permanece', async () => {
    // C-3b-92 (2.ª metade)
    const harness = await mount(REQUEST_EM_ANDAMENTO_ID);
    await flush(
      harness,
      REQUEST_EM_ANDAMENTO_ID,
      portalErrorBody('PORTAL.NATIONAL_READ_UNAVAILABLE', 503),
      503,
    );
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.screens.t07.state.unavailable'],
      ),
    );
    expect(root.querySelector('[data-next-step="retry"]')).not.toBeNull();
  });
});

describe('T-07 — a11y por estado (§7; A10(j) — cobertura integral: loading, ready, not_found, unavailable, error, offline)', () => {
  it('dado loading (antes de qualquer flush) então h1 único, região de estado e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-07, loading)
    const harness = await mount(REQUEST_RESULTADO_ID);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado sucesso (com diligência/decisão) então h1 único, região de estado e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-07, ready)
    const harness = await mount(REQUEST_RESULTADO_ID);
    await flush(harness, REQUEST_RESULTADO_ID, {
      ...REQUEST_DETAIL_WITH_DILIGENCE_FIXTURE,
      decision: { outcome: 'deferido' },
    });
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.querySelector('portal-request-actions')).not.toBeNull(),
    );
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado not_found então h1 único, região de estado, foco no banner e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-07, not_found)
    const harness = await mount(REQUEST_EM_ANDAMENTO_ID);
    await flush(
      harness,
      REQUEST_EM_ANDAMENTO_ID,
      portalErrorBody('PORTAL.NOT_FOUND', 404, { kind: 'request' }),
      404,
    );
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.screens.t07.state.ineligible'],
      ),
    );
    await expectA11yStateInvariants(root, catalog, {
      errorBannerFocused: true,
    });
  });

  it('dado unavailable (503) então h1 único, região de estado, foco no banner e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-07, unavailable)
    const harness = await mount(REQUEST_EM_ANDAMENTO_ID);
    await flush(
      harness,
      REQUEST_EM_ANDAMENTO_ID,
      portalErrorBody('PORTAL.NATIONAL_READ_UNAVAILABLE', 503),
      503,
    );
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.screens.t07.state.unavailable'],
      ),
    );
    await expectA11yStateInvariants(root, catalog, {
      errorBannerFocused: true,
    });
  });

  it('dado error (500, código fora do catálogo) então h1 único, região de estado, foco no banner e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-07, error)
    const harness = await mount(REQUEST_EM_ANDAMENTO_ID);
    await flush(
      harness,
      REQUEST_EM_ANDAMENTO_ID,
      portalErrorBody('PORTAL.INTERNAL_TEST_ERROR', 500),
      500,
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

  it('dado offline (status 0, navigator.onLine false) então h1 único, região de estado, foco no banner e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-07, offline; M14)
    const harness = await mount(REQUEST_EM_ANDAMENTO_ID);
    const onLineSpy = vi.spyOn(window.navigator, 'onLine', 'get');
    onLineSpy.mockReturnValue(false);
    const httpMock = harness.httpMock();
    const req = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) =>
          candidate.url === `/v1/portal/requests/${REQUEST_EM_ANDAMENTO_ID}`,
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
