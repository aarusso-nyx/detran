import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export type CommandHeaders = Readonly<{ 'Idempotency-Key': string }>;
export type ConditionalCommandHeaders = CommandHeaders &
  Readonly<{ 'If-Match': string }>;

function commandOptions(
  headers: CommandHeaders | ConditionalCommandHeaders,
  conditional = false,
) {
  if (headers['Idempotency-Key'].trim() === '') {
    throw new Error('idempotency-key-required');
  }
  if (
    conditional &&
    (!('If-Match' in headers) || headers['If-Match'].trim() === '')
  ) {
    throw new Error('if-match-required');
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
    headers: ConditionalCommandHeaders,
  ) =>
    firstValueFrom(
      this.http.post(`/v1/inf/ait/aits/${id}/print-events`, input, {
        ...commandOptions(headers, true),
      }),
    );
  readonly queueTransmission = (
    id: string,
    input: unknown,
    headers: CommandHeaders,
  ) => this.post(`/v1/inf/ait/aits/${id}/queue-transmission`, input, headers);
  readonly requestCancel = (input: unknown, headers: CommandHeaders) =>
    this.post('/v1/inf/ait/cancel-requests', input, headers);
}
