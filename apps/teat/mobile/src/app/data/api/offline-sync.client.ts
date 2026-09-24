import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface SyncReceiptResponse {
  readonly local_entity_id: string;
  readonly idempotency_key?: string;
  readonly status: 'received' | 'applied' | 'conflict' | 'rejected';
  readonly server_entity_id?: string;
  readonly error_code?: string | null;
  readonly error_message?: string | null;
}

export interface SubmitSyncBatchResponse {
  readonly batchId: string;
  readonly batch_sequence?: number | null;
  readonly accepted_items: number;
  readonly receipts: readonly SyncReceiptResponse[];
  readonly warnings?: readonly string[];
}

export interface QueueReceiptResponse {
  readonly localEntityId: string;
  readonly idempotencyKey: string;
  readonly status: 'received' | 'applied' | 'conflict' | 'rejected';
  readonly serverEntityId?: string;
  readonly errorCode?: string;
  readonly errorMessage?: string;
}

export class OfflineSyncClient {
  constructor(private readonly http: HttpClient) {}
  readonly submitBatch = (input: unknown) =>
    firstValueFrom(
      this.http.post<SubmitSyncBatchResponse>(
        '/v1/ops/offline-sync/sync-batches',
        input,
      ),
    );
  readonly receiptByIdempotency = async (
    tenant: string,
    key: string,
  ): Promise<QueueReceiptResponse | undefined> => {
    try {
      const receipt = await firstValueFrom(
        this.http.get<QueueReceiptResponse>(
          `/v1/ops/offline-sync/receipts/${tenant}/by-idempotency/${key}`,
        ),
      );
      const wire = receipt as unknown as SyncReceiptResponse;
      return {
        localEntityId: wire.local_entity_id,
        idempotencyKey: wire.idempotency_key ?? key,
        status: wire.status,
        ...(wire.server_entity_id === undefined
          ? {}
          : { serverEntityId: wire.server_entity_id }),
        ...(wire.error_code == null ? {} : { errorCode: wire.error_code }),
        ...(wire.error_message == null
          ? {}
          : { errorMessage: wire.error_message }),
      };
    } catch (error) {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 404 &&
        error.error?.code === 'TEAT.SYNC_RECEIPT_NOT_FOUND'
      ) {
        return undefined;
      }
      throw error;
    }
  };
  readonly resolveConflict = (id: string, input: unknown) =>
    firstValueFrom(
      this.http.post(
        `/v1/ops/offline-sync/sync-conflicts/${id}/resolve`,
        input,
      ),
    );
}
