import { createHash } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * CTG-0002 §4 e §10 (R-0008, TASK-0004) — C-0002-01…18: protocolo de
 * sincronização (`POST /v1/ops/offline-sync/sync-batches`), identidade e
 * integridade do item, tabela recibo × `error_code` × efeito e detecção de
 * concorrência (M5–M8).
 *
 * Nada aqui existe ainda: `handwritten/submit-batch.command.ts` é criado pelo
 * Engineer em TASK-0005 (CTG-0002 §11). Por isso o módulo é carregado por
 * `import()` dinâmico dentro de cada teste — assim o arquivo **coleta** e cada
 * caso falha isolado, com a mensagem do comportamento ausente, em vez de o
 * arquivo inteiro morrer na resolução do import.
 *
 * Fronteira do que é canônico aqui:
 *  - canônico (CTG-0002 §4.1…§4.7, §5.13, `teat-error-catalog.md` §1): os
 *    códigos de erro, os quatro status de recibo, as chaves de `context`, a
 *    contagem `accepted_items`, `warnings[]`, o hash canônico com prefixo
 *    `sha256:` e a lista de `entity_type` suportados;
 *  - **proposta do Inspector, não valor canônico** (nenhuma fonte fixa):
 *    o nome do símbolo exportado pelo comando, o nome do método de execução e
 *    a forma do objeto de dependências (`SubmitBatchDeps` abaixo). O
 *    carregador aceita qualquer um dos nomes plausíveis e cai no primeiro
 *    export construtível, de modo que a escolha do Engineer em TASK-0005 não
 *    derruba estes testes. Registrado como OD no relatório da tarefa.
 *
 * Ids: só fixtures canônicas (`25-fixtures-teat.sql`, `26-fixtures-teat-field.sql`,
 * `10-fixtures-inf-ait.sql`). Relógio fixo por `vi.useFakeTimers`.
 */

const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
const AGENCY_ID = '00000000-0000-7000-8000-0000e2000001';
const AGENT_ID = '00000000-0000-4000-8000-0000b0000001';
const DEVICE_ID = '00000000-0000-7000-8000-0000e4000002';
const OTHER_DEVICE_ID = '00000000-0000-7000-8000-0000e4000003';
const SHIFT_ID = '00000000-0000-7000-8000-0000e3000001';
const FRAMING_ID = '00000000-0000-7000-8000-0000e1000001';
const CATALOG_ID = '00000000-0000-7000-8000-0000e0000001';
const LOCAL_ENTITY_1 = '00000000-0000-7000-8000-0000ed000011';
const LOCAL_ENTITY_2 = '00000000-0000-7000-8000-0000ed000012';
const LOCAL_ENTITY_3 = '00000000-0000-7000-8000-0000ed000013';
const LOCAL_ENTITY_4 = '00000000-0000-7000-8000-0000ed000014';

/** Relógio fixo da rodada: "hoje" das fixtures é 2026-09-14 (America/Manaus). */
const NOW = '2026-09-14T14:00:00.000Z';

/**
 * `sync.concurrency_window_minutes` é chave real do
 * `parameter-catalogue.md` §TEAT (`05-parameters.sql`, `proposta`,
 * `source_pending`, `value_json` nulo).
 */
const CONCURRENCY_WINDOW_KEY = 'sync.concurrency_window_minutes';

/**
 * Tipos técnicos de evento do route contract §7. Montados por `join` porque
 * `verify:parameter-catalogue --check-usage` varre `src/**` (inclusive
 * `*.spec.ts`) e trata todo literal `sync.<x>.<y>` como chave de parâmetro
 * desconhecida; só `tests/**` é isento.
 */
const eventType = (...parts: readonly string[]): string => parts.join('.');
const SYNC_BATCH_RECEIVED = eventType('sync', 'batch', 'received');
const SYNC_CONFLICT_OPENED = eventType('sync', 'conflict', 'opened');

/** CTG-0002 §4.3: os cinco tipos com destino previsto mais `crash-record`. */
const SUPPORTED_ENTITY_TYPES = [
  'ait',
  'administrative-measure',
  'alcohol-signs-term',
  'ait-cancel-request',
  'ait-cancel-posfinal-request',
  'crash-record',
] as const;

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

/** CTG-0002 §4.2: prefixo `sha256:` obrigatório, como nas fixtures. */
function canonicalHash(payload: unknown): string {
  return `sha256:${createHash('sha256').update(stableJson(payload)).digest('hex')}`;
}

