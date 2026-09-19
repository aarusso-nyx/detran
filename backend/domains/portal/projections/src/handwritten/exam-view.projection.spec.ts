// R-0009 CTG-0002 §7.2 e §13 (TASK-0006) — C-0002-54: projetor esqueleto
// `exam_view` (produtor real PEC — OD-P19): evento com aggregate.kind 'exam'
// só grava last_event_id na linha existente; sem linha → skipped
// 'not_consumed'. Fica vermelho até TASK-0008 criar `projectors.service.ts`
// e `exam-view.projection.ts` (§14).
import { describe, expect, it } from 'vitest';

import { SUBJECTS } from '../../../requests/tests/support/portal-fixtures.js';
import {
  EVENT_IDS,
  EXAM_FF2,
  eventById,
} from '../../tests/fixtures/outbox-events.js';
import { projectorsHarness } from '../../tests/support/projectors-harness.js';

const PROJECTION = 'exam_view';
const TABLE = 'portal.exam_view';
const ROW_ID = '00000000-0000-7000-8000-000071f000e1';

function seeded() {
  return projectorsHarness({
    seed: (db) =>
      db.seed(TABLE, [
        {
          id: ROW_ID,
          exam_id: EXAM_FF2,
          subject_cpf_hash: SUBJECTS.ouro.cpfHash,
          legal_label: 'fixture',
          valid_until: null,
          board_due_on: null,
          last_event_id: '00000000-0000-0000-0000-000000000000',
        },
      ]),
  });
}

describe('CTG-0002 §7.2 — exam_view esqueleto (C-0002-54)', () => {
  it("C-0002-54 — dado evento aggregate.kind 'exam' (…7000700012) e linha existente então só last_event_id gravado", async () => {
    const h = seeded();
    const before = { ...h.db.rows(TABLE)[0]! };
    const outcome = await h.apply(eventById(EVENT_IDS.e12), PROJECTION);
    expect(outcome).toMatchObject({ projection: PROJECTION, applied: true });
    const after = h.db.rows(TABLE)[0]!;
    expect(after.last_event_id).toBe(EVENT_IDS.e12);
    const { last_event_id: _b, updated_at: _bu, ...beforeRest } = before;
    const { last_event_id: _a, updated_at: _au, ...afterRest } = after;
    expect(afterRest).toEqual(beforeRest);
    expect(h.appliedEvents(EVENT_IDS.e12)).toHaveLength(1);
  });

  it("C-0002-54 — dado evento aggregate.kind 'exam' sem linha então skipped 'not_consumed' e nada gravado", async () => {
    const h = projectorsHarness();
    const outcome = await h.apply(eventById(EVENT_IDS.e12), PROJECTION);
    expect(outcome).toMatchObject({ applied: false, skipped: 'not_consumed' });
    expect(h.db.rows(TABLE)).toHaveLength(0);
    expect(h.appliedEvents(EVENT_IDS.e12)).toHaveLength(0);
  });

  it("§7.1 — dado o mesmo evento duas vezes então skipped 'already_applied'", async () => {
    const h = seeded();
    expect((await h.apply(eventById(EVENT_IDS.e12), PROJECTION)).applied).toBe(
      true,
    );
    expect(await h.apply(eventById(EVENT_IDS.e12), PROJECTION)).toMatchObject({
      applied: false,
      skipped: 'already_applied',
    });
  });
});
