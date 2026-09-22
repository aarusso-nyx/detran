// T-24 Lote de sorteio (ficha IU-RAIT-029; contrato CTG-0002b §6.1 linha 28): `SessionFacade.
// loadBatch(loteId)` → `lote` (lote, itens, impedimentos, casos) no `BatchDrawViewer`
// (`field.seed` = semente em `<code>`; `claim_due_on` com o rótulo do timer `T-CLAIM`, sem base
// legal); ação `rait-batch:approve` sob `*stynxHasPermission` (M4) com confirmação
// `confirm.approve` → `facade.approveBatch` (M8). `state.claim_expired` NÃO é renderizado nesta
// CTG: "expirado" exige comparar datas — só o servidor (OD-R12-022). A linha do tempo do caso
// selecionado (`CaseFacade.loadEvents`) fica para a composição das facades (relatório TASK-0015).
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
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
import { SessionFacade } from '../../../data/facades/session.facade';
import { permissionKeyOf } from '../../../data/models';
import { BatchDrawViewerComponent } from '../../../shared/batch-draw-viewer.component';
import { PageStateComponent } from '../../../shared/page-state.component';
import { screenOf } from '../../../shared/route-screen';
import { StreamStatusBannerComponent } from '../../../shared/stream-status-banner.component';
import {
  CONFIRM_TITLE_KEY,
  EMPTY_KEY,
  LOADING_KEY,
  createConfirmQueue,
} from '../../page-support';
import { batchIdOf } from '../colegiado-route';

const TITLE_KEY = 'rait.screens.colegiado-orgao-distribuicao-loteId.title';
const INTRO_KEY = 'rait.screens.colegiado-orgao-distribuicao-loteId.intro';
const CMD_APPROVE_KEY =
  'rait.screens.colegiado-orgao-distribuicao-loteId.cmd.approve';
const CONFIRM_APPROVE_KEY =
  'rait.screens.colegiado-orgao-distribuicao-loteId.confirm.approve';
const FIELD_SEED_KEY =
  'rait.screens.colegiado-orgao-distribuicao-loteId.field.seed';
/** Reservado ao servidor (OD-R12-022): a chave espera o token do contrato; não renderizado. */
export const CLAIM_EXPIRED_STATE_KEY =
  'rait.screens.colegiado-orgao-distribuicao-loteId.state.claim_expired';

@Component({
  selector: 'rait-batch-detail-page',
  imports: [
    StynxTranslatePipe,
    StynxHasPermissionDirective,
    StynxConfirmDialogComponent,
    StreamStatusBannerComponent,
    PageStateComponent,
    BatchDrawViewerComponent,
    RaitErrorBannerComponent,
  ],
  providers: provideRaitI18nFallback(),
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-screen]': 'screen',
    '[attr.data-batch-id]': 'batchId',
    '[attr.data-status]': 'facade.lote.status()',
  },
  template: `
    <h1 #heading tabindex="-1">{{ titleKey | stynxTranslate }}</h1>
    <rait-stream-status-banner />
    <p>{{ introKey | stynxTranslate }}</p>

    <rait-page-state
      [status]="facade.lote.status()"
      [error]="facade.lote.error()"
      [loadingLabelKey]="loadingKey"
      [emptyLabelKey]="emptyKey"
      (retry)="reload()"
    />

    @if (facade.command.error(); as error) {
      <rait-error-banner [error]="error" />
    }

    @if (facade.lote.value(); as bundle) {
      <p data-seed>
        <span>{{ fieldSeedKey | stynxTranslate }}</span>
        <code>{{ bundle.batch.seed ?? '' }}</code>
      </p>
      <rait-batch-draw-viewer
        [batch]="bundle.batch"
        [items]="bundle.items"
        [cases]="bundle.cases"
        [impediments]="bundle.impediments"
      />
    }

    <button
      *stynxHasPermission="approvePermission"
      type="button"
      data-action="approve"
      [disabled]="offline() || facade.lote.value() === null"
      (click)="requestApprove()"
    >
      {{ cmdApproveKey | stynxTranslate }}
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
export class BatchDetailPageComponent {
  readonly facade = inject(SessionFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly sse = inject(SseService);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private focused = false;

  readonly screen = screenOf(this.route);
  readonly batchId = batchIdOf(this.route);
  readonly titleKey = TITLE_KEY;
  readonly introKey = INTRO_KEY;
  readonly emptyKey = EMPTY_KEY;
  readonly loadingKey = LOADING_KEY;
  readonly cmdApproveKey = CMD_APPROVE_KEY;
  readonly fieldSeedKey = FIELD_SEED_KEY;
  readonly confirmTitleKey = CONFIRM_TITLE_KEY;
  readonly approvePermission = permissionKeyOf('rait-batch:approve');
  readonly confirm = createConfirmQueue();
  readonly offline = computed(() => this.facade.lote.status() === 'offline');

  constructor() {
    this.sse.connect();
    void this.facade.loadBatch(this.batchId);
    afterRenderEffect(() => {
      const status = this.facade.lote.status();
      const heading = this.heading()?.nativeElement;
      untracked(() => {
        if (!this.focused && (status === 'ready' || status === 'empty')) {
          this.focused = true;
          heading?.focus();
        }
      });
    });
  }

  requestApprove(): void {
    this.confirm.request({
      action: 'approve',
      confirmKey: CONFIRM_APPROVE_KEY,
      labelKey: CMD_APPROVE_KEY,
      run: () => this.facade.approveBatch(this.batchId, {}),
    });
  }

  reload(): void {
    void this.facade.loadBatch(this.batchId);
  }
}
