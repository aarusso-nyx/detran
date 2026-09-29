import pg from 'pg';
import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  DETRAN_POLICY_MATRIX,
  DETRAN_ROLES,
  isDetranActionAllowed,
  permissionsForRoles,
  type DetranRole,
} from '@detran/shared';

const { Client } = pg;
const client = new Client({
  connectionString: process.env.DETRAN_TEST_DATABASE_URL,
});
const backend = new Client({
  connectionString: process.env.DETRAN_TEST_DATABASE_URL,
});
const tenantA = randomUUID();
const tenantB = randomUUID();
const invoiceId = randomUUID();
const resource = 'invoice';
const action = 'write';
const policyKey = `ch:${resource}:${action}`;
const grants = DETRAN_POLICY_MATRIX[policyKey] ?? [];
const global = (role: DetranRole) => permissionsForRoles([role]).includes('*');
const denied = DETRAN_ROLES.filter(
  (role) => !grants.includes(role) && !global(role),
);
beforeAll(async () => Promise.all([client.connect(), backend.connect()]));
afterAll(async () => {
  await client.query('delete from ch.billing_invoice where id = $1', [
    invoiceId,
  ]);
  await Promise.all([client.end(), backend.end()]);
});

async function asTenant(tenantId: string, sql: string) {
  await backend.query('begin');
  try {
    await backend.query('set local role role_app_backend');
    await backend.query(`select set_config('app.tenant_id', $1, true)`, [
      tenantId,
    ]);
    const result = await backend.query(sql, [invoiceId]);
    await backend.query('commit');
    return result;
  } catch (error) {
    await backend.query('rollback');
    throw error;
  }
}

describe('billing integration', () => {
  it('dado fatura sintética quando cada papel canônico a escreve então aplica grants e nega todos os demais', () => {
    expect(grants).not.toEqual([]);
    for (const role of [...grants, ...DETRAN_ROLES.filter(global)])
      expect(
        isDetranActionAllowed(
          { roles: [role], permissions: permissionsForRoles([role]) },
          `ch:${resource}`,
          action,
        ),
      ).toBe(true);
    for (const role of denied)
      expect(
        isDetranActionAllowed(
          { roles: [role], permissions: permissionsForRoles([role]) },
          `ch:${resource}`,
          action,
        ),
      ).toBe(false);
  });
  it('dado faturas sintéticas A e B quando o tenant A lê ou muta B então RLS não revela nem altera B', async () => {
    await client.query(`select set_config('app.tenant_id', $1, false)`, [
      tenantB,
    ]);
    await client.query(
      `insert into ch.billing_invoice
        (id, tenant_id, reference_period, created_by)
       values ($1, $2, '2026-09', $3)`,
      [invoiceId, tenantB, randomUUID()],
    );
    await expect(
      asTenant(tenantA, 'select id from ch.billing_invoice where id = $1'),
    ).resolves.toMatchObject({ rows: [] });
    await expect(
      asTenant(
        tenantA,
        'update ch.billing_invoice set updated_at = now() where id = $1 returning id',
      ),
    ).resolves.toMatchObject({ rows: [] });
    await expect(
      asTenant(tenantB, 'select id from ch.billing_invoice where id = $1'),
    ).resolves.toMatchObject({ rows: [{ id: invoiceId }] });
  });
});
