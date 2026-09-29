// R-0032 TASK-0008 (Inspector, O2). Acessibilidade do que já existe e
// contrato explícito para as rotas PEC que dependem de O7/O8.
import { TestBed } from '@angular/core/testing';
import { StynxI18nModule, StynxI18nService } from '@stynx-nyx/angular-i18n';
import portalCatalog from '../i18n/portal.pt-BR.json';
import { PORTAL_ROUTES } from '../app.routes';
import { SessionFacade } from '../core/session.facade';
import { EntitlementFacade } from '../core/entitlement.facade';
import { ServiceCatalogFacade } from '../core/service-catalog.facade';
import { createSessionFacadeStub } from '../../testing/session-facade.stub';
import { createEntitlementFacadeStub } from '../../testing/entitlement-facade.stub';
import { createServiceCatalogFacadeStub } from '../../testing/service-catalog-facade.stub';
import {
  createPortalRouterHarness,
  FIXED_ENTITY_ID,
} from '../../testing/router-harness';
import { expectNoSeriousA11yViolations } from './axe.spec-helper';

const catalog = portalCatalog as Record<string, string>;

async function mountBoard(status: 'available' | 'unavailable') {
  const harness = await createPortalRouterHarness(PORTAL_ROUTES, [
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
      useValue: createServiceCatalogFacadeStub({ status }),
    },
    StynxI18nModule.forRoot({
      defaultLocale: 'pt-BR',
      loadCatalog: async () => catalog,
    }),
  ]);
  await TestBed.inject(StynxI18nService).initialize();
  await harness.navigate(`/exames/${FIXED_ENTITY_ID}/junta/nova`);
  return harness;
}

describe('a11y PEC — P-04 já disponível no manifesto', () => {
  it('não apresenta violações axe serious/critical quando junta_medica está disponível', async () => {
    const mounted = await mountBoard('available');
    const root = mounted.harness.routeNativeElement as HTMLElement;
    expect(root.tagName.toLowerCase()).toBe('portal-junta-medica-page');
    await expectNoSeriousA11yViolations(root);
  });

  it('não apresenta violações axe serious/critical no redirecionamento de serviço bloqueado', async () => {
    const mounted = await mountBoard('unavailable');
    const root = mounted.harness.routeNativeElement as HTMLElement;
    expect(root.tagName.toLowerCase()).toBe('portal-service-unavailable-page');
    await expectNoSeriousA11yViolations(root);
  });
});

describe('a11y PEC — superfícies diferidas', () => {
  it.todo(
    'TASK-0009: executar axe por loading, vazio, sem vínculo, assurance insuficiente, bloqueado e falha nas rotas P-01, P-02, P-03 e P-05…P-07 e auxiliar após O7/O8',
  );
});
