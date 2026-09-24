import type { Routes } from '@angular/router';
import type { TeatWebRole } from '../../core/roles.js';
import { productRoute } from '../../data/route-contract.js';

const ROLES: readonly TeatWebRole[] = [
  'field-supervisor',
  'processing-operator',
  'traffic-authority',
  'agency-admin',
];

export const ALCOHOL_ROUTES: Routes = [
  productRoute({
    path: 'alcohol-procedures',
    sheet: 'IU-TEAT-alcohol-procedures',
    uxCode: 'UX-WEB-050',
    allowedRoles: ROLES,
    titleKey: 'teat.screens.alcohol-procedures.title',
    module: 'alcohol',
    client: 'alcohol',
    page: 'AlcoholProceduresPage',
  }),
  productRoute({
    path: 'breathalyzers',
    sheet: 'IU-TEAT-breathalyzers',
    uxCode: 'UX-WEB-051',
    allowedRoles: ROLES,
    titleKey: 'teat.screens.breathalyzers.title',
    module: 'alcohol',
    client: 'alcohol',
    page: 'BreathalyzersPage',
  }),
];
