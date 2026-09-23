// T-13 Comunicações (ficha IU-RAIT-015; contrato CTG-0002b §6.1 linha 15): `CaseFacade.
// loadCommunications(id)` → `comunicacoes` numa `<stynx-table>` do kit (channel →
// `rait.channel.` + token, sent_at, effective_on, next_deadline_on, authority_appeal_notice) e
// `EventTimeline` de `eventos`. Nenhuma ação; o badge `state.pending-retransmission` é reservado
// ao erro `UPSTREAM_*` (503) do servidor (§4.4) — R-0007 CTG-0004 — e não é renderizado hoje.
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  untracked,
  viewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  StynxI18nService,
  StynxIntlDatePipe,
  StynxTableComponent,
  StynxTranslatePipe,
} from '@detran/ui';
import { provideRaitI18nFallback } from '../../../core/i18n-fallback';
import { CaseFacade } from '../../../data/facades/case.facade';
import { EventTimelineComponent } from '../../../shared/event-timeline.component';
import { PageStateComponent } from '../../../shared/page-state.component';
import { screenOf } from '../../../shared/route-screen';
import { StreamStatusBannerComponent } from '../../../shared/stream-status-banner.component';
import type { TableColumn } from '../../../shared/table-column';
import { LOADING_KEY, combineStatus } from '../../page-support';
import { caseIdOf } from '../case-route';

const TITLE_KEY = 'rait.screens.casos-id-comunicacoes.title';
const INTRO_KEY = 'rait.screens.casos-id-comunicacoes.intro';
const EMPTY_KEY = 'rait.screens.casos-id-comunicacoes.empty';
/** Reservado ao 503 `UPSTREAM_*` (§4.4; R-0007 CTG-0004): não renderizado nesta CTG. */
export const PENDING_RETRANSMISSION_KEY =
  'rait.screens.casos-id-comunicacoes.state.pending-retransmission';
const CHANNEL_PREFIX = 'rait.channel.';
const YES_KEY = 'rait.common.yes';
const NO_KEY = 'rait.common.no';

interface CommunicationRow extends Record<string, unknown> {
  readonly id: string;
  readonly channel: string;
  readonly sent_at: string;
  readonly effective_on: string;
  readonly next_deadline_on: string;
  readonly authority_appeal_notice: string;
}

const COLUMNS: readonly TableColumn<CommunicationRow>[] = [
  { key: 'channel', label: 'channel' },
  { key: 'sent_at', label: 'sent_at' },
  { key: 'effective_on', label: 'effective_on' },
  { key: 'next_deadline_on', label: 'next_deadline_on' },
  { key: 'authority_appeal_notice', label: 'authority_appeal_notice' },
];

@Component({
  selector: 'rait-communications-page',
  imports: [
    StynxTranslatePipe,
    StynxTableComponent,
    StreamStatusBannerComponent,
    PageStateComponent,
    EventTimelineComponent,
  ],
  providers: [...provideRaitI18nFallback(), StynxIntlDatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-screen]': 'screen',
    '[attr.data-status]': 'status()',
  },
  template: `
    <h1 #heading tabindex="-1">{{ titleKey | stynxTranslate }}</h1>
    <rait-stream-status-banner />
    <p>{{ introKey | stynxTranslate }}</p>

    <rait-page-state
      [status]="status()"
      [error]="facade.caso.error() ?? facade.comunicacoes.error()"
      [loadingLabelKey]="loadingKey"
      [emptyLabelKey]="emptyKey"
      (retry)="reload()"
    />

    @if (rows().length > 0) {
      <stynx-table
        [columns]="columns"
        [rows]="rows()"
        [rowTrackBy]="trackRow"
      />
    }
    <rait-event-timeline
      [events]="facade.eventos.items()"
      [status]="facade.eventos.status()"
    />
  `,
})
export class CommunicationsPageComponent {
  readonly facade = inject(CaseFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly i18n = inject(StynxI18nService);
  private readonly datePipe = inject(StynxIntlDatePipe);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private focused = false;

  readonly screen = screenOf(this.route);
  readonly caseId = caseIdOf(this.route);
  readonly titleKey = TITLE_KEY;
  readonly introKey = INTRO_KEY;
  readonly emptyKey = EMPTY_KEY;
  readonly loadingKey = LOADING_KEY;
  readonly columns = COLUMNS as TableColumn<CommunicationRow>[];
  readonly trackRow = (row: CommunicationRow): string => row.id;

  readonly status = computed(() =>
    combineStatus(this.facade.caso.status(), this.facade.comunicacoes.status()),
  );

  readonly rows = computed<CommunicationRow[]>(() =>
    this.facade.comunicacoes.items().map((item) => ({
      id: item.id,
      channel: this.i18n.translate(`${CHANNEL_PREFIX}${item.channel}`),
      sent_at: this.datePipe.transform(item.sent_at),
      effective_on: item.effective_on
        ? this.datePipe.transform(item.effective_on)
        : '',
      next_deadline_on: item.next_deadline_on
        ? this.datePipe.transform(item.next_deadline_on)
        : '',
      authority_appeal_notice: this.i18n.translate(
        item.authority_appeal_notice ? YES_KEY : NO_KEY,
      ),
    })),
  );

  constructor() {
    void this.facade.loadCaseBundle(this.caseId);
    void this.facade.loadCommunications(this.caseId);
    void this.facade.loadEvents(this.caseId);
    afterRenderEffect(() => {
      const status = this.status();
      const heading = this.heading()?.nativeElement;
      untracked(() => {
        if (!this.focused && (status === 'ready' || status === 'empty')) {
          this.focused = true;
          heading?.focus();
        }
      });
    });
  }

  reload(): void {
    void this.facade.loadCommunications(this.caseId);
    void this.facade.loadEvents(this.caseId);
  }
}
