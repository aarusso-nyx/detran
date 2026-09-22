// R-0012 TASK-0008 (Inspector). CTG-0002b.md §4.3, §8 (C-2B-24, 30) —
// `data/facades/radar.facade.ts` ainda não existe (TASK-0009): falha de módulo esperada.
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { RadarFacade } from './radar.facade';
import { RaitClock } from '../clock';
import { RaitStreamTransport } from '../../core/stream-transport';
import { createClockStub } from '../../../testing/clock.stub';
import { createStreamTransportStub } from '../../../testing/stream-transport.stub';
import {
  CASE_IDS,
  expectGetList,
  expectGetOne,
  etagFor,
  fixtureCase,
} from '../../../testing/http-fixtures';
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
    facade: TestBed.inject(RadarFacade),
    httpMock: TestBed.inject(HttpTestingController),
  };
}

afterEach(() => {
  TestBed.inject(HttpTestingController).verify();
});

const COMMAND_METHODS: readonly (keyof RadarFacade)[] = [
  'reassign',
  'acknowledgeClockAlert',
  'declareExtinction',
];

describe('RadarFacade — comandos (C-2B-24, M8)', () => {
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
      `RadarFacade.${String(method)} — comportamento real (R-0007 CTG-0004)`,
    );
  }
});

describe('RadarFacade — leituras (C-2B-30)', () => {
  it('dado loadRadar() então radar.items() = relógios com flag ≠ "SEM_RISCO" na ordem recebida (o de caso 07 excluído); dado evento clock.flag-changed então recarga', async () => {
    const { facade, httpMock } = setup();
    const promise = facade.loadRadar();
    await vi.waitFor(() => expectGetList(httpMock, '/v1/inf/rait/clocks', []));
    await vi.waitFor(() => expectGetList(httpMock, '/v1/inf/rait/cases', []));
    await promise;
    expect(facade.radar.items()).toEqual([]);
  });

  it('dado loadDrilldown(CASE_IDS.EM_INSTRUCAO) então bundle com case + clocks/alerts/assignments/events do caso', async () => {
    const { facade, httpMock } = setup();
    const id = CASE_IDS.EM_INSTRUCAO;
    const promise = facade.loadDrilldown(id);
    // A10 item d: RadarCaseBundle inclui `case` (getRaitCase) — faltava o flush do GET do caso.
    await vi.waitFor(() =>
      expectGetOne(
        httpMock,
        `/v1/inf/rait/cases/${id}`,
        fixtureCase(id),
        etagFor(1),
      ),
    );
    await vi.waitFor(() => expectGetList(httpMock, '/v1/inf/rait/clocks', []));
    await vi.waitFor(() =>
      expectGetList(httpMock, '/v1/inf/rait/clock-alerts', []),
    );
    await vi.waitFor(() =>
      expectGetList(httpMock, '/v1/inf/rait/assignments', []),
    );
    await vi.waitFor(() => expectGetList(httpMock, '/v1/inf/rait/events', []));
    await promise;
    expect(facade.drilldown.value()?.case.id).toBe(id);
  });
});
