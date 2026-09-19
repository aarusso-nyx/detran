// CTG-0002 §4 e §5.13 (M5–M7, R-0008, TASK-0005) — `POST /v1/ops/offline-sync/
// sync-batches`: o único ponto de entrada do protocolo de sincronização.
//
// Ordem das etapas, que é parte do contrato (§4.1): replay de lote → guarda de
// sequência → materialização dos itens → detecção de concorrência → aplicação
// item a item, **uma transação por item** → recibos → lote → eventos.
//
// Fronteira de persistência: a escrituração do protocolo (fila, recibo,
// conflito, lote) passa pela porta de repositório injetada; o efeito de
// domínio do item roda numa transação própria, que é a que o applier recebe e
// a que carrega os eventos do item. Uma falha do applier reverte a transação
// inteira e o recibo de recusa é gravado depois, fora dela (§4.3 passo 5).
import type { OpsRow, SyncEntityApplier } from '@detran/ops-core';
import {
  asQueryable,
  createOpsRow,
  teatEventSink,
  type SyncEntityApplierItem,
} from '@detran/ops-core';
import { DetranError, type TeatEventEnvelope } from '@detran/shared';
import type { Transaction } from '@stynx-nyx/data';
import { z } from 'zod';

import {
  ALLOWED_RESOLUTION_ACTIONS,
  CONFLICT_DESCRIPTION,
  SUPPORTED_ENTITY_TYPES,
  clockOf,
  numberOf,
  outcomeFor,
  ownedBy,
  storeOf,
  tenantScope,
  type ConflictType,
  type OfflineSyncDeps,
  type ReceiptStatus,
} from './batch-protocol.js';
import { canonicalHash } from './canonical-hash.js';
import {
  CONCURRENCY_WINDOW_KEY,
  CONCURRENCY_WINDOW_WARNING,
  concurrentCandidates,
  windowBounds,
  windowFrom,
} from './concurrency-detector.js';
import {
  aitConcurrencySuspectedEvent,
  aitReceivedEvent,
  syncConflictOpenedEvent,
  syncItemReceivedEvent,
  type EventScope,
} from './events.js';

export interface SyncBatchItemInput {
  entity_type: string;
  local_entity_id: string;
  server_entity_id?: string;
  idempotency_key?: string;
  payload_hash: string;
  created_locally_at?: string;
  payload_json?: Record<string, unknown>;
}

export interface SubmitSyncBatchInput {
  traffic_agency_id: string;
  device_id: string;
  agent_id: string;
  device_batch_id: string;
  batch_sequence?: number | null;
  items: SyncBatchItemInput[];
}

export interface SyncReceiptView {
  local_entity_id: string | null;
  idempotency_key: string | null;
  status: string | null;
  server_entity_id: string | null;
  error_code: string | null;
  error_message: string | null;
  details_json: Record<string, unknown> | null;
}

export interface SubmitSyncBatchResponse {
  batchId: string | null;
  batch_sequence: number | null;
  accepted_items: number;
  receipts: SyncReceiptView[];
  warnings: string[];
}

/**
 * §4.2 e §5.13 — forma do `SubmitSyncBatchDto` de origem, conferida na
 * fronteira antes de qualquer materialização. `tenant_id` do DTO de origem é
 * descartado (CODESTYLE §Backend: o tenant vem do `RequestContext`), então o
 * objeto **não** é estrito: chaves desconhecidas são removidas, não recusadas.
 */
const syncBatchItemSchema = z.object({
  entity_type: z.string().min(1).max(60),
  local_entity_id: z.uuid(),
  server_entity_id: z.uuid().nullish(),
  idempotency_key: z.string().min(1).max(160).nullish(),
  payload_hash: z.string().min(1).max(128),
  created_locally_at: z.iso.datetime({ offset: true }).nullish(),
  payload_json: z.record(z.string(), z.unknown()).nullish(),
});

const submitSyncBatchSchema = z.object({
  traffic_agency_id: z.uuid(),
  device_id: z.uuid(),
  agent_id: z.uuid(),
  device_batch_id: z.string().min(1).max(160),
  batch_sequence: z.int().min(1).nullish(),
  items: z.array(syncBatchItemSchema).min(1),
});

/** `context.fields[] { path, rule, params }` do catálogo §1 regra 5. */
function validationFields(error: z.ZodError): Array<Record<string, unknown>> {
  return error.issues.map((issue) => {
    const {
      code,
      path,
      message: _message,
      ...params
    } = issue as unknown as Record<string, unknown>;
    return {
      path: (path as unknown[]).map(String).join('.'),
      rule: String(code),
      params,
    };
  });
}

