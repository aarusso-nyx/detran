import type pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  commandDeps,
  FIXTURES,
  importModule,
  isolatedPackage,
  newClient,
  outboxEnvelopes,
  runCommand,
} from './harness.js';

/**
 * CTG-0003 §2/§6.3/§6.6 e §10 (R-0008, TASK-0006) — C-0003-37…38: `publish`
 * emite `PACOTE_MOBILE_PUBLICADO` e o pacote aparece em `GET sync-metadata`;
 * após `retire`, some; um pacote `published` com `valid_until` ontem nunca
 * aparece em `sync-metadata`.
 *
 * Pacotes próprios criados em `isolatedPackage` (tenant canônico, ids
 * aleatórios) para não mutar `…e7000001`/`…e7000002`; removidos no `afterAll`.
 */

const PUBLISH_EXPORTS = ['PublishPackageCommand'];
const PUBLISH_METHODS_PUBLISH = ['publish', 'execute', 'handle'];
const PUBLISH_METHODS_RETIRE = ['retire'];
const SYNC_METADATA_EXPORTS = ['PackageSyncMetadataQuery'];
const SYNC_METADATA_METHODS = ['execute', 'handle', 'run', 'list'];

const client: pg.Client = newClient();
const createdPackageIds: string[] = [];
let startedAt: string;

beforeAll(async () => {
  await client.connect();
  await client.query(`select set_config('app.role', 'owner', false)`);
  const now = await client.query<{ now: string }>('select now()::text as now');
  startedAt = now.rows[0]!.now;
});

afterAll(async () => {
  await client.query(`select set_config('app.role', 'owner', false)`);
  if (createdPackageIds.length > 0) {
    await client.query(
      `delete from inf.normative_mobile_package where id = any($1::uuid[])`,
      [createdPackageIds],
    );
  }
  await client.query(
    `delete from integration.outbox where tenant_id = $1 and created_at >= $2`,
    [FIXTURES.tenantId, startedAt],
  );
  await client.end();
});

async function syncMetadataPackageIds(
  dependencies: ReturnType<typeof commandDeps>,
): Promise<string[]> {
  const response = await runCommand(
    () => importModule('../../src/handwritten/package-sync-metadata.query.js'),
    'inf/normative/src/handwritten/package-sync-metadata.query.ts',
    SYNC_METADATA_EXPORTS,
    SYNC_METADATA_METHODS,
    dependencies,
  );
  const packages = (response as { packages?: Array<{ id: string }> }).packages;
  return (packages ?? []).map((entry) => entry.id);
}

describe('CTG-0003 §6.3/§6.6 — publish/retire e sync-metadata (C-0003-37…38)', () => {
  it('C-0003-37 — dado mobile-packages/{id}/publish então sai PACOTE_MOBILE_PUBLICADO e o pacote aparece em GET sync-metadata; após retire, some', async () => {
    const packageId = await isolatedPackage(
      client,
      FIXTURES.tenantId,
      FIXTURES.catalogActive,
      { status: 'draft', validUntil: null },
    );
    createdPackageIds.push(packageId);

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

    const publishCommand = await runCommand(
      () => importModule('../../src/handwritten/publish-package.command.js'),
      'inf/normative/src/handwritten/publish-package.command.ts',
      PUBLISH_EXPORTS,
      PUBLISH_METHODS_PUBLISH,
      dependencies,
      packageId,
      {},
    );
    expect(publishCommand.status).toBe('published');

    const envelopes = await outboxEnvelopes(
      client,
      FIXTURES.tenantId,
      startedAt,
    );
    expect(
      envelopes.some(
        (envelope) => envelope.domainEvent === 'PACOTE_MOBILE_PUBLICADO',
      ),
    ).toBe(true);

    const idsAfterPublish = await syncMetadataPackageIds(dependencies);
    expect(idsAfterPublish).toContain(packageId);

    await runCommand(
      () => importModule('../../src/handwritten/publish-package.command.js'),
      'inf/normative/src/handwritten/publish-package.command.ts',
      PUBLISH_EXPORTS,
      PUBLISH_METHODS_RETIRE,
      dependencies,
      packageId,
      {},
    );

    const idsAfterRetire = await syncMetadataPackageIds(dependencies);
    expect(idsAfterRetire).not.toContain(packageId);
  });

  it('C-0003-38 — dado um pacote published com valid_until ontem então GET sync-metadata não o devolve', async () => {
    const packageId = await isolatedPackage(
      client,
      FIXTURES.tenantId,
      FIXTURES.catalogActive,
      { status: 'published', validUntil: '2026-09-13' },
    );
    createdPackageIds.push(packageId);

    const dependencies = commandDeps(
      client,
      FIXTURES.tenantId,
      FIXTURES.actorId,
    );
    const ids = await syncMetadataPackageIds(dependencies);
    expect(ids).not.toContain(packageId);
  });
});
