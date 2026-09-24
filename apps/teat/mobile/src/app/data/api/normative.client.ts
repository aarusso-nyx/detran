import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { CommandHeaders } from './ait.client.js';

export interface NormativePackageEnvelope {
  readonly manifest: Readonly<Record<string, unknown>>;
  readonly manifest_hash: string;
  readonly signature: string;
}

export interface NormativeValidationResponse {
  readonly valid: boolean;
  readonly reason: string;
}

export class NormativeClient {
  constructor(private readonly http: HttpClient) {}

  readonly syncMetadata = () =>
    firstValueFrom(
      this.http.get('/v1/inf/normative/mobile-packages/sync-metadata'),
    );
  readonly packageContent = (id: string) =>
    firstValueFrom(
      this.http.get<NormativePackageEnvelope>(
        `/v1/inf/normative/mobile-packages/${id}/content`,
      ),
    );
  readonly validatePackage = (
    id: string,
    input: unknown,
    headers: CommandHeaders,
  ) => {
    if (headers['Idempotency-Key'].trim() === '')
      throw new Error('idempotency-key-required');
    return firstValueFrom(
      this.http.post<NormativeValidationResponse>(
        `/v1/inf/normative/mobile-packages/${id}/validate`,
        input,
        {
          headers,
        },
      ),
    );
  };
}
