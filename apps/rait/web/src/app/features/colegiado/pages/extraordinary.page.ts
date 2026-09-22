// T-33 Sessão extraordinária (ficha IU-RAIT-038; contrato CTG-0002b §6.1 linha 37): `SessionFacade.
// loadCriticalClocks(orgao)` → `extraordinaria` (relógios `CRITICO`, fila F-J-3) +
// `extraordinariaCasos` (join caso) numa `QueueTable` com `RiskFlag`; `state.paid_cap_pending`
// sempre visível como nota (`rait.common.pendingSource`; OD-012/207); formulário mínimo
// (`scheduledFor`, `modality` — tokens de `RaitSession['modality']`); ação
// `rait-session:convene-extraordinary` (`confirm.convene`) sob `*stynxHasPermission` (chave só de
// ficha — OD-R12-027) → `facade.conveneExtraordinary` (M8). Lista sincronizada com a URL.
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
import { SessionFacade } from '../../../data/facades/session.facade';
import {
  permissionKeyOf,
  type CreateRaitSessionDto,
  type ListQuery,
  type RaitJudgingBody,
  type RaitSessionModality,
} from '../../../data/models';
import { PageStateComponent } from '../../../shared/page-state.component';
import {
  QueueTableComponent,
  type QueueItem,
} from '../../../shared/queue-table.component';
import { screenOf } from '../../../shared/route-screen';
import { StreamStatusBannerComponent } from '../../../shared/stream-status-banner.component';
import {
  connectListToUrl,
  hasListQuery,
  mergeListQuery,
} from '../../list-url-sync';
import {
  CONFIRM_TITLE_KEY,
  LOADING_KEY,
  createConfirmQueue,
  errorsOnly,
  provisionalBody,
} from '../../page-support';
import { QUEUE_COLUMN_LABELS } from '../../queue-columns';
import { caseToQueueItem } from '../../queue-items';
import { judgingBodyOf } from '../colegiado-route';

const TITLE_KEY = 'rait.screens.colegiado-orgao-extraordinaria.title';
const INTRO_KEY = 'rait.screens.colegiado-orgao-extraordinaria.intro';
const EMPTY_KEY = 'rait.screens.colegiado-orgao-extraordinaria.empty';
const CMD_CONVENE_KEY =
  'rait.screens.colegiado-orgao-extraordinaria.cmd.convene';
const CONFIRM_CONVENE_KEY =
  'rait.screens.colegiado-orgao-extraordinaria.confirm.convene';
const PAID_CAP_PENDING_KEY =
  'rait.screens.colegiado-orgao-extraordinaria.state.paid_cap_pending';
const PENDING_SOURCE_KEY = 'rait.common.pendingSource';
/** Tokens do contrato `RaitSession['modality']` (sem chave de rótulo: token em `value`/`data-token`). */
const MODALITIES: readonly RaitSessionModality[] = [
  'presencial',
  'virtual',
  'hibrida',
];
const CASE_ROUTE = '/casos';
const ERROR_ID_PREFIX = 'rait-extraordinary-error-';

