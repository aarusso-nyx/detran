import { BadRequestException, NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import { ComplaintLifecycleService } from '../../src/complaint-lifecycle.service.js';

function subject(query: ReturnType<typeof vi.fn>, actorId = 'actor-1') {
  const complaints = {
    transaction: async <T>(
      work: (transaction: { query: typeof query }) => Promise<T>,
    ) => work({ query }),
  };
  const context = { snapshot: () => ({ actorId }) };
  return new ComplaintLifecycleService(complaints as never, context as never);
}

describe('ComplaintLifecycleService', () => {
  it('creates a durable ouvidoria protocol when the caller omits one', async () => {
    const complaint = { id: 'complaint-1', protocol: 'OUV-20260901-12345678' };
    const query = vi.fn().mockResolvedValue({ rows: [complaint] });

    await expect(
      subject(query).create({
        category: 'SERVICE',
        description: 'A sufficiently detailed complaint',
      }),
    ).resolves.toEqual(complaint);

    expect(query.mock.calls[0]?.[0]).toContain(
      "'OUV-' || to_char(now(), 'YYYYMMDD')",
    );
    expect(query.mock.calls[0]?.[1]).toEqual([
      null,
      null,
      null,
      'SERVICE',
      'A sufficiently detailed complaint',
      '{}',
    ]);
  });

  it('normalizes input without losing the caller supplied protocol', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{ id: 'complaint-1' }] });

    await subject(query).create({
      protocol: ' OUV-CUSTOM ',
      complainantName: ' Citizen ',
      contact: ' citizen@example.test ',
      category: ' access ',
      description: ' A sufficiently detailed complaint ',
      payload: { channel: 'web' },
    });

    expect(query.mock.calls[0]?.[1]).toEqual([
      'OUV-CUSTOM',
      'Citizen',
      'citizen@example.test',
      'ACCESS',
      'A sufficiently detailed complaint',
      '{"channel":"web"}',
    ]);
  });

  it('closes with the authenticated actor and merges triage evidence', async () => {
    const closed = { id: 'complaint-1', status: 'CLOSED' };
    const query = vi.fn().mockResolvedValue({ rows: [closed] });

    await expect(
      subject(query).transition('complaint-1', {
        status: 'CLOSED',
        assignedTo: 'agent-1',
        payload: { resolution: 'accepted' },
      }),
    ).resolves.toEqual(closed);
    expect(query.mock.calls[0]?.[0]).toContain(
      "case when $2 in ('CLOSED','REJECTED') then $4",
    );
    expect(query.mock.calls[0]?.[1]).toEqual([
      'complaint-1',
      'CLOSED',
      'agent-1',
      'actor-1',
      '{"resolution":"accepted"}',
    ]);
  });

  it('requires actor context for a status transition', async () => {
    const query = vi.fn();
    expect(() =>
      subject(query, '').transition('complaint-1', { status: 'TRIAGED' }),
    ).toThrow(BadRequestException);
    expect(query).not.toHaveBeenCalled();
  });

  it('does not update a missing complaint', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    await expect(
      subject(query).transition('missing', { status: 'IN_REVIEW' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
