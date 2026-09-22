// R-0012 TASK-0008 (Inspector). CTG-0002b.md §4.3, §8 (C-2B-24…26) —
// `data/facades/queue.facade.ts` ainda não existe (TASK-0009): falha de módulo esperada.
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { QueueFacade } from './queue.facade';
import { RaitClock } from '../clock';
import { RaitStreamTransport } from '../../core/stream-transport';
import { createClockStub } from '../../../testing/clock.stub';
import { createStreamTransportStub } from '../../../testing/stream-transport.stub';
import {
  CASE_IDS,
  POOL_IDS,
  expectGetList,
  fixtureCase,
} from '../../../testing/http-fixtures';

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
    facade: TestBed.inject(QueueFacade),
    httpMock: TestBed.inject(HttpTestingController),
  };
}

afterEach(() => {
  TestBed.inject(HttpTestingController).verify();
});

describe('QueueFacade — comandos (C-2B-24, M8)', () => {
  it('dado claimNext quando chamado então resolve { ok: false, error.kind "unavailable", error.command "rait-case:claim-next" }, sem requisição HTTP', async () => {
    const { facade, httpMock } = setup();
    const outcome = (await facade.claimNext(POOL_IDS.defesa_previa, {})) as {
      ok: boolean;
      error?: { kind: string; command?: string };
    };
    expect(outcome.ok).toBe(false);
    expect(outcome.error?.kind).toBe('unavailable');
    expect(outcome.error?.command).toBe('rait-case:claim-next');
    httpMock.expectNone(() => true);
  });

  it.todo('QueueFacade.claimNext — comportamento real (R-0007 CTG-0004)');
});

describe('QueueFacade.loadDefenseQueue / loadRapporteurQueue (C-2B-25)', () => {
  it('dado loadDefenseQueue() quando 200 com os 20 casos então filaDefesa.items() = só instance "defesa_previa" e state "ADMITIDO" (caso 04) na ordem recebida', async () => {
    const { facade, httpMock } = setup();
    const allCases = Object.values(CASE_IDS).map((id) => fixtureCase(id));
    const promise = facade.loadDefenseQueue();
    await vi.waitFor(() =>
      expectGetList(httpMock, '/v1/inf/rait/cases', allCases),
    );
    await promise;
    expect(
      facade.filaDefesa.items().map((entry) => entry.protocol_number),
    ).toEqual(['RAIT-2026-000004']);
  });

  it('dado loadRapporteurQueue("jari") então GET pools (filtra instance jari → POOL_IDS.jari) e GET assignments (filtra pool_id e active) — sem filtro por membro (OD-R12-021)', async () => {
    const { facade, httpMock } = setup();
    const promise = facade.loadRapporteurQueue('jari');
    await vi.waitFor(() => expectGetList(httpMock, '/v1/inf/rait/pools', []));
    await vi.waitFor(() =>
      expectGetList(httpMock, '/v1/inf/rait/assignments', []),
    );
    await promise;
    expect(facade.filaRelator.items()).toEqual([]);
  });
});

describe('QueueFacade.loadShiftSummary (C-2B-26)', () => {
  it('dado loadShiftSummary() quando as listas respondem então painel.value() = { queued, inInquiry, resumable, openAlerts } e nenhum campo "vencendo em N dias" existe no tipo ShiftSummary (OD-R12-031) [negativo]', async () => {
    const { facade, httpMock } = setup();
    const promise = facade.loadShiftSummary();
    await vi.waitFor(() => expectGetList(httpMock, '/v1/inf/rait/cases', []));
    await vi.waitFor(() => expectGetList(httpMock, '/v1/inf/rait/cases', []));
    await vi.waitFor(() =>
      expectGetList(httpMock, '/v1/inf/rait/inquiries', []),
    );
    await vi.waitFor(() =>
      expectGetList(httpMock, '/v1/inf/rait/clock-alerts', []),
    );
    await promise;
    const summary = facade.painel.value();
    expect(summary).toEqual({
      queued: 0,
      inInquiry: 0,
      resumable: 0,
      openAlerts: 0,
    });
    expect(summary && Object.keys(summary)).not.toContain('daysRemaining');
  });
});
