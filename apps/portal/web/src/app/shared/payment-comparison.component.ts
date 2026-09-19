// PaymentComparison (contrato CTG-0003b §4; spec §5.2; [RN-PORTAL-125…128]; H.53; OD-P05/P41):
// as faixas de pagamento LADO A LADO, num único fieldset, na ordem `PAYMENT_TIER_ORDER`, todas
// visíveis sem interação e nenhuma com destaque visual. Toda faixa que renuncia ao recurso
// (`waivesAppeal`) mostra a advertência ANTES do clique e, ao ser escolhida, NÃO altera a seleção:
// emite `waiverRequested` e a página abre o `ConsequenceDialog` (`renuncia_40`). A faixa de 40%
// aparece sempre, indisponível com motivo enquanto a flag `portal.waiver_40_term` está desligada
// (H.53). Nada aqui calcula valor, percentual, juros ou data: `amount`/`percent`/`availableUntil`
// chegam prontos do servidor ([RN-PORTAL-125] b) e a moeda/data são formatadas pelos pipes do
// kit no locale do runtime de i18n — origem do `locale` para `Intl` é a OD-P101 (o `AvailableBrand`
// do par 1 não expõe `locale`, CTG-0003a A1).
// `amount === null` → `portal.forms.pagamento.valor_indisponivel` + `data-amount="unavailable"` (OD-P41/OD-P70).
// Links `/sne` e `…/preservando-recurso` são âncoras com `href` (fallback) cujo clique é
// entregue à página por `output` — ela navega pelo `Router` (este componente não depende de rota).
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  type Signal,
  computed,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import {
  StynxIntlCurrencyPipe,
  StynxIntlDatePipe,
  StynxTranslatePipe,
} from '@detran/ui';
import type {
  PaymentInfo,
  PaymentMethod,
  PaymentTier,
  PaymentTierCode,
} from '../data/portal-read.models';

export type PaymentComparisonMode = 'comparison' | 'preserving_appeal'; // T-13 | T-23

export interface PaymentFlags {
  readonly waiverTerm: boolean; // portal.waiver_40_term (H.53)
  readonly cardPayment: boolean; // portal.card_payment (OD-P05)
  readonly installments: boolean; // portal.installments (OD-P05)
}

export interface PaymentSelection {
  readonly tier: PaymentTierCode;
  /** `null` enquanto o meio não foi escolhido (a faixa pode ser escolhida antes do meio). */
  readonly method: PaymentMethod | null;
  readonly installments?: number;
}

/** Seleção completa (faixa + meio), a única que `confirmed` emite. */
export interface ConfirmedPaymentSelection extends PaymentSelection {
  readonly method: PaymentMethod;
}

export type TierUnavailableReason =
  | 'portal.waiver_40_term' // flag desligada (H.53)
  | 'paid' // payment.paid === true
  | 'mode' // T-23 não oferece faixas que renunciam
  | 'server'; // 422 PAYMENT_TIER_NOT_AVAILABLE { availableTiers[] }

export type MethodUnavailableReason =
  | 'portal.card_payment' // flag desligada (OD-P05)
  | 'server'; // 422 PAYMENT_METHOD_UNAVAILABLE { available[] }

export interface TierView {
  readonly tier: PaymentTier;
  readonly available: boolean;
  readonly reason: TierUnavailableReason | null; // → data-reason
  readonly labelKey: string; // §4.3
}

export interface MethodView {
  readonly method: PaymentMethod;
  readonly available: boolean;
  readonly reason: MethodUnavailableReason | null;
  readonly labelKey: string;
}

/** spec §5.2 "80 · 60 (SNE) · 40 (renúncia)" + "juros após vencimento". */
export const PAYMENT_TIER_ORDER: readonly PaymentTierCode[] = [
  'desconto_80',
  'desconto_60_reconhecimento',
  'desconto_40_fora_sne',
  'integral_juros',
];

/** spec §7 "PIX/débito/boleto/cartão". */
export const PAYMENT_METHOD_ORDER: readonly PaymentMethod[] = [
  'pix',
  'debito',
  'boleto',
  'cartao',
];

