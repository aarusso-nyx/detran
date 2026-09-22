import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export type CommandHeaders = Readonly<{ 'Idempotency-Key': string }>;

function commandOptions(headers: CommandHeaders) {
  if (headers['Idempotency-Key'].trim() === '') {
    throw new Error('idempotency-key-required');
  }
  return { headers };
}

export class AitClient {
  constructor(private readonly http: HttpClient) {}

  private readonly post = (
    path: string,
    input: unknown,
    headers: CommandHeaders,
  ) => firstValueFrom(this.http.post(path, input, commandOptions(headers)));

  readonly finalize = (id: string, input: unknown, headers: CommandHeaders) =>
    this.post(`/v1/inf/ait/aits/${id}/finalize`, input, headers);
  readonly recordScience = (
    id: string,
    input: unknown,
    headers: CommandHeaders,
  ) => this.post(`/v1/inf/ait/aits/${id}/science`, input, headers);
  readonly recordPrintEvent = (
    id: string,
    input: unknown,
    headers: CommandHeaders,
  ) => this.post(`/v1/inf/ait/aits/${id}/print-events`, input, headers);
  readonly queueTransmission = (
    id: string,
    input: unknown,
    headers: CommandHeaders,
  ) => this.post(`/v1/inf/ait/aits/${id}/queue-transmission`, input, headers);
  readonly requestCancel = (input: unknown, headers: CommandHeaders) =>
    this.post('/v1/inf/ait/cancel-requests', input, headers);
}
