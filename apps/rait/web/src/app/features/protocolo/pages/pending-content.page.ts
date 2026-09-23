// T-18 Pendências de conteúdo mínimo (ficha IU-RAIT-021; contrato CTG-0002b §6.1 linha 20):
// `ProtocolFacade.loadPending(query)` → `pendencias` (só abertas, `outcome` null) + `pendenciasCaso`
// (join por `case_id`) numa `QueueTable` (coluna de prazo = `due_on` da pendência como texto,
// `field.missing` = itens faltantes da linha ativa); `DocumentUploader` por pendência (a linha
// ativa); ação `rait-case:resolve-pending-content` sob `*stynxHasPermission` (chave só de ficha —
// OD-R12-027, fail-closed) com confirmação `confirm.resolve` (guia §3.3) → `facade.
// resolvePendingContent` (M8); botões desabilitados quando `offline` (spec §8). Lista sincronizada
// com a URL; atalhos `list-*`/`open`.
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  signal,
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
import {
  permissionKeyOf,
  type CommandBody,
  type RaitPendingContent,
  type RaitPendingContentOutcome,
} from '../../../data/models';
import {
  DocumentUploaderComponent,
  type DocumentUploadRequest,
} from '../../../shared/document-uploader.component';
import { PageStateComponent } from '../../../shared/page-state.component';
import {
  QueueTableComponent,
  type QueueColumnKey,
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
  provisionalBody,
} from '../../page-support';
import { QUEUE_COLUMN_LABELS } from '../../queue-columns';

const TITLE_KEY = 'rait.screens.protocolo-pendencias.title';
const INTRO_KEY = 'rait.screens.protocolo-pendencias.intro';
const EMPTY_KEY = 'rait.screens.protocolo-pendencias.empty';
const CMD_RESOLVE_KEY = 'rait.screens.protocolo-pendencias.cmd.resolve';
const CONFIRM_RESOLVE_KEY = 'rait.screens.protocolo-pendencias.confirm.resolve';
const FIELD_MISSING_KEY = 'rait.screens.protocolo-pendencias.field.missing';
const COLUMNS: readonly QueueColumnKey[] = ['protocol', 'state', 'deadline'];
const CASE_ROUTE = '/casos';
/** Sanar = pendência atendida (token do contrato `RaitPendingContent['outcome']`). */
const RESOLVED_OUTCOME: RaitPendingContentOutcome = 'atendida';
/** Tipos de documento da pendência: do formulário do CTG-0002c (nenhum inventado aqui). */
const PENDING_KINDS: readonly string[] = [];

