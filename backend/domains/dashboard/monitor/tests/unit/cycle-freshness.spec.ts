// CTG-0002 §15.1 C-0002-36 [unit] — `freshnessOf(input, params, now)`
// (§8.1, função pura exportada de `cycle/freshness.service.ts`): as sete
// linhas da tabela de estado e os casos enunciados (L = 60, d = 2, m = 3,
// `now = 2026-09-21T12:00Z`, blocos A e C), `L` nulo ⇒ `INDISPONIVEL`.
// `staleSince` = `L0 + d·L` (entrada em INDISPONIVEL) nos blocos B/C/D.
import { describe, expect, it } from 'vitest';

import { freshnessOf } from '../../src/handwritten/cycle/index.js';

const NOW = new Date('2026-09-21T12:00:00.000Z');
const PARAMS = { heartbeatDivisor: 2, staleHideMultiplier: 3 };
const HEARTBEAT = 'source.heartbeat';
const L = 60;

const minutesBefore = (minutes: number): Date =>
  new Date(NOW.getTime() - minutes * 60_000);

function input(
  lastSeenAt: Date | null,
  block: 'A' | 'B' | 'C' | 'D',
  overrides: Partial<{
    acceptableLatencyMinutes: number | null;
    heartbeatContract: string | null;
    strategy: 'hide' | 'mark';
  }> = {},
) {
  return {
    lastSeenAt,
    acceptableLatencyMinutes:
      overrides.acceptableLatencyMinutes === undefined
        ? L
        : overrides.acceptableLatencyMinutes,
    heartbeatContract:
      overrides.heartbeatContract === undefined
        ? HEARTBEAT
        : overrides.heartbeatContract,
    block,
    strategy: overrides.strategy ?? (block === 'A' ? 'hide' : 'mark'),
  };
}

