import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { vi } from 'vitest';

/**
 * Harness de integração de `@detran/inf-normative` (R-0008, TASK-0006,
 * CTG-0003 §10). Não é um arquivo de teste. Padrão herdado de
 * `backend/domains/ops/offline-sync/tests/integration/harness.ts` (TASK-0004).
 */
const { Client } = pg;

export const CONNECTION_STRING =
  process.env.DETRAN_TEST_DATABASE_URL ??
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5432/detran';

export const FIXTURES = {
  tenantId: '00000000-0000-7000-8000-00000000a001',
  agencyId: '00000000-0000-7000-8000-0000e2000001',
  actorId: '00000000-0000-4000-8000-0000b0000001',
  catalogActive: '00000000-0000-7000-8000-0000e0000001',
  catalogDraft: '00000000-0000-7000-8000-0000e0000002',
  packagePublished: '00000000-0000-7000-8000-0000e7000001',
  packageDraft: '00000000-0000-7000-8000-0000e7000002',
} as const;

export const importModule = (specifier: string): Promise<unknown> =>
  import(/* @vite-ignore */ specifier);

export function newClient(): pg.Client {
  return new Client({ connectionString: CONNECTION_STRING });
}

export function database(
  client: pg.Client,
  tenantId: string,
  actorId: string,
): { tx<T>(work: (transaction: unknown) => Promise<T>): Promise<T> } {
  return {
    async tx<T>(work: (transaction: unknown) => Promise<T>): Promise<T> {
      await client.query('begin');
      try {
        await client.query('set local role role_app_backend');
        await client.query(`select set_config('app.tenant_id', $1, true)`, [
          tenantId,
        ]);
        await client.query(`select set_config('app.actor_id', $1, true)`, [
          actorId,
        ]);
        const result = await work({ query: client.query.bind(client) });
        await client.query('commit');
        return result;
      } catch (error) {
        await client.query('rollback');
        throw error;
      }
    },
  };
}

export function requestContext(tenantId: string, actorId: string) {
  return {
    hasActiveContext: () => true,
    snapshot: () => ({ tenantId, actorId }),
  };
}

interface SqlTransaction {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
}

export class SqlInfRepository {
  constructor(
    private readonly db: ReturnType<typeof database>,
    private readonly table: string,
  ) {
    if (!/^inf\.[a-z_]+$/.test(table)) throw new Error(`Unsafe table ${table}`);
  }

  list(): Promise<Record<string, unknown>[]> {
    return this.db.tx(
      async (tx) =>
        (
          await (tx as SqlTransaction).query(
            `select * from ${this.table} order by created_at desc`,
          )
        ).rows,
    );
  }

  find(id: string): Promise<Record<string, unknown> | undefined> {
    return this.db.tx(async (tx) => {
      const result = await (tx as SqlTransaction).query(
        `select * from ${this.table} where id = $1`,
        [id],
      );
      return result.rows[0];
    });
  }

  findOne(id: string): Promise<Record<string, unknown> | undefined> {
    return this.find(id);
  }
}

export function repositories(db: ReturnType<typeof database>) {
  return {
    catalogs: new SqlInfRepository(db, 'inf.normative_catalog'),
    framings: new SqlInfRepository(db, 'inf.normative_framing'),
    metrologicalTables: new SqlInfRepository(
      db,
      'inf.normative_metrological_table',
    ),
    validationRules: new SqlInfRepository(db, 'inf.normative_validation_rule'),
    documentTemplates: new SqlInfRepository(
      db,
      'inf.normative_document_template',
    ),
    agencyParameters: new SqlInfRepository(
      db,
      'inf.normative_agency_parameter',
    ),
    packages: new SqlInfRepository(db, 'inf.normative_mobile_package'),
  };
}

