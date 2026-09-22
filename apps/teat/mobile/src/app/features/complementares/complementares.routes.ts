import type { Routes } from '@angular/router';
import { teatRoute } from '../../shared/mobile-page.component.js';

export const COMPLEMENTARES_ROUTES: Routes = [
  teatRoute(
    {
      path: 'approach-no-ait',
      uxCode: 'UX-MOB-C01',
      sourceSheet: 'IU-TEAT-approach-no-ait.md',
      guardPlan: 'B+S',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component:
        'features/complementares/pages/approach-no-ait.page.ts#ApproachNoAitPageComponent',
    },
    () =>
      import('./pages/approach-no-ait.page.js').then(
        (module) => module.ApproachNoAitPageComponent,
      ),
  ),
  teatRoute(
    {
      path: 'document-check',
      uxCode: 'UX-MOB-C02',
      sourceSheet: 'IU-TEAT-document-check.md',
      guardPlan: 'B+S',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component:
        'features/complementares/pages/document-check.page.ts#DocumentCheckPageComponent',
    },
    () =>
      import('./pages/document-check.page.js').then(
        (module) => module.DocumentCheckPageComponent,
      ),
  ),
  teatRoute(
    {
      path: 'special-inspection',
      uxCode: 'UX-MOB-C03',
      sourceSheet: 'IU-TEAT-special-inspection.md',
      guardPlan: 'B+S',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component:
        'features/complementares/pages/special-inspection.page.ts#SpecialInspectionPageComponent',
    },
    () =>
      import('./pages/special-inspection.page.js').then(
        (module) => module.SpecialInspectionPageComponent,
      ),
  ),
  teatRoute(
    {
      path: 'context-help',
      uxCode: 'UX-MOB-C04',
      sourceSheet: 'IU-TEAT-context-help.md',
      guardPlan: 'R',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component:
        'features/complementares/pages/context-help.page.ts#ContextHelpPageComponent',
    },
    () =>
      import('./pages/context-help.page.js').then(
        (module) => module.ContextHelpPageComponent,
      ),
  ),
  teatRoute(
    {
      path: 'local-settings',
      uxCode: 'UX-MOB-C05',
      sourceSheet: 'IU-TEAT-local-settings.md',
      guardPlan: 'B',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component:
        'features/complementares/pages/local-settings.page.ts#LocalSettingsPageComponent',
    },
    () =>
      import('./pages/local-settings.page.js').then(
        (module) => module.LocalSettingsPageComponent,
      ),
  ),
];
