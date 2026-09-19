// T-01 Detalhe da autuação (contrato CTG-0003b §6; ficha IU-PORTAL-T01; [RN-PORTAL-127] a;
// [RN-PORTAL-103]): cabeçalho com os valores crus do servidor, situação traduzida (token só em
// `data-token`), um DeadlineCard por prazo (data rotulada com dono, nunca "N dias"), notificações
// com origem e ciência ficta, e as TRÊS ações sempre juntas (`ActionTriplet`) — o nível
// insuficiente é decidido pelo `assuranceGuard` da rota destino, nunca aqui. `not_found` mostra o
// caminho "por que não vejo isto" (nunca tela vazia); `payment.paid` é um status, não um erro.
// O parâmetro da rota é só chave de busca — a autorização é do servidor (T01 §3). As regiões de
// estado (`role="status"`) e de alerta (`role="alert"`) existem desde o carregamento, para que o
// conteúdo injetado depois seja anunciado (região viva presente antes do conteúdo).
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
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  DetranLoadingStateComponent,
  StynxIntlCurrencyPipe,
  StynxIntlDatePipe,
  StynxTranslatePipe,
} from '@detran/ui';
import { PortalErrorBannerComponent } from '../../../core/error-banner.component';
import type {
  AitNotice,
  InfractionSituation,
  PointsStatus,
} from '../../../data/portal-read.models';
import { ActionTripletComponent } from '../../../shared/action-triplet.component';
import { AlternativeChannelNoteComponent } from '../../../shared/alternative-channel-note.component';
import { DeadlineCardComponent } from '../../../shared/deadline-card.component';
import { AutosFacade } from '../autos.facade';

const AIT_PARAM = 'aitId';
const PROCESS_ROUTE_PREFIX = '/processos/';
const SERVICE_KEY = 'consulta_multas';
/** Canais com rótulo no catálogo; demais tokens ficam só em `data-channel` (source_pending). */
const LABELLED_CHANNELS: ReadonlySet<string> = new Set(['sne', 'portal']);

/** Texto por estado de leitura da ficha T01 §5 (chaves existentes). */
const STATE_KEYS = {
  loading: 'portal.screens.t01.state.loading',
  not_found: 'portal.screens.t01.state.ineligible',
  error: 'portal.screens.t01.state.error_recoverable',
  unavailable: 'portal.screens.t01.state.unavailable',
} as const;