interface PreparedItem {
  raw: SyncBatchItemInput;
  entityType: string;
  localEntityId: string;
  idempotencyKey: string;
  payloadHash: string;
  createdLocallyAt: string;
  /** Recibo já existente (replay de item) — nada mais acontece. */
  existingReceipt?: OpsRow;
  /** Linha de fila criada para o item deste lote. */
  itemRow?: OpsRow;
  receiptRow?: OpsRow;
  /** Desfecho já decidido antes da aplicação. */
  closed?: { code: string; context: Record<string, unknown> };
  /** Recibo sintético: o item existe com a mesma chave e outro hash (§4.2). */
  transient?: SyncReceiptView;
  applier?: SyncEntityApplier;
  concurrencySuspect?: boolean;
  concurrencyContext?: Record<string, unknown>;
}

/** §4.2 — chave derivada do caminho legado. */
function legacyKey(deviceId: string, localEntityId: string): string {
  return `legacy:${deviceId}:${localEntityId}`;
}

function receiptView(row: OpsRow): SyncReceiptView {
  const details = (row.details_json ?? null) as Record<string, unknown> | null;
  return {
    local_entity_id: (row.local_entity_id as string) ?? null,
    idempotency_key: (row.idempotency_key as string) ?? null,
    status: (row.status as string) ?? null,
    server_entity_id: (row.server_entity_id as string) ?? null,
    error_code: (row.reason_code as string) ?? null,
    error_message: null,
    details_json: details,
  };
}

export class SubmitBatchCommand {
  constructor(private readonly deps: OfflineSyncDeps) {}

  async execute(input: SubmitSyncBatchInput): Promise<SubmitSyncBatchResponse> {
    const { tenantId, actorId } = tenantScope(this.deps);
    const clock = clockOf(this.deps);
    const scope: EventScope = { tenantId, actorId, occurredAt: clock.now() };
    const parsed = submitSyncBatchSchema.safeParse(input);
    if (!parsed.success)
      throw new DetranError('TEAT.VALIDATION_FAILED', {
        status: 400,
        context: { fields: validationFields(parsed.error) },
        message: 'Lote de sincronização com forma inválida.',
      });
    const deviceId = parsed.data.device_id;
    const deviceBatchId = parsed.data.device_batch_id;
    const sequence =
      parsed.data.batch_sequence === undefined ||
      parsed.data.batch_sequence === null
        ? null
        : numberOf(parsed.data.batch_sequence);
    const rawItems = input.items;

    const batches = storeOf(this.deps, 'batches');
    const deviceBatches = ownedBy(await batches.list(), tenantId).filter(
      (row) => String(row.device_id) === deviceId,
    );
    const declaredKeys = rawItems.map((raw) =>
      raw.idempotency_key
        ? String(raw.idempotency_key)
        : legacyKey(deviceId, String(raw.local_entity_id)),
    );
    const replayed = deviceBatches.find(
      (row) => String(row.device_batch_id) === deviceBatchId,
    );
    if (replayed)
      return this.resume(
        replayed,
        input,
        rawItems,
        declaredKeys,
        sequence,
        tenantId,
        scope,
      );
    this.assertSequence(deviceBatches, sequence, deviceBatchId);

    // §14 passo 5 — o lote nasce durável antes de qualquer item, para que o id
    // exista em `data.batchId` de todo envelope; `declared_keys` guarda o
    // conjunto anunciado pelo envio, que é o que distingue "outro conjunto"
    // (409) de "mesmo conjunto, materialização incompleta" (continuação).
    const batchRow = await batches.create({
      traffic_agency_id: String(input.traffic_agency_id),
      agent_id: String(input.agent_id),
      device_id: deviceId,
      device_batch_id: deviceBatchId,
      batch_sequence: sequence,
      submitted_at: scope.occurredAt,
      accepted_items: 0,
      receipts_json: { item_ids: [], declared_keys: declaredKeys },
    });

    return this.runItems(
      String(batchRow.id),
      declaredKeys,
      input,
      rawItems,
      sequence,
      tenantId,
      scope,
    );
  }

