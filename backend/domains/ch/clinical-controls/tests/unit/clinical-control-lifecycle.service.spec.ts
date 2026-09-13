import { BadRequestException, NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import { ClinicalControlLifecycleService } from '../../src/clinical-control-lifecycle.service.js';

function subject(query: ReturnType<typeof vi.fn>, actorId = 'actor-1') {
  const events = {
    transaction: async <T>(
      work: (transaction: { query: typeof query }) => Promise<T>,
    ) => work({ query }),
  };
  const context = { snapshot: () => ({ actorId }) };
  return new ClinicalControlLifecycleService(events as never, context as never);
}

describe('ClinicalControlLifecycleService', () => {
  it('records a kind-specific event with actor attribution', async () => {
    const event = { id: 'event-1', control_kind: 'OPHTHALMOLOGY' };
    const query = vi.fn().mockResolvedValue({ rows: [event] });

    await expect(
      subject(query).record({
        encounterId: 'encounter-1',
        medicalExamId: 'exam-1',
        controlKind: 'OPHTHALMOLOGY',
        payload: {
          visualAcuityLeft: '20/20',
          visualAcuityRight: '20/20',
          colorVision: 'PASS',
          fieldOfVision: 'PASS',
        },
      }),
    ).resolves.toEqual(event);
    expect(query.mock.calls[0]?.[1]?.slice(0, 4)).toEqual([
      'encounter-1',
      'exam-1',
      null,
      'OPHTHALMOLOGY',
    ]);
    expect(query.mock.calls[0]?.[1]?.[5]).toBe('actor-1');
  });

  it('requires every kind-specific payload field', () => {
    const query = vi.fn();
    expect(() =>
      subject(query).record({
        encounterId: 'encounter-1',
        controlKind: 'SLEEP',
        payload: { epworthScore: 4 },
      }),
    ).toThrow(/polysomnographyRequired/);
    expect(query).not.toHaveBeenCalled();
  });

  it('rejects ambiguous exam references', () => {
    const query = vi.fn();
    expect(() =>
      subject(query).record({
        encounterId: 'encounter-1',
        medicalExamId: 'medical-1',
        psychologicalExamId: 'psych-1',
        controlKind: 'DEVOLUTIVE',
        payload: { deliveredAt: '2026-08-31', summary: 'Delivered' },
      }),
    ).toThrow(BadRequestException);
  });

  it('does not treat an intern as their own supervisor', () => {
    const query = vi.fn();
    expect(() =>
      subject(query).record({
        encounterId: 'encounter-1',
        controlKind: 'INTERN_DOUBLE_VALIDATION',
        payload: {
          internId: 'professional-1',
          supervisorId: 'professional-1',
          validatedAt: '2026-08-31T10:00:00Z',
        },
      }),
    ).toThrow(/must be distinct/);
  });

  it('fails closed when an optional exam does not belong to the encounter', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    await expect(
      subject(query).record({
        encounterId: 'encounter-1',
        psychologicalExamId: 'exam-elsewhere',
        controlKind: 'DEVOLUTIVE',
        payload: { deliveredAt: '2026-08-31', summary: 'Delivered' },
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
