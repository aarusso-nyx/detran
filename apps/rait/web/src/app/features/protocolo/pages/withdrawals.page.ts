// T-21 Desistências (ficha IU-RAIT-024; contrato CTG-0002b §6.1 linha 23): `ProtocolFacade.
// findCaseByProtocol(q)` → `desistenciaCaso` (caso alvo do termo); formulário `desistencia`
// (`protocol` — busca —, `termDocumentId` via `DocumentUploader` (`field.term`),
// `signerPartyId`, `legitimacyConfirmed`) com `Validators.required` e erro inline; ação
// `rait-case:withdraw` sob `*stynxHasPermission` (M4) com confirmação `confirm.withdraw` →
// `facade.withdraw` (M8); `state.after_decision` quando `caso.state` ∈ pós-decisão
// (`DECIDIDO_AUTORIDADE`, `JULGADO_SESSAO`, `COMUNICADO`, `TRANSITADO` — leitura do token, ficha
// 024): a desistência só cabe pré-decisão (spec §9) e o botão fica desabilitado.
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
import { StynxTranslatePipe } from '@detran/ui';
import { StynxHasPermissionDirective } from '@stynx-nyx/angular-auth';
import { StynxConfirmDialogComponent } from '@stynx-nyx/angular-ui';
import { RaitErrorBannerComponent } from '../../../core/error-boundary';
import { provideRaitI18nFallback } from '../../../core/i18n-fallback';
import { SseService } from '../../../core/sse.service';
import { ProtocolFacade } from '../../../data/facades/protocol.facade';
import {
  permissionKeyOf,
  type CommandBody,
  type RaitCaseState,
} from '../../../data/models';
import { CaseStateBadgeComponent } from '../../../shared/case-state-badge.component';
import {
  DocumentUploaderComponent,
  type DocumentUploadRequest,
} from '../../../shared/document-uploader.component';
import { PageStateComponent } from '../../../shared/page-state.component';
import { screenOf } from '../../../shared/route-screen';
import { StreamStatusBannerComponent } from '../../../shared/stream-status-banner.component';
import {
  CONFIRM_TITLE_KEY,
  EMPTY_KEY,
  LOADING_KEY,
  createConfirmQueue,
  provisionalBody,
} from '../../page-support';

const TITLE_KEY = 'rait.screens.protocolo-desistencias.title';
const INTRO_KEY = 'rait.screens.protocolo-desistencias.intro';
const CMD_WITHDRAW_KEY = 'rait.screens.protocolo-desistencias.cmd.withdraw';
const CONFIRM_WITHDRAW_KEY =
  'rait.screens.protocolo-desistencias.confirm.withdraw';
const FIELD_TERM_KEY = 'rait.screens.protocolo-desistencias.field.term';
const AFTER_DECISION_KEY =
  'rait.screens.protocolo-desistencias.state.after_decision';
const SEARCH_KEY = 'rait.shell.search';
const LEGITIMACY_KEY = 'rait.screens.casos-id-triagem.field.legitimidade';
/** Ficha 024: estados pós-decisão (tokens do contrato; leitura, não regra de prazo). */
const AFTER_DECISION_STATES: ReadonlySet<RaitCaseState> =
  new Set<RaitCaseState>([
    'DECIDIDO_AUTORIDADE',
    'JULGADO_SESSAO',
    'COMUNICADO',
    'TRANSITADO',
  ]);
/** Tipos de documento do termo: do formulário do CTG-0002c (nenhum inventado aqui). */
const TERM_KINDS: readonly string[] = [];
const ERROR_ID_PREFIX = 'rait-withdrawal-error-';

