// R-0014 TASK-0017 (Inspector). CTG-0003c §6 /exames/:examId/junta/nova (`JuntaMedicaPageComponent`);
// página real, ainda inexistente (§1) — "Cannot find module" até TASK-0018 (esperado, §9).
// [DIVERGE-17]: `junta_medica` está ausente do catálogo de fixture (A4/OD-P19) — a página é
// construída e testada com `ServiceCatalogFacade` stubada `available` (o guarda real redireciona
// nesta rodada; o e2e do CTG-0004 prova o redirecionamento real).
import { JuntaMedicaPageComponent } from './junta-medica.page'; // §9: "Cannot find module" esperado.
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
  EXAM_ID,
  portalErrorBody,
} from '../../../../testing/http-fixtures-pair3';

const catalog = portalCatalog as Record<string, string>;

async function mount() {
  const harness = await createPortalRouterHarness(PORTAL_ROUTES, [
    JuntaMedicaPageComponent,
    {
      provide: SessionFacade,
      useValue: createSessionFacadeStub({
        active: true,
        assuranceLevel: 'avancada',
        actRequirements: [
          { act: 'junta_medica', level: 'avancada', allowed: true },
        ],
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
  await harness.navigate(`/exames/${EXAM_ID}/junta/nova`);
  return harness;
}

describe('/exames/:examId/junta/nova — data-screen "" (§1 inv.; M8; [DIVERGE-17])', () => {
  it('dado a rota (guardas stubadas verdes) então host [data-screen]=""', async () => {
    // C-3c-100 (junta)
    const harness = await mount();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() => expect(root.getAttribute('data-screen')).toBe(''));
  });
});

// §6 "estados: os do wizard (CTG-0003a §5.4)" — as 9 fases do `ServiceWizard` (idle, carregando,
// inelegível, indisponível, banner de erro, composição, assinatura, protocolo/sucesso, offline)
// já têm cobertura integral própria e congelada em `shared/service-wizard.component.spec.ts`
// (TASK-0008-iteração-3): não se duplicam aqui. Esta página só acrescenta o que é seu: o estado
// inicial (composição, antes de qualquer interação) e o banner específico do domínio
// (422 BOARD_REQUEST_WINDOW_CLOSED).
describe('/exames/:examId/junta/nova — a11y por estado (§6/§7.3 — cobertura integral: composição, indisponível de domínio)', () => {
  it('dado a página montada (composição — estados internos do wizard delegados a service-wizard.component.spec.ts) então axe sem violação serious/critical', async () => {
    const harness = await mount();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() => expect(root.getAttribute('data-screen')).toBe(''));
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado 422 BOARD_REQUEST_WINDOW_CLOSED{dueOn} ao protocolar então banner portal.errors.board_request_window_closed e axe sem violação serious/critical', async () => {
    const harness = await mount();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() => expect(root.getAttribute('data-screen')).toBe(''));
    const submitButton = root.querySelector<HTMLButtonElement>(
      'button[type="submit"], [data-cmd="submit"]',
    );
    expect(
      submitButton,
      'botão de protocolar não encontrado no wizard de junta médica',
    ).not.toBeNull();
    submitButton!.dispatchEvent(new Event('click', { bubbles: true }));
    const httpMock = harness.httpMock();
    const req = await vi.waitFor(() =>
      httpMock.expectOne('/v1/portal/requests'),
    );
    req.flush(
      portalErrorBody('PORTAL.BOARD_REQUEST_WINDOW_CLOSED', 422, {
        dueOn: '2026-09-01',
      }),
      { status: 422, statusText: 'Unprocessable Entity' },
    );
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.errors.board_request_window_closed'],
      ),
    );
    // A12(b)/C-3c-112 (estendido): AlternativeChannelNote também presente em estado de erro
    // (renderizada de forma incondicional por <portal-service-wizard>, shared/service-wizard.component.ts).
    expect(
      root.querySelector('portal-alternative-channel-note'),
    ).not.toBeNull();
    await expectA11yStateInvariants(root, catalog, {
      errorBannerFocused: true,
    });
  });
});
