// R-0014 TASK-0017 (Inspector). CTG-0003c §6 T-17 (`CrlvPageComponent`); página real, ainda
// inexistente (§1) — "Cannot find module" até TASK-0018 (esperado, §9). Rota com
// `entitlementGuard('vehicle')` (route-manifest.fixture #26) — `EntitlementFacade` stubada.
import { CrlvPageComponent } from './crlv.page'; // §9: "Cannot find module" esperado.
import { TestBed } from '@angular/core/testing';
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import { StynxI18nModule, StynxI18nService } from '@stynx-nyx/angular-i18n';
import portalCatalog from '../../../i18n/portal.pt-BR.json';
import { PORTAL_ROUTES } from '../../../app.routes';
import { SessionFacade } from '../../../core/session.facade';
import { EntitlementFacade } from '../../../core/entitlement.facade';
import { ServiceCatalogFacade } from '../../../core/service-catalog.facade';
import { PortalClock } from '../../../core/clock';
import { OfflineDocumentStore } from '../../../core/offline-document.store';
import { createSessionFacadeStub } from '../../../../testing/session-facade.stub';
import { createEntitlementFacadeStub } from '../../../../testing/entitlement-facade.stub';
import { createServiceCatalogFacadeStub } from '../../../../testing/service-catalog-facade.stub';
import { createStynxSessionStub } from '../../../../testing/stynx-session.stub';
import { createPortalRouterHarness } from '../../../../testing/router-harness';
import { expectA11yStateInvariants } from '../../../../testing/a11y-state.spec-helper';
import {
  CRLV_ISSUED_FIXTURE,
  FIXED_CLOCK_ISO,
  VEHICLE_CLEARANCE_BLOCKED_FIXTURE,
  VEHICLE_CLEARANCE_CLEAR_FIXTURE,
  VEHICLE_ID,
  VEHICLE_OTHER_ID,
  portalErrorBody,
} from '../../../../testing/http-fixtures-pair3';

const catalog = portalCatalog as Record<string, string>;

async function mount(vehicleId: string = VEHICLE_ID) {
  const harness = await createPortalRouterHarness(PORTAL_ROUTES, [
    CrlvPageComponent,
    {
      provide: SessionFacade,
      useValue: createSessionFacadeStub({
        active: true,
        assuranceLevel: 'simples',
      }),
    },
    { provide: EntitlementFacade, useValue: createEntitlementFacadeStub(true) },
    {
      provide: StynxSessionService,
      useValue: createStynxSessionStub({ sid: 'sid-fixture', active: true }),
    },
    {
      provide: PortalClock,
      useValue: { now: () => new Date(FIXED_CLOCK_ISO) },
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
  await harness.navigate(`/veiculos/${vehicleId}/crlv-e`);
  return harness;
}

afterEach(() => {
  // O `OfflineDocumentStore` real grava no `sessionStorage` do jsdom (par 1); sem limpeza, um
  // `put('crlv-e', …)` de C-3c-104 (mesmo `sid-fixture`) vaza para o próximo `it` — inclusive o
  // caso 422 SERVICE_UNAVAILABLE adicionado na iteração 4 (mesma classe de C-3c-28). `clear()`
  // some com a chave derivada também.
  try {
    TestBed.inject(OfflineDocumentStore).clear();
  } catch {
    // TestBed já destruído ou store não injetado neste it.
  }
  try {
    sessionStorage.clear();
  } catch {
    // sessionStorage indisponível.
  }
});

async function flushClearance(
  harness: Awaited<ReturnType<typeof mount>>,
  vehicleId: string,
  respond: (req: any) => void,
) {
  const httpMock = harness.httpMock();
  const req = await vi.waitFor(() =>
    httpMock.expectOne(
      (candidate) =>
        candidate.url === `/v1/portal/vehicles/${vehicleId}/clearance`,
    ),
  );
  respond(req);
}

describe('T-17 — data-screen (§1 inv.; M8)', () => {
  it('dado a rota /veiculos/<id>/crlv-e então host [data-screen]="T-17"', async () => {
    // C-3c-100 (T-17)
    const harness = await mount();
    await flushClearance(harness, VEHICLE_ID, (req) =>
      req.flush(VEHICLE_CLEARANCE_CLEAR_FIXTURE),
    );
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.getAttribute('data-screen')).toBe('T-17'),
    );
  });
});

describe('T-17 — card offline de outro veículo (§7.1; [DIVERGE-13]) [negativo]', () => {
  it('dado clearance e o documento offline gravado para outro veículo então nenhum card é exibido', async () => {
    // C-3c-104 (= C-3c-35 na página); A12(a): offline real.
    const onLineSpy = vi.spyOn(window.navigator, 'onLine', 'get');
    onLineSpy.mockReturnValue(false);
    const harness = await mount(VEHICLE_OTHER_ID);
    const offlineStore = TestBed.inject(OfflineDocumentStore);
    await offlineStore.put(
      'crlv-e',
      { ...CRLV_ISSUED_FIXTURE, vehicleId: VEHICLE_ID },
      '2027-01-01',
    );
    await flushClearance(harness, VEHICLE_OTHER_ID, (req) =>
      req.error(new ProgressEvent('error'), {
        status: 0,
        statusText: 'Unknown Error',
      }),
    );
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(catalog['portal.states.offline']),
    );
    expect(root.querySelector('portal-digital-document-card')).toBeNull();
    await expectA11yStateInvariants(root, catalog, {
      errorBannerFocused: true,
    });
    onLineSpy.mockRestore();
  });
});