/** Rótulos por faixa (contrato §4.3; OD-P70 para a faixa 40). */
const TIER_LABEL_KEYS: Readonly<
  Record<PaymentComparisonMode, Readonly<Record<PaymentTierCode, string>>>
> = {
  comparison: {
    desconto_80: 'portal.screens.t13.cmd.pagar_80',
    desconto_60_reconhecimento: 'portal.screens.t13.cmd.pagar_60_sne',
    desconto_40_fora_sne: 'portal.forms.pagamento.tier.desconto_40_fora_sne',
    integral_juros: 'portal.screens.t23.field.valor_integral',
  },
  preserving_appeal: {
    desconto_80: 'portal.screens.t23.field.valor_80',
    desconto_60_reconhecimento: 'portal.screens.t13.cmd.pagar_60_sne',
    desconto_40_fora_sne: 'portal.forms.pagamento.tier.desconto_40_fora_sne',
    integral_juros: 'portal.screens.t23.field.valor_integral',
  },
};

const METHOD_LABEL_KEYS: Readonly<Record<PaymentMethod, string>> = {
  pix: 'portal.forms.pagamento.meio.pix',
  debito: 'portal.forms.pagamento.meio.debito',
  boleto: 'portal.forms.pagamento.meio.boleto',
  cartao: 'portal.forms.pagamento.meio.cartao',
};

const WAIVER_FLAG_TIER: PaymentTierCode = 'desconto_40_fora_sne';
const CARD_METHOD: PaymentMethod = 'cartao';
const SNE_ROUTE = '/sne';

