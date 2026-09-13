import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import {
  haversineMeters,
  OperationalControlService,
} from '../../src/operational-control.service.js';

function subject(query: ReturnType<typeof vi.fn>, actorId = 'actor-1') {
  const records = {
    transaction: async <T>(
      work: (transaction: { query: typeof query }) => Promise<T>,
    ) => work({ query }),
  };
  const context = { snapshot: () => ({ actorId }) };
  return new OperationalControlService(records as never, context as never);
}

describe('OperationalControlService', () => {
  it('records a canonical operational event with actor attribution', async () => {
    const row = { id: 'record-1', record_kind: 'SUPPORT_TICKET' };
    const query = vi.fn().mockResolvedValue({ rows: [row] });
    await expect(
      subject(query).record({
        recordKind: 'SUPPORT_TICKET',
        subjectType: 'clinic',
        subjectId: 'clinic-1',
        status: 'open',
        payload: { priority: 'N2' },
      }),
    ).resolves.toEqual(row);
    expect(query.mock.calls[0]?.[1]?.slice(0, 5)).toEqual([
      'SUPPORT_TICKET',
      'CLINIC',
      'clinic-1',
      null,
      'OPEN',
    ]);
    expect(query.mock.calls[0]?.[1]?.[6]).toBe('actor-1');
  });

  it('records an in-range clinic geofence result', async () => {
    const row = { id: 'record-1', status: 'IN_RANGE' };
    const query = vi.fn().mockResolvedValue({ rows: [row] });
    await expect(
      subject(query).validateClinicLocation({
        clinicId: 'clinic-1',
        latitude: -3.119,
        longitude: -60.0217,
        expectedLatitude: -3.119,
        expectedLongitude: -60.0217,
        maxDistanceMeters: 25,
      }),
    ).resolves.toEqual(row);
    expect(query.mock.calls[0]?.[1]?.slice(0, 5)).toEqual([
      'CLINIC_LOCATION',
      'CLINIC',
      'clinic-1',
      'clinic-1',
      'IN_RANGE',
    ]);
  });

  it('records an out-of-range result with station evidence', async () => {
    const row = { id: 'record-1', status: 'OUT_OF_RANGE' };
    const query = vi.fn().mockResolvedValue({ rows: [row] });
    await subject(query).validateClinicLocation({
      clinicId: 'clinic-1',
      stationId: 'station-1',
      latitude: -3.119,
      longitude: -60.0217,
      expectedLatitude: -3.129,
      expectedLongitude: -60.0317,
      maxDistanceMeters: 25,
    });
    expect(query.mock.calls[0]?.[1]?.[4]).toBe('OUT_OF_RANGE');
    const payload = JSON.parse(String(query.mock.calls[0]?.[1]?.[5])) as {
      stationId: string;
      distanceMeters: number;
    };
    expect(payload.stationId).toBe('station-1');
    expect(payload.distanceMeters).toBeGreaterThan(25);
  });

  it('rejects invalid coordinates before opening a transaction', () => {
    const query = vi.fn();
    expect(() =>
      subject(query).validateClinicLocation({
        clinicId: 'clinic-1',
        latitude: 91,
        longitude: -60,
        expectedLatitude: -3,
        expectedLongitude: -60,
        maxDistanceMeters: 25,
      }),
    ).toThrow(BadRequestException);
    expect(query).not.toHaveBeenCalled();
  });

  it('returns grouped dashboard counts', async () => {
    const rows = [{ recordKind: 'SUPPORT_TICKET', status: 'OPEN', total: 2 }];
    const query = vi.fn().mockResolvedValue({ rows });
    await expect(subject(query).dashboard()).resolves.toEqual(rows);
    expect(query.mock.calls[0]?.[0]).toContain('group by record_kind, status');
  });

  it('preserves the origin Haversine calculation', () => {
    expect(haversineMeters(-3.119, -60.0217, -3.119, -60.0217)).toBe(0);
  });
});
