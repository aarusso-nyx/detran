// R-0012 TASK-0011 (Inspector). `forms/escala.schema.ts` (contrato CTG-0002c §4.11) — ainda não
// existe (TASK-0012): a importação falha com "Cannot find module" (estado esperado, contrato
// §1). Critérios C-2C-56…59 (§8). Ids canônicos de `rait-fixtures.json` (`kb.ts`); os dias úteis
// vêm do servidor (`context.businessDays`) — o cliente nunca calcula calendário ([RN-RAIT-005]).
import { readFileSync } from 'node:fs';
import type { z } from 'zod';
import { ESCALA_GATE, ESCALA_MASKS, EscalaSchema } from './escala.schema';
import { FIXTURES_PATH } from '../../testing/kb';
import { GATES_FIXTURE } from '../../testing/gates.fixture';
import { POOL_IDS } from '../../testing/http-fixtures';

interface PoolMemberFixture {
  readonly id: string;
  readonly pool: string;
}
const poolMembers = (
  JSON.parse(readFileSync(FIXTURES_PATH, 'utf8')) as {
    poolMembers: readonly PoolMemberFixture[];
  }
).poolMembers.filter((member) => member.pool === POOL_IDS.defesa_previa);
const [MEMBER_1, MEMBER_2] = poolMembers.map((member) => member.id);

/** Período e dias úteis literais do §8 C-2C-56 (semana de 21 a 25/09/2026). */
const PERIOD_START = '2026-09-21';
const PERIOD_END = '2026-09-25';
const BUSINESS_DAYS = [
  '2026-09-21',
  '2026-09-22',
  '2026-09-23',
  '2026-09-24',
  '2026-09-25',
];

const VALID_BODY = {
  poolId: POOL_IDS.defesa_previa,
  kind: 'escala_semanal',
  periodStart: PERIOD_START,
  periodEnd: PERIOD_END,
  entries: [
    {
      memberId: MEMBER_1,
      wipLimit: null,
      slots: BUSINESS_DAYS.map((slotOn) => ({
        slotOn,
        availability: 'EM_PLANTAO',
        absenceReason: null,
      })),
    },
  ],
  context: { businessDays: BUSINESS_DAYS, periodLocked: false },
};

function issues(result: z.ZodSafeParseResult<unknown>): {
  path: PropertyKey[];
  message: string;
}[] {
  expect(result.success).toBe(false);
  if (result.success) throw new Error('unreachable');
  return result.error.issues.map((issue) => ({
    path: [...issue.path],
    message: issue.message,
  }));
}

