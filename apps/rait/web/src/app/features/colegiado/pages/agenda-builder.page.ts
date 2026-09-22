// T-27 Pauta (ficha IU-RAIT-032; contrato CTG-0002b §6.1 linha 31): `SessionFacade.
// loadAgendaCandidates(orgao)` → `pautaCandidatos` (casos PRONTO_P_DECISAO do órgão) +
// `pautaCandidatosRelogios` (bandeiras por caso; `ALERTA_N3`/`CRITICO` em destaque textual pelo
// token) numa `QueueTable`, e `loadSessions(orgao, { filtro: { state: 'FORMANDO_PAUTA' } })` →
// `sessoes` (select `sessionId`); `AgendaComposer` = formulário `pauta` (`sessionId`, `items[]` —
// checkbox por caso; sem arrastar nesta CTG); ação `rait-agenda:close` sob
// `*stynxHasPermission` (M4) com confirmação `confirm.close` → `facade.closeAgenda` (M8).
// `state.critical_missing` é o erro do servidor `RAIT.AGENDA_CRITICAL_MISSING` (§4.4), não regra
// local. Lista sincronizada com a URL; atalhos `list-*`/`open`.
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
  type ListQuery,
  type RaitJudgingBody,
  type RaitSessionState,
} from '../../../data/models';
import { PageStateComponent } from '../../../shared/page-state.component';
import {
  QueueTableComponent,
  type QueueColumnKey,
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
} from '../../page-support';
import { QUEUE_COLUMN_LABELS } from '../../queue-columns';
import { caseToQueueItem } from '../../queue-items';
import { judgingBodyOf } from '../colegiado-route';

const TITLE_KEY = 'rait.screens.colegiado-orgao-pauta.title';
const INTRO_KEY = 'rait.screens.colegiado-orgao-pauta.intro';
const EMPTY_KEY = 'rait.screens.colegiado-orgao-pauta.empty';
const CMD_CLOSE_KEY = 'rait.screens.colegiado-orgao-pauta.cmd.close';
const CONFIRM_CLOSE_KEY = 'rait.screens.colegiado-orgao-pauta.confirm.close';
/** Erro do servidor `RAIT.AGENDA_CRITICAL_MISSING` (catálogo §3): apresentado pelo banner. */
export const CRITICAL_MISSING_STATE_KEY =
  'rait.screens.colegiado-orgao-pauta.state.critical_missing';
const FORMING_AGENDA: RaitSessionState = 'FORMANDO_PAUTA';
const COLUMNS: readonly QueueColumnKey[] = [
  'protocol',
  'state',
  'risk',
  'priority',
];
const CASE_ROUTE = '/casos';
const SESSION_ERROR_ID = 'rait-agenda-session-error';
const ITEMS_ERROR_ID = 'rait-agenda-items-error';