@Component({
  selector: 'rait-extraordinary-page',
  imports: [
    ReactiveFormsModule,
    StynxTranslatePipe,
    StynxPaginationComponent,
    StynxHasPermissionDirective,
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
    '[attr.data-orgao]': 'orgao',
    '[attr.data-status]': 'facade.extraordinaria.status()',
  },
  template: `
    <h1 #heading tabindex="-1">{{ titleKey | stynxTranslate }}</h1>
    <rait-stream-status-banner />
    <p>{{ introKey | stynxTranslate }}</p>
    <p role="note" data-state="paid_cap_pending">
      {{ paidCapPendingKey | stynxTranslate }}
      {{ pendingSourceKey | stynxTranslate }}
    </p>

    <rait-page-state
      [status]="pageStatus()"
      [error]="facade.extraordinaria.error()"
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
      [status]="facade.extraordinaria.status()"
      [emptyLabelKey]="emptyKey"
      (open)="openCase($event)"
    />
    @if (facade.extraordinaria.value(); as page) {
      <stynx-pagination
        [totalItems]="page.total"
        [page]="page.page - 1"
        [pageSizeInput]="page.pageSize"
        (pageChange)="list.onPageChange($event)"
      />
    }

    <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
      <label for="rait-extraordinary-scheduled">scheduled_for</label>
      <input
        id="rait-extraordinary-scheduled"
        type="datetime-local"
        formControlName="scheduledFor"
        [attr.aria-invalid]="invalid('scheduledFor') ? 'true' : null"
        [attr.aria-describedby]="
          invalid('scheduledFor') ? errorId('scheduledFor') : null
        "
      />
      @if (invalid('scheduledFor')) {
        <p [id]="errorId('scheduledFor')" role="alert">scheduled_for</p>
      }
      <label for="rait-extraordinary-modality">modality</label>
      <select
        id="rait-extraordinary-modality"
        formControlName="modality"
        [attr.aria-invalid]="invalid('modality') ? 'true' : null"
        [attr.aria-describedby]="
          invalid('modality') ? errorId('modality') : null
        "
      >
        <option value=""></option>
        @for (modality of modalities; track modality) {
          <option [value]="modality" [attr.data-token]="modality">
            {{ modality }}
          </option>
        }
      </select>
      @if (invalid('modality')) {
        <p [id]="errorId('modality')" role="alert">modality</p>
      }
      <button
        *stynxHasPermission="convenePermission"
        type="button"
        data-action="convene"
        [disabled]="offline()"
        (click)="requestConvene()"
      >
        {{ cmdConveneKey | stynxTranslate }}
      </button>
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
export class ExtraordinaryPageComponent {
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
  readonly cmdConveneKey = CMD_CONVENE_KEY;
  readonly paidCapPendingKey = PAID_CAP_PENDING_KEY;
  readonly pendingSourceKey = PENDING_SOURCE_KEY;
  readonly confirmTitleKey = CONFIRM_TITLE_KEY;
  readonly modalities = MODALITIES;
  readonly columnLabels = QUEUE_COLUMN_LABELS;
  readonly convenePermission = permissionKeyOf(
    'rait-session:convene-extraordinary',
  );
  readonly confirm = createConfirmQueue();
  private readonly attempted = signal(false);

  readonly form = this.fb.group({
    scheduledFor: this.fb.control('', Validators.required),
    modality: this.fb.control<'' | RaitSessionModality>(
      '',
      Validators.required,
    ),
  });

  readonly list = connectListToUrl({ load: (query) => this.load(query) });
  readonly pageStatus = computed(() =>
    errorsOnly(this.facade.extraordinaria.status()),
  );
  readonly offline = computed(
    () => this.facade.extraordinaria.status() === 'offline',
  );
  /** Relógio crítico → caso do join; sem caso carregado a linha fica fora. */
  readonly items = computed<readonly QueueItem[]>(() => {
    const cases = this.facade.extraordinariaCasos();
    const items: QueueItem[] = [];
    for (const clock of this.facade.extraordinaria.items()) {
      const kase = cases.get(clock.case_id);
      if (!kase) continue;
      items.push({ ...caseToQueueItem(kase, { clock }), id: clock.id });
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
      const status = this.facade.extraordinaria.status();
      const heading = this.heading()?.nativeElement;
      untracked(() => {
        if (!this.focused && (status === 'ready' || status === 'empty')) {
          this.focused = true;
          heading?.focus();
        }
      });
    });
  }

  invalid(field: 'scheduledFor' | 'modality'): boolean {
    return this.attempted() && this.form.controls[field].invalid;
  }

  errorId(field: string): string {
    return `${ERROR_ID_PREFIX}${field}`;
  }

  submit(): void {
    this.attempted.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.requestConvene();
  }

  requestConvene(): void {
    const value = this.form.getRawValue();
    this.confirm.request({
      action: 'convene',
      confirmKey: CONFIRM_CONVENE_KEY,
      labelKey: CMD_CONVENE_KEY,
      run: () =>
        this.facade.conveneExtraordinary(
          provisionalBody<CreateRaitSessionDto>({
            judging_body: this.orgao,
            extraordinary: true,
            ...(value.scheduledFor.length > 0
              ? { scheduled_for: value.scheduledFor }
              : {}),
            ...(value.modality !== '' ? { modality: value.modality } : {}),
          }),
        ),
    });
  }

  openCase(item: QueueItem): void {
    void this.router.navigate([CASE_ROUTE, item.caseId]);
  }

  reload(): void {
    void this.load(this.list.query());
  }

  /** `loadCriticalClocks(orgao)` não recebe consulta (§4.3): a da URL entra por `setQuery`. */
  private async load(query: ListQuery): Promise<void> {
    await this.facade.loadCriticalClocks(this.orgao);
    if (hasListQuery(query)) {
      await this.facade.extraordinaria.setQuery(
        mergeListQuery(this.facade.extraordinaria.query(), query),
      );
    }
  }
}
