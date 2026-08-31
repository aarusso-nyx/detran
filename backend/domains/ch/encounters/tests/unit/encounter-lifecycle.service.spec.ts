import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import { EncounterLifecycleService } from '../../src/encounter-lifecycle.service.js';

function subject(query: ReturnType<typeof vi.fn>) {
  const repository = {
    transaction: async <T>(work: (transaction: unknown) => Promise<T>) =>
      work({ query }),
  };
  return new EncounterLifecycleService(repository as never);
}

describe('EncounterLifecycleService', () => {
  it('requires RENACH process key and type as one bound identity', () => {
    const query = vi.fn();
    expect(() =>
      subject(query).open({
        patientId: 'patient-1',
        renachProcessKey: 'RN123',
      }),
    ).toThrow('RENACH process key and process type must be supplied together');
    expect(query).not.toHaveBeenCalled();
  });

  it('AC-PEC-002-1 opens an encounter only from a checked-in appointment', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'appointment-1',
            clinic_id: 'clinic-1',
            patient_id: 'patient-1',
            status: 'CHECKED_IN',
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'encounter-1',
            clinic_id: 'clinic-1',
            patient_id: 'patient-1',
            appointment_id: 'appointment-1',
            status: 'OPEN',
          },
        ],
      });

    await expect(
      subject(query).open({
        patientId: 'patient-1',
        clinicId: 'clinic-1',
        appointmentId: 'appointment-1',
      }),
    ).resolves.toMatchObject({ id: 'encounter-1', status: 'OPEN' });
    expect(query).toHaveBeenCalledTimes(2);
    expect(query.mock.calls[0]?.[0]).toContain('ch.biometric_check');
    expect(query.mock.calls[1]?.[0]).toContain('insert into ch.encounter');
  });

  it('AC-PEC-002-1 resolves the latest checked-in appointment when omitted', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'appointment-2',
            clinic_id: 'clinic-1',
            patient_id: 'patient-1',
            status: 'CHECKED_IN',
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [{ id: 'encounter-2', status: 'OPEN' }],
      });

    await subject(query).open({ patientId: 'patient-1' });

    expect(query.mock.calls[0]?.[0]).toContain("status = 'CHECKED_IN'");
    expect(query.mock.calls[0]?.[1]).toEqual(['patient-1']);
  });

  it.each(['SCHEDULED', 'NO_SHOW', 'CANCELLED'])(
    'AC-PEC-002-1 rejects an appointment in %s',
    async (status) => {
      const query = vi.fn().mockResolvedValueOnce({
        rows: [
          {
            id: 'appointment-1',
            clinic_id: 'clinic-1',
            patient_id: 'patient-1',
            status,
          },
        ],
      });

      await expect(
        subject(query).open({
          patientId: 'patient-1',
          appointmentId: 'appointment-1',
        }),
      ).rejects.toThrow(
        'Biometric check-in is required before opening encounter',
      );
      expect(query).toHaveBeenCalledTimes(1);
    },
  );

  it('AC-PEC-008-5 reaches CANCELLED with timestamp and reason', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({ rows: [{ status: 'IN_PROGRESS' }] })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'encounter-1',
            status: 'CANCELLED',
            cancel_reason: 'Patient withdrew',
            cancelled_at: '2026-08-31T12:00:00.000Z',
          },
        ],
      });

    await expect(
      subject(query).cancel('encounter-1', '  Patient withdrew  '),
    ).resolves.toMatchObject({
      status: 'CANCELLED',
      cancel_reason: 'Patient withdrew',
    });
    expect(query.mock.calls[1]?.[0]).toContain("status = 'CANCELLED'");
    expect(query.mock.calls[1]?.[1]).toEqual([
      'encounter-1',
      'Patient withdrew',
    ]);
  });

  it.each(['SIGNED', 'CLOSED', 'CANCELLED'])(
    'AC-PEC-008-5 preserves terminal status %s',
    async (status) => {
      const query = vi.fn().mockResolvedValueOnce({ rows: [{ status }] });

      await expect(
        subject(query).cancel('encounter-1', 'Invalidated appointment'),
      ).rejects.toThrow(`Cannot cancel encounter in status '${status}'`);
      expect(query).toHaveBeenCalledTimes(1);
    },
  );

  it('AC-PEC-008-5 rejects cancellation without a reason', async () => {
    const query = vi.fn();

    expect(() => subject(query).cancel('encounter-1', '  ')).toThrow(
      BadRequestException,
    );
    expect(query).not.toHaveBeenCalled();
  });
});
