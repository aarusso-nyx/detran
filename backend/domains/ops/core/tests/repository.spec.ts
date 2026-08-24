import { describe, expect, it, vi } from 'vitest';
import { OpsTenantRepository } from '../src/index.js';

describe('OpsTenantRepository', () => {
  it('enters writes only through the app-role tenant transaction', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{ id: 'ops-1' }] });
    const tx = vi.fn(async (work, options) => {
      expect(options).toEqual({ role: 'app' });
      return work({ query });
    });
    const repository = new OpsTenantRepository(
      { tx } as never,
      {
        hasActiveContext: () => true,
        snapshot: () => ({ tenantId: 't', actorId: 'a' }),
      } as never,
      'ops.ops_team',
    );
    await expect(
      repository.create({ name: 'Equipe A', traffic_agency_id: 'agency' }),
    ).resolves.toEqual({ id: 'ops-1' });
    expect(query.mock.calls[0]?.[0]).toContain('insert into ops.ops_team');
  });

  it('rejects an implicit tenant_id', () => {
    const repository = new OpsTenantRepository(
      {} as never,
      {} as never,
      'ops.ops_team',
    );
    expect(() => repository.create({ tenant_id: 'other' })).toThrow(
      'Invalid ops write field',
    );
  });
});
