import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// D-160.7: independent consumer black-box sensors. Only disposable copies change.
const repo = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../..',
);
const cli = path.join(repo, 'tools/check-rls-ddl.ts');
const tsx = import.meta.resolve('tsx');
const metadataPath = 'backend/database/stynx-storage.json';
const outboxPath = 'backend/database/ddl/19-stynx-outbox.sql';
const offlinePath = 'backend/database/ddl/19-stynx-offline.sql';
const extraPath = 'backend/database/ddl/99-inspector-fixture.sql';
const originals = new Map(
  [metadataPath, outboxPath, offlinePath, 'tools/stynx-version.json'].map(
    (name) => [name, readFileSync(path.join(repo, name), 'utf8')],
  ),
);
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

function write(root, name, bytes) {
  const file = path.join(root, name);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, bytes);
}

function json(root, name, value) {
  write(root, name, `${JSON.stringify(value, null, 2)}\n`);
}

function fixture(run, extra = '') {
  const root = mkdtempSync(path.join(os.tmpdir(), 'detran-rls-ddl-'));
  try {
    for (const [name, bytes] of originals) write(root, name, bytes);
    write(root, extraPath, extra);
    mkdirSync(path.join(root, 'backend/app'), { recursive: true });
    copyFileSync(
      path.join(repo, 'backend/app/package.json'),
      path.join(root, 'backend/app/package.json'),
    );
    symlinkSync(
      path.join(repo, 'backend/app/node_modules'),
      path.join(root, 'backend/app/node_modules'),
      'dir',
    );
    return run(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function run(root, { cwd = root, args = [root] } = {}) {
  const result = spawnSync(process.execPath, ['--import', tsx, cli, ...args], {
    cwd,
    encoding: 'utf8',
    timeout: 30_000,
  });
  assert.ifError(result.error);
  assert.equal(
    result.signal,
    null,
    'classifier must complete without a signal',
  );
  return { status: result.status, output: `${result.stdout}${result.stderr}` };
}

function reject(result, identity) {
  assert.equal(result.status, 1, result.output);
  assert.ok(
    result.output.trim(),
    'fail-closed refusal must diagnose its cause',
  );
  if (identity) assert.ok(result.output.includes(identity), result.output);
}

function count(result, label, expected) {
  const forward = new RegExp(
    `\\b${label}(?:[- ]owned)?(?: tables)?[=: ]+${expected}\\b`,
    'i',
  );
  const reverse = new RegExp(`\\b${expected} ${label}(?:[- ]owned)?\\b`, 'i');
  assert.ok(
    forward.test(result.output) || reverse.test(result.output),
    result.output,
  );
}

function accept(result, helper = 0, exempt = 0) {
  assert.equal(result.status, 0, result.output);
  count(result, 'helper', helper);
  count(result, 'package', 21);
  count(result, 'exempt', exempt);
}

function edit(root, name, from, to) {
  const file = path.join(root, name);
  const before = readFileSync(file, 'utf8');
  assert.ok(before.includes(from), `fixture mutation anchor missing: ${from}`);
  const after = before.replace(from, to);
  assert.notEqual(after, before);
  writeFileSync(file, after);
}

function editMetadata(root, mutate) {
  const metadata = JSON.parse(
    readFileSync(path.join(root, metadataPath), 'utf8'),
  );
  mutate(metadata);
  json(root, metadataPath, metadata);
}

function snapshot(root) {
  const entries = [];
  const visit = (relative) => {
    for (const item of readdirSync(path.join(root, relative), {
      withFileTypes: true,
    })) {
      const name = path.join(relative, item.name);
      if (item.isSymbolicLink()) continue;
      if (item.isDirectory()) visit(name);
      else entries.push([name, sha256(readFileSync(path.join(root, name)))]);
    }
  };
  visit('');
  return entries.sort((a, b) => a[0].localeCompare(b[0]));
}

test('A160-05 positive: exact installed artifacts cover all 21 tenant identities', () => {
  const metadata = JSON.parse(originals.get(metadataPath));
  const counts = metadata.artifacts.map(
    (artifact) =>
      artifact.manifest.catalog.filter(
        (item) => item.kind === 'column' && item.name.endsWith('.tenant_id'),
      ).length,
  );
  assert.deepEqual(counts, [9, 12]);
  const fence =
    "(tenant_id = (NULLIF(current_setting('app.tenant_id'::text, true), ''::text))::uuid)";
  const actorFence =
    "(actor_id = (NULLIF(current_setting('app.actor_id'::text, true), ''::text))::uuid)";
  for (const artifact of metadata.artifacts) {
    const catalog = artifact.manifest.catalog;
    const tenantTables = catalog
      .filter(
        (item) => item.kind === 'column' && item.name.endsWith('.tenant_id'),
      )
      .map((item) => item.name.slice(0, -10));
    for (const table of tenantTables) {
      const relation = catalog.find(
        (item) => item.kind === 'relation' && item.name === table,
      );
      assert.ok(relation, `${artifact.package}:${table}: missing relation`);
      assert.equal(relation.value.rls, true, table);
      assert.equal(relation.value.forceRls, true, table);
      const policies = catalog.filter(
        (item) =>
          item.kind === 'policy' &&
          item.name.startsWith(`${table}.`) &&
          item.value.roles.some(
            (role) => role === 'role_app_backend' || role === 'PUBLIC',
          ),
      );
      assert.equal(policies.length, 1, `${table}: unexpected app policy set`);
      assert.equal(policies[0].value.command, '*', table);
      assert.equal(policies[0].value.using, fence, table);
      assert.equal(
        policies[0].value.check,
        table === 'event_retirements' ? `(${fence} AND ${actorFence})` : fence,
        table,
      );
    }
  }
  fixture((root) => accept(run(root)));
});

test('A160-05 positive: helper and both existing exemptions remain distinct', () => {
  fixture(
    (root) => accept(run(root), 1, 2),
    `
    CREATE TABLE IF NOT EXISTS inspector.ordinary (tenant_id uuid, nested numeric(10, 2));
    SELECT auth.create_rls_policy('inspector', 'ordinary');
    CREATE TABLE portal.public_hostname (tenant_id uuid);
    CREATE TABLE "portal"."brand_profile" ("tenant_id" uuid);
  `,
  );
});

for (const [name, table, helper] of [
  ['quoted lowercase', '"inspector"."quoted"', "'inspector', 'quoted'"],
  ['quoted case', '"Inspector"."Quoted"', "'Inspector', 'Quoted'"],
  ['escaped quote', '"Inspector"."a""b"', "'Inspector', 'a\"b'"],
]) {
  test(`A160-05 positive: ${name} preserves exact SQL identity`, () => {
    fixture(
      (root) => accept(run(root), 1),
      `
      CREATE TABLE ${table} ("tenant_id" uuid, note text DEFAULT ');');
      SELECT auth.create_rls_policy(${helper});
    `,
    );
  });
}

test('A160-05 known partition parent and child both require effective helpers', () => {
  fixture(
    (root) => accept(run(root), 2),
    `
    CREATE TABLE inspector.parent (tenant_id uuid, at timestamptz) PARTITION BY RANGE (at);
    CREATE TABLE IF NOT EXISTS inspector.child PARTITION OF inspector.parent DEFAULT;
    SELECT auth.create_rls_policy('inspector', 'parent');
    SELECT auth.create_rls_policy('inspector', 'child');
  `,
  );
});

test('A160-05 quoted partition identities preserve case and escaped quotes', () => {
  fixture(
    (root) => accept(run(root), 2),
    `
    CREATE TABLE "Inspector"."p""arent" ("tenant_id" uuid, at timestamptz) PARTITION BY RANGE (at);
    CREATE TABLE "Inspector"."Child" PARTITION OF "Inspector"."p""arent" DEFAULT;
    SELECT auth.create_rls_policy('Inspector', 'p"arent');
    SELECT auth.create_rls_policy('Inspector', 'Child');
  `,
  );
});

for (const [name, sql] of [
  [
    'unknown parent',
    "CREATE TABLE inspector.child PARTITION OF inspector.absent DEFAULT; SELECT auth.create_rls_policy('inspector', 'child');",
  ],
  [
    'cycle',
    "CREATE TABLE inspector.a PARTITION OF inspector.b DEFAULT; CREATE TABLE inspector.b PARTITION OF inspector.a DEFAULT; SELECT auth.create_rls_policy('inspector', 'a'); SELECT auth.create_rls_policy('inspector', 'b');",
  ],
  [
    'uncovered parent',
    "CREATE TABLE inspector.parent (tenant_id uuid) PARTITION BY RANGE (tenant_id); CREATE TABLE inspector.child PARTITION OF inspector.parent DEFAULT; SELECT auth.create_rls_policy('inspector', 'child');",
  ],
  [
    'uncovered child',
    "CREATE TABLE inspector.parent (tenant_id uuid) PARTITION BY RANGE (tenant_id); CREATE TABLE inspector.child PARTITION OF inspector.parent DEFAULT; SELECT auth.create_rls_policy('inspector', 'parent');",
  ],
]) {
  test(`A160-05 partition fails closed: ${name}`, () => {
    fixture((root) => reject(run(root), '99-inspector-fixture.sql'), sql);
  });
}

test('A160-05 positive: mixed-case quoted non-tenant column is not tenant_id', () => {
  fixture(
    (root) => accept(run(root)),
    'CREATE TABLE inspector.unscoped ("Tenant_id" uuid);',
  );
});

for (const [name, sql] of [
  [
    'ordinary IF NOT EXISTS',
    'CREATE TABLE IF NOT EXISTS inspector.unknown (tenant_id uuid);',
  ],
  [
    'ordinary no IF NOT EXISTS',
    'CREATE TABLE inspector.unknown (tenant_id uuid);',
  ],
  [
    'quoted IF NOT EXISTS',
    'CREATE TABLE IF NOT EXISTS "inspector"."unknown" ("tenant_id" uuid);',
  ],
  [
    'quoted no IF NOT EXISTS',
    'CREATE TABLE "inspector"."unknown" ("tenant_id" uuid);',
  ],
  [
    'different helper identity',
    "CREATE TABLE inspector.unknown (tenant_id uuid); SELECT auth.create_rls_policy('inspector', 'other');",
  ],
  [
    'quoted case drift',
    "CREATE TABLE \"Inspector\".unknown (tenant_id uuid); SELECT auth.create_rls_policy('inspector', 'unknown');",
  ],
  ['third portal exception', 'CREATE TABLE portal.unknown (tenant_id uuid);'],
  [
    'uppercase portal not exempt',
    'CREATE TABLE "PORTAL"."public_hostname" (tenant_id uuid);',
  ],
  [
    'schema-wide outbox exemption forbidden',
    'CREATE TABLE outbox.unknown (tenant_id uuid);',
  ],
  [
    'schema-wide offline exemption forbidden',
    'CREATE TABLE offline.unknown (tenant_id uuid);',
  ],
  [
    'ALTER adds hidden tenant column',
    'CREATE TABLE inspector.added (id uuid); ALTER TABLE inspector.added ADD COLUMN tenant_id uuid;',
  ],
]) {
  test(`A160-05 rejects uncovered ${name}`, () => {
    fixture((root) => reject(run(root), '99-inspector-fixture.sql'), sql);
  });
}

for (const [name, fake] of [
  ['line comment', "-- SELECT auth.create_rls_policy('inspector', 'unknown');"],
  [
    'nested block comment',
    "/* outer /* nested */ SELECT auth.create_rls_policy('inspector', 'unknown'); */",
  ],
  [
    'string literal',
    "SELECT 'auth.create_rls_policy(''inspector'', ''unknown'')';",
  ],
  [
    'dollar literal',
    "SELECT $fake$auth.create_rls_policy('inspector', 'unknown')$fake$;",
  ],
  [
    'function body',
    "CREATE FUNCTION inspector.fake() RETURNS void LANGUAGE plpgsql AS $body$ BEGIN PERFORM auth.create_rls_policy('inspector', 'unknown'); END $body$;",
  ],
]) {
  test(`A160-05 ${name} cannot fake helper coverage`, () => {
    fixture(
      (root) => reject(run(root), '99-inspector-fixture.sql'),
      `CREATE TABLE inspector.unknown (tenant_id uuid);\n${fake}`,
    );
  });
}

test('A160-05 comments and strings cannot manufacture tenant tables', () => {
  fixture(
    (root) => accept(run(root)),
    `
    -- CREATE TABLE inspector.fake_line (tenant_id uuid);
    /* CREATE TABLE inspector.fake_block (tenant_id uuid); */
    SELECT 'CREATE TABLE inspector.fake_string (tenant_id uuid);';
    SELECT $fake$CREATE TABLE inspector.fake_dollar (tenant_id uuid);$fake$;
    CREATE FUNCTION inspector.fake() RETURNS text LANGUAGE sql AS $body$
      SELECT 'CREATE TABLE inspector.fake_function (tenant_id uuid);'
    $body$;
  `,
  );
});

for (const [name, sql] of [
  [
    'unterminated identifier',
    'CREATE TABLE "inspector"."broken (tenant_id uuid);',
  ],
  [
    'unterminated comment',
    'CREATE TABLE inspector.broken (tenant_id uuid); /* unclosed',
  ],
  [
    'unterminated literal',
    "CREATE TABLE inspector.broken (tenant_id uuid, note text DEFAULT 'unclosed);",
  ],
  [
    'unterminated dollar body',
    'DO $body$ BEGIN CREATE TABLE inspector.broken (tenant_id uuid);',
  ],
  ['truncated declaration', 'CREATE TABLE inspector.broken (tenant_id uuid,'],
  ['unqualified identity', 'CREATE TABLE unknown (tenant_id uuid);'],
  [
    'split dynamic DDL keyword',
    "DO $body$ BEGIN EXECUTE 'CRE' || 'ATE TABLE inspector.dynamic (tenant_id uuid)'; END $body$;",
  ],
  [
    'implicit LIKE columns',
    'CREATE TABLE inspector.copy (LIKE inspector.original INCLUDING ALL);',
  ],
  [
    'dynamic tenant DDL',
    "DO $body$ BEGIN EXECUTE 'CREATE TABLE inspector.dynamic (tenant_id uuid)'; END $body$;",
  ],
  [
    'concatenated dynamic DDL',
    "DO $body$ BEGIN EXECUTE 'CREATE ' || 'TABLE inspector.dynamic (tenant_id uuid)'; END $body$;",
  ],
]) {
  test(`A160-05 fails closed for ${name}`, () => {
    fixture((root) => reject(run(root), '99-inspector-fixture.sql'), sql);
  });
}

for (const name of [
  outboxPath,
  offlinePath,
  metadataPath,
  'tools/stynx-version.json',
  'backend/app/package.json',
  'backend/app/node_modules',
]) {
  test(`A160-05 missing ${name} has no ambient fallback`, () => {
    fixture((root) => {
      rmSync(path.join(root, name), { recursive: true, force: true });
      reject(run(root, { cwd: repo }));
    });
  });
}

for (const [name, mutate] of [
  [
    'package version',
    (m) => {
      m.artifacts[0].packageVersion = '1.5.0';
    },
  ],
  [
    'contract version',
    (m) => {
      m.artifacts[0].contractVersion = '9.0.0';
    },
  ],
  [
    'entrypoint digest',
    (m) => {
      m.artifacts[0].entrypointSha256 = '0'.repeat(64);
    },
  ],
  [
    'source digest',
    (m) => {
      m.artifacts[0].manifest.sources[0].sha256 = '0'.repeat(64);
    },
  ],
  [
    'target path',
    (m) => {
      m.artifacts[0].target = 'backend/database/ddl/99-other.sql';
    },
  ],
  [
    'owner binding',
    (m) => {
      m.artifacts[0].binding.ownerRole = 'role_app_backend';
    },
  ],
  [
    'app binding',
    (m) => {
      m.artifacts[0].binding.appRole = 'postgres';
    },
  ],
  [
    'reader binding',
    (m) => {
      m.artifacts[0].binding.readerRole = 'role_app_backend';
    },
  ],
  [
    'tenant schema',
    (m) => {
      m.artifacts[0].binding.tenantTable.schema = 'public';
    },
  ],
  [
    'tenant table',
    (m) => {
      m.artifacts[0].binding.tenantTable.table = 'other';
    },
  ],
  [
    'tenant column',
    (m) => {
      m.artifacts[0].binding.tenantTable.column = 'tenant_id';
    },
  ],
  [
    'manifest extra object',
    (m) => {
      m.artifacts[0].manifest.catalog.push({
        kind: 'relation',
        name: 'unknown',
        value: {},
      });
    },
  ],
  [
    'duplicate artifact',
    (m) => {
      m.artifacts.push(structuredClone(m.artifacts[0]));
    },
  ],
  [
    'missing artifact entry',
    (m) => {
      m.artifacts.pop();
    },
  ],
  [
    'unknown top-level field',
    (m) => {
      m.permissive = true;
    },
  ],
]) {
  test(`A160-05 rejects metadata drift: ${name}`, () => {
    fixture((root) => {
      editMetadata(root, mutate);
      reject(run(root), 'stynx-storage.json');
    });
  });
}

test('A160-05 rejects a mismatched exact pin', () => {
  fixture((root) => {
    json(root, 'tools/stynx-version.json', { version: '1.5.0' });
    reject(run(root));
  });
});

for (const name of [metadataPath, 'tools/stynx-version.json']) {
  test(`A160-05 rejects malformed JSON: ${name}`, () => {
    fixture((root) => {
      write(root, name, '{ malformed');
      reject(run(root));
    });
  });
}

const tenantFence =
  "tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid";
for (const [name, from, to] of [
  ['ENABLE RLS', 'ALTER TABLE outbox.messages ENABLE ROW LEVEL SECURITY;', ''],
  ['FORCE RLS', 'ALTER TABLE outbox.messages FORCE ROW LEVEL SECURITY;', ''],
  ['USING', `USING      (${tenantFence})`, ''],
  ['WITH CHECK', `WITH CHECK (${tenantFence})`, ''],
  ['tenant fence', `USING      (${tenantFence})`, 'USING (true)'],
  [
    'missing-context rejection',
    "current_setting('app.tenant_id', true)",
    "current_setting('app.tenant_id', false)",
  ],
]) {
  test(`A160-05 refuses removal or weakening of published ${name}`, () => {
    fixture((root) => {
      edit(root, outboxPath, from, to);
      // Rehash the local edited artifact: self-consistency must not confer authority.
      editMetadata(root, (m) => {
        m.artifacts[0].sha256 = sha256(
          readFileSync(path.join(root, outboxPath)),
        );
      });
      reject(run(root), '19-stynx-outbox.sql');
    });
  });
}

test('A160-05 rejects SQL mutation even when every local SQL digest is recomputed', () => {
  fixture((root) => {
    const installed = createRequire(
      path.join(repo, 'backend/app/package.json'),
    )('@stynx-nyx/outbox').renderOutboxStorage({
      ownerRole: 'postgres',
      appRole: 'role_app_backend',
      readerRole: null,
      tenantTable: { schema: 'auth', table: 'tenants', column: 'id' },
    });
    edit(root, outboxPath, tenantFence, 'true');
    editMetadata(root, (m) => {
      const bytes = readFileSync(path.join(root, outboxPath), 'utf8');
      const original = originals.get(outboxPath);
      const headerEnd = original.indexOf('\n', original.indexOf('\n') + 1) + 1;
      const roleStart = headerEnd + installed.objectsSql.length + 1;
      assert.equal(
        original.slice(headerEnd, roleStart - 1),
        installed.objectsSql,
      );
      assert.equal(original.slice(roleStart), installed.roleBindingsSql);
      m.artifacts[0].sha256 = sha256(bytes);
      m.artifacts[0].objectsSha256 = sha256(
        bytes.slice(headerEnd, roleStart - 1),
      );
      m.artifacts[0].roleBindingsSha256 = sha256(bytes.slice(roleStart));
    });
    reject(run(root), '19-stynx-outbox.sql');
  });
});

for (const [name, sql] of [
  [
    'extra permissive policy',
    'CREATE POLICY inspector_bypass ON outbox.events TO role_app_backend USING (true) WITH CHECK (true);',
  ],
  ['disable FORCE', 'ALTER TABLE outbox.events NO FORCE ROW LEVEL SECURITY;'],
  [
    'unqualified ALTER via search_path',
    'SET LOCAL search_path=outbox,public; ALTER TABLE events NO FORCE ROW LEVEL SECURITY;',
  ],
  [
    'unqualified GRANT via search_path',
    'SET LOCAL search_path=outbox,public; GRANT UPDATE ON events TO PUBLIC;',
  ],
  [
    'Unicode escaped schema',
    String.raw`ALTER TABLE U&"out\0062ox".events NO FORCE ROW LEVEL SECURITY;`,
  ],
  [
    'split dynamic schema',
    "DO $body$ BEGIN EXECUTE format('ALTER TABLE %I.events NO FORCE ROW LEVEL SECURITY', 'out' || 'box'); END $body$;",
  ],
  [
    'direct protected helper',
    "SELECT auth.create_rls_policy('outbox', 'events');",
  ],
  [
    'singlequoted DO override',
    "DO 'BEGIN EXECUTE ''ALTER TABLE outbox.events NO FORCE ROW LEVEL SECURITY''; END';",
  ],
  [
    'dynamic formatted override',
    "DO $body$ BEGIN EXECUTE format('ALTER TABLE %I.%I NO FORCE ROW LEVEL SECURITY', 'outbox', 'events'); END $body$;",
  ],
  [
    'disable RLS',
    'ALTER TABLE offline.sync_queue_items DISABLE ROW LEVEL SECURITY;',
  ],
  ['grant protected relation', 'GRANT UPDATE ON outbox.events TO PUBLIC;'],
  [
    'drop protected policy',
    'DROP POLICY events_tenant__635a6e8a4070 ON outbox.events;',
  ],
  [
    'redeclare protected relation',
    'CREATE TABLE IF NOT EXISTS "outbox"."events" (tenant_id uuid);',
  ],
  [
    'owner-only grant',
    'GRANT SELECT ON outbox.ack_quarantine TO role_app_backend;',
  ],
]) {
  test(`A160-05 another file cannot override package protection: ${name}`, () => {
    fixture((root) => reject(run(root), '99-inspector-fixture.sql'), sql);
  });
}

test('A160-05 rejects additional bytes appended to an approved artifact', () => {
  fixture((root) => {
    write(
      root,
      offlinePath,
      `${originals.get(offlinePath)}\n-- inspector appended text\n`,
    );
    reject(run(root), '19-stynx-offline.sql');
  });
});

test('A160-05 explicit root wins over a different cwd, including a relative root', () => {
  fixture((root) => {
    const elsewhere = path.join(root, 'elsewhere');
    mkdirSync(elsewhere);
    accept(run(root, { cwd: elsewhere }));
    accept(run(root, { cwd: elsewhere, args: ['..'] }));
  });
});

test('A160-05 omitted root uses cwd', () => {
  fixture((root) => accept(run(root, { args: [] })));
});

test('A160-05 extra arguments and an invalid root refuse', () => {
  fixture((root) => {
    reject(run(root, { args: [root, 'unexpected'] }));
    reject(run(root, { args: [path.join(root, 'absent')] }));
    reject(run(root, { args: [path.join(root, metadataPath)] }));
  });
});

test('A160-05 classification has no fixture write effects', () => {
  fixture((root) => {
    const before = snapshot(root);
    const packageMtime = statSync(
      path.join(repo, 'backend/app/package.json'),
    ).mtimeMs;
    accept(run(root));
    assert.deepEqual(snapshot(root), before);
    edit(
      root,
      offlinePath,
      'FORCE ROW LEVEL SECURITY',
      'NO FORCE ROW LEVEL SECURITY',
    );
    const tampered = snapshot(root);
    reject(run(root));
    assert.deepEqual(snapshot(root), tampered);
    assert.equal(
      statSync(path.join(repo, 'backend/app/package.json')).mtimeMs,
      packageMtime,
    );
  });
});

test('A160-05 real repository inventories reconcile with all 21 package tenant tables', () => {
  assert.ok(existsSync(cli));
  const result = run(repo);
  assert.equal(result.status, 0, result.output);
  count(result, 'package', 21);
  count(result, 'exempt', 2);
  count(result, 'helper', 269);
});

for (const [name, sql] of [
  ['owner membership to app', 'GRANT postgres TO role_app_backend;'],
  ['owner membership to auditor', 'GRANT postgres TO role_auditor_min;'],
  [
    'indirect owner membership',
    'CREATE ROLE inspector_owner NOLOGIN; GRANT postgres TO inspector_owner; GRANT inspector_owner TO role_app_backend;',
  ],
  ['unproved membership', 'GRANT inspector_unknown TO role_app_backend;'],
  ['SUPERUSER', 'ALTER ROLE role_app_backend SUPERUSER;'],
  ['BYPASSRLS', 'ALTER ROLE role_app_backend BYPASSRLS;'],
  ['CREATEROLE', 'ALTER ROLE role_app_backend CREATEROLE;'],
  ['CREATEDB', 'ALTER ROLE role_app_backend CREATEDB;'],
  ['REPLICATION', 'ALTER ROLE role_app_backend REPLICATION;'],
  ['privileged inheritance', 'ALTER ROLE role_auditor_min INHERIT;'],
  [
    'dynamic membership',
    "DO $body$ BEGIN EXECUTE format('GRANT %I TO %I', 'postgres', 'role_app_backend'); END $body$;",
  ],
  [
    'Unicode protected role',
    String.raw`GRANT U&"post\0067res" TO role_app_backend;`,
  ],
]) {
  test(`A160-10 refuses role escalation: ${name}`, () => {
    fixture((root) => reject(run(root), '99-inspector-fixture.sql'), sql);
  });
}

for (const [name, invocation] of [
  [
    'concatenated schema',
    "SELECT auth.create_rls_policy('inspect' || 'or', 'unknown');",
  ],
  [
    'Unicode argument',
    String.raw`SELECT auth.create_rls_policy(U&'inspector', 'unknown');`,
  ],
]) {
  test(`A160-10 refuses obfuscated helper: ${name}`, () => {
    fixture(
      (root) => reject(run(root), '99-inspector-fixture.sql'),
      `CREATE TABLE inspector.unknown (tenant_id uuid); ${invocation}`,
    );
  });
}

for (const files of [
  ['01-schemas.sql'],
  [
    '19-rait-priority-pre.sql',
    '19-rait-priority-enforce.sql',
    '19-rait-priority-verify.sql',
  ],
]) {
  test(`A160-10 reviewed finite legacy DO remains accepted: ${files.join(',')}`, () => {
    fixture((root) => {
      for (const name of files)
        write(
          root,
          `backend/database/ddl/${name}`,
          readFileSync(path.join(repo, 'backend/database/ddl', name)),
        );
      accept(run(root));
    });
  });
}

test('A160-10 existing schema filename cannot exempt injected role escalation', () => {
  fixture((root) => {
    const name = 'backend/database/ddl/01-schemas.sql';
    const source = readFileSync(path.join(repo, name), 'utf8');
    assert.ok(source.includes('END\n$$;'));
    write(
      root,
      name,
      source.replace(
        'END\n$$;',
        'GRANT postgres TO role_app_backend;\nEND\n$$;',
      ),
    );
    reject(run(root), '01-schemas.sql');
  });
});

test('A160-10 reviewed priority filename cannot exempt changed dynamic column set', () => {
  fixture((root) => {
    const name = 'backend/database/ddl/19-rait-priority-pre.sql';
    const source = readFileSync(path.join(repo, name), 'utf8');
    const before =
      "('agency_jurisdiction_id','judge_body_received_on','cetran_received_on')";
    assert.ok(source.includes(before));
    write(
      root,
      name,
      source.replace(
        before,
        "('tenant_id','judge_body_received_on','cetran_received_on')",
      ),
    );
    reject(run(root), '19-rait-priority-pre.sql');
  });
});

for (const [name, invocation] of [
  ['concatenation', "SELECT auth.create_rls_policy('out' || 'box', 'events');"],
  ['Unicode', String.raw`SELECT auth.create_rls_policy(U&'outbox', 'events');`],
  ['cast', "SELECT auth.create_rls_policy('outbox'::text, 'events');"],
  [
    'CTE',
    "WITH mutate AS (SELECT auth.create_rls_policy('outbox', 'events')) SELECT * FROM mutate;",
  ],
]) {
  test(`A160-10 standalone helper mutation refuses without an uncovered table: ${name}`, () => {
    fixture(
      (root) => reject(run(root), '99-inspector-fixture.sql'),
      invocation,
    );
  });
}

const reviewedBodies = [
  ['01-schemas.sql', ''],
  ['19-rait-priority-enforce.sql', 'roles'],
  ['19-rait-priority-enforce.sql', 'triggers'],
  ['19-rait-priority-pre.sql', 'pre'],
  ['19-rait-priority-pre.sql', 'historical'],
  ['20-rls-policies.sql', ''],
].map(([name, tag]) => {
  const source = readFileSync(
    path.join(repo, 'backend/database/ddl', name),
    'utf8',
  );
  const open = `DO $${tag}$`;
  const start = source.indexOf(open);
  assert.ok(start >= 0);
  const close = `$${tag}$;`;
  const end = source.indexOf(close, start + open.length);
  assert.ok(end >= 0);
  return {
    name: `${name}:${tag || 'empty'}`,
    sql: source.slice(start, end + close.length),
    open,
    close,
  };
});

for (const { name, sql, open, close } of reviewedBodies) {
  test(`A160-10 exact reviewed body accepted in an unrelated filename: ${name}`, () => {
    fixture((root) => accept(run(root)), sql);
  });
  test(`A160-10 one-byte reviewed body change refuses: ${name}`, () => {
    fixture(
      (root) => reject(run(root), '99-inspector-fixture.sql'),
      sql.replace(open, `${open} `),
    );
  });
  test(`A160-10 reviewed body with non-plpgsql language refuses: ${name}`, () => {
    fixture(
      (root) => reject(run(root), '99-inspector-fixture.sql'),
      sql.replace(close, `${close.slice(0, -1)} LANGUAGE sql;`),
    );
  });
}

test('A160-10 approved body cannot exempt a following escalation in its original filename', () => {
  fixture((root) => {
    const name = 'backend/database/ddl/01-schemas.sql';
    write(
      root,
      name,
      `${readFileSync(path.join(repo, name), 'utf8')}\nGRANT postgres TO role_app_backend;`,
    );
    reject(run(root), '01-schemas.sql');
  });
});

for (const [name, sql] of [
  [
    'CREATE USER owner membership',
    'CREATE USER peer_review_probe IN ROLE postgres;',
  ],
  [
    'set_config search_path and unqualified protected drop',
    "SELECT pg_catalog.set_config('search_path','outbox',false); DROP TABLE events;",
  ],
  [
    'rename ordinary column to tenant_id',
    'CREATE TABLE public.peer_review_probe (id uuid); ALTER TABLE public.peer_review_probe RENAME COLUMN id TO tenant_id;',
  ],
  [
    'called procedure role escalation',
    "CREATE PROCEDURE public.peer_review_probe() LANGUAGE plpgsql AS $probe$ BEGIN EXECUTE 'GRANT postgres TO role_app_backend'; END $probe$; CALL public.peer_review_probe();",
  ],
]) {
  test(`A160-10 independent peer bypass refuses: ${name}`, () => {
    fixture((root) => reject(run(root), '99-inspector-fixture.sql'), sql);
  });
}

for (const [name, bytes, digest] of [
  [
    'create_rls_policy',
    641,
    '81a0969747442e9b9be35325e9fb21939badebf3fb8280cdfb44857fea1c2076',
  ],
  [
    'install_tenant_triggers',
    2591,
    'b147e07428543aa2e083c9a5e7c4af888bc661149cbad0e2c329ec1fe30984c2',
  ],
]) {
  const source = readFileSync(
    path.join(repo, 'backend/database/ddl/11-auth-functions.sql'),
    'utf8',
  );
  const start = source.indexOf(`CREATE OR REPLACE FUNCTION auth.${name}(`);
  assert.ok(start >= 0);
  const end = source.indexOf('$$;', start);
  assert.ok(end >= 0);
  const sql = source.slice(start, end + 3);
  assert.equal(Buffer.byteLength(sql), bytes);
  assert.equal(sha256(sql), digest);
  test(`D-160.14 exact reviewed stored function accepted in unrelated filename: ${name}`, () => {
    fixture((root) => accept(run(root)), sql);
  });
  for (const [mutation, changed] of [
    ['body byte', sql.replace('AS $$', 'AS $$ ')],
    ['name', sql.replace(`auth.${name}(`, `auth.inspector_${name}(`)],
    [
      'signature',
      name === 'create_rls_policy'
        ? sql.replace('p_schema text', 'p_schema varchar')
        : sql.replace(`${name}()`, `${name}(inspector_extra text)`),
    ],
    [
      'security',
      sql.replace('LANGUAGE plpgsql', 'LANGUAGE plpgsql\nSECURITY DEFINER'),
    ],
    ['language', sql.replace('LANGUAGE plpgsql', 'LANGUAGE plpython3u')],
    ['appended escalation', `${sql}\nGRANT postgres TO role_app_backend;`],
  ]) {
    assert.notEqual(changed, sql);
    test(`D-160.14 reviewed stored function tamper refuses ${name}: ${mutation}`, () => {
      fixture((root) => reject(run(root), '99-inspector-fixture.sql'), changed);
    });
  }
}

test('D-160.14 unknown dynamic stored function refuses at definition', () => {
  fixture(
    (root) => reject(run(root), '99-inspector-fixture.sql'),
    "CREATE FUNCTION public.inspector_unknown() RETURNS void LANGUAGE plpgsql AS $body$ BEGIN EXECUTE 'GRANT postgres TO role_app_backend'; END $body$;",
  );
});

test('D-160.14 benign stored literal with EXECUTE/helper text remains inert', () => {
  fixture(
    (root) => accept(run(root)),
    "CREATE FUNCTION public.inspector_text() RETURNS text LANGUAGE sql AS $body$ SELECT 'EXECUTE SELECT auth.create_rls_policy(''outbox'',''events'')'::text; $body$;",
  );
});

for (const [name, sql] of [
  ['SET SCHEMA alias', "SET SCHEMA 'outbox'; DROP TABLE events;"],
  [
    'quoted comma search_path',
    "SET search_path='outbox,public'; DROP TABLE events;",
  ],
  [
    'opaque set_config key',
    "SELECT pg_catalog.set_config('search_' || 'path','outbox',false); DROP TABLE events;",
  ],
  [
    'DO local role switch',
    'DO $body$ BEGIN SET LOCAL ROLE postgres; END $body$;',
  ],
  [
    'stored local role switch',
    'CREATE FUNCTION public.inspector_role() RETURNS void LANGUAGE plpgsql AS $body$ BEGIN SET LOCAL ROLE postgres; END $body$;',
  ],
  [
    'stored protected search_path',
    "CREATE FUNCTION public.inspector_path() RETURNS void LANGUAGE plpgsql AS $body$ BEGIN SET LOCAL search_path='outbox,public'; END $body$;",
  ],
  [
    'stored protected schema alias',
    "CREATE FUNCTION public.inspector_schema() RETURNS void LANGUAGE plpgsql AS $body$ BEGIN SET SCHEMA 'outbox'; END $body$;",
  ],
]) {
  test(`D-160.14 protected context mutation refuses: ${name}`, () => {
    fixture((root) => reject(run(root), '99-inspector-fixture.sql'), sql);
  });
}

for (const [name, sql] of [
  ['top-level', 'CREATE ROLE "on"; GRANT postgres, "on" TO role_app_backend;'],
  [
    'stored',
    'CREATE ROLE "on"; CREATE FUNCTION public.inspector_on() RETURNS void LANGUAGE plpgsql AS $body$ BEGIN GRANT postgres, "on" TO role_app_backend; END $body$;',
  ],
]) {
  test(`D-160.14 quoted on role cannot impersonate privilege syntax: ${name}`, () => {
    fixture((root) => reject(run(root), '99-inspector-fixture.sql'), sql);
  });
}
