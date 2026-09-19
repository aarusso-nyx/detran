// T-05 Assistente de indicação de condutor (contrato CTG-0003b §6; ficha IU-PORTAL-T05;
// [UC-PORTAL-004]; [RN-PORTAL-104]; spec §2 inv. 10; [DIVERGE-5]): a consequência jurídica vem ANTES
// do ato — ao "continuar" do passo 2 a PÁGINA abre o `ConsequenceDialog` (`consequencias_indicacao`)
// com foco, e só depois do aceite grava `values.consequenceAck` e chama `saveAndContinue()`; o
// wizard fica com `consequence: null`. Se o botão do próprio wizard for usado, a validação do
// `IndicacaoCondutorSchema` recusa sem `consequenceAck` e a página abre o mesmo diálogo (nenhum
// `PUT` antes do aceite). `INDICATION_DRIVER_INVALID { fields }` marca o campo sem reiniciar;
// `INDICATION_SECOND_SIGNATURE_PENDING` (informativo) é estado próprio, não erro;
// `INDICATION_WINDOW_CLOSED` → inelegível com canal. Dados do condutor nunca fora do ato.
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
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
import type { DraftSaved } from '../../../data/portal.client';
import {
  INDICACAO_CONDUTOR_GATE,
  IndicacaoCondutorSchema,
} from '../../../forms/indicacao-condutor.schema';
import { AlternativeChannelNoteComponent } from '../../../shared/alternative-channel-note.component';
import {
  ConsequenceDialogComponent,
  type ConsequenceAck,
  type LegalDocument,
} from '../../../shared/consequence-dialog.component';
import { DeadlineCardComponent } from '../../../shared/deadline-card.component';
import { ServiceWizardComponent } from '../../../shared/service-wizard.component';
import { IndicacaoCondutorFormComponent } from '../components/indicacao-condutor-form.component';
import { IndicacaoFacade } from '../indicacao.facade';

const AIT_PARAM = 'aitId';
const PROCESS_ROUTE_PREFIX = '/processos/';
const SERVICE_KEY = 'indicacao_condutor';
const LEGAL_DOCUMENT: LegalDocument = 'consequencias_indicacao';
const ACK_FIELD = 'consequenceAck';
const WINDOW_CLOSED_CODE = 'PORTAL.INDICATION_WINDOW_CLOSED';
const SECOND_SIGNATURE_PENDING_CODE =
  'PORTAL.INDICATION_SECOND_SIGNATURE_PENDING';
const SERVICE_UNAVAILABLE_CODE = 'PORTAL.SERVICE_UNAVAILABLE';
const VALIDATION_FAILED_CODE = 'PORTAL.VALIDATION_FAILED';

const STATE_KEYS = {
  loading: 'portal.screens.t05.state.loading',
  ineligible: 'portal.screens.t05.state.ineligible',
  error: 'portal.screens.t05.state.error_recoverable',
  forbidden: 'portal.screens.t05.state.forbidden',
  unavailable: 'portal.screens.t05.state.unavailable',
  pendingSignature: 'portal.screens.t05.state.pending_signature',
} as const;

