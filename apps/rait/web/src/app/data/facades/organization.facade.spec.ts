// R-0012 TASK-0008 (Inspector). CTG-0002b.md §4.3, §8 (C-2B-24, 31) —
// `data/facades/organization.facade.ts` ainda não existe (TASK-0009): falha de módulo esperada.
// Leituras L1 das páginas de `organizacao/*`/`gestao/*` usam `createListFacade` diretamente nas
// páginas (M13); esta facade cobre `pools` (leitura compartilhada) e os 9 comandos do módulo.
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { OrganizationFacade } from './organization.facade';
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
    facade: TestBed.inject(OrganizationFacade),
    httpMock: TestBed.inject(HttpTestingController),
  };
}

afterEach(() => {
  TestBed.inject(HttpTestingController).verify();
});

const COMMAND_METHODS: readonly (keyof OrganizationFacade)[] = [
  'publishSchedule',
  'registerMandate',
  'updatePool',
  'constituteUnit',
  'activateUnit',
  'generateJetonSheet',
  'approveJetonSheet',
  'publishCapacityPlan',
  'reviewQualitySample',
];

describe('OrganizationFacade — comandos (C-2B-24, M8)', () => {
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
      `OrganizationFacade.${String(method)} — comportamento real (R-0007 CTG-0004)`,
    );
  }
});

describe('OrganizationFacade — leitura (C-2B-31)', () => {
  it('dado loadPools() quando carregada então pools "empty" (total 0, §4.1 emptyWhen) e a URL literal /v1/inf/rait/pools', async () => {
    const { facade, httpMock } = setup();
    const promise = facade.loadPools();
    await vi.waitFor(() => expectGetList(httpMock, '/v1/inf/rait/pools', []));
    await promise;
    // A10 item j: contrato §4.1 prevalece — lista [] (total 0) → status 'empty'.
    expect(facade.pools.status()).toBe('empty');
  });
});
