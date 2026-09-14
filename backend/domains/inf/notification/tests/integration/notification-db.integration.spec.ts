// Contrato de banco do módulo de notificação (backend/database/ddl/59-inf-notification.sql):
// RLS forçada e gatilho enforce_tenant_id em todas as tabelas de tenant, leitura
// cruzada entre tenants vazia (rait-test-strategy.md §4), check da data-limite
// impressa da NA/NP (RN-RAIT-101/102), unicidade de uma ciência por aviso e
// presença das fixtures de backend/database/seed/30-fixtures-infraction.sql (§7.3).
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
// Tenant efêmero só para o isolamento de RLS (rait-fixtures.md §7).
const OTHER_TENANT = randomUUID();
const TENANT_TABLES = [
  'notice',
  'notice_acknowledgement',
  'notice_delivery_attempt',
];
const INFRACTION_0002 = '00000000-0000-7000-8000-0000d0000002';
const NOTICE_0001 = '00000000-0000-7000-8000-0000d3000001';

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

describe('inf.notice — contrato de banco (DDL 59)', () => {
  beforeAll(() => client.connect());
  afterAll(async () => {
    await client.query('reset role');
    await client.end();
  });

  it('dadas as tabelas de tenant do DDL 59 quando o catálogo é inspecionado então todas têm RLS forçada, política tenant_isolation e gatilho enforce_tenant_id', async () => {
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

  it('dados os avisos do tenant am-fixtures quando lidos por um tenant efêmero então a leitura cruzada devolve 0 linhas', async () => {
    const mine = await asTenant(TENANT, () =>
      count('select count(*)::text as count from inf.notice'),
    );
    expect(mine).toBe(19);

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
          `insert into inf.notice (tenant_id, infraction_id, kind, addressee_kind, channel, issued_at, printed_deadline_on, status)
           values ($1, $2, 'NA', 'proprietario', 'postal', '2026-09-01T12:00:00-04:00', '2026-10-15', 'eficaz')`,
          [TENANT, INFRACTION_0002],
        ),
      ),
    ).rejects.toMatchObject({ code: '42501' });

    await expect(
      asTenant(OTHER_TENANT, () =>
        client.query(
          `insert into inf.notice_acknowledgement (tenant_id, notice_id, effective_on, fictitious, evidence_kind, registered_at)
           values ($1, $2, '2026-09-01', false, 'ar_postal', '2026-09-01T12:00:00-04:00')`,
          [TENANT, NOTICE_0001],
        ),
      ),
    ).rejects.toMatchObject({ code: '42501' });

    await expect(
      asTenant(OTHER_TENANT, () =>
        client.query(
          `insert into inf.notice_delivery_attempt (tenant_id, notice_id, channel, attempted_at, outcome)
           values ($1, $2, 'postal', '2026-09-01T12:00:00-04:00', 'entregue')`,
          [TENANT, NOTICE_0001],
        ),
      ),
    ).rejects.toMatchObject({ code: '42501' });
  });

  it('dada uma NA expedida sem data-limite impressa quando inserida então ck_inf_notice_printed_deadline_required rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.notice (tenant_id, infraction_id, kind, addressee_kind, channel, issued_at, status)
           values ($1, $2, 'NA', 'proprietario', 'postal', '2026-09-01T12:00:00-04:00', 'expedida')`,
          [TENANT, INFRACTION_0002],
        ),
      ),
    ).rejects.toMatchObject({ code: '23514' });
  });

  it('dado um canal fora de notification_channel_ref quando o aviso é inserido então a integridade do catálogo de canais rejeita', async () => {
    const constraint = await client.query<{ conname: string }>(
      `select conname from pg_constraint
        where conrelid = 'inf.notice'::regclass
          and conname = 'fk_inf_notice_channel'`,
    );
    expect(constraint.rows).toHaveLength(1);

    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.notice (tenant_id, infraction_id, kind, addressee_kind, channel, issued_at, printed_deadline_on, status)
           values ($1, $2, 'NA', 'proprietario', 'telegrama', '2026-09-01T12:00:00-04:00', '2026-10-15', 'eficaz')`,
          [TENANT, INFRACTION_0002],
        ),
      ),
    ).rejects.toMatchObject({ code: expect.stringMatching(/^(23514|23503)$/) });
  });

  it('dado um aviso que já tem ciência quando uma segunda ciência é inserida então ux_inf_notice_acknowledgement_notice rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.notice_acknowledgement (tenant_id, notice_id, effective_on, fictitious, evidence_kind, registered_at)
           values ($1, $2, '2026-09-01', false, 'ar_postal', '2026-09-01T12:00:00-04:00')`,
          [TENANT, NOTICE_0001],
        ),
      ),
    ).rejects.toMatchObject({ code: '23505' });
  });

  it('dadas as fixtures 30-fixtures-infraction.sql quando contadas então há 19 avisos NA/NP postais eficazes, 19 ciências por AR e 19 tentativas entregues', async () => {
    expect(
      await count(
        `select count(*)::text as count from inf.notice where tenant_id = $1 and channel = 'postal' and status = 'eficaz' and kind in ('NA','NP')`,
        [TENANT],
      ),
    ).toBe(19);
    expect(
      await count(
        `select count(*)::text as count from inf.notice_acknowledgement where tenant_id = $1 and fictitious = false and evidence_kind = 'ar_postal'`,
        [TENANT],
      ),
    ).toBe(19);
    expect(
      await count(
        `select count(*)::text as count from inf.notice_delivery_attempt where tenant_id = $1 and outcome = 'entregue'`,
        [TENANT],
      ),
    ).toBe(19);

    // Todo aviso NA/NP eficaz carrega a data-limite impressa e o marco postal.
    expect(
      await count(
        `select count(*)::text as count from inf.notice
          where tenant_id = $1 and (printed_deadline_on is null or dispatched_on is null)`,
        [TENANT],
      ),
    ).toBe(0);
  });
});
