import type { Routes } from '@angular/router';
import { teatRoute } from '../../shared/mobile-page.component.js';

export const AIT_ROUTES: Routes = [
  teatRoute(
    {
      path: 'ait-start',
      uxCode: 'UX-MOB-020',
      sourceSheet: 'IU-TEAT-ait-start.md',
      guardPlan: 'B+S',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component: 'features/ait/pages/ait-start.page.ts#AitStartPageComponent',
    },
    () =>
      import('./pages/ait-start.page.js').then(
        (module) => module.AitStartPageComponent,
      ),
  ),
  teatRoute(
    {
      path: 'ait-vehicle',
      uxCode: 'UX-MOB-021',
      sourceSheet: 'IU-TEAT-ait-vehicle.md',
      guardPlan: 'B+S',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component:
        'features/ait/pages/ait-vehicle.page.ts#AitVehiclePageComponent',
    },
    () =>
      import('./pages/ait-vehicle.page.js').then(
        (module) => module.AitVehiclePageComponent,
      ),
  ),
  teatRoute(
    {
      path: 'ait-driver',
      uxCode: 'UX-MOB-022',
      sourceSheet: 'IU-TEAT-ait-driver.md',
      guardPlan: 'B+S',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component: 'features/ait/pages/ait-driver.page.ts#AitDriverPageComponent',
    },
    () =>
      import('./pages/ait-driver.page.js').then(
        (module) => module.AitDriverPageComponent,
      ),
  ),
  teatRoute(
    {
      path: 'ait-frame',
      uxCode: 'UX-MOB-023',
      sourceSheet: 'IU-TEAT-ait-frame.md',
      guardPlan: 'B+S',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component: 'features/ait/pages/ait-frame.page.ts#AitFramePageComponent',
    },
    () =>
      import('./pages/ait-frame.page.js').then(
        (module) => module.AitFramePageComponent,
      ),
  ),
  teatRoute(
    {
      path: 'ait-frame-detail',
      uxCode: 'UX-MOB-024',
      sourceSheet: 'IU-TEAT-ait-frame-detail.md',
      guardPlan: 'B+S',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component:
        'features/ait/pages/ait-frame-detail.page.ts#AitFrameDetailPageComponent',
    },
    () =>
      import('./pages/ait-frame-detail.page.js').then(
        (module) => module.AitFrameDetailPageComponent,
      ),
  ),
  teatRoute(
    {
      path: 'ait-location',
      uxCode: 'UX-MOB-025',
      sourceSheet: 'IU-TEAT-ait-location.md',
      guardPlan: 'B+S',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component:
        'features/ait/pages/ait-location.page.ts#AitLocationPageComponent',
    },
    () =>
      import('./pages/ait-location.page.js').then(
        (module) => module.AitLocationPageComponent,
      ),
  ),
  teatRoute(
    {
      path: 'ait-notes',
      uxCode: 'UX-MOB-026',
      sourceSheet: 'IU-TEAT-ait-notes.md',
      guardPlan: 'B+S',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component: 'features/ait/pages/ait-notes.page.ts#AitNotesPageComponent',
    },
    () =>
      import('./pages/ait-notes.page.js').then(
        (module) => module.AitNotesPageComponent,
      ),
  ),
  teatRoute(
    {
      path: 'ait-validations',
      uxCode: 'UX-MOB-027',
      sourceSheet: 'IU-TEAT-ait-validations.md',
      guardPlan: 'B+S',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component:
        'features/ait/pages/ait-validations.page.ts#AitValidationsPageComponent',
    },
    () =>
      import('./pages/ait-validations.page.js').then(
        (module) => module.AitValidationsPageComponent,
      ),
  ),
  teatRoute(
    {
      path: 'ait-evidence',
      uxCode: 'UX-MOB-028',
      sourceSheet: 'IU-TEAT-ait-evidence.md',
      guardPlan: 'B+S',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component:
        'features/ait/pages/ait-evidence.page.ts#AitEvidencePageComponent',
    },
    () =>
      import('./pages/ait-evidence.page.js').then(
        (module) => module.AitEvidencePageComponent,
      ),
  ),
  teatRoute(
    {
      path: 'ait-measures',
      uxCode: 'UX-MOB-029',
      sourceSheet: 'IU-TEAT-ait-measures.md',
      guardPlan: 'B+S',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component:
        'features/ait/pages/ait-measures.page.ts#AitMeasuresPageComponent',
    },
    () =>
      import('./pages/ait-measures.page.js').then(
        (module) => module.AitMeasuresPageComponent,
      ),
  ),
  teatRoute(
    {
      path: 'ait-signature',
      uxCode: 'UX-MOB-030',
      sourceSheet: 'IU-TEAT-ait-signature.md',
      guardPlan: 'B+S',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component:
        'features/ait/pages/ait-signature.page.ts#AitSignaturePageComponent',
    },
    () =>
      import('./pages/ait-signature.page.js').then(
        (module) => module.AitSignaturePageComponent,
      ),
  ),
  teatRoute(
    {
      path: 'ait-review',
      uxCode: 'UX-MOB-031',
      sourceSheet: 'IU-TEAT-ait-review.md',
      guardPlan: 'B+S',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component: 'features/ait/pages/ait-review.page.ts#AitReviewPageComponent',
    },
    () =>
      import('./pages/ait-review.page.js').then(
        (module) => module.AitReviewPageComponent,
      ),
  ),
  teatRoute(
    {
      path: 'ait-done',
      uxCode: 'UX-MOB-032',
      sourceSheet: 'IU-TEAT-ait-done.md',
      guardPlan: 'B+S',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component: 'features/ait/pages/ait-done.page.ts#AitDonePageComponent',
    },
    () =>
      import('./pages/ait-done.page.js').then(
        (module) => module.AitDonePageComponent,
      ),
  ),
  teatRoute(
    {
      path: 'ait-print',
      uxCode: 'UX-MOB-033',
      sourceSheet: 'IU-TEAT-ait-print.md',
      guardPlan: 'B+S',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component: 'features/ait/pages/ait-print.page.ts#AitPrintPageComponent',
    },
    () =>
      import('./pages/ait-print.page.js').then(
        (module) => module.AitPrintPageComponent,
      ),
  ),
  teatRoute(
    {
      path: 'ait-shift-detail',
      uxCode: 'UX-MOB-034',
      sourceSheet: 'IU-TEAT-ait-shift-detail.md',
      guardPlan: 'B+S',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component:
        'features/ait/pages/ait-shift-detail.page.ts#AitShiftDetailPageComponent',
    },
    () =>
      import('./pages/ait-shift-detail.page.js').then(
        (module) => module.AitShiftDetailPageComponent,
      ),
  ),
  teatRoute(
    {
      path: 'ait-cancel-request',
      uxCode: 'D-04',
      sourceSheet: 'IU-TEAT-ait-cancel-request.md',
      guardPlan: 'B+S',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component:
        'features/ait/pages/ait-cancel-request.page.ts#AitCancelRequestPageComponent',
    },
    () =>
      import('./pages/ait-cancel-request.page.js').then(
        (module) => module.AitCancelRequestPageComponent,
      ),
  ),
  teatRoute({
    path: 'ait-speed-measurement',
    uxCode: 'D-05',
    sourceSheet: 'IU-TEAT-ait-speed-measurement.md',
    guardPlan: 'B+S, disabled',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component:
      'features/ait/pages/ait-speed-measurement.page.ts#AitSpeedMeasurementPageComponent',
    featureEnabled: false,
    state: 'unavailable',
  }),
];
