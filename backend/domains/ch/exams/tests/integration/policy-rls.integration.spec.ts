import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  DETRAN_POLICY_MATRIX,
  isDetranActionAllowed,
  permissionsForRoles,
} from '../../../../shared/src/policy.js';
import { DETRAN_ROLES } from '../../../../shared/src/roles.js';
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
const operations = [
  'exam:read',
  'exam:list',
  'exam:create',
  'exam:update',
  'exam-result:write',
  'psych-instrument:read',
  'psych-instrument:create',
  'psych-instrument:update',
] as const;
function assertPolicy(resource: string, action: string) {
  const key = `ch:${resource}:${action}` as const;
  const grants = DETRAN_POLICY_MATRIX[key];
  expect(grants, `missing policy key ${key}`).toBeDefined();
  for (const role of DETRAN_ROLES) {
    const permissions = permissionsForRoles([role]);
    expect(
      isDetranActionAllowed(
        { roles: [role], permissions },
        `ch:${resource}`,
        action,
      ),
    ).toBe(
      Boolean(
        grants?.includes(role) ||
        (permissions.includes('*') && key !== 'ch:retention:review'),
      ),
    );
  }
}
beforeAll(async () => {
  await client.connect();
  fixture = await createRlsFixture(client, 'medical_exam');
});
afterAll(async () => {
  await removeRlsFixture(client, fixture);
  await client.end();
});
describe('exams PostgreSQL integration', () => {
  it('dado a matriz de exames quando cada papel canônico solicita trilhas médica ou psicológica então concede apenas grants explícitos ou globais', () => {
    for (const operation of operations) {
      const [resource, action] = operation.split(':');
      assertPolicy(resource, action);
    }
  });
  it('dado a tabela medical_exam quando a suíte clínica consulta o catálogo então RLS está habilitado', async () => {
    const result = await client.query<{ relrowsecurity: boolean }>(
      "select relrowsecurity from pg_class where oid = 'ch.medical_exam'::regclass",
    );
    expect(result.rows).toEqual([{ relrowsecurity: true }]);
  });
  it('dado exames médicos A e B quando principal A lê ou muta B então RLS não revela nem altera B', async () => {
    await expect(
      assertTableTenantIsolation(client, 'medical_exam', fixture),
    ).resolves.toEqual({
      crossTenantRead: [],
      crossTenantMutation: [],
      ownerRead: [{ id: fixture.targetIdB }],
    });
  });
});
