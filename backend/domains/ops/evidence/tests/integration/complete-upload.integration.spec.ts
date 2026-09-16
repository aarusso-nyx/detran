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
  seedPendingEvidence,
} from './harness.js';

/**
 * CTG-0003 §4.2 e §10 (R-0008, TASK-0006) — C-0003-29…30: `complete-upload`
 * grava `evidence`, `evidence_custody_event` e `evidence_link` na mesma
 * transação e publica os dois envelopes `EVIDENCIA_CAPTURADA`/`EVIDENCIA_VINCULADA`
 * na outbox (M16). Tenant isolado (`rait-test-strategy.md` §6): a evidência
 * pendente é criada só para este arquivo, nunca a fixture compartilhada.
 */

const COMMAND_EXPORTS = [
  'CompleteUploadCommand',
  'CompleteEvidenceUploadCommand',
];
const COMMAND_METHODS = ['execute', 'handle', 'run'];

const client: pg.Client = newClient();
let tenantId: string;
let actorId: string;
let startedAt: string;

beforeAll(async () => {
  await client.connect();
  const isolated = await isolatedTenant(client, 'ops-evidence-complete-upload');
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

describe('CTG-0003 §4.2 — complete-upload: transação única e outbox (C-0003-29…30)', () => {
  it('C-0003-29 — dado complete-upload então, na mesma transação, existem status=uploaded, evidence_custody_event e evidence_link', async () => {
    const seeded = await seedPendingEvidence(
      client,
      tenantId,
      actorId,
      FIXTURES.agencyId,
    );
    const dependencies = commandDeps(client, tenantId, actorId);
    await runCommand(
      () => importModule('../../src/handwritten/complete-upload.command.js'),
      'ops/evidence/src/handwritten/complete-upload.command.ts',
      COMMAND_EXPORTS,
      COMMAND_METHODS,
      dependencies,
      seeded.evidenceId,
      {
        storage_intent_id: seeded.storageIntentId,
        idempotency_key: seeded.idempotencyKey,
        entity_type: 'ait',
        entity_id: FIXTURES.aitIntegrado,
        accepted_hash: seeded.hashValue,
      },
    );
    const evidence = await dependencies.repositories.evidence.find(
      seeded.evidenceId,
    );
    expect(evidence?.status).toBe('uploaded');
    const custodyEvents = await dependencies.repositories.custodyEvents.list();
    expect(
      custodyEvents.some(
        (event) =>
          event.evidence_id === seeded.evidenceId &&
          event.event_type === 'uploaded',
      ),
    ).toBe(true);
    const links = await dependencies.repositories.evidenceLinks.list();
    expect(
      links.some(
        (link) =>
          link.evidence_id === seeded.evidenceId &&
          link.entity_id === FIXTURES.aitIntegrado,
      ),
    ).toBe(true);
  });

  it('C-0003-30 — dado complete-upload então saem dois envelopes na outbox, EVIDENCIA_CAPTURADA e EVIDENCIA_VINCULADA', async () => {
    const seeded = await seedPendingEvidence(
      client,
      tenantId,
      actorId,
      FIXTURES.agencyId,
    );
    const dependencies = commandDeps(client, tenantId, actorId, {
      outbox: {
        append: async (
          tx: unknown,
          envelope: Record<string, unknown>,
        ): Promise<{ id: string }> => {
          await client.query(
            `insert into integration.outbox
               (tenant_id, topic, aggregate_type, aggregate_id, payload, idempotency_key)
             values ($1, $2, $3, $4, $5, $6)
             on conflict (tenant_id, idempotency_key) do nothing
             returning id`,
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
      () => importModule('../../src/handwritten/complete-upload.command.js'),
      'ops/evidence/src/handwritten/complete-upload.command.ts',
      COMMAND_EXPORTS,
      COMMAND_METHODS,
      dependencies,
      seeded.evidenceId,
      {
        storage_intent_id: seeded.storageIntentId,
        idempotency_key: seeded.idempotencyKey,
        entity_type: 'ait',
        entity_id: FIXTURES.aitIntegrado,
        accepted_hash: seeded.hashValue,
      },
    );
    const envelopes = await outboxEnvelopes(client, tenantId, startedAt);
    const domainEvents = envelopes.map((envelope) => envelope.domainEvent);
    expect(domainEvents).toContain('EVIDENCIA_CAPTURADA');
    expect(domainEvents).toContain('EVIDENCIA_VINCULADA');
  });
});
