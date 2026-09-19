// Módulo `defesa` (portal-frontends.md §4; route-manifest.md; contrato CTG-0003b §1): rotas
// derivadas do manifesto com caminhos completos — guardas e `data.screen` vêm da fábrica
// (`moduleRoutes`), a página e o título de cada caminho são fixados aqui (T-02, T-03, T-04).
import type { Routes } from '@angular/router';
import { moduleRoutes } from '../../core/manifest-routes';
import { DefesaPreviaPageComponent } from './pages/defesa-previa.page';
import { RecursoCetranPageComponent } from './pages/recurso-cetran.page';
import { RecursoJariPageComponent } from './pages/recurso-jari.page';

export const DEFESA_ROUTES: Routes = moduleRoutes('defesa', {
  'autos/:aitId/defesa/nova': {
    component: DefesaPreviaPageComponent,
    title: 'portal.screens.t02.title',
  },
  'processos/:requestId/jari/nova': {
    component: RecursoJariPageComponent,
    title: 'portal.screens.t03.title',
  },
  'processos/:requestId/cetran/nova': {
    component: RecursoCetranPageComponent,
    title: 'portal.screens.t04.title',
  },
});
