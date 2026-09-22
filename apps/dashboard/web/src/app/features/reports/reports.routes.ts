// Rotas do módulo `reports` (D-16, D-17 e a filha §B de D-16) — CTG-0002.md §3.
import type { Routes } from '@angular/router';
import { moduleRoutes } from '../../core/manifest-routes';
import { ExportRegistryPageComponent } from './pages/exportacoes.page';
import { GeneratedReportsPageComponent } from './pages/relatorios.page';

export const REPORTS_ROUTES: Routes = moduleRoutes('reports', {
  '/monitoramento/relatorios': { component: GeneratedReportsPageComponent },
  '/monitoramento/exportacoes': { component: ExportRegistryPageComponent },
  '/monitoramento/relatorios/:id': {
    component: GeneratedReportsPageComponent,
  },
});
