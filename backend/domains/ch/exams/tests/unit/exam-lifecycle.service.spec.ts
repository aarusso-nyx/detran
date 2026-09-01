import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import {
  ExamLifecycleService,
  medicalValidityYears,
} from '../../src/exam-lifecycle.service.js';

function subject(query: ReturnType<typeof vi.fn>, actorId = 'user-1') {
  const repository = {
    transaction: async <T>(work: (transaction: unknown) => Promise<T>) =>
      work({ query }),
  };
  const context = { snapshot: () => ({ actorId }) };
  return new ExamLifecycleService(repository as never, context as never);
}

describe('ExamLifecycleService', () => {
  it.each([
    ['1976-09-01', '2026-08-31T12:00:00.000Z', 10],
    ['1976-08-31', '2026-08-31T12:00:00.000Z', 5],
    ['1956-09-01', '2026-08-31T12:00:00.000Z', 5],
    ['1956-08-31', '2026-08-31T12:00:00.000Z', 3],
  ])(
    'RN-PEC-102 gives birth=%s performed=%s a %i-year validity',
    (birthDate, performedAt, expected) => {
      expect(medicalValidityYears(birthDate, performedAt)).toBe(expected);
    },
  );

  it('DT-102 rejects CONDICIONADO from the medical boundary', () => {
    expect(() =>
      subject(vi.fn()).createMedical({
        encounterId: 'encounter-1',
        professionalId: 'professional-1',
        performedAt: '2026-08-31T12:00:00.000Z',
        data: {},
        result: 'CONDICIONADO' as never,
      }),
    ).toThrow('Unsupported federal medical result');
  });

  it('RN-PEC-105 rejects medical-only vocabulary in the psychological track', () => {
    expect(() =>
      subject(vi.fn()).createPsychological({
        encounterId: 'encounter-1',
        professionalId: 'professional-1',
        instrumentId: 'instrument-1',
        data: {},
        result: 'APTO_COM_RESTRICOES' as never,
      }),
    ).toThrow('Unsupported federal psychological result');
  });

  it('AC-PEC-006-9 requires a favorable active SATEPSI instrument', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({
        rows: [
          {
            birth_date: '1990-01-01',
            professional_kind: 'PSICOLOGO',
            user_id: 'user-1',
            encounter_status: 'IN_PROGRESS',
            biometric_passed: true,
          },
        ],
      })
      .mockResolvedValueOnce({ rows: [] });

    await expect(
      subject(query).createPsychological({
        encounterId: 'encounter-1',
        professionalId: 'professional-1',
        instrumentId: 'instrument-1',
        data: {},
        result: 'APTO',
      }),
    ).rejects.toThrow(
      'Psychological instrument must have a favorable SATEPSI opinion',
    );
    expect(query.mock.calls[1]?.[0]).toContain("satepsi_status = 'FAVORABLE'");
  });

  it('AC-PEC-006-1 and AC-PEC-006-2 require the responsible actor and biometric', async () => {
    const query = vi.fn().mockResolvedValueOnce({
      rows: [
        {
          birth_date: '1990-01-01',
          professional_kind: 'MEDICO',
          user_id: 'another-user',
          encounter_status: 'IN_PROGRESS',
          biometric_passed: true,
        },
      ],
    });

    await expect(
      subject(query).createMedical({
        encounterId: 'encounter-1',
        professionalId: 'professional-1',
        data: {},
        result: 'APTO',
      }),
    ).rejects.toThrow('Exam must be recorded by its responsible professional');
  });

  it('AC-PEC-002-5 permits at most one medical exam per encounter', async () => {
    const duplicate = Object.assign(new Error('duplicate'), { code: '23505' });
    const query = vi
      .fn()
      .mockResolvedValueOnce({
        rows: [
          {
            birth_date: '1990-01-01',
            professional_kind: 'MEDICO',
            user_id: 'user-1',
            encounter_status: 'IN_PROGRESS',
            biometric_passed: true,
          },
        ],
      })
      .mockRejectedValueOnce(duplicate);

    await expect(
      subject(query).createMedical({
        encounterId: 'encounter-1',
        professionalId: 'professional-1',
        performedAt: '2026-08-31T12:00:00.000Z',
        data: {},
        result: 'APTO',
      }),
    ).rejects.toThrow('Medical exam already recorded');
  });

  it('AC-PEC-002-5 permits at most one psychological exam per encounter', async () => {
    const duplicate = Object.assign(new Error('duplicate'), { code: '23505' });
    const query = vi
      .fn()
      .mockResolvedValueOnce({
        rows: [
          {
            birth_date: '1990-01-01',
            professional_kind: 'PSICOLOGO',
            user_id: 'user-1',
            encounter_status: 'IN_PROGRESS',
            biometric_passed: true,
          },
        ],
      })
      .mockResolvedValueOnce({ rows: [{ id: 'instrument-1' }] })
      .mockRejectedValueOnce(duplicate);

    await expect(
      subject(query).createPsychological({
        encounterId: 'encounter-1',
        professionalId: 'professional-1',
        instrumentId: 'instrument-1',
        performedAt: '2026-08-31T12:00:00.000Z',
        data: {},
        result: 'APTO',
      }),
    ).rejects.toThrow('Psychological exam already recorded');
  });

  it('RN-PEC-102 requires a reason for examiner-reduced medical validity', async () => {
    const query = vi.fn().mockResolvedValueOnce({
      rows: [
        {
          birth_date: '1990-01-01',
          professional_kind: 'MEDICO',
          user_id: 'user-1',
          encounter_status: 'IN_PROGRESS',
          biometric_passed: true,
        },
      ],
    });

    await expect(
      subject(query).createMedical({
        encounterId: 'encounter-1',
        professionalId: 'professional-1',
        performedAt: '2026-08-31T12:00:00.000Z',
        validUntil: '2027-08-31',
        data: {},
        result: 'APTO',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('AC-PEC-011-4 requires an explicit temporary-inaptitude deadline', () => {
    expect(() =>
      subject(vi.fn()).createMedical({
        encounterId: 'encounter-1',
        professionalId: 'professional-1',
        data: {},
        result: 'INAPTO_TEMPORARIO',
      }),
    ).toThrow('Temporary inaptitude requires an explicit end date');
  });
});
