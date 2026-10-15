// Inspector — D-160 A160-02/03/05/06/07. This sensor never installs or repairs
// storage. Both URLs must identify the exclusive disposable R-0022 database.
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { renderOutboxStorage, verifyOutboxStorage } from '@stynx-nyx/outbox';
import {
  renderOfflineStorage,
  verifyOfflineStorage,
} from '@stynx-nyx/offline-sync';
import {
  ACTOR_A,
  ACTOR_B,
  TENANT_A,
  TENANT_B,
  seedIsolationTenants,
} from '../e2e/r22-sse-tenancy.support.js';

function required(name: string): string {
  const value = process.env[name];
  if (!value)
    throw new Error(`${name} is required; no default database is permitted`);
  return value;
}

let owner: pg.Client;
let restricted: pg.Client;
const binding = () => ({
  ownerRole: required('DETRAN_R22_STORAGE_OWNER_ROLE'),
  appRole: 'role_app_backend',
  readerRole: null,
  tenantTable: { schema: 'auth', table: 'tenants', column: 'id' },
});

async function inApp<T>(
  tenant: string | null,
  actor: string | null,
  work: () => Promise<T>,
): Promise<T> {
  await restricted.query('begin');
  try {
    await restricted.query('set local role role_app_backend');
    await restricted.query(
      "select set_config('app.tenant_id', $1, true), set_config('app.actor_id', $2, true)",
      [tenant ?? '', actor ?? ''],
    );
    return await work();
  } finally {
    await restricted.query('rollback');
  }
}

beforeAll(async () => {
  const ownerUrl = new URL(required('DETRAN_TEST_DATABASE_URL'));
  const restrictedUrl = new URL(required('DETRAN_R22_RESTRICTED_DATABASE_URL'));
  expect(ownerUrl.pathname).toMatch(/^\/detran_r22_adoption160_[0-9]+$/);
  expect(restrictedUrl.pathname).toBe(ownerUrl.pathname);
  expect(restrictedUrl.host).toBe(ownerUrl.host);
  expect(restrictedUrl.username).not.toBe(ownerUrl.username);
  owner = new pg.Client({ connectionString: ownerUrl.toString() });
  restricted = new pg.Client({ connectionString: restrictedUrl.toString() });
  await owner.connect();
  await restricted.connect();
  await seedIsolationTenants(owner);
});

afterAll(async () => {
  await restricted?.end();
  await owner?.end();
});

