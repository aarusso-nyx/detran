/**
 * verify:generated-sql — prepares every SQL statement issued by the generated
 * blueprint repositories against the test database.
 *
 * Each repository listed in tools/blueprints/generated-files.json is
 * transpiled in memory, its runtime imports are replaced by inert stubs and
 * each generated operation (findAll, findOne, create, update, remove) is
 * driven with a recording transaction. Every captured statement is then
 * `PREPARE`d inside a rolled-back transaction, so a column used in a
 * `where`/`set`/`order by`/`returning` clause that does not exist in the
 * applied DDL fails here instead of on the request path.
 *
 * Requires DETRAN_TEST_DATABASE_URL (no fallback) pointing at a database with
 * the canonical DDL applied. It is part of backend:test:integration, not of the
 * database-free `pnpm check`.
 */
import fs from 'node:fs';
import path from 'node:path';

import pg from 'pg';
import ts from 'typescript';

interface CapturedStatement {
  file: string;
  line: number;
  operation: string;
  sql: string;
}

interface RecordingTransaction {
  query(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: Record<string, unknown>[] }>;
}

type RepositoryInstance = Record<string, unknown>;
type RepositoryClass = new (
  database: unknown,
  requestContext: unknown,
) => RepositoryInstance;

const root = process.cwd();
const connectionString = process.env.DETRAN_TEST_DATABASE_URL;
if (!connectionString) {
  console.error(
    'verify:generated-sql requires DETRAN_TEST_DATABASE_URL (no fallback).',
  );
  process.exit(2);
}

const KEY_PLACEHOLDER = '00000000-0000-4000-8000-000000000000';
const KEYED_OPERATIONS = ['findOne', 'update', 'remove'] as const;

class StubNotFoundException extends Error {}

const stubs: Record<string, Record<string, unknown>> = {
  '@nestjs/common': {
    Injectable: () => () => undefined,
    NotFoundException: StubNotFoundException,
  },
  '@stynx-nyx/core': { RequestContext: class RequestContext {} },
  '@stynx-nyx/data': { Database: class Database {} },
  '@detran/shared': {
    withTenantContext: () => {
      throw new Error('generated repository escaped the recording transaction');
    },
  },
};

function stubRequire(specifier: string): Record<string, unknown> {
  const stub = stubs[specifier];
  if (!stub)
    throw new Error(`unexpected runtime import in repository: ${specifier}`);
  return stub;
}

function stringLiterals(
  source: ts.SourceFile,
): { text: string; line: number }[] {
  const found: { text: string; line: number }[] = [];
  const visit = (node: ts.Node): void => {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node))
      found.push({
        text: node.text,
        line:
          source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1,
      });
    ts.forEachChild(node, visit);
  };
  visit(source);
  return found;
}

function lineOf(
  literals: { text: string; line: number }[],
  sql: string,
): number {
  let best: { text: string; line: number } | undefined;
  for (const literal of literals)
    if (
      literal.text.length >= 8 &&
      sql.includes(literal.text) &&
      (!best || literal.text.length > best.text.length)
    )
      best = literal;
  return best?.line ?? 0;
}

function loadRepository(relative: string): {
  classes: [string, RepositoryClass][];
  writable: string[];
  literals: { text: string; line: number }[];
} {
  const file = path.join(root, relative);
  const code = fs.readFileSync(file, 'utf8');
  const source = ts.createSourceFile(
    file,
    code,
    ts.ScriptTarget.ES2022,
    true,
    ts.ScriptKind.TS,
  );
  const output = ts.transpileModule(code, {
    fileName: file,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      experimentalDecorators: true,
      emitDecoratorMetadata: false,
    },
  }).outputText;
  const exported: Record<string, unknown> = {};
  const moduleObject = { exports: exported };
  const probe = `${output}\nmodule.exports.__generatedSqlWritableFields = typeof WRITABLE_FIELDS === 'undefined' ? undefined : [...WRITABLE_FIELDS];`;
  new Function('require', 'exports', 'module', probe)(
    stubRequire,
    exported,
    moduleObject,
  );
  const writable = moduleObject.exports.__generatedSqlWritableFields;
  if (!Array.isArray(writable))
    throw new Error(`${relative}: WRITABLE_FIELDS not found`);
  const classes = Object.entries(moduleObject.exports).filter(
    (entry): entry is [string, RepositoryClass] =>
      entry[0].endsWith('Repository') && typeof entry[1] === 'function',
  );
  if (!classes.length) throw new Error(`${relative}: no repository class`);
  return {
    classes,
    writable: writable.map(String),
    literals: stringLiterals(source),
  };
}

