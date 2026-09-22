// T-29 Sessão ao vivo (ficha IU-RAIT-034; contrato CTG-0002b §6.1 linha 33; [WF-RAIT-003];
// [RN-RAIT-142]): `SessionFacade.loadSession(id)` → `sessao` (sessão, itens, presenças, votos,
// banca, ata); `sse.connect({ sessionId })`; `QuorumIndicator`; item corrente = primeiro item com
// `read_at ≠ null` e `proclaimed_at == null` na ordem recebida (leitura de campos, não regra);
// `VoteTally` do item corrente; formulário `sessao-ao-vivo` (`vote` — tokens `RAIT_VOTE_VALUES`
// —, `castingVote`, `withdrawnReason`); ações `rait-session:{open,adjourn,vote,casting-vote,
// view-request,proclaim}` sob `*stynxHasPermission` (M4; `casting-vote` só do presidente —
// ficha 034) com as frases `confirm.*` da ficha §6 → `facade.<comando>` (M8); `state.no_quorum`
// = `bench.state === 'BANCA_INSUFICIENTE'` (token do servidor). Atalho `vote`.
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
import { ActivatedRoute } from '@angular/router';
import { StynxTranslatePipe } from '@detran/ui';
import { StynxHasPermissionDirective } from '@stynx-nyx/angular-auth';
import { StynxConfirmDialogComponent } from '@stynx-nyx/angular-ui';
import { RaitErrorBannerComponent } from '../../../core/error-boundary';
import { provideRaitI18nFallback } from '../../../core/i18n-fallback';
import { ShortcutService } from '../../../core/shortcut.service';
import { SseService } from '../../../core/sse.service';
import { SessionFacade } from '../../../data/facades/session.facade';
import {
  RAIT_VOTE_VALUES,
  permissionKeyOf,
  type CreateRaitVoteDto,
  type RaitAgendaItem,
  type RaitBenchState,
  type RaitVote,
  type RaitVoteValue,
} from '../../../data/models';
import { PageStateComponent } from '../../../shared/page-state.component';
import { QuorumIndicatorComponent } from '../../../shared/quorum-indicator.component';
import { screenOf } from '../../../shared/route-screen';
import { StreamStatusBannerComponent } from '../../../shared/stream-status-banner.component';
import { VoteTallyComponent } from '../../../shared/vote-tally.component';
import {
  CONFIRM_TITLE_KEY,
  EMPTY_KEY,
  LOADING_KEY,
  createConfirmQueue,
  provisionalBody,
} from '../../page-support';
import { sessionIdOf } from '../colegiado-route';

const SLUG = 'rait.screens.colegiado-orgao-sessoes-id';
const TITLE_KEY = `${SLUG}.title`;
const CMD = {
  open: 'rait.screens.colegiado-orgao-sessoes-id.cmd.open',
  adjourn: 'rait.screens.colegiado-orgao-sessoes-id.cmd.adjourn',
  vote: 'rait.screens.colegiado-orgao-sessoes-id.cmd.vote',
  castingVote: 'rait.screens.colegiado-orgao-sessoes-id.cmd.casting_vote',
  viewRequest: 'rait.screens.colegiado-orgao-sessoes-id.cmd.view_request',
  proclaim: 'rait.screens.colegiado-orgao-sessoes-id.cmd.proclaim',
} as const;
const CONFIRM = {
  open: 'rait.screens.colegiado-orgao-sessoes-id.confirm.open',
  adjourn: 'rait.screens.colegiado-orgao-sessoes-id.confirm.adjourn',
  vote: 'rait.screens.colegiado-orgao-sessoes-id.confirm.vote',
  castingVote: 'rait.screens.colegiado-orgao-sessoes-id.confirm.casting_vote',
  viewRequest: 'rait.screens.colegiado-orgao-sessoes-id.confirm.view_request',
  proclaim: 'rait.screens.colegiado-orgao-sessoes-id.confirm.proclaim',
} as const;
const NO_QUORUM_KEY = 'rait.screens.colegiado-orgao-sessoes-id.state.no_quorum';
const DECISION_KEY_PREFIX = 'rait.decision.';
const INSUFFICIENT_BENCH: RaitBenchState = 'BANCA_INSUFICIENTE';
const VOTE_ERROR_ID = 'rait-live-session-vote-error';

