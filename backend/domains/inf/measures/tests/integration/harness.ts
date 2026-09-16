import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { vi } from 'vitest';

/**
 * Harness de integração de `@detran/inf-measures` (R-0008, TASK-0008,
 * CTG-0004 §11). Não é um arquivo de teste: `vitest.config.ts` inclui só
 * `tests/integration/**\/*.integration.spec.ts`. Padrão herdado de
 * `backend/domains/ops/evidence/tests/integration/harness.ts` (TASK-0006).
 */
const { Client } = pg;

export const CONNECTION_STRING =
  process.env.DETRAN_TEST_DATABASE_URL ??
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5432/detran';

/** Tenant e ids canônicos de `28-fixtures-teat-measures-alcohol.sql`. */
export const FIXTURES = {
  tenantId: '00000000-0000-7000-8000-00000000a001',
  agencyId: '00000000-0000-7000-8000-0000e2000001',
  actorId: '00000000-0000-4000-8000-0000b0000001',
  shiftId: '00000000-0000-7000-8000-0000e3000001',
  deviceId: '00000000-0000-7000-8000-0000e4000002',
  aitIntegrado: '00000000-0000-7000-8000-0000f0000001',
  measureTypeRetencao: '00000000-0000-7000-8000-0000ec000001',
  measureRetido: '00000000-0000-7000-8000-0000ed000001',
  measureLiberadoComPrazo: '00000000-0000-7000-8000-0000ed000003',
  /** `ops.snapshots_vehicle` de `27-fixtures-teat-evidence.sql` — FK-only, sem tenant a checar. */
  vehicleSnapshotId: '00000000-0000-7000-8000-0000ef600001',
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

  create(values: Record<string, unknown>): Promise<Record<string, unknown>> {
    const entries = Object.entries(values);
    const columns = entries.map(([key]) => key);
    if (columns.some((key) => !/^[a-z_]+$/.test(key)))
      throw new Error('Invalid inf write field');
    const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
    return this.db.tx(async (tx) => {
      const result = await (tx as SqlTransaction).query(
        `insert into ${this.table} (${columns.join(', ')}) values (${placeholders}) returning *`,
        entries.map(([, value]) => value),
      );
      return result.rows[0] as Record<string, unknown>;
    });
  }

  update(
    id: string,
    patch: Record<string, unknown>,
  ): Promise<Record<string, unknown> | undefined> {
    const entries = Object.entries(patch);
    const assignments = entries
      .map(([key], index) => `${key} = $${index + 2}`)
      .join(', ');
    return this.db.tx(async (tx) => {
      const result = await (tx as SqlTransaction).query(
        `update ${this.table} set ${assignments} where id = $1 returning *`,
        [id, ...entries.map(([, value]) => value)],
      );
      return result.rows[0];
    });
  }
}

export function repositories(db: ReturnType<typeof database>) {
  return {
    measures: new SqlInfRepository(db, 'inf.administrative_measure'),
    terms: new SqlInfRepository(db, 'inf.administrative_term'),
    retentions: new SqlInfRepository(db, 'inf.measure_retention'),
    removals: new SqlInfRepository(db, 'inf.measure_removal'),
    inventories: new SqlInfRepository(db, 'inf.vehicle_inventory'),
    history: new SqlInfRepository(db, 'inf.measure_status_history'),
  };
}

/**
 * Repositórios só para as consultas de verificação do próprio teste,
 * **depois** que o comando já terminou (commit ou rollback) — nunca
 * injetados no comando. Cada método de `SqlInfRepository` abre a sua
 * própria transação (`db.tx`); se fossem passados em `repositories` a um
 * comando que já está dentro de `dependencies.database.tx(...)`, o
 * `begin`/`commit` interno fecharia a transação externa mais cedo (Postgres
 * não aninha `BEGIN`/`COMMIT` simples — verificado empiricamente: um
 * `commit` aninhado encerra a transação real). Por isso `commandDeps`
 * abaixo manda `repositories: {}` por padrão, igual à fiação de produção
 * (`evidence-commands.provider.ts`: "`repositories` fica vazio de
 * propósito"), e o comando cai no caminho de SQL cru com a `tx`
 * compartilhada.
 */
export function verifyRepositories(
  client: pg.Client,
  tenantId: string,
  actorId: string,
) {
  return repositories(database(client, tenantId, actorId));
}