  /**
   * §14 passos 6–10 — materializa, aplica, fecha o lote e responde. Chamado
   * tanto pelo envio novo quanto pela continuação de um lote durável: um item
   * cuja `idempotency_key` já foi materializada com o mesmo hash devolve o
   * recibo existente sem novo `apply` (§4.2), então reexecutar o trecho é
   * seguro e é o que completa os itens que faltaram.
   */
  private async runItems(
    batchId: string,
    declaredKeys: readonly string[],
    input: SubmitSyncBatchInput,
    rawItems: SyncBatchItemInput[],
    sequence: number | null,
    tenantId: string,
    scope: EventScope,
  ): Promise<SubmitSyncBatchResponse> {
    const window = await this.concurrencyWindow(input.traffic_agency_id);
    const warnings =
      window.minutes === null ? [CONCURRENCY_WINDOW_WARNING] : [];

    const prepared: PreparedItem[] = [];
    for (const raw of rawItems) {
      prepared.push(await this.materialize(raw, input, tenantId));
    }
    if (window.minutes !== null) {
      await this.detectConcurrency(
        prepared,
        input,
        tenantId,
        scope,
        window.minutes,
      );
    }

    const receipts: SyncReceiptView[] = [];
    for (const item of prepared) {
      receipts.push(await this.settle(item, input, sequence, scope, batchId));
    }

    const acceptedItems = receipts.filter(
      (receipt) =>
        receipt.status !== 'rejected' && receipt.status !== 'conflict',
    ).length;
    const itemIds = [
      ...new Set(
        prepared
          .map((item) => item.itemRow?.id)
          .filter((id): id is string => typeof id === 'string'),
      ),
    ];
    await storeOf(this.deps, 'batches').update(batchId, {
      accepted_items: acceptedItems,
      receipts_json: { item_ids: itemIds, declared_keys: [...declaredKeys] },
    });

    return {
      batchId,
      batch_sequence: sequence,
      accepted_items: acceptedItems,
      receipts,
      warnings,
    };
  }

  /**
   * §4.1 passo 3 e §14 (c) — retransmissão do mesmo `device_batch_id`.
   *
   * Critério adotado para separar os dois casos:
   *  - `receipts_json.declared_keys` (gravado no passo 5) é o conjunto de
   *    `idempotency_key` que o **envio** anunciou. Reenvio com conjunto
   *    diferente do anunciado, ou com sequência diferente da gravada, é 409
   *    `TEAT.SYNC_BATCH_REPLAY_CONTEXT_MISMATCH`;
   *  - lotes gravados sem `declared_keys` (versões anteriores, fixtures) caem
   *    no critério de subconjunto: as chaves **materializadas** precisam estar
   *    contidas no reenvio.
   *
   * Passado o critério, o reenvio é continuação: as chaves já materializadas
   * devolvem os recibos existentes sem novo `apply` e as que faltam são
   * materializadas e aplicadas no mesmo lote (mesmo `batchId`), que é fechado
   * de novo no passo 9. É a recuperação de ACK perdido e, ao mesmo tempo, a
   * retomada de um lote interrompido entre os passos 5 e 9.
   */
  private async resume(
    batch: OpsRow,
    input: SubmitSyncBatchInput,
    rawItems: SyncBatchItemInput[],
    declaredKeys: readonly string[],
    sequence: number | null,
    tenantId: string,
    scope: EventScope,
  ): Promise<SubmitSyncBatchResponse> {
    const deviceBatchId = String(batch.device_batch_id);
    const stored =
      batch.batch_sequence === null || batch.batch_sequence === undefined
        ? null
        : numberOf(batch.batch_sequence);
    if (stored !== sequence) throw replayMismatch(deviceBatchId);

    const receiptsJson = (batch.receipts_json ?? {}) as {
      item_ids?: string[];
      declared_keys?: string[];
    };
    const itemIds = (receiptsJson.item_ids ?? []).map(String);
    const incoming = new Set(declaredKeys);
    const announced = receiptsJson.declared_keys;
    if (announced) {
      if (!sameSet(announced.map(String), declaredKeys))
        throw replayMismatch(deviceBatchId);
    } else {
      const materialized = ownedBy(
        await storeOf(this.deps, 'items').list(),
        tenantId,
      )
        .filter((row) => itemIds.includes(String(row.id)))
        .map((row) => String(row.idempotency_key));
      if (materialized.some((key) => !incoming.has(key)))
        throw replayMismatch(deviceBatchId);
      // Sem `declared_keys`, a única evidência de que o lote não chegou ao
      // passo 9 é `accepted_items = 0` — o valor escrito no passo 5 e
      // substituído no fechamento. Lote já fechado não admite chave nova:
      // o replay completa o que faltou, nunca acrescenta item ao envio.
      const materializedKeys = new Set(materialized);
      const additions = declaredKeys.filter(
        (key) => !materializedKeys.has(key),
      );
      if (additions.length > 0 && numberOf(batch.accepted_items ?? 0) > 0)
        throw replayMismatch(deviceBatchId);
    }

    return this.runItems(
      String(batch.id),
      announced ? announced.map(String) : declaredKeys,
      input,
      rawItems,
      stored,
      tenantId,
      scope,
    );
  }

