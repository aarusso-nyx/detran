// EventTimeline (contrato CTG-0002b §5.20; UC-RAIT-042; fichas 015/017/022/029/034/036/060; Portal
// `process-timeline`): `<ol>` na ordem recebida (nunca reordena); por evento `occurred_at`
// (`StynxIntlDatePipe`), `event_type` como texto em `<code>` (string livre do contrato — não é
// chave), `from_state`/`to_state` por `tokenKey('caseState', …)` em `rait.common.transition`
// {from}{to}, `actor_id` em `<code>` (`rait.common.actor`); `payload` NUNCA renderizado
// ([RN-RAIT-134]). `status` 'loading' → `detran-loading-state`; vazio → `detran-empty-state`.
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import {
  DetranEmptyStateComponent,
  DetranLoadingStateComponent,
  StynxI18nService,
  StynxIntlDatePipe,
  StynxTranslatePipe,
} from '@detran/ui';
import { tokenKey } from '../core/i18n-token-key';
import type { ReadStatus } from '../data/facades/read-store';
import type { RaitCaseEvent } from '../data/models';

const TRANSITION_KEY = 'rait.common.transition';
const ACTOR_KEY = 'rait.common.actor';
const EMPTY_KEY = 'rait.states.empty';
const LOADING_KEY = 'rait.states.loading';
const TIME_FORMAT: Intl.DateTimeFormatOptions = {
  dateStyle: 'short',
  timeStyle: 'short',
};

@Component({
  selector: 'rait-event-timeline',
  imports: [
    StynxTranslatePipe,
    StynxIntlDatePipe,
    DetranEmptyStateComponent,
    DetranLoadingStateComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'rait-event-timeline',
    'aria-live': 'polite',
    '[attr.data-count]': 'events().length',
    '[attr.data-status]': 'status()',
  },
  template: `
    @if (status() === 'loading') {
      <detran-loading-state [label]="loadingKey | stynxTranslate" />
    } @else if (events().length === 0) {
      <detran-empty-state
        [title]="emptyKey | stynxTranslate"
        [message]="emptyKey | stynxTranslate"
      />
    } @else {
      <ol class="rait-event-timeline__list">
        @for (event of events(); track event.id) {
          <li
            [attr.data-event-id]="event.id"
            [attr.data-event-type]="event.event_type"
          >
            <time [attr.datetime]="event.occurred_at">{{
              event.occurred_at | stynxIntlDate: timeFormat
            }}</time>
            @if (event.actor_id; as actor) {
              <span class="rait-event-timeline__actor">
                <span>{{ actorKey | stynxTranslate }}</span>
                <code>{{ actor }}</code>
              </span>
            }
            <code class="rait-event-timeline__type">{{
              event.event_type
            }}</code>
            @if (transitionText(event); as transition) {
              <span class="rait-event-timeline__transition">{{
                transition
              }}</span>
            }
          </li>
        }
      </ol>
    }
  `,
})
export class EventTimelineComponent {
  private readonly i18n = inject(StynxI18nService);

  readonly events = input.required<readonly RaitCaseEvent[]>();
  readonly status = input<ReadStatus>('ready');

  readonly actorKey = ACTOR_KEY;
  readonly emptyKey = EMPTY_KEY;
  readonly loadingKey = LOADING_KEY;
  readonly timeFormat = TIME_FORMAT;

  /** `rait.common.transition` {from}{to} com os rótulos dos tokens; só quando há estados. */
  transitionText(event: RaitCaseEvent): string | null {
    if (!event.from_state && !event.to_state) return null;
    const from = event.from_state
      ? this.i18n.translate(tokenKey('caseState', event.from_state))
      : '';
    const to = event.to_state
      ? this.i18n.translate(tokenKey('caseState', event.to_state))
      : '';
    return this.i18n.translate(TRANSITION_KEY, { from, to });
  }
}
