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
      has_tenant_id: boolean;
    }>(
      `select tables.table_name, classes.relrowsecurity, classes.relforcerowsecurity,
              count(distinct policies.policyname)::text as policy_count,
              count(distinct triggers.tgname) filter (where not triggers.tgisinternal)::text as trigger_count,
              exists (select 1 from information_schema.columns columns
                       where columns.table_schema = tables.table_schema
                         and columns.table_name = tables.table_name
                         and columns.column_name = 'tenant_id') as has_tenant_id
         from information_schema.tables tables
         join pg_namespace namespaces on namespaces.nspname = tables.table_schema
         join pg_class classes on classes.relnamespace = namespaces.oid and classes.relname = tables.table_name
         left join pg_policies policies on policies.schemaname = tables.table_schema and policies.tablename = tables.table_name and policies.policyname = 'tenant_isolation'
         left join pg_trigger triggers on triggers.tgrelid = classes.oid and triggers.tgname = 'enforce_tenant_id'
        where tables.table_schema = 'inf' and tables.table_type = 'BASE TABLE'
        group by tables.table_schema, tables.table_name, classes.relrowsecurity, classes.relforcerowsecurity
        order by tables.table_name`,
    );
    // Tenant tables: ait (11), normative (7), measures (9), alcohol (6), rait case/worklist/session (21),
    // speed (3), infraction (3: infraction, infraction_timer, infraction_event — DDL 38) and
    // notification (3: notice, notice_acknowledgement, notice_delivery_attempt — DDL 59) —
    // 14-inf-lifecycle-vocabulary.sql adds tenant-less reference tables (`*_ref`), which must
    // never carry tenant RLS and must be the only unprotected tables in the schema.
    const tenantTables = result.rows.filter((row) => row.has_tenant_id);
    const referenceTables = result.rows.filter((row) => !row.has_tenant_id);
    expect(tenantTables).toHaveLength(62);
    expect(referenceTables).toHaveLength(10);
    const ctg2Tables = new Set([
      'ait_cancel_request',
      'ait_cancel_request_event',
      'normative_metrological_table',
      'signature_policy',
    ]);
    expect(
      result.rows.filter((row) => ctg2Tables.has(row.table_name)),
    ).toHaveLength(4);
    expect(
      result.rows
        .filter((row) => ctg2Tables.has(row.table_name))
        .every(
          (row) =>
            row.has_tenant_id &&
            row.relrowsecurity &&
            row.relforcerowsecurity &&
            row.policy_count === '1' &&
            row.trigger_count === '1',
        ),
    ).toBe(true);
    expect(
      tenantTables.every(
        (row) =>
          row.relrowsecurity &&
          row.relforcerowsecurity &&
          row.policy_count === '1' &&
          row.trigger_count === '1',
      ),
    ).toBe(true);
    expect(
      referenceTables.every(
        (row) =>
          row.table_name.endsWith('_ref') &&
          row.policy_count === '0' &&
          row.trigger_count === '0',
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
