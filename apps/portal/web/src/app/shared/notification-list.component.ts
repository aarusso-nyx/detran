// NotificationList (contrato CTG-0003c §5.1; ficha T12; [RN-PORTAL-124]; [WF-PORTAL-003]): lista
// semântica das notificações da caixa (A9(b)). Por item: tipo (ícone + texto, nunca só cor), canal
// de origem traduzido, assunto/resumo do servidor, datas, prazo como `DeadlineCard` e — SÓ para a
// origem SNE — a data de ciência ficta TAL COMO RECEBIDA do servidor (`fictitiousAcknowledgementOn`;
// nunca derivada de `availableOn`, [DIVERGE-4]). Tokens (`kind`, `source`, `category`) ficam em
// `data-*` e só os rótulos do catálogo viram texto. O link do assunto vai ao AIT ou ao processo,
// nunca à home. "Marcar como lida" só com `readOn === null`; a navegação é da página.
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { StynxIntlDatePipe, StynxTranslatePipe } from '@detran/ui';
import type { InboxItem } from '../data/portal-read.models';
import { DeadlineCardComponent } from './deadline-card.component';

const AIT_ROUTE_PREFIX = '/autos/';
const PROCESS_ROUTE_PREFIX = '/processos/';
const INBOX_ROUTE = '/notificacoes';
const KIND_KEY_PREFIX = `portal.notifications.kind.`;
const ORIGIN_KEY_PREFIX = `portal.notifications.origin.`;
const NEXT_ACTION_KEY_PREFIX = `portal.situation.next_action.`;

/** Ícone por tipo (texto sempre ao lado — ux-notes §f; T12 §9). */
const KIND_ICON: Readonly<Record<InboxItem['kind'], string>> = {
  acao_necessaria: '⚠',
  informativo: 'ℹ',
};

@Component({
  selector: 'portal-notification-list',
  imports: [
    RouterLink,
    StynxTranslatePipe,
    StynxIntlDatePipe,
    DeadlineCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-live': 'polite', '[attr.data-count]': 'items().length' },
  template: `
    <ol data-notification-list class="portal-notification-list">
      @for (item of items(); track item.id) {
        <li
          class="portal-notification"
          [attr.data-id]="item.id"
          [attr.data-kind]="item.kind"
          [attr.data-source]="item.source"
          [attr.data-category]="item.category"
          [attr.data-read]="item.readOn ? 'true' : 'false'"
        >
          <p class="portal-notification-kind">
            <span aria-hidden="true">{{ iconFor(item.kind) }}</span>
            <span>{{ kindKey(item.kind) | stynxTranslate }}</span>
          </p>
          <h3>
            <a
              [routerLink]="subjectRoute(item)"
              [attr.routerLink]="subjectRoute(item)"
              >{{
                subjectText(item) ?? (kindKey(item.kind) | stynxTranslate)
              }}</a
            >
          </h3>
          @if (item.subject && item.summary) {
            <p data-summary>{{ item.summary }}</p>
          }
          <p data-source-label>
            {{
              'portal.screens.t12.field.canal'
                | stynxTranslate
                  : { source: (originKey(item.source) | stynxTranslate) }
            }}
          </p>
          @if (item.availableOn; as availableOn) {
            <p data-available-on>
              <time [attr.datetime]="availableOn">{{
                'portal.screens.t12.field.disponibilizada_em'
                  | stynxTranslate
                    : { availableOn: (availableOn | stynxIntlDate) }
              }}</time>
            </p>
          }
          @if (item.readOn; as readOn) {
            <p data-read-on>
              <time [attr.datetime]="readOn">{{
                'portal.screens.t12.field.lida_em'
                  | stynxTranslate: { readOn: (readOn | stynxIntlDate) }
              }}</time>
            </p>
          }
          @if (
            item.source === 'sne' && item.fictitiousAcknowledgementOn;
            as on
          ) {
            <p data-fictitious-acknowledgement>
              <span>{{
                'portal.notifications.ciencia_ficta' | stynxTranslate
              }}</span>
              <time [attr.datetime]="on">{{
                'portal.screens.t12.field.ciencia_ficta_em'
                  | stynxTranslate: { date: (on | stynxIntlDate) }
              }}</time>
            </p>
          }
          @if (item.deadline; as deadline) {
            <portal-deadline-card
              [dueOn]="deadline.dueOn"
              [ownedBy]="deadline.ownedBy"
              [labelKey]="nextActionKey(deadline.ownedBy)"
            />
          }
          @if (!item.readOn) {
            <button
              type="button"
              data-mark-read
              [disabled]="busy()"
              (click)="read.emit(item.id)"
            >
              {{ markReadLabelKey() | stynxTranslate }}
            </button>
          }
        </li>
      }
    </ol>
  `,
})
export class NotificationListComponent {
  readonly items = input.required<readonly InboxItem[]>();
  /** Desabilita "marcar como lida". */
  readonly busy = input(false);
  readonly markReadLabelKey = input<string>(
    'portal.screens.t12.cmd.marcar_lida',
  );
  /** `inboxItemId`. */
  readonly read = output<string>();
  /** Reservado à página (contrato §5.1): a navegação do assunto é o `routerLink` do item. */
  readonly opened = output<InboxItem>();

  /** `subject`, senão `summary` (texto do servidor); ausentes → rótulo do tipo. */
  subjectText(item: InboxItem): string | null {
    return item.subject ?? item.summary ?? null;
  }

  iconFor(kind: InboxItem['kind']): string {
    return KIND_ICON[kind];
  }

  kindKey(kind: string): string {
    return `${KIND_KEY_PREFIX}${kind}`;
  }

  originKey(source: string): string {
    return `${ORIGIN_KEY_PREFIX}${source}`;
  }

  nextActionKey(ownedBy: 'citizen' | 'agency'): string {
    return `${NEXT_ACTION_KEY_PREFIX}${ownedBy}`;
  }

  /** `aitId` → `/autos/<aitId>`; `requestId` → `/processos/<requestId>`; nenhum → `/notificacoes` (T12 §6). */
  subjectRoute(item: InboxItem): string {
    if (item.aitId) return `${AIT_ROUTE_PREFIX}${item.aitId}`;
    if (item.requestId) return `${PROCESS_ROUTE_PREFIX}${item.requestId}`;
    return INBOX_ROUTE;
  }
}
