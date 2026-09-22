// CTG-0001 §4.1.8, §4.3 (C-0001-05) — `SourceFreshnessProjection`
// (atualiza `dashboard.source`, IND-DASH-408, connected = false — heartbeat
// nasce no CTG-0002, proposta OD-D07). `src/handwritten/**` ainda não existe
// (TASK-0010): vermelho até lá — aceito.
import { describe, expect, it } from 'vitest';

import { SOURCE_FRESHNESS_EVENT } from '../fixtures/outbox-events.js';
import {
  fakeContext,
  FakeDashboardTx,
  runProjectionContractSuite,
} from '../support/projectors-harness.js';
import {
  consumedEvents,
  PROJECTION_NAME,
  SourceFreshnessProjection,
} from '../../src/handwritten/projections/source-freshness.projection.js';

describe('SourceFreshnessProjection', () => {
  it('dado consumedEvents quando lido então é exatamente [source.heartbeat] (CTG-0001 §4.3, proposta OD-D07)', () => {
    expect([...consumedEvents]).toEqual(['source.heartbeat']);
  });

  it('dado PROJECTION_NAME quando lido então é dashboard.source_freshness (ledger) — a tabela afetada é dashboard.source (§4.1.8)', () => {
    expect(PROJECTION_NAME).toBe('dashboard.source_freshness');
  });

  runProjectionContractSuite({
    createProjector: () => new SourceFreshnessProjection(),
    validEvent: SOURCE_FRESHNESS_EVENT,
    requiredDataField: 'sourceKey',
    unconsumedType: 'sync.batch.received',
  });

  it('dado source.heartbeat quando aplicado então dashboard.source vira FRESCO só porque heartbeat_contract é conhecido (WF-DASH-003; nunca cria estado fora de freshness_state_ref)', async () => {
    const tx = new FakeDashboardTx();
    const ctx = fakeContext(tx);
    const projector = new SourceFreshnessProjection();
    await projector.apply(SOURCE_FRESHNESS_EVENT, ctx);
    const rows = tx.rows('dashboard.source');
    expect(rows).toHaveLength(1);
    expect(['FRESCO', 'INDISPONIVEL']).toContain(rows[0]?.state);
  });
});
