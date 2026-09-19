// INV-DDL05-001/002/003: future PostgreSQL rehearsal only. Do not run in TASK-0032.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import test from 'node:test';

const { Client } = pg;
const database = 'detran_r7_ctg1_a2';
const admin = 'aarusso';
const expectedUrl = `postgresql://${admin}@localhost/${database}`;
const urlVariable = 'DETRAN_DDL05_ADMIN_DATABASE_URL';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const fields = [
  'family',
  'name',
  'description',
  'apps',
  'is_staff',
  'source',
  'introduced_on',
];
const sentinel = '2000-01-01 00:00:00.000000+00';
const projection = `key, family, name, description, apps, is_staff, source,
  introduced_on::text AS introduced_on,
  to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS.US') AS created_at,
  to_char(updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS.US') AS updated_at`;

function blocked(message) {
  return new Error(`BLOCKED (not behavioral RED): ${message}`);
}

function explicitUrl() {
  if (process.env.DETRAN_DDL05_DB_TEST_AUTHORIZED !== '1')
    throw blocked('dedicated DDL05 DB rehearsal needs explicit authorization');
  const raw = process.env[urlVariable];
  if (!raw) throw blocked(`${urlVariable} is required; no DB fallback`);
  if (raw !== expectedUrl)
    throw blocked(`${urlVariable} must exactly equal ${expectedUrl}`);
  return raw;
}

async function rows(client) {
  return (
    await client.query(
      `SELECT ${projection} FROM auth.role_catalog ORDER BY key`,
    )
  ).rows;
}

async function row(client, key) {
  const result = await client.query(
    `SELECT ${projection} FROM auth.role_catalog WHERE key = $1`,
    [key],
  );
  assert.equal(result.rowCount, 1, `catalogue row ${key} must exist`);
  return result.rows[0];
}

async function updateCount(client) {
  const result = await client.query(`
    SELECT n_tup_upd::bigint::text AS count
    FROM pg_stat_xact_user_tables
    WHERE relid = 'auth.role_catalog'::regclass
  `);
  assert.equal(result.rowCount, 1, 'transactional UPDATE counter required');
  return BigInt(result.rows[0].count);
}

async function preflight(client) {
  const result = await client.query(`
    SELECT current_database() AS database, current_user AS principal,
           r.rolsuper AS superuser, r.rolbypassrls AS bypass_rls,
           pg_has_role(current_user, c.relowner, 'MEMBER') AS owns_table,
           has_table_privilege(current_user, c.oid, 'INSERT, UPDATE, DELETE') AS can_mutate,
           (SELECT count(*)::integer FROM pg_stat_activity
            WHERE datname = current_database() AND backend_type = 'client backend') AS clients
    FROM pg_roles r, pg_class c
    WHERE r.rolname = current_user AND c.oid = 'auth.role_catalog'::regclass
  `);
  if (result.rowCount !== 1) throw blocked('admin/table identity unavailable');
  const identity = result.rows[0];
  if (identity.database !== database || identity.principal !== admin)
    throw blocked('current_database/current_user differs from dedicated admin');
  if (!identity.owns_table && !identity.superuser)
    throw blocked('admin lacks DDL ownership authority on auth.role_catalog');
  if (!identity.can_mutate)
    throw blocked('admin lacks INSERT/UPDATE/DELETE privilege');
  if (identity.clients !== 1)
    throw blocked('dedicated database has concurrent client sessions');
  const lock = await client.query(
    'SELECT pg_try_advisory_xact_lock(7007, 5) AS acquired',
  );
  if (lock.rows[0].acquired !== true)
    throw blocked('dedicated DDL05 transaction lock unavailable');
}

function sqlParts(ddl) {
  const inserts = [
    ...ddl.matchAll(
      /INSERT\s+INTO\s+auth\.role_catalog\s*\(\s*key\s*,\s*family\s*,\s*name\s*,\s*description\s*,\s*apps\s*,\s*is_staff\s*,\s*source\s*,\s*introduced_on\s*\)\s+VALUES\s*([\s\S]*?)\s+ON\s+CONFLICT\s*\(key\)\s+DO\s+UPDATE\s+SET\s*([\s\S]*?);/gi,
    ),
  ];
  assert.equal(inserts.length, 1, 'exactly one DDL05 upsert required');
  const match = inserts[0];
  return { statement: match[0], values: match[1] };
}

async function assertCanonicalBaseline(client, values) {
  const result = await client.query(`
    WITH canonical (key, family, name, description, apps, is_staff, source, introduced_on)
    AS (VALUES ${values})
    SELECT count(*)::integer AS expected,
      count(r.key)::integer AS present,
      count(*) FILTER (WHERE r.key IS NULL OR
        ROW(r.family, r.name, r.description, r.apps, r.is_staff, r.source, r.introduced_on)
        IS DISTINCT FROM
        ROW(c.family, c.name, c.description, c.apps, c.is_staff, c.source, c.introduced_on::date)
      )::integer AS divergent
    FROM canonical c LEFT JOIN auth.role_catalog r USING (key)
  `);
  const { expected, present, divergent } = result.rows[0];
  const actual = await client.query(
    'SELECT count(*)::integer AS count FROM auth.role_catalog',
  );
  if (
    expected !== 36 ||
    present !== 36 ||
    actual.rows[0].count !== 36 ||
    divergent !== 0
  )
    throw blocked('DDL05 catalogue is not the exact canonical 36-row baseline');
}

function canonicalValues(actual) {
  return Object.fromEntries(fields.map((field) => [field, actual[field]]));
}