@Component({
  selector: 'portal-ait-detail-page',
  imports: [
    RouterLink,
    StynxTranslatePipe,
    StynxIntlDatePipe,
    StynxIntlCurrencyPipe,
    DetranLoadingStateComponent,
    PortalErrorBannerComponent,
    ActionTripletComponent,
    AlternativeChannelNoteComponent,
    DeadlineCardComponent,
  ],
  providers: [AutosFacade],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'data-screen': 'T-01',
    '[attr.data-ait-id]': 'aitId()',
    '[attr.data-status]': 'facade.aitStatus()',
    '[attr.aria-busy]': 'facade.aitStatus() === "loading" ? "true" : null',
  },
  template: `
    <h1 #heading tabindex="-1">
      {{ 'portal.screens.t01.title' | stynxTranslate }}
    </h1>

    <div
      role="status"
      class="portal-status-region"
      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
    >
      @if (facade.aitStatus() === 'loading') {
        <detran-loading-state [label]="stateKeys.loading | stynxTranslate" />
      }
      @if (facade.ait()?.payment?.paid) {
        <p data-already-paid>
          {{ 'portal.errors.payment_already_paid' | stynxTranslate }}
        </p>
      }
      @if (allUnavailable()) {
        <p data-no-actions>
          {{ 'portal.screens.t01.state.empty' | stynxTranslate }}
        </p>
      }
    </div>

    <div role="alert" class="portal-alert-region">
      @if (stateTextKey(); as key) {
        <p data-state-text>{{ key | stynxTranslate }}</p>
      }
      @if (facade.aitError(); as error) {
        <portal-error-banner [error]="error" (retry)="reload()" />
      }
    </div>

    @if (facade.ait(); as ait) {
      <section class="portal-ait-header" [attr.data-token]="ait.situation">
        <p data-situation [attr.data-token]="ait.situation">
          @if (ait.situation; as situation) {
            {{ situationKey(situation) | stynxTranslate }}
          }
        </p>
        <dl>
          @if (ait.aitNumber; as aitNumber) {
            <dt>{{ 'portal.screens.t01.field.numero' | stynxTranslate }}</dt>
            <dd>{{ aitNumber }}</dd>
          }
          @if (ait.plate; as plate) {
            <dt>{{ 'portal.screens.t01.field.placa' | stynxTranslate }}</dt>
            <dd>{{ plate }}</dd>
          }
          @if (ait.occurredAt; as occurredAt) {
            <dt>{{ 'portal.screens.t01.field.data' | stynxTranslate }}</dt>
            <dd>
              <time [attr.datetime]="occurredAt">{{
                occurredAt | stynxIntlDate
              }}</time>
            </dd>
          }
          @if (ait.framingLabel; as framing) {
            <dt>
              {{ 'portal.screens.t01.field.enquadramento' | stynxTranslate }}
            </dt>
            <dd>{{ framing }}</dd>
          }
          @if (ait.amount !== null && ait.amount !== undefined) {
            <dt>{{ 'portal.screens.t01.field.valor' | stynxTranslate }}</dt>
            <dd>{{ ait.amount | stynxIntlCurrency: 'BRL' }}</dd>
          }
        </dl>
        @if (pointsStatus(); as pointsStatus) {
          <p data-points [attr.data-points-status]="pointsStatus">
            <span>{{ pointsStatusKey(pointsStatus) | stynxTranslate }}</span>
            @if (pointsStatus === 'em_disputa') {
              <span>{{
                'portal.screens.t14.field.pontos_disputa' | stynxTranslate
              }}</span>
            }
          </p>
        }
      </section>

      @for (deadline of ait.deadlines; track $index) {
        <portal-deadline-card
          [dueOn]="deadline.dueOn"
          [ownedBy]="deadline.ownedBy"
          [kind]="deadline.kind"
          [labelKey]="nextActionKey(deadline.ownedBy)"
        />
      }

      @if (ait.notices.length > 0) {
        <ul class="portal-ait-notices" data-notices>
          @for (notice of ait.notices; track $index) {
            <li
              [attr.data-token]="notice.kind"
              [attr.data-channel]="notice.channel"
              [attr.data-fictitious]="notice.fictitious ? 'true' : null"
            >
              <span>{{ noticeKindKey(notice) | stynxTranslate }}</span>
              @if (channelKey(notice); as key) {
                <span data-origin>{{ key | stynxTranslate }}</span>
              }
              @if (notice.dispatchedOn; as dispatchedOn) {
                <time [attr.datetime]="dispatchedOn">{{
                  dispatchedOn | stynxIntlDate
                }}</time>
              }
              @if (notice.fictitious) {
                <span data-ciencia-ficta>{{
                  'portal.notifications.ciencia_ficta' | stynxTranslate
                }}</span>
              }
            </li>
          }
        </ul>
      }

      <portal-action-triplet [aitId]="aitId()" [actions]="ait.actions" />

      @if (ait.openRequestId; as openRequestId) {
        <p data-open-request>
          <a
            [routerLink]="processRoute(openRequestId)"
            [attr.routerLink]="processRoute(openRequestId)"
            >{{ 'portal.requests.nextAction.PROTOCOLADO' | stynxTranslate }}</a
          >
        </p>
      }
    }

    <portal-alternative-channel-note [serviceKey]="serviceKey" />
  `,
})
export class AitDetailPageComponent {
  readonly facade = inject(AutosFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private focused = false;

  readonly aitId = signal('');
  readonly stateKeys = STATE_KEYS;
  readonly serviceKey = SERVICE_KEY;

  /** Texto de estado da ficha para os estados de erro de leitura (o banner traz o próximo passo). */
  readonly stateTextKey = computed<string | null>(() => {
    switch (this.facade.aitStatus()) {
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

  /** "Vazio" de T01 §5: as três ações indisponíveis (cada motivo em `data-reason`). */
  readonly allUnavailable = computed(() => {
    const ait = this.facade.ait();
    if (!ait) return false;
    return !(ait.actions ?? []).some((action) => action.available);
  });

  readonly pointsStatus = computed<PointsStatus | null>(
    () =>
      this.facade.aitPoints()?.pointsStatus ??
      this.facade.ait()?.pointsStatus ??
      null,
  );

  constructor() {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const aitId = params.get(AIT_PARAM) ?? '';
        this.aitId.set(aitId);
        this.focused = false;
        void this.facade.loadAit(aitId);
      });
    afterRenderEffect(() => {
      const status = this.facade.aitStatus();
      const heading = this.heading()?.nativeElement;
      untracked(() => {
        if (!this.focused && status === 'ready') {
          this.focused = true;
          heading?.focus();
        }
      });
    });
  }

  situationKey(situation: InfractionSituation): string {
    return `portal.situation.infraction.${situation}`;
  }

  pointsStatusKey(status: PointsStatus): string {
    return `portal.situation.points_status.${status}`;
  }

  nextActionKey(ownedBy: 'citizen' | 'agency'): string {
    return `portal.situation.next_action.${ownedBy}`;
  }

  noticeKindKey(notice: AitNotice): string {
    return `portal.situation.notice.${notice.kind}`;
  }

  channelKey(notice: AitNotice): string | null {
    return LABELLED_CHANNELS.has(notice.channel)
      ? `portal.notifications.origin.${notice.channel}`
      : null;
  }

  processRoute(requestId: string): string {
    return `${PROCESS_ROUTE_PREFIX}${requestId}`;
  }

  reload(): void {
    void this.facade.loadAit(this.aitId());
  }
}
