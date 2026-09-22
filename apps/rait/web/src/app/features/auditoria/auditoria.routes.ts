// Módulo `auditoria` (rait-web-frontend.md §4; route-manifest.md; contrato CTG-0002a §3 e
// CTG-0002b §6.1 linhas 58–59): rotas derivadas do manifesto — guardas, `title` e `data` vêm da
// fábrica (`moduleRoutes`); a raiz continua redirect; `trilha` é L2 e `exportacoes` continua L0.
import type { Routes } from '@angular/router';
import { moduleRoutes } from '../../core/manifest-routes';
import { AuditTrailPageComponent } from './pages/audit-trail.page';

export const AUDITORIA_ROUTES: Routes = moduleRoutes('auditoria', {
  'auditoria/trilha': { component: AuditTrailPageComponent },
});
