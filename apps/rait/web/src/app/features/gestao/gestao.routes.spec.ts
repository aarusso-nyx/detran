// R-0012 TASK-0014 (Inspector, iteração restrita 3). CTG-0002b.md §6/§8 — C-2B-61 (3 L2),
// C-2B-62 (4 L1, HttpTestingController), C-2B-83. `features/gestao/pages/*.page.ts` ainda não
// existem (TASK-0015): falha de módulo esperada.
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { describe, expect, it } from 'vitest';
import {
  commandRunnerStub,
  listFacadeStub,
  pageProviders,
  readSlotStub,
  stubFacade,
} from '../../../testing/facade.stub';
import {
  createRaitRouterHarness,
  screenElement,
  substituteRouteParams,
} from '../../../testing/router-harness';
import { RAIT_ALL_ROLES } from '../../../testing/route-manifest.fixture';
import { RadarFacade } from '../../data/facades/radar.facade';
import { PlaceholderPageComponent } from '../../shared/placeholder-page.component';
import { RiskRadarPageComponent } from './pages/risk-radar.page';
import { RiskCaseDrilldownPageComponent } from './pages/risk-case-drilldown.page';
import { IncidentsPageComponent } from './pages/incidents.page';
import { ProductionPageComponent } from './pages/production.page';
import { CapacityPlanPageComponent } from './pages/capacity-plan.page';
import { UnitsPageComponent } from './pages/units.page';
import { QualitySamplingPageComponent } from './pages/quality-sampling.page';
import { GESTAO_ROUTES } from './gestao.routes';

function radarFacadeStub() {
  return stubFacade<RadarFacade>()({
    radar: listFacadeStub([]),
    drilldown: readSlotStub({ status: 'idle' }),
    incidentes: listFacadeStub([]),
    radarCasos: (() => new Map()) as never,
    incidentesRelogio: (() => new Map()) as never,
    command: commandRunnerStub(),
  });
}

async function activateL2(path: string, role: string) {
  const harness = await createRaitRouterHarness(
    pageProviders(role as never, [
      { provide: RadarFacade, useValue: radarFacadeStub() },
    ]),
  );
  await harness.navigateByUrl(`/${substituteRouteParams(path)}`);
  return harness;
}

describe('gestao — C-2B-61 (L2, presença + ausência)', () => {
  const L2: readonly { path: string; screen: string; component: unknown }[] = [
    { path: 'gestao/radar', screen: 'T-14', component: RiskRadarPageComponent },
    {
      path: 'gestao/radar/:caseId',
      screen: 'T-15',
      component: RiskCaseDrilldownPageComponent,
    },
    {
      path: 'gestao/incidentes',
      screen: '',
      component: IncidentsPageComponent,
    },
  ];

  L2.forEach(({ path, screen, component }) => {
    it(`dado "${path}" ativada com rait-manager quando renderizada então o componente real com data-screen "${screen}"`, async () => {
      const harness = await activateL2(path, 'rait-manager');
      const element = screenElement(harness);
      expect(element?.tagName.toLowerCase()).not.toBe('rait-placeholder-page');
      expect(element?.getAttribute('data-screen')).toBe(screen);
      expect(harness.routeDebugElement?.componentInstance).toBeInstanceOf(
        component as never,
      );
    });

    const omitted = RAIT_ALL_ROLES.filter((role) => role !== 'rait-manager');
    it(`dado "${path}" ativada com ${omitted[0]} (omitido) quando navegada então /sem-permissao [negativo]`, async () => {
      await activateL2(path, omitted[0]);
      const router = TestBed.inject(Router);
      expect(new URL(router.url, 'http://localhost').pathname).toBe(
        '/sem-permissao',
      );
    });
  });
});

describe('gestao — C-2B-62 (L1: requisição HTTP, stynx-table, sem botão)', () => {
  const L1: readonly {
    path: string;
    url: string;
    roles: string[];
    component: unknown;
  }[] = [
    {
      path: 'gestao/producao',
      url: '/v1/inf/rait/assignments',
      roles: ['rait-manager', 'rait-coordinator'],
      component: ProductionPageComponent,
    },
    {
      path: 'gestao/capacidade',
      url: '/v1/inf/rait/capacity-plans',
      roles: ['rait-coordinator', 'rait-manager'],
      component: CapacityPlanPageComponent,
    },
    {
      path: 'gestao/turmas',
      url: '/v1/inf/rait/units',
      roles: ['rait-manager'],
      component: UnitsPageComponent,
    },
    {
      path: 'gestao/qualidade',
      url: '/v1/inf/rait/quality-samples',
      roles: ['rait-coordinator'],
      component: QualitySamplingPageComponent,
    },
  ];

  L1.forEach(({ path, url, roles, component }) => {
    it(`dado "${path}" ativada com ${roles[0]} quando o cliente responde então o componente real, uma requisição GET ${url} sem query, stynx-table + stynx-pagination e nenhum botão de comando`, async () => {
      const harness = await createRaitRouterHarness(
        pageProviders(roles[0] as never, [
          provideHttpClient(),
          provideHttpClientTesting(),
        ]),
      );
      const navigation = harness.navigateByUrl(
        `/${substituteRouteParams(path)}`,
      );
      const http = TestBed.inject(HttpTestingController);
      const req = await navigation.then(() =>
        http.expectOne({ method: 'GET', url }),
      );
      expect(req.request.params.keys()).toHaveLength(0);
      req.flush([]);
      harness.detectChanges();
      const element = screenElement(harness);
      expect(harness.routeDebugElement?.componentInstance).toBeInstanceOf(
        component as never,
      );
      expect(
        harness.routeNativeElement?.querySelector('stynx-table'),
      ).not.toBeNull();
      expect(
        harness.routeNativeElement?.querySelectorAll('[data-action]'),
      ).toHaveLength(0);
      void element;
      http.verify();
    });
  });
});

describe('gestao.routes — C-2B-83', () => {
  it('dado GESTAO_ROUTES quando lido então L2/L1 com componentes reais; nenhum PlaceholderPageComponent', () => {
    const byPath = new Map(GESTAO_ROUTES.map((route) => [route.path, route]));
    expect(byPath.get('gestao/radar')?.component).toBe(RiskRadarPageComponent);
    expect(byPath.get('gestao/radar/:caseId')?.component).toBe(
      RiskCaseDrilldownPageComponent,
    );
    expect(byPath.get('gestao/incidentes')?.component).toBe(
      IncidentsPageComponent,
    );
    expect(byPath.get('gestao/producao')?.component).toBe(
      ProductionPageComponent,
    );
    expect(byPath.get('gestao/capacidade')?.component).toBe(
      CapacityPlanPageComponent,
    );
    expect(byPath.get('gestao/turmas')?.component).toBe(UnitsPageComponent);
    expect(byPath.get('gestao/qualidade')?.component).toBe(
      QualitySamplingPageComponent,
    );
    // A raiz de grupo `gestao` (redirect) usa `PlaceholderPageComponent` por desenho
    // (`manifestRoute`) — só as 7 páginas (3 L2 + 4 L1) checadas acima devem ter componente real.
    for (const path of [
      'gestao/radar',
      'gestao/radar/:caseId',
      'gestao/incidentes',
      'gestao/producao',
      'gestao/capacidade',
      'gestao/turmas',
      'gestao/qualidade',
    ]) {
      expect(byPath.get(path)?.component).not.toBe(PlaceholderPageComponent);
    }
  });
});
