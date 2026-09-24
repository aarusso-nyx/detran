import { Injectable } from '@angular/core';
import { HttpEndpointClient } from './http-endpoint-client.js';

@Injectable({ providedIn: 'root' })
export class NormativeClient extends HttpEndpointClient {
  constructor() {
    super(['/v1/inf/normative/catalogs']);
  }
}
