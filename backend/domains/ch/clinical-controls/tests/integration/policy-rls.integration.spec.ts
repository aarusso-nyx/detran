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
const operations = ['clinical-control:read', 'clinical-control:write'] as const;
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
  fixture = await createRlsFixture(client, 'clinical_control_event');
});
afterAll(async () => {
  await removeRlsFixture(client, fixture);
  await client.end();
});
describe('clinical-controls PostgreSQL integration', () => {
  it('dado a matriz de controles clínicos quando cada papel canônico solicita uma operação então concede apenas grants explícitos ou globais', () => {
    for (const operation of operations) {
      const [resource, action] = operation.split(':');
      assertPolicy(resource, action);
    }
  });
  it('dado uma autorização global quando revisão de retenção é solicitada então somente DPO é autorizado', () => {
    const supportPermissions = permissionsForRoles(['SUPORTE']);
    const dpoPermissions = permissionsForRoles(['DPO']);
    expect(supportPermissions).toContain('*');
    expect(
      isDetranActionAllowed(
        { roles: ['SUPORTE'], permissions: supportPermissions },
        'ch:retention',
        'review',
      ),
    ).toBe(false);
    expect(
      isDetranActionAllowed(
        { roles: ['DPO'], permissions: dpoPermissions },
        'ch:retention',
        'review',
      ),
    ).toBe(true);
  });
  it('dado a tabela clinical_control_event quando a suíte clínica consulta o catálogo então RLS está habilitado', async () => {
    const result = await client.query<{ relrowsecurity: boolean }>(
      "select relrowsecurity from pg_class where oid = 'ch.clinical_control_event'::regclass",
    );
    expect(result.rows).toEqual([{ relrowsecurity: true }]);
  });
  it('dado controles clínicos A e B quando principal A lê ou muta B então RLS não revela nem altera B', async () => {
    await expect(
      assertTableTenantIsolation(client, 'clinical_control_event', fixture),
    ).resolves.toEqual({
      crossTenantRead: [],
      crossTenantMutation: [],
      ownerRead: [{ id: fixture.targetIdB }],
    });
  });
});
