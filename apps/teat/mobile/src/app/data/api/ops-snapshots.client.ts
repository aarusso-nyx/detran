import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export class OpsSnapshotsClient {
  constructor(private readonly http: HttpClient) {}
  readonly externalQuery = (input: unknown) =>
    firstValueFrom(this.http.post('/v1/ops/snapshots/external-queries', input));
}
