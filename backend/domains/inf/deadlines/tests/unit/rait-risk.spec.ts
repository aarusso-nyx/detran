import { describe, expect, it } from 'vitest';
import * as deadlines from '../../src/index.js';

type ClockCode = 'A' | 'B' | 'C' | 'D';
type Flag =
  | 'SEM_RISCO'
  | 'ALERTA_N1'
  | 'ALERTA_N2'
  | 'ALERTA_N3'
  | 'CRITICO'
  | 'PRESCRITO_OPERACIONAL';
type RiskInput = {
  asOf: string;
  today: string;
  tenantTimezone: string;
  clocks: Array<
    | {
        clockCode: ClockCode;
        applicability: 'not_applicable';
        sourceRef: string;
        sourceVersions: string[];
      }
    | {
        clockCode: ClockCode;
        applicability: 'applicable';
        timerRef: string;
        startedOn: string;
        ceilingOn: string;
        steps: Array<{
          flag: Exclude<Flag, 'SEM_RISCO'>;
          reachedOn: string;
          parameterRef: string;
          sourceRef: string;
        }>;
        sourceVersions: string[];
      }
  >;
};
const api = deadlines as typeof deadlines & {
  evaluateRaitRisk(input: RiskInput): {
    asOf: string;
    today: string;
    clocks: unknown[];
    worstFlag: Flag | null;
    sourceVersions: string[];
  };
  RaitRiskSourceError: new (...args: never[]) => Error;
};
function input(today = '2026-09-15'): RiskInput {
  return {
    asOf: `${today}T12:00:00-04:00`,
    today,
    tenantTimezone: 'America/Manaus',
    clocks: [
      {
        clockCode: 'A',
        applicability: 'applicable',
        timerRef: 'qualified:timer:A:r1',
        startedOn: '2026-01-01',
        ceilingOn: '2026-09-20',
        steps: [
          ['ALERTA_N1', '2026-09-10'],
          ['ALERTA_N2', '2026-09-15'],
          ['CRITICO', '2026-09-18'],
          ['PRESCRITO_OPERACIONAL', '2026-09-20'],
        ].map(([flag, reachedOn]) => ({
          flag: flag as Exclude<Flag, 'SEM_RISCO'>,
          reachedOn: reachedOn!,
          parameterRef: 'fixture:activated:A:r1',
          sourceRef: 'fixture:qualified:A:r1',
        })),
        sourceVersions: ['opaque:A:r1'],
      },
      ...(['B', 'C', 'D'] as ClockCode[]).map((clockCode) => ({
        clockCode,
        applicability: 'not_applicable' as const,
        sourceRef: `fixture:applicability:${clockCode}:r1`,
        sourceVersions: [`opaque:${clockCode}:r1`],
      })),
    ],
  };
}

