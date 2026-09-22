// T-09 Minuta (ficha IU-RAIT-011; contrato CTG-0002b §6.1 linha 11; IU-RAIT-001 §3 "quem instrui
// não assina"): `CaseFacade.loadDrafts(id)` → `minutas` no `MinutaEditor` (versão mais recente =
// primeira recebida; `model content` = formulário `minuta`: `facts`, `grounds`, `ruling`);
// `rait-case:submit-draft` sob `*stynxHasPermission` (M4) com confirmação `confirm.submit` (guia
// §3.3) → `facade.submitDraft` (M8). Com a minuta mais recente `submetida` mostra
// `state.awaiting-signature`.
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
  type CreateRaitDraftDto,
  type RaitDraft,
} from '../../../data/models';
import {
  EMPTY_MINUTA,
  MinutaEditorComponent,
  type MinutaContent,
} from '../../../shared/minuta-editor.component';
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

const TITLE_KEY = 'rait.screens.casos-id-minuta.title';
const INTRO_KEY = 'rait.screens.casos-id-minuta.intro';
const CMD_SUBMIT_KEY = 'rait.screens.casos-id-minuta.cmd.submit';
const CONFIRM_SUBMIT_KEY = 'rait.screens.casos-id-minuta.confirm.submit';
const AWAITING_SIGNATURE_KEY =
  'rait.screens.casos-id-minuta.state.awaiting-signature';
const SUBMITTED_STATUS: RaitDraft['status'] = 'submetida';

@Component({
  selector: 'rait-draft-page',
  imports: [
    StynxTranslatePipe,
    StynxHasPermissionDirective,
    StynxConfirmDialogComponent,
    StreamStatusBannerComponent,
    PageStateComponent,
    MinutaEditorComponent,
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
      [error]="facade.caso.error() ?? facade.minutas.error()"
      [loadingLabelKey]="loadingKey"
      [emptyLabelKey]="emptyKey"
      (retry)="reload()"
    />

    @if (facade.command.error(); as error) {
      <rait-error-banner [error]="error" />
    }

    @if (awaitingSignature()) {
      <p role="status" data-state="awaiting-signature">
        {{ awaitingSignatureKey | stynxTranslate }}
      </p>
    }

    @if (facade.caso.value()) {
      <rait-minuta-editor
        [draft]="latestDraft()"
        [versions]="facade.minutas.items()"
        [disabled]="offline() || awaitingSignature()"
        [(content)]="content"
        (submit)="requestSubmit()"
      />
      <button
        *stynxHasPermission="submitPermission"
        type="button"
        data-action="submit"
        [disabled]="offline() || awaitingSignature() || !complete()"
        (click)="requestSubmit()"
      >
        {{ cmdSubmitKey | stynxTranslate }}
      </button>
    }

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
export class DraftPageComponent {
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
  readonly cmdSubmitKey = CMD_SUBMIT_KEY;
  readonly awaitingSignatureKey = AWAITING_SIGNATURE_KEY;
  readonly confirmTitleKey = CONFIRM_TITLE_KEY;
  readonly submitPermission = permissionKeyOf('rait-case:submit-draft');
  readonly confirm = createConfirmQueue();
  readonly content = signal<MinutaContent>(EMPTY_MINUTA);

  readonly status = computed(() =>
    combineStatus(this.facade.caso.status(), this.facade.minutas.status()),
  );
  readonly offline = computed(() => this.facade.minutas.status() === 'offline');
  /** Ordem recebida ("most recent first" do contrato): a primeira é a versão mais recente. */
  readonly latestDraft = computed<RaitDraft | null>(
    () => this.facade.minutas.items()[0] ?? null,
  );
  /** Token `status` da minuta mais recente (leitura, não regra). */
  readonly awaitingSignature = computed(() => {
    const draftStatus = this.latestDraft()?.status ?? null;
    return draftStatus === SUBMITTED_STATUS;
  });
  /** Forma mínima do formulário `minuta` (§9): fatos, fundamentos e dispositivo. */
  readonly complete = computed(() => {
    const content = this.content();
    return (
      content.facts.trim().length > 0 &&
      content.grounds.trim().length > 0 &&
      content.ruling !== null
    );
  });

  constructor() {
    void this.facade.loadCaseBundle(this.caseId);
    void this.facade.loadDrafts(this.caseId);
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

  /** Confirmação `confirm.submit` antes de `rait-case:submit-draft`. O conteúdo editado
   * (`content()`: fatos, fundamentos, dispositivo) só viaja no contrato `.commands` de R-0007
   * CTG-0004 — o DTO CRUD provisório não o guarda (OD-R12-029; M8). */
  requestSubmit(): void {
    this.confirm.request({
      action: 'submit',
      confirmKey: CONFIRM_SUBMIT_KEY,
      labelKey: CMD_SUBMIT_KEY,
      run: () =>
        this.facade.submitDraft(
          this.caseId,
          provisionalBody<CreateRaitDraftDto>({
            case_id: this.caseId,
            status: SUBMITTED_STATUS,
            ...(this.latestDraft() !== null
              ? { document_id: this.latestDraft()?.document_id ?? null }
              : {}),
          }),
        ),
    });
  }

  reload(): void {
    void this.facade.loadCaseBundle(this.caseId);
    void this.facade.loadDrafts(this.caseId);
  }
}
