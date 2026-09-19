// PAYMENT_FLAGS (contrato CTG-0003b §4.2): transcrição das decisões desta rodada; nenhum valor é
// lido de tabela do cliente além destes:
//   H.53   — `collection.discount_40_outside_sne=false`, `portal.waiver_40_term=false`
//            (a faixa de 40% aparece, mas fica indisponível com motivo; só texto no catálogo);
//   OD-P05 — `portal.card_payment=false`, `portal.installments=false`
//            (cartão parcelado indisponível; nunca "até 12x").
// Quando `payment.methods` (H.53; forma `source_pending`, OD-P74) chegar do servidor, ele
// prevalece sobre estas flags.
import type { PaymentFlags } from '../../shared/payment-comparison.component';

export const PAYMENT_FLAGS: PaymentFlags = {
  waiverTerm: false,
  cardPayment: false,
  installments: false,
};
