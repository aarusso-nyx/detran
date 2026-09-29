import { randomUUID } from 'node:crypto';

import pg from 'pg';
import { expect } from 'vitest';

const { Client } = pg;

export async function verifyClinicalTenantIsolation(
  connectionString: string | undefined,
): Promise<void> {
  const client = new Client({ connectionString });
  const tenantA = randomUUID();
  const tenantB = randomUUID();
  const clinicA = randomUUID();
  const clinicB = randomUUID();
  const userA = randomUUID();
  const userB = randomUUID();
  const patientA = randomUUID();
  const patientB = randomUUID();
  await client.connect();
  try {
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
    const rowsFor = async (id: string, mutate = false) => {
      await client.query('begin');
      try {
        await client.query('set local role role_app_backend');
        await client.query(`select set_config('app.tenant_id', $1, true)`, [
          tenantA,
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
    };
    await expect(rowsFor(patientA)).resolves.toHaveLength(1);
    await expect(rowsFor(patientB)).resolves.toHaveLength(0);
    await expect(rowsFor(patientA, true)).resolves.toHaveLength(1);
    await expect(rowsFor(patientB, true)).resolves.toHaveLength(0);
  } finally {
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
  }
}
