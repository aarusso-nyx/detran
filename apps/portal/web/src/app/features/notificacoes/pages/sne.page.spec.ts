// R-0014 TASK-0017 (Inspector). CTG-0003c §6 T-09 (`SnePageComponent`); página real, ainda
// inexistente (§1) — "Cannot find module" até TASK-0018 (esperado, §9).
import { SnePageComponent } from './sne.page'; // §9: "Cannot find module" esperado.
import { TestBed } from '@angular/core/testing';
import { StynxI18nModule, StynxI18nService } from '@stynx-nyx/angular-i18n';
import portalCatalog from '../../../i18n/portal.pt-BR.json';
import { PORTAL_ROUTES } from '../../../app.routes';
import { SessionFacade } from '../../../core/session.facade';
import { ServiceCatalogFacade } from '../../../core/service-catalog.facade';
import { createSessionFacadeStub } from '../../../../testing/session-facade.stub';
import { createServiceCatalogFacadeStub } from '../../../../testing/service-catalog-facade.stub';
import { createPortalRouterHarness } from '../../../../testing/router-harness';
import { expectA11yStateInvariants } from '../../../../testing/a11y-state.spec-helper';
import {
  SNE_ENROLLMENT_ADERIDO_FIXTURE,
  SNE_ENROLLMENT_NAO_ADERIDO_FIXTURE,
  portalErrorBody,
} from '../../../../testing/http-fixtures-pair3';

const catalog = portalCatalog as Record<string, string>;

