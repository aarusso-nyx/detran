// CTG-0002 §4.8 (R-0008, TASK-0005) — porta de aplicação de item de
// sincronização. O protocolo de `@detran/ops-offline-sync` conhece só esta
// interface: cada domínio de destino (AIT em M7, medidas e termo de sinais em
// CTG-0004) publica o seu applier e o app monta a lista em
// `backend/app/src/teat-sync.providers.ts`.
import type { Transaction } from '@stynx-nyx/data';

/**
 * O item já materializado em `ops.sync_queue_item`, com o recibo já criado.
 * Não carrega o payload: o applier o lê de `sync_queue_item.payload_json`
 * pela própria transação do item (CTG-0002 §4.3 passo 4).
 */
export interface SyncEntityApplierItem {
  id: string;
  tenantId: string;
  trafficAgencyId: string;
  deviceId: string;
  agentId: string;
  entityType: string;
  localEntityId: string;
  idempotencyKey: string;
  payloadHash: string;
  createdLocallyAt: string;
  /** Decidido pelo detector de concorrência (§4.7) antes do `apply`. */
  concurrencySuspect: boolean;
  /** Id da linha de `ops.sync_receipt` já criada para o item. */
  receiptId: string;
}

/** Recusa de forma: `code` do catálogo e os caminhos do payload que falharam. */
export interface SyncApplierRejection {
  code: string;
  fields: readonly string[];
}

export interface SyncEntityApplier {
  readonly entityType: string;
  validate(payload: unknown): SyncApplierRejection | null;
  apply(
    item: SyncEntityApplierItem,
    tx: Transaction,
  ): Promise<{ serverEntityId: string }>;
}

/** Token multi-provider da lista de appliers (CTG-0002 §4.8). */
export const SYNC_ENTITY_APPLIERS: unique symbol = Symbol(
  'SYNC_ENTITY_APPLIERS',
);