  /**
   * §4.1 passo 4 — sequência: `last` é o maior `batch_sequence` aceito do
   * (tenant, device) **ou 0**, inclusive no primeiro lote do dispositivo. Com
   * `last = 0` o primeiro lote sequenciado só pode ser o `1`: qualquer outro é
   * replay (≤ 0 é impossível pelo schema) ou lacuna.
   */
  private assertSequence(
    deviceBatches: OpsRow[],
    sequence: number | null,
    deviceBatchId: string,
  ): void {
    if (sequence === null) return;
    const sequences = deviceBatches
      .map((row) => row.batch_sequence)
      .filter((value) => value !== null && value !== undefined)
      .map(numberOf)
      .filter((value) => Number.isFinite(value));
    const last = sequences.length === 0 ? 0 : Math.max(...sequences);
    if (sequence <= last)
      throw new DetranError('TEAT.SYNC_BATCH_SEQUENCE_REPLAYED', {
        status: 409,
        context: {
          expectedSequence: last + 1,
          received: sequence,
          deviceBatchId,
        },
        message: 'Sequência de lote já aceita para o dispositivo.',
      });
    if (sequence > last + 1)
      throw new DetranError('TEAT.SYNC_BATCH_SEQUENCE_GAP', {
        status: 422,
        context: {
          expectedSequence: last + 1,
          received: sequence,
          deviceBatchId,
        },
        message: 'Sequência de lote com lacuna; reenvie os lotes anteriores.',
      });
  }

  private async concurrencyWindow(
    agencyId: string,
  ): Promise<{ minutes: number | null }> {
    const parameters = this.deps.parameters;
    if (!parameters) return { minutes: null };
    try {
      const row = await parameters.get(CONCURRENCY_WINDOW_KEY, {
        agencyId: agencyId ? String(agencyId) : undefined,
      });
      return windowFrom(row ?? {});
    } catch {
      // Linha ausente no catálogo do tenant: detecção desligada (§4.7).
      return { minutes: null };
    }
  }