describe('EscalaSchema', () => {
  it('dado o corpo canônico (5 dias úteis com plantonista) quando safeParse então success; entries [] então falha; kind "x" então falha (enum)', () => {
    // C-2C-56
    expect(EscalaSchema.safeParse(VALID_BODY).success).toBe(true);

    const noEntries = EscalaSchema.safeParse({ ...VALID_BODY, entries: [] });
    expect(issues(noEntries)).toContainEqual(
      expect.objectContaining({ path: ['entries'] }),
    );

    const badKind = EscalaSchema.safeParse({ ...VALID_BODY, kind: 'x' });
    expect(issues(badKind)[0].path).toEqual(['kind']);
  });

  it('dado R1 businessDays com 2026-09-23 sem slot EM_PLANTAO nesse dia então falha em [] entries.duty_missing; businessDays null então success', () => {
    // C-2C-57
    const missingDuty = EscalaSchema.safeParse({
      ...VALID_BODY,
      entries: [
        {
          ...VALID_BODY.entries[0],
          slots: BUSINESS_DAYS.filter((day) => day !== '2026-09-23').map(
            (slotOn) => ({
              slotOn,
              availability: 'EM_PLANTAO',
              absenceReason: null,
            }),
          ),
        },
      ],
    });
    expect(issues(missingDuty).map((issue) => issue.message)).toContain(
      'rait.forms.escala.entries.duty_missing',
    );
    expect(
      issues(missingDuty).filter(
        (issue) => issue.message === 'rait.forms.escala.entries.duty_missing',
      )[0].path,
    ).toEqual([]);

    const noCalendar = EscalaSchema.safeParse({
      ...VALID_BODY,
      entries: [
        {
          ...VALID_BODY.entries[0],
          slots: BUSINESS_DAYS.filter((day) => day !== '2026-09-23').map(
            (slotOn) => ({
              slotOn,
              availability: 'EM_PLANTAO',
              absenceReason: null,
            }),
          ),
        },
      ],
      context: { businessDays: null, periodLocked: false },
    });
    expect(noCalendar.success).toBe(true);
  });

  it('dado R2 memberId repetido então entries.duplicate; R3 slot AUSENTE_PROGRAMADO sem absenceReason então falha em [entries, 0, slots, 0, absenceReason] absenceReason.required; DISPONIVEL com absenceReason ferias então falha', () => {
    // C-2C-58
    const duplicate = EscalaSchema.safeParse({
      ...VALID_BODY,
      entries: [
        VALID_BODY.entries[0],
        { ...VALID_BODY.entries[0], memberId: MEMBER_1 },
      ],
    });
    expect(issues(duplicate).map((issue) => issue.message)).toContain(
      'rait.forms.escala.entries.duplicate',
    );

    const absenceWithoutReason = EscalaSchema.safeParse({
      ...VALID_BODY,
      entries: [
        {
          memberId: MEMBER_2,
          wipLimit: null,
          slots: [
            {
              slotOn: PERIOD_START,
              availability: 'AUSENTE_PROGRAMADO',
              absenceReason: null,
            },
          ],
        },
      ],
      context: { businessDays: null, periodLocked: false },
    });
    expect(issues(absenceWithoutReason)).toContainEqual({
      path: ['entries', 0, 'slots', 0, 'absenceReason'],
      message: 'rait.forms.escala.slots.absenceReason.required',
    });

    const reasonWithoutAbsence = EscalaSchema.safeParse({
      ...VALID_BODY,
      entries: [
        {
          memberId: MEMBER_2,
          wipLimit: null,
          slots: [
            {
              slotOn: PERIOD_START,
              availability: 'DISPONIVEL',
              absenceReason: 'ferias',
            },
          ],
        },
      ],
      context: { businessDays: null, periodLocked: false },
    });
    expect(reasonWithoutAbsence.success).toBe(false);
  });

  it('dado R4 periodLocked true então falha em [periodStart] periodStart.locked; R5 periodEnd < periodStart então [periodEnd] period_invalid; R6 slotOn 2026-10-01 então slots.slotOn.outside_period; ESCALA_GATE e ESCALA_MASKS conforme §4.11', () => {
    // C-2C-59
    const locked = EscalaSchema.safeParse({
      ...VALID_BODY,
      context: { businessDays: BUSINESS_DAYS, periodLocked: true },
    });
    expect(issues(locked)).toContainEqual({
      path: ['periodStart'],
      message: 'rait.forms.escala.periodStart.locked',
    });

    const invalidPeriod = EscalaSchema.safeParse({
      ...VALID_BODY,
      periodStart: PERIOD_END,
      periodEnd: PERIOD_START,
      context: { businessDays: null, periodLocked: false },
    });
    expect(issues(invalidPeriod)).toContainEqual({
      path: ['periodEnd'],
      message: 'rait.forms.common.period_invalid',
    });

    const outside = EscalaSchema.safeParse({
      ...VALID_BODY,
      entries: [
        {
          memberId: MEMBER_1,
          wipLimit: null,
          slots: [
            {
              slotOn: '2026-10-01',
              availability: 'EM_PLANTAO',
              absenceReason: null,
            },
          ],
        },
      ],
      context: { businessDays: null, periodLocked: false },
    });
    expect(issues(outside)).toContainEqual({
      path: ['entries', 0, 'slots', 0, 'slotOn'],
      message: 'rait.forms.escala.slots.slotOn.outside_period',
    });

    expect(ESCALA_GATE).toEqual(GATES_FIXTURE['ESCALA_GATE']);
    expect(ESCALA_MASKS).toEqual({
      periodStart: 'date',
      periodEnd: 'date',
      'entries.slots.slotOn': 'date',
    });
  });
});
