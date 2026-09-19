// R-0014 TASK-0015 (Inspector). CTG-0003b §6 T-13 (`PagamentoPageComponent`); página real, ainda
// inexistente (§1) — "Cannot find module" até TASK-0016 (esperado, §9).
import { PagamentoPageComponent } from './pagamento.page'; // §9: importação direta força "Cannot find module" (falha esperada até TASK-0016).
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
const REQUEST_ID = '00000000-0000-7000-8000-0000ee600001';

async function mountUnflushed(
  availability: 'available' | 'partially_available' = 'available',
) {
  const harness = await createPortalRouterHarness(PORTAL_ROUTES, [
    PagamentoPageComponent,
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
      useValue: createServiceCatalogFacadeStub({ status: availability }),
    },
    StynxI18nModule.forRoot({
      defaultLocale: 'pt-BR',
      loadCatalog: async () => catalog,
    }),
  ]);
  await TestBed.inject(StynxI18nService).initialize();
  await harness.navigate(`/autos/${AIT_ID}/pagamento`);
  return harness;
}

async function mount(
  availability: 'available' | 'partially_available' = 'available',
) {
  const harness = await mountUnflushed(availability);
  const httpMock = harness.httpMock();
  const aitReq = await vi.waitFor(() =>
    httpMock.expectOne(
      (candidate) => candidate.url === `/v1/portal/aits/${AIT_ID}`,
    ),
  );
  aitReq.flush(AIT_DETAIL_WITH_PAYMENT_FIXTURE);
  return harness;
}

async function start(harness: Awaited<ReturnType<typeof mount>>) {
  const httpMock = harness.httpMock();
  const createReq = await vi.waitFor(() =>
    httpMock.expectOne(
      (candidate) =>
        candidate.method === 'POST' && candidate.url === '/v1/portal/requests',
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
}

/**
 * A9(d) de plan.md (bloqueio 5 de reports/TASK-0016.md): enquanto OD-P60 pender, o
 * `SignatureStep` (par 1, congelado) desabilita `[data-method="govbr"]` sem `govbrSignatureRef`
 * — os specs assinam pelo caminho `upload` (documento assinado → `signatureRef` do anexo), nunca
 * `govbr` sem `signatureRef`. Mesma técnica de `data/portal.client.spec.ts` (C-3a-18: `fetch`
 * global stubado para `uploadToSignedUrl`).
 */
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
  const attachmentId = '00000000-0000-7000-8000-0000aa900001';
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
  completeReq.flush({ attachmentId, sha256: 'a'.repeat(64) });
  vi.unstubAllGlobals();
}

describe('T-13 — comparação lado a lado ([UC-PORTAL-015] AC-1)', () => {
  it('dado GET aits → payment com faixas e availability partially_available então portal-payment-comparison mode comparison, banner role=status com service_partially_available, e as faixas 80/60 lado a lado sem clique', async () => {
    // C-3b-82
    const harness = await mount('partially_available');
    await start(harness);
    const root = harness.harness.routeNativeElement as HTMLElement;
    const comparison = await vi.waitFor(() => {
      const found = root.querySelector('portal-payment-comparison');
      expect(found).not.toBeNull();
      return found as HTMLElement;
    });
    expect(comparison.getAttribute('mode')).toBe('comparison');
    const status = root.querySelector('[role="status"]');
    expect(status?.textContent).toContain(
      catalog['portal.errors.service_partially_available'],
    );
    const radios = comparison.querySelectorAll('input[name="tier"]');
    expect(radios.length).toBeGreaterThanOrEqual(2);
  });
});

describe('T-13 — renúncia via ConsequenceDialog (§4.3 3)', () => {
  it('dado waiverRequested(desconto_60_reconhecimento) então portal-consequence-dialog com document renuncia_40, texto legal.renuncia_40.v1 e data-text-version v1; confirmar então waiverAck e a faixa selecionada; Escape então tier não selecionada', async () => {
    // C-3b-83
    const harness = await mount();
    await start(harness);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.querySelector('portal-payment-comparison')).not.toBeNull(),
    );
    const sneRadio = Array.from(
      root.querySelectorAll<HTMLInputElement>('input[name="tier"]'),
    ).find((radio) => radio.value === 'desconto_60_reconhecimento');
    sneRadio?.click();
    const dialog = await vi.waitFor(() => {
      const found = root.querySelector(
        'portal-consequence-dialog [role="dialog"]',
      );
      expect(found).not.toBeNull();
      return found as HTMLElement;
    });
    expect(dialog.getAttribute('data-document')).toBe('renuncia_40');
    expect(dialog.getAttribute('data-text-version')).toBe('v1');
    expect(dialog.textContent).toContain(
      catalog['portal.legal.renuncia_40.v1'],
    );
    dialog.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    await vi.waitFor(() =>
      expect(
        root.querySelector('portal-consequence-dialog [role="dialog"]'),
      ).toBeNull(),
    );
    expect(
      Array.from(
        root.querySelectorAll<HTMLInputElement>('input[name="tier"]'),
      ).some((radio) => radio.checked),
    ).toBe(false);
  });
});

