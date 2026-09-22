// CTG-0002 §9.5 (supressão primária e secundária de [RN-DASH-161]) e §1.3.7
// (regra de leitura numérica dos parâmetros `dashboard.*`) — C-0002-89 e
// C-0002-92 na camada `unit` (TASK-0014, M25). Contrato de §14.2:
// `surface/suppression.ts` exporta `suppress(rows, threshold)` e
// `cellThresholdOf(parameters)`. Algoritmo de referência:
// `dashboard-crashes.projection.ts` (`secondarySuppression`, R-0010). Nenhuma
// conexão (`rait-test-strategy.md` §1). Fica vermelho (Cannot find module) até
// TASK-0013 criar `src/handwritten/surface/suppression.ts`.
import { describe, expect, it } from 'vitest';

import {
  cellThresholdOf,
  suppress,
} from '../../src/handwritten/surface/suppression.js';

/** `T = dashboard.cell_threshold` = 10 (DT-029; parameter-catalogue) — só a fixture, nunca a chave. */
const T = 10;

interface Cell {
  key: string;
  count: number | null;
  suppression?: 'primary' | 'secondary';
}

/** Forma de saída de §9.5 (`count:null` + `suppression`, `total`/`totalSuppressed`, `suppressedCells`). */
interface SuppressResult {
  rows: Cell[];
  suppressedCells: number;
  total: number | null;
  totalSuppressed: boolean;
}

const cell = (key: string, count: number): Cell => ({ key, count });

/** Forma mínima do `Parameter` de `@detran/ops-parameter` que `cellThresholdOf` lê (`value_json`). */
function parameter(valueJson: unknown, key = 'chave-de-teste') {
  return { key, value_json: valueJson, value: valueJson };
}

describe('CTG-0002 §9.5 — suppress(rows, T) (C-0002-89 [unit])', () => {
  it('C-0002-89 — dado nenhuma célula abaixo de T quando suppress então nenhuma supressão, total publicado e suppressedCells = 0', () => {
    const result: SuppressResult = suppress(
      [cell('a', 12), cell('b', 30), cell('c', 10)],
      T,
    );
    expect(result.rows.map((row) => row.count)).toEqual([12, 30, 10]);
    expect(result.rows.every((row) => row.suppression === undefined)).toBe(
      true,
    );
    expect(result.suppressedCells).toBe(0);
    expect(result.total).toBe(52);
    expect(result.totalSuppressed).toBe(false);
  });

  it('C-0002-89 — dado uma célula com count < T quando suppress então ela vira count:null suppression:primary e a MENOR célula ≥ T vira secondary; total:null, totalSuppressed:true; suppressedCells = 2', () => {
    const result: SuppressResult = suppress(
      [cell('a', 3), cell('b', 25), cell('c', 12), cell('d', 40)],
      T,
    );
    const byKey = new Map(result.rows.map((row) => [row.key, row]));
    expect(byKey.get('a')).toMatchObject({
      count: null,
      suppression: 'primary',
    });
    expect(byKey.get('c')).toMatchObject({
      count: null,
      suppression: 'secondary',
    });
    expect(byKey.get('b')).toMatchObject({ count: 25 });
    expect(byKey.get('d')).toMatchObject({ count: 40 });
    expect(byKey.get('b')!.suppression).toBeUndefined();
    expect(result.suppressedCells).toBe(2);
    expect(result.total).toBeNull();
    expect(result.totalSuppressed).toBe(true);
  });

  it('C-0002-89 — dado count = T (não é < T) quando suppress então a célula é publicada', () => {
    const result: SuppressResult = suppress([cell('a', T), cell('b', 20)], T);
    expect(result.rows.map((row) => row.count)).toEqual([T, 20]);
    expect(result.suppressedCells).toBe(0);
  });

  it('C-0002-89 — dado várias primárias quando suppress então uma única secundária por grupo (a menor publicável), nunca mais de uma', () => {
    const result: SuppressResult = suppress(
      [cell('a', 1), cell('b', 2), cell('c', 15), cell('d', 11), cell('e', 99)],
      T,
    );
    const secondary = result.rows.filter(
      (row) => row.suppression === 'secondary',
    );
    expect(secondary.map((row) => row.key)).toEqual(['d']);
    expect(
      result.rows
        .filter((row) => row.suppression === 'primary')
        .map((r) => r.key),
    ).toEqual(['a', 'b']);
    expect(result.suppressedCells).toBe(3);
  });

  it('C-0002-89 — dado empate na menor célula publicável quando suppress então a secundária é a primeira na ordem de saída', () => {
    const result: SuppressResult = suppress(
      [cell('x', 4), cell('m', 12), cell('n', 12), cell('o', 12)],
      T,
    );
    const secondary = result.rows.filter(
      (row) => row.suppression === 'secondary',
    );
    expect(secondary.map((row) => row.key)).toEqual(['m']);
  });

  it('C-0002-89 — dado só primárias (nenhuma célula ≥ T) quando suppress então não há secundária e o total fica suprimido', () => {
    const result: SuppressResult = suppress([cell('a', 1), cell('b', 9)], T);
    expect(result.rows.every((row) => row.suppression === 'primary')).toBe(
      true,
    );
    expect(result.suppressedCells).toBe(2);
    expect(result.total).toBeNull();
    expect(result.totalSuppressed).toBe(true);
  });

  it('C-0002-89 — dado células suprimidas quando suppress então nunca saem como zero e a ordem de entrada é preservada', () => {
    const result: SuppressResult = suppress(
      [cell('a', 0), cell('b', 5), cell('c', 20), cell('d', 21)],
      T,
    );
    expect(result.rows.map((row) => row.key)).toEqual(['a', 'b', 'c', 'd']);
    for (const row of result.rows) expect(row.count).not.toBe(0);
    expect(result.rows[0]).toMatchObject({
      count: null,
      suppression: 'primary',
    });
  });

  it('C-0002-89 — dado rows vazio quando suppress então rows vazio, total 0 e nada suprimido', () => {
    const result: SuppressResult = suppress([], T);
    expect(result.rows).toEqual([]);
    expect(result.suppressedCells).toBe(0);
    expect(result.total).toBe(0);
    expect(result.totalSuppressed).toBe(false);
  });

  it('C-0002-89 — dado rows de entrada quando suppress então a entrada não é mutada', () => {
    const input = [cell('a', 2), cell('b', 30)];
    const snapshot = JSON.stringify(input);
    suppress(input, T);
    expect(JSON.stringify(input)).toBe(snapshot);
  });
});

