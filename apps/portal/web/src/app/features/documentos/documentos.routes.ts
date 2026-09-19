// Módulo `documentos` (portal-frontends.md §4; route-manifest.md; contrato CTG-0003c §1): rotas
// derivadas do manifesto com caminhos completos — guardas e `data.screen` vêm da fábrica
// (`moduleRoutes`), a página e o título de cada caminho são fixados aqui (T-16, /veiculos, T-17).
import type { Routes } from '@angular/router';
import { moduleRoutes } from '../../core/manifest-routes';
import { CnhPageComponent } from './pages/cnh.page';
import { CrlvPageComponent } from './pages/crlv.page';
import { VehiclesPageComponent } from './pages/vehicles.page';

export const DOCUMENTOS_ROUTES: Routes = moduleRoutes('documentos', {
  'documentos/cnh-digital': {
    component: CnhPageComponent,
    title: 'portal.screens.t16.title',
  },
  veiculos: {
    component: VehiclesPageComponent,
    title: 'portal.documents.vehicles.title',
  },
  'veiculos/:vehicleId/crlv-e': {
    component: CrlvPageComponent,
    title: 'portal.screens.t17.title',
  },
});
