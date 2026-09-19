// R-0014 TASK-0015 (Inspector). CTG-0003b §6 T-02 (`DefesaPreviaPageComponent`); página real,
// ainda inexistente (§1) — "Cannot find module" até TASK-0016 (esperado, §9).
import { DefesaPreviaPageComponent } from './defesa-previa.page'; // §9: importação direta força "Cannot find module" (falha esperada até TASK-0016).
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
  AIT_DETAIL_FIXTURE,
  AIT_ID,
} from '../../../../testing/http-fixtures-reads';
import { portalErrorBody } from '../../../../testing/http-fixtures';
import { expectA11yStateInvariants } from '../../../../testing/a11y-state.spec-helper';

const catalog = portalCatalog as Record<string, string>;

async function mount(
  session = createSessionFacadeStub({
    active: true,
    assuranceLevel: 'avancada',
  }),
) {
  const harness = await createPortalRouterHarness(PORTAL_ROUTES, [
    DefesaPreviaPageComponent,
    { provide: SessionFacade, useValue: session },
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
  await harness.navigate(`/autos/${AIT_ID}/defesa/nova`);
  return harness;
}

async function flushAitContext(
  harness: Awaited<ReturnType<typeof mount>>,
  openRequestId: string | null,
) {
  const httpMock = harness.httpMock();
  const req = await vi.waitFor(() =>
    httpMock.expectOne(
      (candidate) => candidate.url === `/v1/portal/aits/${AIT_ID}`,
    ),
  );
  req.flush({
    ...AIT_DETAIL_FIXTURE,
    openRequestId,
    deadlines: [{ kind: 'T-DEF', dueOn: '2026-10-14', ownedBy: 'citizen' }],
  });
}

describe('T-02 — abertura sem rascunho (start automático; [RN-PORTAL-107] 3)', () => {
  it('dado GET aits → openRequestId null então POST /v1/portal/requests { serviceKey: defesa_previa, targetKind: ait, targetId, channel: portal }; dado 201 então textarea facts/grounds, select requestType, portal-attachment-uploader com o checklist = requirements[] inteiro', async () => {
    // C-3b-68
    const harness = await mount();
    await flushAitContext(harness, null);
    const httpMock = harness.httpMock();
    const createReq = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) =>
          candidate.method === 'POST' &&
          candidate.url === '/v1/portal/requests',
      ),
    );
    expect(createReq.request.body).toMatchObject({
      serviceKey: 'defesa_previa',
      targetKind: 'ait',
      targetId: AIT_ID,
      channel: 'portal',
    });
    createReq.flush(
      {
        requestId: '00000000-0000-7000-8000-000070400005',
        state: 'PEDIDO_EM_COMPOSICAO',
        prefilled: {},
        requirements: ['Foto do local', 'Cópia do documento'],
        minimumAssurance: 'avancada',
        version: 1,
      },
      { headers: { ETag: '"1"' } },
    );
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() => {
      expect(root.querySelector('textarea[name="facts"]')).not.toBeNull();
    });
    expect(
      root.querySelector('textarea[name="facts"]')?.closest('form, div')
        ?.textContent,
    ).toBeTruthy();
    expect(root.querySelector('textarea[name="grounds"]')).not.toBeNull();
    expect(root.querySelector('select[name="requestType"]')).not.toBeNull();
    const uploader = root.querySelector('portal-attachment-uploader');
    expect(uploader?.textContent).toContain('Foto do local');
    expect(uploader?.textContent).toContain('Cópia do documento');
  });
});

describe('T-02 — retomada via openRequestId ([UC-PORTAL-019] AC-4; T02 §5)', () => {
  it('dado openRequestId e GET requests → PEDIDO_EM_COMPOSICAO com draft { facts: a } então nenhum POST requests, wizard em step composicao e values() { facts: a }', async () => {
    // C-3b-69 (1.ª metade)
    const openId = '00000000-0000-7000-8000-000070400005';
    const harness = await mount();
    await flushAitContext(harness, openId);
    const httpMock = harness.httpMock();
    const requestReq = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) => candidate.url === `/v1/portal/requests/${openId}`,
      ),
    );
    requestReq.flush(
      {
        request: {
          requestId: openId,
          state: 'PEDIDO_EM_COMPOSICAO',
          serviceKey: 'defesa_previa',
          targetKind: 'ait',
          targetId: AIT_ID,
          draft: { facts: 'a' },
          version: 1,
        },
      },
      { headers: { ETag: '"1"' } },
    );
    httpMock.expectNone(
      (candidate) =>
        candidate.method === 'POST' && candidate.url === '/v1/portal/requests',
    );
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() => {
      const wizard = root.querySelector('portal-service-wizard');
      expect(wizard?.getAttribute('data-step')).toBe('composicao');
    });
  });

  it('dado state PROTOCOLADO então t02.state.ineligible e link /processos/<id>', async () => {
    // C-3b-69 (2.ª metade)
    const openId = '00000000-0000-7000-8000-000070400005';
    const harness = await mount();
    await flushAitContext(harness, openId);
    const req = await vi.waitFor(() =>
      harness
        .httpMock()
        .expectOne(
          (candidate) => candidate.url === `/v1/portal/requests/${openId}`,
        ),
    );
    req.flush({
      request: {
        requestId: openId,
        state: 'PROTOCOLADO',
        serviceKey: 'defesa_previa',
        targetKind: 'ait',
        targetId: AIT_ID,
        draft: null,
        version: 2,
      },
    });
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.screens.t02.state.ineligible'],
      ),
    );
    expect(
      root.querySelector(`a[routerLink="/processos/${openId}"]`),
    ).not.toBeNull();
  });
});

