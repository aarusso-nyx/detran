// R-0012 TASK-0008 (Inspector). CTG-0002b.md §3.3/§3.5, §8 (C-2B-10…12) — `data/api/session.client.ts`
// ainda não existe (TASK-0009): falha de módulo esperada. `SessionClient` (colegiado, §3.4 —
// distinto do `RaitSessionFacade` do núcleo) cobre os 5 pares list/get (10 métodos) e os 15
// comandos cuja col. 5 da tabela §3.5 começa por `SessionClient.`.
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { SessionClient } from './session.client';
import { RaitCommandUnavailableError } from '../../core/error-boundary';
import {
  expectGetList,
  expectGetOne,
  etagFor,
  SESSION_IDS,
} from '../../../testing/http-fixtures';
import { FIXED_ENTITY_ID } from '../../../testing/router-harness';

function setup() {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting()],
  });
  return {
    client: TestBed.inject(SessionClient),
    httpMock: TestBed.inject(HttpTestingController),
  };
}

afterEach(() => {
  TestBed.inject(HttpTestingController).verify();
});

interface GetOp {
  readonly list: keyof SessionClient;
  readonly get: keyof SessionClient;
  readonly url: string;
  readonly collection: string;
}

const GET_OPS: readonly GetOp[] = [
  {
    list: 'listRaitSession',
    get: 'getRaitSession',
    url: '/v1/inf/rait/sessions',
    collection: 'sessions',
  },
  {
    list: 'listRaitAgendaItem',
    get: 'getRaitAgendaItem',
    url: '/v1/inf/rait/agenda-items',
    collection: 'agenda-items',
  },
  {
    list: 'listRaitAttendance',
    get: 'getRaitAttendance',
    url: '/v1/inf/rait/attendance',
    collection: 'attendance',
  },
  {
    list: 'listRaitVote',
    get: 'getRaitVote',
    url: '/v1/inf/rait/votes',
    collection: 'votes',
  },
  {
    list: 'listRaitMinutes',
    get: 'getRaitMinutes',
    url: '/v1/inf/rait/minutes',
    collection: 'minutes',
  },
];

describe('SessionClient — leituras (C-2B-10)', () => {
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

  it('dado listRaitSession() quando o servidor responde os 4 SESSION_IDS então ListPage com 4 itens (ordem recebida) [uso real da fixture]', async () => {
    const { client, httpMock } = setup();
    const bodies = Object.values(SESSION_IDS).map((id) => ({ id }));
    const promise = client.listRaitSession();
    await vi.waitFor(() =>
      expectGetList(httpMock, '/v1/inf/rait/sessions', bodies),
    );
    const result = await promise;
    expect(result.items).toHaveLength(4);
  });
});

describe('SessionClient — leituras por id (C-2B-11)', () => {
  for (const op of GET_OPS) {
    it(`dado ${String(op.get)}(id) quando o servidor responde 200 + ETag etagFor(1) então GET ${op.url}/id e etagOf('${op.collection}', id) === '"1"'`, async () => {
      const { client, httpMock } = setup();
      const method = client[op.get] as (id: string) => Promise<unknown>;
      const id =
        op.collection === 'sessions'
          ? SESSION_IDS.SESSAO_ABERTA
          : FIXED_ENTITY_ID;
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
  readonly method: keyof SessionClient;
  readonly m8: string;
  readonly call: (client: SessionClient) => Promise<unknown>;
  readonly fonte: '§7' | 'ficha';
}

const COMMAND_OPS: readonly CommandOp[] = [
  {
    method: 'registerOpinion',
    m8: 'rait-opinion:register',
    call: (c) =>
      c.registerOpinion(
        FIXED_ENTITY_ID,
        {
          opinion_summary: 'x',
          opinion_analysis: 'y',
          opinion_vote: 'provimento',
        } as never,
        null,
      ),
    fonte: '§7',
  },
  {
    method: 'closeAgenda',
    m8: 'rait-agenda:close',
    call: (c) => c.closeAgenda(SESSION_IDS.PAUTA_FECHADA, {} as never, null),
    fonte: '§7',
  },
  {
    method: 'openSession',
    m8: 'rait-session:open',
    call: (c) => c.openSession(SESSION_IDS.FORMANDO_PAUTA, {} as never, null),
    fonte: '§7',
  },
  {
    method: 'adjournSession',
    m8: 'rait-session:adjourn',
    call: (c) => c.adjournSession(SESSION_IDS.SESSAO_ABERTA, {} as never, null),
    fonte: '§7',
  },
  {
    method: 'vote',
    m8: 'rait-session:vote',
    call: (c) => c.vote({} as never),
    fonte: '§7',
  },
  {
    method: 'castingVote',
    m8: 'rait-session:casting-vote',
    call: (c) => c.castingVote({} as never),
    fonte: '§7',
  },
  {
    method: 'requestView',
    m8: 'rait-session:view-request',
    call: (c) => c.requestView(FIXED_ENTITY_ID, {} as never, null),
    fonte: '§7',
  },
  {
    method: 'proclaim',
    m8: 'rait-session:proclaim',
    call: (c) => c.proclaim(FIXED_ENTITY_ID, {} as never, null),
    fonte: '§7',
  },
  {
    method: 'generateMinutes',
    m8: 'rait-minutes:generate',
    call: (c) => c.generateMinutes({} as never),
    fonte: '§7',
  },
  {
    method: 'signMinutes',
    m8: 'rait-minutes:sign',
    call: (c) => c.signMinutes(FIXED_ENTITY_ID, {} as never, null),
    fonte: '§7',
  },
  {
    method: 'publishMinutes',
    m8: 'rait-minutes:publish',
    call: (c) => c.publishMinutes(FIXED_ENTITY_ID, {} as never, null),
    fonte: '§7',
  },
  {
    method: 'confirmAttendance',
    m8: 'rait-attendance:confirm',
    call: (c) => c.confirmAttendance({} as never),
    fonte: 'ficha',
  },
  {
    method: 'summonSubstitute',
    m8: 'rait-attendance:summon-substitute',
    call: (c) => c.summonSubstitute({} as never),
    fonte: 'ficha',
  },
  {
    method: 'registerViewVote',
    m8: 'rait-session:register-view-vote',
    call: (c) =>
      c.registerViewVote(
        FIXED_ENTITY_ID,
        { opinion_vote: 'provimento' } as never,
        null,
      ),
    fonte: 'ficha',
  },
  {
    method: 'conveneExtraordinary',
    m8: 'rait-session:convene-extraordinary',
    call: (c) => c.conveneExtraordinary({} as never),
    fonte: 'ficha',
  },
];

describe('SessionClient — comandos (C-2B-12, M8)', () => {
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
