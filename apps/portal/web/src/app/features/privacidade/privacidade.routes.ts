// Módulo `privacidade` (portal-frontends.md §4; route-manifest.md; contrato CTG-0003c §1): rota
// derivada do manifesto — guardas e `data.screen` vêm da fábrica (`moduleRoutes`), a página e o
// título são fixados aqui (T-24).
import type { Routes } from '@angular/router';
import { moduleRoutes } from '../../core/manifest-routes';
import { OwnDataPageComponent } from './pages/own-data.page';

export const PRIVACIDADE_ROUTES: Routes = moduleRoutes('privacidade', {
  'privacidade/meus-dados': {
    component: OwnDataPageComponent,
    title: 'portal.screens.t24.title',
  },
});
