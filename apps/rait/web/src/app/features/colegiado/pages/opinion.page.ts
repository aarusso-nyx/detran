// T-26 Parecer e voto do relator (ficha IU-RAIT-031; contrato CTG-0002b §6.1 linha 30;
// [UC-RAIT-004]): `CaseFacade.loadCaseBundle(caseId)` + `loadDocuments` (`DossierViewer`,
// `DeadlineChip` T-VOTO de `prazos`) e `SessionFacade.loadAgendaItemOfCase(caseId)` → `itemDoCaso`;
// `OpinionEditor` (formulário `parecer-voto`: `summary`, `analysis`, `vote` obrigatório —
// `field.summary/analysis/vote`); ação `rait-opinion:register` sob `*stynxHasPermission` (M4) com
// confirmação `confirm.register` (guia §3.3) → `facade.registerOpinion` (M8); a autoria do
// parecer é explícita (spec §10.3).
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
import { CaseFacade } from '../../../data/facades/case.facade';
import { SessionFacade } from '../../../data/facades/session.facade';
import { permissionKeyOf, type RaitDeadline } from '../../../data/models';
import { DeadlineChipComponent } from '../../../shared/deadline-chip.component';
import { DossierViewerComponent } from '../../../shared/dossier-viewer.component';
import {
  EMPTY_OPINION,
  OpinionEditorComponent,
  type OpinionContent,
  type OpinionFieldLabelKeys,
} from '../../../shared/opinion-editor.component';
import { PageStateComponent } from '../../../shared/page-state.component';
import { screenOf } from '../../../shared/route-screen';
import { StreamStatusBannerComponent } from '../../../shared/stream-status-banner.component';
import {
  CONFIRM_TITLE_KEY,
  EMPTY_KEY,
  LOADING_KEY,
  combineStatus,
  createConfirmQueue,
} from '../../page-support';
import { caseIdOf } from '../colegiado-route';

const SLUG = 'rait.screens.colegiado-orgao-relatoria-caseId-voto';
const TITLE_KEY = `${SLUG}.title`;
const CMD_REGISTER_KEY =
  'rait.screens.colegiado-orgao-relatoria-caseId-voto.cmd.register';
const CONFIRM_REGISTER_KEY =
  'rait.screens.colegiado-orgao-relatoria-caseId-voto.confirm.register';
const FIELD_LABEL_KEYS: OpinionFieldLabelKeys = {
  summary: 'rait.screens.colegiado-orgao-relatoria-caseId-voto.field.summary',
  analysis: 'rait.screens.colegiado-orgao-relatoria-caseId-voto.field.analysis',
  vote: 'rait.screens.colegiado-orgao-relatoria-caseId-voto.field.vote',
};
/** Timer operacional do voto (ficha 031; §6.1 linha 13). */
const VOTE_TIMER = 'T-VOTO';

@Component({
  selector: 'rait-opinion-page',
  imports: [
    StynxTranslatePipe,
    StynxHasPermissionDirective,
    StynxConfirmDialogComponent,
    StreamStatusBannerComponent,
    PageStateComponent,
    OpinionEditorComponent,
    DossierViewerComponent,
    DeadlineChipComponent,
    RaitErrorBannerComponent,
  ],
  providers: provideRaitI18nFallback(),
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-screen]': 'screen',
    '[attr.data-case-id]': 'caseId',
    '[attr.data-status]': 'status()',
  },
  template: `
    <h1 #heading tabindex="-1">{{ titleKey | stynxTranslate }}</h1>
    <rait-stream-status-banner />

    <rait-page-state
      [status]="status()"
      [error]="cases.caso.error() ?? sessions.itemDoCaso.error()"
      [loadingLabelKey]="loadingKey"
      [emptyLabelKey]="emptyKey"
      (retry)="reload()"
    />

    @if (sessions.command.error(); as error) {
      <rait-error-banner [error]="error" />
    }

    @if (voteDeadline(); as deadline) {
      <rait-deadline-chip
        [timerCode]="deadline.timer_code"
        [dueOn]="deadline.due_on"
        [legalBasis]="deadline.legal_basis"
        kind="operacional"
      />
    }

    @if (cases.caso.value()) {
      <rait-dossier-viewer
        [documents]="cases.documentos.items()"
        [status]="cases.documentos.status()"
      />
    }

    <rait-opinion-editor
      [item]="sessions.itemDoCaso.value()"
      [fieldLabelKeys]="fieldLabelKeys"
      [disabled]="offline()"
      [(opinion)]="opinion"
      (submit)="requestRegister()"
    />
    <button
      *stynxHasPermission="registerPermission"
      type="button"
      data-action="register"
      [disabled]="offline() || !complete()"
      (click)="requestRegister()"
    >
      {{ cmdRegisterKey | stynxTranslate }}
    </button>

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
export class OpinionPageComponent {
  readonly cases = inject(CaseFacade);
  readonly sessions = inject(SessionFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly sse = inject(SseService);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private focused = false;

  readonly screen = screenOf(this.route);
  readonly caseId = caseIdOf(this.route);
  readonly titleKey = TITLE_KEY;
  readonly emptyKey = EMPTY_KEY;
  readonly loadingKey = LOADING_KEY;
  readonly cmdRegisterKey = CMD_REGISTER_KEY;
  readonly confirmTitleKey = CONFIRM_TITLE_KEY;
  readonly fieldLabelKeys = FIELD_LABEL_KEYS;
  readonly registerPermission = permissionKeyOf('rait-opinion:register');
  readonly confirm = createConfirmQueue();
  readonly opinion = signal<OpinionContent>(EMPTY_OPINION);

  readonly status = computed(() =>
    combineStatus(this.cases.caso.status(), this.sessions.itemDoCaso.status()),
  );
  readonly offline = computed(() => this.cases.caso.status() === 'offline');
  readonly voteDeadline = computed<RaitDeadline | null>(
    () =>
      this.cases.prazos
        .items()
        .find((deadline) => deadline.timer_code === VOTE_TIMER) ?? null,
  );
  /** Forma mínima (spec §9): resumo, análise e voto obrigatório. */
  readonly complete = computed(() => {
    const value = this.opinion();
    return (
      value.summary.trim().length > 0 &&
      value.analysis.trim().length > 0 &&
      value.vote !== null
    );
  });

  constructor() {
    this.sse.connect({ caseId: this.caseId });
    void this.cases.loadCaseBundle(this.caseId);
    void this.cases.loadDocuments(this.caseId);
    void this.sessions.loadAgendaItemOfCase(this.caseId);
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

  /** Voto obrigatório (forma) antes da confirmação `confirm.register`. */
  requestRegister(): void {
    if (!this.complete()) return;
    const value = this.opinion();
    const itemId = this.sessions.itemDoCaso.value()?.id ?? '';
    this.confirm.request({
      action: 'register',
      confirmKey: CONFIRM_REGISTER_KEY,
      labelKey: CMD_REGISTER_KEY,
      run: () =>
        this.sessions.registerOpinion(itemId, {
          opinion_summary: value.summary.trim(),
          opinion_analysis: value.analysis.trim(),
          opinion_vote: value.vote,
        }),
    });
  }

  reload(): void {
    void this.cases.loadCaseBundle(this.caseId);
    void this.sessions.loadAgendaItemOfCase(this.caseId);
  }
}
