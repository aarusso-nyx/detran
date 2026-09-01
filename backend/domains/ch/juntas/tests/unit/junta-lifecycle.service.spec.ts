import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import { JuntaLifecycleService } from '../../src/junta-lifecycle.service.js';

function subject(query: ReturnType<typeof vi.fn>, actorId = 'actor-1') {
  const cases = {
    transaction: async <T>(
      work: (transaction: { query: typeof query }) => Promise<T>,
    ) => work({ query }),
  };
  const context = { snapshot: () => ({ actorId }) };
  const signing = { renderAndSign: vi.fn() };
  return {
    service: new JuntaLifecycleService(
      cases as never,
      context as never,
      signing as never,
    ),
    signing,
  };
}

const members = [
  { professionalId: 'p-1', role: 'CHAIR' as const, specialist: true },
  { professionalId: 'p-2', role: 'MEMBER' as const, specialist: true },
  { professionalId: 'p-3', role: 'MEMBER' as const, specialist: false },
];

describe('JuntaLifecycleService', () => {
  it('records candidate and operator separately and derives the sourced 30-day deadline', async () => {
    const record = { id: 'case-1', status: 'SUBMITTED' };
    const query = vi.fn().mockResolvedValue({ rows: [record] });

    await expect(
      subject(query).service.submit({
        encounterId: 'encounter-1',
        applicantPatientId: 'patient-1',
        track: 'MEDICAL',
        reasonCode: 'RESULT_DISAGREEMENT',
        resultKnownAt: '2026-08-01T00:00:00.000Z',
        requestedAt: '2026-08-20T00:00:00.000Z',
      }),
    ).resolves.toEqual(record);
    expect(query.mock.calls[0]?.[0]).toContain("interval '30 days'");
    expect(query.mock.calls[0]?.[1]).toContain('actor-1');
  });

  it('rejects a candidate request after the sourced filing period', () => {
    const query = vi.fn();
    expect(() =>
      subject(query).service.submit({
        encounterId: 'encounter-1',
        applicantPatientId: 'patient-1',
        track: 'MEDICAL',
        reasonCode: 'RESULT_DISAGREEMENT',
        resultKnownAt: '2026-06-01T00:00:00.000Z',
        requestedAt: '2026-08-20T00:00:00.000Z',
      }),
    ).toThrow(BadRequestException);
    expect(query).not.toHaveBeenCalled();
  });

  it('fails closed when encounter and applicant do not match', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    await expect(
      subject(query).service.submit({
        encounterId: 'encounter-1',
        applicantPatientId: 'other-patient',
        track: 'PSYCH',
        reasonCode: 'CLINICAL_DIVERGENCE',
        resultKnownAt: '2026-08-01T00:00:00.000Z',
        requestedAt: '2026-08-02T00:00:00.000Z',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('requires a holiday-aware deadline input for the sourced 15-business-day rule', () => {
    const query = vi.fn();
    expect(() =>
      subject(query).service.designateSecond('case-1', {
        members,
        designatedAt: '2026-08-10T00:00:00.000Z',
      }),
    ).toThrow(BadRequestException);
  });

  it('never invents a designation deadline for Junta Especial', () => {
    const query = vi.fn();
    expect(() =>
      subject(query).service.designateSpecial('case-1', {
        members,
        designatedAt: '2026-08-10T00:00:00.000Z',
        designationDeadlineAt: '2026-08-20T00:00:00.000Z',
      }),
    ).toThrow(BadRequestException);
  });

  it('requires exactly three distinct members and two specialists for Junta Especial', () => {
    const query = vi.fn();
    expect(() =>
      subject(query).service.designateSpecial('case-1', {
        members: members.map((member) => ({ ...member, specialist: false })),
        designatedAt: '2026-08-10T00:00:00.000Z',
      }),
    ).toThrow(BadRequestException);
  });

  it('creates a distinct CETRAN-designated board with persisted membership', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'case-1',
            applicant_patient_id: 'patient-1',
            track: 'MEDICAL',
            status: 'APPEALED',
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: members.map((member) => ({
          id: member.professionalId,
          professional_kind: 'MEDICO',
          is_active: true,
        })),
      })
      .mockResolvedValueOnce({
        rows: [{ id: 'special-board', instance: 'SPECIAL' }],
      })
      .mockResolvedValue({ rows: [] });

    await expect(
      subject(query).service.designateSpecial('case-1', {
        members,
        designatedAt: '2026-08-10T00:00:00.000Z',
      }),
    ).resolves.toMatchObject({ id: 'special-board', instance: 'SPECIAL' });
    expect(query.mock.calls[2]?.[1]).toEqual([
      'case-1',
      'SPECIAL',
      'CETRAN',
      '2026-08-10T00:00:00.000Z',
      null,
      null,
    ]);
    expect(
      query.mock.calls.filter(([sql]) =>
        String(sql).includes('junta_board_member'),
      ),
    ).toHaveLength(3);
  });

  it('requires an upheld second-instance decision before accepting an appeal', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    await expect(
      subject(query).service.fileAppeal('case-1', {
        sourceDecisionId: 'decision-1',
        applicantPatientId: 'patient-1',
        resultKnownAt: '2026-08-01T00:00:00.000Z',
        filedAt: '2026-08-10T00:00:00.000Z',
        forwardingDeadlineAt: '2026-09-08T00:00:00.000Z',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(query.mock.calls[0]?.[0]).toContain("decision.outcome = 'UPHELD'");
  });

  it('does not allow the same board to receive another conclusive decision', async () => {
    const query = vi.fn().mockResolvedValue({
      rows: [
        {
          id: 'board-1',
          case_id: 'case-1',
          instance: 'SECOND',
          status: 'DECIDED',
          track: 'MEDICAL',
        },
      ],
    });
    await expect(
      subject(query).service.decide('board-1', {
        outcome: 'UPHELD',
        rationale: 'Fundamentação',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('signs a distinct Junta Especial decision and marks administrative exhaustion', async () => {
    const board = {
      id: 'board-1',
      case_id: 'case-1',
      instance: 'SPECIAL',
      status: 'DESIGNATED',
      track: 'MEDICAL',
    };
    const persistedMembers = members.map((member) => ({
      id: member.professionalId,
      person_name: member.professionalId,
      professional_kind: 'MEDICO',
      council_type: 'CRM',
      council_number: '123',
      council_state: 'AM',
      user_id: member.professionalId === 'p-1' ? 'actor-1' : null,
      is_active: true,
      role: member.role,
      specialist: member.specialist,
    }));
    const decision = {
      id: 'decision-1',
      administrative_exhausted: true,
    };
    const query = vi
      .fn()
      .mockResolvedValueOnce({ rows: [board] })
      .mockResolvedValueOnce({ rows: persistedMembers })
      .mockResolvedValueOnce({ rows: [board] })
      .mockResolvedValueOnce({ rows: [decision] })
      .mockResolvedValue({ rows: [] });
    const { service, signing } = subject(query);
    signing.renderAndSign.mockResolvedValue({
      contentSha256: 'a'.repeat(64),
      storageDocumentId: 'storage-1',
      artifactSha256: 'b'.repeat(64),
      signatureLevel: 'QUALIFIED',
      signatureFormat: 'PAdES-TSA',
      signedAt: '2026-08-31T00:00:00.000Z',
      tsaTime: '2026-08-31T00:00:01.000Z',
      certificateValidationSource: 'OCSP',
      certificateValidationStatus: 'GOOD',
      certificateValidatedAt: '2026-08-31T00:00:02.000Z',
    });

    await expect(
      service.decide('board-1', {
        outcome: 'UPHELD',
        rationale: 'Decisão colegiada fundamentada',
      }),
    ).resolves.toEqual(decision);
    expect(signing.renderAndSign).toHaveBeenCalledWith(
      expect.objectContaining({
        documentType: 'JUNTA_DECISION',
        signer: expect.objectContaining({ professionalId: 'p-1' }),
        content: expect.objectContaining({
          instance: 'SPECIAL',
          members: expect.arrayContaining([
            expect.objectContaining({
              professionalId: 'p-2',
              specialist: true,
            }),
          ]),
        }),
      }),
    );
    expect(query.mock.calls[3]?.[1]?.at(-1)).toBe(true);
    expect(
      query.mock.calls.some(([sql]) =>
        String(sql).includes("status = 'DECIDED'"),
      ),
    ).toBe(true);
  });

  it('rejects a decision recorded by someone outside the designated board', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'board-1',
            case_id: 'case-1',
            instance: 'SECOND',
            status: 'DESIGNATED',
            track: 'PSYCH',
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: members.map((member) => ({
          id: member.professionalId,
          person_name: member.professionalId,
          professional_kind: 'PSICOLOGO',
          council_type: 'CRP',
          council_number: '123',
          council_state: 'AM',
          user_id: null,
          is_active: true,
          role: member.role,
          specialist: member.specialist,
        })),
      });

    await expect(
      subject(query).service.decide('board-1', {
        outcome: 'REVERSED',
        rationale: 'Fundamentação',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
