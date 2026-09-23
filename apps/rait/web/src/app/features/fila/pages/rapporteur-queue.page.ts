// T-02 Fila do relator (ficha IU-RAIT-005; contrato CTG-0002b §6.1 linha 5): `QueueFacade.
// loadRapporteurQueue(orgao, query)` → `filaRelator` (atribuições ativas do pool do órgão — sem
// recorte "member=me", OD-R12-021) + `casosDaFila` (join por `case_id`) numa `QueueTable`, ordem
// recebida ([RN-RAIT-141]). Nenhum comando (mérito em `/colegiado/:orgao/relatoria`); abrir →
// `/casos/:id`. Lista sincronizada com a URL; atalhos `list-next`/`list-prev`/`open`.
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
import { QueueFacade } from '../../../data/facades/queue.facade';
import type { RaitJudgingBody } from '../../../data/models';
import { PageStateComponent } from '../../../shared/page-state.component';
import {
  QueueTableComponent,
  type QueueItem,
} from '../../../shared/queue-table.component';
import { screenOf } from '../../../shared/route-screen';
import { StreamStatusBannerComponent } from '../../../shared/stream-status-banner.component';
import { judgingBodyOf } from '../../route-params';
import { connectListToUrl } from '../../list-url-sync';
import { QUEUE_COLUMN_LABELS } from '../../queue-columns';

const TITLE_KEY = 'rait.screens.fila-recurso-orgao.title';
const INTRO_KEY = 'rait.screens.fila-recurso-orgao.intro';
const EMPTY_KEY = 'rait.screens.fila-recurso-orgao.empty';
const LOADING_KEY = 'rait.states.loading';
const CASE_ROUTE = '/casos';

@Component({
  selector: 'rait-rapporteur-queue-page',
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
    '[attr.data-orgao]': 'orgao',
    '[attr.data-status]': 'facade.filaRelator.status()',
  },
  template: `
    <h1 #heading tabindex="-1">{{ titleKey | stynxTranslate }}</h1>
    <rait-stream-status-banner />
    <p>{{ introKey | stynxTranslate }}</p>

    <rait-page-state
      [status]="pageStatus()"
      [error]="facade.filaRelator.error()"
      [loadingLabelKey]="loadingKey"
      [emptyLabelKey]="emptyKey"
      (retry)="reload()"
    />

    <rait-queue-table
      [items]="items()"
      [columnLabelKeys]="columnLabels"
      [status]="facade.filaRelator.status()"
      [emptyLabelKey]="emptyKey"
      (open)="open($event)"
    />

    @if (facade.filaRelator.value(); as page) {
      <stynx-pagination
        [totalItems]="page.total"
        [page]="page.page - 1"
        [pageSizeInput]="page.pageSize"
        (pageChange)="list.onPageChange($event)"
      />
    }
  `,
})
export class RapporteurQueuePageComponent {
  readonly facade = inject(QueueFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sse = inject(SseService);
  private readonly shortcuts = inject(ShortcutService);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private readonly table = viewChild(QueueTableComponent);
  private focused = false;

  readonly screen = screenOf(this.route);
  readonly orgao: RaitJudgingBody = judgingBodyOf(this.route);
  readonly titleKey = TITLE_KEY;
  readonly introKey = INTRO_KEY;
  readonly emptyKey = EMPTY_KEY;
  readonly loadingKey = LOADING_KEY;
  readonly columnLabels = QUEUE_COLUMN_LABELS;

  readonly list = connectListToUrl({
    load: (query) => this.facade.loadRapporteurQueue(this.orgao, query),
  });

  readonly pageStatus = computed(() => {
    const status = this.facade.filaRelator.status();
    return status === 'loading' || status === 'empty' ? 'idle' : status;
  });

  /** Atribuição → caso do join; sem caso carregado a linha fica fora (dados incompletos). */
  readonly items = computed<readonly QueueItem[]>(() => {
    const cases = this.facade.casosDaFila();
    const items: QueueItem[] = [];
    for (const assignment of this.facade.filaRelator.items()) {
      const kase = cases.get(assignment.case_id);
      if (!kase) continue;
      items.push({
        id: assignment.id,
        caseId: kase.id,
        protocol: kase.protocol_number,
        state: kase.state,
        instance: kase.instance,
        flag: null,
        daysRemaining: null,
        deadline: null,
        priority: false,
      });
    }
    return items;
  });

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
      const status = this.facade.filaRelator.status();
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
    void this.facade.loadRapporteurQueue(this.orgao, this.list.query());
  }
}
