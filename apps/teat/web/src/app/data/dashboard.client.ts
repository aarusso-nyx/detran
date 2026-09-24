import { Injectable } from '@angular/core';
import { HttpEndpointClient } from './http-endpoint-client.js';

@Injectable({ providedIn: 'root' })
export class DashboardClient extends HttpEndpointClient {
  constructor() {
    super(['/v1/dashboard/alerts', '/v1/dashboard/bi-panels']);
  }
}
