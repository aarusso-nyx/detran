import type { Routes } from '@angular/router';
import type { TeatWebRole } from '../../core/roles.js';
import { productRoute } from '../../data/route-contract.js';

const ROLES: readonly TeatWebRole[] = [
  'AUDITOR',
  'traffic-authority',
  'technical-admin',
  'agency-admin',
];

export const AUDIT_ROUTES: Routes = [
  productRoute({
    path: 'audit-events',
    sheet: 'IU-TEAT-audit-events',
    uxCode: 'UX-WEB-080',
    allowedRoles: ROLES,
    titleKey: 'teat.screens.audit-events.title',
    module: 'audit',
    client: 'kernel-stynx',
    page: 'AuditEventsPage',
    sse: true,
  }),
  productRoute({
    path: 'ait-timeline',
    sheet: 'IU-TEAT-ait-timeline',
    uxCode: 'UX-WEB-081',
    allowedRoles: ROLES,
    titleKey: 'teat.screens.ait-timeline.title',
    module: 'audit',
    client: 'kernel-stynx+ait',
    page: 'AitTimelinePage',
    contextual: true,
    sse: true,
  }),
  productRoute({
    path: 'agent-timeline',
    sheet: 'IU-TEAT-agent-timeline',
    uxCode: 'UX-WEB-082',
    allowedRoles: ROLES,
    titleKey: 'teat.screens.agent-timeline.title',
    module: 'audit',
    client: 'kernel-stynx',
    page: 'AgentTimelinePage',
    contextual: true,
    sse: true,
  }),
  productRoute({
    path: 'external-queries-audit',
    sheet: 'IU-TEAT-external-queries-audit',
    uxCode: 'UX-WEB-083',
    allowedRoles: ROLES,
    titleKey: 'teat.screens.external-queries-audit.title',
    module: 'audit',
    client: 'kernel-stynx+snapshots',
    page: 'ExternalQueriesAuditPage',
    sse: true,
  }),
  productRoute({
    path: 'anomalies',
    sheet: 'IU-TEAT-anomalies',
    uxCode: 'UX-WEB-084',
    allowedRoles: ROLES,
    titleKey: 'teat.screens.anomalies.title',
    module: 'audit',
    client: 'kernel-stynx',
    page: 'AnomaliesPage',
    sse: true,
  }),
];
