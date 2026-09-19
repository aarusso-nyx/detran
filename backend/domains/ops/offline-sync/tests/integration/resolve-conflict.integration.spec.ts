import { randomUUID } from 'node:crypto';
import type pg from 'pg';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import {
  commandDeps,
  dropTenant,
  importModule,
  isolatedTenant,
  newClient,
  outboxEnvelopes,
  runCommand,
  seedField,
} from './harness.js';

/**
 * CTG-0002 §5.13 (R-0008, TASK-0004) — `POST sync-conflicts/{id}/resolve`:
 * `manual_review` mantém o conflito `open`; as demais ações o levam a
 * `resolved` e movem `sync_queue_item.status` conforme a tabela da §5.13
 * (`accept_server`/`reject` → `rejected`, `retry_after_correction` →
 * `pending`); conflito de concorrência só admite `manual_review` — a decisão
 * que libera ou rejeita o AIT é `concurrency-review` (CTG-0001 §4.8).
 *
 * `resolve-conflict.command.ts` nasce em TASK-0005 (CTG-0002 §11).
 */

const client: pg.Client = newClient();
let tenantId: string;
let actorId: string;
let field: Awaited<ReturnType<typeof seedField>>;

function resolve(
  dependencies: unknown,
  conflictId: string,
  body: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  return runCommand(
    () => importModule('../../src/handwritten/resolve-conflict.command.js'),
    'ops/offline-sync/src/handwritten/resolve-conflict.command.ts',
    ['ResolveSyncConflictCommand', 'ResolveConflictCommand', 'ResolveConflict'],
    ['execute', 'resolve', 'handle'],
    dependencies,
    conflictId,
    body,
  );
}

/** Cria um item `received` e um conflito `open` do tipo pedido. */
async function openConflict(
  conflictType: 'integrity' | 'domain' | 'concurrency',
): Promise<{ conflictId: string; itemId: string }> {
  const itemId = randomUUID();
  const conflictId = randomUUID();
  const allowed =
    conflictType === 'concurrency'
      ? ['manual_review']
      : ['accept_server', 'reject', 'retry_after_correction'];
  await client.query(`select set_config('app.role', 'owner', false)`);
  await client.query(`select set_config('app.tenant_id', $1, false)`, [
    tenantId,
  ]);
  await client.query(
    `insert into ops.sync_queue_item
       (id, tenant_id, traffic_agency_id, device_id, agent_id, entity_type,
        local_entity_id, status, created_locally_at, idempotency_key,
        payload_hash, payload_json)
     values ($1, $2, $3, $4, $5, 'ait', $6, 'received',
             '2026-09-14T13:05:00-04:00', $7, 'sha256:conflict', '{}'::jsonb)`,
    [
      itemId,
      tenantId,
      field.agencyId,
      field.deviceId,
      field.agentId,
      randomUUID(),
      `conflict-${itemId.slice(0, 8)}`,
    ],
  );
  await client.query(
    `insert into ops.sync_conflict
       (id, tenant_id, sync_queue_item_id, conflict_type, reason_code,
        retryable, allowed_resolution_actions, description, status)
     values ($1, $2, $3, $4, $5, false, $6::jsonb, $7, 'open')`,
    [
      conflictId,
      tenantId,
      itemId,
      conflictType,
      conflictType === 'concurrency'
        ? 'TEAT.SYNC_CONCURRENCY_SUSPECT'
        : 'TEAT.SYNC_INTEGRITY_ERROR',
      JSON.stringify(allowed),
      'Divergência de negócio requer análise.',
    ],
  );
  return { conflictId, itemId };
}

async function rows(conflictId: string, itemId: string) {
  await client.query(`select set_config('app.role', 'owner', false)`);
  const conflict = await client.query<{
    status: string;
    resolution_action: string | null;
  }>('select status, resolution_action from ops.sync_conflict where id = $1', [
    conflictId,
  ]);
  const item = await client.query<{ status: string }>(
    'select status from ops.sync_queue_item where id = $1',
    [itemId],
  );
  return { conflict: conflict.rows[0], item: item.rows[0] };
}

beforeAll(async () => {
  await client.connect();
  const isolated = await isolatedTenant(client, 'resolve-conflict');
  tenantId = isolated.tenantId;
  actorId = isolated.actorId;
  field = await seedField(client, tenantId, actorId);
});

afterAll(async () => {
  await dropTenant(client, tenantId);
  await client.end();
});

beforeEach(async () => {
  await client.query(`select set_config('app.role', 'owner', false)`);
  await client.query('delete from ops.sync_conflict where tenant_id = $1', [
    tenantId,
  ]);
  await client.query('delete from ops.sync_queue_item where tenant_id = $1', [
    tenantId,
  ]);
  await client.query('delete from integration.outbox where tenant_id = $1', [
    tenantId,
  ]);
});

