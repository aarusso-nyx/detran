// `DASHBOARD_MONITOR_PROJECTORS` — provider Nest registrado pelo módulo gerado
// via `module.handwrittenProviders` (BP-DASH-MONITOR-001; plan R-0011 M1/M24;
// CTG-0001 §4.3): a lista dos oito projetores de `@detran/dashboard-monitor`,
// na ordem de CTG-0001 §4.1. `dashboard.crashes` é de R-0010
// (`@detran/dashboard-crashes`, M2) e não entra. Replay (`rebuild`) e o runner
// que lê `integration.outbox` e abre a transação são CTG-0002.
import type { DashboardProjector } from './projection-contract.js';
import { DutyEvidenceProjection } from './projections/duty-evidence.projection.js';
import { IntegrationHealthProjection } from './projections/integration-health.projection.js';
import { PecDeadlinesProjection } from './projections/pec-deadlines.projection.js';
import { PortalServiceMetricsProjection } from './projections/portal-service-metrics.projection.js';
import { PrescriptionRiskProjection } from './projections/prescription-risk.projection.js';
import { ProductionProjection } from './projections/production.projection.js';
import { SourceFreshnessProjection } from './projections/source-freshness.projection.js';
import { TeatMeasuresProjection } from './projections/teat-measures.projection.js';

export const DASHBOARD_MONITOR_PROJECTORS_TOKEN =
  'DASHBOARD_MONITOR_PROJECTORS';

/** Os oito, na ordem do §4.1 — para testes e para o provider. */
export const DASHBOARD_MONITOR_PROJECTOR_LIST: readonly DashboardProjector[] =
  Object.freeze([
    new PrescriptionRiskProjection(),
    new ProductionProjection(),
    new IntegrationHealthProjection(),
    new PecDeadlinesProjection(),
    new TeatMeasuresProjection(),
    new PortalServiceMetricsProjection(),
    new DutyEvidenceProjection(),
    new SourceFreshnessProjection(),
  ]);

/** Provider Nest (objeto {provide, useValue}). */
export const DASHBOARD_MONITOR_PROJECTORS: {
  provide: typeof DASHBOARD_MONITOR_PROJECTORS_TOKEN;
  useValue: readonly DashboardProjector[];
} = {
  provide: DASHBOARD_MONITOR_PROJECTORS_TOKEN,
  useValue: DASHBOARD_MONITOR_PROJECTOR_LIST,
};
