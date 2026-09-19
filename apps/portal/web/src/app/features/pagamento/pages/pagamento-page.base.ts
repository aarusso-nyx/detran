// Base das páginas de pagamento (contrato CTG-0003b §6 T-13/T-23; §4.4): estado e ciclo comuns —
// `PagamentoFacade` (AIT, disponibilidade, alvo, retomada), `ServiceWizard` (rascunho → assinatura
// → protocolo), a comparação (`PagamentoForm`) e os erros do servidor depois do envio
// (`PAYMENT_TIER_NOT_AVAILABLE`, `PAYMENT_METHOD_UNAVAILABLE`, `PAYMENT_ALREADY_PAID`) que voltam à
// comparação com as opções marcadas (`data-reason="server"`/`paid`). O documento de arrecadação NÃO
// está no 200 de `submit` (OD-P74): depois do protocolo mostra-se "indisponível nesta versão" +
// canal alternativo, nunca boleto/PIX simulado (M15). Guia acessível ([RN-PORTAL-114]): sem campo
// em `PUT preferences` (OD-P75) → "indisponível nesta versão" em `role="status"`. Nenhum cálculo:
// faixas, valores e datas chegam prontos. As páginas T-13 e T-23 só fixam `mode` e o template.
import {
  DestroyRef,
  Directive,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ENROLLMENT_ROUTE,
  type ErrorPresentation,
} from '../../../core/error-boundary';
import type { RequestSubmitted } from '../../../data/portal.client';
import type {
  PaymentInfo,
  PaymentMethod,
  PaymentTierCode,
} from '../../../data/portal-read.models';
import {
  PAGAMENTO_GATE,
  PagamentoSchema,
} from '../../../forms/pagamento.schema';
import type { PaymentComparisonMode } from '../../../shared/payment-comparison.component';
import { ServiceWizardComponent } from '../../../shared/service-wizard.component';
import type { PagamentoValues } from '../components/pagamento-form.component';
import { PagamentoFacade } from '../pagamento.facade';
import { PAYMENT_FLAGS } from '../payment-flags';

const AIT_PARAM = 'aitId';
const PROCESS_ROUTE_PREFIX = '/processos/';
const SERVICE_KEY = 'pagamento';
const TIER_NOT_AVAILABLE_CODE = 'PORTAL.PAYMENT_TIER_NOT_AVAILABLE';
const METHOD_UNAVAILABLE_CODE = 'PORTAL.PAYMENT_METHOD_UNAVAILABLE';
const ALREADY_PAID_CODE = 'PORTAL.PAYMENT_ALREADY_PAID';
const SERVICE_UNAVAILABLE_CODE = 'PORTAL.SERVICE_UNAVAILABLE';
const PARTIAL_CODE = 'PORTAL.SERVICE_PARTIALLY_AVAILABLE';

export interface PagamentoStateKeys {
  readonly loading: string;
  readonly ineligible: string;
  readonly error: string;
  readonly unavailable: string;
  readonly notFound: string;
}

/** Textos de estado de T-13 (ficha §5; `portal.states.*` onde a ficha não fixa chave própria). */
const STATE_KEYS: PagamentoStateKeys = {
  loading: 'portal.states.loading',
  ineligible: 'portal.states.ineligible',
  error: 'portal.states.error',
  unavailable: 'portal.states.service_unavailable',
  notFound: 'portal.errors.not_found',
};

function stringList(value: unknown): readonly string[] | null {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : null;
}

