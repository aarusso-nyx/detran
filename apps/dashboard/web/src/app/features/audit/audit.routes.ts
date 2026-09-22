// Rotas do módulo `audit` (D-11) — CTG-0002.md §3.
import type { Routes } from '@angular/router';
import { moduleRoutes } from '../../core/manifest-routes';
import { AuditTrailPageComponent } from './pages/auditoria.page';

export const AUDIT_ROUTES: Routes = moduleRoutes('audit', {
  '/monitoramento/auditoria': { component: AuditTrailPageComponent },
});
