import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  DETRAN_POLICY_MATRIX,
  DETRAN_ROLES,
  isDetranActionAllowed,
  permissionsForRoles,
  type DetranRole,
} from '@detran/shared';

const { Client } = pg;
const connectionString = process.env.DETRAN_TEST_DATABASE_URL;
const client = new Client({ connectionString });
const resource = 'retention';
const action = 'review';
const policyKey = `ch:${resource}:${action}`;
const grants = DETRAN_POLICY_MATRIX[policyKey] ?? [];
const hasGlobalGrant = (role: DetranRole) =>
  permissionsForRoles([role]).includes('*') &&
  policyKey !== 'ch:retention:review';
const denied = DETRAN_ROLES.filter(
  (role) => !grants.includes(role) && !hasGlobalGrant(role),
);

beforeAll(async () => client.connect());
afterAll(async () => client.end());

describe('retention integration', () => {
  it('dado uma disposição bloqueada quando cada papel canônico a revisa então somente DPO é autorizado', () => {
    expect(grants).toEqual(['DPO']);
    for (const role of grants) {
      expect(
        isDetranActionAllowed(
          { roles: [role], permissions: permissionsForRoles([role]) },
          `ch:${resource}`,
          action,
        ),
      ).toBe(true);
    }
    for (const role of DETRAN_ROLES.filter(hasGlobalGrant)) {
      expect(
        isDetranActionAllowed(
          { roles: [role], permissions: permissionsForRoles([role]) },
          `ch:${resource}`,
          action,
        ),
      ).toBe(false);
    }
    for (const role of denied) {
      expect(
        isDetranActionAllowed(
          { roles: [role], permissions: permissionsForRoles([role]) },
          `ch:${resource}`,
          action,
        ),
      ).toBe(false);
    }
  });

  it('dado disposições de retenção de tenants distintos quando o banco regulamentar as protege então a tabela mantém RLS', async () => {
    const result = await client.query<{
      relrowsecurity: boolean;
      policy_count: number;
    }>(
      `select c.relrowsecurity, count(p.polname)::int as policy_count
         from pg_class c join pg_namespace n on n.oid = c.relnamespace
         left join pg_policy p on p.polrelid = c.oid
        where n.nspname = 'ch' and c.relname = 'retention_disposition'
        group by c.relrowsecurity`,
    );
    expect(result.rows).toEqual([
      { relrowsecurity: true, policy_count: expect.any(Number) },
    ]);
    expect(result.rows[0]?.policy_count).toBeGreaterThan(0);
  });
});
