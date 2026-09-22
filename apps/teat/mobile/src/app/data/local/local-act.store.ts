import type { MobileEncryptedStorePort } from '@stynx-nyx/mobile-runtime';

interface LocalAct {
  readonly localEntityId: string;
  readonly idempotencyKey: string;
  readonly payloadHash: string;
  readonly version: number;
  readonly [key: string]: unknown;
}

interface QueueReceipt {
  readonly localEntityId: string;
  readonly idempotencyKey: string;
  readonly status: 'received' | 'applied' | 'conflict' | 'rejected';
  readonly [key: string]: unknown;
}

export interface SyncCursor {
  readonly deviceBatchId: string;
  readonly batchSequence: number;
}

const ACTS = 'teat-local-acts';
const RECEIPTS = 'teat-sync-receipts';
const SYNC = 'teat-sync-metadata';

function isMobileEncryptedStore(candidate: MobileEncryptedStorePort): boolean {
  return (
    'put' in candidate &&
    'list' in candidate &&
    'encrypted' in candidate &&
    candidate.encrypted === true
  );
}

export class LocalActStore {
  private readonly store: MobileEncryptedStorePort;

  constructor(store: MobileEncryptedStorePort) {
    if (!isMobileEncryptedStore(store)) {
      throw new Error('mobile-encrypted-store-port-required');
    }
    this.store = store;
    if (
      !this.store.encrypted ||
      !['device', 'session'].includes(this.store.encryptionScope)
    ) {
      throw new Error('local-act-store-not-encrypted');
    }
  }

  async put(input: LocalAct): Promise<void> {
    const existing = await this.store.get<LocalAct>(ACTS, input.localEntityId);
    if (existing !== undefined) {
      const sameIdentity =
        existing.idempotencyKey === input.idempotencyKey &&
        existing.payloadHash === input.payloadHash &&
        existing.version === input.version;
      if (!sameIdentity) throw new Error('local-act-identity-conflict');
      return;
    }
    await this.store.put(ACTS, input.localEntityId, input);
  }

  get(id: string): Promise<LocalAct | undefined> {
    return this.store.get<LocalAct>(ACTS, id);
  }

  async pending(): Promise<readonly LocalAct[]> {
    const acts = await this.store.list<LocalAct>(ACTS);
    const receipts = await this.store.list<QueueReceipt>(RECEIPTS);
    const terminal = new Set(
      receipts
        .filter(
          (receipt) =>
            receipt.status === 'applied' || receipt.status === 'rejected',
        )
        .map((receipt) => receipt.idempotencyKey),
    );
    return acts.filter((act) => !terminal.has(act.idempotencyKey));
  }

  async applyReceipts(receipts: readonly QueueReceipt[]): Promise<void> {
    for (const receipt of receipts) {
      const act = await this.store.get<LocalAct>(ACTS, receipt.localEntityId);
      if (act?.idempotencyKey !== receipt.idempotencyKey) continue;
      await this.store.put(RECEIPTS, receipt.idempotencyKey, receipt);
    }
  }

  receiptByIdempotency(key: string): Promise<QueueReceipt | undefined> {
    return this.store.get<QueueReceipt>(RECEIPTS, key);
  }

  cursor(): Promise<SyncCursor | undefined> {
    return this.store.get<SyncCursor>(SYNC, 'cursor');
  }

  saveCursor(cursor: SyncCursor): Promise<void> {
    return this.store.put(SYNC, 'cursor', cursor);
  }
}
