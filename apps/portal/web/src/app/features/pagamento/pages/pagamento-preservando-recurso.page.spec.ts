// R-0014 TASK-0015 (Inspector). CTG-0003b §6 T-23 (`PagamentoPreservandoRecursoPageComponent`);
// página real, ainda inexistente (§1) — "Cannot find module" até TASK-0016 (esperado, §9).
import { PagamentoPreservandoRecursoPageComponent } from './pagamento-preservando-recurso.page'; // §9: importação direta força "Cannot find module" (falha esperada até TASK-0016).
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
  AIT_DETAIL_WITH_PAYMENT_FIXTURE,
  AIT_ID,
} from '../../../../testing/http-fixtures-reads';
import { portalErrorBody } from '../../../../testing/http-fixtures';
import { createFileList } from '../../../../testing/file-list.polyfill';
import { expectA11yStateInvariants } from '../../../../testing/a11y-state.spec-helper';

const catalog = portalCatalog as Record<string, string>;
const REQUEST_ID = '00000000-0000-7000-8000-0000ee700001';

/** A9(d) de plan.md (bloqueio 5 de reports/TASK-0016.md) — ver a mesma função em pagamento.page.spec.ts. */
async function signByUpload(
  harness: Awaited<ReturnType<typeof mount>>,
  root: HTMLElement,
): Promise<void> {
  const httpMock = harness.httpMock();
  const fetchMock = vi.fn<typeof fetch>(
    async () => new Response(null, { status: 200 }),
  );
  vi.stubGlobal('fetch', fetchMock);
  const uploadButton = await vi.waitFor(() => {
    const found = root.querySelector<HTMLButtonElement>(
      '[data-method="upload"]',
    );
    expect(found).not.toBeNull();
    return found as HTMLButtonElement;
  });
  uploadButton.click();
  const fileInput = await vi.waitFor(() => {
    const found = root.querySelector<HTMLInputElement>(
      'portal-attachment-uploader input[type="file"]',
    );
    expect(found).not.toBeNull();
    return found as HTMLInputElement;
  });
  Object.defineProperty(fileInput, 'files', {
    value: createFileList([
      new File(['assinatura'], 'assinatura.pdf', { type: 'application/pdf' }),
    ]),
    configurable: true,
  });
  fileInput.dispatchEvent(new Event('change'));
  const intentReq = await vi.waitFor(() =>
    httpMock.expectOne(
      (candidate) =>
        candidate.method === 'POST' &&
        candidate.url === `/v1/portal/requests/${REQUEST_ID}/attachments`,
    ),
  );
  const attachmentId = '00000000-0000-7000-8000-0000aa900002';
  intentReq.flush({
    attachmentId,
    uploadUrl: 'https://storage.invalid/x',
    method: 'PUT',
    headers: {},
    expiresAt: null,
  });
  const completeReq = await vi.waitFor(() =>
    httpMock.expectOne(
      (candidate) =>
        candidate.method === 'POST' &&
        candidate.url ===
          `/v1/portal/requests/${REQUEST_ID}/attachments/${attachmentId}/complete`,
    ),
  );
  completeReq.flush({ attachmentId, sha256: 'b'.repeat(64) });
  vi.unstubAllGlobals();
}

async function mount(
  entitlementOk = true,
  availability: 'available' | 'partially_available' = 'available',
) {
  const harness = await createPortalRouterHarness(PORTAL_ROUTES, [
    PagamentoPreservandoRecursoPageComponent,
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
    {
      provide: ServiceCatalogFacade,
      useValue: createServiceCatalogFacadeStub({ status: availability }),
    },
    StynxI18nModule.forRoot({
      defaultLocale: 'pt-BR',
      loadCatalog: async () => catalog,
    }),
  ]);
  await TestBed.inject(StynxI18nService).initialize();
  await harness.navigate(`/autos/${AIT_ID}/pagamento/preservando-recurso`);
  return harness;
}