describe('C-0002-36 — freshnessOf, linhas 1–7 de §8.1 (L=60, d=2, m=3)', () => {
  it('C-0002-36 dado L0 = 11:30 (age 30 ≤ L) quando freshnessOf então FRESCO, hidden=false, staleSince=null (linha 3)', () => {
    expect(freshnessOf(input(minutesBefore(30), 'C'), PARAMS, NOW)).toEqual({
      state: 'FRESCO',
      hidden: false,
      staleSince: null,
    });
  });

  it('C-0002-36 dado age = L exato (60) quando freshnessOf então ainda FRESCO (age ≤ L)', () => {
    expect(freshnessOf(input(minutesBefore(60), 'A'), PARAMS, NOW)).toEqual({
      state: 'FRESCO',
      hidden: false,
      staleSince: null,
    });
  });

  it('C-0002-36 dado L0 = 10:30 (L < age 90 ≤ d·L) quando freshnessOf então ATRASADO, hidden=false (linha 4)', () => {
    expect(freshnessOf(input(minutesBefore(90), 'C'), PARAMS, NOW)).toEqual({
      state: 'ATRASADO',
      hidden: false,
      staleSince: null,
    });
    expect(freshnessOf(input(minutesBefore(90), 'A'), PARAMS, NOW)).toEqual({
      state: 'ATRASADO',
      hidden: false,
      staleSince: null,
    });
  });

  it('C-0002-36 dado age = d·L exato (120) quando freshnessOf então ainda ATRASADO', () => {
    expect(freshnessOf(input(minutesBefore(120), 'C'), PARAMS, NOW)).toEqual({
      state: 'ATRASADO',
      hidden: false,
      staleSince: null,
    });
  });

  it('C-0002-36 dado L0 = 09:30 (age 150 > d·L) em bloco A quando freshnessOf então INDISPONIVEL, hidden=true, staleSince=null (linha 5, ocultar)', () => {
    expect(freshnessOf(input(minutesBefore(150), 'A'), PARAMS, NOW)).toEqual({
      state: 'INDISPONIVEL',
      hidden: true,
      staleSince: null,
    });
  });

  it('C-0002-36 dado age > d·L em bloco C com estratégia hide quando freshnessOf então INDISPONIVEL, hidden=true (linha 5, "ou estratégia hide")', () => {
    expect(
      freshnessOf(
        input(minutesBefore(150), 'C', { strategy: 'hide' }),
        PARAMS,
        NOW,
      ),
    ).toEqual({ state: 'INDISPONIVEL', hidden: true, staleSince: null });
  });

  it('C-0002-36 dado L0 = 09:30 (d·L < age 150 ≤ m·L) em bloco C quando freshnessOf então DESATUALIZADO_MARCADO, hidden=false, staleSince = L0 + d·L = 11:30 (linha 6)', () => {
    const lastSeenAt = minutesBefore(150);
    expect(freshnessOf(input(lastSeenAt, 'C'), PARAMS, NOW)).toEqual({
      state: 'DESATUALIZADO_MARCADO',
      hidden: false,
      staleSince: new Date(
        lastSeenAt.getTime() + PARAMS.heartbeatDivisor * L * 60_000,
      ),
    });
    expect(
      freshnessOf(
        input(lastSeenAt, 'C'),
        PARAMS,
        NOW,
      ).staleSince?.toISOString(),
    ).toBe('2026-09-21T11:30:00.000Z');
  });

  it('C-0002-36 dado age = m·L exato (180) em bloco B quando freshnessOf então DESATUALIZADO_MARCADO ainda visível (age ≤ m·L)', () => {
    const result = freshnessOf(input(minutesBefore(180), 'B'), PARAMS, NOW);
    expect(result.state).toBe('DESATUALIZADO_MARCADO');
    expect(result.hidden).toBe(false);
  });

  it('C-0002-36 dado L0 = 08:30 (age 210 > m·L) em bloco C quando freshnessOf então DESATUALIZADO_MARCADO, hidden=true, staleSince = L0 + d·L (linha 7)', () => {
    const lastSeenAt = minutesBefore(210);
    expect(freshnessOf(input(lastSeenAt, 'C'), PARAMS, NOW)).toEqual({
      state: 'DESATUALIZADO_MARCADO',
      hidden: true,
      staleSince: new Date(
        lastSeenAt.getTime() + PARAMS.heartbeatDivisor * L * 60_000,
      ),
    });
  });

  it.each(['B', 'D'] as const)(
    'C-0002-36 dado bloco %s com age > m·L quando freshnessOf então mesma regra de marcar/ocultar dos blocos B/C/D',
    (block) => {
      const result = freshnessOf(input(minutesBefore(210), block), PARAMS, NOW);
      expect(result.state).toBe('DESATUALIZADO_MARCADO');
      expect(result.hidden).toBe(true);
    },
  );

  it('C-0002-36 dado L nulo quando freshnessOf então INDISPONIVEL (linha 1), hidden só em bloco A', () => {
    expect(
      freshnessOf(
        input(minutesBefore(1), 'C', { acceptableLatencyMinutes: null }),
        PARAMS,
        NOW,
      ),
    ).toEqual({ state: 'INDISPONIVEL', hidden: false, staleSince: null });
    expect(
      freshnessOf(
        input(minutesBefore(1), 'A', { acceptableLatencyMinutes: null }),
        PARAMS,
        NOW,
      ),
    ).toEqual({ state: 'INDISPONIVEL', hidden: true, staleSince: null });
  });

  it('C-0002-36 dado H nulo (heartbeat_contract) quando freshnessOf então INDISPONIVEL (linha 1) mesmo com leitura recente', () => {
    expect(
      freshnessOf(
        input(minutesBefore(1), 'B', { heartbeatContract: null }),
        PARAMS,
        NOW,
      ),
    ).toEqual({ state: 'INDISPONIVEL', hidden: false, staleSince: null });
  });

  it('C-0002-36 dado L0 nulo (nunca leu) quando freshnessOf então INDISPONIVEL (linha 2), hidden = (bloco A)', () => {
    expect(freshnessOf(input(null, 'C'), PARAMS, NOW)).toEqual({
      state: 'INDISPONIVEL',
      hidden: false,
      staleSince: null,
    });
    expect(freshnessOf(input(null, 'A'), PARAMS, NOW)).toEqual({
      state: 'INDISPONIVEL',
      hidden: true,
      staleSince: null,
    });
  });

  it('C-0002-36 dado a ordem de avaliação de §8.1 quando H e L são nulos e L0 também então a linha 1 vence (INDISPONIVEL) — nenhum outro estado', () => {
    const result = freshnessOf(
      input(null, 'A', {
        acceptableLatencyMinutes: null,
        heartbeatContract: null,
      }),
      PARAMS,
      NOW,
    );
    expect(result.state).toBe('INDISPONIVEL');
    expect(result.staleSince).toBeNull();
  });
});
