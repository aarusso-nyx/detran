// Módulo `catalogo` (portal-frontends.md §4; route-manifest.md; contrato CTG-0003c §1): rotas
// derivadas do manifesto com caminhos completos — guardas e `data.screen` vêm da fábrica
// (`moduleRoutes`), a página e o título de cada caminho são fixados aqui (T-25 lista/detalhe, T-15).
import type { Routes } from '@angular/router';
import { moduleRoutes } from '../../core/manifest-routes';
import { PointsExplainerPageComponent } from './pages/points-explainer.page';
import { ServiceCharterPageComponent } from './pages/service-charter.page';

export const CATALOGO_ROUTES: Routes = moduleRoutes('catalogo', {
  'carta-servicos': {
    component: ServiceCharterPageComponent,
    title: 'portal.screens.t25.title',
  },
  'carta-servicos/:serviceKey': {
    component: ServiceCharterPageComponent,
    title: 'portal.screens.t25.title',
  },
  'pontuacao/como-funciona': {
    component: PointsExplainerPageComponent,
    title: 'portal.screens.t15.title',
  },
});
