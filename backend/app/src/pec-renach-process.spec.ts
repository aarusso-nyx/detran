import { ConflictException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import { PecRenachProcessService } from './pec-renach-process.service.js';

const source = {
  id: 'encounter-1',
  patient_id: 'patient-1',
  patient_cpf: '11144477735',
  renach_process_key: null,
  renach_process_type: null,
  current_category: 'B',
  requested_category: null,
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
  return new PecRenachProcessService(
    database as never,
    context as never,
    renach as never,
  );
}

describe('PecRenachProcessService', () => {
  it('AC-PEC-001-1 opens and binds a process with a durable idempotency key', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({ rows: [source] })
      .mockResolvedValueOnce({ rows: [source] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: source.id }] });
    const openProcess = vi.fn().mockResolvedValue({
      renachNumber: 'RN123',
      processType: 'RENEWAL',
      openingResult: 'OPENED',
      protocol: 'request-123',
    });

    await expect(
      subject(query, { openProcess }).openAndBind('encounter-1', {
        processType: 'RENEWAL',
        currentCategory: 'B',
      }),
    ).resolves.toEqual({
      encounterId: 'encounter-1',
      renachProcessKey: 'RN123',
      status: 'OPENED',
      requestId: 'request-123',
    });
    expect(openProcess).toHaveBeenCalledWith(
      expect.objectContaining({
        cpf: source.patient_cpf,
        processType: 'RENEWAL',
      }),
      expect.objectContaining({
        tenantId: 'tenant-1',
        metadata: {
          idempotencyKey: 'ch.encounter:encounter-1:renach:RENEWAL',
        },
      }),
    );
    expect(query.mock.calls[3]?.[0]).toContain('update ch.encounter');
  });

  it('AC-PEC-001-1 returns LOCAL_ALREADY_LINKED without calling RENACH', async () => {
    const query = vi.fn().mockResolvedValueOnce({
      rows: [
        {
          ...source,
          renach_process_key: 'RN123',
          renach_process_type: 'RENEWAL',
        },
      ],
    });
    const openProcess = vi.fn();

    await expect(
      subject(query, { openProcess }).openAndBind('encounter-1', {
        processType: 'RENEWAL',
      }),
    ).resolves.toEqual({
      encounterId: 'encounter-1',
      renachProcessKey: 'RN123',
      status: 'LOCAL_ALREADY_LINKED',
    });
    expect(openProcess).not.toHaveBeenCalled();
  });

  it('rejects a replay whose category fingerprint differs', async () => {
    const query = vi.fn().mockResolvedValueOnce({
      rows: [
        {
          ...source,
          renach_process_key: 'RN123',
          renach_process_type: 'RENEWAL',
        },
      ],
    });
    const openProcess = vi.fn();

    await expect(
      subject(query, { openProcess }).openAndBind('encounter-1', {
        processType: 'RENEWAL',
        currentCategory: 'C',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(openProcess).not.toHaveBeenCalled();
  });

  it('AC-PEC-001-2 rejects a process key linked to another encounter', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({ rows: [source] })
      .mockResolvedValueOnce({ rows: [source] })
      .mockResolvedValueOnce({ rows: [{ id: 'encounter-2' }] });
    const openProcess = vi.fn().mockResolvedValue({
      renachNumber: 'RN123',
      processType: 'RENEWAL',
      openingResult: 'ALREADY_OPEN',
    });

    await expect(
      subject(query, { openProcess }).openAndBind('encounter-1', {
        processType: 'RENEWAL',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(query).toHaveBeenCalledTimes(3);
  });
});
