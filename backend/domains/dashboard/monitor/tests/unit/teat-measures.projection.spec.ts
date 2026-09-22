// CTG-0001 §4.1.5, §4.3 (C-0001-05) — `TeatMeasuresProjection`
// (`dashboard.teat_measures`, IND-DASH-108…111, 311…314, 404…407). Fixture:
// `measure.changed` (TERMO_EMITIDO), connected = true (108/109). `src/
// handwritten/**` ainda não existe (TASK-0010): vermelho até lá — aceito.
import { describe, expect, it } from 'vitest';

import { TEAT_MEASURES_EVENT } from '../fixtures/outbox-events.js';
import {
  fakeContext,
  FakeDashboardTx,
  runProjectionContractSuite,
} from '../support/projectors-harness.js';
import {
  consumedEvents,
  PROJECTION_NAME,
  TeatMeasuresProjection,
} from '../../src/handwritten/projections/teat-measures.projection.js';

const EXPECTED_CONSUMED_EVENTS = [
  'measure.changed',
  'alcohol.changed',
  'ait.changed',
  'ait.concurrency-suspected',
  'custody.event',
  'evidence.changed',
  'package.published',
  'numbering.reservation.changed',
  'device.posture-changed',
];

describe('TeatMeasuresProjection', () => {
  it('dado consumedEvents quando lido então é exatamente o literal de CTG-0001 §4.3 (igualdade de conjuntos)', () => {
    expect([...consumedEvents].sort()).toEqual(
      [...EXPECTED_CONSUMED_EVENTS].sort(),
    );
  });

  it('dado PROJECTION_NAME quando lido então é dashboard.teat_measures', () => {
    expect(PROJECTION_NAME).toBe('dashboard.teat_measures');
  });

  runProjectionContractSuite({
    createProjector: () => new TeatMeasuresProjection(),
    validEvent: TEAT_MEASURES_EVENT,
    requiredDataField: 'termId',
    unconsumedType: 'shift.changed',
  });

  it('dado measure.changed (TERMO_EMITIDO) quando aplicado então object_kind = administrative-measure (check da DDL) e nunca grava campos de identificação (RN-DASH-170)', async () => {
    const tx = new FakeDashboardTx();
    const ctx = fakeContext(tx);
    const projector = new TeatMeasuresProjection();
    await projector.apply(TEAT_MEASURES_EVENT, ctx);
    const rows = tx.rows('dashboard.teat_measures');
    expect(rows).toHaveLength(1);
    expect(rows[0]?.object_kind).toBe('administrative-measure');
    for (const forbidden of ['plate', 'aitNumber', 'driverName', 'cpf']) {
      expect(rows[0]).not.toHaveProperty(forbidden);
    }
  });
});
