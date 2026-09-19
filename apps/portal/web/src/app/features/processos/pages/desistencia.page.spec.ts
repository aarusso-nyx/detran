// R-0014 TASK-0015 (Inspector). CTG-0003b §6 T-08 (`DesistenciaPageComponent`); página real,
// ainda inexistente (§1) — "Cannot find module" até TASK-0016 (esperado, §9).
import { DesistenciaPageComponent } from './desistencia.page'; // §9: importação direta força "Cannot find module" (falha esperada até TASK-0016).
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
  REQUEST_DETAIL_FIXTURE,
  REQUEST_EM_ANDAMENTO_ID,
} from '../../../../testing/http-fixtures-reads';
import { portalErrorBody } from '../../../../testing/http-fixtures';
import { expectA11yStateInvariants } from '../../../../testing/a11y-state.spec-helper';

const catalog = portalCatalog as Record<string, string>;

async function mount() {
  const harness = await createPortalRouterHarness(PORTAL_ROUTES, [
    DesistenciaPageComponent,
    {
      provide: SessionFacade,
      useValue: createSessionFacadeStub({
        active: true,
        assuranceLevel: 'simples',
      }),
    },
    { provide: EntitlementFacade, useValue: createEntitlementFacadeStub(true) },
    StynxI18nModule.forRoot({
      defaultLocale: 'pt-BR',
      loadCatalog: async () => catalog,
    }),
  ]);
  await TestBed.inject(StynxI18nService).initialize();
  await harness.navigate(`/processos/${REQUEST_EM_ANDAMENTO_ID}/desistencia`);
  return harness;
}

async function flushDetail(
  harness: Awaited<ReturnType<typeof mount>>,
  body: Record<string, unknown>,
  etag = '"1"',
) {
  const httpMock = harness.httpMock();
  const req = await vi.waitFor(() =>
    httpMock.expectOne(
      (candidate) =>
        candidate.url === `/v1/portal/requests/${REQUEST_EM_ANDAMENTO_ID}`,
    ),
  );
  req.flush(body, { headers: { ETag: etag } });
}

describe('T-08 — texto jurídico, confirmação e desistência ([UC-PORTAL-006] AC-1/AC-2/AC-4)', () => {
  it('dado canWithdraw true, ETag "1" então a região do texto jurídico tem o foco e precede o formulário; cmd.confirm desabilitado até marcar confirm; marcar + confirmar então POST withdraw com If-Match, body { confirm: true } e Idempotency-Key withdraw:…; 200 DESISTIDO então situation.request.DESISTIDO e link /processos/<id>; dado targetKind ait então link /autos/<targetId>/pagamento', async () => {
    // C-3b-93
    const harness = await mount();
    await flushDetail(harness, {
      ...REQUEST_DETAIL_FIXTURE,
      request: {
        ...REQUEST_DETAIL_FIXTURE.request,
        targetKind: 'ait',
        targetId: '00000000-0000-7000-8000-0000f0000002',
      },
      actions: {
        ...REQUEST_DETAIL_FIXTURE.actions,
        canWithdraw: true,
        withdrawalBlockedReason: null,
      },
    });
    const root = harness.harness.routeNativeElement as HTMLElement;
    const legalRegion = await vi.waitFor(() => {
      const found = root.querySelector('[data-text-version="v1"]');
      expect(found).not.toBeNull();
      return found as HTMLElement;
    });
    expect(legalRegion.textContent).toContain(
      catalog['portal.legal.consequencias_desistencia.v1'],
    );
    await vi.waitFor(() => expect(document.activeElement).toBe(legalRegion));
    const form = root.querySelector('form');
    expect(
      legalRegion.compareDocumentPosition(form as Node) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    const confirmButton =
      root.querySelector<HTMLButtonElement>('[data-confirm]');
    expect(confirmButton?.disabled).toBe(true);
    const checkbox = root.querySelector<HTMLInputElement>(
      'input[name="confirm"]',
    );
    checkbox!.checked = true;
    checkbox?.dispatchEvent(new Event('change'));
    expect(
      root.querySelector<HTMLButtonElement>('[data-confirm]')?.disabled,
    ).toBe(false);
    root.querySelector<HTMLButtonElement>('[data-confirm]')?.click();
    const httpMock = harness.httpMock();
    const withdrawReq = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) =>
          candidate.method === 'POST' &&
          candidate.url ===
            `/v1/portal/requests/${REQUEST_EM_ANDAMENTO_ID}/withdraw`,
      ),
    );
    expect(withdrawReq.request.headers.get('If-Match')).toBe('"1"');
    expect(withdrawReq.request.body).toEqual({ confirm: true });
    expect(withdrawReq.request.headers.get('Idempotency-Key')).toMatch(
      new RegExp(`^withdraw:${REQUEST_EM_ANDAMENTO_ID}:[0-9a-f]{64}$`),
    );
    withdrawReq.flush({
      requestId: REQUEST_EM_ANDAMENTO_ID,
      state: 'DESISTIDO',
      withdrawnAt: '2026-09-14T12:00:00-04:00',
      version: 2,
    });
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.situation.request.DESISTIDO'],
      ),
    );
    expect(
      root.querySelector(
        `a[routerLink="/processos/${REQUEST_EM_ANDAMENTO_ID}"]`,
      ),
    ).not.toBeNull();
    expect(
      root.querySelector(
        'a[routerLink="/autos/00000000-0000-7000-8000-0000f0000002/pagamento"]',
      ),
    ).not.toBeNull();
  });
});