describe('T-02 — nível insuficiente no passo assinatura (T02 §5; A10(g) de plan.md — a rota avancada exige avancada no assuranceGuard, M8 intocável, satisfeito na navegação; a insuficiência é simulada rebaixando a sessão DEPOIS que o guarda já passou, nunca com qualificada como exigência)', () => {
  it('dado assuranceLevel avancada na navegação (satisfaz o assuranceGuard), rebaixado para simples depois, e minimumAssurance avancada no 201 então o texto de t02.state.forbidden aparece acima do portal-signature-step, que delega ao AssuranceExplainer (data-required=avancada, data-current=simples); a página não navega para fora', async () => {
    // C-3b-70 — A10(g): nível de sessão abaixo do exigido (não `qualificada` no `minimumAssurance`,
    // reservado por [RN-PORTAL-101] para "nunca exigido"), preservando a asserção do
    // `AssuranceExplainer` do par 1.
    const session = createSessionFacadeStub({
      active: true,
      assuranceLevel: 'avancada',
    });
    const harness = await mount(session);
    await flushAitContext(harness, null);
    // O `assuranceGuard` (M8, intocável) já validou a rota com `avancada` durante `navigate()`
    // acima; rebaixar depois simula a insuficiência sem depender de `qualificada`.
    session.assuranceLevelSignal.set('simples');
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
        requestId: '00000000-0000-7000-8000-000070400005',
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
      expect(root.querySelector('textarea[name="facts"]')).not.toBeNull(),
    );
    root.querySelector<HTMLTextAreaElement>('textarea[name="facts"]')!.value =
      'x';
    root
      .querySelector('textarea[name="facts"]')
      ?.dispatchEvent(new Event('input', { bubbles: true }));
    root.querySelector<HTMLTextAreaElement>('textarea[name="grounds"]')!.value =
      'y';
    root
      .querySelector('textarea[name="grounds"]')
      ?.dispatchEvent(new Event('input', { bubbles: true }));
    harness.harness.detectChanges(); // reflete os values antes do clique (zoneless).
    root.querySelector<HTMLButtonElement>('[data-continue]')?.click();
    const draftReq = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) =>
          candidate.method === 'PUT' &&
          candidate.url ===
            '/v1/portal/requests/00000000-0000-7000-8000-000070400005/draft',
      ),
    );
    draftReq.flush(
      {
        requestId: '00000000-0000-7000-8000-000070400005',
        version: 2,
        savedAt: '2026-09-14T12:00:00-04:00',
      },
      { headers: { ETag: '"2"' } },
    );
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.screens.t02.state.forbidden'],
      ),
    );
    const forbidden = Array.from(root.querySelectorAll('*')).find((element) =>
      element.textContent?.includes(
        catalog['portal.screens.t02.state.forbidden'],
      ),
    );
    const signatureStep = root.querySelector('portal-signature-step');
    expect(forbidden).toBeTruthy();
    expect(signatureStep).not.toBeNull();
    // O texto de contexto da página precede o SignatureStep no DOM (contrato §3.4 e).
    expect(
      forbidden!.compareDocumentPosition(signatureStep as Node) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    // SignatureStep (par 1, congelado): insuficiência em 'avancada'/'simples' delega ao
    // AssuranceExplainer (não ao banner "nunca exigido", reservado a required==='qualificada').
    const explainer = await vi.waitFor(() => {
      const found = root.querySelector('portal-assurance-explainer');
      expect(found).not.toBeNull();
      return found as HTMLElement;
    });
    expect(explainer.getAttribute('data-required')).toBe('avancada');
    expect(explainer.getAttribute('data-current')).toBe('simples');
    expect(root.textContent).not.toContain(
      catalog['portal.errors.assurance_qualified_never_required'],
    );
    expect(harness.currentUrl()).toContain(`/autos/${AIT_ID}/defesa/nova`);
  });
});

describe('T-02 — indisponibilidade na abertura (M15)', () => {
  it('dado POST requests → 422 SERVICE_UNAVAILABLE { unavailableReason: delegacao_indisponivel_r0007 } então t02.state.unavailable, data-reason, o note renderizado e nenhum recibo [negativo]', async () => {
    // C-3b-71
    const harness = await mount();
    await flushAitContext(harness, null);
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
        alternativeChannelNote:
          'Atendimento presencial ([REF-DETRANAM-SERVICOS])',
      }),
      { status: 422, statusText: 'Unprocessable Entity' },
    );
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.screens.t02.state.unavailable'],
      ),
    );
    expect(
      root.querySelector('[data-reason="delegacao_indisponivel_r0007"]'),
    ).not.toBeNull();
    expect(root.textContent).toContain('Atendimento presencial');
    expect(root.querySelector('[data-protocol]')).toBeNull();
  });
});

