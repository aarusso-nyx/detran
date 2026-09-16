import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { vi } from 'vitest';

/**
 * Harness de integração de `@detran/ops-evidence` (R-0008, TASK-0006,
 * CTG-0003 §10). Não é um arquivo de teste: `vitest.config.ts` inclui só
 * `tests/integration/**\/*.integration.spec.ts`. Padrão herdado de
 * `backend/domains/ops/offline-sync/tests/integration/harness.ts` (TASK-0004).
 */
const { Client } = pg;

export const CONNECTION_STRING =
  process.env.DETRAN_TEST_DATABASE_URL ??
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5432/detran';

/** Tenant e ids canônicos das fixtures (00/10/25/26/27-fixtures-*.sql). */
export const FIXTURES = {
  tenantId: '00000000-0000-7000-8000-00000000a001',
  agencyId: '00000000-0000-7000-8000-0000e2000001',
  actorId: '00000000-0000-4000-8000-0000b0000001',
  aitIntegrado: '00000000-0000-7000-8000-0000f0000001',
  evidenceBodycamValidated: '00000000-0000-7000-8000-0000ef000001',
  evidencePendingUpload: '00000000-0000-7000-8000-0000ef000002',
  evidenceUploaded: '00000000-0000-7000-8000-0000ef000003',
  evidenceQuarantined: '00000000-0000-7000-8000-0000ef000004',
  storageIntentExpired: '00000000-0000-7000-8000-0000ef100001',
  storageIntentValid: '00000000-0000-7000-8000-0000ef100002',
  accessRequestRequested: '00000000-0000-7000-8000-0000ef400001',
  accessRequestApproved: '00000000-0000-7000-8000-0000ef400002',
} as const;

export const importModule = (specifier: string): Promise<unknown> =>
  import(/* @vite-ignore */ specifier);

export function newClient(): pg.Client {
  return new Client({ connectionString: CONNECTION_STRING });
}

/** `Database`-like do STYNX: transação com `role_app_backend` e contexto de tenant. */
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
    evidence: new SqlOpsRepository(db, 'ops.evidence_evidence'),
    storageIntents: new SqlOpsRepository(db, 'ops.storage_intent'),
    evidenceLinks: new SqlOpsRepository(db, 'ops.evidence_link'),
    custodyEvents: new SqlOpsRepository(db, 'ops.evidence_custody_event'),
    probativePackages: new SqlOpsRepository(
      db,
      'ops.evidence_probative_package',
    ),
    probativePackageItems: new SqlOpsRepository(
      db,
      'ops.evidence_probative_package_item',
    ),
    accessRequests: new SqlOpsRepository(db, 'ops.evidence_access_request'),
  };
}

/**
 * Dependências do comando. **Proposta do Inspector, não valor canônico**
 * (mesmo precedente de `offline-sync/tests/integration/harness.ts`).
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
    appliedEntityPorts: [
      { entityType: 'ait', isApplied: vi.fn(async () => true) },
    ],
    evidenceStorage: {
      presignUpload: vi.fn(async (input: { objectKey: string }) => ({
        uploadUrl: `local://${input.objectKey}`,
        expiresAt: '2027-01-01T00:00:00.000Z',
      })),
    },
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

/**
 * Tenant isolado por arquivo. Precedente sancionado por
 * `rait-test-strategy.md` §6 ("só para isolamento de tenant em integration")
 * e já usado por `offline-sync/tests/integration/harness.ts`: as fixtures
 * compartilhadas (`27-fixtures-teat-evidence.sql`) nunca são mutadas por um
 * teste de integração.
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

export async function dropTenant(
  client: pg.Client,
  tenantId: string,
): Promise<void> {
  await client.query(`select set_config('app.role', 'owner', false)`);
  for (const table of [
    'ops.evidence_probative_package_item',
    'ops.evidence_probative_package',
    'ops.evidence_access_request',
    'ops.evidence_custody_event',
    'ops.evidence_link',
    'ops.storage_intent',
    'ops.evidence_evidence',
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

/** Uma evidência `pending_upload` com `storage_intent` vigente, no tenant isolado. */
export async function seedPendingEvidence(
  client: pg.Client,
  tenantId: string,
  actorId: string,
  agencyId: string,
  overrides: {
    hashValue?: string;
    expiresAt?: string;
  } = {},
): Promise<{
  evidenceId: string;
  storageIntentId: string;
  hashValue: string;
  idempotencyKey: string;
}> {
  const evidenceId = randomUUID();
  const storageIntentId = randomUUID();
  const idempotencyKey = `intent-${storageIntentId.slice(0, 8)}`;
  const hashValue =
    overrides.hashValue ??
    `sha256:${randomUUID().replace(/-/g, '').padEnd(64, '0')}`;
  await client.query(`select set_config('app.role', 'owner', false)`);
  await client.query(`select set_config('app.tenant_id', $1, false)`, [
    tenantId,
  ]);
  await client.query(
    `insert into ops.evidence_evidence
       (id, tenant_id, traffic_agency_id, evidence_type, origin, storage_uri,
        mime_type, size_bytes, hash_algorithm, hash_value, captured_by_user_ref,
        captured_at, status)
     values ($1, $2, $3, 'foto', 'campo', $4, 'image/jpeg', 204800, 'sha256', $5, $6,
             '2026-09-14T09:00:00-04:00', 'pending_upload')`,
    [
      evidenceId,
      tenantId,
      agencyId,
      `evidence/${tenantId}/${evidenceId}`,
      hashValue,
      actorId,
    ],
  );
  await client.query(
    `insert into ops.storage_intent
       (id, tenant_id, evidence_id, idempotency_key, local_evidence_id,
        object_key, expires_at, status)
     values ($1, $2, $3, $4, $5, $6, $7, 'pending')`,
    [
      storageIntentId,
      tenantId,
      evidenceId,
      idempotencyKey,
      randomUUID(),
      `evidence/${tenantId}/${evidenceId}`,
      overrides.expiresAt ?? '2027-01-01T00:00:00-04:00',
    ],
  );
  return { evidenceId, storageIntentId, hashValue, idempotencyKey };
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