describe('T-08 — inelegível ([UC-PORTAL-006] AC-3) [negativo]', () => {
  it('dado canWithdraw false com withdrawalBlockedReason julgado então t08.state.ineligible, data-reason, nenhum formulário e link de volta; dado POST withdraw → 409 WITHDRAWAL_AFTER_JUDGMENT então o mesmo texto + banner', async () => {
    // C-3b-94
    const harness = await mount();
    await flushDetail(harness, {
      ...REQUEST_DETAIL_FIXTURE,
      actions: {
        ...REQUEST_DETAIL_FIXTURE.actions,
        canWithdraw: false,
        withdrawalBlockedReason: 'julgado',
      },
    });
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.screens.t08.state.ineligible'],
      ),
    );
    expect(root.querySelector('[data-reason="julgado"]')).not.toBeNull();
    expect(root.querySelector('form')).toBeNull();
    expect(
      root.querySelector(
        `a[routerLink="/processos/${REQUEST_EM_ANDAMENTO_ID}"]`,
      ),
    ).not.toBeNull();
  });

  it('dado POST withdraw → 409 WITHDRAWAL_AFTER_JUDGMENT então o texto de t08.state.ineligible + banner de errors.withdrawal_after_judgment', async () => {
    // C-3b-94 (segunda parte)
    const harness = await mount();
    await flushDetail(harness, {
      ...REQUEST_DETAIL_FIXTURE,
      actions: {
        ...REQUEST_DETAIL_FIXTURE.actions,
        canWithdraw: true,
        withdrawalBlockedReason: null,
      },
    });
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.querySelector('input[name="confirm"]')).not.toBeNull(),
    );
    const checkbox = root.querySelector<HTMLInputElement>(
      'input[name="confirm"]',
    )!;
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change'));
    root.querySelector<HTMLButtonElement>('[data-confirm]')?.click();
    const httpMock = harness.httpMock();
    const withdrawReq = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) =>
          candidate.method === 'POST' &&
          candidate.url ===
            `/v1/portal/requests/${REQUEST_EM_ANDAMENTO_ID}/withdraw`,
      ),
    );
    withdrawReq.flush(
      portalErrorBody('PORTAL.WITHDRAWAL_AFTER_JUDGMENT', 409, {
        state: 'PROTOCOLADO',
      }),
      { status: 409, statusText: 'Conflict' },
    );
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.errors.withdrawal_after_judgment'],
      ),
    );
  });
});

describe('T-08 — cancelar ([UC-PORTAL-006] 3a)', () => {
  it('dado cmd.cancel então navegação para /processos/<id> e nenhuma requisição de escrita', async () => {
    // C-3b-95 (1.ª metade)
    const harness = await mount();
    await flushDetail(harness, {
      ...REQUEST_DETAIL_FIXTURE,
      actions: {
        ...REQUEST_DETAIL_FIXTURE.actions,
        canWithdraw: true,
        withdrawalBlockedReason: null,
      },
    });
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.querySelector('[data-cancel]')).not.toBeNull(),
    );
    root.querySelector<HTMLButtonElement>('[data-cancel]')?.click();
    await vi.waitFor(() =>
      expect(harness.currentUrl()).toBe(
        `/processos/${REQUEST_EM_ANDAMENTO_ID}`,
      ),
    );
    harness.httpMock().expectNone((candidate) => candidate.method === 'POST');
  });
});

