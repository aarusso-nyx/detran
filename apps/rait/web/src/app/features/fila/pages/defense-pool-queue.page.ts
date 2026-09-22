// T-02 Fila de defesa prévia (ficha IU-RAIT-004; contrato CTG-0002b §6.1 linha 4; [UC-RAIT-003];
// [JRN-RAIT-001]): `QueueFacade.loadDefenseQueue(query)` → `filaDefesa` (casos ADMITIDO do pool
// `defesa_previa`, ordem única do servidor — [RN-RAIT-141]) numa `QueueTable` com ação principal
// `rait-case:claim-next` (`*stynxHasPermission` do kit, M4) e confirmação com efeito jurídico
// (`confirm.claim-next`, guia §3.3) antes de `facade.claimNext(...)` (M8 → `rait-error-banner`
// `unavailable`). O bloqueio por `WIP` é do servidor (`RAIT.ASSIGNMENT_WIP_LIMIT`). Atalhos
// `claim-next`/`list-next`/`list-prev`/`open` no `ShortcutService`; lista sincronizada com a URL.
// O id do pool `defesa_previa` não é exposto pela facade (relatório TASK-0015, OD proposta): até
// lá o comando parte sem pool — hoje M8 lança antes de qualquer requisição.
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
import { StynxConfirmDialogComponent } from '@stynx-nyx/angular-ui';
import { RaitErrorBannerComponent } from '../../../core/error-boundary';
import { provideRaitI18nFallback } from '../../../core/i18n-fallback';
import { ShortcutService } from '../../../core/shortcut.service';
import { SseService } from '../../../core/sse.service';
import { QueueFacade } from '../../../data/facades/queue.facade';
import type { RaitCase } from '../../../data/models';
import { PageStateComponent } from '../../../shared/page-state.component';
import {
  QueueTableComponent,
  type QueueItem,
  type QueuePrimaryAction,
} from '../../../shared/queue-table.component';
import { screenOf } from '../../../shared/route-screen';
import { StreamStatusBannerComponent } from '../../../shared/stream-status-banner.component';
import { connectListToUrl } from '../../list-url-sync';
import {
  CONFIRM_TITLE_KEY,
  LOADING_KEY,
  createConfirmQueue,
  errorsOnly,
} from '../../page-support';
import { QUEUE_COLUMN_LABELS } from '../../queue-columns';

const TITLE_KEY = 'rait.screens.fila-defesa.title';
const INTRO_KEY = 'rait.screens.fila-defesa.intro';
const EMPTY_KEY = 'rait.screens.fila-defesa.empty';
const CLAIM_NEXT_KEY = 'rait.screens.fila-defesa.cmd.claim-next';
const CONFIRM_CLAIM_NEXT_KEY = 'rait.screens.fila-defesa.confirm.claim-next';
const CASE_ROUTE = '/casos';
const TRIAGE_TAB = 'triagem';
const CLAIM_NEXT: QueuePrimaryAction = {
  command: 'rait-case:claim-next',
  labelKey: CLAIM_NEXT_KEY,
};
/** Id do pool `defesa_previa`: sem fonte na facade (OD proposta em TASK-0015). */
const DEFENSE_POOL_ID_PENDING = '';

