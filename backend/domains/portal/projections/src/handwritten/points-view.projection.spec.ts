// R-0009 CTG-0002 §7.4 e §13 (TASK-0006) — C-0002-53: projetor `points_view`
// (PENALIDADE_DEFINITIVA → definitive_points += points, last_12_months_json na
// janela `addCalendarMonths(today, -12)`, by_vehicle_json por placa da view;
// ait sem view → last_error). Fica vermelho até TASK-0008 criar
// `projectors.service.ts` e `points-view.projection.ts` (§14).
import { describe, expect, it } from 'vitest';

import { type Row } from '../../../requests/tests/support/fake-sql.js';
import {
  FIXED_TODAY,
  SUBJECTS,
} from '../../../requests/tests/support/portal-fixtures.js';
import {
  AIT_F1,
  AIT_F9,
  EVENT_IDS,
  INFRACTION_D1,
  eventById,
} from '../../tests/fixtures/outbox-events.js';
import { projectorsHarness } from '../../tests/support/projectors-harness.js';

const PROJECTION = 'points_view';

/**
 * Soma de calendário em meses com grampo no último dia do mês de destino —
 * mesma semântica de `addCalendarMonths` de `@detran/inf-deadlines`
 * (rait-deadline-engine.md §2), que o projetor usa para a janela de 12 meses
 * (§7.4). Reproduzida aqui porque `@detran/portal-projections` não declara
 * aquele pacote como dependência (`package.json` fora do que o Inspector toca).
 */
function addCalendarMonths(date: string, months: number): string {
  const [year, month, day] = date.split('-').map(Number) as [
    number,
    number,
    number,
  ];
  const shifted = month - 1 + months;
  const targetYear = year + Math.floor(shifted / 12);
  const targetMonth = ((shifted % 12) + 12) % 12;
  const lastDay = new Date(
    Date.UTC(targetYear, targetMonth + 1, 0),
  ).getUTCDate();
  return new Date(Date.UTC(targetYear, targetMonth, Math.min(day, lastDay)))
    .toISOString()
    .slice(0, 10);
}

function pointsOf(
  h: ReturnType<typeof projectorsHarness>,
  cpfHash: string,
): Row | undefined {
  return h.db
    .rows('portal.points_view')
    .find((row) => row.subject_cpf_hash === cpfHash);
}

