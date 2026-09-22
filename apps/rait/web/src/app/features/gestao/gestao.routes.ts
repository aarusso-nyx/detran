// Módulo `gestao` (rait-web-frontend.md §4; route-manifest.md; contrato CTG-0002a §3 e
// CTG-0002b §6.1 linhas 38–43): rotas derivadas do manifesto — guardas, `title` e `data` vêm da
// fábrica (`moduleRoutes`); a raiz `gestao` continua redirect; L2 (radar, drill-down,
// incidentes) e L1 (produção, capacidade, turmas, qualidade) ligadas por `path`.
import type { Routes } from '@angular/router';
import { moduleRoutes } from '../../core/manifest-routes';
import { CapacityPlanPageComponent } from './pages/capacity-plan.page';
import { IncidentsPageComponent } from './pages/incidents.page';
import { ProductionPageComponent } from './pages/production.page';
import { QualitySamplingPageComponent } from './pages/quality-sampling.page';
import { RiskCaseDrilldownPageComponent } from './pages/risk-case-drilldown.page';
import { RiskRadarPageComponent } from './pages/risk-radar.page';
import { UnitsPageComponent } from './pages/units.page';

export const GESTAO_ROUTES: Routes = moduleRoutes('gestao', {
  'gestao/radar': { component: RiskRadarPageComponent },
  'gestao/radar/:caseId': { component: RiskCaseDrilldownPageComponent },
  'gestao/producao': { component: ProductionPageComponent },
  'gestao/capacidade': { component: CapacityPlanPageComponent },
  'gestao/turmas': { component: UnitsPageComponent },
  'gestao/incidentes': { component: IncidentsPageComponent },
  'gestao/qualidade': { component: QualitySamplingPageComponent },
});