@Component({
  selector: 'portal-indicacao-condutor-page',
  imports: [
    RouterLink,
    StynxTranslatePipe,
    DetranLoadingStateComponent,
    PortalErrorBannerComponent,
    AlternativeChannelNoteComponent,
    ConsequenceDialogComponent,
    DeadlineCardComponent,
    ServiceWizardComponent,
    IndicacaoCondutorFormComponent,
  ],
  providers: [IndicacaoFacade],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'data-screen': 'T-05',
    '[attr.data-ait-id]': 'aitId()',
    '[attr.data-status]': 'facade.status()',
    '[attr.aria-busy]': 'facade.status() === "loading" ? "true" : null',
    '(change)': 'refresh()',
  },
  template: `
    <h1 #heading tabindex="-1">
      {{ 'portal.screens.t05.title' | stynxTranslate }}
    </h1>
    <p>{{ 'portal.screens.t05.intro' | stynxTranslate }}</p>

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
      @if (windowClosed()) {
        <p data-ineligible data-reason="janela_encerrada">
          {{ stateKeys.ineligible | stynxTranslate }}
        </p>
      }
      @if (pendingSignature()) {
        <p data-pending-signature>
          {{ stateKeys.pendingSignature | stynxTranslate }}
        </p>
      }
      @if (unavailableReason(); as reason) {
        <p data-unavailable [attr.data-reason]="reason">
          {{ stateKeys.unavailable | stynxTranslate }}
        </p>
      }
      @if (recoverableError()) {
        <p data-error-recoverable>{{ stateKeys.error | stynxTranslate }}</p>
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
          (draftSaved)="onDraftSaved($event)"
          (failed)="onFailed($event)"
        >
          <portal-indicacao-condutor-form
            [prefilled]="wizard.store.prefilled()"
            [requestId]="wizard.store.requestId()"
            [fields]="fieldErrors()"
            [disabled]="wizard.store.busy()"
            [values]="wizard.values()"
            (valuesChange)="wizard.values.set($event)"
            (draftRequested)="onDraftRequested()"
            (continueRequested)="onContinueRequested()"
          />
        </portal-service-wizard>
        <portal-consequence-dialog
          [document]="legalDocument"
          [open]="dialogOpen()"
          ackLabelKey="portal.forms.indicacao_condutor.confirmacao"
          confirmLabelKey="portal.screens.t05.cmd.submit"
          cancelLabelKey="portal.common.action.cancel"
          (confirmed)="onConsequenceConfirmed($event)"
          (cancelled)="dialogOpen.set(false)"
        />
      }
    } @else {
      <portal-alternative-channel-note [serviceKey]="serviceKey" />
    }
  `,
})
export class IndicacaoCondutorPageComponent {
  readonly facade = inject(IndicacaoFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly session = inject(SessionFacade);
  private readonly destroyRef = inject(DestroyRef);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private readonly wizard = viewChild<ServiceWizardComponent>('wizard');
  private started = false;
  private focused = false;
  /** `start()` em curso: um aceite dado antes do pedido existir espera por ele. */
  private startPending: Promise<void> = Promise.resolve();

  readonly aitId = signal('');
  readonly lastFailure = signal<ErrorPresentation | null>(null);
  readonly dialogOpen = signal(false);
  readonly pendingSignature = signal(false);
  readonly schema = IndicacaoCondutorSchema;
  readonly gate = INDICACAO_CONDUTOR_GATE;
  readonly stateKeys = STATE_KEYS;
  readonly serviceKey = SERVICE_KEY;
  readonly legalDocument = LEGAL_DOCUMENT;
  readonly resumeRoute = computed(() => this.router.url);

  readonly wizardLoading = computed(
    () => this.wizard()?.store.status() === 'loading',
  );

  /** `fields[]` do erro do servidor (ex.: `driver.cpf`) — a validação local do ack não marca campo. */
  readonly fieldErrors = computed<readonly string[]>(() => {
    const error = this.wizard()?.store.error();
    if (!error || error.code === VALIDATION_FAILED_CODE) return [];
    return error.fields;
  });

  readonly unavailableReason = computed<string | null>(() => {
    const store = this.wizard()?.store;
    if (!store || store.status() !== 'unavailable') return null;
    const reason = store.error()?.context['unavailableReason'];
    return typeof reason === 'string' ? reason : 'unavailable';
  });

  readonly windowClosed = computed(
    () => this.lastFailure()?.code === WINDOW_CLOSED_CODE,
  );

  readonly recoverableError = computed(() => {
    const failure = this.lastFailure();
    return (
      failure !== null &&
      failure.code !== SERVICE_UNAVAILABLE_CODE &&
      failure.code !== WINDOW_CLOSED_CODE
    );
  });

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
        void this.facade.load({ aitId, resumeRoute: this.router.url });
      });
    afterRenderEffect(() => {
      const wizard = this.wizard();
      const status = this.facade.status();
      untracked(() => {
        if (!wizard || this.started || status !== 'ready') return;
        this.started = true;
        const resume = this.facade.resume();
        if (resume) wizard.resumeFrom(resume);
        else this.startPending = wizard.store.start();
      });
    });
    // O botão "continuar" do próprio wizard sem o aceite: a validação local recusa (schema
    // estrito) e o diálogo de consequência é aberto aqui — nenhum PUT antes do aceite.
    afterRenderEffect(() => {
      const error = this.wizard()?.store.error();
      untracked(() => {
        if (
          error?.code === VALIDATION_FAILED_CODE &&
          error.fields.includes(ACK_FIELD) &&
          !this.hasAck()
        ) {
          this.dialogOpen.set(true);
        }
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

  /** "Continuar" do passo 2: consequência ANTES do ato ([UC-PORTAL-004] AC-3), no mesmo clique. */
  onContinueRequested(): void {
    if (this.hasAck()) {
      void this.wizard()?.saveAndContinue();
      return;
    }
    this.dialogOpen.set(true);
    this.refresh();
  }

  /**
   * Toda mudança de controle (campos do condutor, aceite do diálogo) é refletida na tela no mesmo
   * evento — resposta imediata: o botão do diálogo acompanha o checkbox sem esperar o próximo ciclo.
   */
  refresh(): void {
    this.changeDetector.detectChanges();
  }

  /** Rascunho explícito: exige o mesmo aceite (o schema é estrito). */
  onDraftRequested(): void {
    if (this.hasAck()) {
      void this.wizard()?.store.save();
      return;
    }
    this.dialogOpen.set(true);
  }

  /** Aceite gravado DIRETAMENTE nos valores do wizard e só então o rascunho é salvo. */
  async onConsequenceConfirmed(ack: ConsequenceAck): Promise<void> {
    this.dialogOpen.set(false);
    const wizard = this.wizard();
    if (!wizard) return;
    wizard.values.set({ ...(wizard.values() ?? {}), [ACK_FIELD]: ack });
    await this.startPending;
    await wizard.saveAndContinue();
  }

  /** `INDICATION_SECOND_SIGNATURE_PENDING` chega como corpo informativo do 200 (T05 §5). */
  onDraftSaved(body: DraftSaved): void {
    this.lastFailure.set(null);
    const code = (body as { code?: unknown }).code;
    this.pendingSignature.set(code === SECOND_SIGNATURE_PENDING_CODE);
  }

  onFailed(presentation: ErrorPresentation): void {
    if (presentation.code === SECOND_SIGNATURE_PENDING_CODE) {
      this.pendingSignature.set(true);
      return;
    }
    this.lastFailure.set(presentation);
  }

  reload(): void {
    this.started = false;
    void this.facade.load({
      aitId: this.aitId(),
      resumeRoute: this.router.url,
    });
  }

  private hasAck(): boolean {
    const values = this.wizard()?.values() ?? null;
    return values !== null && ACK_FIELD in values && values[ACK_FIELD] != null;
  }
}