  /** §4.2 — identidade, integridade e materialização de um item. */
  private async materialize(
    raw: SyncBatchItemInput,
    input: SubmitSyncBatchInput,
    tenantId: string,
  ): Promise<PreparedItem> {
    const deviceId = String(input.device_id);
    const entityType = String(raw.entity_type);
    const localEntityId = String(raw.local_entity_id);
    const legacy = !raw.idempotency_key;
    const idempotencyKey = legacy
      ? legacyKey(deviceId, localEntityId)
      : String(raw.idempotency_key);
    const payloadHash = String(raw.payload_hash);
    const createdLocallyAt = raw.created_locally_at
      ? String(raw.created_locally_at)
      : clockOf(this.deps).now();
    const base: PreparedItem = {
      raw,
      entityType,
      localEntityId,
      idempotencyKey,
      payloadHash,
      createdLocallyAt,
    };

    const items = storeOf(this.deps, 'items');
    const known = ownedBy(await items.list(), tenantId).find(
      (row) => String(row.idempotency_key) === idempotencyKey,
    );
    if (known) {
      const storedHash = String(known.payload_hash);
      const receipts = ownedBy(
        await storeOf(this.deps, 'receipts').list(),
        tenantId,
      );
      const receipt = receipts.find(
        (row) => String(row.sync_queue_item_id) === String(known.id),
      );
      if (storedHash === payloadHash)
        return receipt
          ? { ...base, itemRow: known, existingReceipt: receipt }
          : {
              ...base,
              itemRow: known,
              transient: {
                local_entity_id: localEntityId,
                idempotency_key: idempotencyKey,
                status: String(known.status ?? 'received'),
                server_entity_id: (known.server_entity_id as string) ?? null,
                error_code: (known.error_code as string) ?? null,
                error_message: null,
                details_json: null,
              },
            };
      {
        const context = {
          idempotencyKey,
          storedHash,
          receivedHash: payloadHash,
        };
        await this.openConflict(
          known,
          'integrity',
          'TEAT.SYNC_INTEGRITY_ERROR',
          {
            local: payloadHash,
            server: storedHash,
          },
        );
        // Os índices `(tenant_id, idempotency_key)` de `ops.sync_queue_item` e
        // `ops.sync_receipt` são únicos: a chave já tem fila e recibo próprios,
        // então o registro durável da divergência é o conflito e o recibo da
        // resposta é sintético.
        return {
          ...base,
          itemRow: known,
          transient: {
            local_entity_id: localEntityId,
            idempotency_key: idempotencyKey,
            status: 'rejected',
            server_entity_id: null,
            error_code: 'TEAT.SYNC_INTEGRITY_ERROR',
            error_message: null,
            details_json: context,
          },
        };
      }
    }

    const itemRow = await items.create({
      traffic_agency_id: String(input.traffic_agency_id),
      device_id: deviceId,
      agent_id: String(input.agent_id),
      entity_type: entityType,
      local_entity_id: localEntityId,
      status: 'pending',
      created_locally_at: createdLocallyAt,
      idempotency_key: idempotencyKey,
      payload_hash: payloadHash,
      payload_json: raw.payload_json ?? {},
    });
    const receiptRow = await storeOf(this.deps, 'receipts').create({
      sync_queue_item_id: String(itemRow.id),
      idempotency_key: idempotencyKey,
      entity_type: entityType,
      local_entity_id: localEntityId,
      accepted_hash: payloadHash,
      status: 'received',
    });
    const prepared: PreparedItem = { ...base, itemRow, receiptRow };

    if (legacy)
      return {
        ...prepared,
        closed: { code: 'TEAT.SYNC_LEGACY_ITEM_NOT_APPLIED', context: {} },
      };
    if (raw.payload_json && canonicalHash(raw.payload_json) !== payloadHash) {
      const context = {
        idempotencyKey,
        storedHash: canonicalHash(raw.payload_json),
        receivedHash: payloadHash,
      };
      return {
        ...prepared,
        closed: { code: 'TEAT.SYNC_INTEGRITY_ERROR', context },
      };
    }
    if (!SUPPORTED_ENTITY_TYPES.includes(entityType))
      return {
        ...prepared,
        closed: {
          code: 'TEAT.SYNC_UNSUPPORTED_ENTITY_TYPE',
          context: { supported: [...SUPPORTED_ENTITY_TYPES] },
        },
      };
    const applier = (this.deps.appliers ?? []).find(
      (candidate) => candidate.entityType === entityType,
    );
    if (!applier)
      return {
        ...prepared,
        closed: {
          code: 'TEAT.SYNC_DESTINATION_NOT_WIRED',
          context: { entityType },
        },
      };
    const rejection = applier.validate(raw.payload_json ?? {});
    if (rejection)
      return {
        ...prepared,
        closed: {
          code: rejection.code,
          context: { fields: [...rejection.fields] },
        },
      };
    return { ...prepared, applier };
  }

  /** §4.7 — marca os dois lados quando a janela está ligada. */
  private async detectConcurrency(
    prepared: PreparedItem[],
    input: SubmitSyncBatchInput,
    tenantId: string,
    scope: EventScope,
    windowMinutes: number,
  ): Promise<void> {
    const items = storeOf(this.deps, 'items');
    const handoffStore = this.deps.repositories.handoffs;
    const handoffs = handoffStore
      ? ownedBy(await handoffStore.list(), tenantId)
      : [];
    const deviceId = String(input.device_id);
    const agentId = String(input.agent_id);
    for (const item of prepared) {
      if (item.entityType !== 'ait' || !item.itemRow) continue;
      // O ato existe e está na fila: a apuração vale mesmo quando o destino
      // ainda não está montado (§4.7 fala do item `ait` do lote, não do
      // applier). Itens sem identidade estável (legado), com integridade
      // quebrada ou de tipo não suportado ficam fora.
      const applicable =
        item.applier !== undefined ||
        item.closed?.code === 'TEAT.SYNC_DESTINATION_NOT_WIRED';
      if (!applicable) continue;
      const rows = ownedBy(await items.list(), tenantId);
      const candidates = concurrentCandidates({
        items: rows,
        handoffs,
        agentId,
        deviceId,
        createdLocallyAt: item.createdLocallyAt,
        windowMinutes,
        excludeItemId: String(item.itemRow.id),
      });
      if (candidates.length === 0) continue;
      const bounds = windowBounds(item.createdLocallyAt, windowMinutes);
      const context = {
        otherDeviceId: String(candidates[0]!.device_id),
        ...bounds,
        windowMinutes,
        conflictingQueueItemIds: candidates.map((row) => String(row.id)),
      };
      item.concurrencySuspect = true;
      item.concurrencyContext = context;
      const conflict = await this.openConflict(
        item.itemRow,
        'concurrency',
        'TEAT.SYNC_CONCURRENCY_SUSPECT',
      );
      item.concurrencyContext = {
        ...context,
        conflictId: (conflict?.id as string) ?? null,
      };
      await this.emit(
        syncConflictOpenedEvent(scope, {
          conflictId: String(conflict?.id ?? ''),
          conflictType: 'concurrency',
          syncQueueItemId: String(item.itemRow.id),
          reasonCode: 'TEAT.SYNC_CONCURRENCY_SUSPECT',
          openedAt: scope.occurredAt,
        }),
      );
      for (const candidate of candidates) {
        await this.markCandidate(
          candidate,
          item,
          windowMinutes,
          scope,
          tenantId,
        );
      }
    }
  }

