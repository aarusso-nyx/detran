// Módulo `assinatura` (portal-frontends.md §4; route-manifest.md; contrato CTG-0003c §1): rota
// derivada do manifesto — guardas e `data.screen` vêm da fábrica (`moduleRoutes`), a página e o
// título são fixados aqui (T-27).
import type { Routes } from '@angular/router';
import { moduleRoutes } from '../../core/manifest-routes';
import { ElevationPageComponent } from './pages/elevation.page';

export const ASSINATURA_ROUTES: Routes = moduleRoutes('assinatura', {
  'assinatura/elevacao': {
    component: ElevationPageComponent,
    title: 'portal.screens.t27.title',
  },
});
