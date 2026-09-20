import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const { Client } = pg;
const EXPECTED_DATABASE = 'detran_r7_ctg1_a2';
const APP_ROLE_OPTION = '-c role=role_app_backend';
const TENANT = '00000000-0000-7000-8000-00000000a001';

function requiredUrl(name: string): URL {
  const raw = process.env[name];
  if (!raw) throw new Error(`${name} is required for CTG-0002 worklist RED`);
  return new URL(raw);
}

const ownerUrl = () => requiredUrl('STYNX_OWNER_DATABASE_URL');
const appUrl = () => requiredUrl('STYNX_APP_DATABASE_URL');
const client = new Client({
  connectionString: process.env.STYNX_OWNER_DATABASE_URL,
});

describe('CTG-0002 worklist corrective database boundary', () => {
  beforeAll(async () => {
    const owner = ownerUrl();
    const app = appUrl();
    expect(owner.pathname.slice(1)).toBe(EXPECTED_DATABASE);
    expect(app.pathname.slice(1)).toBe(EXPECTED_DATABASE);
    expect(owner.username).toBeTruthy();
    expect(app.username).toBeTruthy();
    expect(owner.searchParams.get('options')).not.toBe(APP_ROLE_OPTION);
    expect(app.searchParams.get('options')).toBe(APP_ROLE_OPTION);
    expect(owner.toString()).not.toBe(app.toString());
    await client.connect();
    const identity = await client.query<{
      current_user_name: string;
      current_role_name: string;
    }>(
      `select current_user as current_user_name, current_role as current_role_name`,
    );
    expect(identity.rows[0]?.current_user_name).not.toBe('role_app_backend');
    expect(identity.rows[0]?.current_role_name).not.toBe('role_app_backend');
  });

  afterAll(async () => {
    await client.end();
  });

  it('dado o banco dedicado com fixtures históricas quando o Inspector prepara CTG-0002 então preserva os 20 casos e não reseta o banco', async () => {
    const result = await client.query<{ cases: string }>(
      `select count(*)::text as cases
         from inf.rait_case
        where tenant_id = $1`,
      [TENANT],
    );
    expect(result.rows[0]?.cases).toBe('20');
  });

  it('dado a conexão do papel de aplicação quando consulta o contexto de request então usa role_app_backend e não owner/admin', async () => {
    const appClient = new Client({ connectionString: appUrl().toString() });
    await appClient.connect();
    try {
      const result = await appClient.query<{
        current_user_name: string;
        current_role_name: string;
      }>(
        `select current_user as current_user_name,
                current_role as current_role_name`,
      );
      expect(result.rows[0]).toEqual({
        current_user_name: 'role_app_backend',
        current_role_name: 'role_app_backend',
      });
    } finally {
      await appClient.end();
    }
  });

  it('dado tentativa de execução sob tenant sem contexto quando os seis comandos corretivos exigem RLS então não há gravação, outbox ou auditoria de sucesso', async () => {
    await client.query('begin');
    try {
      await client.query(`select set_config('app.role', 'owner', true)`);
      const before = await client.query<{
        outbox: string;
        audit: string;
      }>(
        `select
           (select count(*)::text from integration.outbox where tenant_id = $1) as outbox,
           (select count(*)::text from audit.events where tenant_id = $1) as audit`,
        [TENANT],
      );
      await client.query('set local role role_app_backend');
      await client.query(`select set_config('app.tenant_id', '', true)`);
      await client.query('savepoint ctg2_worklist_rls_denial');
      await expect(
        client.query(
          `insert into inf.rait_schedule
             (tenant_id, pool_id, member_id, kind, period_start, period_end)
           values ($1, $2, $3, 'escala_semanal', '2026-10-05', '2026-10-11')`,
          [
            TENANT,
            '00000000-0000-7000-8000-000020000002',
            '00000000-0000-7000-8000-000021000004',
          ],
        ),
      ).rejects.toMatchObject({ code: '42501' });
      await client.query('rollback to savepoint ctg2_worklist_rls_denial');
      // Compare the same owner-visible evidence set captured before the RLS
      // denial.  The application role intentionally sees zero rows without a
      // tenant context, which is the boundary exercised above.
      await client.query('reset role');
      const after = await client.query<{ outbox: string; audit: string }>(
        `select
           (select count(*)::text from integration.outbox where tenant_id = $1) as outbox,
           (select count(*)::text from audit.events where tenant_id = $1) as audit`,
        [TENANT],
      );
      expect(after.rows).toEqual(before.rows);
    } finally {
      await client.query('rollback');
    }
  });
});
