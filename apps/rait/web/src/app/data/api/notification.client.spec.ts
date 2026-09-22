// R-0012 TASK-0008 (Inspector). CTG-0002b.md §3.3, §8 (C-2B-10/11) —
// `data/api/notification.client.ts` ainda não existe (TASK-0009): falha de módulo esperada.
// `NotificationClient` cobre os 3 pares list/get (6 métodos); sem comandos (contrato §3.5 nota
// final: "InfractionClient e NotificationClient não têm comando" — a notificação é backoffice
// consumido, spec §14).
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { NotificationClient } from './notification.client';
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
    client: TestBed.inject(NotificationClient),
    httpMock: TestBed.inject(HttpTestingController),
  };
}

afterEach(() => {
  TestBed.inject(HttpTestingController).verify();
});

interface GetOp {
  readonly list: keyof NotificationClient;
  readonly get: keyof NotificationClient;
  readonly url: string;
  readonly collection: string;
}

const GET_OPS: readonly GetOp[] = [
  {
    list: 'listNotice',
    get: 'getNotice',
    url: '/v1/inf/notification/notices',
    collection: 'notices',
  },
  {
    list: 'listNoticeAcknowledgement',
    get: 'getNoticeAcknowledgement',
    url: '/v1/inf/notification/acknowledgements',
    collection: 'acknowledgements',
  },
  {
    list: 'listNoticeDeliveryAttempt',
    get: 'getNoticeDeliveryAttempt',
    url: '/v1/inf/notification/delivery-attempts',
    collection: 'delivery-attempts',
  },
];

describe('NotificationClient — leituras (C-2B-10)', () => {
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

describe('NotificationClient — leituras por id (C-2B-11)', () => {
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
