import { describe, expect, it, vi } from 'vitest';
import {
  AitLifecycleService,
  contentHashForAit,
} from './ait-lifecycle.service.js';

describe('AitLifecycleService', () => {
  it('produces a stable legal-content hash independent of mutable delivery fields', () => {
    const baseline = {
      id: 'ait-1',
      ait_number: '123',
      series: 'A',
      current_status: 'draft',
      updated_at: 'one',
      receipt_protocol: null,
    };
    const changed = {
      ...baseline,
      updated_at: 'two',
      receipt_protocol: 'external',
    };
    expect(contentHashForAit(baseline as never)).toMatch(/^[a-f0-9]{64}$/u);
    expect(contentHashForAit(changed as never)).toBe(
      contentHashForAit(baseline as never),
    );
  });

  it('finalizes a draft atomically with content hash and history', async () => {
    const draft = {
      id: 'ait-1',
      current_status: 'draft',
      ait_number: '123',
      series: 'A',
    };
    const update = vi.fn(async (_id, patch: Record<string, unknown>) => ({
      ...draft,
      ...patch,
    }));
    const history = vi.fn(async (dto) => dto);
    const transaction = vi.fn(async (work) => work({}));
    const service = new AitLifecycleService(
      {
        ait: {
          transaction,
          findOne: vi.fn(async () => draft),
          update,
        } as never,
        history: { create: history } as never,
        vehicles: {} as never,
        people: {} as never,
        corrections: {} as never,
        signatures: {} as never,
        printEvents: {} as never,
      },
      { assertActive: vi.fn() },
    );
    const result = await service.finalize('ait-1', 'actor-1');
    expect(result.current_status).toBe('issued');
    expect(result.content_hash).toMatch(/^[a-f0-9]{64}$/u);
    expect(history).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'issued' }),
      expect.anything(),
    );
    expect(transaction).toHaveBeenCalledOnce();
  });
});
