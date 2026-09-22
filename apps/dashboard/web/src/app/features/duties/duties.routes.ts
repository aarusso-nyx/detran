// Rotas do módulo `duties` (D-08, D-09) — CTG-0002.md §3.
import type { Routes } from '@angular/router';
import { moduleRoutes } from '../../core/manifest-routes';
import { DutyCyclePageComponent } from './pages/deveres-id-ciclos-period.page';
import { DutyCalendarPageComponent } from './pages/deveres.page';

export const DUTIES_ROUTES: Routes = moduleRoutes('duties', {
  '/monitoramento/deveres': { component: DutyCalendarPageComponent },
  '/monitoramento/deveres/:id/ciclos/:period': {
    component: DutyCyclePageComponent,
  },
});
