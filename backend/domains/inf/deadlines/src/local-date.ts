// Aritmética de data civil do motor (rait-deadline-engine.md §2). É o único
// lugar que soma prazo: dias corridos excluem o dia do marco e incluem o do
// vencimento (`raw_due_on = start_on + n`); meses e anos são soma de calendário
// com o mesmo grampo de fim de mês do Postgres (`date + interval 'n months'`).
// Sem `Date.now()`: todas as funções são puras.
import { DeadlineError } from './errors.js';
import type { LocalDate } from './types.js';

const LOCAL_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_PER_DAY = 86_400_000;

interface Parts {
  year: number;
  month: number;
  day: number;
}

function parts(date: LocalDate): Parts {
  const match = LOCAL_DATE.exec(date);
  if (!match) {
    throw new DeadlineError('RAIT.INTERNAL', {
      status: 500,
      context: { date },
      message: 'Data civil inválida: esperado YYYY-MM-DD.',
    });
  }
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
}

function format(utc: number): LocalDate {
  return new Date(utc).toISOString().slice(0, 10);
}

function utcOf(date: LocalDate): number {
  const { year, month, day } = parts(date);
  return Date.UTC(year, month - 1, day);
}

/** Dias civis somados ao marco (`n` negativo anda para trás). */
export function addCalendarDays(date: LocalDate, days: number): LocalDate {
  return format(utcOf(date) + days * MS_PER_DAY);
}

/** Último dia do mês (base do grampo de fim de mês). */
function lastDayOfMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

/**
 * Soma de calendário em meses, com grampo no último dia do mês de destino —
 * é o comportamento de `date + interval 'n months'` do Postgres
 * (rait-deadline-engine.md §2).
 */
export function addCalendarMonths(date: LocalDate, months: number): LocalDate {
  const { year, month, day } = parts(date);
  const shifted = month - 1 + months;
  const targetYear = year + Math.floor(shifted / 12);
  const targetMonth = ((shifted % 12) + 12) % 12;
  const clamped = Math.min(day, lastDayOfMonth(targetYear, targetMonth));
  return format(Date.UTC(targetYear, targetMonth, clamped));
}

/** Soma de calendário em anos (12 meses cada). */
export function addCalendarYears(date: LocalDate, years: number): LocalDate {
  return addCalendarMonths(date, years * 12);
}

/** 0 = domingo … 6 = sábado. */
export function weekdayOf(date: LocalDate): number {
  return new Date(utcOf(date)).getUTCDay();
}

/** Sábado e domingo nunca são dias úteis (rait-deadline-engine.md §2). */
export function isWeekend(date: LocalDate): boolean {
  const weekday = weekdayOf(date);
  return weekday === 0 || weekday === 6;
}
