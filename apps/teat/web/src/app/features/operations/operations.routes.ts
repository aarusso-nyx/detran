import type { Routes } from '@angular/router';

import type { TeatWebRole } from '../../core/roles.js';
import { productRoute } from '../../data/route-contract.js';

const ROLES: readonly TeatWebRole[] = [
  'field-agent',
  'field-supervisor',
  'processing-operator',
  'traffic-authority',
  'agency-admin',
];

export const OPERATIONS_ROUTES: Routes = [
  productRoute({
    path: 'ops-dashboard',
    sheet: 'IU-TEAT-ops-dashboard',
    uxCode: 'UX-WEB-003',
    allowedRoles: ROLES,
    titleKey: 'teat.screens.ops-dashboard.title',
    module: 'operations',
    client: 'ops',
    page: 'OpsDashboardPage',
    sse: true,
  }),
  productRoute({
    path: 'ops-map',
    sheet: 'IU-TEAT-ops-map',
    uxCode: 'UX-WEB-004',
    allowedRoles: ROLES,
    titleKey: 'teat.screens.ops-map.title',
    module: 'operations',
    client: 'ops',
    page: 'OpsMapPage',
    sse: true,
  }),
  productRoute({
    path: 'operations-list',
    sheet: 'IU-TEAT-operations-list',
    uxCode: 'UX-WEB-005',
    allowedRoles: ROLES,
    titleKey: 'teat.screens.operations-list.title',
    module: 'operations',
    client: 'ops',
    page: 'OperationsListPage',
    sse: true,
  }),
  productRoute({
    path: 'operation-detail',
    sheet: 'IU-TEAT-operation-detail',
    uxCode: 'UX-WEB-006',
    allowedRoles: ROLES,
    titleKey: 'teat.screens.operation-detail.title',
    module: 'operations',
    client: 'ops',
    page: 'OperationDetailPage',
    contextual: true,
    sse: true,
  }),
  productRoute({
    path: 'active-shifts',
    sheet: 'IU-TEAT-active-shifts',
    uxCode: 'UX-WEB-007',
    allowedRoles: ROLES,
    titleKey: 'teat.screens.active-shifts.title',
    module: 'operations',
    client: 'mobile-bootstrap',
    page: 'ActiveShiftsPage',
    sse: true,
  }),
  productRoute({
    path: 'operation-messages',
    sheet: 'IU-TEAT-operation-messages',
    uxCode: 'UX-WEB-008',
    allowedRoles: ROLES,
    titleKey: 'teat.screens.operation-messages.title',
    module: 'operations',
    client: 'ops',
    page: 'OperationMessagesPage',
    sse: true,
  }),
];
