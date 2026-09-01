import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import { PecAuditQueryService } from './pec-audit-query.service.js';

function subject(rows: Array<Record<string, unknown>> = []) {
  const query = vi.fn().mockResolvedValue({ rows });
  const database = {
    tx: async (work: (transaction: { query: typeof query }) => unknown) =>
      work({ query }),
  };
  const requestContext = {
    snapshot: () => ({ tenantId: 'tenant-1' }),
  };
  return {
    service: new PecAuditQueryService(
      database as never,
      requestContext as never,
    ),
    query,
  };
}

describe('PecAuditQueryService', () => {
  it('queries audit evidence under explicit tenant context with bounded filters', async () => {
    const { service, query } = subject([{ eventId: '1' }]);
    await expect(
      service.list({
        action: 'READ',
        entity: 'PATIENT',
        from: '2026-08-01T00:00:00Z',
        to: '2026-09-01T00:00:00Z',
        page: 2,
        pageSize: 25,
      }),
    ).resolves.toEqual([{ eventId: '1' }]);
    expect(query.mock.calls[0]?.[0]).toContain('tenant_id = $1::uuid');
    expect(query.mock.calls[0]?.[0]).toContain(
      'order by occurred_at desc, event_id desc',
    );
    expect(query.mock.calls[0]?.[1]).toEqual([
      'tenant-1',
      '2026-08-01T00:00:00Z',
      '2026-09-01T00:00:00Z',
      'READ',
      'PATIENT',
      25,
      25,
    ]);
  });

  it('exports hash-chain evidence and neutralizes spreadsheet formulas', async () => {
    const { service } = subject([
      {
        eventId: '1',
        occurredAt: '2026-09-01T00:00:00Z',
        action: '=FORMULA',
        entity: 'PATIENT',
        details: {},
        previousHash: null,
        selfHash: 'abcd',
      },
    ]);
    const csv = await service.exportCsv({});
    expect(csv).toContain('previousHash,selfHash');
    expect(csv).toContain('"\'=FORMULA"');
  });

  it('rejects inverted dates and missing tenant context', async () => {
    const { service } = subject();
    await expect(
      service.list({
        from: '2026-09-02T00:00:00Z',
        to: '2026-09-01T00:00:00Z',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    const noTenant = new PecAuditQueryService(
      { tx: vi.fn() } as never,
      { snapshot: () => ({}) } as never,
    );
    await expect(noTenant.list({})).rejects.toBeInstanceOf(BadRequestException);
  });
});
