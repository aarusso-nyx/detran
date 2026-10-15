// Inspector — D-160.8/.9/.11. Only a fresh exclusive, explicitly leased DB.
import { spawn } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Test } from '@nestjs/testing';
import { Database, StynxDataModule } from '@stynx-nyx/data';
import { OutboxService } from '@stynx-nyx/outbox';
import {
  ACTOR_A,
  ACTOR_B,
  TENANT_A,
  TENANT_B,
  seedIsolationTenants,
} from '../e2e/r22-sse-tenancy.support.js';

interface PlanPackage {
  metadata: { package: string; [key: string]: unknown };
  objectsSql: string;
  roleBindingsSql: string;
}
interface Plan {
  version: number;
  packages: PlanPackage[];
}
interface Report {
  supported: boolean;
  checks: Array<{ status: string }>;
}
interface Installer {
  createStorageInstallPlan(root: string): Plan;
  inspectStorageInstallation(
    client: pg.Client,
    plan: Plan,
  ): Promise<'fresh' | 'repeat'>;
  verifyInstalledStorage(
    client: pg.Client,
    root: string,
    plan: Plan,
  ): Promise<Report[]>;
}
interface LedgerRow {
  package: string;
  identity: Record<string, unknown>;
  installed_by: string;
  installed_at: Date;
}
const repo = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../..',
);
const ledger = 'integration.stynx_storage_installations';
const guard = 'integration.stynx_storage_installations_immutable()';
function manifestDigest(value: unknown): string {
  return createHash('sha256')
    .update(
      JSON.stringify(value, (_key, item: unknown) => {
        if (item === null || typeof item !== 'object' || Array.isArray(item))
          return item;
        return Object.fromEntries(
          Object.entries(item).sort(([left], [right]) =>
            left < right ? -1 : left > right ? 1 : 0,
          ),
        );
      }),
    )
    .digest('hex');
}
let owner: pg.Client;
let restricted: pg.Client;
let ownerUrl: URL;
let restrictedUrl: URL;
let api: Installer;
let plan: Plan;
let outputDirectory: string;
let baselineLedger: LedgerRow[];

function required(name: string): string {
  const value = process.env[name];
  if (!value)
    throw new Error(`${name} required; database defaults are forbidden`);
  return value;
}

beforeAll(async () => {
  ownerUrl = new URL(required('DETRAN_R22_INSTALL_DATABASE_URL'));
  restrictedUrl = new URL(
    required('DETRAN_R22_INSTALL_RESTRICTED_DATABASE_URL'),
  );
  expect(ownerUrl.pathname).toMatch(/^\/detran_r22_install160_[0-9]+$/);
  expect(ownerUrl.username).toBe('postgres');
  expect(restrictedUrl.host).toBe(ownerUrl.host);
  expect(restrictedUrl.pathname).toBe(ownerUrl.pathname);
  expect(restrictedUrl.username).not.toBe(ownerUrl.username);
  expect(ownerUrl.search).toBe('');
  expect(restrictedUrl.search).toBe('');
  outputDirectory = path.join(
    repo,
    'scratch/r22-adoption-160/inspector',
    ownerUrl.pathname.slice(1),
  );
  await mkdir(outputDirectory, { recursive: true });
  api = (await import(
    pathToFileURL(path.join(repo, 'tools/stynx-storage-install.mjs')).href
  )) as Installer;
  plan = api.createStorageInstallPlan(repo);
  owner = new pg.Client({ connectionString: ownerUrl.toString() });
  restricted = new pg.Client({ connectionString: restrictedUrl.toString() });
  await owner.connect();
  await restricted.connect();
});

afterAll(async () => {
  await restricted?.end();
  await owner?.end();
});

async function save(name: string, value: unknown) {
  await writeFile(
    path.join(outputDirectory, name),
    typeof value === 'string' ? value : `${JSON.stringify(value, null, 2)}\n`,
  );
}

