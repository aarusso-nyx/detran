import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const { Client } = pg;
const connectionString = process.env.DETRAN_TEST_DATABASE_URL;
const tenantA = randomUUID();
const tenantB = randomUUID();
const actorA = randomUUID();
const actorB = randomUUID();
const outboxA = randomUUID();
const outboxB = randomUUID();
const owner = new Client({ connectionString });
const appA = new Client({ connectionString });
const appB = new Client({ connectionString });

async function asTenant<T>(
  client: pg.Client,
  tenantId: string,
  actorId: string,
  work: () => Promise<T>,
): Promise<T> {
  await client.query('begin');
  try {
    await client.query('set local role role_app_backend');
    await client.query("select set_config('app.tenant_id', $1, true)", [
      tenantId,
    ]);
    await client.query("select set_config('app.actor_id', $1, true)", [
      actorId,
    ]);
    const result = await work();
    await client.query('commit');
    return result;
  } catch (error) {
    await client.query('rollback');
    throw error;
  }
}

beforeAll(async () => {
  if (!connectionString)
    throw new Error('DETRAN_TEST_DATABASE_URL is required');
  await Promise.all([owner.connect(), appA.connect(), appB.connect()]);
  await owner.query("select set_config('app.role', 'owner', false)");
  for (const [tenantId, actorId] of [
    [tenantA, actorA],
    [tenantB, actorB],
  ] as const) {
    await owner.query(
      'insert into auth.tenants (id, slug, name) values ($1, $2, $3)',
      [tenantId, `r21-renach-${tenantId}`, `R21 RENACH ${tenantId}`],
    );
    await owner.query(
      "insert into auth.users (id, tenant_id, email, display_name) values ($1, $2, $3, 'R21 RENACH actor')",
      [actorId, tenantId, `${actorId}@detran.invalid`],
    );
  }
  for (const [outboxId, tenantId] of [
    [outboxA, tenantA],
    [outboxB, tenantB],
  ] as const) {
    await owner.query(
      `insert into integration.outbox
        (id, tenant_id, topic, aggregate_type, aggregate_id, payload, idempotency_key)
       values ($1, $2, 'ch.renach.exam-result', 'ch.report', $3, '{}'::jsonb, $4)`,
      [
        outboxId,
        tenantId,
        `fixture-report-${outboxId}`,
        `r21-renach:${outboxId}`,
      ],
    );
  }
});

afterAll(async () => {
  try {
    await owner.query(
      'delete from integration.outbox where id = any($1::uuid[])',
      [[outboxA, outboxB]],
    );
    await owner.query('delete from auth.users where id = any($1::uuid[])', [
      [actorA, actorB],
    ]);
    await owner.query('delete from auth.tenants where id = any($1::uuid[])', [
      [tenantA, tenantB],
    ]);
  } finally {
    await Promise.all([owner.end(), appA.end(), appB.end()]);
  }
});

describe('R-0021 isolamento persistido do RENACH', () => {
  it('dado outboxes RENACH de dois tenants quando o caminho app consulta e altera então só alcança o tenant do contexto', async () => {
    const own = await asTenant(appA, tenantA, actorA, async () =>
      appA.query<{ id: string }>(
        "select id from integration.outbox where topic = 'ch.renach.exam-result' order by id",
      ),
    );
    expect(own.rows.map((row) => row.id)).toEqual([outboxA]);

    const foreign = await asTenant(appA, tenantA, actorA, async () =>
      appA.query<{ id: string }>(
        'select id from integration.outbox where id = $1',
        [outboxB],
      ),
    );
    expect(foreign.rows).toEqual([]);

    const update = await asTenant(appA, tenantA, actorA, async () =>
      appA.query(
        "update integration.outbox set status = 'acked' where id = $1",
        [outboxB],
      ),
    );
    expect(update.rowCount).toBe(0);

    const preserved = await asTenant(appB, tenantB, actorB, async () =>
      appB.query<{ status: string }>(
        'select status from integration.outbox where id = $1',
        [outboxB],
      ),
    );
    expect(preserved.rows).toEqual([{ status: 'pending' }]);
  });
});
