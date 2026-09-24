import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { CommandHeaders } from './ait.client.js';

export type ConditionalCommandHeaders = CommandHeaders &
  Readonly<{ 'If-Match': string }>;

function options(
  headers: CommandHeaders | ConditionalCommandHeaders,
  conditional = false,
) {
  if (headers['Idempotency-Key'].trim() === '')
    throw new Error('idempotency-key-required');
  if (
    conditional &&
    (!('If-Match' in headers) || headers['If-Match'].trim() === '')
  ) {
    throw new Error('if-match-required');
  }
  return { headers };
}

export class ProvisioningClient {
  constructor(private readonly http: HttpClient) {}

  readonly createKeyChallenge = (
    id: string,
    input: unknown,
    headers: CommandHeaders,
  ) =>
    firstValueFrom(
      this.http.post(
        `/v1/ops/provisioning/devices/${id}/key-challenges`,
        input,
        options(headers),
      ),
    );
  readonly registerDeviceKey = (
    id: string,
    input: unknown,
    headers: ConditionalCommandHeaders,
  ) =>
    firstValueFrom(
      this.http.post(
        `/v1/ops/provisioning/devices/${id}/keys`,
        input,
        options(headers, true),
      ),
    );
  readonly issuePackage = (
    input: unknown,
    headers: ConditionalCommandHeaders,
  ) =>
    firstValueFrom(
      this.http.post(
        '/v1/ops/provisioning/packages',
        input,
        options(headers, true),
      ),
    );
  readonly downloadPackageContent = (id: string) =>
    firstValueFrom(
      this.http.get(`/v1/ops/provisioning/packages/${id}/content`),
    );
  readonly recordReceipt = (
    id: string,
    input: unknown,
    headers: ConditionalCommandHeaders,
  ) =>
    firstValueFrom(
      this.http.post(
        `/v1/ops/provisioning/packages/${id}/receipts`,
        input,
        options(headers, true),
      ),
    );
  readonly readiness = (id: string) =>
    firstValueFrom(
      this.http.get(`/v1/ops/provisioning/devices/${id}/readiness`),
    );
  readonly revokeGrant = (
    id: string,
    input: unknown,
    headers: ConditionalCommandHeaders,
  ) =>
    firstValueFrom(
      this.http.post(
        `/v1/ops/provisioning/grants/${id}/revoke`,
        input,
        options(headers, true),
      ),
    );
  readonly reconcileGrant = (
    id: string,
    input: unknown,
    headers: ConditionalCommandHeaders,
  ) =>
    firstValueFrom(
      this.http.post(
        `/v1/ops/provisioning/grants/${id}/reconcile`,
        input,
        options(headers, true),
      ),
    );
}
