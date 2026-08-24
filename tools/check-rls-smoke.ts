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
    'check-rls-smoke: OK (tenant isolation, enforce_tenant_id, audit persistence)',
  );
} finally {
  await client.end();
}
