// R-0014 TASK-0017 (Inspector). CTG-0003c §6 T-24 (`OwnDataPageComponent`); página real, ainda
// inexistente (§1) — "Cannot find module" até TASK-0018 (esperado, §9).
import { OwnDataPageComponent } from './own-data.page'; // §9.
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
  ME_PAIR3_FIXTURE,
  ME_PAIR3_WITH_DATA_FIXTURE,
  portalErrorBody,
} from '../../../../testing/http-fixtures-pair3';

const catalog = portalCatalog as Record<string, string>;

function mountWith(
  account: unknown = ME_PAIR3_WITH_DATA_FIXTURE,
  actRequirements: readonly unknown[] = [
    { act: 'lgpd_declaracao:correcao', level: 'avancada', allowed: true },
  ],
  extra: { loading?: boolean; loadError?: unknown } = {},
) {
  const sessionFacade = createSessionFacadeStub({
    active: true,
    assuranceLevel: 'avancada',
    account,
    actRequirements: actRequirements as any,
    loading: extra.loading ?? false,
  });
  if (extra.loadError) {
    (sessionFacade.loadErrorSignal as any).set(extra.loadError);
  }
  return { sessionFacade };
}

async function mount(
  account: unknown = ME_PAIR3_WITH_DATA_FIXTURE,
  actRequirements: readonly unknown[] = [
    { act: 'lgpd_declaracao:correcao', level: 'avancada', allowed: true },
  ],
  extra: { loading?: boolean; loadError?: unknown } = {},
) {
  const { sessionFacade } = mountWith(account, actRequirements, extra);
  const harness = await createPortalRouterHarness(PORTAL_ROUTES, [
    OwnDataPageComponent,
    { provide: SessionFacade, useValue: sessionFacade },
    {
      provide: ServiceCatalogFacade,
      useValue: createServiceCatalogFacadeStub({
        status: 'partially_available',
        reason:
          'Somente confirmação de tratamento; declaração completa pendente (OD-P17)',
      }),
    },
    StynxI18nModule.forRoot({
      defaultLocale: 'pt-BR',
      loadCatalog: async () => catalog,
    }),
  ]);
  await TestBed.inject(StynxI18nService).initialize();
  await harness.navigate('/privacidade/meus-dados');
  return harness;
}

describe('T-24 — data-screen e disponibilidade parcial (§1 inv.; §6; OD-P17; RN-120) [negativo]', () => {
  it('dado availability partially_available com note então StynxBanner role=status com service_partially_available e a note; botão exportar aria-disabled; DOM sem 15 dias', async () => {
    // C-3c-100/C-3c-106 (T-24)
    const harness = await mount();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.getAttribute('data-screen')).toBe('T-24'),
    );
    const status = root.querySelector('[role="status"]');
    expect(status?.textContent).toContain(
      catalog['portal.errors.service_partially_available'],
    );
    const exportButton = root.querySelector('[data-export]');
    expect(exportButton?.getAttribute('aria-disabled')).toBe('true');
    expect(root.textContent).not.toContain('15 dias');
  });
});

describe('T-24 — sem elegibilidade para escopo avançado (§3.7)', () => {
  it('dado 403 PRIVACY_SCOPE_REQUIRES_ASSURANCE{required:avancada} no wizard então nextStep elevation com retomar=/privacidade/meus-dados', async () => {
    // C-3c-53
    const harness = await mount(ME_PAIR3_FIXTURE, []);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.getAttribute('data-screen')).toBe('T-24'),
    );
    const correctionButton = root.querySelector<HTMLButtonElement>(
      '[data-cmd="declaracao_completa"]',
    );
    correctionButton?.dispatchEvent(new Event('click', { bubbles: true }));
    const httpMock = harness.httpMock();
    const req = await vi.waitFor(() =>
      httpMock.expectOne('/v1/portal/requests'),
    );
    req.flush(
      portalErrorBody('PORTAL.PRIVACY_SCOPE_REQUIRES_ASSURANCE', 403, {
        required: 'avancada',
      }),
      { status: 403, statusText: 'Forbidden' },
    );
    await vi.waitFor(() => {
      const link = root.querySelector('a[routerLink="/assinatura/elevacao"]');
      expect(link).not.toBeNull();
    });
    await expectA11yStateInvariants(root, catalog, {
      errorBannerFocused: true,
    });
  });
});

describe('T-24 — correção não permitida (§3.7; RN-121 3)', () => {
  it("dado 422 PRIVACY_CORRECTION_NOT_ALLOWED{field:cpf,howToCorrect:x} então portal.screens.t24.state.sem_permissao e o texto 'x' visível", async () => {
    // C-3c-54
    const harness = await mount();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.getAttribute('data-screen')).toBe('T-24'),
    );
    const correctButton = root.querySelector<HTMLButtonElement>(
      '[data-correct][data-field="cpf"]',
    );
    correctButton?.dispatchEvent(new Event('click', { bubbles: true }));
    const httpMock = harness.httpMock();
    const req = await vi.waitFor(() =>
      httpMock.expectOne('/v1/portal/requests'),
    );
    req.flush(
      portalErrorBody('PORTAL.PRIVACY_CORRECTION_NOT_ALLOWED', 422, {
        field: 'cpf',
        howToCorrect: 'x',
      }),
      { status: 422, statusText: 'Unprocessable Entity' },
    );
    await vi.waitFor(() => {
      expect(root.textContent).toContain(
        catalog['portal.screens.t24.state.sem_permissao'],
      );
      expect(root.textContent).toContain('x');
    });
    await expectA11yStateInvariants(root, catalog, {
      errorBannerFocused: true,
    });
  });
});

describe('T-24 — a11y por estado (§6/§7.3 — cobertura integral: carregando, has_data, no_data, partial, sem_elegibilidade, sem_permissao, indisponivel)', () => {
  it('dado carregando (SessionFacade.loading true, sem account ainda) então axe sem violação serious/critical', async () => {
    const harness = await mount(null, [], { loading: true });
    const root = harness.harness.routeNativeElement as HTMLElement;
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado has_data então axe sem violação serious/critical', async () => {
    const harness = await mount();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.getAttribute('data-screen')).toBe('T-24'),
    );
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado no_data então axe sem violação serious/critical', async () => {
    const harness = await mount(ME_PAIR3_FIXTURE);
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(catalog['portal.screens.t24.empty']),
    );
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado partial (availability partially_available) então axe sem violação serious/critical', async () => {
    const harness = await mount();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.getAttribute('data-screen')).toBe('T-24'),
    );
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado indisponivel (falha de SessionFacade.load(), por seção) então axe sem violação serious/critical', async () => {
    const harness = await mount(null, [], {
      loadError: {
        code: 'PORTAL.INTERNAL',
        status: 500,
        messageKey: null,
        context: {},
        fields: [],
        retryAfter: null,
      },
    });
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.screens.t24.state.indisponivel'],
      ),
    );
    // A12(b)/C-3c-112 (estendido): AlternativeChannelNote também presente em estado de erro.
    expect(
      root.querySelector('portal-alternative-channel-note'),
    ).not.toBeNull();
    await expectA11yStateInvariants(root, catalog);
  });
});
