// CTG-0002 §15.1 C-0002-24 e C-0002-25 [unit] — funções puras de
// `DashboardDutyService` (§14.1): `deadlineOnFor(duty, period)` com os
// exemplos de 2026 de §7.1 e `validatePeriod(duty, period)` →
// `DASH.DUTY_PERIOD_INVALID` (`context.periodicity` = `deadline_kind`).
// As linhas de dever são as de `80-fixtures-dashboard-catalog.sql` (colunas
// `code`, `deadline_kind`, `deadline_rule`, `periodicity`, `indicator_code`,
// `owner_role`), transcritas nos campos que §7.1 consome.
import { describe, expect, it } from 'vitest';

import {
  DashboardClockService,
  DashboardDutyService,
} from '../../src/handwritten/cycle/index.js';
import { FIXTURE_TENANT_ID, SEED_DUTIES } from '../fixtures/cycle-fixtures.js';
import {
  calendar2026,
  expectDashError,
  fixedClock,
} from '../support/cycle-harness.js';

type DutyCode = keyof typeof SEED_DUTIES;

/** Colunas de `dashboard.duty` (seed 80) que §7.1 consome. */
function duty(
  code: DutyCode,
  deadlineKind:
    | 'fixed_day'
    | 'monthly'
    | 'annual_date'
    | 'continuous'
    | 'per_event'
    | 'undefined'
    | 'historical',
  deadlineRule: string | null,
  indicatorCode: string | null,
) {
  return {
    id: SEED_DUTIES[code],
    tenant_id: FIXTURE_TENANT_ID,
    code,
    deadline_kind: deadlineKind,
    deadline_rule: deadlineRule,
    periodicity: deadlineRule ?? '',
    indicator_code: indicatorCode,
    owner_role: 'dash-duty-owner',
    scope:
      code === 'DUTY-04' || code === 'DUTY-PNATRANS' ? 'federal' : 'estadual',
  };
}

const DUTY_01 = duty(
  'DUTY-01',
  'fixed_day',
  'dia 20 do mês subsequente ([WF-DASH-002] §Prazos)',
  'IND-DASH-201',
);
const DUTY_02 = duty(
  'DUTY-02',
  'monthly',
  'último dia do mês (dashboard.duty.IND-202.deadline, proposta OD-D10)',
  'IND-DASH-202',
);
const DUTY_04 = duty('DUTY-04', 'monthly', null, 'IND-DASH-203');
const DUTY_05 = duty('DUTY-05', 'undefined', null, 'IND-DASH-204');
const DUTY_07 = duty(
  'DUTY-07',
  'annual_date',
  '31/12 + preparação jan–fev (dashboard.duty.annual_deadline, DT-030)',
  'IND-DASH-206',
);
const DUTY_08 = duty(
  'DUTY-08',
  'per_event',
  '30 dias + 30 de prorrogação justificada ([RN-DASH-120])',
  'IND-DASH-301',
);
const DUTY_10 = duty(
  'DUTY-10',
  'annual_date',
  '31/12 + preparação jan–fev (dashboard.duty.annual_deadline, DT-030)',
  'IND-DASH-207',
);
const DUTY_PNATRANS = duty(
  'DUTY-PNATRANS',
  'annual_date',
  'até 30 de abril (CTB art. 326-A §12; divulgação federal, insumo estadual)',
  null,
);
const DUTY_03 = duty('DUTY-03', 'continuous', null, null);
const DUTY_12 = duty('DUTY-12', 'historical', null, null);

function service(): DashboardDutyService {
  // §14.1: `DashboardDutyService(clock: DashboardClockService, alerts)`;
  // `alerts` não é tocado pelas funções puras — fake vazio.
  return new DashboardDutyService(
    new DashboardClockService(fixedClock('2026-09-21'), calendar2026()),
    {} as never,
  );
}

describe('C-0002-24 — deadlineOnFor com os exemplos de §7.1 (2026)', () => {
  it.each([
    { duty: DUTY_01, period: '2026-09', expected: '2026-10-20' },
    { duty: DUTY_02, period: '2026-09', expected: '2026-09-30' },
    { duty: DUTY_02, period: '2026-10', expected: '2026-10-31' },
    { duty: DUTY_02, period: '2026-02', expected: '2026-02-28' },
    { duty: DUTY_07, period: '2025', expected: '2026-12-31' },
    { duty: DUTY_10, period: '2026', expected: '2026-12-31' },
    { duty: DUTY_PNATRANS, period: '2026', expected: '2026-04-30' },
    { duty: DUTY_04, period: '2026-09', expected: null },
    { duty: DUTY_05, period: '2026', expected: null },
    { duty: DUTY_03, period: '2026', expected: null },
    { duty: DUTY_12, period: '2026', expected: null },
    { duty: DUTY_08, period: '2026-09-21', expected: null },
  ])(
    'C-0002-24 dado $duty.code ($duty.deadline_kind) com period $period quando deadlineOnFor então $expected',
    ({ duty: row, period, expected }) => {
      expect(service().deadlineOnFor(row as never, period)).toBe(expected);
    },
  );

  it('C-0002-24 dado DUTY-01 2026-12 quando deadlineOnFor então vira o ano: 2027-01-20', () => {
    expect(service().deadlineOnFor(DUTY_01 as never, '2026-12')).toBe(
      '2027-01-20',
    );
  });
});

describe('C-0002-25 — validatePeriod → DASH.DUTY_PERIOD_INVALID (§7.1)', () => {
  it.each([
    { duty: DUTY_01, period: '2026' },
    { duty: DUTY_07, period: '2026-09' },
    { duty: DUTY_02, period: '2026' },
    { duty: DUTY_10, period: '2026-09-21' },
    { duty: DUTY_01, period: '2026-09-21' },
    { duty: DUTY_08, period: '2026-09' },
    { duty: DUTY_05, period: '2026-09' },
  ])(
    'C-0002-25 dado $duty.code ($duty.deadline_kind) com period $period quando validatePeriod então 400 DASH.DUTY_PERIOD_INVALID com periodicity = deadline_kind',
    async ({ duty: row, period }) => {
      const context = await expectDashError(
        Promise.resolve().then(() =>
          service().validatePeriod(row as never, period),
        ),
        'DASH.DUTY_PERIOD_INVALID',
        400,
      );
      expect(context.periodicity).toBe(row.deadline_kind);
    },
  );

  it.each([
    { duty: DUTY_08, period: '2026-09-21' },
    { duty: DUTY_01, period: '2026-09' },
    { duty: DUTY_02, period: '2026-10' },
    { duty: DUTY_07, period: '2025' },
    { duty: DUTY_10, period: '2026' },
    { duty: DUTY_PNATRANS, period: '2026' },
    { duty: DUTY_05, period: '2026' },
    { duty: DUTY_04, period: '2026-09' },
  ])(
    'C-0002-25 dado $duty.code ($duty.deadline_kind) com period $period quando validatePeriod então válido (não lança)',
    ({ duty: row, period }) => {
      expect(() =>
        service().validatePeriod(row as never, period),
      ).not.toThrow();
    },
  );
});
