// R-0012 TASK-0008 (Inspector). CTG-0002b.md §3.3/§3.5, §8 (C-2B-10…12) — `data/api/org.client.ts`
// ainda não existe (TASK-0009): falha de módulo esperada. `OrgClient` cobre os 8 pares list/get
// (16 métodos) e os 8 comandos cuja col. 5 da tabela §3.5 começa por `OrgClient.`.
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { OrgClient } from './org.client';
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
    client: TestBed.inject(OrgClient),
    httpMock: TestBed.inject(HttpTestingController),
  };
}

afterEach(() => {
  TestBed.inject(HttpTestingController).verify();
});

interface GetOp {
  readonly list: keyof OrgClient;
  readonly get: keyof OrgClient;
  readonly url: string;
  readonly collection: string;
}

const GET_OPS: readonly GetOp[] = [
  {
    list: 'listRaitHoliday',
    get: 'getRaitHoliday',
    url: '/v1/inf/rait/holidays',
    collection: 'holidays',
  },
  {
    list: 'listRaitSuspensionAct',
    get: 'getRaitSuspensionAct',
    url: '/v1/inf/rait/suspension-acts',
    collection: 'suspension-acts',
  },
  {
    list: 'listRaitJetonSheet',
    get: 'getRaitJetonSheet',
    url: '/v1/inf/rait/jeton-sheets',
    collection: 'jeton-sheets',
  },
  {
    list: 'listRaitJetonLine',
    get: 'getRaitJetonLine',
    url: '/v1/inf/rait/jeton-lines',
    collection: 'jeton-lines',
  },
  {
    list: 'listRaitIncident',
    get: 'getRaitIncident',
    url: '/v1/inf/rait/incidents',
    collection: 'incidents',
  },
  {
    list: 'listRaitQualitySample',
    get: 'getRaitQualitySample',
    url: '/v1/inf/rait/quality-samples',
    collection: 'quality-samples',
  },
  {
    list: 'listRaitCapacityPlan',
    get: 'getRaitCapacityPlan',
    url: '/v1/inf/rait/capacity-plans',
    collection: 'capacity-plans',
  },
  {
    list: 'listRaitExport',
    get: 'getRaitExport',
    url: '/v1/inf/rait/exports',
    collection: 'exports',
  },
];

describe('OrgClient — leituras (C-2B-10)', () => {
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

describe('OrgClient — leituras por id (C-2B-11)', () => {
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
  readonly method: keyof OrgClient;
  readonly m8: string;
  readonly call: (client: OrgClient) => Promise<unknown>;
  readonly fonte: '§7' | 'ficha';
}

const COMMAND_OPS: readonly CommandOp[] = [
  {
    method: 'generateJetonSheet',
    m8: 'rait-jeton:generate',
    call: (c) => c.generateJetonSheet({} as never),
    fonte: '§7',
  },
  {
    method: 'approveJetonSheet',
    m8: 'rait-jeton:approve',
    call: (c) => c.approveJetonSheet(FIXED_ENTITY_ID, {} as never, null),
    fonte: '§7',
  },
  {
    method: 'createSuspensionAct',
    m8: 'rait-suspension-act:create',
    call: (c) => c.createSuspensionAct({} as never),
    fonte: '§7',
  },
  {
    method: 'updateParameter',
    m8: 'rait-parameter:update',
    call: (c) =>
      c.updateParameter(
        'source_pending',
        { value: null, effective_from: 'source_pending' } as never,
        null,
      ),
    fonte: '§7',
  },
  {
    method: 'createExport',
    m8: 'rait-export:create',
    call: (c) => c.createExport({} as never),
    fonte: '§7',
  },
  {
    method: 'publishCapacityPlan',
    m8: 'rait-capacity-plan:publish',
    call: (c) => c.publishCapacityPlan(FIXED_ENTITY_ID, {} as never, null),
    fonte: 'ficha',
  },
  {
    method: 'reviewQualitySample',
    m8: 'rait-quality-sample:review',
    call: (c) =>
      c.reviewQualitySample(
        FIXED_ENTITY_ID,
        {
          finding_kind: 'fundamento',
          finding_note: 'x',
          systemic: false,
        } as never,
        null,
      ),
    fonte: 'ficha',
  },
  {
    method: 'updateCalendar',
    m8: 'rait-calendar:update',
    call: (c) => c.updateCalendar([] as never),
    fonte: 'ficha',
  },
];

describe('OrgClient — comandos (C-2B-12, M8)', () => {
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
      `${String(op.method)} — comportamento real (R-0007 CTG-0004${op.fonte === 'ficha' ? '; OD-R12-027' : ''})`,
    );
  }
});
