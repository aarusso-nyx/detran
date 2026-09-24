#!/usr/bin/env node
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { format } from '../../node_modules/prettier/index.mjs';
import { parseCatalogue } from './parser.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2);
const value = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : fallback;
};
const source = resolve(
  value('--source', join(root, 'docs/framework/arch/parameter-catalogue.md')),
);
const out = resolve(value('--out-dir', root));
const customOutput = args.includes('--out-dir');
function sql(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}
function sqlJson(value) {
  return sql(JSON.stringify(value));
}
function firstInstallationDate(entry) {
  if (entry.key !== 'teat.bootstrap.snapshot_max_age_seconds') {
    return sql('2026-09-13');
  }
  return `COALESCE((SELECT MIN(p.effective_from) FROM ops.parameter p WHERE p.tenant_id = ${sql('00000000-0000-7000-8000-00000000a001')} AND p.traffic_agency_id IS NULL AND p.scope = 'tenant' AND p.surface = ${sql(entry.surface)} AND p.key = ${sql(entry.key)}), CURRENT_DATE)`;
}
function renderSeed(model) {
  const rows = model.entries
    .map((entry) => {
      return `(${sql('00000000-0000-7000-8000-00000000a001')}, NULL, 'tenant', ${sql(entry.surface)}, ${sql(entry.key)}, ${sqlJson(entry.value_json)}, ${sql(entry.value_type)}, ${sql(entry.status)}, ${entry.source_pending}, ${entry.legal_readonly}, ${sql(entry.decision_ref)}, NULL, 'ARCH-PARAMETER-CATALOGUE', 1, ${firstInstallationDate(entry)}, ${sql('00000000-0000-4000-8000-0000b0000016')}, now())`;
    })
    .join(',\n');
  return `-- Generated from parameter-catalogue.md sha256:${model.sourceHash}\n-- Applied by backend/database/seed.sh after apply.sh: the tenant context below satisfies auth.enforce_tenant_id().\nselect set_config('app.role', 'owner', false);\nselect set_config('app.tenant_id', '00000000-0000-7000-8000-00000000a001', false);\nINSERT INTO ops.parameter\n  (tenant_id, traffic_agency_id, scope, surface, key, value_json, value_type, status, source_pending, legal_readonly, decision_ref, legal_basis, reason, version, effective_from, changed_by, created_at)\nVALUES\n${rows}\nON CONFLICT (tenant_id, coalesce(traffic_agency_id, '00000000-0000-0000-0000-000000000000'::uuid), surface, key, effective_from) DO NOTHING;\n`;
}
function renderCatalogue(model) {
  const entries = model.entries.map(({ line, ...entry }) => ({
    ...entry,
    provenance: { line },
  }));
  return `// Generated from parameter-catalogue.md sha256:${model.sourceHash}\nexport const PARAMETER_CATALOGUE_SOURCE_SHA256 = '${model.sourceHash}';\nexport const PARAMETER_CATALOGUE = ${JSON.stringify(entries, null, 2)} as const;\n`;
}
function renderFlags(model) {
  const flags = Object.fromEntries(
    model.entries
      .filter((entry) => entry.value_type === 'F' && !entry.legal_readonly)
      .map((entry) => [entry.key, entry.value_json]),
  );
  return `// Generated from parameter-catalogue.md sha256:${model.sourceHash}\nexport const PARAMETER_FLAGS_SOURCE_SHA256 = '${model.sourceHash}';\nexport const PARAMETER_FLAGS = ${JSON.stringify(flags, null, 2)} as const;\n`;
}
async function atomic(path, content) {
  await mkdir(dirname(path), { recursive: true });
  try {
    if ((await readFile(path, 'utf8')) === content) return;
  } catch {}
  const temp = `${path}.tmp-${process.pid}`;
  await writeFile(temp, content);
  await rename(temp, path);
}
async function formatTypeScript(content) {
  return format(content, {
    parser: 'typescript',
    singleQuote: true,
    trailingComma: 'all',
  });
}
try {
  const model = await parseCatalogue(source);
  await atomic(
    customOutput
      ? join(out, '05-parameters.sql')
      : join(root, 'backend/database/seed/05-parameters.sql'),
    renderSeed(model),
  );
  const cataloguePath = customOutput
    ? join(out, 'parameter-catalogue.ts')
    : join(
        root,
        'backend/domains/ops/parameter/src/generated/parameter-catalogue.ts',
      );
  const flagsPath = customOutput
    ? join(out, 'parameter-flags.ts')
    : join(root, 'backend/app/src/generated/parameter-flags.ts');
  await atomic(cataloguePath, await formatTypeScript(renderCatalogue(model)));
  await atomic(flagsPath, await formatTypeScript(renderFlags(model)));
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
