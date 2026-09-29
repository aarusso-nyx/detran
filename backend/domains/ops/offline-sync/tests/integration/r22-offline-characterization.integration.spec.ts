import { randomUUID } from 'node:crypto';
import type pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { database, isolatedTenant, newClient } from './harness.js';

/**
 * R-0022 CTG-0009 §4 (TASK-0017) — caracterização SQL do armazenamento do
 * offline-sync, arquivo fixo **I** (C-09-22, C-09-23). Vale antes e depois da
 * migração: percorre a lista fechada `OFFLINE_SYNC_STORAGE` (regra 4) com a
 * guarda `to_regclass`, e toda operação sob teste roda sob `role_app_backend`
 * com o tenant do contexto (`database()` do harness). O _owner_ só cria os
 * tenants (`isolatedTenant`) e limpa.
 *
 * Semeadura: as linhas de A e de B nascem sob `role_app_backend` com o próprio
 * tenant do contexto, só nas tabelas cuja forma o código de produção lido fixa
 * (`ops.*`, DDL 18) e só se a tabela existir e o papel puder gravá-la. As
 * tabelas `offline.*` entram nas asserções sobre as linhas que tiverem.
 */

/** CTG-0009 §4 regra 4 — nomes das duas fases (DDL 18 e migrações publicadas). */
const OFFLINE_SYNC_STORAGE = [
  'ops.ait_numbering_range',
  'ops.numbering_reservation',
  'ops.numbering_consumption',
  'ops.sync_batch',
  'ops.sync_queue_item',
  'ops.sync_receipt',
  'ops.sync_conflict',
  'offline.numbering_ranges',
  'offline.numbering_reservations',
  'offline.numbering_consumption',
  'offline.sync_batches',
  'offline.sync_batch_transport_keys',
  'offline.sync_item_receipts',
  'offline.sync_item_attempts',
  'offline.sync_queue_items',
  'offline.sync_conflicts',
  'offline.sync_conflict_evidence',
] as const;

// F-07 do CTG-0009: nunca o _fallback_ `localhost/detran` do harness.
if (!process.env.DETRAN_TEST_DATABASE_URL)
  throw new Error(
    'DETRAN_TEST_DATABASE_URL is required for R-0022 integration',
  );

interface Queryable {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[]; rowCount: number | null }>;
}

const client: pg.Client = newClient();
let tenantA: { tenantId: string; actorId: string };
let tenantB: { tenantId: string; actorId: string };
let existing: string[] = [];

function as(tenant: { tenantId: string; actorId: string }) {
  const db = database(client, tenant.tenantId, tenant.actorId);
  return <T>(work: (tx: Queryable) => Promise<T>): Promise<T> =>
    db.tx((tx) => work(tx as Queryable));
}

async function writable(table: string): Promise<boolean> {
  if (!existing.includes(table)) return false;
  const result = await client.query<{ ok: boolean }>(
    `select has_table_privilege('role_app_backend', $1, 'INSERT') as ok`,
    [table],
  );
  return result.rows[0]?.ok === true;
}

/**
 * Uma linha por tabela `ops.*` existente, com os valores das _fixtures_ de
 * R-0021 (`r21-offline-characterization`), gravada pelo próprio tenant.
 */
