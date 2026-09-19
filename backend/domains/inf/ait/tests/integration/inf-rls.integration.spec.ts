import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const { Client } = pg;
const expectedDatabase = 'detran_r7_ctg1_a2';
const tenantId = '00000000-0000-7000-8000-00000000a001';
const otherTenantId = '00000000-0000-7000-8000-00000000a002';
const aitId = '00000000-0000-7000-8000-0000f0000001';

function requiredDatabaseUrl(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required for the dedicated RLS test`);
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${name} is not a valid database URL`);
  }
  if (
    !['postgres:', 'postgresql:'].includes(parsed.protocol) ||
    parsed.pathname !== `/${expectedDatabase}`
  ) {
    throw new Error(
      `${name} must target the dedicated ${expectedDatabase} database`,
    );
  }
  return value;
}

// Resolve both URLs before opening any connection; no local/default fallback.
const owner = new Client({
  connectionString: requiredDatabaseUrl('DETRAN_TEST_DATABASE_URL'),
});
const app = new Client({
  connectionString: requiredDatabaseUrl('STYNX_APP_DATABASE_URL'),
});

describe('inf database contract', () => {
  beforeAll(async () => {
    await owner.connect();
    await app.connect();
    const ownerIdentity = await owner.query<{ database: string }>(
      'select current_database() as database',
    );
    if (ownerIdentity.rows[0]?.database !== expectedDatabase) {
      throw new Error('Owner connection reached the wrong database');
    }
    const appIdentity = await app.query<{
      database: string;
      user: string;
      role: string;
      superuser: boolean;
      bypass_rls: boolean;
    }>(
      `select current_database() as database, current_user as "user",
              current_role as role, r.rolsuper as superuser,
              r.rolbypassrls as bypass_rls
         from pg_roles r where r.rolname = current_role`,
    );
    if (
      appIdentity.rows.length !== 1 ||
      appIdentity.rows[0].database !== expectedDatabase ||
      appIdentity.rows[0].user !== 'role_app_backend' ||
      appIdentity.rows[0].role !== 'role_app_backend' ||
      appIdentity.rows[0].superuser ||
      appIdentity.rows[0].bypass_rls
    ) {
      throw new Error(
        'Application connection is not the non-bypass request role',
      );
    }
  });
  afterAll(async () => {
    await app.end();
    await owner.end();
  });

  it('dado schema C4-OD + CTG-0002 quando inspeciona inf então 96 relações tenant têm RLS, FORCE, policy e trigger', async () => {
    const result = await owner.query<{
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
    // Tenant tables (96, closed DDL inventory plus five C4/C4-OD additions and six CTG-0002 additions):
    // ait (11), normative (7), measures (9), alcohol (6), rait-case (12: DDL 34, includes
    // rait_pending_content/rait_redirect/rait_draft v1.1.0; 17 after C4-OD), rait-worklist (13: DDL 35, includes
    // rait_unit/rait_schedule/rait_schedule_slot/rait_batch/rait_batch_item/rait_substitute_duty/
    // rait_bench v1.1.0), rait-session (6: DDL 36), speed (3), infraction (3: DDL 38), rait-org
    // (8: DDL 39), collection (4: DDL 57), rait-integration (1: DDL 58) and notification (3:
    // DDL 59) — 14-inf-lifecycle-vocabulary.sql adds tenant-less reference tables (`*_ref`,
    // 10 after R-0005), which must never carry tenant RLS and must be the only unprotected
    // tables in the schema.
    const tenantTables = result.rows.filter((row) => row.has_tenant_id);
    const referenceTables = result.rows.filter((row) => !row.has_tenant_id);
    expect(tenantTables).toHaveLength(96);
    expect(referenceTables).toHaveLength(10);
    const c4Tables = new Set([
      'rait_inquiry_document',
      'rait_pending_document',
      'rait_withdrawal_attestation',
      'rait_priority_assessment',
      'rait_priority_basis',
    ]);
    const ctg2Tables = new Set([
      'rait_batch_draw_snapshot',
      'rait_batch_minutes_manifest',
      'rait_session_minutes_snapshot',
      'rait_session_minutes_manifest',
      'rait_minutes_required_signer',
      'rait_minutes_signature_receipt',
    ]);
    const caseTables = new Set([
      'rait_case',
      'rait_party',
      'rait_document',
      'rait_priority_assessment',
      'rait_priority_basis',
      'rait_pending_content',
      'rait_redirect',
      'rait_admissibility',
      'rait_deadline',
      'rait_inquiry',
      'rait_inquiry_document',
      'rait_pending_document',
      'rait_withdrawal_attestation',
      'rait_draft',
      'rait_decision',
      'rait_communication',
      'rait_case_event',
    ]);
    expect(caseTables.size).toBe(17);
    expect(
      result.rows.filter((row) => caseTables.has(row.table_name)),
    ).toHaveLength(17);
    expect(
      result.rows.filter((row) => c4Tables.has(row.table_name)),
    ).toHaveLength(5);
    expect(
      result.rows.filter((row) => ctg2Tables.has(row.table_name)),
    ).toHaveLength(6);
    const protectedTables = new Set([
      ...c4Tables,
      ...ctg2Tables,
      'ait_cancel_request',
      'ait_cancel_request_event',
      'normative_metrological_table',
      'signature_policy',
    ]);
    expect(
      result.rows.filter((row) => protectedTables.has(row.table_name)),
    ).toHaveLength(15);
    expect(
      result.rows
        .filter((row) => protectedTables.has(row.table_name))
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

  it('dado índice AIT quando inspeciona então a numeração inclui tenant, órgão e série', async () => {
    const result = await owner.query<{ definition: string }>(
      `select pg_get_indexdef(indexrelid) as definition
         from pg_index
        where indexrelid = 'inf.ux_inf_ait_number'::regclass`,
    );
    expect(result.rows[0]?.definition).toContain(
      '(tenant_id, traffic_agency_id, series, ait_number)',
    );
  });

  it('dado AIT canônico do tenant A quando consulta como role_app_backend no tenant B então não vê a linha', async () => {
    const fixture = await owner.query<{ count: string }>(
      'select count(*)::text as count from inf.ait_ait where tenant_id = $1 and id = $2',
      [tenantId, aitId],
    );
    expect(fixture.rows[0]?.count).toBe('1');
    await app.query('BEGIN');
    try {
      await app.query("select set_config('app.tenant_id', $1, true)", [
        tenantId,
      ]);
      const sameTenant = await app.query<{ id: string }>(
        'select id from inf.ait_ait where id = $1',
        [aitId],
      );
      expect(sameTenant.rows).toEqual([{ id: aitId }]);
      await app.query("select set_config('app.tenant_id', $1, true)", [
        otherTenantId,
      ]);
      const otherTenant = await app.query<{ id: string }>(
        'select id from inf.ait_ait where id = $1',
        [aitId],
      );
      expect(otherTenant.rows).toEqual([]);
    } finally {
      await app.query('ROLLBACK');
    }
  });
});