async function capture(relative: string): Promise<CapturedStatement[]> {
  const { classes, writable, literals } = loadRepository(relative);
  const statements: CapturedStatement[] = [];
  for (const [, Repository] of classes) {
    const repository = new Repository({}, {});
    const dto = Object.fromEntries(
      writable.map((field) => [field, KEY_PLACEHOLDER]),
    );
    const run = async (
      operation: string,
      call: (tx: RecordingTransaction) => Promise<unknown>,
    ): Promise<void> => {
      const tx: RecordingTransaction = {
        query: async (sql) => {
          statements.push({
            file: relative,
            line: lineOf(literals, sql),
            operation,
            sql,
          });
          return { rows: [{}] };
        },
      };
      await call(tx);
    };
    const method = (name: string) => {
      const value = repository[name];
      return typeof value === 'function'
        ? (value as (...args: unknown[]) => Promise<unknown>).bind(repository)
        : undefined;
    };
    const findAll = method('findAll');
    const create = method('create');
    if (!findAll || !create)
      throw new Error(`${relative}: findAll/create missing`);
    await run('findAll', (tx) => findAll(tx));
    if (writable.length) await run('create', (tx) => create(dto, tx));
    for (const name of KEYED_OPERATIONS) {
      const keyed = method(name);
      if (!keyed) continue;
      if (name === 'update') {
        if (writable.length)
          await run(name, (tx) => keyed(KEY_PLACEHOLDER, dto, tx));
      } else await run(name, (tx) => keyed(KEY_PLACEHOLDER, tx));
    }
  }
  return statements;
}

const manifest = JSON.parse(
  fs.readFileSync(
    path.join(root, 'tools/blueprints/generated-files.json'),
    'utf8',
  ),
) as string[];
const repositories = manifest.filter((file) => file.endsWith('.repository.ts'));
if (!repositories.length)
  throw new Error('no generated repositories in the manifest');

const statements: CapturedStatement[] = [];
for (const relative of repositories)
  statements.push(...(await capture(relative)));

const client = new pg.Client({ connectionString });
await client.connect();
const failures: (CapturedStatement & { error: string })[] = [];
const verbose = process.argv.includes('--verbose');
if (verbose) {
  console.log('| file:line | operation | statement | result |');
  console.log('| --- | --- | --- | --- |');
}
try {
  await client.query('begin');
  for (const statement of statements) {
    await client.query('savepoint generated_sql');
    try {
      await client.query(`prepare generated_sql as ${statement.sql}`);
      await client.query('deallocate generated_sql');
      await client.query('release savepoint generated_sql');
      if (verbose)
        console.log(
          `| ${statement.file}:${statement.line} | ${statement.operation} | \`${statement.sql}\` | ok |`,
        );
    } catch (error) {
      await client.query('rollback to savepoint generated_sql');
      const detail = error as { code?: string; message?: string };
      failures.push({
        ...statement,
        error: `${detail.code ?? '?'} ${detail.message ?? String(error)}`,
      });
    }
  }
} finally {
  await client.query('rollback').catch(() => undefined);
  await client.end();
}

if (failures.length) {
  console.error(
    `verify:generated-sql failed: ${failures.length} of ${statements.length} generated statements do not prepare against the applied DDL`,
  );
  console.error('| file:line | operation | statement | error |');
  console.error('| --- | --- | --- | --- |');
  for (const failure of failures)
    console.error(
      `| ${failure.file}:${failure.line} | ${failure.operation} | \`${failure.sql}\` | ${failure.error} |`,
    );
  process.exit(1);
}
console.log(
  `verify:generated-sql passed: ${statements.length} statements from ${repositories.length} generated repositories prepare against the applied DDL`,
);
