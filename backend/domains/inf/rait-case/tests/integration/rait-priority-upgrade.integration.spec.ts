// CTG-0001-C4-OD V3, F1/F8: the real apply is exercised against an isolated
// copy of the closed DDL inventory. Never patch a production SQL or apply file.
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  chmod,
  copyFile,
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const { Client } = pg;
const repo = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../../../..',
);
const databaseDir = join(repo, 'backend/database');
const manual = [
  '19-rait-priority-pre.sql',
  '19-rait-priority-enforce.sql',
  '19-rait-priority-verify.sql',
] as const;
type LegacyBaselineHarness = {
  prepareLegacyPriorityV1Baseline: () => Promise<void>;
  restoreFreshPriorityV3Database: () => Promise<void>;
};

async function legacyBaselineHarness(): Promise<LegacyBaselineHarness> {
  const moduleUrl = new URL(
    '../../../../../database/tests/prepare-rait-priority-v1-baseline.mjs',
    import.meta.url,
  );
  return (await import(moduleUrl.href)) as LegacyBaselineHarness;
}
const expectedDatabase = 'detran_r7_ctg1_a2';
const legacyCaseId = '00000000-0000-7000-8000-000010000020';
const unknownLegacyPriority = 'legacy_unmapped_task0028';
const tenantId = '00000000-0000-7000-8000-00000000a001';
const secretaryId = '00000000-0000-4000-8000-0000b0000005';
const assessedAt = '2026-09-16T12:00:00Z';
const expectedPolicy = {
  schemaVersion: 1,
  policyCode: 'ADR-0024-2026-09-16',
  basisRanks: { pcd: 2, age_80_plus: 2, age_60_plus: 1 },
  noneRank: 0,
  postProtocolRevision: 'forbidden',
};
const pcdDocumentId = '00000000-0000-7000-8000-000028100004';
const pcdDocumentHash = 'a'.repeat(64);
type QualificationScenario = {
  label: string;
  caseId: string;
  aitId: string;
  projection: 'none' | 'level_1' | 'level_2';
  outcome: 'none' | 'priority';
  basis: string | null;
  proofs: Array<Record<string, string>>;
  documentId?: string;
};
const qualificationScenarios: QualificationScenario[] = [
  {
    label: 'none sem prova',
    caseId: '00000000-0000-7000-8000-000028000001',
    aitId: '00000000-0000-7000-8000-0000f0000001',
    projection: 'none',
    outcome: 'none',
    basis: null,
    proofs: [],
  },
  {
    label: 'age_60_plus por CNH apresentada',
    caseId: '00000000-0000-7000-8000-000028000002',
    aitId: '00000000-0000-7000-8000-0000f0000002',
    projection: 'level_1',
    outcome: 'priority',
    basis: 'age_60_plus',
    proofs: [
      {
        basis_code: 'age_60_plus',
        source_kind: 'presented_cnh',
        source_ref: 'task0028-cnh-60',
        birth_date: '1966-09-16',
      },
    ],
  },
  {
    label: 'age_80_plus por documento apresentado',
    caseId: '00000000-0000-7000-8000-000028000003',
    aitId: '00000000-0000-7000-8000-0000f0000003',
    projection: 'level_2',
    outcome: 'priority',
    basis: 'age_80_plus',
    proofs: [
      {
        basis_code: 'age_80_plus',
        source_kind: 'presented_document',
        source_ref: 'task0028-document-80',
        birth_date: '1946-09-16',
      },
    ],
  },
  {
    label: 'pcd com anexo e hash',
    caseId: '00000000-0000-7000-8000-000028000004',
    aitId: '00000000-0000-7000-8000-0000f0000004',
    projection: 'level_2',
    outcome: 'priority',
    basis: 'pcd',
    documentId: pcdDocumentId,
    proofs: [
      {
        basis_code: 'pcd',
        source_kind: 'attached_document',
        source_ref: 'task0028-attached-pcd',
        document_id: pcdDocumentId,
        evidence_hash: pcdDocumentHash,
      },
    ],
  },
];

type Snapshot = {
  schema: string;
  data: string;
  globals: string;
  roles: string;
};
type ApplyResult = { code: number | null; output: string };
type LegacyTable = {
  schema: string;
  table: string;
  columns: string[];
  hash: string;
};

function digest(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function requiredUrl(name: string): URL {
  const raw = process.env[name];
  if (!raw)
    throw new Error(
      `${name} is required; missing DB context is BLOCKED, not RED`,
    );
  const url = new URL(raw);
  if (!['postgres:', 'postgresql:'].includes(url.protocol))
    throw new Error(`${name} must be a PostgreSQL URL`);
  if (decodeURIComponent(url.pathname.slice(1)) !== expectedDatabase)
    throw new Error(`${name} must target ${expectedDatabase}`);
  return url;
}

function connectionEnvironment(url: URL): NodeJS.ProcessEnv {
  return {
    ...process.env,
    DB_NAME: expectedDatabase,
    DB_HOST: url.hostname,
    DB_PORT: url.port || '5432',
    DB_USER: decodeURIComponent(url.username),
    DB_PASSWORD: decodeURIComponent(url.password),
    PGHOST: url.hostname,
    PGPORT: url.port || '5432',
    PGUSER: decodeURIComponent(url.username),
    PGPASSWORD: decodeURIComponent(url.password),
    PGDATABASE: expectedDatabase,
  };
}

async function run(
  command: string,
  args: string[],
  options: { cwd: string; env: NodeJS.ProcessEnv; timeout?: number },
): Promise<ApplyResult> {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: options.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let output = '';
    const timer = setTimeout(
      () => child.kill('SIGKILL'),
      options.timeout ?? 120_000,
    );
    child.stdout.on('data', (chunk: Buffer) => (output += chunk.toString()));
    child.stderr.on('data', (chunk: Buffer) => (output += chunk.toString()));
    child.on('error', reject);
    child.on('close', (code) => {
      clearTimeout(timer);
      resolvePromise({ code, output });
    });
  });
}

