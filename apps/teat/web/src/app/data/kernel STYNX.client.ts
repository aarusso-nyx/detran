import { Injectable } from '@angular/core';
import { HttpEndpointClient } from './http-endpoint-client.js';

@Injectable({ providedIn: 'root' })
export class StynxAuditClient extends HttpEndpointClient {
  constructor() {
    super(['/v1/audit/events']);
  }
}
