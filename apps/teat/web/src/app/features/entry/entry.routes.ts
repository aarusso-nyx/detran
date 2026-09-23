import type { Routes } from '@angular/router';

import type { TeatWebRole } from '../../core/roles.js';
import { productRoute } from '../../data/route-contract.js';

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

export const ENTRY_ROUTES: Routes = [
  productRoute({
    path: 'login',
    sheet: 'IU-TEAT-login',
    uxCode: 'UX-WEB-001',
    allowedRoles: ALL_ROLES,
    titleKey: 'teat.screens.login.title',
    module: 'entry',
    client: 'session-stynx',
    page: 'LoginPage',
    explicitGuards: true,
  }),
  productRoute({
    path: 'dashboard-home',
    sheet: 'IU-TEAT-dashboard-home',
    uxCode: 'UX-WEB-002',
    allowedRoles: ALL_ROLES,
    titleKey: 'teat.screens.dashboard-home.title',
    module: 'entry',
    client: 'dashboard',
    page: 'DashboardHomePage',
    sse: true,
  }),
];
