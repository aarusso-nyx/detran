import type { Routes } from '@angular/router';
import type { TeatWebRole } from '../../core/roles.js';
import { productRoute } from '../../data/route-contract.js';

const ROLES: readonly TeatWebRole[] = [
  'field-supervisor',
  'processing-operator',
  'traffic-authority',
  'agency-admin',
];

export const CRASHES_ROUTES: Routes = [
  productRoute({
    path: 'crashes-list',
    sheet: 'IU-TEAT-crashes-list',
    uxCode: 'UX-WEB-060',
    allowedRoles: ROLES,
    titleKey: 'teat.screens.crashes-list.title',
    module: 'crashes',
    client: 'source_pending',
    page: 'CrashesListPage',
    boat: true,
  }),
  productRoute({
    path: 'crash-detail',
    sheet: 'IU-TEAT-crash-detail',
    uxCode: 'UX-WEB-061',
    allowedRoles: ROLES,
    titleKey: 'teat.screens.crash-detail.title',
    module: 'crashes',
    client: 'source_pending',
    page: 'CrashDetailPage',
    contextual: true,
    boat: true,
  }),
  productRoute({
    path: 'crash-complement',
    sheet: 'IU-TEAT-crash-complement',
    uxCode: 'UX-WEB-062',
    allowedRoles: ROLES,
    titleKey: 'teat.screens.crash-complement.title',
    module: 'crashes',
    client: 'source_pending',
    page: 'CrashComplementPage',
    contextual: true,
    boat: true,
  }),
  productRoute({
    path: 'renaest-integration',
    sheet: 'IU-TEAT-renaest-integration',
    uxCode: 'UX-WEB-063',
    allowedRoles: ROLES,
    titleKey: 'teat.screens.renaest-integration.title',
    module: 'crashes',
    client: 'source_pending',
    page: 'RenaestIntegrationPage',
    sse: true,
    boat: true,
  }),
];
