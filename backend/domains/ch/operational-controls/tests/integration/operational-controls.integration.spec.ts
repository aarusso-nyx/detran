import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  DETRAN_POLICY_MATRIX,
  DETRAN_ROLES,
  isDetranActionAllowed,
  permissionsForRoles,
  type DetranRole,
} from '@detran/shared';
import {
  assertTableTenantIsolation,
  createRlsFixture,
  removeRlsFixture,
} from '../../../scheduling/tests/integration/tenant-rls-fixture.js';

const { Client } = pg;
const client = new Client({
  connectionString: process.env.DETRAN_TEST_DATABASE_URL,
});
let fixture: Awaited<ReturnType<typeof createRlsFixture>>;
const resource = 'operational-control';
const action = 'write';
const policyKey = `ch:${resource}:${action}`;
const grants = DETRAN_POLICY_MATRIX[policyKey] ?? [];
const global = (role: DetranRole) => permissionsForRoles([role]).includes('*');
const denied = DETRAN_ROLES.filter(
  (role) => !grants.includes(role) && !global(role),
);
beforeAll(async () => {
  await client.connect();
  fixture = await createRlsFixture(client, 'operational_record');
});
afterAll(async () => {
  await removeRlsFixture(client, fixture);
  await client.end();
});

describe('operational-controls integration', () => {
  it('dado controle operacional de clínica quando cada papel canônico o escreve então aplica grants e nega todos os demais', () => {
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
  it('dado controles de tenants distintos quando o banco regulamentar os protege então a tabela mantém RLS', async () => {
    const result = await client.query<{
      relrowsecurity: boolean;
      policy_count: number;
    }>(
      `select c.relrowsecurity, count(p.polname)::int as policy_count from pg_class c join pg_namespace n on n.oid = c.relnamespace left join pg_policy p on p.polrelid = c.oid where n.nspname = 'ch' and c.relname = 'operational_record' group by c.relrowsecurity`,
    );
    expect(result.rows).toEqual([
      { relrowsecurity: true, policy_count: expect.any(Number) },
    ]);
    expect(result.rows[0]?.policy_count).toBeGreaterThan(0);
  });
  it('dado controles operacionais A e B quando principal A lê ou muta B então RLS não revela nem altera B', async () => {
    await expect(
      assertTableTenantIsolation(client, 'operational_record', fixture),
    ).resolves.toEqual({
      crossTenantRead: [],
      crossTenantMutation: [],
      ownerRead: [{ id: fixture.targetIdB }],
    });
  });
});
