// CTG-0003 §3 (M13, R-0008, TASK-0007) — manifesto canônico do pacote mobile
// e seu hash.
//
// JSON canônico: chaves ordenadas recursivamente, sem espaços (a mesma
// `stableJson` de `ait-lifecycle.service.ts`). Cada coleção traz só as linhas
// `status='active'`, ordenadas por `id asc`, sem `tenant_id`, `created_at`
// nem `updated_at`.
import {
  readRows,
  sha256Hex,
  stringOf,
  type NormativeDeps,
  type NormativeRow,
} from './normative-runtime.js';

const STRIPPED_COLUMNS = ['tenant_id', 'created_at', 'updated_at'] as const;

export interface NormativeManifest {
  catalog: NormativeRow | null;
  framings: NormativeRow[];
  validation_rules: NormativeRow[];
  metrological_tables: NormativeRow[];
  document_templates: NormativeRow[];
  agency_parameters: NormativeRow[];
}

export function stableJson(value: unknown): string {
  return JSON.stringify(sortDeep(value));
}

function sortDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((entry) => sortDeep(entry));
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    const source = value as Record<string, unknown>;
    return Object.fromEntries(
      Object.keys(source)
        .sort()
        .map((key) => [key, sortDeep(source[key])]),
    );
  }
  if (value instanceof Date) return value.toISOString();
  return value;
}

export function manifestHashOf(manifest: NormativeManifest): string {
  return `sha256:${sha256Hex(stableJson(manifest))}`;
}

function strip(row: NormativeRow): NormativeRow {
  const copy: NormativeRow = { ...row };
  for (const column of STRIPPED_COLUMNS) delete copy[column];
  return copy;
}

function byId(left: NormativeRow, right: NormativeRow): number {
  return stringOf(left.id) < stringOf(right.id) ? -1 : 1;
}

function activeOfCatalog(catalogId: string) {
  return (row: NormativeRow): boolean =>
    row.status === 'active' && stringOf(row.catalog_id) === catalogId;
}

function activeOfAgency(agencyId: string | null) {
  return (row: NormativeRow): boolean =>
    row.status === 'active' &&
    (agencyId === null ? false : stringOf(row.traffic_agency_id) === agencyId);
}

/**
 * §3 — recompõe o manifesto do catálogo `catalogId` no escopo do órgão
 * `agencyId`. Sem órgão conhecido, `document_templates` e `agency_parameters`
 * saem vazios: são coleções do órgão, não do catálogo.
 */
export async function buildManifest(
  deps: NormativeDeps,
  catalog: NormativeRow,
  agencyId: string | null,
): Promise<NormativeManifest> {
  const catalogId = stringOf(catalog.id);
  const [
    framings,
    validationRules,
    metrologicalTables,
    documentTemplates,
    agencyParameters,
  ] = await Promise.all([
    readRows(deps, 'framings', activeOfCatalog(catalogId)),
    readRows(deps, 'validationRules', activeOfCatalog(catalogId)),
    readRows(deps, 'metrologicalTables', activeOfCatalog(catalogId)),
    readRows(deps, 'documentTemplates', activeOfAgency(agencyId)),
    readRows(deps, 'agencyParameters', activeOfAgency(agencyId)),
  ]);

  return {
    catalog: strip(catalog),
    framings: framings.map(strip).sort(byId),
    validation_rules: validationRules.map(strip).sort(byId),
    metrological_tables: metrologicalTables.map(strip).sort(byId),
    document_templates: documentTemplates.map(strip).sort(byId),
    agency_parameters: agencyParameters.map(strip).sort(byId),
  };
}
