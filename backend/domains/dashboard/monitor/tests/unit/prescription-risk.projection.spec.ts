// CTG-0001 §4.1.1, §4.3 (C-0001-05) — `PrescriptionRiskProjection`
// (`dashboard.prescription_risk`, IND-DASH-101…105). `src/handwritten/**`
// ainda não existe (TASK-0010): este spec fica vermelho (falha de import) até
// lá — aceito pelo prompt TASK-0002. Fixture: `inf.timer.expired` (T-DEC), o
// único evento do grupo com produtor em `main`.
import { describe, expect, it } from 'vitest';

import { PRESCRIPTION_RISK_EVENT } from '../fixtures/outbox-events.js';
import {
  fakeContext,
  FakeDashboardTx,
  runProjectionContractSuite,
} from '../support/projectors-harness.js';
import {
  consumedEvents,
  PROJECTION_NAME,
  PrescriptionRiskProjection,
} from '../../src/handwritten/projections/prescription-risk.projection.js';

const EXPECTED_CONSUMED_EVENTS = [
  'rait.clock.flag-changed',
  'rait.case.changed',
  'rait.case.received',
  'rait.assignment.changed',
  'inf.timer.expired',
  'inf.timer.rescheduled',
  'inf.infraction.changed',
];

describe('PrescriptionRiskProjection', () => {
  it('dado consumedEvents quando lido então é exatamente o literal de CTG-0001 §4.3 (igualdade de conjuntos)', () => {
    expect([...consumedEvents].sort()).toEqual(
      [...EXPECTED_CONSUMED_EVENTS].sort(),
    );
  });

  it('dado PROJECTION_NAME quando lido então é dashboard.prescription_risk', () => {
    expect(PROJECTION_NAME).toBe('dashboard.prescription_risk');
  });

  runProjectionContractSuite({
    createProjector: () => new PrescriptionRiskProjection(),
    validEvent: PRESCRIPTION_RISK_EVENT,
    requiredDataField: 'ownerId',
    unconsumedType: 'rait.session.changed',
  });

  it('dado inf.timer.expired com timerCode T-DEC quando aplicado então grava clock_code A e indicator_code IND-DASH-101 ([RN-DASH-131])', async () => {
    const tx = new FakeDashboardTx();
    const ctx = fakeContext(tx);
    const projector = new PrescriptionRiskProjection();
    await projector.apply(PRESCRIPTION_RISK_EVENT, ctx);
    const rows = tx.rows('dashboard.prescription_risk');
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      clock_code: 'A',
      indicator_code: 'IND-DASH-101',
    });
  });
});
