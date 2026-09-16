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
  runCommand,
  seedPendingEvidence,
} from './harness.js';

/**
 * CTG-0003 §4.7 e §10 (R-0008, TASK-0006) — C-0003-32:
 * `purge-expired-unverified` leva a foto `pending_upload` com intenção
 * vencida a `rejected` + `custody_event('purged_unverified')`, e **nunca**
 * purga bodycam (`teat.bodycam.retention_days` `source_pending`, M11).
 */

const COMMAND_EXPORTS = [
  'PurgeUnverifiedCommand',
  'PurgeExpiredUnverifiedCommand',
];
const COMMAND_METHODS = ['execute', 'handle', 'run'];

const client: pg.Client = newClient();
let tenantId: string;
let actorId: string;

beforeAll(async () => {
  await client.connect();
  const isolated = await isolatedTenant(
    client,
    'ops-evidence-purge-unverified',
  );
  tenantId = isolated.tenantId;
  actorId = isolated.actorId;
});

afterAll(async () => {
  await dropTenant(client, tenantId);
  await client.end();
});

async function seedExpiredBodycam(): Promise<string> {
  const evidenceId = randomUUID();
  const storageIntentId = randomUUID();
  await client.query(`select set_config('app.role', 'owner', false)`);
  await client.query(`select set_config('app.tenant_id', $1, false)`, [
    tenantId,
  ]);
  await client.query(
    `insert into ops.evidence_evidence
       (id, tenant_id, traffic_agency_id, evidence_type, origin, storage_uri,
        mime_type, size_bytes, hash_algorithm, hash_value, captured_at, status)
     values ($1, $2, $3, 'bodycam', 'campo', $4, 'video/mp4', 5242880, 'sha256', $5,
             '2026-08-01T09:00:00-04:00', 'pending_upload')`,
    [
      evidenceId,
      tenantId,
      FIXTURES.agencyId,
      `evidence/${tenantId}/${evidenceId}`,
      `sha256:${evidenceId.replace(/-/g, '').padEnd(64, '0')}`,
    ],
  );
  await client.query(
    `insert into ops.storage_intent
       (id, tenant_id, evidence_id, idempotency_key, local_evidence_id,
        object_key, expires_at, status)
     values ($1, $2, $3, $4, $5, $6, '2026-08-15T00:00:00-04:00', 'pending')`,
    [
      storageIntentId,
      tenantId,
      evidenceId,
      `intent-${storageIntentId.slice(0, 8)}`,
      randomUUID(),
      `evidence/${tenantId}/${evidenceId}`,
    ],
  );
  return evidenceId;
}

describe('CTG-0003 §4.7 — purge-expired-unverified: foto purgada, bodycam preservada (C-0003-32)', () => {
  it('C-0003-32 — dado uma foto pending_upload com intenção vencida e uma bodycam também pending_upload com intenção vencida então a foto vai a rejected com custody_event(purged_unverified) e a bodycam permanece pending_upload (skippedBodycam: 1)', async () => {
    const photo = await seedPendingEvidence(
      client,
      tenantId,
      actorId,
      FIXTURES.agencyId,
      { expiresAt: '2026-08-15T00:00:00-04:00' },
    );
    const bodycamId = await seedExpiredBodycam();

    const dependencies = commandDeps(client, tenantId, actorId);
    const response = await runCommand(
      () => importModule('../../src/handwritten/purge-unverified.command.js'),
      'ops/evidence/src/handwritten/purge-unverified.command.ts',
      COMMAND_EXPORTS,
      COMMAND_METHODS,
      dependencies,
      {},
    );

    expect(response.skippedBodycam).toBeGreaterThanOrEqual(1);
    expect(response.purged).toBeGreaterThanOrEqual(1);

    const photoRow = await dependencies.repositories.evidence.find(
      photo.evidenceId,
    );
    expect(photoRow?.status).toBe('rejected');
    const custodyEvents = await dependencies.repositories.custodyEvents.list();
    expect(
      custodyEvents.some(
        (event) =>
          event.evidence_id === photo.evidenceId &&
          event.event_type === 'purged_unverified',
      ),
    ).toBe(true);

    const bodycamRow = await dependencies.repositories.evidence.find(bodycamId);
    expect(bodycamRow?.status).toBe('pending_upload');
  });
});
