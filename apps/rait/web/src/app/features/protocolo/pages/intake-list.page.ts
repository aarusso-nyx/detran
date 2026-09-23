// T-16 Protocolo — intake do dia (ficha IU-RAIT-019; contrato CTG-0002b §6.1 linha 18):
// `ProtocolFacade.loadIntake(query)` → `intake` (casos PROTOCOLADO, ordem recebida —
// [RN-RAIT-141]) numa `QueueTable` (protocolo, instância, estado); nenhum comando — o link
// `cmd.new` leva a `/protocolo/novo`. Lista sincronizada com a URL; atalhos `list-*`/`open`.
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  untracked,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StynxPaginationComponent, StynxTranslatePipe } from '@detran/ui';
import { provideRaitI18nFallback } from '../../../core/i18n-fallback';
import { ShortcutService } from '../../../core/shortcut.service';
import { SseService } from '../../../core/sse.service';
import { ProtocolFacade } from '../../../data/facades/protocol.facade';
import { PageStateComponent } from '../../../shared/page-state.component';
import {
  QueueTableComponent,
  type QueueColumnKey,
  type QueueItem,
} from '../../../shared/queue-table.component';
import { screenOf } from '../../../shared/route-screen';
import { StreamStatusBannerComponent } from '../../../shared/stream-status-banner.component';
import { connectListToUrl } from '../../list-url-sync';
import { LOADING_KEY, errorsOnly } from '../../page-support';
import { QUEUE_COLUMN_LABELS } from '../../queue-columns';
import { caseToQueueItem } from '../../queue-items';

const TITLE_KEY = 'rait.screens.protocolo.title';
const INTRO_KEY = 'rait.screens.protocolo.intro';
const EMPTY_KEY = 'rait.screens.protocolo.empty';
const CMD_NEW_KEY = 'rait.screens.protocolo.cmd.new';
const NEW_ROUTE = '/protocolo/novo';
const CASE_ROUTE = '/casos';
const COLUMNS: readonly QueueColumnKey[] = ['protocol', 'instance', 'state'];

@Component({
  selector: 'rait-intake-list-page',
  imports: [
    RouterLink,
    StynxTranslatePipe,
    StynxPaginationComponent,
    StreamStatusBannerComponent,
    PageStateComponent,
    QueueTableComponent,
  ],
  providers: provideRaitI18nFallback(),
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-screen]': 'screen',
    '[attr.data-status]': 'facade.intake.status()',
  },
  template: `
    <h1 #heading tabindex="-1">{{ titleKey | stynxTranslate }}</h1>
    <rait-stream-status-banner />
    <p>{{ introKey | stynxTranslate }}</p>
    <p>
      <a [routerLink]="newRoute" data-new-intake>{{
        cmdNewKey | stynxTranslate
      }}</a>
    </p>

    <rait-page-state
      [status]="pageStatus()"
      [error]="facade.intake.error()"
      [loadingLabelKey]="loadingKey"
      [emptyLabelKey]="emptyKey"
      (retry)="reload()"
    />

    <rait-queue-table
      [items]="items()"
      [columns]="columns"
      [columnLabelKeys]="columnLabels"
      [status]="facade.intake.status()"
      [emptyLabelKey]="emptyKey"
      (open)="open($event)"
    />

    @if (facade.intake.value(); as page) {
      <stynx-pagination
        [totalItems]="page.total"
        [page]="page.page - 1"
        [pageSizeInput]="page.pageSize"
        (pageChange)="list.onPageChange($event)"
      />
    }
  `,
})
export class IntakeListPageComponent {
  readonly facade = inject(ProtocolFacade);
  private readonly router = inject(Router);
  private readonly sse = inject(SseService);
  private readonly shortcuts = inject(ShortcutService);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private readonly table = viewChild(QueueTableComponent);
  private focused = false;

  readonly screen = screenOf(inject(ActivatedRoute));
  readonly titleKey = TITLE_KEY;
  readonly introKey = INTRO_KEY;
  readonly emptyKey = EMPTY_KEY;
  readonly cmdNewKey = CMD_NEW_KEY;
  readonly newRoute = NEW_ROUTE;
  readonly loadingKey = LOADING_KEY;
  readonly columns = COLUMNS;
  readonly columnLabels = QUEUE_COLUMN_LABELS;

  readonly list = connectListToUrl({
    load: (query) => this.facade.loadIntake(query),
  });
  readonly pageStatus = computed(() => errorsOnly(this.facade.intake.status()));
  readonly items = computed<readonly QueueItem[]>(() =>
    this.facade.intake.items().map((item) => caseToQueueItem(item)),
  );

  constructor() {
    this.sse.connect();
    const destroyRef = inject(DestroyRef);
    const unregister = [
      this.shortcuts.register('list-next', () => this.table()?.next()),
      this.shortcuts.register('list-prev', () => this.table()?.prev()),
      this.shortcuts.register('open', () => this.table()?.openActive()),
    ];
    destroyRef.onDestroy(() => unregister.forEach((fn) => fn()));
    afterRenderEffect(() => {
      const status = this.facade.intake.status();
      const heading = this.heading()?.nativeElement;
      untracked(() => {
        if (!this.focused && (status === 'ready' || status === 'empty')) {
          this.focused = true;
          heading?.focus();
        }
      });
    });
  }

  open(item: QueueItem): void {
    void this.router.navigate([CASE_ROUTE, item.caseId]);
  }

  reload(): void {
    void this.facade.loadIntake(this.list.query());
  }
}