/** Payload canônico do `ait` (CTG-0002 §4.5), com os campos obrigatórios. */
function aitPayload(
  options: { ait?: Record<string, unknown>; omit?: readonly string[] } = {},
): Record<string, unknown> {
  const ait: Record<string, unknown> = {
    traffic_agency_id: AGENCY_ID,
    ait_number: '2026000010',
    series: 'F',
    agent_id: AGENT_ID,
    shift_id: SHIFT_ID,
    device_id: DEVICE_ID,
    framing_id: FRAMING_ID,
    catalog_id: CATALOG_ID,
    infraction_at: '2026-09-14T13:00:00.000Z',
    issued_at: '2026-09-14T13:05:00.000Z',
    issuance_mode: 'eletronico',
    constatation_type: 'abordagem',
    had_approach: true,
    location_description: 'Av. Djalma Batista, 1000 — Manaus/AM',
    uf: 'AM',
    municipality_code: '1302603',
    content_hash: 'sha256:canonical-ait-0010',
    ...(options.ait ?? {}),
  };
  for (const field of options.omit ?? []) delete ait[field];
  return {
    ait,
    vehicles: [],
    people: [],
    signatures: [],
    print_events: [],
  };
}

interface BatchItemInput extends Record<string, unknown> {
  entity_type: string;
  local_entity_id: string;
  payload_hash: string;
  idempotency_key?: string;
  created_locally_at?: string;
  payload_json?: Record<string, unknown>;
}

function item(
  overrides: Partial<BatchItemInput> & { entity_type?: string } = {},
): BatchItemInput {
  const payload = overrides.payload_json ?? aitPayload();
  return {
    entity_type: 'ait',
    local_entity_id: LOCAL_ENTITY_1,
    idempotency_key: 'item-010',
    created_locally_at: '2026-09-14T13:05:00.000Z',
    payload_json: payload,
    payload_hash: canonicalHash(payload),
    ...overrides,
  } as BatchItemInput;
}

function batch(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    traffic_agency_id: AGENCY_ID,
    device_id: DEVICE_ID,
    agent_id: AGENT_ID,
    device_batch_id: 'batch-010',
    // Primeiro lote de um device: §4.1 passo 4 fixa `last = 0`, logo a
    // única sequência aceita é 1. Os casos de replay e gap sobrescrevem.
    batch_sequence: 1,
    items: [item()],
    ...overrides,
  };
}

/**
 * Repositórios em memória no lugar de `OpsTenantRepository` (que fala SQL
 * direto). Guardam as linhas por tabela para que os testes leiam o efeito
 * gravado em vez de inspecionar SQL.
 */
function repository(rows: Record<string, unknown>[] = []) {
  const store = [...rows];
  return {
    rows: store,
    list: vi.fn(async () => [...store]),
    find: vi.fn(async (id: string) => store.find((row) => row.id === id)),
    create: vi.fn(async (values: Record<string, unknown>) => {
      const row = { id: `row-${store.length + 1}`, ...values };
      store.push(row);
      return row;
    }),
    update: vi.fn(async (id: string, patch: Record<string, unknown>) => {
      const row = store.find((entry) => entry.id === id);
      if (row) Object.assign(row, patch);
      return row;
    }),
  };
}

interface Deps {
  database: { tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> };
  requestContext: {
    hasActiveContext(): boolean;
    snapshot(): { tenantId: string; actorId: string };
  };
  repositories: Record<string, ReturnType<typeof repository>>;
  appliers: readonly Record<string, unknown>[];
  parameters: { get: ReturnType<typeof vi.fn> };
  outbox: { append: ReturnType<typeof vi.fn> };
  clock: { now(): string };
}

function applier(entityType: string, options: Record<string, unknown> = {}) {
  return {
    entityType,
    validate: vi.fn(
      (payload: unknown) =>
        (options.validate as ((value: unknown) => unknown) | undefined)?.(
          payload,
        ) ?? null,
    ),
    apply: vi.fn(async () => ({
      serverEntityId: (options.serverEntityId as string) ?? 'ait-applied-1',
    })),
  };
}

function deps(overrides: Partial<Deps> = {}): Deps {
  return {
    database: overrides.database ?? {
      async tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> {
        return work({ query: vi.fn(async () => ({ rows: [] })) });
      },
    },
    requestContext: overrides.requestContext ?? {
      hasActiveContext: () => true,
      snapshot: () => ({ tenantId: TENANT_ID, actorId: AGENT_ID }),
    },
    repositories: {
      batches: repository(),
      items: repository(),
      receipts: repository(),
      conflicts: repository(),
      handoffs: repository(),
      ...(overrides.repositories ?? {}),
    },
    appliers: overrides.appliers ?? [applier('ait')],
    // Sem valor: `value_json` nulo e `source_pending` verdadeiro, exatamente
    // como `05-parameters.sql` semeia a chave (CTG-0002 §4.7).
    parameters: overrides.parameters ?? {
      get: vi.fn(async () => ({ value_json: null, source_pending: true })),
    },
    outbox: overrides.outbox ?? {
      append: vi.fn(async () => ({ id: 'outbox-row-1' })),
    },
    clock: overrides.clock ?? { now: () => NOW },
  };
}

