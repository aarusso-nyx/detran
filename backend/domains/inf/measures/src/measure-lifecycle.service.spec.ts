import { describe, expect, it, vi } from 'vitest';
import { MeasureLifecycleService } from './measure-lifecycle.service.js';

describe('MeasureLifecycleService', () => {
  it('records history and starts a measure in one tenant transaction', async () => {
    const transaction = vi.fn(async (work) => work({}));
    const update = vi.fn(async (_id, patch) => ({ id: 'measure-1', ...patch }));
    const history = vi.fn(async (dto) => dto);
    const service = new MeasureLifecycleService({
      measures: {
        transaction,
        findOne: vi.fn(async () => ({
          id: 'measure-1',
          current_status: 'started',
        })),
        update,
      } as never,
      history: { create: history } as never,
      terms: {} as never,
      retentions: {} as never,
      removals: {} as never,
      inventories: {} as never,
    });
    await expect(service.start('measure-1', 'actor-1')).resolves.toMatchObject({
      current_status: 'in_execution',
    });
    expect(history).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'in_execution' }),
      expect.anything(),
    );
    expect(transaction).toHaveBeenCalledOnce();
  });
});