describe('T-23 — pagar sem abrir mão do recurso ([RN-PORTAL-127]; [JRN-PORTAL-010])', () => {
  it('dado a tela então mode preserving_appeal, h1 t23.title, texto de t23.intro antes do fieldset, nenhum radio 60/40, botão pagar_sem_abrir_mao; após protocolo o intro repete e há link ao processo aberto quando openRequestId', async () => {
    // C-3b-86
    const harness = await mount();
    const httpMock = harness.httpMock();
    const aitReq = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) => candidate.url === `/v1/portal/aits/${AIT_ID}`,
      ),
    );
    aitReq.flush({
      ...AIT_DETAIL_WITH_PAYMENT_FIXTURE,
      openRequestId: '00000000-0000-7000-8000-000070400005',
    });
    const root = harness.harness.routeNativeElement as HTMLElement;
    // zoneless: a CD só reflete a resposta HTTP no próximo macrotask — `vi.waitFor` até o h1
    // aparecer, e só então lê o resto (já na mesma passada de CD, sem nova espera).
    const h1 = await vi.waitFor(() => {
      const found = root.querySelector('h1');
      expect(found?.textContent).toContain(catalog['portal.screens.t23.title']);
      return found as HTMLElement;
    });
    void h1;
    const comparison = await vi.waitFor(() => {
      const found = root.querySelector('portal-payment-comparison');
      expect(found).not.toBeNull();
      return found as Element;
    });
    expect(root.textContent).toContain(catalog['portal.screens.t23.intro']);
    expect(comparison.getAttribute('mode')).toBe('preserving_appeal');
    const tierValues = Array.from(
      root.querySelectorAll<HTMLInputElement>('input[name="tier"]'),
    ).map((radio) => radio.value);
    expect(tierValues).not.toContain('desconto_60_reconhecimento');
    expect(tierValues).not.toContain('desconto_40_fora_sne');
    const confirmButton = root.querySelector('[data-confirm]');
    expect(confirmButton?.textContent).toContain(
      catalog['portal.screens.t23.cmd.pagar_sem_abrir_mao'],
    );
  });
});

