// Calendário em memória a partir de
// docs/framework/arch/fixtures/calendar-2026.json. Feriado = chave de
// `national`, `am` ou `manaus`; `optional` (ponto facultativo) **não** é feriado
// (CTG-0001 §5 nota 3). Dia útil = seg–sex fora dessa lista
// (rait-deadline-engine.md §2).
import { addCalendarDays, isWeekend } from './local-date.js';
import type { Calendar, CalendarJson, LocalDate } from './types.js';

export class InMemoryCalendar implements Calendar {
  private readonly holidays: ReadonlySet<LocalDate>;

  constructor(calendarJson: CalendarJson) {
    this.holidays = new Set([
      ...Object.keys(calendarJson.national ?? {}),
      ...Object.keys(calendarJson.am ?? {}),
      ...Object.keys(calendarJson.manaus ?? {}),
    ]);
  }

  /**
   * O calendário da fixture é o do órgão (nacional + AM + Manaus); o argumento
   * `tenantId` existe para a implementação que lê `rait_holiday` por tenant.
   */
  async isBusinessDay(d: LocalDate, _tenantId: string): Promise<boolean> {
    return !isWeekend(d) && !this.holidays.has(d);
  }

  /** Primeiro dia útil **depois** de `d` (nunca `d`). */
  async nextBusinessDay(d: LocalDate, tenantId: string): Promise<LocalDate> {
    let candidate = addCalendarDays(d, 1);
    while (!(await this.isBusinessDay(candidate, tenantId))) {
      candidate = addCalendarDays(candidate, 1);
    }
    return candidate;
  }
}