describe('D-160 — storage consumidor instalado, sem reparação pelo sensor', () => {
  for (const [name, render, verify] of [
    ['outbox', renderOutboxStorage, verifyOutboxStorage],
    ['offline', renderOfflineStorage, verifyOfflineStorage],
  ] as const) {
    it(`A160-03 dado storage ${name} 1.6.0 com auth.tenants quando verificado pelo owner em transação read-only então todos os checks passam`, async () => {
      const artifact = render(binding());
      expect(artifact.packageVersion).toBe('1.6.0');
      expect(artifact.binding).toEqual(binding());
      await owner.query('begin read only');
      try {
        const identity = (
          await owner.query(
            "select current_user::text as role, current_setting('transaction_read_only') as readonly",
          )
        ).rows[0];
        expect(identity).toEqual({ role: binding().ownerRole, readonly: 'on' });
        const report = await verify(owner, binding());
        const reportDirectory = process.env.DETRAN_R22_VERIFIER_REPORT_DIR;
        if (reportDirectory) {
          await mkdir(reportDirectory, { recursive: true });
          await writeFile(
            join(reportDirectory, `${name}-storage-verifier.json`),
            `${JSON.stringify(report, null, 2)}\n`,
          );
        }
        expect(report.packageVersion).toBe('1.6.0');
        expect(
          report.supported,
          JSON.stringify(
            report.checks.filter((check) => check.status !== 'pass'),
          ),
        ).toBe(true);
        expect(report.checks.length).toBeGreaterThan(0);
        expect(
          report.checks.filter((check) => check.status !== 'pass'),
        ).toEqual([]);
      } finally {
        await owner.query('rollback');
      }
    });
  }

  it('A160-05 dado login restrito direto quando SET ROLE na transação real então sessão e role não são owner/superuser/BYPASSRLS e tenant/ator são os do contexto', async () => {
    await inApp(TENANT_A, ACTOR_A, async () => {
      const live = (
        await restricted.query(
          `select session_user::text as session_user, current_user::text as current_user,
        current_setting('app.tenant_id', true) as tenant_id, current_setting('app.actor_id', true) as actor_id,
        r.rolsuper, r.rolbypassrls, r.rolcanlogin, r.rolinherit,
        s.rolsuper as session_super, s.rolbypassrls as session_bypass,
        pg_has_role(session_user, $1, 'MEMBER') as owner_membership
        from pg_roles r join pg_roles s on s.rolname = session_user where r.rolname = current_user`,
          [binding().ownerRole],
        )
      ).rows[0];
      expect(live).toEqual({
        session_user: decodeURIComponent(
          new URL(required('DETRAN_R22_RESTRICTED_DATABASE_URL')).username,
        ),
        current_user: 'role_app_backend',
        tenant_id: TENANT_A,
        actor_id: ACTOR_A,
        rolsuper: false,
        rolbypassrls: false,
        rolcanlogin: false,
        rolinherit: false,
        session_super: false,
        session_bypass: false,
        owner_membership: false,
      });
    });
  });

  it('A160-06 dado evento em B quando login restrito consulta/escreve por A e sem contexto então B é invisível e insert cruzado é recusado sem efeitos', async () => {
    const id = randomUUID();
    await owner.query(
      `insert into outbox.events (id, tenant_id, entity, entity_id, idempotency_key, payload, created_at)
      values ($1::uuid, $2::uuid, 'r22.test-only', $1::text, $1::text, '{}'::jsonb, '2026-09-14T12:00:00Z')`,
      [id, TENANT_B],
    );
    for (const [tenant, actor] of [
      [TENANT_A, ACTOR_A],
      [null, null],
    ] as const) {
      await inApp(tenant, actor, async () => {
        const rows = await restricted.query(
          'select id from outbox.events where id = $1',
          [id],
        );
        expect(rows.rows).toEqual([]);
      });
      await expect(
        inApp(tenant, actor, () =>
          restricted.query(
            `insert into outbox.events (id, tenant_id, entity, entity_id, idempotency_key, payload, created_at)
        values ($1::uuid, $2::uuid, 'r22.cross-denied', $1::text, $1::text, '{}'::jsonb, '2026-09-14T12:00:00Z')`,
            [randomUUID(), TENANT_B],
          ),
        ),
      ).rejects.toMatchObject({ code: '42501' });
    }
    await inApp(TENANT_B, ACTOR_B, async () => {
      expect(
        (
          await restricted.query('select id from outbox.events where id = $1', [
            id,
          ])
        ).rows,
      ).toEqual([{ id }]);
    });
    expect(
      (
        await owner.query(
          "select count(*)::int as n from outbox.events where entity = 'r22.cross-denied'",
        )
      ).rows[0].n,
    ).toBe(0);
  });

  it('A160-07 dado evento próprio imutável quando app tenta UPDATE ou DELETE com e sem contexto então a história permanece intacta', async () => {
    const id = randomUUID();
    await owner.query(
      `insert into outbox.events (id, tenant_id, entity, entity_id, idempotency_key, payload, created_at)
      values ($1::uuid, $2::uuid, 'r22.immutable', $1::text, $1::text, '{}'::jsonb, '2026-09-14T12:00:00Z')`,
      [id, TENANT_A],
    );
    for (const statement of [
      'update outbox.events set payload = \'{"changed":true}\'::jsonb where id = $1',
      'delete from outbox.events where id = $1',
    ]) {
      await expect(
        inApp(TENANT_A, ACTOR_A, () => restricted.query(statement, [id])),
      ).rejects.toMatchObject({
        code: expect.stringMatching(/^(42501|STY42)$/),
      });
      // Without context RLS may hide the row (zero effects), or column/table privileges reject before RLS.
      await inApp(null, null, async () => {
        try {
          expect((await restricted.query(statement, [id])).rowCount).toBe(0);
        } catch (error) {
          expect(error).toMatchObject({ code: '42501' });
        }
      });
    }
    expect(
      (
        await owner.query(
          'select tenant_id, payload from outbox.events where id = $1',
          [id],
        )
      ).rows,
    ).toEqual([{ tenant_id: TENANT_A, payload: {} }]);
  });
});
