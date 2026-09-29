// R-0032 CTG-0002 — contract test for the PEC owner event.  It remains RED
// until O3 supplies the ch.exam.result-published producer and entitlement projector.
import { describe, expect, it } from 'vitest';

import { cpfHashOf } from '@detran/portal-identity';

import { projectorsHarness } from '../../tests/support/projectors-harness.js';

const EXAM_ID = '00000000-0000-7000-8000-0000ceca0001';
const EVENT_ID = '00000000-0000-7000-8000-0000ceca0002';

describe('R-0032 CTG-0002 — projeção PEC e entitlement holder', () => {
  it('dado replay do evento PEC do titular quando aplicado então cria uma única view e entitlement pelo hash do CPF', async () => {
    const h = projectorsHarness();
    const event = {
      id: EVENT_ID,
      type: 'ch.exam.result-published',
      version: 1,
      occurredAt: '2026-09-14T12:00:00.000Z',
      tenantId: '00000000-0000-7000-8000-000000000001',
      aggregate: { kind: 'exam', id: EXAM_ID, version: 1 },
      data: {
        examId: EXAM_ID,
        subjectCpfHash: cpfHashOf('33333333333'),
        track: 'MEDICAL',
        legalLabel: 'apto',
        validUntil: '2027-09-14',
      },
    };

    await h.apply(event, 'exam_view');
    await h.apply(event, 'exam_view');

    expect(h.db.rows('portal.exam_view')).toEqual([
      expect.objectContaining({
        exam_id: EXAM_ID,
        subject_cpf_hash: cpfHashOf('33333333333'),
        legal_label: 'apto',
      }),
    ]);
    expect(h.db.rows('portal.entitlement')).toEqual([
      expect.objectContaining({
        target_id: EXAM_ID,
        relation: 'holder',
        origin: 'pec-event',
      }),
    ]);
    expect(h.appliedEvents(EVENT_ID)).toHaveLength(1);

    const otherExamId = '00000000-0000-7000-8000-0000ceca0004';
    await h.apply(
      {
        ...event,
        id: '00000000-0000-7000-8000-0000ceca0005',
        aggregate: { kind: 'exam', id: otherExamId, version: 1 },
        data: {
          ...event.data,
          examId: otherExamId,
          subjectCpfHash: cpfHashOf('99999999999'),
        },
      },
      'exam_view',
    );
    expect(h.db.rows('portal.entitlement')).toHaveLength(1);
    expect(h.db.rows('portal.exam_view')).toHaveLength(1);
  });
});
