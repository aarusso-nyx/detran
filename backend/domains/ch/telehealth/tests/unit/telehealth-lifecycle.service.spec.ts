import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import { TelehealthLifecycleService } from '../../src/telehealth-lifecycle.service.js';

function subject(query: ReturnType<typeof vi.fn>) {
  const sessions = {
    transaction: async <T>(
      work: (transaction: { query: typeof query }) => Promise<T>,
    ) => work({ query }),
  };
  const context = { snapshot: () => ({ actorId: 'actor-1' }) };
  return new TelehealthLifecycleService(sessions as never, context as never);
}

describe('TelehealthLifecycleService', () => {
  it('starts only after LFD and persists no tokenized URL', async () => {
    const session = { id: 'session-1', status: 'STARTED' };
    const query = vi.fn().mockResolvedValue({ rows: [session] });

    await expect(
      subject(query).start({
        encounterId: 'encounter-1',
        professionalId: 'professional-1',
        provider: 'video_provider',
        externalSessionId: 'opaque-session-1',
        lfdPassed: true,
      }),
    ).resolves.toEqual(session);
    expect(query.mock.calls[0]?.[1]).toEqual([
      'encounter-1',
      'professional-1',
      null,
      'VIDEO_PROVIDER',
      'opaque-session-1',
      true,
      true,
      'actor-1',
    ]);
  });

  it('rejects URL-shaped external references before querying', () => {
    const query = vi.fn();

    expect(() =>
      subject(query).start({
        encounterId: 'encounter-1',
        professionalId: 'professional-1',
        provider: 'VIDEO',
        externalSessionId: 'https://video.example/token?secret=x',
        lfdPassed: true,
      }),
    ).toThrow(/no URL credential material/);
    expect(query).not.toHaveBeenCalled();
  });

  it('rejects start or conclusion without passing LFD', async () => {
    const query = vi.fn();
    expect(() =>
      subject(query).start({
        encounterId: 'encounter-1',
        professionalId: 'professional-1',
        provider: 'VIDEO',
        externalSessionId: 'session-1',
        lfdPassed: false,
      }),
    ).toThrow(BadRequestException);
    expect(() => subject(query).conclude('session-1', {}, false)).toThrow(
      BadRequestException,
    );
  });

  it('concludes atomically with the optional billable item and block', async () => {
    const session = {
      id: 'session-1',
      encounter_id: 'encounter-1',
      status: 'COMPLETED',
    };
    const query = vi
      .fn()
      .mockResolvedValueOnce({ rows: [session] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });

    await expect(
      subject(query).conclude('session-1', { outcome: 'complete' }, true, true),
    ).resolves.toEqual(session);
    expect(query.mock.calls[1]?.[0]).toContain('ch.billing_item');
    expect(query.mock.calls[2]?.[0]).toContain('ch.process_block');
  });
});