/**
 * Dependências do comando. **Proposta do Inspector, não valor canônico**
 * (mesmo precedente de `ops/evidence/tests/integration/harness.ts`), com a
 * correção acima: `repositories: {}` por padrão.
 */
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
    repositories: {},
    deadlines: {
      computeMeasureDue: vi.fn(async (_code: string, startOn: string) => ({
        rawDueOn: startOn,
        dueOn: startOn,
      })),
    },
    featureFlags: { isEnabled: () => false },
    outbox: { append: vi.fn(async () => ({ id: randomUUID() })) },
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
    throw new Error(`${label} ainda não existe (TASK-0009, CTG-0004 §11)`, {
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

/** Tenant isolado por arquivo (rait-test-strategy.md §6). */
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

export async function dropTenant(
  client: pg.Client,
  tenantId: string,
): Promise<void> {
  await client.query(`select set_config('app.role', 'owner', false)`);
  for (const table of [
    'inf.measure_status_history',
    'inf.vehicle_inventory',
    'inf.measure_removal',
    'inf.measure_retention',
    'inf.administrative_term',
    'inf.administrative_measure',
    'inf.measure_type',
    'integration.outbox',
  ]) {
    await client.query(`delete from ${table} where tenant_id = $1`, [tenantId]);
  }
  await client.query('delete from auth.memberships where tenant_id = $1', [
    tenantId,
  ]);
  await client.query('delete from auth.users where tenant_id = $1', [tenantId]);
  await client.query('delete from auth.tenants where id = $1', [tenantId]);
}

/** Uma medida `RETIDO` com `measure_type` próprio, no tenant isolado. */
export async function seedRetidoMeasure(
  client: pg.Client,
  tenantId: string,
  agencyId: string,
  agentId: string,
  shiftId: string,
  deviceId: string,
): Promise<{ measureId: string; measureTypeId: string }> {
  const measureTypeId = randomUUID();
  const measureId = randomUUID();
  await client.query(`select set_config('app.role', 'owner', false)`);
  await client.query(`select set_config('app.tenant_id', $1, false)`, [
    tenantId,
  ]);
  await client.query(
    `insert into inf.measure_type (id, tenant_id, code, name, status)
     values ($1, $2, $3, 'Retenção (isolado)', 'active')`,
    [measureTypeId, tenantId, `retencao-${measureTypeId.slice(0, 8)}`],
  );
  await client.query(
    `insert into inf.administrative_measure
       (id, tenant_id, traffic_agency_id, measure_type_id, agent_id, shift_id,
        device_id, started_at, reason, current_status)
     values ($1, $2, $3, $4, $5, $6, $7, now(), 'Fixture isolada', 'RETIDO')`,
    [measureId, tenantId, agencyId, measureTypeId, agentId, shiftId, deviceId],
  );
  return { measureId, measureTypeId };
}

/**
 * Medida + retenção próprias para `release` (§16.1): `currentStatus` fixa o
 * pré-estado da medida (`RETIDO` ou `LIBERADO_COM_PRAZO`); `regularizedAt`,
 * quando informado, grava-se na retenção (ramo REGULARIZADO).
 */
export async function seedMeasureWithRetention(
  client: pg.Client,
  tenantId: string,
  agencyId: string,
  agentId: string,
  shiftId: string,
  deviceId: string,
  vehicleSnapshotId: string,
  options: {
    currentStatus: 'RETIDO' | 'LIBERADO_COM_PRAZO';
    regularizedAt?: string;
  },
): Promise<{ measureId: string; retentionId: string }> {
  const { measureId } = await seedRetidoMeasure(
    client,
    tenantId,
    agencyId,
    agentId,
    shiftId,
    deviceId,
  );
  const retentionId = randomUUID();
  await client.query(`select set_config('app.role', 'owner', false)`);
  await client.query(`select set_config('app.tenant_id', $1, false)`, [
    tenantId,
  ]);
  if (options.currentStatus !== 'RETIDO') {
    await client.query(
      `update inf.administrative_measure set current_status = $2 where id = $1`,
      [measureId, options.currentStatus],
    );
  }
  await client.query(
    `insert into inf.measure_retention
       (id, tenant_id, measure_id, vehicle_snapshot_id, retention_reason,
        regularization_deadline_at, regularized_at)
     values ($1, $2, $3, $4, 'Fixture isolada — release', '2026-10-14T00:00:00-04:00', $5)`,
    [
      retentionId,
      tenantId,
      measureId,
      vehicleSnapshotId,
      options.regularizedAt ?? null,
    ],
  );
  return { measureId, retentionId };
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
