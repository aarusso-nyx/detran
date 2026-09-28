import { randomUUID } from 'node:crypto';
import type pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  database,
  dropTenant,
  isolatedTenant,
  newClient,
  seedField,
} from './harness.js';

const client: pg.Client = newClient();
let tenantA: { tenantId: string; actorId: string };
let tenantB: { tenantId: string; actorId: string };
let tenantBQueueItemId: string;
let tenantBReservationId: string;
let tenantBReceiptId: string;
let tenantBConflictId: string;

beforeAll(async () => {
  await client.connect();
  tenantA = await isolatedTenant(client, 'r21-rls-a');
  tenantB = await isolatedTenant(client, 'r21-rls-b');
  await seedField(client, tenantA.tenantId, tenantA.actorId);
  const fieldB = await seedField(client, tenantB.tenantId, tenantB.actorId);
  await client.query(`select set_config('app.role', 'owner', false)`);
  const inserted = await client.query<{ id: string }>(
    `insert into ops.sync_queue_item
       (id, tenant_id, traffic_agency_id, device_id, agent_id, entity_type,
        local_entity_id, status, created_locally_at, idempotency_key,
        payload_hash, payload_json)
     select $1, $2, traffic_agency_id, device_id, agent_id, 'ait', $3,
            'received', '2026-09-14T13:05:00.000Z', $4,
            'sha256:r21-tenant-b', '{}'::jsonb
       from ops.ops_shift where tenant_id = $2 limit 1
     returning id`,
    [
      randomUUID(),
      tenantB.tenantId,
      randomUUID(),
      `r21-tenant-b-${randomUUID().slice(0, 8)}`,
    ],
  );
  tenantBQueueItemId = inserted.rows[0]!.id;
  tenantBReservationId = randomUUID();
  tenantBReceiptId = randomUUID();
  tenantBConflictId = randomUUID();
  await client.query(
    `insert into ops.numbering_reservation
       (id, tenant_id, range_id, traffic_agency_id, agent_id, device_id, shift_id,
        idempotency_key, start_number, end_number, valid_until, status)
     values ($1, $2, $3, $4, $5, $6, $7, $8, 2026000001, 2026000001,
             '2026-12-31T23:59:59-04:00', 'reserved')`,
    [
      tenantBReservationId,
      tenantB.tenantId,
      fieldB.rangeId,
      fieldB.agencyId,
      fieldB.agentId,
      fieldB.deviceId,
      fieldB.shiftId,
      `r21-reservation-b-${randomUUID().slice(0, 8)}`,
    ],
  );
  await client.query(
    `insert into ops.sync_receipt
       (id, tenant_id, sync_queue_item_id, idempotency_key, entity_type,
        local_entity_id, accepted_hash, status)
     values ($1, $2, $3, $4, 'ait', $5, 'sha256:r21-tenant-b', 'received')`,
    [
      tenantBReceiptId,
      tenantB.tenantId,
      tenantBQueueItemId,
      `r21-receipt-b-${randomUUID().slice(0, 8)}`,
      randomUUID(),
    ],
  );
  await client.query(
    `insert into ops.sync_conflict
       (id, tenant_id, sync_queue_item_id, conflict_type, reason_code,
        retryable, allowed_resolution_actions, description, status)
     values ($1, $2, $3, 'integrity', 'TEAT.SYNC_INTEGRITY_ERROR', false,
             '["accept_server","reject","retry_after_correction"]'::jsonb,
             'R-0021 tenant B fixture', 'open')`,
    [tenantBConflictId, tenantB.tenantId, tenantBQueueItemId],
  );
});

afterAll(async () => {
  await dropTenant(client, tenantB.tenantId);
  await dropTenant(client, tenantA.tenantId);
  await client.end();
});

