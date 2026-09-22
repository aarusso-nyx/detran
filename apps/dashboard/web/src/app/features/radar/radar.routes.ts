// Rotas do módulo `radar` (D-03, D-04, D-05) — CTG-0002.md §3.
import type { Routes } from '@angular/router';
import { moduleRoutes } from '../../core/manifest-routes';
import { PecRadarPageComponent } from './pages/radar-pec.page';
import { RaitRadarPageComponent } from './pages/radar-rait.page';
import { TeatRadarPageComponent } from './pages/radar-teat.page';

export const RADAR_ROUTES: Routes = moduleRoutes('radar', {
  '/monitoramento/radar/rait': { component: RaitRadarPageComponent },
  '/monitoramento/radar/pec': { component: PecRadarPageComponent },
  '/monitoramento/radar/teat': { component: TeatRadarPageComponent },
});
