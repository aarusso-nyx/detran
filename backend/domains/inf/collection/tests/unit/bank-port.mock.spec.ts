// Testes do mock determinístico da porta bancária (TASK-0014, M17(d)):
// work/rounds/R-0006/contracts/CTG-0002-modules.md §c, "Comportamento
// exigido do mock determinístico" (itens 1-5). O Engineer (TASK-0007)
// escreveu o mock sem testes prévios; este arquivo prova o contrato — um
// `it` por comportamento numerado como no contrato. Relógio fixo (`Clock`
// injetado, nunca `Date.now()`, CODESTYLE §TypeScript), mesmo padrão de
// `backend/domains/inf/deadlines/tests/unit/deadline-engine.spec.ts`.
//
// `documentId`/`infractionId`/`refundOrderId` usados aqui são identificadores
// de teste locais à porta bancária: o contrato §c não fixa um formato
// canônico para eles (nenhuma entrada em `rait-fixtures.md` os define, só
// `50-fixtures-collection.sql` §8 nomeia as tabelas). O código de faixa de
// pagamento (`tier`) é o único valor canônico disponível e vem de
// `inf.infraction_payment_tier_ref` (14-inf-lifecycle-vocabulary.sql linha 114).
import { describe, expect, it, vi } from 'vitest';

import {
  createMockBankPort,
  type BankDocumentRegistration,
  type BankRefundInstruction,
  type BankReturnLine,
  type BankReturnWindow,
  type Clock,
} from '../../src/handwritten/ports/bank/index.js';

class FixedClock implements Clock {
  constructor(private readonly iso: string) {}
  now(): Date {
    return new Date(this.iso);
  }
}

const CLOCK_INSTANT = '2026-09-14T12:00:00.000Z';
const TIER_DESCONTO_80 = 'desconto_80'; // inf.infraction_payment_tier_ref

function makeRegistration(documentId: string): BankDocumentRegistration {
  return {
    documentId,
    infractionId: 'infraction-0001',
    tier: TIER_DESCONTO_80,
    amount: '150.00',
    validUntil: '2026-10-14',
  };
}

