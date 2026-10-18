// Adapter de prévia do `InfractionClient` (R-0033 TASK-0003; `frontend-preview-mode.md` §2, D-07,
// D-08; inventário §2). `rait-fixtures.json` não transcreve infrações, timers nem eventos de
// infração (`aits` é AIT, não infração; seed `30-fixtures-infraction.sql` fora de
// `rait-fixtures.md` §10): toda lista sai vazia (D-07) e todo `get*` rejeita
// `rait-preview-fixture-missing` (D-08). Sem comandos.
import { Injectable, inject } from '@angular/core';
import { InfractionClient } from '../../data/api/infraction.client';
import type { ListQuerySpec } from '../../data/list-query';
import type {
  Infraction,
  InfractionEvent,
  InfractionTimer,
  ListPage,
  ListQuery,
} from '../../data/models';
import { PreviewFixtureReader, notInFixture } from './preview-reader';

// `ListQuerySpec` — cópia literal de `data/api/infraction.client.ts`.
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
export class PreviewInfractionClient extends InfractionClient {
  private readonly previewReader = inject(PreviewFixtureReader);

  override listInfraction(
    query: ListQuery = {},
  ): Promise<ListPage<Infraction>> {
    return this.previewReader.list(query, INFRACTION_SPEC, notInFixture);
  }

  override getInfraction(id: string): Promise<Infraction> {
    return this.previewReader.get<Infraction>('infractions', id, notInFixture);
  }

  override listInfractionTimer(
    query: ListQuery = {},
  ): Promise<ListPage<InfractionTimer>> {
    return this.previewReader.list(query, TIMER_SPEC, notInFixture);
  }

  override getInfractionTimer(id: string): Promise<InfractionTimer> {
    return this.previewReader.get<InfractionTimer>('timers', id, notInFixture);
  }

  override listInfractionEvent(
    query: ListQuery = {},
  ): Promise<ListPage<InfractionEvent>> {
    return this.previewReader.list(query, INFRACTION_EVENT_SPEC, notInFixture);
  }

  override getInfractionEvent(id: string): Promise<InfractionEvent> {
    return this.previewReader.get<InfractionEvent>(
      'infraction-events',
      id,
      notInFixture,
    );
  }
}
