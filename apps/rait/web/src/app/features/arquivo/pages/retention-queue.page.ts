// T-44 Fila de retenção (ficha IU-RAIT-059; contrato CTG-0002b §6.1 linha 57): `ArchiveFacade.
// loadRetentionQueue(query)` → `retencao` (casos arquivados com `closed_at`) numa `<stynx-table>`
// (protocol_number, closed_at, archived); o prazo de retenção não se calcula (OD-018 vigente):
// só o `closed_at` é exibido. Nenhuma ação (OD-R12-017). Lista sincronizada com a URL.
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
  StynxPaginationComponent,
  StynxTableComponent,
  StynxTranslatePipe,
} from '@detran/ui';
import { provideRaitI18nFallback } from '../../../core/i18n-fallback';
import { SseService } from '../../../core/sse.service';
import { ArchiveFacade } from '../../../data/facades/archive.facade';
import { PageStateComponent } from '../../../shared/page-state.component';
import { screenOf } from '../../../shared/route-screen';
import { StreamStatusBannerComponent } from '../../../shared/stream-status-banner.component';
import type { TableColumn } from '../../../shared/table-column';
import { connectListToUrl } from '../../list-url-sync';
import { LOADING_KEY } from '../../page-support';

const TITLE_KEY = 'rait.screens.arquivo-retencao.title';
const EMPTY_KEY = 'rait.screens.arquivo-retencao.empty';
const YES_KEY = 'rait.common.yes';
const NO_KEY = 'rait.common.no';

interface RetentionRow extends Record<string, unknown> {
  readonly id: string;
  readonly protocol_number: string;
  readonly closed_at: string;
  readonly archived: string;
}

const COLUMNS: readonly TableColumn<RetentionRow>[] = [
  { key: 'protocol_number', label: 'protocol_number' },
  { key: 'closed_at', label: 'closed_at' },
  { key: 'archived', label: 'archived' },
];

@Component({
  selector: 'rait-retention-queue-page',
  imports: [
    StynxTranslatePipe,
    StynxTableComponent,
    StynxPaginationComponent,
    StreamStatusBannerComponent,
    PageStateComponent,
  ],
  providers: [...provideRaitI18nFallback(), StynxIntlDatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-screen]': 'screen',
    '[attr.data-status]': 'facade.retencao.status()',
  },
  template: `
    <h1 #heading tabindex="-1">{{ titleKey | stynxTranslate }}</h1>
    <rait-stream-status-banner />

    <rait-page-state
      [status]="facade.retencao.status()"
      [error]="facade.retencao.error()"
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
    @if (facade.retencao.value(); as page) {
      <stynx-pagination
        [totalItems]="page.total"
        [page]="page.page - 1"
        [pageSizeInput]="page.pageSize"
        (pageChange)="list.onPageChange($event)"
      />
    }
  `,
})
export class RetentionQueuePageComponent {
  readonly facade = inject(ArchiveFacade);
  private readonly i18n = inject(StynxI18nService);
  private readonly datePipe = inject(StynxIntlDatePipe);
  private readonly sse = inject(SseService);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private focused = false;

  readonly screen = screenOf(inject(ActivatedRoute));
  readonly titleKey = TITLE_KEY;
  readonly emptyKey = EMPTY_KEY;
  readonly loadingKey = LOADING_KEY;
  readonly columns = COLUMNS as TableColumn<RetentionRow>[];
  readonly trackRow = (row: RetentionRow): string => row.id;

  readonly list = connectListToUrl({
    load: (query) => this.facade.loadRetentionQueue(query),
  });
  readonly rows = computed<RetentionRow[]>(() =>
    this.facade.retencao.items().map((kase) => ({
      id: kase.id,
      protocol_number: kase.protocol_number,
      closed_at: kase.closed_at ? this.datePipe.transform(kase.closed_at) : '',
      archived: this.i18n.translate(kase.archived ? YES_KEY : NO_KEY),
    })),
  );

  constructor() {
    this.sse.connect();
    afterRenderEffect(() => {
      const status = this.facade.retencao.status();
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
    void this.facade.loadRetentionQueue(this.list.query());
  }
}
