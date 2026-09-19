import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { vi } from 'vitest';

/**
 * Harness de integração de `@detran/ops-field` (R-0008, TASK-0004,
 * CTG-0002 §10). Não é um arquivo de teste: `vitest.config.ts` inclui só
 * `tests/integration/**\/*.integration.spec.ts`.
 *
 * Por que um repositório SQL local em vez de `OpsTenantRepository`
 * (`@detran/ops-core`): o `vitest.config.ts` gerado destes dois pacotes `ops`
 * nasce com `resolve.alias: {}` (o blueprint não declara `testAliases`) e os
 * pacotes não têm `dist/`, então **qualquer** `import '@detran/shared'` ou
 * `'@detran/ops-core'` falha com "Failed to resolve entry for package". O
 * conserto é o delta de blueprint de TASK-0005 (`module.testAliases`), fora da
 * fronteira desta tarefa — está no relatório como bloqueio.
 */
const { Client } = pg;

export const CONNECTION_STRING =
  process.env.DETRAN_TEST_DATABASE_URL ??
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5432/detran';

/** Tenant e ids canônicos das fixtures (00/10/25/26-fixtures-*.sql). */
export const FIXTURES = {
  tenantId: '00000000-0000-7000-8000-00000000a001',
  agencyId: '00000000-0000-7000-8000-0000e2000001',
  agentId: '00000000-0000-4000-8000-0000b0000001',
  deviceAuthorized: '00000000-0000-7000-8000-0000e4000002',
  deviceBlocked: '00000000-0000-7000-8000-0000e4000003',
  deviceTampered: '00000000-0000-7000-8000-0000e4000004',
  shiftOpen: '00000000-0000-7000-8000-0000e3000001',
  shiftClosed: '00000000-0000-7000-8000-0000e3000002',
  rangeId: '00000000-0000-7000-8000-0000e5000001',
  reservationReserved: '00000000-0000-7000-8000-0000e6000001',
  reservationConsumed: '00000000-0000-7000-8000-0000e6000002',
  reservationExpired: '00000000-0000-7000-8000-0000e6000003',
  reservationCancelled: '00000000-0000-7000-8000-0000e6000004',
  consumptionApplied: '00000000-0000-7000-8000-0000ec100001',
  queueItemApplied: '00000000-0000-7000-8000-0000e9000001',
  queueItemLegacy: '00000000-0000-7000-8000-0000e9000002',
  receiptApplied: '00000000-0000-7000-8000-0000ea100001',
  conflictConcurrency: '00000000-0000-7000-8000-0000eb100001',
  aitReceived: '00000000-0000-7000-8000-0000f8000060',
  framingId: '00000000-0000-7000-8000-0000e1000001',
  catalogId: '00000000-0000-7000-8000-0000e0000001',
  appliedIdempotencyKey: 'item-001',
} as const;

/**
 * `import()` com especificador **variável** de propósito: os comandos só nascem
 * em TASK-0005 e um literal faria `tsc --noEmit` (e portanto `pnpm check`)
 * quebrar com TS2307 antes de o Engineer criar os arquivos. Com a variável a
 * resolução acontece em tempo de execução, relativa a **este** arquivo — que
 * fica no mesmo diretório dos specs, então os caminhos `../../src/...` valem
 * igual dos dois lados.
 */
export const importModule = (specifier: string): Promise<unknown> =>
  import(/* @vite-ignore */ specifier);

export function newClient(): pg.Client {
  return new Client({ connectionString: CONNECTION_STRING });
}

/**
 * `Database`-like do STYNX: abre transação, assume `role_app_backend` e fixa o
 * contexto de tenant, exatamente como
 * `inf/ait/tests/integration/ait-commands.integration.spec.ts` (ADR-0002: a
 * RLS vale no caminho de requisição; nunca o papel `owner`).
 */
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

/** Mesma superfície de `OpsTenantRepository` (list/find/create/update). */
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

  create(values: Record<string, unknown>): Promise<Record<string, unknown>> {
    const entries = Object.entries(values);
    const columns = entries.map(([key]) => key);
    if (columns.some((key) => !/^[a-z_]+$/.test(key)))
      throw new Error('Invalid ops write field');
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
    batches: new SqlOpsRepository(db, 'ops.sync_batch'),
    items: new SqlOpsRepository(db, 'ops.sync_queue_item'),
    receipts: new SqlOpsRepository(db, 'ops.sync_receipt'),
    conflicts: new SqlOpsRepository(db, 'ops.sync_conflict'),
    ranges: new SqlOpsRepository(db, 'ops.ait_numbering_range'),
    reservations: new SqlOpsRepository(db, 'ops.numbering_reservation'),
    consumptions: new SqlOpsRepository(db, 'ops.numbering_consumption'),
    handoffs: new SqlOpsRepository(db, 'ops.ops_session_handoff'),
    shifts: new SqlOpsRepository(db, 'ops.ops_shift'),
    devices: new SqlOpsRepository(db, 'ops.ops_operational_device'),
  };
}

