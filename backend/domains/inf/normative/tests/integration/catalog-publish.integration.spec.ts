import type pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  commandDeps,
  FIXTURES,
  importModule,
  newClient,
  outboxEnvelopes,
  resetDraftCatalog,
  runCommand,
} from './harness.js';

/**
 * CTG-0003 §2/§6.1 e §10 (R-0008, TASK-0006) — C-0003-36: `POST
 * /v1/inf/normative/catalogs/{id}/publish` de um catálogo `draft` grava
 * `status='active'`, `published_at` e publica `CATALOGO_PUBLICADO`.
 *
 * Usa a fixture `…e0000002` (`draft`, `27-fixtures-teat-evidence.sql`) e
 * restaura o estado ao final (`resetDraftCatalog`) — fixture compartilhada,
 * nunca isolada por tenant nesta suíte porque a máquina de estados do
 * catálogo é o próprio objeto sob teste.
 */

const COMMAND_EXPORTS = ['PublishCatalogCommand'];
const COMMAND_METHODS = ['publish', 'execute', 'handle'];

const client: pg.Client = newClient();
let startedAt: string;

beforeAll(async () => {
  await client.connect();
  await client.query(`select set_config('app.role', 'owner', false)`);
  const now = await client.query<{ now: string }>('select now()::text as now');
  startedAt = now.rows[0]!.now;
});

afterAll(async () => {
  await resetDraftCatalog(client);
  await client.query(
    `delete from integration.outbox where tenant_id = $1 and created_at >= $2`,
    [FIXTURES.tenantId, startedAt],
  );
  await client.end();
});

describe('CTG-0003 §6.1 — catalogs/{id}/publish: draft → active (C-0003-36)', () => {
  it('C-0003-36 — dado catalogs/{id}/publish de um catálogo draft então status=active, published_at gravado e sai CATALOGO_PUBLICADO', async () => {
    const dependencies = commandDeps(
      client,
      FIXTURES.tenantId,
      FIXTURES.actorId,
      {
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
                FIXTURES.tenantId,
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
      },
    );

    await runCommand(
      () => importModule('../../src/handwritten/publish-catalog.command.js'),
      'inf/normative/src/handwritten/publish-catalog.command.ts',
      COMMAND_EXPORTS,
      COMMAND_METHODS,
      dependencies,
      FIXTURES.catalogDraft,
      {},
    );

    const catalog = await dependencies.repositories.catalogs.find(
      FIXTURES.catalogDraft,
    );
    expect(catalog?.status).toBe('active');
    expect(catalog?.published_at).toBeTruthy();

    const envelopes = await outboxEnvelopes(
      client,
      FIXTURES.tenantId,
      startedAt,
    );
    expect(
      envelopes.some(
        (envelope) => envelope.domainEvent === 'CATALOGO_PUBLICADO',
      ),
    ).toBe(true);
  });
});
