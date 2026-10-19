import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import * as prettier from 'prettier';

export interface Column {
  name: string;
  type: string;
  pii_class?: string;
  legal_basis?: string;
  retention?: string;
  [key: string]: unknown;
}
export interface Table {
  name: string;
  schema?: string;
  columns: Column[];
  evidence: Array<{ path: string; startLine: number; endLine: number }>;
}
export interface DataModel {
  schemaVersion: string;
  tables: Table[];
}
interface BlueprintField {
  name: string;
  pii?: string;
  retention?: string;
  legal_basis?: string;
  legalBasis?: string;
  purpose?: string;
  [key: string]: unknown;
}
const digest = (text: string) =>
  crypto.createHash('sha256').update(text).digest('hex');
const order = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
const tableKey = (table: Table) => `${table.schema ?? 'public'}.${table.name}`;
const key = (table: Table, column: Column) =>
  `${tableKey(table)}.${column.name}`;
const semantic = (column: Column) =>
  JSON.stringify(
    Object.fromEntries(
      Object.entries(column).filter(
        ([name]) => !['pii_class', 'legal_basis', 'retention'].includes(name),
      ),
    ),
  );

/** Deterministic supplemental registry; canonical metadata is quoted, never invented. */
export function exportPii(
  repoRoot: string,
  model: DataModel,
  piiModel: DataModel,
) {
  const root = path.resolve(repoRoot),
    sources = new Map<string, string>();
  function read(file: string) {
    const absolute = path.resolve(root, file);
    if (path.isAbsolute(file) || path.relative(root, absolute).startsWith('..'))
      throw new Error(`Source escapes repository: ${file}`);
    const text = fs.readFileSync(absolute, 'utf8');
    sources.set(file, digest(text));
    return text;
  }
  function index(value: DataModel) {
    if (
      value.schemaVersion !== '1.0.0' ||
      !Array.isArray(value.tables) ||
      !value.tables.length
    )
      throw new Error('Expected nonempty native data-model 1.0.0');
    const result = new Map<string, { table: Table; column: Column }>(),
      tables = new Set<string>();
    for (const table of value.tables) {
      if (tables.has(tableKey(table)))
        throw new Error(`Duplicate SQL table: ${tableKey(table)}`);
      tables.add(tableKey(table));
      if (!Array.isArray(table.evidence) || !table.evidence.length)
        throw new Error(`Missing DDL evidence: ${tableKey(table)}`);
      for (const column of table.columns) {
        const id = key(table, column);
        if (result.has(id)) throw new Error(`Duplicate SQL column: ${id}`);
        result.set(id, { table, column });
      }
    }
    return result;
  }
  const actual = index(model),
    named = index(piiModel);
  if (actual.size !== named.size)
    throw new Error('PII and data-model populations differ');
  for (const [id, item] of actual) {
    const annotated = named.get(id);
    if (!annotated || semantic(item.column) !== semantic(annotated.column))
      throw new Error(`PII model is stale or omits ${id}`);
    for (const evidence of item.table.evidence) {
      const text = read(evidence.path);
      const lines = text
        .split('\n')
        .slice(evidence.startLine - 1, evidence.endLine)
        .join('\n');
      const declaration = lines.match(
        /^\s*CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:"([^"]+)"|([a-zA-Z_][\w$]*))(?:\s*\.\s*(?:"([^"]+)"|([a-zA-Z_][\w$]*)))?\s*\(/im,
      );
      const first = declaration?.[1] ?? declaration?.[2];
      const second = declaration?.[3] ?? declaration?.[4];
      const declaredTable = second ?? first;
      const declaredSchema = second ? first : 'public';
      if (
        !Number.isInteger(evidence.startLine) ||
        !Number.isInteger(evidence.endLine) ||
        evidence.startLine < 1 ||
        evidence.endLine < evidence.startLine ||
        declaredTable !== item.table.name ||
        declaredSchema !== (item.table.schema ?? 'public')
      )
        throw new Error(`Stale/malformed DDL coordinates: ${id}`);
      const escaped = item.column.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (!new RegExp(`(?:^|\\n|[,(])\\s*"?${escaped}"?\\s+`, 'i').test(lines))
        throw new Error(`DDL evidence does not declare column: ${id}`);
    }
  }
  // Preserve every DDL file in provenance, including files without discovered CREATE TABLE.
  for (const directory of [
    'backend/database/ddl',
    'senatran-mock/database/ddl',
  ]) {
    function sqlFiles(relative: string) {
      for (const entry of fs
        .readdirSync(path.join(root, relative), { withFileTypes: true })
        .sort((a, b) => order(a.name, b.name))) {
        if (entry.isDirectory()) sqlFiles(`${relative}/${entry.name}`);
        else if (entry.isFile() && entry.name.endsWith('.sql'))
          read(`${relative}/${entry.name}`);
      }
    }
    sqlFiles(directory);
  }
  const blueprints = new Map<
    string,
    Array<{
      source: { path: string; pointer: string };
      pii: string;
      retention: string | null;
      legal_basis: string | null;
      purpose: string | null;
      module_context: string | null;
    }>
  >();
  for (const name of fs
    .readdirSync(path.join(root, 'docs/framework/blueprints'))
    .filter((name) => name.endsWith('.json'))
    .sort(order)) {
    const file = `docs/framework/blueprints/${name}`;
    const blueprint = JSON.parse(read(file));
    if (!blueprint.database?.entities) continue;
    blueprint.database.entities.forEach(
      (
        entity: { table: string; fields: BlueprintField[] },
        entityIndex: number,
      ) => {
        entity.fields.forEach((field, fieldIndex) => {
          if (typeof field.pii !== 'string' || !field.pii) return;
          const id = `${blueprint.module.namespace}.${entity.table}.${field.name}`;
          const existing = blueprints.get(id) ?? [];
          existing.push({
            source: {
              path: file,
              pointer: `/database/entities/${entityIndex}/fields/${fieldIndex}`,
            },
            pii: field.pii,
            retention:
              typeof field.retention === 'string' ? field.retention : null,
            legal_basis:
              typeof (field.legal_basis ?? field.legalBasis) === 'string'
                ? (field.legal_basis ?? field.legalBasis!)
                : null,
            purpose: typeof field.purpose === 'string' ? field.purpose : null,
            module_context: blueprint.module.description ?? null,
          });
          blueprints.set(id, existing);
        });
      },
    );
  }
  const candidates = new Set(
    [...named]
      .filter(([, value]) => value.column.pii_class !== undefined)
      .map(([id]) => id),
  );
  const union = [...new Set([...candidates, ...blueprints.keys()])].sort(order);
  const fields = union.map((id) => {
    const item = actual.get(id),
      annotated = named.get(id)?.column;
    const references = blueprints.get(id) ?? [];
    const classifications = [...new Set(references.map((r) => r.pii))].sort(
      order,
    );
    const retention = [
      ...new Set(
        [annotated?.retention, ...references.map((r) => r.retention)].filter(
          (v): v is string => typeof v === 'string' && v.length > 0,
        ),
      ),
    ].sort(order);
    const bases = [
      ...new Set(
        [
          annotated?.legal_basis,
          ...references.map((r) => r.legal_basis),
        ].filter((v): v is string => typeof v === 'string' && v.length > 0),
      ),
    ].sort(order);
    const purposes = [
      ...new Set(
        references.map((r) => r.purpose).filter((v): v is string => v !== null),
      ),
    ].sort(order);
    const columnName = item?.column.name ?? id.split('.').at(-1)!;
    const pending = [
      ...(!item ? [`PII-SQL-MAPPING:${id}`] : []),
      ...(!classifications.length ? [`PII-CLASSIFICATION:${id}`] : []),
      ...(classifications.length > 1 ? [`PII-CLASS-CONFLICT:${id}`] : []),
      ...(!purposes.length ? [`PII-PURPOSE:${id}`] : []),
      ...(purposes.length > 1 ? [`PII-PURPOSE-CONFLICT:${id}`] : []),
      ...(!bases.length ? [`PII-LEGAL-BASIS:${id}`] : []),
      ...(bases.length > 1 ? [`PII-LEGAL-BASIS-CONFLICT:${id}`] : []),
      ...(!retention.length ? [`PII-RETENTION:${id}`] : []),
      ...(retention.includes('forever')
        ? [`PII-INDEFINITE-RETENTION-REVIEW:${id}`]
        : []),
      ...(retention.length > 1 ? [`PII-RETENTION-CONFLICT:${id}`] : []),
      ...(columnName === 'state' ? [`PII-STATE-SEMANTICS:${id}`] : []),
      ...(columnName === 'cnpj' ? [`PII-CNPJ-CONTEXT:${id}`] : []),
    ];
    const nameReview =
      columnName === 'state'
        ? {
            category: 'status-or-location-needs-semantic-review',
            recommendation:
              'Inspect DDL constraints, defaults and domain vocabulary. Preserve as restricted candidate until classification is ratified; do not infer geographical state from its name.',
            source_default:
              typeof item?.column.default === 'string'
                ? item.column.default
                : null,
          }
        : columnName === 'cnpj'
          ? {
              category: 'organization-identifier-context-dependent',
              recommendation:
                'Determine linkage to natural person, sole trader or organization from canonical purpose. Keep candidate; do not assume every CNPJ is personal or nonpersonal.',
              source_default: null,
            }
          : {
              category:
                annotated?.pii_class === 'credentials'
                  ? 'credential-requires-restricted-handling'
                  : classifications.some((v) => /health|sensitive/i.test(v))
                    ? 'canonical-sensitive-data'
                    : classifications.length
                      ? 'canonical-personal-data'
                      : 'unclassified-name-candidate',
              recommendation:
                'Preserve source classification and restrict disclosure pending purpose/legal-basis/retention confirmation. This recommendation is inventory review only and changes no runtime access.',
              source_default: null,
            };
    return {
      id,
      sql_present: Boolean(item),
      native_name_candidate: candidates.has(id),
      native_pii_class: annotated?.pii_class ?? null,
      sql: item
        ? {
            schema: item.table.schema ?? 'public',
            table: item.table.name,
            column: item.column.name,
            type: item.column.type,
            evidence: item.table.evidence,
          }
        : null,
      canonical_classifications: classifications,
      classification_status:
        classifications.length === 1
          ? 'source-declared'
          : classifications.length > 1
            ? 'conflict'
            : 'pending',
      blueprint_sources: references,
      processing_purpose: {
        status:
          purposes.length === 1
            ? 'source-declared'
            : purposes.length
              ? 'conflict'
              : 'pending',
        values: purposes,
      },
      legal_basis: {
        status:
          bases.length === 1
            ? 'source-declared-not-legally-validated'
            : bases.length
              ? 'conflict'
              : 'pending',
        values: bases,
      },
      retention: {
        status:
          retention.length === 1
            ? retention[0] === 'forever'
              ? 'source-declared-review-indefinite'
              : 'source-declared-not-operationally-validated'
            : retention.length
              ? 'conflict'
              : 'pending',
        values: retention,
      },
      semantic_review: nameReview,
      pending,
      owner_question: pending.length
        ? `Confirm canonical purpose, classification, legal basis and retention for ${id}; supply a source or retain this pending entry. Existing specification values are quoted, not ratified by this export.`
        : null,
    };
  });
  const contextualSources = [
    {
      path: 'docs/meta/security/lgpd-rait.md',
      status: 'draft-legal-projection',
      note: 'Legal bases and five-year retention are explicitly unvalidated proposals; do not propagate as approved facts.',
    },
    {
      path: 'docs/framework/arch/boat-route-contract.md',
      status: 'draft-architectural-contract',
      note: 'Section 8 identifies plate/name/document/hospital/health PII and parameterized retention; this export quotes actual field-level blueprint values and preserves their gaps.',
    },
  ];
  contextualSources.forEach((reference) => read(reference.path));
  read('tools/security/export-pii.ts');
  const count = (predicate: (row: (typeof fields)[number]) => boolean) =>
    fields.filter(predicate).length;
  return {
    schemaVersion: '1.0.0',
    kind: 'detran-pii-crosswalk',
    native_sensor_compatible: false,
    native_population_sha256: digest(
      JSON.stringify(
        [...actual]
          .sort(([a], [b]) => order(a, b))
          .map(([id, item]) => ({
            id,
            column: item.column,
            pii: named.get(id)!.column,
          })),
      ),
    ),
    semantics:
      'Known-field union of native name candidates and blueprint declarations. Absence from this registry does not establish absence of PII. No legal facts, new retention values or native verdicts are manufactured.',
    population: {
      sql_tables: model.tables.length,
      sql_columns: actual.size,
      native_candidates: candidates.size,
      blueprint_fields: blueprints.size,
      blueprint_matched_native: count(
        (r) => r.native_name_candidate && r.blueprint_sources.length > 0,
      ),
      blueprint_outside_native_heuristic: count(
        (r) => !r.native_name_candidate && r.blueprint_sources.length > 0,
      ),
      known_field_union: fields.length,
      blueprint_without_sql: count((r) => !r.sql_present),
      state_candidates: count(
        (r) => r.native_name_candidate && r.sql?.column === 'state',
      ),
      cnpj_candidates: count(
        (r) => r.native_name_candidate && r.sql?.column === 'cnpj',
      ),
      pending_fields: count((r) => r.pending.length > 0),
    },
    review_policy: {
      pending_owner:
        'Owner/DPO and Architect, with authentic canonical sources',
      conservative_recommendation:
        'Keep unknowns visible and treat candidates as restricted during review; this does not alter execution, access, legal bases or retention.',
      no_automatic_legal_basis: true,
      no_automatic_retention: true,
    },
    contextual_sources: contextualSources,
    known_gaps: [
      'Only fields recognized by native heuristics or explicit blueprint PII metadata are included; free-text/JSON/linkability requires separate review.',
      'Native CREATE TABLE static inventory has parser limitations and is not proof of the complete migrated database.',
      'A blueprint retention parameter or literal is a source claim, not proof of operational deletion or legal sufficiency.',
      'DEVAI 2.6.3 does not consume this JSON registry. Native readings remain separate.',
    ],
    sources: [...sources]
      .sort(([a], [b]) => order(a, b))
      .map(([file, sha256]) => ({ path: file, sha256 })),
    fields,
  };
}

async function main() {
  const args = process.argv.slice(2),
    get = (flag: string) => args[args.indexOf(flag) + 1];
  if (!args.includes('--data-model') || !args.includes('--pii-model'))
    throw new Error(
      'Usage: export-pii.ts --data-model <native-data-model.json> --pii-model <native-data-model-pii.json> [--repo-root <repo>] [--output <json> | --check <json>]',
    );
  if (args.includes('--output') && args.includes('--check'))
    throw new Error('Choose --output or --check');
  const value = exportPii(
    args.includes('--repo-root') ? get('--repo-root') : process.cwd(),
    JSON.parse(fs.readFileSync(get('--data-model'), 'utf8')),
    JSON.parse(fs.readFileSync(get('--pii-model'), 'utf8')),
  );
  const text = await prettier.format(JSON.stringify(value), { parser: 'json' });
  if (args.includes('--check')) {
    if (fs.readFileSync(get('--check'), 'utf8') !== text)
      throw new Error('PII crosswalk is stale');
  } else if (args.includes('--output')) fs.writeFileSync(get('--output'), text);
  else process.stdout.write(text);
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  main();
