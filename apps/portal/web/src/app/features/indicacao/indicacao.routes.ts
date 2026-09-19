// Módulo `indicacao` (portal-frontends.md §4; route-manifest.md; contrato CTG-0003b §1): rota
// derivada do manifesto com caminho completo — guardas e `data.screen` vêm da fábrica
// (`moduleRoutes`), a página e o título são fixados aqui (T-05).
import type { Routes } from '@angular/router';
import { moduleRoutes } from '../../core/manifest-routes';
import { IndicacaoCondutorPageComponent } from './pages/indicacao-condutor.page';

export const INDICACAO_ROUTES: Routes = moduleRoutes('indicacao', {
  'autos/:aitId/condutor/nova': {
    component: IndicacaoCondutorPageComponent,
    title: 'portal.screens.t05.title',
  },
});