describe('T-13 — confirmar, assinar, protocolar (M15; OD-P74) [negativo]', () => {
  it('dado confirmed({ tier: desconto_80, method: pix }) então draft e passo assinatura; após submit 200 então protocol-receipt e o documento de arrecadação indisponível, nenhum código simulado', async () => {
    // C-3b-84
    const harness = await mount();
    await start(harness);
    const httpMock = harness.httpMock();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.querySelector('portal-payment-comparison')).not.toBeNull(),
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
    expect(draftReq.request.body).toMatchObject({
      tier: 'desconto_80',
      method: 'pix',
    });
    draftReq.flush(
      {
        requestId: REQUEST_ID,
        version: 2,
        savedAt: '2026-09-14T12:00:00-04:00',
      },
      { headers: { ETag: '"2"' } },
    );
    await vi.waitFor(() => {
      const wizard = root.querySelector('portal-service-wizard');
      expect(wizard?.getAttribute('data-step')).toBe('assinatura');
    });
    await signByUpload(harness, root);
    // C-3b-84 — A10(k): o `expectOne` do `submit` é obrigatório (não `.catch(() => null)`/`if`):
    // uma regressão que suprima o POST deixaria o `it` verde sem checar nada (M15/OD-P74).
    const submitReq = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) =>
          candidate.method === 'POST' &&
          candidate.url === `/v1/portal/requests/${REQUEST_ID}/submit`,
      ),
    );
    submitReq.flush(
      {
        requestId: REQUEST_ID,
        state: 'EM_ANDAMENTO_NO_ORGAO',
        protocol: {
          number: 'AM-FIXTURES-2026-0000099',
          issuedAt: '2026-09-14T12:00:00-04:00',
          channel: 'portal',
        },
        delegation: { status: 'delegated' },
        version: 3,
      },
      { headers: { ETag: '"3"' } },
    );
    await vi.waitFor(() =>
      expect(root.querySelector('portal-protocol-receipt')).not.toBeNull(),
    );
    expect(root.textContent).toContain(
      catalog['portal.states.unavailable_in_version'],
    );
    expect(root.textContent).not.toMatch(/pixCopyPaste|barcode|\d{44,}/);
  });
});

