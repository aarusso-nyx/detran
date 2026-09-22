// T-23 Distribuição — lotes de sorteio (ficha IU-RAIT-028; contrato CTG-0002b §6.1 linha 27;
// [UC-RAIT-014]): `SessionFacade.loadBatches(orgao, query)` → `lotes` (um `BatchDrawViewer` por
// lote) e `loadUnassigned(orgao)` → `semRelator` (casos DISTRIBUIDO sem relator, ordem recebida —
// [RN-RAIT-141]) numa `QueueTable`; formulário `lote-sorteio` (`poolId`, `kind` — tokens de
// `RaitBatch['kind']` —, `weekStart`) com `Validators.required`; ações `rait-batch:open`
// (`confirm.open`), `rait-batch:draw` (`confirm.draw`) e `rait-batch:approve` (`confirm.approve`)
// sob `*stynxHasPermission` (M4; OD-R12-010) sobre o lote selecionado → `facade.<comando>` (M8).
// Os pools do órgão vêm da `OrganizationFacade` (§6.1) — aqui o `poolId` é digitado, com os ids
// já vistos nos lotes como sugestão, até a composição das facades (relatório TASK-0015).
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
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StynxPaginationComponent, StynxTranslatePipe } from '@detran/ui';
import { StynxHasPermissionDirective } from '@stynx-nyx/angular-auth';
import { StynxConfirmDialogComponent } from '@stynx-nyx/angular-ui';
import { RaitErrorBannerComponent } from '../../../core/error-boundary';
import { provideRaitI18nFallback } from '../../../core/i18n-fallback';
import { tokenKey } from '../../../core/i18n-token-key';
import { ShortcutService } from '../../../core/shortcut.service';
import { SseService } from '../../../core/sse.service';
import { SessionFacade } from '../../../data/facades/session.facade';
import {
  permissionKeyOf,
  type CreateRaitBatchDto,
  type RaitBatch,
  type RaitBatchKind,
  type RaitJudgingBody,
} from '../../../data/models';
import { BatchDrawViewerComponent } from '../../../shared/batch-draw-viewer.component';
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
  provisionalBody,
} from '../../page-support';
import { QUEUE_COLUMN_LABELS } from '../../queue-columns';
import { caseToQueueItem } from '../../queue-items';
import { judgingBodyOf } from '../colegiado-route';

const TITLE_KEY = 'rait.screens.colegiado-orgao-distribuicao.title';
const INTRO_KEY = 'rait.screens.colegiado-orgao-distribuicao.intro';
const EMPTY_KEY = 'rait.screens.colegiado-orgao-distribuicao.empty';
const CMD_OPEN_KEY = 'rait.screens.colegiado-orgao-distribuicao.cmd.open';
const CMD_DRAW_KEY = 'rait.screens.colegiado-orgao-distribuicao.cmd.draw';
const CMD_APPROVE_KEY = 'rait.screens.colegiado-orgao-distribuicao.cmd.approve';
const CONFIRM_OPEN_KEY =
  'rait.screens.colegiado-orgao-distribuicao.confirm.open';
const CONFIRM_DRAW_KEY =
  'rait.screens.colegiado-orgao-distribuicao.confirm.draw';
const CONFIRM_APPROVE_KEY =
  'rait.screens.colegiado-orgao-distribuicao.confirm.approve';
const BATCH_KIND_PREFIX = 'rait.common.batch_';
/** Tokens do contrato `RaitBatch['kind']`. */
const BATCH_KINDS: readonly RaitBatchKind[] = ['semanal', 'extraordinario'];
const COLEGIADO_ROUTE = '/colegiado';
const BATCH_DETAIL_ROUTE = 'distribuicao';
const CASE_ROUTE = '/casos';
const ERROR_ID_PREFIX = 'rait-batches-error-';

