// Marca d'água de exportação/relatório (CTG-0002 §9.4 — [RN-DASH-172]
// regra 3): órgão, camada, usuário (`user_ref` + papel, nunca nome), data-hora
// ISO UTC, recorte (`scope` + `filters_json` canônico) e id do registro, numa
// linha com campos separados por ` | `. O instante é entrada (`Clock.now()`
// do chamador) — nunca o relógio do processo.

export interface WatermarkInput {
  /** `auth.tenants.short_name`, senão `name`. */
  agency: string;
  layer: 'N0' | 'N1' | 'N2';
  userRef: string;
  userRole: string;
  at: Date;
  scope: string;
  filters: Record<string, unknown>;
  /** `export_log.id` ou `generated_report.id`. */
  exportId: string;
}

/** JSON canônico: chaves ordenadas em todos os níveis, sem espaços. */
export function canonicalJson(value: unknown): string {
  return JSON.stringify(sortKeys(value));
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return Object.fromEntries(
      Object.keys(record)
        .sort()
        .map((key) => [key, sortKeys(record[key])]),
    );
  }
  return value;
}

export function watermarkOf(input: WatermarkInput): string {
  return [
    input.agency,
    `camada ${input.layer}`,
    `usuario ${input.userRef} (${input.userRole})`,
    input.at.toISOString(),
    `recorte ${input.scope} ${canonicalJson(input.filters ?? {})}`,
    `export ${input.exportId}`,
  ].join(' | ');
}

/** Arquivo CSV (§9.4): `# <marca d'água>` na primeira linha, cabeçalho na segunda. */
export function csvWithWatermark(
  watermark: string,
  rows: readonly Record<string, unknown>[],
): string {
  const columns = Array.from(
    rows.reduce((keys, row) => {
      for (const key of Object.keys(row)) keys.add(key);
      return keys;
    }, new Set<string>()),
  );
  const header = columns.length > 0 ? columns.join(',') : 'sem-colunas';
  const lines = rows.map((row) =>
    columns.map((column) => csvCell(row[column])).join(','),
  );
  return [`# ${watermark}`, header, ...lines].join('\n');
}

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  const text =
    value instanceof Date
      ? value.toISOString()
      : typeof value === 'object'
        ? canonicalJson(value)
        : String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

/** Arquivo JSON (§9.4): `{ watermark, classification, rows }`. */
export function jsonWithWatermark(
  watermark: string,
  layer: 'N0' | 'N1' | 'N2',
  rows: readonly unknown[],
): { watermark: string; classification: 'N0' | 'N1' | 'N2'; rows: unknown[] } {
  return { watermark, classification: layer, rows: [...rows] };
}
