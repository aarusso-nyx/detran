// R-0012 TASK-0008 (Inspector). CTG-0002b.md §4.2/§4.3, §8 (C-2B-22…24, 32, 33) —
// `data/facades/case.facade.ts` ainda não existe (TASK-0009): falha de módulo esperada.
// `HttpTestingController` + clientes reais (Padrão de app 11); `SseService` real com
// `createStreamTransportStub` (M9/M10).
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { CaseFacade } from './case.facade';
import { RaitClock } from '../clock';
import {
  SseService,
  RAIT_STREAM_EVENT_PREFIX,
  POLLING_INTERVAL_MS,
} from '../../core/sse.service';
import { RaitStreamTransport } from '../../core/stream-transport';
import { createClockStub } from '../../../testing/clock.stub';
import {
  createStreamTransportStub,
  streamFrame,
} from '../../../testing/stream-transport.stub';
import {
  CASE_IDS,
  expectGetList,
  expectGetOne,
  etagFor,
  fixtureCase,
} from '../../../testing/http-fixtures';
import { FIXED_ENTITY_ID } from '../../../testing/router-harness';

function setup() {
  const transport = createStreamTransportStub();
  const clock = createClockStub();
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: RaitStreamTransport, useValue: transport },
      { provide: RaitClock, useValue: clock },
    ],
  });
  return {
    facade: TestBed.inject(CaseFacade),
    httpMock: TestBed.inject(HttpTestingController),
    transport,
    clock,
    sse: TestBed.inject(SseService),
  };
}

// A10 item b: `HttpTestingController.verify()` só nos `describe` que chamam `setup()`
// (configuram o módulo) — C-2B-33 varre o código-fonte e não configura TestBed; um `afterEach`
// global lançava NG0201 nesse `it` e derrubava a suíte em cascata.
function verifyNoOutstandingRequests(): void {
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });
}

describe('CaseFacade.loadCaseBundle (C-2B-22)', () => {
  verifyNoOutstandingRequests();
  it('dado loadCaseBundle(CASE_IDS.EM_INSTRUCAO) quando o servidor responde GET cases/<id> (ETag \'"3"\'), GET parties, GET clocks, GET deadlines (arrays vazios) então caso.value() = o caso com status "ready", e partes/relogios/prazos com status "empty" (total 0, §4.1 emptyWhen); segunda chamada dentro do TTL → nenhuma requisição', async () => {
    const { facade, httpMock } = setup();
    const id = CASE_IDS.EM_INSTRUCAO;
    const promise = facade.loadCaseBundle(id);
    await vi.waitFor(() =>
      expectGetOne(
        httpMock,
        `/v1/inf/rait/cases/${id}`,
        fixtureCase(id),
        etagFor(3),
      ),
    );
    await vi.waitFor(() => expectGetList(httpMock, '/v1/inf/rait/parties', []));
    await vi.waitFor(() => expectGetList(httpMock, '/v1/inf/rait/clocks', []));
    await vi.waitFor(() =>
      expectGetList(httpMock, '/v1/inf/rait/deadlines', []),
    );
    await promise;

    expect(facade.caso.value()).toEqual(fixtureCase(id));
    expect(facade.caso.status()).toBe('ready');
    // A10 item j: contrato §4.1 prevalece — lista [] (total 0) → status 'empty' (emptyWhen),
    // nunca 'ready'.
    expect(facade.partes.status()).toBe('empty');
    expect(facade.relogios.status()).toBe('empty');
    expect(facade.prazos.status()).toBe('empty');

    // segunda chamada dentro do TTL: nenhuma requisição nova
    await facade.loadCaseBundle(id);
    httpMock.expectNone(() => true);
  });
});

