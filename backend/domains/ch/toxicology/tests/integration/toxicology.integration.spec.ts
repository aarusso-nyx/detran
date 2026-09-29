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
const client = new Client({
  connectionString: process.env.DETRAN_TEST_DATABASE_URL,
});
const resource = 'tox';
const action = 'write';
const policyKey = `ch:${resource}:${action}`;
const grants = DETRAN_POLICY_MATRIX[policyKey] ?? [];
const global = (role: DetranRole) => permissionsForRoles([role]).includes('*');
const denied = DETRAN_ROLES.filter(
  (role) => !grants.includes(role) && !global(role),
);
beforeAll(async () => client.connect());
afterAll(async () => client.end());

describe('toxicology integration', () => {
  it('dado callback toxicológico simulado quando cada papel canônico o escreve então aplica grants e nega todos os demais', () => {
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
  it('dado resultados toxicológicos de tenants distintos quando o banco regulamentar os protege então a tabela mantém RLS', async () => {
    const result = await client.query<{
      relrowsecurity: boolean;
      policy_count: number;
    }>(
      `select c.relrowsecurity, count(p.polname)::int as policy_count from pg_class c join pg_namespace n on n.oid = c.relnamespace left join pg_policy p on p.polrelid = c.oid where n.nspname = 'ch' and c.relname = 'periodic_toxicology_result' group by c.relrowsecurity`,
    );
    expect(result.rows).toEqual([
      { relrowsecurity: true, policy_count: expect.any(Number) },
    ]);
    expect(result.rows[0]?.policy_count).toBeGreaterThan(0);
  });
});
