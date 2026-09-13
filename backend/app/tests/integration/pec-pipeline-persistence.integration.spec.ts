import { createHash, randomUUID } from 'node:crypto';
import {
  PgIdempotencyStore,
  type IdempotencyDecisionContext,
} from '@stynx-nyx/idempotency';
import {
  PgRateLimitStore,
  type RateLimitDecisionContext,
} from '@stynx-nyx/ratelimit';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const { Client } = pg;
const connectionString =
  process.env.DETRAN_TEST_DATABASE_URL ??
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5432/detran';
const tenantId = randomUUID();
const actorId = randomUUID();
const owner = new Client({ connectionString });
const firstClient = new Client({ connectionString });
const secondClient = new Client({ connectionString });

function executor(client: pg.Client) {
  return {
    async query<T = Record<string, unknown>>(
      sql: string,
      params?: readonly unknown[],
    ): Promise<{ rows: T[]; rowCount?: number }> {
      await client.query('begin');
      try {
        await client.query('set local role role_app_backend');
        await client.query(`select set_config('app.tenant_id', $1, true)`, [
          tenantId,
        ]);
        await client.query(`select set_config('app.actor_id', $1, true)`, [
          actorId,
        ]);
        const result = await client.query(
          sql,
          params ? [...params] : undefined,
        );
        await client.query('commit');
        return {
          rows: result.rows as T[],
          ...(result.rowCount === null ? {} : { rowCount: result.rowCount }),
        };
      } catch (error) {
        await client.query('rollback');
        throw error;
      }
    },
  };
}

beforeAll(async () => {
  await Promise.all([
    owner.connect(),
    firstClient.connect(),
    secondClient.connect(),
  ]);
  await owner.query(`select set_config('app.role', 'owner', false)`);
  await owner.query(
    `insert into auth.tenants (id, slug, name) values ($1, $2, $3)`,
    [tenantId, `pipeline-${tenantId}`, `Pipeline ${tenantId}`],
  );
  await owner.query(
    `insert into auth.users (id, tenant_id, email, display_name)
     values ($1, $2, $3, 'Pipeline test')`,
    [actorId, tenantId, `${actorId}@detran.invalid`],
  );
});

afterAll(async () => {
  await Promise.all([owner.end(), firstClient.end(), secondClient.end()]);
});

describe('PEC shared pipeline persistence', () => {
  it('AC-PEC-KERNEL-IDEMPOTENCY persists reservation, replay and expiry across instances', async () => {
    const first = new PgIdempotencyStore({ executor: executor(firstClient) });
    const second = new PgIdempotencyStore({ executor: executor(secondClient) });
    const context = {
      tenantId,
      userId: actorId,
      compositeKey: createHash('sha256').update(randomUUID()).digest('hex'),
      requestFingerprint: createHash('sha256').update('body-a').digest('hex'),
      ttlMs: 60_000,
    } as IdempotencyDecisionContext;

    await expect(first.reserve(context)).resolves.toBe(true);
    await expect(second.reserve(context)).resolves.toBe(false);
    await expect(
      first.persistResponse(context, 201, { id: 'created' }),
    ).resolves.toBe(true);
    await expect(second.lookup(context)).resolves.toMatchObject({
      requestFingerprint: context.requestFingerprint,
      statusCode: 201,
      body: { id: 'created' },
      status: 'completed',
    });

    await owner.query(
      `update integration.idempotency_keys set expires_at = now() - interval '1 second'
        where tenant_id = $1 and idem_key = $2`,
      [tenantId, context.compositeKey],
    );
    await expect(second.lookup(context)).resolves.toBeNull();
  });

  it('AC-PEC-KERNEL-RATELIMIT shares tenant windows across instances', async () => {
    const first = new PgRateLimitStore({ executor: executor(firstClient) });
    const second = new PgRateLimitStore({ executor: executor(secondClient) });
    const context = {
      tenantId,
      userId: actorId,
      bucketKey: `test:${randomUUID()}`,
      ttlMs: 60_000,
      scope: 'test',
      cost: 1,
      limit: 1,
      bucket: 'tenant',
    } as RateLimitDecisionContext;

    await expect(first.consume(context)).resolves.toMatchObject({
      allowed: true,
      used: 1,
    });
    await expect(second.consume(context)).resolves.toMatchObject({
      allowed: false,
      used: 2,
    });
  });
});
