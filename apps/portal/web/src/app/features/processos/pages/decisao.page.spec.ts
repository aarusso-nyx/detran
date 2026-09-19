// R-0014 TASK-0015 (Inspector). CTG-0003b §6 T-10 (`DecisaoPageComponent`); página real, ainda
// inexistente (§1) — "Cannot find module" até TASK-0016 (esperado, §9).
import { DecisaoPageComponent } from './decisao.page'; // §9: importação direta força "Cannot find module" (falha esperada até TASK-0016).
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
  REQUEST_RESULTADO_ID,
} from '../../../../testing/http-fixtures-reads';
import { portalErrorBody } from '../../../../testing/http-fixtures';
import { expectA11yStateInvariants } from '../../../../testing/a11y-state.spec-helper';

const catalog = portalCatalog as Record<string, string>;

async function mount(entitlementOk = true) {
  const harness = await createPortalRouterHarness(PORTAL_ROUTES, [
    DecisaoPageComponent,
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
  await harness.navigate(`/processos/${REQUEST_RESULTADO_ID}/decisao`);
  return harness;
}

async function flushBoth(
  harness: Awaited<ReturnType<typeof mount>>,
  decisionBody: unknown,
  decisionStatus = 200,
  requestBody: unknown = {
    ...REQUEST_DETAIL_FIXTURE,
    request: { ...REQUEST_DETAIL_FIXTURE.request, targetKind: 'case' as const },
  },
) {
  const httpMock = harness.httpMock();
  const decisionReq = await vi.waitFor(() =>
    httpMock.expectOne(
      (candidate) =>
        candidate.url ===
        `/v1/portal/requests/${REQUEST_RESULTADO_ID}/decision`,
    ),
  );
  if (decisionStatus === 200) decisionReq.flush(decisionBody as any);
  else
    decisionReq.flush(decisionBody as any, {
      status: decisionStatus,
      statusText: 'Error',
    });
  const requestReq = await vi
    .waitFor(
      () =>
        httpMock.expectOne(
          (candidate) =>
            candidate.url === `/v1/portal/requests/${REQUEST_RESULTADO_ID}`,
        ),
      { timeout: 200 },
    )
    .catch(() => null);
  requestReq?.flush(requestBody as any);
}

describe('T-10 — resultado primeiro, um próximo passo ([UC-PORTAL-008] AC-1/AC-2/AC-5)', () => {
  it('dado outcome negado com nextStep.serviceKey recurso_cetran e dueOn então h1 com o texto de situation.decision.negado e data-token antes do resumo; exatamente UM <a> de próximo passo para /processos/<id>/cetran/nova com services.recurso_cetran; deadline-card citizen com 2026-10-10; <a download> com cmd.baixar_documento', async () => {
    // C-3b-96
    const harness = await mount();
    await flushBoth(harness, {
      outcome: 'negado',
      summary: 'Resumo',
      publishedOn: '2026-09-10',
      documentUrl: 'https://storage.invalid/d.pdf',
      nextStep: {
        kind: 'appeal',
        serviceKey: 'recurso_cetran',
        dueOn: '2026-10-10',
      },
      refundDue: false,
      finalInstance: false,
    });
    const root = harness.harness.routeNativeElement as HTMLElement;
    const h1 = await vi.waitFor(() => {
      const found = root.querySelector('h1[tabindex="-1"]');
      expect(found?.textContent).toContain(
        catalog['portal.situation.decision.negado'],
      );
      return found as HTMLElement;
    });
    expect(h1.getAttribute('data-token')).toBe('negado');
    const summaryText = root.textContent ?? '';
    expect(
      summaryText.indexOf(catalog['portal.situation.decision.negado']),
    ).toBeLessThan(summaryText.indexOf('Resumo'));
    const nextStepLinks = root.querySelectorAll(
      `a[routerLink="/processos/${REQUEST_RESULTADO_ID}/cetran/nova"]`,
    );
    expect(nextStepLinks).toHaveLength(1);
    expect(nextStepLinks[0].textContent).toContain(
      catalog['portal.services.recurso_cetran'],
    );
    const card = root.querySelector(
      'portal-deadline-card[data-owned-by="citizen"]',
    );
    expect(card?.textContent).toContain('10');
    const download = root.querySelector('a[download]');
    expect(download?.textContent).toContain(
      catalog['portal.screens.t10.cmd.baixar_documento'],
    );
  });
});

describe('T-10 — última instância e restituição ([UC-PORTAL-008] 4a; [RN-PORTAL-112] 1) [negativo]', () => {
  it('dado outcome provido, finalInstance true, refundDue true, documentUrl null então nenhum botão de próximo passo, data-refund-due="true", download aria-disabled com unavailable_in_version; nenhum texto sugere recurso', async () => {
    // C-3b-97
    const harness = await mount();
    await flushBoth(harness, {
      outcome: 'provido',
      summary: null,
      publishedOn: '2026-09-10',
      documentUrl: null,
      nextStep: { kind: 'none', serviceKey: null, dueOn: null },
      refundDue: true,
      finalInstance: true,
    });
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.situation.decision.provido'],
      ),
    );
    expect(
      root.querySelectorAll('a[routerLink^="/processos/"][routerLink*="nova"]'),
    ).toHaveLength(0);
    expect(root.querySelector('[data-refund-due="true"]')).not.toBeNull();
    const download = root.querySelector('button[aria-disabled="true"]');
    expect(download?.textContent).toContain(
      catalog['portal.states.unavailable_in_version'],
    );
    expect(root.textContent).not.toContain(
      catalog['portal.services.recurso_jari'],
    );
    expect(root.textContent).not.toContain(
      catalog['portal.services.recurso_cetran'],
    );
  });
});

