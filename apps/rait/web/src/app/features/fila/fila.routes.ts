// Módulo `fila` (rait-web-frontend.md §4; route-manifest.md; contrato CTG-0002a §3 e CTG-0002b
// §6.1 linhas 4–5): rotas derivadas do manifesto — guardas, `title` e `data` vêm da fábrica
// (`moduleRoutes`); as páginas L2 são ligadas por `path`.
import type { Routes } from '@angular/router';
import { moduleRoutes } from '../../core/manifest-routes';
import { DefensePoolQueuePageComponent } from './pages/defense-pool-queue.page';
import { RapporteurQueuePageComponent } from './pages/rapporteur-queue.page';

export const FILA_ROUTES: Routes = moduleRoutes('fila', {
  'fila/defesa': { component: DefensePoolQueuePageComponent },
  'fila/recurso/:orgao': { component: RapporteurQueuePageComponent },
});