@Component({
  selector: 'rait-live-session-page',
  imports: [
    ReactiveFormsModule,
    StynxTranslatePipe,
    StynxHasPermissionDirective,
    StynxConfirmDialogComponent,
    StreamStatusBannerComponent,
    PageStateComponent,
    QuorumIndicatorComponent,
    VoteTallyComponent,
    RaitErrorBannerComponent,
  ],
  providers: provideRaitI18nFallback(),
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-screen]': 'screen',
    '[attr.data-session-id]': 'sessionId',
    '[attr.data-status]': 'facade.sessao.status()',
  },
  template: `
    <h1 #heading tabindex="-1">{{ titleKey | stynxTranslate }}</h1>
    <rait-stream-status-banner />

    <rait-page-state
      [status]="facade.sessao.status()"
      [error]="facade.sessao.error()"
      [loadingLabelKey]="loadingKey"
      [emptyLabelKey]="emptyKey"
      (retry)="reload()"
    />

    @if (facade.command.error(); as error) {
      <rait-error-banner [error]="error" />
    }

    @if (noQuorum()) {
      <p role="status" data-state="no_quorum">
        {{ noQuorumKey | stynxTranslate }}
      </p>
    }

    @if (facade.sessao.value(); as bundle) {
      <rait-quorum-indicator
        [session]="bundle.session"
        [bench]="bundle.bench"
        [attendance]="bundle.attendance"
      />
      @if (currentItem(); as item) {
        <rait-vote-tally
          [item]="item"
          [votes]="currentVotes()"
          [sessionState]="bundle.session.state"
        />
      }
    }

    <div class="rait-live-session__actions" role="toolbar">
      <button
        *stynxHasPermission="permissions.open"
        type="button"
        data-action="open"
        [disabled]="offline()"
        (click)="request('open')"
      >
        {{ cmd.open | stynxTranslate }}
      </button>
      <button
        *stynxHasPermission="permissions.adjourn"
        type="button"
        data-action="adjourn"
        [disabled]="offline()"
        (click)="request('adjourn')"
      >
        {{ cmd.adjourn | stynxTranslate }}
      </button>
      <button
        *stynxHasPermission="permissions.viewRequest"
        type="button"
        data-action="view-request"
        [disabled]="offline() || currentItem() === null"
        (click)="request('viewRequest')"
      >
        {{ cmd.viewRequest | stynxTranslate }}
      </button>
      <button
        *stynxHasPermission="permissions.proclaim"
        type="button"
        data-action="proclaim"
        [disabled]="offline() || currentItem() === null"
        (click)="request('proclaim')"
      >
        {{ cmd.proclaim | stynxTranslate }}
      </button>
    </div>

    <form [formGroup]="form" (ngSubmit)="requestVote()" novalidate>
      <label for="rait-live-session-vote">vote</label>
      <select
        id="rait-live-session-vote"
        formControlName="vote"
        [attr.aria-invalid]="voteInvalid() ? 'true' : null"
        [attr.aria-describedby]="voteInvalid() ? voteErrorId : null"
      >
        <option value=""></option>
        @for (value of voteValues; track value) {
          <option [value]="value" [attr.data-token]="value">
            {{ decisionKeyPrefix + value | stynxTranslate }}
          </option>
        }
      </select>
      @if (voteInvalid()) {
        <p [id]="voteErrorId" role="alert">vote</p>
      }
      <label>
        <input type="checkbox" formControlName="castingVote" />
        casting_vote
      </label>
      <label for="rait-live-session-withdrawn">withdrawn_reason</label>
      <input
        id="rait-live-session-withdrawn"
        type="text"
        formControlName="withdrawnReason"
      />
      <button
        *stynxHasPermission="permissions.vote"
        type="button"
        data-action="vote"
        [disabled]="offline()"
        (click)="requestVote()"
      >
        {{ cmd.vote | stynxTranslate }}
      </button>
      <button
        *stynxHasPermission="permissions.castingVote"
        type="button"
        data-action="casting-vote"
        [disabled]="offline()"
        (click)="requestVote(true)"
      >
        {{ cmd.castingVote | stynxTranslate }}
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
export class LiveSessionPageComponent {
  readonly facade = inject(SessionFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly sse = inject(SseService);
  private readonly shortcuts = inject(ShortcutService);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private focused = false;

  readonly screen = screenOf(this.route);
  readonly sessionId = sessionIdOf(this.route);
  readonly titleKey = TITLE_KEY;
  readonly emptyKey = EMPTY_KEY;
  readonly loadingKey = LOADING_KEY;
  readonly noQuorumKey = NO_QUORUM_KEY;
  readonly confirmTitleKey = CONFIRM_TITLE_KEY;
  readonly decisionKeyPrefix = DECISION_KEY_PREFIX;
  readonly voteErrorId = VOTE_ERROR_ID;
  readonly voteValues = RAIT_VOTE_VALUES;
  readonly cmd = CMD;
  readonly permissions = {
    open: permissionKeyOf('rait-session:open'),
    adjourn: permissionKeyOf('rait-session:adjourn'),
    vote: permissionKeyOf('rait-session:vote'),
    castingVote: permissionKeyOf('rait-session:casting-vote'),
    viewRequest: permissionKeyOf('rait-session:view-request'),
    proclaim: permissionKeyOf('rait-session:proclaim'),
  } as const;
  readonly confirm = createConfirmQueue();
  private readonly attempted = signal(false);

  readonly form = this.fb.group({
    vote: this.fb.control<'' | RaitVoteValue>('', Validators.required),
    castingVote: this.fb.control(false),
    withdrawnReason: this.fb.control(''),
  });
  readonly voteInvalid = computed(
    () => this.attempted() && this.form.controls.vote.invalid,
  );

  readonly offline = computed(() => this.facade.sessao.status() === 'offline');
  readonly noQuorum = computed(
    () => this.facade.sessao.value()?.bench?.state === INSUFFICIENT_BENCH,
  );
  /** Ficha 034: primeiro item lido e não proclamado, na ordem recebida. */
  readonly currentItem = computed<RaitAgendaItem | null>(
    () =>
      this.facade.sessao
        .value()
        ?.items.find(
          (item) =>
            item.read_at !== null &&
            item.read_at !== undefined &&
            (item.proclaimed_at === null || item.proclaimed_at === undefined),
        ) ?? null,
  );
  readonly currentVotes = computed<readonly RaitVote[]>(() => {
    const item = this.currentItem();
    const votes = this.facade.sessao.value()?.votes ?? [];
    return item === null
      ? []
      : votes.filter((vote) => vote.agenda_item_id === item.id);
  });

  constructor() {
    this.sse.connect({ sessionId: this.sessionId });
    void this.facade.loadSession(this.sessionId);
    const unregister = this.shortcuts.register('vote', () =>
      this.requestVote(),
    );
    inject(DestroyRef).onDestroy(unregister);
    afterRenderEffect(() => {
      const status = this.facade.sessao.status();
      const heading = this.heading()?.nativeElement;
      untracked(() => {
        if (!this.focused && (status === 'ready' || status === 'empty')) {
          this.focused = true;
          heading?.focus();
        }
      });
    });
  }

  /** Ações da sessão (abrir, adiar, pedir vista, proclamar) com a frase `confirm.*` da ficha. */
  request(action: 'open' | 'adjourn' | 'viewRequest' | 'proclaim'): void {
    const itemId = this.currentItem()?.id ?? '';
    const runs = {
      open: () => this.facade.openSession(this.sessionId, {}),
      adjourn: () => this.facade.adjournSession(this.sessionId, {}),
      viewRequest: () => this.facade.requestView(itemId, {}),
      proclaim: () => this.facade.proclaim(itemId, {}),
    } as const;
    this.confirm.request({
      action,
      confirmKey: CONFIRM[action],
      labelKey: CMD[action],
      run: runs[action],
    });
  }

  /** Voto obrigatório (forma) antes da confirmação; `casting-vote` é o voto de qualidade. */
  requestVote(casting = false): void {
    this.attempted.set(true);
    this.form.markAllAsTouched();
    if (this.form.controls.vote.invalid) return;
    const vote = this.form.controls.vote.value;
    if (vote === '') return;
    const itemId = this.currentItem()?.id ?? '';
    const body = provisionalBody<CreateRaitVoteDto>({
      agenda_item_id: itemId,
      vote,
      casting_vote: casting || this.form.controls.castingVote.value,
    });
    this.confirm.request({
      action: casting ? 'casting-vote' : 'vote',
      confirmKey: casting ? CONFIRM.castingVote : CONFIRM.vote,
      labelKey: casting ? CMD.castingVote : CMD.vote,
      run: () =>
        casting ? this.facade.castingVote(body) : this.facade.vote(body),
    });
  }

  reload(): void {
    void this.facade.loadSession(this.sessionId);
  }
}
