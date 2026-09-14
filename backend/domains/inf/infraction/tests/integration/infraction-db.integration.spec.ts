// Contrato de banco do agregado da infração (backend/database/ddl/38-inf-infraction.sql):
// RLS forçada e gatilho enforce_tenant_id em todas as tabelas de tenant, leitura
// cruzada entre tenants vazia (rait-test-strategy.md §4), checks de invariante,
// FK do catálogo de timers, unicidade da infração por AIT e presença das
// fixtures de backend/database/seed/30-fixtures-infraction.sql (CTG-0001 §7).
import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const { Client } = pg;
const client = new Client({
  connectionString:
    process.env.DETRAN_TEST_DATABASE_URL ??
    'postgresql://postgres:postgres@localhost:5432/detran',
});

const TENANT = '00000000-0000-7000-8000-00000000a001';
// Tenant efêmero só para o isolamento de RLS (rait-fixtures.md §7): entidades de
// domínio nunca usam randomUUID().
const OTHER_TENANT = randomUUID();
const TENANT_TABLES = ['infraction', 'infraction_timer', 'infraction_event'];
const INFRACTION_0001 = '00000000-0000-7000-8000-0000d0000001';
const AIT_0001 = '00000000-0000-7000-8000-0000f0000001';

async function asOwner<T>(work: () => Promise<T>): Promise<T> {
  await client.query('begin');
  try {
    await client.query(`select set_config('app.role', 'owner', true)`);
    await client.query(`select set_config('app.tenant_id', $1, true)`, [
      TENANT,
    ]);
    return await work();
  } finally {
    await client.query('rollback');
  }
}

async function asTenant<T>(
  tenantId: string,
  work: () => Promise<T>,
): Promise<T> {
  await client.query('begin');
  try {
    await client.query('set local role role_app_backend');
    await client.query(`select set_config('app.tenant_id', $1, true)`, [
      tenantId,
    ]);
    return await work();
  } finally {
    await client.query('rollback');
  }
}

const count = async (sql: string, params: unknown[] = []) => {
  const result = await client.query<{ count: string }>(sql, params);
  return Number(result.rows[0]?.count ?? -1);
};

