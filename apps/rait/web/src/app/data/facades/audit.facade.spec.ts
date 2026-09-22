// R-0012 TASK-0008 (Inspector). CTG-0002b.md §4.3, §8 (C-2B-24, 31) — `data/facades/audit.facade.ts`
// ainda não existe (TASK-0009): falha de módulo esperada.
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { AuditFacade } from './audit.facade';
import { RaitClock } from '../clock';
import { RaitStreamTransport } from '../../core/stream-transport';
import { createClockStub } from '../../../testing/clock.stub';
import { createStreamTransportStub } from '../../../testing/stream-transport.stub';
import { CASE_IDS, expectGetList } from '../../../testing/http-fixtures';

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
    facade: TestBed.inject(AuditFacade),
    httpMock: TestBed.inject(HttpTestingController),
  };
}

afterEach(() => {
  TestBed.inject(HttpTestingController).verify();
});

describe('AuditFacade — comandos (C-2B-24, M8)', () => {
  it('dado createExport quando chamado então resolve { ok: false, error.kind "unavailable", error.command "rait-export:create" }, sem requisição HTTP', async () => {
    const { facade, httpMock } = setup();
    const outcome = (await facade.createExport({})) as {
      ok: boolean;
      error?: { kind: string; command?: string };
    };
    expect(outcome.ok).toBe(false);
    expect(outcome.error?.kind).toBe('unavailable');
    expect(outcome.error?.command).toBe('rait-export:create');
    httpMock.expectNone(() => true);
  });

  it.todo('AuditFacade.createExport — comportamento real (R-0007 CTG-0004)');
});

describe('AuditFacade — leitura (C-2B-31)', () => {
  it('dado loadTrail({ filtro: { case_id } }) quando carregada então trilha "empty" (total 0, §4.1 emptyWhen) e a URL literal /v1/inf/rait/events', async () => {
    const { facade, httpMock } = setup();
    const promise = facade.loadTrail({
      filtro: { case_id: CASE_IDS.EM_INSTRUCAO },
    });
    await vi.waitFor(() => expectGetList(httpMock, '/v1/inf/rait/events', []));
    await promise;
    // A10 item j: contrato §4.1 prevalece — lista [] (total 0) → status 'empty'.
    expect(facade.trilha.status()).toBe('empty');
  });
});