@Component({
  selector: 'rait-agenda-builder-page',
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
    '[attr.data-status]': 'facade.pautaCandidatos.status()',
  },
  template: `
    <h1 #heading tabindex="-1">{{ titleKey | stynxTranslate }}</h1>
    <rait-stream-status-banner />
    <p>{{ introKey | stynxTranslate }}</p>

    <rait-page-state
      [status]="pageStatus()"
      [error]="facade.pautaCandidatos.error()"
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
      [status]="facade.pautaCandidatos.status()"
      [emptyLabelKey]="emptyKey"
      (open)="openCase($event)"
    />
    @if (facade.pautaCandidatos.value(); as page) {
      <stynx-pagination
        [totalItems]="page.total"
        [page]="page.page - 1"
        [pageSizeInput]="page.pageSize"
        (pageChange)="list.onPageChange($event)"
      />
    }

    <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
      <label for="rait-agenda-session">session_id</label>
      <select
        id="rait-agenda-session"
        formControlName="sessionId"
        [attr.aria-invalid]="sessionInvalid() ? 'true' : null"
        [attr.aria-describedby]="sessionInvalid() ? sessionErrorId : null"
      >
        <option value=""></option>
        @for (session of facade.sessoes.items(); track session.id) {
          <option [value]="session.id" [attr.data-token]="session.state">
            {{ session.scheduled_for ?? session.id }}
          </option>
        }
      </select>
      @if (sessionInvalid()) {
        <p [id]="sessionErrorId" role="alert">session_id</p>
      }

      <fieldset
        [attr.aria-invalid]="itemsInvalid() ? 'true' : null"
        [attr.aria-describedby]="itemsInvalid() ? itemsErrorId : null"
      >
        <legend>{{ emptyKeyLabel | stynxTranslate }}</legend>
        @for (item of items(); track item.id) {
          <label>
            <input
              type="checkbox"
              name="items"
              [value]="item.caseId"
              [checked]="selectedCases().has(item.caseId)"
              (change)="toggleCase(item.caseId, $event)"
            />
            {{ item.protocol }}
            @if (item.flag; as flag) {
              <span [attr.data-token]="flag">{{
                riskKey(flag) | stynxTranslate
              }}</span>
            }
          </label>
        }
      </fieldset>
      @if (itemsInvalid()) {
        <p [id]="itemsErrorId" role="alert">items</p>
      }

      <button
        *stynxHasPermission="closePermission"
        type="button"
        data-action="close"
        [disabled]="offline()"
        (click)="requestClose()"
      >
        {{ cmdCloseKey | stynxTranslate }}
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
export class AgendaBuilderPageComponent {
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
  /** Legenda da seleção de itens: a lista de candidatos (título da ficha 032). */
  readonly emptyKeyLabel = TITLE_KEY;
  readonly loadingKey = LOADING_KEY;
  readonly cmdCloseKey = CMD_CLOSE_KEY;
  readonly confirmTitleKey = CONFIRM_TITLE_KEY;
  readonly sessionErrorId = SESSION_ERROR_ID;
  readonly itemsErrorId = ITEMS_ERROR_ID;
  readonly columns = COLUMNS;
  readonly columnLabels = QUEUE_COLUMN_LABELS;
  readonly closePermission = permissionKeyOf('rait-agenda:close');
  readonly confirm = createConfirmQueue();
  readonly selectedCases = signal<ReadonlySet<string>>(new Set());
  private readonly attempted = signal(false);

  readonly form = this.fb.group({
    sessionId: this.fb.control('', Validators.required),
  });
  readonly sessionInvalid = computed(
    () => this.attempted() && this.form.controls.sessionId.invalid,
  );
  readonly itemsInvalid = computed(
    () => this.attempted() && this.selectedCases().size === 0,
  );

  readonly list = connectListToUrl({ load: (query) => this.load(query) });
  readonly pageStatus = computed(() =>
    errorsOnly(this.facade.pautaCandidatos.status()),
  );
  readonly offline = computed(
    () => this.facade.pautaCandidatos.status() === 'offline',
  );
  /** Bandeira = primeiro relógio do caso (ordem recebida); prioridade legal = `priority` do item. */
  readonly items = computed<readonly QueueItem[]>(() => {
    const clocks = this.facade.pautaCandidatosRelogios();
    return this.facade.pautaCandidatos
      .items()
      .map((kase) =>
        caseToQueueItem(kase, { clock: clocks.get(kase.id)?.[0] ?? null }),
      );
  });

  constructor() {
    this.sse.connect();
    void this.facade.loadSessions(this.orgao, {
      filtro: { state: FORMING_AGENDA },
    });
    const destroyRef = inject(DestroyRef);
    const unregister = [
      this.shortcuts.register('list-next', () => this.table()?.next()),
      this.shortcuts.register('list-prev', () => this.table()?.prev()),
      this.shortcuts.register('open', () => this.table()?.openActive()),
    ];
    destroyRef.onDestroy(() => unregister.forEach((fn) => fn()));
    afterRenderEffect(() => {
      const status = this.facade.pautaCandidatos.status();
      const heading = this.heading()?.nativeElement;
      untracked(() => {
        if (!this.focused && (status === 'ready' || status === 'empty')) {
          this.focused = true;
          heading?.focus();
        }
      });
    });
  }

  riskKey(flag: string): string {
    return tokenKey('riskFlag', flag);
  }

  toggleCase(caseId: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectedCases.update((current) => {
      const next = new Set(current);
      if (checked) next.add(caseId);
      else next.delete(caseId);
      return next;
    });
  }

  /** `submit` do formulário `pauta`: sessão e itens obrigatórios (spec §9). */
  submit(): void {
    this.attempted.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid || this.selectedCases().size === 0) return;
    this.requestClose();
  }

  /** Confirmação `confirm.close` → `rait-agenda:close` na sessão escolhida. */
  requestClose(): void {
    const sessionId = this.form.controls.sessionId.value;
    this.confirm.request({
      action: 'close',
      confirmKey: CONFIRM_CLOSE_KEY,
      labelKey: CMD_CLOSE_KEY,
      run: () => this.facade.closeAgenda(sessionId, {}),
    });
  }

  openCase(item: QueueItem): void {
    void this.router.navigate([CASE_ROUTE, item.caseId]);
  }

  reload(): void {
    void this.load(this.list.query());
  }

  /** `loadAgendaCandidates(orgao)` não recebe consulta (§4.3): a da URL entra por `setQuery`. */
  private async load(query: ListQuery): Promise<void> {
    await this.facade.loadAgendaCandidates(this.orgao);
    if (hasListQuery(query)) {
      await this.facade.pautaCandidatos.setQuery(
        mergeListQuery(this.facade.pautaCandidatos.query(), query),
      );
    }
  }
}
