// T-45 Trilha de auditoria (ficha IU-RAIT-060; contrato CTG-0002b §6.1 linha 58): `AuditFacade.
// loadTrail(query)` → `trilha` (eventos de caso; `GET audit` do kernel sem contrato) no
// `EventTimeline`, com `<form>` de filtro por `case_id` (`filtro=case_id:<uuid>`). Nenhuma ação.
// Lista sincronizada com a URL.
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  inject,
  untracked,
  viewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StynxPaginationComponent, StynxTranslatePipe } from '@detran/ui';
import { provideRaitI18nFallback } from '../../../core/i18n-fallback';
import { SseService } from '../../../core/sse.service';
import { AuditFacade } from '../../../data/facades/audit.facade';
import { EventTimelineComponent } from '../../../shared/event-timeline.component';
import { PageStateComponent } from '../../../shared/page-state.component';
import { screenOf } from '../../../shared/route-screen';
import { StreamStatusBannerComponent } from '../../../shared/stream-status-banner.component';
import { connectListToUrl } from '../../list-url-sync';
import { LOADING_KEY, errorsOnly } from '../../page-support';

const TITLE_KEY = 'rait.screens.auditoria-trilha.title';
const EMPTY_KEY = 'rait.screens.auditoria-trilha.empty';
const SEARCH_KEY = 'rait.shell.search';
const CASE_ID_FILTER = 'case_id';

@Component({
  selector: 'rait-audit-trail-page',
  imports: [
    StynxTranslatePipe,
    StynxPaginationComponent,
    StreamStatusBannerComponent,
    PageStateComponent,
    EventTimelineComponent,
  ],
  providers: provideRaitI18nFallback(),
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-screen]': 'screen',
    '[attr.data-status]': 'facade.trilha.status()',
  },
  template: `
    <h1 #heading tabindex="-1">{{ titleKey | stynxTranslate }}</h1>
    <rait-stream-status-banner />

    <form (submit)="onFilter($event)">
      <label for="rait-audit-case">case_id</label>
      <input
        id="rait-audit-case"
        type="search"
        name="case_id"
        [value]="list.query().filtro?.['case_id'] ?? ''"
      />
      <button type="submit">{{ searchKey | stynxTranslate }}</button>
    </form>

    <rait-page-state
      [status]="pageStatus()"
      [error]="facade.trilha.error()"
      [loadingLabelKey]="loadingKey"
      [emptyLabelKey]="emptyKey"
      (retry)="reload()"
    />

    <rait-event-timeline
      [events]="facade.trilha.items()"
      [status]="facade.trilha.status()"
    />
    @if (facade.trilha.value(); as page) {
      <stynx-pagination
        [totalItems]="page.total"
        [page]="page.page - 1"
        [pageSizeInput]="page.pageSize"
        (pageChange)="list.onPageChange($event)"
      />
    }
  `,
})
export class AuditTrailPageComponent {
  readonly facade = inject(AuditFacade);
  private readonly sse = inject(SseService);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private focused = false;

  readonly screen = screenOf(inject(ActivatedRoute));
  readonly titleKey = TITLE_KEY;
  readonly emptyKey = EMPTY_KEY;
  readonly loadingKey = LOADING_KEY;
  readonly searchKey = SEARCH_KEY;

  readonly list = connectListToUrl({
    load: (query) => this.facade.loadTrail(query),
  });
  /** O `EventTimeline` apresenta `loading`/vazio; aqui só os erros. */
  readonly pageStatus = () => errorsOnly(this.facade.trilha.status());

  constructor() {
    this.sse.connect();
    afterRenderEffect(() => {
      const status = this.facade.trilha.status();
      const heading = this.heading()?.nativeElement;
      untracked(() => {
        if (!this.focused && (status === 'ready' || status === 'empty')) {
          this.focused = true;
          heading?.focus();
        }
      });
    });
  }

  onFilter(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement | null;
    const input = form?.elements.namedItem(CASE_ID_FILTER);
    const caseId = input instanceof HTMLInputElement ? input.value.trim() : '';
    this.list.setQuery({
      filtro: caseId.length > 0 ? { [CASE_ID_FILTER]: caseId } : undefined,
    });
  }

  reload(): void {
    void this.facade.loadTrail(this.list.query());
  }
}
