// T-42 Busca no arquivo (ficha IU-RAIT-057; contrato CTG-0002b §6.1 linha 55): `ArchiveFacade.
// loadArchiveSearch(query)` → `busca` (casos arquivados) numa `<stynx-table>` do kit
// (protocol_number, instance, state, closed_at) com `<form role="search">` (`q`); nenhuma ação
// (abrir → `/arquivo/casos/:id`). Lista sincronizada com a URL.
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
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  StynxI18nService,
  StynxIntlDatePipe,
  StynxPaginationComponent,
  StynxTableComponent,
  StynxTranslatePipe,
} from '@detran/ui';
import { provideRaitI18nFallback } from '../../../core/i18n-fallback';
import { tokenKey } from '../../../core/i18n-token-key';
import { SseService } from '../../../core/sse.service';
import { ArchiveFacade } from '../../../data/facades/archive.facade';
import type { RaitCase } from '../../../data/models';
import { PageStateComponent } from '../../../shared/page-state.component';
import { screenOf } from '../../../shared/route-screen';
import { StreamStatusBannerComponent } from '../../../shared/stream-status-banner.component';
import type { TableColumn } from '../../../shared/table-column';
import { connectListToUrl } from '../../list-url-sync';
import { LOADING_KEY } from '../../page-support';

const TITLE_KEY = 'rait.screens.arquivo-busca.title';
const EMPTY_KEY = 'rait.screens.arquivo-busca.empty';
const SEARCH_KEY = 'rait.shell.search';
const OPEN_KEY = 'rait.action.open';
const INSTANCE_KEY_PREFIX = 'rait.instance.';
const ARCHIVE_CASE_ROUTE = '/arquivo/casos';

interface ArchivedRow extends Record<string, unknown> {
  readonly id: string;
  readonly protocol_number: string;
  readonly instance: string;
  readonly state: string;
  readonly closed_at: string;
}

const COLUMNS: readonly TableColumn<ArchivedRow>[] = [
  { key: 'protocol_number', label: 'protocol_number' },
  { key: 'instance', label: 'instance' },
  { key: 'state', label: 'state' },
  { key: 'closed_at', label: 'closed_at' },
];

@Component({
  selector: 'rait-archive-search-page',
  imports: [
    RouterLink,
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
    '[attr.data-status]': 'facade.busca.status()',
  },
  template: `
    <h1 #heading tabindex="-1">{{ titleKey | stynxTranslate }}</h1>
    <rait-stream-status-banner />

    <form role="search" (submit)="list.onSearch($event)">
      <label for="rait-archive-search-q">{{
        searchKey | stynxTranslate
      }}</label>
      <input
        id="rait-archive-search-q"
        type="search"
        name="q"
        [value]="list.query().q ?? ''"
      />
      <button type="submit">{{ searchKey | stynxTranslate }}</button>
    </form>

    <rait-page-state
      [status]="facade.busca.status()"
      [error]="facade.busca.error()"
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
      <ul class="rait-archive-search__links">
        @for (kase of facade.busca.items(); track kase.id) {
          <li>
            <a [routerLink]="caseRoute(kase)" [attr.data-case-id]="kase.id">
              {{ openKey | stynxTranslate }} {{ kase.protocol_number }}
            </a>
          </li>
        }
      </ul>
    }
    @if (facade.busca.value(); as page) {
      <stynx-pagination
        [totalItems]="page.total"
        [page]="page.page - 1"
        [pageSizeInput]="page.pageSize"
        (pageChange)="list.onPageChange($event)"
      />
    }
  `,
})
export class ArchiveSearchPageComponent {
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
  readonly searchKey = SEARCH_KEY;
  readonly openKey = OPEN_KEY;
  readonly columns = COLUMNS as TableColumn<ArchivedRow>[];
  readonly trackRow = (row: ArchivedRow): string => row.id;

  readonly list = connectListToUrl({
    load: (query) => this.facade.loadArchiveSearch(query),
  });
  readonly rows = computed<ArchivedRow[]>(() =>
    this.facade.busca.items().map((kase) => ({
      id: kase.id,
      protocol_number: kase.protocol_number,
      instance: this.i18n.translate(`${INSTANCE_KEY_PREFIX}${kase.instance}`),
      state: this.i18n.translate(tokenKey('caseState', kase.state)),
      closed_at: kase.closed_at ? this.datePipe.transform(kase.closed_at) : '',
    })),
  );

  constructor() {
    this.sse.connect();
    afterRenderEffect(() => {
      const status = this.facade.busca.status();
      const heading = this.heading()?.nativeElement;
      untracked(() => {
        if (!this.focused && (status === 'ready' || status === 'empty')) {
          this.focused = true;
          heading?.focus();
        }
      });
    });
  }

  caseRoute(kase: RaitCase): string[] {
    return [ARCHIVE_CASE_ROUTE, kase.id];
  }

  reload(): void {
    void this.facade.loadArchiveSearch(this.list.query());
  }
}