async function inventory(): Promise<string[]> {
  const source = await readFile(join(databaseDir, 'apply.sh'), 'utf8');
  const encoded = source.match(
    /const ordinary = (\[[\s\S]*?\]);\nconst manual =/u,
  )?.[1];
  if (!encoded) throw new Error('The apply runner has no closed DDL inventory');
  const files = JSON.parse(encoded) as unknown;
  if (
    !Array.isArray(files) ||
    files.length !== 62 ||
    files.some(
      (file) =>
        typeof file !== 'string' || !/^[0-9][0-9A-Za-z-]*\.sql$/u.test(file),
    ) ||
    new Set(files).size !== files.length
  )
    throw new Error('The closed 62-DDL inventory is incomplete');
  return files;
}

async function isolatedCopy(syntheticManual = false): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), 'rait-priority-upgrade-'));
  await mkdir(join(directory, 'ddl'));
  await copyFile(join(databaseDir, 'apply.sh'), join(directory, 'apply.sh'));
  const listed = await inventory();
  const present = (await readdir(join(databaseDir, 'ddl')))
    .filter((name) => name.endsWith('.sql'))
    .sort();
  const presentManual = manual.filter((name) => present.includes(name));
  if (presentManual.length !== 0 && presentManual.length !== manual.length)
    throw new Error(
      'Partial TASK-0029 SQL candidate is not an inventory state',
    );
  if (!syntheticManual && presentManual.length !== manual.length)
    throw new Error('TASK-0029 SQL candidate is required for DB rehearsal');
  expect(present).toEqual(
    presentManual.length === manual.length
      ? [...listed, ...manual].sort()
      : [...listed].sort(),
  );
  for (const name of present)
    await copyFile(
      join(databaseDir, 'ddl', name),
      join(directory, 'ddl', name),
    );
  if (syntheticManual && presentManual.length === 0)
    for (const name of manual)
      await writeFile(
        join(directory, 'ddl', name),
        '-- synthetic static probe only\n',
      );
  return directory;
}

async function inject(
  directory: string,
  after: string,
  sql: string,
): Promise<void> {
  const path = join(directory, 'ddl', after);
  const original = await readFile(path, 'utf8');
  await writeFile(path, `${original}\n-- isolated TASK-0028 fault\n${sql}\n`);
}

function normalizedDump(output: string): string {
  const lines = output
    .split('\n')
    .filter((line) => !/^\\(?:un)?restrict\b/.test(line))
    .filter((line) => !/^-- Dumped (?:from database|by pg_dump)/.test(line));
  const normalized: string[] = [];
  for (let index = 0; index < lines.length; index += 1) {
    normalized.push(lines[index]);
    if (!/^COPY .* FROM stdin;$/.test(lines[index])) continue;
    const rows: string[] = [];
    while (index + 1 < lines.length && lines[index + 1] !== '\\.') {
      rows.push(lines[++index]);
    }
    normalized.push(...rows.sort());
  }
  return normalized.join('\n');
}

async function dump(
  kind: '--schema-only' | '--data-only',
  env: NodeJS.ProcessEnv,
) {
  const result = await run(
    'pg_dump',
    [kind, '--no-comments', '-d', expectedDatabase],
    {
      cwd: repo,
      env,
    },
  );
  if (result.code !== 0)
    throw new Error(`pg_dump ${kind} failed (credentials withheld)`);
  return digest(normalizedDump(result.output));
}

async function snapshot(
  owner: pg.Client,
  env: NodeJS.ProcessEnv,
): Promise<Snapshot> {
  const globals = await owner.query(`
    SELECT jsonb_build_object(
      'priority_roles', COALESCE((
        SELECT jsonb_agg(to_jsonb(r) ORDER BY r.rolname)
        FROM (SELECT rolname, rolsuper, rolinherit, rolcreaterole, rolcreatedb,
                     rolcanlogin, rolreplication, rolbypassrls
              FROM pg_roles WHERE rolname IN ('role_rait_priority_writer', 'role_app_backend')) r
      ), '[]'::jsonb),
      'memberships', COALESCE((
        SELECT jsonb_agg(jsonb_build_object('role', role.rolname, 'member', member.rolname)
                         ORDER BY role.rolname, member.rolname)
        FROM pg_auth_members m
        JOIN pg_roles role ON role.oid = m.roleid
        JOIN pg_roles member ON member.oid = m.member
        WHERE role.rolname = 'role_rait_priority_writer'
           OR member.rolname = 'role_rait_priority_writer'
      ), '[]'::jsonb),
      'settings', COALESCE((
        SELECT jsonb_agg(jsonb_build_object('database', d.datname,
                                            'role', r.rolname,
                                            'config', s.setconfig)
                         ORDER BY d.datname, r.rolname)
        FROM pg_db_role_setting s
        JOIN pg_database d ON d.oid = s.setdatabase
        LEFT JOIN pg_roles r ON r.oid = s.setrole
        WHERE d.datname = current_database()
      ), '[]'::jsonb)
    ) AS value
  `);
  return {
    schema: await dump('--schema-only', env),
    data: await dump('--data-only', env),
    globals: digest(JSON.stringify(globals.rows[0].value)),
    roles: digest(
      JSON.stringify({
        priority_roles: globals.rows[0].value.priority_roles,
        memberships: globals.rows[0].value.memberships,
      }),
    ),
  };
}

function quoted(identifier: string): string {
  return `"${identifier.replaceAll('"', '""')}"`;
}

async function legacyRows(
  owner: pg.Client,
  baseline?: LegacyTable[],
  excludeQualificationFixtures = false,
): Promise<LegacyTable[]> {
  const tables =
    baseline ??
    (
      await owner.query(
        `SELECT n.nspname AS schema, c.relname AS table
       FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
       WHERE c.relkind IN ('r', 'p')
         AND n.nspname IN ('auth', 'tenancy', 'audit', 'storage',
                             'integration', 'inf', 'est', 'ch', 'ops')
       ORDER BY n.nspname, c.relname`,
      )
    ).rows;
  const result: LegacyTable[] = [];
  for (const entry of tables) {
    const schema = entry.schema as string;
    const table = entry.table as string;
    const columns = baseline
      ? (entry.columns as string[])
      : (
          await owner.query(
            `SELECT a.attname AS name FROM pg_attribute a
             WHERE a.attrelid = $1::regclass AND a.attnum > 0 AND NOT a.attisdropped
             ORDER BY a.attnum`,
            [`${quoted(schema)}.${quoted(table)}`],
          )
        ).rows.map((row) => row.name as string);
    const projection = columns.map(quoted).join(', ');
    const fixtureFilter =
      excludeQualificationFixtures &&
      schema === 'inf' &&
      (table === 'rait_case' || table === 'rait_document')
        ? " WHERE id::text NOT LIKE '00000000-0000-7000-8000-000028%'"
        : '';
    const rows = await owner.query(
      `SELECT ${projection} FROM ${quoted(schema)}.${quoted(table)}${fixtureFilter}`,
    );
    const sorted = rows.rows
      .map((row) => JSON.stringify(columns.map((column) => row[column])))
      .sort();
    result.push({
      schema,
      table,
      columns,
      hash: digest(JSON.stringify(sorted)),
    });
  }
  return result;
}

