import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import {
  CLOSURE_MISSING,
  EncounterClosureService,
} from '../../src/encounter-closure.service.js';

const baseSnapshot = {
  encounter_id: 'encounter-1',
  status: 'SIGNED',
  patient_id: 'patient-1',
  patient_name: 'Patient',
  started_at: '2026-08-31T10:00:00.000Z',
  renach_process_key: 'RENACH-1',
  medical_exam: { id: 'medical-1', result: 'APTO' },
  psychological_exam: { id: 'psych-1', result: 'APTO' },
  medical_result: 'APTO',
  reports: [
    { id: 'report-medical', kind: 'MEDICAL', artifactSha256: 'a'.repeat(64) },
    { id: 'report-psych', kind: 'PSYCH', artifactSha256: 'b'.repeat(64) },
  ],
  report_count: 2,
  active_block_count: 0,
  restriction_count: 0,
  renach_acked: true,
  documents: [],
  closer_professional_id: 'professional-1',
  closer_name: 'Dr Example',
  closer_council_type: 'CRM',
  closer_council_number: '1234',
  closer_council_state: 'SP',
};

const receipt = {
  contentSha256: '',
  storageDocumentId: 'document-export-1',
  artifactSha256: 'c'.repeat(64),
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
  return {
    service: new EncounterClosureService(
      repository as never,
      { snapshot: () => ({ actorId }) } as never,
      signing as never,
    ),
    signing,
  };
}

function responseMissing(error: unknown): string[] {
  expect(error).toBeInstanceOf(BadRequestException);
  return (error as BadRequestException).getResponse() instanceof Object
    ? ((error as BadRequestException).getResponse() as { missing: string[] })
        .missing
    : [];
}

