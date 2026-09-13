import { afterEach, describe, expect, it, vi } from 'vitest';

import { SefazAdapterError, SefazHttpAdapter } from './index.js';

function response(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response;
}

function subject() {
  return new SefazHttpAdapter({
    baseUrl: 'http://sefaz.example.test/',
    pathPrefix: '/mock/',
    timeoutMs: 500,
    retryDelayMs: 0,
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('SefazHttpAdapter', () => {
  it('supports every PEC SEFAZ operation with normalized paths', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(response({ ok: true }));
    vi.stubGlobal('fetch', fetchMock);
    const adapter = subject();

    await adapter.lookupDebt({ cpf: '00000000000' });
    await adapter.issueGuide({ debtId: 'debt-1' });
    await adapter.getPaymentStatus('DAR 2026/1');
    await adapter.submitRectification({
      referenceNumber: 'DAR-1',
      reason: 'correction',
      originalPayment: { amount: 10, paidAt: '2026-09-01T00:00:00Z' },
    });
    await adapter.submitRefundRequest({ referenceNumber: 'DAR-1' });
    await adapter.getRefundStatus('refund/1');

    expect(
      fetchMock.mock.calls.map(([url, init]) => [url, init?.method]),
    ).toEqual([
      ['http://sefaz.example.test/mock/sefaz/payments/lookup', 'POST'],
      ['http://sefaz.example.test/mock/sefaz/guides', 'POST'],
      ['http://sefaz.example.test/mock/sefaz/payments/DAR%202026%2F1', 'GET'],
      ['http://sefaz.example.test/mock/sefaz/rectifications', 'POST'],
      ['http://sefaz.example.test/mock/sefaz/refunds', 'POST'],
      ['http://sefaz.example.test/mock/sefaz/refunds/refund%2F1', 'GET'],
    ]);
  });

  it('retries retryable provider envelopes and preserves their metadata', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      response(
        {
          error: {
            category: 'PROVIDER_ERROR',
            code: 'service_unavailable',
            message: 'SEFAZ unavailable',
            retryable: true,
            providerStatus: 503,
          },
          requestId: 'req-503',
        },
        503,
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(subject().getPaymentStatus('DAR-1')).rejects.toMatchObject({
      name: 'SefazAdapterError',
      category: 'PROVIDER_ERROR',
      code: 'service_unavailable',
      retryable: true,
      providerStatus: 503,
      requestId: 'req-503',
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('maps network and timeout failures into searchable adapter errors', async () => {
    const network = vi
      .fn<typeof fetch>()
      .mockRejectedValue(new Error('offline'));
    vi.stubGlobal('fetch', network);
    await expect(subject().lookupDebt({})).rejects.toBeInstanceOf(
      SefazAdapterError,
    );
    await expect(subject().lookupDebt({})).rejects.toMatchObject({
      category: 'TRANSPORT_ERROR',
      retryable: true,
    });

    const timeoutError = new Error('aborted');
    timeoutError.name = 'AbortError';
    const timeout = vi.fn<typeof fetch>().mockRejectedValue(timeoutError);
    vi.stubGlobal('fetch', timeout);
    await expect(subject().getRefundStatus('1')).rejects.toMatchObject({
      category: 'TIMEOUT',
      retryable: true,
    });
  });
});
