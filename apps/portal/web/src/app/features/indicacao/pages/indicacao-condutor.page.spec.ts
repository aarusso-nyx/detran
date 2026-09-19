// R-0014 TASK-0015 (Inspector). CTG-0003b §6 T-05 (`IndicacaoCondutorPageComponent`); página
// real, ainda inexistente (§1) — "Cannot find module" até TASK-0016 (esperado, §9).
import { IndicacaoCondutorPageComponent } from './indicacao-condutor.page'; // §9: importação direta força "Cannot find module" (falha esperada até TASK-0016).
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
import { expectNoSeriousA11yViolations } from '../../../a11y/axe.spec-helper';
import { expectA11yStateInvariants } from '../../../../testing/a11y-state.spec-helper';

const catalog = portalCatalog as Record<string, string>;
const REQUEST_ID = '00000000-0000-7000-8000-0000ee500001';

async function mountUnflushed() {
  const harness = await createPortalRouterHarness(PORTAL_ROUTES, [
    IndicacaoCondutorPageComponent,
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
  await harness.navigate(`/autos/${AIT_ID}/condutor/nova`);
  return harness;
}

async function mount() {
  const harness = await mountUnflushed();
  const httpMock = harness.httpMock();
  const aitReq = await vi.waitFor(() =>
    httpMock.expectOne(
      (candidate) => candidate.url === `/v1/portal/aits/${AIT_ID}`,
    ),
  );
  aitReq.flush(AIT_DETAIL_FIXTURE);
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
      minimumAssurance: 'avancada',
      version: 1,
    },
    { headers: { ETag: '"1"' } },
  );
  return harness;
}

function fillDriverForm(root: HTMLElement) {
  const set = (name: string, value: string, tag = 'input') => {
    const el = root.querySelector<HTMLInputElement | HTMLSelectElement>(
      `${tag}[name="${name}"]`,
    );
    if (!el) return;
    el.value = value;
    el.dispatchEvent(new Event('input'));
    el.dispatchEvent(new Event('change'));
  };
  set('driver.cpf', '52998224725');
  set('driver.cnhNumber', '12345678900');
  set('driver.cnhUf', 'AM', 'select');
  set('driver.category', 'B', 'select');
  set('driver.name', 'Fulano de Tal');
}

describe('T-05 — formulário do condutor ([UC-PORTAL-004] AC-1/AC-2)', () => {
  it('dado 201 então inputs driver.cpf/cnhNumber/cnhUf/category/name, grupo signatures.owner e signatures.driver com o hint de assinatura; prefilled só via portal-prefilled-field', async () => {
    // C-3b-77
    const harness = await mount();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.querySelector('input[name="driver.cpf"]')).not.toBeNull(),
    );
    for (const name of ['driver.cpf', 'driver.cnhNumber', 'driver.name']) {
      expect(root.querySelector(`input[name="${name}"]`)).not.toBeNull();
    }
    expect(
      root.querySelector(
        'select[name="driver.cnhUf"], input[name="driver.cnhUf"]',
      ),
    ).not.toBeNull();
    expect(
      root.querySelector(
        'select[name="driver.category"], input[name="driver.category"]',
      ),
    ).not.toBeNull();
    expect(root.textContent).toContain(
      catalog['portal.forms.indicacao_condutor.assinatura_hint'],
    );
    const rawFields = root.querySelectorAll(
      'input[name^="prefilled"], output[name^="prefilled"]',
    );
    for (const field of Array.from(rawFields)) {
      expect(field.tagName.toLowerCase()).not.toBe('input');
    }
  });
});

describe('T-05 — consequência antes do ato ([UC-PORTAL-004] AC-3; [DIVERGE-5])', () => {
  it('dado clique em "continuar" sem consequenceAck então portal-consequence-dialog aberto com document consequencias_indicacao e o texto de legal.consequencias_indicacao.v1, e NENHUM PUT draft; ao confirmar então PUT draft com o ack; ao cancelar então nada', async () => {
    // C-3b-78
    const harness = await mount();
    const httpMock = harness.httpMock();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.querySelector('input[name="driver.cpf"]')).not.toBeNull(),
    );
    fillDriverForm(root);
    root.querySelector<HTMLButtonElement>('[data-continue]')?.click();
    const dialog = await vi.waitFor(() => {
      const found = root.querySelector(
        'portal-consequence-dialog [role="dialog"]',
      );
      expect(found).not.toBeNull();
      return found as HTMLElement;
    });
    expect(dialog.getAttribute('data-document')).toBe(
      'consequencias_indicacao',
    );
    expect(dialog.textContent).toContain(
      catalog['portal.legal.consequencias_indicacao.v1'],
    );
    httpMock.expectNone(
      (candidate) =>
        candidate.method === 'PUT' && candidate.url.endsWith('/draft'),
    );
    dialog.querySelector<HTMLInputElement>('input[type="checkbox"]')!.checked =
      true;
    dialog
      .querySelector('input[type="checkbox"]')
      ?.dispatchEvent(new Event('change', { bubbles: true }));
    // Bloqueio 6 de reports/TASK-0016.md: o botão só habilita no próximo ciclo de CD do
    // ConsequenceDialog (par 1, congelado) — espera antes de clicar.
    await vi.waitFor(() =>
      expect(
        dialog.querySelector<HTMLButtonElement>('[data-confirm]')?.disabled,
      ).toBe(false),
    );
    dialog.querySelector<HTMLButtonElement>('[data-confirm]')?.click();
    const draftReq = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) =>
          candidate.method === 'PUT' &&
          candidate.url === `/v1/portal/requests/${REQUEST_ID}/draft`,
      ),
    );
    expect(draftReq.request.body).toMatchObject({
      consequenceAck: { textVersion: 'v1' },
    });
  });
});