describe('S2 public pure current risk (interface-pending until runtime export exists)', () => {
  it('exports the canonical additive API without replacing the existing engine', () => {
    expect(api.evaluateRaitRisk).toBeTypeOf('function');
    expect(api.RaitRiskSourceError).toBeTypeOf('function');
    expect(deadlines.createDeadlineEngine).toBeTypeOf('function');
  });
  for (const [today, flag] of [
    ['2026-09-09', 'SEM_RISCO'],
    ['2026-09-10', 'ALERTA_N1'],
    ['2026-09-14', 'ALERTA_N1'],
    ['2026-09-15', 'ALERTA_N2'],
    ['2026-09-18', 'CRITICO'],
    ['2026-09-20', 'PRESCRITO_OPERACIONAL'],
    ['2026-09-21', 'PRESCRITO_OPERACIONAL'],
  ] as const) {
    it(`uses reached civil boundary ${today} as ${flag}`, () => {
      const source = input(today),
        before = structuredClone(source);
      const result = api.evaluateRaitRisk(source);
      expect(result).toMatchObject({
        asOf: source.asOf,
        today,
        worstFlag: flag,
      });
      expect(result.clocks).toEqual([
        {
          clockCode: 'A',
          applicability: 'applicable',
          flag,
          ceilingOn: '2026-09-20',
        },
        ...(['B', 'C', 'D'] as const).map((clockCode) => ({
          clockCode,
          applicability: 'not_applicable',
        })),
      ]);
      expect(new Set(result.sourceVersions)).toEqual(
        new Set(source.clocks.flatMap((c) => c.sourceVersions)),
      );
      expect(source).toEqual(before);
      expect(result).not.toHaveProperty('sourceRef');
    });
  }
  it('returns explicit null for four qualified NA clocks, never assessed low risk', () => {
    const source = input();
    source.clocks = source.clocks.map((c) => ({
      clockCode: c.clockCode,
      applicability: 'not_applicable',
      sourceRef: `qualified:${c.clockCode}`,
      sourceVersions: [`opaque:${c.clockCode}`],
    }));
    expect(api.evaluateRaitRisk(source).worstFlag).toBeNull();
  });
  it('worst applicable clock outranks array order and does not invent D N3', () => {
    const source = input();
    source.clocks[3] = {
      clockCode: 'D',
      applicability: 'applicable',
      timerRef: 'qualified:D',
      startedOn: '2020-01-01',
      ceilingOn: '2026-09-19',
      steps: [
        {
          flag: 'ALERTA_N1',
          reachedOn: '2025-01-01',
          parameterRef: 'activated:D',
          sourceRef: 'qualified:D',
        },
        {
          flag: 'ALERTA_N2',
          reachedOn: '2026-01-01',
          parameterRef: 'activated:D',
          sourceRef: 'qualified:D',
        },
        {
          flag: 'CRITICO',
          reachedOn: '2026-09-15',
          parameterRef: 'activated:D',
          sourceRef: 'qualified:D',
        },
        {
          flag: 'PRESCRITO_OPERACIONAL',
          reachedOn: '2026-09-19',
          parameterRef: 'activated:D',
          sourceRef: 'qualified:D',
        },
      ],
      sourceVersions: ['opaque:D'],
    };
    expect(api.evaluateRaitRisk(source).worstFlag).toBe('CRITICO');
    source.clocks.reverse();
    expect(api.evaluateRaitRisk(source).worstFlag).toBe('CRITICO');
  });
  const invalid: Array<[string, (v: RiskInput) => void]> = [
    [
      'missing clock',
      (v) => {
        v.clocks.pop();
      },
    ],
    [
      'duplicate clock',
      (v) => {
        v.clocks[3] = structuredClone(v.clocks[2]!);
      },
    ],
    [
      'invalid date',
      (v) => {
        v.today = '2026-02-30';
      },
    ],
    [
      'invalid instant',
      (v) => {
        v.asOf = 'not-an-instant';
      },
    ],
    [
      'invalid timezone',
      (v) => {
        v.tenantTimezone = 'Not/A_Zone';
      },
    ],
    [
      'operation day mismatch',
      (v) => {
        v.today = '2026-09-16';
      },
    ],
    [
      'missing source versions',
      (v) => {
        v.clocks[0]!.sourceVersions = [];
      },
    ],
    [
      'missing NA provenance',
      (v) => {
        const c = v.clocks[1]!;
        if (c.applicability === 'not_applicable') c.sourceRef = '';
      },
    ],
    [
      'missing timer',
      (v) => {
        const c = v.clocks[0]!;
        if (c.applicability === 'applicable') c.timerRef = '';
      },
    ],
    [
      'missing step provenance',
      (v) => {
        const c = v.clocks[0]!;
        if (c.applicability === 'applicable') c.steps[0]!.sourceRef = '';
      },
    ],
    [
      'missing parameter',
      (v) => {
        const c = v.clocks[0]!;
        if (c.applicability === 'applicable') c.steps[0]!.parameterRef = '';
      },
    ],
    [
      'duplicate flag',
      (v) => {
        const c = v.clocks[0]!;
        if (c.applicability === 'applicable')
          c.steps[1]!.flag = c.steps[0]!.flag;
      },
    ],
    [
      'reversed dates',
      (v) => {
        const c = v.clocks[0]!;
        if (c.applicability === 'applicable') c.steps.reverse();
      },
    ],
    [
      'wrong ceiling stage',
      (v) => {
        const c = v.clocks[0]!;
        if (c.applicability === 'applicable') c.ceilingOn = '2026-09-19';
      },
    ],
    [
      'start after ceiling',
      (v) => {
        const c = v.clocks[0]!;
        if (c.applicability === 'applicable') c.startedOn = '2026-09-21';
      },
    ],
  ];
  for (const [label, mutate] of invalid)
    it(`rejects ${label} with typed source error`, () => {
      const v = input();
      mutate(v);
      expect(api.evaluateRaitRisk).toBeTypeOf('function');
      expect(api.RaitRiskSourceError).toBeTypeOf('function');
      expect(() => api.evaluateRaitRisk(v)).toThrow(api.RaitRiskSourceError);
    });
  it('uses tenant civil day across UTC midnight from the supplied operation instant', () => {
    const v = input('2026-09-14');
    v.asOf = '2026-09-15T02:00:00Z';
    expect(api.evaluateRaitRisk(v)).toMatchObject({
      today: '2026-09-14',
      worstFlag: 'ALERTA_N1',
    });
  });
});

