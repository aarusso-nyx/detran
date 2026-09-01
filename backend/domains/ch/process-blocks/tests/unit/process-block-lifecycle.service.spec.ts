import { BadRequestException, NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import { ProcessBlockLifecycleService } from '../../src/process-block-lifecycle.service.js';

function subject(query: ReturnType<typeof vi.fn>, actorId = 'actor-1') {
  const blocks = {
    transaction: async <T>(
      work: (transaction: { query: typeof query }) => Promise<T>,
    ) => work({ query }),
  };
  const context = { snapshot: () => ({ actorId }) };
  return new ProcessBlockLifecycleService(blocks as never, context as never);
}

describe('ProcessBlockLifecycleService', () => {
  it('preserves an active block idempotently by encounter, kind and source', async () => {
    const block = { id: 'block-1', active: true };
    const query = vi.fn().mockResolvedValue({ rows: [block] });

    await expect(
      subject(query).create({
        encounterId: 'encounter-1',
        blockKind: ' financial ',
        sourceSystem: ' sefaz ',
        message: ' Pending validation ',
      }),
    ).resolves.toEqual(block);
    expect(query.mock.calls[0]?.[0]).toContain(
      'on conflict (tenant_id, encounter_id, block_kind, source_system)',
    );
    expect(query.mock.calls[0]?.[1]).toEqual([
      'encounter-1',
      'FINANCIAL',
      'SEFAZ',
      'Pending validation',
      'actor-1',
    ]);
  });

  it('fails closed when the encounter does not exist', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });

    await expect(
      subject(query).create({
        encounterId: 'missing',
        blockKind: 'TOXICOLOGY',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects non-canonical kinds before opening a transaction', async () => {
    const query = vi.fn();

    expect(() =>
      subject(query).create({
        encounterId: 'encounter-1',
        blockKind: 'not valid!',
      }),
    ).toThrow(BadRequestException);
    expect(query).not.toHaveBeenCalled();
  });

  it('resolves only an active block with the current actor', async () => {
    const block = {
      id: 'block-1',
      active: false,
      resolved_by: 'actor-1',
    };
    const query = vi.fn().mockResolvedValue({ rows: [block] });

    await expect(subject(query).resolve('block-1')).resolves.toEqual(block);
    expect(query.mock.calls[0]?.[0]).toContain('where id = $1 and active');
    expect(query.mock.calls[0]?.[1]).toEqual(['block-1', 'actor-1']);
  });

  it('does not treat an already resolved block as a successful replay', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });

    await expect(subject(query).resolve('block-1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
