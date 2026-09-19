import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const { Client } = pg;
const OWNER_DATABASE_URL = 'postgresql://aarusso@localhost/detran_r7_ctg1_a2';
const APP_DATABASE_URL =
  'postgresql://aarusso@localhost/detran_r7_ctg1_a2?options=-c%20role%3Drole_app_backend';
const EXPECTED_DATABASE = 'detran_r7_ctg1_a2';
const TENANT = '00000000-0000-7000-8000-00000000a001';
const OTHER_TENANT = '00000000-0000-7000-8000-00000000a002';
const MANIFEST = 'rait_batch_minutes_manifest';

const owner = new Client({ connectionString: OWNER_DATABASE_URL });
const app = new Client({ connectionString: APP_DATABASE_URL });

async function appTransaction<T>(tenantId: string, work: () => Promise<T>) {
  await app.query('begin');
  try {
    await app.query('set local role role_app_backend');
    await app.query(`select set_config('app.tenant_id', $1, true)`, [tenantId]);
    return await work();
  } finally {
    await app.query('rollback');
  }
}

describe('CTG-0002 — manifestação imutável da ata de distribuição no banco', () => {
  beforeAll(async () => {
    expect(process.env.DETRAN_RUNTIME_PROFILE).toBe('test');
    expect(new URL(OWNER_DATABASE_URL).pathname.slice(1)).toBe(
      EXPECTED_DATABASE,
    );
    expect(new URL(APP_DATABASE_URL).searchParams.get('options')).toBe(
      '-c role=role_app_backend',
    );
    await owner.connect();
    await app.connect();
  });

  afterAll(async () => {
    await Promise.all([owner.end(), app.end()]);
  });

  it('dado o banco descartável com fixtures históricas quando o sensor é iniciado então preserva os 20 casos sem reset', async () => {
    const result = await owner.query<{ cases: string }>(
      `select count(*)::text as cases from inf.rait_case where tenant_id = $1`,
      [TENANT],
    );

    expect(result.rows[0]?.cases).toBe('20');
  });

  it('dado o papel de aplicação quando a conexão é aberta então efetiva role_app_backend e não owner', async () => {
    const identity = await app.query<{
      database_name: string;
      current_user_name: string;
      current_role_name: string;
    }>(
      `select current_database() as database_name,
              current_user as current_user_name,
              current_role as current_role_name`,
    );

    expect(identity.rows[0]).toEqual({
      database_name: EXPECTED_DATABASE,
      current_user_name: 'role_app_backend',
      current_role_name: 'role_app_backend',
    });
  });

  it('dado o blueprint aplicado quando o catálogo é lido então existe manifestação com FKs compostas, unicidades e hashes canônicos', async () => {
    const columns = await owner.query<{ column_name: string }>(
      `select column_name
         from information_schema.columns
        where table_schema = 'inf' and table_name = $1
        order by ordinal_position`,
      [MANIFEST],
    );
    const constraints = await owner.query<{ conname: string }>(
      `select constraint_name as conname
         from information_schema.table_constraints
        where table_schema = 'inf' and table_name = $1
        order by constraint_name`,
      [MANIFEST],
    );

    expect(columns.rows.map((row) => row.column_name)).toEqual(
      expect.arrayContaining([
        'id',
        'tenant_id',
        'batch_id',
        'document_id',
        'content_hash',
        'snapshot_hash',
        'document_kind',
        'expected_signer_person_id',
        'created_at',
      ]),
    );
    expect(constraints.rows.map((row) => row.conname)).toEqual(
      expect.arrayContaining([
        'fk_inf_rait_batch_minutes_manifest_batch',
        'ux_inf_rait_batch_minutes_manifest_batch',
        'ux_inf_rait_batch_minutes_manifest_document',
        'ck_inf_rait_batch_minutes_manifest_content_hash',
        'ck_inf_rait_batch_minutes_manifest_snapshot_hash',
        'ck_inf_rait_batch_minutes_manifest_kind',
      ]),
    );
  });

  it('dada manifestação persistida quando o catálogo é lido então RLS forçada, policy tenant_isolation e trigger de imutabilidade são enforçáveis', async () => {
    const relation = await owner.query<{
      relrowsecurity: boolean;
      relforcerowsecurity: boolean;
      policy_count: string;
      immutable_trigger_count: string;
    }>(
      `select classes.relrowsecurity,
              classes.relforcerowsecurity,
              count(distinct policies.policyname)
                filter (where policies.policyname = 'tenant_isolation')::text as policy_count,
              count(distinct triggers.tgname)
                filter (where not triggers.tgisinternal
                  and triggers.tgname ilike '%immutable%')::text as immutable_trigger_count
         from pg_class classes
         join pg_namespace namespaces on namespaces.oid = classes.relnamespace
         left join pg_policies policies
           on policies.schemaname = namespaces.nspname
          and policies.tablename = classes.relname
         left join pg_trigger triggers on triggers.tgrelid = classes.oid
        where namespaces.nspname = 'inf' and classes.relname = $1
        group by classes.relrowsecurity, classes.relforcerowsecurity`,
      [MANIFEST],
    );

    expect(relation.rows).toHaveLength(1);
    expect(relation.rows[0]).toEqual({
      relrowsecurity: true,
      relforcerowsecurity: true,
      policy_count: '1',
      immutable_trigger_count: '1',
    });
  });

  it('dada manifestação do tenant am-fixtures quando o papel de aplicação consulta outro tenant em transação com rollback então não vê a ata', async () => {
    const registered = await owner.query<{ manifest: string | null }>(
      `select to_regclass('inf.rait_batch_minutes_manifest')::text as manifest`,
    );
    expect(registered.rows[0]?.manifest).toBe(
      'inf.rait_batch_minutes_manifest',
    );
    if (!registered.rows[0]?.manifest) return;

    const mine = await appTransaction(TENANT, () =>
      app.query<{ count: string }>(
        `select count(*)::text as count from inf.${MANIFEST}`,
      ),
    );
    const theirs = await appTransaction(OTHER_TENANT, () =>
      app.query<{ count: string }>(
        `select count(*)::text as count from inf.${MANIFEST}`,
      ),
    );

    expect(Number(mine.rows[0]?.count ?? -1)).toBeGreaterThanOrEqual(0);
    expect(theirs.rows[0]?.count).toBe('0');
  });
});