async function structuralCatalog(
  owner: pg.Client,
): Promise<Record<string, Array<Record<string, unknown>>>> {
  const result = await owner.query(`
    SELECT jsonb_build_object(
      'schemas', (SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'name', nspname, 'owner', pg_get_userbyid(nspowner), 'acl', nspacl::text)
        ORDER BY nspname), '[]'::jsonb)
        FROM pg_namespace WHERE nspname IN
          ('auth','tenancy','audit','storage','integration','inf','est','ch','ops')),
      'relations', (SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'schema', n.nspname, 'name', c.relname, 'kind', c.relkind,
        'owner', pg_get_userbyid(c.relowner), 'acl', c.relacl::text,
        'rls', c.relrowsecurity, 'force', c.relforcerowsecurity,
        'options', c.reloptions)
        ORDER BY n.nspname, c.relname), '[]'::jsonb)
        FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname IN ('auth','tenancy','audit','storage','integration','inf','est','ch','ops')),
      'columns', (SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'schema', n.nspname, 'table', c.relname, 'name', a.attname,
        'type', format_type(a.atttypid, a.atttypmod), 'not_null', a.attnotnull,
        'default', CASE pg_get_expr(d.adbin, d.adrelid)
          WHEN 'public.gen_random_uuid()' THEN 'gen_random_uuid()'
          ELSE pg_get_expr(d.adbin, d.adrelid)
        END, 'identity', a.attidentity,
        'generated', a.attgenerated)
        ORDER BY n.nspname, c.relname, a.attnum), '[]'::jsonb)
        FROM pg_attribute a JOIN pg_class c ON c.oid = a.attrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        LEFT JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum
        WHERE a.attnum > 0 AND NOT a.attisdropped
          AND n.nspname IN ('auth','tenancy','audit','storage','integration','inf','est','ch','ops')),
      'constraints', (SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'schema', n.nspname, 'table', c.relname, 'name', k.conname,
        'definition', pg_get_constraintdef(k.oid), 'deferred', k.condeferrable)
        ORDER BY n.nspname, c.relname, k.conname), '[]'::jsonb)
        FROM pg_constraint k JOIN pg_namespace n ON n.oid = k.connamespace
        LEFT JOIN pg_class c ON c.oid = k.conrelid
        WHERE n.nspname IN ('auth','tenancy','audit','storage','integration','inf','est','ch','ops')),
      'indexes', (SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'schema', n.nspname, 'name', c.relname,
        'definition', pg_get_indexdef(c.oid))
        ORDER BY n.nspname, c.relname), '[]'::jsonb)
        FROM pg_index i JOIN pg_class c ON c.oid = i.indexrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname IN ('auth','tenancy','audit','storage','integration','inf','est','ch','ops')),
      'policies', (SELECT COALESCE(jsonb_agg(to_jsonb(p)
        ORDER BY p.schemaname, p.tablename, p.policyname), '[]'::jsonb)
        FROM pg_policies p WHERE p.schemaname IN
          ('auth','tenancy','audit','storage','integration','inf','est','ch','ops')),
      'triggers', (SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'schema', n.nspname, 'table', c.relname, 'name', t.tgname,
        'definition', pg_get_triggerdef(t.oid), 'enabled', t.tgenabled)
        ORDER BY n.nspname, c.relname, t.tgname), '[]'::jsonb)
        FROM pg_trigger t JOIN pg_class c ON c.oid = t.tgrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname IN ('auth','tenancy','audit','storage','integration','inf','est','ch','ops')),
      'functions', (SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'schema', n.nspname, 'name', p.proname,
        'arguments', pg_get_function_identity_arguments(p.oid),
        'definition', pg_get_functiondef(p.oid),
        'owner', pg_get_userbyid(p.proowner), 'acl', p.proacl::text,
        'config', p.proconfig)
        ORDER BY n.nspname, p.proname, pg_get_function_identity_arguments(p.oid)), '[]'::jsonb)
        FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname IN ('auth','tenancy','audit','storage','integration','inf','est','ch','ops'))
    ) AS value
  `);
  // Compare the priority-owned surface, not unrelated generated RAIT constraints.
  // Physical column order and PostgreSQL's internal RI trigger OIDs are not schema semantics.
  const catalog = result.rows[0].value as Record<
    string,
    Array<Record<string, unknown>>
  >;
  const tables = new Set([
    'rait_case',
    'rait_document',
    'rait_priority_assessment',
    'rait_priority_basis',
  ]);
  const indexes = catalog.indexes.filter(
    (entry) =>
      entry.schema === 'inf' &&
      [...tables].some((table) =>
        String(entry.definition).includes(` ON inf.${table} `),
      ),
  );
  const indexNames = new Set(indexes.map((entry) => entry.name));
  const canonicalAcl = (value: unknown): unknown =>
    typeof value === 'string'
      ? `{${value.slice(1, -1).split(',').sort().join(',')}}`
      : value;
  return {
    schemas: catalog.schemas.filter((entry) => entry.name === 'inf'),
    relations: catalog.relations
      .filter(
        (entry) =>
          entry.schema === 'inf' &&
          (tables.has(String(entry.name)) || indexNames.has(entry.name)),
      )
      .map((entry) => ({ ...entry, acl: canonicalAcl(entry.acl) })),
    columns: catalog.columns
      .filter(
        (entry) => entry.schema === 'inf' && tables.has(String(entry.table)),
      )
      .sort((a, b) =>
        `${a.schema}.${a.table}.${a.name}`.localeCompare(
          `${b.schema}.${b.table}.${b.name}`,
        ),
      ),
    constraints: catalog.constraints.filter(
      (entry) => entry.schema === 'inf' && tables.has(String(entry.table)),
    ),
    indexes,
    policies: catalog.policies.filter(
      (entry) =>
        entry.schemaname === 'inf' && tables.has(String(entry.tablename)),
    ),
    triggers: catalog.triggers.filter(
      (entry) =>
        entry.schema === 'inf' &&
        tables.has(String(entry.table)) &&
        !String(entry.name).startsWith('RI_ConstraintTrigger_'),
    ),
    functions: catalog.functions.filter(
      (entry) =>
        entry.schema === 'inf' &&
        (/^rait_priority_/.test(String(entry.name)) ||
          entry.name === 'rait_record_initial_priority'),
    ),
  };
}

