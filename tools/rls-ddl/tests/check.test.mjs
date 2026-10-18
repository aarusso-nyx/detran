import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { analyzeRlsCoverage } from '../../rls-ddl-lexical.mjs';

// ADR-0002: every source-declared tenant table needs an executable policy signal;
// quoted or stored SQL cannot supply that signal. This is a source inventory,
// while backend RLS smoke tests establish database enforcement.
const table =
  'CREATE TABLE IF NOT EXISTS public.accounts (id uuid, tenant_id uuid NOT NULL);';
const helper = "SELECT auth.create_rls_policy('public', 'accounts');";
const analyze = (sql, exemptions = []) =>
  analyzeRlsCoverage([{ name: 'fixture.sql', sql }], exemptions);
test('executable helper covers a tenant table across files', () => {
  assert.deepEqual(
    analyzeRlsCoverage([
      { name: 'table.sql', sql: table },
      { name: 'policy.sql', sql: helper },
    ]).missingTables,
    [],
  );
  assert.deepEqual(analyze(table + helper).coveredTables, ['public.accounts']);
});
test('comments, strings and procedural bodies cannot impersonate applied policy', () => {
  for (const decoy of [
    `-- ${helper}\n`,
    `/* outer /* nested */ ${helper} */`,
    `SELECT '${helper.replaceAll("'", "''")}';`,
    `SELECT $body$${helper}$body$;`,
    `DO $body$ BEGIN ${helper} END $body$;`,
  ])
    assert.deepEqual(
      analyze(table + decoy).missingTables,
      ['public.accounts'],
      decoy,
    );
});
test('only a real tenant column creates an obligation', () => {
  for (const column of [
    "note text DEFAULT 'tenant_id'",
    'id uuid /* tenant_id uuid */',
    'tenant_id_suffix uuid',
  ]) {
    assert.deepEqual(
      analyze(`CREATE TABLE public.notes (${column});`).tenantTables,
      [],
    );
  }
  assert.deepEqual(
    analyze('CREATE TABLE public.notes (tenant_id uuid, amount numeric(10,2));')
      .missingTables,
    ['public.notes'],
  );
});
test('quoted identifiers retain SQL identity', () => {
  const sql = `CREATE TABLE "Mixed"."Accounts" ("tenant_id" uuid); SELECT auth.create_rls_policy('Mixed', 'Accounts');`;
  assert.deepEqual(analyze(sql).missingTables, []);
  assert.equal(analyze(sql).tenantTables.length, 1);
});
test('exemptions are exact', () => {
  const result = analyze(
    table + 'CREATE TABLE portal.public_hostname (tenant_id uuid);',
    ['portal.public_hostname'],
  );
  assert.deepEqual(result.exemptTables, ['portal.public_hostname']);
  assert.deepEqual(result.missingTables, ['public.accounts']);
});
test('nonliteral and differently qualified calls cannot claim coverage', () => {
  for (const call of [
    "SELECT other.create_rls_policy('public','accounts');",
    "SELECT auth.create_rls_policy('public', name);",
    "SELECT auth.create_rls_policy('public','accounts',true);",
  ]) {
    assert.deepEqual(analyze(table + call).missingTables, ['public.accounts']);
  }
});
test('unterminated lexical constructs fail closed', () => {
  for (const suffix of [
    '/* open',
    "SELECT 'open",
    'SELECT $tag$open',
    'CREATE TABLE "open',
  ])
    assert.throws(() => analyze(table + suffix));
});

test('CR-only line comments end before executable policy', () => {
  assert.deepEqual(
    analyze(table + '-- a comment\r' + helper).missingTables,
    [],
  );
});

test('stored SQL-standard bodies require explicit classification', () => {
  for (const declaration of [
    'CREATE FUNCTION auth.deferred() RETURNS void',
    'CREATE OR REPLACE FUNCTION auth.deferred() RETURNS void',
    'CREATE PROCEDURE auth.deferred()',
  ]) {
    assert.throws(
      () =>
        analyze(
          table + `${declaration} LANGUAGE SQL BEGIN ATOMIC ${helper} END;`,
        ),
      /fixture\.sql: SQL-standard routine body requires classification/,
    );
  }
});

test('stored rule actions cannot impersonate applied policy', () => {
  for (const declaration of ['CREATE RULE', 'CREATE OR REPLACE RULE']) {
    assert.deepEqual(
      analyze(
        table +
          `${declaration} deferred AS ON INSERT TO public.accounts DO ALSO (SELECT 1; ${helper});`,
      ).missingTables,
      ['public.accounts'],
    );
  }
});

