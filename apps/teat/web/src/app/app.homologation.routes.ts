/** A safe landing route for the UI homologation build only. */
import type { Routes } from '@angular/router';
import { TEAT_ROUTES } from './app.routes.js';

export const TEAT_HOMOLOGATION_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'ux/web/login' },
  ...TEAT_ROUTES,
];
