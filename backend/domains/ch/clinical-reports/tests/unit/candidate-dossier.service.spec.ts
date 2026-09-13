import { describe, expect, it, vi } from 'vitest';

import { CandidateDossierService } from '../../src/candidate-dossier.service.js';

function subject(query: ReturnType<typeof vi.fn>, actorId = 'candidate-1') {
  const repository = {
    transaction: async <T>(work: (transaction: unknown) => Promise<T>) =>
      work({ query }),
  };
  return new CandidateDossierService(
    repository as never,
    { snapshot: () => ({ actorId }) } as never,
  );
}

describe('CandidateDossierService', () => {
  it('AC-PEC-011-6 returns only the dossier bound to the authenticated candidate', async () => {
    const dossier = {
      encounter_id: 'encounter-1',
      patient_id: 'patient-1',
      patient_name: 'Candidate',
      reports: [{ resultCode: 'INAPTO', resultLabel: 'Inapto' }],
      feedback_requests: [],
    };
    const query = vi.fn().mockResolvedValueOnce({ rows: [dossier] });

    await expect(subject(query).getOwn('encounter-1')).resolves.toBe(dossier);
    expect(query.mock.calls[0]?.[0]).toContain('patient.user_id = $2');
    expect(query.mock.calls[0]?.[0]).not.toContain('exam.data');
    expect(query.mock.calls[0]?.[1]).toEqual(['encounter-1', 'candidate-1']);
  });

  it('AC-PEC-011-6 does not disclose a dossier owned by another candidate', async () => {
    const query = vi.fn().mockResolvedValueOnce({ rows: [] });

    await expect(subject(query).getOwn('encounter-1')).rejects.toThrow(
      'Candidate dossier not found',
    );
  });

  it('AC-PEC-011-6 lets the owner request a psychological feedback interview', async () => {
    const source = {
      report_id: 'report-1',
      encounter_id: 'encounter-1',
      patient_id: 'patient-1',
      professional_id: 'professional-1',
      result: 'INAPTO_TEMPORARIO',
    };
    const request = { id: 'feedback-1', status: 'REQUESTED' };
    const query = vi
      .fn()
      .mockResolvedValueOnce({ rows: [source] })
      .mockResolvedValueOnce({ rows: [request] });

    await expect(subject(query).requestFeedback('encounter-1')).resolves.toBe(
      request,
    );
    expect(query.mock.calls[0]?.[0]).toContain('patient.user_id = $2');
    expect(query.mock.calls[0]?.[0]).toContain("report.kind = 'PSYCH'");
    expect(query.mock.calls[1]?.[1]).toEqual([
      'report-1',
      'encounter-1',
      'patient-1',
      'professional-1',
      'candidate-1',
      'Inapto temporário',
    ]);
  });

  it('AC-PEC-011-6 binds scheduling and completion to the responsible psychologist', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({
        rows: [{ id: 'feedback-1', status: 'SCHEDULED' }],
      })
      .mockResolvedValueOnce({
        rows: [{ id: 'feedback-1', status: 'COMPLETED' }],
      });
    const service = subject(query, 'psychologist-1');

    await service.scheduleFeedback('feedback-1', {
      scheduledAt: '2099-01-01T12:00:00.000Z',
    });
    await service.completeFeedback('feedback-1', {
      summary: 'Result presented objectively to the candidate.',
    });

    expect(query.mock.calls[0]?.[0]).toContain('professional.user_id = $4');
    expect(query.mock.calls[0]?.[1]).toEqual([
      'feedback-1',
      'REQUESTED',
      '2099-01-01T12:00:00.000Z',
      'psychologist-1',
    ]);
    expect(query.mock.calls[1]?.[1]).toEqual([
      'feedback-1',
      'SCHEDULED',
      'Result presented objectively to the candidate.',
      'psychologist-1',
    ]);
    expect(query.mock.calls[1]?.[0]).toContain(
      'feedback.scheduled_at <= now()',
    );
  });
});
