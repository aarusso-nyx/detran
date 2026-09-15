// Contrato de banco dos deltas v1.1.0 do caso do RAIT (backend/database/ddl/34-inf-rait-case.sql):
// RLS forçada e gatilho enforce_tenant_id nas 3 tabelas novas (rait_pending_content,
// rait_redirect, rait_draft), leitura cruzada entre tenants vazia (rait-test-strategy.md §4),
// checks de estado/consistência e regras de unicidade do contrato
// (work/rounds/R-0006/contracts/CTG-0002-deltas.md §a.10-§a.13, §c, §e.5).
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
  'rait_pending_content',
  'rait_redirect',
  'rait_draft',
];

const CASE_0001 = '00000000-0000-7000-8000-000010000001';
const CASE_0002 = '00000000-0000-7000-8000-000010000002';
const CASE_0007 = '00000000-0000-7000-8000-000010000007';
const PENDING_CONTENT_0001 = '00000000-0000-7000-8000-000036000001';
const REDIRECT_0002 = '00000000-0000-7000-8000-000037000002';
const DRAFT_0001 = '00000000-0000-7000-8000-000038000001';
const AUTHOR_ANA = '00000000-0000-4000-8000-0000b0000001';

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

describe('inf.{rait_pending_content,rait_redirect,rait_draft} — deltas v1.1.0 (DDL 34)', () => {
  beforeAll(() => client.connect());
  afterAll(async () => {
    await client.query('reset role');
    await client.end();
  });

  it('dadas as 3 tabelas novas do caso quando o catálogo é inspecionado então todas têm RLS forçada, política tenant_isolation e gatilho enforce_tenant_id', async () => {
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
      count('select count(*)::text as count from inf.rait_pending_content'),
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
          `insert into inf.rait_pending_content (tenant_id, case_id, missing_items, due_on, opened_by)
           values ($1, $2, '[]'::jsonb, '2026-12-31', $3)`,
          [TENANT, CASE_0001, randomUUID()],
        ),
      ),
    ).rejects.toMatchObject({ code: '42501' });
  });

  it('dado um outcome fora de atendida/nao_atendida quando uma pendência é inserida então ck_inf_rait_pending_content_outcome rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_pending_content (tenant_id, case_id, missing_items, due_on, opened_by, outcome)
           values ($1, $2, '[]'::jsonb, '2026-12-31', $3, 'DESFECHO_INEXISTENTE')`,
          [TENANT, CASE_0007, randomUUID()],
        ),
      ),
    ).rejects.toMatchObject({ code: '23514' });
  });

  it('dada uma pendência com closed_at preenchido e outcome nulo quando inserida então ck_inf_rait_pending_content_closure_complete rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_pending_content (tenant_id, case_id, missing_items, due_on, opened_by, closed_at)
           values ($1, $2, '[]'::jsonb, '2026-12-31', $3, now())`,
          [TENANT, CASE_0007, randomUUID()],
        ),
      ),
    ).rejects.toMatchObject({ code: '23514' });
  });

  it('dado um direction fora de entrada/saida quando um redirecionamento é inserido então ck_inf_rait_redirect_direction rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_redirect (tenant_id, direction, reason, protocol_number, counterpart_agency, redirected_by)
           values ($1, 'lateral', 'outro_orgao_autuador', 'RAIT-2026-R99999', 'órgão x', $2)`,
          [TENANT, randomUUID()],
        ),
      ),
    ).rejects.toMatchObject({ code: '23514' });
  });

  it('dado um reason fora de outro_orgao_autuador/orgao_incompetente quando um redirecionamento é inserido então ck_inf_rait_redirect_reason rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_redirect (tenant_id, direction, reason, protocol_number, counterpart_agency, redirected_by)
           values ($1, 'saida', 'motivo_inexistente', 'RAIT-2026-R99998', 'órgão x', $2)`,
          [TENANT, randomUUID()],
        ),
      ),
    ).rejects.toMatchObject({ code: '23514' });
  });

  it('dado um redirecionamento de entrada sem case_id quando inserido então ck_inf_rait_redirect_inbound_has_case rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_redirect (tenant_id, direction, reason, protocol_number, counterpart_agency, redirected_by)
           values ($1, 'entrada', 'orgao_incompetente', 'RAIT-2026-R99997', 'órgão x', $2)`,
          [TENANT, randomUUID()],
        ),
      ),
    ).rejects.toMatchObject({ code: '23514' });
  });

  it('dado um status fora de rascunho/submetida/devolvida/assinada quando uma minuta é inserida então ck_inf_rait_draft_status rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_draft (tenant_id, case_id, version, author_id, content_hash, status)
           values ($1, $2, 2, $3, 'hash-efemero', 'STATUS_INEXISTENTE')`,
          [TENANT, CASE_0007, AUTHOR_ANA],
        ),
      ),
    ).rejects.toMatchObject({ code: '23514' });
  });

  it('dada uma minuta submetida sem submitted_at quando inserida então ck_inf_rait_draft_submitted_required rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_draft (tenant_id, case_id, version, author_id, content_hash, status)
           values ($1, $2, 2, $3, 'hash-efemero', 'submetida')`,
          [TENANT, CASE_0007, AUTHOR_ANA],
        ),
      ),
    ).rejects.toMatchObject({ code: '23514' });
  });

  it('dada uma minuta devolvida sem returned_at/return_guidance quando inserida então ck_inf_rait_draft_return_complete rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_draft (tenant_id, case_id, version, author_id, content_hash, status, submitted_at)
           values ($1, $2, 2, $3, 'hash-efemero', 'devolvida', now())`,
          [TENANT, CASE_0007, AUTHOR_ANA],
        ),
      ),
    ).rejects.toMatchObject({ code: '23514' });
  });

  it('dada uma minuta com return_count acima de 1 quando inserida então ck_inf_rait_draft_single_return rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_draft (tenant_id, case_id, version, author_id, content_hash, return_count)
           values ($1, $2, 2, $3, 'hash-efemero', 2)`,
          [TENANT, CASE_0007, AUTHOR_ANA],
        ),
      ),
    ).rejects.toMatchObject({ code: '23514' });
  });

  it('dado um case_id inexistente quando uma pendência é inserida então fk_inf_rait_pending_content_case rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_pending_content (tenant_id, case_id, missing_items, due_on, opened_by)
           values ($1, $2, '[]'::jsonb, '2026-12-31', $3)`,
          [TENANT, randomUUID(), randomUUID()],
        ),
      ),
    ).rejects.toMatchObject({ code: '23503' });
  });

  it('dado um case_id inexistente quando um redirecionamento de entrada é inserido então fk_inf_rait_redirect_case rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_redirect (tenant_id, case_id, direction, reason, protocol_number, counterpart_agency, redirected_by)
           values ($1, $2, 'entrada', 'orgao_incompetente', 'RAIT-2026-R99996', 'órgão x', $3)`,
          [TENANT, randomUUID(), randomUUID()],
        ),
      ),
    ).rejects.toMatchObject({ code: '23503' });
  });

  it('dado um case_id inexistente quando uma minuta é inserida então fk_inf_rait_draft_case rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_draft (tenant_id, case_id, version, author_id, content_hash)
           values ($1, $2, 1, $3, 'hash-efemero')`,
          [TENANT, randomUUID(), AUTHOR_ANA],
        ),
      ),
    ).rejects.toMatchObject({ code: '23503' });
  });

  it('dado o caso 01 já com uma pendência aberta quando uma segunda pendência aberta do mesmo caso é inserida então ux_inf_rait_pending_content_open rejeita (índice parcial em closed_at is null)', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_pending_content (tenant_id, case_id, missing_items, due_on, opened_by)
           values ($1, $2, '["comprovante_endereco"]'::jsonb, '2026-10-01', $3)`,
          [TENANT, CASE_0001, randomUUID()],
        ),
      ),
    ).rejects.toMatchObject({ code: '23505' });
    expect(PENDING_CONTENT_0001).toBeTruthy();
  });

  it('dado o protocolo RAIT-2026-R00002 (entrada) já registrado quando o mesmo protocolo e sentido são inseridos de novo então ux_inf_rait_redirect_protocol rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_redirect (tenant_id, case_id, direction, reason, protocol_number, counterpart_agency, redirected_by)
           values ($1, $2, 'entrada', 'orgao_incompetente', 'RAIT-2026-R00002', 'órgão duplicado', $3)`,
          [TENANT, CASE_0002, randomUUID()],
        ),
      ),
    ).rejects.toMatchObject({ code: '23505' });
    expect(REDIRECT_0002).toBeTruthy();
  });

  it('dada a minuta …0001 (caso 07, versão 1) quando uma segunda minuta da mesma versão e caso é inserida então ux_inf_rait_draft_version rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_draft (tenant_id, case_id, version, author_id, content_hash)
           values ($1, $2, 1, $3, 'hash-duplicado')`,
          [TENANT, CASE_0007, AUTHOR_ANA],
        ),
      ),
    ).rejects.toMatchObject({ code: '23505' });
    expect(DRAFT_0001).toBeTruthy();
  });

  it('dado o caso 01 quando lido então legal_priority e unit_id são nulos e version é 1 (colunas novas v1.1.0)', async () => {
    const result = await asOwner(() =>
      client.query<{
        legal_priority: string | null;
        unit_id: string | null;
        version: number;
      }>(
        `select legal_priority, unit_id, version from inf.rait_case where id = $1`,
        [CASE_0001],
      ),
    );
    expect(result.rows[0]?.legal_priority).toBeNull();
    expect(result.rows[0]?.unit_id).toBeNull();
    expect(result.rows[0]?.version).toBe(1);
  });

  it('dadas as fixtures novas do caso quando contadas então há 3 pendências (2 desfechos + 1 aberta), 2 redirecionamentos (2 sentidos) e 4 minutas (4 status)', async () => {
    expect(
      await count(
        `select count(*)::text as count from inf.rait_pending_content where tenant_id = $1`,
        [TENANT],
      ),
    ).toBe(3);
    expect(
      await count(
        `select count(*)::text as count from inf.rait_pending_content where tenant_id = $1 and closed_at is null`,
        [TENANT],
      ),
    ).toBe(1);
    expect(
      await count(
        `select count(distinct direction)::text as count from inf.rait_redirect where tenant_id = $1`,
        [TENANT],
      ),
    ).toBe(2);
    expect(
      await count(
        `select count(distinct status)::text as count from inf.rait_draft where tenant_id = $1`,
        [TENANT],
      ),
    ).toBe(4);
  });
});
