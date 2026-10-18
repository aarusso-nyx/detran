// TASK25: actual application-role PostgreSQL/RLS. No mock connection or skip fallback.
import { describe, expect, it } from 'vitest';
import {
  withRealAppConnection,
  TENANT,
  ACTOR,
} from './rait-case-runtime.fixture.js';
const CASE = '00000000-0000-7000-8000-000010000002';
const OTHER = '00000000-0000-7000-8000-00000000a002';
describe('TASK25 admissibility real RLS preconditions', () => {
  it('uses the dedicated database, app role and request identity, never owner/bypass', async () => {
    const result = await withRealAppConnection(
      async (client) =>
        (
          await client.query(
            `select current_database() as db,current_user as role,current_setting('app.tenant_id',true) as tenant,current_setting('app.actor_id',true) as actor,(select rolbypassrls from pg_roles where rolname=current_user) as bypass`,
          )
        ).rows[0],
    );
    expect(result).toEqual({
      db: 'detran_r7_ctg1_a2',
      role: 'role_app_backend',
      tenant: TENANT,
      actor: ACTOR,
      bypass: false,
    });
  });
  it('case and admissibility tables force RLS; another tenant cannot read the canonical case', async () => {
    await withRealAppConnection(async (client) => {
      const flags = (
        await client.query(
          `select relname,relrowsecurity,relforcerowsecurity from pg_class where oid in ('inf.rait_case'::regclass,'inf.rait_admissibility'::regclass) order by relname`,
        )
      ).rows;
      expect(flags).toHaveLength(2);
      for (const row of flags) {
        expect(row.relrowsecurity).toBe(true);
        expect(row.relforcerowsecurity).toBe(true);
      }
      expect(
        (await client.query('select id from inf.rait_case where id=$1', [CASE]))
          .rows,
      ).toHaveLength(1);
      await client.query("select set_config('app.tenant_id',$1,true)", [OTHER]);
      expect(
        (await client.query('select id from inf.rait_case where id=$1', [CASE]))
          .rows,
      ).toHaveLength(0);
      expect(
        (
          await client.query(
            'select id from inf.rait_admissibility where case_id=$1',
            [CASE],
          )
        ).rows,
      ).toHaveLength(0);
    });
  });
  it('retains unique tenant/case/criterion storage, not append-only duplicate verdicts', async () => {
    const constraints = await withRealAppConnection(
      async (client) =>
        (
          await client.query(
            `select indexdef as definition from pg_indexes where schemaname='inf' and tablename='rait_admissibility'`,
          )
        ).rows,
    );
    expect(
      constraints.some((row) =>
        /UNIQUE.*\(tenant_id, case_id, criterion\)/.test(row.definition),
      ),
    ).toBe(true);
  });
});