describe('CaseFacade — invalidação por SSE (C-2B-23)', () => {
  verifyNoOutstandingRequests();
  it('dado CaseFacade com caso carregado quando o transporte emite case.changed com aggregate.id = caseId então caso é invalidado e recarregado (nova GET cases/<id>); dado evento de outro caso então nenhuma requisição [negativo]', async () => {
    const { facade, httpMock, transport } = setup();
    const id = CASE_IDS.EM_INSTRUCAO;
    const promise = facade.loadCase(id);
    await vi.waitFor(() =>
      expectGetOne(
        httpMock,
        `/v1/inf/rait/cases/${id}`,
        fixtureCase(id),
        etagFor(2),
      ),
    );
    await promise;

    transport.current()?.next(
      streamFrame('1', `${RAIT_STREAM_EVENT_PREFIX}case.changed`, {
        type: 'case.changed',
        id: '1',
        aggregate: { kind: 'case', id: FIXED_ENTITY_ID, version: 2 },
        data: { caseId: FIXED_ENTITY_ID },
      }),
    );
    httpMock.expectNone(() => true); // outro caso — nenhuma requisição [negativo]

    transport.current()?.next(
      streamFrame('2', `${RAIT_STREAM_EVENT_PREFIX}case.changed`, {
        type: 'case.changed',
        id: '2',
        aggregate: { kind: 'case', id, version: 3 },
        data: { caseId: id },
      }),
    );
    await vi.waitFor(() =>
      expectGetOne(
        httpMock,
        `/v1/inf/rait/cases/${id}`,
        fixtureCase(id),
        etagFor(3),
      ),
    );
  });
});

describe('CaseFacade — comandos (C-2B-24, M8)', () => {
  verifyNoOutstandingRequests();
  const COMMAND_METHODS: readonly (keyof CaseFacade)[] = [
    'triage',
    'admit',
    'reject',
    'openInquiry',
    'answerInquiry',
    'extendInquiry',
    'submitDraft',
    'signDecision',
    'returnDraft',
    'attachOfficialDocument',
    'declareImpediment',
    'registerSuspicion',
    'decideImpediment',
    'authorityDecide',
    'waive',
    'declareExtinction',
  ];

  it('dado cada método de comando da lista da facade quando chamado então resolve { ok: false, error.kind "unavailable", error.command = M8 do cliente } e command.error() idêntico, sem requisição HTTP', async () => {
    const { facade, httpMock } = setup();
    for (const method of COMMAND_METHODS) {
      const call = facade[method] as (...args: unknown[]) => Promise<unknown>;
      const outcome = (await call.call(facade, FIXED_ENTITY_ID, {}, null)) as {
        ok: boolean;
        error?: { kind: string };
      };
      expect(outcome.ok).toBe(false);
      expect(outcome.error?.kind).toBe('unavailable');
      expect(facade.command.error()).toEqual(outcome.error);
    }
    httpMock.expectNone(() => true);
  });

  for (const method of COMMAND_METHODS) {
    it.todo(
      `CaseFacade.${String(method)} — comportamento real (R-0007 CTG-0004)`,
    );
  }
});

describe('CaseFacade — polling (C-2B-32)', () => {
  verifyNoOutstandingRequests();
  it('dado slot carregado quando o transporte falha duas vezes em 60 s (polling) e o clock avança POLLING_INTERVAL_MS (tick$) então o slot é recarregado (refresh)', async () => {
    const { facade, httpMock, transport } = setup();
    const id = CASE_IDS.EM_INSTRUCAO;
    const promise = facade.loadCase(id);
    await vi.waitFor(() =>
      expectGetOne(
        httpMock,
        `/v1/inf/rait/cases/${id}`,
        fixtureCase(id),
        etagFor(1),
      ),
    );
    await promise;

    vi.useFakeTimers();
    transport.current()?.error(new Error('falha 1'));
    vi.advanceTimersByTime(1_000);
    transport.current()?.error(new Error('falha 2'));
    vi.advanceTimersByTime(POLLING_INTERVAL_MS);
    vi.useRealTimers();

    await vi.waitFor(() =>
      expectGetOne(
        httpMock,
        `/v1/inf/rait/cases/${id}`,
        fixtureCase(id),
        etagFor(1),
      ),
    );
  });
});

describe('data/facades/*.ts — sem aritmética de data nem ordenação (C-2B-33) [negativo]', () => {
  it('dado o código-fonte de data/facades/*.ts quando varrido então não contém "new Date", "Date.now", ".sort(" nem ".localeCompare("', () => {
    const dir = join(__dirname);
    const files = readdirSync(dir).filter((name) =>
      name.endsWith('.facade.ts'),
    );
    const offenders: string[] = [];
    const forbidden = ['new Date', 'Date.now', '.sort(', '.localeCompare('];
    for (const file of files) {
      const text = readFileSync(join(dir, file), 'utf8');
      for (const pattern of forbidden) {
        if (text.includes(pattern)) offenders.push(`${file}: ${pattern}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
