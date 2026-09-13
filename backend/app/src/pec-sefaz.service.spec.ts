import { describe, expect, it, vi } from 'vitest';

import { PecSefazService } from './pec-sefaz.service.js';

describe('PecSefazService', () => {
  it('normalizes provider payment status without dropping evidence', async () => {
    const adapter = {
      getPaymentStatus: vi.fn().mockResolvedValue({
        referenceNumber: 'DAR-1',
        status: 'PAID',
        paidAt: '2026-09-01T00:00:00Z',
        amountPaid: 100,
        receiptNumber: 'receipt-1',
        providerCode: 'SEFAZ-AM',
        requestId: 'request-1',
      }),
    };
    const service = new PecSefazService(adapter as never);

    await expect(
      service.validatePayment('DAR-1', 'correlation-1'),
    ).resolves.toEqual({
      referenceNumber: 'DAR-1',
      normalizedStatus: 'PAID',
      externalStatus: 'PAID',
      paidAt: '2026-09-01T00:00:00Z',
      amountPaid: 100,
      receiptNumber: 'receipt-1',
      providerCode: 'SEFAZ-AM',
      requestId: 'request-1',
    });
    expect(adapter.getPaymentStatus).toHaveBeenCalledWith('DAR-1');
  });

  it('normalizes unknown external states to ERROR', async () => {
    const adapter = {
      getPaymentStatus: vi.fn().mockResolvedValue({
        referenceNumber: 'DAR-2',
        status: 'MALFORMED',
        requestId: 'request-2',
      }),
    };
    await expect(
      new PecSefazService(adapter as never).validatePayment('DAR-2'),
    ).resolves.toMatchObject({ normalizedStatus: 'ERROR' });
  });
});
