// R-0012 TASK-0008 (Inspector). CTG-0002b.md §4.3, §8 (C-2B-24, 29) —
// `data/facades/session.facade.ts` (módulo colegiado; distinta de `core/session.facade.ts`
// `RaitSessionFacade`, contrato §4.3) ainda não existe (TASK-0009): falha de módulo esperada.
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { SessionFacade } from './session.facade';
import { RaitClock } from '../clock';
import { RaitStreamTransport } from '../../core/stream-transport';
import { RAIT_STREAM_EVENT_PREFIX } from '../../core/sse.service';
import { createClockStub } from '../../../testing/clock.stub';
import {
  createStreamTransportStub,
  streamFrame,
} from '../../../testing/stream-transport.stub';
import {
  SESSION_IDS,
  expectGetList,
  expectGetOne,
  etagFor,
  fixtureSession,
} from '../../../testing/http-fixtures';
import { FIXED_ENTITY_ID } from '../../../testing/router-harness';

function setup() {
  const transport = createStreamTransportStub();
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: RaitStreamTransport, useValue: transport },
      { provide: RaitClock, useValue: createClockStub() },
    ],
  });
  return {
    facade: TestBed.inject(SessionFacade),
    httpMock: TestBed.inject(HttpTestingController),
    transport,
  };
}

afterEach(() => {
  TestBed.inject(HttpTestingController).verify();
});

const COMMAND_METHODS: readonly (keyof SessionFacade)[] = [
  'openBatch',
  'drawBatch',
  'approveBatch',
  'acceptBatchItem',
  'impedeBatchItem',
  'registerOpinion',
  'closeAgenda',
  'openSession',
  'adjournSession',
  'vote',
  'castingVote',
  'requestView',
  'proclaim',
  'generateMinutes',
  'signMinutes',
  'publishMinutes',
  'confirmAttendance',
  'summonSubstitute',
  'registerViewVote',
  'conveneExtraordinary',
];

describe('SessionFacade — comandos (C-2B-24, M8)', () => {
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
      `SessionFacade.${String(method)} — comportamento real (R-0007 CTG-0004)`,
    );
  }
});

describe('SessionFacade — leituras (C-2B-29)', () => {
  it('dado loadSession(SESSION_IDS.ATA_ASSINADA) então bundle com items, attendance, votes, bench, minutes e cases; dado evento agenda-item.changed com sessionId igual então recarga', async () => {
    const { facade, httpMock, transport } = setup();
    const id = SESSION_IDS.ATA_ASSINADA;
    const promise = facade.loadSession(id);
    await vi.waitFor(() =>
      expectGetOne(
        httpMock,
        `/v1/inf/rait/sessions/${id}`,
        fixtureSession(id),
        etagFor(1),
      ),
    );
    await vi.waitFor(() =>
      expectGetList(httpMock, '/v1/inf/rait/agenda-items', []),
    );
    await vi.waitFor(() =>
      expectGetList(httpMock, '/v1/inf/rait/attendance', []),
    );
    await vi.waitFor(() => expectGetList(httpMock, '/v1/inf/rait/benches', []));
    await vi.waitFor(() => expectGetList(httpMock, '/v1/inf/rait/minutes', []));
    await promise;
    expect(facade.sessao.value()?.session.id).toBe(id);

    transport.current()?.next(
      streamFrame('1', `${RAIT_STREAM_EVENT_PREFIX}agenda-item.changed`, {
        type: 'agenda-item.changed',
        id: '1',
        aggregate: { kind: 'agenda-item', id: FIXED_ENTITY_ID, version: 2 },
        data: { sessionId: id, agendaItemId: FIXED_ENTITY_ID },
      }),
    );
    // A10 item e: §4.2 "invalidate + refresh" — o refresh do bundle refaz as 4 listas também
    // (agenda-items, attendance, benches, minutes), não só o GET da sessão.
    await vi.waitFor(() =>
      expectGetOne(
        httpMock,
        `/v1/inf/rait/sessions/${id}`,
        fixtureSession(id),
        etagFor(1),
      ),
    );
    await vi.waitFor(() =>
      expectGetList(httpMock, '/v1/inf/rait/agenda-items', []),
    );
    await vi.waitFor(() =>
      expectGetList(httpMock, '/v1/inf/rait/attendance', []),
    );
    await vi.waitFor(() => expectGetList(httpMock, '/v1/inf/rait/benches', []));
    await vi.waitFor(() => expectGetList(httpMock, '/v1/inf/rait/minutes', []));
  });

  it('dado loadBatches("jari") então GET pools → GET batches filtro pool_id', async () => {
    const { facade, httpMock } = setup();
    const promise = facade.loadBatches('jari');
    await vi.waitFor(() => expectGetList(httpMock, '/v1/inf/rait/pools', []));
    await vi.waitFor(() => expectGetList(httpMock, '/v1/inf/rait/batches', []));
    await promise;
    expect(facade.lotes.items()).toEqual([]);
  });

  it('dado loadCriticalClocks("jari") então relógios CRITICO (caso 18) com caso jari', async () => {
    const { facade, httpMock } = setup();
    const promise = facade.loadCriticalClocks('jari');
    await vi.waitFor(() => expectGetList(httpMock, '/v1/inf/rait/clocks', []));
    await vi.waitFor(() => expectGetList(httpMock, '/v1/inf/rait/cases', []));
    await promise;
    expect(facade.extraordinaria.items()).toEqual([]);
  });
});
