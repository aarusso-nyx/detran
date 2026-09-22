// R-0012 TASK-0008 (Inspector). CTG-0002b.md §3.3/§3.5, §8 (C-2B-10…12) — `data/api/worklist.client.ts`
// ainda não existe (TASK-0009): falha de módulo esperada. `WorklistClient` cobre os 13 pares
// list/get (26 métodos) e os 16 comandos cuja col. 5 da tabela §3.5 começa por `WorklistClient.`.
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { WorklistClient } from './worklist.client';
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
    client: TestBed.inject(WorklistClient),
    httpMock: TestBed.inject(HttpTestingController),
  };
}

afterEach(() => {
  TestBed.inject(HttpTestingController).verify();
});

interface GetOp {
  readonly list: keyof WorklistClient;
  readonly get: keyof WorklistClient;
  readonly url: string;
  readonly collection: string;
}

const GET_OPS: readonly GetOp[] = [
  {
    list: 'listRaitUnit',
    get: 'getRaitUnit',
    url: '/v1/inf/rait/units',
    collection: 'units',
  },
  {
    list: 'listRaitPool',
    get: 'getRaitPool',
    url: '/v1/inf/rait/pools',
    collection: 'pools',
  },
  {
    list: 'listRaitPoolMember',
    get: 'getRaitPoolMember',
    url: '/v1/inf/rait/pool-members',
    collection: 'pool-members',
  },
  {
    list: 'listRaitSchedule',
    get: 'getRaitSchedule',
    url: '/v1/inf/rait/schedules',
    collection: 'schedules',
  },
  {
    list: 'listRaitScheduleSlot',
    get: 'getRaitScheduleSlot',
    url: '/v1/inf/rait/schedule-slots',
    collection: 'schedule-slots',
  },
  {
    list: 'listRaitBatch',
    get: 'getRaitBatch',
    url: '/v1/inf/rait/batches',
    collection: 'batches',
  },
  {
    list: 'listRaitBatchItem',
    get: 'getRaitBatchItem',
    url: '/v1/inf/rait/batch-items',
    collection: 'batch-items',
  },
  {
    list: 'listRaitAssignment',
    get: 'getRaitAssignment',
    url: '/v1/inf/rait/assignments',
    collection: 'assignments',
  },
  {
    list: 'listRaitImpediment',
    get: 'getRaitImpediment',
    url: '/v1/inf/rait/impediments',
    collection: 'impediments',
  },
  {
    list: 'listRaitSubstituteDuty',
    get: 'getRaitSubstituteDuty',
    url: '/v1/inf/rait/substitute-duties',
    collection: 'substitute-duties',
  },
  {
    list: 'listRaitBench',
    get: 'getRaitBench',
    url: '/v1/inf/rait/benches',
    collection: 'benches',
  },
  {
    list: 'listRaitClock',
    get: 'getRaitClock',
    url: '/v1/inf/rait/clocks',
    collection: 'clocks',
  },
  {
    list: 'listRaitClockAlert',
    get: 'getRaitClockAlert',
    url: '/v1/inf/rait/clock-alerts',
    collection: 'clock-alerts',
  },
];

describe('WorklistClient — leituras (C-2B-10)', () => {
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

describe('WorklistClient — leituras por id (C-2B-11)', () => {
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
  readonly method: keyof WorklistClient;
  readonly m8: string;
  readonly call: (client: WorklistClient) => Promise<unknown>;
  readonly fonte: '§7' | 'ficha';
}

const COMMAND_OPS: readonly CommandOp[] = [
  {
    method: 'claimNext',
    m8: 'rait-case:claim-next',
    call: (c) => c.claimNext(FIXED_ENTITY_ID, {} as never),
    fonte: '§7',
  },
  {
    method: 'openBatch',
    m8: 'rait-batch:open',
    call: (c) => c.openBatch({} as never),
    fonte: '§7',
  },
  {
    method: 'drawBatch',
    m8: 'rait-batch:draw',
    call: (c) => c.drawBatch(FIXED_ENTITY_ID, {} as never, null),
    fonte: '§7',
  },
  {
    method: 'approveBatch',
    m8: 'rait-batch:approve',
    call: (c) => c.approveBatch(FIXED_ENTITY_ID, {} as never, null),
    fonte: '§7',
  },
  {
    method: 'acceptBatchItem',
    m8: 'rait-batch:accept',
    call: (c) =>
      c.acceptBatchItem(FIXED_ENTITY_ID, FIXED_ENTITY_ID, {} as never, null),
    fonte: '§7',
  },
  {
    method: 'impedeBatchItem',
    m8: 'rait-batch:impede',
    call: (c) =>
      c.impedeBatchItem(
        FIXED_ENTITY_ID,
        FIXED_ENTITY_ID,
        { decline_kind: 'impedimento' } as never,
        null,
      ),
    fonte: '§7',
  },
  {
    method: 'reassign',
    m8: 'rait-assignment:reassign',
    call: (c) =>
      c.reassign(
        FIXED_ENTITY_ID,
        {
          release_reason: 'source_pending',
          member_id: FIXED_ENTITY_ID,
        } as never,
        null,
      ),
    fonte: '§7',
  },
  {
    method: 'declareImpediment',
    m8: 'rait-impediment:declare',
    call: (c) => c.declareImpediment({} as never),
    fonte: '§7',
  },
  {
    method: 'registerSuspicion',
    m8: 'rait-impediment:suspicion',
    call: (c) => c.registerSuspicion({} as never),
    fonte: '§7',
  },
  {
    method: 'publishSchedule',
    m8: 'rait-schedule:publish',
    call: (c) => c.publishSchedule({} as never),
    fonte: '§7',
  },
  {
    method: 'registerMandate',
    m8: 'rait-member:mandate',
    call: (c) => c.registerMandate({} as never),
    fonte: '§7',
  },
  {
    method: 'constituteUnit',
    m8: 'rait-unit:constitute',
    call: (c) => c.constituteUnit({} as never),
    fonte: '§7',
  },
  {
    method: 'activateUnit',
    m8: 'rait-unit:activate',
    call: (c) => c.activateUnit(FIXED_ENTITY_ID, {} as never, null),
    fonte: '§7',
  },
  {
    method: 'acknowledgeClockAlert',
    m8: 'rait-clock:acknowledge-alert',
    call: (c) => c.acknowledgeClockAlert(FIXED_ENTITY_ID, {} as never, null),
    fonte: '§7',
  },
  {
    method: 'decideImpediment',
    m8: 'rait-impediment:decide',
    call: (c) =>
      c.decideImpediment(
        FIXED_ENTITY_ID,
        { decided_by: FIXED_ENTITY_ID } as never,
        null,
      ),
    fonte: 'ficha',
  },
  {
    method: 'updatePool',
    m8: 'rait-pool:update',
    call: (c) =>
      c.updatePool(
        FIXED_ENTITY_ID,
        { strategy: 'pull', active: true } as never,
        null,
      ),
    fonte: 'ficha',
  },
];

describe('WorklistClient — comandos (C-2B-12, M8)', () => {
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