@Component({
  selector: 'rait-withdrawals-page',
  imports: [
    ReactiveFormsModule,
    StynxTranslatePipe,
    StynxHasPermissionDirective,
    StynxConfirmDialogComponent,
    StreamStatusBannerComponent,
    PageStateComponent,
    CaseStateBadgeComponent,
    DocumentUploaderComponent,
    RaitErrorBannerComponent,
  ],
  providers: provideRaitI18nFallback(),
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-screen]': 'screen',
    '[attr.data-status]': 'facade.desistenciaCaso.status()',
  },
  template: `
    <h1 #heading tabindex="-1">{{ titleKey | stynxTranslate }}</h1>
    <rait-stream-status-banner />
    <p>{{ introKey | stynxTranslate }}</p>

    @if (facade.command.error(); as error) {
      <rait-error-banner [error]="error" />
    }

    <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
      <label for="rait-withdrawal-protocol">{{
        searchKey | stynxTranslate
      }}</label>
      <input
        id="rait-withdrawal-protocol"
        type="search"
        formControlName="protocol"
        [attr.aria-invalid]="invalid('protocol') ? 'true' : null"
        [attr.aria-describedby]="
          invalid('protocol') ? errorId('protocol') : null
        "
        (change)="findCase()"
      />
      @if (invalid('protocol')) {
        <p [id]="errorId('protocol')" role="alert">
          {{ searchKey | stynxTranslate }}
        </p>
      }

      <rait-page-state
        [status]="facade.desistenciaCaso.status()"
        [error]="facade.desistenciaCaso.error()"
        [loadingLabelKey]="loadingKey"
        [emptyLabelKey]="emptyKey"
        (retry)="findCase()"
      />

      @if (facade.desistenciaCaso.value(); as kase) {
        <p data-target-case [attr.data-case-id]="kase.id">
          <span>{{ kase.protocol_number }}</span>
          <rait-case-state-badge
            [state]="kase.state"
            [instance]="kase.instance"
          />
        </p>
        @if (afterDecision()) {
          <p role="status" data-state="after_decision">
            {{ afterDecisionKey | stynxTranslate }}
          </p>
        }
      }

      <section [attr.aria-label]="fieldTermKey | stynxTranslate">
        <h2>{{ fieldTermKey | stynxTranslate }}</h2>
        <rait-document-uploader
          origin="requerente"
          [kinds]="termKinds"
          [disabled]="offline()"
          (submitted)="termUpload.set($event)"
        />
        @if (invalid('termDocumentId')) {
          <p [id]="errorId('termDocumentId')" role="alert">
            {{ fieldTermKey | stynxTranslate }}
          </p>
        }
      </section>

      <label for="rait-withdrawal-signer">signer_party_id</label>
      <input
        id="rait-withdrawal-signer"
        type="text"
        formControlName="signerPartyId"
        [attr.aria-invalid]="invalid('signerPartyId') ? 'true' : null"
        [attr.aria-describedby]="
          invalid('signerPartyId') ? errorId('signerPartyId') : null
        "
      />
      @if (invalid('signerPartyId')) {
        <p [id]="errorId('signerPartyId')" role="alert">signer_party_id</p>
      }

      <label>
        <input
          type="checkbox"
          formControlName="legitimacyConfirmed"
          [attr.aria-invalid]="invalid('legitimacyConfirmed') ? 'true' : null"
          [attr.aria-describedby]="
            invalid('legitimacyConfirmed')
              ? errorId('legitimacyConfirmed')
              : null
          "
        />
        {{ legitimacyKey | stynxTranslate }}
      </label>
      @if (invalid('legitimacyConfirmed')) {
        <p [id]="errorId('legitimacyConfirmed')" role="alert">
          {{ legitimacyKey | stynxTranslate }}
        </p>
      }

      <button
        *stynxHasPermission="withdrawPermission"
        type="button"
        data-action="withdraw"
        [disabled]="offline() || afterDecision()"
        (click)="requestWithdraw()"
      >
        {{ cmdWithdrawKey | stynxTranslate }}
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
export class WithdrawalsPageComponent {
  readonly facade = inject(ProtocolFacade);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly sse = inject(SseService);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private focused = false;

  readonly screen = screenOf(inject(ActivatedRoute));
  readonly titleKey = TITLE_KEY;
  readonly introKey = INTRO_KEY;
  readonly emptyKey = EMPTY_KEY;
  readonly loadingKey = LOADING_KEY;
  readonly cmdWithdrawKey = CMD_WITHDRAW_KEY;
  readonly fieldTermKey = FIELD_TERM_KEY;
  readonly afterDecisionKey = AFTER_DECISION_KEY;
  readonly searchKey = SEARCH_KEY;
  readonly legitimacyKey = LEGITIMACY_KEY;
  readonly confirmTitleKey = CONFIRM_TITLE_KEY;
  readonly termKinds = TERM_KINDS;
  readonly withdrawPermission = permissionKeyOf('rait-case:withdraw');
  readonly confirm = createConfirmQueue();
  readonly termUpload = signal<DocumentUploadRequest | null>(null);
  private readonly attempted = signal(false);

  /** Spec §9 "Desistência": termo assinado e legitimidade obrigatórios. */
  readonly form = this.fb.group({
    protocol: this.fb.control('', Validators.required),
    termDocumentId: this.fb.control('', Validators.required),
    signerPartyId: this.fb.control('', Validators.required),
    legitimacyConfirmed: this.fb.control(false, Validators.requiredTrue),
  });

  readonly offline = computed(
    () => this.facade.desistenciaCaso.status() === 'offline',
  );
  readonly afterDecision = computed(() => {
    const state = this.facade.desistenciaCaso.value()?.state;
    return state !== undefined && AFTER_DECISION_STATES.has(state);
  });

  constructor() {
    this.sse.connect();
    afterRenderEffect(() => {
      const heading = this.heading()?.nativeElement;
      untracked(() => {
        if (!this.focused) {
          this.focused = true;
          heading?.focus();
        }
      });
    });
  }

  invalid(field: keyof WithdrawalsPageComponent['form']['controls']): boolean {
    return this.attempted() && this.form.controls[field].invalid;
  }

  errorId(field: string): string {
    return `${ERROR_ID_PREFIX}${field}`;
  }

  findCase(): void {
    const protocol = this.form.controls.protocol.value.trim();
    if (protocol.length === 0) return;
    void this.facade.findCaseByProtocol(protocol);
  }

  submit(): void {
    this.attempted.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid || this.afterDecision()) return;
    this.requestWithdraw();
  }

  /** Confirmação `confirm.withdraw` (guia §3.3) → `rait-case:withdraw` no caso encontrado. */
  requestWithdraw(): void {
    const caseId = this.facade.desistenciaCaso.value()?.id ?? '';
    const termDocumentId = this.form.controls.termDocumentId.value;
    this.confirm.request({
      action: 'withdraw',
      confirmKey: CONFIRM_WITHDRAW_KEY,
      labelKey: CMD_WITHDRAW_KEY,
      run: () =>
        this.facade.withdraw(
          caseId,
          provisionalBody<CommandBody & { withdrawal_document_id: string }>({
            ...(termDocumentId.length > 0
              ? { withdrawal_document_id: termDocumentId }
              : {}),
          }),
        ),
    });
  }
}
