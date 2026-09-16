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
} from './harness.js';

/**
 * CTG-0003 §4.6 e §10 (R-0008, TASK-0006) — C-0003-31:
 * `probative-packages/generate` com três evidências: `sequence` 1..3 na
 * ordem `captured_at asc, id asc`, `manifest_hash` cobrindo os três
 * `item_hash`, e as três evidências passam a `packaged`.
 */

const COMMAND_EXPORTS = [
  'GenerateProbativePackageCommand',
  'GenerateProbativePackage',
];
const COMMAND_METHODS = ['execute', 'handle', 'run'];

const client: pg.Client = newClient();
let tenantId: string;
let actorId: string;

beforeAll(async () => {
  await client.connect();
  const isolated = await isolatedTenant(
    client,
    'ops-evidence-generate-probative-package',
  );
  tenantId = isolated.tenantId;
  actorId = isolated.actorId;
});

afterAll(async () => {
  await dropTenant(client, tenantId);
  await client.end();
});

async function seedValidatedEvidence(
  capturedAt: string,
  entityId: string,
): Promise<string> {
  const evidenceId = randomUUID();
  await client.query(`select set_config('app.role', 'owner', false)`);
  await client.query(`select set_config('app.tenant_id', $1, false)`, [
    tenantId,
  ]);
  await client.query(
    `insert into ops.evidence_evidence
       (id, tenant_id, traffic_agency_id, evidence_type, origin, storage_uri,
        mime_type, size_bytes, hash_algorithm, hash_value, captured_at, status)
     values ($1, $2, $3, 'foto', 'campo', $4, 'image/jpeg', 204800, 'sha256', $5,
             $6, 'validated')`,
    [
      evidenceId,
      tenantId,
      FIXTURES.agencyId,
      `evidence/${tenantId}/${evidenceId}`,
      `sha256:${evidenceId.replace(/-/g, '').padEnd(64, '0')}`,
      capturedAt,
    ],
  );
  await client.query(
    `insert into ops.evidence_link (id, tenant_id, evidence_id, entity_type, entity_id, role, mandatory)
     values ($1, $2, $3, 'ait', $4, 'foto', false)`,
    [randomUUID(), tenantId, evidenceId, entityId],
  );
  return evidenceId;
}

describe('CTG-0003 §4.6 — probative-packages/generate: ordem e efeito (C-0003-31)', () => {
  it('C-0003-31 — dado probative-packages/generate com três evidências então sequence 1,2,3 na ordem captured_at asc, manifest_hash cobre os três item_hash e as três evidências passam a packaged', async () => {
    const entityId = randomUUID();
    const evidenceLatest = await seedValidatedEvidence(
      '2026-09-12T10:00:00-04:00',
      entityId,
    );
    const evidenceEarliest = await seedValidatedEvidence(
      '2026-09-10T10:00:00-04:00',
      entityId,
    );
    const evidenceMiddle = await seedValidatedEvidence(
      '2026-09-11T10:00:00-04:00',
      entityId,
    );

    const dependencies = commandDeps(client, tenantId, actorId);
    const response = await runCommand(
      () =>
        importModule(
          '../../src/handwritten/generate-probative-package.command.js',
        ),
      'ops/evidence/src/handwritten/generate-probative-package.command.ts',
      COMMAND_EXPORTS,
      COMMAND_METHODS,
      dependencies,
      {
        traffic_agency_id: FIXTURES.agencyId,
        entity_type: 'ait',
        entity_id: entityId,
        generated_by_user_ref: actorId,
        purpose: 'instrucao-processual',
      },
    );

    expect(response.manifest_hash).toEqual(expect.stringMatching(/^sha256:/));
    const items = (response.items ?? []) as Array<{
      sequence: number;
      evidence_id: string;
    }>;
    expect(items.map((item) => item.sequence)).toEqual([1, 2, 3]);
    expect(items.map((item) => item.evidence_id)).toEqual([
      evidenceEarliest,
      evidenceMiddle,
      evidenceLatest,
    ]);

    for (const evidenceId of [
      evidenceEarliest,
      evidenceMiddle,
      evidenceLatest,
    ]) {
      const evidence =
        await dependencies.repositories.evidence.find(evidenceId);
      expect(evidence?.status).toBe('packaged');
    }
  });
});
