import type { Routes } from '@angular/router';
import type { TeatWebRole } from '../../core/roles.js';
import { productRoute } from '../../data/route-contract.js';

const ROLES: readonly TeatWebRole[] = [
  'traffic-authority',
  'agency-admin',
  'technical-admin',
];

export const NORMATIVE_ROUTES: Routes = [
  productRoute({
    path: 'norm-catalogs',
    sheet: 'IU-TEAT-norm-catalogs',
    uxCode: 'UX-WEB-110',
    allowedRoles: ROLES,
    titleKey: 'teat.screens.norm-catalogs.title',
    module: 'normative',
    client: 'normative',
    page: 'NormCatalogsPage',
  }),
  productRoute({
    path: 'norm-violations',
    sheet: 'IU-TEAT-norm-violations',
    uxCode: 'UX-WEB-111',
    allowedRoles: ROLES,
    titleKey: 'teat.screens.norm-violations.title',
    module: 'normative',
    client: 'normative',
    page: 'NormViolationsPage',
  }),
  productRoute({
    path: 'norm-rules',
    sheet: 'IU-TEAT-norm-rules',
    uxCode: 'UX-WEB-112',
    allowedRoles: ROLES,
    titleKey: 'teat.screens.norm-rules.title',
    module: 'normative',
    client: 'normative',
    page: 'NormRulesPage',
  }),
  productRoute({
    path: 'norm-templates',
    sheet: 'IU-TEAT-norm-templates',
    uxCode: 'UX-WEB-113',
    allowedRoles: ROLES,
    titleKey: 'teat.screens.norm-templates.title',
    module: 'normative',
    client: 'normative',
    page: 'NormTemplatesPage',
  }),
  productRoute({
    path: 'norm-mobile-packages',
    sheet: 'IU-TEAT-norm-mobile-packages',
    uxCode: 'UX-WEB-114',
    allowedRoles: ROLES,
    titleKey: 'teat.screens.norm-mobile-packages.title',
    module: 'normative',
    client: 'normative',
    page: 'NormMobilePackagesPage',
    contextual: true,
  }),
];
