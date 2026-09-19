// Módulo `processos` (portal-frontends.md §4; route-manifest.md; contrato CTG-0003b §1): rotas
// derivadas do manifesto com caminhos completos — guardas e `data.screen` vêm da fábrica
// (`moduleRoutes`), a página e o título de cada caminho são fixados aqui (T-06, T-07, T-11, T-08,
// T-10).
import type { Routes } from '@angular/router';
import { moduleRoutes } from '../../core/manifest-routes';
import { DecisaoPageComponent } from './pages/decisao.page';
import { DesistenciaPageComponent } from './pages/desistencia.page';
import { DiligenciaPageComponent } from './pages/diligencia.page';
import { RequestDetailPageComponent } from './pages/request-detail.page';
import { RequestListPageComponent } from './pages/request-list.page';

export const PROCESSOS_ROUTES: Routes = moduleRoutes('processos', {
  processos: {
    component: RequestListPageComponent,
    title: 'portal.screens.t06.title',
  },
  'processos/:requestId': {
    component: RequestDetailPageComponent,
    title: 'portal.screens.t07.title',
  },
  'processos/:requestId/diligencia/:diligenceId': {
    component: DiligenciaPageComponent,
    title: 'portal.screens.t11.title',
  },
  'processos/:requestId/desistencia': {
    component: DesistenciaPageComponent,
    title: 'portal.screens.t08.title',
  },
  'processos/:requestId/decisao': {
    component: DecisaoPageComponent,
    title: 'portal.screens.t10.title',
  },
});
