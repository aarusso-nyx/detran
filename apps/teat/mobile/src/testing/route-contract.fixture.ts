// R-0013 TASK-0012 (Inspector). Independent transcription of ARCH-TEAT-MOBILE-CONTRACT §2.
export const TEAT_STAFF_ROLES = [
  'field-agent',
  'field-supervisor',
  'processing-operator',
  'traffic-authority',
  'agency-admin',
  'technical-admin',
  'auditor',
  'bi-analyst',
  'integration-operator',
] as const;

export type TeatStaffRole = (typeof TEAT_STAFF_ROLES)[number];

export interface TeatRouteFixture {
  readonly path: string;
  readonly uxCode: string;
  readonly sourceSheet: string;
  readonly guards: string;
  readonly allowedRoles: readonly (typeof TEAT_STAFF_ROLES)[number][];
  readonly component: string;
}

export const TEAT_ROUTE_FIXTURE = [
  {
    path: 'auth-login',
    uxCode: 'UX-MOB-001',
    sourceSheet: 'IU-TEAT-auth-login.md',
    guards: 'R',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component: 'features/turno/pages/auth-login.page.ts#AuthLoginPageComponent',
  },
  {
    path: 'auth-mfa',
    uxCode: 'UX-MOB-002',
    sourceSheet: 'IU-TEAT-auth-mfa.md',
    guards: 'R',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component: 'features/turno/pages/auth-mfa.page.ts#AuthMfaPageComponent',
  },
  {
    path: 'device-blocked',
    uxCode: 'UX-MOB-003',
    sourceSheet: 'IU-TEAT-device-blocked.md',
    guards: 'R',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component:
      'features/turno/pages/device-blocked.page.ts#DeviceBlockedPageComponent',
  },
  {
    path: 'shift-context',
    uxCode: 'UX-MOB-004',
    sourceSheet: 'IU-TEAT-shift-context.md',
    guards: 'B',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component:
      'features/turno/pages/shift-context.page.ts#ShiftContextPageComponent',
  },
  {
    path: 'operation-select',
    uxCode: 'UX-MOB-005',
    sourceSheet: 'IU-TEAT-operation-select.md',
    guards: 'B',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component:
      'features/turno/pages/operation-select.page.ts#OperationSelectPageComponent',
  },
  {
    path: 'open-shift',
    uxCode: 'UX-MOB-006',
    sourceSheet: 'IU-TEAT-open-shift.md',
    guards: 'B',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component: 'features/turno/pages/open-shift.page.ts#OpenShiftPageComponent',
  },
  {
    path: 'home',
    uxCode: 'UX-MOB-007',
    sourceSheet: 'IU-TEAT-home.md',
    guards: 'B+S',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component: 'features/turno/pages/home.page.ts#HomePageComponent',
  },
  {
    path: 'close-shift',
    uxCode: 'UX-MOB-008',
    sourceSheet: 'IU-TEAT-close-shift.md',
    guards: 'B+S',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component:
      'features/turno/pages/close-shift.page.ts#CloseShiftPageComponent',
  },
  {
    path: 'shift-summary',
    uxCode: 'UX-MOB-009',
    sourceSheet: 'IU-TEAT-shift-summary.md',
    guards: 'B',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component:
      'features/turno/pages/shift-summary.page.ts#ShiftSummaryPageComponent',
  },
  {
    path: 'device-handoff',
    uxCode: 'source_pending',
    sourceSheet: 'ARCH-TEAT-FRONTENDS §4 (D-01)',
    guards: 'B',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component:
      'features/turno/pages/device-handoff.page.ts#DeviceHandoffPageComponent',
  },
  {
    path: 'vehicle-search',
    uxCode: 'UX-MOB-010',
    sourceSheet: 'IU-TEAT-vehicle-search.md',
    guards: 'B+S',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component:
      'features/consultas/pages/vehicle-search.page.ts#VehicleSearchPageComponent',
  },
  {
    path: 'vehicle-result',
    uxCode: 'UX-MOB-011',
    sourceSheet: 'IU-TEAT-vehicle-result.md',
    guards: 'B+S',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component:
      'features/consultas/pages/vehicle-result.page.ts#VehicleResultPageComponent',
  },
  {
    path: 'vehicle-divergence',
    uxCode: 'UX-MOB-012',
    sourceSheet: 'IU-TEAT-vehicle-divergence.md',
    guards: 'B+S',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component:
      'features/consultas/pages/vehicle-divergence.page.ts#VehicleDivergencePageComponent',
  },
  {
    path: 'driver-search',
    uxCode: 'UX-MOB-013',
    sourceSheet: 'IU-TEAT-driver-search.md',
    guards: 'B+S',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component:
      'features/consultas/pages/driver-search.page.ts#DriverSearchPageComponent',
  },
  {
    path: 'driver-result',
    uxCode: 'UX-MOB-014',
    sourceSheet: 'IU-TEAT-driver-result.md',
    guards: 'B+S',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component:
      'features/consultas/pages/driver-result.page.ts#DriverResultPageComponent',
  },
  {
    path: 'query-failure',
    uxCode: 'UX-MOB-015',
    sourceSheet: 'IU-TEAT-query-failure.md',
    guards: 'B+S',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component:
      'features/consultas/pages/query-failure.page.ts#QueryFailurePageComponent',
  },
  {
    path: 'ait-start',
    uxCode: 'UX-MOB-020',
    sourceSheet: 'IU-TEAT-ait-start.md',
    guards: 'B+S',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component: 'features/ait/pages/ait-start.page.ts#AitStartPageComponent',
  },
  {
    path: 'ait-vehicle',
    uxCode: 'UX-MOB-021',
    sourceSheet: 'IU-TEAT-ait-vehicle.md',
    guards: 'B+S',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component: 'features/ait/pages/ait-vehicle.page.ts#AitVehiclePageComponent',
  },
  {
    path: 'ait-driver',
    uxCode: 'UX-MOB-022',
    sourceSheet: 'IU-TEAT-ait-driver.md',
    guards: 'B+S',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component: 'features/ait/pages/ait-driver.page.ts#AitDriverPageComponent',
  },
  {
    path: 'ait-frame',
    uxCode: 'UX-MOB-023',
    sourceSheet: 'IU-TEAT-ait-frame.md',
    guards: 'B+S',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component: 'features/ait/pages/ait-frame.page.ts#AitFramePageComponent',
  },
  {
    path: 'ait-frame-detail',
    uxCode: 'UX-MOB-024',
    sourceSheet: 'IU-TEAT-ait-frame-detail.md',
    guards: 'B+S',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component:
      'features/ait/pages/ait-frame-detail.page.ts#AitFrameDetailPageComponent',
  },
  {
    path: 'ait-location',
    uxCode: 'UX-MOB-025',
    sourceSheet: 'IU-TEAT-ait-location.md',
    guards: 'B+S',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component:
      'features/ait/pages/ait-location.page.ts#AitLocationPageComponent',
  },
  {
    path: 'ait-notes',
    uxCode: 'UX-MOB-026',
    sourceSheet: 'IU-TEAT-ait-notes.md',
    guards: 'B+S',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component: 'features/ait/pages/ait-notes.page.ts#AitNotesPageComponent',
  },
  {
    path: 'ait-validations',
    uxCode: 'UX-MOB-027',
    sourceSheet: 'IU-TEAT-ait-validations.md',
    guards: 'B+S',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component:
      'features/ait/pages/ait-validations.page.ts#AitValidationsPageComponent',
  },
  {
    path: 'ait-evidence',
    uxCode: 'UX-MOB-028',
    sourceSheet: 'IU-TEAT-ait-evidence.md',
    guards: 'B+S',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component:
      'features/ait/pages/ait-evidence.page.ts#AitEvidencePageComponent',
  },
  {
    path: 'ait-measures',
    uxCode: 'UX-MOB-029',
    sourceSheet: 'IU-TEAT-ait-measures.md',
    guards: 'B+S',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component:
      'features/ait/pages/ait-measures.page.ts#AitMeasuresPageComponent',
  },
  {
    path: 'ait-signature',
    uxCode: 'UX-MOB-030',
    sourceSheet: 'IU-TEAT-ait-signature.md',
    guards: 'B+S',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component:
      'features/ait/pages/ait-signature.page.ts#AitSignaturePageComponent',
  },
  {
    path: 'ait-review',
    uxCode: 'UX-MOB-031',
    sourceSheet: 'IU-TEAT-ait-review.md',
    guards: 'B+S',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component: 'features/ait/pages/ait-review.page.ts#AitReviewPageComponent',
  },
  {
    path: 'ait-done',
    uxCode: 'UX-MOB-032',
    sourceSheet: 'IU-TEAT-ait-done.md',
    guards: 'B+S',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component: 'features/ait/pages/ait-done.page.ts#AitDonePageComponent',
  },
  {
    path: 'ait-print',
    uxCode: 'UX-MOB-033',
    sourceSheet: 'IU-TEAT-ait-print.md',
    guards: 'B+S',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component: 'features/ait/pages/ait-print.page.ts#AitPrintPageComponent',
  },
  {
    path: 'ait-shift-detail',
    uxCode: 'UX-MOB-034',
    sourceSheet: 'IU-TEAT-ait-shift-detail.md',
    guards: 'B+S',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component:
      'features/ait/pages/ait-shift-detail.page.ts#AitShiftDetailPageComponent',
  },
  {
    path: 'ait-cancel-request',
    uxCode: 'D-04',
    sourceSheet: 'IU-TEAT-ait-cancel-request.md',
    guards: 'B+S',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component:
      'features/ait/pages/ait-cancel-request.page.ts#AitCancelRequestPageComponent',
  },
  {
    path: 'ait-speed-measurement',
    uxCode: 'D-05',
    sourceSheet: 'IU-TEAT-ait-speed-measurement.md',
    guards: 'B+S, disabled',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component:
      'features/ait/pages/ait-speed-measurement.page.ts#AitSpeedMeasurementPageComponent',
  },
  {
    path: 'measure-start',
    uxCode: 'UX-MOB-040',
    sourceSheet: 'IU-TEAT-measure-start.md',
    guards: 'B+S',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component:
      'features/medidas/pages/measure-start.page.ts#MeasureStartPageComponent',
  },
  {
    path: 'retention',
    uxCode: 'UX-MOB-041',
    sourceSheet: 'IU-TEAT-retention.md',
    guards: 'B+S',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component:
      'features/medidas/pages/retention.page.ts#RetentionPageComponent',
  },
  {
    path: 'removal',
    uxCode: 'UX-MOB-042',
    sourceSheet: 'IU-TEAT-removal.md',
    guards: 'B+S',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component: 'features/medidas/pages/removal.page.ts#RemovalPageComponent',
  },
  {
    path: 'inventory',
    uxCode: 'UX-MOB-043',
    sourceSheet: 'IU-TEAT-inventory.md',
    guards: 'B+S',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component:
      'features/medidas/pages/inventory.page.ts#InventoryPageComponent',
  },
  {
    path: 'transshipment',
    uxCode: 'UX-MOB-044',
    sourceSheet: 'IU-TEAT-transshipment.md',
    guards: 'B+S',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component:
      'features/medidas/pages/transshipment.page.ts#TransshipmentPageComponent',
  },
  {
    path: 'measure-term',
    uxCode: 'UX-MOB-045',
    sourceSheet: 'IU-TEAT-measure-term.md',
    guards: 'B+S',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component:
      'features/medidas/pages/measure-term.page.ts#MeasureTermPageComponent',
  },
  {
    path: 'measure-done',
    uxCode: 'UX-MOB-046',
    sourceSheet: 'IU-TEAT-measure-done.md',
    guards: 'B+S',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component:
      'features/medidas/pages/measure-done.page.ts#MeasureDonePageComponent',
  },
  {
    path: 'alcohol-start',
    uxCode: 'UX-MOB-050',
    sourceSheet: 'IU-TEAT-alcohol-start.md',
    guards: 'B+S',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component:
      'features/alcoolemia/pages/alcohol-start.page.ts#AlcoholStartPageComponent',
  },
  {
    path: 'alcohol-device',
    uxCode: 'UX-MOB-051',
    sourceSheet: 'IU-TEAT-alcohol-device.md',
    guards: 'B+S',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component:
      'features/alcoolemia/pages/alcohol-device.page.ts#AlcoholDevicePageComponent',
  },
  {
    path: 'alcohol-result',
    uxCode: 'UX-MOB-052',
    sourceSheet: 'IU-TEAT-alcohol-result.md',
    guards: 'B+S',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component:
      'features/alcoolemia/pages/alcohol-result.page.ts#AlcoholResultPageComponent',
  },
  {
    path: 'alcohol-refusal',
    uxCode: 'UX-MOB-053',
    sourceSheet: 'IU-TEAT-alcohol-refusal.md',
    guards: 'B+S',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component:
      'features/alcoolemia/pages/alcohol-refusal.page.ts#AlcoholRefusalPageComponent',
  },
  {
    path: 'alcohol-signs',
    uxCode: 'UX-MOB-054',
    sourceSheet: 'IU-TEAT-alcohol-signs.md',
    guards: 'B+S',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component:
      'features/alcoolemia/pages/alcohol-signs.page.ts#AlcoholSignsPageComponent',
  },
  {
    path: 'alcohol-forward',
    uxCode: 'UX-MOB-055',
    sourceSheet: 'IU-TEAT-alcohol-forward.md',
    guards: 'B+S',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component:
      'features/alcoolemia/pages/alcohol-forward.page.ts#AlcoholForwardPageComponent',
  },
  {
    path: 'alcohol-links',
    uxCode: 'UX-MOB-056',
    sourceSheet: 'IU-TEAT-alcohol-links.md',
    guards: 'B+S',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component:
      'features/alcoolemia/pages/alcohol-links.page.ts#AlcoholLinksPageComponent',
  },
  {
    path: 'alcohol-term',
    uxCode: 'UX-MOB-057',
    sourceSheet: 'IU-TEAT-alcohol-term.md',
    guards: 'B+S',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component:
      'features/alcoolemia/pages/alcohol-term.page.ts#AlcoholTermPageComponent',
  },
  {
    path: 'crash-start',
    uxCode: 'UX-MOB-060',
    sourceSheet: 'IU-TEAT-crash-start.md',
    guards: 'B+S, BOAT',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component:
      'features/sinistro/sinistro.routes.ts#CrashStartBoundaryComponent',
  },
  {
    path: 'crash-location',
    uxCode: 'UX-MOB-061',
    sourceSheet: 'IU-TEAT-crash-location.md',
    guards: 'B+S, BOAT',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component:
      'features/sinistro/sinistro.routes.ts#CrashLocationBoundaryComponent',
  },
  {
    path: 'crash-conditions',
    uxCode: 'UX-MOB-062',
    sourceSheet: 'IU-TEAT-crash-conditions.md',
    guards: 'B+S, BOAT',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component:
      'features/sinistro/sinistro.routes.ts#CrashConditionsBoundaryComponent',
  },
  {
    path: 'crash-vehicles',
    uxCode: 'UX-MOB-063',
    sourceSheet: 'IU-TEAT-crash-vehicles.md',
    guards: 'B+S, BOAT',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component:
      'features/sinistro/sinistro.routes.ts#CrashVehiclesBoundaryComponent',
  },
  {
    path: 'crash-people',
    uxCode: 'UX-MOB-064',
    sourceSheet: 'IU-TEAT-crash-people.md',
    guards: 'B+S, BOAT',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component:
      'features/sinistro/sinistro.routes.ts#CrashPeopleBoundaryComponent',
  },
  {
    path: 'crash-victims',
    uxCode: 'UX-MOB-065',
    sourceSheet: 'IU-TEAT-crash-victims.md',
    guards: 'B+S, BOAT',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component:
      'features/sinistro/sinistro.routes.ts#CrashVictimsBoundaryComponent',
  },
  {
    path: 'crash-dynamics',
    uxCode: 'UX-MOB-066',
    sourceSheet: 'IU-TEAT-crash-dynamics.md',
    guards: 'B+S, BOAT',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component:
      'features/sinistro/sinistro.routes.ts#CrashDynamicsBoundaryComponent',
  },
  {
    path: 'crash-sketch',
    uxCode: 'UX-MOB-067',
    sourceSheet: 'IU-TEAT-crash-sketch.md',
    guards: 'B+S, BOAT',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component:
      'features/sinistro/sinistro.routes.ts#CrashSketchBoundaryComponent',
  },
  {
    path: 'crash-evidence',
    uxCode: 'UX-MOB-068',
    sourceSheet: 'IU-TEAT-crash-evidence.md',
    guards: 'B+S, BOAT',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component:
      'features/sinistro/sinistro.routes.ts#CrashEvidenceBoundaryComponent',
  },
  {
    path: 'crash-ait-links',
    uxCode: 'UX-MOB-069',
    sourceSheet: 'IU-TEAT-crash-ait-links.md',
    guards: 'B+S, BOAT',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component:
      'features/sinistro/sinistro.routes.ts#CrashAitLinksBoundaryComponent',
  },
  {
    path: 'crash-review',
    uxCode: 'UX-MOB-070',
    sourceSheet: 'IU-TEAT-crash-review.md',
    guards: 'B+S, BOAT',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component:
      'features/sinistro/sinistro.routes.ts#CrashReviewBoundaryComponent',
  },
  {
    path: 'sync',
    uxCode: 'UX-MOB-080',
    sourceSheet: 'IU-TEAT-sync.md',
    guards: 'B+S',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component: 'features/sincronizacao/pages/sync.page.ts#SyncPageComponent',
  },
  {
    path: 'sync-item',
    uxCode: 'UX-MOB-081',
    sourceSheet: 'IU-TEAT-sync-item.md',
    guards: 'B+S',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component:
      'features/sincronizacao/pages/sync-item.page.ts#SyncItemPageComponent',
  },
  {
    path: 'sync-conflict',
    uxCode: 'UX-MOB-082',
    sourceSheet: 'IU-TEAT-sync-conflict.md',
    guards: 'B+S',
    allowedRoles: ['field-supervisor'],
    component:
      'features/sincronizacao/pages/sync-conflict.page.ts#SyncConflictPageComponent',
  },
  {
    path: 'diagnostics',
    uxCode: 'UX-MOB-083',
    sourceSheet: 'IU-TEAT-diagnostics.md',
    guards: 'B+S',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component:
      'features/sincronizacao/pages/diagnostics.page.ts#DiagnosticsPageComponent',
  },
  {
    path: 'support',
    uxCode: 'UX-MOB-084',
    sourceSheet: 'IU-TEAT-support.md',
    guards: 'B+S',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component:
      'features/sincronizacao/pages/support.page.ts#SupportPageComponent',
  },
  {
    path: 'messages',
    uxCode: 'UX-MOB-085',
    sourceSheet: 'IU-TEAT-messages.md',
    guards: 'B+S',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component:
      'features/sincronizacao/pages/messages.page.ts#MessagesPageComponent',
  },
  {
    path: 'approach-no-ait',
    uxCode: 'UX-MOB-C01',
    sourceSheet: 'IU-TEAT-approach-no-ait.md',
    guards: 'B+S',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component:
      'features/complementares/pages/approach-no-ait.page.ts#ApproachNoAitPageComponent',
  },
  {
    path: 'document-check',
    uxCode: 'UX-MOB-C02',
    sourceSheet: 'IU-TEAT-document-check.md',
    guards: 'B+S',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component:
      'features/complementares/pages/document-check.page.ts#DocumentCheckPageComponent',
  },
  {
    path: 'special-inspection',
    uxCode: 'UX-MOB-C03',
    sourceSheet: 'IU-TEAT-special-inspection.md',
    guards: 'B+S',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component:
      'features/complementares/pages/special-inspection.page.ts#SpecialInspectionPageComponent',
  },
  {
    path: 'context-help',
    uxCode: 'UX-MOB-C04',
    sourceSheet: 'IU-TEAT-context-help.md',
    guards: 'R',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component:
      'features/complementares/pages/context-help.page.ts#ContextHelpPageComponent',
  },
  {
    path: 'local-settings',
    uxCode: 'UX-MOB-C05',
    sourceSheet: 'IU-TEAT-local-settings.md',
    guards: 'B',
    allowedRoles: ['field-agent', 'field-supervisor'],
    component:
      'features/complementares/pages/local-settings.page.ts#LocalSettingsPageComponent',
  },
] as const satisfies readonly TeatRouteFixture[];

export const D05_ROUTE_PATH = 'ait-speed-measurement';
export const BOAT_ROUTE_PATHS = TEAT_ROUTE_FIXTURE.filter((route) =>
  route.guards.includes('BOAT'),
).map((route) => route.path);
