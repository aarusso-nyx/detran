// Contrato de banco da integração do RAIT (backend/database/ddl/58-inf-rait-integration.sql):
// RLS forçada e gatilho enforce_tenant_id em inf.rait_reconciliation (única entidade, ADR-0020
// §Decision 1-2), leitura cruzada entre tenants vazia (rait-test-strategy.md §4), checks de
// estado da máquina b.7 e regra de unicidade da janela por sistema. Ausência de FK entre
// schemas é o próprio contrato (nada fala com integration.outbox nem com SENATRAN, ADR-0003).
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
const OTHER_TENANT = randomUUID();
const RECONCILIATION_0002 = '00000000-0000-7000-8000-000050000002';

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

describe('inf.rait_reconciliation — contrato de banco (DDL 58)', () => {
  beforeAll(() => client.connect());
  afterAll(async () => {
    await client.query('reset role');
    await client.end();
  });

  it('dada a tabela de tenant rait_reconciliation quando o catálogo é inspecionado então tem RLS forçada, política tenant_isolation e gatilho enforce_tenant_id', async () => {
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
        where namespaces.nspname = 'inf' and classes.relname = 'rait_reconciliation'
        group by classes.relname, classes.relrowsecurity, classes.relforcerowsecurity`,
    );

    expect(result.rows).toHaveLength(1);
    const [row] = result.rows;
    expect(row?.relrowsecurity).toBe(true);
    expect(row?.relforcerowsecurity).toBe(true);
    expect(row?.policy_count).toBe('1');
    expect(row?.trigger_count).toBe('1');
  });

  it('dado rait_reconciliation quando o catálogo de FKs é inspecionado então não há nenhuma foreign key (ADR-0020: nada entre schemas)', async () => {
    const result = await client.query<{ conname: string }>(
      `select conname from pg_constraint
        where conrelid = 'inf.rait_reconciliation'::regclass and contype = 'f'`,
    );
    expect(result.rows).toEqual([]);
  });

  it('dadas as fixtures do tenant am-fixtures quando lidas por um tenant efêmero então a leitura cruzada devolve 0 linhas', async () => {
    const mine = await asTenant(TENANT, () =>
      count('select count(*)::text as count from inf.rait_reconciliation'),
    );
    expect(mine).toBe(3);

    const theirs = await asTenant(OTHER_TENANT, () =>
      count('select count(*)::text as count from inf.rait_reconciliation'),
    );
    expect(theirs).toBe(0);
  });

  it('dado o contexto de um tenant efêmero quando uma linha do tenant am-fixtures é inserida então enforce_tenant_id rejeita com 42501', async () => {
    await expect(
      asTenant(OTHER_TENANT, () =>
        client.query(
          `insert into inf.rait_reconciliation (tenant_id, system, window_from, window_to, requested_by)
           values ($1, 'renainf', '2026-01-01', '2026-01-31', $2)`,
          [TENANT, randomUUID()],
        ),
      ),
    ).rejects.toMatchObject({ code: '42501' });
  });

  it('dado um system fora de renainf/renach/sne quando uma conciliação é inserida então ck_inf_rait_reconciliation_system rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_reconciliation (tenant_id, system, window_from, window_to, requested_by)
           values ($1, 'outro_sys', '2026-01-01', '2026-01-31', $2)`,
          [TENANT, randomUUID()],
        ),
      ),
    ).rejects.toMatchObject({ code: '23514' });
  });

  it('dado um status fora de solicitada/conciliada/escalada quando uma conciliação é inserida então ck_inf_rait_reconciliation_status rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_reconciliation (tenant_id, system, window_from, window_to, requested_by, status)
           values ($1, 'renainf', '2026-01-01', '2026-01-31', $2, 'STATUS_INEXISTENTE')`,
          [TENANT, randomUUID()],
        ),
      ),
    ).rejects.toMatchObject({ code: '23514' });
  });

  it('dada uma janela com window_to anterior a window_from quando inserida então ck_inf_rait_reconciliation_window_order rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_reconciliation (tenant_id, system, window_from, window_to, requested_by)
           values ($1, 'renainf', '2026-02-01', '2026-01-01', $2)`,
          [TENANT, randomUUID()],
        ),
      ),
    ).rejects.toMatchObject({ code: '23514' });
  });

  it('dada uma conciliação conciliada com divergências e sem report_document_id quando inserida então ck_inf_rait_reconciliation_report_required rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_reconciliation (tenant_id, system, window_from, window_to, requested_by, status, divergences_count)
           values ($1, 'renach', '2026-02-01', '2026-02-28', $2, 'conciliada', 2)`,
          [TENANT, randomUUID()],
        ),
      ),
    ).rejects.toMatchObject({ code: '23514' });
  });

  it('dada uma conciliação escalada sem resolved_at quando inserida então ck_inf_rait_reconciliation_resolved_complete rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_reconciliation (tenant_id, system, window_from, window_to, requested_by, status)
           values ($1, 'sne', '2026-02-01', '2026-02-28', $2, 'escalada')`,
          [TENANT, randomUUID()],
        ),
      ),
    ).rejects.toMatchObject({ code: '23514' });
  });

  it('dada a janela renach 2026-08-01…2026-08-31 já conciliada quando a mesma janela e sistema são inseridos de novo então ux_inf_rait_reconciliation_window rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_reconciliation (tenant_id, system, window_from, window_to, requested_by)
           values ($1, 'renach', '2026-08-01', '2026-08-31', $2)`,
          [TENANT, randomUUID()],
        ),
      ),
    ).rejects.toMatchObject({ code: '23505' });
    expect(RECONCILIATION_0002).toBeTruthy();
  });

  it('dadas as fixtures da integração quando contadas então há 3 conciliações, uma por status (solicitada/conciliada/escalada) e uma por sistema (renainf/renach/sne)', async () => {
    expect(
      await count(
        `select count(*)::text as count from inf.rait_reconciliation where tenant_id = $1`,
        [TENANT],
      ),
    ).toBe(3);
    expect(
      await count(
        `select count(distinct status)::text as count from inf.rait_reconciliation where tenant_id = $1`,
        [TENANT],
      ),
    ).toBe(3);
    expect(
      await count(
        `select count(distinct system)::text as count from inf.rait_reconciliation where tenant_id = $1`,
        [TENANT],
      ),
    ).toBe(3);
  });
});
