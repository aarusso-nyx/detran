// TASK25 replaces only activated M8 sentinels with stronger generated-operation transport proofs.
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import { CASE_IDS, fixtureCase } from '../../../testing/http-fixtures';
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
        await idempotencyKey(op.act, op.target, op.body),
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
          : fixtureCase(CASE);
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
});
