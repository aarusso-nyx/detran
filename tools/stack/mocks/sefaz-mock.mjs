import { createServer } from 'node:http';
import { realpathSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const testRequestId = (key) =>
  `test-${key
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/gu, '-')
    .replaceAll(/^-|-$/gu, '')}`;

function send(response, status, payload, headers = {}) {
  response.writeHead(status, {
    'content-type': 'application/json',
    ...headers,
  });
  response.end(JSON.stringify(payload));
}

function failure(
  response,
  status,
  category,
  code,
  message,
  requestId,
  headers,
) {
  send(
    response,
    status,
    {
      requestId,
      error: {
        category,
        code,
        message,
        retryable: false,
        providerStatus: status,
      },
    },
    headers,
  );
}

async function readJson(request) {
  let text = '';
  for await (const chunk of request) text += chunk;
  if (!text) return {};
  try {
    const value = JSON.parse(text);
    return value && typeof value === 'object' && !Array.isArray(value)
      ? value
      : null;
  } catch {
    return null;
  }
}

export async function createSefazMockServer({ host, port }) {
  const server = createServer(async (request, response) => {
    const url = new URL(
      request.url ?? '/',
      `http://${request.headers.host ?? host}`,
    );
    if (request.method === 'GET' && url.pathname === '/health') {
      return send(response, 200, { status: 'ok', service: 'sefaz-mock' });
    }
    const requestId = testRequestId(`${request.method}-${url.pathname}`);
    const postRoutes = new Set([
      '/mock/sefaz/payments/lookup',
      '/mock/sefaz/guides',
      '/mock/sefaz/rectifications',
      '/mock/sefaz/refunds',
    ]);
    if (postRoutes.has(url.pathname) && request.method !== 'POST') {
      return failure(
        response,
        405,
        'BUSINESS_ERROR',
        'method_not_allowed',
        'Method not allowed',
        requestId,
        { allow: 'POST' },
      );
    }
    if (
      !postRoutes.has(url.pathname) &&
      (url.pathname.startsWith('/mock/sefaz/payments/') ||
        url.pathname.startsWith('/mock/sefaz/refunds/')) &&
      request.method !== 'GET'
    ) {
      return failure(
        response,
        405,
        'BUSINESS_ERROR',
        'method_not_allowed',
        'Method not allowed',
        requestId,
        { allow: 'GET' },
      );
    }
    if (!url.pathname.startsWith('/mock/')) {
      return failure(
        response,
        404,
        'NOT_FOUND',
        'not_found',
        'Route not found',
        requestId,
      );
    }
    const body =
      request.method === 'POST' ? await readJson(request) : undefined;
    if (request.method === 'POST' && body === null) {
      return failure(
        response,
        400,
        'BUSINESS_ERROR',
        'invalid_body',
        'Request body must be a JSON object',
        requestId,
      );
    }
    const id =
      body?.requestId && typeof body.requestId === 'string'
        ? body.requestId
        : requestId;
    const invalid = (condition) => {
      if (condition) {
        failure(
          response,
          400,
          'BUSINESS_ERROR',
          'invalid_body',
          'Request body is invalid',
          id,
        );
        return true;
      }
      return false;
    };
    if (url.pathname === '/mock/sefaz/payments/lookup') {
      if (invalid(!body || Object.keys(body).length === 0)) return;
      return send(response, 200, {
        debts: [{ debtId: 'test-debt-001', amount: 123.45, status: 'OPEN' }],
        inActiveDebt: false,
        requestId: id,
      });
    }
    if (url.pathname === '/mock/sefaz/guides') {
      if (invalid(!body || body.debtId !== 'test-debt-001')) return;
      return send(response, 200, {
        guideId: 'test-guide-001',
        referenceNumber: 'TEST-REF-001',
        amount: 123.45,
        expiresAt: '2026-12-31T23:59:59Z',
        status: 'ISSUED',
        requestId: id,
      });
    }
    if (url.pathname === '/mock/sefaz/rectifications') {
      if (
        invalid(
          !body?.referenceNumber || !body?.reason || !body?.originalPayment,
        )
      )
        return;
      return send(response, 200, {
        rectificationId: 'test-rectification-001',
        status: 'UNDER_REVIEW',
        requestId: id,
      });
    }
    if (url.pathname === '/mock/sefaz/refunds') {
      if (invalid(!body?.referenceNumber)) return;
      return send(response, 200, {
        refundId: 'test-refund-001',
        status: 'PENDING',
        requestId: id,
      });
    }
    if (url.pathname.startsWith('/mock/sefaz/payments/')) {
      const reference = decodeURIComponent(
        url.pathname.slice('/mock/sefaz/payments/'.length),
      );
      if (reference !== 'TEST-REF-001')
        return failure(
          response,
          404,
          'NOT_FOUND',
          'reference_not_found',
          'Reference not found',
          requestId,
        );
      return send(response, 200, {
        referenceNumber: reference,
        status: 'PAID',
        amountPaid: 123.45,
        paidAt: '2026-09-01T00:00:00Z',
        receiptNumber: 'test-receipt-001',
        requestId,
      });
    }
    if (url.pathname.startsWith('/mock/sefaz/refunds/')) {
      const refundId = decodeURIComponent(
        url.pathname.slice('/mock/sefaz/refunds/'.length),
      );
      if (refundId !== 'test-refund-001')
        return failure(
          response,
          404,
          'NOT_FOUND',
          'refund_not_found',
          'Refund not found',
          requestId,
        );
      return send(response, 200, {
        refundId,
        status: 'APPROVED',
        approvedAt: '2026-09-02T00:00:00Z',
        requestId,
      });
    }
    return failure(
      response,
      404,
      'NOT_FOUND',
      'not_found',
      'Route not found',
      requestId,
    );
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen({ host, port }, () => {
      server.off('error', reject);
      resolve();
    });
  });
  return {
    address: () => server.address(),
    close: () =>
      new Promise((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      ),
  };
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href
) {
  const mock = await createSefazMockServer({ host: '127.0.0.1', port: 3999 });
  const shutdown = async () => {
    await mock.close();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
