// CTG-0004 §2 e §14 item 3 (R-0008, TASK-0009, OD-T38) — `computeMeasureDue`.
//
// §15.1 (adenda do maestro, iteração 2): `@detran/inf-deadlines` entrou em
// `module.dependencies`/`testAliases` de `BP-INF-MEASURES-001` — a réplica
// local de `addCalendarDays`/`addCalendarMonths` foi removida; a aritmética
// de dias/meses vem sempre do motor (M14: "prazos nunca calculados fora de
// @detran/inf-deadlines"). `computeDue` do `DeadlineEngine` não se aplica
// diretamente: seu `TimerCatalog` não cobre `owner='medida'` (`TimerCode`
// não tem os seis códigos, CTG-0004 §14 item 3) — por isso `computeMeasureDue`
// continua uma função local (OD-T38 opção b), mas agora só orquestra as
// funções puras do pacote real sobre um `Calendar` (mesmo contrato público),
// nunca duplicando a regra de contagem.
import {
  addCalendarDays,
  addCalendarMonths,
  InMemoryCalendar,
  type Calendar,
  type CalendarJson,
} from '@detran/inf-deadlines';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export type MeasureTimerCode = 'T-REG30' | 'T-REG15' | 'T-DEPOSITO6M';

export interface MeasureTimerDefinition {
  durationValue: number;
  durationUnit: 'dias_corridos' | 'meses';
}

/** DDL 14 (`inf.infraction_timer_ref`), `owner='medida'` (CTG-0004 §2). */
export const MEASURE_TIMER_CATALOG: Record<
  MeasureTimerCode,
  MeasureTimerDefinition
> = {
  'T-REG30': { durationValue: 30, durationUnit: 'dias_corridos' },
  'T-REG15': { durationValue: 15, durationUnit: 'dias_corridos' },
  'T-DEPOSITO6M': { durationValue: 6, durationUnit: 'meses' },
};

/**
 * `computeMeasureDue` — assinatura proposta pelo Inspector (`deadlines.spec.ts`):
 * `rawDueOn` é a soma pura (`@detran/inf-deadlines` `addCalendarDays`/
 * `addCalendarMonths`); `dueOn` arredonda para o próximo dia útil >=
 * `rawDueOn` (mesma regra de `DeadlineEngine.roundForward`, sem duplicá-la —
 * só delega ao `Calendar` injetado).
 */
export async function computeMeasureDue(
  code: MeasureTimerCode,
  startOn: string,
  calendar: Calendar,
  tenantId: string,
  catalog: Record<
    MeasureTimerCode,
    MeasureTimerDefinition
  > = MEASURE_TIMER_CATALOG,
): Promise<{ rawDueOn: string; dueOn: string }> {
  const definition = catalog[code];
  const rawDueOn =
    definition.durationUnit === 'dias_corridos'
      ? addCalendarDays(startOn, definition.durationValue)
      : addCalendarMonths(startOn, definition.durationValue);
  const dueOn = (await calendar.isBusinessDay(rawDueOn, tenantId))
    ? rawDueOn
    : await calendar.nextBusinessDay(rawDueOn, tenantId);
  return { rawDueOn, dueOn };
}

/**
 * `Calendar` de produção — `InMemoryCalendar` de `@detran/inf-deadlines`
 * sobre a mesma fixture de feriados do motor
 * (`docs/framework/arch/fixtures/calendar-2026.json`).
 */
function loadCalendarJson(): CalendarJson {
  const path = fileURLToPath(
    new URL(
      '../../../../../../docs/framework/arch/fixtures/calendar-2026.json',
      import.meta.url,
    ),
  );
  return JSON.parse(readFileSync(path, 'utf8')) as CalendarJson;
}

export function createProductionCalendar(): Calendar {
  return new InMemoryCalendar(loadCalendarJson());
}

/**
 * Fábrica da porta `MeasureDeadlinesPort` (`measure-runtime.ts`) — três
 * argumentos, o formato que os comandos recebem via `deps.deadlines`.
 */
export function createMeasureDeadlinesPort(
  calendar: Calendar = createProductionCalendar(),
): {
  computeMeasureDue(
    code: MeasureTimerCode,
    startOn: string,
    tenantId: string,
  ): Promise<{ rawDueOn: string; dueOn: string }>;
} {
  return {
    computeMeasureDue: (code, startOn, tenantId) =>
      computeMeasureDue(code, startOn, calendar, tenantId),
  };
}
