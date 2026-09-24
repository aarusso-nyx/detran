import type { Routes } from '@angular/router';
import { teatRoute } from '../../shared/mobile-page.component.js';

export const TURNO_ROUTES: Routes = [
  teatRoute(
    {
      path: 'auth-login',
      uxCode: 'UX-MOB-001',
      sourceSheet: 'IU-TEAT-auth-login.md',
      guardPlan: 'E',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component:
        'features/turno/pages/auth-login.page.ts#AuthLoginPageComponent',
    },
    () =>
      import('./pages/auth-login.page.js').then(
        (module) => module.AuthLoginPageComponent,
      ),
  ),
  teatRoute(
    {
      path: 'auth-mfa',
      uxCode: 'UX-MOB-002',
      sourceSheet: 'IU-TEAT-auth-mfa.md',
      guardPlan: 'E',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component: 'features/turno/pages/auth-mfa.page.ts#AuthMfaPageComponent',
    },
    () =>
      import('./pages/auth-mfa.page.js').then(
        (module) => module.AuthMfaPageComponent,
      ),
  ),
  teatRoute(
    {
      path: 'device-blocked',
      uxCode: 'UX-MOB-003',
      sourceSheet: 'IU-TEAT-device-blocked.md',
      guardPlan: 'R',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component:
        'features/turno/pages/device-blocked.page.ts#DeviceBlockedPageComponent',
    },
    () =>
      import('./pages/device-blocked.page.js').then(
        (module) => module.DeviceBlockedPageComponent,
      ),
  ),
  teatRoute(
    {
      path: 'shift-context',
      uxCode: 'UX-MOB-004',
      sourceSheet: 'IU-TEAT-shift-context.md',
      guardPlan: 'B',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component:
        'features/turno/pages/shift-context.page.ts#ShiftContextPageComponent',
    },
    () =>
      import('./pages/shift-context.page.js').then(
        (module) => module.ShiftContextPageComponent,
      ),
  ),
  teatRoute(
    {
      path: 'operation-select',
      uxCode: 'UX-MOB-005',
      sourceSheet: 'IU-TEAT-operation-select.md',
      guardPlan: 'B',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component:
        'features/turno/pages/operation-select.page.ts#OperationSelectPageComponent',
    },
    () =>
      import('./pages/operation-select.page.js').then(
        (module) => module.OperationSelectPageComponent,
      ),
  ),
  teatRoute(
    {
      path: 'open-shift',
      uxCode: 'UX-MOB-006',
      sourceSheet: 'IU-TEAT-open-shift.md',
      guardPlan: 'B',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component:
        'features/turno/pages/open-shift.page.ts#OpenShiftPageComponent',
    },
    () =>
      import('./pages/open-shift.page.js').then(
        (module) => module.OpenShiftPageComponent,
      ),
  ),
  teatRoute(
    {
      path: 'home',
      uxCode: 'UX-MOB-007',
      sourceSheet: 'IU-TEAT-home.md',
      guardPlan: 'B+S',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component: 'features/turno/pages/home.page.ts#HomePageComponent',
    },
    () =>
      import('./pages/home.page.js').then((module) => module.HomePageComponent),
  ),
  teatRoute(
    {
      path: 'close-shift',
      uxCode: 'UX-MOB-008',
      sourceSheet: 'IU-TEAT-close-shift.md',
      guardPlan: 'B+S',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component:
        'features/turno/pages/close-shift.page.ts#CloseShiftPageComponent',
    },
    () =>
      import('./pages/close-shift.page.js').then(
        (module) => module.CloseShiftPageComponent,
      ),
  ),
  teatRoute(
    {
      path: 'shift-summary',
      uxCode: 'UX-MOB-009',
      sourceSheet: 'IU-TEAT-shift-summary.md',
      guardPlan: 'B',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component:
        'features/turno/pages/shift-summary.page.ts#ShiftSummaryPageComponent',
    },
    () =>
      import('./pages/shift-summary.page.js').then(
        (module) => module.ShiftSummaryPageComponent,
      ),
  ),
  teatRoute(
    {
      path: 'device-handoff',
      uxCode: 'source_pending',
      sourceSheet: 'ARCH-TEAT-FRONTENDS §4 (D-01)',
      guardPlan: 'B',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component:
        'features/turno/pages/device-handoff.page.ts#DeviceHandoffPageComponent',
    },
    () =>
      import('./pages/device-handoff.page.js').then(
        (module) => module.DeviceHandoffPageComponent,
      ),
  ),
];
