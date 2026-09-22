// R-0012 TASK-0008 (Inspector). CTG-0002b.md §4.3, §8 (C-2B-24, 28) —
// `data/facades/signing.facade.ts` ainda não existe (TASK-0009): falha de módulo esperada.
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { SigningFacade } from './signing.facade';
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
    facade: TestBed.inject(SigningFacade),
    httpMock: TestBed.inject(HttpTestingController),
  };
}

afterEach(() => {
  TestBed.inject(HttpTestingController).verify();
});

const COMMAND_METHODS: readonly (keyof SigningFacade)[] = [
  'signDecision',
  'returnDraft',
  'declareImpediment',
];

describe('SigningFacade — comandos (C-2B-24, M8)', () => {
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
      `SigningFacade.${String(method)} — comportamento real (R-0007 CTG-0004)`,
    );
  }
});

describe('SigningFacade — leituras (C-2B-28)', () => {
  it('dado loadSigningQueue() então casos PRONTO_P_DECISAO (caso 09) sem filtro de unidade (OD-R12-021)', async () => {
    const { facade, httpMock } = setup();
    const allCases = Object.values(CASE_IDS).map((id) => fixtureCase(id));
    const promise = facade.loadSigningQueue();
    await vi.waitFor(() =>
      expectGetList(httpMock, '/v1/inf/rait/cases', allCases),
    );
    await promise;
    expect(facade.fila.items().map((entry) => entry.protocol_number)).toEqual([
      'RAIT-2026-000009',
    ]);
  });

  it('dado loadSigningCase(CASE_IDS.PRONTO_P_DECISAO) então bundle com case + drafts/documents/admissibility/deadlines/decisions filtrados e decision null', async () => {
    const { facade, httpMock } = setup();
    const id = CASE_IDS.PRONTO_P_DECISAO;
    const promise = facade.loadSigningCase(id);
    // A10 item d: getRaitCase + 5 listas filtro { case_id } (contrato §4.3) — faltava o GET do
    // caso e o GET de decisions.
    await vi.waitFor(() =>
      expectGetOne(
        httpMock,
        `/v1/inf/rait/cases/${id}`,
        fixtureCase(id),
        etagFor(1),
      ),
    );
    await vi.waitFor(() => expectGetList(httpMock, '/v1/inf/rait/drafts', []));
    await vi.waitFor(() =>
      expectGetList(httpMock, '/v1/inf/rait/documents', []),
    );
    await vi.waitFor(() =>
      expectGetList(httpMock, '/v1/inf/rait/admissibility', []),
    );
    await vi.waitFor(() =>
      expectGetList(httpMock, '/v1/inf/rait/deadlines', []),
    );
    await vi.waitFor(() =>
      expectGetList(httpMock, '/v1/inf/rait/decisions', []),
    );
    await promise;
    expect(facade.caso.value()?.case.state).toBe('PRONTO_P_DECISAO');
    expect(facade.caso.value()?.decision).toBeNull();
  });

  it('dado loadSigningCase(CASE_IDS.DECIDIDO_AUTORIDADE) então bundle com case.state DECIDIDO_AUTORIDADE', async () => {
    const { facade, httpMock } = setup();
    const id = CASE_IDS.DECIDIDO_AUTORIDADE;
    const promise = facade.loadSigningCase(id);
    await vi.waitFor(() =>
      expectGetOne(
        httpMock,
        `/v1/inf/rait/cases/${id}`,
        fixtureCase(id),
        etagFor(1),
      ),
    );
    await vi.waitFor(() => expectGetList(httpMock, '/v1/inf/rait/drafts', []));
    await vi.waitFor(() =>
      expectGetList(httpMock, '/v1/inf/rait/documents', []),
    );
    await vi.waitFor(() =>
      expectGetList(httpMock, '/v1/inf/rait/admissibility', []),
    );
    await vi.waitFor(() =>
      expectGetList(httpMock, '/v1/inf/rait/deadlines', []),
    );
    await vi.waitFor(() =>
      expectGetList(httpMock, '/v1/inf/rait/decisions', []),
    );
    await promise;
    // Sem fixtureDecision() (§7 não define fixture de RaitDecision) — o caso decidido é
    // reconhecido pelo estado do caso, não por um decision simulado (nenhum valor inventado);
    // documentado como pendência de fixture no relatório de entrega. Com a lista de decisions
    // vazia (nenhuma fixture disponível), `decision` do bundle fica null mesmo neste estado —
    // limitação de fixture, não de comportamento (registrado no relatório).
    expect(facade.caso.value()?.case.state).toBe('DECIDIDO_AUTORIDADE');
  });
});
