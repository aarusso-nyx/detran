// R-0014 TASK-0017 (Inspector). CTG-0003c §6 T-19 (`CrashDetailPageComponent`); página real,
// ainda inexistente (§1) — "Cannot find module" até TASK-0018 (esperado, §9). Rota com
// `entitlementGuard('crash')` (route-manifest.fixture #28) — `EntitlementFacade` stubada.
import { CrashDetailPageComponent } from './crash-detail.page'; // §9: "Cannot find module" esperado.
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
import { expectA11yStateInvariants } from '../../../../testing/a11y-state.spec-helper';
import {
  CRASH_DETAIL_FIXTURE,
  CRASH_DETAIL_SUPPRESSED_FIXTURE,
  CRASH_ID,
  portalErrorBody,
} from '../../../../testing/http-fixtures-pair3';

const catalog = portalCatalog as Record<string, string>;

async function mount() {
  const harness = await createPortalRouterHarness(PORTAL_ROUTES, [
    CrashDetailPageComponent,
    {
      provide: SessionFacade,
      useValue: createSessionFacadeStub({
        active: true,
        assuranceLevel: 'simples',
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
  await harness.navigate(`/sinistros/${CRASH_ID}`);
  return harness;
}

async function flush(
  harness: Awaited<ReturnType<typeof mount>>,
  body: unknown,
) {
  const httpMock = harness.httpMock();
  const req = await vi.waitFor(() =>
    httpMock.expectOne(
      (candidate) => candidate.url === `/v1/portal/crashes/${CRASH_ID}`,
    ),
  );
  req.flush(body as any);
}

describe('T-19 — data-screen e resumo com supressão anunciada (§1 inv.; RN-118 c)', () => {
  it('dado a rota /sinistros/<id> com thirdPartyFieldsSuppressed true então host [data-screen]="T-19" e o aviso role=status aparece', async () => {
    // C-3c-100 (T-19)
    const harness = await mount();
    await flush(harness, CRASH_DETAIL_SUPPRESSED_FIXTURE);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.getAttribute('data-screen')).toBe('T-19'),
    );
    await vi.waitFor(() => {
      const status = root.querySelector('[role="status"]');
      expect(status?.textContent).toContain(
        catalog['portal.errors.crash_third_party_data_restricted'],
      );
    });
  });
});

describe('T-19 — chave de summary desconhecida nunca como texto visível (OD-P97) [negativo]', () => {
  it('dado summary com uma chave não catalogada (pending_complement) então o valor aparece em [data-key="pending_complement"] dentro de <dl data-summary> e a chave crua nunca é texto visível', async () => {
    // A12(d)
    const harness = await mount();
    await flush(harness, {
      ...CRASH_DETAIL_FIXTURE,
      summary: { pending_complement: 'aguardando complemento (fixture)' },
    });
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.getAttribute('data-screen')).toBe('T-19'),
    );
    await vi.waitFor(() => {
      const entry = root.querySelector(
        '[data-summary] [data-key="pending_complement"]',
      );
      expect(entry).not.toBeNull();
      expect(entry?.textContent).toContain('aguardando complemento (fixture)');
    });
    expect(root.textContent).not.toContain('pending_complement');
    await expectA11yStateInvariants(root, catalog);
  });
});

describe('T-19 — a11y por estado (§6/§7.3 — cobertura integral: carregando, ready, sem_permissao, erro_recuperavel, indisponivel, offline)', () => {
  it('dado carregando (antes do flush) então axe sem violação serious/critical', async () => {
    const harness = await mount();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado resumo sem supressão (ready) então axe sem violação serious/critical', async () => {
    const harness = await mount();
    await flush(harness, CRASH_DETAIL_FIXTURE);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.getAttribute('data-screen')).toBe('T-19'),
    );
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado resumo com supressão de terceiro então axe sem violação serious/critical', async () => {
    const harness = await mount();
    await flush(harness, CRASH_DETAIL_SUPPRESSED_FIXTURE);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.getAttribute('data-screen')).toBe('T-19'),
    );
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado sem_permissao (404 NOT_FOUND) então axe sem violação serious/critical', async () => {
    const harness = await mount();
    const httpMockNotFound = harness.httpMock();
    const notFoundReq = await vi.waitFor(() =>
      httpMockNotFound.expectOne(
        (candidate) => candidate.url === `/v1/portal/crashes/${CRASH_ID}`,
      ),
    );
    notFoundReq.flush(
      portalErrorBody('PORTAL.NOT_FOUND', 404, { kind: 'crash' }),
      {
        status: 404,
        statusText: 'Not Found',
      },
    );
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.screens.t19.state.sem_permissao'],
      ),
    );
    await expectA11yStateInvariants(root, catalog, {
      errorBannerFocused: true,
    });
  });

  it('dado erro_recuperavel (422 CRASH_NOT_FINAL) então axe sem violação serious/critical', async () => {
    const harness = await mount();
    const httpMock = harness.httpMock();
    const req = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) => candidate.url === `/v1/portal/crashes/${CRASH_ID}`,
      ),
    );
    req.flush(
      portalErrorBody('PORTAL.CRASH_NOT_FINAL', 422, {
        state: 'em_elaboracao',
      }),
      { status: 422, statusText: 'Unprocessable Entity' },
    );
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.screens.t19.state.erro_recuperavel'],
      ),
    );
    await expectA11yStateInvariants(root, catalog, {
      errorBannerFocused: true,
    });
  });

  it('dado indisponivel (503) então axe sem violação serious/critical', async () => {
    const harness = await mount();
    const httpMock = harness.httpMock();
    const req = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) => candidate.url === `/v1/portal/crashes/${CRASH_ID}`,
      ),
    );
    req.flush(portalErrorBody('PORTAL.NATIONAL_READ_UNAVAILABLE', 503), {
      status: 503,
      statusText: 'Service Unavailable',
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

  it('dado offline (navigator.onLine false) então axe sem violação serious/critical', async () => {
    // A12(a): offline real.
    const onLineSpy = vi.spyOn(window.navigator, 'onLine', 'get');
    onLineSpy.mockReturnValue(false);
    const harness = await mount();
    const httpMock = harness.httpMock();
    const req = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) => candidate.url === `/v1/portal/crashes/${CRASH_ID}`,
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
