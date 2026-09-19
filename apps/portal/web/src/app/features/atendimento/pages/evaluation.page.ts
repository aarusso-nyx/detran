// T-26 Avaliar o serviço (contrato CTG-0003c §6; ficha IU-PORTAL-T26; [RN-PORTAL-110];
// [UC-PORTAL-017]; [DIVERGE-18]): o pedido avaliado (`GET requests/{id}`, par 2 — o servidor decide
// a elegibilidade; a página só a espelha em texto) e o `EvaluationForm` com `subjectKind:
// 'request'` e escala pendente (OD-P65). `POST evaluations` (nunca `requests/{id}/evaluation`);
// 409 já avaliado → recuperável; 409 não oferecido → sem elegibilidade; sucesso → aviso de
// publicação em `role="status"`. Avaliar nunca é condição para ver o resultado: link de volta ao
// processo ("pular").
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
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DetranLoadingStateComponent, StynxTranslatePipe } from '@detran/ui';
import { PortalErrorBannerComponent } from '../../../core/error-banner.component';
import type { EvaluationCreateBody } from '../../../data/portal-read.models';
import { AlternativeChannelNoteComponent } from '../../../shared/alternative-channel-note.component';
import { EvaluationFormComponent } from '../../../shared/evaluation-form.component';
import { AtendimentoFacade } from '../atendimento.facade';

const REQUEST_PARAM = 'requestId';
const SERVICE_KEY = 'avaliar';
const PROCESS_ROUTE_PREFIX = '/processos/';
const OUVIDORIA_ROUTE = '/ouvidoria/nova';
const NOT_FOUND_CODE = 'PORTAL.NOT_FOUND';
const ALREADY_SUBMITTED_CODE = 'PORTAL.EVALUATION_ALREADY_SUBMITTED';
/** 409 que o servidor devolve quando a avaliação não está oferecida (§3.6). */
const NOT_ELIGIBLE_CODES: ReadonlySet<string> = new Set([
  'PORTAL.EVALUATION_NOT_OFFERED',
  'PORTAL.REQUEST_STATE_INVALID',
]);
/** Estados do pedido em que a avaliação é esperada (texto só; o servidor decide). */
const EVALUABLE_STATES: ReadonlySet<string> = new Set([
  'RESULTADO_DISPONIVEL',
  'AVALIACAO_OFERECIDA',
  'CONCLUIDO',
]);

const STATE_KEYS = {
  loading: 'portal.screens.t26.state.carregando',
  notEligible: 'portal.screens.t26.state.sem_elegibilidade',
  recoverable: 'portal.screens.t26.state.erro_recuperavel',
  notFound: 'portal.screens.t26.state.sem_permissao',
  unavailable: 'portal.screens.t26.state.indisponivel',
} as const;

@Component({
  selector: 'portal-evaluation-page',
  imports: [
    RouterLink,
    StynxTranslatePipe,
    DetranLoadingStateComponent,
    PortalErrorBannerComponent,
    AlternativeChannelNoteComponent,
    EvaluationFormComponent,
  ],
  providers: [AtendimentoFacade],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'data-screen': 'T-26',
    '[attr.data-request-id]': 'requestId()',
    '[attr.data-status]': 'facade.requestStatus()',
    '[attr.data-evaluation-status]': 'facade.evaluationStatus()',
    '[attr.aria-busy]': 'facade.requestStatus() === "loading" ? "true" : null',
  },
  template: `
    <h1 #heading tabindex="-1">
      {{ 'portal.screens.t26.title' | stynxTranslate }}
    </h1>
    <p>{{ 'portal.screens.t26.intro' | stynxTranslate }}</p>

    <div
      role="status"
      class="portal-status-region"
      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
    >
      @if (facade.requestStatus() === 'loading') {
        <detran-loading-state [label]="stateKeys.loading | stynxTranslate" />
      }
      @if (stateTextKey(); as key) {
        <p data-state-text>{{ key | stynxTranslate }}</p>
      }
    </div>

    <div role="alert" class="portal-alert-region">
      @if (facade.requestError(); as error) {
        <portal-error-banner [error]="error" (retry)="reload()" />
      }
      @if (facade.evaluationError(); as error) {
        <portal-error-banner [error]="error" (retry)="reload()" />
      }
    </div>

    @if (facade.request(); as request) {
      <p data-request-state [attr.data-token]="request.request.state">
        {{ requestStateKey(request.request.state) | stynxTranslate }}
      </p>
    }
    <!-- Avaliar nunca é condição de nada ([RN-PORTAL-110]): o formulário não espera o pedido —
         a elegibilidade é do servidor (409), o contexto do pedido é só informativo. -->
    <portal-evaluation-form
      subjectKind="request"
      [subjectId]="requestId()"
      [scale]="null"
      [status]="facade.evaluationStatus()"
      [fields]="facade.evaluationError()?.fields ?? []"
      [result]="facade.evaluation()"
      [skipRoute]="processRoute()"
      (submitted)="evaluate($event)"
      (manifestationRequested)="openManifestation()"
    />

    <p>
      <a [routerLink]="processRoute()" [attr.routerLink]="processRoute()">{{
        'portal.screens.t07.title' | stynxTranslate
      }}</a>
    </p>

    <portal-alternative-channel-note [serviceKey]="serviceKey" />
  `,
})
export class EvaluationPageComponent {
  readonly facade = inject(AtendimentoFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private focused = false;

  readonly requestId = signal('');
  readonly stateKeys = STATE_KEYS;
  readonly serviceKey = SERVICE_KEY;
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
        void this.facade.loadRequest(requestId);
      });
    afterRenderEffect(() => {
      const status = this.facade.requestStatus();
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

  stateTextKey(): string | null {
    const evaluationCode = this.facade.evaluationError()?.code ?? null;
    if (evaluationCode === ALREADY_SUBMITTED_CODE)
      return STATE_KEYS.recoverable;
    if (evaluationCode !== null && NOT_ELIGIBLE_CODES.has(evaluationCode)) {
      return STATE_KEYS.notEligible;
    }
    const requestCode = this.facade.requestError()?.code ?? null;
    if (requestCode === NOT_FOUND_CODE) return STATE_KEYS.notFound;
    const requestStatus = this.facade.requestStatus();
    if (requestStatus === 'error' || requestStatus === 'unavailable') {
      return STATE_KEYS.unavailable;
    }
    const state = this.facade.request()?.request?.state;
    if (state !== undefined && !EVALUABLE_STATES.has(state)) {
      return STATE_KEYS.notEligible;
    }
    return null;
  }

  evaluate(body: EvaluationCreateBody): void {
    void this.facade.evaluate(body);
  }

  openManifestation(): void {
    void this.router.navigateByUrl(OUVIDORIA_ROUTE);
  }

  reload(): void {
    void this.facade.loadRequest(this.requestId());
  }
}
