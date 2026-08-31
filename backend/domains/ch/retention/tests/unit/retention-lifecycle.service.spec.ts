import { describe, expect, it, vi } from 'vitest';

import { RetentionLifecycleService } from '../../src/retention-lifecycle.service.js';

function subject(query: ReturnType<typeof vi.fn>, actorId = 'dpo-1') {
  const repository = {
    transaction: async <T>(work: (transaction: unknown) => Promise<T>) =>
      work({ query }),
  };
  const context = { snapshot: () => ({ actorId }) };
  return new RetentionLifecycleService(repository as never, context as never);
}

describe('RetentionLifecycleService', () => {
  it('AC-PEC-014-1 calculates the floor from the latest record and retains the dossier', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({
        rows: [
          {
            birth_date: '1980-01-01',
            last_record_at: '2025-06-01T12:00:00.000Z',
            eligible_after: '2045-06-01',
            has_active_hold: false,
            floor_elapsed: false,
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'case-1',
            status: 'RETAINED',
            eligible_after: '2045-06-01',
            preservation_status: 'PAdES_LTA_REQUIRED',
          },
        ],
      });

    await expect(subject(query).assess('patient-1')).resolves.toMatchObject({
      status: 'RETAINED',
      eligible_after: '2045-06-01',
    });
    expect(query.mock.calls[0]?.[0]).toContain('select addendum.signed_at');
    expect(JSON.parse(query.mock.calls[1]?.[1]?.[4] as string)).toContain(
      'TWENTY_YEAR_FLOOR',
    );
  });

  it('AC-PEC-014-5 routes underage dossiers to legal review', async () => {
    const nextYear = new Date().getUTCFullYear() + 1;
    const query = vi
      .fn()
      .mockResolvedValueOnce({
        rows: [
          {
            birth_date: `${nextYear}-01-01`,
            last_record_at: '2000-01-01T00:00:00.000Z',
            eligible_after: '2020-01-01',
            has_active_hold: false,
            floor_elapsed: true,
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [{ id: 'case-1', status: 'LEGAL_REVIEW' }],
      });

    await expect(subject(query).assess('patient-1')).resolves.toMatchObject({
      status: 'LEGAL_REVIEW',
    });
    expect(JSON.parse(query.mock.calls[1]?.[1]?.[4] as string)).toContain(
      'UNDERAGE_LEGAL_REVIEW',
    );
  });

  it('AC-PEC-014-2 offers return before recording a disposition', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({
        rows: [
          {
            status: 'ELIGIBLE_BLOCKED',
            preservation_status: 'PAdES_LTA_REQUIRED',
            has_active_hold: false,
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [{ id: 'disposition-1', status: 'PROPOSED' }],
      });

    await expect(
      subject(query).propose('case-1', 'RETURN', 'Requested by patient'),
    ).resolves.toMatchObject({ status: 'PROPOSED' });
    expect(query.mock.calls[1]?.[0]).toContain('return_offered_at');
  });

  it('AC-PEC-014-6 blocks deletion while PAdES-LTA is unavailable', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({
        rows: [
          {
            status: 'ELIGIBLE_BLOCKED',
            preservation_status: 'PAdES_LTA_REQUIRED',
            has_active_hold: false,
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [{ id: 'disposition-1', status: 'BLOCKED' }],
      });

    await expect(
      subject(query).propose('case-1', 'DELETE', 'Retention floor elapsed'),
    ).resolves.toMatchObject({ status: 'BLOCKED' });
    expect(query.mock.calls[1]?.[1]?.[2]).toBe('BLOCKED');
  });

  it('AC-PEC-014-4 records DPO review only for non-deletion proposals', async () => {
    const query = vi.fn().mockResolvedValueOnce({
      rows: [{ id: 'disposition-1', status: 'DPO_REVIEWED' }],
    });

    await expect(subject(query).review('disposition-1')).resolves.toMatchObject(
      {
        status: 'DPO_REVIEWED',
      },
    );
    expect(query.mock.calls[0]?.[0]).toContain("destination <> 'DELETE'");
  });
});
