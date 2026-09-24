import type { Routes } from '@angular/router';
import { teatRoute } from '../../shared/mobile-page.component.js';

export const CONSULTAS_ROUTES: Routes = [
  teatRoute(
    {
      path: 'vehicle-search',
      uxCode: 'UX-MOB-010',
      sourceSheet: 'IU-TEAT-vehicle-search.md',
      guardPlan: 'B+S',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component:
        'features/consultas/pages/vehicle-search.page.ts#VehicleSearchPageComponent',
    },
    () =>
      import('./pages/vehicle-search.page.js').then(
        (module) => module.VehicleSearchPageComponent,
      ),
  ),
  teatRoute(
    {
      path: 'vehicle-result',
      uxCode: 'UX-MOB-011',
      sourceSheet: 'IU-TEAT-vehicle-result.md',
      guardPlan: 'B+S',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component:
        'features/consultas/pages/vehicle-result.page.ts#VehicleResultPageComponent',
    },
    () =>
      import('./pages/vehicle-result.page.js').then(
        (module) => module.VehicleResultPageComponent,
      ),
  ),
  teatRoute(
    {
      path: 'vehicle-divergence',
      uxCode: 'UX-MOB-012',
      sourceSheet: 'IU-TEAT-vehicle-divergence.md',
      guardPlan: 'B+S',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component:
        'features/consultas/pages/vehicle-divergence.page.ts#VehicleDivergencePageComponent',
    },
    () =>
      import('./pages/vehicle-divergence.page.js').then(
        (module) => module.VehicleDivergencePageComponent,
      ),
  ),
  teatRoute(
    {
      path: 'driver-search',
      uxCode: 'UX-MOB-013',
      sourceSheet: 'IU-TEAT-driver-search.md',
      guardPlan: 'B+S',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component:
        'features/consultas/pages/driver-search.page.ts#DriverSearchPageComponent',
    },
    () =>
      import('./pages/driver-search.page.js').then(
        (module) => module.DriverSearchPageComponent,
      ),
  ),
  teatRoute(
    {
      path: 'driver-result',
      uxCode: 'UX-MOB-014',
      sourceSheet: 'IU-TEAT-driver-result.md',
      guardPlan: 'B+S',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component:
        'features/consultas/pages/driver-result.page.ts#DriverResultPageComponent',
    },
    () =>
      import('./pages/driver-result.page.js').then(
        (module) => module.DriverResultPageComponent,
      ),
  ),
  teatRoute(
    {
      path: 'query-failure',
      uxCode: 'UX-MOB-015',
      sourceSheet: 'IU-TEAT-query-failure.md',
      guardPlan: 'B+S',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component:
        'features/consultas/pages/query-failure.page.ts#QueryFailurePageComponent',
    },
    () =>
      import('./pages/query-failure.page.js').then(
        (module) => module.QueryFailurePageComponent,
      ),
  ),
];
