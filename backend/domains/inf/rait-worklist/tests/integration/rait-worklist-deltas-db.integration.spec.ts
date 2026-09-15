// Contrato de banco dos deltas v1.1.0 do worklist do RAIT (backend/database/ddl/35-inf-rait-worklist.sql):
// RLS forçada e gatilho enforce_tenant_id nas 7 tabelas novas (rait_unit, rait_schedule,
// rait_schedule_slot, rait_batch, rait_batch_item, rait_substitute_duty, rait_bench), leitura
// cruzada entre tenants vazia (rait-test-strategy.md §4), checks de estado das máquinas b.1
// (turma), b.2 (lote), b.3 (banca) e b.4 (disponibilidade), FKs novas e regras de unicidade do
// contrato (work/rounds/R-0006/contracts/CTG-0002-deltas.md §a, §c, §e.5).
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
const NEW_TENANT_TABLES = [
  'rait_unit',
  'rait_schedule',
  'rait_schedule_slot',
  'rait_batch',
  'rait_batch_item',
  'rait_substitute_duty',
  'rait_bench',
];

const UNIT_0001 = '00000000-0000-7000-8000-000026000001';
const SCHEDULE_0001 = '00000000-0000-7000-8000-000027000001';
const BATCH_0001 = '00000000-0000-7000-8000-000028000001';
const BATCH_0002 = '00000000-0000-7000-8000-000028000002';
const SUBSTITUTE_DUTY_0002 = '00000000-0000-7000-8000-000029000002';
const BENCH_0001 = '00000000-0000-7000-8000-000035000001';
const POOL_JARI = '00000000-0000-7000-8000-000020000002';
const POOL_DEFESA = '00000000-0000-7000-8000-000020000001';
const MEMBER_ANA = '00000000-0000-7000-8000-000021000001';
const MEMBER_IARA = '00000000-0000-7000-8000-000021000009';
const CASE_0018 = '00000000-0000-7000-8000-000010000018';
const SESSION_0001 = '00000000-0000-7000-8000-000030000001';

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

