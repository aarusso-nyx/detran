import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import { InconsistencyLifecycleService } from '../../src/inconsistency-lifecycle.service.js';

function subject(query: ReturnType<typeof vi.fn>, actorId = 'actor-1') {
  const inconsistencies = {
    transaction: async <T>(
      work: (transaction: { query: typeof query }) => Promise<T>,
    ) => work({ query }),
  };
  const context = { snapshot: () => ({ actorId }) };
  return new InconsistencyLifecycleService(
    inconsistencies as never,
    context as never,
  );
}

describe('InconsistencyLifecycleService', () => {
  it('detects with canonical source, separated payload, due time, and actor', async () => {
    const row = { id: 'inconsistency-1', status: 'DETECTED' };
    const query = vi.fn().mockResolvedValue({ rows: [row] });
    expect(() =>
      subject(query).detect({
        encounterId: 'encounter-1',
        sourceSystem: 'clinic gateway',
        severity: 'HIGH',
        detectionReason: 'Result checksum mismatch',
        payload: { expected: 'abc' },
      }),
    ).toThrow(BadRequestException);

    await expect(
      subject(query).detect({
        encounterId: 'encounter-1',
        sourceSystem: 'clinic_gateway',
        severity: 'HIGH',
        detectionReason: 'Result checksum mismatch',
        payload: { expected: 'abc' },
      }),
    ).resolves.toEqual(row);
    expect(query.mock.calls[0]?.[0]).toContain("interval '2 days'");
    expect(query.mock.calls[0]?.[1]?.[1]).toBe('CLINIC_GATEWAY');
    expect(query.mock.calls[0]?.[1]?.[5]).toBe('actor-1');
  });

  it('fails closed when the optional encounter does not exist', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    await expect(
      subject(query).detect({
        encounterId: 'missing',
        sourceSystem: 'RENACH',
        severity: 'MEDIUM',
        detectionReason: 'Encounter reference missing',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('marks notification only from DETECTED', async () => {
    const row = { id: 'inconsistency-1', status: 'NOTIFIED' };
    const query = vi.fn().mockResolvedValue({ rows: [row] });
    await expect(subject(query).notify('inconsistency-1')).resolves.toEqual(
      row,
    );
    expect(query.mock.calls[0]?.[1]).toEqual([
      'inconsistency-1',
      'NOTIFIED',
      'actor-1',
      'DETECTED',
    ]);
  });

  it('keeps correction evidence separate and requires NOTIFIED', async () => {
    const row = { id: 'inconsistency-1', status: 'CORRECTED' };
    const query = vi.fn().mockResolvedValue({ rows: [row] });
    await expect(
      subject(query).correct('inconsistency-1', {
        correction: { received: 'def' },
        resolutionNote: 'Resent by clinic',
      }),
    ).resolves.toEqual(row);
    expect(query.mock.calls[0]?.[0]).toContain("status = 'NOTIFIED'");
    expect(query.mock.calls[0]?.[1]?.[1]).toBe(
      JSON.stringify({ received: 'def' }),
    );
  });

  it('reprocesses only after correction', async () => {
    const row = { id: 'inconsistency-1', status: 'REPROCESSED' };
    const query = vi.fn().mockResolvedValue({ rows: [row] });
    await expect(subject(query).reprocess('inconsistency-1')).resolves.toEqual(
      row,
    );
    expect(query.mock.calls[0]?.[1]?.[3]).toBe('CORRECTED');
  });

  it('makes CLOSED reachable only after reprocessing', async () => {
    const row = { id: 'inconsistency-1', status: 'CLOSED' };
    const query = vi.fn().mockResolvedValue({ rows: [row] });
    await expect(subject(query).close('inconsistency-1')).resolves.toEqual(row);
    expect(query.mock.calls[0]?.[1]?.[3]).toBe('REPROCESSED');
  });

  it('rejects an invalid lifecycle jump', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    await expect(
      subject(query).reprocess('inconsistency-1'),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