async function seed(tenant: { tenantId: string; actorId: string }) {
  const run = as(tenant);
  const agencyId = randomUUID();
  const deviceId = randomUUID();
  await run(async (tx) => {
    let rangeId: string | undefined;
    let reservationId: string | undefined;
    let queueItemId: string | undefined;
    if (await writable('ops.ait_numbering_range'))
      rangeId = (
        await tx.query<{ id: string }>(
          `insert into ops.ait_numbering_range
             (tenant_id, traffic_agency_id, series, start_number, end_number,
              next_number, status, usage_mode)
           values ($1, $2, 'F', 2026000001, 2026001000, 2026000001,
                   'active', 'source_pending')
           returning id`,
          [tenant.tenantId, agencyId],
        )
      ).rows[0]!.id;
    if (rangeId && (await writable('ops.numbering_reservation')))
      reservationId = (
        await tx.query<{ id: string }>(
          `insert into ops.numbering_reservation
             (tenant_id, range_id, traffic_agency_id, agent_id, device_id,
              shift_id, idempotency_key, start_number, end_number, valid_until,
              status)
           values ($1, $2, $3, $4, $5, $6, $7, 2026000001, 2026000001,
                   '2026-12-31T23:59:59-04:00', 'reserved')
           returning id`,
          [
            tenant.tenantId,
            rangeId,
            agencyId,
            randomUUID(),
            deviceId,
            randomUUID(),
            `r22-rls-reservation-${randomUUID().slice(0, 8)}`,
          ],
        )
      ).rows[0]!.id;
    if (
      rangeId &&
      reservationId &&
      (await writable('ops.numbering_consumption'))
    )
      await tx.query(
        `insert into ops.numbering_consumption
           (tenant_id, reservation_id, range_id, number, status)
         values ($1, $2, $3, 2026000001, 'disponivel')`,
        [tenant.tenantId, reservationId, rangeId],
      );
    if (await writable('ops.sync_batch'))
      await tx.query(
        `insert into ops.sync_batch
           (tenant_id, traffic_agency_id, agent_id, device_id, device_batch_id)
         values ($1, $2, $3, $4, $5)`,
        [
          tenant.tenantId,
          agencyId,
          randomUUID(),
          deviceId,
          `r22-rls-batch-${randomUUID().slice(0, 8)}`,
        ],
      );
    const itemKey = `r22-rls-item-${randomUUID().slice(0, 8)}`;
    const localEntityId = randomUUID();
    if (await writable('ops.sync_queue_item'))
      queueItemId = (
        await tx.query<{ id: string }>(
          `insert into ops.sync_queue_item
             (tenant_id, traffic_agency_id, device_id, agent_id, entity_type,
              local_entity_id, status, created_locally_at, idempotency_key,
              payload_hash, payload_json)
           values ($1, $2, $3, $4, 'ait', $5, 'received',
                   '2026-09-14T13:05:00.000Z', $6, 'sha256:r22-rls',
                   '{}'::jsonb)
           returning id`,
          [
            tenant.tenantId,
            agencyId,
            deviceId,
            randomUUID(),
            localEntityId,
            itemKey,
          ],
        )
      ).rows[0]!.id;
    if (queueItemId && (await writable('ops.sync_receipt')))
      await tx.query(
        `insert into ops.sync_receipt
           (tenant_id, sync_queue_item_id, idempotency_key, entity_type,
            local_entity_id, accepted_hash, status)
         values ($1, $2, $3, 'ait', $4, 'sha256:r22-rls', 'received')`,
        [tenant.tenantId, queueItemId, itemKey, localEntityId],
      );
    if (queueItemId && (await writable('ops.sync_conflict')))
      await tx.query(
        `insert into ops.sync_conflict
           (tenant_id, sync_queue_item_id, conflict_type, reason_code,
            retryable, allowed_resolution_actions, description, status)
         values ($1, $2, 'integrity', 'TEAT.SYNC_INTEGRITY_ERROR', false,
                 '["accept_server","reject","retry_after_correction"]'::jsonb,
                 'R-0022 RLS fixture', 'open')`,
        [tenant.tenantId, queueItemId],
      );
  });
}

async function countOf(
  tenant: { tenantId: string; actorId: string },
  table: string,
  ownerTenantId: string,
): Promise<number> {
  return as(tenant)(async (tx) =>
    Number(
      (
        await tx.query<{ count: string }>(
          `select count(*)::text as count from ${table} where tenant_id = $1`,
          [ownerTenantId],
        )
      ).rows[0]!.count,
    ),
  );
}

/** Limpeza do _owner_ (regra 4): só a lista fechada, com guarda, em passadas. */
async function purge(tenantIds: readonly string[]): Promise<void> {
  await client.query(`select set_config('app.role', 'owner', false)`);
  let pending = [...existing].reverse();
  for (let pass = 0; pass < 6 && pending.length > 0; pass += 1) {
    const failed: string[] = [];
    for (const table of pending) {
      try {
        await client.query(
          `delete from ${table} where tenant_id = any($1::uuid[])`,
          [tenantIds],
        );
      } catch {
        failed.push(table);
      }
    }
    pending = failed;
  }
  for (const statement of [
    'delete from auth.memberships where tenant_id = any($1::uuid[])',
    'delete from auth.users where tenant_id = any($1::uuid[])',
    'delete from auth.tenants where id = any($1::uuid[])',
  ])
    await client.query(statement, [tenantIds]);
}

beforeAll(async () => {
  await client.connect();
  for (const table of OFFLINE_SYNC_STORAGE) {
    const found = await client.query<{ name: string | null }>(
      'select to_regclass($1)::text as name',
      [table],
    );
    if (found.rows[0]?.name) existing.push(table);
  }
  tenantA = await isolatedTenant(client, 'r22-rls-a');
  tenantB = await isolatedTenant(client, 'r22-rls-b');
  await seed(tenantA);
  await seed(tenantB);
}, 60_000);

afterAll(async () => {
  if (tenantA && tenantB) await purge([tenantA.tenantId, tenantB.tenantId]);
  await client.end();
}, 60_000);