export function commandDeps(
  client: pg.Client,
  tenantId: string,
  actorId: string,
  overrides: Record<string, unknown> = {},
) {
  const db = database(client, tenantId, actorId);
  return {
    database: db,
    requestContext: requestContext(tenantId, actorId),
    repositories: repositories(db),
    packageSigner: {
      sign: vi.fn(async (manifestHash: string) => ({
        signature: `sha256-of-${manifestHash}`,
        signer: 'detran-backend-local',
        kind: 'local-unsigned' as const,
      })),
    },
    clock: { now: () => new Date().toISOString() },
    ...overrides,
  };
}

export async function runCommand(
  load: () => Promise<unknown>,
  label: string,
  exportNames: readonly string[],
  methodNames: readonly string[],
  dependencies: unknown,
  ...args: unknown[]
): Promise<Record<string, unknown>> {
  let loaded: Record<string, unknown>;
  try {
    loaded = (await load()) as Record<string, unknown>;
  } catch (cause) {
    throw new Error(`${label} ainda não existe (TASK-0007, CTG-0003 §11)`, {
      cause,
    });
  }
  const exported =
    exportNames
      .map((name) => loaded[name])
      .find((value) => typeof value === 'function') ??
    Object.values(loaded).find((value) => typeof value === 'function');
  if (typeof exported !== 'function')
    throw new Error(`${label} não exporta nada construtível`);
  const Command = exported as new (
    dependencies: unknown,
  ) => Record<string, unknown>;
  const instance = new Command(dependencies);
  const method = methodNames
    .map((name) => instance[name])
    .find((value) => typeof value === 'function');
  if (typeof method !== 'function')
    throw new Error(`${label} não expõe nenhum de ${methodNames.join('|')}`);
  return (await (method as (...values: unknown[]) => Promise<unknown>).call(
    instance,
    ...args,
  )) as Record<string, unknown>;
}

export async function outboxEnvelopes(
  client: pg.Client,
  tenantId: string,
  since: string,
): Promise<Record<string, unknown>[]> {
  await client.query(`select set_config('app.role', 'owner', false)`);
  const result = await client.query<{ payload: Record<string, unknown> }>(
    `select payload from integration.outbox
      where tenant_id = $1 and created_at >= $2
      order by created_at, id`,
    [tenantId, since],
  );
  return result.rows.map((row) => row.payload);
}

/** Restaura `inf.normative_catalog …e0000002` para `draft` após um teste que o publica. */
export async function resetDraftCatalog(client: pg.Client): Promise<void> {
  await client.query(`select set_config('app.role', 'owner', false)`);
  await client.query(
    `update inf.normative_catalog set status = 'draft', published_at = null
      where id = $1`,
    [FIXTURES.catalogDraft],
  );
}

/** Restaura `inf.normative_mobile_package …e7000002` para `draft` após publish/retire. */
export async function resetDraftPackage(client: pg.Client): Promise<void> {
  await client.query(`select set_config('app.role', 'owner', false)`);
  await client.query(
    `update inf.normative_mobile_package
        set status = 'draft', published_at = null, valid_until = null
      where id = $1`,
    [FIXTURES.packageDraft],
  );
}

export async function isolatedPackage(
  client: pg.Client,
  tenantId: string,
  catalogId: string,
  overrides: {
    status?: string;
    validUntil?: string | null;
  } = {},
): Promise<string> {
  const packageId = randomUUID();
  const status = overrides.status ?? 'published';
  const publishedAt = status === 'published' ? new Date().toISOString() : null;
  await client.query(`select set_config('app.role', 'owner', false)`);
  await client.query(`select set_config('app.tenant_id', $1, false)`, [
    tenantId,
  ]);
  await client.query(
    `insert into inf.normative_mobile_package
       (id, tenant_id, traffic_agency_id, catalog_id, package_version,
        manifest_hash, package_uri, status, published_at, valid_until)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      packageId,
      tenantId,
      '00000000-0000-7000-8000-0000e2000001',
      catalogId,
      `test-${packageId.slice(0, 8)}`,
      'sha256:isolated-package-hash',
      `/v1/inf/normative/mobile-packages/${packageId}/content`,
      status,
      publishedAt,
      overrides.validUntil ?? null,
    ],
  );
  return packageId;
}