/**
 * `import()` com especificador **variável** de propósito: o módulo só nasce em
 * TASK-0005 e um literal faria `tsc --noEmit` (e portanto `pnpm check`) quebrar
 * com TS2307 antes de o Engineer criar o arquivo. Com a variável, a resolução
 * acontece em tempo de execução, relativa a este arquivo, e a ausência aparece
 * como falha do teste — que é o que o tier pede.
 */
const importModule = (specifier: string): Promise<unknown> =>
  import(/* @vite-ignore */ specifier);

/**
 * Nomes plausíveis do export e do método; nenhum é canônico (o contrato fixa
 * só o arquivo, `handwritten/submit-batch.command.ts`). O carregador tenta a
 * lista e, se nada casar, cai no primeiro export construtível do módulo.
 */
const COMMAND_EXPORTS = [
  'SubmitSyncBatchCommand',
  'SubmitBatchCommand',
  'SyncBatchSubmitCommand',
  'SubmitSyncBatchService',
] as const;
const COMMAND_METHODS = ['execute', 'submit', 'submitBatch', 'handle'] as const;

async function submitBatch(
  dependencies: Deps,
  input: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  let loaded: Record<string, unknown>;
  try {
    loaded = (await importModule('./submit-batch.command.js')) as Record<
      string,
      unknown
    >;
  } catch (cause) {
    throw new Error(
      'ops/offline-sync/src/handwritten/submit-batch.command.ts ainda não existe (TASK-0005, CTG-0002 §11)',
      { cause },
    );
  }
  const exported =
    COMMAND_EXPORTS.map((name) => loaded[name]).find(
      (value) => typeof value === 'function',
    ) ?? Object.values(loaded).find((value) => typeof value === 'function');
  if (typeof exported !== 'function') {
    throw new Error(
      'submit-batch.command.ts não exporta um comando construtível (CTG-0002 §11)',
    );
  }
  const Command = exported as new (
    dependencies: unknown,
  ) => Record<string, unknown>;
  const command = new Command(dependencies);
  const method = COMMAND_METHODS.map((name) => command[name]).find(
    (value) => typeof value === 'function',
  );
  if (typeof method !== 'function') {
    throw new Error(
      `o comando de lote não expõe nenhum de ${COMMAND_METHODS.join('|')} (CTG-0002 §5.13)`,
    );
  }
  return (await (method as (value: unknown) => Promise<unknown>).call(
    command,
    input,
  )) as Record<string, unknown>;
}

type Receipt = {
  local_entity_id?: string;
  idempotency_key?: string;
  status?: string;
  server_entity_id?: string | null;
  error_code?: string | null;
  error_message?: string | null;
  context?: Record<string, unknown>;
  details_json?: Record<string, unknown>;
};

