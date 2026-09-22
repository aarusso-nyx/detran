// T-07 Decisão da autoridade (ficha IU-RAIT-026; contrato CTG-0002b §6.1 linha 25; [UC-RAIT-016]):
// `SigningFacade.loadSigningCase(caseId)` → `caso` (bundle: caso, minutas, documentos,
// admissibilidade, prazos, decisão); `DecisionPanel` (formulário `decisao-autoridade`: `kind`,
// `grounds` = `field.grounds`), `DossierViewer`/`MinutaEditor` (somente leitura, dentro do
// painel), `DeadlineChip` T-DEC, `SignatureDialog` (frase `confirm.sign`; assinatura PAdES
// pendente — spec §11), `ReturnToReviewerDialog` (= confirmação `confirm.return_draft` com a
// orientação do painel), `ImpedimentDialog` (`confirm.declare_impediment`). Barra de ações da
// ficha (`cmd.sign`, `cmd.return_draft`, `cmd.declare_impediment`) sob `*stynxHasPermission`
// (M4; divergência ficha × §7 em OD-R12-026), sobre o formulário do painel;
// `state.already_signed` quando `decision ≠ null`. Comandos M8 → `rait-error-banner`.
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
import { ActivatedRoute } from '@angular/router';
import { StynxTranslatePipe } from '@detran/ui';
import { StynxHasPermissionDirective } from '@stynx-nyx/angular-auth';
import { StynxConfirmDialogComponent } from '@stynx-nyx/angular-ui';
import { RaitErrorBannerComponent } from '../../../core/error-boundary';
import { provideRaitI18nFallback } from '../../../core/i18n-fallback';
import { SseService } from '../../../core/sse.service';
import { SigningFacade } from '../../../data/facades/signing.facade';
import {
  permissionKeyOf,
  type CreateRaitDecisionDto,
  type CreateRaitImpedimentDto,
  type RaitDeadline,
  type RaitDraft,
} from '../../../data/models';
import {
  DecisionPanelComponent,
  type DecisionDraft,
} from '../../../shared/decision-panel.component';
import {
  ImpedimentDialogComponent,
  type ImpedimentDraft,
} from '../../../shared/impediment-dialog.component';
import { PageStateComponent } from '../../../shared/page-state.component';
import { screenOf } from '../../../shared/route-screen';
import { SignatureDialogComponent } from '../../../shared/signature-dialog.component';
import { StreamStatusBannerComponent } from '../../../shared/stream-status-banner.component';
import {
  CONFIRM_TITLE_KEY,
  EMPTY_KEY,
  LOADING_KEY,
  createConfirmQueue,
  provisionalBody,
} from '../../page-support';
import { routeParam } from '../../route-params';

const TITLE_KEY = 'rait.screens.assinatura-caseId.title';
const CMD_SIGN_KEY = 'rait.screens.assinatura-caseId.cmd.sign';
const CMD_RETURN_DRAFT_KEY = 'rait.screens.assinatura-caseId.cmd.return_draft';
const CMD_DECLARE_IMPEDIMENT_KEY =
  'rait.screens.assinatura-caseId.cmd.declare_impediment';
const CONFIRM_SIGN_KEY = 'rait.screens.assinatura-caseId.confirm.sign';
const CONFIRM_RETURN_DRAFT_KEY =
  'rait.screens.assinatura-caseId.confirm.return_draft';
const CONFIRM_DECLARE_IMPEDIMENT_KEY =
  'rait.screens.assinatura-caseId.confirm.declare_impediment';
const FIELD_GROUNDS_KEY = 'rait.screens.assinatura-caseId.field.grounds';
const ALREADY_SIGNED_KEY =
  'rait.screens.assinatura-caseId.state.already_signed';
const CASE_ID_PARAM = 'caseId';
const DECISION_TIMER = 'T-DEC';

