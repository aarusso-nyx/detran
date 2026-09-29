import { describe, expect, it, vi } from 'vitest';

import { PecRenachTransmissionService } from './pec-renach-transmission.service.js';

const claimed = {
  id: 'outbox-1',
  payload: { reportId: 'report-1', kind: 'MEDICAL' },
  idempotency_key: 'ch.report:report-1',
  attempts: 1,
};

const medicalSource = {
  report_id: 'report-1',
  kind: 'MEDICAL',
  artifact_sha256: 'a'.repeat(64),
  signed_at: '2026-08-31T12:01:00.000Z',
  renach_process_key: 'RN123',
  renach_process_type: 'RENEWAL',
  current_category: 'B',
  requested_category: null,
  appointment_id: 'appointment-1',
  clinic_code: 'clinic-1',
  clinic_cnpj: '12345678000199',
  patient_cpf: '11144477735',
  patient_name: 'Candidate',
  patient_birth_date: '1980-01-01',
  examiner_cpf: '52998224725',
  council_type: 'CRM',
  council_number: '1234',
  council_state: 'AM',
  performed_at: '2026-08-31T12:00:00.000Z',
  result: 'APTO',
  valid_until: '2031-08-31',
  restrictions: [],
};

function subject(query: ReturnType<typeof vi.fn>, renach: object) {
  const database = {
    tx: async <T>(
      work: (transaction: { query: typeof query }) => Promise<T>,
      options: unknown,
    ) => {
      expect(options).toMatchObject({ role: 'app' });
      return work({ query });
    },
  };
  const context = {
    hasActiveContext: () => true,
    snapshot: () => ({
      tenantId: 'tenant-1',
      actorId: 'actor-1',
      requestId: 'request-1',
    }),
  };
  return new PecRenachTransmissionService(
    database as never,
    context as never,
    renach as never,
  );
}

describe('PecRenachTransmissionService', () => {
  it('AC-PEC-009-1 dispatches a minimum result payload with the durable key', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({ rows: [claimed] })
      .mockResolvedValueOnce({ rows: [medicalSource] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });
    const submitMedicalExam = vi.fn().mockResolvedValue({
      protocol: 'RENACH-1',
      examId: 'exam-remote-1',
      result: 'APTO',
    });

    await expect(
      subject(query, { submitMedicalExam }).dispatchDue(),
    ).resolves.toEqual([
      {
        outboxId: 'outbox-1',
        status: 'acked',
        providerProtocol: 'RENACH-1',
      },
    ]);

    expect(submitMedicalExam).toHaveBeenCalledWith(
      expect.objectContaining({
        renachNumber: 'RN123',
        result: 'APTO',
        signature: { hash: 'a'.repeat(64), signedAt: medicalSource.signed_at },
      }),
      expect.objectContaining({
        tenantId: 'tenant-1',
        metadata: { idempotencyKey: 'ch.report:report-1' },
      }),
    );
    expect(JSON.stringify(submitMedicalExam.mock.calls[0]?.[0])).not.toMatch(
      /exam_data|anamnes|content|protocolos?/iu,
    );
    expect(query.mock.calls[2]?.[0]).toContain('integration.delivery_attempt');
    expect(query.mock.calls[3]?.[0]).toContain("status = 'acked'");
  });

  it('AC-PEC-009-2 exposes provider failure and schedules a visible retry', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({ rows: [claimed] })
      .mockResolvedValueOnce({ rows: [medicalSource] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });
    const submitMedicalExam = vi
      .fn()
      .mockRejectedValue(new Error('provider unavailable'));

    await expect(
      subject(query, { submitMedicalExam }).dispatchDue(),
    ).resolves.toEqual([
      {
        outboxId: 'outbox-1',
        status: 'error',
        error: 'provider unavailable',
      },
    ]);
    expect(query.mock.calls[2]?.[0]).toContain("'error'");
    expect(query.mock.calls[3]?.[0]).toContain("interval '15 minutes'");
  });

  it('AC-PEC-007-4 retransmits a signed amended result and artifact', async () => {
    const addendumClaim = {
      ...claimed,
      payload: {
        ...claimed.payload,
        addendumId: 'addendum-1',
      },
      idempotency_key: 'ch.report-addendum:addendum-1',
    };
    const amendedSource = {
      ...medicalSource,
      artifact_sha256: 'c'.repeat(64),
      signed_at: '2026-08-31T13:01:00.000Z',
      result: 'INAPTO_TEMPORARIO',
    };
    const query = vi
      .fn()
      .mockResolvedValueOnce({ rows: [addendumClaim] })
      .mockResolvedValueOnce({ rows: [amendedSource] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });
    const submitMedicalExam = vi.fn().mockResolvedValue({
      protocol: 'RENACH-2',
      examId: 'exam-remote-1',
      result: 'INAPTO_TEMPORARIO',
    });

    await expect(
      subject(query, { submitMedicalExam }).dispatchDue(),
    ).resolves.toEqual([
      {
        outboxId: 'outbox-1',
        status: 'acked',
        providerProtocol: 'RENACH-2',
      },
    ]);

    expect(query.mock.calls[1]?.[0]).toContain('ch.report_addendum');
    expect(query.mock.calls[1]?.[1]).toEqual(['report-1', 'addendum-1']);
    expect(submitMedicalExam).toHaveBeenCalledWith(
      expect.objectContaining({
        result: 'INAPTO_TEMPORARIO',
        signature: {
          hash: 'c'.repeat(64),
          signedAt: amendedSource.signed_at,
        },
      }),
      expect.objectContaining({
        metadata: { idempotencyKey: 'ch.report-addendum:addendum-1' },
      }),
    );
  });

  it('fails closed when queue metadata disagrees with the report kind', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({
        rows: [{ ...claimed, payload: { ...claimed.payload, kind: 'PSYCH' } }],
      })
      .mockResolvedValueOnce({ rows: [medicalSource] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });
    const submitMedicalExam = vi.fn();
    const submitPsychologicalEvaluation = vi.fn();

    await expect(
      subject(query, {
        submitMedicalExam,
        submitPsychologicalEvaluation,
      }).dispatchDue(),
    ).resolves.toEqual([
      expect.objectContaining({
        outboxId: 'outbox-1',
        status: 'error',
        error: expect.stringContaining('does not match MEDICAL'),
      }),
    ]);
    expect(submitMedicalExam).not.toHaveBeenCalled();
    expect(submitPsychologicalEvaluation).not.toHaveBeenCalled();
  });
});