@Component({
  selector: 'portal-payment-comparison',
  imports: [StynxTranslatePipe, StynxIntlCurrencyPipe, StynxIntlDatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.mode]': 'mode()',
    '[attr.data-mode]': 'mode()',
    '[attr.data-ait-id]': 'aitId()',
    '[attr.data-paid]': 'payment().paid ? "true" : null',
  },
  template: `
    @if (mode() === 'preserving_appeal') {
      <p class="portal-payment-guarantee" data-guarantee>
        {{ 'portal.screens.t23.intro' | stynxTranslate }}
      </p>
    }
    @if (payment().paid) {
      <p role="status" data-already-paid>
        {{ 'portal.errors.payment_already_paid' | stynxTranslate }}
      </p>
    }

    <fieldset class="portal-payment-tiers" [disabled]="disabled()">
      <legend>{{ 'portal.forms.pagamento.faixa' | stynxTranslate }}</legend>
      @for (view of tiers(); track view.tier.code) {
        <div
          class="portal-payment-tier"
          [attr.data-tier]="view.tier.code"
          [attr.data-percent]="view.tier.percent"
          [attr.data-available]="view.available ? 'true' : 'false'"
          [attr.data-reason]="view.reason"
          [attr.data-waives-appeal]="view.tier.waivesAppeal ? 'true' : 'false'"
          [attr.data-requires-sne]="view.tier.requiresSne ? 'true' : 'false'"
          [attr.data-amount]="
            view.tier.amount === null ? 'unavailable' : view.tier.amount
          "
          [attr.data-available-until]="view.tier.availableUntil"
          [attr.data-paid-tier]="payment().paid ? payment().paidTier : null"
        >
          <label>
            <input
              type="radio"
              name="tier"
              [value]="view.tier.code"
              [checked]="tierChoice() === view.tier.code"
              [disabled]="!view.available"
              [attr.aria-disabled]="view.available ? null : 'true'"
              [attr.aria-describedby]="hintId(view)"
              (click)="onTierClick(view, $event)"
            />
            <span class="portal-payment-tier-label">{{
              view.labelKey | stynxTranslate
            }}</span>
            <span class="portal-payment-tier-amount" data-tier-amount>
              @if (view.tier.amount !== null) {
                {{ view.tier.amount | stynxIntlCurrency: 'BRL' }}
              } @else {
                {{
                  'portal.forms.pagamento.valor_indisponivel' | stynxTranslate
                }}
              }
            </span>
          </label>
          @if (view.tier.availableUntil; as availableUntil) {
            <p class="portal-payment-tier-until">
              {{
                'portal.forms.pagamento.valido_ate'
                  | stynxTranslate
                    : { availableUntil: (availableUntil | stynxIntlDate) }
              }}
            </p>
          }
          <p [id]="hintId(view)" class="portal-payment-tier-hint">
            @if (view.tier.waivesAppeal) {
              <span aria-hidden="true">⚠</span>
              <span data-waiver-warning>{{
                'portal.forms.pagamento.hint_40' | stynxTranslate
              }}</span>
            } @else {
              <span data-keeps-appeal>{{
                'portal.screens.t23.intro' | stynxTranslate
              }}</span>
            }
            @if (view.tier.requiresSne) {
              <span data-sne-hint>{{
                'portal.forms.pagamento.hint_60' | stynxTranslate
              }}</span>
              <a [attr.href]="sneRoute" (click)="onSneLink($event)">{{
                'portal.services.adesao_sne' | stynxTranslate
              }}</a>
            }
            @if (view.reason === 'portal.waiver_40_term') {
              <span data-unavailable-reason>{{
                'portal.screens.t13.state.faixa_40_indisponivel'
                  | stynxTranslate
              }}</span>
            }
          </p>
        </div>
      }
    </fieldset>

    @if (!payment().paid) {
      <fieldset class="portal-payment-methods" [disabled]="disabled()">
        <legend>{{ 'portal.forms.pagamento.meio' | stynxTranslate }}</legend>
        @for (view of methods(); track view.method) {
          <div
            class="portal-payment-method"
            [attr.data-method]="view.method"
            [attr.data-available]="view.available ? 'true' : 'false'"
            [attr.data-reason]="view.reason"
          >
            <label>
              <input
                type="radio"
                name="method"
                [value]="view.method"
                [checked]="methodChoice() === view.method"
                [disabled]="!view.available"
                [attr.aria-disabled]="view.available ? null : 'true'"
                (change)="onMethodChange(view)"
              />
              <span>{{ view.labelKey | stynxTranslate }}</span>
            </label>
            @if (view.method === 'cartao' && !view.available) {
              <p data-card-unavailable>
                {{
                  'portal.screens.t23.state.erro_recuperavel' | stynxTranslate
                }}
              </p>
            }
          </div>
        }
        @if (installmentsEnabled()) {
          <label class="portal-payment-installments">
            <span>{{
              'portal.forms.pagamento.parcelas' | stynxTranslate
            }}</span>
            <input
              type="number"
              name="installments"
              min="1"
              step="1"
              [value]="installmentsChoice() ?? ''"
              (input)="onInstallmentsInput($event)"
            />
          </label>
        }
      </fieldset>

      <button
        type="button"
        class="portal-payment-confirm"
        data-confirm
        [disabled]="!canConfirm()"
        (click)="confirm()"
      >
        {{ confirmLabelKey() | stynxTranslate }}
      </button>
    }

    <button
      type="button"
      data-accessible-format
      (click)="accessibleFormatRequested.emit()"
    >
      {{ 'portal.screens.t13.field.formato_acessivel' | stynxTranslate }}
    </button>

    @if (mode() === 'comparison') {
      <p class="portal-payment-preserving-link">
        <a
          [attr.href]="preservingRoute()"
          data-preserving-appeal
          (click)="onPreservingLink($event)"
          >{{ 'portal.screens.t23.title' | stynxTranslate }}</a
        >
      </p>
    }
  `,
})
export class PaymentComparisonComponent {
  private readonly changeDetector = inject(ChangeDetectorRef);

