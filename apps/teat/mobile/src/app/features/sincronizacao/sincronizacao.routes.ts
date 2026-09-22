import type { Routes } from '@angular/router';
import { teatRoute } from '../../shared/mobile-page.component.js';

export const SINCRONIZACAO_ROUTES: Routes = [
  teatRoute(
    {
      path: 'sync',
      uxCode: 'UX-MOB-080',
      sourceSheet: 'IU-TEAT-sync.md',
      guardPlan: 'B+S',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component: 'features/sincronizacao/pages/sync.page.ts#SyncPageComponent',
    },
    () =>
      import('./pages/sync.page.js').then((module) => module.SyncPageComponent),
  ),
  teatRoute(
    {
      path: 'sync-item',
      uxCode: 'UX-MOB-081',
      sourceSheet: 'IU-TEAT-sync-item.md',
      guardPlan: 'B+S',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component:
        'features/sincronizacao/pages/sync-item.page.ts#SyncItemPageComponent',
    },
    () =>
      import('./pages/sync-item.page.js').then(
        (module) => module.SyncItemPageComponent,
      ),
  ),
  teatRoute(
    {
      path: 'sync-conflict',
      uxCode: 'UX-MOB-082',
      sourceSheet: 'IU-TEAT-sync-conflict.md',
      guardPlan: 'B+S',
      allowedRoles: ['field-supervisor'],
      component:
        'features/sincronizacao/pages/sync-conflict.page.ts#SyncConflictPageComponent',
    },
    () =>
      import('./pages/sync-conflict.page.js').then(
        (module) => module.SyncConflictPageComponent,
      ),
  ),
  teatRoute(
    {
      path: 'diagnostics',
      uxCode: 'UX-MOB-083',
      sourceSheet: 'IU-TEAT-diagnostics.md',
      guardPlan: 'B+S',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component:
        'features/sincronizacao/pages/diagnostics.page.ts#DiagnosticsPageComponent',
    },
    () =>
      import('./pages/diagnostics.page.js').then(
        (module) => module.DiagnosticsPageComponent,
      ),
  ),
  teatRoute(
    {
      path: 'support',
      uxCode: 'UX-MOB-084',
      sourceSheet: 'IU-TEAT-support.md',
      guardPlan: 'B+S',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component:
        'features/sincronizacao/pages/support.page.ts#SupportPageComponent',
    },
    () =>
      import('./pages/support.page.js').then(
        (module) => module.SupportPageComponent,
      ),
  ),
  teatRoute(
    {
      path: 'messages',
      uxCode: 'UX-MOB-085',
      sourceSheet: 'IU-TEAT-messages.md',
      guardPlan: 'B+S',
      allowedRoles: ['field-agent', 'field-supervisor'],
      component:
        'features/sincronizacao/pages/messages.page.ts#MessagesPageComponent',
    },
    () =>
      import('./pages/messages.page.js').then(
        (module) => module.MessagesPageComponent,
      ),
  ),
];
