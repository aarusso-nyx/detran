// CTG-0001 §4.1.2, §4.3 (C-0001-05) — `ProductionProjection`
// (`dashboard.production`, IND-DASH-304/305, connected = true). `src/handwritten/**`
// ainda não existe (TASK-0010): este spec fica vermelho até lá — aceito.
import { describe, expect, it } from 'vitest';

import { PRODUCTION_EVENT } from '../fixtures/outbox-events.js';
import {
  fakeContext,
  FakeDashboardTx,
  runProjectionContractSuite,
} from '../support/projectors-harness.js';
import {
  consumedEvents,
  PROJECTION_NAME,
  ProductionProjection,
} from '../../src/handwritten/projections/production.projection.js';

const EXPECTED_CONSUMED_EVENTS = [
  'rait.case.changed',
  'rait.case.received',
  'rait.session.changed',
  'rait.agenda-item.changed',
  'rait.minutes.published',
  'rait.decision.published',
];

describe('ProductionProjection', () => {
  it('dado consumedEvents quando lido então é exatamente o literal de CTG-0001 §4.3 (igualdade de conjuntos)', () => {
    expect([...consumedEvents].sort()).toEqual(
      [...EXPECTED_CONSUMED_EVENTS].sort(),
    );
  });

  it('dado PROJECTION_NAME quando lido então é dashboard.production', () => {
    expect(PROJECTION_NAME).toBe('dashboard.production');
  });

  runProjectionContractSuite({
    createProjector: () => new ProductionProjection(),
    validEvent: PRODUCTION_EVENT,
    requiredDataField: 'caseId',
    unconsumedType: 'rait.batch.changed',
  });

  it('dado rait.case.changed quando aplicado então grava period_start = 1º dia do mês de occurredAt e transitions = 1 (primeira aplicação)', async () => {
    const tx = new FakeDashboardTx();
    const ctx = fakeContext(tx);
    const projector = new ProductionProjection();
    await projector.apply(PRODUCTION_EVENT, ctx);
    const rows = tx.rows('dashboard.production');
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      period_start: '2026-09-01',
      current_state: 'EM_JULGAMENTO',
    });
  });
});
