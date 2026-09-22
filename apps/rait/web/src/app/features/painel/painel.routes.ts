// Módulo `painel` (rait-web-frontend.md §4; route-manifest.md; contrato CTG-0002a §3 e
// CTG-0002b §6.1 linhas 2–3): rotas derivadas do manifesto — guardas, `title` e `data` vêm da
// fábrica (`moduleRoutes`); as páginas L2 são ligadas por `path`.
import type { Routes } from '@angular/router';
import { moduleRoutes } from '../../core/manifest-routes';
import { ResumeTrayPageComponent } from './pages/resume-tray.page';
import { ShiftDashboardPageComponent } from './pages/shift-dashboard.page';

export const PAINEL_ROUTES: Routes = moduleRoutes('painel', {
  painel: { component: ShiftDashboardPageComponent },
  'painel/retomar': { component: ResumeTrayPageComponent },
});
