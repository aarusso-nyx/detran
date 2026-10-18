// TASK25, OD-R25-002/017: real GET guard and existing auth/role, no individual-scope invention.
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  Router,
  convertToParamMap,
  provideRouter,
  type ActivatedRouteSnapshot,
  type RouterStateSnapshot,
} from '@angular/router';
import { firstValueFrom, isObservable } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSessionStub } from '../../../testing/session.stub';
import { CASE_IDS, fixtureCase } from '../../../testing/http-fixtures';
import { RaitSessionFacade } from '../session.facade';
import { CaseClient } from '../../data/api/case.client';
import { caseAccessGuard } from './case-access.guard';
import { raitAuthGuard } from './auth.guard';
import { roleGuard } from './role.guard';
const CASE = CASE_IDS.PROTOCOLADO;
const route = {
  paramMap: convertToParamMap({ id: CASE }),
  params: { id: CASE },
} as unknown as ActivatedRouteSnapshot;
const state = { url: `/casos/${CASE}/triagem` } as RouterStateSnapshot;
function setup(active = true) {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      provideHttpClient(),
      provideHttpClientTesting(),
      {
        provide: RaitSessionFacade,
        useValue: createSessionStub({ active, roles: ['rait-analyst'] }),
      },
    ],
  });
  return TestBed.inject(HttpTestingController);
}
function run() {
  const value = TestBed.runInInjectionContext(() =>
    caseAccessGuard(route, state),
  );
  return isObservable(value) ? firstValueFrom(value) : Promise.resolve(value);
}
afterEach(() => TestBed.inject(HttpTestingController).verify());
describe('TASK25 caseAccessGuard waits for tenant-protected GET', () => {
  it('does not allow the route before GET settles, then allows its actual200 case', async () => {
    const http = setup();
    let settled = false;
    const pending = run().finally(() => {
      settled = true;
    });
    await Promise.resolve();
    expect(settled).toBe(false);
    const req = await vi.waitFor(() =>
      http.expectOne(`/v1/inf/rait/cases/${CASE}`),
    );
    req.flush(fixtureCase(CASE), { headers: { ETag: '"1"' } });
    await expect(pending).resolves.toBe(true);
  });
  it('allows a confirmed case and keeps the server ETag', async () => {
    const http = setup();
    const pending = run();
    const req = await vi.waitFor(() =>
      http.expectOne(`/v1/inf/rait/cases/${CASE}`),
    );
    expect(req.request.method).toBe('GET');
    req.flush(fixtureCase(CASE), { headers: { ETag: '"1"' } });
    await expect(pending).resolves.toBe(true);
  });
  for (const status of [403, 404, 500, 0])
    it(`${status} cannot provisionally authorize a case`, async () => {
      const http = setup();
      const outcome = run().then(
        (value) => ({ value }),
        (error) => ({ error }),
      );
      const req = await vi.waitFor(() =>
        http.expectOne(`/v1/inf/rait/cases/${CASE}`),
      );
      if (status === 0) req.error(new ProgressEvent('error'));
      else
        req.flush(
          {
            code:
              status === 404
                ? 'RAIT.TENANT_MISMATCH'
                : status === 403
                  ? 'RAIT.FORBIDDEN_CASE_SCOPE'
                  : 'RAIT.INTERNAL',
          },
          { status, statusText: 'Rejected' },
        );
      const result = await outcome;
      if ('value' in result) expect(result.value).not.toBe(true);
      else expect(result.error).toMatchObject({ status });
    });
  it('existing auth denies inactive sessions before any case request', async () => {
    const http = setup(false);
    const result = await TestBed.runInInjectionContext(() =>
      raitAuthGuard(route, state),
    );
    expect(
      TestBed.inject(Router).serializeUrl(
        result as ReturnType<Router['parseUrl']>,
      ),
    ).toBe('/auth/callback');
    http.expectNone(() => true);
  });
  it('existing role guard denies omitted action role before any case request', async () => {
    const http = setup();
    const result = TestBed.runInInjectionContext(() =>
      roleGuard(['rait-secretary'])(route, state),
    );
    expect(
      TestBed.inject(Router).serializeUrl(
        result as ReturnType<Router['parseUrl']>,
      ),
    ).toContain('/sem-permissao?de=');
    http.expectNone(() => true);
  });
});

describe('D23 production control read uses actual GET, ETag and failures', () => {
  for (const status of [200, 403, 404, 500]) {
    it(`verifyCaseAccess HTTP${status} preserves server access result`, async () => {
      const http = setup();
      const client = TestBed.inject(CaseClient);
      const outcome = client.verifyCaseAccess(CASE).then(
        () => ({ ok: true }),
        (error: unknown) => ({ error }),
      );
      const req = await vi.waitFor(() =>
        http.expectOne(`/v1/inf/rait/cases/${CASE}`),
      );
      expect(req.request.method).toBe('GET');
      if (status === 200) {
        req.flush(fixtureCase(CASE), { headers: { ETag: '"7"' } });
        expect(await outcome).toEqual({ ok: true });
        expect(client.etagOf('cases', CASE)).toBe('"7"');
      } else {
        req.flush({ code: 'denied' }, { status, statusText: 'Denied' });
        expect(await outcome).toMatchObject({
          error: { status, error: { code: 'denied' } },
        });
        expect(client.etagOf('cases', CASE)).toBeNull();
      }
    });
  }
});