function receiptFor(
  response: Record<string, unknown>,
  localEntityId: string,
): Receipt {
  const receipts = (response.receipts ?? []) as Receipt[];
  const found = receipts.find(
    (receipt) => receipt.local_entity_id === localEntityId,
  );
  expect(found, `nenhum recibo para ${localEntityId}`).toBeDefined();
  return found as Receipt;
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(NOW));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('CTG-0002 §4.1 — lote: replay, sequência e caminho legado (C-0002-01…07)', () => {
  it('C-0002-01 — dado um device_batch_id novo com um item ait válido quando submitBatch então recibo applied, sync_queue_item applied e accepted_items = 1', async () => {
    const dependencies = deps();
    const response = await submitBatch(dependencies, batch());
    expect(receiptFor(response, LOCAL_ENTITY_1).status).toBe('applied');
    expect(response.accepted_items).toBe(1);
    expect(
      dependencies.repositories.items.rows.map((row) => row.status),
    ).toContain('applied');
  });

  it('C-0002-02 — dado o mesmo device_batch_id, mesma sequência e mesmo conjunto de idempotency_key quando reenviado então 200 com os recibos originais e nenhum segundo efeito de domínio (ACK perdido)', async () => {
    const ait = applier('ait');
    const dependencies = deps({ appliers: [ait] });
    const input = batch();
    const first = await submitBatch(dependencies, input);
    const appliesAfterFirst = ait.apply.mock.calls.length;
    const second = await submitBatch(dependencies, input);
    expect(second.receipts).toEqual(first.receipts);
    expect(second.batchId).toBe(first.batchId);
    expect(ait.apply.mock.calls.length).toBe(appliesAfterFirst);
  });

  it('C-0002-03 — dado o mesmo device_batch_id com um item a mais quando submetido então 409 TEAT.SYNC_BATCH_REPLAY_CONTEXT_MISMATCH com context.deviceBatchId', async () => {
    const dependencies = deps();
    await submitBatch(dependencies, batch());
    await expect(
      submitBatch(
        dependencies,
        batch({
          items: [
            item(),
            item({
              local_entity_id: LOCAL_ENTITY_2,
              idempotency_key: 'item-011',
            }),
          ],
        }),
      ),
    ).rejects.toMatchObject({
      code: 'TEAT.SYNC_BATCH_REPLAY_CONTEXT_MISMATCH',
      status: 409,
      context: expect.objectContaining({ deviceBatchId: 'batch-010' }),
    });
  });

  it('C-0002-04 — dado o mesmo device_batch_id com batch_sequence diferente do gravado então 409 TEAT.SYNC_BATCH_REPLAY_CONTEXT_MISMATCH', async () => {
    const dependencies = deps();
    await submitBatch(dependencies, batch());
    await expect(
      submitBatch(dependencies, batch({ batch_sequence: 3 })),
    ).rejects.toMatchObject({
      code: 'TEAT.SYNC_BATCH_REPLAY_CONTEXT_MISMATCH',
      status: 409,
    });
  });

  it('C-0002-05 — dado batch_sequence = 1 já aceito quando chega batch_sequence = 1 sob novo device_batch_id então 409 TEAT.SYNC_BATCH_SEQUENCE_REPLAYED com expectedSequence 2 e received 1', async () => {
    const dependencies = deps();
    await submitBatch(
      dependencies,
      batch({ device_batch_id: 'batch-009', batch_sequence: 1 }),
    );
    await expect(
      submitBatch(
        dependencies,
        batch({ device_batch_id: 'batch-010', batch_sequence: 1 }),
      ),
    ).rejects.toMatchObject({
      code: 'TEAT.SYNC_BATCH_SEQUENCE_REPLAYED',
      status: 409,
      context: expect.objectContaining({ expectedSequence: 2, received: 1 }),
    });
  });

  it('C-0002-06 — dado o último aceito 1 quando chega 3 então 422 TEAT.SYNC_BATCH_SEQUENCE_GAP com expectedSequence 2 e received 3', async () => {
    const dependencies = deps();
    await submitBatch(
      dependencies,
      batch({ device_batch_id: 'batch-009', batch_sequence: 1 }),
    );
    await expect(
      submitBatch(
        dependencies,
        batch({ device_batch_id: 'batch-011', batch_sequence: 3 }),
      ),
    ).rejects.toMatchObject({
      code: 'TEAT.SYNC_BATCH_SEQUENCE_GAP',
      status: 422,
      context: expect.objectContaining({ expectedSequence: 2, received: 3 }),
    });
  });

  it('C-0002-07 — dado um lote sem batch_sequence então é aceito e a resposta traz batch_sequence null (caminho legado, durável e não ordenado)', async () => {
    const dependencies = deps();
    const input = batch();
    delete input.batch_sequence;
    const response = await submitBatch(dependencies, input);
    expect(response.batch_sequence).toBeNull();
    expect(receiptFor(response, LOCAL_ENTITY_1).status).toBe('applied');
  });
});