describe('inf.infraction — contrato de banco (DDL 38)', () => {
  beforeAll(() => client.connect());
  afterAll(async () => {
    await client.query('reset role');
    await client.end();
  });

  it('dadas as tabelas de tenant do DDL 38 quando o catálogo é inspecionado então todas têm RLS forçada, política tenant_isolation e gatilho enforce_tenant_id', async () => {
    const result = await client.query<{
      table_name: string;
      relrowsecurity: boolean;
      relforcerowsecurity: boolean;
      policy_count: string;
      trigger_count: string;
    }>(
      `select classes.relname as table_name, classes.relrowsecurity, classes.relforcerowsecurity,
              count(distinct policies.policyname)::text as policy_count,
              count(distinct triggers.tgname) filter (where not triggers.tgisinternal)::text as trigger_count
         from pg_class classes
         join pg_namespace namespaces on namespaces.oid = classes.relnamespace
         left join pg_policies policies on policies.schemaname = 'inf' and policies.tablename = classes.relname and policies.policyname = 'tenant_isolation'
         left join pg_trigger triggers on triggers.tgrelid = classes.oid and triggers.tgname = 'enforce_tenant_id'
        where namespaces.nspname = 'inf' and classes.relname = any($1::text[])
        group by classes.relname, classes.relrowsecurity, classes.relforcerowsecurity
        order by classes.relname`,
      [TENANT_TABLES],
    );

    expect(result.rows.map((row) => row.table_name)).toEqual(
      [...TENANT_TABLES].sort(),
    );
    for (const row of result.rows) {
      expect(row.relrowsecurity).toBe(true);
      expect(row.relforcerowsecurity).toBe(true);
      expect(row.policy_count).toBe('1');
      expect(row.trigger_count).toBe('1');
    }
  });

  it('dadas as fixtures do tenant am-fixtures quando lidas por um tenant efêmero então a leitura cruzada devolve 0 linhas', async () => {
    const mine = await asTenant(TENANT, () =>
      count('select count(*)::text as count from inf.infraction'),
    );
    expect(mine).toBe(15);

    for (const table of TENANT_TABLES) {
      const theirs = await asTenant(OTHER_TENANT, () =>
        count(`select count(*)::text as count from inf.${table}`),
      );
      expect(theirs).toBe(0);
    }
  });

  it('dado o contexto de um tenant efêmero quando uma linha do tenant am-fixtures é inserida então enforce_tenant_id rejeita com 42501', async () => {
    await expect(
      asTenant(OTHER_TENANT, () =>
        client.query(
          `insert into inf.infraction (tenant_id, ait_id, committed_on, flagrant, state_changed_at)
           values ($1, $2, '2026-09-01', true, '2026-09-01T12:00:00-04:00')`,
          [TENANT, AIT_0001],
        ),
      ),
    ).rejects.toMatchObject({ code: '42501' });

    await expect(
      asTenant(OTHER_TENANT, () =>
        client.query(
          `insert into inf.infraction_timer (tenant_id, infraction_id, timer_code, start_basis, started_on, raw_due_on, due_on, status, legal_basis)
           values ($1, $2, 'T-NA', 'cometimento', '2026-09-01', '2026-10-01', '2026-10-01', 'armado', 'Res. 918/2022 art. 4º §1º')`,
          [TENANT, INFRACTION_0001],
        ),
      ),
    ).rejects.toMatchObject({ code: '42501' });

    await expect(
      asTenant(OTHER_TENANT, () =>
        client.query(
          `insert into inf.infraction_event (tenant_id, infraction_id, trigger_kind, trigger_code, event_code, occurred_at, actor_kind, payload)
           values ($1, $2, 'evento', 'AIT_INTEGRADO', 'INFRACAO_ESTADO_ALTERADO', '2026-09-01T12:00:00-04:00', 'system', '{}'::jsonb)`,
          [TENANT, INFRACTION_0001],
        ),
      ),
    ).rejects.toMatchObject({ code: '42501' });
  });

  it('dado um estado fora de infraction_state_ref quando a infração é inserida então ck_inf_infraction_state rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.infraction (tenant_id, ait_id, state, committed_on, flagrant, state_changed_at)
           values ($1, $2, 'ESTADO_INEXISTENTE', '2026-09-01', true, '2026-09-01T12:00:00-04:00')`,
          [TENANT, '00000000-0000-7000-8000-0000f0000016'],
        ),
      ),
    ).rejects.toMatchObject({ code: '23514' });
  });

  it('dado um timer_code fora de infraction_timer_ref quando o timer é inserido então a integridade do catálogo rejeita', async () => {
    const constraint = await client.query<{ conname: string }>(
      `select conname from pg_constraint
        where conrelid = 'inf.infraction_timer'::regclass
          and conname = 'fk_inf_infraction_timer_code'`,
    );
    expect(constraint.rows).toHaveLength(1);

    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.infraction_timer (tenant_id, infraction_id, timer_code, start_basis, started_on, raw_due_on, due_on, status, legal_basis)
           values ($1, $2, 'T-INEXISTENTE', 'cometimento', '2026-09-01', '2026-10-01', '2026-10-01', 'armado', 'fixture')`,
          [TENANT, INFRACTION_0001],
        ),
      ),
    ).rejects.toMatchObject({ code: expect.stringMatching(/^(23514|23503)$/) });
  });

  it('dado o AIT …0000f0000001 já com infração quando uma segunda infração do mesmo AIT é inserida então ux_inf_infraction_ait rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.infraction (tenant_id, ait_id, committed_on, flagrant, state_changed_at)
           values ($1, $2, '2026-09-01', true, '2026-09-01T12:00:00-04:00')`,
          [TENANT, AIT_0001],
        ),
      ),
    ).rejects.toMatchObject({ code: '23505' });
  });

  it('dadas as fixtures 30-fixtures-infraction.sql quando contadas então há 15 infrações, uma por estado, com 91 timers e 69 eventos', async () => {
    expect(
      await count(
        `select count(distinct state)::text as count from inf.infraction where tenant_id = $1`,
        [TENANT],
      ),
    ).toBe(15);
    expect(
      await count(
        `select count(*)::text as count from inf.infraction where tenant_id = $1`,
        [TENANT],
      ),
    ).toBe(15);
    expect(
      await count(
        `select count(*)::text as count from inf.infraction_timer where tenant_id = $1`,
        [TENANT],
      ),
    ).toBe(91);
    expect(
      await count(
        `select count(*)::text as count from inf.infraction_event where tenant_id = $1`,
        [TENANT],
      ),
    ).toBe(69);

    const missing = await client.query<{ code: string }>(
      `select reference.code
         from inf.infraction_state_ref reference
        where not exists (
                select 1 from inf.infraction where tenant_id = $1 and state = reference.code)`,
      [TENANT],
    );
    expect(missing.rows.map((row) => row.code)).toEqual([]);
  });
});