/**
 * Dependências do comando. **Proposta do Inspector, não valor canônico**: o
 * contrato fixa os arquivos (`§11`), nunca a forma da injeção. O carregador
 * abaixo tolera qualquer nome de export e de método.
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
    repositories: repositories(db),
    appliers: [],
    parameters: {
      get: vi.fn(async (key: string) => ({
        key,
        value_json: null,
        source_pending: true,
      })),
    },
    outbox: { append: vi.fn(async () => ({ id: randomUUID() })) },
    clock: { now: () => new Date().toISOString() },
    ...overrides,
  };
}

/**
 * Carrega um comando ainda inexistente sem derrubar a coleta do arquivo:
 * o `import()` acontece dentro do teste e a rejeição nomeia o arquivo que
 * TASK-0005 precisa criar.
 */
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
    throw new Error(`${label} ainda não existe (TASK-0005, CTG-0002 §11)`, {
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

/**
 * Tenant isolado por arquivo. Precedente sancionado por
 * `rait-test-strategy.md` §6 ("só para isolamento de tenant em integration") e
 * já usado por `ait-commands.integration.spec.ts`: as fixtures compartilhadas
 * nunca são mutadas por um teste.
 */
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

/**
 * Clone das fixtures de campo de `26-fixtures-teat-field.sql` dentro do tenant
 * isolado: mesma forma e mesmos estados, ids novos (a PK é o `id` sozinho).
 */
export async function seedField(
  client: pg.Client,
  tenantId: string,
  actorId: string,
  options: {
    rangeStart?: number;
    rangeEnd?: number;
    rangeNext?: number;
    series?: string;
  } = {},
): Promise<{
  agencyId: string;
  unitId: string;
  agentId: string;
  deviceId: string;
  otherDeviceId: string;
  shiftId: string;
  rangeId: string;
}> {
  const agencyId = randomUUID();
  const unitId = randomUUID();
  const agentId = randomUUID();
  const deviceId = randomUUID();
  const otherDeviceId = randomUUID();
  const shiftId = randomUUID();
  const rangeId = randomUUID();
  await client.query(`select set_config('app.role', 'owner', false)`);
  await client.query(`select set_config('app.tenant_id', $1, false)`, [
    tenantId,
  ]);
  await client.query(
    `insert into ops.agency_unit (id, tenant_id, traffic_agency_id, name)
     values ($1, $2, $3, 'Unidade Operacional Centro')`,
    [unitId, tenantId, agencyId],
  );
  await client.query(
    `insert into ops.ops_agent_profile
       (id, tenant_id, traffic_agency_id, user_ref, operational_unit_id,
        registration_number, functional_status, credential_valid_until)
     values ($1, $2, $3, $4, $5, 'MAT-000001', 'active', '2027-12-31')`,
    [agentId, tenantId, agencyId, actorId, unitId],
  );
  for (const [id, hash] of [
    [deviceId, 'authorized'],
    [otherDeviceId, 'secondary'],
  ] as const) {
    await client.query(
      `insert into ops.ops_operational_device
         (id, tenant_id, traffic_agency_id, hardware_identifier_hash, os_name,
          status, app_version, tamper_flag)
       values ($1, $2, $3, $4, 'android', 'authorized', '1.0.0', false)`,
      [id, tenantId, agencyId, `sha256:${hash}-${id.slice(0, 8)}`],
    );
  }
  await client.query(
    `insert into ops.ops_shift
       (id, tenant_id, traffic_agency_id, agent_id, device_id,
        operational_unit_id, started_at, status)
     values ($1, $2, $3, $4, $5, $6, '2026-09-14T08:00:00-04:00', 'open')`,
    [shiftId, tenantId, agencyId, agentId, deviceId, unitId],
  );
  await client.query(
    `insert into ops.ait_numbering_range
       (id, tenant_id, traffic_agency_id, series, start_number, end_number,
        next_number, status, usage_mode)
     values ($1, $2, $3, $4, $5, $6, $7, 'active', 'source_pending')`,
    [
      rangeId,
      tenantId,
      agencyId,
      options.series ?? 'F',
      options.rangeStart ?? 2026000001,
      options.rangeEnd ?? 2026001000,
      options.rangeNext ?? options.rangeStart ?? 2026000001,
    ],
  );
  return {
    agencyId,
    unitId,
    agentId,
    deviceId,
    otherDeviceId,
    shiftId,
    rangeId,
  };
}

export async function dropTenant(
  client: pg.Client,
  tenantId: string,
): Promise<void> {
  await client.query(`select set_config('app.role', 'owner', false)`);
  for (const table of [
    'ops.numbering_consumption',
    'ops.sync_conflict',
    'ops.sync_receipt',
    'ops.sync_queue_item',
    'ops.sync_batch',
    'ops.numbering_reservation',
    'ops.ait_numbering_range',
    'ops.ops_session_handoff',
    'ops.ops_device_event',
    'ops.ops_shift',
    'ops.ops_operational_device',
    'ops.ops_agent_profile',
    'ops.agency_unit',
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

export async function outboxEnvelopes(
  client: pg.Client,
  tenantId: string,
): Promise<Record<string, unknown>[]> {
  await client.query(`select set_config('app.role', 'owner', false)`);
  const result = await client.query<{ payload: Record<string, unknown> }>(
    `select payload from integration.outbox where tenant_id = $1 order by created_at, id`,
    [tenantId],
  );
  return result.rows.map((row) => row.payload);
}
