// T-02 Assistente de defesa prévia (contrato CTG-0003b §6; ficha IU-PORTAL-T02; [UC-PORTAL-001];
// [RN-PORTAL-105/106/107]): a página lê o AIT (`DefesaFacade`), resolve o alvo e a retomada —
// ponto do `ResumeService` ou pedido aberto em composição (sem novo `POST`); pedido aberto em
// estado posterior → "já existe uma defesa" + link ao processo — e hospeda o `ServiceWizard`
// (T02 §5: `start()` automático ao montar quando não há retomada) com o formulário do passo 2
// projetado. DeadlineCard do AIT e canal alternativo visíveis em todos os passos; nível
// insuficiente é só texto de contexto acima do `SignatureStep` (o caminho é o `AssuranceExplainer`
// do par 1); `422 SERVICE_UNAVAILABLE` → indisponível com motivo (`data-reason`) e canal, nunca
// simulado (M15). Sem confirmação de abandono (rascunho no servidor; OD-P79).
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
import type { ErrorPresentation } from '../../../core/error-boundary';
import { ASSURANCE_ORDER, SessionFacade } from '../../../core/session.facade';
import {
  DEFESA_PREVIA_GATE,
  DefesaPreviaSchema,
} from '../../../forms/defesa-previa.schema';
import { AlternativeChannelNoteComponent } from '../../../shared/alternative-channel-note.component';
import { DeadlineCardComponent } from '../../../shared/deadline-card.component';
import { ServiceWizardComponent } from '../../../shared/service-wizard.component';
import { DefesaPreviaFormComponent } from '../components/defesa-previa-form.component';
import { DefesaFacade } from '../defesa.facade';

const AIT_PARAM = 'aitId';
const PROCESS_ROUTE_PREFIX = '/processos/';
const SERVICE_KEY = 'defesa_previa';

const STATE_KEYS = {
  loading: 'portal.screens.t02.state.loading',
  ineligible: 'portal.screens.t02.state.ineligible',
  error: 'portal.screens.t02.state.error_recoverable',
  forbidden: 'portal.screens.t02.state.forbidden',
  unavailable: 'portal.screens.t02.state.unavailable',
} as const;

