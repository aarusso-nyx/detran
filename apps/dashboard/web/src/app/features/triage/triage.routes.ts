// Rotas do módulo `triage` (D-01, D-02) — uma página por rota com ficha (CTG-0002.md §3).
import type { Routes } from '@angular/router';
import { moduleRoutes } from '../../core/manifest-routes';
import { AlertDetailPageComponent } from './pages/alertas-id.page';
import { ShiftTriagePageComponent } from './pages/triagem.page';

export const TRIAGE_ROUTES: Routes = moduleRoutes('triage', {
  '/monitoramento': { component: ShiftTriagePageComponent },
  '/monitoramento/alertas/:id': { component: AlertDetailPageComponent },
});
