// Contrato de banco da organização do RAIT (backend/database/ddl/39-inf-rait-org.sql):
// RLS forçada e gatilho enforce_tenant_id nas 8 tabelas de tenant, leitura cruzada entre
// tenants vazia (rait-test-strategy.md §4), checks de estado das máquinas b.1 (ato de
// suspensão), b.2 (folha de jeton) e b.3 (exportação), FKs novas e regras de unicidade do
// contrato (work/rounds/R-0006/contracts/CTG-0002-modules.md §a, §d.5).
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
const TENANT_TABLES = [
  'rait_holiday',
  'rait_suspension_act',
  'rait_jeton_sheet',
  'rait_jeton_line',
  'rait_incident',
  'rait_quality_sample',
  'rait_capacity_plan',
  'rait_export',
];

const HOLIDAY_0001 = '00000000-0000-7000-8000-000039000001';
const SUSPENSION_ACT_0001 = '00000000-0000-7000-8000-000040000001';
const JETON_SHEET_0001 = '00000000-0000-7000-8000-000041000001';
const JETON_LINE_0001 = '00000000-0000-7000-8000-000041010001';
const INCIDENT_0001 = '00000000-0000-7000-8000-000042000001';
const QUALITY_SAMPLE_0001 = '00000000-0000-7000-8000-000043000001';
const CAPACITY_PLAN_0001 = '00000000-0000-7000-8000-000044000001';
const EXPORT_0001 = '00000000-0000-7000-8000-000045000001';
const SESSION_0003 = '00000000-0000-7000-8000-000030000003';
const MEMBER_HEITOR = '00000000-0000-7000-8000-000021000008';
const POOL_JARI = '00000000-0000-7000-8000-000020000002';
const CASE_0010 = '00000000-0000-7000-8000-000010000010';

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

