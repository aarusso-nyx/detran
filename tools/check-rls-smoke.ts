import fs from 'node:fs';
import path from 'node:path';

import pg from 'pg';

const { Client } = pg;
const connectionString =
  process.env.DETRAN_TEST_DATABASE_URL ??
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5432/detran';
const tenantA = '00000000-0000-7000-8000-000000000101';
const tenantB = '00000000-0000-7000-8000-000000000102';
const actorA = '00000000-0000-4000-8000-000000000201';
const actorB = '00000000-0000-4000-8000-000000000202';
const expectedDomainTables = expectedTenantDomainTables();

const client = new Client({ connectionString });
await client.connect();
try {
  await client.query(`select set_config('app.role', 'owner', false)`);
  await client.query(
    `insert into auth.tenants (id, slug, name) values
       ($1, 'rr', 'DETRAN RR'), ($2, 'sp', 'DETRAN SP')
     on conflict (id) do update set name = excluded.name`,
    [tenantA, tenantB],
  );
  await client.query(
    `insert into auth.users (id, tenant_id, email, display_name) values
       ($1, $3, 'rls-a@detran.invalid', 'RLS A'),
       ($2, $4, 'rls-b@detran.invalid', 'RLS B')
     on conflict (id) do update set tenant_id = excluded.tenant_id`,
    [actorA, actorB, tenantA, tenantB],
  );
  await client.query(
    `insert into auth.memberships (tenant_id, user_id) values ($1, $2), ($3, $4)
     on conflict (tenant_id, user_id) do update set is_active = true`,
    [tenantA, actorA, tenantB, actorB],
  );

  await client.query('begin');
  await client.query('set local role role_app_backend');
  await client.query(`select set_config('app.tenant_id', $1, true)`, [tenantA]);
  await client.query(`select set_config('app.actor_id', $1, true)`, [actorA]);
  const visible = await client.query<{ count: string }>(
    'select count(*)::text as count from auth.memberships',
  );
  if (visible.rows[0]?.count !== '1') {
    throw new Error(
      `tenant A saw ${visible.rows[0]?.count ?? 'unknown'} membership rows; expected 1`,
    );
  }

  await client.query('savepoint mismatch_check');
  let mismatchRejected = false;
  try {
    await client.query(
      `insert into storage.objects
       (tenant_id, collection, object_key, content_type, byte_size, checksum_sha256, classification)
       values ($1, 'evidence', 'cross-tenant', 'application/pdf', 1, '00', 'restricted')`,
      [tenantB],
    );
  } catch (error) {
    mismatchRejected = (error as { code?: string }).code === '42501';
  }
  await client.query('rollback to savepoint mismatch_check');
  if (!mismatchRejected)
    throw new Error('cross-tenant insert was not rejected with SQLSTATE 42501');

  await client.query('savepoint direct_audit_check');
  let directAuditRejected = false;
  try {
    await client.query(
      `insert into audit.events (tenant_id, action, entity, self_hash)
       values ($1, 'BYPASS', 'audit.chain', decode('00', 'hex'))`,
      [tenantA],
    );
  } catch (error) {
    directAuditRejected = (error as { code?: string }).code === '42501';
  }
  await client.query('rollback to savepoint direct_audit_check');
  if (!directAuditRejected) {
    throw new Error('direct audit.events insert was not denied');
  }

  await client.query(
    `insert into storage.objects
     (collection, object_key, content_type, byte_size, checksum_sha256, classification)
     values ('evidence', 'tenant-a', 'application/pdf', 1, '01', 'restricted')
     on conflict (tenant_id, object_key) do nothing`,
  );
  const opsEvidence = await client.query<{ id: string }>(
    `insert into ops.evidence_evidence
       (traffic_agency_id, evidence_type, origin, storage_uri, mime_type, size_bytes, hash_algorithm, hash_value, captured_at, location_json, location_geom)
     values ($1, 'photo', 'mobile', 'storage://evidence/rls', 'image/jpeg', 1, 'sha256', 'rls-smoke-evidence', now(), '{"latitude": -23.5505, "longitude": -46.6333}', public.detran_jsonb_point_4674('{"latitude": -23.5505, "longitude": -46.6333}'))
     returning id`,
    [tenantA],
  );
  if (!opsEvidence.rows[0]?.id) throw new Error('ops evidence insert failed');
  const geometryRoundTrip = await client.query<{ location: { type?: string } }>(
    `select st_asgeojson(location_geom)::json as location from ops.evidence_evidence where id = $1`,
    [opsEvidence.rows[0].id],
  );
  if (geometryRoundTrip.rows[0]?.location.type !== 'Point') {
    throw new Error('SRID-4674 geometry to JSON round-trip failed');
  }
  const domainRls = await client.query<{
    table_schema: string;
    table_name: string;
    rls_enabled: boolean;
    rls_forced: boolean;
    has_policy: boolean;
    has_trigger: boolean;
  }>(
    `select tables.table_schema,
            tables.table_name,
            classes.relrowsecurity as rls_enabled,
            classes.relforcerowsecurity as rls_forced,
            exists (select 1 from pg_policies policies where policies.schemaname = tables.table_schema and policies.tablename = tables.table_name and policies.policyname = 'tenant_isolation') as has_policy,
            exists (select 1 from pg_trigger triggers where triggers.tgrelid = classes.oid and triggers.tgname = 'enforce_tenant_id' and not triggers.tgisinternal) as has_trigger
       from information_schema.tables tables
       join pg_namespace namespaces on namespaces.nspname = tables.table_schema
       join pg_class classes on classes.relnamespace = namespaces.oid and classes.relname = tables.table_name
      where tables.table_schema in ('inf', 'ch')
        and tables.table_type = 'BASE TABLE'
        and exists (
          select 1 from information_schema.columns columns
           where columns.table_schema = tables.table_schema
             and columns.table_name = tables.table_name
             and columns.column_name = 'tenant_id'
        )
      order by tables.table_schema, tables.table_name`,
  );
  const actualDomainTables = domainRls.rows.map(
    (table) => `${table.table_schema}.${table.table_name}`,
  );
  const missingTables = expectedDomainTables.filter(
    (table) => !actualDomainTables.includes(table),
  );
  const unexpectedTables = actualDomainTables.filter(
    (table) => !expectedDomainTables.includes(table),
  );
  if (missingTables.length || unexpectedTables.length) {
    throw new Error(
      `domain migration mismatch; missing=[${missingTables.join(', ')}] unexpected=[${unexpectedTables.join(', ')}]`,
    );
  }
  const unprotected = domainRls.rows.filter(
    (table) =>
      !table.rls_enabled ||
      !table.rls_forced ||
      !table.has_policy ||
      !table.has_trigger,
  );
  if (unprotected.length) {
    throw new Error(
      `domain RLS coverage failed: ${unprotected.map((table) => `${table.table_schema}.${table.table_name}`).join(', ')}`,
    );
  }
  await client.query(
    `select audit.write($1, $2, 'AUDITOR', 'RLS_SMOKE', 'storage.object', null, '{}'::jsonb)`,
    [tenantA, actorA],
  );
  const chain = await client.query<{ valid: boolean }>(
    'select audit.verify_chain($1) as valid',
    [tenantA],
  );
  if (chain.rows[0]?.valid !== true)
    throw new Error('audit hash chain verification failed');
  await client.query('rollback');

  console.log(
    `check-rls-smoke: OK (tenant isolation, ${domainRls.rows.length} inf/ch tables, ops RLS, SRID-4674 round-trip, audit persistence)`,
  );
} finally {
  await client.end();
}

function expectedTenantDomainTables(): string[] {
  const ddlDirectory = path.join(process.cwd(), 'backend', 'database', 'ddl');
  const sql = fs
    .readdirSync(ddlDirectory)
    .filter((name) => name.endsWith('.sql'))
    .sort()
    .map((name) => fs.readFileSync(path.join(ddlDirectory, name), 'utf8'))
    .join('\n');
  const tables: string[] = [];
  const createTable =
    /create\s+table\s+if\s+not\s+exists\s+((?:inf|ch)\.[\w]+)\s*\(([\s\S]*?)\);/gi;
  let match: RegExpExecArray | null;
  while ((match = createTable.exec(sql))) {
    if (/\btenant_id\b/i.test(match[2] ?? ''))
      tables.push((match[1] ?? '').toLowerCase());
  }
  return [...new Set(tables)].sort();
}
