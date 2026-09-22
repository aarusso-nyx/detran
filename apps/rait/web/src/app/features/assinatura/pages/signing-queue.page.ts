// T-06 Fila de assinatura (ficha IU-RAIT-025; contrato CTG-0002b §6.1 linha 24): `SigningFacade.
// loadSigningQueue(query)` → `fila` (casos PRONTO_P_DECISAO da defesa prévia; sem recorte por
// circunscrição — OD-R12-021) numa `QueueTable` (ordem recebida, [RN-RAIT-141]); nenhum comando
// (a decisão é em `/assinatura/:caseId`, aberta pela linha ativa). Lista sincronizada com a URL;
// atalhos `list-*`/`open`. O prazo `T-DEC` por caso chega quando a facade o compuser (§6.1 "join").
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
import { ActivatedRoute, Router } from '@angular/router';
import { StynxPaginationComponent, StynxTranslatePipe } from '@detran/ui';
import { provideRaitI18nFallback } from '../../../core/i18n-fallback';
import { ShortcutService } from '../../../core/shortcut.service';
import { SseService } from '../../../core/sse.service';
import { SigningFacade } from '../../../data/facades/signing.facade';
import { PageStateComponent } from '../../../shared/page-state.component';
import {
  QueueTableComponent,
  type QueueItem,
} from '../../../shared/queue-table.component';
import { screenOf } from '../../../shared/route-screen';
import { StreamStatusBannerComponent } from '../../../shared/stream-status-banner.component';
import { connectListToUrl } from '../../list-url-sync';
import { LOADING_KEY, errorsOnly } from '../../page-support';
import { QUEUE_COLUMN_LABELS } from '../../queue-columns';
import { caseToQueueItem } from '../../queue-items';

const TITLE_KEY = 'rait.screens.assinatura.title';
const INTRO_KEY = 'rait.screens.assinatura.intro';
const EMPTY_KEY = 'rait.screens.assinatura.empty';
const SIGNING_ROUTE = '/assinatura';

@Component({
  selector: 'rait-signing-queue-page',
  imports: [
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
    '[attr.data-status]': 'facade.fila.status()',
  },
  template: `
    <h1 #heading tabindex="-1">{{ titleKey | stynxTranslate }}</h1>
    <rait-stream-status-banner />
    <p>{{ introKey | stynxTranslate }}</p>

    <rait-page-state
      [status]="pageStatus()"
      [error]="facade.fila.error()"
      [loadingLabelKey]="loadingKey"
      [emptyLabelKey]="emptyKey"
      (retry)="reload()"
    />

    <rait-queue-table
      [items]="items()"
      [columnLabelKeys]="columnLabels"
      [status]="facade.fila.status()"
      [emptyLabelKey]="emptyKey"
      (open)="open($event)"
    />

    @if (facade.fila.value(); as page) {
      <stynx-pagination
        [totalItems]="page.total"
        [page]="page.page - 1"
        [pageSizeInput]="page.pageSize"
        (pageChange)="list.onPageChange($event)"
      />
    }
  `,
})
export class SigningQueuePageComponent {
  readonly facade = inject(SigningFacade);
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
  readonly loadingKey = LOADING_KEY;
  readonly columnLabels = QUEUE_COLUMN_LABELS;

  readonly list = connectListToUrl({
    load: (query) => this.facade.loadSigningQueue(query),
  });
  readonly pageStatus = computed(() => errorsOnly(this.facade.fila.status()));
  readonly items = computed<readonly QueueItem[]>(() =>
    this.facade.fila.items().map((item) => caseToQueueItem(item)),
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
      const status = this.facade.fila.status();
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
    void this.router.navigate([SIGNING_ROUTE, item.caseId]);
  }

  reload(): void {
    void this.facade.loadSigningQueue(this.list.query());
  }
}