@Component({
  selector: 'portal-defesa-previa-page',
  imports: [
    RouterLink,
    StynxTranslatePipe,
    DetranLoadingStateComponent,
    PortalErrorBannerComponent,
    AlternativeChannelNoteComponent,
    DeadlineCardComponent,
    ServiceWizardComponent,
    DefesaPreviaFormComponent,
  ],
  providers: [DefesaFacade],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'data-screen': 'T-02',
    '[attr.data-ait-id]': 'aitId()',
    '[attr.data-status]': 'facade.status()',
    '[attr.aria-busy]': 'facade.status() === "loading" ? "true" : null',
  },
  template: `
    <h1 #heading tabindex="-1">
      {{ 'portal.screens.t02.title' | stynxTranslate }}
    </h1>
    <p>{{ 'portal.screens.t02.intro' | stynxTranslate }}</p>

    <div
      role="status"
      class="portal-status-region"
      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
    >
      @if (facade.status() === 'loading' || wizardLoading()) {
        <detran-loading-state [label]="stateKeys.loading | stynxTranslate" />
      }
      @if (facade.existingRequestId(); as existingRequestId) {
        <p data-existing-request>
          {{ stateKeys.ineligible | stynxTranslate }}
          <a
            [routerLink]="processRoute(existingRequestId)"
            [attr.routerLink]="processRoute(existingRequestId)"
            >{{ 'portal.screens.t07.title' | stynxTranslate }}</a
          >
        </p>
      }
      @if (unavailableReason(); as reason) {
        <p data-unavailable [attr.data-reason]="reason">
          {{ stateKeys.unavailable | stynxTranslate }}
        </p>
      }
      @if (recoverableError()) {
        <p data-error-recoverable>
          {{ stateKeys.error | stynxTranslate }}
        </p>
      }
      @if (forbidden()) {
        <p data-forbidden>{{ stateKeys.forbidden | stynxTranslate }}</p>
      }
    </div>

    @if (facade.error(); as error) {
      <portal-error-banner [error]="error" (retry)="reload()" />
    }

    @for (deadline of facade.deadlines(); track $index) {
      <portal-deadline-card
        [dueOn]="deadline.dueOn"
        [ownedBy]="deadline.ownedBy"
        [kind]="deadline.kind"
        [labelKey]="nextActionKey(deadline.ownedBy)"
      />
    }

    @if (facade.target(); as target) {
      @if (facade.existingRequestId() === null) {
        <portal-service-wizard
          #wizard
          [target]="target"
          [schema]="schema"
          [gate]="gate"
          [resumeRoute]="resumeRoute()"
          (created)="lastFailure.set(null)"
          (draftSaved)="lastFailure.set(null)"
          (failed)="onFailed($event)"
        >
          <portal-defesa-previa-form
            [prefilled]="wizard.store.prefilled()"
            [requirements]="wizard.store.requirements()"
            [requestId]="wizard.store.requestId()"
            [fields]="wizard.store.error()?.fields ?? []"
            [disabled]="wizard.store.busy()"
            [values]="wizard.values()"
            (valuesChange)="wizard.values.set($event)"
            (draftRequested)="wizard.store.save()"
          />
        </portal-service-wizard>
      }
    } @else {
      <portal-alternative-channel-note [serviceKey]="serviceKey" />
    }
  `,
})
export class DefesaPreviaPageComponent {
  readonly facade = inject(DefesaFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly session = inject(SessionFacade);
  private readonly destroyRef = inject(DestroyRef);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private readonly wizard = viewChild<ServiceWizardComponent>('wizard');
  private started = false;
  private focused = false;

  readonly aitId = signal('');
  readonly lastFailure = signal<ErrorPresentation | null>(null);
  readonly schema = DefesaPreviaSchema;
  readonly gate = DEFESA_PREVIA_GATE;
  readonly stateKeys = STATE_KEYS;
  readonly serviceKey = SERVICE_KEY;
  readonly resumeRoute = computed(() => this.router.url);

  readonly wizardLoading = computed(
    () => this.wizard()?.store.status() === 'loading',
  );

  /** `422 SERVICE_UNAVAILABLE { unavailableReason }` do `POST requests` (M15). */
  readonly unavailableReason = computed<string | null>(() => {
    const store = this.wizard()?.store;
    if (!store || store.status() !== 'unavailable') return null;
    const reason = store.error()?.context['unavailableReason'];
    return typeof reason === 'string' ? reason : 'unavailable';
  });

  readonly recoverableError = computed(() => {
    const failure = this.lastFailure();
    return failure !== null && failure.code !== 'PORTAL.SERVICE_UNAVAILABLE';
  });

  /** T02 §5 "sem permissão": só texto de contexto — o caminho é o `SignatureStep`/`AssuranceExplainer`. */
  readonly forbidden = computed(() => {
    const store = this.wizard()?.store;
    if (!store || store.step() !== 'assinatura') return false;
    const required = store.minimumAssurance();
    if (!required || required === 'none') return false;
    const current = this.session.assuranceLevel();
    return (
      current === null || ASSURANCE_ORDER[current] < ASSURANCE_ORDER[required]
    );
  });

  constructor() {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const aitId = params.get(AIT_PARAM) ?? '';
        this.aitId.set(aitId);
        this.started = false;
        this.focused = false;
        void this.facade.load({
          screen: 'T-02',
          aitId,
          resumeRoute: this.router.url,
        });
      });
    // Contexto resolvido: retoma o ponto guardado ou inicia o pedido (T02 §5), uma única vez.
    afterRenderEffect(() => {
      const wizard = this.wizard();
      const status = this.facade.status();
      untracked(() => {
        if (!wizard || this.started || status !== 'ready') return;
        this.started = true;
        const resume = this.facade.resume();
        if (resume) wizard.resumeFrom(resume);
        else void wizard.store.start();
      });
    });
    afterRenderEffect(() => {
      const status = this.facade.status();
      const heading = this.heading()?.nativeElement;
      untracked(() => {
        if (!this.focused && status === 'ready') {
          this.focused = true;
          heading?.focus();
        }
      });
    });
  }

  nextActionKey(ownedBy: 'citizen' | 'agency'): string {
    return `portal.situation.next_action.${ownedBy}`;
  }

  processRoute(requestId: string): string {
    return `${PROCESS_ROUTE_PREFIX}${requestId}`;
  }

  onFailed(presentation: ErrorPresentation): void {
    this.lastFailure.set(presentation);
  }

  reload(): void {
    this.started = false;
    void this.facade.load({
      screen: 'T-02',
      aitId: this.aitId(),
      resumeRoute: this.router.url,
    });
  }
}
