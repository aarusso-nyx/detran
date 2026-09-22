import type { SyncCursor } from '../local/local-act.store.js';

interface PendingAct {
  readonly localEntityId?: string;
  readonly idempotencyKey?: string;
  readonly [key: string]: unknown;
}

interface QueueReceipt {
  readonly localEntityId: string;
  readonly idempotencyKey: string;
  readonly status: string;
}

interface SyncStore {
  pending(): Promise<readonly PendingAct[]>;
  applyReceipts(receipts: readonly QueueReceipt[]): Promise<void>;
  receiptByIdempotency(key: string): Promise<QueueReceipt | undefined>;
  cursor(): Promise<SyncCursor | undefined>;
  saveCursor(cursor: SyncCursor): Promise<void>;
}

interface SyncClient {
  submitBatch(input: unknown): Promise<readonly QueueReceipt[]>;
  receiptByIdempotency(
    tenant: string,
    idempotencyKey: string,
  ): Promise<QueueReceipt | undefined>;
}

interface BootstrapStorePort {
  snapshot(): unknown;
}

export class SyncWorker {
  constructor(
    private readonly store: SyncStore,
    private readonly client: SyncClient,
    private readonly bootstrap: BootstrapStorePort,
  ) {}

  readonly submitNext = async (): Promise<readonly QueueReceipt[]> => {
    const pending = await this.store.pending();
    if (pending.length === 0) return [];
    const snapshot = this.bootstrap.snapshot();
    if (snapshot === undefined) throw new Error('sync-bootstrap-required');
    const cursor = await this.store.cursor();
    if (cursor === undefined) throw new Error('sync-cursor-required');
    const receipts = await this.client.submitBatch({
      device_batch_id: cursor.deviceBatchId,
      batch_sequence: cursor.batchSequence,
      bootstrap: snapshot,
      items: pending,
    });
    await this.store.applyReceipts(receipts);
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
    if (serverReceipt !== undefined) {
      await this.store.applyReceipts([serverReceipt]);
      return serverReceipt;
    }
    return this.store.receiptByIdempotency(idempotencyKey);
  };
}
