// Módulo `pagamento` (portal-frontends.md §4; route-manifest.md; contrato CTG-0003b §1): rotas
// derivadas do manifesto com caminhos completos — guardas e `data.screen` vêm da fábrica
// (`moduleRoutes`), a página e o título de cada caminho são fixados aqui (T-13, T-23).
import type { Routes } from '@angular/router';
import { moduleRoutes } from '../../core/manifest-routes';
import { PagamentoPreservandoRecursoPageComponent } from './pages/pagamento-preservando-recurso.page';
import { PagamentoPageComponent } from './pages/pagamento.page';

export const PAGAMENTO_ROUTES: Routes = moduleRoutes('pagamento', {
  'autos/:aitId/pagamento': {
    component: PagamentoPageComponent,
    title: 'portal.screens.t13.title',
  },
  'autos/:aitId/pagamento/preservando-recurso': {
    component: PagamentoPreservandoRecursoPageComponent,
    title: 'portal.screens.t23.title',
  },
});