async function apply(
  label: string,
): Promise<{ code: number | null; output: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(
      'bash',
      [path.join(repo, 'backend/database/apply.sh')],
      {
        cwd: repo,
        env: {
          ...process.env,
          DB_NAME: ownerUrl.pathname.slice(1),
          DB_HOST: ownerUrl.hostname,
          DB_PORT: ownerUrl.port || '5432',
          DB_USER: decodeURIComponent(ownerUrl.username),
          DB_PASSWORD: decodeURIComponent(ownerUrl.password),
        },
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    );
    let output = '';
    child.stdout.on('data', (bytes: Buffer) => {
      output += bytes.toString();
    });
    child.stderr.on('data', (bytes: Buffer) => {
      output += bytes.toString();
    });
    const timeout = setTimeout(() => child.kill('SIGTERM'), 120_000);
    child.once('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.once('close', (code) => {
      clearTimeout(timeout);
      output = output
        .replaceAll(ownerUrl.toString(), '<exclusive-owner>')
        .replaceAll(restrictedUrl.toString(), '<restricted-login>');
      save(`${label}.log`, output).then(
        () => resolve({ code, output }),
        reject,
      );
    });
  });
}

async function readOnly<T>(work: () => Promise<T>): Promise<T> {
  await owner.query('BEGIN READ ONLY');
  try {
    const mode = (
      await owner.query(
        "SELECT current_setting('transaction_read_only') AS readonly, current_setting('row_security') AS rls",
      )
    ).rows[0];
    expect(mode).toEqual({ readonly: 'on', rls: 'on' });
    return await work();
  } finally {
    await owner.query('ROLLBACK');
  }
}

async function verify(label: string) {
  const reports = await readOnly(() =>
    api.verifyInstalledStorage(owner, repo, plan),
  );
  expect(reports).toHaveLength(2);
  for (const report of reports) {
    expect(report.supported).toBe(true);
    expect(report.checks.length).toBeGreaterThan(0);
    expect(report.checks.every((check) => check.status === 'pass')).toBe(true);
  }
  await save(`${label}-verifiers.json`, reports);
}

async function snapshot() {
  const result: Array<{
    table: string;
    kind: 'table' | 'sequence';
    count: number;
    sha256: string;
  }> = [];
  const tables = plan.packages.flatMap((item, index) => {
    const manifest = item.metadata.manifest as {
      catalog: Array<{ kind: string; name: string; value?: { kind?: string } }>;
    };
    return manifest.catalog
      .filter((entry) => entry.kind === 'relation' && entry.value?.kind === 'r')
      .map((entry) => `${index === 0 ? 'outbox' : 'offline'}.${entry.name}`);
  });
  tables.push(ledger);
  for (const table of tables.sort()) {
    expect(table).toMatch(/^[a-z_]+\.[a-z_]+$/);
    const row = (
      await owner.query(
        `SELECT count(*)::integer AS count, coalesce(jsonb_agg(to_jsonb(t) ORDER BY to_jsonb(t)::text),'[]'::jsonb) AS rows FROM ${table} t`,
      )
    ).rows[0];
    result.push({
      table,
      kind: 'table',
      count: row.count as number,
      sha256: createHash('sha256')
        .update(JSON.stringify(row.rows))
        .digest('hex'),
    });
  }
  for (const [index, item] of plan.packages.entries()) {
    const manifest = item.metadata.manifest as {
      catalog: Array<{ kind: string; name: string }>;
    };
    for (const entry of manifest.catalog.filter(
      (entry) => entry.kind === 'sequence',
    )) {
      const table = `${index === 0 ? 'outbox' : 'offline'}.${entry.name}`;
      expect(table).toMatch(/^[a-z_]+\.[a-z_]+$/);
      const state = (
        await owner.query(`SELECT last_value::text,is_called FROM ${table}`)
      ).rows;
      result.push({
        table,
        kind: 'sequence',
        count: state.length,
        sha256: createHash('sha256')
          .update(JSON.stringify(state))
          .digest('hex'),
      });
    }
  }
  return result;
}

async function rollbackFixture(work: () => Promise<void>) {
  const before = await snapshot();
  await owner.query('BEGIN');
  try {
    await work();
  } finally {
    await owner.query('ROLLBACK');
  }
  expect(await snapshot()).toEqual(before);
}

