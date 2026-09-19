// CTG-0004 §3.1 (R-0008, TASK-0009, RN-TEAT-133) — formato de
// `inf.normative_metrological_table.table_json` e `max_error` da faixa.
export interface ToleranceRange {
  from: number;
  to: number | null;
  max_error: number;
}

export interface MetrologicalTableJson {
  unit: string;
  thresholds: { administrative: number; crime: number };
  tolerance: ToleranceRange[];
}

export function isMetrologicalTableJson(
  value: unknown,
): value is MetrologicalTableJson {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<MetrologicalTableJson>;
  return (
    Array.isArray(candidate.tolerance) &&
    typeof candidate.thresholds === 'object' &&
    candidate.thresholds !== null
  );
}

/** `max_error` da faixa de `tolerance` cujo `[from, to)` contém `resultMgL`;
 * `to: null` é aberta. Sem faixa correspondente, usa a última (mais alta). */
export function maxErrorFor(
  table: MetrologicalTableJson,
  resultMgL: number,
): number {
  const match = table.tolerance.find(
    (range) =>
      resultMgL >= range.from && (range.to === null || resultMgL < range.to),
  );
  if (match) return match.max_error;
  const last = table.tolerance[table.tolerance.length - 1];
  return last ? last.max_error : 0;
}

/** `considered = max(0, result − max_error)` (CTG-0004 §3.1). */
export function consideredOf(resultMgL: number, maxError: number): number {
  return Math.max(0, resultMgL - maxError);
}
