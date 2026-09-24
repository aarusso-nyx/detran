import { Injectable } from '@angular/core';
import { HttpEndpointClient } from './http-endpoint-client.js';

@Injectable({ providedIn: 'root' })
export class AlcoholClient extends HttpEndpointClient {
  constructor() {
    super(['/v1/inf/alcohol/procedures']);
  }
}
