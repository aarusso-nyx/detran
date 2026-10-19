import { createHash } from 'node:crypto';
import { readFileSync, realpathSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const usage =
  'security:exports:check --api-map <native-api-map.json> --data-model <native-data-model.json> --pii-model <native-data-model-pii.json> [--repo-root <repo>] OR --snapshots-only [--repo-root <repo>]';
function options(argv) {
  const result = {};
  const values = new Set([
    '--api-map',
    '--data-model',
    '--pii-model',
    '--repo-root',
  ]);
  for (let index = 0; index < argv.length; index++) {
    const flag = argv[index];
    if (flag === '--') continue;
    if (flag === '--snapshots-only') {
      if (result[flag]) throw new Error(`Duplicate option: ${flag}`);
      result[flag] = true;
    } else if (values.has(flag)) {
      if (result[flag] || !argv[index + 1] || argv[index + 1].startsWith('--'))
        throw new Error(`Missing/duplicate option value: ${flag}`);
      result[flag] = argv[++index];
    } else throw new Error(`Unknown option ${flag}. ${usage}`);
  }
  const supplied = ['--api-map', '--data-model', '--pii-model'].filter(
    (flag) => result[flag],
  );
  if (result['--snapshots-only'] ? supplied.length > 0 : supplied.length !== 3)
    throw new Error(
      `Choose explicit native input paths or explicit snapshots-only scope. ${usage}`,
    );
  return result;
}
const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');
function assert(condition, message) {
  if (!condition) throw new Error(message);
}
function unique(rows, key, label) {
  const values = rows.map(key);
  assert(new Set(values).size === values.length, `Duplicate ${label}`);
}
function counts(actual, expected, label) {
  for (const [key, value] of Object.entries(expected))
    assert(
      actual[key] === value,
      `${label}.${key}: declared ${actual[key]}, observed ${value}`,
    );
}
function inside(root, file) {
  assert(!path.isAbsolute(file), `Absolute source path: ${file}`);
  const absolute = realpathSync(path.resolve(root, file));
  const relative = path.relative(root, absolute);
  assert(
    relative !== '..' &&
      !relative.startsWith(`..${path.sep}`) &&
      !path.isAbsolute(relative),
    `Source escapes repository: ${file}`,
  );
  return absolute;
}
function provenance(root, value) {
  unique(value.sources, (row) => row.path, 'source path');
  const sourcePaths = new Set(value.sources.map((row) => row.path));
  for (const row of value.sources)
    assert(
      digest(readFileSync(inside(root, row.path))) === row.sha256,
      `Stale source digest: ${row.path}`,
    );
  const reference = (file) =>
    assert(sourcePaths.has(file), `Reference lacks hashed source: ${file}`);
  if (value.endpoints) {
    value.controls.forEach((row) => reference(row.file));
    value.test_references.forEach((row) => reference(row.file));
    value.endpoints.forEach((row) => {
      reference(row.source.path);
      assert(
        row.source.end_line >= row.source.start_line,
        `Invalid handler span: ${row.native_id}`,
      );
      if (row.public_review)
        [...row.public_review.sources, ...row.public_review.tests].forEach(
          reference,
        );
      if (row.binding === 'conditional-policy-reference')
        assert(
          row.policy_key === `${row.resource}:${row.action}`,
          `Policy key mismatch: ${row.native_id}`,
        );
    });
  } else {
    value.contextual_sources.forEach((row) => reference(row.path));
    value.fields.forEach((row) => {
      row.blueprint_sources.forEach((item) => reference(item.source.path));
      if (row.sql) {
        assert(
          row.id === `${row.sql.schema}.${row.sql.table}.${row.sql.column}`,
          `SQL identity mismatch: ${row.id}`,
        );
        row.sql.evidence.forEach((item) => {
          reference(item.path);
          assert(item.endLine >= item.startLine, `Invalid DDL span: ${row.id}`);
        });
      }
      assert(
        row.pending.length
          ? typeof row.owner_question === 'string' &&
              row.owner_question.length > 0
          : row.owner_question === null,
        `Pending question mismatch: ${row.id}`,
      );
    });
  }
}
function populations(authorization, pii) {
  const endpoints = authorization.endpoints;
  unique(endpoints, (row) => row.native_id, 'native endpoint identity');
  unique(
    endpoints,
    (row) => `${row.source.path}#${row.source.symbol}`,
    'source handler',
  );
  unique(authorization.controls, (row) => row.id, 'control identity');
  const count = (predicate) => endpoints.filter(predicate).length;
  counts(
    authorization.population,
    {
      total: endpoints.length,
      application_policy: count(
        (row) => row.binding === 'conditional-policy-reference',
      ),
      application_public: count((row) => row.binding === 'declared-public'),
      mock: count((row) => row.population === 'mock'),
      test_fixture: count((row) => row.population === 'test-fixture'),
      other: count((row) => row.population === 'other'),
      unresolved_application: count(
        (row) =>
          row.population === 'application' && row.binding === 'unresolved',
      ),
    },
    'authorization.population',
  );
  assert(
    Object.entries(authorization.population)
      .filter(([key]) => key !== 'total')
      .reduce((sum, [, number]) => sum + number, 0) === endpoints.length,
    'Endpoint groups do not reconcile',
  );
  const fields = pii.fields;
  unique(fields, (row) => row.id, 'PII field identity');
  const tally = (predicate) => fields.filter(predicate).length;
  counts(
    pii.population,
    {
      native_candidates: tally((row) => row.native_name_candidate),
      blueprint_fields: tally((row) => row.blueprint_sources.length > 0),
      blueprint_matched_native: tally(
        (row) => row.native_name_candidate && row.blueprint_sources.length > 0,
      ),
      blueprint_outside_native_heuristic: tally(
        (row) => !row.native_name_candidate && row.blueprint_sources.length > 0,
      ),
      known_field_union: fields.length,
      blueprint_without_sql: tally((row) => !row.sql_present),
      state_candidates: tally(
        (row) => row.native_name_candidate && row.sql?.column === 'state',
      ),
      cnpj_candidates: tally(
        (row) => row.native_name_candidate && row.sql?.column === 'cnpj',
      ),
      pending_fields: tally((row) => row.pending.length > 0),
    },
    'pii.population',
  );
  assert(
    pii.population.sql_columns >= tally((row) => row.sql_present),
    'PII union exceeds SQL column population',
  );
  assert(
    pii.population.sql_tables >=
      new Set(
        fields
          .filter((row) => row.sql)
          .map((row) => `${row.sql.schema}.${row.sql.table}`),
      ).size,
    'PII union exceeds SQL table population',
  );
}
function runExporter(root, filename, args) {
  const result = spawnSync(
    process.execPath,
    [
      '--import',
      'tsx',
      `tools/security/${filename}`,
      '--repo-root',
      root,
      ...args,
    ],
    { cwd: root, encoding: 'utf8' },
  );
  if (result.error) throw result.error;
  if (result.status !== 0)
    throw new Error(
      `${filename} deterministic check failed:\n${result.stdout}\n${result.stderr}`,
    );
}
function main() {
  const opts = options(process.argv.slice(2));
  const root = realpathSync(
    opts['--repo-root'] ?? fileURLToPath(new URL('../../', import.meta.url)),
  );
  const requireDevai = createRequire(
    realpathSync(
      path.join(root, 'node_modules/@aarusso-nyx/devai/package.json'),
    ),
  );
  const Ajv = requireDevai('ajv/dist/2020.js').default;
  const ajv = new Ajv({ strict: true, allErrors: true });
  requireDevai('ajv-formats')(ajv);
  // Native DEVAI schemas carry this annotation; it constrains no document field.
  ajv.addKeyword({
    keyword: 'schema_version',
    schemaType: 'string',
    valid: true,
  });
  const documents = [
    ['authorization', 'authorization-crosswalk'],
    ['pii-registry', 'pii-registry'],
  ].map(([name, schema]) => {
    const value = JSON.parse(
      readFileSync(path.join(root, `law/security/${name}.json`), 'utf8'),
    );
    const validate = ajv.compile(
      JSON.parse(
        readFileSync(
          path.join(root, `docs/framework/schemas/${schema}.schema.json`),
          'utf8',
        ),
      ),
    );
    assert(
      validate(value),
      `${name} schema rejected: ${JSON.stringify(validate.errors)}`,
    );
    provenance(root, value);
    return value;
  });
  populations(...documents);
  if (opts['--snapshots-only']) {
    console.log(
      'PASS snapshot schemas, source digests, references and population reconciliation. Scope: snapshots-only; native input regeneration NOT EXECUTED. This is not a native sensor verdict.',
    );
    return;
  }
  const input = (flag) => path.resolve(opts[flag]);
  const nativeValidators = new Map();
  for (const [flag, schema] of [
    ['--api-map', 'api-map'],
    ['--data-model', 'data-model-inventory'],
    ['--pii-model', 'data-model-inventory'],
  ]) {
    if (!nativeValidators.has(schema))
      nativeValidators.set(
        schema,
        ajv.compile(
          JSON.parse(
            readFileSync(
              path.join(root, `law/schemas/${schema}.schema.json`),
              'utf8',
            ),
          ),
        ),
      );
    const validate = nativeValidators.get(schema);
    assert(
      validate(JSON.parse(readFileSync(input(flag), 'utf8'))),
      `${flag} native body schema rejected: ${JSON.stringify(validate.errors)}`,
    );
  }
  runExporter(root, 'export-authorization.ts', [
    '--api-map',
    input('--api-map'),
    '--check',
    'law/security/authorization.json',
  ]);
  runExporter(root, 'export-pii.ts', [
    '--data-model',
    input('--data-model'),
    '--pii-model',
    input('--pii-model'),
    '--check',
    'law/security/pii-registry.json',
  ]);
  console.log(
    'PASS snapshot schemas, provenance, populations and both deterministic exporter checks against the three explicit native inputs. This is not a native sensor verdict or legal validation.',
  );
}
try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
