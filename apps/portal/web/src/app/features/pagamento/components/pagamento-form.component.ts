// PagamentoForm (contrato CTG-0003b §4.4; T-13/T-23): o passo 2 do pagamento — `PaymentComparison`
// (faixas lado a lado + meio) e o `ConsequenceDialog` da renúncia (`renuncia_40`), aberto quando
// uma faixa que renuncia ao recurso é escolhida: só depois do aceite a faixa é selecionada e o
// `waiverAck` gravado; `Escape`/cancelar não muda nada ([RN-PORTAL-128] 3). `confirmed` entrega à
// página os valores do rascunho (`PagamentoSchema`: `{ tier, method, installments?, waiverAck? }`).
// Nenhum cálculo: as faixas chegam prontas do servidor.
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import type {
  PaymentInfo,
  PaymentMethod,
  PaymentTierCode,
} from '../../../data/portal-read.models';
import {
  ConsequenceDialogComponent,
  type ConsequenceAck,
  type LegalDocument,
} from '../../../shared/consequence-dialog.component';
import {
  PaymentComparisonComponent,
  type ConfirmedPaymentSelection,
  type PaymentComparisonMode,
  type PaymentFlags,
} from '../../../shared/payment-comparison.component';

const LEGAL_DOCUMENT: LegalDocument = 'renuncia_40';

/** Valores do rascunho de pagamento (`PagamentoSchema`, contrato §5.1). */
export interface PagamentoValues {
  readonly tier: PaymentTierCode;
  readonly method: PaymentMethod;
  readonly installments?: number;
  readonly waiverAck?: ConsequenceAck;
}

@Component({
  selector: 'portal-pagamento-form',
  imports: [PaymentComparisonComponent, ConsequenceDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-mode]': 'mode()',
    '[attr.data-waiver-ack]': 'waiverAck() ? "true" : null',
  },
  template: `
    <portal-payment-comparison
      #comparison
      [payment]="payment()"
      [flags]="flags()"
      [mode]="mode()"
      [aitId]="aitId()"
      [disabled]="disabled()"
      [availableTiers]="availableTiers()"
      [availableMethods]="availableMethods()"
      (waiverRequested)="onWaiverRequested($event)"
      (sneEnrollmentRequested)="sneEnrollmentRequested.emit()"
      (preservingAppealRequested)="preservingAppealRequested.emit()"
      (accessibleFormatRequested)="accessibleFormatRequested.emit()"
      (confirmed)="onConfirmed($event)"
    />
    <portal-consequence-dialog
      [document]="legalDocument"
      [open]="dialogOpen()"
      ackLabelKey="portal.forms.pagamento.confirmacao_renuncia_40"
      confirmLabelKey="portal.common.action.continue"
      cancelLabelKey="portal.common.action.cancel"
      (confirmed)="onWaiverConfirmed($event)"
      (cancelled)="pendingTier.set(null)"
    />
  `,
})
export class PagamentoFormComponent {
  private readonly comparison =
    viewChild.required<PaymentComparisonComponent>('comparison');

  readonly payment = input.required<PaymentInfo>();
  readonly flags = input.required<PaymentFlags>();
  readonly mode = input<PaymentComparisonMode>('comparison');
  readonly aitId = input.required<string>();
  readonly disabled = input(false);
  readonly availableTiers = input<readonly PaymentTierCode[] | null>(null);
  readonly availableMethods = input<readonly PaymentMethod[] | null>(null);
  /** Valores prontos para `ServiceWizard.values` → `saveAndContinue()`. */
  readonly confirmed = output<PagamentoValues>();
  readonly sneEnrollmentRequested = output<void>();
  readonly preservingAppealRequested = output<void>();
  readonly accessibleFormatRequested = output<void>();

  readonly legalDocument = LEGAL_DOCUMENT;
  /** Faixa que renuncia aguardando o aceite. */
  readonly pendingTier = signal<PaymentTierCode | null>(null);
  readonly waiverAck = signal<ConsequenceAck | null>(null);
  readonly dialogOpen = computed(() => this.pendingTier() !== null);

  onWaiverRequested(code: PaymentTierCode): void {
    this.pendingTier.set(code);
  }

  /** Aceite por escrito → só então a faixa é selecionada ([RN-PORTAL-128] 2–3). */
  onWaiverConfirmed(ack: ConsequenceAck): void {
    const code = this.pendingTier();
    this.pendingTier.set(null);
    if (code === null) return;
    this.waiverAck.set(ack);
    this.comparison().selectTier(code);
  }

  /** `waiverAck` só acompanha uma faixa que renuncia (`PagamentoSchema`). */
  onConfirmed(selection: ConfirmedPaymentSelection): void {
    const waives = this.payment().tiers.some(
      (tier) => tier.code === selection.tier && tier.waivesAppeal,
    );
    const ack = waives ? this.waiverAck() : null;
    this.confirmed.emit({
      tier: selection.tier,
      method: selection.method,
      ...(selection.installments !== undefined
        ? { installments: selection.installments }
        : {}),
      ...(ack ? { waiverAck: ack } : {}),
    });
  }
}