describe('T-10 — sem decisão [negativo]', () => {
  it('dado 404 NOT_FOUND{kind:decision} então t10.empty e link /processos/<id> (não "por que não vejo isto")', async () => {
    // C-3b-98 (1.ª metade)
    const harness = await mount();
    await flushBoth(
      harness,
      portalErrorBody('PORTAL.NOT_FOUND', 404, { kind: 'decision' }),
      404,
    );
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(catalog['portal.screens.t10.empty']),
    );
    expect(
      root.querySelector(`a[routerLink="/processos/${REQUEST_RESULTADO_ID}"]`),
    ).not.toBeNull();
    expect(
      root.querySelector(
        'a[href*="por-que-nao-vejo"], a[routerLink*="por-que-nao-vejo"]',
      ),
    ).toBeNull();
  });
});

describe('T-10 — sem vínculo [negativo]', () => {
  it('dado 404 kind request então "por que não vejo isto"', async () => {
    // C-3b-98 (2.ª metade)
    const harness = await mount();
    await flushBoth(
      harness,
      portalErrorBody('PORTAL.NOT_FOUND', 404, { kind: 'request' }),
      404,
    );
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(
        root.querySelector(
          'a[href*="por-que-nao-vejo"], a[routerLink*="por-que-nao-vejo"]',
        ),
      ).not.toBeNull(),
    );
  });
});

describe('T-10 — a11y por estado (§7; A10(j) — cobertura integral: loading, ready, empty, not_found, unavailable, error, offline)', () => {
  it('dado loading (antes de qualquer flush) então h1 único, região de estado e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-10, loading)
    const harness = await mount();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado resultado com próximo passo então h1 único, região de estado e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-10, ready)
    const harness = await mount();
    await flushBoth(harness, {
      outcome: 'negado',
      summary: 'Resumo',
      publishedOn: '2026-09-10',
      documentUrl: 'https://storage.invalid/d.pdf',
      nextStep: {
        kind: 'appeal',
        serviceKey: 'recurso_cetran',
        dueOn: '2026-10-10',
      },
      refundDue: false,
      finalInstance: false,
    });
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() => expect(root.querySelector('h1')).not.toBeNull());
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado última instância então h1 único, região de estado e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-10, ready, última instância)
    const harness = await mount();
    await flushBoth(harness, {
      outcome: 'provido',
      summary: null,
      publishedOn: '2026-09-10',
      documentUrl: null,
      nextStep: { kind: 'none', serviceKey: null, dueOn: null },
      refundDue: true,
      finalInstance: true,
    });
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.situation.decision.provido'],
      ),
    );
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado empty então h1 único, região de estado e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-10, empty)
    const harness = await mount();
    await flushBoth(
      harness,
      portalErrorBody('PORTAL.NOT_FOUND', 404, { kind: 'decision' }),
      404,
    );
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(catalog['portal.screens.t10.empty']),
    );
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado not_found (404 kind request) então h1 único, região de estado, foco no banner e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-10, not_found)
    const harness = await mount();
    await flushBoth(
      harness,
      portalErrorBody('PORTAL.NOT_FOUND', 404, { kind: 'request' }),
      404,
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

  it('dado unavailable (503) então h1 único, região de estado, foco no banner e axe sem violação serious/critical', async () => {
    // C-3b-103 (T-10, unavailable)
    const harness = await mount();
    await flushBoth(
      harness,
      portalErrorBody('PORTAL.NATIONAL_READ_UNAVAILABLE', 503),
      503,
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
    // C-3b-103 (T-10, error)
    const harness = await mount();
    await flushBoth(
      harness,
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
    // C-3b-103 (T-10, offline; M14)
    const harness = await mount();
    const onLineSpy = vi.spyOn(window.navigator, 'onLine', 'get');
    onLineSpy.mockReturnValue(false);
    const httpMock = harness.httpMock();
    const decisionReq = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) =>
          candidate.url ===
          `/v1/portal/requests/${REQUEST_RESULTADO_ID}/decision`,
      ),
    );
    decisionReq.error(new ProgressEvent('error'), {
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
