// Browser RGR: use the installed DI interceptor, never a fabricated SDK-shaped object.
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  ErrorBannerService,
  ErrorInterceptor,
  classifyStynxError,
} from '@stynx-nyx/angular';
import { firstValueFrom } from 'rxjs';
import { afterEach, describe, expect, it } from 'vitest';
import { classifyError } from './error-boundary';
import { messageKeyFor } from './error-codes';

function setup() {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(withInterceptorsFromDi()),
      provideHttpClientTesting(),
      ErrorBannerService,
      { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    ],
  });
  return {
    http: TestBed.inject(HttpClient),
    testing: TestBed.inject(HttpTestingController),
  };
}
afterEach(() => TestBed.inject(HttpTestingController).verify());
async function mapped(status: number, payload: Record<string, unknown>) {
  const { http, testing } = setup();
  const result = firstValueFrom(http.get('/v1/inf/rait/browser-rgr')).then(
    (value) => ({ value }),
    (error) => ({ error }),
  );
  const req = testing.expectOne('/v1/inf/rait/browser-rgr');
  if (status === 0) req.error(new ProgressEvent('error'));
  else
    req.flush(payload, {
      status,
      statusText: 'Rejected',
      headers: { 'Retry-After': '19' },
    });
  const outcome = await result;
  expect(outcome).toHaveProperty('error');
  if (!('error' in outcome)) throw new Error('Expected interceptor rejection');
  expect(outcome.error).not.toBeInstanceOf(HttpErrorResponse);
  expect(classifyStynxError(outcome.error).status).toBe(status);
  return outcome.error;
}

describe('browser RGR actual STYNX DI errors reach the RAIT boundary', () => {
  it('412 conflict preserves RAIT code/context/requestId and derives its own catalog key', async () => {
    const context = { caseId: 'canonical-case-token', retryAfter: 7 };
    const error = await mapped(412, {
      code: 'RAIT.VERSION_CONFLICT',
      context,
      requestId: 'browser-rgr-request',
      message: 'hostile copy',
      messageKey: 'hostile.translation',
    });
    expect(classifyError(error)).toMatchObject({
      kind: 'conflict',
      status: 412,
      code: 'RAIT.VERSION_CONFLICT',
      messageKey: messageKeyFor('RAIT.VERSION_CONFLICT'),
      requestId: 'browser-rgr-request',
      context,
      retryAfter: 7,
    });
    expect(classifyError(error).messageKey).not.toBe('hostile.translation');
  });
  for (const [status, code, kind] of [
    [409, 'RAIT.CASE_STATE_INVALID', 'conflict'],
    [428, 'RAIT.IF_MATCH_REQUIRED', 'conflict'],
    [403, 'RAIT.FORBIDDEN_ACTION', 'forbidden'],
    [422, 'RAIT.TRIAGE_INCOMPLETE', 'business'],
    [500, 'RAIT.INTERNAL', 'server'],
    [0, undefined, 'offline'],
  ] as const) {
    it(`${status}: installed interceptor retains RAIT status family ${kind}`, async () => {
      const error = await mapped(status, { code, context: {} });
      expect(classifyError(error)).toMatchObject({ kind, status });
      expect(classifyError(error).messageKey).not.toMatch(/^ui\./);
      if (code) expect(classifyError(error).code).toBe(code);
    });
  }
  it('400 SDK context uses existing field validation and does not invent the lost Retry-After header', async () => {
    const error = await mapped(400, {
      code: 'RAIT.VALIDATION_FAILED',
      requestId: 42,
      context: {
        fields: [{ path: 'criterion', rule: 'required' }, 'hostile'],
        legalBasis: 'Operator token',
      },
    });
    expect(classifyError(error)).toMatchObject({
      kind: 'validation',
      status: 400,
      fields: [{ path: 'criterion', rule: 'required' }],
      legalBasis: 'Operator token',
    });
    expect(classifyError(error).requestId).toBeUndefined();
    expect(classifyError(error).retryAfter).toBeUndefined();
  });
  it('non-record SDK context is ignored', async () => {
    const error = await mapped(412, {
      code: 'RAIT.VERSION_CONFLICT',
      context: ['hostile'],
    });
    expect(classifyError(error)).toMatchObject({
      kind: 'conflict',
      context: {},
    });
  });
  it('status-shaped objects and ordinary Errors remain unknown', () => {
    setup();
    for (const error of [
      {
        status: 412,
        code: 'RAIT.VERSION_CONFLICT',
        context: { spoofed: true },
      },
      Object.assign(new Error('plain'), {
        status: 412,
        code: 'RAIT.VERSION_CONFLICT',
      }),
      {
        status: 0,
        responseBody: {
          code: 'RAIT.VERSION_CONFLICT',
          context: { spoofed: true },
          requestId: 'spoofed',
        },
      },
    ]) {
      expect(classifyError(error)).toEqual({
        kind: 'unknown',
        messageKey: 'rait.errors.unknown',
        context: {},
      });
    }
  });
  it('generic Error with status0 and responseBody is not a recognized SDK network error', () => {
    setup();
    const error = Object.assign(new Error('ordinary application failure'), {
      status: 0,
      responseBody: {
        code: 'RAIT.VERSION_CONFLICT',
        requestId: 'spoofed-request',
        context: { spoofed: true },
      },
    });
    // Public STYNX classifier has a structural status0 fallback: that alone is not SDK recognition.
    expect(classifyStynxError(error).status).toBe(0);
    expect(classifyError(error)).toEqual({
      kind: 'unknown',
      messageKey: 'rait.errors.unknown',
      context: {},
    });
  });
  it('real SDK network identity survives a renamed constructor and has no invented code', async () => {
    const error = await mapped(0, {});
    expect(classifyStynxError(error).code).toBeUndefined();
    const constructor = Object.getPrototypeOf(error).constructor as object;
    const original = Object.getOwnPropertyDescriptor(constructor, 'name')!;
    try {
      Object.defineProperty(constructor, 'name', {
        ...original,
        value: 'minified_sdk_constructor',
      });
      expect(classifyError(error)).toMatchObject({
        kind: 'offline',
        status: 0,
        messageKey: 'rait.errors.offline',
      });
      expect(classifyError(error).code).toBeUndefined();
    } finally {
      Object.defineProperty(constructor, 'name', original);
    }
  });
});