async function mount() {
  const harness = await createPortalRouterHarness(PORTAL_ROUTES, [
    SnePageComponent,
    {
      provide: SessionFacade,
      useValue: createSessionFacadeStub({
        active: true,
        assuranceLevel: 'simples',
      }),
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
  await harness.navigate('/sne');
  return harness;
}

async function flush(
  harness: Awaited<ReturnType<typeof mount>>,
  body: unknown,
) {
  const httpMock = harness.httpMock();
  const req = await vi.waitFor(() =>
    httpMock.expectOne(
      (candidate) => candidate.url === '/v1/portal/sne/enrollment',
    ),
  );
  req.flush(body as any);
}

describe('T-09 — data-screen (§1 inv.; M8)', () => {
  it('dado a rota /sne então host [data-screen]="T-09"', async () => {
    // C-3c-100 (T-09)
    const harness = await mount();
    await flush(harness, SNE_ENROLLMENT_NAO_ADERIDO_FIXTURE);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.getAttribute('data-screen')).toBe('T-09'),
    );
  });
});

async function fillAndSubmit(root: HTMLElement): Promise<void> {
  // O `SneConsentComponent` só renderiza os campos depois que `enrollment` chega ao signal e o
  // Angular zoneless reflete a mudança no tick seguinte — sem esperar, `email`/`phone`/`aceite`
  // ainda não existem no DOM (par 2, lição A9(f) desta iteração).
  await vi.waitFor(() =>
    expect(root.querySelector('input[name="email"]')).not.toBeNull(),
  );
  const emailInput = root.querySelector<HTMLInputElement>(
    'input[name="email"]',
  )!;
  emailInput.value = 'a@fixtures.invalid';
  emailInput.dispatchEvent(new Event('input', { bubbles: true }));
  const phoneInput = root.querySelector<HTMLInputElement>(
    'input[name="phone"]',
  )!;
  phoneInput.value = '92999990000';
  phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
  const checkbox = root.querySelector<HTMLInputElement>(
    'input[name="aceite"]',
  )!;
  checkbox.checked = true;
  checkbox.dispatchEvent(new Event('change', { bubbles: true }));
  const form = root.querySelector('form')!;
  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
}

describe('T-09 — a11y por estado (§6/§7.3 — cobertura integral: loading, não aderido, aderido, ineligible, error_recoverable, unavailable, forbidden)', () => {
  it('dado loading (antes do flush) então axe sem violação serious/critical', async () => {
    const harness = await mount();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado não aderido então axe sem violação serious/critical', async () => {
    const harness = await mount();
    await flush(harness, SNE_ENROLLMENT_NAO_ADERIDO_FIXTURE);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.getAttribute('data-screen')).toBe('T-09'),
    );
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado aderido então axe sem violação serious/critical', async () => {
    const harness = await mount();
    await flush(harness, SNE_ENROLLMENT_ADERIDO_FIXTURE);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.screens.t09.cmd.cancel'],
      ),
    );
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado ineligible (422 SNE_CONTACT_REQUIRED) então axe sem violação serious/critical', async () => {
    const harness = await mount();
    await flush(harness, SNE_ENROLLMENT_NAO_ADERIDO_FIXTURE);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.getAttribute('data-screen')).toBe('T-09'),
    );
    await fillAndSubmit(root);
    const httpMock = harness.httpMock();
    const req = await vi.waitFor(() =>
      httpMock.expectOne('/v1/portal/sne/enrollment'),
    );
    req.flush(
      portalErrorBody('PORTAL.SNE_CONTACT_REQUIRED', 422, {
        missing: ['phone'],
      }),
      { status: 422, statusText: 'Unprocessable Entity' },
    );
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.screens.t09.state.ineligible'],
      ),
    );
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado error_recoverable (503 SNE_UPSTREAM_UNAVAILABLE) então axe sem violação serious/critical', async () => {
    const harness = await mount();
    await flush(harness, SNE_ENROLLMENT_NAO_ADERIDO_FIXTURE);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.getAttribute('data-screen')).toBe('T-09'),
    );
    await fillAndSubmit(root);
    const httpMock = harness.httpMock();
    const req = await vi.waitFor(() =>
      httpMock.expectOne('/v1/portal/sne/enrollment'),
    );
    req.flush(
      portalErrorBody('PORTAL.SNE_UPSTREAM_UNAVAILABLE', 503, {
        retryAfter: 30,
      }),
      { status: 503, statusText: 'Service Unavailable' },
    );
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.screens.t09.state.error_recoverable'],
      ),
    );
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado unavailable (422 na escrita) então axe sem violação serious/critical', async () => {
    const harness = await mount();
    await flush(harness, SNE_ENROLLMENT_NAO_ADERIDO_FIXTURE);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.getAttribute('data-screen')).toBe('T-09'),
    );
    await fillAndSubmit(root);
    const httpMock = harness.httpMock();
    const req = await vi.waitFor(() =>
      httpMock.expectOne('/v1/portal/sne/enrollment'),
    );
    req.flush(portalErrorBody('PORTAL.SERVICE_UNAVAILABLE', 422), {
      status: 422,
      statusText: 'Unprocessable Entity',
    });
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.screens.t09.state.unavailable'],
      ),
    );
    // A12(b)/C-3c-112 (estendido): AlternativeChannelNote também presente em estado de erro.
    expect(
      root.querySelector('portal-alternative-channel-note'),
    ).not.toBeNull();
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado forbidden (403 ASSURANCE_INSUFFICIENT) então axe sem violação serious/critical', async () => {
    const harness = await mount();
    await flush(harness, SNE_ENROLLMENT_NAO_ADERIDO_FIXTURE);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.getAttribute('data-screen')).toBe('T-09'),
    );
    await fillAndSubmit(root);
    const httpMock = harness.httpMock();
    const req = await vi.waitFor(() =>
      httpMock.expectOne('/v1/portal/sne/enrollment'),
    );
    req.flush(
      portalErrorBody('PORTAL.ASSURANCE_INSUFFICIENT', 403, {
        required: 'avancada',
        current: 'simples',
      }),
      { status: 403, statusText: 'Forbidden' },
    );
    // A página delega o próximo passo ao `AssuranceExplainer` (par 1, congelado) em vez de um
    // link cru — [DIVERGE-6]/C-3c-21: nunca "acesso negado", sempre o explicador com o nível.
    await vi.waitFor(() => {
      expect(root.querySelector('portal-assurance-explainer')).not.toBeNull();
    });
    await expectA11yStateInvariants(root, catalog);
  });
});