@Component({
  selector: 'rait-batches-page',
  imports: [
    ReactiveFormsModule,
    StynxTranslatePipe,
    StynxPaginationComponent,
    StynxHasPermissionDirective,
    StynxConfirmDialogComponent,
    StreamStatusBannerComponent,
    PageStateComponent,
    QueueTableComponent,
    BatchDrawViewerComponent,
    RaitErrorBannerComponent,
  ],
  providers: provideRaitI18nFallback(),
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-screen]': 'screen',
    '[attr.data-orgao]': 'orgao',
    '[attr.data-status]': 'facade.lotes.status()',
  },
  template: `
    <h1 #heading tabindex="-1">{{ titleKey | stynxTranslate }}</h1>
    <rait-stream-status-banner />
    <p>{{ introKey | stynxTranslate }}</p>

    <rait-page-state
      [status]="facade.lotes.status()"
      [error]="facade.lotes.error()"
      [loadingLabelKey]="loadingKey"
      [emptyLabelKey]="emptyKey"
      (retry)="reload()"
    />

    @if (facade.command.error(); as error) {
      <rait-error-banner [error]="error" />
    }

    @if (facade.lotes.items().length > 0) {
      <ul class="rait-batches__list">
        @for (batch of facade.lotes.items(); track batch.id) {
          <li [attr.data-batch-id]="batch.id">
            <rait-batch-draw-viewer [batch]="batch" />
            <button
              type="button"
              [attr.data-open-batch]="batch.id"
              (click)="openBatch(batch)"
            >
              {{ openKey | stynxTranslate }}
            </button>
          </li>
        }
      </ul>
    }
    @if (facade.lotes.value(); as page) {
      <stynx-pagination
        [totalItems]="page.total"
        [page]="page.page - 1"
        [pageSizeInput]="page.pageSize"
        (pageChange)="list.onPageChange($event)"
      />
    }

    <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
      <label for="rait-batches-pool">pool_id</label>
      <input
        id="rait-batches-pool"
        type="text"
        formControlName="poolId"
        list="rait-batches-pools"
        [attr.aria-invalid]="invalid('poolId') ? 'true' : null"
        [attr.aria-describedby]="invalid('poolId') ? errorId('poolId') : null"
      />
      <datalist id="rait-batches-pools">
        @for (poolId of knownPools(); track poolId) {
          <option [value]="poolId"></option>
        }
      </datalist>
      @if (invalid('poolId')) {
        <p [id]="errorId('poolId')" role="alert">pool_id</p>
      }

      <label for="rait-batches-kind">kind</label>
      <select
        id="rait-batches-kind"
        formControlName="kind"
        [attr.aria-invalid]="invalid('kind') ? 'true' : null"
        [attr.aria-describedby]="invalid('kind') ? errorId('kind') : null"
      >
        <option value=""></option>
        @for (kind of kinds; track kind) {
          <option [value]="kind" [attr.data-token]="kind">
            {{ batchKindPrefix + kind | stynxTranslate }}
          </option>
        }
      </select>
      @if (invalid('kind')) {
        <p [id]="errorId('kind')" role="alert">kind</p>
      }

      <label for="rait-batches-week">week_start</label>
      <input
        id="rait-batches-week"
        type="date"
        formControlName="weekStart"
        [attr.aria-invalid]="invalid('weekStart') ? 'true' : null"
        [attr.aria-describedby]="
          invalid('weekStart') ? errorId('weekStart') : null
        "
      />
      @if (invalid('weekStart')) {
        <p [id]="errorId('weekStart')" role="alert">week_start</p>
      }

      <label for="rait-batches-target">batch_id</label>
      <select id="rait-batches-target" formControlName="batchId">
        <option value=""></option>
        @for (batch of facade.lotes.items(); track batch.id) {
          <option [value]="batch.id" [attr.data-token]="batch.state">
            {{ batch.week_start }}
          </option>
        }
      </select>

      <div class="rait-batches__actions">
        <button
          *stynxHasPermission="openPermission"
          type="button"
          data-action="open"
          [disabled]="offline()"
          (click)="requestOpen()"
        >
          {{ cmdOpenKey | stynxTranslate }}
        </button>
        <button
          *stynxHasPermission="drawPermission"
          type="button"
          data-action="draw"
          [disabled]="offline() || targetBatchId() === ''"
          (click)="requestDraw()"
        >
          {{ cmdDrawKey | stynxTranslate }}
        </button>
        <button
          *stynxHasPermission="approvePermission"
          type="button"
          data-action="approve"
          [disabled]="offline() || targetBatchId() === ''"
          (click)="requestApprove()"
        >
          {{ cmdApproveKey | stynxTranslate }}
        </button>
      </div>
    </form>

    <section [attr.aria-label]="unassignedKey | stynxTranslate">
      <h2>{{ unassignedKey | stynxTranslate }}</h2>
      <rait-queue-table
        [items]="unassignedItems()"
        [columnLabelKeys]="columnLabels"
        [status]="facade.semRelator.status()"
        (open)="openCase($event)"
      />
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
export class BatchesPageComponent {
  readonly facade = inject(SessionFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);
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
  readonly cmdOpenKey = CMD_OPEN_KEY;
  readonly cmdDrawKey = CMD_DRAW_KEY;
  readonly cmdApproveKey = CMD_APPROVE_KEY;
  readonly openKey = 'rait.action.open';
  /** Casos sem relator (ficha 028): rótulo do estado `DISTRIBUIDO` do contrato. */
  readonly unassignedKey = tokenKey('caseState', 'DISTRIBUIDO');
  readonly confirmTitleKey = CONFIRM_TITLE_KEY;
  readonly batchKindPrefix = BATCH_KIND_PREFIX;
  readonly kinds = BATCH_KINDS;
  readonly columnLabels = QUEUE_COLUMN_LABELS;
  readonly openPermission = permissionKeyOf('rait-batch:open');
  readonly drawPermission = permissionKeyOf('rait-batch:draw');
  readonly approvePermission = permissionKeyOf('rait-batch:approve');
  readonly confirm = createConfirmQueue();
  private readonly attempted = signal(false);

  readonly form = this.fb.group({
    poolId: this.fb.control('', Validators.required),
    kind: this.fb.control<'' | RaitBatchKind>('', Validators.required),
    weekStart: this.fb.control('', Validators.required),
    batchId: this.fb.control(''),
  });

  readonly list = connectListToUrl({
    load: (query) => this.facade.loadBatches(this.orgao, query),
  });
  readonly offline = computed(() => this.facade.lotes.status() === 'offline');
  readonly knownPools = computed(() => [
    ...new Set(this.facade.lotes.items().map((batch) => batch.pool_id)),
  ]);
  readonly unassignedItems = computed<readonly QueueItem[]>(() =>
    this.facade.semRelator.items().map((item) => caseToQueueItem(item)),
  );

  constructor() {
    this.sse.connect();
    void this.facade.loadUnassigned(this.orgao);
    const destroyRef = inject(DestroyRef);
    const unregister = [
      this.shortcuts.register('list-next', () => this.table()?.next()),
      this.shortcuts.register('list-prev', () => this.table()?.prev()),
      this.shortcuts.register('open', () => this.table()?.openActive()),
    ];
    destroyRef.onDestroy(() => unregister.forEach((fn) => fn()));
    afterRenderEffect(() => {
      const status = this.facade.lotes.status();
      const heading = this.heading()?.nativeElement;
      untracked(() => {
        if (!this.focused && (status === 'ready' || status === 'empty')) {
          this.focused = true;
          heading?.focus();
        }
      });
    });
  }

  targetBatchId(): string {
    return this.form.controls.batchId.value;
  }

  invalid(field: 'poolId' | 'kind' | 'weekStart'): boolean {
    return this.attempted() && this.form.controls[field].invalid;
  }

  errorId(field: string): string {
    return `${ERROR_ID_PREFIX}${field}`;
  }

  /** `submit` do formulário `lote-sorteio`: inválido → erros inline, nenhum comando. */
  submit(): void {
    this.attempted.set(true);
    this.form.markAllAsTouched();
    if (
      this.form.controls.poolId.invalid ||
      this.form.controls.kind.invalid ||
      this.form.controls.weekStart.invalid
    ) {
      return;
    }
    this.requestOpen();
  }

  requestOpen(): void {
    const value = this.form.getRawValue();
    this.confirm.request({
      action: 'open',
      confirmKey: CONFIRM_OPEN_KEY,
      labelKey: CMD_OPEN_KEY,
      run: () =>
        this.facade.openBatch(
          provisionalBody<CreateRaitBatchDto>({
            ...(value.poolId.length > 0 ? { pool_id: value.poolId } : {}),
            ...(value.kind !== '' ? { kind: value.kind } : {}),
            ...(value.weekStart.length > 0
              ? { week_start: value.weekStart }
              : {}),
          }),
        ),
    });
  }

  requestDraw(): void {
    const batchId = this.targetBatchId();
    this.confirm.request({
      action: 'draw',
      confirmKey: CONFIRM_DRAW_KEY,
      labelKey: CMD_DRAW_KEY,
      run: () => this.facade.drawBatch(batchId, {}),
    });
  }

  requestApprove(): void {
    const batchId = this.targetBatchId();
    this.confirm.request({
      action: 'approve',
      confirmKey: CONFIRM_APPROVE_KEY,
      labelKey: CMD_APPROVE_KEY,
      run: () => this.facade.approveBatch(batchId, {}),
    });
  }

  openBatch(batch: RaitBatch): void {
    void this.router.navigate([
      COLEGIADO_ROUTE,
      this.orgao,
      BATCH_DETAIL_ROUTE,
      batch.id,
    ]);
  }

  openCase(item: QueueItem): void {
    void this.router.navigate([CASE_ROUTE, item.caseId]);
  }

  reload(): void {
    void this.facade.loadBatches(this.orgao, this.list.query());
    void this.facade.loadUnassigned(this.orgao);
  }
}
