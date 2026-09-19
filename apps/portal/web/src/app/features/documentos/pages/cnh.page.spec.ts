// R-0014 TASK-0017 (Inspector). CTG-0003c §6 T-16 (`CnhPageComponent`); página real, ainda
// inexistente (§1) — "Cannot find module" até TASK-0018 (esperado, §9).
import { CnhPageComponent } from './cnh.page'; // §9: "Cannot find module" esperado.
import { TestBed } from '@angular/core/testing';
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import { StynxI18nModule, StynxI18nService } from '@stynx-nyx/angular-i18n';
import portalCatalog from '../../../i18n/portal.pt-BR.json';
import { PORTAL_ROUTES } from '../../../app.routes';
import { SessionFacade } from '../../../core/session.facade';
import { ServiceCatalogFacade } from '../../../core/service-catalog.facade';
import { PortalClock } from '../../../core/clock';
import { createSessionFacadeStub } from '../../../../testing/session-facade.stub';
import { createServiceCatalogFacadeStub } from '../../../../testing/service-catalog-facade.stub';
import { createStynxSessionStub } from '../../../../testing/stynx-session.stub';
import { createPortalRouterHarness } from '../../../../testing/router-harness';
import { expectA11yStateInvariants } from '../../../../testing/a11y-state.spec-helper';
import {
  CNH_READ_FIXTURE,
  FIXED_CLOCK_ISO,
  portalErrorBody,
} from '../../../../testing/http-fixtures-pair3';

const catalog = portalCatalog as Record<string, string>;

async function mount() {
  const harness = await createPortalRouterHarness(PORTAL_ROUTES, [
    CnhPageComponent,
    {
      provide: SessionFacade,
      useValue: createSessionFacadeStub({
        active: true,
        assuranceLevel: 'simples',
      }),
    },
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
  await harness.navigate('/documentos/cnh-digital');
  return harness;
}

async function flush(
  harness: Awaited<ReturnType<typeof mount>>,
  respond: (req: any) => void,
) {
  const httpMock = harness.httpMock();
  const req = await vi.waitFor(() =>
    httpMock.expectOne(
      (candidate) => candidate.url === '/v1/portal/documents/cnh',
    ),
  );
  respond(req);
}

describe('T-16 — data-screen (§1 inv.; M8)', () => {
  it('dado a rota /documentos/cnh-digital então host [data-screen]="T-16"', async () => {
    // C-3c-100 (T-16)
    const harness = await mount();
    await flush(harness, (req) => req.flush(CNH_READ_FIXTURE));
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.getAttribute('data-screen')).toBe('T-16'),
    );
  });
});

describe('T-16 — indisponibilidade nacional mantém o último dado (§7.2; RN-117 C)', () => {
  it('dado 503 NATIONAL_READ_UNAVAILABLE{cachedAt} após um 200 anterior então o card anterior permanece com consultedAt e o banner cita que os prazos não mudam', async () => {
    // C-3c-103
    const harness = await mount();
    await flush(harness, (req) => req.flush(CNH_READ_FIXTURE));
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.documents.consulta.notDocument'],
      ),
    );
    // 2.ª leitura (retry explícito do cidadão) — falha nacional; o card anterior deve
    // permanecer visível (§7.2 "último dado + cachedAt permanece").
    const retryButton = Array.from(
      root.querySelectorAll<HTMLButtonElement>('button'),
    ).find((button) =>
      button.textContent?.includes(catalog['portal.common.action.retry']),
    );
    expect(retryButton, 'botão de retry não encontrado em T-16').toBeDefined();
    retryButton!.dispatchEvent(new Event('click', { bubbles: true }));
    const httpMock = harness.httpMock();
    const secondReq = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) => candidate.url === '/v1/portal/documents/cnh',
      ),
    );
    secondReq.flush(
      portalErrorBody('PORTAL.NATIONAL_READ_UNAVAILABLE', 503, {
        cachedAt: FIXED_CLOCK_ISO,
        retryAfter: 30,
      }),
      { status: 503, statusText: 'Service Unavailable' },
    );
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.errors.national_read_unavailable'],
      ),
    );
    // {consultedAt} é interpolado pelo motor — compara pelo prefixo estático (par 2).
    const consultedAtPrefix =
      catalog['portal.documents.consulta.consultedAt'].split('{')[0];
    expect(root.textContent).toContain(consultedAtPrefix);
  });
});