async function assertAppIdentity(app: pg.Client): Promise<void> {
  const result = await app.query(
    `SELECT current_database() AS db, current_user AS user, current_role AS role,
            r.rolsuper AS superuser, r.rolbypassrls AS bypass_rls, r.rolcanlogin AS login
     FROM pg_roles r WHERE r.rolname = current_role`,
  );
  expect(result.rows).toEqual([
    {
      db: expectedDatabase,
      user: 'role_app_backend',
      role: 'role_app_backend',
      superuser: false,
      bypass_rls: false,
      login: false,
    },
  ]);
}

async function beginRequestRole(app: pg.Client): Promise<void> {
  await app.query('BEGIN');
  await app.query('SET LOCAL ROLE role_app_backend');
  await assertAppIdentity(app);
  await app.query("SELECT set_config('app.tenant_id', $1, true)", [tenantId]);
}

async function priorityState(
  owner: pg.Client,
  caseId: string,
): Promise<unknown> {
  const result = await owner.query(
    `SELECT jsonb_build_object(
      'case', to_jsonb(c),
      'assessment', (SELECT jsonb_agg(to_jsonb(a) ORDER BY a.revision)
                     FROM inf.rait_priority_assessment a
                     WHERE a.tenant_id = c.tenant_id AND a.case_id = c.id),
      'bases', (SELECT jsonb_agg(to_jsonb(b) ORDER BY b.id)
                FROM inf.rait_priority_basis b
                WHERE b.tenant_id = c.tenant_id AND b.case_id = c.id)
    ) AS value FROM inf.rait_case c WHERE c.tenant_id = $1 AND c.id = $2`,
    [tenantId, caseId],
  );
  expect(result.rowCount).toBe(1);
  return result.rows[0].value;
}