async function assertUnchangedOthers(client, before, key) {
  const after = await rows(client);
  assert.deepEqual(
    after.filter((entry) => entry.key !== key),
    before.filter((entry) => entry.key !== key),
    'unaffected catalogue rows must preserve fields and timestamps',
  );
}

test('dado catálogo canônico quando aplica DDL05 em transação então igualdade, divergência, repetição e ausência respeitam idempotência', async () => {
  const url = explicitUrl();
  const ddl = await readFile(
    resolve(root, 'backend/database/ddl/05-role-catalog.sql'),
    'utf8',
  );
  const { statement, values } = sqlParts(ddl);
  const client = new Client({ connectionString: url });
  let connected = false;
  let begun = false;
  let initial;
  try {
    await client.connect();
    connected = true;
    const destination = await client.query(
      'SELECT current_database() AS database, current_user AS principal',
    );
    if (
      destination.rows[0].database !== database ||
      destination.rows[0].principal !== admin
    )
      throw blocked(
        'current_database/current_user differs from dedicated admin',
      );
    initial = await rows(client);
    await client.query('BEGIN');
    begun = true;
    await preflight(client);
    await assertCanonicalBaseline(client, values);

    const target = 'rait-analyst';
    const canonical = await row(client, target);
    const beforeEqual = await updateCount(client);
    await client.query(statement);
    assert.equal(
      await updateCount(client),
      beforeEqual,
      'equal apply must do zero row UPDATEs',
    );
    assert.deepEqual(
      await rows(client),
      initial,
      'equal apply changes no row or timestamp',
    );

    const variants = {
      family: 'teat',
      name: 'DDL05 divergent name',
      description: 'DDL05 divergent description',
      apps: ['rait', 'dashboard'],
      is_staff: false,
      source: 'DDL05 divergent source',
      introduced_on: '2025-01-01',
    };
    for (const field of [...fields, 'all']) {
      const overrides =
        field === 'all' ? variants : { [field]: variants[field] };
      const assignments = Object.keys(overrides)
        .map((column, index) => `${column} = $${index + 2}`)
        .join(', ');
      await client.query(
        `UPDATE auth.role_catalog SET ${assignments}, updated_at = $1::timestamptz WHERE key = $${Object.keys(overrides).length + 2}`,
        [sentinel, ...Object.values(overrides), target],
      );
      const divergent = await row(client, target);
      assert.notDeepEqual(
        canonicalValues(divergent),
        canonicalValues(canonical),
      );
      const beforeRepair = await updateCount(client);
      await client.query(statement);
      assert.equal(
        await updateCount(client),
        beforeRepair + 1n,
        `${field}: exactly one row UPDATE`,
      );
      const repaired = await row(client, target);
      assert.deepEqual(canonicalValues(repaired), canonicalValues(canonical));
      assert.equal(repaired.created_at, canonical.created_at);
      assert.notEqual(repaired.updated_at, divergent.updated_at);
      assert.ok(repaired.updated_at > '2000-01-01 00:00:00.000000');
      await assertUnchangedOthers(client, initial, target);
      const beforeReapply = await updateCount(client);
      await client.query(statement);
      assert.equal(
        await updateCount(client),
        beforeReapply,
        `${field}: reapply must not UPDATE`,
      );
      assert.deepEqual(
        await row(client, target),
        repaired,
        `${field}: reapply stable`,
      );
    }

    const references = await client.query(`
      SELECT n.nspname AS schema, c.relname AS relation, a.attname AS column
      FROM pg_constraint fk
      JOIN pg_class c ON c.oid = fk.conrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      JOIN LATERAL unnest(fk.conkey) AS k(attnum) ON true
      JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum = k.attnum
      WHERE fk.contype = 'f' AND fk.confrelid = 'auth.role_catalog'::regclass
    `);
    if (
      references.rows.length !== 1 ||
      references.rows[0].schema !== 'auth' ||
      references.rows[0].relation !== 'roles' ||
      references.rows[0].column !== 'key'
    )
      throw blocked(
        'missing-row fixture requires a known single auth.roles FK',
      );
    const candidate = await client.query(`
      SELECT c.key FROM auth.role_catalog c
      WHERE NOT EXISTS (SELECT 1 FROM auth.roles r WHERE r.key = c.key)
      ORDER BY c.key LIMIT 1
    `);
    if (candidate.rowCount !== 1)
      throw blocked(
        'no canonical role key can be removed without violating FK',
      );
    const missingKey = candidate.rows[0].key;
    const beforeMissing = await rows(client);
    const missingCanonical = await row(client, missingKey);
    await client.query('DELETE FROM auth.role_catalog WHERE key = $1', [
      missingKey,
    ]);
    const beforeInsert = await updateCount(client);
    await client.query(statement);
    assert.equal(
      await updateCount(client),
      beforeInsert,
      'missing-row apply must INSERT, not UPDATE',
    );
    const inserted = await row(client, missingKey);
    assert.deepEqual(
      canonicalValues(inserted),
      canonicalValues(missingCanonical),
    );
    assert.ok(
      inserted.created_at && inserted.updated_at,
      'INSERT defaults required',
    );
    const beforeFinalReapply = await updateCount(client);
    await client.query(statement);
    assert.equal(await updateCount(client), beforeFinalReapply);
    assert.deepEqual(await row(client, missingKey), inserted);
    await assertUnchangedOthers(client, beforeMissing, missingKey);
  } finally {
    if (connected) {
      try {
        if (begun) await client.query('ROLLBACK');
        if (initial)
          assert.deepEqual(
            await rows(client),
            initial,
            'ROLLBACK restores initial catalogue',
          );
      } finally {
        await client.end();
      }
    }
  }
});