@Component({
  selector: 'rait-pending-content-page',
  imports: [
    StynxTranslatePipe,
    StynxPaginationComponent,
    StynxHasPermissionDirective,
    StynxConfirmDialogComponent,
    StreamStatusBannerComponent,
    PageStateComponent,
    QueueTableComponent,
    DocumentUploaderComponent,
    RaitErrorBannerComponent,
  ],
  providers: provideRaitI18nFallback(),
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-screen]': 'screen',
    '[attr.data-status]': 'facade.pendencias.status()',
  },
  template: `
    <h1 #heading tabindex="-1">{{ titleKey | stynxTranslate }}</h1>
    <rait-stream-status-banner />
    <p>{{ introKey | stynxTranslate }}</p>

    <rait-page-state
      [status]="pageStatus()"
      [error]="facade.pendencias.error()"
      [loadingLabelKey]="loadingKey"
      [emptyLabelKey]="emptyKey"
      (retry)="reload()"
    />

    @if (facade.command.error(); as error) {
      <rait-error-banner [error]="error" />
    }

    <rait-queue-table
      [items]="items()"
      [columns]="columns"
      [columnLabelKeys]="columnLabels"
      [status]="facade.pendencias.status()"
      [emptyLabelKey]="emptyKey"
      (open)="open($event)"
    />

    @if (facade.pendencias.value(); as page) {
      <stynx-pagination
        [totalItems]="page.total"
        [page]="page.page - 1"
        [pageSizeInput]="page.pageSize"
        (pageChange)="list.onPageChange($event)"
      />
    }

    <section *stynxHasPermission="resolvePermission" data-resolve-pending>
      <h2>{{ cmdResolveKey | stynxTranslate }}</h2>
      @if (activePending(); as pending) {
        <p data-missing-items>
          <span>{{ fieldMissingKey | stynxTranslate }}</span>
          <code>{{ missingItemsText(pending) }}</code>
        </p>
      }
      <rait-document-uploader
        origin="requerente"
        [kinds]="pendingKinds"
        [disabled]="offline()"
        (submitted)="pendingUpload.set($event)"
      />
      <button
        type="button"
        data-action="resolve"
        [disabled]="offline() || activePending() === null"
        (click)="requestResolve()"
      >
        {{ cmdResolveKey | stynxTranslate }}
      </button>
    </section>

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
export class PendingContentPageComponent {
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
  readonly cmdResolveKey = CMD_RESOLVE_KEY;
  readonly fieldMissingKey = FIELD_MISSING_KEY;
  readonly confirmTitleKey = CONFIRM_TITLE_KEY;
  readonly columns = COLUMNS;
  readonly columnLabels = QUEUE_COLUMN_LABELS;
  readonly pendingKinds = PENDING_KINDS;
  readonly resolvePermission = permissionKeyOf(
    'rait-case:resolve-pending-content',
  );
  readonly confirm = createConfirmQueue();
  readonly pendingUpload = signal<DocumentUploadRequest | null>(null);

  readonly list = connectListToUrl({
    load: (query) => this.facade.loadPending(query),
  });
  readonly pageStatus = computed(() =>
    errorsOnly(this.facade.pendencias.status()),
  );
  readonly offline = computed(
    () => this.facade.pendencias.status() === 'offline',
  );

  /** Pendência → caso do join; sem caso carregado a linha fica fora. `due_on` como texto: sem
   * base legal no contrato, não é `DeadlineChip` (ficha 021). */
  readonly items = computed<readonly QueueItem[]>(() => {
    const cases = this.facade.pendenciasCaso();
    const items: QueueItem[] = [];
    for (const pending of this.facade.pendencias.items()) {
      const kase = cases.get(pending.case_id);
      if (!kase) continue;
      items.push({
        id: pending.id,
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

  /** Pendência da linha ativa da tabela. */
  readonly activePending = computed<RaitPendingContent | null>(() => {
    const active = this.table()?.activeItem() ?? null;
    if (active === null) return null;
    return (
      this.facade.pendencias.items().find((item) => item.id === active.id) ??
      null
    );
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
      const status = this.facade.pendencias.status();
      const heading = this.heading()?.nativeElement;
      untracked(() => {
        if (!this.focused && (status === 'ready' || status === 'empty')) {
          this.focused = true;
          heading?.focus();
        }
      });
    });
  }

  missingItemsText(pending: RaitPendingContent): string {
    const items: unknown = pending.missing_items;
    return Array.isArray(items) ? items.map(String).join(', ') : '';
  }

  /** Confirmação `confirm.resolve` (guia §3.3) → `rait-case:resolve-pending-content` na pendência
   * ativa (o botão fica desabilitado sem linha ativa). */
  requestResolve(): void {
    const pending = this.activePending();
    this.confirm.request({
      action: 'resolve',
      confirmKey: CONFIRM_RESOLVE_KEY,
      labelKey: CMD_RESOLVE_KEY,
      run: () =>
        this.facade.resolvePendingContent(
          pending?.id ?? '',
          provisionalBody<CommandBody & { outcome: RaitPendingContentOutcome }>(
            {
              outcome: RESOLVED_OUTCOME,
            },
          ),
        ),
    });
  }

  open(item: QueueItem): void {
    void this.router.navigate([CASE_ROUTE, item.caseId]);
  }

  reload(): void {
    void this.facade.loadPending(this.list.query());
  }
}