describe('CTG-0009 C-09-22 — RLS A×B no armazenamento do offline-sync', () => {
  it('C-09-22 — dado linhas de B em cada tabela existente de OFFLINE_SYNC_STORAGE quando A as consulta, atualiza e apaga sob role_app_backend então não as vê, rowCount 0 e B as preserva', async () => {
    const withRowsOfB: string[] = [];
    for (const table of existing) {
      const before = await countOf(tenantB, table, tenantB.tenantId);
      if (before === 0) continue;
      withRowsOfB.push(table);

      expect(await countOf(tenantA, table, tenantB.tenantId), table).toBe(0);
      const foreignVisible = await as(tenantA)((tx) =>
        tx.query<{ count: string }>(
          `select count(*)::text as count from ${table} where tenant_id <> $1`,
          [tenantA.tenantId],
        ),
      );
      expect(Number(foreignVisible.rows[0]!.count), table).toBe(0);

      const updated = await as(tenantA)((tx) =>
        tx.query(
          `update ${table} set tenant_id = tenant_id where tenant_id = $1`,
          [tenantB.tenantId],
        ),
      );
      expect(updated.rowCount, table).toBe(0);
      const deleted = await as(tenantA)((tx) =>
        tx.query(`delete from ${table} where tenant_id = $1`, [
          tenantB.tenantId,
        ]),
      );
      expect(deleted.rowCount, table).toBe(0);

      expect(await countOf(tenantB, table, tenantB.tenantId), table).toBe(
        before,
      );
    }
    // Sem nenhuma linha de B a prova seria vazia: ao menos uma tabela precisa
    // tê-las (fase 1.4.0: as sete de `ops.*`).
    expect(withRowsOfB.length).toBeGreaterThan(0);
  });
});

describe('CTG-0009 C-09-23 — DDL e RLS do armazenamento do offline-sync', () => {
  it('C-09-23 — dado cada tabela existente de OFFLINE_SYNC_STORAGE quando o catálogo é lido então tem tenant_id, RLS ENABLE e FORCE e política pelo tenant, e role_app_backend não é dono nem BYPASSRLS', async () => {
    expect(existing.length).toBeGreaterThan(0);
    const role = await client.query<{
      oid: number;
      rolbypassrls: boolean;
      rolsuper: boolean;
    }>(
      `select oid, rolbypassrls, rolsuper from pg_roles
        where rolname = 'role_app_backend'`,
    );
    expect(role.rows).toHaveLength(1);
    expect(role.rows[0]).toMatchObject({
      rolbypassrls: false,
      rolsuper: false,
    });

    for (const table of existing) {
      const [schema, name] = table.split('.') as [string, string];
      const column = await client.query(
        `select 1 from information_schema.columns
          where table_schema = $1 and table_name = $2
            and column_name = 'tenant_id'`,
        [schema, name],
      );
      expect(column.rows, `${table}.tenant_id`).toHaveLength(1);

      const relation = await client.query<{
        relrowsecurity: boolean;
        relforcerowsecurity: boolean;
        relowner: number;
      }>(
        `select relrowsecurity, relforcerowsecurity, relowner
           from pg_class where oid = $1::regclass`,
        [table],
      );
      expect(relation.rows[0], table).toMatchObject({
        relrowsecurity: true,
        relforcerowsecurity: true,
      });
      expect(relation.rows[0]!.relowner, table).not.toBe(role.rows[0]!.oid);

      const policies = await client.query<{
        roles: string[] | string;
        qual: string | null;
        with_check: string | null;
      }>(
        `select roles, qual, with_check from pg_policies
          where schemaname = $1 and tablename = $2`,
        [schema, name],
      );
      const byTenant = policies.rows.filter((policy) => {
        const roles = Array.isArray(policy.roles)
          ? policy.roles
          : String(policy.roles).replace(/[{}]/g, '').split(',');
        const appliesToBackend =
          roles.includes('public') || roles.includes('role_app_backend');
        return appliesToBackend && /tenant/.test(String(policy.qual ?? ''));
      });
      expect(byTenant.length, `${table} política pelo tenant`).toBeGreaterThan(
        0,
      );
    }
  });

  it('C-09-23 — dado linhas de A quando A tenta mudar tenant_id para B sob role_app_backend então nenhuma linha passa a B', async () => {
    let checked = 0;
    for (const table of existing) {
      const rowsOfA = await countOf(tenantA, table, tenantA.tenantId);
      if (rowsOfA === 0) continue;
      checked += 1;
      const rowsOfB = await countOf(tenantB, table, tenantB.tenantId);
      await as(tenantA)((tx) =>
        tx.query(`update ${table} set tenant_id = $2 where tenant_id = $1`, [
          tenantA.tenantId,
          tenantB.tenantId,
        ]),
      ).catch(() => undefined);
      expect(await countOf(tenantB, table, tenantB.tenantId), table).toBe(
        rowsOfB,
      );
      expect(await countOf(tenantA, table, tenantA.tenantId), table).toBe(
        rowsOfA,
      );
    }
    expect(checked).toBeGreaterThan(0);
  });
});
