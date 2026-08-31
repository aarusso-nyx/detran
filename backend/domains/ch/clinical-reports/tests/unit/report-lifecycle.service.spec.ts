import { describe, expect, it, vi } from 'vitest';

import { PadesSigningHttpAdapter } from '../../src/pades-signing.http-adapter.js';
import {
  contentSha256,
  ReportLifecycleService,
} from '../../src/report-lifecycle.service.js';

const receipt = {
  contentSha256: '',
  storageDocumentId: 'document-1',
  artifactSha256: 'b'.repeat(64),
  signatureLevel: 'QUALIFIED' as const,
  signatureFormat: 'PAdES-TSA' as const,
  signedAt: '2026-08-31T12:00:00.000Z',
  tsaTime: '2026-08-31T12:00:01.000Z',
  certificateValidationSource: 'OCSP' as const,
  certificateValidationStatus: 'GOOD' as const,
  certificateValidatedAt: '2026-08-31T12:00:02.000Z',
};

function subject(
  query: ReturnType<typeof vi.fn>,
  signing = { renderAndSign: vi.fn() },
  actorId = 'user-1',
) {
  const repository = {
    transaction: async <T>(work: (transaction: unknown) => Promise<T>) =>
      work({ query }),
  };
  const context = { snapshot: () => ({ actorId }) };
  return {
    service: new ReportLifecycleService(
      repository as never,
      context as never,
      signing as never,
    ),
    signing,
  };
}