describe('CTG-0002 §5.13 — resolução de conflito de sincronização', () => {
  it('dado um conflito integrity open quando resolve com manual_review então o conflito continua open, com resolution_action gravada e sem evento', async () => {
    const { conflictId, itemId } = await openConflict('integrity');
    const response = await resolve(
      commandDeps(client, tenantId, actorId),
      conflictId,
      {
        resolved_by_user_ref: actorId,
        resolution_action: 'manual_review',
        description: 'Encaminhado ao supervisor',
      },
    );
    expect(response).toMatchObject({
      id: conflictId,
      status: 'open',
      resolution_action: 'manual_review',
    });
    const state = await rows(conflictId, itemId);
    expect(state.conflict?.status).toBe('open');
    expect(state.conflict?.resolution_action).toBe('manual_review');
    expect(state.item?.status).toBe('received');
    expect(await outboxEnvelopes(client, tenantId)).toEqual([]);
  });

  it('dado um conflito integrity open quando resolve com accept_server então status resolved, sync_queue_item rejected e evento sync.conflict.resolved · SYNC_CONFLITO_RESOLVIDO', async () => {
    const { conflictId, itemId } = await openConflict('integrity');
    const response = await resolve(
      commandDeps(client, tenantId, actorId),
      conflictId,
      {
        resolved_by_user_ref: actorId,
        resolution_action: 'accept_server',
        description: 'O servidor prevalece; o item local é descartado',
      },
    );
    expect(response).toMatchObject({
      id: conflictId,
      status: 'resolved',
      resolution_action: 'accept_server',
    });
    const state = await rows(conflictId, itemId);
    expect(state.conflict?.status).toBe('resolved');
    expect(state.item?.status).toBe('rejected');
    expect(await outboxEnvelopes(client, tenantId)).toContainEqual(
      expect.objectContaining({
        type: 'sync.conflict.resolved',
        domainEvent: 'SYNC_CONFLITO_RESOLVIDO',
        data: expect.objectContaining({
          conflictId,
          conflictType: 'integrity',
          resolutionAction: 'accept_server',
        }),
      }),
    );
  });

  it('dado um conflito integrity open quando resolve com reject então status resolved e sync_queue_item rejected', async () => {
    const { conflictId, itemId } = await openConflict('integrity');
    await resolve(commandDeps(client, tenantId, actorId), conflictId, {
      resolved_by_user_ref: actorId,
      resolution_action: 'reject',
    });
    const state = await rows(conflictId, itemId);
    expect(state.conflict?.status).toBe('resolved');
    expect(state.item?.status).toBe('rejected');
  });

  it('dado um conflito integrity open quando resolve com retry_after_correction então status resolved e sync_queue_item volta a pending (o dispositivo reenvia com nova idempotency_key)', async () => {
    const { conflictId, itemId } = await openConflict('integrity');
    await resolve(commandDeps(client, tenantId, actorId), conflictId, {
      resolved_by_user_ref: actorId,
      resolution_action: 'retry_after_correction',
    });
    const state = await rows(conflictId, itemId);
    expect(state.conflict?.status).toBe('resolved');
    expect(state.item?.status).toBe('pending');
  });

  it('dado um conflito concurrency open quando resolve com accept_server então 409 TEAT.SYNC_ITEM_CONFLICT com conflictId e conflictType, e o conflito continua open', async () => {
    const { conflictId, itemId } = await openConflict('concurrency');
    await expect(
      resolve(commandDeps(client, tenantId, actorId), conflictId, {
        resolved_by_user_ref: actorId,
        resolution_action: 'accept_server',
      }),
    ).rejects.toMatchObject({
      code: 'TEAT.SYNC_ITEM_CONFLICT',
      status: 409,
      context: expect.objectContaining({
        conflictId,
        conflictType: 'concurrency',
      }),
    });
    const state = await rows(conflictId, itemId);
    expect(state.conflict?.status).toBe('open');
    expect(state.item?.status).toBe('received');
  });

  it('dado um conflito concurrency open quando resolve com manual_review então 200 e o conflito continua open (a apuração só se encerra por concurrency-review)', async () => {
    const { conflictId } = await openConflict('concurrency');
    const response = await resolve(
      commandDeps(client, tenantId, actorId),
      conflictId,
      {
        resolved_by_user_ref: actorId,
        resolution_action: 'manual_review',
      },
    );
    expect(response).toMatchObject({ id: conflictId, status: 'open' });
  });

  it('dado um conflito de outro tenant então 404 TEAT.TENANT_MISMATCH', async () => {
    await expect(
      resolve(
        commandDeps(client, tenantId, actorId),
        '00000000-0000-7000-8000-0000eb100001',
        {
          resolved_by_user_ref: actorId,
          resolution_action: 'manual_review',
        },
      ),
    ).rejects.toMatchObject({ code: 'TEAT.TENANT_MISMATCH', status: 404 });
  });
});
