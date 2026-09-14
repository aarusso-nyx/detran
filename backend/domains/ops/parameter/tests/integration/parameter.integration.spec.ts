import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const { Client } = pg;
const client = new Client({
  connectionString: process.env.DETRAN_TEST_DATABASE_URL,
});
const RLS_FOREIGN_TENANT_ID = '00000000-0000-7000-8000-00000000a002';

describe('contrato de persistência ops.parameter', () => {
  let tenantA: string;
  const tenantB = RLS_FOREIGN_TENANT_ID;

  beforeAll(async () => {
    expect(process.env.DETRAN_TEST_DATABASE_URL).toBeTruthy();
    await client.connect();
    const tenant = await client.query<{ id: string }>(
      `select id from auth.tenants order by id limit 1`,
    );
    expect(tenant.rows).toHaveLength(1);
    tenantA = tenant.rows[0].id;
  });

  afterAll(() => client.end());

  it('dado ops.parameter quando inspecionado então mantém checks, índice temporal e isolamento RLS', async () => {
    const table = await client.query<{
      relrowsecurity: boolean;
      relforcerowsecurity: boolean;
    }>(
      `select c.relrowsecurity, c.relforcerowsecurity
         from pg_class c join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'ops' and c.relname = 'parameter'`,
    );
    expect(table.rows[0]).toEqual({
      relrowsecurity: true,
      relforcerowsecurity: true,
    });

    const constraints = await client.query<{ conname: string }>(
      `select conname from pg_constraint
        where conrelid = 'ops.parameter'::regclass
          and conname in ('ck_parameter_scope', 'ck_parameter_surface',
            'ck_parameter_status', 'ck_parameter_version_positive',
            'ck_parameter_effective_range')`,
    );
    expect(constraints.rows.map(({ conname }) => conname).sort()).toEqual([
      'ck_parameter_effective_range',
      'ck_parameter_scope',
      'ck_parameter_status',
      'ck_parameter_surface',
      'ck_parameter_version_positive',
    ]);

    const index = await client.query<{ definition: string }>(
      `select pg_get_indexdef(indexrelid) as definition
         from pg_index where indexrelid =
          'ops.ux_parameter_tenant_agency_surface_key_effective_from'::regclass`,
    );
    const indexDefinition = index.rows[0]?.definition.toLowerCase();
    expect(indexDefinition).toContain('coalesce(traffic_agency_id');
    expect(indexDefinition).toContain('effective_from');

    await client.query('begin');
    try {
      await client.query('set local role role_app_backend');
      await client.query(`select set_config('app.tenant_id', $1, true)`, [
        tenantA,
      ]);
      const created = await client.query<{ id: string }>(
        `insert into ops.parameter
          (tenant_id, scope, surface, key, value_json, value_type, status,
           source_pending, legal_readonly, decision_ref, reason, version,
           effective_from, changed_by)
         values ($1, 'tenant', 'rait', 'rait.test.integration', '{"value": 1}',
           'integer', 'vigente', false, false, 'OD-001', 'integration', 1,
           '2026-09-14', '00000000-0000-4000-8000-0000b0000016') returning id`,
        [tenantA],
      );
      await client.query(`select set_config('app.tenant_id', $1, true)`, [
        tenantB,
      ]);
      const invisible = await client.query(
        `select id from ops.parameter where id = $1`,
        [created.rows[0].id],
      );
      expect(invisible.rows).toHaveLength(0);
      const altered = await client.query(
        `update ops.parameter set reason = 'cross-tenant' where id = $1 returning id`,
        [created.rows[0].id],
      );
      expect(altered.rows).toHaveLength(0);
    } finally {
      await client.query('rollback');
    }
  });
});
