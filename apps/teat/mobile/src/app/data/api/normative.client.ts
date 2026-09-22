import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { CommandHeaders } from './ait.client.js';

export class NormativeClient {
  constructor(private readonly http: HttpClient) {}

  readonly syncMetadata = () =>
    firstValueFrom(
      this.http.get('/v1/inf/normative/mobile-packages/sync-metadata'),
    );
  readonly packageContent = (id: string) =>
    firstValueFrom(
      this.http.get(`/v1/inf/normative/mobile-packages/${id}/content`),
    );
  readonly validatePackage = (
    id: string,
    input: unknown,
    headers: CommandHeaders,
  ) => {
    if (headers['Idempotency-Key'].trim() === '')
      throw new Error('idempotency-key-required');
    return firstValueFrom(
      this.http.post(
        `/v1/inf/normative/mobile-packages/${id}/validate`,
        input,
        {
          headers,
        },
      ),
    );
  };
}
