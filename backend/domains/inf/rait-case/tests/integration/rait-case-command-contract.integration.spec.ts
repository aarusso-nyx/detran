import { describe, expect, it } from 'vitest';

import {
  ACTOR,
  TENANT,
  withRealAppConnection,
} from './rait-case-runtime.fixture.js';

describe('CTG-0001 §10.8 — conexão PostgreSQL real do tier integration', () => {
  it('dado STYNX_APP_DATABASE_URL quando a conexão do tier executa SQL então comprova banco, role, tenant e ator sem fallback', async () => {
    const identity = await withRealAppConnection(async (client) => {
      const result = await client.query<{
        database_name: string;
        current_user_name: string;
        current_role_name: string;
        tenant_id: string;
        actor_id: string;
      }>(
        `select current_database() as database_name,
                current_user as current_user_name,
                current_role as current_role_name,
                current_setting('app.tenant_id', true) as tenant_id,
                current_setting('app.actor_id', true) as actor_id`,
      );
      return result.rows[0];
    });
    expect(identity).toEqual({
      database_name: 'detran_r7_ctg1_a2',
      current_user_name: 'role_app_backend',
      current_role_name: 'role_app_backend',
      tenant_id: TENANT,
      actor_id: ACTOR,
    });
  });

  it('dado o PREP C3 quando o schema é lido por role_app_backend então dias civis e três relações internas existem com RLS forçada', async () => {
    const result = await withRealAppConnection((client) =>
      client.query<{
        object_name: string;
        data_type: string;
        rls_forced: boolean;
      }>(
        `select columns.table_name || '.' || columns.column_name as object_name,
                columns.data_type,
                false as rls_forced
           from information_schema.columns columns
          where columns.table_schema = 'inf'
            and (columns.table_name, columns.column_name) in
                (('rait_case','judge_body_received_on'),
                 ('rait_case','cetran_received_on'),
                 ('rait_inquiry','answered_on'))
         union all
         select classes.relname as object_name, 'table' as data_type,
                classes.relforcerowsecurity as rls_forced
           from pg_class classes
           join pg_namespace namespaces on namespaces.oid = classes.relnamespace
          where namespaces.nspname = 'inf'
            and classes.relname in
                ('rait_inquiry_document','rait_pending_document',
                 'rait_withdrawal_attestation')
          order by object_name`,
      ),
    );
    expect(result.rows).toHaveLength(6);
    expect(
      result.rows
        .filter((row) => row.data_type === 'date')
        .map((row) => row.object_name),
    ).toEqual([
      'rait_case.cetran_received_on',
      'rait_case.judge_body_received_on',
      'rait_inquiry.answered_on',
    ]);
    expect(
      result.rows
        .filter((row) => row.data_type === 'table')
        .every((row) => row.rls_forced),
    ).toBe(true);
  });
});
