import { describe, expect, it, vi } from 'vitest';

import { AppointmentDistributionService } from '../../src/appointment-distribution.service.js';

function subject(query: ReturnType<typeof vi.fn>, actorId = 'actor-1') {
  const repository = {
    transaction: async <T>(work: (transaction: unknown) => Promise<T>) =>
      work({ query }),
  };
  const context = { snapshot: () => ({ actorId }) };
  return new AppointmentDistributionService(
    repository as never,
    context as never,
  );
}

describe('AppointmentDistributionService', () => {
  const eligibility = {
    patient_id: 'patient-1',
    exam_eligible: true,
    requires_psychological: true,
    eligibility_reasons: [],
  };

  it('AC-PEC-001-3 AC-PEC-013-1 and AC-PEC-013-5 derive tracks then select the least-assigned pool', async () => {
    const pool = [
      {
        clinic_id: 'clinic-overused',
        professional_id: 'doctor-overused',
        professional_kind: 'MEDICO',
        assignment_count: 20,
      },
      {
        clinic_id: 'clinic-overused',
        professional_id: 'psych-overused',
        professional_kind: 'PSICOLOGO',
        assignment_count: 20,
      },
      {
        clinic_id: 'clinic-balanced',
        professional_id: 'doctor-balanced',
        professional_kind: 'MEDICO',
        assignment_count: 2,
      },
      {
        clinic_id: 'clinic-balanced',
        professional_id: 'psych-balanced',
        professional_kind: 'PSICOLOGO',
        assignment_count: 1,
      },
    ];
    const query = vi
      .fn()
      .mockResolvedValueOnce({ rows: [eligibility] })
      .mockResolvedValueOnce({ rows: pool })
      .mockResolvedValue({ rows: [] });

    const result = await subject(query).create({
      encounterId: 'encounter-1',
      regionCode: 'NORTH',
      scheduledAt: '2099-08-31T12:00:00.000Z',
    });

    expect(result.clinicId).toBe('clinic-balanced');
    expect(result.assignments).toEqual([
      { track: 'MEDICAL', professionalId: 'doctor-balanced' },
      { track: 'PSYCH', professionalId: 'psych-balanced' },
    ]);
    expect(query.mock.calls[0]?.[0]).toContain('eligibility_checked_at');
    expect(query.mock.calls[1]?.[0]).toContain('clinic.region_code = $1');
    expect(query.mock.calls[2]?.[0]).toContain('insert into ch.appointment');
  });

  it('AC-PEC-013-2 persists the seed, full pool and selected outcome', async () => {
    const pool = [
      {
        clinic_id: 'clinic-1',
        professional_id: 'doctor-1',
        professional_kind: 'MEDICO',
        assignment_count: 0,
      },
    ];
    const query = vi
      .fn()
      .mockResolvedValueOnce({
        rows: [{ ...eligibility, requires_psychological: false }],
      })
      .mockResolvedValueOnce({ rows: pool })
      .mockResolvedValue({ rows: [] });

    await subject(query).create({
      encounterId: 'encounter-1',
      regionCode: 'NORTH',
      scheduledAt: '2099-08-31T12:00:00.000Z',
    });

    const drawCall = query.mock.calls[3];
    expect(drawCall?.[0]).toContain(
      'insert into ch.appointment_assignment_draw',
    );
    expect(drawCall?.[1]?.[4]).toMatch(/^[0-9a-f]{64}$/u);
    expect(JSON.parse(drawCall?.[1]?.[5] as string)).toEqual(pool);
    expect(drawCall?.[1]?.[6]).toBe('clinic-1');
    expect(drawCall?.[1]?.[7]).toBe('doctor-1');
  });

  it('AC-PEC-013-3 rejects a pool missing a requested track', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({ rows: [eligibility] })
      .mockResolvedValueOnce({
        rows: [
          {
            clinic_id: 'clinic-1',
            professional_id: 'doctor-1',
            professional_kind: 'MEDICO',
            assignment_count: 0,
          },
        ],
      });

    await expect(
      subject(query).create({
        encounterId: 'encounter-1',
        regionCode: 'NORTH',
        scheduledAt: '2099-08-31T12:00:00.000Z',
      }),
    ).rejects.toThrow('No eligible clinic and professional pool');
    expect(query).toHaveBeenCalledTimes(2);
  });

  it('AC-PEC-001-4 blocks C/D/E follow-on scheduling when RENACH reports toxicology ineligible', async () => {
    const query = vi.fn().mockResolvedValueOnce({
      rows: [
        {
          ...eligibility,
          exam_eligible: false,
          eligibility_reasons: [
            'Valid toxicology exam is required for category D',
          ],
        },
      ],
    });

    await expect(
      subject(query).create({
        encounterId: 'encounter-1',
        regionCode: 'NORTH',
        scheduledAt: '2099-08-31T12:00:00.000Z',
      }),
    ).rejects.toThrow('Valid toxicology exam is required for category D');
    expect(query).toHaveBeenCalledTimes(1);
  });

  it('AC-PEC-001-5 maps the database appointment-slot uniqueness violation to conflict', async () => {
    const pool = [
      {
        clinic_id: 'clinic-1',
        professional_id: 'doctor-1',
        professional_kind: 'MEDICO',
        assignment_count: 0,
      },
    ];
    const query = vi
      .fn()
      .mockResolvedValueOnce({
        rows: [{ ...eligibility, requires_psychological: false }],
      })
      .mockResolvedValueOnce({ rows: pool })
      .mockRejectedValueOnce({
        code: '23505',
        constraint: 'ux_ch_appointment_slot',
      });

    await expect(
      subject(query).create({
        encounterId: 'encounter-1',
        regionCode: 'NORTH',
        scheduledAt: '2099-08-31T12:00:00.000Z',
      }),
    ).rejects.toThrow(
      'Appointment already exists for this patient, clinic and time',
    );
  });

  it('AC-PEC-013-4 excludes the refused clinic and preserves reroll lineage', async () => {
    const current = [
      {
        draw_id: 'draw-1',
        track: 'MEDICAL',
        region_code: 'NORTH',
        requested_at: '2099-08-31T12:00:00.000Z',
        selected_clinic_id: 'clinic-refused',
        status: 'SCHEDULED',
      },
    ];
    const pool = [
      {
        clinic_id: 'clinic-new',
        professional_id: 'doctor-new',
        professional_kind: 'MEDICO',
        assignment_count: 0,
      },
    ];
    const query = vi
      .fn()
      .mockResolvedValueOnce({ rows: current })
      .mockResolvedValueOnce({ rows: pool })
      .mockResolvedValue({ rows: [] });

    const result = await subject(query).reroll(
      'appointment-1',
      'Clinic reported an unexpected outage',
    );

    expect(result.clinicId).toBe('clinic-new');
    expect(query.mock.calls[1]?.[1]?.[3]).toBe('clinic-refused');
    const drawCall = query.mock.calls[4];
    expect(drawCall?.[1]?.[8]).toBe('draw-1');
    expect(drawCall?.[1]?.[9]).toBe('Clinic reported an unexpected outage');
  });

  it('WF-PEC-003 refuses invalid appointment state transitions', async () => {
    const query = vi.fn().mockResolvedValueOnce({ rows: [] });

    await expect(subject(query).cancel('appointment-1')).rejects.toThrow(
      'Appointment cannot transition to CANCELLED',
    );
    expect(query.mock.calls[0]?.[1]?.[3]).toEqual(['SCHEDULED']);
  });
});