describe('T-16 — a11y por estado (§6/§7.2/§7.3 — cobertura integral: loading, ready, empty, nao_valida, pendencia, unavailable, offline)', () => {
  it('dado loading (antes do flush) então axe sem violação serious/critical', async () => {
    const harness = await mount();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado categoria C exibida (ready) então axe sem violação serious/critical', async () => {
    const harness = await mount();
    await flush(harness, (req) => req.flush(CNH_READ_FIXTURE));
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.getAttribute('data-screen')).toBe('T-16'),
    );
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado vazio (404 CNH_NOT_FOUND) então axe sem violação serious/critical', async () => {
    const harness = await mount();
    await flush(harness, (req) =>
      req.flush(portalErrorBody('PORTAL.CNH_NOT_FOUND', 404), {
        status: 404,
        statusText: 'Not Found',
      }),
    );
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(catalog['portal.screens.t16.empty']),
    );
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado nao_valida (422 CNH_NOT_VALID_FOR_DIGITAL) então axe sem violação serious/critical', async () => {
    const harness = await mount();
    await flush(harness, (req) =>
      req.flush(
        portalErrorBody('PORTAL.CNH_NOT_VALID_FOR_DIGITAL', 422, {
          status: 'suspensa',
        }),
        { status: 422, statusText: 'Unprocessable Entity' },
      ),
    );
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.screens.t16.state.nao_valida'],
      ),
    );
    await expectA11yStateInvariants(root, catalog, {
      errorBannerFocused: true,
    });
  });

  it('dado pendencia (422 CNH_CLEARANCE_PENDING) então axe sem violação serious/critical', async () => {
    const harness = await mount();
    await flush(harness, (req) =>
      req.flush(
        portalErrorBody('PORTAL.CNH_CLEARANCE_PENDING', 422, {
          paymentRoute: '/x',
        }),
        { status: 422, statusText: 'Unprocessable Entity' },
      ),
    );
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.screens.t16.state.pendencia'],
      ),
    );
    await expectA11yStateInvariants(root, catalog, {
      errorBannerFocused: true,
    });
  });

  it('dado unavailable (503 NATIONAL_READ_UNAVAILABLE, sem leitura anterior) então axe sem violação serious/critical', async () => {
    const harness = await mount();
    await flush(harness, (req) =>
      req.flush(
        portalErrorBody('PORTAL.NATIONAL_READ_UNAVAILABLE', 503, {
          cachedAt: null,
          retryAfter: 30,
        }),
        { status: 503, statusText: 'Service Unavailable' },
      ),
    );
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.errors.national_read_unavailable'],
      ),
    );
    // A12(b)/C-3c-112 (estendido): AlternativeChannelNote também presente em estado de erro.
    expect(
      root.querySelector('portal-alternative-channel-note'),
    ).not.toBeNull();
    await expectA11yStateInvariants(root, catalog, {
      errorBannerFocused: true,
    });
  });

  it('dado offline (navigator.onLine false) sem cache então axe sem violação serious/critical', async () => {
    // A12(a): offline real.
    const onLineSpy = vi.spyOn(window.navigator, 'onLine', 'get');
    onLineSpy.mockReturnValue(false);
    const harness = await mount();
    await flush(harness, (req) =>
      req.error(new ProgressEvent('error'), {
        status: 0,
        statusText: 'Unknown Error',
      }),
    );
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