describe('CTG-0001-C4-OD V3 pre-SQL static apply contract', () => {
  it('dado inventário fechado quando compõe apply então ordena cada DDL uma vez sem conectar DB', async () => {
    const source = await readFile(join(databaseDir, 'apply.sh'), 'utf8');
    expect(source).toContain('--single-transaction');
    expect(source).toContain('pg_advisory_xact_lock(7007, 1)');
    const listed = await inventory();
    expect(new Set(listed).size).toBe(62);
    const directory = await isolatedCopy(true);
    try {
      const copied = await readdir(join(directory, 'ddl'));
      expect(copied.length).toBe(65);
      expect(
        copied.filter((name) => name === '20-rls-policies.sql'),
      ).toHaveLength(1);
      const bin = join(directory, 'bin');
      const calls = join(directory, 'psql-calls');
      await mkdir(bin);
      const fakePsql = join(bin, 'psql');
      await writeFile(
        fakePsql,
        '#!/usr/bin/env bash\nprintf "<CALL>\\n" >> "$RAIT_PSQL_CALLS"\nprintf "%s\\n" "$@" >> "$RAIT_PSQL_CALLS"\n',
      );
      await chmod(fakePsql, 0o700);
      const result = await run('bash', [join(directory, 'apply.sh')], {
        cwd: directory,
        env: {
          ...process.env,
          DB_NAME: expectedDatabase,
          DB_HOST: 'invalid.example',
          DB_USER: 'no_connection',
          PATH: `${bin}:${process.env.PATH ?? ''}`,
          RAIT_PSQL_CALLS: calls,
        },
      });
      expect(result.code).toBe(0);
      const argv = (await readFile(calls, 'utf8')).trim().split('\n');
      expect(argv.filter((arg) => arg === '<CALL>')).toHaveLength(1);
      expect(argv).toContain('-X');
      expect(argv).toContain('--single-transaction');
      expect(argv).toContain('ON_ERROR_STOP=1');
      const lock = argv.findIndex((arg) =>
        arg.includes('pg_advisory_xact_lock(7007, 1)'),
      );
      const files = argv
        .filter((arg) => arg.endsWith('.sql'))
        .map((arg) => arg.split('/').at(-1));
      const ordinary = listed.filter(
        (name) =>
          name !== '20-rls-policies.sql' && name !== '34-inf-rait-case.sql',
      );
      const before34 = ordinary.filter(
        (name) => name.localeCompare('34-inf-rait-case.sql') < 0,
      );
      const after34 = ordinary.filter(
        (name) => name.localeCompare('34-inf-rait-case.sql') > 0,
      );
      expect(files).toEqual([
        ...before34,
        manual[0],
        '34-inf-rait-case.sql',
        ...after34,
        '20-rls-policies.sql',
        manual[1],
        manual[2],
      ]);
      expect(lock).toBeGreaterThan(-1);
      expect(lock).toBeLessThan(
        argv.findIndex((arg) => arg.endsWith(files[0] ?? '')),
      );
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
});

describe.sequential('CTG-0001-C4-OD V3 isolated priority upgrade', () => {
  let owner: pg.Client;
  let app: pg.Client;
  let ownerUrl: URL;
  let ownerEnv: NodeJS.ProcessEnv;
  let connectionsOpen = false;
  let restorationRequired = false;
  let restorationComplete = false;
  let legacyBaseline: LegacyTable[] = [];

  beforeAll(async () => {
    if (process.env.DETRAN_PRIORITY_UPGRADE_TEST_AUTHORIZED !== '1')
      throw new Error(
        'Dedicated upgrade rehearsal needs explicit authorization',
      );
    await (await legacyBaselineHarness()).prepareLegacyPriorityV1Baseline();
    restorationRequired = true;
    ownerUrl = requiredUrl('DETRAN_TEST_DATABASE_URL');
    ownerEnv = connectionEnvironment(ownerUrl);
    owner = new Client({ connectionString: ownerUrl.toString() });
    app = new Client({ connectionString: ownerUrl.toString() });
    await owner.connect();
    await app.connect();
    connectionsOpen = true;
    const db = await owner.query('SELECT current_database() AS db');
    expect(db.rows[0].db).toBe(expectedDatabase);
    const fixture = await owner.query(
      `SELECT count(*)::integer AS count FROM inf.rait_case
       WHERE tenant_id = '00000000-0000-7000-8000-00000000a001'
         AND id::text LIKE '00000000-0000-7000-8000-0000100000%'`,
    );
    if (fixture.rows[0].count !== 20)
      throw new Error(
        'Dedicated DB requires the 20-case historical legacy baseline',
      );
    await app.query('BEGIN');
    await app.query('SET LOCAL ROLE role_app_backend');
    await assertAppIdentity(app);
    await app.query('ROLLBACK');
    await inventory();
    // A missing SQL candidate is an unfulfilled upstream prerequisite, never RED.
    const present = await readdir(join(databaseDir, 'ddl'));
    for (const name of manual)
      if (!present.includes(name))
        throw new Error(`${name} is not yet supplied by TASK-0029`);
  }, 180_000);

  afterAll(async () => {
    if (connectionsOpen) {
      await app?.end();
      await owner?.end();
      connectionsOpen = false;
    }
    if (restorationRequired && !restorationComplete) {
      try {
        await (await legacyBaselineHarness()).restoreFreshPriorityV3Database();
        restorationComplete = true;
      } catch (error) {
        throw new Error(
          'BLOCKED: dedicated database restoration failed after the rehearsal',
          { cause: error },
        );
      }
    }
  });

  it('dado string legada desconhecida quando prepara upgrade então permanece sem apuração factual', async () => {
    const before = await owner.query(
      `SELECT id, tenant_id, protocolled_at, legal_priority
       FROM inf.rait_case WHERE id = $1`,
      [legacyCaseId],
    );
    expect(before.rowCount).toBe(1);
    expect(before.rows[0].tenant_id).toBe(
      '00000000-0000-7000-8000-00000000a001',
    );
    expect([null, unknownLegacyPriority]).toContain(
      before.rows[0].legal_priority,
    );
    await owner.query(
      `UPDATE inf.rait_case SET legal_priority = $2 WHERE id = $1`,
      [legacyCaseId, unknownLegacyPriority],
    );
    const prepared = await owner.query(
      `SELECT id, protocolled_at, legal_priority FROM inf.rait_case WHERE id = $1`,
      [legacyCaseId],
    );
    expect(prepared.rows[0]).toEqual({
      id: legacyCaseId,
      protocolled_at: before.rows[0].protocolled_at,
      legal_priority: unknownLegacyPriority,
    });
    // Freeze every pre-upgrade legacy table/column before any successful apply.
    legacyBaseline = await legacyRows(owner);
    expect(legacyBaseline.length).toBeGreaterThan(0);
  });

  for (const [label, file] of [
    ['pre', '19-rait-priority-pre.sql'],
    ['DDL34', '34-inf-rait-case.sql'],
    ['DDL20', '20-rls-policies.sql'],
    ['enforce', '19-rait-priority-enforce.sql'],
    ['verify', '19-rait-priority-verify.sql'],
  ] as const) {
    it(`dado legado quando falha após ${label} então dados schema ACL e roles voltam integralmente`, async () => {
      const before = await snapshot(owner, ownerEnv);
      const directory = await isolatedCopy();
      try {
        await inject(directory, file, 'SELECT 1 / 0;');
        const result = await run('bash', [join(directory, 'apply.sh')], {
          cwd: directory,
          env: ownerEnv,
        });
        expect(result.code).not.toBe(0);
        expect(result.output).not.toContain('apply.sh: done');
        expect(await snapshot(owner, ownerEnv)).toEqual(before);
      } finally {
        await rm(directory, { recursive: true, force: true });
      }
    }, 120_000);
  }

  it('dado grant intermediário DDL20 quando outra sessão observa então não fica utilizável', async () => {
    const before = await snapshot(owner, ownerEnv);
    const directory = await isolatedCopy();
    try {
      await inject(
        directory,
        '20-rls-policies.sql',
        "SELECT set_config('application_name', 'rait-priority-grant-window-open', false); SELECT pg_sleep(10); SELECT 1 / 0;",
      );
      const pending = run('bash', [join(directory, 'apply.sh')], {
        cwd: directory,
        env: { ...ownerEnv, PGAPPNAME: 'rait-priority-grant-window-sensor' },
      });
      let inWindow = false;
      // The full DDL prefix reaches DDL20 much later on a cold CI runner than
      // locally. Observe a marker set at the exact injection point instead of
      // guessing from the current query text during a five-second window.
      for (let probe = 0; probe < 900; probe += 1) {
        const activity = await owner.query(
          `SELECT count(*)::integer AS count FROM pg_stat_activity
           WHERE application_name = 'rait-priority-grant-window-open'
             AND state = 'active'`,
        );
        inWindow = activity.rows[0].count > 0;
        if (inWindow) break;
        await new Promise((resolvePromise) => setTimeout(resolvePromise, 100));
      }
      expect(inWindow).toBe(true);
      await app.query('BEGIN');
      try {
        await app.query('SET LOCAL ROLE role_app_backend');
        await assertAppIdentity(app);
        const grant = await app.query(
          `SELECT CASE WHEN to_regclass('inf.rait_priority_assessment') IS NULL
                       THEN false
                       ELSE has_table_privilege(current_user,
                         'inf.rait_priority_assessment', 'INSERT')
                  END AS insert_grant`,
        );
        expect(grant.rows[0].insert_grant).toBe(false);
      } finally {
        await app.query('ROLLBACK');
      }
      const result = await pending;
      expect(result.code).not.toBe(0);
      expect(result.output).not.toContain('apply.sh: done');
      expect(await snapshot(owner, ownerEnv)).toEqual(before);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  }, 120_000);

  it('dado constraint diferida quando COMMIT falha então não anuncia sucesso nem confirma grants', async () => {
    const before = await snapshot(owner, ownerEnv);
    const directory = await isolatedCopy();
    try {
      await inject(
        directory,
        '19-rait-priority-verify.sql',
        `CREATE TEMP TABLE rait_fault_parent (id integer PRIMARY KEY);
         CREATE TEMP TABLE rait_fault_child (parent_id integer REFERENCES rait_fault_parent(id)
           DEFERRABLE INITIALLY DEFERRED);
         INSERT INTO rait_fault_child VALUES (1);`,
      );
      const result = await run('bash', [join(directory, 'apply.sh')], {
        cwd: directory,
        env: ownerEnv,
      });
      expect(result.code).not.toBe(0);
      expect(result.output).not.toContain('apply.sh: done');
      expect(await snapshot(owner, ownerEnv)).toEqual(before);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  }, 120_000);

  it('dado lock transacional concorrente quando outro apply inicia então espera sem expor grants', async () => {
    const directory = await isolatedCopy();
    const locker = new Client({
      connectionString: requiredUrl('DETRAN_TEST_DATABASE_URL').toString(),
    });
    await locker.connect();
    try {
      await locker.query('BEGIN');
      await locker.query('SELECT pg_advisory_xact_lock(7007, 1)');
      const pending = run('bash', [join(directory, 'apply.sh')], {
        cwd: directory,
        env: { ...ownerEnv, PGAPPNAME: 'rait-priority-upgrade-lock-sensor' },
      });
      let waiting = false;
      for (let probe = 0; probe < 50; probe += 1) {
        const locks = await owner.query(
          `SELECT count(*)::integer AS waiting FROM pg_locks l
           JOIN pg_stat_activity a ON a.pid = l.pid
           WHERE a.application_name = 'rait-priority-upgrade-lock-sensor'
             AND l.locktype = 'advisory' AND NOT l.granted`,
        );
        waiting = locks.rows[0].waiting > 0;
        if (waiting) break;
        await new Promise((resolvePromise) => setTimeout(resolvePromise, 100));
      }
      expect(waiting).toBe(true);
      await app.query('BEGIN');
      await app.query('SET LOCAL ROLE role_app_backend');
      await assertAppIdentity(app);
      const beforeRelease = await app.query(
        `SELECT CASE WHEN to_regclass('inf.rait_priority_assessment') IS NULL THEN false
                     ELSE has_table_privilege(current_user, 'inf.rait_priority_assessment', 'INSERT')
                END AS insert_grant`,
      );
      expect(beforeRelease.rows[0].insert_grant).toBe(false);
      await app.query('ROLLBACK');
      await locker.query('ROLLBACK');
      const result = await pending;
      expect(result.code).toBe(0);
      expect(legacyBaseline.length).toBeGreaterThan(0);
      expect(await legacyRows(owner, legacyBaseline)).toEqual(legacyBaseline);
    } finally {
      await locker.query('ROLLBACK');
      await locker.end();
      await rm(directory, { recursive: true, force: true });
    }
  }, 120_000);

  it('dado upgrade bem-sucedido quando reaplica então conserva bytes de dados e hardening', async () => {
    expect(legacyBaseline.length).toBeGreaterThan(0);
    const legacyBefore = await owner.query(
      `SELECT id, protocolled_at, legal_priority FROM inf.rait_case WHERE id = $1`,
      [legacyCaseId],
    );
    expect(legacyBefore.rows[0].legal_priority).toBe(unknownLegacyPriority);
    const nullBefore = await owner.query(
      `SELECT count(*)::integer AS count FROM inf.rait_case
       WHERE tenant_id = '00000000-0000-7000-8000-00000000a001'
         AND legal_priority IS NULL`,
    );
    expect(nullBefore.rows[0].count).toBeGreaterThan(0);
    let firstApply: Snapshot | undefined;
    const directory = await isolatedCopy();
    try {
      for (let attempt = 0; attempt < 2; attempt += 1) {
        const result = await run('bash', [join(directory, 'apply.sh')], {
          cwd: directory,
          env: ownerEnv,
        });
        expect(result.code, `apply attempt ${attempt + 1}`).toBe(0);
        expect(result.output).toContain('apply.sh: done');
        expect(await legacyRows(owner, legacyBaseline)).toEqual(legacyBaseline);
        expect(
          (
            await owner.query(
              `SELECT id, protocolled_at, legal_priority FROM inf.rait_case WHERE id = $1`,
              [legacyCaseId],
            )
          ).rows,
        ).toEqual(legacyBefore.rows);
        expect(
          (
            await owner.query(
              `SELECT count(*)::integer AS count FROM inf.rait_case
               WHERE tenant_id = '00000000-0000-7000-8000-00000000a001'
                 AND legal_priority IS NULL`,
            )
          ).rows,
        ).toEqual(nullBefore.rows);
        const qualification = await owner.query(
          `SELECT
             (SELECT count(*)::integer FROM inf.rait_priority_assessment
              WHERE tenant_id = '00000000-0000-7000-8000-00000000a001'
                AND case_id = $1) AS assessments,
             (SELECT count(*)::integer FROM inf.rait_priority_basis
              WHERE tenant_id = '00000000-0000-7000-8000-00000000a001'
                AND case_id = $1) AS bases`,
          [legacyCaseId],
        );
        expect(qualification.rows[0]).toEqual({ assessments: 0, bases: 0 });
        const applied = await snapshot(owner, ownerEnv);
        if (firstApply) expect(applied).toEqual(firstApply);
        else firstApply = applied;
        await app.query('BEGIN');
        await app.query('SET LOCAL ROLE role_app_backend');
        await assertAppIdentity(app);
        for (const relation of [
          'rait_priority_assessment',
          'rait_priority_basis',
        ]) {
          const grant = await app.query(
            `SELECT has_table_privilege(current_user, $1, 'SELECT') AS read,
                    has_table_privilege(current_user, $1, 'INSERT, UPDATE, DELETE') AS write`,
            [`inf.${relation}`],
          );
          expect(grant.rows[0]).toEqual({ read: true, write: false });
        }
        await app.query('ROLLBACK');
        const caseColumns = await owner.query(
          `SELECT id, protocolled_at, version, legal_priority
           FROM inf.rait_case
           WHERE tenant_id = '00000000-0000-7000-8000-00000000a001'
           ORDER BY id LIMIT 1`,
        );
        if (caseColumns.rowCount !== 1)
          throw new Error(
            'A canonical legacy case fixture is required for immutability',
          );
        const caseId = caseColumns.rows[0].id as string;
        await app.query('BEGIN');
        try {
          await app.query('SET LOCAL ROLE role_app_backend');
          await app.query(`SELECT set_config('app.tenant_id', $1, true)`, [
            '00000000-0000-7000-8000-00000000a001',
          ]);
          await app.query(
            `UPDATE inf.rait_case SET last_movement_at = last_movement_at + INTERVAL '1 second'
             WHERE id = $1`,
            [caseId],
          );
          await expect(
            app.query(
              `UPDATE inf.rait_case SET protocolled_at = protocolled_at + INTERVAL '1 day' WHERE id = $1`,
              [caseId],
            ),
          ).rejects.toThrow();
        } finally {
          await app.query('ROLLBACK');
        }
        await app.query('BEGIN');
        try {
          await app.query('SET LOCAL ROLE role_app_backend');
          await app.query(`SELECT set_config('app.tenant_id', $1, true)`, [
            '00000000-0000-7000-8000-00000000a001',
          ]);
          await expect(
            app.query(
              `UPDATE inf.rait_case SET id = '00000000-0000-7000-8000-00000000ffff'
               WHERE id = $1`,
              [caseId],
            ),
          ).rejects.toThrow();
        } finally {
          await app.query('ROLLBACK');
        }
        const unchanged = await owner.query(
          'SELECT id, protocolled_at, version, legal_priority FROM inf.rait_case WHERE id = $1',
          [caseId],
        );
        expect(unchanged.rows).toEqual(caseColumns.rows);
        expect(await snapshot(owner, ownerEnv)).toEqual(firstApply);
      }
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  }, 240_000);

  for (const scenario of qualificationScenarios) {
    it(`dado caso novo ${scenario.label} quando qualifica na transação então COMMIT preserva projeção e revisão 1`, async () => {
      const policy = await owner.query(
        `SELECT value_json, value_type, status, source_pending
         FROM ops.parameter WHERE tenant_id = $1 AND key = 'rait.priority.legal_bases'
           AND surface = 'rait' AND traffic_agency_id IS NULL`,
        [tenantId],
      );
      expect(policy.rows).toEqual([
        {
          value_json: expectedPolicy,
          value_type: 'json',
          status: 'vigente',
          source_pending: false,
        },
      ]);
      const existing = await owner.query(
        'SELECT id FROM inf.rait_case WHERE id = $1',
        [scenario.caseId],
      );
      expect(existing.rowCount).toBe(0);
      let committed = false;
      let assessmentId = '';
      await beginRequestRole(app);
      try {
        await app.query(
          `INSERT INTO inf.rait_case
           (id, tenant_id, ait_id, protocol_number, instance, circuit, state,
            intake_channel, protocolled_at)
           VALUES ($1, $2, $3, $4, 'defesa_previa', 1, 'PROTOCOLADO',
                   'balcao', $5::timestamptz)`,
          [
            scenario.caseId,
            tenantId,
            scenario.aitId,
            `RAIT-TASK0028-${scenario.label.split(' ')[0]}`,
            assessedAt,
          ],
        );
        if (scenario.documentId) {
          await app.query(
            `INSERT INTO inf.rait_document
             (id, tenant_id, case_id, kind, origin, storage_key, filename,
              content_hash, attached_by)
             VALUES ($1, $2, $3, 'pcd_proof', 'requerente',
                     'fixtures/task0028/pcd-proof.pdf', 'pcd-proof.pdf', $4, $5)`,
            [
              scenario.documentId,
              tenantId,
              scenario.caseId,
              pcdDocumentHash,
              secretaryId,
            ],
          );
        }
        const qualification = await app.query(
          `SELECT inf.rait_record_initial_priority($1, $2, $3::timestamptz,
                                                    $4::jsonb) AS assessment_id`,
          [
            scenario.caseId,
            secretaryId,
            assessedAt,
            JSON.stringify(scenario.proofs),
          ],
        );
        assessmentId = qualification.rows[0].assessment_id as string;
        expect(assessmentId).toMatch(/^[0-9a-f-]{36}$/i);
        const projected = await app.query(
          `SELECT legal_priority FROM inf.rait_case WHERE tenant_id = $1 AND id = $2`,
          [tenantId, scenario.caseId],
        );
        expect(projected.rows[0].legal_priority).toBe(scenario.projection);
        await app.query('COMMIT');
        committed = true;
      } finally {
        if (!committed) await app.query('ROLLBACK');
      }
      const persisted = await owner.query(
        `SELECT c.legal_priority, a.id AS assessment_id, a.revision, a.outcome,
                a.assessed_by, a.qualification_on::text AS qualification_on,
                a.policy_snapshot
         FROM inf.rait_case c
         JOIN inf.rait_priority_assessment a
           ON a.tenant_id = c.tenant_id AND a.case_id = c.id
         WHERE c.tenant_id = $1 AND c.id = $2`,
        [tenantId, scenario.caseId],
      );
      expect(persisted.rows).toEqual([
        {
          legal_priority: scenario.projection,
          assessment_id: assessmentId,
          revision: 1,
          outcome: scenario.outcome,
          assessed_by: secretaryId,
          qualification_on: '2026-09-16',
          policy_snapshot: expectedPolicy,
        },
      ]);
      const bases = await owner.query(
        `SELECT basis_code, source_kind, source_ref, document_id,
                evidence_hash, verified_by
         FROM inf.rait_priority_basis
         WHERE tenant_id = $1 AND case_id = $2 AND assessment_id = $3`,
        [tenantId, scenario.caseId, assessmentId],
      );
      expect(bases.rowCount).toBe(scenario.basis ? 1 : 0);
      if (scenario.basis) {
        expect(bases.rows[0].basis_code).toBe(scenario.basis);
        expect(bases.rows[0].verified_by).toBe(secretaryId);
        expect(bases.rows[0].source_kind).toBe(scenario.proofs[0].source_kind);
        expect(bases.rows[0].source_ref).toBe(scenario.proofs[0].source_ref);
        if (scenario.documentId) {
          expect(bases.rows[0].document_id).toBe(scenario.documentId);
          expect(bases.rows[0].evidence_hash).toBe(pcdDocumentHash);
          const document = await owner.query(
            `SELECT tenant_id, case_id, content_hash FROM inf.rait_document WHERE id = $1`,
            [scenario.documentId],
          );
          expect(document.rows).toEqual([
            {
              tenant_id: tenantId,
              case_id: scenario.caseId,
              content_hash: pcdDocumentHash,
            },
          ]);
        } else {
          expect(bases.rows[0].document_id).toBeNull();
          expect(bases.rows[0].evidence_hash).toBeNull();
        }
      }
      const beforeTamper = await priorityState(owner, scenario.caseId);
      await beginRequestRole(app);
      try {
        await expect(
          app.query(
            `UPDATE inf.rait_priority_assessment SET outcome = 'none' WHERE id = $1`,
            [assessmentId],
          ),
        ).rejects.toMatchObject({ code: '42501' });
      } finally {
        await app.query('ROLLBACK');
      }
      expect(await priorityState(owner, scenario.caseId)).toEqual(beforeTamper);
      expect(await legacyRows(owner, legacyBaseline, true)).toEqual(
        legacyBaseline,
      );
    }, 120_000);
  }

  it('dado marcador pg_temp forjado quando tenta qualificar caso protocolado então não cria revisão nem projeção', async () => {
    const caseId = qualificationScenarios[0].caseId;
    const before = await priorityState(owner, caseId);
    const spoof = new Client({ connectionString: ownerUrl.toString() });
    await spoof.connect();
    try {
      await spoof.query('BEGIN');
      // Owner-owned temp rows are deliberately untrusted even in a dedicated DB.
      await spoof.query(
        `CREATE TEMP TABLE rait_priority_new_cases
         (tenant_id uuid NOT NULL, case_id uuid NOT NULL,
          PRIMARY KEY (tenant_id, case_id)) ON COMMIT DELETE ROWS`,
      );
      await spoof.query(
        `INSERT INTO pg_temp.rait_priority_new_cases VALUES ($1, $2)`,
        [tenantId, caseId],
      );
      await spoof.query('SET LOCAL ROLE role_app_backend');
      await assertAppIdentity(spoof);
      await spoof.query(`SELECT set_config('app.tenant_id', $1, true)`, [
        tenantId,
      ]);
      await expect(
        spoof.query(
          `SELECT inf.rait_record_initial_priority($1, $2, $3::timestamptz,
                                                     '[]'::jsonb)`,
          [caseId, secretaryId, assessedAt],
        ),
      ).rejects.toMatchObject({ code: '42501' });
    } finally {
      await spoof.query('ROLLBACK');
      await spoof.end();
    }
    expect(await priorityState(owner, caseId)).toEqual(before);
    expect(await legacyRows(owner, legacyBaseline, true)).toEqual(
      legacyBaseline,
    );
  }, 120_000);

  it('dado caso protocolado e já qualificado quando tenta requalificar então revisão 1 é final', async () => {
    const caseId = qualificationScenarios[1].caseId;
    const before = await priorityState(owner, caseId);
    await beginRequestRole(app);
    try {
      await expect(
        app.query(
          `SELECT inf.rait_record_initial_priority($1, $2, $3::timestamptz,
                                                     '[]'::jsonb)`,
          [caseId, secretaryId, assessedAt],
        ),
      ).rejects.toMatchObject({ code: '42501' });
    } finally {
      await app.query('ROLLBACK');
    }
    expect(await priorityState(owner, caseId)).toEqual(before);
    const revisions = await owner.query(
      `SELECT revision FROM inf.rait_priority_assessment
       WHERE tenant_id = $1 AND case_id = $2 ORDER BY revision`,
      [tenantId, caseId],
    );
    expect(revisions.rows).toEqual([{ revision: 1 }]);
    expect(await legacyRows(owner, legacyBaseline, true)).toEqual(
      legacyBaseline,
    );
  }, 120_000);

  it('dado snapshot do upgrade quando aplica --full descartável então schema fresco é equivalente', async () => {
    if (process.env.DETRAN_PRIORITY_UPGRADE_FULL_AUTHORIZED !== '1')
      throw new Error(
        'Fresh --full rehearsal needs separate disposable-reset authorization',
      );
    const legacy = await owner.query(
      `SELECT legal_priority FROM inf.rait_case WHERE id = $1`,
      [legacyCaseId],
    );
    expect(legacy.rows[0].legal_priority).toBe(unknownLegacyPriority);
    // New protocol fixtures are intentional writes; compare every original row.
    expect(await legacyRows(owner, legacyBaseline, true)).toEqual(
      legacyBaseline,
    );
    const clients = await owner.query(
      `SELECT count(*)::integer AS count FROM pg_stat_activity
       WHERE datname = current_database() AND backend_type = 'client backend'`,
    );
    expect(clients.rows[0].count).toBe(2);
    const upgrade = await snapshot(owner, ownerEnv);
    const upgradeStructure = await structuralCatalog(owner);
    const directory = await isolatedCopy();
    // Snapshot hashes are written outside the database before its disposable reset.
    await writeFile(
      join(directory, 'upgrade-snapshot.json'),
      JSON.stringify({
        database: expectedDatabase,
        ...upgrade,
        upgradeStructure,
      }),
    );
    await app.end();
    await owner.end();
    connectionsOpen = false;
    const result = await run('bash', [join(directory, 'apply.sh'), '--full'], {
      cwd: directory,
      env: ownerEnv,
    });
    expect(result.code).toBe(0);
    expect(result.output).toContain('apply.sh: done');
    owner = new Client({ connectionString: ownerUrl.toString() });
    app = new Client({ connectionString: ownerUrl.toString() });
    await owner.connect();
    await app.connect();
    connectionsOpen = true;
    const fresh = await snapshot(owner, ownerEnv);
    expect(await structuralCatalog(owner)).toEqual(upgradeStructure);
    expect(fresh.roles).toBe(upgrade.roles);
    const empty = await owner.query(
      `SELECT count(*)::integer AS count FROM inf.rait_case`,
    );
    expect(empty.rows[0].count).toBe(0);
    await app.query('BEGIN');
    try {
      await app.query('SET LOCAL ROLE role_app_backend');
      await assertAppIdentity(app);
    } finally {
      await app.query('ROLLBACK');
    }
    await app.end();
    await owner.end();
    connectionsOpen = false;
    await (await legacyBaselineHarness()).restoreFreshPriorityV3Database();
    restorationComplete = true;
    owner = new Client({ connectionString: ownerUrl.toString() });
    app = new Client({ connectionString: ownerUrl.toString() });
    await owner.connect();
    await app.connect();
    connectionsOpen = true;
    const restored = await owner.query(
      `SELECT count(*)::integer AS count FROM inf.rait_case`,
    );
    expect(restored.rows[0].count).toBe(1);
    await rm(directory, { recursive: true, force: true });
  }, 240_000);
});
