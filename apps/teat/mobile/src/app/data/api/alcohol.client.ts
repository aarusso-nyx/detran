import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { CommandHeaders } from './ait.client.js';

export class AlcoholClient {
  constructor(private readonly http: HttpClient) {}

  readonly startProcedure = (
    id: string,
    input: unknown,
    headers: CommandHeaders,
  ) => {
    if (headers['Idempotency-Key'].trim() === '')
      throw new Error('idempotency-key-required');
    return firstValueFrom(
      this.http.post(`/v1/inf/alcohol/procedures/${id}/start`, input, {
        headers,
      }),
    );
  };

  readonly unsupported = async (): Promise<never> => {
    throw new Error('source_pending');
  };
}
