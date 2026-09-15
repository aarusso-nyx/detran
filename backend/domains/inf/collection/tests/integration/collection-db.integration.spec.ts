// Contrato de banco do financeiro do RAIT (backend/database/ddl/57-inf-collection.sql):
// RLS forçada e gatilho enforce_tenant_id nas 4 tabelas de tenant, leitura cruzada entre
// tenants vazia (rait-test-strategy.md §4), checks de estado das máquinas b.4 (documento de
// arrecadação), b.5 (ordem de restituição) e b.6 (encaminhamento à Fazenda), FKs reais entre
// módulos e regras de unicidade do contrato (CTG-0002-modules.md §a.9-§a.12, §d.5).
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
const TENANT_TABLES = [
  'collection_document',
  'payment',
  'refund_order',
  'debt_handoff',
];

const INFRACTION_05 = '00000000-0000-7000-8000-0000d0000005';
const INFRACTION_15 = '00000000-0000-7000-8000-0000d0000015';
const DOCUMENT_0001 = '00000000-0000-7000-8000-000046000001';
const DOCUMENT_0002 = '00000000-0000-7000-8000-000046000002';
const PAYMENT_0001 = '00000000-0000-7000-8000-000047000001';
const REFUND_ORDER_0001 = '00000000-0000-7000-8000-000048000001';
const DEBT_HANDOFF_0001 = '00000000-0000-7000-8000-000049000001';

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