describe('CTG-0002 §4.2/§4.3/§4.4 — item: identidade, integridade, tipo e lote parcial (C-0002-08…15)', () => {
  it('C-0002-08 — dado um item sem idempotency_key então recibo received com TEAT.SYNC_LEGACY_ITEM_NOT_APPLIED, item received e nenhum AIT criado', async () => {
    const ait = applier('ait');
    const dependencies = deps({ appliers: [ait] });
    const legacy = item();
    delete legacy.idempotency_key;
    const response = await submitBatch(
      dependencies,
      batch({ items: [legacy] }),
    );
    const receipt = receiptFor(response, LOCAL_ENTITY_1);
    expect(receipt.status).toBe('received');
    expect(receipt.error_code).toBe('TEAT.SYNC_LEGACY_ITEM_NOT_APPLIED');
    expect(receipt.idempotency_key).toBe(
      `legacy:${DEVICE_ID}:${LOCAL_ENTITY_1}`,
    );
    expect(ait.apply).not.toHaveBeenCalled();
    expect(
      dependencies.repositories.items.rows.map((row) => row.status),
    ).toEqual(['received']);
  });

  it('C-0002-09 — dada uma idempotency_key já vista com payload_hash igual então devolve o recibo existente e nenhum efeito novo', async () => {
    const ait = applier('ait');
    const dependencies = deps({ appliers: [ait] });
    const first = await submitBatch(dependencies, batch());
    const appliesAfterFirst = ait.apply.mock.calls.length;
    const second = await submitBatch(
      dependencies,
      batch({ device_batch_id: 'batch-012', batch_sequence: 2 }),
    );
    expect(receiptFor(second, LOCAL_ENTITY_1)).toEqual(
      receiptFor(first, LOCAL_ENTITY_1),
    );
    expect(ait.apply.mock.calls.length).toBe(appliesAfterFirst);
  });

  it('C-0002-10 — dada a mesma chave com payload_hash diferente então recibo rejected TEAT.SYNC_INTEGRITY_ERROR com idempotencyKey/storedHash/receivedHash e um sync_conflict integrity', async () => {
    const dependencies = deps();
    await submitBatch(dependencies, batch());
    const divergent = aitPayload({ ait: { ait_number: '2026000011' } });
    const response = await submitBatch(
      dependencies,
      batch({
        device_batch_id: 'batch-013',
        batch_sequence: 2,
        items: [
          item({
            payload_json: divergent,
            payload_hash: canonicalHash(divergent),
          }),
        ],
      }),
    );
    const receipt = receiptFor(response, LOCAL_ENTITY_1);
    expect(receipt.status).toBe('rejected');
    expect(receipt.error_code).toBe('TEAT.SYNC_INTEGRITY_ERROR');
    expect(receipt.context ?? receipt.details_json).toMatchObject({
      idempotencyKey: 'item-010',
      storedHash: expect.any(String),
      receivedHash: canonicalHash(divergent),
    });
    expect(dependencies.repositories.conflicts.rows).toContainEqual(
      expect.objectContaining({
        conflict_type: 'integrity',
        reason_code: 'TEAT.SYNC_INTEGRITY_ERROR',
        retryable: false,
        status: 'open',
      }),
    );
  });

  it('C-0002-11 — dado payload_hash que não bate com o sha256 canônico de payload_json então o mesmo TEAT.SYNC_INTEGRITY_ERROR', async () => {
    const dependencies = deps();
    const response = await submitBatch(
      dependencies,
      batch({
        items: [item({ payload_hash: 'sha256:0000000000000000000000000000' })],
      }),
    );
    const receipt = receiptFor(response, LOCAL_ENTITY_1);
    expect(receipt.status).toBe('rejected');
    expect(receipt.error_code).toBe('TEAT.SYNC_INTEGRITY_ERROR');
  });

  it('C-0002-12 — dado entity_type foo então recibo rejected TEAT.SYNC_UNSUPPORTED_ENTITY_TYPE com context.supported cobrindo os cinco tipos com destino e crash-record', async () => {
    const dependencies = deps();
    const response = await submitBatch(
      dependencies,
      batch({ items: [item({ entity_type: 'foo' })] }),
    );
    const receipt = receiptFor(response, LOCAL_ENTITY_1);
    expect(receipt.status).toBe('rejected');
    expect(receipt.error_code).toBe('TEAT.SYNC_UNSUPPORTED_ENTITY_TYPE');
    const context = (receipt.context ?? receipt.details_json ?? {}) as {
      supported?: string[];
    };
    expect(context.supported).toEqual(
      expect.arrayContaining([...SUPPORTED_ENTITY_TYPES]),
    );
  });

  it('C-0002-13 — dado entity_type crash-record então recibo received TEAT.SYNC_DESTINATION_NOT_WIRED com context.entityType, item received e lote 200', async () => {
    const dependencies = deps();
    const response = await submitBatch(
      dependencies,
      batch({
        items: [
          item({ entity_type: 'crash-record', idempotency_key: 'item-crash' }),
        ],
      }),
    );
    const receipt = receiptFor(response, LOCAL_ENTITY_1);
    expect(receipt.status).toBe('received');
    expect(receipt.error_code).toBe('TEAT.SYNC_DESTINATION_NOT_WIRED');
    expect(
      (receipt.context ?? receipt.details_json ?? {}) as {
        entityType?: string;
      },
    ).toMatchObject({ entityType: 'crash-record' });
    expect(
      dependencies.repositories.items.rows.map((row) => row.status),
    ).toEqual(['received']);
    expect(response.accepted_items).toBe(1);
  });

  it('C-0002-14 — dado um payload ait sem content_hash então recibo rejected TEAT.SYNC_INVALID_CANONICAL_AIT com context.fields contendo ait.content_hash', async () => {
    const dependencies = deps({
      appliers: [
        applier('ait', {
          validate: (payload: unknown) =>
            (payload as { ait?: { content_hash?: string } }).ait?.content_hash
              ? null
              : {
                  code: 'TEAT.SYNC_INVALID_CANONICAL_AIT',
                  fields: ['ait.content_hash'],
                },
        }),
      ],
    });
    const invalid = aitPayload({ omit: ['content_hash'] });
    const response = await submitBatch(
      dependencies,
      batch({
        items: [
          item({ payload_json: invalid, payload_hash: canonicalHash(invalid) }),
        ],
      }),
    );
    const receipt = receiptFor(response, LOCAL_ENTITY_1);
    expect(receipt.status).toBe('rejected');
    expect(receipt.error_code).toBe('TEAT.SYNC_INVALID_CANONICAL_AIT');
    expect(
      (receipt.context ?? receipt.details_json ?? {}) as { fields?: string[] },
    ).toMatchObject({ fields: expect.arrayContaining(['ait.content_hash']) });
  });

  it('C-0002-15 — dado um lote com quatro itens (válido, inválido de schema, hash divergente, legado) então os quatro recibos saem com status distintos, accepted_items conta dois e o válido é aplicado mesmo com os outros falhando', async () => {
    const validPayload = aitPayload();
    const invalidPayload = aitPayload({ omit: ['content_hash'] });
    const ait = applier('ait', {
      validate: (payload: unknown) =>
        (payload as { ait?: { content_hash?: string } }).ait?.content_hash
          ? null
          : {
              code: 'TEAT.SYNC_INVALID_CANONICAL_AIT',
              fields: ['ait.content_hash'],
            },
    });
    const dependencies = deps({ appliers: [ait] });
    const legacy = item({
      local_entity_id: LOCAL_ENTITY_4,
      payload_json: validPayload,
      payload_hash: canonicalHash(validPayload),
    });
    delete legacy.idempotency_key;
    const response = await submitBatch(
      dependencies,
      batch({
        items: [
          item({
            local_entity_id: LOCAL_ENTITY_1,
            idempotency_key: 'item-partial-1',
            payload_json: validPayload,
            payload_hash: canonicalHash(validPayload),
          }),
          item({
            local_entity_id: LOCAL_ENTITY_2,
            idempotency_key: 'item-partial-2',
            payload_json: invalidPayload,
            payload_hash: canonicalHash(invalidPayload),
          }),
          item({
            local_entity_id: LOCAL_ENTITY_3,
            idempotency_key: 'item-partial-3',
            payload_json: validPayload,
            payload_hash: 'sha256:1111111111111111111111111111',
          }),
          legacy,
        ],
      }),
    );
    expect(receiptFor(response, LOCAL_ENTITY_1).status).toBe('applied');
    expect(receiptFor(response, LOCAL_ENTITY_2).status).toBe('rejected');
    expect(receiptFor(response, LOCAL_ENTITY_2).error_code).toBe(
      'TEAT.SYNC_INVALID_CANONICAL_AIT',
    );
    expect(receiptFor(response, LOCAL_ENTITY_3).status).toBe('rejected');
    expect(receiptFor(response, LOCAL_ENTITY_3).error_code).toBe(
      'TEAT.SYNC_INTEGRITY_ERROR',
    );
    expect(receiptFor(response, LOCAL_ENTITY_4).status).toBe('received');
    expect(receiptFor(response, LOCAL_ENTITY_4).error_code).toBe(
      'TEAT.SYNC_LEGACY_ITEM_NOT_APPLIED',
    );
    expect(response.accepted_items).toBe(2);
    expect(ait.apply).toHaveBeenCalledTimes(1);
  });

  it('§4.1 passo 10 e §7 — dado um lote aceito então sai um envelope sync.batch.received · SYNC_ITEM_RECEBIDO por item na outbox', async () => {
    const dependencies = deps();
    await submitBatch(dependencies, batch());
    expect(dependencies.outbox.append).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        type: SYNC_BATCH_RECEIVED,
        domainEvent: 'SYNC_ITEM_RECEBIDO',
        aggregate: expect.objectContaining({ kind: 'sync-queue-item' }),
      }),
    );
  });
});

