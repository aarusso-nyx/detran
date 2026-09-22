// Superfície manuscrita de `@detran/dashboard-monitor` (CTG-0002 §14.2;
// blueprint 1.1.0 `handwrittenExports: handwritten/surface/index`). Reexport
// por nome (A13): nunca `export *`; nenhum identificador reexportado duas
// vezes pelos três índices (`src/index.ts` gerado faz `export *` dos três).
export {
  AlertsQuery,
  ApproveExportDto,
  AuditTrailQuery,
  BiPanelDto,
  BiPanelsQuery,
  COMPARISON_DIMENSIONS,
  CompleteReportDto,
  ComparisonsQuery,
  CreateExportDto,
  DASHBOARD_LAYERS,
  DEFAULT_PAGE_SIZE,
  DutiesQuery,
  DutyCyclesQuery,
  EXPORT_SCOPES,
  FailReportDto,
  IndicatorConfigsQuery,
  IndicatorsQuery,
  KpisQuery,
  LayerSchema,
  N3_RESERVED_FILTER_KEYS,
  OPEN_EXPORT_FORMATS,
  PatchBiPanelDto,
  PatchIndicatorConfigDto,
  REPORT_TYPES,
  ReportsQuery,
  RequestReportDto,
  SourcesQuery,
  ThresholdSchema,
  TransparencyAuditDto,
  TransparencyChecklistQuery,
  pageOf,
} from './dto.js';
export type {
  AlertsQueryInput,
  ApproveExportInput,
  AuditTrailQueryInput,
  BiPanelInput,
  CompleteReportInput,
  ComparisonDimension,
  ComparisonsQueryInput,
  CreateExportInput,
  ExportScope,
  FailReportInput,
  KpisQueryInput,
  OpenExportFormat,
  PatchBiPanelInput,
  PatchIndicatorConfigInput,
  ReportType,
  RequestReportInput,
  Threshold,
  TransparencyAuditInput,
} from './dto.js';
export {
  DASHBOARD_PURPOSES_N2_H54,
  DOMAIN_BY_DIMENSION,
  DashboardLayerGate,
  assertNotN3,
  domainAllowed,
  domainScopeOf,
  layerAtLeast,
  mentionsN3,
  minLayer,
  ownStateFreshness,
  paginate,
  parseWith,
  readCellThreshold,
  tenantInfoOf,
  worstFreshness,
} from './layer-gate.js';
export type {
  DashboardFreshnessMeta,
  DomainScope,
  FieldErrorRule,
  LayerContext,
  LayerGateSpec,
  TenantInfo,
} from './layer-gate.js';
export {
  cellThresholdOf,
  suppress,
  suppressionWarning,
} from './suppression.js';
export type {
  CountCell,
  SuppressResult,
  Suppression,
  ThresholdParameterLike,
} from './suppression.js';
export {
  canonicalJson,
  csvWithWatermark,
  jsonWithWatermark,
  watermarkOf,
} from './watermark.js';
export type { WatermarkInput } from './watermark.js';
export {
  DashboardExportService,
  alertItem,
  assertExportNotN3,
  kpiRange,
  listAlerts,
  scopeRequirement,
} from './export.service.js';
export type {
  AlertListRow,
  ExportLogRow,
  ExportResponse,
  ScopeResult,
} from './export.service.js';
export { DashboardReportService, reportView } from './report.service.js';
export type { GeneratedReportRow } from './report.service.js';
export {
  DashboardCatalogService,
  biPanelView,
  indicatorConfigView,
  indicatorView,
} from './catalog.service.js';
export type {
  BiPanelRow,
  IndicatorConfigRow,
  IndicatorRow,
} from './catalog.service.js';
export {
  DATASET_REQUIREMENTS,
  DashboardAuditService,
  datasetMissing,
  datasetView,
  trailItem,
  transparencyAuditView,
} from './audit.service.js';
export type { ComparisonGroup, ComparisonsResult } from './audit.service.js';
export {
  DashboardOpenDataService,
  OPEN_DATASET_KEYS,
} from './open-data.service.js';
export type { OpenDataGroup, OpenDatasetKey } from './open-data.service.js';
export { DashboardAlertsController } from './alerts.controller.js';
export {
  DashboardDutiesController,
  dutyCycleView,
  dutyView,
} from './duties.controller.js';
export { DashboardCatalogController } from './catalog.controller.js';
export {
  DashboardSourcesController,
  sourceView,
} from './sources.controller.js';
export { DashboardExportsController } from './exports.controller.js';
export { DashboardAuditController } from './audit.controller.js';
export { DashboardOpenDataController } from './open-data.controller.js';
