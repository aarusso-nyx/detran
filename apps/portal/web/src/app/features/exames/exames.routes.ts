// Módulo `exames` (portal-frontends.md §4; route-manifest.md; contrato CTG-0003c §1): rotas
// derivadas do manifesto com caminhos completos — guardas e `data.screen` vêm da fábrica
// (`moduleRoutes`), a página e o título de cada caminho são fixados aqui (T-20, junta).
import type { Routes } from '@angular/router';
import { moduleRoutes } from '../../core/manifest-routes';
import { ExamListPageComponent } from './pages/exam-list.page';
import { JuntaMedicaPageComponent } from './pages/junta-medica.page';

export const EXAMES_ROUTES: Routes = moduleRoutes('exames', {
  exames: {
    component: ExamListPageComponent,
    title: 'portal.screens.t20.title',
  },
  'exames/:examId/junta/nova': {
    component: JuntaMedicaPageComponent,
    title: 'portal.services.junta_medica',
  },
});
