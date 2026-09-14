// Relógio fixo dos testes e das fixtures (rait-test-strategy.md §6). O motor
// nunca chama `Date.now()`: o relógio é sempre injetado (CODESTYLE §TypeScript).
import type { Clock, LocalDate } from './types.js';

export class FixedClock implements Clock {
  /** Fuso do tenant em que `fixedToday` é a data civil (`auth.tenants.timezone`). */
  readonly tz: string;
  private readonly fixedToday: LocalDate;

  constructor(today: LocalDate, tz: string) {
    this.fixedToday = today;
    this.tz = tz;
  }

  /**
   * A data fixa. O argumento existe para a implementação de produção (que lê o
   * fuso do tenant); aqui o fuso já está no construtor.
   */
  today(_tenantTz: string): LocalDate {
    return this.fixedToday;
  }

  /**
   * Instante determinístico do dia fixo (meio-dia UTC): o motor só usa `now()`
   * para `satisfied_at`/`expired_at`, e a varredura compara datas, não
   * instantes (rait-deadline-engine.md §5).
   */
  now(): Date {
    return new Date(`${this.fixedToday}T12:00:00.000Z`);
  }
}
