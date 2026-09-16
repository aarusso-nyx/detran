import { randomUUID } from 'node:crypto';
import type pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  commandDeps,
  dropTenant,
  FIXTURES,
  importModule,
  isolatedTenant,
  newClient,
  outboxEnvelopes,
  runCommand,
} from './harness.js';

/**
 * CTG-0003 §4.11 e §10 (R-0008, TASK-0006) — C-0003-33: `deliver` leva a
 * requisição de acesso a `delivered` com `delivery_media_ref`/`delivered_at`
 * (o check `ck_ops_evidence_access_delivered_complete` não é violado) e
 * publica `CUSTODIA_EVENTO` com `eventType='access_delivered'`.
 */

const COMMAND_EXPORTS = ['DeliverAccessRequestCommand'];
const COMMAND_METHODS = ['execute', 'handle', 'run'];

const client: pg.Client = newClient();
let tenantId: string;
let actorId: string;
let startedAt: string;

beforeAll(async () => {
  await client.connect();
  const isolated = await isolatedTenant(
    client,
    'ops-evidence-deliver-access-request',
  );
  tenantId = isolated.tenantId;
  actorId = isolated.actorId;
  await client.query(`select set_config('app.role', 'owner', false)`);
  const now = await client.query<{ now: string }>('select now()::text as now');
  startedAt = now.rows[0]!.now;
});

afterAll(async () => {
  await dropTenant(client, tenantId);
  await client.end();
});

async function seedApprovedRequest(): Promise<{
  evidenceId: string;
  accessRequestId: string;
}> {
  const evidenceId = randomUUID();
  const accessRequestId = randomUUID();
  await client.query(`select set_config('app.role', 'owner', false)`);
  await client.query(`select set_config('app.tenant_id', $1, false)`, [
    tenantId,
  ]);
  await client.query(
    `insert into ops.evidence_evidence
       (id, tenant_id, traffic_agency_id, evidence_type, origin, storage_uri,
        mime_type, size_bytes, hash_algorithm, hash_value, captured_at, status)
     values ($1, $2, $3, 'bodycam', 'campo', $4, 'video/mp4', 5242880, 'sha256', $5,
             '2026-09-10T10:00:00-04:00', 'validated')`,
    [
      evidenceId,
      tenantId,
      FIXTURES.agencyId,
      `evidence/${tenantId}/${evidenceId}`,
      `sha256:${evidenceId.replace(/-/g, '').padEnd(64, '0')}`,
    ],
  );
  await client.query(
    `insert into ops.evidence_access_request
       (id, tenant_id, evidence_id, requester_name, requester_role,
        investigation_ref, purpose, legal_basis, status, decided_by_user_ref)
     values ($1, $2, $3, 'Requerente Fixture', 'magistrado',
             'INV-0099', 'instrucao', 'Art. 13', 'approved', $4)`,
    [accessRequestId, tenantId, evidenceId, actorId],
  );
  return { evidenceId, accessRequestId };
}

describe('CTG-0003 §4.11 — deliver: estado, checks e CUSTODIA_EVENTO (C-0003-33)', () => {
  it('C-0003-33 — dado deliver então a linha vai a delivered com delivery_media_ref e delivered_at, e sai CUSTODIA_EVENTO com eventType=access_delivered', async () => {
    const seeded = await seedApprovedRequest();
    const dependencies = commandDeps(client, tenantId, actorId, {
      outbox: {
        append: async (
          _tx: unknown,
          envelope: Record<string, unknown>,
        ): Promise<{ id: string }> => {
          await client.query(
            `insert into integration.outbox
               (tenant_id, topic, aggregate_type, aggregate_id, payload, idempotency_key)
             values ($1, $2, $3, $4, $5, $6)
             on conflict (tenant_id, idempotency_key) do nothing`,
            [
              tenantId,
              envelope.type,
              (envelope.aggregate as { kind: string }).kind,
              (envelope.aggregate as { id: string }).id,
              JSON.stringify(envelope),
              `${envelope.type}:${(envelope.aggregate as { id: string }).id}:${(envelope.aggregate as { version: number }).version}`,
            ],
          );
          return { id: 'ignored' };
        },
      },
    });

    await runCommand(
      () =>
        importModule('../../src/handwritten/deliver-access-request.command.js'),
      'ops/evidence/src/handwritten/deliver-access-request.command.ts',
      COMMAND_EXPORTS,
      COMMAND_METHODS,
      dependencies,
      seeded.accessRequestId,
      { delivery_media_ref: 'DVD-0099-2026' },
    );

    const row = await dependencies.repositories.accessRequests.find(
      seeded.accessRequestId,
    );
    expect(row?.status).toBe('delivered');
    expect(row?.delivery_media_ref).toBe('DVD-0099-2026');
    expect(row?.delivered_at).toBeTruthy();

    const envelopes = await outboxEnvelopes(client, tenantId, startedAt);
    expect(
      envelopes.some(
        (envelope) =>
          envelope.domainEvent === 'CUSTODIA_EVENTO' &&
          (envelope.data as { eventType?: string })?.eventType ===
            'access_delivered',
      ),
    ).toBe(true);
  });
});
