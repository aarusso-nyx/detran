// T-04 Assistente de recurso ao CETRAN (contrato CTG-0003b §6; ficha IU-PORTAL-T04;
// [UC-PORTAL-003]; [RN-PORTAL-106]): a página lê o pedido de origem (`DefesaFacade`, recurso à
// JARI) e resolve o alvo — o caso do RAIT ligado ao pedido ([DIVERGE-4]); sem caso ou sem recurso
// admitido → inelegível. O parecer e a conclusão da JARI já estão anexados (só leitura, nunca
// exigidos). `422 APPEAL_CETRAN_WINDOW_CLOSED` (o servidor decide o prazo) → inelegível + banner.
// Depois do protocolo: aviso de última instância, com foco (T04 §9).
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
  RECURSO_CETRAN_GATE,
  RecursoCetranSchema,
} from '../../../forms/recurso-cetran.schema';
import { AlternativeChannelNoteComponent } from '../../../shared/alternative-channel-note.component';
import { DeadlineCardComponent } from '../../../shared/deadline-card.component';
import { ServiceWizardComponent } from '../../../shared/service-wizard.component';
import { RecursoCetranFormComponent } from '../components/recurso-cetran-form.component';
import { DefesaFacade } from '../defesa.facade';

const REQUEST_PARAM = 'requestId';
const PROCESS_ROUTE_PREFIX = '/processos/';
const SERVICE_KEY = 'recurso_cetran';
const WINDOW_CLOSED_CODE = 'PORTAL.APPEAL_CETRAN_WINDOW_CLOSED';

const STATE_KEYS = {
  loading: 'portal.screens.t04.state.loading',
  ineligible: 'portal.screens.t04.state.ineligible',
  error: 'portal.screens.t04.state.error_recoverable',
  forbidden: 'portal.screens.t04.state.forbidden',
  unavailable: 'portal.screens.t04.state.unavailable',
} as const;

@Component({
  selector: 'portal-recurso-cetran-page',
  imports: [
    RouterLink,
    StynxTranslatePipe,
    DetranLoadingStateComponent,
    PortalErrorBannerComponent,
    AlternativeChannelNoteComponent,
    DeadlineCardComponent,
    ServiceWizardComponent,
    RecursoCetranFormComponent,
  ],
  providers: [DefesaFacade],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'data-screen': 'T-04',
    '[attr.data-request-id]': 'requestId()',
    '[attr.data-status]': 'facade.status()',
    '[attr.aria-busy]': 'facade.status() === "loading" ? "true" : null',
  },
  template: `
    <h1 #heading tabindex="-1">
      {{ 'portal.screens.t04.title' | stynxTranslate }}
    </h1>
    <p>{{ 'portal.screens.t04.intro' | stynxTranslate }}</p>

    <div
      role="status"
      class="portal-status-region"
      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
    >
      @if (facade.status() === 'loading' || wizardLoading()) {
        <detran-loading-state [label]="stateKeys.loading | stynxTranslate" />
      }
      @if (facade.ineligibility(); as reason) {
        <p data-ineligible [attr.data-reason]="reason">
          {{ stateKeys.ineligible | stynxTranslate }}
          <a
            [routerLink]="processRoute(requestId())"
            [attr.routerLink]="processRoute(requestId())"
            >{{ 'portal.screens.t07.title' | stynxTranslate }}</a
          >
        </p>
      }
      @if (windowClosed()) {
        <p data-ineligible data-reason="janela_encerrada">
          {{ stateKeys.ineligible | stynxTranslate }}
        </p>
      }
      @if (protocoled()) {
        <p #lastInstance tabindex="-1" data-last-instance>
          {{ 'portal.screens.t04.state.ultima_instancia' | stynxTranslate }}
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
          <portal-recurso-cetran-form
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
export class RecursoCetranPageComponent {
  readonly facade = inject(DefesaFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly session = inject(SessionFacade);
  private readonly destroyRef = inject(DestroyRef);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private readonly wizard = viewChild<ServiceWizardComponent>('wizard');
  private readonly lastInstance =
    viewChild<ElementRef<HTMLElement>>('lastInstance');
  private started = false;
  private focused = false;
  private focusedLastInstance = false;

  readonly requestId = signal('');
  readonly lastFailure = signal<ErrorPresentation | null>(null);
  readonly schema = RecursoCetranSchema;
  readonly gate = RECURSO_CETRAN_GATE;
  readonly stateKeys = STATE_KEYS;
  readonly serviceKey = SERVICE_KEY;
  readonly resumeRoute = computed(() => this.router.url);

  readonly wizardLoading = computed(
    () => this.wizard()?.store.status() === 'loading',
  );
  /** Passo protocolo: aviso de última instância ([UC-PORTAL-003] AC-2). */
  readonly protocoled = computed(
    () => this.wizard()?.store.step() === 'protocolo',
  );
  /** `422 APPEAL_CETRAN_WINDOW_CLOSED { dueOn }`: o servidor decidiu o prazo. */
  readonly windowClosed = computed(
    () => this.lastFailure()?.code === WINDOW_CLOSED_CODE,
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
    return (
      failure !== null &&
      failure.code !== 'PORTAL.SERVICE_UNAVAILABLE' &&
      failure.code !== WINDOW_CLOSED_CODE
    );
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
        const requestId = params.get(REQUEST_PARAM) ?? '';
        this.requestId.set(requestId);
        this.started = false;
        this.focused = false;
        void this.facade.load({
          screen: 'T-04',
          requestId,
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
    // Aviso de última instância recebe o foco ao aparecer (T04 §9).
    afterRenderEffect(() => {
      const lastInstance = this.lastInstance()?.nativeElement;
      untracked(() => {
        if (lastInstance && !this.focusedLastInstance) {
          this.focusedLastInstance = true;
          lastInstance.focus();
        }
      });
    });
    afterRenderEffect(() => {
      const status = this.facade.status();
      const heading = this.heading()?.nativeElement;
      untracked(() => {
        if (!this.focused && (status === 'ready' || status === 'error')) {
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
      screen: 'T-04',
      requestId: this.requestId(),
      resumeRoute: this.router.url,
    });
  }
}
