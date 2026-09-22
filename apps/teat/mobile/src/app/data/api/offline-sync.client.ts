import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export class OfflineSyncClient {
  constructor(private readonly http: HttpClient) {}
  readonly submitBatch = (input: unknown) =>
    firstValueFrom(this.http.post('/v1/ops/offline-sync/sync-batches', input));
  readonly receiptByIdempotency = (tenant: string, key: string) =>
    firstValueFrom(
      this.http.get(
        `/v1/ops/offline-sync/receipts/${tenant}/by-idempotency/${key}`,
      ),
    );
  readonly resolveConflict = (id: string, input: unknown) =>
    firstValueFrom(
      this.http.post(
        `/v1/ops/offline-sync/sync-conflicts/${id}/resolve`,
        input,
      ),
    );
}
