import { ConflictException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import { PecToxicologyInboundService } from './pec-toxicology-inbound.service.js';

function subject(query: ReturnType<typeof vi.fn>) {
  const database = {
    tx: async <T>(work: (transaction: { query: typeof query }) => Promise<T>) =>
      work({ query }),
  };
  const requestContext = {
    hasActiveContext: () => true,
    snapshot: () => ({ tenantId: 'tenant-1', actorId: 'integration-actor' }),
  };
  return new PecToxicologyInboundService(
    database as never,
    requestContext as never,
  );
}

const event = {
  driverCpf: '12345678901',
  category: 'D',
  result: 'POSITIVE',
  collectedAt: '2026-06-01T00:00:00.000Z',
  validUntil: '2026-08-30T00:00:00.000Z',
  occurredAt: '2026-06-05T00:00:00.000Z',
  laboratoryCode: 'LAB-001',
  sourceReference: 'RENACH:TOX:123',
  driverAlertStatus: 'SENT',
} as const;

const rawBody = Buffer.from(JSON.stringify(event));
describe('PecToxicologyInboundService', () => {
  it('AC-PEC-012-2 AC-PEC-012-4 creates an immutable non-encounter result and three-month suspension', async () => {
    let derivedHash = '';
    const query = vi
      .fn()
      .mockImplementationOnce(async (_sql, values) => {
        derivedHash = String(values[1]);
        return { rows: [{ id: 'receipt-1' }] };
      })
      .mockImplementationOnce(async () => ({
        rows: [
          { id: 'receipt-1', payload_sha256: derivedHash, status: 'received' },
        ],
      }))
      .mockImplementationOnce(async () => ({
        rows: [
          { id: 'receipt-1', payload_sha256: derivedHash, status: 'received' },
        ],
      }))
      .mockResolvedValueOnce({ rows: [{ id: 'patient-1' }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 'result-1' }] })
      .mockResolvedValueOnce({ rows: [{ id: 'suspension-1' }] })
      .mockResolvedValueOnce({ rows: [] });

    await expect(
      subject(query).receive('event-1', rawBody, event),
    ).resolves.toEqual({
      eventId: 'event-1',
      status: 'processed',
      duplicate: false,
      resultId: 'result-1',
      suspensionId: 'suspension-1',
    });
    expect(
      query.mock.calls.some(([sql]) =>
        String(sql).includes("interval '3 months'"),
      ),
    ).toBe(true);
    expect(
      query.mock.calls.some(([sql]) => String(sql).includes('ch.encounter')),
    ).toBe(false);
  });

  it('AC-PEC-012-5 preserves source history and releases only the active suspension on a later negative', async () => {
    const negative = {
      ...event,
      result: 'NEGATIVE',
      collectedAt: '2026-07-01T00:00:00.000Z',
      validUntil: '2026-09-29T00:00:00.000Z',
      occurredAt: '2026-07-05T00:00:00.000Z',
      sourceReference: 'RENACH:TOX:124',
    } as const;
    const body = Buffer.from(JSON.stringify(negative));
    let derivedHash = '';
    const query = vi
      .fn()
      .mockImplementationOnce(async (_sql, values) => {
        derivedHash = String(values[1]);
        return { rows: [{ id: 'receipt-2' }] };
      })
      .mockImplementationOnce(async () => ({
        rows: [
          { id: 'receipt-2', payload_sha256: derivedHash, status: 'received' },
        ],
      }))
      .mockImplementationOnce(async () => ({
        rows: [
          { id: 'receipt-2', payload_sha256: derivedHash, status: 'received' },
        ],
      }))
      .mockResolvedValueOnce({ rows: [{ id: 'patient-1' }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 'result-2' }] })
      .mockResolvedValueOnce({ rows: [{ id: 'suspension-1' }] })
      .mockResolvedValueOnce({ rows: [] });

    await expect(
      subject(query).receive('event-2', body, negative),
    ).resolves.toMatchObject({
      status: 'processed',
      resultId: 'result-2',
      suspensionId: 'suspension-1',
    });
    const releaseSql = query.mock.calls.find(([sql]) =>
      String(sql).includes("status = 'RELEASED'"),
    )?.[0];
    expect(releaseSql).toContain('released_by_result_id');
    expect(releaseSql).not.toContain('delete');
  });

  it('AC-PEC-012-3 AC-PEC-012-6 validates scope and records malformed or unmatched events as audited exceptions', async () => {
    let derivedHash = '';
    const malformedQuery = vi
      .fn()
      .mockImplementationOnce(async (_sql, values) => {
        derivedHash = String(values[1]);
        return { rows: [{ id: 'receipt-3' }] };
      })
      .mockImplementationOnce(async () => ({
        rows: [
          { id: 'receipt-3', payload_sha256: derivedHash, status: 'received' },
        ],
      }))
      .mockResolvedValueOnce({ rows: [] });
    await expect(
      subject(malformedQuery).receive('event-3', Buffer.from('{}'), {}),
    ).resolves.toMatchObject({ status: 'exception' });
    expect(malformedQuery.mock.calls[2]?.[0]).toContain("status = 'error'");

    const unmatchedQuery = vi
      .fn()
      .mockImplementationOnce(async (_sql, values) => {
        derivedHash = String(values[1]);
        return { rows: [{ id: 'receipt-4' }] };
      })
      .mockImplementationOnce(async () => ({
        rows: [
          { id: 'receipt-4', payload_sha256: derivedHash, status: 'received' },
        ],
      }))
      .mockImplementationOnce(async () => ({
        rows: [
          { id: 'receipt-4', payload_sha256: derivedHash, status: 'received' },
        ],
      }))
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });
    await expect(
      subject(unmatchedQuery).receive('event-4', rawBody, event),
    ).resolves.toMatchObject({
      status: 'exception',
      exception: expect.stringContaining('not found'),
    });
  });

  it('AC-PEC-012-1 returns an authenticated processed duplicate without applying effects twice', async () => {
    let derivedHash = '';
    const query = vi
      .fn()
      .mockImplementationOnce(async (_sql, values) => {
        derivedHash = String(values[1]);
        return { rows: [] };
      })
      .mockImplementationOnce(async () => ({
        rows: [
          { id: 'receipt-1', payload_sha256: derivedHash, status: 'processed' },
        ],
      }))
      .mockResolvedValueOnce({ rows: [{ id: 'result-1' }] });
    await expect(
      subject(query).receive('event-1', rawBody, event),
    ).resolves.toEqual({
      eventId: 'event-1',
      status: 'processed',
      duplicate: true,
      resultId: 'result-1',
    });
    expect(query).toHaveBeenCalledTimes(3);
  });

  it('rejects reuse of an event identity with different bytes', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'receipt-1',
            payload_sha256: '0'.repeat(64),
            status: 'processed',
          },
        ],
      });
    await expect(
      subject(query).receive('event-1', rawBody, event),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
