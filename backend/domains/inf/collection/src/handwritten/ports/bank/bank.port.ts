// Porta bancária de `inf/collection` (ADR-0017 §Decision 4; contrato
// work/rounds/R-0006/contracts/CTG-0002-modules.md §c). Adapter interno do
// módulo, mock-first como o `senatran-adapter`, nunca chamado por apps;
// cartão e parcelamento estão fora de escopo (DT-031), então a interface só
// cobre os três fatos que o módulo escreve: registrar o documento na rede
// arrecadadora, consultar os retornos de uma janela e ordenar a restituição.
// A Fazenda não é coberta aqui — tem porta própria pendente de fonte
// (ADR-0017 §tabela de ownership).

export interface BankDocumentRegistration {
  readonly documentId: string;
  readonly infractionId: string;
  readonly tier: string; // código de inf.infraction_payment_tier_ref
  readonly amount: string; // decimal com 2 casas truncadas (AC-RAIT-032-3)
  readonly validUntil: string; // ISO 8601 date
}

export interface BankDocumentHandle {
  readonly documentId: string;
  readonly barcode: string | null;
  readonly pixReference: string | null;
  readonly registeredAt: string; // ISO 8601 date-time
}

export interface BankReturnWindow {
  readonly from: string; // ISO 8601 date
  readonly to: string; // ISO 8601 date
}

export interface BankReturnLine {
  readonly bankReference: string; // chave idempotente do retorno
  readonly barcode: string | null;
  readonly pixReference: string | null;
  readonly paidOn: string; // ISO 8601 date
  readonly amount: string; // decimal com 2 casas
}

export interface BankRefundInstruction {
  readonly refundOrderId: string;
  readonly amount: string; // updated_amount
  readonly indexKey: string; // index_key aplicado
}

export interface BankRefundReceipt {
  readonly refundOrderId: string;
  readonly bankReference: string;
  readonly orderedAt: string; // ISO 8601 date-time
}

export interface BankPort {
  registerDocument(
    registration: BankDocumentRegistration,
  ): Promise<BankDocumentHandle>;
  fetchReturns(window: BankReturnWindow): Promise<readonly BankReturnLine[]>;
  orderRefund(instruction: BankRefundInstruction): Promise<BankRefundReceipt>;
}

/**
 * Relógio injetado (CODESTYLE §TypeScript: nunca `Date.now()` em código de
 * domínio). O mock só precisa do instante atual para `registeredAt` e
 * `orderedAt`; quem lê o instante do sistema é o adapter de wiring
 * (`bank.mock.ts`), nunca o mock em si.
 */
export interface Clock {
  now(): Date;
}
