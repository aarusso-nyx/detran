import { describe, expect, it, vi } from 'vitest';
import { NormativeLifecycleService } from './normative-lifecycle.service.js';

describe('NormativeLifecycleService', () => {
  it('requires an active framing belonging to the active catalog', async () => {
    const service = new NormativeLifecycleService(
      {
        findOne: vi.fn(async () => ({ id: 'catalog', status: 'active' })),
      } as never,
      {
        findOne: vi.fn(async () => ({
          id: 'framing',
          catalog_id: 'catalog',
          status: 'active',
        })),
      } as never,
      {} as never,
    );
    await expect(
      service.assertActive('catalog', 'framing'),
    ).resolves.toBeUndefined();
  });

  it('rejects framing from a different catalog', async () => {
    const service = new NormativeLifecycleService(
      {
        findOne: vi.fn(async () => ({ id: 'catalog', status: 'active' })),
      } as never,
      {
        findOne: vi.fn(async () => ({
          id: 'framing',
          catalog_id: 'other',
          status: 'active',
        })),
      } as never,
      {} as never,
    );
    await expect(service.assertActive('catalog', 'framing')).rejects.toThrow(
      'not active in catalog',
    );
  });
});
