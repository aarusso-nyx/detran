// T-31 Ata (ficha IU-RAIT-036; contrato CTG-0002b §6.1 linha 35; [UC-RAIT-020]): `SessionFacade.
// loadSession(id)` → `sessao` (ata); `MinutesPreview` = metadados (`generated_at`, `signed_at`,
// `signed_by`, `published_at`, `document_hash`, `version`) — `minutes.content` não tem contrato
// de forma e não é renderizado (OD-R12-035); ações `rait-minutes:generate` (`confirm.generate`),
// `rait-minutes:sign` (`SignatureDialog` com `confirm.sign`; PAdES pendente — spec §11) e
// `rait-minutes:publish` (`confirm.publish`) sob `*stynxHasPermission` (M4; OD-R12-026) →
// `facade.<comando>` (M8); `state.not_ready` quando `session.state ≠ 'DECISAO_PROCLAMADA'` e
// `minutes == null` (leitura de tokens). Os prazos `T-R2` dos casos após a publicação (`CaseFacade`)
// ficam para a composição das facades (relatório TASK-0015).
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
import { StynxIntlDatePipe, StynxTranslatePipe } from '@detran/ui';
import { StynxHasPermissionDirective } from '@stynx-nyx/angular-auth';
import { StynxConfirmDialogComponent } from '@stynx-nyx/angular-ui';
import { RaitErrorBannerComponent } from '../../../core/error-boundary';
import { provideRaitI18nFallback } from '../../../core/i18n-fallback';
import { SseService } from '../../../core/sse.service';
import { SessionFacade } from '../../../data/facades/session.facade';
import {
  permissionKeyOf,
  type CreateRaitMinutesDto,
  type RaitMinutes,
  type RaitSessionState,
} from '../../../data/models';
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
import { sessionIdOf } from '../colegiado-route';

const TITLE_KEY = 'rait.screens.colegiado-orgao-sessoes-id-ata.title';
const CMD_GENERATE_KEY =
  'rait.screens.colegiado-orgao-sessoes-id-ata.cmd.generate';
const CMD_SIGN_KEY = 'rait.screens.colegiado-orgao-sessoes-id-ata.cmd.sign';
const CMD_PUBLISH_KEY =
  'rait.screens.colegiado-orgao-sessoes-id-ata.cmd.publish';
const CONFIRM_GENERATE_KEY =
  'rait.screens.colegiado-orgao-sessoes-id-ata.confirm.generate';
const CONFIRM_SIGN_KEY =
  'rait.screens.colegiado-orgao-sessoes-id-ata.confirm.sign';
const CONFIRM_PUBLISH_KEY =
  'rait.screens.colegiado-orgao-sessoes-id-ata.confirm.publish';
const NOT_READY_KEY =
  'rait.screens.colegiado-orgao-sessoes-id-ata.state.not_ready';
const VERSION_KEY = 'rait.common.version';
const PROCLAIMED: RaitSessionState = 'DECISAO_PROCLAMADA';

