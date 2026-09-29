import { describe, expect, it, vi } from 'vitest';

import { PecRenachTransmissionService } from './pec-renach-transmission.service.js';

function subject(query: ReturnType<typeof vi.fn>) {
  const database = {
    tx: async <T>(work: (transaction: { query: typeof query }) => Promise<T>) =>
      work({ query }),
  };
  const context = {
    hasActiveContext: () => true,
    snapshot: () => ({
      tenantId: 'fixture-tenant-a',
      actorId: 'fixture-actor',
      requestId: 'fixture-request',
    }),
  };
  return new PecRenachTransmissionService(
    database as never,
    context as never,
    {
      submitMedicalExam: vi.fn(),
    } as never,
  );
}

describe('R-0021 RENACH caracterizado', () => {
  it('dado trabalho processing com quinze minutos quando claim ocorre então torna-o elegível sob skip locked', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });

    await expect(subject(query).dispatchDue(99)).resolves.toEqual([]);
    expect(query.mock.calls[0]?.[0]).toContain(
      "status = 'processing' and dispatched_at <= now() - interval '15 minutes'",
    );
    expect(query.mock.calls[0]?.[0]).toContain('for update skip locked');
    expect(query.mock.calls[0]?.[1]).toEqual([25]);
  });
});
