// Módulo `atendimento` (portal-frontends.md §4; route-manifest.md; contrato CTG-0003c §1): rotas
// derivadas do manifesto com caminhos completos — guardas e `data.screen` vêm da fábrica
// (`moduleRoutes`), a página e o título de cada caminho são fixados aqui (T-21, T-22, T-26).
import type { Routes } from '@angular/router';
import { moduleRoutes } from '../../core/manifest-routes';
import { EvaluationPageComponent } from './pages/evaluation.page';
import { ManifestationDetailPageComponent } from './pages/manifestation-detail.page';
import { ManifestationNewPageComponent } from './pages/manifestation-new.page';

export const ATENDIMENTO_ROUTES: Routes = moduleRoutes('atendimento', {
  'ouvidoria/nova': {
    component: ManifestationNewPageComponent,
    title: 'portal.screens.t21.title',
  },
  'ouvidoria/:manifestationId': {
    component: ManifestationDetailPageComponent,
    title: 'portal.screens.t22.title',
  },
  'avaliacao/:requestId': {
    component: EvaluationPageComponent,
    title: 'portal.screens.t26.title',
  },
});