describe('T-05 — CPF/campo inválido ([UC-PORTAL-004] 6a) [negativo]', () => {
  it('dado PUT draft → 422 INDICATION_DRIVER_INVALID{ fields: [driver.cpf] } então input driver.cpf com aria-invalid true e foco, demais valores intactos, texto de state.error_recoverable', async () => {
    // C-3b-79
    const harness = await mount();
    const httpMock = harness.httpMock();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.querySelector('input[name="driver.cpf"]')).not.toBeNull(),
    );
    fillDriverForm(root);
    root.querySelector<HTMLButtonElement>('[data-continue]')?.click();
    const dialog = await vi.waitFor(
      () =>
        root.querySelector(
          'portal-consequence-dialog [role="dialog"]',
        ) as HTMLElement,
    );
    dialog.querySelector<HTMLInputElement>('input[type="checkbox"]')!.checked =
      true;
    dialog
      .querySelector('input[type="checkbox"]')
      ?.dispatchEvent(new Event('change', { bubbles: true }));
    // Bloqueio 6 de reports/TASK-0016.md: o botão só habilita no próximo ciclo de CD do
    // ConsequenceDialog (par 1, congelado) — espera antes de clicar.
    await vi.waitFor(() =>
      expect(
        dialog.querySelector<HTMLButtonElement>('[data-confirm]')?.disabled,
      ).toBe(false),
    );
    dialog.querySelector<HTMLButtonElement>('[data-confirm]')?.click();
    const draftReq = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) =>
          candidate.method === 'PUT' &&
          candidate.url === `/v1/portal/requests/${REQUEST_ID}/draft`,
      ),
    );
    draftReq.flush(
      portalErrorBody('PORTAL.INDICATION_DRIVER_INVALID', 422, {
        fields: ['driver.cpf'],
      }),
      { status: 422, statusText: 'Unprocessable Entity' },
    );
    await vi.waitFor(() =>
      expect(
        root
          .querySelector('input[name="driver.cpf"]')
          ?.getAttribute('aria-invalid'),
      ).toBe('true'),
    );
    expect(
      root.querySelector<HTMLInputElement>('input[name="driver.name"]')?.value,
    ).toBe('Fulano de Tal');
    expect(root.textContent).toContain(
      catalog['portal.screens.t05.state.error_recoverable'],
    );
  });
});

describe('T-05 — segunda assinatura pendente (T05 §5)', () => {
  it('dado code INDICATION_SECOND_SIGNATURE_PENDING{ pendingSigner } então texto de state.pending_signature em role=status (info), nenhum banner de erro', async () => {
    // C-3b-80
    const harness = await mount();
    const httpMock = harness.httpMock();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.querySelector('input[name="driver.cpf"]')).not.toBeNull(),
    );
    fillDriverForm(root);
    root.querySelector<HTMLButtonElement>('[data-continue]')?.click();
    const dialog = await vi.waitFor(
      () =>
        root.querySelector(
          'portal-consequence-dialog [role="dialog"]',
        ) as HTMLElement,
    );
    dialog.querySelector<HTMLInputElement>('input[type="checkbox"]')!.checked =
      true;
    dialog
      .querySelector('input[type="checkbox"]')
      ?.dispatchEvent(new Event('change', { bubbles: true }));
    // Bloqueio 6 de reports/TASK-0016.md: o botão só habilita no próximo ciclo de CD do
    // ConsequenceDialog (par 1, congelado) — espera antes de clicar.
    await vi.waitFor(() =>
      expect(
        dialog.querySelector<HTMLButtonElement>('[data-confirm]')?.disabled,
      ).toBe(false),
    );
    dialog.querySelector<HTMLButtonElement>('[data-confirm]')?.click();
    const draftReq = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) =>
          candidate.method === 'PUT' &&
          candidate.url === `/v1/portal/requests/${REQUEST_ID}/draft`,
      ),
    );
    draftReq.flush(
      portalErrorBody('PORTAL.INDICATION_SECOND_SIGNATURE_PENDING', 200, {
        pendingSigner: 'driver',
      }),
    );
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.screens.t05.state.pending_signature'],
      ),
    );
    const status = root.querySelector('[role="status"]');
    expect(status?.textContent).toContain(
      catalog['portal.screens.t05.state.pending_signature'],
    );
    expect(root.querySelector('[role="alert"]')).toBeNull();
  });
});