/** `@Directive()` abstrata: as consultas (`viewChild`) da base são herdadas pelas páginas. */
@Directive()
export abstract class PagamentoPageBase {
  readonly facade = inject(PagamentoFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private readonly wizard = viewChild<ServiceWizardComponent>('wizard');
  private started = false;
  private focused = false;
  /** `start()` em curso: uma confirmação feita antes do pedido existir espera por ele. */
  private startPending: Promise<void> = Promise.resolve();

  /** T-13: `'comparison'`; T-23: `'preserving_appeal'`. */
  abstract readonly mode: PaymentComparisonMode;
  readonly aitId = signal('');
  readonly lastFailure = signal<ErrorPresentation | null>(null);
  readonly submitted = signal<RequestSubmitted | null>(null);
  readonly accessibleFormatRequested = signal(false);
  readonly flags = PAYMENT_FLAGS;
  readonly schema = PagamentoSchema;
  readonly gate = PAGAMENTO_GATE;
  readonly stateKeys: PagamentoStateKeys = STATE_KEYS;
  readonly serviceKey = SERVICE_KEY;
  readonly partialKey = 'portal.errors.service_partially_available';
  readonly resumeRoute = computed(() => this.router.url);

  readonly wizardLoading = computed(
    () => this.wizard()?.store.status() === 'loading',
  );
  /** A comparação só trava enquanto o rascunho/envio está em curso (escolher durante o `start()` é inócuo). */
  readonly wizardBusy = computed(() => {
    const status = this.wizard()?.store.status();
    return status === 'saving' || status === 'submitting';
  });

  readonly partiallyAvailable = computed(
    () =>
      this.facade.availability()?.status === 'partially_available' ||
      this.lastFailure()?.code === PARTIAL_CODE,
  );

  /** `409 PAYMENT_ALREADY_PAID` reforça o estado "já pago" da comparação (§4.3 7). */
  readonly paymentView = computed<PaymentInfo | null>(() => {
    const payment = this.facade.payment();
    if (!payment) return null;
    return this.lastFailure()?.code === ALREADY_PAID_CODE
      ? { ...payment, paid: true }
      : payment;
  });

  /** `422 PAYMENT_TIER_NOT_AVAILABLE { availableTiers[] }`. */
  readonly availableTiers = computed<readonly PaymentTierCode[] | null>(() => {
    const failure = this.lastFailure();
    if (failure?.code !== TIER_NOT_AVAILABLE_CODE) return null;
    return stringList(failure.context['availableTiers']) as
      readonly PaymentTierCode[] | null;
  });

  /** `422 PAYMENT_METHOD_UNAVAILABLE { available[] }`. */
  readonly availableMethods = computed<readonly PaymentMethod[] | null>(() => {
    const failure = this.lastFailure();
    if (failure?.code !== METHOD_UNAVAILABLE_CODE) return null;
    return stringList(failure.context['available']) as
      readonly PaymentMethod[] | null;
  });

  readonly unavailableReason = computed<string | null>(() => {
    const store = this.wizard()?.store;
    if (!store || store.status() !== 'unavailable') return null;
    const reason = store.error()?.context['unavailableReason'];
    return typeof reason === 'string' ? reason : 'unavailable';
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

  /** Faixa + meio confirmados → valores do wizard → rascunho → assinatura (§4.4). */
  async onConfirmed(selection: PagamentoValues): Promise<void> {
    const wizard = this.wizard();
    if (!wizard) return;
    wizard.values.set({ ...selection });
    await this.startPending;
    await wizard.saveAndContinue();
  }

  onSubmitted(body: RequestSubmitted): void {
    this.lastFailure.set(null);
    this.submitted.set(body);
  }

  onFailed(presentation: ErrorPresentation): void {
    this.lastFailure.set(
      presentation.code === SERVICE_UNAVAILABLE_CODE ? null : presentation,
    );
  }

  /** Adesão ao SNE (T-09, par 3): a decisão é do servidor; aqui só a navegação. */
  goToEnrollment(): void {
    void this.router.navigateByUrl(ENROLLMENT_ROUTE);
  }

  goToPreservingAppeal(): void {
    void this.router.navigateByUrl(
      `/autos/${this.aitId()}/pagamento/preservando-recurso`,
    );
  }

  reload(): void {
    this.started = false;
    void this.facade.load({
      aitId: this.aitId(),
      resumeRoute: this.router.url,
    });
  }
}
