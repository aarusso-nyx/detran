// CTG-0001 §4.1.4, §4.3 (C-0001-05) — `PecDeadlinesProjection`
// (`dashboard.pec_deadlines`, IND-DASH-106/107/306…309, connected = false —
// o PEC não publica eventos; `pec.deadline.changed` é proposta WP-D3).
// `src/handwritten/**` ainda não existe (TASK-0010): vermelho até lá —
// aceito.
import { describe, expect, it } from 'vitest';

import { PEC_DEADLINES_EVENT } from '../fixtures/outbox-events.js';
import {
  fakeContext,
  FakeDashboardTx,
  runProjectionContractSuite,
} from '../support/projectors-harness.js';
import {
  consumedEvents,
  PROJECTION_NAME,
  PecDeadlinesProjection,
} from '../../src/handwritten/projections/pec-deadlines.projection.js';

describe('PecDeadlinesProjection', () => {
  it('dado consumedEvents quando lido então é exatamente [pec.deadline.changed] (CTG-0001 §4.3, proposta WP-D3)', () => {
    expect([...consumedEvents]).toEqual(['pec.deadline.changed']);
  });

  it('dado PROJECTION_NAME quando lido então é dashboard.pec_deadlines', () => {
    expect(PROJECTION_NAME).toBe('dashboard.pec_deadlines');
  });

  runProjectionContractSuite({
    createProjector: () => new PecDeadlinesProjection(),
    validEvent: PEC_DEADLINES_EVENT,
    requiredDataField: 'estadoNovo',
    unconsumedType: 'pec.junta.changed',
  });

  it('dado pec.deadline.changed quando aplicado então due_on fica nulo (o formato WP-D3 não carrega data-limite, §8 OD-D20) e to_state = estadoNovo verbatim', async () => {
    const tx = new FakeDashboardTx();
    const ctx = fakeContext(tx);
    const projector = new PecDeadlinesProjection();
    await projector.apply(PEC_DEADLINES_EVENT, ctx);
    const rows = tx.rows('dashboard.pec_deadlines');
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ to_state: 'DESIGNADO', due_on: null });
  });
});