test('COPY stdin data requires classification before raw rows can impersonate SQL', () => {
  assert.throws(
    () => analyze(table + `COPY public.imported FROM STDIN;\n${helper}\n\\.\n`),
    /fixture\.sql: COPY FROM STDIN .*classification/,
  );
});

test('conditional and embedded helper expressions cannot claim coverage', () => {
  for (const call of [
    `${helper.slice(0, -1)} WHERE false;`,
    "SELECT CASE WHEN false THEN auth.create_rls_policy('public','accounts') END;",
    `EXPLAIN ${helper}`,
    `CREATE VIEW public.deferred AS ${helper}`,
    `WITH deferred AS (${helper.slice(0, -1)}) SELECT 1;`,
    "SELECT auth.create_rls_policy('public','accounts')::text;",
    "SELECT auth.create_rls_policy(E'public','accounts');",
  ]) {
    assert.deepEqual(
      analyze(table + call).missingTables,
      ['public.accounts'],
      call,
    );
  }
});

test('escaped and dollar-quoted bodies preserve statement boundaries', () => {
  for (const decoy of [
    String.raw`SELECT E'escaped \\ \' ; SELECT auth.create_rls_policy(''public'',''accounts'');';`,
    `SELECT $$${helper}$$;`,
    `SELECT $outer$ inner $other$ ${helper} $outer$;`,
    `CREATE FUNCTION auth.deferred() RETURNS void LANGUAGE SQL AS '${helper.replaceAll("'", "''")}';`,
    `DO $body$ BEGIN RAISE NOTICE ';'; ${helper} END $body$;`,
  ]) {
    assert.deepEqual(
      analyze(table + decoy).missingTables,
      ['public.accounts'],
      decoy,
    );
    assert.deepEqual(analyze(table + decoy + helper).missingTables, [], decoy);
  }
});

test('newline continuations inherit escape-string boundaries', () => {
  const decoy =
    "SELECT E'first'\n'\\'; SELECT auth.create_rls_policy('public','accounts'); --';";
  assert.deepEqual(analyze(table + decoy).coveredTables, []);
  assert.deepEqual(analyze(table + decoy).missingTables, ['public.accounts']);
  assert.deepEqual(analyze(table + decoy + '\n' + helper).missingTables, []);
});

test('ordinary newline string continuations preserve literal identity', () => {
  const result = analyze(
    table + "SELECT auth.create_rls_policy('pub'\n'lic', 'acc'\r\n'ounts');",
  );
  assert.deepEqual(result.coveredTables, ['public.accounts']);
  assert.deepEqual(result.missingTables, []);
});

test('comments and case do not hide executable SQL', () => {
  const result = analyze(`
    /* CREATE TABLE decoy.fake (tenant_id uuid); */
    CrEaTe /* header */ UnLoGgEd TABLE IF NOT EXISTS PUBLIC.ACCOUNTS (
      id uuid DEFAULT gen_random_uuid(),
      /* column */ tenant_id uuid,
      amount numeric(10, 2),
      CONSTRAINT tenant_key UNIQUE (tenant_id, id)
    );
    SeLeCt "auth" /* qualifier */ . "create_rls_policy" ('public', 'accounts');
  `);
  assert.deepEqual(result.tenantTables, ['public.accounts']);
  assert.deepEqual(result.coveredTables, ['public.accounts']);
  assert.deepEqual(result.missingTables, []);
});

test('quoted case and punctuation cannot alias another table or exemption', () => {
  for (const [sql, expected] of [
    [
      `CREATE TABLE "Public".accounts (tenant_id uuid); ${helper}`,
      '"Public".accounts',
    ],
    [
      `CREATE TABLE public."Accounts" (tenant_id uuid); ${helper}`,
      'public."Accounts"',
    ],
    [
      `CREATE TABLE "public.accounts".other (tenant_id uuid); ${helper}`,
      '"public.accounts".other',
    ],
    [`CREATE TABLE public."odd""name" (tenant_id uuid);`, 'public."odd""name"'],
  ]) {
    assert.deepEqual(analyze(sql, ['public.accounts']).missingTables, [
      expected,
    ]);
  }
  assert.deepEqual(
    analyze('CREATE TABLE public.accounts ("TENANT_ID" uuid);').tenantTables,
    [],
  );
});

test('nested expressions, constraints and decoy tables do not create obligations', () => {
  const result = analyze(`
    CREATE TABLE public.notes (
      id uuid, amount numeric(10,2),
      note text DEFAULT 'CREATE TABLE public.decoy (tenant_id uuid);',
      CONSTRAINT tenant_id UNIQUE (id, amount),
      CHECK (note <> 'tenant_id')
    );
    SELECT '${table.replaceAll("'", "''")}';
    DO $body$ BEGIN ${table} END $body$;
  `);
  assert.deepEqual(result.tenantTables, []);
});

