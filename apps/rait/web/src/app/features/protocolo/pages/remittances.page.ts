// T-19 Remessas à JARI (ficha IU-RAIT-022; contrato CTG-0002b §6.1 linha 21): `ProtocolFacade.
// loadRemittances(query)` → `remessas` (casos AGUARDANDO_REMESSA_JARI) + `remessasPrazo`
// (`T-REM10` por caso, `legal`) numa `QueueTable`; `field.checklist` = itens da ficha, somente
// leitura (`RemittanceChecklist`); ações `rait-case:remit-jari` (`confirm.remit`) e
// `rait-case:receive-judging-body` (`confirm.receive`) sob `*stynxHasPermission` (M4) sobre a
// linha ativa → `facade.<comando>` (M8). A linha do tempo do caso selecionado (`CaseFacade.
// loadEvents`, §6.1) fica para quando a facade do caso puder ser composta aqui sem HTTP direto
// (relatório TASK-0015). Lista sincronizada com a URL.
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
import { StynxHasPermissionDirective } from '@stynx-nyx/angular-auth';
import { StynxConfirmDialogComponent } from '@stynx-nyx/angular-ui';
import { RaitErrorBannerComponent } from '../../../core/error-boundary';
import { provideRaitI18nFallback } from '../../../core/i18n-fallback';
import { ShortcutService } from '../../../core/shortcut.service';
import { SseService } from '../../../core/sse.service';
import { ProtocolFacade } from '../../../data/facades/protocol.facade';
import { permissionKeyOf } from '../../../data/models';
import { LegalBasisTooltipComponent } from '../../../shared/legal-basis-tooltip.component';
import { PageStateComponent } from '../../../shared/page-state.component';
import {
  QueueTableComponent,
  type QueueItem,
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
import { caseToQueueItem } from '../../queue-items';

const TITLE_KEY = 'rait.screens.protocolo-remessas.title';
const INTRO_KEY = 'rait.screens.protocolo-remessas.intro';
const EMPTY_KEY = 'rait.screens.protocolo-remessas.empty';
const CMD_REMIT_KEY = 'rait.screens.protocolo-remessas.cmd.remit';
const CMD_RECEIVE_KEY = 'rait.screens.protocolo-remessas.cmd.receive';
const CONFIRM_REMIT_KEY = 'rait.screens.protocolo-remessas.confirm.remit';
const CONFIRM_RECEIVE_KEY = 'rait.screens.protocolo-remessas.confirm.receive';
const FIELD_CHECKLIST_KEY = 'rait.screens.protocolo-remessas.field.checklist';
const CASE_ROUTE = '/casos';

@Component({
  selector: 'rait-remittances-page',
  imports: [
    StynxTranslatePipe,
    StynxPaginationComponent,
    StynxHasPermissionDirective,
    StynxConfirmDialogComponent,
    StreamStatusBannerComponent,
    PageStateComponent,
    QueueTableComponent,
    LegalBasisTooltipComponent,
    RaitErrorBannerComponent,
  ],
  providers: provideRaitI18nFallback(),
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-screen]': 'screen',
    '[attr.data-status]': 'facade.remessas.status()',
  },
  template: `
    <h1 #heading tabindex="-1">{{ titleKey | stynxTranslate }}</h1>
    <rait-stream-status-banner />
    <p>{{ introKey | stynxTranslate }}</p>

    <rait-page-state
      [status]="pageStatus()"
      [error]="facade.remessas.error()"
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
      [status]="facade.remessas.status()"
      [emptyLabelKey]="emptyKey"
      (open)="open($event)"
    />

    @if (facade.remessas.value(); as page) {
      <stynx-pagination
        [totalItems]="page.total"
        [page]="page.page - 1"
        [pageSizeInput]="page.pageSize"
        (pageChange)="list.onPageChange($event)"
      />
    }

    @if (activeItem(); as active) {
      <section data-remittance-checklist>
        <h2>{{ fieldChecklistKey | stynxTranslate }}</h2>
        <p>{{ active.protocol }}</p>
        @if (active.deadline; as deadline) {
          <rait-legal-basis-tooltip [legalBasis]="deadline.legalBasis" />
        }
      </section>
    }

    <div class="rait-remittances__actions">
      <button
        *stynxHasPermission="remitPermission"
        type="button"
        data-action="remit"
        [disabled]="offline() || activeItem() === null"
        (click)="requestRemit()"
      >
        {{ cmdRemitKey | stynxTranslate }}
      </button>
      <button
        *stynxHasPermission="receivePermission"
        type="button"
        data-action="receive"
        [disabled]="offline() || activeItem() === null"
        (click)="requestReceive()"
      >
        {{ cmdReceiveKey | stynxTranslate }}
      </button>
    </div>

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
export class RemittancesPageComponent {
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
  readonly loadingKey = LOADING_KEY;
  readonly cmdRemitKey = CMD_REMIT_KEY;
  readonly cmdReceiveKey = CMD_RECEIVE_KEY;
  readonly fieldChecklistKey = FIELD_CHECKLIST_KEY;
  readonly confirmTitleKey = CONFIRM_TITLE_KEY;
  readonly columnLabels = QUEUE_COLUMN_LABELS;
  readonly remitPermission = permissionKeyOf('rait-case:remit-jari');
  readonly receivePermission = permissionKeyOf(
    'rait-case:receive-judging-body',
  );
  readonly confirm = createConfirmQueue();

  readonly list = connectListToUrl({
    load: (query) => this.facade.loadRemittances(query),
  });
  readonly pageStatus = computed(() =>
    errorsOnly(this.facade.remessas.status()),
  );
  readonly offline = computed(
    () => this.facade.remessas.status() === 'offline',
  );

  /** Prazo `T-REM10` (legal) por caso, só quando o servidor o trouxe. */
  readonly items = computed<readonly QueueItem[]>(() => {
    const deadlines = this.facade.remessasPrazo();
    return this.facade.remessas.items().map((kase) =>
      caseToQueueItem(kase, {
        deadline: deadlines.get(kase.id) ?? null,
        deadlineKind: 'legal',
      }),
    );
  });
  readonly activeItem = computed<QueueItem | null>(
    () => this.table()?.activeItem() ?? null,
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
      const status = this.facade.remessas.status();
      const heading = this.heading()?.nativeElement;
      untracked(() => {
        if (!this.focused && (status === 'ready' || status === 'empty')) {
          this.focused = true;
          heading?.focus();
        }
      });
    });
  }

  requestRemit(): void {
    const caseId = this.activeItem()?.caseId ?? '';
    this.confirm.request({
      action: 'remit',
      confirmKey: CONFIRM_REMIT_KEY,
      labelKey: CMD_REMIT_KEY,
      run: () => this.facade.remitJari(caseId, {}),
    });
  }

  requestReceive(): void {
    const caseId = this.activeItem()?.caseId ?? '';
    this.confirm.request({
      action: 'receive',
      confirmKey: CONFIRM_RECEIVE_KEY,
      labelKey: CMD_RECEIVE_KEY,
      run: () => this.facade.receiveJudgingBody(caseId, {}),
    });
  }

  open(item: QueueItem): void {
    void this.router.navigate([CASE_ROUTE, item.caseId]);
  }

  reload(): void {
    void this.facade.loadRemittances(this.list.query());
  }
}
