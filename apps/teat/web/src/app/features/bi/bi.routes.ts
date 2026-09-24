import type { Routes } from '@angular/router';
import type { TeatWebRole } from '../../core/roles.js';
import { productRoute } from '../../data/route-contract.js';

const ROLES: readonly TeatWebRole[] = [
  'bi-analyst',
  'traffic-authority',
  'agency-admin',
  'technical-admin',
];

export const BI_ROUTES: Routes = [
  productRoute({
    path: 'bi-enforcement',
    sheet: 'IU-TEAT-bi-enforcement',
    uxCode: 'UX-WEB-090',
    allowedRoles: ROLES,
    titleKey: 'teat.screens.bi-enforcement.title',
    module: 'bi',
    client: 'dashboard',
    page: 'BiEnforcementPage',
    sse: true,
  }),
  productRoute({
    path: 'bi-crashes',
    sheet: 'IU-TEAT-bi-crashes',
    uxCode: 'UX-WEB-091',
    allowedRoles: ROLES,
    titleKey: 'teat.screens.bi-crashes.title',
    module: 'bi',
    client: 'source_pending',
    page: 'BiCrashesPage',
    sse: true,
    boat: true,
  }),
  productRoute({
    path: 'bi-quality',
    sheet: 'IU-TEAT-bi-quality',
    uxCode: 'UX-WEB-092',
    allowedRoles: ROLES,
    titleKey: 'teat.screens.bi-quality.title',
    module: 'bi',
    client: 'dashboard',
    page: 'BiQualityPage',
    sse: true,
  }),
  productRoute({
    path: 'bi-integrations',
    sheet: 'IU-TEAT-bi-integrations',
    uxCode: 'UX-WEB-093',
    allowedRoles: ROLES,
    titleKey: 'teat.screens.bi-integrations.title',
    module: 'bi',
    client: 'dashboard',
    page: 'BiIntegrationsPage',
    sse: true,
  }),
];
