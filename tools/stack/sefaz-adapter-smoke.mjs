import { createSefazMockServer } from './mocks/sefaz-mock.mjs';
import { register } from 'tsx/esm/api';

register();

const { SefazAdapterError, SefazHttpAdapter } =
  await import('../../packages/sefaz-adapter/src/index.ts');

const deterministicGetRequestId = 'test-get-mock-sefaz-payments-test-ref-001';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertEnvelope(payload, { category, providerStatus }) {
  assert(typeof payload?.requestId === 'string', 'error requestId is required');
  assert(
    payload?.error?.category === category,
    `expected ${category} category`,
  );
  assert(typeof payload?.error?.code === 'string', 'error code is required');
  assert(
    typeof payload?.error?.message === 'string',
    'error message is required',
  );
  assert(payload?.error?.retryable === false, 'error must not be retryable');
  assert(
    payload?.error?.providerStatus === providerStatus,
    `expected provider status ${providerStatus}`,
  );
}

async function expectAdapterError(operation, expected) {
  try {
    await operation();
  } catch (error) {
    assert(error instanceof SefazAdapterError, 'expected SefazAdapterError');
    assert(error.category === expected.category, 'unexpected error category');
    assert(error.retryable === false, 'error must not be retryable');
    assert(
      error.providerStatus === expected.providerStatus,
      'unexpected provider status',
    );
    return;
  }
  throw new Error('expected adapter operation to fail');
}

const mock = await createSefazMockServer({ host: '127.0.0.1', port: 0 });
try {
  const address = mock.address();
  assert(
    address?.address === '127.0.0.1',
    'mock must listen only on IPv4 loopback',
  );
  const adapter = new SefazHttpAdapter({
    baseUrl: `http://localhost:${address.port}`,
    pathPrefix: '/mock',
    retryDelayMs: 0,
  });
  const lookupDebt = await adapter.lookupDebt({
    cpf: '00000000000',
    requestId: 'test-request-001',
  });
  assert(
    lookupDebt.debts[0]?.debtId === 'test-debt-001' &&
      lookupDebt.inActiveDebt === false &&
      lookupDebt.requestId === 'test-request-001',
    'lookupDebt DTO/requestId mismatch',
  );
  process.stdout.write('lookupDebt\n');

  const issueGuide = await adapter.issueGuide({ debtId: 'test-debt-001' });
  assert(
    issueGuide.guideId === 'test-guide-001' &&
      issueGuide.referenceNumber === 'TEST-REF-001' &&
      issueGuide.status === 'ISSUED',
    'issueGuide DTO mismatch',
  );
  process.stdout.write('issueGuide\n');

  const paymentStatus = await adapter.getPaymentStatus('TEST-REF-001');
  assert(
    paymentStatus.status === 'PAID' &&
      paymentStatus.amountPaid === 123.45 &&
      paymentStatus.requestId === deterministicGetRequestId,
    'getPaymentStatus DTO/deterministic test requestId mismatch',
  );
  process.stdout.write('getPaymentStatus\n');

  const rectification = await adapter.submitRectification({
    referenceNumber: 'TEST-REF-001',
    reason: 'fixture',
    originalPayment: { amount: 123.45, paidAt: '2026-09-01T00:00:00Z' },
  });
  assert(
    rectification.rectificationId === 'test-rectification-001' &&
      rectification.status === 'UNDER_REVIEW',
    'submitRectification DTO mismatch',
  );
  process.stdout.write('submitRectification\n');

  const refund = await adapter.submitRefundRequest({
    referenceNumber: 'TEST-REF-001',
  });
  assert(
    refund.refundId === 'test-refund-001' && refund.status === 'PENDING',
    'submitRefundRequest DTO mismatch',
  );
  process.stdout.write('submitRefundRequest\n');

  const refundStatus = await adapter.getRefundStatus('test-refund-001');
  assert(
    refundStatus.refundId === 'test-refund-001' &&
      refundStatus.status === 'APPROVED' &&
      typeof refundStatus.approvedAt === 'string',
    'getRefundStatus DTO mismatch',
  );
  process.stdout.write('getRefundStatus\n');

  await expectAdapterError(() => adapter.getPaymentStatus('UNKNOWN-REF'), {
    category: 'NOT_FOUND',
    providerStatus: 404,
  });
  await expectAdapterError(() => adapter.getRefundStatus('UNKNOWN-REFUND'), {
    category: 'NOT_FOUND',
    providerStatus: 404,
  });
  process.stdout.write('NOT_FOUND\n');

  await expectAdapterError(() => adapter.lookupDebt({}), {
    category: 'BUSINESS_ERROR',
    providerStatus: 400,
  });
  const malformed = await fetch(
    `http://127.0.0.1:${address.port}/mock/sefaz/payments/lookup`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{',
    },
  );
  assert(malformed.status === 400, 'malformed JSON must return 400');
  assertEnvelope(await malformed.json(), {
    category: 'BUSINESS_ERROR',
    providerStatus: 400,
  });
  process.stdout.write('invalid_body\n');

  const methodNotAllowed = await fetch(
    `http://127.0.0.1:${address.port}/mock/sefaz/guides`,
    { method: 'GET' },
  );
  assert(methodNotAllowed.status === 405, 'GET guides must return 405');
  assert(
    methodNotAllowed.headers.get('allow') === 'POST',
    '405 Allow mismatch',
  );
  assertEnvelope(await methodNotAllowed.json(), {
    category: 'BUSINESS_ERROR',
    providerStatus: 405,
  });
  process.stdout.write('method_405\n');
  process.stdout.write('SEFAZ adapter smoke passed\n');
} finally {
  await mock.close();
}