// Dates are independently resolved fixture inputs, not a second elapsed-age engine.
for (const [track, clockCode, flags] of [
  ['A180', 'A', ['ALERTA_N1', 'ALERTA_N2', 'CRITICO', 'PRESCRITO_OPERACIONAL']],
  ['A360', 'A', ['ALERTA_N1', 'ALERTA_N2', 'CRITICO', 'PRESCRITO_OPERACIONAL']],
  [
    'B24',
    'B',
    ['ALERTA_N1', 'ALERTA_N2', 'ALERTA_N3', 'CRITICO', 'PRESCRITO_OPERACIONAL'],
  ],
  ['C36', 'C', ['ALERTA_N2', 'ALERTA_N3', 'CRITICO', 'PRESCRITO_OPERACIONAL']],
  ['D60', 'D', ['ALERTA_N1', 'ALERTA_N2', 'CRITICO', 'PRESCRITO_OPERACIONAL']],
] as const) {
  for (let stage = 0; stage < flags.length; stage++) {
    for (const delta of [-1, 0, 1]) {
      it(`qualified ${track} stage ${flags[stage]} boundary ${delta} uses resolved dates`, () => {
        const reachedOn = `2026-09-${String(5 + stage * 4).padStart(2, '0')}`;
        const today = deadlines.addCalendarDays(reachedOn, delta);
        const value = input(today);
        value.clocks = (['A', 'B', 'C', 'D'] as ClockCode[]).map((code) =>
          code !== clockCode
            ? {
                clockCode: code,
                applicability: 'not_applicable',
                sourceRef: `fixture:NA:${code}`,
                sourceVersions: [`opaque:NA:${code}`],
              }
            : {
                clockCode: code,
                applicability: 'applicable',
                timerRef: `qualified:${track}`,
                startedOn: '2020-01-01',
                ceilingOn: `2026-09-${String(5 + (flags.length - 1) * 4).padStart(2, '0')}`,
                steps: flags.map((flag, index) => ({
                  flag,
                  reachedOn: `2026-09-${String(5 + index * 4).padStart(2, '0')}`,
                  parameterRef: `activated:${track}`,
                  sourceRef: `qualified:${track}`,
                })),
                sourceVersions: [`opaque:${track}:v1`],
              },
        );
        const expected =
          delta < 0 ? (flags[stage - 1] ?? 'SEM_RISCO') : flags[stage];
        expect(api.evaluateRaitRisk(value).worstFlag).toBe(expected);
      });
    }
  }
}
