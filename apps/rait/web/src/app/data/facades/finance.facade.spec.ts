// R-0012 TASK-0008 (Inspector). CTG-0002b.md §4.3, §8 (C-2B-24, 31) — `data/facades/finance.facade.ts`
// ainda não existe (TASK-0009): falha de módulo esperada. Páginas L0 (`financeiro/*`).
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { FinanceFacade } from './finance.facade';
import { RaitClock } from '../clock';
import { RaitStreamTransport } from '../../core/stream-transport';
import { createClockStub } from '../../../testing/clock.stub';
import { createStreamTransportStub } from '../../../testing/stream-transport.stub';
import { expectGetList } from '../../../testing/http-fixtures';
import { FIXED_ENTITY_ID } from '../../../testing/router-harness';

function setup() {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: RaitStreamTransport, useValue: createStreamTransportStub() },
      { provide: RaitClock, useValue: createClockStub() },
    ],
  });
  return {
    facade: TestBed.inject(FinanceFacade),
    httpMock: TestBed.inject(HttpTestingController),
  };
}

afterEach(() => {
  TestBed.inject(HttpTestingController).verify();
});

const COMMAND_METHODS: readonly (keyof FinanceFacade)[] = [
  'issueDocument',
  'orderRefund',
  'handoffDebt',
  'reconcilePayment',
];

describe('FinanceFacade — comandos (C-2B-24, M8)', () => {
  it('dado cada método de comando da lista da facade quando chamado então resolve { ok: false, error.kind "unavailable" }, sem requisição HTTP', async () => {
    const { facade, httpMock } = setup();
    for (const method of COMMAND_METHODS) {
      const call = facade[method] as (...args: unknown[]) => Promise<unknown>;
      const outcome = (await call.call(facade, FIXED_ENTITY_ID, {}, null)) as {
        ok: boolean;
        error?: { kind: string };
      };
      expect(outcome.ok).toBe(false);
      expect(outcome.error?.kind).toBe('unavailable');
    }
    httpMock.expectNone(() => true);
  });

  for (const method of COMMAND_METHODS) {
    it.todo(
      `FinanceFacade.${String(method)} — comportamento real (R-0007 CTG-0004; OD-R12-027)`,
    );
  }
});

describe('FinanceFacade — leituras (C-2B-31)', () => {
  it('dado loadCollectionDocuments()/loadPayments()/loadRefundOrders()/loadDebtHandoffs() quando carregadas com [] então cada slot "empty" (total 0, §4.1 emptyWhen) e a URL literal da tabela §3.3', async () => {
    const { facade, httpMock } = setup();

    const documents = facade.loadCollectionDocuments();
    await vi.waitFor(() =>
      expectGetList(httpMock, '/v1/inf/collection/collection-documents', []),
    );
    await documents;
    // A10 item j: contrato §4.1 prevalece — lista [] (total 0) → status 'empty'.
    expect(facade.documentos.status()).toBe('empty');

    const payments = facade.loadPayments();
    await vi.waitFor(() =>
      expectGetList(httpMock, '/v1/inf/collection/payments', []),
    );
    await payments;
    expect(facade.pagamentos.status()).toBe('empty');

    const refunds = facade.loadRefundOrders();
    await vi.waitFor(() =>
      expectGetList(httpMock, '/v1/inf/collection/refund-orders', []),
    );
    await refunds;
    expect(facade.restituicoes.status()).toBe('empty');

    const handoffs = facade.loadDebtHandoffs();
    await vi.waitFor(() =>
      expectGetList(httpMock, '/v1/inf/collection/debt-handoffs', []),
    );
    await handoffs;
    expect(facade.cobrancas.status()).toBe('empty');
  });
});
