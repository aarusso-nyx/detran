import { describe, expect, it, vi } from 'vitest';

import { RestrictionLifecycleService } from '../../src/restriction-lifecycle.service.js';

function subject(query: ReturnType<typeof vi.fn>, actorId = 'user-1') {
  const repository = {
    transaction: async <T>(work: (transaction: unknown) => Promise<T>) =>
      work({ query }),
  };
  const context = { snapshot: () => ({ actorId }) };
  return new RestrictionLifecycleService(repository as never, context as never);
}

describe('RestrictionLifecycleService', () => {
  it('AC-PEC-011-3 fails closed when the authoritative Anexo XV code is absent', async () => {
    const query = vi.fn().mockResolvedValueOnce({
      rows: [
        {
          professional_id: 'professional-1',
          result: 'APTO_COM_RESTRICOES',
          code_id: null,
        },
      ],
    });

    await expect(
      subject(query).apply({
        encounterId: 'encounter-1',
        restrictionCodeId: 'unverified-code',
      }),
    ).rejects.toThrow(
      'Restriction code is absent from the active authoritative Anexo XV catalog',
    );
    expect(query).toHaveBeenCalledTimes(1);
  });

  it('AC-PEC-011-2 permits restrictions only on the medical restricted result', async () => {
    const query = vi.fn().mockResolvedValueOnce({
      rows: [
        {
          professional_id: 'professional-1',
          result: 'APTO',
          code_id: 'code-1',
        },
      ],
    });

    await expect(
      subject(query).apply({
        encounterId: 'encounter-1',
        restrictionCodeId: 'code-1',
      }),
    ).rejects.toThrow('require the responsible medical examiner');
  });

  it('AC-PEC-011-3 persists a verified code under the responsible examiner', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({
        rows: [
          {
            professional_id: 'professional-1',
            result: 'APTO_COM_RESTRICOES',
            code_id: 'code-1',
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'restriction-1',
            restriction_code_id: 'code-1',
            prescribed_by: 'professional-1',
          },
        ],
      });

    await expect(
      subject(query).apply({
        encounterId: 'encounter-1',
        restrictionCodeId: 'code-1',
      }),
    ).resolves.toMatchObject({
      restriction_code_id: 'code-1',
      prescribed_by: 'professional-1',
    });
    expect(query.mock.calls[1]?.[0]).toContain(
      'insert into ch.encounter_restriction',
    );
  });
});
