// R-0012 TASK-0008 (Inspector). CTG-0002b.md §3.3/§3.5, §8 (C-2B-10…12) —
// `data/api/collection.client.ts` ainda não existe (TASK-0009): falha de módulo esperada.
// `CollectionClient` cobre os 4 pares list/get (8 métodos) e os 4 comandos cuja col. 5 da
// tabela §3.5 começa por `CollectionClient.`.
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { CollectionClient } from './collection.client';
import { RaitCommandUnavailableError } from '../../core/error-boundary';
import {
  expectGetList,
  expectGetOne,
  etagFor,
} from '../../../testing/http-fixtures';
import { FIXED_ENTITY_ID } from '../../../testing/router-harness';

function setup() {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting()],
  });
  return {
    client: TestBed.inject(CollectionClient),
    httpMock: TestBed.inject(HttpTestingController),
  };
}

afterEach(() => {
  TestBed.inject(HttpTestingController).verify();
});

interface GetOp {
  readonly list: keyof CollectionClient;
  readonly get: keyof CollectionClient;
  readonly url: string;
  readonly collection: string;
}

const GET_OPS: readonly GetOp[] = [
  {
    list: 'listCollectionDocument',
    get: 'getCollectionDocument',
    url: '/v1/inf/collection/collection-documents',
    collection: 'collection-documents',
  },
  {
    list: 'listPayment',
    get: 'getPayment',
    url: '/v1/inf/collection/payments',
    collection: 'payments',
  },
  {
    list: 'listRefundOrder',
    get: 'getRefundOrder',
    url: '/v1/inf/collection/refund-orders',
    collection: 'refund-orders',
  },
  {
    list: 'listDebtHandoff',
    get: 'getDebtHandoff',
    url: '/v1/inf/collection/debt-handoffs',
    collection: 'debt-handoffs',
  },
];

describe('CollectionClient — leituras (C-2B-10)', () => {
  for (const op of GET_OPS) {
    it(`dado ${String(op.list)}() quando o servidor responde [] então exatamente uma requisição GET ${op.url} sem query e ListPage vazia`, async () => {
      const { client, httpMock } = setup();
      const method = client[op.list] as (query?: unknown) => Promise<{
        items: readonly unknown[];
        total: number;
      }>;
      const promise = method.call(client);
      await vi.waitFor(() => expectGetList(httpMock, op.url, []));
      const result = await promise;
      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
    });
  }
});

describe('CollectionClient — leituras por id (C-2B-11)', () => {
  for (const op of GET_OPS) {
    it(`dado ${String(op.get)}(id) quando o servidor responde 200 + ETag etagFor(1) então GET ${op.url}/id e etagOf('${op.collection}', id) === '"1"'`, async () => {
      const { client, httpMock } = setup();
      const method = client[op.get] as (id: string) => Promise<unknown>;
      const id = FIXED_ENTITY_ID;
      const promise = method.call(client, id);
      await vi.waitFor(() =>
        expectGetOne(httpMock, `${op.url}/${id}`, { id }, etagFor(1)),
      );
      await promise;
      expect(client.etagOf(op.collection as never, id)).toBe('"1"');
    });
  }
});

interface CommandOp {
  readonly method: keyof CollectionClient;
  readonly m8: string;
  readonly call: (client: CollectionClient) => Promise<unknown>;
}

const COMMAND_OPS: readonly CommandOp[] = [
  {
    method: 'issueDocument',
    m8: 'rait-collection:issue',
    call: (c) => c.issueDocument({} as never),
  },
  {
    method: 'orderRefund',
    m8: 'rait-refund:order',
    call: (c) => c.orderRefund(FIXED_ENTITY_ID, {} as never, null),
  },
  {
    method: 'handoffDebt',
    m8: 'rait-debt:handoff',
    call: (c) => c.handoffDebt({} as never),
  },
  {
    method: 'reconcilePayment',
    m8: 'rait-payment:reconcile',
    call: (c) => c.reconcilePayment(FIXED_ENTITY_ID, {} as never, null),
  },
];

describe('CollectionClient — comandos (C-2B-12, M8)', () => {
  it('dado cada método de comando da tabela §3.5 do cliente quando chamado com argumentos mínimos então rejeita com RaitCommandUnavailableError cujo command === M8 da linha e nenhuma requisição HTTP é feita', async () => {
    const { client, httpMock } = setup();
    for (const op of COMMAND_OPS) {
      await expect(op.call(client)).rejects.toBeInstanceOf(
        RaitCommandUnavailableError,
      );
      try {
        await op.call(client);
      } catch (error) {
        expect((error as RaitCommandUnavailableError).command).toBe(op.m8);
      }
    }
    httpMock.expectNone(() => true);
  });

  for (const op of COMMAND_OPS) {
    it.todo(
      `${String(op.method)} — comportamento real (R-0007 CTG-0004; OD-R12-027)`,
    );
  }
});
