import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  DEVICE_A,
  DEVICE_KEY_A,
  DEVICE_KEY_B,
  GRANT_A,
  PACKAGE_A,
  TENANT_A,
  TENANT_B,
  ownerClient,
  tenantClient,
} from './harness.js';

const RECEIPT_A = '00000000-0000-7000-8000-0000a5010001';
const RECEIPT_B = '00000000-0000-7000-8000-0000a5010002';
const IDEMPOTENCY_KEY = 'r13-ops-provisioning-concurrent-receipt';

let tenantA: Awaited<ReturnType<typeof tenantClient>>;
let tenantB: Awaited<ReturnType<typeof tenantClient>>;
let owner: Awaited<ReturnType<typeof ownerClient>>;

beforeAll(async () => {
  tenantA = await tenantClient(TENANT_A);
  tenantB = await tenantClient(TENANT_B);
  owner = await ownerClient();
});

afterAll(async () => {
  await owner?.query(
    'delete from ops.provisioning_receipt where id = any($1::uuid[])',
    [[RECEIPT_A, RECEIPT_B]],
  );
  await Promise.all([tenantA?.end(), tenantB?.end(), owner?.end()]);
});

describe('R-0013 CTG-0003 — PostgreSQL provisioning', () => {
  it('dada chave de dispositivo de cada tenant quando leitura cruza o tenant então RLS devolve somente o registro do tenant corrente', async () => {
    const own = await tenantA.query(
      'select id from ops.device_key where id = $1',
      [DEVICE_KEY_A],
    );
    const foreign = await tenantA.query(
      'select id from ops.device_key where id = $1',
      [DEVICE_KEY_B],
    );
    const ownB = await tenantB.query(
      'select id from ops.device_key where id = $1',
      [DEVICE_KEY_B],
    );

    expect(own.rowCount).toBe(1);
    expect(foreign.rowCount).toBe(0);
    expect(ownB.rowCount).toBe(1);
  });

  it('dado retry concorrente do mesmo receipt quando ambas transações gravam então somente uma idempotency_key é aceita', async () => {
    const concurrent = await tenantClient(TENANT_A);
    const pids = await Promise.all([
      tenantA.query('select pg_backend_pid() pid'),
      concurrent.query('select pg_backend_pid() pid'),
    ]);
    expect(pids[0].rows[0].pid).not.toBe(pids[1].rows[0].pid);
    const insert = (client: typeof tenantA, id: string) =>
      client.query(
        `insert into ops.provisioning_receipt (
           id, tenant_id, package_id, grant_id, device_id, receipt_type,
           idempotency_key, manifest_digest, occurred_at
         ) values ($1, $2, $3, $4, $5, 'installed', $6, 'fixture-package-digest-a', now())`,
        [id, TENANT_A, PACKAGE_A, GRANT_A, DEVICE_A, IDEMPOTENCY_KEY],
      );

    const results = await Promise.allSettled([
      insert(tenantA, RECEIPT_A),
      insert(concurrent, RECEIPT_B),
    ]);
    await concurrent.end();

    expect(
      results.filter((result) => result.status === 'fulfilled'),
    ).toHaveLength(1);
    expect(
      results.filter((result) => result.status === 'rejected'),
    ).toHaveLength(1);
    const rejection = results.find(
      (result) => result.status === 'rejected',
    ) as PromiseRejectedResult;
    expect(rejection.reason).toMatchObject({ code: '23505' });
    expect(
      (
        await tenantA.query(
          'select count(*)::int n from ops.provisioning_receipt where idempotency_key=$1',
          [IDEMPOTENCY_KEY],
        )
      ).rows,
    ).toEqual([{ n: 1 }]);
  });

  it('dado receipt e revogação aplicados quando role_app_backend tenta mutá-los então ambos permanecem append-only', async () => {
    const privileges = await owner.query(`select tablename,
      has_table_privilege('role_app_backend', 'ops.' || tablename, 'SELECT') as can_select,
      has_table_privilege('role_app_backend', 'ops.' || tablename, 'INSERT') as can_insert,
      has_table_privilege('role_app_backend', 'ops.' || tablename, 'UPDATE') as can_update,
      has_table_privilege('role_app_backend', 'ops.' || tablename, 'DELETE') as can_delete
      from pg_tables where schemaname='ops' and tablename in ('provisioning_receipt','device_revocation') order by tablename`);
    expect(privileges.rows).toEqual(
      ['device_revocation', 'provisioning_receipt'].map((tablename) => ({
        tablename,
        can_select: true,
        can_insert: true,
        can_update: false,
        can_delete: false,
      })),
    );
    await expect(
      tenantA.query(
        'update ops.provisioning_receipt set manifest_digest = $2 where id = $1',
        [RECEIPT_A, 'tampered'],
      ),
    ).rejects.toMatchObject({ code: '42501' });
    await expect(
      tenantA.query('delete from ops.provisioning_receipt where id = $1', [
        RECEIPT_A,
      ]),
    ).rejects.toMatchObject({ code: '42501' });
    await expect(
      tenantA.query(
        'update ops.device_revocation set reason_code = $2 where tenant_id = $1',
        [TENANT_A, 'tampered'],
      ),
    ).rejects.toMatchObject({ code: '42501' });
    await expect(
      tenantA.query('delete from ops.device_revocation where tenant_id = $1', [
        TENANT_A,
      ]),
    ).rejects.toMatchObject({ code: '42501' });
  });
});
