import type { Routes } from '@angular/router';
import type { TeatWebRole } from '../../core/roles.js';
import { productRoute } from '../../data/route-contract.js';

const ROLES: readonly TeatWebRole[] = [
  'field-agent',
  'field-supervisor',
  'processing-operator',
  'traffic-authority',
  'AUDITOR',
  'agency-admin',
];

export const EVIDENCE_ROUTES: Routes = [
  productRoute({
    path: 'evidence-search',
    sheet: 'IU-TEAT-evidence-search',
    uxCode: 'UX-WEB-070',
    allowedRoles: ROLES,
    titleKey: 'teat.screens.evidence-search.title',
    module: 'evidence',
    client: 'evidence',
    page: 'EvidenceSearchPage',
  }),
  productRoute({
    path: 'evidence-viewer',
    sheet: 'IU-TEAT-evidence-viewer',
    uxCode: 'UX-WEB-071',
    allowedRoles: ROLES,
    titleKey: 'teat.screens.evidence-viewer.title',
    module: 'evidence',
    client: 'evidence',
    page: 'EvidenceViewerPage',
    contextual: true,
  }),
  productRoute({
    path: 'custody-chain',
    sheet: 'IU-TEAT-custody-chain',
    uxCode: 'UX-WEB-072',
    allowedRoles: ROLES,
    titleKey: 'teat.screens.custody-chain.title',
    module: 'evidence',
    client: 'evidence',
    page: 'CustodyChainPage',
    contextual: true,
  }),
  productRoute({
    path: 'probative-package',
    sheet: 'IU-TEAT-probative-package',
    uxCode: 'UX-WEB-073',
    allowedRoles: ROLES,
    titleKey: 'teat.screens.probative-package.title',
    module: 'evidence',
    client: 'evidence',
    page: 'ProbativePackagePage',
    contextual: true,
  }),
];
