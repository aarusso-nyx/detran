// CTG-0002 §15.1 C-0002-16 [unit] — `DashboardClockService.computeDue` (§13.1)
// com `InMemoryCalendar(calendar-2026.json)` e fuso `America/Manaus`: os seis
// casos da tabela de §6.8 (hora útil = hora de relógio cujo dia civil no fuso
// do tenant é dia útil pelo `Calendar`; `optional` não é feriado — OD-D44) e a
// regra de `due_at` por `duration_unit` de §13.2 (`imediato`, `percentual`,
// `data_fixa`/`mensal`/`anual` = fim do dia civil, sem adiamento em dia não
// útil — OD-D55; `dias_corridos`). Relógio fixo; nenhum `Date.now()`.
import { describe, expect, it } from 'vitest';

import { DashboardClockService } from '../../src/handwritten/cycle/index.js';
import {
  FIXTURE_TENANT_ID,
  FIXTURE_TENANT_TZ,
  endOfDayManaus,
  manaus,
} from '../fixtures/cycle-fixtures.js';
import { calendar2026, fixedClock } from '../support/cycle-harness.js';

const OWNER = '00000000-0000-7000-8000-008310000001';

function service(): DashboardClockService {
  return new DashboardClockService(fixedClock('2026-09-04'), calendar2026());
}

/** Tabela de §6.8 (fuso Manaus; 2026-09-05 sáb + feriado AM; 2026-09-07 seg
 * Independência; 2026-11-20 Consciência Negra; 21–22/11 fim de semana). */
const ACK_CASES = [
  {
    n: 1,
    startedAt: '2026-09-04T10:00:00',
    code: 'T-DASH-ACK-N1',
    dueAt: '2026-09-08T10:00:00',
  },
  {
    n: 2,
    startedAt: '2026-09-04T20:00:00',
    code: 'T-DASH-ACK-N2',
    dueAt: '2026-09-08T04:00:00',
  },
  {
    n: 3,
    startedAt: '2026-09-04T23:00:00',
    code: 'T-DASH-ACK-N3',
    dueAt: '2026-09-08T01:00:00',
  },
  {
    n: 4,
    startedAt: '2026-09-09T09:30:00',
    code: 'T-DASH-ACK-N3',
    dueAt: '2026-09-09T11:30:00',
  },
  {
    n: 6,
    startedAt: '2026-11-19T12:00:00',
    code: 'T-DASH-ACK-N1',
    dueAt: '2026-11-23T12:00:00',
  },
] as const;

