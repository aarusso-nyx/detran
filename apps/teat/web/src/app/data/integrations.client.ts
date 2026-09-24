import { Injectable } from '@angular/core';
import { HttpEndpointClient } from './http-endpoint-client.js';

@Injectable({ providedIn: 'root' })
export class IntegrationsClient extends HttpEndpointClient {
  constructor() {
    super(['/v1/ops/integrations/outbox']);
  }
}