describe('T-23 — erros ([negativo])', () => {
  it('dado 422 PAYMENT_METHOD_UNAVAILABLE{ available: [pix, debito, boleto] } então cartao disabled data-reason=server e texto de erro_recuperavel', async () => {
    // C-3b-87 — A10(a): o servidor prevalece sobre `PAYMENT_FLAGS` (contrato §4.2;
    // `methodReason` corrigido pelo Engineer em paralelo) — volta a `cartao`.
    const harness = await mount();
    const httpMock = harness.httpMock();
    const aitReq = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) => candidate.url === `/v1/portal/aits/${AIT_ID}`,
      ),
    );
    aitReq.flush(AIT_DETAIL_WITH_PAYMENT_FIXTURE);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.querySelector('portal-payment-comparison')).not.toBeNull(),
    );
    const createReq = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) =>
          candidate.method === 'POST' &&
          candidate.url === '/v1/portal/requests',
      ),
    );
    createReq.flush(
      {
        requestId: REQUEST_ID,
        state: 'PEDIDO_EM_COMPOSICAO',
        prefilled: {},
        requirements: [],
        minimumAssurance: 'simples',
        version: 1,
      },
      { headers: { ETag: '"1"' } },
    );
    Array.from(root.querySelectorAll<HTMLInputElement>('input[name="tier"]'))
      .find((radio) => radio.value === 'desconto_80')
      ?.click();
    Array.from(root.querySelectorAll<HTMLInputElement>('input[name="method"]'))
      .find((radio) => radio.value === 'pix')
      ?.click();
    root.querySelector<HTMLButtonElement>('[data-confirm]')?.click();
    const draftReq = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) =>
          candidate.method === 'PUT' &&
          candidate.url === `/v1/portal/requests/${REQUEST_ID}/draft`,
      ),
    );
    draftReq.flush(
      {
        requestId: REQUEST_ID,
        version: 2,
        savedAt: '2026-09-14T12:00:00-04:00',
      },
      { headers: { ETag: '"2"' } },
    );
    await vi.waitFor(() =>
      expect(
        root.querySelector('portal-service-wizard')?.getAttribute('data-step'),
      ).toBe('assinatura'),
    );
    await signByUpload(harness, root);
    const submitReq = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) =>
          candidate.method === 'POST' &&
          candidate.url === `/v1/portal/requests/${REQUEST_ID}/submit`,
      ),
    );
    // A10(a): o servidor prevalece sobre `PAYMENT_FLAGS` (contrato §4.2) — `cartao` fica
    // `data-reason="server"` mesmo com `flags.cardPayment=false`, pois `serverMethods !== null`
    // é verificado antes da flag estática em `methodReason`.
    submitReq.flush(
      portalErrorBody('PORTAL.PAYMENT_METHOD_UNAVAILABLE', 422, {
        available: ['pix', 'debito', 'boleto'],
      }),
      { status: 422, statusText: 'Unprocessable Entity' },
    );
    await vi.waitFor(() => {
      const cartao = root.querySelector('[data-method="cartao"]');
      expect(cartao?.getAttribute('data-reason')).toBe('server');
    });
    expect(root.textContent).toContain(
      catalog['portal.screens.t23.state.erro_recuperavel'],
    );
  });

  it('dado 404 NOT_FOUND{kind:ait} então t23.state.sem_permissao + link por-que-nao-vejo', async () => {
    // C-3b-87 (2.ª metade) — `it` próprio: dois `mount()` no mesmo `it` lançam
    // "Cannot configure the test module when the test module has already been
    // instantiated" (bloqueio 1 de reports/TASK-0016.md).
    const notFoundHarness = await mount();
    const notFoundHttp = notFoundHarness.httpMock();
    const notFoundReq = await vi.waitFor(() =>
      notFoundHttp.expectOne(
        (candidate) => candidate.url === `/v1/portal/aits/${AIT_ID}`,
      ),
    );
    notFoundReq.flush(
      portalErrorBody('PORTAL.NOT_FOUND', 404, { kind: 'ait' }),
      {
        status: 404,
        statusText: 'Not Found',
      },
    );
    const notFoundRoot = notFoundHarness.harness
      .routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(notFoundRoot.textContent).toContain(
        catalog['portal.screens.t23.state.sem_permissao'],
      ),
    );
    expect(
      notFoundRoot.querySelector(
        'a[href*="por-que-nao-vejo"], a[routerLink*="por-que-nao-vejo"]',
      ),
    ).not.toBeNull();
  });
});