describe('MockBankPort (@detran/inf-collection) — contrato CTG-0002-modules.md §c', () => {
  it('dado um documentId já registrado quando registerDocument é chamado de novo então devolve o mesmo BankDocumentHandle, com mesmo barcode, pixReference e registeredAt do Clock injetado (item 1)', async () => {
    const clock = new FixedClock(CLOCK_INSTANT);
    const port = createMockBankPort(clock);
    const registration = makeRegistration('doc-0001');

    const first = await port.registerDocument(registration);
    const second = await port.registerDocument(registration);

    expect(second).toEqual(first);
    expect(second.registeredAt).toBe(new Date(CLOCK_INSTANT).toISOString());
  });

  it('dado o mesmo documentId em duas instâncias diferentes do mock quando registerDocument deriva barcode e pixReference então os valores são idênticos entre instâncias, nunca ambos nulos e sem contador global (item 2)', async () => {
    const documentId = 'doc-0002';
    const registration = makeRegistration(documentId);
    const portA = createMockBankPort(new FixedClock(CLOCK_INSTANT));
    const portB = createMockBankPort(
      new FixedClock('2026-10-01T08:00:00.000Z'),
    );

    const handleA = await portA.registerDocument(registration);
    const handleB = await portB.registerDocument(registration);

    expect(handleA.barcode).toBe(handleB.barcode);
    expect(handleA.pixReference).toBe(handleB.pixReference);
    expect(handleA.barcode === null && handleA.pixReference === null).toBe(
      false,
    );
    expect(handleA.barcode).toMatch(/^\d{44}$/);
    expect(handleA.pixReference).toMatch(/^PIX-MOCK-\d{24}$/);
  });

  it('dado retornos semeados dentro e fora de uma janela quando fetchReturns roda então devolve só as linhas de [from, to] inclusive, em ordem estável por (paidOn, bankReference) (item 3)', async () => {
    const seeded: readonly BankReturnLine[] = [
      {
        bankReference: 'BANKREF-B',
        barcode: null,
        pixReference: 'PIX-MOCK-1',
        paidOn: '2026-09-10',
        amount: '10.00',
      },
      {
        bankReference: 'BANKREF-A',
        barcode: null,
        pixReference: 'PIX-MOCK-2',
        paidOn: '2026-09-10',
        amount: '20.00',
      },
      {
        bankReference: 'BANKREF-C',
        barcode: null,
        pixReference: 'PIX-MOCK-3',
        paidOn: '2026-09-12',
        amount: '30.00',
      },
      {
        bankReference: 'BANKREF-D-FORA-DA-JANELA',
        barcode: null,
        pixReference: 'PIX-MOCK-4',
        paidOn: '2026-09-20',
        amount: '40.00',
      },
    ];
    const port = createMockBankPort(new FixedClock(CLOCK_INSTANT), seeded);
    const window: BankReturnWindow = { from: '2026-09-10', to: '2026-09-14' };

    const result = await port.fetchReturns(window);

    expect(result.map((line) => line.bankReference)).toEqual([
      'BANKREF-A',
      'BANKREF-B',
      'BANKREF-C',
    ]);
  });

  it('dado a mesma janela consultada duas vezes quando fetchReturns roda então devolve a mesma lista, sem inventar pagamento novo (AC-RAIT-031-1, item 3)', async () => {
    const seeded: readonly BankReturnLine[] = [
      {
        bankReference: 'BANKREF-REPEAT',
        barcode: null,
        pixReference: 'PIX-MOCK-5',
        paidOn: '2026-09-11',
        amount: '15.00',
      },
    ];
    const port = createMockBankPort(new FixedClock(CLOCK_INSTANT), seeded);
    const window: BankReturnWindow = { from: '2026-09-10', to: '2026-09-14' };

    const first = await port.fetchReturns(window);
    const second = await port.fetchReturns(window);

    expect(second).toEqual(first);
  });

  it('dado um refundOrderId já ordenado quando orderRefund é chamado de novo então devolve o mesmo BankRefundReceipt, sem segunda ordem (item 4)', async () => {
    const clock = new FixedClock(CLOCK_INSTANT);
    const port = createMockBankPort(clock);
    const instruction: BankRefundInstruction = {
      refundOrderId: 'refund-0001',
      amount: '50.00',
      indexKey: 'IPCA-2026-09',
    };

    const first = await port.orderRefund(instruction);
    const second = await port.orderRefund(instruction);

    expect(second).toEqual(first);
    expect(second.bankReference).toMatch(/^BANKREF-MOCK-\d{20}$/);
    expect(second.orderedAt).toBe(new Date(CLOCK_INSTANT).toISOString());
  });

  it('dado duas instâncias do mock semeadas com retornos diferentes quando fetchReturns roda em cada então uma não vê os retornos semeados na outra (item 5: sem estado compartilhado entre instâncias)', async () => {
    const window: BankReturnWindow = { from: '2026-01-01', to: '2026-12-31' };
    const lineA: BankReturnLine = {
      bankReference: 'BANKREF-INST-A',
      barcode: null,
      pixReference: 'PIX-MOCK-A',
      paidOn: '2026-06-01',
      amount: '10.00',
    };
    const lineB: BankReturnLine = {
      bankReference: 'BANKREF-INST-B',
      barcode: null,
      pixReference: 'PIX-MOCK-B',
      paidOn: '2026-06-02',
      amount: '20.00',
    };
    const portA = createMockBankPort(new FixedClock(CLOCK_INSTANT), [lineA]);
    const portB = createMockBankPort(new FixedClock(CLOCK_INSTANT), [lineB]);

    const resultA = await portA.fetchReturns(window);
    const resultB = await portB.fetchReturns(window);

    expect(resultA).toEqual([lineA]);
    expect(resultB).toEqual([lineB]);
  });

  it('dado um fluxo completo de registerDocument, fetchReturns e orderRefund quando o mock roda então Date.now nunca é chamado (Clock injetado, CODESTYLE §TypeScript; item 5)', async () => {
    const dateNowSpy = vi.spyOn(Date, 'now');
    const clock = new FixedClock(CLOCK_INSTANT);
    const port = createMockBankPort(clock, [
      {
        bankReference: 'BANKREF-NO-DATE-NOW',
        barcode: null,
        pixReference: 'PIX-MOCK-6',
        paidOn: '2026-09-11',
        amount: '25.00',
      },
    ]);

    await port.registerDocument(makeRegistration('doc-0003'));
    await port.fetchReturns({ from: '2026-09-10', to: '2026-09-14' });
    await port.orderRefund({
      refundOrderId: 'refund-0002',
      amount: '25.00',
      indexKey: 'IPCA-2026-09',
    });

    expect(dateNowSpy).not.toHaveBeenCalled();
    dateNowSpy.mockRestore();
  });

  it('dado o mesmo fluxo completo quando o mock roda então nenhuma chamada de rede (fetch) é registrada (sem I/O; item 5)', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const clock = new FixedClock(CLOCK_INSTANT);
    const port = createMockBankPort(clock, [
      {
        bankReference: 'BANKREF-NO-IO',
        barcode: null,
        pixReference: 'PIX-MOCK-7',
        paidOn: '2026-09-11',
        amount: '35.00',
      },
    ]);

    await port.registerDocument(makeRegistration('doc-0004'));
    await port.fetchReturns({ from: '2026-09-10', to: '2026-09-14' });
    await port.orderRefund({
      refundOrderId: 'refund-0003',
      amount: '35.00',
      indexKey: 'IPCA-2026-09',
    });

    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});