describe('T-13 — erros de pagamento', () => {
  it('dado 503 PAYMENT_PROVIDER_UNAVAILABLE então banner com payment_provider_unavailable + retry + canal; dado 422 PAYMENT_TIER_NOT_AVAILABLE então faixa 80 disabled data-reason=server; dado 409 PAYMENT_ALREADY_PAID então C-3b-38 na página [negativo]', async () => {
    // C-3b-85
    const harness = await mount();
    await start(harness);
    const httpMock = harness.httpMock();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.querySelector('portal-payment-comparison')).not.toBeNull(),
    );
    Array.from(root.querySelectorAll<HTMLInputElement>('input[name="tier"]'))
      .find((radio) => radio.value === 'integral_juros')
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
      portalErrorBody('PORTAL.PAYMENT_PROVIDER_UNAVAILABLE', 503, {
        retryAfter: 60,
        alternative: 'Atendimento presencial',
      }),
      { status: 503, statusText: 'Service Unavailable' },
    );
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.errors.payment_provider_unavailable'],
      ),
    );
    expect(
      root.querySelector('portal-alternative-channel-note'),
    ).not.toBeNull();
    expect(root.querySelector('[data-next-step="retry"]')).not.toBeNull();
  });

  it('dado submit → 422 PAYMENT_TIER_NOT_AVAILABLE{ tier: desconto_80, availableTiers: [integral_juros] } então a faixa desconto_80 fica disabled com data-reason="server" [negativo]', async () => {
    // C-3b-85 (segunda parte)
    const harness = await mount();
    await start(harness);
    const httpMock = harness.httpMock();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.querySelector('portal-payment-comparison')).not.toBeNull(),
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
      portalErrorBody('PORTAL.PAYMENT_TIER_NOT_AVAILABLE', 422, {
        tier: 'desconto_80',
        availableTiers: ['integral_juros'],
      }),
      { status: 422, statusText: 'Unprocessable Entity' },
    );
    await vi.waitFor(() => {
      const host = root.querySelector('[data-tier="desconto_80"]');
      expect(host?.getAttribute('data-reason')).toBe('server');
    });
  });

  it('dado submit → 409 PAYMENT_ALREADY_PAID então todas as faixas ficam disabled com data-reason="paid" e nenhum [data-confirm] (mesmo efeito de C-3b-38) [negativo]', async () => {
    // C-3b-85 (terceira parte)
    const harness = await mount();
    await start(harness);
    const httpMock = harness.httpMock();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.querySelector('portal-payment-comparison')).not.toBeNull(),
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
    submitReq.flush(portalErrorBody('PORTAL.PAYMENT_ALREADY_PAID', 409), {
      status: 409,
      statusText: 'Conflict',
    });
    await vi.waitFor(() => {
      const radios = Array.from(
        root.querySelectorAll<HTMLInputElement>('input[name="tier"]'),
      );
      expect(radios.every((radio) => radio.disabled)).toBe(true);
    });
    expect(root.querySelector('[data-confirm]')).toBeNull();
  });
});

describe('T-13 — a11y por estado (§7; A10(j) — cobertura integral: loading, ready, partial, not_found, error, unavailable, offline)', () => {
  it('dado loading (antes de qualquer flush) então h1 único, região de estado e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-13, loading)
    const harness = await mountUnflushed();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado comparação disponível então h1 único, região de estado e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-13, ready)
    const harness = await mount();
    await start(harness);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.querySelector('portal-payment-comparison')).not.toBeNull(),
    );
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado partially_available então h1 único, região de estado e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-13, partial)
    const harness = await mount('partially_available');
    await start(harness);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.querySelector('portal-payment-comparison')).not.toBeNull(),
    );
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado not_found (404 na leitura do AIT) então h1 único, região de estado, foco no banner e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-13, not_found)
    const harness = await mountUnflushed();
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
    await vi.waitFor(() => {
      const found = root.querySelector('[role="alert"]');
      expect(found?.textContent?.trim()).toBeTruthy();
    });
    await expectA11yStateInvariants(root, catalog, {
      errorBannerFocused: true,
    });
  });

  it('dado error (500 na leitura do AIT, código fora do catálogo) então h1 único, região de estado, foco no banner e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-13, error)
    const harness = await mountUnflushed();
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

  it('dado unavailable (503 PAYMENT_PROVIDER_UNAVAILABLE no submit) então h1 único, região de estado, foco no banner e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-13, unavailable; mesma sequência de C-3b-85)
    const harness = await mount();
    await start(harness);
    const httpMock = harness.httpMock();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.querySelector('portal-payment-comparison')).not.toBeNull(),
    );
    Array.from(root.querySelectorAll<HTMLInputElement>('input[name="tier"]'))
      .find((radio) => radio.value === 'integral_juros')
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
      portalErrorBody('PORTAL.PAYMENT_PROVIDER_UNAVAILABLE', 503, {
        retryAfter: 60,
        alternative: 'Atendimento presencial',
      }),
      { status: 503, statusText: 'Service Unavailable' },
    );
    await vi.waitFor(() => {
      const found = root.querySelector('[role="alert"]');
      expect(found?.textContent?.trim()).toBeTruthy();
    });
    await expectA11yStateInvariants(root, catalog, {
      errorBannerFocused: true,
    });
  });

  it('dado offline (status 0, navigator.onLine false, na leitura do AIT) então h1 único, região de estado, foco no banner e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-13, offline; M14)
    const harness = await mountUnflushed();
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