describe('ReportLifecycleService', () => {
  it('AC-PEC-006-6 hashes canonical content independently of property order', () => {
    expect(contentSha256({ b: 2, a: { d: 4, c: 3 } })).toBe(
      contentSha256({ a: { c: 3, d: 4 }, b: 2 }),
    );
  });

  it('AC-PEC-006-3 fails closed when PAdES signing is not configured', async () => {
    const previousUrl = process.env.DETRAN_CLINICAL_SIGNING_URL;
    const previousToken = process.env.DETRAN_CLINICAL_SIGNING_TOKEN;
    delete process.env.DETRAN_CLINICAL_SIGNING_URL;
    delete process.env.DETRAN_CLINICAL_SIGNING_TOKEN;
    try {
      await expect(
        new PadesSigningHttpAdapter().renderAndSign({
          documentType: 'REPORT',
          contentSha256: 'a'.repeat(64),
          content: {},
          signer: {
            professionalId: 'professional-1',
            name: 'Professional',
            council: 'CRM/1',
          },
          minimumSignatureLevel: 'QUALIFIED',
        }),
      ).rejects.toThrow('Clinical PAdES signing service is not configured');
    } finally {
      if (previousUrl) process.env.DETRAN_CLINICAL_SIGNING_URL = previousUrl;
      if (previousToken)
        process.env.DETRAN_CLINICAL_SIGNING_TOKEN = previousToken;
    }
  });

  it('AC-PEC-006-6 reuses an existing signature for identical content', async () => {
    const preflight = {
      exam_id: 'exam-1',
      exam_data: { acuity: 'ok' },
      exam_result: 'APTO',
      professional_id: 'professional-1',
      professional_name: 'Professional',
      professional_council: 'CRM/1',
      professional_user_id: 'user-1',
      professional_biometric_passed: true,
    };
    const content = {
      encounterId: 'encounter-1',
      kind: 'MEDICAL',
      sourceExamId: 'exam-1',
      examResult: 'APTO',
      examData: { acuity: 'ok' },
      templateVersion: 'v1',
    };
    const existing = {
      id: 'report-1',
      content_sha256: contentSha256(content),
    };
    const query = vi
      .fn()
      .mockResolvedValueOnce({ rows: [preflight] })
      .mockResolvedValueOnce({ rows: [existing] });
    const { service, signing } = subject(query);

    await expect(
      service.create({
        encounterId: 'encounter-1',
        kind: 'MEDICAL',
        templateVersion: 'v1',
      }),
    ).resolves.toBe(existing);
    expect(signing.renderAndSign).not.toHaveBeenCalled();
  });

  it('AC-PEC-006-4 AC-PEC-006-7 AC-PEC-006-8 persists electronic validation evidence without forcing the other track', async () => {
    const preflight = {
      exam_id: 'exam-1',
      exam_data: {},
      exam_result: 'APTO',
      professional_id: 'professional-1',
      professional_name: 'Professional',
      professional_council: 'CRM/1',
      professional_user_id: 'user-1',
      professional_biometric_passed: true,
    };
    const query = vi
      .fn()
      .mockResolvedValueOnce({ rows: [preflight] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 'report-1' }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });
    const signing = {
      renderAndSign: vi.fn(async (request: { contentSha256: string }) => ({
        ...receipt,
        contentSha256: request.contentSha256,
      })),
    };
    const { service } = subject(query, signing);

    await service.create({
      encounterId: 'encounter-1',
      kind: 'MEDICAL',
      templateVersion: 'v1',
    });

    expect(signing.renderAndSign).toHaveBeenCalledWith(
      expect.objectContaining({
        documentType: 'REPORT',
        minimumSignatureLevel: 'QUALIFIED',
      }),
    );
    expect(query.mock.calls[2]?.[1]).toEqual(
      expect.arrayContaining([
        receipt.signatureFormat,
        receipt.tsaTime,
        receipt.certificateValidationSource,
        receipt.certificateValidationStatus,
      ]),
    );
    expect(query.mock.calls[3]?.[0]).toContain('integration.outbox');
    expect(query.mock.calls[3]?.[1]).toEqual(['report-1', 'MEDICAL']);
    const statusSql = query.mock.calls[4]?.[0] as string;
    expect(statusSql).toContain('not exists');
    expect(statusSql).toContain("else 'READY_FOR_SIGNATURE'");
    expect(statusSql).not.toContain("set status = 'SIGNED'");
  });

  it('AC-PEC-007-2 requires Supervisor and Admin Clínica approvals by distinct actors', async () => {
    const requested = {
      id: 'addendum-1',
      status: 'REQUESTED',
      requested_by: 'requester-1',
    };
    const query = vi
      .fn()
      .mockResolvedValueOnce({ rows: [requested] })
      .mockResolvedValueOnce({ rows: [{ id: 'approval-1' }] })
      .mockResolvedValueOnce({ rows: [{ approvals: 1, actors: 1 }] })
      .mockResolvedValueOnce({ rows: [requested] })
      .mockResolvedValueOnce({ rows: [{ id: 'approval-2' }] })
      .mockResolvedValueOnce({ rows: [{ approvals: 2, actors: 2 }] })
      .mockResolvedValueOnce({ rows: [{ ...requested, status: 'APPROVED' }] });

    await expect(
      subject(query, undefined, 'supervisor-1').service.approveAddendum(
        'addendum-1',
        'SUPERVISOR',
      ),
    ).resolves.toMatchObject({ status: 'REQUESTED' });
    await expect(
      subject(query, undefined, 'admin-1').service.approveAddendum(
        'addendum-1',
        'ADMIN_CLINICA',
      ),
    ).resolves.toMatchObject({ status: 'APPROVED' });
    expect(query.mock.calls[1]?.[1]).toEqual([
      'addendum-1',
      'SUPERVISOR',
      'supervisor-1',
    ]);
    expect(query.mock.calls[4]?.[1]).toEqual([
      'addendum-1',
      'ADMIN_CLINICA',
      'admin-1',
    ]);
    expect(query.mock.calls[6]?.[0]).toContain("status = 'APPROVED'");
  });

  it('AC-PEC-007-2 rejects approval by the requesting actor', async () => {
    const query = vi.fn().mockResolvedValueOnce({
      rows: [{ id: 'addendum-1', status: 'REQUESTED', requested_by: 'user-1' }],
    });

    await expect(
      subject(query).service.approveAddendum('addendum-1', 'SUPERVISOR'),
    ).rejects.toThrow('Addendum approval requires a distinct actor');
    expect(query).toHaveBeenCalledTimes(1);
  });

  it('AC-PEC-006-5 AC-PEC-007-1 AC-PEC-007-3 AC-PEC-007-4 signs an appended artifact and enqueues an amended result', async () => {
    const source = {
      id: 'addendum-1',
      report_id: 'report-1',
      reason: 'Material correction',
      content: { result: 'INAPTO_TEMPORARIO' },
      content_sha256: 'a'.repeat(64),
      signer_professional_id: 'professional-1',
      signer_name: 'Professional',
      signer_council: 'CRM/SP 1234',
      professional_user_id: 'user-1',
      report_kind: 'MEDICAL',
      report_artifact_sha256: 'b'.repeat(64),
    };
    const signed = {
      ...source,
      status: 'SIGNED',
      artifact_sha256: receipt.artifactSha256,
    };
    const query = vi
      .fn()
      .mockResolvedValueOnce({ rows: [source] })
      .mockResolvedValueOnce({ rows: [signed] })
      .mockResolvedValueOnce({ rows: [] });
    const signing = {
      renderAndSign: vi.fn(async () => ({
        ...receipt,
        contentSha256: source.content_sha256,
      })),
    };
    const { service } = subject(query, signing);

    await expect(service.signAddendum('addendum-1')).resolves.toMatchObject({
      status: 'SIGNED',
    });
    expect(signing.renderAndSign).toHaveBeenCalledWith(
      expect.objectContaining({
        documentType: 'REPORT_ADDENDUM',
        content: expect.objectContaining({
          reportId: 'report-1',
          originalArtifactSha256: source.report_artifact_sha256,
        }),
        minimumSignatureLevel: 'QUALIFIED',
      }),
    );
    expect(query.mock.calls[2]?.[0]).toContain('integration.outbox');
    expect(query.mock.calls[2]?.[1]).toEqual([
      'addendum-1',
      'report-1',
      'MEDICAL',
    ]);
    expect(query.mock.calls[2]?.[0]).toContain('ch.report-addendum:');
  });
});
