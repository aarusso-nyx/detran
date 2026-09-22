// Rotas do módulo `integrations` (D-06, D-07) — CTG-0002.md §3.
import type { Routes } from '@angular/router';
import { moduleRoutes } from '../../core/manifest-routes';
import { IntegrationDetailPageComponent } from './pages/integracoes-system.page';
import { IntegrationHealthPageComponent } from './pages/integracoes.page';

export const INTEGRATIONS_ROUTES: Routes = moduleRoutes('integrations', {
  '/monitoramento/integracoes': { component: IntegrationHealthPageComponent },
  '/monitoramento/integracoes/:system': {
    component: IntegrationDetailPageComponent,
  },
});
