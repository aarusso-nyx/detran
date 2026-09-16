import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { vi } from 'vitest';

/**
 * Harness de integração de `@detran/inf-alcohol` (R-0008, TASK-0008,
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
  breathalyzerValid: '00000000-0000-7000-8000-0000ea000001',
  metrologicalTableActive: '00000000-0000-7000-8000-0000eb000001',
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

  findByProcedure(procedureId: string): Promise<Record<string, unknown>[]> {
    return this.db.tx(async (tx) => {
      const result = await (tx as SqlTransaction).query(
        `select * from ${this.table} where procedure_id = $1`,
        [procedureId],
      );
      return result.rows;
    });
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
    procedures: new SqlInfRepository(db, 'inf.alcohol_procedure'),
    tests: new SqlInfRepository(db, 'inf.alcohol_test'),
    refusals: new SqlInfRepository(db, 'inf.alcohol_refusal'),
    signs: new SqlInfRepository(db, 'inf.alcohol_psychomotor_sign'),
    forwardings: new SqlInfRepository(db, 'inf.alcohol_forwarding'),
    breathalyzers: new SqlInfRepository(db, 'inf.alcohol_breathalyzer'),
    metrologicalTables: new SqlInfRepository(
      db,
      'inf.normative_metrological_table',
    ),
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
  // Reseta o `app.tenant_id` da sessão (`seedTriagemProcedure` grava com
  // persistência de sessão, `set_config(..., false)`) para o tenant que
  // esta chamada está criando — sem isso, uma segunda chamada de
  // `isolatedTenant` no mesmo `client` (ex.: um caso que precisa de tenant
  // próprio depois de outros já terem semeado dados no tenant do arquivo)
  // colide com o gatilho de consistência de tenant em `auth.users`.
  await client.query(`select set_config('app.tenant_id', $1, false)`, [
    tenantId,
  ]);
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
    'inf.alcohol_forwarding',
    'inf.alcohol_psychomotor_sign',
    'inf.alcohol_refusal',
    'inf.alcohol_test',
    'inf.alcohol_procedure',
    'inf.alcohol_breathalyzer',
    'inf.normative_metrological_table',
    'inf.normative_catalog',
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

/**
 * Um procedimento TRIAGEM com etilômetro e tabela metrológica próprios, no
 * tenant isolado. `catalogStatus` (§16.4, default `'active'`) fixa o status
 * do `normative_catalog` dono da tabela — `'retired'`/`'draft'` prova o
 * negativo de C-0004-15/§16.4 sem depender de fixture compartilhada.
 */
export async function seedTriagemProcedure(
  client: pg.Client,
  tenantId: string,
  agencyId: string,
  agentId: string,
  shiftId: string,
  catalogStatus: string = 'active',
): Promise<{
  procedureId: string;
  breathalyzerId: string;
  catalogId: string;
  tableId: string;
}> {
  const procedureId = randomUUID();
  const breathalyzerId = randomUUID();
  const catalogId = randomUUID();
  const tableId = randomUUID();
  await client.query(`select set_config('app.role', 'owner', false)`);
  await client.query(`select set_config('app.tenant_id', $1, false)`, [
    tenantId,
  ]);
  await client.query(
    `insert into inf.alcohol_breathalyzer
       (id, tenant_id, traffic_agency_id, serial_number, calibration_valid_until, status)
     values ($1, $2, $3, $4, '2027-06-30', 'active')`,
    [
      breathalyzerId,
      tenantId,
      agencyId,
      `ETL-ISO-${breathalyzerId.slice(0, 8)}`,
    ],
  );
  await client.query(
    `insert into inf.normative_catalog
       (id, tenant_id, traffic_agency_id, name, catalog_type, version, valid_from, status, normative_source)
     values ($1, $2, $3, $4, 'enquadramentos', '2026.1', '2026-01-01', $5, 'fixture isolada')`,
    [
      catalogId,
      tenantId,
      agencyId,
      `Catálogo isolado ${catalogId.slice(0, 8)}`,
      catalogStatus,
    ],
  );
  await client.query(
    `insert into inf.normative_metrological_table
       (id, tenant_id, catalog_id, table_name, version, table_json, valid_from, status)
     values ($1, $2, $3, 'Tabela isolada', '2026.1', $4::jsonb, '2026-01-01', 'active')`,
    [
      tableId,
      tenantId,
      catalogId,
      JSON.stringify({
        unit: 'mg/L',
        thresholds: { administrative: 0.05, crime: 0.34 },
        tolerance: [
          { from: 0.0, to: 0.4, max_error: 0.04 },
          { from: 0.4, to: null, max_error: 0.05 },
        ],
      }),
    ],
  );
  await client.query(
    `insert into inf.alcohol_procedure
       (id, tenant_id, traffic_agency_id, agent_id, shift_id, procedure_at,
        procedure_type, outcome, status)
     values ($1, $2, $3, $4, $5, now(), 'etilometro', '', 'TRIAGEM')`,
    [procedureId, tenantId, agencyId, agentId, shiftId],
  );
  return { procedureId, breathalyzerId, catalogId, tableId };
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
