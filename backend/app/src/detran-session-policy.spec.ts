import type { CallHandler, ExecutionContext } from '@nestjs/common';
import type { SessionRecord } from '@stynx-nyx/sessions';
import { firstValueFrom, of } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  DetranSessionStrongFactorGuard,
  DetranSingleSessionInterceptor,
} from './detran-session-policy.js';

const originalClaim = process.env.STYNX_STRONG_FACTOR_CLAIM;
const originalValues = process.env.STYNX_STRONG_FACTOR_VALUES;

afterEach(() => {
  if (originalClaim === undefined) delete process.env.STYNX_STRONG_FACTOR_CLAIM;
  else process.env.STYNX_STRONG_FACTOR_CLAIM = originalClaim;
  if (originalValues === undefined)
    delete process.env.STYNX_STRONG_FACTOR_VALUES;
  else process.env.STYNX_STRONG_FACTOR_VALUES = originalValues;
});

function context(request: object): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

function session(
  sid: string,
  tenantId: string,
  createdAt: string,
  deviceMeta?: Record<string, unknown>,
): SessionRecord {
  return {
    sid,
    userId: 'user-1',
    tenantId,
    cognitoSub: 'cognito-1',
    deviceMeta,
    refreshFamilyId: 'family-1',
    refreshTokenHash: 'hash',
    status: 'active',
    createdAt,
    updatedAt: createdAt,
    lastTouchedAt: createdAt,
    expiresAt: '2030-01-01T00:00:00.000Z',
    idleExpiresAt: '2030-01-01T00:00:00.000Z',
  };
}

describe('DETRAN session policy', () => {
  it('requires a Cognito strong-factor claim and carries proof into device metadata', async () => {
    const cognito = {
      validateAccessToken: vi.fn().mockResolvedValue({
        claims: { amr: ['pwd', 'mfa'] },
      }),
    };
    const guard = new DetranSessionStrongFactorGuard(
      cognito as never,
      {} as never,
    );
    const request = { path: '/sessions', body: { cognitoToken: 'token' } };
    await expect(guard.canActivate(context(request))).resolves.toBe(true);
    expect(request.body).toMatchObject({
      deviceMeta: { detranStrongFactorMethod: 'mfa' },
    });

    cognito.validateAccessToken.mockResolvedValueOnce({
      claims: { amr: ['pwd'] },
    });
    await expect(
      guard.canActivate(
        context({ path: '/sessions', body: { cognitoToken: 'token' } }),
      ),
    ).rejects.toThrow('verified strong factor');
  });

  it('allows tenant switching only from an active strong-factor session', async () => {
    const sessions = {
      get: vi.fn().mockResolvedValue(
        session('old', 'tenant-1', '2026-01-01T00:00:00.000Z', {
          detranStrongFactorVerifiedAt: '2026-01-01T00:00:00.000Z',
        }),
      ),
    };
    const guard = new DetranSessionStrongFactorGuard(
      {} as never,
      sessions as never,
    );
    const request = {
      path: '/sessions/switch',
      body: {} as { deviceMeta?: Record<string, unknown> },
      stynxClaims: { sid: 'old' },
    };
    await expect(guard.canActivate(context(request))).resolves.toBe(true);
    expect(request.body.deviceMeta).toMatchObject({
      detranStrongFactorVerifiedAt: expect.any(String),
    });

    sessions.get.mockResolvedValueOnce(
      session('old', 'tenant-1', '2026-01-01T00:00:00.000Z'),
    );
    await expect(guard.canActivate(context(request))).rejects.toThrow(
      'requires a strong-factor session',
    );
  });

  it('keeps one deterministic active session per user and tenant', async () => {
    const created = session('new', 'tenant-1', '2026-02-01T00:00:00.000Z');
    const older = session('old', 'tenant-1', '2026-01-01T00:00:00.000Z');
    const otherTenant = session(
      'other',
      'tenant-2',
      '2026-03-01T00:00:00.000Z',
    );
    const records = new Map([
      ['new', created],
      ['old', older],
      ['other', otherTenant],
    ]);
    const sessions = {
      get: vi.fn((sid: string) => Promise.resolve(records.get(sid) ?? null)),
      revoke: vi.fn().mockResolvedValue(true),
    };
    const store = {
      listSessionIdsByUser: vi.fn().mockResolvedValue([...records.keys()]),
    };
    const interceptor = new DetranSingleSessionInterceptor(
      store as never,
      sessions as never,
    );
    const next = { handle: () => of({ sid: 'new' }) } as CallHandler;

    await expect(
      firstValueFrom(
        interceptor.intercept(context({ path: '/sessions' }), next),
      ),
    ).resolves.toEqual({ sid: 'new' });
    expect(sessions.revoke).toHaveBeenCalledTimes(1);
    expect(sessions.revoke).toHaveBeenCalledWith('old');
  });
});
