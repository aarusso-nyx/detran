// T-32 Vistas (ficha IU-RAIT-037; contrato CTG-0002b §6.1 linha 36): `SessionFacade.loadViews(
// orgao)` → `vistas` (itens de pauta com `view_requested_by`) numa `<stynx-table>` do kit
// (case_id, view_requested_by, `view_due_on` como data com o rótulo `rait.common.viewDueOn` —
// sem `DeadlineChip` por falta de base legal no contrato); a facade não compõe os casos dos itens
// (§6.1 `QueueTable`), então a lista de casos fica para essa composição (relatório TASK-0015).
// Formulário mínimo (`vote` — `RAIT_OPINION_VOTES`); ação `rait-session:register-view-vote`
// (`confirm.register_view_vote`) sob `*stynxHasPermission` (chave só de ficha — OD-R12-027) sobre
// o item selecionado → `facade.registerViewVote` (M8); `state.deadline_exceeded` só pelo erro do
// servidor `RAIT.VIEW_DEADLINE_EXCEEDED` (§4.4). Lista sincronizada com a URL.
import {
  ChangeDetectionStrategy,
  Component,
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
import { ActivatedRoute } from '@angular/router';
import {
  StynxI18nService,
  StynxIntlDatePipe,
  StynxPaginationComponent,
  StynxTableComponent,
  StynxTranslatePipe,
} from '@detran/ui';
import { StynxHasPermissionDirective } from '@stynx-nyx/angular-auth';
import { StynxConfirmDialogComponent } from '@stynx-nyx/angular-ui';
import { RaitErrorBannerComponent } from '../../../core/error-boundary';
import { provideRaitI18nFallback } from '../../../core/i18n-fallback';
import { SseService } from '../../../core/sse.service';
import { SessionFacade } from '../../../data/facades/session.facade';
import {
  RAIT_OPINION_VOTES,
  permissionKeyOf,
  type ListQuery,
  type RaitAgendaItem,
  type RaitJudgingBody,
  type RaitOpinionVote,
} from '../../../data/models';
import { PageStateComponent } from '../../../shared/page-state.component';
import { screenOf } from '../../../shared/route-screen';
import { StreamStatusBannerComponent } from '../../../shared/stream-status-banner.component';
import type { TableColumn } from '../../../shared/table-column';
import {
  connectListToUrl,
  hasListQuery,
  mergeListQuery,
} from '../../list-url-sync';
import {
  CONFIRM_TITLE_KEY,
  LOADING_KEY,
  createConfirmQueue,
} from '../../page-support';
import { judgingBodyOf } from '../colegiado-route';

const TITLE_KEY = 'rait.screens.colegiado-orgao-vistas.title';
const INTRO_KEY = 'rait.screens.colegiado-orgao-vistas.intro';
const EMPTY_KEY = 'rait.screens.colegiado-orgao-vistas.empty';
const CMD_REGISTER_KEY =
  'rait.screens.colegiado-orgao-vistas.cmd.register_view_vote';
const CONFIRM_REGISTER_KEY =
  'rait.screens.colegiado-orgao-vistas.confirm.register_view_vote';
/** Erro do servidor `RAIT.VIEW_DEADLINE_EXCEEDED` (catálogo §3): apresentado pelo banner. */
export const DEADLINE_EXCEEDED_STATE_KEY =
  'rait.screens.colegiado-orgao-vistas.state.deadline_exceeded';
const VIEW_DUE_ON_KEY = 'rait.common.viewDueOn';
const DECISION_KEY_PREFIX = 'rait.decision.';
const VOTE_ERROR_ID = 'rait-views-vote-error';

interface ViewRow extends Record<string, unknown> {
  readonly id: string;
  readonly case_id: string;
  readonly view_requested_by: string;
  readonly view_due_on: string;
}

const COLUMNS: readonly TableColumn<ViewRow>[] = [
  { key: 'case_id', label: 'case_id' },
  { key: 'view_requested_by', label: 'view_requested_by' },
  { key: 'view_due_on', label: 'view_due_on' },
];

@Component({
  selector: 'rait-views-page',
  imports: [
    ReactiveFormsModule,
    StynxTranslatePipe,
    StynxTableComponent,
    StynxPaginationComponent,
    StynxHasPermissionDirective,
    StynxConfirmDialogComponent,
    StreamStatusBannerComponent,
    PageStateComponent,
    RaitErrorBannerComponent,
  ],
  providers: [...provideRaitI18nFallback(), StynxIntlDatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-screen]': 'screen',
    '[attr.data-orgao]': 'orgao',
    '[attr.data-status]': 'facade.vistas.status()',
  },
  template: `
    <h1 #heading tabindex="-1">{{ titleKey | stynxTranslate }}</h1>
    <rait-stream-status-banner />
    <p>{{ introKey | stynxTranslate }}</p>

    <rait-page-state
      [status]="facade.vistas.status()"
      [error]="facade.vistas.error()"
      [loadingLabelKey]="loadingKey"
      [emptyLabelKey]="emptyKey"
      (retry)="reload()"
    />

    @if (facade.command.error(); as error) {
      <rait-error-banner [error]="error" />
    }

    @if (rows().length > 0) {
      <stynx-table
        [columns]="columns"
        [rows]="rows()"
        [rowTrackBy]="trackRow"
      />
      <label for="rait-views-item">case_id</label>
      <select id="rait-views-item" (change)="selectItem($event)">
        <option value=""></option>
        @for (item of facade.vistas.items(); track item.id) {
          <option [value]="item.id" [selected]="item.id === selectedId()">
            {{ item.case_id }}
          </option>
        }
      </select>
    }
    @if (facade.vistas.value(); as page) {
      <stynx-pagination
        [totalItems]="page.total"
        [page]="page.page - 1"
        [pageSizeInput]="page.pageSize"
        (pageChange)="list.onPageChange($event)"
      />
    }

    <form [formGroup]="form" (ngSubmit)="requestRegister()" novalidate>
      <label for="rait-views-vote">vote</label>
      <select
        id="rait-views-vote"
        formControlName="vote"
        [attr.aria-invalid]="voteInvalid() ? 'true' : null"
        [attr.aria-describedby]="voteInvalid() ? voteErrorId : null"
      >
        <option value=""></option>
        @for (vote of votes; track vote) {
          <option [value]="vote" [attr.data-token]="vote">
            {{ decisionKeyPrefix + vote | stynxTranslate }}
          </option>
        }
      </select>
      @if (voteInvalid()) {
        <p [id]="voteErrorId" role="alert">vote</p>
      }
      <button
        *stynxHasPermission="registerPermission"
        type="button"
        data-action="register-view-vote"
        [disabled]="offline() || selected() === null"
        (click)="requestRegister()"
      >
        {{ cmdRegisterKey | stynxTranslate }}
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
export class ViewsPageComponent {
  readonly facade = inject(SessionFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly i18n = inject(StynxI18nService);
  private readonly datePipe = inject(StynxIntlDatePipe);
  private readonly sse = inject(SseService);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private focused = false;

  readonly screen = screenOf(this.route);
  readonly orgao: RaitJudgingBody = judgingBodyOf(this.route);
  readonly titleKey = TITLE_KEY;
  readonly introKey = INTRO_KEY;
  readonly emptyKey = EMPTY_KEY;
  readonly loadingKey = LOADING_KEY;
  readonly cmdRegisterKey = CMD_REGISTER_KEY;
  readonly confirmTitleKey = CONFIRM_TITLE_KEY;
  readonly decisionKeyPrefix = DECISION_KEY_PREFIX;
  readonly voteErrorId = VOTE_ERROR_ID;
  readonly votes = RAIT_OPINION_VOTES;
  readonly columns = COLUMNS as TableColumn<ViewRow>[];
  readonly trackRow = (row: ViewRow): string => row.id;
  readonly registerPermission = permissionKeyOf(
    'rait-session:register-view-vote',
  );
  readonly confirm = createConfirmQueue();
  readonly selectedId = signal('');
  private readonly attempted = signal(false);

  readonly form = this.fb.group({
    vote: this.fb.control<'' | RaitOpinionVote>('', Validators.required),
  });
  readonly voteInvalid = computed(
    () => this.attempted() && this.form.controls.vote.invalid,
  );

  readonly list = connectListToUrl({ load: (query) => this.load(query) });
  readonly offline = computed(() => this.facade.vistas.status() === 'offline');
  readonly selected = computed<RaitAgendaItem | null>(
    () =>
      this.facade.vistas
        .items()
        .find((item) => item.id === this.selectedId()) ?? null,
  );
  readonly rows = computed<ViewRow[]>(() =>
    this.facade.vistas.items().map((item) => ({
      id: item.id,
      case_id: item.case_id,
      view_requested_by: item.view_requested_by ?? '',
      view_due_on: item.view_due_on
        ? `${this.i18n.translate(VIEW_DUE_ON_KEY)} ${this.datePipe.transform(item.view_due_on)}`
        : '',
    })),
  );

  constructor() {
    this.sse.connect();
    afterRenderEffect(() => {
      const status = this.facade.vistas.status();
      const heading = this.heading()?.nativeElement;
      untracked(() => {
        if (!this.focused && (status === 'ready' || status === 'empty')) {
          this.focused = true;
          heading?.focus();
        }
      });
    });
  }

  selectItem(event: Event): void {
    this.selectedId.set((event.target as HTMLSelectElement).value);
  }

  /** Voto obrigatório (forma) antes da confirmação `confirm.register_view_vote`. */
  requestRegister(): void {
    this.attempted.set(true);
    this.form.markAllAsTouched();
    if (this.form.controls.vote.invalid) return;
    const vote = this.form.controls.vote.value;
    if (vote === '') return;
    const itemId = this.selected()?.id ?? '';
    this.confirm.request({
      action: 'register-view-vote',
      confirmKey: CONFIRM_REGISTER_KEY,
      labelKey: CMD_REGISTER_KEY,
      run: () => this.facade.registerViewVote(itemId, { opinion_vote: vote }),
    });
  }

  reload(): void {
    void this.load(this.list.query());
  }

  /** `loadViews(orgao)` não recebe consulta (§4.3): a da URL entra por `setQuery`. */
  private async load(query: ListQuery): Promise<void> {
    await this.facade.loadViews(this.orgao);
    if (hasListQuery(query)) {
      await this.facade.vistas.setQuery(
        mergeListQuery(this.facade.vistas.query(), query),
      );
    }
  }
}
