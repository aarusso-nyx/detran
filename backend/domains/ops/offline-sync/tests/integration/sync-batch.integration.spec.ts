import { createHash, randomUUID } from 'node:crypto';
import type pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  FIXTURES,
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
 * CTG-0002 §4.3, §4.4, §5.13 e §10 (R-0008, TASK-0004) — C-0002-27…30:
 * transação por item, rollback completo da falha de domínio, o invariante
 * "recibo `received` nunca vira `applied` sem efeito" e as leituras de recibo
 * (`receipts/{tenantId}` e `…/by-idempotency/{key}`).
 *
 * Os comandos nascem em TASK-0005; cada teste carrega o módulo por `import()`
 * dinâmico e falha isolado, pelo comportamento ausente.
 */

const client: pg.Client = newClient();
let tenantId: string;
let actorId: string;
let field: Awaited<ReturnType<typeof seedField>>;

/** CTG-0002 §4.2: JSON canônico = chaves ordenadas recursivamente, sem espaços. */
function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => item !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableJson(item)}`);
    return `{${entries.join(',')}}`;
  }
  return JSON.stringify(value) ?? 'null';
}

function canonicalHash(payload: unknown): string {
  return `sha256:${createHash('sha256').update(stableJson(payload)).digest('hex')}`;
}

function aitPayload(number: string): Record<string, unknown> {
  return {
    ait: {
      traffic_agency_id: field.agencyId,
      ait_number: number,
      series: 'F',
      agent_id: field.agentId,
      shift_id: field.shiftId,
      device_id: field.deviceId,
      framing_id: FIXTURES.framingId,
      catalog_id: FIXTURES.catalogId,
      infraction_at: '2026-09-14T13:00:00.000Z',
      issued_at: '2026-09-14T13:05:00.000Z',
      issuance_mode: 'eletronico',
      constatation_type: 'abordagem',
      had_approach: true,
      location_description: 'Av. Djalma Batista, 1000 — Manaus/AM',
      uf: 'AM',
      content_hash: `sha256:canonical-${number}`,
    },
    vehicles: [],
    people: [],
    signatures: [],
    print_events: [],
  };
}

const SUBMIT_EXPORTS = [
  'SubmitSyncBatchCommand',
  'SubmitBatchCommand',
  'SyncBatchSubmitCommand',
];
const SUBMIT_METHODS = ['execute', 'submit', 'submitBatch', 'handle'];
const RECEIPT_EXPORTS = [
  'SyncReceiptQuery',
  'SyncReceiptReader',
  'OfflineSyncReceiptService',
];

function submitBatch(
  dependencies: unknown,
  input: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  return runCommand(
    () => importModule('../../src/handwritten/submit-batch.command.js'),
    'ops/offline-sync/src/handwritten/submit-batch.command.ts',
    SUBMIT_EXPORTS,
    SUBMIT_METHODS,
    dependencies,
    input,
  );
}

function batchInput(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  const payload = aitPayload('2026000001');
  return {
    traffic_agency_id: field.agencyId,
    device_id: field.deviceId,
    agent_id: field.agentId,
    device_batch_id: `batch-${randomUUID().slice(0, 8)}`,
    batch_sequence: 1,
    items: [
      {
        entity_type: 'ait',
        local_entity_id: randomUUID(),
        idempotency_key: `item-${randomUUID().slice(0, 8)}`,
        created_locally_at: '2026-09-14T13:05:00.000Z',
        payload_json: payload,
        payload_hash: canonicalHash(payload),
      },
    ],
    ...overrides,
  };
}

async function countRows(table: string, where: string, values: unknown[]) {
  await client.query(`select set_config('app.role', 'owner', false)`);
  const result = await client.query<{ count: string }>(
    `select count(*)::text as count from ${table} where ${where}`,
    values,
  );
  return Number(result.rows[0]!.count);
}

beforeAll(async () => {
  await client.connect();
  const isolated = await isolatedTenant(client, 'sync-batch');
  tenantId = isolated.tenantId;
  actorId = isolated.actorId;
  field = await seedField(client, tenantId, actorId);
});

afterAll(async () => {
  await dropTenant(client, tenantId);
  await client.end();
});

describe('CTG-0002 §4.3/§4.4 — transação por item e rollback (C-0002-27…29)', () => {
  it('C-0002-27 — dado um item aplicado então na mesma transação existem o AIT em RECEBIDO, a linha numbering_consumption aplicado, o recibo applied e os envelopes na integration.outbox', async () => {
    const deps = commandDeps(client, tenantId, actorId, {
      appliers: [
        {
          entityType: 'ait',
          validate: () => null,
          apply: async (item: { id: string }, tx: unknown) => {
            const serverEntityId = randomUUID();
            await (
              tx as {
                query(
                  sql: string,
                  values: readonly unknown[],
                ): Promise<unknown>;
              }
            ).query(
              `insert into inf.ait_ait
                 (id, tenant_id, traffic_agency_id, ait_number, series, agent_id,
                  shift_id, device_id, framing_id, catalog_id, infraction_at,
                  issued_at, issuance_mode, constatation_type, had_approach,
                  location_description, uf, current_status, content_hash)
               values ($1, $2, $3, '2026000001', 'F', $4, $5, $6, $7, $8,
                       '2026-09-14T13:00:00-04:00', '2026-09-14T13:05:00-04:00',
                       'eletronico', 'abordagem', true, 'Av. Djalma Batista',
                       'AM', 'RECEBIDO', 'sha256:canonical-2026000001')`,
              [
                serverEntityId,
                tenantId,
                field.agencyId,
                field.agentId,
                field.shiftId,
                field.deviceId,
                FIXTURES.framingId,
                FIXTURES.catalogId,
              ],
            );
            void item;
            return { serverEntityId };
          },
        },
      ],
    });
    const response = await submitBatch(deps, batchInput());
    expect((response.receipts as { status: string }[])[0]?.status).toBe(
      'applied',
    );
    expect(
      await countRows('inf.ait_ait', 'tenant_id = $1 and current_status = $2', [
        tenantId,
        'RECEBIDO',
      ]),
    ).toBe(1);
    expect(
      await countRows(
        'ops.numbering_consumption',
        'tenant_id = $1 and status = $2',
        [tenantId, 'aplicado'],
      ),
    ).toBe(1);
    expect(
      await countRows('ops.sync_receipt', 'tenant_id = $1 and status = $2', [
        tenantId,
        'applied',
      ]),
    ).toBe(1);
    const envelopes = await outboxEnvelopes(client, tenantId);
    expect(envelopes.map((envelope) => envelope.domainEvent)).toEqual(
      expect.arrayContaining(['AIT_RECEBIDO', 'SYNC_ITEM_RECEBIDO']),
    );
  });

  it('C-0002-27 — dada uma falha injetada depois do efeito de domínio então zero das quatro coisas fica gravada (rollback completo, §4.3 passo 5)', async () => {
    const deps = commandDeps(client, tenantId, actorId, {
      appliers: [
        {
          entityType: 'ait',
          validate: () => null,
          apply: async (_item: unknown, tx: unknown) => {
            await (tx as { query(sql: string): Promise<unknown> }).query(
              'select 1',
            );
            throw new Error('falha injetada depois do efeito de domínio');
          },
        },
      ],
    });
    const before = await countRows('inf.ait_ait', 'tenant_id = $1', [tenantId]);
    const input = batchInput();
    // A falha é do item, não do lote: o protocolo continua devolvendo 200 com
    // o recibo `rejected` (§4.3 passo 5), então `submitBatch` **resolve**.
    const response = await submitBatch(deps, input);
    expect((response.receipts as { status: string }[])[0]?.status).toBe(
      'rejected',
    );
    expect(await countRows('inf.ait_ait', 'tenant_id = $1', [tenantId])).toBe(
      before,
    );
    const key = (input.items as { idempotency_key: string }[])[0]!
      .idempotency_key;
    expect(
      await countRows(
        'ops.sync_queue_item',
        'tenant_id = $1 and idempotency_key = $2 and status = $3',
        [tenantId, key, 'applied'],
      ),
    ).toBe(0);
  });

  it('C-0002-28 — dado um item cuja aplicação falha por regra de domínio então o efeito é revertido e ainda assim existe o recibo conflict/rejected gravado em transação própria', async () => {
    const deps = commandDeps(client, tenantId, actorId, {
      appliers: [
        {
          entityType: 'ait',
          validate: () => null,
          apply: async () => {
            throw Object.assign(new Error('reserva expirada'), {
              code: 'TEAT.NUMBERING_RESERVATION_EXPIRED',
              status: 422,
              context: { reservationId: null, number: 2026000001 },
            });
          },
        },
      ],
    });
    const input = batchInput();
    const response = await submitBatch(deps, input);
    const receipt = (
      response.receipts as { status: string; error_code: string }[]
    )[0];
    expect(receipt?.status).toBe('conflict');
    expect(receipt?.error_code).toBe('TEAT.NUMBERING_RESERVATION_EXPIRED');
    const key = (input.items as { idempotency_key: string }[])[0]!
      .idempotency_key;
    expect(
      await countRows(
        'ops.sync_receipt',
        'tenant_id = $1 and idempotency_key = $2',
        [tenantId, key],
      ),
    ).toBe(1);
  });

  it('C-0002-29 — dado um recibo received (crash-record, destino não montado) então nenhuma execução posterior o promove a applied sem efeito de domínio', async () => {
    const deps = commandDeps(client, tenantId, actorId, { appliers: [] });
    const payload = aitPayload('2026000002');
    const localEntityId = randomUUID();
    const idempotencyKey = `item-${randomUUID().slice(0, 8)}`;
    const item = {
      entity_type: 'crash-record',
      local_entity_id: localEntityId,
      idempotency_key: idempotencyKey,
      created_locally_at: '2026-09-14T13:05:00.000Z',
      payload_json: payload,
      payload_hash: canonicalHash(payload),
    };
    const first = await submitBatch(deps, batchInput({ items: [item] }));
    expect((first.receipts as { status: string }[])[0]?.status).toBe(
      'received',
    );
    const second = await submitBatch(
      deps,
      batchInput({ batch_sequence: 2, items: [item] }),
    );
    expect((second.receipts as { status: string }[])[0]?.status).toBe(
      'received',
    );
    expect(
      await countRows(
        'ops.sync_receipt',
        'tenant_id = $1 and idempotency_key = $2 and status = $3',
        [tenantId, idempotencyKey, 'applied'],
      ),
    ).toBe(0);
    expect(
      await countRows(
        'ops.sync_queue_item',
        'tenant_id = $1 and idempotency_key = $2 and status = $3',
        [tenantId, idempotencyKey, 'received'],
      ),
    ).toBe(1);
  });
});

describe('CTG-0002 §5.13 — leituras de recibo e recuperação de ACK perdido (C-0002-30)', () => {
  function readReceipt(
    dependencies: unknown,
    ...args: unknown[]
  ): Promise<Record<string, unknown>> {
    return runCommand(
      () => importModule('../../src/handwritten/offline-sync.provider.js'),
      'ops/offline-sync/src/handwritten/offline-sync.provider.ts (leitura de recibo por idempotency_key)',
      RECEIPT_EXPORTS,
      ['findByIdempotencyKey', 'byIdempotency', 'read', 'execute'],
      dependencies,
      ...args,
    );
  }

  it('C-0002-30 — dado receipts/{tenantId}/by-idempotency/{key} com o tenant do principal e a chave item-001 das fixtures então 200 com o recibo applied', async () => {
    const deps = commandDeps(client, FIXTURES.tenantId, FIXTURES.agentId, {});
    const receipt = await readReceipt(
      deps,
      FIXTURES.tenantId,
      FIXTURES.appliedIdempotencyKey,
    );
    expect(receipt).toMatchObject({
      idempotency_key: FIXTURES.appliedIdempotencyKey,
      status: 'applied',
      server_entity_id: FIXTURES.aitReceived,
    });
  });

  it('C-0002-30 — dado o mesmo recurso com {tenantId} de outro tenant então 404 TEAT.TENANT_MISMATCH', async () => {
    const deps = commandDeps(client, FIXTURES.tenantId, FIXTURES.agentId, {});
    await expect(
      readReceipt(deps, tenantId, FIXTURES.appliedIdempotencyKey),
    ).rejects.toMatchObject({ code: 'TEAT.TENANT_MISMATCH', status: 404 });
  });

  it('C-0002-30 — dada uma idempotency_key inexistente no tenant então 404 TEAT.SYNC_RECEIPT_NOT_FOUND', async () => {
    const deps = commandDeps(client, FIXTURES.tenantId, FIXTURES.agentId, {});
    await expect(
      readReceipt(deps, FIXTURES.tenantId, 'item-inexistente'),
    ).rejects.toMatchObject({
      code: 'TEAT.SYNC_RECEIPT_NOT_FOUND',
      status: 404,
    });
  });
});
