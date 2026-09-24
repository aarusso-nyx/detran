import { InjectionToken } from '@angular/core';
import type { MobileIdPort } from '@stynx-nyx/mobile-runtime';
import type { QueueReceipt, SyncCursor } from '../local/local-act.store.js';

interface PendingItem {
  readonly entityType?: string;
  readonly entity_type?: string;
  readonly localEntityId?: string;
  readonly local_entity_id?: string;
  readonly serverEntityId?: string;
  readonly idempotencyKey?: string;
  readonly idempotency_key?: string;
  readonly payloadHash?: string;
  readonly payload_hash?: string;
  readonly payloadJson?: Readonly<Record<string, unknown>>;
  readonly payload_json?: Readonly<Record<string, unknown>>;
  readonly createdLocallyAt?: string;
}

interface SyncStore {
  pending(): Promise<readonly PendingItem[]>;
  applyReceipts(receipts: readonly QueueReceipt[]): Promise<void>;
  receiptByIdempotency(key: string): Promise<QueueReceipt | undefined>;
  cursor(): Promise<SyncCursor | undefined>;
  saveCursor(cursor: SyncCursor): Promise<void>;
}

interface SyncResponse {
  readonly batchId: string;
  readonly batch_sequence?: number | null;
  readonly receipts: readonly Readonly<{
    local_entity_id: string;
    idempotency_key?: string;
    status: QueueReceipt['status'];
    server_entity_id?: string;
    error_code?: string | null;
    error_message?: string | null;
  }>[];
}

interface SyncClient {
  submitBatch(input: unknown): Promise<SyncResponse>;
  receiptByIdempotency(
    tenant: string,
    idempotencyKey: string,
  ): Promise<QueueReceipt | undefined>;
}

interface BootstrapStorePort {
  snapshot():
    | Readonly<{
        context: Readonly<{
          trafficAgencyId: string;
          device: Readonly<{ id: string }>;
          agent: Readonly<{ id: string }>;
        }>;
      }>
    | undefined;
}

function required(value: string | undefined, code: string): string {
  if (value === undefined || value === '') throw new Error(code);
  return value;
}

export const TEAT_MOBILE_ID = new InjectionToken<MobileIdPort>(
  'TEAT_MOBILE_ID',
  {
    providedIn: 'root',
    factory: () => ({ uuid: (prefix) => `${prefix}-${crypto.randomUUID()}` }),
  },
);

function toWireItem(item: PendingItem): Readonly<Record<string, unknown>> {
  return {
    entity_type: required(
      item.entityType ?? item.entity_type,
      'sync-entity-type-required',
    ),
    local_entity_id: required(
      item.localEntityId ?? item.local_entity_id,
      'sync-local-entity-id-required',
    ),
    ...(item.serverEntityId === undefined
      ? {}
      : { server_entity_id: item.serverEntityId }),
    idempotency_key: required(
      item.idempotencyKey ?? item.idempotency_key,
      'sync-idempotency-key-required',
    ),
    payload_hash: required(
      item.payloadHash ?? item.payload_hash,
      'sync-payload-hash-required',
    ),
    ...(item.createdLocallyAt === undefined
      ? {}
      : { created_locally_at: item.createdLocallyAt }),
    payload_json: item.payloadJson ?? item.payload_json ?? {},
  };
}

export class SyncWorker {
  constructor(
    private readonly store: SyncStore,
    private readonly client: SyncClient,
    private readonly bootstrap: BootstrapStorePort,
    private readonly ids: MobileIdPort,
  ) {}

  readonly submitNext = async (): Promise<readonly QueueReceipt[]> => {
    const pending = await this.store.pending();
    if (pending.length === 0) return [];
    const snapshot = this.bootstrap.snapshot();
    if (snapshot === undefined) throw new Error('sync-bootstrap-required');
    let cursor = await this.store.cursor();
    if (cursor === undefined) {
      cursor = {
        deviceBatchId: this.ids.uuid('sync-batch'),
        batchSequence: 1,
      };
      await this.store.saveCursor(cursor);
    }

    const response = await this.client.submitBatch({
      traffic_agency_id: required(
        snapshot.context.trafficAgencyId,
        'sync-traffic-agency-required',
      ),
      device_id: required(snapshot.context.device.id, 'sync-device-required'),
      agent_id: required(snapshot.context.agent.id, 'sync-agent-required'),
      device_batch_id: cursor.deviceBatchId,
      batch_sequence: cursor.batchSequence,
      items: pending.map(toWireItem),
    });
    const receipts = response.receipts.map((receipt) => ({
      localEntityId: receipt.local_entity_id,
      idempotencyKey: required(
        receipt.idempotency_key,
        'sync-receipt-idempotency-key-required',
      ),
      status: receipt.status,
      ...(receipt.server_entity_id === undefined
        ? {}
        : { serverEntityId: receipt.server_entity_id }),
      ...(receipt.error_code == null ? {} : { errorCode: receipt.error_code }),
      ...(receipt.error_message == null
        ? {}
        : { errorMessage: receipt.error_message }),
    }));
    await this.store.applyReceipts(receipts);
    await this.store.saveCursor({
      deviceBatchId: this.ids.uuid('sync-batch'),
      batchSequence: cursor.batchSequence + 1,
    });
    return receipts;
  };

  readonly recoverReceipt = async (
    tenant: string,
    idempotencyKey: string,
  ): Promise<QueueReceipt | undefined> => {
    const serverReceipt = await this.client.receiptByIdempotency(
      tenant,
      idempotencyKey,
    );
    if (serverReceipt === undefined) return undefined;
    await this.store.applyReceipts([serverReceipt]);
    return serverReceipt;
  };
}
