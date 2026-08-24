import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect } from 'vitest';

import { DetranPersistedAuditSink } from '../../src/detran-runtime.js';
import { auditPersistenceBehavior } from '../shared/audit-persistence.behavior.js';

const { Client } = pg;
const connectionString =
  process.env.DETRAN_TEST_DATABASE_URL ??
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5432/detran';
const tenantId = randomUUID();
const actorId = randomUUID();
const client = new Client({ connectionString });
const sink = new DetranPersistedAuditSink();

beforeAll(async () => {
  await client.connect();
  await client.query(`select set_config('app.role', 'owner', false)`);
  await client.query(
    `insert into auth.tenants (id, slug, name) values ($1, $2, $3)`,
    [tenantId, `audit-${tenantId}`, `Audit ${tenantId}`],
  );
  await client.query(
    `insert into auth.users (id, tenant_id, email, display_name)
     values ($1, $2, $3, 'Audit test')
     on conflict (id) do update set tenant_id = excluded.tenant_id`,
    [actorId, tenantId, `${actorId}@detran.invalid`],
  );
  sink.bindDatabase({
    tx: async (
      work: (transaction: { query: typeof client.query }) => Promise<unknown>,
    ) => {
      await client.query('begin');
      try {
        await client.query('set local role role_app_backend');
        await client.query(`select set_config('app.tenant_id', $1, true)`, [
          tenantId,
        ]);
        await client.query(`select set_config('app.actor_id', $1, true)`, [
          actorId,
        ]);
        const result = await work({ query: client.query.bind(client) });
        await client.query('commit');
        return result;
      } catch (error) {
        await client.query('rollback');
        throw error;
      }
    },
  } as never);
});

afterAll(async () => {
  await client.query('reset role');
  await client.end();
});

describe('persisted DETRAN audit sink', () => {
  auditPersistenceBehavior({
    write: async (action) =>
      sink.write({
        occurredAt: new Date().toISOString(),
        tenantId,
        actorId,
        actorRole: 'AUDITOR',
        action,
        entity: 'integration.test',
        metadata: { tier: 'integration' },
      }),
    count: async () => {
      const result = await client.query<{ count: string }>(
        'select count(*)::text as count from audit.events where tenant_id = $1',
        [tenantId],
      );
      return Number(result.rows[0]?.count ?? 0);
    },
    verify: async () => {
      const result = await client.query<{ valid: boolean }>(
        'select audit.verify_chain($1) as valid',
        [tenantId],
      );
      return result.rows[0]?.valid === true;
    },
  });

  it('rejects mutation of a persisted event', async () => {
    await expect(
      client.query(
        `update audit.events set action = 'TAMPERED' where tenant_id = $1`,
        [tenantId],
      ),
    ).rejects.toMatchObject({ code: '42501' });
  });
});
