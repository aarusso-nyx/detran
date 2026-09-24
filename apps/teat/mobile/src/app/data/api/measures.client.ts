import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { CommandHeaders } from './ait.client.js';

function options(headers: CommandHeaders) {
  if (headers['Idempotency-Key'].trim() === '')
    throw new Error('idempotency-key-required');
  return { headers };
}

export class MeasuresClient {
  constructor(private readonly http: HttpClient) {}

  readonly startAdministrativeMeasure = (
    id: string,
    input: unknown,
    headers: CommandHeaders,
  ) =>
    firstValueFrom(
      this.http.post(
        `/v1/inf/measures/administrative-measures/${id}/start`,
        input,
        options(headers),
      ),
    );

  readonly releaseRetention = (
    id: string,
    input: unknown,
    headers: CommandHeaders,
  ) =>
    firstValueFrom(
      this.http.post(
        `/v1/inf/measures/retentions/${id}/release`,
        input,
        options(headers),
      ),
    );

  readonly unsupported = async (): Promise<never> => {
    throw new Error('source_pending');
  };
}
