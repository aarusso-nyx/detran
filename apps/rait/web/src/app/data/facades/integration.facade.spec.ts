// R-0012 TASK-0008 (Inspector). CTG-0002b.md §4.3, §8 (C-2B-24, 31) —
// `data/facades/integration.facade.ts` ainda não existe (TASK-0009): falha de módulo esperada.
// Páginas L0 (`integracoes/*`); a facade existe para os comandos M8 e a busca de conciliações.
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { IntegrationFacade } from './integration.facade';
import { RaitClock } from '../clock';
import { RaitStreamTransport } from '../../core/stream-transport';
import { createClockStub } from '../../../testing/clock.stub';
import { createStreamTransportStub } from '../../../testing/stream-transport.stub';
import { expectGetList } from '../../../testing/http-fixtures';
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
    facade: TestBed.inject(IntegrationFacade),
    httpMock: TestBed.inject(HttpTestingController),
  };
}

afterEach(() => {
  TestBed.inject(HttpTestingController).verify();
});

const COMMAND_METHODS: readonly (keyof IntegrationFacade)[] = [
  'retry',
  'reconcile',
];

describe('IntegrationFacade — comandos (C-2B-24, M8)', () => {
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
      `IntegrationFacade.${String(method)} — comportamento real (R-0007 CTG-0004; OD-R12-027)`,
    );
  }
});

describe('IntegrationFacade — leitura (C-2B-31)', () => {
  it('dado loadReconciliations() quando carregada então conciliacoes "empty" (total 0, §4.1 emptyWhen) e a URL literal /v1/inf/rait/reconciliations', async () => {
    const { facade, httpMock } = setup();
    const promise = facade.loadReconciliations();
    await vi.waitFor(() =>
      expectGetList(httpMock, '/v1/inf/rait/reconciliations', []),
    );
    await promise;
    // A10 item j: contrato §4.1 prevalece — lista [] (total 0) → status 'empty'.
    expect(facade.conciliacoes.status()).toBe('empty');
  });
});
