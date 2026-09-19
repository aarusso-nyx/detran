#!/usr/bin/env node
import { mkdtemp, readFile, readdir, rm, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { parseCatalogue } from './parser.mjs';
const root = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const realCataloguePath = join(
  root,
  'docs/framework/arch/parameter-catalogue.md',
);
const sourceOption = process.argv.includes('--source')
  ? process.argv[process.argv.indexOf('--source') + 1]
  : undefined;
const catalogueOption = process.argv.includes('--catalogue')
  ? process.argv[process.argv.indexOf('--catalogue') + 1]
  : undefined;
const generatedRootOption = process.argv.includes('--generated-root')
  ? process.argv[process.argv.indexOf('--generated-root') + 1]
  : undefined;
// `--source` keeps its two historical meanings: the catalogue to generate
// from for `--check-generated`, and the file/directory to scan for
// `--check-usage`. `--catalogue` is the single, explicit way to pick the
// catalogue the model is built from for every mode; it defaults to the real
// catalogue for `--check-usage` (where `--source` means the scan target) and
// to `--source` (or the real catalogue) otherwise.
const sourceArg = sourceOption ?? realCataloguePath;
const catalogueArg =
  catalogueOption ??
  (process.argv.includes('--check-usage') ? realCataloguePath : sourceArg);
const model = await parseCatalogue(catalogueArg).catch((error) => {
  console.error(error.message);
  process.exit(1);
});
const generated = [
  generatedRootOption
    ? join(resolve(generatedRootOption), '05-parameters.sql')
    : join(root, 'backend/database/seed/05-parameters.sql'),
  generatedRootOption
    ? join(resolve(generatedRootOption), 'parameter-catalogue.ts')
    : join(
        root,
        'backend/domains/ops/parameter/src/generated/parameter-catalogue.ts',
      ),
  generatedRootOption
    ? join(resolve(generatedRootOption), 'parameter-flags.ts')
    : join(root, 'backend/app/src/generated/parameter-flags.ts'),
];

function sql(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

async function verifyLegalReadonly() {
  const legalEntries = model.entries.filter((entry) => entry.legal_readonly);
  if (legalEntries.length === 0) {
    console.error(
      'legal_readonly verification requires at least one legal entry',
    );
    process.exitCode = 1;
    return;
  }

  const [seedPath, cataloguePath, flagsPath] = generated;
  let seed;
  let catalogue;
  let flags;
  try {
    [seed, catalogue, flags] = await Promise.all([
      readFile(seedPath, 'utf8'),
      readFile(cataloguePath, 'utf8'),
      readFile(flagsPath, 'utf8'),
    ]);
  } catch (error) {
    console.error(
      `legal_readonly verification cannot read generated artifact: ${error instanceof Error ? error.message : error}`,
    );
    process.exitCode = 1;
    return;
  }

  for (const entry of legalEntries) {
    const seedRow = `${sql(entry.key)}, ${sql(JSON.stringify(entry.value_json))}, ${sql(entry.value_type)}, ${sql(entry.status)}, ${entry.source_pending}, true, ${sql(entry.decision_ref)}`;
    if (!seed.includes(seedRow)) {
      console.error(`legal_readonly not preserved in seed: ${entry.key}`);
      process.exitCode = 1;
    }
    const key = entry.key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const preservedInCatalogue = new RegExp(
      `key: '${key}'(?:(?!\\n  },)[\\s\\S])*?legal_readonly: true,`,
    );
    if (!preservedInCatalogue.test(catalogue)) {
      console.error(`legal_readonly not preserved in catalogue: ${entry.key}`);
      process.exitCode = 1;
    }
    if (flags.includes(entry.key)) {
      console.error(`legal_readonly exposed as editable flag: ${entry.key}`);
      process.exitCode = 1;
    }
  }

  const contract = await readFile(
    join(root, 'docs/framework/arch/ops-parameter-command-contract.md'),
    'utf8',
  );
  if (
    !contract.includes('legal_readonly=true') ||
    !contract.includes(
      'Linhas `legal_readonly` não são alteráveis pela API.',
    ) ||
    /\blegalReadonly\b/.test(contract)
  ) {
    console.error(
      'legal_readonly contract is missing or exposes an editable field',
    );
    process.exitCode = 1;
  }
}

if (process.argv.includes('--check-generated')) {
  const temp = await mkdtemp(join(tmpdir(), 'parameter-verify-'));
  const result = spawnSync(
    process.execPath,
    [
      join(root, 'tools/parameters/generate-seed.mjs'),
      '--source',
      catalogueArg,
      '--out-dir',
      temp,
    ],
    { encoding: 'utf8' },
  );
  if (result.status !== 0) {
    console.error(result.stderr);
    process.exit(1);
  }
  for (const [index, path] of generated.entries()) {
    let actual;
    try {
      actual = await readFile(path, 'utf8');
    } catch {
      console.error(`generated missing: ${path}`);
      process.exitCode = 1;
      continue;
    }
    const expected = await readFile(
      join(
        temp,
        ['05-parameters.sql', 'parameter-catalogue.ts', 'parameter-flags.ts'][
          index
        ],
      ),
      'utf8',
    );
    if (actual !== expected) {
      console.error(`generated stale: ${path}`);
      process.exitCode = 1;
    }
  }
  await rm(temp, { recursive: true, force: true });
  await verifyLegalReadonly();
}
if (process.argv.includes('--check-usage')) {
  const target = resolve(sourceOption ?? root);
  const known = new Set(model.entries.map((entry) => entry.key));
  const i18nNamespaces = new Set(
    model.i18nNamespaces.map((namespace) => namespace.namespace),
  );
  const prefixes = [
    'rait',
    'collection',
    'deadline',
    'session',
    'teat',
    'sync',
    'portal',
    'privacy',
    'est',
    'dashboard',
  ];
  let usageErrors = 0;
  // M10 (work/rounds/R-0014/plan.md; OD-P46): the only isolation for a
  // literal that is not a known parameter key is the i18n namespace
  // allowlist in §Namespaces i18n of parameter-catalogue.md — never a
  // directory exclusion. The scan covers every directory of the repository;
  // only tests, dist and node_modules are ignored.
  function isI18nLiteral(parts) {
    return parts.length >= 3 && i18nNamespaces.has(`${parts[0]}.${parts[1]}`);
  }
  async function walk(dir) {
    for (const item of await readdir(dir, { withFileTypes: true })) {
      if (['tests', 'dist', 'node_modules'].includes(item.name)) continue;
      const path = join(dir, item.name);
      if (item.isDirectory()) await walk(path);
      else if (/\.(?:ts|js|mjs|tsx|jsx)$/.test(item.name)) {
        const text = await readFile(path, 'utf8');
        for (const match of text.matchAll(
          /['"]([a-z]+\.[A-Za-z0-9_.-]+)['"]/g,
        )) {
          const literal = match[1];
          const parts = literal.split('.');
          if (known.has(literal)) continue;
          if (isI18nLiteral(parts)) continue;
          if (parts.length >= 3 && prefixes.includes(parts[0])) {
            usageErrors += 1;
            console.error(`${path}: unknown parameter literal ${literal}`);
          }
        }
      }
    }
  }
  if ((await stat(target)).isDirectory()) await walk(target);
  else {
    const text = await readFile(target, 'utf8');
    for (const match of text.matchAll(/['"]([a-z]+\.[A-Za-z0-9_.-]+)['"]/g)) {
      const literal = match[1];
      const parts = literal.split('.');
      if (
        !known.has(literal) &&
        !isI18nLiteral(parts) &&
        parts.length >= 3 &&
        prefixes.includes(parts[0])
      ) {
        usageErrors += 1;
        console.error(`${target}: unknown parameter literal ${literal}`);
      }
    }
  }
  if (usageErrors) process.exitCode = 1;
}
if (!process.exitCode)
  console.log(
    `verify:parameter-catalogue: OK (${model.entries.length} entries, ${model.entries.filter((entry) => entry.value_type === 'F').length} flags, ${model.i18nNamespaces.length} i18n namespaces, 0 errors)`,
  );
