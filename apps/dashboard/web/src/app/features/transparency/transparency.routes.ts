// Rotas do módulo `transparency` (D-12) — CTG-0002.md §3.
import type { Routes } from '@angular/router';
import { moduleRoutes } from '../../core/manifest-routes';
import { TransparencyAuditPageComponent } from './pages/transparencia.page';

export const TRANSPARENCY_ROUTES: Routes = moduleRoutes('transparency', {
  '/monitoramento/transparencia': {
    component: TransparencyAuditPageComponent,
  },
});