describe('T-08 — 412 na confirmação ([UC-PORTAL-006] AC-1)', () => {
  it('dado 412 então banner nextStep reload e o formulário permanece', async () => {
    // C-3b-95 (2.ª metade)
    const harness = await mount();
    await flushDetail(harness, {
      ...REQUEST_DETAIL_FIXTURE,
      actions: {
        ...REQUEST_DETAIL_FIXTURE.actions,
        canWithdraw: true,
        withdrawalBlockedReason: null,
      },
    });
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.querySelector('input[name="confirm"]')).not.toBeNull(),
    );
    const checkbox = root.querySelector<HTMLInputElement>(
      'input[name="confirm"]',
    )!;
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change'));
    root.querySelector<HTMLButtonElement>('[data-confirm]')?.click();
    const httpMock = harness.httpMock();
    const withdrawReq = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) =>
          candidate.method === 'POST' &&
          candidate.url ===
            `/v1/portal/requests/${REQUEST_EM_ANDAMENTO_ID}/withdraw`,
      ),
    );
    withdrawReq.flush(portalErrorBody('PORTAL.VERSION_CONFLICT', 412), {
      status: 412,
      statusText: 'Precondition Failed',
    });
    await vi.waitFor(() =>
      expect(
        root.querySelector(
          '[data-next-step="version_conflict"], [role="alert"]',
        ),
      ).not.toBeNull(),
    );
    expect(root.querySelector('form')).not.toBeNull();
  });
});

describe('T-08 — a11y por estado (§7; A10(j) — cobertura integral: loading, ready, ineligible, not_found, unavailable, error, offline)', () => {
  it('dado loading (antes de qualquer flush) então h1 único, região de estado e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-08, loading)
    const harness = await mount();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado formulário habilitado então h1 único, região de estado e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-08, ready)
    const harness = await mount();
    await flushDetail(harness, {
      ...REQUEST_DETAIL_FIXTURE,
      actions: {
        ...REQUEST_DETAIL_FIXTURE.actions,
        canWithdraw: true,
        withdrawalBlockedReason: null,
      },
    });
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.querySelector('input[name="confirm"]')).not.toBeNull(),
    );
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado ineligible então h1 único, região de estado e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-08, ineligible)
    const harness = await mount();
    await flushDetail(harness, {
      ...REQUEST_DETAIL_FIXTURE,
      actions: {
        ...REQUEST_DETAIL_FIXTURE.actions,
        canWithdraw: false,
        withdrawalBlockedReason: 'julgado',
      },
    });
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.screens.t08.state.ineligible'],
      ),
    );
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado not_found (404 na leitura do pedido) então h1 único, região de estado, foco no banner e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-08, not_found)
    const harness = await mount();
    const httpMock = harness.httpMock();
    const req = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) =>
          candidate.url === `/v1/portal/requests/${REQUEST_EM_ANDAMENTO_ID}`,
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

  it('dado unavailable (503) então h1 único, região de estado, foco no banner e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-08, unavailable)
    const harness = await mount();
    const httpMock = harness.httpMock();
    const req = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) =>
          candidate.url === `/v1/portal/requests/${REQUEST_EM_ANDAMENTO_ID}`,
      ),
    );
    req.flush(portalErrorBody('PORTAL.NATIONAL_READ_UNAVAILABLE', 503), {
      status: 503,
      statusText: 'Service Unavailable',
    });
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.screens.t08.state.unavailable'],
      ),
    );
    await expectA11yStateInvariants(root, catalog, {
      errorBannerFocused: true,
    });
  });

  it('dado error (500, código fora do catálogo) então h1 único, região de estado, foco no banner e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-08, error)
    const harness = await mount();
    const httpMock = harness.httpMock();
    const req = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) =>
          candidate.url === `/v1/portal/requests/${REQUEST_EM_ANDAMENTO_ID}`,
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
    // C-3b-103 (T-08, offline; M14)
    const harness = await mount();
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
