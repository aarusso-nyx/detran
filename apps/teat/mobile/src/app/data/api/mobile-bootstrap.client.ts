import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type {
  BootstrapSnapshot,
  MobileBootstrapQuery,
} from '../../core/bootstrap.store.js';
import type { CommandHeaders } from './ait.client.js';

function options(headers: CommandHeaders) {
  if (headers['Idempotency-Key'].trim() === '')
    throw new Error('idempotency-key-required');
  return { headers };
}
export class MobileBootstrapClient {
  constructor(private readonly http: HttpClient) {}
  getBootstrap = (input: MobileBootstrapQuery): Promise<BootstrapSnapshot> =>
    firstValueFrom(
      this.http.get<BootstrapSnapshot>('/v1/ops/mobile-bootstrap', {
        params: {
          device_id: input.device_id,
          app_version: input.app_version,
          ...(input.installation_id === undefined
            ? {}
            : { installation_id: input.installation_id }),
          ...(input.protocol_version === undefined
            ? {}
            : { protocol_version: input.protocol_version }),
        },
      }),
    );
  openShift = (input: unknown, _deviceId: string, headers: CommandHeaders) =>
    firstValueFrom(
      this.http.post('/v1/ops/mobile-bootstrap/shifts', input, {
        ...options(headers),
      }),
    );
  closeShift = (id: string, input: unknown, headers: CommandHeaders) =>
    firstValueFrom(
      this.http.post(
        '/v1/ops/mobile-bootstrap/shifts/' + id + '/close',
        input,
        options(headers),
      ),
    );
  handoffSession = (input: unknown, headers: CommandHeaders) =>
    firstValueFrom(
      this.http.post(
        '/v1/ops/mobile-bootstrap/sessions/handoff',
        input,
        options(headers),
      ),
    );
}
