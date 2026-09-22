// R-0012 TASK-0008 (Inspector). CTG-0002b.md §4.3, §8 (C-2B-24, 27) —
// `data/facades/protocol.facade.ts` ainda não existe (TASK-0009): falha de módulo esperada.
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ProtocolFacade } from './protocol.facade';
import { RaitClock } from '../clock';
import { RaitStreamTransport } from '../../core/stream-transport';
import { createClockStub } from '../../../testing/clock.stub';
import { createStreamTransportStub } from '../../../testing/stream-transport.stub';
import {
  CASE_IDS,
  expectGetList,
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
    facade: TestBed.inject(ProtocolFacade),
    httpMock: TestBed.inject(HttpTestingController),
  };
}

afterEach(() => {
  TestBed.inject(HttpTestingController).verify();
});

const COMMAND_METHODS: readonly (keyof ProtocolFacade)[] = [
  'protocol',
  'resolvePendingContent',
  'remitJari',
  'receiveJudgingBody',
  'redirect',
  'withdraw',
];

describe('ProtocolFacade — comandos (C-2B-24, M8)', () => {
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
      `ProtocolFacade.${String(method)} — comportamento real (R-0007 CTG-0004)`,
    );
  }
});

describe('ProtocolFacade — leituras (C-2B-27)', () => {
  it('dado loadIntake() então filtro state "PROTOCOLADO" (caso 01)', async () => {
    const { facade, httpMock } = setup();
    const allCases = Object.values(CASE_IDS).map((id) => fixtureCase(id));
    const promise = facade.loadIntake();
    await vi.waitFor(() =>
      expectGetList(httpMock, '/v1/inf/rait/cases', allCases),
    );
    await promise;
    expect(facade.intake.items().map((entry) => entry.protocol_number)).toEqual(
      ['RAIT-2026-000001'],
    );
  });

  it('dado loadRemittances() então casos AGUARDANDO_REMESSA_JARI (caso 05) e deadlines T-REM10 do caso', async () => {
    const { facade, httpMock } = setup();
    const allCases = Object.values(CASE_IDS).map((id) => fixtureCase(id));
    const promise = facade.loadRemittances();
    await vi.waitFor(() =>
      expectGetList(httpMock, '/v1/inf/rait/cases', allCases),
    );
    await vi.waitFor(() =>
      expectGetList(httpMock, '/v1/inf/rait/deadlines', []),
    );
    await promise;
    expect(
      facade.remessas.items().map((entry) => entry.protocol_number),
    ).toEqual(['RAIT-2026-000005']);
  });

  it('dado findCaseByProtocol("RAIT-2026-000016") então desistenciaCaso = caso 16', async () => {
    const { facade, httpMock } = setup();
    const allCases = Object.values(CASE_IDS).map((id) => fixtureCase(id));
    const promise = facade.findCaseByProtocol('RAIT-2026-000016');
    await vi.waitFor(() =>
      expectGetList(httpMock, '/v1/inf/rait/cases', allCases),
    );
    await promise;
    expect(facade.desistenciaCaso.value()?.protocol_number).toBe(
      'RAIT-2026-000016',
    );
  });
});