  private async markCandidate(
    candidate: OpsRow,
    item: PreparedItem,
    windowMinutes: number,
    scope: EventScope,
    tenantId: string,
  ): Promise<void> {
    const bounds = windowBounds(
      String(candidate.created_locally_at),
      windowMinutes,
    );
    const context = {
      otherDeviceId: String(item.itemRow?.device_id ?? ''),
      ...bounds,
      windowMinutes,
      conflictingQueueItemIds: [String(item.itemRow?.id ?? '')],
    };
    await storeOf(this.deps, 'items').update(String(candidate.id), {
      status: 'conflict',
      error_code: 'TEAT.SYNC_CONCURRENCY_SUSPECT',
    });
    const receipts = storeOf(this.deps, 'receipts');
    const existing = ownedBy(await receipts.list(), tenantId).find(
      (row) => String(row.sync_queue_item_id) === String(candidate.id),
    );
    if (existing)
      await receipts.update(String(existing.id), {
        status: 'conflict',
        reason_code: 'TEAT.SYNC_CONCURRENCY_SUSPECT',
        details_json: context,
      });
    const conflict = await this.openConflict(
      candidate,
      'concurrency',
      'TEAT.SYNC_CONCURRENCY_SUSPECT',
    );
    await this.emit(
      syncConflictOpenedEvent(scope, {
        conflictId: String(conflict?.id ?? ''),
        conflictType: 'concurrency',
        syncQueueItemId: String(candidate.id),
        reasonCode: 'TEAT.SYNC_CONCURRENCY_SUSPECT',
        openedAt: scope.occurredAt,
      }),
    );
  }

