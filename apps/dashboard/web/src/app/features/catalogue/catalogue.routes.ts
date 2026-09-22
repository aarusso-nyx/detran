// Rotas do módulo `catalogue` (D-14, D-15, D-18 e a filha §B de D-14) — CTG-0002.md §3.
import type { Routes } from '@angular/router';
import { moduleRoutes } from '../../core/manifest-routes';
import { FreshnessStatusPageComponent } from './pages/frescor.page';
import { IndicatorCataloguePageComponent } from './pages/indicadores.page';
import { SelfKpiPageComponent } from './pages/kpis.page';

export const CATALOGUE_ROUTES: Routes = moduleRoutes('catalogue', {
  '/monitoramento/indicadores': { component: IndicatorCataloguePageComponent },
  '/monitoramento/frescor': { component: FreshnessStatusPageComponent },
  '/monitoramento/kpis': { component: SelfKpiPageComponent },
  '/monitoramento/indicadores/:id': {
    component: IndicatorCataloguePageComponent,
  },
});
