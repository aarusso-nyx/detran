import type { Routes } from '@angular/router';
import type { TeatWebRole } from '../../core/roles.js';
import { productRoute } from '../../data/route-contract.js';

const ROLES: readonly TeatWebRole[] = [
  'integration-operator',
  'technical-admin',
  'agency-admin',
];

export const TECHNICAL_ROUTES: Routes = [
  productRoute({
    path: 'tech-integrations',
    sheet: 'IU-TEAT-tech-integrations',
    uxCode: 'UX-WEB-120',
    allowedRoles: ROLES,
    titleKey: 'teat.screens.tech-integrations.title',
    module: 'technical',
    client: 'integrations',
    page: 'TechIntegrationsPage',
    sse: true,
  }),
  productRoute({
    path: 'tech-queues',
    sheet: 'IU-TEAT-tech-queues',
    uxCode: 'UX-WEB-121',
    allowedRoles: ROLES,
    titleKey: 'teat.screens.tech-queues.title',
    module: 'technical',
    client: 'integrations',
    page: 'TechQueuesPage',
    contextual: true,
    sse: true,
  }),
  productRoute({
    path: 'tech-certificates',
    sheet: 'IU-TEAT-tech-certificates',
    uxCode: 'UX-WEB-122',
    allowedRoles: ROLES,
    titleKey: 'teat.screens.tech-certificates.title',
    module: 'technical',
    client: 'integrations',
    page: 'TechCertificatesPage',
    sse: true,
  }),
  productRoute({
    path: 'tech-jobs',
    sheet: 'IU-TEAT-tech-jobs',
    uxCode: 'UX-WEB-123',
    allowedRoles: ROLES,
    titleKey: 'teat.screens.tech-jobs.title',
    module: 'technical',
    client: 'integrations',
    page: 'TechJobsPage',
    sse: true,
  }),
  productRoute({
    path: 'tech-health',
    sheet: 'IU-TEAT-tech-health',
    uxCode: 'UX-WEB-124',
    allowedRoles: ROLES,
    titleKey: 'teat.screens.tech-health.title',
    module: 'technical',
    client: 'integrations',
    page: 'TechHealthPage',
    sse: true,
  }),
];
