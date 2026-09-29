import { randomUUID } from 'node:crypto';

import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  DETRAN_POLICY_MATRIX,
  isDetranActionAllowed,
  permissionsForRoles,
} from '../../../../shared/src/policy.js';
import { DETRAN_ROLES, type DetranRole } from '../../../../shared/src/roles.js';

const { Client } = pg;
const connectionString = process.env.DETRAN_TEST_DATABASE_URL;
const client = new Client({ connectionString });
const tenantA = randomUUID();
const tenantB = randomUUID();
const clinicA = randomUUID();
const clinicB = randomUUID();
const userA = randomUUID();
const userB = randomUUID();
const patientA = randomUUID();
const patientB = randomUUID();
const operations = [
  'patient:read',
  'patient:list',
  'patient:create',
  'patient:update',
] as const;

function assertPolicy(resource: string, action: string) {
  const policyKey = `ch:${resource}:${action}` as const;
  const grants = DETRAN_POLICY_MATRIX[policyKey];
  expect(grants, `missing policy key ${policyKey}`).toBeDefined();
  const hasGlobalGrant = (role: DetranRole) =>
    permissionsForRoles([role]).includes('*') &&
    policyKey !== 'ch:retention:review';
  for (const role of DETRAN_ROLES) {
    const allowed = grants?.includes(role) || hasGlobalGrant(role);
    expect(
      isDetranActionAllowed(
        { roles: [role], permissions: permissionsForRoles([role]) },
        `ch:${resource}`,
        action,
      ),
    ).toBe(allowed);
  }
}

beforeAll(async () => {
  await client.connect();
  await client.query(`select set_config('app.role', 'owner', false)`);
  await client.query(
    'insert into auth.tenants (id, slug, name) values ($1, $2, $3), ($4, $5, $6)',
    [tenantA, `r31-${tenantA}`, 'R31 A', tenantB, `r31-${tenantB}`, 'R31 B'],
  );
  await client.query(
    'insert into auth.users (id, tenant_id, email, display_name) values ($1, $2, $3, $4), ($5, $6, $7, $8)',
    [
      userA,
      tenantA,
      `${userA}@detran.invalid`,
      'R31 A',
      userB,
      tenantB,
      `${userB}@detran.invalid`,
      'R31 B',
    ],
  );
  await client.query(
    "insert into ch.clinic (id, tenant_id, code, cnpj, name, region_code) values ($1, $2, $3, '00000000000000', 'R31 A', 'source_pending'), ($4, $5, $6, '00000000000000', 'R31 B', 'source_pending')",
    [clinicA, tenantA, `r31-${clinicA}`, clinicB, tenantB, `r31-${clinicB}`],
  );
  await client.query(
    "insert into ch.patient (id, tenant_id, clinic_id, user_id, national_id, name) values ($1, $2, $3, $4, '00000000001', 'Paciente A'), ($5, $6, $7, $8, '00000000002', 'Paciente B')",
    [patientA, tenantA, clinicA, userA, patientB, tenantB, clinicB, userB],
  );
});
afterAll(async () => {
  await client.query(
    'delete from ch.patient where tenant_id = any($1::uuid[])',
    [[tenantA, tenantB]],
  );
  await client.query('delete from ch.clinic where id = any($1::uuid[])', [
    [clinicA, clinicB],
  ]);
  await client.query('delete from auth.users where id = any($1::uuid[])', [
    [userA, userB],
  ]);
  await client.query('delete from auth.tenants where id = any($1::uuid[])', [
    [tenantA, tenantB],
  ]);
  await client.end();
});

async function rowsFor(tenantId: string, id: string, mutate = false) {
  await client.query('begin');
  try {
    await client.query('set local role role_app_backend');
    await client.query(`select set_config('app.tenant_id', $1, true)`, [
      tenantId,
    ]);
    const result = await client.query(
      mutate
        ? 'update ch.patient set name = name where id = $1 returning id'
        : 'select id from ch.patient where id = $1',
      [id],
    );
    await client.query('commit');
    return result.rows;
  } catch (error) {
    await client.query('rollback');
    throw error;
  }
}

describe('patients PostgreSQL integration', () => {
  it('dado a matriz de paciente quando cada papel canônico solicita uma operação então concede apenas grants explícitos ou globais', () => {
    for (const operation of operations) {
      const [resource, action] = operation.split(':');
      assertPolicy(resource, action);
    }
  });

  it('dado a tabela patient quando a suíte clínica consulta o catálogo então RLS está habilitado', async () => {
    const result = await client.query<{ relrowsecurity: boolean }>(
      "select relrowsecurity from pg_class where oid = 'ch.patient'::regclass",
    );
    expect(result.rows).toEqual([{ relrowsecurity: true }]);
  });

  it('dado pacientes dos tenants A e B quando principal A lê ou muta B então RLS não revela nem altera B', async () => {
    await expect(rowsFor(tenantA, patientA)).resolves.toHaveLength(1);
    await expect(rowsFor(tenantA, patientB)).resolves.toHaveLength(0);
    await expect(rowsFor(tenantA, patientA, true)).resolves.toHaveLength(1);
    await expect(rowsFor(tenantA, patientB, true)).resolves.toHaveLength(0);
  });
});