@Component({
  selector: 'rait-signing-decision-page',
  imports: [
    StynxTranslatePipe,
    StynxHasPermissionDirective,
    StynxConfirmDialogComponent,
    StreamStatusBannerComponent,
    PageStateComponent,
    DecisionPanelComponent,
    SignatureDialogComponent,
    ImpedimentDialogComponent,
    RaitErrorBannerComponent,
  ],
  providers: provideRaitI18nFallback(),
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-screen]': 'screen',
    '[attr.data-case-id]': 'caseId',
    '[attr.data-status]': 'facade.caso.status()',
  },
  template: `
    <h1 #heading tabindex="-1">{{ titleKey | stynxTranslate }}</h1>
    <rait-stream-status-banner />

    <rait-page-state
      [status]="facade.caso.status()"
      [error]="facade.caso.error()"
      [loadingLabelKey]="loadingKey"
      [emptyLabelKey]="emptyKey"
      (retry)="reload()"
    />

    @if (facade.command.error(); as error) {
      <rait-error-banner [error]="error" />
    }

    @if (facade.caso.value(); as bundle) {
      @if (bundle.decision === null) {
        <div class="rait-signing-decision__actions" role="toolbar">
          <button
            *stynxHasPermission="signPermission"
            type="button"
            data-action="sign"
            [disabled]="offline() || !panelComplete()"
            (click)="requestSign()"
          >
            {{ cmdSignKey | stynxTranslate }}
          </button>
          <button
            *stynxHasPermission="returnDraftPermission"
            type="button"
            data-action="return-draft"
            [disabled]="offline() || !panelGuidance()"
            (click)="requestReturnDraft()"
          >
            {{ cmdReturnDraftKey | stynxTranslate }}
          </button>
          <button
            *stynxHasPermission="impedimentPermission"
            type="button"
            data-action="declare-impediment"
            [disabled]="offline()"
            (click)="impedimentOpen.set(true)"
          >
            {{ cmdDeclareImpedimentKey | stynxTranslate }}
          </button>
        </div>
      }
      <rait-decision-panel
        [case]="bundle.case"
        [draft]="latestDraft()"
        [documents]="bundle.documents"
        [admissibility]="bundle.admissibility"
        [deadline]="deadline()"
        [decision]="bundle.decision"
        [disabled]="offline()"
        [stateLabelKey]="alreadySignedKey"
        [groundsLabelKey]="fieldGroundsKey"
        (decide)="requestSign($event)"
        (returnDraft)="requestReturnDraft($event.guidance)"
        (declareImpediment)="impedimentOpen.set(true)"
      />
    }

    @if (signPending(); as draft) {
      <rait-signature-dialog
        [open]="true"
        [titleKey]="cmdSignKey"
        [messageKey]="confirmSignKey"
        (confirmed)="sign(draft)"
        (dismissed)="signPending.set(null)"
      />
    }

    <rait-impediment-dialog
      [(open)]="impedimentOpen"
      [titleKey]="cmdDeclareImpedimentKey"
      [messageKey]="confirmDeclareImpedimentKey"
      (confirmed)="declareImpediment($event)"
    />

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
export class SigningDecisionPageComponent {
  readonly facade = inject(SigningFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly sse = inject(SseService);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private readonly panel = viewChild(DecisionPanelComponent);
  private focused = false;

  readonly screen = screenOf(this.route);
  readonly caseId = routeParam(this.route, CASE_ID_PARAM);
  readonly titleKey = TITLE_KEY;
  readonly emptyKey = EMPTY_KEY;
  readonly loadingKey = LOADING_KEY;
  readonly cmdSignKey = CMD_SIGN_KEY;
  readonly cmdReturnDraftKey = CMD_RETURN_DRAFT_KEY;
  readonly cmdDeclareImpedimentKey = CMD_DECLARE_IMPEDIMENT_KEY;
  readonly confirmSignKey = CONFIRM_SIGN_KEY;
  readonly confirmDeclareImpedimentKey = CONFIRM_DECLARE_IMPEDIMENT_KEY;
  readonly fieldGroundsKey = FIELD_GROUNDS_KEY;
  readonly alreadySignedKey = ALREADY_SIGNED_KEY;
  readonly confirmTitleKey = CONFIRM_TITLE_KEY;
  readonly signPermission = permissionKeyOf('rait-decision:sign');
  readonly returnDraftPermission = permissionKeyOf(
    'rait-decision:return-draft',
  );
  readonly impedimentPermission = permissionKeyOf('rait-impediment:declare');
  readonly confirm = createConfirmQueue();
  readonly impedimentOpen = signal(false);
  /** Decisão aguardando a confirmação do `SignatureDialog`. */
  readonly signPending = signal<Partial<DecisionDraft> | null>(null);

  readonly offline = computed(() => this.facade.caso.status() === 'offline');
  readonly deadline = computed<RaitDeadline | null>(
    () =>
      this.facade.caso
        .value()
        ?.deadlines.find((item) => item.timer_code === DECISION_TIMER) ?? null,
  );
  /** Ordem recebida ("most recent first" do contrato): a primeira é a versão mais recente. */
  readonly latestDraft = computed<RaitDraft | null>(
    () => this.facade.caso.value()?.drafts[0] ?? null,
  );
  readonly panelComplete = computed(() => this.panel()?.complete() ?? false);
  readonly panelGuidance = computed(
    () => (this.panel()?.guidance().trim().length ?? 0) > 0,
  );

  constructor() {
    this.sse.connect({ caseId: this.caseId });
    void this.facade.loadSigningCase(this.caseId);
    afterRenderEffect(() => {
      const status = this.facade.caso.status();
      const heading = this.heading()?.nativeElement;
      untracked(() => {
        if (!this.focused && (status === 'ready' || status === 'empty')) {
          this.focused = true;
          heading?.focus();
        }
      });
    });
  }

  /** `cmd.sign` (barra) ou `decide` (painel): abre o `SignatureDialog` com a frase da ficha. */
  requestSign(draft?: DecisionDraft): void {
    const kind = this.panel()?.kind() ?? null;
    const grounds = this.panel()?.grounds().trim() ?? '';
    this.signPending.set(
      draft ?? {
        ...(kind !== null ? { kind } : {}),
        ...(grounds.length > 0 ? { grounds } : {}),
      },
    );
  }

  sign(draft: Partial<DecisionDraft>): void {
    this.signPending.set(null);
    void this.facade.signDecision(
      this.caseId,
      provisionalBody<CreateRaitDecisionDto>({
        case_id: this.caseId,
        ...(draft.kind !== undefined ? { decision_kind: draft.kind } : {}),
        ...(draft.grounds !== undefined ? { grounds: draft.grounds } : {}),
      }),
    );
  }

  /** `ReturnToReviewerDialog`: confirmação `confirm.return_draft` com a orientação do painel. */
  requestReturnDraft(guidance?: string): void {
    const text = guidance ?? this.panel()?.guidance().trim() ?? '';
    this.confirm.request({
      action: 'return-draft',
      confirmKey: CONFIRM_RETURN_DRAFT_KEY,
      labelKey: CMD_RETURN_DRAFT_KEY,
      run: () =>
        this.facade.returnDraft(this.caseId, { return_guidance: text }),
    });
  }

  declareImpediment(draft: ImpedimentDraft): void {
    void this.facade.declareImpediment(
      provisionalBody<CreateRaitImpedimentDto>({
        case_id: this.caseId,
        kind: draft.kind,
        basis: draft.basis,
        legal_basis: draft.legalBasis,
      }),
    );
  }

  reload(): void {
    void this.facade.loadSigningCase(this.caseId);
  }
}
