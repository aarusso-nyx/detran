// Adapter de prévia do `NotificationClient` (R-0033 TASK-0003; `frontend-preview-mode.md` §2,
// D-07, D-08; inventário §2). `rait-fixtures.json` não transcreve avisos, ciências nem tentativas
// de entrega: toda lista sai vazia (D-07) e todo `get*` rejeita `rait-preview-fixture-missing`
// (D-08). Sem comandos.
import { Injectable, inject } from '@angular/core';
import { NotificationClient } from '../../data/api/notification.client';
import type { ListQuerySpec } from '../../data/list-query';
import type {
  ListPage,
  ListQuery,
  Notice,
  NoticeAcknowledgement,
  NoticeDeliveryAttempt,
} from '../../data/models';
import { PreviewFixtureReader, notInFixture } from './preview-reader';

// `ListQuerySpec` — cópia literal de `data/api/notification.client.ts`.
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
export class PreviewNotificationClient extends NotificationClient {
  private readonly previewReader = inject(PreviewFixtureReader);

  override listNotice(query: ListQuery = {}): Promise<ListPage<Notice>> {
    return this.previewReader.list(query, NOTICE_SPEC, notInFixture);
  }

  override getNotice(id: string): Promise<Notice> {
    return this.previewReader.get<Notice>('notices', id, notInFixture);
  }

  override listNoticeAcknowledgement(
    query: ListQuery = {},
  ): Promise<ListPage<NoticeAcknowledgement>> {
    return this.previewReader.list(query, ACKNOWLEDGEMENT_SPEC, notInFixture);
  }

  override getNoticeAcknowledgement(
    id: string,
  ): Promise<NoticeAcknowledgement> {
    return this.previewReader.get<NoticeAcknowledgement>(
      'acknowledgements',
      id,
      notInFixture,
    );
  }

  override listNoticeDeliveryAttempt(
    query: ListQuery = {},
  ): Promise<ListPage<NoticeDeliveryAttempt>> {
    return this.previewReader.list(query, DELIVERY_ATTEMPT_SPEC, notInFixture);
  }

  override getNoticeDeliveryAttempt(
    id: string,
  ): Promise<NoticeDeliveryAttempt> {
    return this.previewReader.get<NoticeDeliveryAttempt>(
      'delivery-attempts',
      id,
      notInFixture,
    );
  }
}
