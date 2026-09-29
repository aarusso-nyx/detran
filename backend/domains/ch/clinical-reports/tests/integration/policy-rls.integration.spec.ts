import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  DETRAN_POLICY_MATRIX,
  isDetranActionAllowed,
  permissionsForRoles,
} from '../../../../shared/src/policy.js';
import { verifyClinicalTenantIsolation } from '../../../patients/tests/integration/tenant-rls-harness.js';
import { DETRAN_ROLES } from '../../../../shared/src/roles.js';

const { Client } = pg;
const client = new Client({
  connectionString: process.env.DETRAN_TEST_DATABASE_URL,
});
const operations = [
  'report:read',
  'report:create',
  'report:addendum-request',
  'report:addendum-approve-supervisor',
  'report:addendum-approve-clinic-admin',
  'report:addendum-sign',
  'report-addendum:read',
  'report-addendum-approval:read',
  'signature:apply',
  'signature:read',
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

beforeAll(async () => client.connect());
afterAll(async () => client.end());

describe('clinical-reports PostgreSQL integration', () => {
  it('dado a matriz de laudos quando cada papel canônico solicita laudo, adendo ou assinatura então concede apenas grants explícitos ou globais', () => {
    for (const operation of operations) {
      const [resource, action] = operation.split(':');
      assertPolicy(resource, action);
    }
  });

  it('dado a tabela report quando a suíte clínica consulta o catálogo então RLS está habilitado', async () => {
    const result = await client.query<{ relrowsecurity: boolean }>(
      "select relrowsecurity from pg_class where oid = 'ch.report'::regclass",
    );
    expect(result.rows).toEqual([{ relrowsecurity: true }]);
  });
  it('dado fixtures A e B quando principal A lê ou muta dado clínico B então RLS nega a operação', async () => {
    await verifyClinicalTenantIsolation(process.env.DETRAN_TEST_DATABASE_URL);
  });
});
