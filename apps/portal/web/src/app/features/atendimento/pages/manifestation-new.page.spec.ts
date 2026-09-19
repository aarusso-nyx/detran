// R-0014 TASK-0017 (Inspector). CTG-0003c §6 T-21 (`ManifestationNewPageComponent`); página
// real, ainda inexistente (§1) — "Cannot find module" até TASK-0018 (esperado, §9). Rota
// `nenhum_ou_simples` (route-manifest.fixture #31) — sem guarda de sessão.
import { ManifestationNewPageComponent } from './manifestation-new.page'; // §9.
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
  MANIFESTATION_CREATED_FIXTURE,
  portalErrorBody,
} from '../../../../testing/http-fixtures-pair3';

const catalog = portalCatalog as Record<string, string>;

async function mount(active = false) {
  const harness = await createPortalRouterHarness(PORTAL_ROUTES, [
    ManifestationNewPageComponent,
    { provide: SessionFacade, useValue: createSessionFacadeStub({ active }) },
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
  await harness.navigate('/ouvidoria/nova');
  return harness;
}

describe('T-21 — data-screen e anônimo admitido (§1 inv.; H.51)', () => {
  it('dado a rota /ouvidoria/nova SEM sessão então host [data-screen]="T-21" e a página renderiza (sem guarda; anônimo admitido)', async () => {
    // C-3c-100 (T-21)
    const harness = await mount(false);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.getAttribute('data-screen')).toBe('T-21'),
    );
  });
});

describe('T-21 — comprovante imediato (§5.6; RN-109 3)', () => {
  it('dado submit e 201 então o comprovante aparece em role=status com o protocolo', async () => {
    const harness = await mount(true);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.getAttribute('data-screen')).toBe('T-21'),
    );
    const kindRadio = root.querySelector<HTMLInputElement>(
      'input[name="kind"][value="reclamacao"]',
    )!;
    kindRadio.checked = true;
    kindRadio.dispatchEvent(new Event('change', { bubbles: true }));
    const textarea = root.querySelector<HTMLTextAreaElement>(
      'textarea[name="text"]',
    )!;
    textarea.value = 'texto de fixture';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    const form = root.querySelector('form')!;
    form.dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    const httpMock = harness.httpMock();
    const req = await vi.waitFor(() =>
      httpMock.expectOne('/v1/portal/manifestations'),
    );
    req.flush(MANIFESTATION_CREATED_FIXTURE);
    await vi.waitFor(() => {
      const receipt = root.querySelector('[data-receipt]');
      expect(receipt).not.toBeNull();
      expect(receipt?.getAttribute('role')).toBe('status');
      expect(receipt?.textContent).toContain(
        MANIFESTATION_CREATED_FIXTURE.protocol,
      );
    });
  });
});

function fillAndSubmit(root: HTMLElement): void {
  const kindRadio = root.querySelector<HTMLInputElement>(
    'input[name="kind"][value="reclamacao"]',
  )!;
  kindRadio.checked = true;
  kindRadio.dispatchEvent(new Event('change', { bubbles: true }));
  const textarea = root.querySelector<HTMLTextAreaElement>(
    'textarea[name="text"]',
  )!;
  textarea.value = 'texto de fixture';
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
  const form = root.querySelector('form')!;
  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
}

describe('T-21 — a11y por estado (§6/§7.3 — cobertura integral: idle, erro_recuperavel, indisponivel, sucesso)', () => {
  it('dado o estado inicial (idle) então axe sem violação serious/critical', async () => {
    const harness = await mount(false);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.getAttribute('data-screen')).toBe('T-21'),
    );
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado erro_recuperavel (400 MANIFESTATION_KIND_INVALID) então axe sem violação serious/critical', async () => {
    const harness = await mount(true);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.getAttribute('data-screen')).toBe('T-21'),
    );
    fillAndSubmit(root);
    const httpMock = harness.httpMock();
    const req = await vi.waitFor(() =>
      httpMock.expectOne('/v1/portal/manifestations'),
    );
    req.flush(
      portalErrorBody('PORTAL.MANIFESTATION_KIND_INVALID', 400, {
        allowed: ['reclamacao', 'denuncia'],
      }),
      { status: 400, statusText: 'Bad Request' },
    );
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.screens.t21.state.erro_recuperavel'],
      ),
    );
    await expectA11yStateInvariants(root, catalog, {
      errorBannerFocused: true,
    });
  });

  it('dado indisponivel (500) então axe sem violação serious/critical', async () => {
    const harness = await mount(true);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.getAttribute('data-screen')).toBe('T-21'),
    );
    fillAndSubmit(root);
    const httpMock = harness.httpMock();
    const req = await vi.waitFor(() =>
      httpMock.expectOne('/v1/portal/manifestations'),
    );
    req.flush(portalErrorBody('PORTAL.INTERNAL', 500), {
      status: 500,
      statusText: 'Internal Server Error',
    });
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.screens.t21.state.indisponivel'],
      ),
    );
    // A12(b) — metade DOM de C-3c-45: AlternativeChannelNote presente e nenhuma sugestão de recusa.
    expect(
      root.querySelector('portal-alternative-channel-note'),
    ).not.toBeNull();
    expect(root.textContent).not.toMatch(/recusad/i);
    await expectA11yStateInvariants(root, catalog, {
      errorBannerFocused: true,
    });
  });

  it('dado sucesso (comprovante) então axe sem violação serious/critical', async () => {
    const harness = await mount(true);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.getAttribute('data-screen')).toBe('T-21'),
    );
    fillAndSubmit(root);
    const httpMock = harness.httpMock();
    const req = await vi.waitFor(() =>
      httpMock.expectOne('/v1/portal/manifestations'),
    );
    req.flush(MANIFESTATION_CREATED_FIXTURE);
    await vi.waitFor(() =>
      expect(root.querySelector('[data-receipt]')).not.toBeNull(),
    );
    await expectA11yStateInvariants(root, catalog);
  });
});
