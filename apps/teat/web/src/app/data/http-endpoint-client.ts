import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import type { Observable } from 'rxjs';

export interface TeatEndpointClient {
  get(endpoint: string): Observable<unknown>;
}

export abstract class HttpEndpointClient implements TeatEndpointClient {
  protected readonly http = inject(HttpClient);

  protected constructor(private readonly allowedEndpoints: readonly string[]) {}

  get(endpoint: string): Observable<unknown> {
    if (!this.allowedEndpoints.includes(endpoint)) {
      throw new Error(`Endpoint não autorizado para o cliente: ${endpoint}`);
    }
    return this.http.get(endpoint);
  }
}
