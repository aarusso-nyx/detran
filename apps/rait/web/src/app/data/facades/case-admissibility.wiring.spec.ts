// TASK25: real CaseFacade/CaseClient/HTTP; no production command mocked to success.
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CASE_IDS, fixtureCase } from '../../../testing/http-fixtures';
import { createClockStub } from '../../../testing/clock.stub';
import { createStreamTransportStub } from '../../../testing/stream-transport.stub';
import { RaitClock } from '../clock';
import { RaitStreamTransport } from '../../core/stream-transport';
import { EtagStore } from '../api/etag-store';
import { CaseFacade } from './case.facade';
const CASE = CASE_IDS.TRIAGEM_ADMISSIBILIDADE;
const SAVE = { case_id: CASE, criterion: 'assinatura' as const, verdict: true };
const OPS = [
  {
    name: 'triage',
    path: `/cases/${CASE}/commands/triage`,
    call: (facade: CaseFacade) => facade.triage(CASE),
  },
  {
    name: 'saveAdmissibility',
    path: '/admissibility',
    call: (facade: CaseFacade) => facade.saveAdmissibility(SAVE),
  },
  {
    name: 'admit',
    path: `/cases/${CASE}/commands/admit`,
    call: (facade: CaseFacade) => facade.admit(CASE, {}),
  },
  {
    name: 'reject',
    path: `/cases/${CASE}/commands/non-admission`,
    call: (facade: CaseFacade) =>
      facade.reject(CASE, {
        reason: 'sem_assinatura',
        legalBasis: 'Art. 4º III — fundamento informado.',
      }),
  },
];
function setup() {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: RaitClock, useValue: createClockStub() },
      { provide: RaitStreamTransport, useValue: createStreamTransportStub() },
    ],
  });
  return {
    facade: TestBed.inject(CaseFacade),
    http: TestBed.inject(HttpTestingController),
  };
}
afterEach(() => TestBed.inject(HttpTestingController).verify());
async function loaded(facade: CaseFacade, http: HttpTestingController) {
  const pending = facade.loadCase(CASE);
  const req = await vi.waitFor(() =>
    http.expectOne(`/v1/inf/rait/cases/${CASE}`),
  );
  req.flush({ ...fixtureCase(CASE), version: 2 }, { headers: { ETag: '"2"' } });
  await pending;
}
describe('TASK25 facade uses real case versions and command outcomes', () => {
  for (const op of OPS) {
    it(`${op.name}: reads case ETag, submits once and exposes real command response`, async () => {
      const { facade, http } = setup();
      await loaded(facade, http);
      const pending = op.call(facade);
      expect(facade.command.status()).toBe('submitting');
      const req = await vi.waitFor(() =>
        http.expectOne(`/v1/inf/rait${op.path}`),
      );
      expect(req.request.headers.get('If-Match')).toBe('"2"');
      const data =
        op.name === 'saveAdmissibility'
          ? { ...SAVE, id: CASE }
          : { ...fixtureCase(CASE), version: 3 };
      req.flush({ data, events: [] }, { headers: { ETag: '"3"' } });
      await expect(pending).resolves.toMatchObject({
        ok: true,
        body: data,
        etag: '"3"',
      });
      expect(facade.command.status()).toBe('done');
      expect(TestBed.inject(EtagStore).get('cases', CASE)).toBe('"3"');
      // Command success must update or invalidate the read cache without waiting for SSE.
      const refresh = facade.loadCase(CASE);
      await vi.waitFor(() => {
        for (const request of http.match(`/v1/inf/rait/cases/${CASE}`))
          request.flush(
            { ...fixtureCase(CASE), version: 3 },
            { headers: { ETag: '"3"' } },
          );
        expect(facade.caso.value()?.version).toBe(3);
      });
      await refresh;
    });
    it(`${op.name}: a rejected HTTP command stays error rather than fake success`, async () => {
      const { facade, http } = setup();
      await loaded(facade, http);
      const pending = op.call(facade);
      const req = await vi.waitFor(() =>
        http.expectOne(`/v1/inf/rait${op.path}`),
      );
      req.flush(
        { code: 'RAIT.TRIAGE_INCOMPLETE' },
        { status: 422, statusText: 'Rejected' },
      );
      const outcome = await pending;
      expect(outcome).toMatchObject({
        ok: false,
        error: { code: 'RAIT.TRIAGE_INCOMPLETE' },
      });
      expect(facade.command.status()).toBe('error');
      expect(facade.command.error()).not.toBeNull();
      expect(TestBed.inject(EtagStore).get('cases', CASE)).toBe('"2"');
      expect(facade.caso.value()?.version).toBe(2);
    });
  }
  it('three independent saves pass the updated parent-case ETag sequentially', async () => {
    const { facade, http } = setup();
    await loaded(facade, http);
    for (const [index, criterion] of [
      'legitimidade',
      'assinatura',
      'pedido_compativel',
    ].entries()) {
      const pending = facade.saveAdmissibility({
        case_id: CASE,
        criterion: criterion as
          'legitimidade' | 'assinatura' | 'pedido_compativel',
        verdict: true,
      });
      const req = await vi.waitFor(() =>
        http.expectOne('/v1/inf/rait/admissibility'),
      );
      expect(req.request.headers.get('If-Match')).toBe(`"${2 + index}"`);
      req.flush(
        { data: { ...req.request.body, id: CASE }, events: [] },
        { headers: { ETag: `"${3 + index}"` } },
      );
      await pending;
    }
    expect(TestBed.inject(EtagStore).get('cases', CASE)).toBe('"5"');
  });
});
