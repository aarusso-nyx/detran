// CTG-0004 §2 e §14 item 3 (R-0008, TASK-0008, OD-T38) — `computeMeasureDue`,
// função local que calcula os prazos de medida (`T-REG30`, `T-REG15`,
// `T-DEPOSITO6M`) sem passar por `DeadlineEngine.computeDue` de
// `@detran/inf-deadlines`: aquele pacote não cobre `owner='medida'`
// (`TimerCode`/`TimerOwnerKind` não têm os seis códigos, CTG-0004 §14 item 3).
// A opção fixada pelo Architect é uma função local que delega ao `Calendar`
// (arredondamento para o próximo dia útil) e reaproveita as funções puras de
// `@detran/inf-deadlines` (`addCalendarDays`/`addCalendarMonths`, exportadas
// publicamente) — nunca duplicando a regra de contagem.
//
// Assinatura esperada (proposta do Inspector, TASK-0008; o Engineer segue-a
// em TASK-0009 — mesmo precedente de CTG-0002 §13.3):
//
//   export type MeasureTimerCode = 'T-REG30' | 'T-REG15' | 'T-DEPOSITO6M';
//   export interface MeasureTimerDefinition {
//     durationValue: number;
//     durationUnit: 'dias_corridos' | 'meses';
//   }
//   export function computeMeasureDue(
//     code: MeasureTimerCode,
//     startOn: string, // data civil YYYY-MM-DD
//     calendar: Calendar, // de @detran/inf-deadlines
//     tenantId: string,
//     catalog: Record<MeasureTimerCode, MeasureTimerDefinition>,
//   ): Promise<{ rawDueOn: string; dueOn: string }>
//
// `catalog` existe porque, em produção, a duração/unidade vêm de
// `inf.infraction_timer_ref` (DDL 14: T-REG30=30 dias_corridos,
// T-REG15=15 dias_corridos, T-DEPOSITO6M=6 meses — valores lidos direto da
// DDL, nunca inventados); em unit não há banco (rait-test-strategy.md §1), e
// o catálogo é passado explicitamente. `dueOn = próximo dia útil >=
// rawDueOn` é a mesma regra de `DeadlineEngine.roundForward`
// (backend/domains/inf/deadlines/src/engine.ts) — já testada em R-0006; este
// arquivo prova só o valor final para os três códigos de medida (nota do
// maestro, TASK-0008).
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const TENANT_ID = '00000000-0000-7000-8000-00000000a001';

interface CalendarJson {
  national?: Record<string, string>;
  optional?: Record<string, string>;
  am?: Record<string, string>;
  manaus?: Record<string, string>;
}

const calendar2026 = JSON.parse(
  readFileSync(
    fileURLToPath(
      new URL(
        '../../../../../../docs/framework/arch/fixtures/calendar-2026.json',
        import.meta.url,
      ),
    ),
    'utf8',
  ),
) as CalendarJson;

/**
 * Réplica mínima, só para este teste, do contrato público `Calendar` de
 * `@detran/inf-deadlines` (backend/domains/inf/deadlines/src/calendar.ts,
 * classe `InMemoryCalendar`) — `inf-measures` ainda não declara
 * `@detran/inf-deadlines` como dependência de workspace (isso é trabalho do
 * Engineer em TASK-0009, CTG-0004 §12: "dependencies + '@detran/inf-deadlines'");
 * um import de pacote inexistente derrubaria o arquivo inteiro (nenhum teste
 * coletado) antes mesmo do `computeMeasureDue` ausente ser exercitado. Um
 * import relativo profundo para dentro de `inf/deadlines/src` violaria
 * ADR-0001 ("no deep relative imports" entre módulos de domínio). Feriado =
 * chave de `national`, `am` ou `manaus` da mesma fixture usada por
 * `inf/deadlines/tests/unit/deadline-engine.spec.ts` (R-0006); `optional`
 * (ponto facultativo) não é feriado — mesma regra.
 */
