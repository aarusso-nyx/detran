// T-06 Prontos para retomar (ficha IU-RAIT-003; contrato CTG-0002b §6.1 linha 3): `QueueFacade.
// loadResumeTray()` → `retomar` (diligências com desfecho `respondida` × `expirada`, ordem
// recebida — [RN-RAIT-141]) + `casosDaFila` (join por `case_id`) numa `QueueTable` (protocolo,
// estado, prazo: `due_on` da diligência como `T-DIL` operacional — o servidor calcula, a UI só
// exibe, [RN-RAIT-005]). Nenhum comando: abrir → `/casos/:id/dossie`. Lista sincronizada com a
// URL (`?q=&filtro=&pagina=`) e atalhos `list-next`/`list-prev`/`open` no `ShortcutService`.
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
import type { ListQuery, RaitInquiry } from '../../../data/models';
import { PageStateComponent } from '../../../shared/page-state.component';
import {
  QueueTableComponent,
  type QueueColumnKey,
  type QueueItem,
} from '../../../shared/queue-table.component';
import { screenOf } from '../../../shared/route-screen';
import { StreamStatusBannerComponent } from '../../../shared/stream-status-banner.component';
import { connectListToUrl, hasListQuery } from '../../list-url-sync';
import { QUEUE_COLUMN_LABELS } from '../../queue-columns';

const TITLE_KEY = 'rait.screens.painel-retomar.title';
const INTRO_KEY = 'rait.screens.painel-retomar.intro';
const EMPTY_KEY = 'rait.screens.painel-retomar.empty';
const LOADING_KEY = 'rait.states.loading';
const COLUMNS: readonly QueueColumnKey[] = ['protocol', 'state', 'deadline'];
const CASE_ROUTE = '/casos';
const DOSSIER_TAB = 'dossie';
/** Ficha 010: o prazo da diligência é o timer operacional `T-DIL` ([RN-RAIT-005]: só exibido);
 * `RaitInquiry` não traz base legal — a coluna mostra rótulo do timer + `due_on`, como o
 * `InquiryCard` sem `RaitDeadline` (§5.9). */
const INQUIRY_TIMER = 'T-DIL';

@Component({
  selector: 'rait-resume-tray-page',
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
    '[attr.data-status]': 'facade.retomar.status()',
  },
  template: `
    <h1 #heading tabindex="-1">{{ titleKey | stynxTranslate }}</h1>
    <rait-stream-status-banner />
    <p>{{ introKey | stynxTranslate }}</p>

    <rait-page-state
      [status]="pageStatus()"
      [error]="facade.retomar.error()"
      [loadingLabelKey]="loadingKey"
      [emptyLabelKey]="emptyKey"
      (retry)="reload()"
    />

    <rait-queue-table
      [items]="items()"
      [columns]="columns"
      [columnLabelKeys]="columnLabels"
      [status]="facade.retomar.status()"
      [emptyLabelKey]="emptyKey"
      (open)="open($event)"
    />

    @if (facade.retomar.value(); as page) {
      <stynx-pagination
        [totalItems]="page.total"
        [page]="page.page - 1"
        [pageSizeInput]="page.pageSize"
        (pageChange)="list.onPageChange($event)"
      />
    }
  `,
})
export class ResumeTrayPageComponent {
  readonly facade = inject(QueueFacade);
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
  readonly columns = COLUMNS;
  readonly columnLabels = QUEUE_COLUMN_LABELS;

  readonly list = connectListToUrl({ load: (query) => this.load(query) });

  /** `loading`/`empty` são apresentados pela própria `QueueTable`; aqui só os erros. */
  readonly pageStatus = computed(() => {
    const status = this.facade.retomar.status();
    return status === 'loading' || status === 'empty' ? 'idle' : status;
  });

  /** View-model na ordem recebida; diligência sem caso no join fica fora (dados incompletos). */
  readonly items = computed<readonly QueueItem[]>(() => {
    const cases = this.facade.casosDaFila();
    const items: QueueItem[] = [];
    for (const inquiry of this.facade.retomar.items()) {
      const kase = cases.get(inquiry.case_id);
      if (!kase) continue;
      items.push(this.toItem(inquiry, kase.state, kase.instance, kase));
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
      const status = this.facade.retomar.status();
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
    void this.router.navigate([CASE_ROUTE, item.caseId, DOSSIER_TAB]);
  }

  reload(): void {
    void this.load(this.list.query());
  }

  /** `loadResumeTray()` não recebe consulta (§4.3): a da URL entra por `setQuery` no slot. */
  private async load(query: ListQuery): Promise<void> {
    await this.facade.loadResumeTray();
    if (hasListQuery(query)) await this.facade.retomar.setQuery(query);
  }

  private toItem(
    inquiry: RaitInquiry,
    state: QueueItem['state'],
    instance: QueueItem['instance'],
    kase: { readonly protocol_number: string },
  ): QueueItem {
    return {
      id: inquiry.id,
      caseId: inquiry.case_id,
      protocol: kase.protocol_number,
      state,
      instance,
      flag: null,
      daysRemaining: null,
      deadline: {
        timerCode: INQUIRY_TIMER,
        dueOn: inquiry.due_on,
        legalBasis: '',
        kind: 'operacional',
      },
      priority: false,
    };
  }
}
