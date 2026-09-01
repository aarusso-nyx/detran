import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const { Client } = pg;
const client = new Client({
  connectionString:
    process.env.DETRAN_TEST_DATABASE_URL ??
    'postgresql://postgres:postgres@localhost:5432/detran',
});

describe('inf database contract', () => {
  beforeAll(() => client.connect());
  afterAll(() => client.end());

  it('forces tenant RLS and enforce_tenant_id on every inf table', async () => {
    const result = await client.query<{
      table_name: string;
      relrowsecurity: boolean;
      relforcerowsecurity: boolean;
      policy_count: string;
      trigger_count: string;
    }>(
      `select tables.table_name, classes.relrowsecurity, classes.relforcerowsecurity,
              count(distinct policies.policyname)::text as policy_count,
              count(distinct triggers.tgname) filter (where not triggers.tgisinternal)::text as trigger_count
         from information_schema.tables tables
         join pg_namespace namespaces on namespaces.nspname = tables.table_schema
         join pg_class classes on classes.relnamespace = namespaces.oid and classes.relname = tables.table_name
         left join pg_policies policies on policies.schemaname = tables.table_schema and policies.tablename = tables.table_name and policies.policyname = 'tenant_isolation'
         left join pg_trigger triggers on triggers.tgrelid = classes.oid and triggers.tgname = 'enforce_tenant_id'
        where tables.table_schema = 'inf' and tables.table_type = 'BASE TABLE'
        group by tables.table_name, classes.relrowsecurity, classes.relforcerowsecurity
        order by tables.table_name`,
    );
    expect(result.rows.length).toBeGreaterThan(0);
    expect(
      result.rows.every(
        (row) =>
          row.relrowsecurity &&
          row.relforcerowsecurity &&
          row.policy_count === '1' &&
          row.trigger_count === '1',
      ),
    ).toBe(true);
  });

  it('binds numbering uniqueness to tenant, agency, series, and AIT number', async () => {
    const result = await client.query<{ definition: string }>(
      `select pg_get_indexdef(indexrelid) as definition
         from pg_index
        where indexrelid = 'inf.ux_inf_ait_number'::regclass`,
    );
    expect(result.rows[0]?.definition).toContain(
      '(tenant_id, traffic_agency_id, series, ait_number)',
    );
  });
});