describe('EncounterClosureService', () => {
  it('AC-PEC-008-1 lists every unmet pre-export gate and never signs', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({
        rows: [
          {
            ...baseSnapshot,
            status: 'IN_PROGRESS',
            medical_exam: null,
            psychological_exam: null,
            medical_result: null,
            reports: [],
            report_count: 0,
            active_block_count: 2,
            renach_process_key: null,
            renach_acked: false,
            closer_professional_id: null,
            closer_name: null,
            closer_council_type: null,
            closer_council_number: null,
            closer_council_state: null,
          },
        ],
      })
      .mockResolvedValueOnce({ rows: [{ available: false }] });
    const { service, signing } = subject(query);

    const error = await service.close('encounter-1').catch((caught) => caught);

    expect(responseMissing(error)).toEqual([
      CLOSURE_MISSING.encounterSigned,
      CLOSURE_MISSING.medicalExam,
      CLOSURE_MISSING.psychologicalExam,
      CLOSURE_MISSING.medicalReport,
      CLOSURE_MISSING.psychologicalReport,
      CLOSURE_MISSING.activeBlocks,
      CLOSURE_MISSING.juntaLedger,
      CLOSURE_MISSING.renachProcess,
      CLOSURE_MISSING.renachAck,
      CLOSURE_MISSING.signer,
    ]);
    expect(signing.renderAndSign).not.toHaveBeenCalled();
  });

  it('AC-PEC-008-2 requires a federal restriction for APTO_COM_RESTRICOES', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({
        rows: [
          {
            ...baseSnapshot,
            medical_result: 'APTO_COM_RESTRICOES',
            restriction_count: 0,
          },
        ],
      })
      .mockResolvedValueOnce({ rows: [{ available: true }] })
      .mockResolvedValueOnce({ rows: [{ pending: false }] });

    const error = await subject(query)
      .service.close('encounter-1')
      .catch((caught) => caught);

    expect(responseMissing(error)).toEqual([CLOSURE_MISSING.restriction]);
  });

  it('AC-PEC-008-3 and AC-PEC-009-4 block closure until RENACH is acknowledged', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({
        rows: [{ ...baseSnapshot, renach_acked: false }],
      })
      .mockResolvedValueOnce({ rows: [{ available: true }] })
      .mockResolvedValueOnce({ rows: [{ pending: false }] });
    const { service, signing } = subject(query);

    const error = await service.close('encounter-1').catch((caught) => caught);

    expect(responseMissing(error)).toEqual([CLOSURE_MISSING.renachAck]);
    expect(signing.renderAndSign).not.toHaveBeenCalled();
    expect(
      query.mock.calls.every(
        ([sql]) => !String(sql).includes('insert into integration.outbox'),
      ),
    ).toBe(true);
  });

  it('fails closed while the Owner-blocked junta ledger is unavailable', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({ rows: [baseSnapshot] })
      .mockResolvedValueOnce({ rows: [{ available: false }] });

    const error = await subject(query)
      .service.close('encounter-1')
      .catch((caught) => caught);

    expect(responseMissing(error)).toEqual([CLOSURE_MISSING.juntaLedger]);
    expect(
      query.mock.calls.some(([sql]) =>
        String(sql).includes('from ch.junta_case'),
      ),
    ).toBe(false);
  });

  it('AC-PEC-008-4 signs the immutable export before atomically closing', async () => {
    let snapshotCalls = 0;
    const query = vi.fn(async (sql: string) => {
      if (sql.includes('from ch.encounter encounter')) {
        snapshotCalls += 1;
        return { rows: [baseSnapshot] };
      }
      if (sql.includes("to_regclass('ch.junta_case')"))
        return { rows: [{ available: true }] };
      if (sql.includes('from ch.junta_case'))
        return { rows: [{ pending: false }] };
      if (sql.includes('insert into ch.episode_export'))
        return {
          rows: [
            {
              id: 'export-1',
              encounter_id: 'encounter-1',
              content_sha256: receipt.contentSha256,
              storage_document_id: receipt.storageDocumentId,
              artifact_sha256: receipt.artifactSha256,
            },
          ],
        };
      if (sql.includes('update ch.encounter'))
        return { rows: [{ id: 'encounter-1', status: 'CLOSED' }] };
      throw new Error(`Unexpected query: ${sql}`);
    });
    const signing = {
      renderAndSign: vi.fn(async (request: { contentSha256: string }) => ({
        ...receipt,
        contentSha256: request.contentSha256,
      })),
    };
    const { service } = subject(query, signing);

    await expect(service.close('encounter-1')).resolves.toMatchObject({
      encounter: { status: 'CLOSED' },
      episodeExport: { id: 'export-1' },
    });
    expect(snapshotCalls).toBe(2);
    expect(signing.renderAndSign).toHaveBeenCalledWith(
      expect.objectContaining({
        documentType: 'EPISODE_EXPORT',
        minimumSignatureLevel: 'QUALIFIED',
        signer: expect.objectContaining({ council: 'CRM/SP 1234' }),
      }),
    );
    const insertIndex = query.mock.calls.findIndex(([sql]) =>
      String(sql).includes('insert into ch.episode_export'),
    );
    const closeIndex = query.mock.calls.findIndex(([sql]) =>
      String(sql).includes('update ch.encounter'),
    );
    expect(insertIndex).toBeGreaterThan(-1);
    expect(closeIndex).toBeGreaterThan(insertIndex);
  });

  it('rejects stale signed content when evidence changes during signing', async () => {
    let snapshotCalls = 0;
    const query = vi.fn(async (sql: string) => {
      if (sql.includes('from ch.encounter encounter')) {
        snapshotCalls += 1;
        return {
          rows: [
            snapshotCalls === 1
              ? baseSnapshot
              : { ...baseSnapshot, documents: [{ id: 'new-document' }] },
          ],
        };
      }
      if (sql.includes("to_regclass('ch.junta_case')"))
        return { rows: [{ available: true }] };
      if (sql.includes('from ch.junta_case'))
        return { rows: [{ pending: false }] };
      throw new Error(`Unexpected query: ${sql}`);
    });
    const signing = {
      renderAndSign: vi.fn(async (request: { contentSha256: string }) => ({
        ...receipt,
        contentSha256: request.contentSha256,
      })),
    };

    await expect(
      subject(query, signing).service.close('encounter-1'),
    ).rejects.toThrow(
      'Encounter evidence changed while the episode export was signed',
    );
    expect(
      query.mock.calls.some(([sql]) =>
        String(sql).includes("status = 'CLOSED'"),
      ),
    ).toBe(false);
  });

  it('returns an already closed encounter only with its signed export', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({ rows: [{ ...baseSnapshot, status: 'CLOSED' }] })
      .mockResolvedValueOnce({
        rows: [{ id: 'encounter-1', status: 'CLOSED' }],
      })
      .mockResolvedValueOnce({
        rows: [{ id: 'export-1', encounter_id: 'encounter-1' }],
      });
    const { service, signing } = subject(query);

    await expect(service.close('encounter-1')).resolves.toMatchObject({
      encounter: { status: 'CLOSED' },
      episodeExport: { id: 'export-1' },
    });
    expect(signing.renderAndSign).not.toHaveBeenCalled();
  });
});
