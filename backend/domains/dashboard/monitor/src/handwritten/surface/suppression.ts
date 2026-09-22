// Supressão de célula (CTG-0002 §9.5 — [RN-DASH-161] verificações 1–2;
// algoritmo de referência `dashboard-crashes.projection.ts`, R-0010) e
// leitura do limiar `dashboard.cell_threshold` (§1.3.7, OD-D31).
// Implementação única, reutilizada por `comparisons`, `kpis`, `indicators`
// (valor agregado), `open-data` e `exports`. Sem conexão: recebe as linhas já
// agregadas e o limiar já lido.
import { DetranError } from '@detran/shared';

export type Suppression = 'primary' | 'secondary';

export interface CountCell {
  key: string;
  count: number | null;
  suppression?: Suppression;
}

export interface SuppressResult<T extends CountCell = CountCell> {
  rows: T[];
  suppressedCells: number;
  total: number | null;
  totalSuppressed: boolean;
}

/**
 * Primária: toda célula com `count < threshold` → `count: null`,
 * `suppression: 'primary'`. Secundária: se houve ≥ 1 primária e existe célula
 * com `count ≥ threshold`, a menor delas (empate: a primeira na ordem de
 * saída) → `count: null`, `suppression: 'secondary'` — uma por grupo. Total
 * publicado só quando não houve supressão; célula suprimida nunca sai como
 * zero; a entrada não é mutada e a ordem é preservada.
 */
export function suppress<T extends CountCell>(
  rows: readonly T[],
  threshold: number,
): SuppressResult<T> {
  const output: T[] = rows.map((row) => ({ ...row }));
  let suppressed = 0;
  let total = 0;
  let secondaryIndex = -1;
  let secondaryCount = Number.POSITIVE_INFINITY;
  output.forEach((row, index) => {
    const count = row.count ?? 0;
    total += count;
    if (count < threshold) {
      row.count = null;
      row.suppression = 'primary';
      suppressed += 1;
      return;
    }
    if (count < secondaryCount) {
      secondaryCount = count;
      secondaryIndex = index;
    }
  });
  if (suppressed > 0 && secondaryIndex >= 0) {
    const row = output[secondaryIndex]!;
    row.count = null;
    row.suppression = 'secondary';
    suppressed += 1;
  }
  const totalSuppressed = suppressed > 0;
  return {
    rows: output,
    suppressedCells: suppressed,
    total: totalSuppressed ? null : total,
    totalSuppressed,
  };
}

/** Forma mínima do `Parameter` de `@detran/ops-parameter` que o leitor usa. */
export interface ThresholdParameterLike {
  key: string;
  value_json?: unknown;
  value?: unknown;
}

const LEADING_DECIMAL = /^\s*(\d+(?:[.,]\d+)?)/;

/**
 * §1.3.7: `value_json` numérico → ele mesmo; string → o número decimal
 * inicial (`"10 (supressão primária + secundária)"` → 10); senão 422
 * `DASH.CELL_THRESHOLD_UNDEFINED` com `context.parameterKey`.
 */
export function cellThresholdOf(parameter: ThresholdParameterLike): number {
  const value =
    parameter.value_json !== undefined ? parameter.value_json : parameter.value;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const match = LEADING_DECIMAL.exec(value);
    if (match?.[1]) return Number(match[1].replace(',', '.'));
  }
  throw new DetranError('DASH.CELL_THRESHOLD_UNDEFINED', {
    status: 422,
    context: { parameterKey: parameter.key },
  });
}

/** Aviso `DASH.CELL_SUPPRESSED` de `warnings[]` (nunca erro, §9.5). */
export function suppressionWarning(
  suppressedCells: number,
  threshold: number,
): { code: 'DASH.CELL_SUPPRESSED'; context: Record<string, number> } | null {
  if (suppressedCells === 0) return null;
  return {
    code: 'DASH.CELL_SUPPRESSED',
    context: { suppressedCells, threshold },
  };
}
