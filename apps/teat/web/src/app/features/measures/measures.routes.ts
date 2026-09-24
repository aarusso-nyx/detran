import type { Routes } from '@angular/router';
import type { TeatWebRole } from '../../core/roles.js';
import { productRoute } from '../../data/route-contract.js';

const ROLES: readonly TeatWebRole[] = [
  'field-supervisor',
  'processing-operator',
  'traffic-authority',
  'agency-admin',
];

export const MEASURES_ROUTES: Routes = [
  productRoute({
    path: 'measures-list',
    sheet: 'IU-TEAT-measures-list',
    uxCode: 'UX-WEB-040',
    allowedRoles: ROLES,
    titleKey: 'teat.screens.measures-list.title',
    module: 'measures',
    client: 'measures',
    page: 'MeasuresListPage',
  }),
  productRoute({
    path: 'measure-detail',
    sheet: 'IU-TEAT-measure-detail',
    uxCode: 'UX-WEB-041',
    allowedRoles: ROLES,
    titleKey: 'teat.screens.measure-detail.title',
    module: 'measures',
    client: 'measures',
    page: 'MeasureDetailPage',
    contextual: true,
  }),
  productRoute({
    path: 'removals',
    sheet: 'IU-TEAT-removals',
    uxCode: 'UX-WEB-042',
    allowedRoles: ROLES,
    titleKey: 'teat.screens.removals.title',
    module: 'measures',
    client: 'measures',
    page: 'RemovalsPage',
    contextual: true,
  }),
  productRoute({
    path: 'release',
    sheet: 'IU-TEAT-release',
    uxCode: 'UX-WEB-043',
    allowedRoles: ROLES,
    titleKey: 'teat.screens.release.title',
    module: 'measures',
    client: 'measures',
    page: 'ReleasePage',
    contextual: true,
  }),
];