  /** `AitDetail.payment`. */
  readonly payment = input.required<PaymentInfo>();
  /** `PAYMENT_FLAGS` (§4.2). */
  readonly flags = input.required<PaymentFlags>();
  readonly mode = input<PaymentComparisonMode>('comparison');
  /** Link a T-23 (mode comparison) e a /sne. */
  readonly aitId = input.required<string>();
  /** Wizard ocupado. */
  readonly disabled = input(false);
  /** `422 PAYMENT_TIER_NOT_AVAILABLE { availableTiers[] }` — faixas fora dela: `data-reason="server"`. */
  readonly availableTiers = input<readonly PaymentTierCode[] | null>(null);
  /** `422 PAYMENT_METHOD_UNAVAILABLE { available[] }` — meios fora dela: `data-reason="server"`. */
  readonly availableMethods = input<readonly PaymentMethod[] | null>(null);
  readonly selection = model<PaymentSelection | null>(null);
  /** Faixa `waivesAppeal` escolhida → a página abre o ConsequenceDialog `renuncia_40`. */
  readonly waiverRequested = output<PaymentTierCode>();
  /** Faixa `requiresSne` → link /sne (T-09, par 3); a página navega. */
  readonly sneEnrollmentRequested = output<void>();
  /** Link a T-23 (mode comparison); a página navega. */
  readonly preservingAppealRequested = output<void>();
  /** [RN-PORTAL-114] (destino: OD-P75). */
  readonly accessibleFormatRequested = output<void>();
  readonly confirmed = output<ConfirmedPaymentSelection>();

  readonly sneRoute = SNE_ROUTE;
  private readonly installmentsState = signal<number | null>(null);
  /** Meio escolhido antes da faixa (a seleção só existe com faixa). */
  private readonly methodState = signal<PaymentMethod | null>(null);

  readonly tierChoice = computed(() => this.selection()?.tier ?? null);
  readonly methodChoice = computed(
    () => this.selection()?.method ?? this.methodState(),
  );
  readonly installmentsChoice: Signal<number | null> =
    this.installmentsState.asReadonly();

  /** Ordem `PAYMENT_TIER_ORDER`, só as presentes em `payment.tiers`; em T-23 sem as que renunciam. */
  readonly tiers = computed<readonly TierView[]>(() => {
    const payment = this.payment();
    const flags = this.flags();
    const mode = this.mode();
    const serverTiers = this.availableTiers();
    const views: TierView[] = [];
    for (const code of PAYMENT_TIER_ORDER) {
      const tier = payment.tiers.find((candidate) => candidate.code === code);
      if (!tier) continue;
      const reason = this.tierReason(tier, payment, flags, mode, serverTiers);
      if (reason === 'mode') continue; // não renderizada (§4.3 10)
      views.push({
        tier,
        available: reason === null,
        reason,
        labelKey: TIER_LABEL_KEYS[mode][code],
      });
    }
    return views;
  });

  readonly methods = computed<readonly MethodView[]>(() => {
    const flags = this.flags();
    const serverMethods = this.availableMethods();
    return PAYMENT_METHOD_ORDER.map((method) => {
      const reason = this.methodReason(method, flags, serverMethods);
      return {
        method,
        available: reason === null,
        reason,
        labelKey: METHOD_LABEL_KEYS[method],
      };
    });
  });

  readonly installmentsEnabled = computed(
    () => this.flags().installments && this.methodChoice() === CARD_METHOD,
  );

  readonly canConfirm = computed(() => {
    if (this.payment().paid || this.disabled()) return false;
    const tier = this.tierChoice();
    const method = this.methodChoice();
    if (tier === null || method === null) return false;
    const tierOk = this.tiers().some(
      (view) => view.tier.code === tier && view.available,
    );
    const methodOk = this.methods().some(
      (view) => view.method === method && view.available,
    );
    return tierOk && methodOk;
  });

  readonly confirmLabelKey = computed(() => {
    if (this.mode() === 'preserving_appeal') {
      return 'portal.screens.t23.cmd.pagar_sem_abrir_mao';
    }
    const tier = this.tierChoice();
    const view = tier
      ? this.tiers().find((candidate) => candidate.tier.code === tier)
      : undefined;
    return view?.labelKey ?? 'portal.common.action.continue';
  });

