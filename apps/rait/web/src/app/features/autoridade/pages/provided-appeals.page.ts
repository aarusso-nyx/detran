// T-22 Provimentos — recurso vinculado da autoridade (ficha IU-RAIT-027; contrato CTG-0002b §6.1
// linha 26): `CaseFacade.loadProvidedAppeals(query)` → `provimentos` (casos COMUNICADO da JARI
// com decisão `provido`) + `provimentosPrazo` (`T-R2` por caso, `legal`) numa `QueueTable`;
// `AuthorityAppealDecision` = formulário mínimo `grounds` (`field.grounds`, obrigatório para
// recorrer) sobre a linha ativa; ações `rait-appeal:authority-decide` (`cmd.appeal`,
// `confirm.appeal`) e `rait-appeal:waive` (`cmd.waive`, `confirm.waive`; chave só na coluna
// Comando da §7 — OD-R12-027) sob `*stynxHasPermission` (M4) → `facade.<comando>` (M8). Lista
// sincronizada com a URL; atalhos `list-*`/`open`.
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
import { ShortcutService } from '../../../core/shortcut.service';
import { SseService } from '../../../core/sse.service';
import { CaseFacade } from '../../../data/facades/case.facade';
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

const TITLE_KEY = 'rait.screens.autoridade-provimentos.title';
const INTRO_KEY = 'rait.screens.autoridade-provimentos.intro';
const EMPTY_KEY = 'rait.screens.autoridade-provimentos.empty';
const CMD_APPEAL_KEY = 'rait.screens.autoridade-provimentos.cmd.appeal';
const CMD_WAIVE_KEY = 'rait.screens.autoridade-provimentos.cmd.waive';
const CONFIRM_APPEAL_KEY = 'rait.screens.autoridade-provimentos.confirm.appeal';
const CONFIRM_WAIVE_KEY = 'rait.screens.autoridade-provimentos.confirm.waive';
const FIELD_GROUNDS_KEY = 'rait.screens.autoridade-provimentos.field.grounds';
const CASE_ROUTE = '/casos';
const GROUNDS_ERROR_ID = 'rait-provided-appeals-grounds-error';

@Component({
  selector: 'rait-provided-appeals-page',
  imports: [
    ReactiveFormsModule,
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
    '[attr.data-status]': 'facade.provimentos.status()',
  },
  template: `
    <h1 #heading tabindex="-1">{{ titleKey | stynxTranslate }}</h1>
    <rait-stream-status-banner />
    <p>{{ introKey | stynxTranslate }}</p>

    <rait-page-state
      [status]="pageStatus()"
      [error]="facade.provimentos.error()"
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
      [status]="facade.provimentos.status()"
      [emptyLabelKey]="emptyKey"
      (open)="open($event)"
    />

    @if (facade.provimentos.value(); as page) {
      <stynx-pagination
        [totalItems]="page.total"
        [page]="page.page - 1"
        [pageSizeInput]="page.pageSize"
        (pageChange)="list.onPageChange($event)"
      />
    }

    <form [formGroup]="form" (ngSubmit)="requestAppeal()" novalidate>
      @if (activeItem()?.deadline; as deadline) {
        <rait-legal-basis-tooltip [legalBasis]="deadline.legalBasis" />
      }
      <label for="rait-provided-appeals-grounds">{{
        fieldGroundsKey | stynxTranslate
      }}</label>
      <textarea
        id="rait-provided-appeals-grounds"
        name="grounds"
        formControlName="grounds"
        [attr.aria-invalid]="groundsInvalid() ? 'true' : null"
        [attr.aria-describedby]="groundsInvalid() ? groundsErrorId : null"
      ></textarea>
      @if (groundsInvalid()) {
        <p [id]="groundsErrorId" role="alert">
          {{ fieldGroundsKey | stynxTranslate }}
        </p>
      }
      <div class="rait-provided-appeals__actions">
        <button
          *stynxHasPermission="appealPermission"
          type="submit"
          data-action="appeal"
          [disabled]="offline() || activeItem() === null"
          (click)="requestAppeal($event)"
        >
          {{ cmdAppealKey | stynxTranslate }}
        </button>
        <button
          *stynxHasPermission="waivePermission"
          type="button"
          data-action="waive"
          [disabled]="offline() || activeItem() === null"
          (click)="requestWaive()"
        >
          {{ cmdWaiveKey | stynxTranslate }}
        </button>
      </div>
    </form>

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
export class ProvidedAppealsPageComponent {
  readonly facade = inject(CaseFacade);
  private readonly fb = inject(NonNullableFormBuilder);
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
  readonly cmdAppealKey = CMD_APPEAL_KEY;
  readonly cmdWaiveKey = CMD_WAIVE_KEY;
  readonly fieldGroundsKey = FIELD_GROUNDS_KEY;
  readonly confirmTitleKey = CONFIRM_TITLE_KEY;
  readonly groundsErrorId = GROUNDS_ERROR_ID;
  readonly columnLabels = QUEUE_COLUMN_LABELS;
  readonly appealPermission = permissionKeyOf('rait-appeal:authority-decide');
  readonly waivePermission = permissionKeyOf('rait-appeal:waive');
  readonly confirm = createConfirmQueue();
  private readonly attempted = signal(false);

  /** Forma mínima: fundamentação obrigatória para recorrer (§6.1 linha 26). */
  readonly form = this.fb.group({
    grounds: this.fb.control('', Validators.required),
  });
  readonly groundsInvalid = computed(
    () => this.attempted() && this.form.controls.grounds.invalid,
  );

  readonly list = connectListToUrl({
    load: (query) => this.facade.loadProvidedAppeals(query),
  });
  readonly pageStatus = computed(() =>
    errorsOnly(this.facade.provimentos.status()),
  );
  readonly offline = computed(
    () => this.facade.provimentos.status() === 'offline',
  );

  /** Prazo `T-R2` (legal) por caso, só quando o servidor o trouxe. */
  readonly items = computed<readonly QueueItem[]>(() => {
    const deadlines = this.facade.provimentosPrazo();
    return this.facade.provimentos.items().map((kase) =>
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
      const status = this.facade.provimentos.status();
      const heading = this.heading()?.nativeElement;
      untracked(() => {
        if (!this.focused && (status === 'ready' || status === 'empty')) {
          this.focused = true;
          heading?.focus();
        }
      });
    });
  }

  /** Recorrer exige fundamentação (erro inline, guia §3.7) antes da confirmação `confirm.appeal`. */
  requestAppeal(event?: Event): void {
    event?.preventDefault();
    this.attempted.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const caseId = this.activeItem()?.caseId ?? '';
    const grounds = this.form.controls.grounds.value.trim();
    this.confirm.request({
      action: 'appeal',
      confirmKey: CONFIRM_APPEAL_KEY,
      labelKey: CMD_APPEAL_KEY,
      run: () => this.facade.authorityDecide(caseId, { reason: grounds }),
    });
  }

  requestWaive(): void {
    const caseId = this.activeItem()?.caseId ?? '';
    this.confirm.request({
      action: 'waive',
      confirmKey: CONFIRM_WAIVE_KEY,
      labelKey: CMD_WAIVE_KEY,
      run: () => this.facade.waive(caseId, {}),
    });
  }

  open(item: QueueItem): void {
    void this.router.navigate([CASE_ROUTE, item.caseId]);
  }

  reload(): void {
    void this.facade.loadProvidedAppeals(this.list.query());
  }
}