describe('T-02 — DeadlineCard e canal alternativo em todos os passos (OD-P79: sem canDeactivate)', () => {
  it('dado T-02 então portal-deadline-card das deadlines do AIT nos passos composicao e assinatura, e alternative-channel-note em todos; nenhum canDeactivate na rota', async () => {
    // C-3b-72
    const harness = await mount();
    await flushAitContext(harness, null);
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
        requestId: '00000000-0000-7000-8000-000070400005',
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
      expect(root.querySelector('portal-deadline-card')).not.toBeNull(),
    );
    expect(
      root.querySelector('portal-alternative-channel-note'),
    ).not.toBeNull();

    const routeConfig = PORTAL_ROUTES;
    void routeConfig;
    const defesaRoute = (await import('../defesa.routes')).DEFESA_ROUTES.find(
      (route) => route.path === 'autos/:aitId/defesa/nova',
    );
    expect(defesaRoute?.canDeactivate).toBeUndefined();
  });
});

describe('T-02 — a11y por estado (§7; A10(j) — cobertura integral: loading, composicao, forbidden, not_found, error, unavailable, offline)', () => {
  it('dado loading (antes de qualquer flush) então h1 único, região de estado e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-02, loading)
    const harness = await mount();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado composicao (formulário) então h1 único, região de estado e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-02, composicao/ready)
    const harness = await mount();
    await flushAitContext(harness, null);
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
        requestId: '00000000-0000-7000-8000-000070400005',
        state: 'PEDIDO_EM_COMPOSICAO',
        prefilled: {},
        requirements: ['Foto do local'],
        minimumAssurance: 'avancada',
        version: 1,
      },
      { headers: { ETag: '"1"' } },
    );
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.querySelector('textarea[name="facts"]')).not.toBeNull(),
    );
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado forbidden (nível insuficiente no passo assinatura) então h1 único, região de estado e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-02, forbidden/sem permissão; mesmo mecanismo de C-3b-70/A10(g))
    const session = createSessionFacadeStub({
      active: true,
      assuranceLevel: 'avancada',
    });
    const harness = await mount(session);
    await flushAitContext(harness, null);
    session.assuranceLevelSignal.set('simples');
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
        requestId: '00000000-0000-7000-8000-000070400005',
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
      expect(root.querySelector('textarea[name="facts"]')).not.toBeNull(),
    );
    root.querySelector<HTMLTextAreaElement>('textarea[name="facts"]')!.value =
      'x';
    root
      .querySelector('textarea[name="facts"]')
      ?.dispatchEvent(new Event('input', { bubbles: true }));
    root.querySelector<HTMLTextAreaElement>('textarea[name="grounds"]')!.value =
      'y';
    root
      .querySelector('textarea[name="grounds"]')
      ?.dispatchEvent(new Event('input', { bubbles: true }));
    harness.harness.detectChanges();
    root.querySelector<HTMLButtonElement>('[data-continue]')?.click();
    const draftReq = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) =>
          candidate.method === 'PUT' &&
          candidate.url ===
            '/v1/portal/requests/00000000-0000-7000-8000-000070400005/draft',
      ),
    );
    draftReq.flush(
      {
        requestId: '00000000-0000-7000-8000-000070400005',
        version: 2,
        savedAt: '2026-09-14T12:00:00-04:00',
      },
      { headers: { ETag: '"2"' } },
    );
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.screens.t02.state.forbidden'],
      ),
    );
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado not_found (404 na leitura do AIT) então h1 único, região de estado, foco no banner e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-02, not_found)
    const harness = await mount();
    const httpMock = harness.httpMock();
    const req = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) => candidate.url === `/v1/portal/aits/${AIT_ID}`,
      ),
    );
    req.flush(portalErrorBody('PORTAL.NOT_FOUND', 404, { kind: 'ait' }), {
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

  it('dado error (500 na leitura do AIT, código fora do catálogo) então h1 único, região de estado, foco no banner e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-02, error)
    const harness = await mount();
    const httpMock = harness.httpMock();
    const req = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) => candidate.url === `/v1/portal/aits/${AIT_ID}`,
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

  it('dado unavailable (422 SERVICE_UNAVAILABLE no POST requests, M15) então h1 único, região de estado e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-02, unavailable)
    const harness = await mount();
    await flushAitContext(harness, null);
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
        catalog['portal.screens.t02.state.unavailable'],
      ),
    );
    // `unavailableReason()` compõe o texto de estado sem passar por `portal-error-banner`
    // (T02 §5, M15): não há banner `role="alert"` dedicado neste caminho.
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado offline (status 0, navigator.onLine false, na leitura do AIT) então h1 único, região de estado, foco no banner e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-02, offline; M14)
    const harness = await mount();
    const onLineSpy = vi.spyOn(window.navigator, 'onLine', 'get');
    onLineSpy.mockReturnValue(false);
    const httpMock = harness.httpMock();
    const req = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) => candidate.url === `/v1/portal/aits/${AIT_ID}`,
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