describe('C-0002-16 — computeDue em horas úteis (§6.8) e por unidade (§13.2)', () => {
  it.each(ACK_CASES)(
    'C-0002-16 dado o caso $n de §6.8 (started_at $startedAt Manaus, $code) quando computeDue então due_at = $dueAt Manaus',
    async ({ startedAt, code, dueAt }) => {
      const due = await service().computeDue(
        FIXTURE_TENANT_TZ,
        FIXTURE_TENANT_ID,
        code,
        {
          ownerKind: 'alert',
          ownerId: OWNER,
          code,
          startedAt: manaus(startedAt),
        },
      );
      expect(due?.toISOString()).toBe(manaus(dueAt).toISOString());
    },
  );

  it('C-0002-16 dado o caso 5 de §6.8 (T-DASH-ACK-CRITICO, imediato) quando computeDue então due_at = started_at', async () => {
    const startedAt = manaus('2026-09-04T10:00:00');
    const due = await service().computeDue(
      FIXTURE_TENANT_TZ,
      FIXTURE_TENANT_ID,
      'T-DASH-ACK-CRITICO',
      {
        ownerKind: 'alert',
        ownerId: OWNER,
        code: 'T-DASH-ACK-CRITICO',
        startedAt,
      },
    );
    expect(due?.toISOString()).toBe(startedAt.toISOString());
  });

  it('C-0002-16 dado T-DASH-ACK-N3 iniciado no sábado 2026-09-05 (feriado AM + fim de semana) quando computeDue então as horas só contam a partir de terça 2026-09-08 00:00 → 02:00 Manaus', async () => {
    const due = await service().computeDue(
      FIXTURE_TENANT_TZ,
      FIXTURE_TENANT_ID,
      'T-DASH-ACK-N3',
      {
        ownerKind: 'alert',
        ownerId: OWNER,
        code: 'T-DASH-ACK-N3',
        startedAt: manaus('2026-09-05T15:00:00'),
      },
    );
    expect(due?.toISOString()).toBe(
      manaus('2026-09-08T02:00:00').toISOString(),
    );
  });

  it('C-0002-16 dado T-DASH-ACK-N1 iniciado em 2026-10-27 (ponto facultativo 28/10 NÃO é feriado — optional) quando computeDue então 28/10 conta como dia útil → 2026-10-28 10:00', async () => {
    const due = await service().computeDue(
      FIXTURE_TENANT_TZ,
      FIXTURE_TENANT_ID,
      'T-DASH-ACK-N1',
      {
        ownerKind: 'alert',
        ownerId: OWNER,
        code: 'T-DASH-ACK-N1',
        startedAt: manaus('2026-10-27T10:00:00'),
      },
    );
    expect(due?.toISOString()).toBe(
      manaus('2026-10-28T10:00:00').toISOString(),
    );
  });

  it.each([
    { code: 'T-DASH-MARCO-50', pct: 50 },
    { code: 'T-DASH-MARCO-75', pct: 75 },
    { code: 'T-DASH-MARCO-90', pct: 90 },
  ] as const)(
    'C-0002-16 dado $code (percentual) com windowEnd quando computeDue então started_at + $pct/100 × (windowEnd − started_at)',
    async ({ code, pct }) => {
      const startedAt = manaus('2026-09-01T00:00:00');
      const windowEnd = manaus('2026-09-11T00:00:00'); // 10 dias
      const due = await service().computeDue(
        FIXTURE_TENANT_TZ,
        FIXTURE_TENANT_ID,
        code,
        { ownerKind: 'alert', ownerId: OWNER, code, startedAt, windowEnd },
      );
      const expected = new Date(
        startedAt.getTime() +
          (pct / 100) * (windowEnd.getTime() - startedAt.getTime()),
      );
      expect(due?.toISOString()).toBe(expected.toISOString());
    },
  );

  it('C-0002-16 dado T-DASH-MARCO-75 sem windowEnd quando computeDue então null (nunca vence, §13.2)', async () => {
    const due = await service().computeDue(
      FIXTURE_TENANT_TZ,
      FIXTURE_TENANT_ID,
      'T-DASH-MARCO-75',
      {
        ownerKind: 'alert',
        ownerId: OWNER,
        code: 'T-DASH-MARCO-75',
        startedAt: manaus('2026-09-01T00:00:00'),
      },
    );
    expect(due).toBeNull();
  });

  it.each([
    { code: 'T-DASH-DUTY-201', deadlineOn: '2026-10-20' },
    { code: 'T-DASH-DUTY-PNATRANS', deadlineOn: '2026-04-30' },
    { code: 'T-DASH-DUTY-202', deadlineOn: '2026-09-30' },
    { code: 'T-DASH-DUTY-209', deadlineOn: '2026-10-31' },
    { code: 'T-DASH-DUTY-206', deadlineOn: '2026-12-31' },
    { code: 'T-DASH-DUTY-207', deadlineOn: '2026-12-31' },
  ] as const)(
    'C-0002-16 dado $code com deadlineOn $deadlineOn quando computeDue então fim do dia civil em Manaus (23:59:59.999)',
    async ({ code, deadlineOn }) => {
      const due = await service().computeDue(
        FIXTURE_TENANT_TZ,
        FIXTURE_TENANT_ID,
        code,
        {
          ownerKind: 'duty_cycle',
          ownerId: OWNER,
          code,
          startedAt: manaus('2026-01-01T00:00:00'),
          deadlineOn,
        },
      );
      expect(due?.toISOString()).toBe(endOfDayManaus(deadlineOn).toISOString());
    },
  );

  it('C-0002-16 dado T-DASH-DUTY-202 com deadlineOn 2026-05-31 (domingo) quando computeDue então NÃO é adiado a dia útil (§13.2, OD-D55)', async () => {
    const due = await service().computeDue(
      FIXTURE_TENANT_TZ,
      FIXTURE_TENANT_ID,
      'T-DASH-DUTY-202',
      {
        ownerKind: 'duty_cycle',
        ownerId: OWNER,
        code: 'T-DASH-DUTY-202',
        startedAt: manaus('2026-05-01T00:00:00'),
        deadlineOn: '2026-05-31',
      },
    );
    expect(due?.toISOString()).toBe(endOfDayManaus('2026-05-31').toISOString());
  });

  it('C-0002-16 dado T-DASH-PENDING-FLOOR (dias_corridos, 60) quando computeDue então started_at + 60 dias sem arredondar a dia útil', async () => {
    const startedAt = manaus('2026-09-04T10:00:00');
    const due = await service().computeDue(
      FIXTURE_TENANT_TZ,
      FIXTURE_TENANT_ID,
      'T-DASH-PENDING-FLOOR',
      {
        ownerKind: 'source',
        ownerId: OWNER,
        code: 'T-DASH-PENDING-FLOOR',
        startedAt,
      },
    );
    expect(due?.toISOString()).toBe(
      new Date(startedAt.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    );
  });
});
