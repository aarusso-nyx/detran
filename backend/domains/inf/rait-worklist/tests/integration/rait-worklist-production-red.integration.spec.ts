import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const { Client } = pg;
const OWNER_DATABASE_URL = 'postgresql://aarusso@localhost/detran_r7_ctg1_a2';
const APP_DATABASE_URL =
  'postgresql://aarusso@localhost/detran_r7_ctg1_a2?options=-c%20role%3Drole_app_backend';
const EXPECTED_DATABASE = 'detran_r7_ctg1_a2';
const TENANT = '00000000-0000-7000-8000-00000000a001';

const owner = new Client({ connectionString: OWNER_DATABASE_URL });
const app = new Client({ connectionString: APP_DATABASE_URL });

async function withRollback<T>(work: () => Promise<T>): Promise<T> {
  await app.query('begin');
  try {
    await app.query('set local role role_app_backend');
    await app.query(`select set_config('app.tenant_id', $1, true)`, [TENANT]);
    return await work();
  } finally {
    await app.query('rollback');
  }
}

describe('TASK-0060 — contrato SQL produtivo da worklist', () => {
  beforeAll(async () => {
    expect(new URL(OWNER_DATABASE_URL).pathname.slice(1)).toBe(
      EXPECTED_DATABASE,
    );
    expect(new URL(APP_DATABASE_URL).pathname.slice(1)).toBe(EXPECTED_DATABASE);
    expect(new URL(APP_DATABASE_URL).searchParams.get('options')).toBe(
      '-c role=role_app_backend',
    );
    await owner.connect();
    await app.connect();
  });

  afterAll(async () => {
    await Promise.all([owner.end(), app.end()]);
  });

  it('dado o banco dedicado quando os seis comandos são preparados então preserva os vinte casos históricos sem reset', async () => {
    const result = await owner.query<{ cases: string }>(
      `select count(*)::text as cases
         from inf.rait_case
        where tenant_id = $1`,
      [TENANT],
    );

    expect(result.rows[0]?.cases).toBe('20');
  });

  it('dado schema worklist aplicado quando consulta as relações de agregado então versionamento, unicidade, RLS e imutabilidade são verificáveis', async () => {
    const result = await owner.query<{
      readonly batch_version: string;
      readonly active_assignment_unique: string;
      readonly manifest_rls: string;
      readonly immutable_triggers: string;
    }>(
      `select
         (select count(*)::text
            from information_schema.columns
           where table_schema = 'inf' and table_name = 'rait_batch'
             and column_name = 'version') as batch_version,
         (select count(*)::text
            from pg_indexes
           where schemaname = 'inf'
             and indexname = 'ux_inf_rait_assignment_active')
           as active_assignment_unique,
         (select relforcerowsecurity::text
            from pg_class
           where oid = 'inf.rait_batch_minutes_manifest'::regclass)
           as manifest_rls,
         (select count(*)::text
            from pg_trigger
           where tgrelid in (
             'inf.rait_batch_draw_snapshot'::regclass,
             'inf.rait_batch_minutes_manifest'::regclass
           )
             and not tgisinternal
             and tgname ilike '%immutable%') as immutable_triggers`,
    );

    expect(result.rows[0]).toEqual({
      batch_version: '1',
      active_assignment_unique: '1',
      manifest_rls: 'true',
      immutable_triggers: '2',
    });
  });

  it('dado papel de aplicação em transação com rollback quando tenta consultar fora do tenant então RLS não libera o agregado', async () => {
    await withRollback(async () => {
      const result = await app.query<{ count: string }>(
        `select count(*)::text as count
           from inf.rait_batch
          where tenant_id = '00000000-0000-7000-8000-00000000a002'`,
      );

      expect(result.rows[0]?.count).toBe('0');
    });
  });
});