async function forgeLedger(mutate: (rows: LedgerRow[]) => LedgerRow[]) {
  const rows = mutate(structuredClone(baselineLedger));
  // This replacement exists only inside an owner transaction that always rolls back.
  await owner.query(`DROP TABLE ${ledger}; DROP FUNCTION ${guard}`);
  await owner.query(
    await readFile(
      path.join(repo, 'backend/database/ddl/19-stynx-storage-ledger.sql'),
      'utf8',
    ),
  );
  for (const row of rows)
    await owner.query(
      `INSERT INTO ${ledger}(package,identity,installed_by,installed_at) VALUES($1,$2::jsonb,$3,$4)`,
      [
        row.package,
        JSON.stringify(row.identity),
        row.installed_by,
        row.installed_at,
      ],
    );
}

describe.sequential(
  'R-0022 installed storage fresh-once and same-artifact replay',
  () => {
    it('rolls back both packages and ledger when the second package fails', async () => {
      expect(
        (
          await owner.query(
            "SELECT count(*)::integer AS count FROM pg_namespace WHERE nspname IN ('outbox','offline','integration')",
          )
        ).rows[0].count,
      ).toBe(0);
      expect(
        await readOnly(() => api.inspectStorageInstallation(owner, plan)),
      ).toBe('fresh');
      await owner.query(`CREATE FUNCTION public.r22_install_failure() RETURNS event_trigger LANGUAGE plpgsql AS $fixture$
      DECLARE item record; BEGIN
        FOR item IN SELECT * FROM pg_event_trigger_ddl_commands() LOOP
          IF item.schema_name='offline' AND item.command_tag='CREATE TABLE' THEN
            RAISE EXCEPTION 'R22_INJECTED_SECOND_PACKAGE_FAILURE';
          END IF;
        END LOOP;
      END $fixture$;
      CREATE EVENT TRIGGER r22_install_failure ON ddl_command_end WHEN TAG IN ('CREATE TABLE') EXECUTE FUNCTION public.r22_install_failure();`);
      try {
        const failed = await apply('01-injected-failure');
        expect(failed.code, failed.output).not.toBe(0);
        expect(failed.output).toContain('R22_INJECTED_SECOND_PACKAGE_FAILURE');
        expect(
          (
            await owner.query(
              "SELECT count(*)::integer AS count FROM pg_namespace WHERE nspname IN ('outbox','offline','integration')",
            )
          ).rows[0].count,
        ).toBe(0);
        expect(
          await readOnly(() => api.inspectStorageInstallation(owner, plan)),
        ).toBe('fresh');
      } finally {
        await owner.query(
          'DROP EVENT TRIGGER r22_install_failure; DROP FUNCTION public.r22_install_failure()',
        );
      }
    }, 120_000);

    it('recovers with normal fresh apply, real read-only verifiers and exact owner ledger', async () => {
      const result = await apply('02-fresh-recovery');
      expect(result.code, result.output).toBe(0);
      await verify('fresh');
      expect(
        await readOnly(() => api.inspectStorageInstallation(owner, plan)),
      ).toBe('repeat');
      baselineLedger = (
        await owner.query(`SELECT * FROM ${ledger} ORDER BY package`)
      ).rows as LedgerRow[];
      expect(baselineLedger).toHaveLength(2);
      for (const row of baselineLedger) {
        const item = plan.packages.find(
          (item) => item.metadata.package === row.package,
        )!;
        expect(row.installed_by).toBe('postgres');
        expect(row.installed_at).toBeInstanceOf(Date);
        expect(row.identity).toEqual({
          ...item.metadata,
          sourceManifestSha256: manifestDigest(item.metadata.manifest),
        });
      }
      const initial = await snapshot();
      // Canonical objectsSql initializes a singleton ownership marker; it is not
      // business history and must remain exactly LEGACY/generation0 on fresh install.
      expect(
        (await owner.query('SELECT * FROM outbox.legacy_ownership')).rows,
      ).toEqual([{ id: true, state: 'LEGACY', generation: '0' }]);
      expect(
        initial
          .filter(
            (item) =>
              item.table !== ledger &&
              item.table !== 'outbox.legacy_ownership' &&
              item.kind === 'table',
          )
          .every((item) => item.count === 0),
      ).toBe(true);
      await save('fresh-zero-history.json', initial);
      const security = (
        await owner.query(
          `SELECT relrowsecurity AS rls, relforcerowsecurity AS force, pg_get_userbyid(relowner) AS owner,
      (SELECT count(*)::integer FROM pg_policy WHERE polrelid=c.oid) AS policies FROM pg_class c WHERE oid=$1::regclass`,
          [ledger],
        )
      ).rows[0];
      expect(security).toEqual({
        rls: true,
        force: true,
        owner: 'postgres',
        policies: 0,
      });
    }, 120_000);

    it('preserves actual tenant A/B history and original receipts through concurrent normal repeats', async () => {
      await seedIsolationTenants(owner);
      const appUrl = new URL(restrictedUrl);
      appUrl.searchParams.set('options', '-c role=role_app_backend');
      const module = await Test.createTestingModule({
        imports: [
          StynxDataModule.forRoot({
            appRoleName: 'role_app_backend',
            migrations: { enabled: false },
            connections: {
              owner: { connectionString: ownerUrl.toString() },
              app: { connectionString: appUrl.toString() },
              reader: { connectionString: appUrl.toString() },
            },
          }),
        ],
      }).compile();
      await module.init();
      try {
        const database = module.get(Database);
        const outbox = new OutboxService(database, {
          storageMode: 'consumer-owned',
          dispatchableEntities: { entities: ['r22.install.fixture'] },
        });
        for (const [tenant, actor] of [
          [TENANT_A, ACTOR_A],
          [TENANT_B, ACTOR_B],
        ]) {
          await database.withRequestContext(
            { tenantId: tenant, actorId: actor },
            () =>
              database.tx(
                async (tx) => {
                  const identity = (
                    await tx.query(
                      "SELECT session_user::text AS login,current_user::text AS role,current_setting('app.tenant_id') AS tenant,current_setting('app.actor_id') AS actor",
                    )
                  ).rows[0];
                  expect(identity).toEqual({
                    login: restrictedUrl.username,
                    role: 'role_app_backend',
                    tenant,
                    actor,
                  });
                  const event = await outbox.appendInTransaction(tx, {
                    entity: 'r22.install.fixture',
                    entityId: randomUUID(),
                    idempotencyKey: randomUUID(),
                    payload: {
                      tenant,
                      text: 'preserve bytes ç ñ',
                      nested: { version: 1 },
                    },
                    metadata: { fixture: 'installer history' },
                  });
                  expect(event.tenantId).toBe(tenant);
                  await tx.query(
                    "INSERT INTO offline.numbering_ranges(tenant_id,org_unit_id,entity_type,series,start_number,end_number,next_number) VALUES($1,'installer-unit','AIT',$2,1,10,3)",
                    [tenant, randomUUID()],
                  );
                },
                { role: 'app', requireActor: true },
              ),
          );
        }
      } finally {
        await module.close();
      }
      await verify('populated-before-repeat');
      const before = await snapshot();
      await save('populated-before.json', before);
      let complete = false;
      const both = Promise.all([
        apply('03-repeat-a'),
        apply('04-repeat-b'),
      ]).finally(() => {
        complete = true;
      });
      const locks: unknown[] = [];
      while (!complete) {
        locks.push(
          ...(
            await owner.query(`SELECT l.pid,d.datname,l.classid::integer,l.objid::integer,l.granted FROM pg_locks l JOIN pg_database d ON d.oid=l.database
        WHERE l.locktype='advisory' AND l.classid=7007 AND l.objid IN (1,1600)`)
          ).rows,
        );
        await delay(50);
      }
      const results = await both;
      for (const result of results) expect(result.code, result.output).toBe(0);
      expect(locks).toContainEqual(
        expect.objectContaining({
          datname: 'postgres',
          classid: 7007,
          objid: 1600,
          granted: true,
        }),
      );
      expect(locks).toContainEqual(
        expect.objectContaining({
          datname: 'postgres',
          classid: 7007,
          objid: 1600,
          granted: false,
        }),
      );
      expect(locks).toContainEqual(
        expect.objectContaining({
          datname: ownerUrl.pathname.slice(1),
          classid: 7007,
          objid: 1,
          granted: true,
        }),
      );
      await save('concurrent-lock-observations.json', locks);
      const after = await snapshot();
      await save('populated-after.json', after);
      expect(after).toEqual(before);
      expect(
        (await owner.query(`SELECT * FROM ${ledger} ORDER BY package`)).rows,
      ).toEqual(baselineLedger);
      // Canonical objectsSql contains a non-reentrant ADD COLUMN. Successful repeated
      // apply plus unchanged history independently witnesses the bindings-only branch.
      expect(plan.packages[1].objectsSql).toContain('ADD COLUMN identity_mode');
      await verify('populated-repeat');
    }, 180_000);

    it('keeps installation evidence immutable for owner and inaccessible to the request role', async () => {
      for (const sql of [
        `UPDATE ${ledger} SET installed_at=installed_at`,
        `DELETE FROM ${ledger}`,
        `TRUNCATE ${ledger}`,
      ]) {
        await owner.query('BEGIN');
        try {
          await expect(owner.query(sql)).rejects.toThrow(/immutable/);
        } finally {
          await owner.query('ROLLBACK');
        }
      }
      for (const sql of [
        `SELECT * FROM ${ledger}`,
        `UPDATE ${ledger} SET installed_at=installed_at`,
        `DELETE FROM ${ledger}`,
        `TRUNCATE ${ledger}`,
      ]) {
        await restricted.query('BEGIN');
        try {
          await restricted.query('SET LOCAL ROLE role_app_backend');
          await expect(restricted.query(sql)).rejects.toMatchObject({
            code: '42501',
          });
        } finally {
          await restricted.query('ROLLBACK');
        }
      }
      const effective = (
        await owner.query(
          `SELECT rolname,has_table_privilege(oid,$1,'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER') AS allowed FROM pg_roles WHERE rolname IN ('role_app_backend','role_auditor_min')`,
          [ledger],
        )
      ).rows;
      expect(effective).toHaveLength(2);
      expect(effective.every((row) => row.allowed === false)).toBe(true);
      expect(
        (await owner.query(`SELECT * FROM ${ledger} ORDER BY package`)).rows,
      ).toEqual(baselineLedger);
    });

    it('refuses writable verification and direct restricted maintenance admission', async () => {
      await owner.query('BEGIN');
      try {
        await expect(
          api.verifyInstalledStorage(owner, repo, plan),
        ).rejects.toThrow(/STOP/);
      } finally {
        await owner.query('ROLLBACK');
      }
      await restricted.query('BEGIN READ ONLY');
      try {
        await restricted.query('SET LOCAL ROLE role_app_backend');
        await expect(
          api.inspectStorageInstallation(restricted, plan),
        ).rejects.toThrow(/real postgres owner/);
      } finally {
        await restricted.query('ROLLBACK');
      }
      await verify('after-negative-admission');
    });

    const mutations: Array<[string, () => Promise<void>]> = [
      [
        'unledgered existing storage',
        async () => {
          await owner.query(`DROP TABLE ${ledger}; DROP FUNCTION ${guard}`);
        },
      ],
      [
        'partial group',
        async () => {
          await forgeLedger((rows) => rows.slice(0, 1));
        },
      ],
      [
        'digest mismatch',
        async () => {
          await forgeLedger((rows) => {
            rows[0].identity.sha256 = '0'.repeat(64);
            return rows;
          });
        },
      ],
      [
        'prior version',
        async () => {
          await forgeLedger((rows) => {
            rows[0].identity.packageVersion = '1.5.0';
            return rows;
          });
        },
      ],
      [
        'binding mismatch',
        async () => {
          await forgeLedger((rows) => {
            (rows[0].identity.binding as Record<string, unknown>).appRole =
              'postgres';
            return rows;
          });
        },
      ],
      [
        'ledger owner',
        async () => {
          await owner.query(`ALTER TABLE ${ledger} OWNER TO role_app_backend`);
        },
      ],
      [
        'ledger privilege',
        async () => {
          await owner.query(`GRANT SELECT ON ${ledger} TO role_app_backend`);
        },
      ],
      [
        'ledger definition',
        async () => {
          await owner.query(
            `ALTER TABLE ${ledger} ADD COLUMN inspector_extra text`,
          );
        },
      ],
      [
        'ledger guard definition',
        async () => {
          await owner.query(
            `CREATE OR REPLACE FUNCTION ${guard} RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog AS $changed$ BEGIN RAISE EXCEPTION 'changed immutable guard'; END $changed$`,
          );
        },
      ],
    ];
    it.each(mutations)(
      'refuses %s without changing committed history',
      async (_label, mutate) => {
        await rollbackFixture(async () => {
          await mutate();
          await expect(
            api.inspectStorageInstallation(owner, plan),
          ).rejects.toThrow(/STYNX/);
        });
      },
    );
  },
);
