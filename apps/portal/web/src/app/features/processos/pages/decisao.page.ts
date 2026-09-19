// T-10 Decisão do seu processo (contrato CTG-0003b §6; ficha IU-PORTAL-T10; [UC-PORTAL-008];
// ux-notes §c; [RN-PORTAL-112] 1): RESULTADO primeiro — o `outcome` sempre traduzido
// (`portal.situation.decision.<outcome>`, token só em `data-token`) no próprio <h1>; resumo do
// servidor só quando existe; UM próximo passo (nunca lista de opções), só quando há rota no app;
// prazo como DeadlineCard; documento baixável quando há URL, indisponível (nunca simulado) quando
// não há; `finalInstance` → sem botão e sem sugestão de recurso. `404 kind 'decision'` é o estado
// vazio (ainda sem decisão), não falta de vínculo. Nada de "24 meses" nem cálculo de prazo.
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
  DetranEmptyStateComponent,
  DetranLoadingStateComponent,
  StynxI18nService,
  StynxIntlDatePipe,
  StynxTranslatePipe,
} from '@detran/ui';
import { PortalErrorBannerComponent } from '../../../core/error-banner.component';
import { DeadlineCardComponent } from '../../../shared/deadline-card.component';
import { ProcessosFacade } from '../processos.facade';

const REQUEST_PARAM = 'requestId';
const PROCESS_ROUTE_PREFIX = '/processos/';
const SERVICES_PREFIX = `portal.services.`;

@Component({
  selector: 'portal-decisao-page',
  imports: [
    RouterLink,
    StynxTranslatePipe,
    StynxIntlDatePipe,
    DetranEmptyStateComponent,
    DetranLoadingStateComponent,
    PortalErrorBannerComponent,
    DeadlineCardComponent,
  ],
  providers: [ProcessosFacade],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'data-screen': 'T-10',
    '[attr.data-request-id]': 'requestId()',
    '[attr.data-status]': 'facade.decisionStatus()',
    '[attr.aria-busy]': 'facade.decisionStatus() === "loading" ? "true" : null',
  },
  template: `
    <h1 #heading tabindex="-1" [attr.data-token]="decision()?.outcome ?? null">
      {{ 'portal.screens.t10.title' | stynxTranslate }}
      @if (decision(); as decision) {
        <span class="portal-decision-outcome" data-outcome>{{
          outcomeKey(decision.outcome) | stynxTranslate
        }}</span>
      }
    </h1>
    <p>{{ 'portal.screens.t10.intro' | stynxTranslate }}</p>

    <div
      role="status"
      class="portal-status-region"
      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
    >
      @if (facade.decisionStatus() === 'loading') {
        <detran-loading-state
          [label]="'portal.states.loading' | stynxTranslate"
        />
      }
    </div>

    <div role="alert" class="portal-alert-region">
      @if (facade.decisionError(); as error) {
        <portal-error-banner [error]="error" (retry)="reload()" />
      }
    </div>

    @if (facade.decisionStatus() === 'empty') {
      <detran-empty-state
        [title]="'portal.screens.t10.empty' | stynxTranslate"
        [message]="'portal.screens.t10.empty' | stynxTranslate"
      />
    }

    @if (decision(); as decision) {
      <section
        class="portal-decision"
        [attr.data-token]="decision.outcome"
        [attr.data-final-instance]="decision.finalInstance"
        [attr.data-refund-due]="decision.refundDue === true ? 'true' : null"
      >
        <!-- OD-P72: refundDue sem valor (amount) na leitura: só data-refund-due, sem texto. -->
        @if (decision.publishedOn; as publishedOn) {
          <p data-published-on>
            <time [attr.datetime]="publishedOn">{{
              publishedOn | stynxIntlDate
            }}</time>
          </p>
        }
        @if (decision.summary; as summary) {
          <p data-summary aria-live="polite">{{ summary }}</p>
        }
        @if (decision.finalInstance === true) {
          <p data-final-instance>
            {{ 'portal.screens.t10.state.ultima_instancia' | stynxTranslate }}
          </p>
        } @else if (decision.finalInstance === false) {
          <p data-not-final>
            {{ 'portal.screens.t10.state.nao_definitivo' | stynxTranslate }}
          </p>
        }
        @if (nextStep(); as step) {
          <p data-next-step [attr.data-service-key]="step.serviceKey">
            <a [routerLink]="step.route" [attr.routerLink]="step.route">{{
              step.labelKey | stynxTranslate
            }}</a>
          </p>
          @if (step.dueOn; as dueOn) {
            <portal-deadline-card
              [dueOn]="dueOn"
              [ownedBy]="'citizen'"
              [labelKey]="step.labelKey"
            />
          }
        }
        <p data-document>
          @if (decision.documentUrl; as url) {
            <a download [attr.href]="url" rel="noopener">{{
              'portal.screens.t10.cmd.baixar_documento' | stynxTranslate
            }}</a>
          } @else {
            <button
              type="button"
              aria-disabled="true"
              data-reason="unavailable"
            >
              {{ 'portal.states.unavailable_in_version' | stynxTranslate }}
            </button>
          }
        </p>
      </section>
    }

    <p>
      <a [routerLink]="processRoute()" [attr.routerLink]="processRoute()">{{
        'portal.screens.t07.title' | stynxTranslate
      }}</a>
    </p>
  `,
})
export class DecisaoPageComponent {
  readonly facade = inject(ProcessosFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly i18n = inject(StynxI18nService);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private focused = false;

  readonly requestId = signal('');
  readonly decision = computed(() =>
    this.facade.decisionStatus() === 'ready' ? this.facade.decision() : null,
  );

  /** UM próximo passo: só quando `nextStep.serviceKey` tem rota no app e rótulo no catálogo. */
  readonly nextStep = computed<{
    readonly serviceKey: string;
    readonly route: string;
    readonly labelKey: string;
    readonly dueOn: string | null;
  } | null>(() => {
    const decision = this.decision();
    if (!decision || decision.finalInstance === true) return null;
    const serviceKey = decision.nextStep?.serviceKey ?? null;
    const route = this.facade.nextStepRoute(serviceKey);
    if (!serviceKey || !route) return null;
    const labelKey = `${SERVICES_PREFIX}${serviceKey}`;
    if (!(labelKey in this.i18n.catalog())) return null;
    return {
      serviceKey,
      route,
      labelKey,
      dueOn: decision.nextStep?.dueOn ?? null,
    };
  });

  readonly processRoute = computed(
    () => `${PROCESS_ROUTE_PREFIX}${this.requestId()}`,
  );

  constructor() {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const requestId = params.get(REQUEST_PARAM) ?? '';
        this.requestId.set(requestId);
        this.focused = false;
        void this.facade.loadDecision(requestId);
        void this.facade.loadDetail(requestId);
      });
    afterRenderEffect(() => {
      const status = this.facade.decisionStatus();
      const heading = this.heading()?.nativeElement;
      untracked(() => {
        if (!this.focused && (status === 'ready' || status === 'empty')) {
          this.focused = true;
          heading?.focus();
        }
      });
    });
  }

  outcomeKey(outcome: string): string {
    return `portal.situation.decision.${outcome}`;
  }

  reload(): void {
    void this.facade.loadDecision(this.requestId());
    void this.facade.loadDetail(this.requestId());
  }
}
