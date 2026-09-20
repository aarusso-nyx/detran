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

describe('TASK-0049 — schema e transação de deliberação e ata', () => {
  beforeAll(async () => {
    expect(new URL(DATABASE_URL).pathname.slice(1)).toBe(EXPECTED_DATABASE);
    client = new Client({ connectionString: DATABASE_URL });
    await client.connect();
  });

  afterAll(async () => client?.end());

  it('dado role_app_backend e tenant da fixture quando as estruturas de ata confiável são lidas sob rollback então snapshot, manifesto, signatários e recibos existem sob RLS', async () => {
    const result = await rollback(() =>
      client.query<{ relation_name: string | null }>(
        `select unnest(array[
          to_regclass('inf.rait_session_minutes_snapshot')::text,
          to_regclass('inf.rait_session_minutes_manifest')::text,
          to_regclass('inf.rait_minutes_required_signer')::text,
          to_regclass('inf.rait_minutes_signature_receipt')::text
        ]) as relation_name`,
      ),
    );

    expect(result.rows.map((row) => row.relation_name)).toEqual([
      'inf.rait_session_minutes_snapshot',
      'inf.rait_session_minutes_manifest',
      'inf.rait_minutes_required_signer',
      'inf.rait_minutes_signature_receipt',
    ]);
  });

  it('dado votos, atas e cadeia de confiança quando o catálogo de triggers é lido em transação então cada artefato tem proteção append-only contra UPDATE, DELETE e TRUNCATE', async () => {
    const result = await rollback(() =>
      client.query<{ protected_table: string }>(
        `select distinct event_object_table as protected_table
         from information_schema.triggers
         where event_object_schema = 'inf'
           and event_object_table in (
             'rait_vote',
             'rait_minutes',
             'rait_session_minutes_snapshot',
             'rait_session_minutes_manifest',
             'rait_minutes_required_signer',
             'rait_minutes_signature_receipt'
           )
           and action_statement ilike '%immutable%'`,
      ),
    );

    expect(result.rows.map((row) => row.protected_table).sort()).toEqual([
      'rait_minutes',
      'rait_minutes_required_signer',
      'rait_minutes_signature_receipt',
      'rait_session_minutes_manifest',
      'rait_session_minutes_snapshot',
      'rait_vote',
    ]);
  });

  it('dado outro tenant na base dedicada quando as estruturas de ata são lidas como role_app_backend sob rollback então RLS não revela snapshot, manifesto, signatários ou recibos', async () => {
    await client.query('begin');
    try {
      await client.query('set local role role_app_backend');
      await client.query(`select set_config('app.tenant_id', $1, true)`, [
        OTHER_TENANT,
      ]);
      const result = await client.query<{ rows: string }>(
        `select (
          (select count(*) from inf.rait_session_minutes_snapshot) +
          (select count(*) from inf.rait_session_minutes_manifest) +
          (select count(*) from inf.rait_minutes_required_signer) +
          (select count(*) from inf.rait_minutes_signature_receipt)
        )::text as rows`,
      );
      expect(result.rows[0]).toEqual({ rows: '0' });
    } finally {
      await client.query('rollback');
    }
  });
});