describe('CTG-0001 C-01-28 — RLS de offline-sync', () => {
  async function expectTenantBRowIsHiddenAndPreserved(
    table:
      | 'ops.sync_queue_item'
      | 'ops.sync_receipt'
      | 'ops.numbering_reservation'
      | 'ops.sync_conflict',
    id: string,
    status: string,
  ): Promise<void> {
    const tenantADatabase = database(client, tenantA.tenantId, tenantA.actorId);
    const hiddenRows = await tenantADatabase.tx(
      async (tx) =>
        (
          await (
            tx as {
              query<T extends Record<string, unknown>>(
                sql: string,
                values: readonly unknown[],
              ): Promise<{ rows: T[] }>;
            }
          ).query(`select id from ${table} where id = $1`, [id])
        ).rows,
    );
    expect(hiddenRows).toEqual([]);

    const update = await tenantADatabase.tx(async (tx) =>
      (
        tx as {
          query<T extends Record<string, unknown>>(
            sql: string,
            values: readonly unknown[],
          ): Promise<{ rows: T[]; rowCount: number | null }>;
        }
      ).query(
        `update ${table} set updated_at = now() where id = $1 returning id`,
        [id],
      ),
    );
    expect(update.rowCount).toBe(0);
    expect(update.rows).toEqual([]);

    const tenantBDatabase = database(client, tenantB.tenantId, tenantB.actorId);
    const preserved = await tenantBDatabase.tx(async (tx) =>
      (
        tx as {
          query<T extends Record<string, unknown>>(
            sql: string,
            values: readonly unknown[],
          ): Promise<{ rows: T[] }>;
        }
      ).query(`select id, status from ${table} where id = $1`, [id]),
    );
    expect(preserved.rows).toEqual([{ id, status }]);
  }

  it('dado tenant A sob role_app_backend quando consulta e atualiza o item real de B então não o lê, o update tem rowCount zero e B o preserva', async () => {
    const tenantADatabase = database(client, tenantA.tenantId, tenantA.actorId);
    const hiddenRows = await tenantADatabase.tx(
      async (tx) =>
        (
          await (
            tx as {
              query<T extends Record<string, unknown>>(
                sql: string,
                values: readonly unknown[],
              ): Promise<{ rows: T[] }>;
            }
          ).query(`select id from ops.sync_queue_item where tenant_id = $1`, [
            tenantB.tenantId,
          ])
        ).rows,
    );
    expect(hiddenRows).toEqual([]);

    const update = await tenantADatabase.tx(async (tx) =>
      (
        tx as {
          query<T extends Record<string, unknown>>(
            sql: string,
            values: readonly unknown[],
          ): Promise<{ rows: T[]; rowCount: number | null }>;
        }
      ).query(
        `update ops.sync_queue_item set status = 'applied' where id = $1
         returning id`,
        [tenantBQueueItemId],
      ),
    );
    expect(update.rowCount).toBe(0);
    expect(update.rows).toEqual([]);

    const tenantBDatabase = database(client, tenantB.tenantId, tenantB.actorId);
    const preserved = await tenantBDatabase.tx(async (tx) =>
      (
        tx as {
          query<T extends Record<string, unknown>>(
            sql: string,
            values: readonly unknown[],
          ): Promise<{ rows: T[] }>;
        }
      ).query(`select id, status from ops.sync_queue_item where id = $1`, [
        tenantBQueueItemId,
      ]),
    );
    expect(preserved.rows).toEqual([
      { id: tenantBQueueItemId, status: 'received' },
    ]);
  });

  it('dado tenant A sob role_app_backend quando consulta e atualiza recibo, reserva e conflito reais de B então todos ficam invisíveis e preservados', async () => {
    await expectTenantBRowIsHiddenAndPreserved(
      'ops.sync_receipt',
      tenantBReceiptId,
      'received',
    );
    await expectTenantBRowIsHiddenAndPreserved(
      'ops.numbering_reservation',
      tenantBReservationId,
      'reserved',
    );
    await expectTenantBRowIsHiddenAndPreserved(
      'ops.sync_conflict',
      tenantBConflictId,
      'open',
    );
  });
});