  readonly preservingRoute = computed(
    () =>
      `/autos/${encodeURIComponent(this.aitId())}/pagamento/preservando-recurso`,
  );

  hintId(view: TierView): string {
    return `portal-payment-tier-${view.tier.code}-hint`;
  }

  /** Faixa que renuncia: nada muda aqui — a página decide depois do diálogo (§4.3 3). */
  onTierClick(view: TierView, event: Event): void {
    if (!view.available) {
      event.preventDefault();
      return;
    }
    if (view.tier.waivesAppeal) {
      event.preventDefault();
      this.waiverRequested.emit(view.tier.code);
      return;
    }
    this.selectTier(view.tier.code);
  }

  /**
   * Seleciona a faixa (a página chama depois de `ConsequenceDialog.confirmed` para uma faixa que
   * renuncia; o clique direto chama para as demais). Mantém o meio já escolhido.
   */
  selectTier(code: PaymentTierCode): void {
    this.selection.set({
      tier: code,
      method: this.methodChoice(),
      ...this.installmentsPart(),
    });
    this.reflectSelection();
  }

  onMethodChange(view: MethodView): void {
    if (!view.available) return;
    if (view.method !== CARD_METHOD) this.installmentsState.set(null);
    this.methodState.set(view.method);
    const tier = this.tierChoice();
    if (tier !== null) {
      this.selection.set({
        tier,
        method: view.method,
        ...this.installmentsPart(),
      });
    }
    this.reflectSelection();
  }

  onInstallmentsInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    const parsed = Number.parseInt(raw, 10);
    this.installmentsState.set(
      Number.isInteger(parsed) && parsed >= 1 ? parsed : null,
    );
    const current = this.selection();
    if (current) {
      this.selection.set({ ...current, ...this.installmentsPart() });
    }
  }

  confirm(): void {
    if (!this.canConfirm()) return;
    const current = this.selection();
    if (!current || current.method === null) return;
    this.confirmed.emit({
      tier: current.tier,
      method: current.method,
      ...this.installmentsPart(),
    });
  }

  onSneLink(event: Event): void {
    event.preventDefault();
    this.sneEnrollmentRequested.emit();
  }

  onPreservingLink(event: Event): void {
    event.preventDefault();
    this.preservingAppealRequested.emit();
  }

  /** O estado do botão de confirmar acompanha a escolha no mesmo evento (resposta imediata). */
  private reflectSelection(): void {
    this.changeDetector.detectChanges();
  }

  private installmentsPart(): { installments?: number } {
    const installments = this.installmentsState();
    return this.installmentsEnabled() && installments !== null
      ? { installments }
      : {};
  }

  private tierReason(
    tier: PaymentTier,
    payment: PaymentInfo,
    flags: PaymentFlags,
    mode: PaymentComparisonMode,
    serverTiers: readonly PaymentTierCode[] | null,
  ): TierUnavailableReason | null {
    if (mode === 'preserving_appeal' && tier.waivesAppeal) return 'mode';
    if (payment.paid) return 'paid';
    if (tier.code === WAIVER_FLAG_TIER && !flags.waiverTerm) {
      return 'portal.waiver_40_term';
    }
    if (serverTiers !== null && !serverTiers.includes(tier.code)) {
      return 'server';
    }
    return null;
  }

  /**
   * O SERVIDOR prevalece (contrato §4.2; A10 a): com `available[]` de `422 PAYMENT_METHOD_UNAVAILABLE`
   * (ou `payment.methods`, OD-P74), o meio fora dela é `data-reason="server"`; as flags estáticas
   * (`PAYMENT_FLAGS`, H.53/OD-P05) só decidem quando o servidor não se pronuncia.
   */
  private methodReason(
    method: PaymentMethod,
    flags: PaymentFlags,
    serverMethods: readonly PaymentMethod[] | null,
  ): MethodUnavailableReason | null {
    if (serverMethods !== null) {
      return serverMethods.includes(method) ? null : 'server';
    }
    if (method === CARD_METHOD && !flags.cardPayment) {
      return 'portal.card_payment';
    }
    return null;
  }
}