describe('inf.rait_{holiday,suspension_act,jeton_sheet,jeton_line,incident,quality_sample,capacity_plan,export} — contrato de banco (DDL 39)', () => {
  beforeAll(() => client.connect());
  afterAll(async () => {
    await client.query('reset role');
    await client.end();
  });

  it('dadas as tabelas de tenant da organização quando o catálogo é inspecionado então todas têm RLS forçada, política tenant_isolation e gatilho enforce_tenant_id', async () => {
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
      count('select count(*)::text as count from inf.rait_holiday'),
    );
    expect(mine).toBe(4);

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
          `insert into inf.rait_holiday (tenant_id, name, holiday_on, scope)
           values ($1, 'feriado efêmero', '2026-12-31', 'nacional')`,
          [TENANT],
        ),
      ),
    ).rejects.toMatchObject({ code: '42501' });
  });

  it('dado um scope fora do vocabulário quando um feriado é inserido então ck_inf_rait_holiday_scope rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_holiday (tenant_id, name, holiday_on, scope)
           values ($1, 'feriado inválido', '2026-11-11', 'ESCOPO_INEXISTENTE')`,
          [TENANT],
        ),
      ),
    ).rejects.toMatchObject({ code: '23514' });
  });

  it('dado um estado fora de vigente/revogado/encerrado quando um ato de suspensão é inserido então ck_inf_rait_suspension_act_state rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_suspension_act (tenant_id, reason, starts_on, ends_on, evidence_document_id, signed_by, state)
           values ($1, 'motivo', '2026-09-01', '2026-09-10', $2, $3, 'ESTADO_INEXISTENTE')`,
          [TENANT, randomUUID(), randomUUID()],
        ),
      ),
    ).rejects.toMatchObject({ code: '23514' });
  });

  it('dado um ato revogado sem revoked_at/revoked_reason quando inserido então ck_inf_rait_suspension_act_revoked_complete rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_suspension_act (tenant_id, reason, starts_on, ends_on, evidence_document_id, signed_by, state)
           values ($1, 'motivo', '2026-09-01', '2026-09-10', $2, $3, 'revogado')`,
          [TENANT, randomUUID(), randomUUID()],
        ),
      ),
    ).rejects.toMatchObject({ code: '23514' });
  });

  it('dado um estado fora de gerada/conferida/homologada/enviada quando uma folha de jeton é inserida então ck_inf_rait_jeton_sheet_state rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_jeton_sheet (tenant_id, judging_body, period_start, period_end, state)
           values ($1, 'jari', '2026-01-01', '2026-01-31', 'ESTADO_INEXISTENTE')`,
          [TENANT],
        ),
      ),
    ).rejects.toMatchObject({ code: '23514' });
  });

  it('dada uma folha homologada sem homologated_at/homologated_by quando inserida então ck_inf_rait_jeton_sheet_homologation_complete rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_jeton_sheet (tenant_id, judging_body, period_start, period_end, state)
           values ($1, 'jari', '2026-02-01', '2026-02-28', 'homologada')`,
          [TENANT],
        ),
      ),
    ).rejects.toMatchObject({ code: '23514' });
  });

  it('dado um status fora de solicitada/aguardando_dpo/gerada quando uma exportação é inserida então ck_inf_rait_export_status rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_export (tenant_id, purpose, requested_by, status)
           values ($1, 'finalidade', $2, 'STATUS_INEXISTENTE')`,
          [TENANT, randomUUID()],
        ),
      ),
    ).rejects.toMatchObject({ code: '23514' });
  });

  it('dada uma exportação gerada sem generated_at/content_hash/document_id quando inserida então ck_inf_rait_export_generated_complete rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_export (tenant_id, purpose, requested_by, status)
           values ($1, 'finalidade', $2, 'gerada')`,
          [TENANT, randomUUID()],
        ),
      ),
    ).rejects.toMatchObject({ code: '23514' });
  });

  it('dado um incident_ref fora do formato INC-AAAA-NNNN quando um incidente é inserido então ck_inf_rait_incident_ref_format rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_incident (tenant_id, incident_ref, case_id)
           values ($1, 'INC-INVALIDO', $2)`,
          [TENANT, CASE_0010],
        ),
      ),
    ).rejects.toMatchObject({ code: '23514' });
  });

  it('dado um incidente sem clock_id nem case_id quando inserido então ck_inf_rait_incident_target rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_incident (tenant_id, incident_ref)
           values ($1, 'INC-2026-9999')`,
          [TENANT],
        ),
      ),
    ).rejects.toMatchObject({ code: '23514' });
  });

  it('dado um incidente encerrado sem responsible_id/cause_analysis/outcome quando inserido então ck_inf_rait_incident_closed_complete rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_incident (tenant_id, incident_ref, case_id, closed_at)
           values ($1, 'INC-2026-9998', $2, now())`,
          [TENANT, CASE_0010],
        ),
      ),
    ).rejects.toMatchObject({ code: '23514' });
  });

  it('dada uma amostra sistêmica sem finding_kind quando inserida então ck_inf_rait_quality_sample_systemic_needs_finding rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_quality_sample (tenant_id, period_start, period_end, case_id, systemic)
           values ($1, '2026-09-01', '2026-09-30', $2, true)`,
          [TENANT, CASE_0010],
        ),
      ),
    ).rejects.toMatchObject({ code: '23514' });
  });

  it('dado um plano de capacidade fechado sem measures nem reinforcement_requested quando inserido então ck_inf_rait_capacity_plan_closed_needs_measure rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_capacity_plan (tenant_id, pool_id, period_start, period_end, closed_at)
           values ($1, $2, '2026-01-01', '2026-01-31', now())`,
          [TENANT, POOL_JARI],
        ),
      ),
    ).rejects.toMatchObject({ code: '23514' });
  });

  it('dado um member_id inexistente quando uma linha de jeton é inserida então fk_inf_rait_jeton_line_member rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_jeton_line (tenant_id, sheet_id, member_id, session_id)
           values ($1, $2, $3, $4)`,
          [TENANT, JETON_SHEET_0001, randomUUID(), SESSION_0003],
        ),
      ),
    ).rejects.toMatchObject({ code: '23503' });
  });

  it('dado um clock_id inexistente quando um incidente é inserido então fk_inf_rait_incident_clock rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_incident (tenant_id, incident_ref, clock_id)
           values ($1, 'INC-2026-9997', $2)`,
          [TENANT, randomUUID()],
        ),
      ),
    ).rejects.toMatchObject({ code: '23503' });
  });

  it('dado um pool_id inexistente quando um plano de capacidade é inserido então fk_inf_rait_capacity_plan_pool rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_capacity_plan (tenant_id, pool_id, period_start, period_end)
           values ($1, $2, '2026-03-01', '2026-03-31')`,
          [TENANT, randomUUID()],
        ),
      ),
    ).rejects.toMatchObject({ code: '23503' });
  });

  it('dado o feriado …0001 (2026-09-07, nacional) quando um segundo feriado da mesma data e escopo é inserido então ux_inf_rait_holiday_date_scope rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_holiday (tenant_id, name, holiday_on, scope)
           values ($1, 'duplicata efêmera', '2026-09-07', 'nacional')`,
          [TENANT],
        ),
      ),
    ).rejects.toMatchObject({ code: '23505' });
    expect(HOLIDAY_0001).toBeTruthy();
  });

  it('dada a folha …0001 (jari, 2026-09-01) quando uma segunda folha do mesmo período e órgão é inserida então ux_inf_rait_jeton_sheet_period rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_jeton_sheet (tenant_id, judging_body, period_start, period_end)
           values ($1, 'jari', '2026-09-01', '2026-09-30')`,
          [TENANT],
        ),
      ),
    ).rejects.toMatchObject({ code: '23505' });
  });

  it('dada a linha …010001 (folha 0001, Heitor, sessão 03) quando uma segunda linha do mesmo membro e sessão é inserida então ux_inf_rait_jeton_line_member_session rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_jeton_line (tenant_id, sheet_id, member_id, session_id)
           values ($1, $2, $3, $4)`,
          [TENANT, JETON_SHEET_0001, MEMBER_HEITOR, SESSION_0003],
        ),
      ),
    ).rejects.toMatchObject({ code: '23505' });
    expect(JETON_LINE_0001).toBeTruthy();
  });

  it('dado o incident_ref INC-2026-0007 já usado quando um segundo incidente com o mesmo ref é inserido então ux_inf_rait_incident_ref rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_incident (tenant_id, incident_ref, case_id)
           values ($1, 'INC-2026-0007', $2)`,
          [TENANT, CASE_0010],
        ),
      ),
    ).rejects.toMatchObject({ code: '23505' });
    expect(INCIDENT_0001).toBeTruthy();
  });

  it('dada a amostra …0001 (período 2026-09-01, caso 10) quando uma segunda amostra do mesmo período e caso é inserida então ux_inf_rait_quality_sample_case rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_quality_sample (tenant_id, period_start, period_end, case_id)
           values ($1, '2026-09-01', '2026-09-30', $2)`,
          [TENANT, CASE_0010],
        ),
      ),
    ).rejects.toMatchObject({ code: '23505' });
    expect(QUALITY_SAMPLE_0001).toBeTruthy();
  });

  it('dado o plano …0001 (pool defesa_previa, 2026-09-01) quando um segundo plano do mesmo pool e período é inserido então ux_inf_rait_capacity_plan_pool_period rejeita', async () => {
    const poolDefesa = '00000000-0000-7000-8000-000020000001';
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_capacity_plan (tenant_id, pool_id, period_start, period_end)
           values ($1, $2, '2026-09-01', '2026-09-30')`,
          [TENANT, poolDefesa],
        ),
      ),
    ).rejects.toMatchObject({ code: '23505' });
    expect(CAPACITY_PLAN_0001).toBeTruthy();
  });

  it('dadas as fixtures da organização quando contadas então há 4 feriados, 3 atos de suspensão, 4 folhas de jeton, 4 linhas, 2 incidentes, 3 amostras, 2 planos e 3 exportações', async () => {
    expect(
      await count(
        `select count(*)::text as count from inf.rait_holiday where tenant_id = $1`,
        [TENANT],
      ),
    ).toBe(4);
    expect(
      await count(
        `select count(distinct state)::text as count from inf.rait_suspension_act where tenant_id = $1`,
        [TENANT],
      ),
    ).toBe(3);
    expect(
      await count(
        `select count(*)::text as count from inf.rait_suspension_act where tenant_id = $1`,
        [TENANT],
      ),
    ).toBe(3);
    expect(
      await count(
        `select count(distinct state)::text as count from inf.rait_jeton_sheet where tenant_id = $1`,
        [TENANT],
      ),
    ).toBe(4);
    expect(
      await count(
        `select count(*)::text as count from inf.rait_jeton_line where tenant_id = $1`,
        [TENANT],
      ),
    ).toBe(4);
    expect(
      await count(
        `select count(*)::text as count from inf.rait_incident where tenant_id = $1`,
        [TENANT],
      ),
    ).toBe(2);
    expect(
      await count(
        `select count(*)::text as count from inf.rait_quality_sample where tenant_id = $1`,
        [TENANT],
      ),
    ).toBe(3);
    expect(
      await count(
        `select count(*)::text as count from inf.rait_capacity_plan where tenant_id = $1`,
        [TENANT],
      ),
    ).toBe(2);
    expect(
      await count(
        `select count(distinct status)::text as count from inf.rait_export where tenant_id = $1`,
        [TENANT],
      ),
    ).toBe(3);
    expect(SUSPENSION_ACT_0001).toBeTruthy();
    expect(EXPORT_0001).toBeTruthy();
  });
});
