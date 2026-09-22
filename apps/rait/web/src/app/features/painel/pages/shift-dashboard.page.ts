// T-01 Painel do turno (ficha IU-RAIT-002; contrato CTG-0002b §6.1 linha 2; [UC-RAIT-003]):
// `QueueFacade.loadShiftSummary()` → `painel` (contagens de registros carregados, cap 500 —
// OD-R12-031: "vencendo em 5 dias"/"diligência expirando" vêm do motor de prazos e NÃO se
// calculam aqui, [RN-RAIT-005]) em quatro `KpiTile`; listas curtas (5 primeiros) da fila da
// defesa e da bandeja de retomada com `DeadlineChip`/`RiskFlag` só quando o servidor traz o
// prazo/relógio. Nenhum comando: só navegações (`/fila/defesa`, `/painel/retomar`, `/casos/:id`).
// Rótulos dos KPI: sem chave `rait.screens.painel.kpi.*` no catálogo (OD proposta no relatório
// TASK-0015) — usa os rótulos existentes dos tokens/telas que cada contagem representa.
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
import { ActivatedRoute, RouterLink } from '@angular/router';
import { StynxTranslatePipe } from '@detran/ui';
import { provideRaitI18nFallback } from '../../../core/i18n-fallback';
import { tokenKey } from '../../../core/i18n-token-key';
import { SseService } from '../../../core/sse.service';
import { QueueFacade } from '../../../data/facades/queue.facade';
import { CaseStateBadgeComponent } from '../../../shared/case-state-badge.component';
import { KpiTileComponent } from '../../../shared/kpi-tile.component';
import { PageStateComponent } from '../../../shared/page-state.component';
import { screenOf } from '../../../shared/route-screen';
import { StreamStatusBannerComponent } from '../../../shared/stream-status-banner.component';

const TITLE_KEY = 'rait.screens.painel.title';
const INTRO_KEY = 'rait.screens.painel.intro';
const EMPTY_KEY = 'rait.screens.painel.empty';
const LOADING_KEY = 'rait.states.loading';
const LIST_CAPPED_KEY = 'rait.common.list_capped';
const QUEUE_TITLE_KEY = 'rait.screens.fila-defesa.title';
const RESUME_TITLE_KEY = 'rait.screens.painel-retomar.title';
const OPEN_ALERTS_KEY = 'rait.action.acknowledge-alert';
const QUEUE_ROUTE = '/fila/defesa';
const RESUME_ROUTE = '/painel/retomar';
const CASE_ROUTE_PREFIX = '/casos/';
const SHORT_LIST_SIZE = 5;

@Component({
  selector: 'rait-shift-dashboard-page',
  imports: [
    RouterLink,
    StynxTranslatePipe,
    StreamStatusBannerComponent,
    PageStateComponent,
    KpiTileComponent,
    CaseStateBadgeComponent,
  ],
  providers: provideRaitI18nFallback(),
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-screen]': 'screen',
    '[attr.data-status]': 'facade.painel.status()',
  },
  template: `
    <h1 #heading tabindex="-1">{{ titleKey | stynxTranslate }}</h1>
    <rait-stream-status-banner />
    <p>{{ introKey | stynxTranslate }}</p>

    <rait-page-state
      [status]="facade.painel.status()"
      [error]="facade.painel.error()"
      [loadingLabelKey]="loadingKey"
      [emptyLabelKey]="emptyKey"
      (retry)="reload()"
    />

    @if (facade.painel.value(); as summary) {
      <section class="rait-shift-summary" data-shift-summary>
        <rait-kpi-tile [labelKey]="queuedKey" [value]="summary.queued" />
        <rait-kpi-tile [labelKey]="inquiryKey" [value]="summary.inInquiry" />
        <rait-kpi-tile [labelKey]="resumeKey" [value]="summary.resumable" />
        <rait-kpi-tile [labelKey]="alertsKey" [value]="summary.openAlerts" />
        <p class="rait-shift-summary__note">
          {{ listCappedKey | stynxTranslate }}
        </p>
      </section>
    }

    <section
      class="rait-shift-lists"
      [attr.aria-label]="queueTitleKey | stynxTranslate"
    >
      <h2>
        <a [routerLink]="queueRoute">{{ queueTitleKey | stynxTranslate }}</a>
      </h2>
      @if (queueItems().length > 0) {
        <ul data-queue-short-list>
          @for (item of queueItems(); track item.id) {
            <li [attr.data-case-id]="item.id">
              <a [routerLink]="caseRoute(item.id)">{{
                item.protocol_number
              }}</a>
              <rait-case-state-badge
                [state]="item.state"
                [instance]="item.instance"
              />
            </li>
          }
        </ul>
      }
    </section>

    <section
      class="rait-shift-lists"
      [attr.aria-label]="resumeTitleKey | stynxTranslate"
    >
      <h2>
        <a [routerLink]="resumeRoute">{{ resumeTitleKey | stynxTranslate }}</a>
      </h2>
      @if (resumeItems().length > 0) {
        <ul data-resume-short-list>
          @for (item of resumeItems(); track item.id) {
            <li [attr.data-inquiry-id]="item.id">
              <a [routerLink]="caseRoute(item.case_id)">{{
                caseProtocol(item.case_id)
              }}</a>
              <span>{{ item.subject }}</span>
            </li>
          }
        </ul>
      }
    </section>
  `,
})
export class ShiftDashboardPageComponent {
  readonly facade = inject(QueueFacade);
  private readonly sse = inject(SseService);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private focused = false;

  readonly screen = screenOf(inject(ActivatedRoute));
  readonly titleKey = TITLE_KEY;
  readonly introKey = INTRO_KEY;
  readonly emptyKey = EMPTY_KEY;
  readonly loadingKey = LOADING_KEY;
  readonly listCappedKey = LIST_CAPPED_KEY;
  readonly queueTitleKey = QUEUE_TITLE_KEY;
  readonly resumeTitleKey = RESUME_TITLE_KEY;
  readonly queuedKey = tokenKey('caseState', 'ADMITIDO');
  readonly inquiryKey = tokenKey('caseState', 'DILIGENCIA');
  readonly resumeKey = RESUME_TITLE_KEY;
  readonly alertsKey = OPEN_ALERTS_KEY;
  readonly queueRoute = QUEUE_ROUTE;
  readonly resumeRoute = RESUME_ROUTE;

  /** Ordem recebida ([RN-RAIT-141]); só os cinco primeiros. */
  readonly queueItems = computed(() =>
    this.facade.filaDefesa.items().slice(0, SHORT_LIST_SIZE),
  );
  readonly resumeItems = computed(() =>
    this.facade.retomar.items().slice(0, SHORT_LIST_SIZE),
  );

  constructor() {
    this.sse.connect();
    void this.facade.loadShiftSummary();
    void this.facade.loadDefenseQueue();
    void this.facade.loadResumeTray();
    afterRenderEffect(() => {
      const status = this.facade.painel.status();
      const heading = this.heading()?.nativeElement;
      untracked(() => {
        if (!this.focused && (status === 'ready' || status === 'empty')) {
          this.focused = true;
          heading?.focus();
        }
      });
    });
  }

  caseRoute(caseId: string): string {
    return `${CASE_ROUTE_PREFIX}${caseId}`;
  }

  caseProtocol(caseId: string): string {
    return this.facade.casosDaFila().get(caseId)?.protocol_number ?? caseId;
  }

  reload(): void {
    void this.facade.loadShiftSummary();
  }
}
