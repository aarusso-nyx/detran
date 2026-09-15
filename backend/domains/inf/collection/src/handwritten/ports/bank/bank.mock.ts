// Mock determinístico da porta bancária (contrato
// work/rounds/R-0006/contracts/CTG-0002-modules.md §c, "Comportamento
// exigido do mock determinístico"). Sem I/O, sem rede, sem estado
// compartilhado entre instâncias (ADR-0018 §Decision 5, mesmo padrão dos
// dobrões do `senatran-adapter`). O port nunca escreve em tabela — quem
// grava `inf.collection_document`, `inf.payment` e `inf.refund_order` é o
// comando, na mesma transação do outbox (R-0007).
import { createHash } from 'node:crypto';

import type {
  BankDocumentHandle,
  BankDocumentRegistration,
  BankPort,
  BankRefundInstruction,
  BankRefundReceipt,
  BankReturnLine,
  BankReturnWindow,
  Clock,
} from './bank.port.js';

/**
 * Dígitos determinísticos derivados de `seed` por SHA-256 — sem aleatoriedade
 * e sem contador global (item 2 do contrato). O formato (44 dígitos para o
 * código de barras) é um layout de teste declarado aqui, não o layout oficial
 * FEBRABAN/órgão máximo: este último não está no corpus (§c, "o formato real
 * é OD proposta").
 */
function deterministicDigits(seed: string, length: number): string {
  const hash = createHash('sha256').update(seed).digest('hex');
  let digits = '';
  let index = 0;
  while (digits.length < length) {
    const nibble = hash[index % hash.length];
    digits += (Number.parseInt(nibble, 16) % 10).toString();
    index += 1;
  }
  return digits;
}

function deriveBarcode(documentId: string): string {
  return deterministicDigits(`bank-barcode:${documentId}`, 44);
}

function derivePixReference(documentId: string): string {
  return `PIX-MOCK-${deterministicDigits(`bank-pix:${documentId}`, 24)}`;
}

function deriveBankReference(refundOrderId: string): string {
  return `BANKREF-MOCK-${deterministicDigits(`bank-refund:${refundOrderId}`, 20)}`;
}

/**
 * Mock em memória, construído por teste (ou pelo provedor `BANK_PORT` do
 * módulo). `seededReturns` é a lista fixa que `fetchReturns` filtra — o mock
 * nunca inventa pagamento (item 3 do contrato); quem semeia o retorno
 * bancário é quem constrói o mock.
 */
export function createMockBankPort(
  clock: Clock,
  seededReturns: readonly BankReturnLine[] = [],
): BankPort {
  const registrations = new Map<string, BankDocumentHandle>();
  const refunds = new Map<string, BankRefundReceipt>();

  return {
    async registerDocument(
      registration: BankDocumentRegistration,
    ): Promise<BankDocumentHandle> {
      const cached = registrations.get(registration.documentId);
      if (cached) {
        return cached;
      }
      const handle: BankDocumentHandle = {
        documentId: registration.documentId,
        barcode: deriveBarcode(registration.documentId),
        pixReference: derivePixReference(registration.documentId),
        registeredAt: clock.now().toISOString(),
      };
      registrations.set(registration.documentId, handle);
      return handle;
    },

    async fetchReturns(
      window: BankReturnWindow,
    ): Promise<readonly BankReturnLine[]> {
      return seededReturns
        .filter(
          (line) => line.paidOn >= window.from && line.paidOn <= window.to,
        )
        .slice()
        .sort((a, b) =>
          a.paidOn === b.paidOn
            ? a.bankReference.localeCompare(b.bankReference)
            : a.paidOn.localeCompare(b.paidOn),
        );
    },

    async orderRefund(
      instruction: BankRefundInstruction,
    ): Promise<BankRefundReceipt> {
      const cached = refunds.get(instruction.refundOrderId);
      if (cached) {
        return cached;
      }
      const receipt: BankRefundReceipt = {
        refundOrderId: instruction.refundOrderId,
        bankReference: deriveBankReference(instruction.refundOrderId),
        orderedAt: clock.now().toISOString(),
      };
      refunds.set(instruction.refundOrderId, receipt);
      return receipt;
    },
  };
}

/**
 * Relógio de sistema para o provedor do módulo (`handwritten/index.ts`): é o
 * único ponto de leitura do instante real, exatamente o papel de um adapter
 * de `Clock` (CODESTYLE §TypeScript) — o mock em si nunca chama `Date.now()`.
 */
export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}
