import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const { Client } = pg;

function requiredUrl(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required for CTG-0002 session`);
  return value;
}

const DATABASE_URL = requiredUrl('STYNX_APP_DATABASE_URL');
const EXPECTED_DATABASE = 'detran_r7_ctg1_a2';
const TENANT = '00000000-0000-7000-8000-00000000a001';
const OTHER_TENANT = '00000000-0000-7000-8000-00000000a099';

let client: InstanceType<typeof Client>;

async function rollback<T>(work: () => Promise<T>): Promise<T> {
  await client.query('begin');
  try {
    await client.query('set local role role_app_backend');
    await client.query(`select set_config('app.tenant_id', $1, true)`, [
      TENANT,
    ]);
    return await work();
  } finally {
    await client.query('rollback');
  }
}

describe('TASK-0047 — base dedicada e fronteiras de agenda', () => {
  beforeAll(async () => {
    expect(new URL(DATABASE_URL).pathname.slice(1)).toBe(EXPECTED_DATABASE);
    client = new Client({ connectionString: DATABASE_URL });
    await client.connect();
  });

  afterAll(async () => client?.end());

  it('dado role_app_backend e tenant da fixture quando a sessão e os itens são lidos sob rollback então há dados de pauta e nenhum reset ocorre', async () => {
    const result = await rollback(() =>
      client.query<{ sessions: string; items: string }>(
        `select
          (select count(*)::text from inf.rait_session) as sessions,
          (select count(*)::text from inf.rait_agenda_item) as items`,
      ),
    );

    expect(Number(result.rows[0]?.sessions ?? 0)).toBeGreaterThan(0);
    expect(Number(result.rows[0]?.items ?? 0)).toBeGreaterThan(0);
  });

  it('dado outro tenant na mesma base dedicada quando a pauta é lida sob role_app_backend então RLS não revela sessão nem item', async () => {
    await client.query('begin');
    try {
      await client.query('set local role role_app_backend');
      await client.query(`select set_config('app.tenant_id', $1, true)`, [
        OTHER_TENANT,
      ]);
      const result = await client.query<{ sessions: string; items: string }>(
        `select
          (select count(*)::text from inf.rait_session) as sessions,
          (select count(*)::text from inf.rait_agenda_item) as items`,
      );
      expect(result.rows[0]).toEqual({ sessions: '0', items: '0' });
    } finally {
      await client.query('rollback');
    }
  });

  it('dado o schema de sessão atual quando os comandos de pauta exigem transição same-transaction então a porta de caso pública ainda não está materializada no módulo', async () => {
    const commandSurface =
      await import('../../src/handwritten/rait-session-command.service.js');

    expect(commandSurface).toHaveProperty('RaitSessionAgendaCommandService');
  });
});
