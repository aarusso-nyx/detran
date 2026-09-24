import type { Routes } from '@angular/router';

import type { TeatWebRole } from './core/roles.js';
import { deniedNavigationMatcher, denyNavigation } from './core/guards.js';
import { operationalRoute } from './data/route-contract.js';

const ALL_ROLES: readonly TeatWebRole[] = [
  'field-agent',
  'field-supervisor',
  'processing-operator',
  'traffic-authority',
  'agency-admin',
  'technical-admin',
  'AUDITOR',
  'bi-analyst',
  'integration-operator',
];

export const TEAT_ROUTES: Routes = [
  {
    path: 'ux/web',
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/entry/entry.routes.js').then(
            (module) => module.ENTRY_ROUTES,
          ),
      },
      {
        path: '',
        loadChildren: () =>
          import('./features/operations/operations.routes.js').then(
            (module) => module.OPERATIONS_ROUTES,
          ),
      },
      {
        path: '',
        loadChildren: () =>
          import('./features/fiscalizacao/fiscalizacao.routes.js').then(
            (module) => module.FISCALIZACAO_ROUTES,
          ),
      },
      {
        path: '',
        loadChildren: () =>
          import('./features/measures/measures.routes.js').then(
            (module) => module.MEASURES_ROUTES,
          ),
      },
      {
        path: '',
        loadChildren: () =>
          import('./features/alcohol/alcohol.routes.js').then(
            (module) => module.ALCOHOL_ROUTES,
          ),
      },
      {
        path: '',
        loadChildren: () =>
          import('./features/crashes/crashes.routes.js').then(
            (module) => module.CRASHES_ROUTES,
          ),
      },
      {
        path: '',
        loadChildren: () =>
          import('./features/evidence/evidence.routes.js').then(
            (module) => module.EVIDENCE_ROUTES,
          ),
      },
      {
        path: '',
        loadChildren: () =>
          import('./features/audit/audit.routes.js').then(
            (module) => module.AUDIT_ROUTES,
          ),
      },
      {
        path: '',
        loadChildren: () =>
          import('./features/bi/bi.routes.js').then(
            (module) => module.BI_ROUTES,
          ),
      },
      {
        path: '',
        loadChildren: () =>
          import('./features/admin/admin.routes.js').then(
            (module) => module.ADMIN_ROUTES,
          ),
      },
      {
        path: '',
        loadChildren: () =>
          import('./features/normative/normative.routes.js').then(
            (module) => module.NORMATIVE_ROUTES,
          ),
      },
      {
        path: '',
        loadChildren: () =>
          import('./features/technical/technical.routes.js').then(
            (module) => module.TECHNICAL_ROUTES,
          ),
      },
    ],
  },
  operationalRoute('acesso-negado', ALL_ROLES, 'teat.navigation.accessDenied'),
  operationalRoute('conta', ALL_ROLES, 'teat.navigation.account'),
  operationalRoute('erro', ALL_ROLES, 'teat.navigation.error'),
  operationalRoute('**', ALL_ROLES, 'teat.navigation.error'),
  {
    matcher: deniedNavigationMatcher,
    canActivate: [denyNavigation],
    loadComponent: async () =>
      import('./shared/product-page.component.js').then(
        (module) => module.ProductPageComponent,
      ),
  },
];