describe('CTG-0002 §1.3.7 — cellThresholdOf(parameters) (C-0002-92 [unit])', () => {
  it('C-0002-92 — dado value_json numérico 10 então 10', () => {
    expect(cellThresholdOf(parameter(10))).toBe(10);
  });

  it('C-0002-92 — dado value_json em prosa "10 (supressão primária + secundária)" (seed 05, OD-D31) então o número inicial 10', () => {
    expect(
      cellThresholdOf(parameter('10 (supressão primária + secundária)')),
    ).toBe(10);
  });

  it('C-0002-92 — dado value_json "3 × latência aceitável" então 3 (número decimal inicial)', () => {
    expect(cellThresholdOf(parameter('3 × latência aceitável'))).toBe(3);
  });

  it('C-0002-92 — dado value_json sem número inicial então DetranError DASH.CELL_THRESHOLD_UNDEFINED 422 com context.parameterKey = a chave do parâmetro', () => {
    let caught: unknown;
    try {
      cellThresholdOf(parameter('indefinido', 'chave-x'));
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeDefined();
    const error = caught as {
      code: string;
      status: number;
      context: { parameterKey: string };
    };
    expect(error.code).toBe('DASH.CELL_THRESHOLD_UNDEFINED');
    expect(error.status).toBe(422);
    expect(error.context.parameterKey).toBe('chave-x');
  });

  it('C-0002-92 — dado value_json nulo ou objeto então DASH.CELL_THRESHOLD_UNDEFINED', () => {
    for (const value of [null, {}, [], true]) {
      expect(() => cellThresholdOf(parameter(value))).toThrowError(
        expect.objectContaining({ code: 'DASH.CELL_THRESHOLD_UNDEFINED' }),
      );
    }
  });
});