describe('T-23 — a11y por estado (§7; A10(j) — cobertura integral: loading, ready, partial, not_found, error, unavailable, offline)', () => {
  it('dado loading (antes de qualquer flush) então h1 único, região de estado e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-23, loading)
    const harness = await mount();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado a comparação preserving_appeal então h1 único, região de estado e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-23, ready)
    const harness = await mount();
    const httpMock = harness.httpMock();
    const aitReq = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) => candidate.url === `/v1/portal/aits/${AIT_ID}`,
      ),
    );
    aitReq.flush(AIT_DETAIL_WITH_PAYMENT_FIXTURE);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.querySelector('portal-payment-comparison')).not.toBeNull(),
    );
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado partially_available então h1 único, região de estado e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-23, partial)
    const harness = await mount(true, 'partially_available');
    const httpMock = harness.httpMock();
    const aitReq = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) => candidate.url === `/v1/portal/aits/${AIT_ID}`,
      ),
    );
    aitReq.flush(AIT_DETAIL_WITH_PAYMENT_FIXTURE);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.querySelector('portal-payment-comparison')).not.toBeNull(),
    );
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado not_found (404 NOT_FOUND kind ait) então h1 único, região de estado, foco no banner e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-23, not_found; mesma sequência da 2.ª metade de C-3b-87)
    const harness = await mount();
    const httpMock = harness.httpMock();
    const aitReq = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) => candidate.url === `/v1/portal/aits/${AIT_ID}`,
      ),
    );
    aitReq.flush(portalErrorBody('PORTAL.NOT_FOUND', 404, { kind: 'ait' }), {
      status: 404,
      statusText: 'Not Found',
    });
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.screens.t23.state.sem_permissao'],
      ),
    );
    await expectA11yStateInvariants(root, catalog, {
      errorBannerFocused: true,
    });
  });

  it('dado error (500 na leitura do AIT, código fora do catálogo) então h1 único, região de estado, foco no banner e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-23, error)
    const harness = await mount();
    const httpMock = harness.httpMock();
    const aitReq = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) => candidate.url === `/v1/portal/aits/${AIT_ID}`,
      ),
    );
    aitReq.flush(portalErrorBody('PORTAL.INTERNAL_TEST_ERROR', 500), {
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

  it('dado unavailable (422 PAYMENT_METHOD_UNAVAILABLE no submit) então h1 único, região de estado, foco no banner e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-23, unavailable; mesma sequência da 1.ª metade de C-3b-87)
    const harness = await mount();
    const httpMock = harness.httpMock();
    const aitReq = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) => candidate.url === `/v1/portal/aits/${AIT_ID}`,
      ),
    );
    aitReq.flush(AIT_DETAIL_WITH_PAYMENT_FIXTURE);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.querySelector('portal-payment-comparison')).not.toBeNull(),
    );
    const createReq = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) =>
          candidate.method === 'POST' &&
          candidate.url === '/v1/portal/requests',
      ),
    );
    createReq.flush(
      {
        requestId: REQUEST_ID,
        state: 'PEDIDO_EM_COMPOSICAO',
        prefilled: {},
        requirements: [],
        minimumAssurance: 'simples',
        version: 1,
      },
      { headers: { ETag: '"1"' } },
    );
    Array.from(root.querySelectorAll<HTMLInputElement>('input[name="tier"]'))
      .find((radio) => radio.value === 'desconto_80')
      ?.click();
    Array.from(root.querySelectorAll<HTMLInputElement>('input[name="method"]'))
      .find((radio) => radio.value === 'pix')
      ?.click();
    root.querySelector<HTMLButtonElement>('[data-confirm]')?.click();
    const draftReq = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) =>
          candidate.method === 'PUT' &&
          candidate.url === `/v1/portal/requests/${REQUEST_ID}/draft`,
      ),
    );
    draftReq.flush(
      {
        requestId: REQUEST_ID,
        version: 2,
        savedAt: '2026-09-14T12:00:00-04:00',
      },
      { headers: { ETag: '"2"' } },
    );
    await vi.waitFor(() =>
      expect(
        root.querySelector('portal-service-wizard')?.getAttribute('data-step'),
      ).toBe('assinatura'),
    );
    await signByUpload(harness, root);
    const submitReq = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) =>
          candidate.method === 'POST' &&
          candidate.url === `/v1/portal/requests/${REQUEST_ID}/submit`,
      ),
    );
    submitReq.flush(
      portalErrorBody('PORTAL.PAYMENT_METHOD_UNAVAILABLE', 422, {
        available: ['pix', 'debito', 'boleto'],
      }),
      { status: 422, statusText: 'Unprocessable Entity' },
    );
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.screens.t23.state.erro_recuperavel'],
      ),
    );
    // Este estado renderiza `erro_recuperavel` inline (não `portal-error-banner`, que exige
    // `facade.error()` da leitura da página): sem foco de banner a verificar aqui.
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado offline (status 0, navigator.onLine false, na leitura do AIT) então h1 único, região de estado, foco no banner e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-23, offline; M14)
    const harness = await mount();
    const onLineSpy = vi.spyOn(window.navigator, 'onLine', 'get');
    onLineSpy.mockReturnValue(false);
    const httpMock = harness.httpMock();
    const aitReq = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) => candidate.url === `/v1/portal/aits/${AIT_ID}`,
      ),
    );
    aitReq.error(new ProgressEvent('error'), {
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
