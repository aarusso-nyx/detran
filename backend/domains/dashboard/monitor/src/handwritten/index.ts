// Superfície manuscrita de `@detran/dashboard-monitor` (BP-DASH-MONITOR-001
// `handwrittenExports: ["handwritten/index"]`; CTG-0001 §4.3). Adenda A13
// (plan R-0011): nunca `export *` de um `*.projection.ts` — cada um exporta o
// mesmo identificador `consumedEvents`/`PROJECTION_NAME` (literal local lido
// pelo gate M6) e o `export *` colidiria em TS2308; reexporta-se por nome tudo
// o mais. Nenhum controller (C-0001-06).
export * from './projection-contract.js';
export * from './projectors.js';

export {
  PrescriptionRiskProjection,
  PRESCRIPTION_TIMER_CLOCKS,
  PRESCRIPTION_EXTINCT_STATES,
  prescriptionIndicatorCode,
} from './projections/prescription-risk.projection.js';
export { ProductionProjection } from './projections/production.projection.js';
export {
  IntegrationHealthProjection,
  INTEGRATION_HEALTH_SYSTEM_KEY,
  RECEIPT_STATUSES,
} from './projections/integration-health.projection.js';
export {
  PecDeadlinesProjection,
  PEC_DEADLINE_INDICATORS,
} from './projections/pec-deadlines.projection.js';
export {
  TeatMeasuresProjection,
  TEAT_OBJECT_KINDS,
  TEAT_MEASURE_INDICATORS,
  CUSTODY_INTEGRITY,
} from './projections/teat-measures.projection.js';
export {
  PortalServiceMetricsProjection,
  LAI_SERVICE_KEYS,
} from './projections/portal-service-metrics.projection.js';
export { DutyEvidenceProjection } from './projections/duty-evidence.projection.js';
export {
  SourceFreshnessProjection,
  HEARTBEAT_STATES,
} from './projections/source-freshness.projection.js';
