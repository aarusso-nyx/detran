// NotificationClient (contrato CTG-0002b §3.3; M9): 3 pares list/get de
// `BP-INF-NOTIFICATION-001` (nome = `operationId`, URL literal do `paths`, ADR-0003). Sem
// comandos (§3.5: notificação é backoffice consumido, spec §14). Ver `case.client.ts`.
import { Injectable, inject } from '@angular/core';
import type { ListQuerySpec } from '../list-query';
import type {
  ListPage,
  ListQuery,
  Notice,
  NoticeAcknowledgement,
  NoticeDeliveryAttempt,
} from '../models';
import { EtagStore, type RaitCollection } from './etag-store';
import { RaitHttp } from './rait-http';

const NOTICES_URL = '/v1/inf/notification/notices';
const ACKNOWLEDGEMENTS_URL = '/v1/inf/notification/acknowledgements';
const DELIVERY_ATTEMPTS_URL = '/v1/inf/notification/delivery-attempts';

const NOTICE_SPEC: ListQuerySpec<Notice> = {
  q: [],
  filtro: ['infraction_id', 'case_id', 'kind', 'channel', 'status'],
};
const ACKNOWLEDGEMENT_SPEC: ListQuerySpec<NoticeAcknowledgement> = {
  q: [],
  filtro: ['notice_id', 'fictitious'],
};
const DELIVERY_ATTEMPT_SPEC: ListQuerySpec<NoticeDeliveryAttempt> = {
  q: [],
  filtro: ['notice_id', 'channel', 'outcome'],
};

@Injectable({ providedIn: 'root' })
export class NotificationClient {
  private readonly http = inject(RaitHttp);
  private readonly etagStore = inject(EtagStore);

  etagOf(collection: RaitCollection, id: string): string | null {
    return this.etagStore.get(collection, id);
  }

  listNotice(query: ListQuery = {}): Promise<ListPage<Notice>> {
    return this.http.getList(NOTICES_URL, query, NOTICE_SPEC);
  }

  getNotice(id: string): Promise<Notice> {
    return this.http.getOne(NOTICES_URL, 'notices', id);
  }

  listNoticeAcknowledgement(
    query: ListQuery = {},
  ): Promise<ListPage<NoticeAcknowledgement>> {
    return this.http.getList(ACKNOWLEDGEMENTS_URL, query, ACKNOWLEDGEMENT_SPEC);
  }

  getNoticeAcknowledgement(id: string): Promise<NoticeAcknowledgement> {
    return this.http.getOne(ACKNOWLEDGEMENTS_URL, 'acknowledgements', id);
  }

  listNoticeDeliveryAttempt(
    query: ListQuery = {},
  ): Promise<ListPage<NoticeDeliveryAttempt>> {
    return this.http.getList(
      DELIVERY_ATTEMPTS_URL,
      query,
      DELIVERY_ATTEMPT_SPEC,
    );
  }

  getNoticeDeliveryAttempt(id: string): Promise<NoticeDeliveryAttempt> {
    return this.http.getOne(DELIVERY_ATTEMPTS_URL, 'delivery-attempts', id);
  }
}
