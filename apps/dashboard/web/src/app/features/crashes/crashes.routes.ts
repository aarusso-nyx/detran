// Rotas do módulo `crashes` (D-13) — CTG-0002.md §3.
import type { Routes } from '@angular/router';
import { moduleRoutes } from '../../core/manifest-routes';
import { CrashStatisticsPageComponent } from './pages/sinistros.page';

export const CRASHES_ROUTES: Routes = moduleRoutes('crashes', {
  '/monitoramento/sinistros': { component: CrashStatisticsPageComponent },
});