describe('CTG-0002 §7.4 — points_view (C-0002-53)', () => {
  it('C-0002-53 — dado PENALIDADE_DEFINITIVA points 4 sobre ait com view (…f0000009, cpf da qualificada) então definitive_points += 4, last_12_months_json e by_vehicle_json', async () => {
    const h = projectorsHarness();
    const outcome = await h.apply(eventById(EVENT_IDS.e6), PROJECTION);
    expect(outcome).toMatchObject({ projection: PROJECTION, applied: true });
    const row = pointsOf(h, SUBJECTS.qualificada.cpfHash)!;
    expect(row).toMatchObject({
      definitive_points: 4,
      disputed_points: 0,
      last_event_id: EVENT_IDS.e6,
    });
    expect(row.last_12_months_json).toEqual([
      { aitId: AIT_F9, finalOn: '2026-07-15', points: 4 },
    ]);
    expect(row.by_vehicle_json).toEqual([{ plate: 'FIX2E05', points: 4 }]);
    expect(row.cached_at ?? null).toBeNull();

    // segunda penalidade definitiva sobre outro AIT da mesma placa acumula
    const second = {
      ...eventById(EVENT_IDS.e6),
      id: '00000000-0000-7000-8000-007000700051',
      aggregate: {
        kind: 'infraction',
        id: '00000000-0000-7000-8000-0000d0000019',
        version: 9,
      },
      data: {
        ...eventById(EVENT_IDS.e6).data,
        infractionId: '00000000-0000-7000-8000-0000d0000019',
        finalOn: '2026-08-01',
        points: 3,
      },
    };
    expect((await h.apply(second, PROJECTION)).applied).toBe(true);
    const updated = pointsOf(h, SUBJECTS.qualificada.cpfHash)!;
    expect(updated.definitive_points).toBe(7);
    expect(updated.last_12_months_json).toEqual([
      { aitId: AIT_F9, finalOn: '2026-07-15', points: 4 },
      { aitId: AIT_F9, finalOn: '2026-08-01', points: 3 },
    ]);
    expect(updated.by_vehicle_json).toEqual([{ plate: 'FIX2E05', points: 7 }]);
  });

  it('C-0002-53 — dado a linha …71000001 da prata (definitive 3, disputed 4) então += acumula sobre o existente e disputed_points não muda', async () => {
    const h = projectorsHarness({
      seed: (db) =>
        db.seed('portal.points_view', [
          {
            id: '00000000-0000-7000-8000-000071000001',
            subject_cpf_hash: SUBJECTS.prata.cpfHash,
            definitive_points: 3,
            disputed_points: 4,
            by_vehicle_json: [],
            last_12_months_json: [],
            last_event_id: null,
            cached_at: new Date('2026-09-14T12:00:00-04:00'),
          },
        ]),
    });
    const event = {
      ...eventById(EVENT_IDS.e6),
      id: '00000000-0000-7000-8000-007000700052',
      aggregate: {
        kind: 'infraction',
        id: '00000000-0000-7000-8000-0000d0000005',
        version: 9,
      },
      data: {
        infractionId: '00000000-0000-7000-8000-0000d0000005',
        aitId: '00000000-0000-7000-8000-0000f0000005',
        finalOn: '2026-09-01',
        points: 5,
        amountTier: 'integral_juros',
      },
    };
    expect((await h.apply(event, PROJECTION)).applied).toBe(true);
    const row = pointsOf(h, SUBJECTS.prata.cpfHash)!;
    expect(row).toMatchObject({
      id: '00000000-0000-7000-8000-000071000001',
      definitive_points: 8,
      disputed_points: 4,
    });
    expect(row.by_vehicle_json).toEqual([{ plate: 'FIX2E03', points: 5 }]);
    expect(new Date(String(row.cached_at)).toISOString()).toBe(
      '2026-09-14T16:00:00.000Z',
    );
  });

  it("C-0002-53 — dado ait sem view então last_error 'PORTAL.INTERNAL:infraction_view:<aitId>' e nenhuma linha", async () => {
    const h = projectorsHarness();
    const event = {
      ...eventById(EVENT_IDS.e6),
      id: '00000000-0000-7000-8000-007000700053',
      aggregate: { kind: 'infraction', id: INFRACTION_D1, version: 9 },
      data: {
        ...eventById(EVENT_IDS.e6).data,
        infractionId: INFRACTION_D1,
        aitId: AIT_F1,
      },
    };
    const outcome = await h.apply(event, PROJECTION);
    expect(outcome.applied).toBe(false);
    expect(outcome.error).toBe(`PORTAL.INTERNAL:infraction_view:${AIT_F1}`);
    expect(h.db.rows('portal.points_view')).toHaveLength(0);
    expect(
      h.appliedEvents('00000000-0000-7000-8000-007000700053')[0],
    ).toMatchObject({
      projection: PROJECTION,
      last_error: `PORTAL.INTERNAL:infraction_view:${AIT_F1}`,
    });
  });

  it('C-0002-53 — dado finalOn há mais de 12 meses então fora de last_12_months_json (janela addCalendarMonths(today, -12)), mas os pontos contam', async () => {
    const h = projectorsHarness();
    const windowStart = addCalendarMonths(FIXED_TODAY, -12);
    const oldFinalOn = addCalendarMonths(windowStart, -1);
    const old = {
      ...eventById(EVENT_IDS.e6),
      id: '00000000-0000-7000-8000-007000700054',
      data: { ...eventById(EVENT_IDS.e6).data, finalOn: oldFinalOn, points: 7 },
    };
    expect((await h.apply(old, PROJECTION)).applied).toBe(true);
    const row = pointsOf(h, SUBJECTS.qualificada.cpfHash)!;
    expect(row.definitive_points).toBe(7);
    expect(row.last_12_months_json).toEqual([]);
    expect(row.by_vehicle_json).toEqual([{ plate: 'FIX2E05', points: 7 }]);

    const edge = {
      ...old,
      id: '00000000-0000-7000-8000-007000700055',
      aggregate: { ...old.aggregate, version: 10 },
      data: { ...old.data, finalOn: windowStart, points: 1 },
    };
    expect((await h.apply(edge, PROJECTION)).applied).toBe(true);
    expect(
      pointsOf(h, SUBJECTS.qualificada.cpfHash)!.last_12_months_json,
    ).toEqual([{ aitId: AIT_F9, finalOn: windowStart, points: 1 }]);
  });

  it("§7.1 — dado o mesmo PENALIDADE_DEFINITIVA duas vezes então skipped 'already_applied' e definitive_points não dobra", async () => {
    const h = projectorsHarness();
    expect((await h.apply(eventById(EVENT_IDS.e6), PROJECTION)).applied).toBe(
      true,
    );
    expect(await h.apply(eventById(EVENT_IDS.e6), PROJECTION)).toMatchObject({
      applied: false,
      skipped: 'already_applied',
    });
    expect(pointsOf(h, SUBJECTS.qualificada.cpfHash)!.definitive_points).toBe(
      4,
    );
  });
});
