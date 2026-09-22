// Rotas do módulo `comparison` (D-10) — CTG-0002.md §3.
import type { Routes } from '@angular/router';
import { moduleRoutes } from '../../core/manifest-routes';
import { ComparisonPageComponent } from './pages/comparativo.page';

export const COMPARISON_ROUTES: Routes = moduleRoutes('comparison', {
  '/monitoramento/comparativo': { component: ComparisonPageComponent },
});
