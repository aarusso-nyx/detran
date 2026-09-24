import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { HttpEndpointClient } from './http-endpoint-client.js';

export interface AitAcceptResponse {
  readonly id: string;
  readonly current_status: string;
  readonly version: number;
}

@Injectable({ providedIn: 'root' })
export class AitClient extends HttpEndpointClient {
  constructor() {
    super(['/v1/inf/ait/aits']);
  }

  accept(
    id: string,
    version: number,
    userRef: string,
  ): Observable<AitAcceptResponse> {
    return this.http.post<AitAcceptResponse>(
      `/v1/inf/ait/aits/${encodeURIComponent(id)}/accept`,
      { user_ref: userRef },
      {
        headers: {
          'If-Match': String(version),
          'Idempotency-Key': `ait-accept:${id}:${version}`,
        },
      },
    );
  }
}
