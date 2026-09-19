// R-0014 TASK-0015 (Inspector). CTG-0003b §6 T-04 (`RecursoCetranPageComponent`); página real,
// ainda inexistente (§1) — "Cannot find module" até TASK-0016 (esperado, §9).
import { RecursoCetranPageComponent } from './recurso-cetran.page'; // §9: importação direta força "Cannot find module" (falha esperada até TASK-0016).
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
import { portalErrorBody } from '../../../../testing/http-fixtures';
import { expectA11yStateInvariants } from '../../../../testing/a11y-state.spec-helper';

const catalog = portalCatalog as Record<string, string>;

async function mountUnflushed() {
  const harness = await createPortalRouterHarness(PORTAL_ROUTES, [
    RecursoCetranPageComponent,
    {
      provide: SessionFacade,
      useValue: createSessionFacadeStub({
        active: true,
        assuranceLevel: 'avancada',
      }),
    },
    { provide: EntitlementFacade, useValue: createEntitlementFacadeStub(true) },
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
  await harness.navigate(`/processos/${REQUEST_RESULTADO_ID}/cetran/nova`);
  return harness;
}

async function mount() {
  const harness = await mountUnflushed();
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
      draft: {
        parecer: 'texto do parecer',
        conclusaoJari: 'texto da conclusão',
        orgaoExterno: 'não pertence ao mapa',
      },
    },
    actions: { canAppeal: true, nextInstanceServiceKey: 'recurso_cetran' },
  });
  return harness;
}

describe('T-04 — PrefilledSummary só via mapa fechado ([RN-PORTAL-106]; [UC-PORTAL-003] AC-1) [negativo]', () => {
  it('dado prefilled com chaves fora de PREFILLED_LABEL_KEYS então o parecer/conclusão da JARI não é editável (nenhum textarea/input para eles); textarea additionalText com o field e o hint recurso_cetran.hint', async () => {
    // C-3b-75 (A9(e) de plan.md: "not.toContain('parecer')" é contraditório com
    // portal.forms.recurso_cetran.hint/t04.intro, que citam "parecer" no texto de contexto —
    // a asserção correta é "o parecer não é editável", não "o texto 'parecer' nunca aparece")
    const harness = await mount();
    const httpMock = harness.httpMock();
    const createReq = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) =>
          candidate.method === 'POST' &&
          candidate.url === '/v1/portal/requests',
      ),
    );
    createReq.flush(
      {
        requestId: '00000000-0000-7000-8000-0000ee400002',
        state: 'PEDIDO_EM_COMPOSICAO',
        prefilled: {
          parecer: 'texto do parecer',
          conclusaoJari: 'texto da conclusão',
          orgaoExterno: 'não pertence ao mapa',
        },
        requirements: [],
        minimumAssurance: 'avancada',
        version: 1,
      },
      { headers: { ETag: '"1"' } },
    );
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(
        root.querySelector('textarea[name="additionalText"]'),
      ).not.toBeNull(),
    );
    // Nenhum campo editável para parecer/conclusão/chave fora do mapa (só additionalText o é).
    const editableNames = Array.from(
      root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
        'input[name], textarea[name]',
      ),
    ).map((field) => field.name);
    expect(editableNames).not.toContain('parecer');
    expect(editableNames).not.toContain('conclusaoJari');
    expect(editableNames).not.toContain('orgaoExterno');
    expect(root.textContent).toContain(
      catalog['portal.screens.t04.field.additionalText'],
    );
    expect(root.textContent).toContain(
      catalog['portal.forms.recurso_cetran.hint'],
    );
    expect(
      root.querySelector('input[name="parecer"], textarea[name="parecer"]'),
    ).toBeNull();
    expect(
      root.querySelector(
        'input[name="conclusaoJari"], textarea[name="conclusaoJari"]',
      ),
    ).toBeNull();
  });
});

describe('T-04 — janela do CETRAN encerrada [negativo]', () => {
  it('dado POST requests → 422 APPEAL_CETRAN_WINDOW_CLOSED{dueOn} então t04.state.ineligible e o banner de errors.appeal_cetran_window_closed, sem POST submit possível', async () => {
    // C-3b-76
    const harness = await mount();
    const httpMock = harness.httpMock();
    const createReq = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) =>
          candidate.method === 'POST' &&
          candidate.url === '/v1/portal/requests',
      ),
    );
    createReq.flush(
      portalErrorBody('PORTAL.APPEAL_CETRAN_WINDOW_CLOSED', 422, {
        dueOn: '2026-09-01',
      }),
      { status: 422, statusText: 'Unprocessable Entity' },
    );
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.screens.t04.state.ineligible'],
      ),
    );
    expect(root.textContent).toContain(
      catalog['portal.errors.appeal_cetran_window_closed'],
    );
    httpMock.expectNone(
      (candidate) =>
        candidate.method === 'POST' && candidate.url.endsWith('/submit'),
    );
  });
});

describe('T-04 — a11y por estado (§7; A10(j) — cobertura integral: loading, composicao, ineligible, not_found, error, offline)', () => {
  it('dado loading (antes de qualquer flush) então h1 único, região de estado e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-04, loading)
    const harness = await mountUnflushed();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado composicao (formulário, 201 flushado) então h1 único, região de estado e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-04, composicao/ready). Bloqueio 7 de reports/TASK-0016.md: o formulário do
    // passo 2 é projetado no `ng-content` do wizard, que só existe em `composicao` — é preciso
    // flushar o 201 de `POST requests` antes de esperar `textarea[name="additionalText"]`.
    const harness = await mount();
    const httpMock = harness.httpMock();
    const createReq = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) =>
          candidate.method === 'POST' &&
          candidate.url === '/v1/portal/requests',
      ),
    );
    createReq.flush(
      {
        requestId: '00000000-0000-7000-8000-0000ee400002',
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
      expect(
        root.querySelector('textarea[name="additionalText"]'),
      ).not.toBeNull(),
    );
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado unavailable (422 SERVICE_UNAVAILABLE no POST requests, M15) então h1 único, região de estado e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-04, unavailable; nos moldes de C-3b-71/T-02)
    const harness = await mount();
    const httpMock = harness.httpMock();
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
        catalog['portal.screens.t04.state.unavailable'],
      ),
    );
    // `unavailableReason()` compõe o texto de estado a partir de `lastFailure`/`onFailed`
    // (wizard `failed`), sem passar por `portal-error-banner` — sem foco de banner a verificar.
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado ineligible então h1 único, região de estado e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-04, ineligible)
    const harness = await mount();
    const httpMock = harness.httpMock();
    const createReq = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) =>
          candidate.method === 'POST' &&
          candidate.url === '/v1/portal/requests',
      ),
    );
    createReq.flush(
      portalErrorBody('PORTAL.APPEAL_CETRAN_WINDOW_CLOSED', 422, {
        dueOn: '2026-09-01',
      }),
      { status: 422, statusText: 'Unprocessable Entity' },
    );
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.screens.t04.state.ineligible'],
      ),
    );
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado not_found (404 na leitura da origem) então h1 único, região de estado, foco no banner e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-04, not_found)
    const harness = await mountUnflushed();
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
    // C-3b-103 (T-04, error)
    const harness = await mountUnflushed();
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
    // C-3b-103 (T-04, offline; M14)
    const harness = await mountUnflushed();
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
