// R-0014 TASK-0017 (Inspector). CTG-0003c §6 T-22 (`ManifestationDetailPageComponent`); página
// real, ainda inexistente (§1) — "Cannot find module" até TASK-0018 (esperado, §9). Rota com
// `entitlementGuard('manifestation')` (route-manifest.fixture #32).
import { ManifestationDetailPageComponent } from './manifestation-detail.page'; // §9.
import { TestBed } from '@angular/core/testing';
import { StynxI18nModule, StynxI18nService } from '@stynx-nyx/angular-i18n';
import portalCatalog from '../../../i18n/portal.pt-BR.json';
import { PORTAL_ROUTES } from '../../../app.routes';
import { SessionFacade } from '../../../core/session.facade';
import { EntitlementFacade } from '../../../core/entitlement.facade';
import { createSessionFacadeStub } from '../../../../testing/session-facade.stub';
import { createEntitlementFacadeStub } from '../../../../testing/entitlement-facade.stub';
import { createPortalRouterHarness } from '../../../../testing/router-harness';
import { expectA11yStateInvariants } from '../../../../testing/a11y-state.spec-helper';
import {
  MANIFESTATION_CIENCIA_FIXTURE,
  MANIFESTATION_CIENCIA_ID,
  MANIFESTATION_ENCERRADA_FIXTURE,
  MANIFESTATION_ENCERRADA_ID,
  portalErrorBody,
} from '../../../../testing/http-fixtures-pair3';

const catalog = portalCatalog as Record<string, string>;

async function mount(manifestationId: string = MANIFESTATION_ENCERRADA_ID) {
  const harness = await createPortalRouterHarness(PORTAL_ROUTES, [
    ManifestationDetailPageComponent,
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
  await harness.navigate(`/ouvidoria/${manifestationId}`);
  return harness;
}

async function flush(
  harness: Awaited<ReturnType<typeof mount>>,
  body: unknown,
  manifestationId: string = MANIFESTATION_ENCERRADA_ID,
  options?: { status: number; statusText: string },
) {
  const httpMock = harness.httpMock();
  const req = await vi.waitFor(() =>
    httpMock.expectOne(
      (candidate) =>
        candidate.url === `/v1/portal/manifestations/${manifestationId}`,
    ),
  );
  if (options) {
    req.flush(body as any, options);
  } else {
    req.flush(body as any);
  }
}

describe('T-22 — data-screen e um único relógio visível (§1 inv.; RN-109 5) [negativo]', () => {
  it('dado ENCERRADA com prorrogação então host [data-screen]="T-22", o DOM não contém 20 dias nem info_due_on, e contém o prazo do órgão como data', async () => {
    // C-3c-100/C-3c-107 (T-22)
    const harness = await mount();
    await flush(harness, MANIFESTATION_ENCERRADA_FIXTURE);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.getAttribute('data-screen')).toBe('T-22'),
    );
    await vi.waitFor(() => {
      expect(root.querySelector('portal-deadline-card')).not.toBeNull();
    });
    const text = root.textContent ?? '';
    expect(text).not.toContain('20 dias');
    expect(text).not.toContain('info_due_on');
    expect(root.querySelector('time')).not.toBeNull();
  });
});

describe('T-22 — botão de ciência só em CIENCIA_AO_USUARIO (§3.6) [negativo]', () => {
  it('dado state ENCERRADA então o botão confirmar ciência não existe', async () => {
    const harness = await mount();
    await flush(harness, MANIFESTATION_ENCERRADA_FIXTURE);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.getAttribute('data-screen')).toBe('T-22'),
    );
    expect(root.querySelector('[data-acknowledge]')).toBeNull();
  });
});

describe('T-22 — a11y por estado (§6/§7.3 — cobertura integral: carregando, ready(ENCERRADA), ready(CIENCIA_AO_USUARIO), sem_permissao, indisponivel)', () => {
  it('dado carregando (antes do flush) então axe sem violação serious/critical', async () => {
    const harness = await mount();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado ENCERRADA com prorrogação então axe sem violação serious/critical', async () => {
    const harness = await mount();
    await flush(harness, MANIFESTATION_ENCERRADA_FIXTURE);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.getAttribute('data-screen')).toBe('T-22'),
    );
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado CIENCIA_AO_USUARIO (botão de ciência visível) então axe sem violação serious/critical', async () => {
    const harness = await mount(MANIFESTATION_CIENCIA_ID);
    await flush(
      harness,
      MANIFESTATION_CIENCIA_FIXTURE,
      MANIFESTATION_CIENCIA_ID,
    );
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.querySelector('[data-acknowledge]')).not.toBeNull(),
    );
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado sem_permissao (404 NOT_FOUND) então axe sem violação serious/critical', async () => {
    const harness = await mount();
    await flush(
      harness,
      portalErrorBody('PORTAL.NOT_FOUND', 404, { kind: 'manifestation' }),
      MANIFESTATION_ENCERRADA_ID,
      { status: 404, statusText: 'Not Found' },
    );
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.screens.t22.state.sem_permissao'],
      ),
    );
    await expectA11yStateInvariants(root, catalog, {
      errorBannerFocused: true,
    });
  });

  it('dado indisponivel (500) então axe sem violação serious/critical', async () => {
    const harness = await mount();
    await flush(
      harness,
      portalErrorBody('PORTAL.INTERNAL', 500),
      MANIFESTATION_ENCERRADA_ID,
      { status: 500, statusText: 'Internal Server Error' },
    );
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.screens.t22.state.indisponivel'],
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
});
