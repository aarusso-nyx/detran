// Projeção pura do suplemento CTG-0001 §5 / ADR-0049. As datas dos
// degraus são resolvidas pelos donos de prazo antes desta avaliação.
import type { LocalDate } from './types.js';

export type RaitRiskFlag =
  | 'SEM_RISCO'
  | 'ALERTA_N1'
  | 'ALERTA_N2'
  | 'ALERTA_N3'
  | 'CRITICO'
  | 'PRESCRITO_OPERACIONAL';
export type RaitRiskClockCode = 'A' | 'B' | 'C' | 'D';
export interface RaitRiskStep {
  flag: Exclude<RaitRiskFlag, 'SEM_RISCO'>;
  reachedOn: LocalDate;
  parameterRef: string;
  sourceRef: string;
}
export type RaitRiskClockInput =
  | {
      clockCode: RaitRiskClockCode;
      applicability: 'not_applicable';
      sourceRef: string;
      sourceVersions: readonly string[];
    }
  | {
      clockCode: RaitRiskClockCode;
      applicability: 'applicable';
      timerRef: string;
      startedOn: LocalDate;
      ceilingOn: LocalDate;
      steps: readonly RaitRiskStep[];
      sourceVersions: readonly string[];
    };
export interface RaitRiskInput {
  asOf: string;
  today: LocalDate;
  tenantTimezone: string;
  clocks: readonly RaitRiskClockInput[];
}
export interface RaitRiskSnapshot {
  asOf: string;
  today: LocalDate;
  clocks: readonly (
    | {
        clockCode: RaitRiskClockCode;
        applicability: 'applicable';
        flag: RaitRiskFlag;
        ceilingOn: LocalDate;
      }
    | { clockCode: RaitRiskClockCode; applicability: 'not_applicable' }
  )[];
  worstFlag: RaitRiskFlag | null;
  sourceVersions: readonly string[];
}
export class RaitRiskSourceError extends Error {
  readonly code = 'RAIT_RISK_SOURCE_INVALID' as const;
  constructor() {
    super('Fonte de risco RAIT inválida ou inconsistente.');
    this.name = 'RaitRiskSourceError';
  }
}

const SEVERITY: readonly RaitRiskFlag[] = [
  'SEM_RISCO',
  'ALERTA_N1',
  'ALERTA_N2',
  'ALERTA_N3',
  'CRITICO',
  'PRESCRITO_OPERACIONAL',
];
const STAGES: Record<RaitRiskClockCode, readonly RaitRiskStep['flag'][]> = {
  A: ['ALERTA_N1', 'ALERTA_N2', 'CRITICO', 'PRESCRITO_OPERACIONAL'],
  B: [
    'ALERTA_N1',
    'ALERTA_N2',
    'ALERTA_N3',
    'CRITICO',
    'PRESCRITO_OPERACIONAL',
  ],
  C: ['ALERTA_N2', 'ALERTA_N3', 'CRITICO', 'PRESCRITO_OPERACIONAL'],
  D: ['ALERTA_N1', 'ALERTA_N2', 'CRITICO', 'PRESCRITO_OPERACIONAL'],
};
function requireSource(valid: unknown): asserts valid {
  if (!valid) throw new RaitRiskSourceError();
}
function reference(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}
function validDate(value: unknown): value is LocalDate {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;
  const date = new Date(`${value}T00:00:00Z`);
  return (
    Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}
function operationDay(input: RaitRiskInput): void {
  requireSource(validDate(input.today));
  requireSource(typeof input.asOf === 'string');
  const instant =
    /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(Z|[+-]\d{2}:\d{2})$/.exec(
      input.asOf,
    );
  requireSource(instant && validDate(instant[1]));
  requireSource(
    Number(instant[2]) < 24 &&
      Number(instant[3]) < 60 &&
      Number(instant[4]) < 60,
  );
  const offset = instant[5]!;
  requireSource(
    offset === 'Z' ||
      (Number(offset.slice(1, 3)) < 24 && Number(offset.slice(4)) < 60),
  );
  const date = new Date(input.asOf);
  requireSource(
    Number.isFinite(date.getTime()) && reference(input.tenantTimezone),
  );
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: input.tenantTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(date);
    const part = (type: Intl.DateTimeFormatPartTypes) =>
      parts.find((item) => item.type === type)?.value;
    requireSource(
      `${part('year')}-${part('month')}-${part('day')}` === input.today,
    );
  } catch {
    throw new RaitRiskSourceError();
  }
}

export function evaluateRaitRisk(input: RaitRiskInput): RaitRiskSnapshot {
  requireSource(input && typeof input === 'object');
  operationDay(input);
  requireSource(Array.isArray(input.clocks) && input.clocks.length === 4);
  const seen = new Set<RaitRiskClockCode>();
  const sourceVersions = new Set<string>();
  let worstFlag: RaitRiskFlag | null = null;
  const clocks: RaitRiskSnapshot['clocks'][number][] = [];
  for (const clock of input.clocks as readonly RaitRiskClockInput[]) {
    requireSource(clock && typeof clock === 'object');
    requireSource(
      Object.hasOwn(STAGES, clock.clockCode) && !seen.has(clock.clockCode),
    );
    seen.add(clock.clockCode);
    requireSource(
      Array.isArray(clock.sourceVersions) && clock.sourceVersions.length > 0,
    );
    for (const version of clock.sourceVersions) {
      // Iteration visits holes as undefined; Array.every would skip them.
      requireSource(reference(version));
      sourceVersions.add(version);
    }
    if (clock.applicability === 'not_applicable') {
      requireSource(reference(clock.sourceRef));
      clocks.push({
        clockCode: clock.clockCode,
        applicability: 'not_applicable',
      });
      continue;
    }
    requireSource(clock.applicability === 'applicable');
    requireSource(
      reference(clock.timerRef) &&
        validDate(clock.startedOn) &&
        validDate(clock.ceilingOn) &&
        clock.startedOn < clock.ceilingOn,
    );
    const stages = STAGES[clock.clockCode];
    requireSource(
      Array.isArray(clock.steps) && clock.steps.length === stages.length,
    );
    let previous = clock.startedOn;
    let flag: RaitRiskFlag = 'SEM_RISCO';
    for (const [index, step] of clock.steps.entries()) {
      requireSource(step && typeof step === 'object');
      requireSource(
        step.flag === stages[index] &&
          validDate(step.reachedOn) &&
          step.reachedOn > previous &&
          step.reachedOn <= clock.ceilingOn &&
          reference(step.parameterRef) &&
          reference(step.sourceRef),
      );
      if (step.flag === 'PRESCRITO_OPERACIONAL')
        requireSource(step.reachedOn === clock.ceilingOn);
      if (step.reachedOn <= input.today) flag = step.flag;
      previous = step.reachedOn;
    }
    clocks.push({
      clockCode: clock.clockCode,
      applicability: 'applicable',
      flag,
      ceilingOn: clock.ceilingOn,
    });
    if (
      worstFlag === null ||
      SEVERITY.indexOf(flag) > SEVERITY.indexOf(worstFlag)
    )
      worstFlag = flag;
  }
  return {
    asOf: input.asOf,
    today: input.today,
    clocks,
    worstFlag,
    sourceVersions: [...sourceVersions].sort(),
  };
}