describe('inf.{collection_document,payment,refund_order,debt_handoff} — contrato de banco (DDL 57)', () => {
  beforeAll(() => client.connect());
  afterAll(async () => {
    await client.query('reset role');
    await client.end();
  });

  it('dadas as tabelas de tenant do financeiro quando o catálogo é inspecionado então todas têm RLS forçada, política tenant_isolation e gatilho enforce_tenant_id', async () => {
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
      count('select count(*)::text as count from inf.collection_document'),
    );
    expect(mine).toBe(5);

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
          `insert into inf.collection_document (tenant_id, infraction_id, tier, amount, barcode, valid_until, issued_for_state)
           values ($1, $2, 'desconto_80', 100.00, '00000000000000000000000000000000000000000099', '2026-12-31', 'NOTIFICADO_PENALIDADE')`,
          [TENANT, INFRACTION_05],
        ),
      ),
    ).rejects.toMatchObject({ code: '42501' });
  });

  it('dado um tier fora do vocabulário de inf.infraction_payment_tier_ref quando um documento é inserido então ck_inf_collection_document_tier rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.collection_document (tenant_id, infraction_id, tier, amount, barcode, valid_until, issued_for_state)
           values ($1, $2, 'faixa_inexistente', 100.00, '00000000000000000000000000000000000000000098', '2026-12-31', 'NOTIFICADO_PENALIDADE')`,
          [TENANT, INFRACTION_05],
        ),
      ),
    ).rejects.toMatchObject({ code: expect.stringMatching(/^(23514|23503)$/) });
  });

  it('dado um status fora de emitido/pago/vencido/invalidado quando um documento é inserido então ck_inf_collection_document_status rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.collection_document (tenant_id, infraction_id, tier, amount, barcode, valid_until, issued_for_state, status)
           values ($1, $2, 'desconto_80', 100.00, '00000000000000000000000000000000000000000097', '2026-12-31', 'NOTIFICADO_PENALIDADE', 'STATUS_INEXISTENTE')`,
          [TENANT, INFRACTION_05],
        ),
      ),
    ).rejects.toMatchObject({ code: '23514' });
  });

  it('dado um documento sem barcode nem pix_reference quando inserido então ck_inf_collection_document_reference_required rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.collection_document (tenant_id, infraction_id, tier, amount, valid_until, issued_for_state)
           values ($1, $2, 'desconto_80', 100.00, '2026-12-31', 'NOTIFICADO_PENALIDADE')`,
          [TENANT, INFRACTION_05],
        ),
      ),
    ).rejects.toMatchObject({ code: '23514' });
  });

  it('dado um documento invalidado sem invalidated_at quando inserido então ck_inf_collection_document_invalidated_complete rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.collection_document (tenant_id, infraction_id, tier, amount, barcode, valid_until, issued_for_state, status)
           values ($1, $2, 'desconto_80', 100.00, '00000000000000000000000000000000000000000096', '2026-12-31', 'NOTIFICADO_PENALIDADE', 'invalidado')`,
          [TENANT, INFRACTION_05],
        ),
      ),
    ).rejects.toMatchObject({ code: '23514' });
  });

  it('dado um status fora de aberta/ordenada/paga quando uma ordem de restituição é inserida então ck_inf_refund_order_status rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.refund_order (tenant_id, infraction_id, payment_id, reason, base_amount, index_key, status)
           values ($1, $2, $3, 'decisao_favoravel', 10.00, 'IPCA-E', 'STATUS_INEXISTENTE')`,
          [TENANT, INFRACTION_15, PAYMENT_0001],
        ),
      ),
    ).rejects.toMatchObject({ code: '23514' });
  });

  it('dada uma ordem ordenada sem bank_data_status informado quando inserida então ck_inf_refund_order_order_needs_bank_data rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.refund_order (tenant_id, infraction_id, payment_id, reason, base_amount, index_key, status, bank_data_status, ordered_at)
           values ($1, $2, $3, 'decisao_favoravel', 10.00, 'IPCA-E', 'ordenada', 'pendente', now())`,
          [TENANT, INFRACTION_15, PAYMENT_0001],
        ),
      ),
    ).rejects.toMatchObject({ code: '23514' });
  });

  it('dado um status fora de preparado/enviado/reconhecido/cancelado quando um encaminhamento é inserido então ck_inf_debt_handoff_status rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.debt_handoff (tenant_id, infraction_id, status)
           values ($1, $2, 'STATUS_INEXISTENTE')`,
          [TENANT, INFRACTION_05],
        ),
      ),
    ).rejects.toMatchObject({ code: '23514' });
  });

  it('dado um encaminhamento cancelado sem cancel_reason quando inserido então ck_inf_debt_handoff_cancel_complete rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.debt_handoff (tenant_id, infraction_id, status)
           values ($1, $2, 'cancelado')`,
          [TENANT, INFRACTION_05],
        ),
      ),
    ).rejects.toMatchObject({ code: '23514' });
  });

  it('dado um infraction_id inexistente quando um documento de arrecadação é inserido então fk_inf_collection_document_infraction rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.collection_document (tenant_id, infraction_id, tier, amount, barcode, valid_until, issued_for_state)
           values ($1, $2, 'desconto_80', 100.00, '00000000000000000000000000000000000000000095', '2026-12-31', 'NOTIFICADO_PENALIDADE')`,
          [TENANT, randomUUID()],
        ),
      ),
    ).rejects.toMatchObject({ code: '23503' });
  });

  it('dado um document_id inexistente quando um pagamento é inserido então fk_inf_payment_document rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.payment (tenant_id, document_id, bank_reference, paid_on, amount)
           values ($1, $2, 'BR-2026-EFEMERO', '2026-09-14', 10.00)`,
          [TENANT, randomUUID()],
        ),
      ),
    ).rejects.toMatchObject({ code: '23503' });
  });

  it('dado um payment_id inexistente quando uma ordem de restituição é inserida então fk_inf_refund_order_payment rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.refund_order (tenant_id, infraction_id, payment_id, reason, base_amount, index_key)
           values ($1, $2, $3, 'decisao_favoravel', 10.00, 'IPCA-E')`,
          [TENANT, INFRACTION_15, randomUUID()],
        ),
      ),
    ).rejects.toMatchObject({ code: '23503' });
  });

  it('dado o documento …0001 (infração 05) já emitido quando um segundo documento emitido da mesma infração é inserido então ux_inf_collection_document_active rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.collection_document (tenant_id, infraction_id, tier, amount, barcode, valid_until, issued_for_state)
           values ($1, $2, 'desconto_80', 100.00, '00000000000000000000000000000000000000000094', '2026-12-31', 'NOTIFICADO_PENALIDADE')`,
          [TENANT, INFRACTION_05],
        ),
      ),
    ).rejects.toMatchObject({ code: '23505' });
    expect(DOCUMENT_0001).toBeTruthy();
  });

  it('dado o barcode do documento …0002 quando um segundo documento com o mesmo barcode é inserido então ux_inf_collection_document_barcode rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.collection_document (tenant_id, infraction_id, tier, amount, barcode, valid_until, issued_for_state)
           values ($1, $2, 'desconto_80', 100.00, '00000000000000000000000000000000000000000002', '2026-12-31', 'NOTIFICADO_PENALIDADE')`,
          [TENANT, INFRACTION_15],
        ),
      ),
    ).rejects.toMatchObject({ code: '23505' });
    expect(DOCUMENT_0002).toBeTruthy();
  });

  it('dado o bank_reference BR-2026-0000001 já processado quando reprocessado então ux_inf_payment_bank_reference rejeita a duplicata (idempotência do retorno bancário)', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.payment (tenant_id, bank_reference, paid_on, amount)
           values ($1, 'BR-2026-0000001', '2026-08-20', 200.00)`,
          [TENANT],
        ),
      ),
    ).rejects.toMatchObject({ code: '23505' });
  });

  it('dado o pagamento …0001 já com uma ordem de restituição quando uma segunda ordem do mesmo pagamento é inserida então ux_inf_refund_order_payment rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.refund_order (tenant_id, infraction_id, payment_id, reason, base_amount, index_key)
           values ($1, $2, $3, 'extincao', 5.00, 'IPCA-E')`,
          [TENANT, INFRACTION_15, PAYMENT_0001],
        ),
      ),
    ).rejects.toMatchObject({ code: '23505' });
    expect(REFUND_ORDER_0001).toBeTruthy();
  });

  it('dado o encaminhamento …0001 (infração 09) ativo quando um segundo encaminhamento ativo da mesma infração é inserido então ux_inf_debt_handoff_active rejeita', async () => {
    const infraction09 = '00000000-0000-7000-8000-0000d0000009';
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.debt_handoff (tenant_id, infraction_id, status)
           values ($1, $2, 'preparado')`,
          [TENANT, infraction09],
        ),
      ),
    ).rejects.toMatchObject({ code: '23505' });
    expect(DEBT_HANDOFF_0001).toBeTruthy();
  });

  it('dadas as fixtures do financeiro quando contadas então há 5 documentos de arrecadação (4 status), 5 pagamentos, 3 ordens de restituição (3 status) e 2 encaminhamentos (2 status)', async () => {
    expect(
      await count(
        `select count(*)::text as count from inf.collection_document where tenant_id = $1`,
        [TENANT],
      ),
    ).toBe(5);
    expect(
      await count(
        `select count(distinct status)::text as count from inf.collection_document where tenant_id = $1`,
        [TENANT],
      ),
    ).toBe(4);
    expect(
      await count(
        `select count(*)::text as count from inf.payment where tenant_id = $1`,
        [TENANT],
      ),
    ).toBe(5);
    expect(
      await count(
        `select count(distinct status)::text as count from inf.refund_order where tenant_id = $1`,
        [TENANT],
      ),
    ).toBe(3);
    expect(
      await count(
        `select count(distinct status)::text as count from inf.debt_handoff where tenant_id = $1`,
        [TENANT],
      ),
    ).toBe(2);
  });
});