  /** §4.3 — aplicação (ou desfecho já decidido) de um item. */
  private async settle(
    item: PreparedItem,
    input: SubmitSyncBatchInput,
    sequence: number | null,
    scope: EventScope,
    batchId: string,
  ): Promise<SyncReceiptView> {
    if (item.existingReceipt) return receiptView(item.existingReceipt);
    if (item.transient) return item.transient;
    if (!item.itemRow || !item.receiptRow)
      throw new Error('Sync item was not materialized');

    if (item.concurrencySuspect && item.concurrencyContext && item.closed) {
      // O ato ficou barrado pela apuração antes de ter destino: o desfecho do
      // item é o conflito de concorrência (§4.4), e o AIT do servidor ainda
      // não existe — o evento identifica o ato pelo id local.
      const view = await this.close(
        item,
        'TEAT.SYNC_CONCURRENCY_SUSPECT',
        item.concurrencyContext,
        null,
        'already-open',
      );
      await this.emitConcurrencyEvent(item, item.localEntityId, scope);
      await this.publishItemEvent(item, input, sequence, scope, view, batchId);
      return view;
    }
    if (item.closed) {
      const view = await this.close(
        item,
        item.closed.code,
        item.closed.context,
        null,
      );
      await this.publishItemEvent(item, input, sequence, scope, view, batchId);
      return view;
    }

    const applier = item.applier;
    if (!applier) throw new Error('Sync item has no applier');
    const applierItem: SyncEntityApplierItem = {
      id: String(item.itemRow.id),
      tenantId: scope.tenantId,
      trafficAgencyId: String(input.traffic_agency_id),
      deviceId: String(input.device_id),
      agentId: String(input.agent_id),
      entityType: item.entityType,
      localEntityId: item.localEntityId,
      idempotencyKey: item.idempotencyKey,
      payloadHash: item.payloadHash,
      createdLocallyAt: item.createdLocallyAt,
      concurrencySuspect: item.concurrencySuspect === true,
      receiptId: String(item.receiptRow.id),
    };
    const suspect = applierItem.concurrencySuspect;
    const receiptStatus: ReceiptStatus = suspect ? 'conflict' : 'applied';
    let settled: { serverEntityId: string; receipt?: OpsRow };
    try {
      // §4.3 passo 4 — uma transação por item: efeito de domínio, escrituração
      // da fila, recibo e eventos commitam juntos; qualquer falha reverte tudo.
      settled = await this.deps.database.tx(async (tx) => {
        await lockDeviceScope(tx, scope.tenantId, applierItem.deviceId);
        const applied = await applier.apply(applierItem, tx as Transaction);
        // A escrituração passa pela porta (§4.8), com a transação do item
        // explícita: a linha promovida commita junto com o efeito de domínio e
        // some junto com ele se qualquer passo seguinte falhar.
        await storeOf(this.deps, 'items').update(
          applierItem.id,
          {
            status: receiptStatus,
            server_entity_id: applied.serverEntityId,
            received_at: scope.occurredAt,
            ...(suspect ? { error_code: 'TEAT.SYNC_CONCURRENCY_SUSPECT' } : {}),
          },
          tx,
        );
        const receipt = await storeOf(this.deps, 'receipts').update(
          applierItem.receiptId,
          {
            status: receiptStatus,
            server_entity_id: applied.serverEntityId,
            applied_at: scope.occurredAt,
            ...(suspect
              ? {
                  reason_code: 'TEAT.SYNC_CONCURRENCY_SUSPECT',
                  details_json: item.concurrencyContext ?? {},
                }
              : {}),
          },
          tx,
        );
        const sink = teatEventSink(this.deps.outbox);
        if (item.entityType === 'ait') {
          if (suspect && item.concurrencyContext)
            await sink.append(
              tx as Transaction,
              concurrencyEnvelope(item, applied.serverEntityId, scope),
            );
          else
            await sink.append(
              tx as Transaction,
              aitReceivedEvent(scope, {
                aitId: applied.serverEntityId,
                fromState: 'TRANSMITIDO',
                receiptProtocol: applierItem.receiptId,
                receivedAt: scope.occurredAt,
              }),
            );
        }
        await sink.append(
          tx as Transaction,
          syncItemReceivedEvent(scope, {
            batchId,
            deviceBatchId: String(input.device_batch_id),
            batchSequence: sequence,
            itemId: applierItem.id,
            entityType: item.entityType,
            localEntityId: item.localEntityId,
            receiptStatus,
            errorCode: suspect ? 'TEAT.SYNC_CONCURRENCY_SUSPECT' : null,
            serverEntityId: applied.serverEntityId,
          }),
        );
        return { serverEntityId: applied.serverEntityId, receipt };
      });
    } catch (error) {
      // §4.3 passo 5 — rollback completo do item; o recibo de recusa é gravado
      // numa transação própria e nova.
      const failure = asDomainFailure(error);
      const view = await this.close(
        item,
        failure.code,
        failure.context,
        null,
        failure.conflictType,
      );
      await this.publishItemEvent(item, input, sequence, scope, view, batchId);
      return view;
    }
    return receiptView(settled.receipt ?? item.receiptRow);
  }

  /** Recibo e fila num desfecho terminal, com o conflito quando couber (§4.4). */
  private async close(
    item: PreparedItem,
    code: string,
    context: Record<string, unknown>,
    serverEntityId: string | null,
    conflictType?: ConflictType | 'already-open',
  ): Promise<SyncReceiptView> {
    const outcome = outcomeFor(code);
    const status: ReceiptStatus = outcome.status;
    await storeOf(this.deps, 'items').update(String(item.itemRow!.id), {
      status,
      error_code: code,
      ...(serverEntityId ? { server_entity_id: serverEntityId } : {}),
    });
    const updated = await storeOf(this.deps, 'receipts').update(
      String(item.receiptRow!.id),
      {
        status,
        reason_code: code,
        details_json: context,
        ...(serverEntityId ? { server_entity_id: serverEntityId } : {}),
      },
    );
    const type = conflictType ?? outcome.conflictType;
    if (type && type !== 'already-open')
      await this.openConflict(item.itemRow!, type, code);
    return receiptView(updated ?? item.receiptRow!);
  }