describe('T-05 — janela de indicação encerrada [negativo]', () => {
  it('dado POST requests → 422 INDICATION_WINDOW_CLOSED{ dueOn } então t05.state.ineligible e canal alternativo', async () => {
    // C-3b-81
    const harness = await createPortalRouterHarness(PORTAL_ROUTES, [
      IndicacaoCondutorPageComponent,
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
    await harness.navigate(`/autos/${AIT_ID}/condutor/nova`);
    const httpMock = harness.httpMock();
    const aitReq = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) => candidate.url === `/v1/portal/aits/${AIT_ID}`,
      ),
    );
    aitReq.flush(AIT_DETAIL_FIXTURE);
    const createReq = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) =>
          candidate.method === 'POST' &&
          candidate.url === '/v1/portal/requests',
      ),
    );
    createReq.flush(
      portalErrorBody('PORTAL.INDICATION_WINDOW_CLOSED', 422, {
        dueOn: '2026-09-01',
      }),
      { status: 422, statusText: 'Unprocessable Entity' },
    );
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.screens.t05.state.ineligible'],
      ),
    );
    expect(
      root.querySelector('portal-alternative-channel-note'),
    ).not.toBeNull();
    await expectNoSeriousA11yViolations(root);
  });
});

describe('T-05 — a11y por estado (§7; A10(j) — cobertura integral: loading, composicao, diálogo de consequência, ineligible, not_found, error, offline)', () => {
  it('dado loading (antes de qualquer flush) então h1 único, região de estado e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-05, loading)
    const harness = await mountUnflushed();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado o passo composição e o ConsequenceDialog aberto então h1 único, região de estado e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-05, composicao/ready)
    const harness = await mount();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.querySelector('input[name="driver.cpf"]')).not.toBeNull(),
    );
    await expectA11yStateInvariants(root, catalog);
    fillDriverForm(root);
    root.querySelector<HTMLButtonElement>('[data-continue]')?.click();
    await vi.waitFor(() =>
      expect(
        root.querySelector('portal-consequence-dialog [role="dialog"]'),
      ).not.toBeNull(),
    );
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado ineligible (422 INDICATION_WINDOW_CLOSED) então h1 único, região de estado e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-05, ineligible; mesma sequência de C-3b-81)
    const harness = await mountUnflushed();
    const httpMock = harness.httpMock();
    const aitReq = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) => candidate.url === `/v1/portal/aits/${AIT_ID}`,
      ),
    );
    aitReq.flush(AIT_DETAIL_FIXTURE);
    const createReq = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) =>
          candidate.method === 'POST' &&
          candidate.url === '/v1/portal/requests',
      ),
    );
    createReq.flush(
      portalErrorBody('PORTAL.INDICATION_WINDOW_CLOSED', 422, {
        dueOn: '2026-09-01',
      }),
      { status: 422, statusText: 'Unprocessable Entity' },
    );
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.screens.t05.state.ineligible'],
      ),
    );
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado unavailable (422 SERVICE_UNAVAILABLE no POST requests, M15) então h1 único, região de estado e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-05, unavailable; nos moldes de C-3b-71/T-02)
    const harness = await mountUnflushed();
    const httpMock = harness.httpMock();
    const aitReq = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) => candidate.url === `/v1/portal/aits/${AIT_ID}`,
      ),
    );
    aitReq.flush(AIT_DETAIL_FIXTURE);
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
        catalog['portal.screens.t05.state.unavailable'],
      ),
    );
    // `unavailableReason()` compõe o texto de estado a partir de `lastFailure`/`onFailed`
    // (wizard `failed`), sem passar por `portal-error-banner` — sem foco de banner a verificar.
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado not_found (404 na leitura do AIT) então h1 único, região de estado, foco no banner e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-05, not_found)
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

  it('dado error (500, código fora do catálogo) então h1 único, região de estado, foco no banner e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-05, error)
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

  it('dado offline (status 0, navigator.onLine false) então h1 único, região de estado, foco no banner e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-05, offline; M14)
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
