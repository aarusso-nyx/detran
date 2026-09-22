// CTG-0001 §4.1.6, §4.3 (C-0001-05) — `PortalServiceMetricsProjection`
// (`dashboard.portal_service_metrics`, IND-DASH-206…209, 301…303). Os
// payloads do Portal ainda não têm schema publicado (`source_pending`,
// OD-D21): a fixture usa `domainEvent` (casado como no precedente BOAT de
// R-0010) e um `data` mínimo — ver `tests/fixtures/outbox-events.ts`.
// `src/handwritten/**` ainda não existe (TASK-0010): vermelho até lá —
// aceito.
import { describe, expect, it } from 'vitest';

import { PORTAL_SERVICE_METRICS_EVENT } from '../fixtures/outbox-events.js';
import {
  fakeContext,
  FakeDashboardTx,
  runProjectionContractSuite,
} from '../support/projectors-harness.js';
import {
  consumedEvents,
  PROJECTION_NAME,
  PortalServiceMetricsProjection,
} from '../../src/handwritten/projections/portal-service-metrics.projection.js';

const EXPECTED_CONSUMED_EVENTS = [
  'SOLICITACAO_CRIADA',
  'SOLICITACAO_PROTOCOLADA',
  'SOLICITACAO_DESISTIDA',
  'SOLICITACAO_CONCLUIDA',
  'MANIFESTACAO_REGISTRADA',
  'MANIFESTACAO_ENCERRADA',
  'AVALIACAO_REGISTRADA',
];

describe('PortalServiceMetricsProjection', () => {
  it('dado consumedEvents quando lido então é exatamente o literal de CTG-0001 §4.3 (igualdade de conjuntos; tokens de domainEvent, precedente BOAT de R-0010)', () => {
    expect([...consumedEvents].sort()).toEqual(
      [...EXPECTED_CONSUMED_EVENTS].sort(),
    );
  });

  it('dado PROJECTION_NAME quando lido então é dashboard.portal_service_metrics', () => {
    expect(PROJECTION_NAME).toBe('dashboard.portal_service_metrics');
  });

  runProjectionContractSuite({
    createProjector: () => new PortalServiceMetricsProjection(),
    validEvent: PORTAL_SERVICE_METRICS_EVENT,
    requiredDataField: 'manifestationId',
    unconsumedType: 'NOTIFICACAO_ENVIADA',
  });

  it('dado MANIFESTACAO_REGISTRADA quando aplicado então object_kind = manifestation (§4.1.6, casado por domainEvent)', async () => {
    const tx = new FakeDashboardTx();
    const ctx = fakeContext(tx);
    const projector = new PortalServiceMetricsProjection();
    await projector.apply(PORTAL_SERVICE_METRICS_EVENT, ctx);
    const rows = tx.rows('dashboard.portal_service_metrics');
    expect(rows).toHaveLength(1);
    expect(rows[0]?.object_kind).toBe('manifestation');
  });
});