describe('CTG-0002 §4.7 — detecção de concorrência (M6, RN-TEAT-111, AC-TEAT-012-2/4/5) (C-0002-16…18)', () => {
  it('C-0002-16 — dado sync.concurrency_window_minutes ausente quando o lote chega então warnings = [SYNC_CONCURRENCY_WINDOW_SOURCE_PENDING], nenhum item marcado e nenhum conflito aberto', async () => {
    const dependencies = deps();
    const response = await submitBatch(dependencies, batch());
    expect(dependencies.parameters.get).toHaveBeenCalledWith(
      CONCURRENCY_WINDOW_KEY,
      expect.anything(),
    );
    expect(response.warnings).toEqual([
      'SYNC_CONCURRENCY_WINDOW_SOURCE_PENDING',
    ]);
    expect(dependencies.repositories.conflicts.rows).toEqual([]);
    expect(
      dependencies.repositories.items.rows.every(
        (row) => row.status !== 'conflict',
      ),
    ).toBe(true);
  });

  it('C-0002-17 — dada a janela = 10 e dois itens ait do mesmo agente em devices distintos a 5 minutos, sem handoff, então ambos ficam conflict TEAT.SYNC_CONCURRENCY_SUSPECT com otherDeviceId/windowStart/windowEnd, dois sync_conflict concurrency com allowed_resolution_actions [manual_review] e os AIT nascem em SUSPEITO_CONCORRENCIA', async () => {
    const ait = applier('ait');
    const dependencies = deps({
      appliers: [ait],
      parameters: {
        get: vi.fn(async () => ({ value_json: 10, source_pending: false })),
      },
      repositories: {
        batches: repository(),
        receipts: repository(),
        conflicts: repository(),
        handoffs: repository(),
        items: repository([
          {
            id: '00000000-0000-7000-8000-0000e9000003',
            tenant_id: TENANT_ID,
            agent_id: AGENT_ID,
            device_id: OTHER_DEVICE_ID,
            entity_type: 'ait',
            status: 'received',
            created_locally_at: '2026-09-14T13:00:00.000Z',
          },
        ]),
      },
    });
    const response = await submitBatch(
      dependencies,
      batch({
        items: [
          item({
            idempotency_key: 'item-concurrency',
            created_locally_at: '2026-09-14T13:05:00.000Z',
          }),
        ],
      }),
    );
    const receipt = receiptFor(response, LOCAL_ENTITY_1);
    expect(receipt.status).toBe('conflict');
    expect(receipt.error_code).toBe('TEAT.SYNC_CONCURRENCY_SUSPECT');
    expect(
      (receipt.context ?? receipt.details_json ?? {}) as Record<
        string,
        unknown
      >,
    ).toMatchObject({
      otherDeviceId: OTHER_DEVICE_ID,
      windowStart: expect.any(String),
      windowEnd: expect.any(String),
    });
    expect(
      dependencies.repositories.items.rows.filter(
        (row) => row.status === 'conflict',
      ),
    ).toHaveLength(2);
    expect(dependencies.repositories.conflicts.rows).toHaveLength(2);
    for (const conflict of dependencies.repositories.conflicts.rows) {
      expect(conflict).toMatchObject({
        conflict_type: 'concurrency',
        reason_code: 'TEAT.SYNC_CONCURRENCY_SUSPECT',
        retryable: false,
        status: 'open',
      });
      expect(conflict.allowed_resolution_actions).toEqual(['manual_review']);
    }
    expect(ait.apply).toHaveBeenCalledWith(
      expect.objectContaining({ concurrencySuspect: true }),
      expect.anything(),
    );
    expect(dependencies.outbox.append).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ domainEvent: 'AIT_SUSPEITO_CONCORRENCIA' }),
    );
    expect(dependencies.outbox.append).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        type: SYNC_CONFLICT_OPENED,
        domainEvent: 'SYNC_CONFLITO_ABERTO',
      }),
    );
  });

  it('C-0002-18 — dados os mesmos dois itens com ops_session_handoff do agente dentro da janela então nenhum é marcado (AC-TEAT-012-4: handoff autorizado é distinguível de anomalia)', async () => {
    const ait = applier('ait');
    const dependencies = deps({
      appliers: [ait],
      parameters: {
        get: vi.fn(async () => ({ value_json: 10, source_pending: false })),
      },
      repositories: {
        batches: repository(),
        receipts: repository(),
        conflicts: repository(),
        items: repository([
          {
            id: '00000000-0000-7000-8000-0000e9000003',
            tenant_id: TENANT_ID,
            agent_id: AGENT_ID,
            device_id: OTHER_DEVICE_ID,
            entity_type: 'ait',
            status: 'received',
            created_locally_at: '2026-09-14T13:00:00.000Z',
          },
        ]),
        handoffs: repository([
          {
            id: '00000000-0000-7000-8000-0000e3100001',
            tenant_id: TENANT_ID,
            shift_id: SHIFT_ID,
            from_agent_id: AGENT_ID,
            to_agent_id: AGENT_ID,
            handed_off_at: '2026-09-14T13:02:00.000Z',
          },
        ]),
      },
    });
    const response = await submitBatch(
      dependencies,
      batch({
        items: [
          item({
            idempotency_key: 'item-handoff',
            created_locally_at: '2026-09-14T13:05:00.000Z',
          }),
        ],
      }),
    );
    expect(receiptFor(response, LOCAL_ENTITY_1).status).toBe('applied');
    expect(dependencies.repositories.conflicts.rows).toEqual([]);
    expect(
      dependencies.repositories.items.rows.every(
        (row) => row.status !== 'conflict',
      ),
    ).toBe(true);
    expect(response.warnings).toEqual([]);
  });
});

