import pg from 'pg';

const { Client } = pg;

export const TENANT = '00000000-0000-7000-8000-00000000a001';
export const ACTOR = '00000000-0000-4000-8000-0000b0000001';

function required(name: string): string {
  const value = process.env[name];
  if (!value)
    throw new Error(`${name} is required; no database fallback exists`);
  const parsed = new URL(value);
  if (parsed.pathname.slice(1) !== 'detran_r7_ctg1_a2')
    throw new Error(`${name} must target detran_r7_ctg1_a2`);
  return value;
}

export async function withRealAppConnection<T>(
  work: (client: pg.Client) => Promise<T>,
): Promise<T> {
  const client = new Client({
    connectionString: required('STYNX_APP_DATABASE_URL'),
  });
  await client.connect();
  try {
    await client.query('begin');
    await client.query("select set_config('app.tenant_id', $1, true)", [
      TENANT,
    ]);
    await client.query("select set_config('app.actor_id', $1, true)", [ACTOR]);
    return await work(client);
  } finally {
    await client.query('rollback');
    await client.end();
  }
}
