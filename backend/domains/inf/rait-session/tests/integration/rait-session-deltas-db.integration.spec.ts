// Contrato de banco dos deltas v1.1.0 da sessão do RAIT (backend/database/ddl/36-inf-rait-session.sql):
// colunas novas de rait_session (modality, short_notice_ack), rait_agenda_item
// (view_requested_by/view_due_on) e rait_minutes (published_at), checks correspondentes
// (work/rounds/R-0006/contracts/CTG-0002-deltas.md §a.14, §e.5 item 7) e leitura cruzada de
// tenant vazia sobre a fixture ajustada da ata assinada (…000034000001).
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
const SESSION_0003 = '00000000-0000-7000-8000-000030000003';
const MINUTES_0001 = '00000000-0000-7000-8000-000034000001';
const AGENDA_ITEM_0002 = '00000000-0000-7000-8000-000031000002';

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

describe('inf.{rait_session,rait_agenda_item,rait_minutes} — deltas v1.1.0 (DDL 36)', () => {
  beforeAll(() => client.connect());
  afterAll(async () => {
    await client.query('reset role');
    await client.end();
  });

  it('dadas as fixtures do tenant am-fixtures quando lidas por um tenant efêmero então a leitura cruzada de rait_session/rait_minutes devolve 0 linhas', async () => {
    for (const table of ['rait_session', 'rait_agenda_item', 'rait_minutes']) {
      const theirs = await asTenant(OTHER_TENANT, () =>
        count(`select count(*)::text as count from inf.${table}`),
      );
      expect(theirs).toBe(0);
    }
  });

  it('dado um modality fora de presencial/virtual/hibrida quando uma sessão é inserida então ck_inf_rait_session_modality rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_session (tenant_id, judging_body, quorum_required, modality)
           values ($1, 'jari', 3, 'remota')`,
          [TENANT],
        ),
      ),
    ).rejects.toMatchObject({ code: '23514' });
  });

  it('dada uma sessão com short_notice_ack_by preenchido e short_notice_ack false quando inserida então ck_inf_rait_session_short_notice_ack rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_session (tenant_id, judging_body, quorum_required, short_notice_ack_by, short_notice_ack)
           values ($1, 'jari', 3, $2, false)`,
          [TENANT, randomUUID()],
        ),
      ),
    ).rejects.toMatchObject({ code: '23514' });
  });

  it('dado um item de pauta com view_requested_by preenchido e view_due_on nulo quando inserido então ck_inf_rait_agenda_item_view_complete rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_agenda_item (tenant_id, session_id, case_id, position, rapporteur_member_id, view_requested_by)
           values ($1, $2, $3, 99, $4, $5)`,
          [
            TENANT,
            SESSION_0003,
            '00000000-0000-7000-8000-000010000018',
            '00000000-0000-7000-8000-000021000008',
            randomUUID(),
          ],
        ),
      ),
    ).rejects.toMatchObject({ code: '23514' });
  });

  it('dada uma ata publicada sem signed_at quando inserida então ck_inf_rait_minutes_published_needs_signature rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_minutes (tenant_id, session_id, content, published_at)
           values ($1, $2, '{}'::jsonb, now())`,
          [TENANT, '00000000-0000-7000-8000-000030000004'],
        ),
      ),
    ).rejects.toMatchObject({ code: '23514' });
  });

  it('dado um rapporteur_member_id inexistente quando um item de pauta é inserido então fk_inf_rait_agenda_item_rapporteur rejeita', async () => {
    await expect(
      asOwner(() =>
        client.query(
          `insert into inf.rait_agenda_item (tenant_id, session_id, case_id, position, rapporteur_member_id)
           values ($1, $2, $3, 98, $4)`,
          [
            TENANT,
            SESSION_0003,
            '00000000-0000-7000-8000-000010000018',
            randomUUID(),
          ],
        ),
      ),
    ).rejects.toMatchObject({ code: '23503' });
  });

  it('dada a ata …0001 (sessão 03) quando lida então published_at está preenchido (ajuste do contrato: ata assinada publicada, T-R2)', async () => {
    const result = await asOwner(() =>
      client.query<{ published_at: Date | null; signed_at: Date | null }>(
        `select published_at, signed_at from inf.rait_minutes where id = $1`,
        [MINUTES_0001],
      ),
    );
    expect(result.rows[0]?.published_at).toBeTruthy();
    expect(result.rows[0]?.signed_at).toBeTruthy();
  });

  it('dada a sessão …0003 quando lida então modality é presencial (default v1.1.0) e short_notice_ack é false', async () => {
    const result = await asOwner(() =>
      client.query<{ modality: string; short_notice_ack: boolean }>(
        `select modality, short_notice_ack from inf.rait_session where id = $1`,
        [SESSION_0003],
      ),
    );
    expect(result.rows[0]?.modality).toBe('presencial');
    expect(result.rows[0]?.short_notice_ack).toBe(false);
    expect(AGENDA_ITEM_0002).toBeTruthy();
  });
});