@Component({
  selector: 'rait-defense-pool-queue-page',
  imports: [
    StynxTranslatePipe,
    StynxPaginationComponent,
    StynxConfirmDialogComponent,
    StreamStatusBannerComponent,
    PageStateComponent,
    QueueTableComponent,
    RaitErrorBannerComponent,
  ],
  providers: provideRaitI18nFallback(),
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-screen]': 'screen',
    '[attr.data-status]': 'facade.filaDefesa.status()',
  },
  template: `
    <h1 #heading tabindex="-1">{{ titleKey | stynxTranslate }}</h1>
    <rait-stream-status-banner />
    <p>{{ introKey | stynxTranslate }}</p>

    <rait-page-state
      [status]="pageStatus()"
      [error]="facade.filaDefesa.error()"
      [loadingLabelKey]="loadingKey"
      [emptyLabelKey]="emptyKey"
      (retry)="reload()"
    />

    @if (facade.command.error(); as error) {
      <rait-error-banner [error]="error" />
    }

    <rait-queue-table
      [items]="items()"
      [columnLabelKeys]="columnLabels"
      [status]="facade.filaDefesa.status()"
      [emptyLabelKey]="emptyKey"
      [primaryAction]="claimNextAction"
      (action)="requestClaimNext()"
      (open)="open($event)"
    />

    @if (facade.filaDefesa.value(); as page) {
      <stynx-pagination
        [totalItems]="page.total"
        [page]="page.page - 1"
        [pageSizeInput]="page.pageSize"
        (pageChange)="list.onPageChange($event)"
      />
    }

    <stynx-confirm-dialog
      [open]="confirm.open()"
      [title]="confirmTitleKey | stynxTranslate"
      [message]="confirm.pending()?.confirmKey ?? '' | stynxTranslate"
      [confirmLabel]="confirm.pending()?.labelKey ?? '' | stynxTranslate"
      (confirm)="confirm.confirm()"
      (dismissed)="confirm.dismiss()"
    />
  `,
})
export class DefensePoolQueuePageComponent {
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
  readonly confirmTitleKey = CONFIRM_TITLE_KEY;
  readonly columnLabels = QUEUE_COLUMN_LABELS;
  readonly claimNextAction = CLAIM_NEXT;
  readonly confirm = createConfirmQueue();

  readonly list = connectListToUrl({
    load: (query) => this.facade.loadDefenseQueue(query),
  });

  readonly pageStatus = computed(() =>
    errorsOnly(this.facade.filaDefesa.status()),
  );

  /** Ordem recebida ([RN-RAIT-141]); bandeira/prazo só quando o servidor os trouxer (OD-R12-022). */
  readonly items = computed<readonly QueueItem[]>(() =>
    this.facade.filaDefesa.items().map((item) => toQueueItem(item)),
  );

  constructor() {
    this.sse.connect();
    const destroyRef = inject(DestroyRef);
    const unregister = [
      this.shortcuts.register('claim-next', () => this.requestClaimNext()),
      this.shortcuts.register('list-next', () => this.table()?.next()),
      this.shortcuts.register('list-prev', () => this.table()?.prev()),
      this.shortcuts.register('open', () => this.table()?.openActive()),
    ];
    destroyRef.onDestroy(() => unregister.forEach((fn) => fn()));
    afterRenderEffect(() => {
      const status = this.facade.filaDefesa.status();
      const heading = this.heading()?.nativeElement;
      untracked(() => {
        if (!this.focused && (status === 'ready' || status === 'empty')) {
          this.focused = true;
          heading?.focus();
        }
      });
    });
  }

  /** Guia §3.3: confirmação com o efeito jurídico antes do comando (`confirm.claim-next`). */
  requestClaimNext(): void {
    if (this.facade.command.status() === 'submitting') return;
    this.confirm.request({
      action: 'claim-next',
      confirmKey: CONFIRM_CLAIM_NEXT_KEY,
      labelKey: CLAIM_NEXT_KEY,
      run: () => this.claimNext(),
    });
  }

  /** Ficha 004 §7: sucesso redireciona a `/casos/:id/triagem`; falha mantém a tela (M8 hoje). */
  private async claimNext(): Promise<void> {
    const outcome = await this.facade.claimNext(DEFENSE_POOL_ID_PENDING, {});
    if (outcome.ok) {
      await this.router.navigate([
        CASE_ROUTE,
        outcome.body.case_id,
        TRIAGE_TAB,
      ]);
    }
  }

  open(item: QueueItem): void {
    void this.router.navigate([CASE_ROUTE, item.caseId]);
  }

  reload(): void {
    void this.facade.loadDefenseQueue(this.list.query());
  }
}

function toQueueItem(item: RaitCase): QueueItem {
  return {
    id: item.id,
    caseId: item.id,
    protocol: item.protocol_number,
    state: item.state,
    instance: item.instance,
    flag: null,
    daysRemaining: null,
    deadline: null,
    priority: false,
  };
}