  /**
   * `ops.sync_conflict` não tem coluna de contexto (DDL 18): o detalhe do caso
   * vive em `sync_receipt.details_json`; aqui ficam só os campos do contrato
   * (§4.2) — tipo, código, hashes, ações admitidas e estado.
   */
  private async openConflict(
    itemRow: OpsRow,
    conflictType: ConflictType,
    reasonCode: string,
    hashes: { local?: string; server?: string } = {},
  ): Promise<OpsRow | undefined> {
    const conflicts = this.deps.repositories.conflicts;
    if (!conflicts) return undefined;
    return createOpsRow(conflicts, {
      sync_queue_item_id: String(itemRow.id),
      conflict_type: conflictType,
      reason_code: reasonCode,
      local_hash: hashes.local ?? null,
      server_hash: hashes.server ?? null,
      retryable: false,
      allowed_resolution_actions: [...ALLOWED_RESOLUTION_ACTIONS[conflictType]],
      description: CONFLICT_DESCRIPTION[conflictType],
      status: 'open',
    });
  }

  private async emitConcurrencyEvent(
    item: PreparedItem,
    aitId: string,
    scope: EventScope,
  ): Promise<void> {
    await this.emit(concurrencyEnvelope(item, aitId, scope));
  }

  private async publishItemEvent(
    item: PreparedItem,
    input: SubmitSyncBatchInput,
    sequence: number | null,
    scope: EventScope,
    view: SyncReceiptView,
    batchId: string,
  ): Promise<void> {
    await this.emit(
      syncItemReceivedEvent(scope, {
        batchId,
        deviceBatchId: String(input.device_batch_id),
        batchSequence: sequence,
        itemId: String(item.itemRow?.id ?? ''),
        entityType: item.entityType,
        localEntityId: item.localEntityId,
        receiptStatus: (view.status ?? 'received') as ReceiptStatus,
        errorCode: view.error_code,
        serverEntityId: view.server_entity_id,
      }),
    );
  }

  private async emit(envelope: TeatEventEnvelope): Promise<void> {
    const sink = teatEventSink(this.deps.outbox);
    await this.deps.database.tx((tx) =>
      sink.append(tx as Transaction, envelope),
    );
  }
}

function concurrencyEnvelope(
  item: PreparedItem,
  aitId: string,
  scope: EventScope,
): TeatEventEnvelope {
  const context = item.concurrencyContext ?? {};
  return aitConcurrencySuspectedEvent(scope, {
    aitId,
    agentId: String(item.itemRow?.agent_id ?? ''),
    deviceId: String(item.itemRow?.device_id ?? ''),
    otherDeviceId: (context.otherDeviceId as string) ?? null,
    windowStart: String(context.windowStart),
    windowEnd: String(context.windowEnd),
    conflictId: (context.conflictId as string) ?? null,
  });
}

function sameSet(left: readonly string[], right: readonly string[]): boolean {
  const a = [...new Set(left)].sort();
  const b = [...new Set(right)].sort();
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function replayMismatch(deviceBatchId: string): DetranError {
  return new DetranError('TEAT.SYNC_BATCH_REPLAY_CONTEXT_MISMATCH', {
    status: 409,
    context: { deviceBatchId },
    message: 'Lote retransmitido com contexto diferente do gravado.',
  });
}

/**
 * §4.1 passo 2 — serializa a aceitação por tenant+dispositivo. A porta de
 * repositório abre transação por instrução, então o bloqueio é tomado na
 * transação do item, que é onde o efeito de domínio acontece.
 */
async function lockDeviceScope(
  tx: unknown,
  tenantId: string,
  deviceId: string,
): Promise<void> {
  const queryable = asQueryable(tx);
  if (!queryable) return;
  await queryable.query(
    'select id from ops.sync_batch where tenant_id = $1 and device_id = $2 for update',
    [tenantId, deviceId],
  );
}

function asDomainFailure(error: unknown): {
  code: string;
  context: Record<string, unknown>;
  conflictType?: ConflictType;
} {
  const candidate = error as {
    code?: unknown;
    context?: unknown;
  } | null;
  const code =
    typeof candidate?.code === 'string' ? candidate.code : 'TEAT.INTERNAL';
  const context =
    candidate?.context && typeof candidate.context === 'object'
      ? (candidate.context as Record<string, unknown>)
      : {};
  return { code, context, conflictType: outcomeFor(code).conflictType };
}