describe('T-17 — a11y por estado (§6/§7.3 — cobertura integral: loading, ready, pendencia, restrição, unavailable)', () => {
  it('dado loading (antes do flush) então axe sem violação serious/critical', async () => {
    const harness = await mount();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado quitação livre então axe sem violação serious/critical', async () => {
    const harness = await mount();
    await flushClearance(harness, VEHICLE_ID, (req) =>
      req.flush(VEHICLE_CLEARANCE_CLEAR_FIXTURE),
    );
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.getAttribute('data-screen')).toBe('T-17'),
    );
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado pendencia (422 CRLV_BLOCKED_BY_DEBT ao emitir) então axe sem violação serious/critical', async () => {
    const harness = await mount();
    await flushClearance(harness, VEHICLE_ID, (req) =>
      req.flush(VEHICLE_CLEARANCE_BLOCKED_FIXTURE),
    );
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.getAttribute('data-screen')).toBe('T-17'),
    );
    const issueButton = root.querySelector<HTMLButtonElement>('[data-issue]')!;
    issueButton.dispatchEvent(new Event('click', { bubbles: true }));
    const httpMock = harness.httpMock();
    const req = await vi.waitFor(() =>
      httpMock.expectOne(`/v1/portal/vehicles/${VEHICLE_ID}/crlv-e`),
    );
    req.flush(
      portalErrorBody('PORTAL.CRLV_BLOCKED_BY_DEBT', 422, {
        items: [{ kind: 'multa', amount: 195.23 }],
        paymentRoute: '/autos',
      }),
      { status: 422, statusText: 'Unprocessable Entity' },
    );
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.errors.crlv_blocked_by_debt'],
      ),
    );
    // A facade reconsulta a quitação após o comando (§3.3); flusha para estabilizar o DOM.
    await flushClearance(harness, VEHICLE_ID, (req2) =>
      req2.flush(VEHICLE_CLEARANCE_BLOCKED_FIXTURE),
    );
    await expectA11yStateInvariants(root, catalog, {
      errorBannerFocused: true,
    });
  });

  it('dado restrição (422 CRLV_BLOCKED_BY_RESTRICTION ao emitir) então axe sem violação serious/critical', async () => {
    const harness = await mount();
    await flushClearance(harness, VEHICLE_ID, (req) =>
      req.flush(VEHICLE_CLEARANCE_CLEAR_FIXTURE),
    );
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.getAttribute('data-screen')).toBe('T-17'),
    );
    const issueButton = root.querySelector<HTMLButtonElement>('[data-issue]')!;
    issueButton.dispatchEvent(new Event('click', { bubbles: true }));
    const httpMock = harness.httpMock();
    const req = await vi.waitFor(() =>
      httpMock.expectOne(`/v1/portal/vehicles/${VEHICLE_ID}/crlv-e`),
    );
    req.flush(
      portalErrorBody('PORTAL.CRLV_BLOCKED_BY_RESTRICTION', 422, {
        restrictions: [{ kind: 'judicial' }],
      }),
      { status: 422, statusText: 'Unprocessable Entity' },
    );
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.errors.crlv_blocked_by_restriction'],
      ),
    );
    await flushClearance(harness, VEHICLE_ID, (req2) =>
      req2.flush(VEHICLE_CLEARANCE_CLEAR_FIXTURE),
    );
    await expectA11yStateInvariants(root, catalog, {
      errorBannerFocused: true,
    });
  });

  it('dado unavailable (503 na leitura de quitação) então axe sem violação serious/critical', async () => {
    const harness = await mount();
    await flushClearance(harness, VEHICLE_ID, (req) =>
      req.flush(portalErrorBody('PORTAL.NATIONAL_READ_UNAVAILABLE', 503), {
        status: 503,
        statusText: 'Service Unavailable',
      }),
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

  it('dado issueCrlv com 422 SERVICE_UNAVAILABLE{documento_assinado_pendente_r0014} então crlvStatus unavailable (portal.states.service_unavailable com data-reason), AlternativeChannelNote presente, nenhum card de documento [negativo] e axe sem violação serious/critical', async () => {
    // A12(b) — metade DOM de C-3c-33
    const harness = await mount();
    await flushClearance(harness, VEHICLE_ID, (req) =>
      req.flush(VEHICLE_CLEARANCE_CLEAR_FIXTURE),
    );
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.getAttribute('data-screen')).toBe('T-17'),
    );
    const issueButton = await vi.waitFor(() => {
      const button = root.querySelector<HTMLButtonElement>('[data-issue]');
      expect(button).not.toBeNull();
      return button!;
    });
    issueButton.dispatchEvent(new Event('click', { bubbles: true }));
    const httpMock = harness.httpMock();
    const req = await vi.waitFor(() =>
      httpMock.expectOne(`/v1/portal/vehicles/${VEHICLE_ID}/crlv-e`),
    );
    req.flush(
      portalErrorBody('PORTAL.SERVICE_UNAVAILABLE', 422, {
        unavailableReason: 'documento_assinado_pendente_r0014',
      }),
      { status: 422, statusText: 'Unprocessable Entity' },
    );
    await vi.waitFor(() => {
      const reasonEl = root.querySelector('[data-unavailable]');
      expect(reasonEl?.getAttribute('data-reason')).toBe(
        'documento_assinado_pendente_r0014',
      );
      expect(reasonEl?.textContent).toContain(
        catalog['portal.states.service_unavailable'],
      );
    });
    expect(root.querySelector('portal-digital-document-card')).toBeNull();
    expect(
      root.querySelector('portal-alternative-channel-note'),
    ).not.toBeNull();
    // A quitação é reconsultada após o comando (§3.3); flusha para estabilizar o DOM antes do axe.
    await flushClearance(harness, VEHICLE_ID, (req2) =>
      req2.flush(VEHICLE_CLEARANCE_CLEAR_FIXTURE),
    );
    await expectA11yStateInvariants(root, catalog, {
      errorBannerFocused: true,
    });
  });
});