@Component({
  selector: 'rait-minutes-page',
  imports: [
    StynxTranslatePipe,
    StynxIntlDatePipe,
    StynxHasPermissionDirective,
    StynxConfirmDialogComponent,
    StreamStatusBannerComponent,
    PageStateComponent,
    SignatureDialogComponent,
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

    @if (notReady()) {
      <p role="status" data-state="not_ready">
        {{ notReadyKey | stynxTranslate }}
      </p>
    }

    @if (minutes(); as minutes) {
      <dl class="rait-minutes-preview" [attr.data-version]="minutes.version">
        <dt>{{ versionKey | stynxTranslate }}</dt>
        <dd>{{ minutes.version }}</dd>
        <dt>generated_at</dt>
        <dd>{{ minutes.generated_at | stynxIntlDate }}</dd>
        @if (minutes.signed_at; as signedAt) {
          <dt>signed_at</dt>
          <dd>{{ signedAt | stynxIntlDate }}</dd>
        }
        @if (minutes.signed_by; as signedBy) {
          <dt>signed_by</dt>
          <dd>
            <code>{{ signedBy }}</code>
          </dd>
        }
        @if (minutes.published_at; as publishedAt) {
          <dt>published_at</dt>
          <dd>{{ publishedAt | stynxIntlDate }}</dd>
        }
        @if (minutes.document_hash; as hash) {
          <dt>document_hash</dt>
          <dd>
            <code>{{ hash }}</code>
          </dd>
        }
      </dl>
    }

    <div class="rait-minutes__actions" role="toolbar">
      <button
        *stynxHasPermission="generatePermission"
        type="button"
        data-action="generate"
        [disabled]="offline()"
        (click)="requestGenerate()"
      >
        {{ cmdGenerateKey | stynxTranslate }}
      </button>
      <button
        *stynxHasPermission="signPermission"
        type="button"
        data-action="sign"
        [disabled]="offline() || minutes() === null"
        (click)="signPending.set(true)"
      >
        {{ cmdSignKey | stynxTranslate }}
      </button>
      <button
        *stynxHasPermission="publishPermission"
        type="button"
        data-action="publish"
        [disabled]="offline() || minutes() === null"
        (click)="requestPublish()"
      >
        {{ cmdPublishKey | stynxTranslate }}
      </button>
    </div>

    <stynx-confirm-dialog
      [open]="confirm.open()"
      [title]="confirmTitleKey | stynxTranslate"
      [message]="confirm.pending()?.confirmKey ?? '' | stynxTranslate"
      [confirmLabel]="confirm.pending()?.labelKey ?? '' | stynxTranslate"
      (confirm)="confirm.confirm()"
      (dismissed)="confirm.dismiss()"
    />

    @if (signPending()) {
      <rait-signature-dialog
        [open]="true"
        [titleKey]="cmdSignKey"
        [messageKey]="confirmSignKey"
        (confirmed)="sign()"
        (dismissed)="signPending.set(false)"
      />
    }
  `,
})
export class MinutesPageComponent {
  readonly facade = inject(SessionFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly sse = inject(SseService);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private focused = false;

  readonly screen = screenOf(this.route);
  readonly sessionId = sessionIdOf(this.route);
  readonly titleKey = TITLE_KEY;
  readonly emptyKey = EMPTY_KEY;
  readonly loadingKey = LOADING_KEY;
  readonly cmdGenerateKey = CMD_GENERATE_KEY;
  readonly cmdSignKey = CMD_SIGN_KEY;
  readonly cmdPublishKey = CMD_PUBLISH_KEY;
  readonly confirmSignKey = CONFIRM_SIGN_KEY;
  readonly notReadyKey = NOT_READY_KEY;
  readonly versionKey = VERSION_KEY;
  readonly confirmTitleKey = CONFIRM_TITLE_KEY;
  readonly generatePermission = permissionKeyOf('rait-minutes:generate');
  readonly signPermission = permissionKeyOf('rait-minutes:sign');
  readonly publishPermission = permissionKeyOf('rait-minutes:publish');
  readonly confirm = createConfirmQueue();
  readonly signPending = signal(false);

  readonly offline = computed(() => this.facade.sessao.status() === 'offline');
  readonly minutes = computed<RaitMinutes | null>(
    () => this.facade.sessao.value()?.minutes ?? null,
  );
  /** Ficha 036: ata só após `DECISAO_PROCLAMADA` (leitura de token, não regra). */
  readonly notReady = computed(() => {
    const bundle = this.facade.sessao.value();
    return (
      bundle !== null &&
      bundle.minutes === null &&
      bundle.session.state !== PROCLAIMED
    );
  });

  constructor() {
    this.sse.connect({ sessionId: this.sessionId });
    void this.facade.loadSession(this.sessionId);
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

  requestGenerate(): void {
    this.confirm.request({
      action: 'generate',
      confirmKey: CONFIRM_GENERATE_KEY,
      labelKey: CMD_GENERATE_KEY,
      run: () =>
        this.facade.generateMinutes(
          provisionalBody<CreateRaitMinutesDto>({ session_id: this.sessionId }),
        ),
    });
  }

  sign(): void {
    this.signPending.set(false);
    void this.facade.signMinutes(this.minutes()?.id ?? '', {});
  }

  requestPublish(): void {
    const minutesId = this.minutes()?.id ?? '';
    this.confirm.request({
      action: 'publish',
      confirmKey: CONFIRM_PUBLISH_KEY,
      labelKey: CMD_PUBLISH_KEY,
      run: () => this.facade.publishMinutes(minutesId, {}),
    });
  }

  reload(): void {
    void this.facade.loadSession(this.sessionId);
  }
}
