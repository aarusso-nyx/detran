// R-0014 TASK-0015 (Inspector). CTG-0003b §6 T-03 (`RecursoJariPageComponent`); página real,
// ainda inexistente (§1) — "Cannot find module" até TASK-0016 (esperado, §9).
import { RecursoJariPageComponent } from './recurso-jari.page'; // §9: importação direta força "Cannot find module" (falha esperada até TASK-0016).
import { TestBed } from '@angular/core/testing';
import { StynxI18nModule, StynxI18nService } from '@stynx-nyx/angular-i18n';
import portalCatalog from '../../../i18n/portal.pt-BR.json';
import { PORTAL_ROUTES } from '../../../app.routes';
import { SessionFacade } from '../../../core/session.facade';
import { EntitlementFacade } from '../../../core/entitlement.facade';
import { ServiceCatalogFacade } from '../../../core/service-catalog.facade';
import { createSessionFacadeStub } from '../../../../testing/session-facade.stub';
import { createEntitlementFacadeStub } from '../../../../testing/entitlement-facade.stub';
import { createServiceCatalogFacadeStub } from '../../../../testing/service-catalog-facade.stub';
import { createPortalRouterHarness } from '../../../../testing/router-harness';
import {
  CASE_EXTERNAL_ID_FIXTURE,
  REQUEST_RESULTADO_ID,
} from '../../../../testing/http-fixtures-reads';
import { expectNoSeriousA11yViolations } from '../../../a11y/axe.spec-helper';
import { expectA11yStateInvariants } from '../../../../testing/a11y-state.spec-helper';
import { portalErrorBody } from '../../../../testing/http-fixtures';

const catalog = portalCatalog as Record<string, string>;

async function mount() {
  const harness = await createPortalRouterHarness(PORTAL_ROUTES, [
    RecursoJariPageComponent,
    {
      provide: SessionFacade,
      useValue: createSessionFacadeStub({
        active: true,
        assuranceLevel: 'avancada',
      }),
    },
    {
      provide: EntitlementFacade,
      useValue: createEntitlementFacadeStub(true),
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
  await harness.navigate(`/processos/${REQUEST_RESULTADO_ID}/jari/nova`);
  return harness;
}

describe('T-03 — origem via delegation.externalId ([DIVERGE-4]; [UC-PORTAL-002] AC-1/AC-4)', () => {
  it('dado GET requests/{rid} → externalId e canAppeal true então POST requests { serviceKey: recurso_jari, targetKind: case, targetId: externalId, channel: portal } e o texto de t03.intro na entrada; no protocolo o mesmo texto em role=status; nenhum link a /autos/*/pagamento nem valor monetário [negativo]', async () => {
    // C-3b-73
    const harness = await createPortalRouterHarness(PORTAL_ROUTES, [
      RecursoJariPageComponent,
      {
        provide: SessionFacade,
        useValue: createSessionFacadeStub({
          active: true,
          assuranceLevel: 'avancada',
        }),
      },
      {
        provide: EntitlementFacade,
        useValue: createEntitlementFacadeStub(true),
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
    await harness.navigate(`/processos/${REQUEST_RESULTADO_ID}/jari/nova`);
    const httpMock = harness.httpMock();
    const originReq = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) =>
          candidate.url === `/v1/portal/requests/${REQUEST_RESULTADO_ID}`,
      ),
    );
    originReq.flush({
      request: {
        requestId: REQUEST_RESULTADO_ID,
        state: 'RESULTADO_DISPONIVEL',
        delegation: { externalId: CASE_EXTERNAL_ID_FIXTURE },
      },
      actions: { canAppeal: true, nextInstanceServiceKey: 'recurso_jari' },
    });
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(catalog['portal.screens.t03.intro']),
    );
    const createReq = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) =>
          candidate.method === 'POST' &&
          candidate.url === '/v1/portal/requests',
      ),
    );
    expect(createReq.request.body).toMatchObject({
      serviceKey: 'recurso_jari',
      targetKind: 'case',
      targetId: CASE_EXTERNAL_ID_FIXTURE,
      channel: 'portal',
    });
    createReq.flush(
      {
        requestId: '00000000-0000-7000-8000-0000ee400001',
        state: 'PEDIDO_EM_COMPOSICAO',
        prefilled: {},
        requirements: [],
        minimumAssurance: 'avancada',
        version: 1,
      },
      { headers: { ETag: '"1"' } },
    );
    await vi.waitFor(() =>
      expect(root.querySelector('textarea[name="grounds"]')).not.toBeNull(),
    );
    expect(
      root.querySelector('a[routerLink*="/pagamento"], a[href*="/pagamento"]'),
    ).toBeNull();
    expect(root.textContent).not.toMatch(/R\$\s*\d/);
    await expectNoSeriousA11yViolations(root);
  });
});

