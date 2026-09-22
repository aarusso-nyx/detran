// R-0012 TASK-0008 (Inspector). CTG-0002b.md §4.3, §8 (C-2B-31) — `data/facades/archive.facade.ts`
// ainda não existe (TASK-0009): falha de módulo esperada. Sem comandos (contrato §4.3:
// "comandos: nenhum" — ficha 058/059 "copiar"/"prorrogar retenção" sem comando sourceado,
// OD-R12-017); C-2B-24 (M8) não se aplica a este arquivo por não haver lista a percorrer.
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ArchiveFacade } from './archive.facade';
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
    facade: TestBed.inject(ArchiveFacade),
    httpMock: TestBed.inject(HttpTestingController),
  };
}

afterEach(() => {
  TestBed.inject(HttpTestingController).verify();
});

describe('ArchiveFacade — leituras (C-2B-31)', () => {
  it('dado loadArchiveSearch() quando carregada então filtro archived "true" → caso 03', async () => {
    const { facade, httpMock } = setup();
    const allCases = Object.values(CASE_IDS).map((id) => fixtureCase(id));
    const promise = facade.loadArchiveSearch();
    await vi.waitFor(() =>
      expectGetList(httpMock, '/v1/inf/rait/cases', allCases),
    );
    await promise;
    expect(facade.busca.status()).toBe('ready');
    expect(facade.busca.items().map((entry) => entry.protocol_number)).toEqual([
      'RAIT-2026-000003',
    ]);
  });

  it('dado loadSealedDossier(caseId) quando carregada então dossie "ready" com case/documents/decisions/communications/events', async () => {
    const { facade, httpMock } = setup();
    const id = CASE_IDS.NAO_CONHECIDO;
    const promise = facade.loadSealedDossier(id);
    await vi.waitFor(() =>
      expectGetOne(
        httpMock,
        `/v1/inf/rait/cases/${id}`,
        fixtureCase(id),
        etagFor(1),
      ),
    );
    await vi.waitFor(() =>
      expectGetList(httpMock, '/v1/inf/rait/documents', []),
    );
    await vi.waitFor(() =>
      expectGetList(httpMock, '/v1/inf/rait/decisions', []),
    );
    await vi.waitFor(() =>
      expectGetList(httpMock, '/v1/inf/rait/communications', []),
    );
    await vi.waitFor(() => expectGetList(httpMock, '/v1/inf/rait/events', []));
    await promise;
    expect(facade.dossie.status()).toBe('ready');
  });

  it('dado loadRetentionQueue() quando carregada com [] então retencao "empty" (total 0, §4.1 emptyWhen)', async () => {
    const { facade, httpMock } = setup();
    const promise = facade.loadRetentionQueue();
    await vi.waitFor(() => expectGetList(httpMock, '/v1/inf/rait/cases', []));
    await promise;
    // A10 item j: contrato §4.1 prevalece — lista [] (total 0) → status 'empty'.
    expect(facade.retencao.status()).toBe('empty');
  });
});