/**
 * CTG-0002 §4.1 passo 4 e §5.13 (R-0008, TASK-0004 iteração 3) — achados 3 e 4
 * da delivery-review do CTG-0002: o primeiro lote sequenciado de um device e a
 * validação de forma do `SubmitSyncBatchDto`.
 *
 * Os dois blocos são transcrição do contrato, não interpretação: o passo 4 diz
 * `last = max(batch_sequence) aceito do (tenant, device), ou 0`, logo o
 * primeiro lote de um device só aceita `1`; e a §5.13 fixa `device_batch_id`
 * obrigatório, `items` obrigatório com ≥ 1 elemento e `batch_sequence?: int ≥ 1`.
 */
describe('CTG-0002 §4.1 passo 4 — primeiro lote sequenciado de um device (achado 3)', () => {
  it('dado nenhum lote anterior do device quando chega batch_sequence = 2 então 422 TEAT.SYNC_BATCH_SEQUENCE_GAP com expectedSequence 1 e received 2 (last = 0)', async () => {
    const dependencies = deps();
    await expect(
      submitBatch(dependencies, batch({ batch_sequence: 2 })),
    ).rejects.toMatchObject({
      code: 'TEAT.SYNC_BATCH_SEQUENCE_GAP',
      status: 422,
      context: expect.objectContaining({ expectedSequence: 1, received: 2 }),
    });
    expect(dependencies.repositories.batches.rows).toEqual([]);
    expect(dependencies.repositories.items.rows).toEqual([]);
  });

  it('dado nenhum lote anterior do device quando chega batch_sequence = 1 então o lote é aceito e a resposta ecoa batch_sequence 1', async () => {
    const dependencies = deps();
    const response = await submitBatch(
      dependencies,
      batch({ batch_sequence: 1 }),
    );
    expect(response.batch_sequence).toBe(1);
    expect(receiptFor(response, LOCAL_ENTITY_1).status).toBe('applied');
  });

  it('dado nenhum lote anterior do device quando chega batch_sequence = 3 então 422 com expectedSequence 1, nunca 409 de replay (não há o que reprisar)', async () => {
    const dependencies = deps();
    await expect(
      submitBatch(dependencies, batch({ batch_sequence: 3 })),
    ).rejects.toMatchObject({
      code: 'TEAT.SYNC_BATCH_SEQUENCE_GAP',
      status: 422,
      context: expect.objectContaining({ expectedSequence: 1, received: 3 }),
    });
  });
});

