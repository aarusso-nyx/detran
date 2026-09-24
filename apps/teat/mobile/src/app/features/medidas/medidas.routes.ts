import type { Routes } from '@angular/router';
import { teatRoute } from '../../shared/mobile-page.component.js';

export const MEDIDAS_ROUTES: Routes = [
  teatRoute(
    {
      path: 'measure-start',
      uxCode: 'UX-MOB-040',
      sourceSheet: 'IU-TEAT-measure-start.md',
      guardPlan: 'B+S',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component:
        'features/medidas/pages/measure-start.page.ts#MeasureStartPageComponent',
    },
    () =>
      import('./pages/measure-start.page.js').then(
        (module) => module.MeasureStartPageComponent,
      ),
  ),
  teatRoute(
    {
      path: 'retention',
      uxCode: 'UX-MOB-041',
      sourceSheet: 'IU-TEAT-retention.md',
      guardPlan: 'B+S',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component:
        'features/medidas/pages/retention.page.ts#RetentionPageComponent',
    },
    () =>
      import('./pages/retention.page.js').then(
        (module) => module.RetentionPageComponent,
      ),
  ),
  teatRoute(
    {
      path: 'removal',
      uxCode: 'UX-MOB-042',
      sourceSheet: 'IU-TEAT-removal.md',
      guardPlan: 'B+S',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component: 'features/medidas/pages/removal.page.ts#RemovalPageComponent',
    },
    () =>
      import('./pages/removal.page.js').then(
        (module) => module.RemovalPageComponent,
      ),
  ),
  teatRoute(
    {
      path: 'inventory',
      uxCode: 'UX-MOB-043',
      sourceSheet: 'IU-TEAT-inventory.md',
      guardPlan: 'B+S',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component:
        'features/medidas/pages/inventory.page.ts#InventoryPageComponent',
    },
    () =>
      import('./pages/inventory.page.js').then(
        (module) => module.InventoryPageComponent,
      ),
  ),
  teatRoute(
    {
      path: 'transshipment',
      uxCode: 'UX-MOB-044',
      sourceSheet: 'IU-TEAT-transshipment.md',
      guardPlan: 'B+S',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component:
        'features/medidas/pages/transshipment.page.ts#TransshipmentPageComponent',
    },
    () =>
      import('./pages/transshipment.page.js').then(
        (module) => module.TransshipmentPageComponent,
      ),
  ),
  teatRoute(
    {
      path: 'measure-term',
      uxCode: 'UX-MOB-045',
      sourceSheet: 'IU-TEAT-measure-term.md',
      guardPlan: 'B+S',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component:
        'features/medidas/pages/measure-term.page.ts#MeasureTermPageComponent',
    },
    () =>
      import('./pages/measure-term.page.js').then(
        (module) => module.MeasureTermPageComponent,
      ),
  ),
  teatRoute(
    {
      path: 'measure-done',
      uxCode: 'UX-MOB-046',
      sourceSheet: 'IU-TEAT-measure-done.md',
      guardPlan: 'B+S',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component:
        'features/medidas/pages/measure-done.page.ts#MeasureDonePageComponent',
    },
    () =>
      import('./pages/measure-done.page.js').then(
        (module) => module.MeasureDonePageComponent,
      ),
  ),
];
