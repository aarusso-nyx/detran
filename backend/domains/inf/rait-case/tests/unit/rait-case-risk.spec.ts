// Inspector TASK0044: call-order counterexample; real HTTP/PG sensors own security acceptance.
import { describe, expect, it, vi } from 'vitest';
import { DetranError } from '@detran/shared';
import { RaitCaseRiskService } from '../../src/handwritten/rait-case-risk.service.js';
import { RaitOperationClock } from '../../src/handwritten/rait-operation-clock.js';

describe('ADR0057 current-risk preauthorization before global contention', () => {
  it('a denied existing S1 purpose cannot issue any relation-lock SQL', async () => {
    const tx = { query: vi.fn(async () => ({ rows: [] })) };
    const assertCase = vi.fn(async () => {
      throw new DetranError('RAIT.TENANT_MISMATCH', { status: 404 });
    });
    const scope = {
      authenticate: vi.fn(async () => ({
        tenantId: '00000000-0000-7000-8000-00000000a001',
        actorId: '00000000-0000-4000-8000-0000b0000001',
      })),
      assertCase,
      transaction: async (work: (tx: unknown) => Promise<unknown>) => work(tx),
    };
    const service = new RaitCaseRiskService(
      scope as never,
      new RaitOperationClock(),
    );
    const principal = {
      id: '00000000-0000-4000-8000-0000b0000001',
      tenants: ['00000000-0000-7000-8000-00000000a001'],
      roles: ['rait-analyst'],
    };
    await expect(
      service.read('00000000-0000-7000-8000-000010000002', principal),
    ).rejects.toMatchObject({ code: 'RAIT.TENANT_MISMATCH', status: 404 });
    expect(assertCase).toHaveBeenCalledWith(
      tx,
      '00000000-0000-7000-8000-000010000002',
      principal,
      'read',
      'rait-case',
      false,
    );
    expect(tx.query).not.toHaveBeenCalled();
  });
});
