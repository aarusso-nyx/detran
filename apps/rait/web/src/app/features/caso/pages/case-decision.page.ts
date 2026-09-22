// T-10 Decisão da autoridade — aba do caso (ficha IU-RAIT-012; contrato CTG-0002b §6.1 linha
// 12; nome OD-R12-028; [UC-RAIT-016]): o `DecisionPanel` recebe o caso (bundle do layout),
// a minuta mais recente, documentos, admissibilidade, o prazo `T-DEC` e a decisão já assinada;
// `decide` → confirmação `confirm.accept`/`confirm.reject` conforme `kind` (guia §3.3; a frase
// do efeito jurídico é da ficha §6) → `facade.signDecision` (M8); `returnDraft` →
// `confirm.return-draft` → `facade.returnDraft`; `declareImpediment` (do painel ou do botão
// `cmd.declare-impediment`) → `ImpedimentDialog` (`confirm.declare-impediment`) →
// `facade.declareImpediment`. Papéis: `*stynxHasPermission` com as chaves de
// `RAIT_COMMAND_RULES` (M4; divergência ficha × §7 em OD-R12-026). Leitura pela `CaseFacade` (a
// aba reutiliza o bundle do layout; a `SigningFacade` da §6.1 serve a `/assinatura/:caseId`).
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
import { CaseFacade } from '../../../data/facades/case.facade';
import {
  permissionKeyOf,
  type CreateRaitDecisionDto,
  type CreateRaitImpedimentDto,
  type RaitDeadline,
  type RaitDecision,
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
import { LegalBasisTooltipComponent } from '../../../shared/legal-basis-tooltip.component';
import { PageStateComponent } from '../../../shared/page-state.component';
import { screenOf } from '../../../shared/route-screen';
import { StreamStatusBannerComponent } from '../../../shared/stream-status-banner.component';
import {
  CONFIRM_TITLE_KEY,
  EMPTY_KEY,
  LOADING_KEY,
  combineStatus,
  createConfirmQueue,
  provisionalBody,
} from '../../page-support';
import { caseIdOf } from '../case-route';

const TITLE_KEY = 'rait.screens.casos-id-decisao.title';
const INTRO_KEY = 'rait.screens.casos-id-decisao.intro';
const CMD_ACCEPT_KEY = 'rait.screens.casos-id-decisao.cmd.accept';
const CMD_REJECT_KEY = 'rait.screens.casos-id-decisao.cmd.reject';
const CMD_RETURN_DRAFT_KEY = 'rait.screens.casos-id-decisao.cmd.return-draft';
const CMD_DECLARE_IMPEDIMENT_KEY =
  'rait.screens.casos-id-decisao.cmd.declare-impediment';
const CONFIRM_ACCEPT_KEY = 'rait.screens.casos-id-decisao.confirm.accept';
const CONFIRM_REJECT_KEY = 'rait.screens.casos-id-decisao.confirm.reject';
const CONFIRM_RETURN_DRAFT_KEY =
  'rait.screens.casos-id-decisao.confirm.return-draft';
const CONFIRM_DECLARE_IMPEDIMENT_KEY =
  'rait.screens.casos-id-decisao.confirm.declare-impediment';
const GROUNDS_KEY = 'rait.common.grounds';
/** Prazo legal da decisão (ficha 012; §6.1 linha 13). */
const DECISION_TIMER = 'T-DEC';
const ACCEPTED_KIND: DecisionDraft['kind'] = 'acolhida';

@Component({
  selector: 'rait-case-decision-page',
  imports: [
    StynxTranslatePipe,
    StynxHasPermissionDirective,
    StynxConfirmDialogComponent,
    StreamStatusBannerComponent,
    PageStateComponent,
    DecisionPanelComponent,
    ImpedimentDialogComponent,
    LegalBasisTooltipComponent,
    RaitErrorBannerComponent,
  ],
  providers: provideRaitI18nFallback(),
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-screen]': 'screen',
    '[attr.data-status]': 'status()',
  },
  template: `
    <h1 #heading tabindex="-1">{{ titleKey | stynxTranslate }}</h1>
    <rait-stream-status-banner />
    <p>{{ introKey | stynxTranslate }}</p>

    <rait-page-state
      [status]="status()"
      [error]="facade.caso.error() ?? facade.decisao.error()"
      [loadingLabelKey]="loadingKey"
      [emptyLabelKey]="emptyKey"
      (retry)="reload()"
    />

    @if (facade.command.error(); as error) {
      <rait-error-banner [error]="error" />
    }

    @if (facade.caso.value(); as kase) {
      @if (deadline(); as deadline) {
        <rait-legal-basis-tooltip [legalBasis]="deadline.legal_basis" />
      }
      <rait-decision-panel
        [case]="kase"
        [draft]="latestDraft()"
        [documents]="facade.documentos.items()"
        [admissibility]="facade.admissibilidade.items()"
        [deadline]="deadline()"
        [decision]="decision()"
        [disabled]="offline()"
        [groundsLabelKey]="groundsKey"
        (decide)="requestDecide($event)"
        (returnDraft)="requestReturnDraft($event.guidance)"
        (declareImpediment)="impedimentOpen.set(true)"
      />
      <button
        *stynxHasPermission="impedimentPermission"
        type="button"
        data-action="declare-impediment"
        [disabled]="offline()"
        (click)="impedimentOpen.set(true)"
      >
        {{ cmdDeclareImpedimentKey | stynxTranslate }}
      </button>
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
export class CaseDecisionPageComponent {
  readonly facade = inject(CaseFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private focused = false;

  readonly screen = screenOf(this.route);
  readonly caseId = caseIdOf(this.route);
  readonly titleKey = TITLE_KEY;
  readonly introKey = INTRO_KEY;
  readonly emptyKey = EMPTY_KEY;
  readonly loadingKey = LOADING_KEY;
  readonly groundsKey = GROUNDS_KEY;
  readonly cmdDeclareImpedimentKey = CMD_DECLARE_IMPEDIMENT_KEY;
  readonly confirmDeclareImpedimentKey = CONFIRM_DECLARE_IMPEDIMENT_KEY;
  readonly confirmTitleKey = CONFIRM_TITLE_KEY;
  readonly impedimentPermission = permissionKeyOf('rait-impediment:declare');
  readonly confirm = createConfirmQueue();
  readonly impedimentOpen = signal(false);

  readonly status = computed(() =>
    combineStatus(this.facade.caso.status(), this.facade.minutas.status()),
  );
  readonly offline = computed(() => this.facade.caso.status() === 'offline');
  readonly latestDraft = computed<RaitDraft | null>(
    () => this.facade.minutas.items()[0] ?? null,
  );
  readonly decision = computed<RaitDecision | null>(
    () => this.facade.decisao.items()[0] ?? null,
  );
  readonly deadline = computed<RaitDeadline | null>(
    () =>
      this.facade.prazos
        .items()
        .find((item) => item.timer_code === DECISION_TIMER) ?? null,
  );

  constructor() {
    void this.facade.loadCaseBundle(this.caseId);
    void this.facade.loadDrafts(this.caseId);
    void this.facade.loadDocuments(this.caseId);
    void this.facade.loadAdmissibility(this.caseId);
    void this.facade.loadDecisions(this.caseId);
    afterRenderEffect(() => {
      const status = this.status();
      const heading = this.heading()?.nativeElement;
      untracked(() => {
        if (!this.focused && (status === 'ready' || status === 'empty')) {
          this.focused = true;
          heading?.focus();
        }
      });
    });
  }

  /** `cmd.accept`/`cmd.reject` = o mesmo comando `rait-decision:sign` com `decision_kind`. */
  requestDecide(draft: DecisionDraft): void {
    const accepted = draft.kind === ACCEPTED_KIND;
    this.confirm.request({
      action: accepted ? 'accept' : 'reject',
      confirmKey: accepted ? CONFIRM_ACCEPT_KEY : CONFIRM_REJECT_KEY,
      labelKey: accepted ? CMD_ACCEPT_KEY : CMD_REJECT_KEY,
      run: () =>
        this.facade.signDecision(
          this.caseId,
          provisionalBody<CreateRaitDecisionDto>({
            case_id: this.caseId,
            decision_kind: draft.kind,
            grounds: draft.grounds,
          }),
        ),
    });
  }

  requestReturnDraft(guidance: string): void {
    this.confirm.request({
      action: 'return-draft',
      confirmKey: CONFIRM_RETURN_DRAFT_KEY,
      labelKey: CMD_RETURN_DRAFT_KEY,
      run: () =>
        this.facade.returnDraft(this.caseId, { return_guidance: guidance }),
    });
  }

  /** O `ImpedimentDialog` já exibe a frase do efeito jurídico (`messageKey`) antes de confirmar. */
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
    void this.facade.loadCaseBundle(this.caseId);
    void this.facade.loadDrafts(this.caseId);
    void this.facade.loadDecisions(this.caseId);
  }
}
