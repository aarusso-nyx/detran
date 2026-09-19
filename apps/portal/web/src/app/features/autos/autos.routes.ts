// Módulo `autos` (portal-frontends.md §4; route-manifest.md; contrato CTG-0003b §1): rotas
// derivadas do manifesto com caminhos completos — guardas e `data.screen` vêm da fábrica
// (`moduleRoutes`), a página e o título de cada caminho são fixados aqui (T-14, T-01).
import type { Routes } from '@angular/router';
import { moduleRoutes } from '../../core/manifest-routes';
import { AitDetailPageComponent } from './pages/ait-detail.page';
import { AitListPageComponent } from './pages/ait-list.page';

export const AUTOS_ROUTES: Routes = moduleRoutes('autos', {
  autos: {
    component: AitListPageComponent,
    title: 'portal.screens.t14.title',
  },
  'autos/:aitId': {
    component: AitDetailPageComponent,
    title: 'portal.screens.t01.title',
  },
});