describe('inf.{rait_unit,rait_schedule,rait_schedule_slot,rait_batch,rait_batch_item,rait_substitute_duty,rait_bench} — deltas v1.1.0 (DDL 35)', () => {
  beforeAll(() => client.connect());
  afterAll(async () => {
    await client.query('reset role');
    await client.end();
  });

  it('dadas as 7 tabelas novas do worklist quando o catálogo é inspecionado então todas têm RLS forçada, política tenant_isolation e gatilho enforce_tenant_id', async () => {
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
      [NEW_TENANT_TABLES],
    );

    expect(result.rows.map((row) => row.table_name)).toEqual(
      [...NEW_TENANT_TABLES].sort(),
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
      count('select count(*)::text as count from inf.rait_unit'),
    );
    expect(mine).toBe(3);

    for (const table of NEW_TENANT_TABLES) {
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
          `insert into inf.rait_unit (tenant_id, name, judging_body)
           values ($1, 'turma efêmera', 'jari')`,
          [TENANT],
        ),
      ),
    ).rejects.toMatchObject({ code: '42501' });
  });

  it('dado um estado fora de TURMA_ATIVA/TURMA_EM_CONSTITUICAO/TURMA_SUSPENSA quando uma turma é inserida então ck_inf_rait_unit_state rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_unit (tenant_id, name, judging_body, state)
           values ($1, 'turma inválida', 'jari', 'ESTADO_INEXISTENTE')`,
          [TENANT],
        ),
      ),
    ).rejects.toMatchObject({ code: '23514' });
  });

  it('dado um kind fora de escala_semanal/plantao_risco/escala_assinatura/escala_balcao quando uma escala é inserida então ck_inf_rait_schedule_kind rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_schedule (tenant_id, pool_id, member_id, kind, period_start, period_end)
           values ($1, $2, $3, 'kind_inexistente', '2026-10-01', '2026-10-07')`,
          [TENANT, POOL_DEFESA, MEMBER_ANA],
        ),
      ),
    ).rejects.toMatchObject({ code: '23514' });
  });

  it('dado um availability fora de DISPONIVEL/EM_PLANTAO/AUSENTE_PROGRAMADO quando uma escala é inserida então ck_inf_rait_schedule_availability rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_schedule (tenant_id, pool_id, member_id, kind, period_start, period_end, availability)
           values ($1, $2, $3, 'escala_semanal', '2026-11-01', '2026-11-07', 'AVAILABILITY_INEXISTENTE')`,
          [TENANT, POOL_DEFESA, MEMBER_ANA],
        ),
      ),
    ).rejects.toMatchObject({ code: '23514' });
  });

  it('dada uma escala AUSENTE_PROGRAMADO sem absence_reason quando inserida então ck_inf_rait_schedule_absence_reason_required rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_schedule (tenant_id, pool_id, member_id, kind, period_start, period_end, availability)
           values ($1, $2, $3, 'escala_semanal', '2026-10-08', '2026-10-14', 'AUSENTE_PROGRAMADO')`,
          [TENANT, POOL_DEFESA, MEMBER_ANA],
        ),
      ),
    ).rejects.toMatchObject({ code: '23514' });
  });

  it('dado um availability fora de DISPONIVEL/EM_PLANTAO/AUSENTE_PROGRAMADO quando um slot é inserido então ck_inf_rait_schedule_slot_availability rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_schedule_slot (tenant_id, schedule_id, slot_on, availability)
           values ($1, $2, '2026-10-01', 'AVAILABILITY_INEXISTENTE')`,
          [TENANT, SCHEDULE_0001],
        ),
      ),
    ).rejects.toMatchObject({ code: '23514' });
  });

  it('dado um estado fora de LOTE_ABERTO/LOTE_SORTEADO/LOTE_ACEITO quando um lote é inserido então ck_inf_rait_batch_state rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_batch (tenant_id, pool_id, week_start, state)
           values ($1, $2, '2026-10-05', 'ESTADO_INEXISTENTE')`,
          [TENANT, POOL_JARI],
        ),
      ),
    ).rejects.toMatchObject({ code: '23514' });
  });

  it('dado um lote LOTE_SORTEADO sem seed quando inserido então ck_inf_rait_batch_seed_required rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_batch (tenant_id, pool_id, week_start, state, drawn_at)
           values ($1, $2, '2026-10-12', 'LOTE_SORTEADO', now())`,
          [TENANT, POOL_JARI],
        ),
      ),
    ).rejects.toMatchObject({ code: '23514' });
  });

  it('dado um item de lote com accepted_at e declined_at preenchidos quando inserido então ck_inf_rait_batch_item_outcome_exclusive rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_batch_item (tenant_id, batch_id, case_id, position, member_id, accepted_at, declined_at, decline_kind)
           values ($1, $2, $3, 99, $4, now(), now(), 'impedimento')`,
          [TENANT, BATCH_0001, CASE_0018, MEMBER_IARA],
        ),
      ),
    ).rejects.toMatchObject({ code: '23514' });
  });

  it('dado um item de lote com claim_due_on e sem member_id quando inserido então ck_inf_rait_batch_item_claim_needs_member rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_batch_item (tenant_id, batch_id, case_id, position, claim_due_on)
           values ($1, $2, $3, 98, '2026-10-15')`,
          [TENANT, BATCH_0001, CASE_0018],
        ),
      ),
    ).rejects.toMatchObject({ code: '23514' });
  });

  it('dado um estado fora de BANCA_PREVISTA/BANCA_CONFIRMADA/BANCA_INSUFICIENTE quando uma banca é inserida então ck_inf_rait_bench_state rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_bench (tenant_id, session_id, state)
           values ($1, $2, 'ESTADO_INEXISTENTE')`,
          [TENANT, randomUUID()],
        ),
      ),
    ).rejects.toMatchObject({ code: '23514' });
  });

  it('dada uma banca BANCA_CONFIRMADA sem confirmed_at quando inserida então ck_inf_rait_bench_confirmed_complete rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_bench (tenant_id, session_id, state)
           values ($1, $2, 'BANCA_CONFIRMADA')`,
          [TENANT, randomUUID()],
        ),
      ),
    ).rejects.toMatchObject({ code: '23514' });
  });

  it('dado um kind fora de impedimento/suspeicao quando um impedimento é inserido então ck_inf_rait_impediment_kind rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_impediment (tenant_id, case_id, member_id, basis, kind)
           values ($1, $2, $3, 'motivo', 'KIND_INEXISTENTE')`,
          [TENANT, CASE_0018, MEMBER_IARA],
        ),
      ),
    ).rejects.toMatchObject({ code: '23514' });
  });

  it('dado um unit_id inexistente quando um pool é inserido então fk_inf_rait_pool_unit rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_pool (tenant_id, name, instance, circuit, strategy, unit_id)
           values ($1, 'pool efêmero', 'jari', 2, 'round_robin', $2)`,
          [TENANT, randomUUID()],
        ),
      ),
    ).rejects.toMatchObject({ code: '23503' });
  });

  it('dado um pool_id inexistente quando uma escala é inserida então fk_inf_rait_schedule_pool rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_schedule (tenant_id, pool_id, member_id, kind, period_start, period_end)
           values ($1, $2, $3, 'escala_semanal', '2026-10-01', '2026-10-07')`,
          [TENANT, randomUUID(), MEMBER_ANA],
        ),
      ),
    ).rejects.toMatchObject({ code: '23503' });
  });

  it('dado um batch_id inexistente quando um item de lote é inserido então fk_inf_rait_batch_item_batch rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_batch_item (tenant_id, batch_id, case_id, position)
           values ($1, $2, $3, 97)`,
          [TENANT, randomUUID(), CASE_0018],
        ),
      ),
    ).rejects.toMatchObject({ code: '23503' });
  });

  it('dado um member_id inexistente quando um plantão de suplência é inserido então fk_inf_rait_substitute_duty_member rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_substitute_duty (tenant_id, session_id, member_id)
           values ($1, $2, $3)`,
          [TENANT, SESSION_0001, randomUUID()],
        ),
      ),
    ).rejects.toMatchObject({ code: '23503' });
  });

  it('dado o pool JARI-AM sem turma (unit_id nulo) quando um segundo pool sem turma da mesma instância é inserido então ux_inf_rait_pool_instance rejeita (índice parcial em unit_id is null)', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_pool (tenant_id, name, instance, circuit, strategy)
           values ($1, 'pool jari efêmero', 'jari', 2, 'round_robin')`,
          [TENANT],
        ),
      ),
    ).rejects.toMatchObject({ code: '23505' });
  });

  it('dado um pool com turma quando um segundo pool da mesma instância e turma é inserido então ux_inf_rait_pool_instance_unit rejeita (linha efêmera com unit_id preenchido)', async () => {
    await expect(
      asOwner(async () => {
        await client.query(
          `insert into inf.rait_pool (tenant_id, name, instance, circuit, strategy, unit_id)
           values ($1, 'pool com turma A', 'jari', 2, 'round_robin', $2)`,
          [TENANT, UNIT_0001],
        );
        return client.query(
          `insert into inf.rait_pool (tenant_id, name, instance, circuit, strategy, unit_id)
           values ($1, 'pool com turma B', 'jari', 2, 'round_robin', $2)`,
          [TENANT, UNIT_0001],
        );
      }),
    ).rejects.toMatchObject({ code: '23505' });
  });

  it('dada a escala …0001 (Ana, escala_semanal, período 2026-09-14) quando uma segunda escala do mesmo membro/kind/período é inserida então ux_inf_rait_schedule_member_period rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_schedule (tenant_id, pool_id, member_id, kind, period_start, period_end)
           values ($1, $2, $3, 'escala_semanal', '2026-09-14', '2026-09-20')`,
          [TENANT, POOL_DEFESA, MEMBER_ANA],
        ),
      ),
    ).rejects.toMatchObject({ code: '23505' });
  });

  it('dado o lote semanal do pool JARI na semana 2026-09-07 quando um segundo lote semanal da mesma semana é inserido então ux_inf_rait_batch_pool_week rejeita (dois extraordinários na mesma semana não colidem)', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_batch (tenant_id, pool_id, week_start, kind)
           values ($1, $2, '2026-09-07', 'semanal')`,
          [TENANT, POOL_JARI],
        ),
      ),
    ).rejects.toMatchObject({ code: '23505' });

    await asOwner(async () => {
      await client.query(
        `insert into inf.rait_batch (tenant_id, pool_id, week_start, kind)
         values ($1, $2, '2026-09-07', 'extraordinario')`,
        [TENANT, POOL_JARI],
      );
      await client.query(
        `insert into inf.rait_batch (tenant_id, pool_id, week_start, kind)
         values ($1, $2, '2026-09-07', 'extraordinario')`,
        [TENANT, POOL_JARI],
      );
    });
    expect(BATCH_0002).toBeTruthy();
  });

  it('dado o caso 18 já no lote …0001 (position 1) quando o mesmo caso é inserido de novo no lote então ux_inf_rait_batch_item_case rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_batch_item (tenant_id, batch_id, case_id, position)
           values ($1, $2, $3, 2)`,
          [TENANT, BATCH_0001, CASE_0018],
        ),
      ),
    ).rejects.toMatchObject({ code: '23505' });
  });

  it('dada a position 1 já ocupada no lote …0001 quando outro item usa a mesma posição então ux_inf_rait_batch_item_position rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_batch_item (tenant_id, batch_id, case_id, position)
           values ($1, $2, $3, 1)`,
          [TENANT, BATCH_0001, '00000000-0000-7000-8000-000010000019'],
        ),
      ),
    ).rejects.toMatchObject({ code: '23505' });
  });

  it('dado o suplente João já designado para a sessão 02 quando o mesmo membro é designado de novo para a mesma sessão então ux_inf_rait_substitute_duty rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_substitute_duty (tenant_id, session_id, member_id)
           values ($1, $2, $3)`,
          [
            TENANT,
            '00000000-0000-7000-8000-000030000002',
            '00000000-0000-7000-8000-000021000010',
          ],
        ),
      ),
    ).rejects.toMatchObject({ code: '23505' });
    expect(SUBSTITUTE_DUTY_0002).toBeTruthy();
  });

  it('dada a banca …0001 já cadastrada para a sessão 01 quando uma segunda banca da mesma sessão é inserida então ux_inf_rait_bench_session rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_bench (tenant_id, session_id)
           values ($1, $2)`,
          [TENANT, SESSION_0001],
        ),
      ),
    ).rejects.toMatchObject({ code: '23505' });
    expect(BENCH_0001).toBeTruthy();
  });

  it('dadas as fixtures novas do worklist quando contadas então há 3 turmas, 3 escalas, 5 slots, 3 lotes, 4 itens de lote, 2 plantões de suplência e 4 bancas', async () => {
    expect(
      await count(
        `select count(distinct state)::text as count from inf.rait_unit where tenant_id = $1`,
        [TENANT],
      ),
    ).toBe(3);
    expect(
      await count(
        `select count(*)::text as count from inf.rait_schedule where tenant_id = $1`,
        [TENANT],
      ),
    ).toBe(3);
    expect(
      await count(
        `select count(*)::text as count from inf.rait_schedule_slot where tenant_id = $1`,
        [TENANT],
      ),
    ).toBe(5);
    expect(
      await count(
        `select count(distinct state)::text as count from inf.rait_batch where tenant_id = $1 and id in ($2, $3, '00000000-0000-7000-8000-000028000003')`,
        [TENANT, BATCH_0001, BATCH_0002],
      ),
    ).toBe(3);
    expect(
      await count(
        `select count(*)::text as count from inf.rait_batch_item where tenant_id = $1 and batch_id in ($2, $3, '00000000-0000-7000-8000-000028000003')`,
        [TENANT, BATCH_0001, BATCH_0002],
      ),
    ).toBe(4);
    expect(
      await count(
        `select count(*)::text as count from inf.rait_substitute_duty where tenant_id = $1`,
        [TENANT],
      ),
    ).toBe(2);
    expect(
      await count(
        `select count(distinct state)::text as count from inf.rait_bench where tenant_id = $1`,
        [TENANT],
      ),
    ).toBe(3);
    expect(
      await count(
        `select count(*)::text as count from inf.rait_bench where tenant_id = $1`,
        [TENANT],
      ),
    ).toBe(4);
  });

  it('dado o membro …0010 (João) quando lido então is_substitute é true (ajuste §e.2 do contrato)', async () => {
    const result = await asOwner(() =>
      client.query<{ is_substitute: boolean }>(
        `select is_substitute from inf.rait_pool_member where id = '00000000-0000-7000-8000-000021000010'`,
      ),
    );
    expect(result.rows[0]?.is_substitute).toBe(true);
  });

  it('dado o impedimento …000023000001 (Iara, caso 11) quando lido então kind é impedimento e legal_basis está preenchido (ajuste §e.2 do contrato)', async () => {
    const result = await asOwner(() =>
      client.query<{ kind: string; legal_basis: string | null }>(
        `select kind, legal_basis from inf.rait_impediment where id = '00000000-0000-7000-8000-000023000001'`,
      ),
    );
    expect(result.rows[0]?.kind).toBe('impedimento');
    expect(result.rows[0]?.legal_basis).toBeTruthy();
  });
});
