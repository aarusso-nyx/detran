import type { Routes } from '@angular/router';
import type { TeatWebRole } from '../../core/roles.js';
import { productRoute } from '../../data/route-contract.js';

const ROLES: readonly TeatWebRole[] = ['agency-admin', 'technical-admin'];

export const ADMIN_ROUTES: Routes = [
  productRoute({
    path: 'admin-orgs',
    sheet: 'IU-TEAT-admin-orgs',
    uxCode: 'UX-WEB-100',
    allowedRoles: ROLES,
    titleKey: 'teat.screens.admin-orgs.title',
    module: 'admin',
    client: 'agency',
    page: 'AdminOrgsPage',
  }),
  productRoute({
    path: 'admin-units',
    sheet: 'IU-TEAT-admin-units',
    uxCode: 'UX-WEB-101',
    allowedRoles: ROLES,
    titleKey: 'teat.screens.admin-units.title',
    module: 'admin',
    client: 'agency',
    page: 'AdminUnitsPage',
  }),
  productRoute({
    path: 'admin-users-agents',
    sheet: 'IU-TEAT-admin-users-agents',
    uxCode: 'UX-WEB-102',
    allowedRoles: ROLES,
    titleKey: 'teat.screens.admin-users-agents.title',
    module: 'admin',
    client: 'agency',
    page: 'AdminUsersAgentsPage',
  }),
  productRoute({
    path: 'admin-profiles',
    sheet: 'IU-TEAT-admin-profiles',
    uxCode: 'UX-WEB-103',
    allowedRoles: ROLES,
    titleKey: 'teat.screens.admin-profiles.title',
    module: 'admin',
    client: 'agency',
    page: 'AdminProfilesPage',
  }),
  productRoute({
    path: 'admin-devices',
    sheet: 'IU-TEAT-admin-devices',
    uxCode: 'UX-WEB-104',
    allowedRoles: ROLES,
    titleKey: 'teat.screens.admin-devices.title',
    module: 'admin',
    client: 'agency',
    page: 'AdminDevicesPage',
  }),
  productRoute({
    path: 'admin-competencies',
    sheet: 'IU-TEAT-admin-competencies',
    uxCode: 'UX-WEB-105',
    allowedRoles: ROLES,
    titleKey: 'teat.screens.admin-competencies.title',
    module: 'admin',
    client: 'agency',
    page: 'AdminCompetenciesPage',
  }),
];
