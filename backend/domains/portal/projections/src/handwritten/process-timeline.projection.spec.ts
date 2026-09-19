// R-0009 CTG-0002 §7.4 e §13 (TASK-0006) — C-0002-52: projetor `process_timeline`
// (linha por case_id ligada ao request pelo `delegation_external_id`, entradas
// `visibility: 'citizen'`, `decision_json` de RAIT_DECISAO_PUBLICADA com
// EM_ANDAMENTO_NO_ORGAO → RESULTADO_DISPONIVEL → AVALIACAO_OFERECIDA (version+2),
// diligência em `deadlines_json`). Fica vermelho até TASK-0008 criar
// `projectors.service.ts` e `process-timeline.projection.ts` (§14).
import { describe, expect, it } from 'vitest';

import { type Row } from '../../../requests/tests/support/fake-sql.js';
import { SUBJECTS } from '../../../requests/tests/support/portal-fixtures.js';
import {
  AIT_F3,
  CASE_207,
  DECISION_409,
  EVENT_IDS,
  INQUIRY_308,
  eventById,
} from '../../tests/fixtures/outbox-events.js';
import { projectorsHarness } from '../../tests/support/projectors-harness.js';

const PROJECTION = 'process_timeline';
const REQUEST_ID = '00000000-0000-7000-8000-0000704000e2';

function seedLinkedRequest(
  db: { seed(table: string, rows: Row[]): Row[] },
  state = 'EM_ANDAMENTO_NO_ORGAO',
): void {
  db.seed('portal.request', [
    {
      id: REQUEST_ID,
      state,
      service_key: 'defesa_previa',
      subject_id: SUBJECTS.prata.id,
      target_kind: 'ait',
      target_id: AIT_F3,
      minimum_assurance: 'avancada',
      delegation_status: 'delegated',
      delegation_domain: 'inf',
      delegation_command: 'inf:rait-case:protocol',
      delegation_external_id: CASE_207,
      version: 4,
    },
  ]);
}

function timeline(h: ReturnType<typeof projectorsHarness>): Row | undefined {
  return h.db
    .rows('portal.process_timeline')
    .find((row) => row.case_id === CASE_207);
}

