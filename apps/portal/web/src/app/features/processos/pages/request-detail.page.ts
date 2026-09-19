// T-07 Detalhe do processo (contrato CTG-0003b §6; ficha IU-PORTAL-T07; [UC-PORTAL-005];
// [RN-PORTAL-112]): cabeçalho (protocolo, data, canal, serviço, situação), a linha do tempo com
// "com você" × "com o órgão" explícitos, documentos baixáveis a qualquer momento e as ações — todas
// navegação (T07 §6), nunca escrita. `not_found` mostra "por que não vejo isto" (nunca tela
// vazia); em `unavailable`/`error` o que já carregou permanece. Nunca status "parado" sem a última
// ação (`updatedAt`). Regiões de estado/alerta existem desde o carregamento.
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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import {
  DetranLoadingStateComponent,
  StynxI18nService,
  StynxIntlDatePipe,
  StynxTranslatePipe,
} from '@detran/ui';
import { PortalErrorBannerComponent } from '../../../core/error-banner.component';
import {
  CitizenStatusBadgeComponent,
  badgeOf,
} from '../../../shared/citizen-status-badge.component';
import { ProcessTimelineComponent } from '../../../shared/process-timeline.component';
import { RequestActionsComponent } from '../components/request-actions.component';
import { ProcessosFacade } from '../processos.facade';

const REQUEST_PARAM = 'requestId';
const SERVICES_PREFIX = `portal.services.`;

const STATE_KEYS = {
  loading: 'portal.screens.t07.state.loading',
  not_found: 'portal.screens.t07.state.ineligible',
  error: 'portal.screens.t07.state.error_recoverable',
  unavailable: 'portal.screens.t07.state.unavailable',
} as const;

@Component({
  selector: 'portal-request-detail-page',
  imports: [
    StynxTranslatePipe,
    StynxIntlDatePipe,
    DetranLoadingStateComponent,
    PortalErrorBannerComponent,
    CitizenStatusBadgeComponent,
    ProcessTimelineComponent,
    RequestActionsComponent,
  ],
  providers: [ProcessosFacade],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'data-screen': 'T-07',
    '[attr.data-request-id]': 'requestId()',
    '[attr.data-status]': 'facade.detailStatus()',
    '[attr.aria-busy]': 'facade.detailStatus() === "loading" ? "true" : null',
  },
  template: `
    <h1 #heading tabindex="-1">
      {{ 'portal.screens.t07.title' | stynxTranslate }}
    </h1>

    <div
      role="status"
      class="portal-status-region"
      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
    >
      @if (facade.detailStatus() === 'loading') {
        <detran-loading-state [label]="stateKeys.loading | stynxTranslate" />
      }
    </div>

    <div role="alert" class="portal-alert-region">
      @if (stateTextKey(); as key) {
        <p data-state-text>{{ key | stynxTranslate }}</p>
      }
      @if (facade.detailError(); as error) {
        <portal-error-banner [error]="error" (retry)="reload()" />
      }
    </div>

    @if (facade.detail(); as detail) {
      <header
        class="portal-request-header"
        [attr.data-token]="detail.request.state"
      >
        <dl>
          @if (detail.request.protocol; as protocol) {
            <dt>{{ 'portal.common.receipt.number' | stynxTranslate }}</dt>
            <dd data-protocol>{{ protocol.number }}</dd>
            <dt>{{ 'portal.common.receipt.issued_at' | stynxTranslate }}</dt>
            <dd>
              <time [attr.datetime]="protocol.issuedAt">{{
                protocol.issuedAt | stynxIntlDate: dateFormat
              }}</time>
            </dd>
            @if (protocol.channel === 'portal') {
              <dt>{{ 'portal.common.receipt.channel' | stynxTranslate }}</dt>
              <dd data-channel="portal">
                {{ 'portal.notifications.origin.portal' | stynxTranslate }}
              </dd>
            }
          }
          <dt>
            {{ 'portal.screens.t06.field.atualizado_em' | stynxTranslate }}
          </dt>
          <dd>
            <time [attr.datetime]="detail.request.updatedAt">{{
              detail.request.updatedAt | stynxIntlDate: dateFormat
            }}</time>
          </dd>
        </dl>
        @if (serviceLabelKey(); as key) {
          <p data-service [attr.data-service-key]="detail.request.serviceKey">
            {{ key | stynxTranslate }}
          </p>
        }
        @if (badge(); as situation) {
          <portal-citizen-status-badge
            [situation]="situation"
            [token]="detail.request.state"
          />
        } @else {
          <p data-situation [attr.data-token]="detail.request.state">
            {{ requestStateKey(detail.request.state) | stynxTranslate }}
          </p>
        }
      </header>

      <portal-process-timeline
        [requestId]="requestId()"
        [entries]="detail.timeline"
        [deadlines]="detail.deadlines"
        [documents]="detail.documents"
        [diligences]="detail.diligences"
        [decision]="detail.decision ?? null"
        [protocol]="detail.request.protocol ?? null"
      />

      <portal-request-actions
        [requestId]="requestId()"
        [actions]="detail.actions"
        [diligences]="detail.diligences"
        [appealRoute]="appealRoute()"
        [hasDecision]="
          detail.decision !== null && detail.decision !== undefined
        "
      />
    }
  `,
})
export class RequestDetailPageComponent {
  readonly facade = inject(ProcessosFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly i18n = inject(StynxI18nService);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private focused = false;

  readonly requestId = signal('');
  readonly stateKeys = STATE_KEYS;
  readonly dateFormat: Intl.DateTimeFormatOptions = {
    dateStyle: 'short',
    timeStyle: 'short',
  };

  readonly stateTextKey = computed<string | null>(() => {
    switch (this.facade.detailStatus()) {
      case 'not_found':
        return STATE_KEYS.not_found;
      case 'unavailable':
        return STATE_KEYS.unavailable;
      case 'error':
        return STATE_KEYS.error;
      default:
        return null;
    }
  });

  readonly badge = computed(() => {
    const state = this.facade.detail()?.request?.state;
    return state ? badgeOf(state) : null;
  });

  readonly serviceLabelKey = computed<string | null>(() => {
    const serviceKey = this.facade.detail()?.request?.serviceKey;
    const key = serviceKey ? `${SERVICES_PREFIX}${serviceKey}` : null;
    return key && key in this.i18n.catalog() ? key : null;
  });

  readonly appealRoute = computed(() =>
    this.facade.nextStepRoute(
      this.facade.detail()?.actions?.nextInstanceServiceKey ?? null,
    ),
  );

  constructor() {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const requestId = params.get(REQUEST_PARAM) ?? '';
        this.requestId.set(requestId);
        this.focused = false;
        void this.facade.loadDetail(requestId);
      });
    afterRenderEffect(() => {
      const status = this.facade.detailStatus();
      const heading = this.heading()?.nativeElement;
      untracked(() => {
        if (!this.focused && status === 'ready') {
          this.focused = true;
          heading?.focus();
        }
      });
    });
  }

  requestStateKey(state: string): string {
    return `portal.situation.request.${state}`;
  }

  reload(): void {
    void this.facade.loadDetail(this.requestId());
  }
}
