// TASK25 replaces only activated M8 sentinels with stronger generated-operation transport proofs.
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import { CASE_IDS, fixtureCase } from '../../../testing/http-fixtures';
import { EtagStore } from './etag-store';
import { idempotencyKey } from '../idempotency-key';
import {
  CaseClient,
  type TriageInput,
  type SaveAdmissibilityInput,
  type AdmitInput,
  type RejectInput,
} from './case.client';
const CASE = CASE_IDS.TRIAGEM_ADMISSIBILIDADE;
const SAVE: SaveAdmissibilityInput = {
  case_id: CASE,
  criterion: 'assinatura',
  verdict: true,
  reason: 'Conferência da fixture.',
};
const REJECT: RejectInput = {
  reason: 'sem_assinatura',
  legalBasis: 'Resolução CONTRAN 900 art. 4º III — fundamento informado.',
};
const OPS = [
  {
    name: 'triage',
    path: `/cases/${CASE}/commands/triage`,
    act: 'triage',
    target: CASE,
    body: {},
    call: (client: CaseClient, match: string | null) =>
      client.triage(CASE, {}, match),
  },
  {
    name: 'saveAdmissibility',
    path: '/admissibility',
    act: 'admissibility',
    target: `${CASE}:assinatura`,
    body: SAVE,
    call: (client: CaseClient, match: string | null) =>
      client.saveAdmissibility(SAVE, match),
  },
  {
    name: 'admit',
    path: `/cases/${CASE}/commands/admit`,
    act: 'admit',
    target: CASE,
    body: {},
    call: (client: CaseClient, match: string | null) =>
      client.admit(CASE, {}, match),
  },
  {
    name: 'reject',
    path: `/cases/${CASE}/commands/non-admission`,
    act: 'reject',
    target: CASE,
    body: REJECT,
    call: (client: CaseClient, match: string | null) =>
      client.reject(CASE, REJECT, match),
  },
];
function setup() {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting()],
  });
  return {
    client: TestBed.inject(CaseClient),
    http: TestBed.inject(HttpTestingController),
  };
}
afterEach(() => TestBed.inject(HttpTestingController).verify());
describe('TASK25 generated four-operation client', () => {
  it('uses the fixed split signatures', () => {
    setup();
    expectTypeOf<
      Parameters<CaseClient['triage']>[1]
    >().toEqualTypeOf<TriageInput>();
    expectTypeOf<
      Parameters<CaseClient['saveAdmissibility']>[0]
    >().toEqualTypeOf<SaveAdmissibilityInput>();
    expectTypeOf<
      Parameters<CaseClient['admit']>[1]
    >().toEqualTypeOf<AdmitInput>();
    expectTypeOf<
      Parameters<CaseClient['reject']>[1]
    >().toEqualTypeOf<RejectInput>();
  });
  for (const op of OPS) {
    it(`${op.name}: exact POST/body/idempotency/case If-Match, unwraps data and remembers currentcase ETag`, async () => {
      const { client, http } = setup();
      const pending = op.call(client, '"4"');
      void pending.catch(() => {});
      const req = await vi.waitFor(() =>
        http.expectOne(`/v1/inf/rait${op.path}`),
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(op.body);
      expect(req.request.headers.get('If-Match')).toBe('"4"');
      expect(req.request.headers.get('Idempotency-Key')).toBe(
        await idempotencyKey(op.act, op.target, {
          body: op.body,
          ifMatch: '"4"',
        }),
      );
      expect(req.request.body).not.toHaveProperty('evaluated_by');
      expect(req.request.body).not.toHaveProperty('tenant_id');
      const data =
        op.name === 'saveAdmissibility'
          ? {
              ...SAVE,
              id: CASE,
              evaluated_by: '00000000-0000-4000-8000-0000b0000001',
            }
          : { ...fixtureCase(CASE), version: 5 };
      req.flush({ data, events: [] }, { headers: { ETag: '"5"' } });
      await expect(pending).resolves.toEqual({ body: data, etag: '"5"' });
      expect(client.etagOf('cases', CASE)).toBe('"5"');
    });
    for (const status of [403, 409, 412, 422, 428, 500])
      it(`${op.name}: preserves raw HTTP${status} for ErrorBoundary`, async () => {
        const { client, http } = setup();
        const code = (
          {
            403: 'RAIT.FORBIDDEN_ACTION',
            409: 'RAIT.CASE_STATE_INVALID',
            412: 'RAIT.VERSION_CONFLICT',
            422: 'RAIT.TRIAGE_INCOMPLETE',
            428: 'RAIT.IF_MATCH_REQUIRED',
            500: 'RAIT.INTERNAL',
          } as Record<number, string>
        )[status];
        const result = op.call(client, '"4"');
        const outcome = result.then(
          (value: unknown) => ({ value }),
          (error: unknown) => ({ error }),
        );
        const req = await vi.waitFor(() =>
          http.expectOne(`/v1/inf/rait${op.path}`),
        );
        req.flush({ code }, { status, statusText: 'Rejected' });
        expect(await outcome).toMatchObject({
          error: { status, error: { code } },
        });
        expect(client.etagOf('cases', CASE)).toBeNull();
      });
  }
  it('retrying the same human criterion keeps its opaque fingerprint', async () => {
    const { client, http } = setup();
    const keys: string[] = [];
    for (let retry = 0; retry < 2; retry++) {
      const pending = client.saveAdmissibility(SAVE, '"4"');
      const req = await vi.waitFor(() =>
        http.expectOne('/v1/inf/rait/admissibility'),
      );
      keys.push(req.request.headers.get('Idempotency-Key')!);
      req.flush(
        { data: { ...SAVE, id: CASE }, events: [] },
        { headers: { ETag: '"5"' } },
      );
      await pending;
    }
    expect(keys[0]).toBe(keys[1]);
  });
  for (const op of OPS) {
    it(`${op.name}: a new observed version is a fresh attempt, exact original retry is stable`, async () => {
      const { client, http } = setup();
      const keys: string[] = [];
      for (const match of ['"4"', '"4"', '"5"']) {
        const pending = op.call(client, match);
        const req = await vi.waitFor(() =>
          http.expectOne(`/v1/inf/rait${op.path}`),
        );
        const key = req.request.headers.get('Idempotency-Key')!;
        expect(key).toBe(
          await idempotencyKey(op.act, op.target, {
            body: op.body,
            ifMatch: match,
          }),
        );
        expect(req.request.headers.get('If-Match')).toBe(match);
        expect(req.request.body).toEqual(op.body);
        keys.push(key);
        req.flush(
          { data: op.body, events: [] },
          { headers: { ETag: match === '"4"' ? '"5"' : '"6"' } },
        );
        await pending;
      }
      expect(keys[0]).toBe(keys[1]);
      expect(keys[2]).not.toBe(keys[0]);
    });
  }
  it('A→B→A under successive case versions never reuses the first attempt key', async () => {
    const { client, http } = setup();
    const keys: string[] = [];
    for (const [index, verdict] of [true, false, true].entries()) {
      const body = { ...SAVE, verdict };
      const pending = client.saveAdmissibility(body, `"${index + 4}"`);
      const req = await vi.waitFor(() =>
        http.expectOne('/v1/inf/rait/admissibility'),
      );
      keys.push(req.request.headers.get('Idempotency-Key')!);
      expect(req.request.body).toEqual(body);
      req.flush(
        { data: body, events: [] },
        { headers: { ETag: `"${index + 5}"` } },
      );
      await pending;
    }
    expect(new Set(keys).size).toBe(3);
  });
});

// Browser RGR: real GET transport validators are not command version tokens.
describe('browser RGR server version to command precondition', () => {
  for (const op of OPS) {
    for (const rawEtag of ['W/"transport-hash"', '"opaque-body-hash"']) {
      it(`${op.name}: GET ${rawEtag} preserves raw cache header but posts the actual server version`, async () => {
        const { client, http } = setup();
        const read = client.getRaitCase(CASE);
        const get = await vi.waitFor(() =>
          http.expectOne(`/v1/inf/rait/cases/${CASE}`),
        );
        const caso = { ...fixtureCase(CASE), version: 4 };
        get.flush(caso, { headers: { ETag: rawEtag } });
        expect(await read).toEqual(caso);
        expect(TestBed.inject(EtagStore).get('cases', CASE)).toBe(rawEtag);
        expect(client.etagOf('cases', CASE)).toBe('"4"');
        const pending = op.call(client, client.etagOf('cases', CASE));
        const req = await vi.waitFor(() =>
          http.expectOne(`/v1/inf/rait${op.path}`),
        );
        expect(req.request.headers.get('If-Match')).toBe('"4"');
        expect(req.request.headers.get('Idempotency-Key')).toBe(
          await idempotencyKey(op.act, op.target, {
            body: op.body,
            ifMatch: '"4"',
          }),
        );
        expect(req.request.body).toEqual(op.body);
        const data =
          op.name === 'saveAdmissibility'
            ? { ...SAVE, id: CASE }
            : { ...caso, version: 5 };
        req.flush({ data, events: [] }, { headers: { ETag: '"5"' } });
        await expect(pending).resolves.toEqual({ body: data, etag: '"5"' });
        expect(client.etagOf('cases', CASE)).toBe('"5"');
      });
    }
  }
  for (const version of [
    undefined,
    null,
    '4',
    0,
    -1,
    1.5,
    Number.MAX_SAFE_INTEGER + 1,
  ]) {
    it(`invalid server version ${String(version)} clears a prior command token and fails locally before POST`, async () => {
      const { client, http } = setup();
      const first = client.getRaitCase(CASE);
      const valid = await vi.waitFor(() =>
        http.expectOne(`/v1/inf/rait/cases/${CASE}`),
      );
      valid.flush(
        { ...fixtureCase(CASE), version: 4 },
        { headers: { ETag: '"4"' } },
      );
      await first;
      expect(client.etagOf('cases', CASE)).toBe('"4"');
      const invalid = client.getRaitCase(CASE).then(
        (value) => ({ value }),
        (error) => ({ error }),
      );
      const get = await vi.waitFor(() =>
        http.expectOne(`/v1/inf/rait/cases/${CASE}`),
      );
      get.flush(
        { ...fixtureCase(CASE), version },
        { headers: { ETag: 'W/"untrusted-validator"' } },
      );
      const outcome = await invalid;
      expect(outcome).toHaveProperty('error');
      if ('error' in outcome) {
        expect(outcome.error).toBeInstanceOf(Error);
        expect(outcome.error).not.toHaveProperty('status');
        expect(outcome.error).not.toHaveProperty(
          'code',
          expect.stringMatching(/^RAIT\./),
        );
      }
      expect(client.etagOf('cases', CASE)).toBeNull();
      expect(TestBed.inject(EtagStore).get('cases', CASE)).toBe(
        'W/"untrusted-validator"',
      );
      http.expectNone((req) => req.method === 'POST');
    });
  }
  it('a numeric strong GET validator disagreeing with body.version is rejected rather than chosen blindly', async () => {
    const { client, http } = setup();
    const outcome = client.getRaitCase(CASE).then(
      (value) => ({ value }),
      (error) => ({ error }),
    );
    const get = await vi.waitFor(() =>
      http.expectOne(`/v1/inf/rait/cases/${CASE}`),
    );
    get.flush(
      { ...fixtureCase(CASE), version: 4 },
      { headers: { ETag: '"8"' } },
    );
    expect(await outcome).toHaveProperty('error');
    expect(client.etagOf('cases', CASE)).toBeNull();
    expect(TestBed.inject(EtagStore).get('cases', CASE)).toBe('"8"');
    http.expectNone((req) => req.method === 'POST');
  });
  for (const op of OPS) {
    it(`${op.name}: explicit weak/opaque If-Match is a local error, never a POST`, async () => {
      const { client, http } = setup();
      for (const match of ['W/"transport"', '"opaque"']) {
        let outcome: unknown;
        let settled = false;
        void op.call(client, match).then(
          (value) => {
            outcome = { value };
            settled = true;
          },
          (error) => {
            outcome = { error };
            settled = true;
          },
        );
        await vi.waitFor(() => expect(settled).toBe(true), { timeout: 250 });
        expect(outcome).toHaveProperty('error');
        http.expectNone((req) => req.method === 'POST');
      }
    });
  }
});