test('ambiguous tenant identities and Unicode escapes fail closed with source names', () => {
  for (const sql of [
    'CREATE TABLE accounts (tenant_id uuid);',
    'CREATE TABLE public.accounts (tenant_id uuid;',
    'CREATE TABLE IF EXISTS public.accounts (tenant_id uuid);',
    `CREATE TABLE U&"public".accounts (tenant_id uuid);`,
    String.raw`SELECT auth.create_rls_policy(U&'public','accounts');`,
  ]) {
    assert.throws(() => analyze(sql), /fixture\.sql:/, sql);
  }
});

test('unquoted non-ASCII identifiers require classification while quoted identities work', () => {
  assert.throws(
    () => analyze('CREATE TABLE public.usuários (tenant_id uuid);'),
    /fixture\.sql: non-ASCII unquoted identifier requires explicit classification/,
  );
  assert.deepEqual(
    analyze(
      `-- usuários\nCREATE TABLE public."usuários" (tenant_id uuid, note text DEFAULT 'público'); SELECT auth.create_rls_policy('public', 'usuários');`,
    ).missingTables,
    [],
  );
});

test('inventory is deterministic across source order, duplicate signals and final statements', () => {
  const sources = [
    { name: 'z.sql', sql: 'CREATE TABLE public.z (tenant_id uuid)' },
    { name: 'a.sql', sql: table + table + helper + helper },
  ];
  const result = analyzeRlsCoverage(sources, ['public.z', 'public.z']);
  assert.deepEqual(result, {
    tenantTables: ['public.accounts', 'public.z'],
    coveredTables: ['public.accounts'],
    exemptTables: ['public.z'],
    missingTables: [],
  });
  assert.deepEqual(
    analyzeRlsCoverage([...sources].reverse(), ['public.z']),
    result,
  );
});

const repositoryRoot = fileURLToPath(new URL('../../../', import.meta.url));
test('current repository DDL stays covered and deleting a real policy is detected', () => {
  const ddlDirectory = path.join(repositoryRoot, 'backend/database/ddl');
  const sources = fs
    .readdirSync(ddlDirectory)
    .filter((name) => name.endsWith('.sql'))
    .map((name) => ({
      name,
      sql: fs.readFileSync(path.join(ddlDirectory, name), 'utf8'),
    }));
  const exemptions = ['portal.public_hostname', 'portal.brand_profile'];
  const result = analyzeRlsCoverage(sources, exemptions);
  assert.deepEqual(result.missingTables, []);
  assert.deepEqual(result.exemptTables, [...exemptions].sort());
  assert.ok(result.tenantTables.includes('ch.patient'));
  const removed = sources.map((source) => ({
    ...source,
    sql: source.sql.replace(
      /select auth\.create_rls_policy\('ch', 'patient'\);/i,
      '',
    ),
  }));
  assert.deepEqual(analyzeRlsCoverage(removed, exemptions).missingTables, [
    'ch.patient',
  ]);
});

test('CLI reports real gaps, respects named exemptions and rejects malformed SQL', (t) => {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'detran-rls-'));
  t.after(() => fs.rmSync(temporaryRoot, { recursive: true, force: true }));
  const ddlDirectory = path.join(temporaryRoot, 'backend/database/ddl');
  fs.mkdirSync(ddlDirectory, { recursive: true });
  const fixture = path.join(ddlDirectory, 'fixture.sql');
  const run = (sql) => {
    fs.writeFileSync(fixture, sql);
    return spawnSync(
      process.execPath,
      [path.join(repositoryRoot, 'tools/check-rls-ddl.ts')],
      {
        cwd: temporaryRoot,
        encoding: 'utf8',
      },
    );
  };
  const missing = run(table + `-- ${helper}`);
  assert.equal(missing.status, 1, missing.stderr);
  assert.match(
    missing.stderr,
    /public\.accounts: no auth\.create_rls_policy signal/,
  );
  const covered = run(table + helper);
  assert.equal(covered.status, 0, covered.stderr);
  assert.match(covered.stdout, /1 tenant tables covered, 0 exempt/);
  const exempt = run('CREATE TABLE portal.brand_profile (tenant_id uuid);');
  assert.equal(exempt.status, 0, exempt.stderr);
  assert.match(
    exempt.stdout,
    /0 tenant tables covered, 1 exempt by design: portal\.brand_profile/,
  );
  const malformed = run(table + '/* open');
  assert.equal(malformed.status, 1, malformed.stderr);
  assert.match(malformed.stderr, /fixture\.sql: unterminated block comment/);
});
