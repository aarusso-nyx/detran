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

/**
 * `batch_sequence` é monotônica por `(tenant, device)`: o passo 4 da §4.1 exige
 * `last + 1` e o índice único `ux_sync_batch_tenant_id_device_id_batch_sequence`
 * (DDL 18) proíbe repetir. Um contador por arquivo entrega a próxima sequência
 * a cada lote; os casos que testam replay ou gap passam `batch_sequence`
 * explicitamente no `overrides`.
 */
let nextSequence = 1;

function batchInput(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  const payload = aitPayload('2026000001');
  return {
    traffic_agency_id: field.agencyId,
    device_id: field.deviceId,
    agent_id: field.agentId,
    device_batch_id: `batch-${randomUUID().slice(0, 8)}`,
    batch_sequence: nextSequence++,
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

/**
 * Reserva `reserved` do device+turno cobrindo o número 2026000001, criada no
 * arranjo porque `ops.numbering_consumption.reservation_id` é **not null** com
 * FK (`fk_ops_numbering_consumption_reservation`, DDL 18): sem ela o applier
 * não tem onde ancorar a linha `aplicado` da §4.6.
 */
async function seedReservation(): Promise<string> {
  const id = randomUUID();
  await client.query(`select set_config('app.role', 'owner', false)`);
  await client.query(`select set_config('app.tenant_id', $1, false)`, [
    tenantId,
  ]);
  await client.query(
    `insert into ops.numbering_reservation
       (id, tenant_id, range_id, traffic_agency_id, agent_id, device_id, shift_id,
        idempotency_key, start_number, end_number, valid_until, status)
     values ($1, $2, $3, $4, $5, $6, $7, $8, 2026000001, 2026000001,
             '2026-12-31T23:59:59-04:00', 'reserved')`,
    [
      id,
      tenantId,
      field.rangeId,
      field.agencyId,
      field.agentId,
      field.deviceId,
      field.shiftId,
      `sync-batch-${id.slice(0, 8)}`,
    ],
  );
  return id;
}

describe('CTG-0002 §4.3/§4.4 — transação por item e rollback (C-0002-27…29)', () => {
  it('C-0002-27 — dado um item aplicado então na mesma transação existem o AIT em RECEBIDO, a linha numbering_consumption aplicado, o recibo applied e os envelopes na integration.outbox', async () => {
    const reservationId = await seedReservation();
    const deps = commandDeps(client, tenantId, actorId, {
      appliers: [
        {
          entityType: 'ait',
          validate: () => null,
          apply: async (
            item: {
              id: string;
              localEntityId: string;
              idempotencyKey: string;
            },
            tx: unknown,
          ) => {
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
            // §4.6: o applier grava o consumo do número na **mesma**
            // transação do item; sem esta linha o dublê não representaria o
            // efeito que C-0002-27 verifica.
            await (
              tx as {
                query(
                  sql: string,
                  values: readonly unknown[],
                ): Promise<unknown>;
              }
            ).query(
              `insert into ops.numbering_consumption
                 (tenant_id, reservation_id, range_id, number, local_entity_id,
                  idempotency_key, server_entity_id, finalized_at, status)
               values ($1, $2, $3, 2026000001, $4, $5, $6,
                       '2026-09-14T13:05:00-04:00', 'aplicado')`,
              [
                tenantId,
                reservationId,
                field.rangeId,
                item.localEntityId,
                item.idempotencyKey,
                serverEntityId,
              ],
            );
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
    const second = await submitBatch(deps, batchInput({ items: [item] }));
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

/**
 * CTG-0002 §4.1 e §4.3 (R-0008, TASK-0004 iteração 3) — achados 1, 2 e 3 da
 * delivery-review do CTG-0002.
 *
 * Achado 1 (§4.3 passo 4): a transação **do item** contém o efeito de domínio,
 * `sync_queue_item.status`/`server_entity_id`, `sync_receipt.status` e os
 * eventos. Se qualquer um desses passos falhar, **nada** persiste — inclusive o
 * efeito de domínio já gravado pelo applier.
 * Achado 2 (§4.1 passos 9–10): `ops.sync_batch` é persistido **antes** dos
 * envelopes, e todo envelope de item leva `data.batchId` = id persistido.
 * Achado 3 (§4.1 passo 4): sem lote anterior, `last = 0`.
 */

/**
 * Reserva `reserved` do device+turno cobrindo `[number, end]`. §5.10: há no
 * máximo uma reserva `reserved` por dispositivo e turno, então a reserva
 * vigente de um caso anterior deste arquivo é liquidada (`consumed`) antes de
 * a nova nascer — o estado semeado é sempre um que o protocolo admite.
 */
async function seedReservationFor(
  deviceId: string,
  number: number,
  end: number = number,
): Promise<string> {
  const id = randomUUID();
  await client.query(`select set_config('app.role', 'owner', false)`);
  await client.query(`select set_config('app.tenant_id', $1, false)`, [
    tenantId,
  ]);
  await client.query(
    `update ops.numbering_reservation set status = 'consumed'
      where tenant_id = $1 and device_id = $2 and shift_id = $3
        and status = 'reserved'`,
    [tenantId, deviceId, field.shiftId],
  );
  await client.query(
    `insert into ops.numbering_reservation
       (id, tenant_id, range_id, traffic_agency_id, agent_id, device_id, shift_id,
        idempotency_key, start_number, end_number, valid_until, status)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
             '2026-12-31T23:59:59-04:00', 'reserved')`,
    [
      id,
      tenantId,
      field.rangeId,
      field.agencyId,
      field.agentId,
      deviceId,
      field.shiftId,
      `atomicity-${id.slice(0, 8)}`,
      number,
      end,
    ],
  );
  return id;
}

/**
 * Applier-dublê que grava o efeito de domínio completo da §4.6 (AIT em
 * `RECEBIDO` + `numbering_consumption('aplicado')`) na transação recebida.
 */
function domainApplier(number: number, reservationId: string) {
  /**
   * Conta as invocações de `apply`: sem isso o caso negativo passaria
   * vacuamente se o protocolo sequer chegasse a aplicar o item — a asserção
   * "nada persiste" só prova algo depois que o efeito de domínio foi escrito.
   */
  const calls = { apply: 0 };
  return {
    calls,
    entityType: 'ait',
    validate: () => null,
    apply: async (
      item: { localEntityId: string; idempotencyKey: string },
      tx: unknown,
    ) => {
      calls.apply += 1;
      const serverEntityId = randomUUID();
      const query = (
        tx as {
          query(sql: string, values: readonly unknown[]): Promise<unknown>;
        }
      ).query.bind(tx);
      await query(
        `insert into inf.ait_ait
           (id, tenant_id, traffic_agency_id, ait_number, series, agent_id,
            shift_id, device_id, framing_id, catalog_id, infraction_at,
            issued_at, issuance_mode, constatation_type, had_approach,
            location_description, uf, current_status, content_hash)
         values ($1, $2, $3, $4, 'F', $5, $6, $7, $8, $9,
                 '2026-09-14T13:00:00-04:00', '2026-09-14T13:05:00-04:00',
                 'eletronico', 'abordagem', true, 'Av. Djalma Batista',
                 'AM', 'RECEBIDO', 'sha256:atomicity')`,
        [
          serverEntityId,
          tenantId,
          field.agencyId,
          String(number),
          field.agentId,
          field.shiftId,
          field.deviceId,
          FIXTURES.framingId,
          FIXTURES.catalogId,
        ],
      );
      await query(
        `insert into ops.numbering_consumption
           (tenant_id, reservation_id, range_id, number, local_entity_id,
            idempotency_key, server_entity_id, finalized_at, status)
         values ($1, $2, $3, $4, $5, $6, $7, '2026-09-14T13:05:00-04:00',
                 'aplicado')`,
        [
          tenantId,
          reservationId,
          field.rangeId,
          number,
          item.localEntityId,
          item.idempotencyKey,
          serverEntityId,
        ],
      );
      return { serverEntityId };
    },
  };
}

async function freshDevice(): Promise<string> {
  const id = randomUUID();
  await client.query(`select set_config('app.role', 'owner', false)`);
  await client.query(`select set_config('app.tenant_id', $1, false)`, [
    tenantId,
  ]);
  await client.query(
    `insert into ops.ops_operational_device
       (id, tenant_id, traffic_agency_id, hardware_identifier_hash, os_name,
        status, app_version, tamper_flag)
     values ($1, $2, $3, $4, 'android', 'authorized', '1.0.0', false)`,
    [id, tenantId, field.agencyId, `sha256:fresh-${id.slice(0, 8)}`],
  );
  return id;
}

describe('CTG-0002 §4.3 passo 4 — a transação do item é uma só (achado 1)', () => {
  it('dado um item cujo efeito de domínio é gravado e cujo passo seguinte da mesma transação falha então nada persiste: nem o AIT, nem o consumo, nem sync_queue_item/sync_receipt applied', async () => {
    const number = 2026000101;
    const reservationId = await seedReservationFor(field.deviceId, number);
    const applier = domainApplier(number, reservationId);
    /**
     * O recibo `received` é criado **antes** do `apply` (§4.8: o item carrega
     * `receiptId` de uma linha já existente), então a falha precisa vir do
     * passo que a §4.3 passo 4 põe **dentro** da mesma transação: a promoção de
     * `sync_queue_item`/`sync_receipt` a `applied`. O dublê deixa o applier
     * gravar o efeito e quebra na primeira dessas escritas. Se elas estiverem
     * na transação do item, o efeito de domínio some junto; se estiverem numa
     * transação posterior (o defeito), o AIT sobrevive e este caso acusa.
     */
    const deps = commandDeps(client, tenantId, actorId, {
      appliers: [applier],
    });
    for (const store of ['items', 'receipts'] as const) {
      const target = deps.repositories[store];
      const original = target.update.bind(target);
      target.update = async (
        id: string,
        patch: Record<string, unknown>,
      ): Promise<Record<string, unknown> | undefined> => {
        if (applier.calls.apply > 0 && patch.status === 'applied')
          throw new Error(
            `falha injetada na promoção de ${store} a applied, dentro da transação do item`,
          );
        return original(id, patch);
      };
    }
    const idempotencyKey = `atomic-${randomUUID().slice(0, 8)}`;
    const input = batchInput();
    (input.items as Record<string, unknown>[])[0]!.idempotency_key =
      idempotencyKey;
    const aitBefore = await countRows('inf.ait_ait', 'tenant_id = $1', [
      tenantId,
    ]);
    const consumptionBefore = await countRows(
      'ops.numbering_consumption',
      'tenant_id = $1',
      [tenantId],
    );
    // O protocolo pode propagar o erro ou devolver o lote com o item não
    // aplicado — o que a §4.3 fixa é que **nada** do efeito de domínio sobrevive.
    const outcome = await submitBatch(deps, input).then(
      (response) => ({ kind: 'resolved' as const, response }),
      (error: unknown) => ({ kind: 'rejected' as const, error }),
    );
    expect(
      applier.calls.apply,
      'o applier precisa ter gravado o efeito de domínio antes da falha; sem isso o caso não prova atomicidade',
    ).toBeGreaterThan(0);
    expect(
      await countRows('inf.ait_ait', 'tenant_id = $1 and ait_number = $2', [
        tenantId,
        String(number),
      ]),
      `o AIT do item não pode sobreviver à falha do passo seguinte (resultado: ${outcome.kind})`,
    ).toBe(0);
    expect(await countRows('inf.ait_ait', 'tenant_id = $1', [tenantId])).toBe(
      aitBefore,
    );
    expect(
      await countRows('ops.numbering_consumption', 'tenant_id = $1', [
        tenantId,
      ]),
    ).toBe(consumptionBefore);
    expect(
      await countRows(
        'ops.sync_queue_item',
        'tenant_id = $1 and idempotency_key = $2 and status = $3',
        [tenantId, idempotencyKey, 'applied'],
      ),
    ).toBe(0);
    expect(
      await countRows(
        'ops.sync_receipt',
        'tenant_id = $1 and idempotency_key = $2 and status = $3',
        [tenantId, idempotencyKey, 'applied'],
      ),
    ).toBe(0);
  });

  it('dado o mesmo item com a gravação do recibo livre então item, recibo e efeito de domínio são commitados juntos e coerentes (server_entity_id igual nos três)', async () => {
    const number = 2026000102;
    const reservationId = await seedReservationFor(field.deviceId, number);
    const deps = commandDeps(client, tenantId, actorId, {
      appliers: [domainApplier(number, reservationId)],
    });
    const input = batchInput();
    const idempotencyKey = (input.items as { idempotency_key: string }[])[0]!
      .idempotency_key;
    const response = await submitBatch(deps, input);
    expect((response.receipts as { status: string }[])[0]?.status).toBe(
      'applied',
    );
    await client.query(`select set_config('app.role', 'owner', false)`);
    const item = await client.query<{
      status: string;
      server_entity_id: string;
    }>(
      `select status, server_entity_id from ops.sync_queue_item
        where tenant_id = $1 and idempotency_key = $2`,
      [tenantId, idempotencyKey],
    );
    const receipt = await client.query<{
      status: string;
      server_entity_id: string;
      applied_at: string | null;
    }>(
      `select status, server_entity_id, applied_at from ops.sync_receipt
        where tenant_id = $1 and idempotency_key = $2`,
      [tenantId, idempotencyKey],
    );
    expect(item.rows[0]?.status).toBe('applied');
    expect(receipt.rows[0]?.status).toBe('applied');
    expect(receipt.rows[0]?.applied_at).not.toBeNull();
    expect(receipt.rows[0]?.server_entity_id).toBe(
      item.rows[0]?.server_entity_id,
    );
    const ait = await client.query<{ current_status: string }>(
      'select current_status from inf.ait_ait where id = $1',
      [item.rows[0]?.server_entity_id],
    );
    expect(ait.rows[0]?.current_status).toBe('RECEBIDO');
    const consumption = await client.query<{ status: string }>(
      `select status from ops.numbering_consumption
        where tenant_id = $1 and reservation_id = $2`,
      [tenantId, reservationId],
    );
    expect(consumption.rows[0]?.status).toBe('aplicado');
  });
});

describe('CTG-0002 §4.1 passos 9–10 — o lote é persistido antes dos envelopes (achado 2)', () => {
  it('dado um lote aplicado então todo envelope sync.batch.received do lote leva data.batchId = ops.sync_batch.id (nunca null) e é gravado depois da linha do lote', async () => {
    const number = 2026000103;
    const reservationId = await seedReservationFor(field.deviceId, number);
    const deps = commandDeps(client, tenantId, actorId, {
      appliers: [domainApplier(number, reservationId)],
    });
    const deviceBatchId = `order-${randomUUID().slice(0, 8)}`;
    const response = await submitBatch(
      deps,
      batchInput({ device_batch_id: deviceBatchId }),
    );
    const batchId = response.batchId as string;
    expect(batchId).toEqual(expect.any(String));
    await client.query(`select set_config('app.role', 'owner', false)`);
    const persisted = await client.query<{
      id: string;
      submitted_at: string;
    }>(
      `select id, submitted_at from ops.sync_batch
        where tenant_id = $1 and device_batch_id = $2`,
      [tenantId, deviceBatchId],
    );
    expect(persisted.rows[0]?.id).toBe(batchId);
    const envelopes = await client.query<{
      batch_id: string | null;
      created_at: string;
      topic: string;
    }>(
      `select payload->'data'->>'batchId' as batch_id, created_at, topic
         from integration.outbox
        where tenant_id = $1 and payload->'data'->>'deviceBatchId' = $2
        order by created_at, id`,
      [tenantId, deviceBatchId],
    );
    expect(envelopes.rows.length).toBeGreaterThan(0);
    for (const envelope of envelopes.rows) {
      expect(
        envelope.batch_id,
        `envelope ${envelope.topic} saiu com data.batchId nulo: o lote precisa ser persistido antes dos eventos (§4.1 passos 9–10)`,
      ).toBe(batchId);
      expect(new Date(envelope.created_at).getTime()).toBeGreaterThanOrEqual(
        new Date(persisted.rows[0]!.submitted_at).getTime(),
      );
    }
  });
});

describe('CTG-0002 §4.1 passo 4 — primeiro lote sequenciado do device (achado 3)', () => {
  it('dado um device sem lote anterior quando chega batch_sequence = 2 então 422 TEAT.SYNC_BATCH_SEQUENCE_GAP com expectedSequence 1 e received 2, e nenhum sync_batch é gravado; em seguida batch_sequence = 1 é aceito', async () => {
    const deviceId = await freshDevice();
    const number = 2026000104;
    const reservationId = await seedReservationFor(deviceId, number);
    const deps = commandDeps(client, tenantId, actorId, {
      appliers: [domainApplier(number, reservationId)],
    });
    await expect(
      submitBatch(deps, batchInput({ device_id: deviceId, batch_sequence: 2 })),
    ).rejects.toMatchObject({
      code: 'TEAT.SYNC_BATCH_SEQUENCE_GAP',
      status: 422,
      context: expect.objectContaining({ expectedSequence: 1, received: 2 }),
    });
    expect(
      await countRows('ops.sync_batch', 'tenant_id = $1 and device_id = $2', [
        tenantId,
        deviceId,
      ]),
    ).toBe(0);
    const accepted = await submitBatch(
      deps,
      batchInput({ device_id: deviceId, batch_sequence: 1 }),
    );
    expect(accepted.batch_sequence).toBe(1);
    expect(
      await countRows('ops.sync_batch', 'tenant_id = $1 and device_id = $2', [
        tenantId,
        deviceId,
      ]),
    ).toBe(1);
  });
});

/**
 * CTG-0002 §14 consequência (c) (R-0008, TASK-0004 iteração 4) — achado do
 * ciclo 3 da delivery-review.
 *
 * A §14 reordenou o lote: `ops.sync_batch` nasce no passo 5, **antes** de
 * qualquer item, e o fechamento (`accepted_items`, `receipts_json.item_ids`) é
 * o passo 9. Um lote interrompido entre 5 e 9 fica durável com o conjunto de
 * itens materializados **incompleto** — e, reenviado com o mesmo
 * `device_batch_id` e o mesmo conjunto de itens, é replay legítimo: devolve os
 * recibos já emitidos sem reaplicar e **completa** a materialização dos que
 * faltam.
 *
 * Nota sobre o negativo. A §14 (c) fixa a comparação contra o conjunto
 * **materializado**; só com ele, "chave nova que não estava no envio original"
 * e "item que ainda faltava materializar" são indistinguíveis. A implementação
 * de TASK-0005 fecha essa lacuna gravando no passo 5, em
 * `ops.sync_batch.receipts_json.declared_keys`, o conjunto **declarado** no
 * envio original — chave de conveniência da implementação, **sem** linha no
 * contrato (proposta de OD no relatório da tarefa). Os casos abaixo cobrem os
 * dois regimes: com `declared_keys` gravado, o reenvio precisa casar o conjunto
 * declarado (omitir ou acrescentar chave → 409); sem ele (linha anterior a esta
 * adenda), vale a letra da §14 (c) — materializadas ⊆ reenviadas é replay
 * legítimo e completa o que falta.
 */
describe('CTG-0002 §14 (c) — replay de lote interrompido completa a materialização', () => {
  /** Applier que conta as invocações por `idempotency_key`. */
  function countingApplier(reservationByNumber: Map<number, string>) {
    const numbers = [...reservationByNumber.keys()].sort((a, b) => a - b);
    const calls = new Map<string, number>();
    let used = 0;
    return {
      calls,
      entityType: 'ait',
      validate: () => null,
      apply: async (
        item: { localEntityId: string; idempotencyKey: string },
        tx: unknown,
      ) => {
        calls.set(
          item.idempotencyKey,
          (calls.get(item.idempotencyKey) ?? 0) + 1,
        );
        const number = numbers[used++]!;
        const reservationId = reservationByNumber.get(number)!;
        const serverEntityId = randomUUID();
        const query = (
          tx as {
            query(sql: string, values: readonly unknown[]): Promise<unknown>;
          }
        ).query.bind(tx);
        await query(
          `insert into inf.ait_ait
             (id, tenant_id, traffic_agency_id, ait_number, series, agent_id,
              shift_id, device_id, framing_id, catalog_id, infraction_at,
              issued_at, issuance_mode, constatation_type, had_approach,
              location_description, uf, current_status, content_hash)
           values ($1, $2, $3, $4, 'F', $5, $6, $7, $8, $9,
                   '2026-09-14T13:00:00-04:00', '2026-09-14T13:05:00-04:00',
                   'eletronico', 'abordagem', true, 'Av. Djalma Batista',
                   'AM', 'RECEBIDO', 'sha256:resume')`,
          [
            serverEntityId,
            tenantId,
            field.agencyId,
            String(number),
            field.agentId,
            field.shiftId,
            field.deviceId,
            FIXTURES.framingId,
            FIXTURES.catalogId,
          ],
        );
        await query(
          `insert into ops.numbering_consumption
             (tenant_id, reservation_id, range_id, number, local_entity_id,
              idempotency_key, server_entity_id, finalized_at, status)
           values ($1, $2, $3, $4, $5, $6, $7, '2026-09-14T13:05:00-04:00',
                   'aplicado')`,
          [
            tenantId,
            reservationId,
            field.rangeId,
            number,
            item.localEntityId,
            item.idempotencyKey,
            serverEntityId,
          ],
        );
        return { serverEntityId };
      },
    };
  }

  /** Item completo do lote, com hash canônico do próprio payload. */
  function resumeItem(key: string): Record<string, unknown> {
    const payload = aitPayload('2026000201');
    return {
      entity_type: 'ait',
      local_entity_id: randomUUID(),
      idempotency_key: key,
      created_locally_at: '2026-09-14T13:05:00.000Z',
      payload_json: payload,
      payload_hash: canonicalHash(payload),
    };
  }

  /**
   * Arranja o lote interrompido: a linha de `ops.sync_batch` do passo 5 existe
   * com `accepted_items = 0` e `receipts_json.item_ids` contendo **só** o
   * primeiro item, que já tem `sync_queue_item` e `sync_receipt` `received`.
   */
  async function interruptedBatch(
    deviceId: string,
    deviceBatchId: string,
    first: Record<string, unknown>,
    declaredKeys?: readonly string[],
  ): Promise<{ batchId: string; itemId: string; receiptId: string }> {
    const batchId = randomUUID();
    const itemId = randomUUID();
    const receiptId = randomUUID();
    await client.query(`select set_config('app.role', 'owner', false)`);
    await client.query(`select set_config('app.tenant_id', $1, false)`, [
      tenantId,
    ]);
    await client.query(
      `insert into ops.sync_batch
         (id, tenant_id, traffic_agency_id, agent_id, device_id, device_batch_id,
          batch_sequence, submitted_at, accepted_items, receipts_json)
       values ($1, $2, $3, $4, $5, $6, 1, '2026-09-14T13:06:00-04:00', 0,
               '{"item_ids": []}'::jsonb)`,
      [
        batchId,
        tenantId,
        field.agencyId,
        field.agentId,
        deviceId,
        deviceBatchId,
      ],
    );
    await client.query(
      `insert into ops.sync_queue_item
         (id, tenant_id, traffic_agency_id, device_id, agent_id, entity_type,
          local_entity_id, status, created_locally_at, idempotency_key,
          payload_hash, payload_json)
       values ($1, $2, $3, $4, $5, 'ait', $6, 'received', $7, $8, $9, $10)`,
      [
        itemId,
        tenantId,
        field.agencyId,
        deviceId,
        field.agentId,
        first.local_entity_id,
        first.created_locally_at,
        first.idempotency_key,
        first.payload_hash,
        JSON.stringify(first.payload_json),
      ],
    );
    await client.query(
      `insert into ops.sync_receipt
         (id, tenant_id, sync_queue_item_id, idempotency_key, entity_type,
          local_entity_id, accepted_hash, status, reason_code)
       values ($1, $2, $3, $4, 'ait', $5, $6, 'received', null)`,
      [
        receiptId,
        tenantId,
        itemId,
        first.idempotency_key,
        first.local_entity_id,
        first.payload_hash,
      ],
    );
    await client.query(
      `update ops.sync_batch set receipts_json = $2::jsonb where id = $1`,
      [
        batchId,
        JSON.stringify(
          declaredKeys
            ? { item_ids: [itemId], declared_keys: [...declaredKeys] }
            : { item_ids: [itemId] },
        ),
      ],
    );
    return { batchId, itemId, receiptId };
  }

  /**
   * Os dois números dos itens do lote numa só reserva `reserved` do
   * dispositivo e turno (§5.10 admite uma por dispositivo e turno); o mapa
   * número → reserva que os casos consomem continua o mesmo.
   */
  async function seedTwoReservations(
    deviceId: string,
  ): Promise<Map<number, string>> {
    const numbers = [2026000201, 2026000202];
    const reservationId = await seedReservationFor(
      deviceId,
      numbers[0]!,
      numbers[1]!,
    );
    return new Map(numbers.map((number) => [number, reservationId]));
  }

  it('dado um lote interrompido depois do passo 5, com só o primeiro de dois itens materializado, quando reenviado com o mesmo device_batch_id e os mesmos dois itens então 200: o recibo do item já emitido volta sem reaplicar e o item faltante é materializado e aplicado', async () => {
    const deviceId = await freshDevice();
    const reservations = await seedTwoReservations(deviceId);
    const deviceBatchId = `resume-${randomUUID().slice(0, 8)}`;
    const first = resumeItem(`resume-first-${randomUUID().slice(0, 8)}`);
    const second = resumeItem(`resume-second-${randomUUID().slice(0, 8)}`);
    const interrupted = await interruptedBatch(deviceId, deviceBatchId, first, [
      first.idempotency_key as string,
      second.idempotency_key as string,
    ]);
    const applier = countingApplier(reservations);
    const deps = commandDeps(client, tenantId, actorId, {
      appliers: [applier],
    });

    const response = await submitBatch(deps, {
      traffic_agency_id: field.agencyId,
      device_id: deviceId,
      agent_id: field.agentId,
      device_batch_id: deviceBatchId,
      batch_sequence: 1,
      items: [first, second],
    });

    expect(response.batchId).toBe(interrupted.batchId);
    const receipts = response.receipts as {
      idempotency_key: string;
      status: string;
    }[];
    expect(receipts).toHaveLength(2);
    const firstReceipt = receipts.find(
      (receipt) => receipt.idempotency_key === first.idempotency_key,
    );
    const secondReceipt = receipts.find(
      (receipt) => receipt.idempotency_key === second.idempotency_key,
    );
    // (c) "devolve os recibos já emitidos sem reaplicar"
    expect(firstReceipt?.status).toBe('received');
    expect(
      applier.calls.get(first.idempotency_key as string) ?? 0,
      'o item já materializado não pode ser reaplicado no replay (§14 c)',
    ).toBe(0);
    // (c) "completa a materialização dos itens que faltam"
    expect(secondReceipt?.status).toBe('applied');
    expect(applier.calls.get(second.idempotency_key as string) ?? 0).toBe(1);

    await client.query(`select set_config('app.role', 'owner', false)`);
    const closed = await client.query<{
      accepted_items: number;
      receipts_json: { item_ids?: string[] };
    }>(
      'select accepted_items, receipts_json from ops.sync_batch where id = $1',
      [interrupted.batchId],
    );
    // passo 9: o lote fecha com os dois itens; `received` + `applied` contam.
    expect(closed.rows[0]?.accepted_items).toBe(2);
    const itemIds = closed.rows[0]?.receipts_json?.item_ids ?? [];
    expect(itemIds).toHaveLength(2);
    expect(itemIds).toContain(interrupted.itemId);
    const persisted = await client.query<{ count: string }>(
      `select count(*)::text as count from ops.sync_queue_item
        where tenant_id = $1 and idempotency_key = any($2::text[])`,
      [tenantId, [first.idempotency_key, second.idempotency_key]],
    );
    expect(Number(persisted.rows[0]!.count)).toBe(2);
    const applied = await client.query<{ count: string }>(
      `select count(*)::text as count from ops.sync_receipt
        where tenant_id = $1 and idempotency_key = $2 and status = 'applied'`,
      [tenantId, second.idempotency_key],
    );
    expect(Number(applied.rows[0]!.count)).toBe(1);
  });

  it('dado o mesmo lote interrompido quando reenviado **omitindo** a chave já materializada então 409 TEAT.SYNC_BATCH_REPLAY_CONTEXT_MISMATCH com context.deviceBatchId', async () => {
    const deviceId = await freshDevice();
    const reservations = await seedTwoReservations(deviceId);
    const deviceBatchId = `resume-miss-${randomUUID().slice(0, 8)}`;
    const first = resumeItem(`miss-first-${randomUUID().slice(0, 8)}`);
    const second = resumeItem(`miss-second-${randomUUID().slice(0, 8)}`);
    await interruptedBatch(deviceId, deviceBatchId, first, [
      first.idempotency_key as string,
      second.idempotency_key as string,
    ]);
    const deps = commandDeps(client, tenantId, actorId, {
      appliers: [countingApplier(reservations)],
    });
    await expect(
      submitBatch(deps, {
        traffic_agency_id: field.agencyId,
        device_id: deviceId,
        agent_id: field.agentId,
        device_batch_id: deviceBatchId,
        batch_sequence: 1,
        items: [second],
      }),
    ).rejects.toMatchObject({
      code: 'TEAT.SYNC_BATCH_REPLAY_CONTEXT_MISMATCH',
      status: 409,
      context: expect.objectContaining({ deviceBatchId }),
    });
  });

  it('dado um lote interrompido cujo envio original declarou duas chaves quando reenviado com uma chave que **não** estava nesse envio então 409 TEAT.SYNC_BATCH_REPLAY_CONTEXT_MISMATCH — o replay completa o que faltava, nunca aceita item novo', async () => {
    const deviceId = await freshDevice();
    const reservations = await seedTwoReservations(deviceId);
    const deviceBatchId = `resume-extra-${randomUUID().slice(0, 8)}`;
    const first = resumeItem(`extra-first-${randomUUID().slice(0, 8)}`);
    const second = resumeItem(`extra-second-${randomUUID().slice(0, 8)}`);
    const intruder = resumeItem(`extra-intruder-${randomUUID().slice(0, 8)}`);
    await interruptedBatch(deviceId, deviceBatchId, first, [
      first.idempotency_key as string,
      second.idempotency_key as string,
    ]);
    const deps = commandDeps(client, tenantId, actorId, {
      appliers: [countingApplier(reservations)],
    });
    await expect(
      submitBatch(deps, {
        traffic_agency_id: field.agencyId,
        device_id: deviceId,
        agent_id: field.agentId,
        device_batch_id: deviceBatchId,
        batch_sequence: 1,
        items: [first, intruder],
      }),
    ).rejects.toMatchObject({
      code: 'TEAT.SYNC_BATCH_REPLAY_CONTEXT_MISMATCH',
      status: 409,
      context: expect.objectContaining({ deviceBatchId }),
    });
  });

  it('dado um lote interrompido **sem** o conjunto declarado gravado (linha anterior a esta adenda) quando reenviado com as mesmas chaves materializadas mais as faltantes então 200 — a comparação cai no conjunto materializado, como diz a §14 (c)', async () => {
    const deviceId = await freshDevice();
    const reservations = await seedTwoReservations(deviceId);
    const deviceBatchId = `resume-legacy-${randomUUID().slice(0, 8)}`;
    const first = resumeItem(`legacy-first-${randomUUID().slice(0, 8)}`);
    const second = resumeItem(`legacy-second-${randomUUID().slice(0, 8)}`);
    const interrupted = await interruptedBatch(deviceId, deviceBatchId, first);
    const applier = countingApplier(reservations);
    const deps = commandDeps(client, tenantId, actorId, {
      appliers: [applier],
    });
    const response = await submitBatch(deps, {
      traffic_agency_id: field.agencyId,
      device_id: deviceId,
      agent_id: field.agentId,
      device_batch_id: deviceBatchId,
      batch_sequence: 1,
      items: [first, second],
    });
    expect(response.batchId).toBe(interrupted.batchId);
    expect(response.receipts).toHaveLength(2);
    expect(applier.calls.get(first.idempotency_key as string) ?? 0).toBe(0);
    expect(applier.calls.get(second.idempotency_key as string) ?? 0).toBe(1);
  });
});
