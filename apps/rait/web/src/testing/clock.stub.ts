// R-0012 TASK-0008 (Inspector). Stub de `data/clock.ts` `RaitClock` (contrato CTG-0002b.md §3.2:
// "único lugar do app com `Date.now()`"; §7 `FIXED_NOW_ISO`). O relógio fixo é meio-dia
// (America/Manaus, UTC-04:00) do dia `fixtures.today` (`rait-fixtures.json` §1: `"today":
// "2026-09-14"`) — mesmo padrão de `apps/portal/web/src/testing/*` (`FIXED_CLOCK_ISO`).
// `RaitClock` (produção, `data/clock.ts`) ainda não existe — TASK-0009; o único uso aqui é o
// shape estrutural `{ now(): number }`, nunca uma importação de tipo do arquivo de produção
// (evita acoplar este stub a um módulo inexistente nesta entrega).
import { vi } from 'vitest';

export const FIXED_NOW_ISO = '2026-09-14T12:00:00-04:00';

export interface ClockStub {
  readonly now: () => number;
  /** Avança o relógio `ms` milissegundos (para specs de TTL/backoff/polling). */
  advance(ms: number): void;
}

/**
 * `{ provide: RaitClock, useValue: createClockStub() }`. `now()` é gravável via `advance`
 * (nunca `Date.now()` real: os specs de cache/TTL/backoff/polling controlam o tempo).
 */
export function createClockStub(
  startMs: number = Date.parse(FIXED_NOW_ISO),
): ClockStub {
  let current = startMs;
  return {
    now: vi.fn(() => current),
    advance(ms: number): void {
      current += ms;
    },
  };
}