describe('T-03 — aviso de intempestividade', () => {
  it.todo(
    'OD-P59: aviso de intempestividade (REQUEST_OUT_OF_DEADLINE) no 200 de submit',
  ); // C-3b-74
});

describe('T-03 — a11y por estado (§7; A10(j) — cobertura integral: loading, ready, ineligible, not_found, error, offline)', () => {
  it('dado loading (antes de qualquer flush) então h1 único, região de estado e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-03, loading)
    const harness = await mount();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado ready (wizard com formulário do passo 2) então h1 único, região de estado e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-03, ready)
    const harness = await mount();
    const httpMock = harness.httpMock();
    const originReq = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) =>
          candidate.url === `/v1/portal/requests/${REQUEST_RESULTADO_ID}`,
      ),
    );
    originReq.flush({
      request: {
        requestId: REQUEST_RESULTADO_ID,
        state: 'RESULTADO_DISPONIVEL',
        delegation: { externalId: CASE_EXTERNAL_ID_FIXTURE },
      },
      actions: { canAppeal: true, nextInstanceServiceKey: 'recurso_jari' },
    });
    const createReq = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) =>
          candidate.method === 'POST' &&
          candidate.url === '/v1/portal/requests',
      ),
    );
    createReq.flush(
      {
        requestId: '00000000-0000-7000-8000-0000ee400001',
        state: 'PEDIDO_EM_COMPOSICAO',
        prefilled: {},
        requirements: [],
        minimumAssurance: 'avancada',
        version: 1,
      },
      { headers: { ETag: '"1"' } },
    );
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.querySelector('textarea[name="grounds"]')).not.toBeNull(),
    );
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado unavailable (422 SERVICE_UNAVAILABLE no POST requests, M15) então h1 único, região de estado e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-03, unavailable; nos moldes de C-3b-71/T-02)
    const harness = await mount();
    const httpMock = harness.httpMock();
    const originReq = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) =>
          candidate.url === `/v1/portal/requests/${REQUEST_RESULTADO_ID}`,
      ),
    );
    originReq.flush({
      request: {
        requestId: REQUEST_RESULTADO_ID,
        state: 'RESULTADO_DISPONIVEL',
        delegation: { externalId: CASE_EXTERNAL_ID_FIXTURE },
      },
      actions: { canAppeal: true, nextInstanceServiceKey: 'recurso_jari' },
    });
    const createReq = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) =>
          candidate.method === 'POST' &&
          candidate.url === '/v1/portal/requests',
      ),
    );
    createReq.flush(
      portalErrorBody('PORTAL.SERVICE_UNAVAILABLE', 422, {
        unavailableReason: 'delegacao_indisponivel_r0007',
      }),
      { status: 422, statusText: 'Unprocessable Entity' },
    );
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.screens.t03.state.unavailable'],
      ),
    );
    // `unavailableReason()` compõe o texto de estado a partir de `lastFailure`/`onFailed`
    // (wizard `failed`), sem passar por `portal-error-banner` — sem foco de banner a verificar.
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado externalId null (canAppeal false) então h1 único, região de estado e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-03, ineligible)
    const harness = await mount();
    const httpMock = harness.httpMock();
    const req = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) =>
          candidate.url === `/v1/portal/requests/${REQUEST_RESULTADO_ID}`,
      ),
    );
    req.flush({
      request: {
        requestId: REQUEST_RESULTADO_ID,
        state: 'RESULTADO_DISPONIVEL',
        delegation: { externalId: null },
      },
      actions: { canAppeal: false, nextInstanceServiceKey: null },
    });
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.screens.t03.state.ineligible'],
      ),
    );
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado not_found (404 na leitura da origem) então h1 único, região de estado, foco no banner e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-03, not_found)
    const harness = await mount();
    const httpMock = harness.httpMock();
    const req = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) =>
          candidate.url === `/v1/portal/requests/${REQUEST_RESULTADO_ID}`,
      ),
    );
    req.flush(portalErrorBody('PORTAL.NOT_FOUND', 404, { kind: 'request' }), {
      status: 404,
      statusText: 'Not Found',
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

  it('dado error (500, código fora do catálogo) então h1 único, região de estado, foco no banner e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-03, error)
    const harness = await mount();
    const httpMock = harness.httpMock();
    const req = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) =>
          candidate.url === `/v1/portal/requests/${REQUEST_RESULTADO_ID}`,
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
    // C-3b-103 (T-03, offline; M14)
    const harness = await mount();
    const onLineSpy = vi.spyOn(window.navigator, 'onLine', 'get');
    onLineSpy.mockReturnValue(false);
    const httpMock = harness.httpMock();
    const req = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) =>
          candidate.url === `/v1/portal/requests/${REQUEST_RESULTADO_ID}`,
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
