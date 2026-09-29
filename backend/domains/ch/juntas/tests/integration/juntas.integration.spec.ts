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
const resource = 'junta';
const action = 'decide';
const policyKey = `ch:${resource}:${action}`;
const grants = DETRAN_POLICY_MATRIX[policyKey] ?? [];
const hasGlobalGrant = (role: DetranRole) =>
  permissionsForRoles([role]).includes('*');
const denied = DETRAN_ROLES.filter(
  (role) => !grants.includes(role) && !hasGlobalGrant(role),
);

beforeAll(async () => client.connect());
afterAll(async () => client.end());

describe('juntas integration', () => {
  it('dado a decisão de junta quando cada papel canônico a solicita então aplica a política e nega os demais', () => {
    expect(grants).not.toEqual([]);
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
      ).toBe(true);
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

  it('dado casos de juntas de tenants distintos quando o banco regulamentar os protege então a tabela mantém RLS', async () => {
    const result = await client.query<{
      relrowsecurity: boolean;
      policy_count: number;
    }>(
      `select c.relrowsecurity, count(p.polname)::int as policy_count
         from pg_class c
         join pg_namespace n on n.oid = c.relnamespace
         left join pg_policy p on p.polrelid = c.oid
        where n.nspname = 'ch' and c.relname = 'junta_case'
        group by c.relrowsecurity`,
    );
    expect(result.rows).toEqual([
      { relrowsecurity: true, policy_count: expect.any(Number) },
    ]);
    expect(result.rows[0]?.policy_count).toBeGreaterThan(0);
  });
});