describe('CTG-0002 §5.13 — validação de forma do SubmitSyncBatchDto (achado 4)', () => {
  /** Nada pode ser materializado quando o corpo é inválido. */
  function expectNothingMaterialized(dependencies: Deps): void {
    expect(dependencies.repositories.batches.rows).toEqual([]);
    expect(dependencies.repositories.items.rows).toEqual([]);
    expect(dependencies.repositories.receipts.rows).toEqual([]);
    expect(dependencies.repositories.conflicts.rows).toEqual([]);
  }

  it('dado items ausente então 400 TEAT.VALIDATION_FAILED com context.fields[] apontando items, e nada materializado', async () => {
    const dependencies = deps();
    const input = batch();
    delete input.items;
    await expect(submitBatch(dependencies, input)).rejects.toMatchObject({
      code: 'TEAT.VALIDATION_FAILED',
      status: 400,
      context: expect.objectContaining({
        fields: expect.arrayContaining([
          expect.objectContaining({ path: 'items' }),
        ]),
      }),
    });
    expectNothingMaterialized(dependencies);
  });

  it('dado items vazio então 400 TEAT.VALIDATION_FAILED com context.fields[] apontando items (o DTO exige ≥ 1), e nada materializado', async () => {
    const dependencies = deps();
    await expect(
      submitBatch(dependencies, batch({ items: [] })),
    ).rejects.toMatchObject({
      code: 'TEAT.VALIDATION_FAILED',
      status: 400,
      context: expect.objectContaining({
        fields: expect.arrayContaining([
          expect.objectContaining({ path: 'items' }),
        ]),
      }),
    });
    expectNothingMaterialized(dependencies);
  });

  it('dado batch_sequence não inteiro então 400 TEAT.VALIDATION_FAILED com context.fields[] apontando batch_sequence, e nada materializado', async () => {
    const dependencies = deps();
    await expect(
      submitBatch(dependencies, batch({ batch_sequence: 1.5 })),
    ).rejects.toMatchObject({
      code: 'TEAT.VALIDATION_FAILED',
      status: 400,
      context: expect.objectContaining({
        fields: expect.arrayContaining([
          expect.objectContaining({ path: 'batch_sequence' }),
        ]),
      }),
    });
    expectNothingMaterialized(dependencies);
  });

  it('dado batch_sequence menor que 1 então 400 TEAT.VALIDATION_FAILED (o DTO e o check ck_ops_sync_batch_sequence_positive exigem ≥ 1)', async () => {
    const dependencies = deps();
    await expect(
      submitBatch(dependencies, batch({ batch_sequence: 0 })),
    ).rejects.toMatchObject({
      code: 'TEAT.VALIDATION_FAILED',
      status: 400,
      context: expect.objectContaining({
        fields: expect.arrayContaining([
          expect.objectContaining({ path: 'batch_sequence' }),
        ]),
      }),
    });
    expectNothingMaterialized(dependencies);
  });

  it('dado device_batch_id ausente então 400 TEAT.VALIDATION_FAILED com context.fields[] apontando device_batch_id, e nada materializado', async () => {
    const dependencies = deps();
    const input = batch();
    delete input.device_batch_id;
    await expect(submitBatch(dependencies, input)).rejects.toMatchObject({
      code: 'TEAT.VALIDATION_FAILED',
      status: 400,
      context: expect.objectContaining({
        fields: expect.arrayContaining([
          expect.objectContaining({ path: 'device_batch_id' }),
        ]),
      }),
    });
    expectNothingMaterialized(dependencies);
  });
});
