/** Homologation-only landing route; production's route manifest is unchanged. */
import type { Routes } from '@angular/router';
import { TEAT_ROUTES } from './app.routes.js';

export const TEAT_HOMOLOGATION_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'auth-login' },
  ...TEAT_ROUTES,
];
