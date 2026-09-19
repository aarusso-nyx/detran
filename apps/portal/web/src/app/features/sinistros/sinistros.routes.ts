// Módulo `sinistros` (portal-frontends.md §4; route-manifest.md; contrato CTG-0003c §1): rotas
// derivadas do manifesto com caminhos completos — guardas e `data.screen` vêm da fábrica
// (`moduleRoutes`), a página e o título de cada caminho são fixados aqui (T-18, T-19).
import type { Routes } from '@angular/router';
import { moduleRoutes } from '../../core/manifest-routes';
import { CrashDetailPageComponent } from './pages/crash-detail.page';
import { CrashListPageComponent } from './pages/crash-list.page';

export const SINISTROS_ROUTES: Routes = moduleRoutes('sinistros', {
  sinistros: {
    component: CrashListPageComponent,
    title: 'portal.screens.t18.title',
  },
  'sinistros/:crashId': {
    component: CrashDetailPageComponent,
    title: 'portal.screens.t19.title',
  },
});
