import { describe, expect, it, vi } from 'vitest';
import { AlcoholLifecycleService } from './alcohol-lifecycle.service.js';

describe('AlcoholLifecycleService', () => {
  it('starts only a draft procedure through one tenant transaction', async () => {
    const transaction = vi.fn(async (work) => work({}));
    const update = vi.fn(async (_id, patch) => ({
      id: 'procedure-1',
      ...patch,
    }));
    const service = new AlcoholLifecycleService({
      procedures: {
        transaction,
        findOne: vi.fn(async () => ({
          id: 'procedure-1',
          status: 'draft',
          notes: null,
        })),
        update,
      } as never,
      tests: {} as never,
      refusals: {} as never,
      signs: {} as never,
      forwardings: {} as never,
    });
    await expect(service.start('procedure-1')).resolves.toMatchObject({
      status: 'in_progress',
    });
    expect(transaction).toHaveBeenCalledOnce();
  });
});
