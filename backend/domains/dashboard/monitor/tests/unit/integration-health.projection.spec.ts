// CTG-0001 §4.1.3, §4.3 (C-0001-05) — `IntegrationHealthProjection`
// (`dashboard.integration_health`, IND-DASH-401…403, connected = false —
// OD-D22). `src/handwritten/**` ainda não existe (TASK-0010): vermelho até
// lá — aceito.
import { describe, expect, it } from 'vitest';

import { INTEGRATION_HEALTH_EVENT } from '../fixtures/outbox-events.js';
import {
  fakeContext,
  FakeDashboardTx,
  runProjectionContractSuite,
} from '../support/projectors-harness.js';
import {
  consumedEvents,
  PROJECTION_NAME,
  IntegrationHealthProjection,
} from '../../src/handwritten/projections/integration-health.projection.js';

describe('IntegrationHealthProjection', () => {
  it('dado consumedEvents quando lido então é exatamente [sync.batch.received] (CTG-0001 §4.3)', () => {
    expect([...consumedEvents]).toEqual(['sync.batch.received']);
  });

  it('dado PROJECTION_NAME quando lido então é dashboard.integration_health', () => {
    expect(PROJECTION_NAME).toBe('dashboard.integration_health');
  });

  runProjectionContractSuite({
    createProjector: () => new IntegrationHealthProjection(),
    validEvent: INTEGRATION_HEALTH_EVENT,
    requiredDataField: 'receiptStatus',
    unconsumedType: 'sync.conflict.opened',
  });

  it('dado sync.batch.received com receiptStatus applied quando aplicado então grava metric = receipt.applied e system_key = teat-offline-sync (CTG-0001 §4.1.3)', async () => {
    const tx = new FakeDashboardTx();
    const ctx = fakeContext(tx);
    const projector = new IntegrationHealthProjection();
    await projector.apply(INTEGRATION_HEALTH_EVENT, ctx);
    const rows = tx.rows('dashboard.integration_health');
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      system_key: 'teat-offline-sync',
      metric: 'receipt.applied',
    });
  });
});