describe('CTG-0002 §7.4 — process_timeline (C-0002-52)', () => {
  it("C-0002-52 — dado RAIT_CASO_PROTOCOLADO com caseId ligado a request.delegation_external_id então linha por case_id com request_id e entry visibility 'citizen'", async () => {
    const h = projectorsHarness({ seed: (db) => seedLinkedRequest(db) });
    const outcome = await h.apply(eventById(EVENT_IDS.e7), PROJECTION);
    expect(outcome).toMatchObject({ projection: PROJECTION, applied: true });
    const row = timeline(h)!;
    expect(row).toMatchObject({
      case_id: CASE_207,
      request_id: REQUEST_ID,
      last_event_id: EVENT_IDS.e7,
      decision_json: null,
    });
    const entries = row.entries_json as Row[];
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      at: '2026-09-07T12:00:00.000Z',
      type: eventById(EVENT_IDS.e7).type,
      domainEvent: 'RAIT_CASO_PROTOCOLADO',
      visibility: 'citizen',
    });
    expect(entries[0]!.data).toMatchObject({
      caseId: CASE_207,
      aitId: AIT_F3,
      instance: 'defesa_previa',
    });
    expect(row.deadlines_json).toEqual([]);
    expect(h.appliedEvents(EVENT_IDS.e7)).toHaveLength(1);
  });

  it('C-0002-52 — dado caso sem request no Portal (balcão, RN-PORTAL-105 3) então linha com request_id null', async () => {
    const h = projectorsHarness();
    expect((await h.apply(eventById(EVENT_IDS.e7), PROJECTION)).applied).toBe(
      true,
    );
    expect(timeline(h)).toMatchObject({ case_id: CASE_207, request_id: null });
  });

  it('C-0002-52 — dado RAIT_DECISAO_PUBLICADA então decision_json { outcome: decisionKind, publishedOn, … } e request EM_ANDAMENTO_NO_ORGAO → AVALIACAO_OFERECIDA (version+2)', async () => {
    const h = projectorsHarness({ seed: (db) => seedLinkedRequest(db) });
    expect((await h.apply(eventById(EVENT_IDS.e7), PROJECTION)).applied).toBe(
      true,
    );
    expect((await h.apply(eventById(EVENT_IDS.e9), PROJECTION)).applied).toBe(
      true,
    );
    const row = timeline(h)!;
    expect(row.decision_json).toEqual({
      outcome: 'indeferido',
      summary: null,
      publishedOn: '2026-09-12',
      documentUrl: null,
      nextStep: { kind: null, serviceKey: null, dueOn: null },
      refundDue: null,
      finalInstance: null,
    });
    expect(row.last_event_id).toBe(EVENT_IDS.e9);
    expect(
      (row.entries_json as Row[]).map((entry) => entry.domainEvent),
    ).toEqual(['RAIT_CASO_PROTOCOLADO', 'RAIT_DECISAO_PUBLICADA']);
    expect((row.entries_json as Row[])[1]!.data).toMatchObject({
      decisionId: DECISION_409,
      decisionKind: 'indeferido',
    });
    const request = h.db
      .rows('portal.request')
      .find((candidate) => candidate.id === REQUEST_ID)!;
    expect(request).toMatchObject({ state: 'AVALIACAO_OFERECIDA', version: 6 });
  });

  it('C-0002-52 — dado RAIT_DECISAO_PUBLICADA com request fora de EM_ANDAMENTO_NO_ORGAO então o request não muda (SQL condicional)', async () => {
    const h = projectorsHarness({
      seed: (db) => seedLinkedRequest(db, 'PROTOCOLADO'),
    });
    expect((await h.apply(eventById(EVENT_IDS.e9), PROJECTION)).applied).toBe(
      true,
    );
    expect(timeline(h)!.decision_json).toMatchObject({ outcome: 'indeferido' });
    expect(
      h.db
        .rows('portal.request')
        .find((candidate) => candidate.id === REQUEST_ID),
    ).toMatchObject({ state: 'PROTOCOLADO', version: 4 });
  });

  it("C-0002-52 — dado rait.inquiry.changed sem outcome então entry com o type da diligência e deadlines_json += { kind 'diligencia', dueOn, ownedBy: 'citizen' }; com outcome então sem prazo novo", async () => {
    const h = projectorsHarness({ seed: (db) => seedLinkedRequest(db) });
    expect((await h.apply(eventById(EVENT_IDS.e7), PROJECTION)).applied).toBe(
      true,
    );
    const inquiry = eventById(EVENT_IDS.e8);
    const outcome = await h.apply(inquiry, PROJECTION);
    expect(outcome.applied).toBe(true);
    const row = timeline(h)!;
    expect(row.deadlines_json).toEqual([
      { kind: 'diligencia', dueOn: '2026-09-30', ownedBy: 'citizen' },
    ]);
    const entries = row.entries_json as Row[];
    expect(entries).toHaveLength(2);
    expect(entries[1]).toMatchObject({
      type: inquiry.type,
      visibility: 'citizen',
    });
    expect(entries[1]!.data).toMatchObject({
      inquiryId: INQUIRY_308,
      addressee: 'cidadao',
      dueOn: '2026-09-30',
    });

    const answered = {
      ...inquiry,
      id: '00000000-0000-7000-8000-007000700041',
      aggregate: { ...inquiry.aggregate, version: 4 },
      data: { ...inquiry.data, outcome: 'respondida' },
    };
    expect((await h.apply(answered, PROJECTION)).applied).toBe(true);
    expect(timeline(h)!.deadlines_json).toEqual([
      { kind: 'diligencia', dueOn: '2026-09-30', ownedBy: 'citizen' },
    ]);
    expect(timeline(h)!.entries_json as Row[]).toHaveLength(3);

    const agency = {
      ...inquiry,
      id: '00000000-0000-7000-8000-007000700042',
      aggregate: { ...inquiry.aggregate, version: 5 },
      data: {
        ...inquiry.data,
        inquiryId: '00000000-0000-7000-8000-007000700309',
        addressee: 'orgao',
      },
    };
    expect((await h.apply(agency, PROJECTION)).applied).toBe(true);
    expect((timeline(h)!.deadlines_json as Row[])[1]).toEqual({
      kind: 'diligencia',
      dueOn: '2026-09-30',
      ownedBy: 'agency',
    });
  });

  it("§7.1 — dado o mesmo evento RAIT duas vezes então a segunda é skipped 'already_applied' e entries_json não duplica", async () => {
    const h = projectorsHarness();
    expect((await h.apply(eventById(EVENT_IDS.e7), PROJECTION)).applied).toBe(
      true,
    );
    expect(await h.apply(eventById(EVENT_IDS.e7), PROJECTION)).toMatchObject({
      applied: false,
      skipped: 'already_applied',
    });
    expect(timeline(h)!.entries_json as Row[]).toHaveLength(1);
  });
});
