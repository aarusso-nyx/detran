import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import { AgencyClient } from './agency.client.js';
import { AitClient } from './ait.client.js';
import { AlcoholClient } from './alcohol.client.js';
import { DashboardClient } from './dashboard.client.js';
import { EvidenceClient } from './evidence.client.js';
import { IntegrationsClient } from './integrations.client.js';
import { StynxAuditClient } from './kernel STYNX.client.js';
import { MeasuresClient } from './measures.client.js';
import { NormativeClient } from './normative.client.js';
import { OpsClient } from './ops.client.js';
import type { TeatEndpointClient } from './http-endpoint-client.js';

@Injectable({ providedIn: 'root' })
export class WebClientRegistry {
  private readonly clients: Readonly<Record<string, TeatEndpointClient>> = {
    dashboard: inject(DashboardClient),
    ops: inject(OpsClient),
    ait: inject(AitClient),
    measures: inject(MeasuresClient),
    alcohol: inject(AlcoholClient),
    evidence: inject(EvidenceClient),
    'kernel STYNX': inject(StynxAuditClient),
    agency: inject(AgencyClient),
    normative: inject(NormativeClient),
    integrations: inject(IntegrationsClient),
  };

  query(client: string, endpoint: string): Observable<unknown> {
    const selected = this.clients[client];
    if (selected === undefined) {
      throw new Error(`Cliente web não autorizado: ${client}`);
    }
    return selected.get(endpoint);
  }
}