function calendarFrom(json: CalendarJson) {
  const holidays = new Set<string>([
    ...Object.keys(json.national ?? {}),
    ...Object.keys(json.am ?? {}),
    ...Object.keys(json.manaus ?? {}),
  ]);
  function isWeekend(date: string): boolean {
    const day = new Date(`${date}T00:00:00Z`).getUTCDay();
    return day === 0 || day === 6;
  }
  function addDays(date: string, days: number): string {
    const ms = new Date(`${date}T00:00:00Z`).getTime() + days * 86_400_000;
    return new Date(ms).toISOString().slice(0, 10);
  }
  return {
    async isBusinessDay(d: string): Promise<boolean> {
      return !isWeekend(d) && !holidays.has(d);
    },
    async nextBusinessDay(d: string): Promise<string> {
      let candidate = addDays(d, 1);
      while (!(await this.isBusinessDay(candidate))) {
        candidate = addDays(candidate, 1);
      }
      return candidate;
    },
  };
}

/** DDL 14 (inf.infraction_timer_ref), owner='medida': valores canônicos. */
const MEASURE_TIMER_CATALOG = {
  'T-REG30': { durationValue: 30, durationUnit: 'dias_corridos' },
  'T-REG15': { durationValue: 15, durationUnit: 'dias_corridos' },
  'T-DEPOSITO6M': { durationValue: 6, durationUnit: 'meses' },
} as const;

const importModule = (specifier: string): Promise<unknown> =>
  import(/* @vite-ignore */ specifier);

async function computeMeasureDue(
  code: keyof typeof MEASURE_TIMER_CATALOG,
  startOn: string,
): Promise<{ rawDueOn: string; dueOn: string }> {
  let loaded: Record<string, unknown>;
  try {
    loaded = (await importModule('./deadlines.js')) as Record<string, unknown>;
  } catch (cause) {
    throw new Error(
      'inf/measures/src/handwritten/deadlines.ts ainda não existe (TASK-0009, CTG-0004 §14 item 3)',
      { cause },
    );
  }
  const fn = loaded.computeMeasureDue;
  if (typeof fn !== 'function') {
    throw new Error(
      'deadlines.ts não exporta computeMeasureDue (CTG-0004 §14 item 3)',
    );
  }
  return (
    fn as (
      code: string,
      startOn: string,
      calendar: ReturnType<typeof calendarFrom>,
      tenantId: string,
      catalog: typeof MEASURE_TIMER_CATALOG,
    ) => Promise<{ rawDueOn: string; dueOn: string }>
  )(
    code,
    startOn,
    calendarFrom(calendar2026),
    TENANT_ID,
    MEASURE_TIMER_CATALOG,
  );
}

describe('CTG-0004 §2 — computeMeasureDue: T-REG30, T-REG15, T-DEPOSITO6M (OD-T38)', () => {
  it('dado T-REG30 a partir de 2026-09-14 (segunda) então dueOn = 2026-10-14 (quarta, dia útil, sem prorrogação)', async () => {
    await expect(computeMeasureDue('T-REG30', '2026-09-14')).resolves.toEqual({
      rawDueOn: '2026-10-14',
      dueOn: '2026-10-14',
    });
  });

  it('dado T-REG15 a partir de 2026-09-14 (segunda) então dueOn = 2026-09-29 (terça, dia útil, sem prorrogação)', async () => {
    await expect(computeMeasureDue('T-REG15', '2026-09-14')).resolves.toEqual({
      rawDueOn: '2026-09-29',
      dueOn: '2026-09-29',
    });
  });

  it('dado T-REG30 a partir de 2026-10-03 então rawDueOn = 2026-11-02 (Finados, feriado nacional da fixture) e dueOn prorroga para 2026-11-03 (terça, dia útil)', async () => {
    await expect(computeMeasureDue('T-REG30', '2026-10-03')).resolves.toEqual({
      rawDueOn: '2026-11-02',
      dueOn: '2026-11-03',
    });
  });

  it('dado T-DEPOSITO6M a partir de 2026-09-14 então rawDueOn = 2027-03-14 (domingo, soma de calendário em meses) e dueOn prorroga para 2027-03-15 (segunda; 2027 fora do calendário de feriados da fixture, só o fim de semana pesa)', async () => {
    await expect(
      computeMeasureDue('T-DEPOSITO6M', '2026-09-14'),
    ).resolves.toEqual({ rawDueOn: '2027-03-14', dueOn: '2027-03-15' });
  });
});
