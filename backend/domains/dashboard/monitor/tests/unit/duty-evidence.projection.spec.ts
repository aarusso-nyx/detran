// CTG-0001 §4.1.7, §4.3 (C-0001-05) — `DutyEvidenceProjection`
// (`dashboard.duty_evidence`, IND-DASH-201…209, connected = false — evento
// próprio do DASHBOARD, publicado só a partir do CTG-0002). `src/
// handwritten/**` ainda não existe (TASK-0010): vermelho até lá — aceito.
import { describe, expect, it } from 'vitest';

import { DUTY_EVIDENCE_EVENT } from '../fixtures/outbox-events.js';
import {
  fakeContext,
  FakeDashboardTx,
  runProjectionContractSuite,
} from '../support/projectors-harness.js';
import {
  consumedEvents,
  PROJECTION_NAME,
  DutyEvidenceProjection,
} from '../../src/handwritten/projections/duty-evidence.projection.js';

describe('DutyEvidenceProjection', () => {
  it('dado consumedEvents quando lido então é exatamente [dashboard.duty.changed] (CTG-0001 §4.3, proposta própria)', () => {
    expect([...consumedEvents]).toEqual(['dashboard.duty.changed']);
  });

  it('dado PROJECTION_NAME quando lido então é dashboard.duty_evidence', () => {
    expect(PROJECTION_NAME).toBe('dashboard.duty_evidence');
  });

  runProjectionContractSuite({
    createProjector: () => new DutyEvidenceProjection(),
    validEvent: DUTY_EVIDENCE_EVENT,
    requiredDataField: 'toState',
    unconsumedType: 'dashboard.indicator.changed',
  });

  it('dado dashboard.duty.changed (DEVER_JANELA_ABERTA) quando aplicado então state = toState (= duty_state_ref) e late = false (ainda não vencido)', async () => {
    const tx = new FakeDashboardTx();
    const ctx = fakeContext(tx);
    const projector = new DutyEvidenceProjection();
    await projector.apply(DUTY_EVIDENCE_EVENT, ctx);
    const rows = tx.rows('dashboard.duty_evidence');
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ state: 'JANELA_ABERTA', late: false });
  });
});
