import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { vi } from 'vitest';

/**
 * Harness de integração de `@detran/ops-snapshots` (R-0008, TASK-0006,
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
  vehicleId: '00000000-0000-7000-8000-0000ef600001',
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

export class SqlOpsRepository {
  constructor(
    private readonly db: ReturnType<typeof database>,
    private readonly table: string,
  ) {
    if (!/^ops\.[a-z_]+$/.test(table)) throw new Error(`Unsafe table ${table}`);
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
    vehicles: new SqlOpsRepository(db, 'ops.snapshots_vehicle'),
    persons: new SqlOpsRepository(db, 'ops.snapshots_person'),
    personDocuments: new SqlOpsRepository(db, 'ops.snapshots_person_document'),
    vehicleSnapshots: new SqlOpsRepository(
      db,
      'ops.snapshots_vehicle_snapshot',
    ),
    externalQueries: new SqlOpsRepository(db, 'ops.snapshots_external_query'),
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
    ports: {
      wsdenatranRead: {
        findVehicleByPlate: vi.fn(async () => undefined),
      },
      renach: {
        findDriverByCpf: vi.fn(async () => undefined),
        findDriverByLicense: vi.fn(async () => undefined),
      },
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

/** Tenant isolado por arquivo (`rait-test-strategy.md` §6). */
export async function isolatedTenant(
  client: pg.Client,
  slug: string,
): Promise<{ tenantId: string; actorId: string }> {
  const tenantId = randomUUID();
  const actorId = randomUUID();
  await client.query(`select set_config('app.role', 'owner', false)`);
  await client.query(
    `insert into auth.tenants (id, slug, name) values ($1, $2, $3)`,
    [
      tenantId,
      `${slug}-${tenantId.slice(0, 8)}`,
      `${slug} ${tenantId.slice(0, 8)}`,
    ],
  );
  await client.query(
    `insert into auth.users (id, tenant_id, email, display_name) values ($1, $2, $3, 'Actor')`,
    [actorId, tenantId, `${actorId}@test.invalid`],
  );
  await client.query(
    `insert into auth.memberships (tenant_id, user_id) values ($1, $2)
     on conflict (tenant_id, user_id) do update set is_active = true`,
    [tenantId, actorId],
  );
  return { tenantId, actorId };
}

export async function seedVehicle(
  client: pg.Client,
  tenantId: string,
  plate: string,
  makeModel: string,
): Promise<string> {
  const vehicleId = randomUUID();
  await client.query(`select set_config('app.role', 'owner', false)`);
  await client.query(`select set_config('app.tenant_id', $1, false)`, [
    tenantId,
  ]);
  await client.query(
    `insert into ops.snapshots_vehicle (id, tenant_id, plate, make_model, source)
     values ($1, $2, $3, $4, 'wsdenatran')`,
    [vehicleId, tenantId, plate, makeModel],
  );
  return vehicleId;
}

export async function dropTenant(
  client: pg.Client,
  tenantId: string,
): Promise<void> {
  await client.query(`select set_config('app.role', 'owner', false)`);
  for (const table of [
    'ops.snapshots_vehicle_snapshot',
    'ops.snapshots_external_query',
    'ops.snapshots_person_document',
    'ops.snapshots_person',
    'ops.snapshots_vehicle',
  ]) {
    await client.query(`delete from ${table} where tenant_id = $1`, [tenantId]);
  }
  await client.query('delete from auth.memberships where tenant_id = $1', [
    tenantId,
  ]);
  await client.query('delete from auth.users where tenant_id = $1', [tenantId]);
  await client.query('delete from auth.tenants where id = $1', [tenantId]);
}
