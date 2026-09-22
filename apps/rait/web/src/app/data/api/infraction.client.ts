// InfractionClient (contrato CTG-0002b §3.3; M9): 3 pares list/get de `BP-INF-INFRACTION-001`
// (nome = `operationId`, URL literal do `paths`, ADR-0003). Sem comandos (§3.5: fichas 050–056
// são L0). Ver `case.client.ts` para as regras comuns.
import { Injectable, inject } from '@angular/core';
import type { ListQuerySpec } from '../list-query';
import type {
  Infraction,
  InfractionEvent,
  InfractionTimer,
  ListPage,
  ListQuery,
} from '../models';
import { EtagStore, type RaitCollection } from './etag-store';
import { RaitHttp } from './rait-http';

const INFRACTIONS_URL = '/v1/inf/infraction/infractions';
const TIMERS_URL = '/v1/inf/infraction/timers';
const INFRACTION_EVENTS_URL = '/v1/inf/infraction/events';

const INFRACTION_SPEC: ListQuerySpec<Infraction> = {
  q: [],
  filtro: ['ait_id', 'state', 'substate', 'risk_flag', 'paid'],
};
const TIMER_SPEC: ListQuerySpec<InfractionTimer> = {
  q: [],
  filtro: ['infraction_id', 'timer_code', 'status'],
};
const INFRACTION_EVENT_SPEC: ListQuerySpec<InfractionEvent> = {
  q: [],
  filtro: ['infraction_id', 'event_code'],
};

@Injectable({ providedIn: 'root' })
export class InfractionClient {
  private readonly http = inject(RaitHttp);
  private readonly etagStore = inject(EtagStore);

  etagOf(collection: RaitCollection, id: string): string | null {
    return this.etagStore.get(collection, id);
  }

  listInfraction(query: ListQuery = {}): Promise<ListPage<Infraction>> {
    return this.http.getList(INFRACTIONS_URL, query, INFRACTION_SPEC);
  }

  getInfraction(id: string): Promise<Infraction> {
    return this.http.getOne(INFRACTIONS_URL, 'infractions', id);
  }

  listInfractionTimer(
    query: ListQuery = {},
  ): Promise<ListPage<InfractionTimer>> {
    return this.http.getList(TIMERS_URL, query, TIMER_SPEC);
  }

  getInfractionTimer(id: string): Promise<InfractionTimer> {
    return this.http.getOne(TIMERS_URL, 'timers', id);
  }

  listInfractionEvent(
    query: ListQuery = {},
  ): Promise<ListPage<InfractionEvent>> {
    return this.http.getList(
      INFRACTION_EVENTS_URL,
      query,
      INFRACTION_EVENT_SPEC,
    );
  }

  getInfractionEvent(id: string): Promise<InfractionEvent> {
    return this.http.getOne(INFRACTION_EVENTS_URL, 'infraction-events', id);
  }
}
