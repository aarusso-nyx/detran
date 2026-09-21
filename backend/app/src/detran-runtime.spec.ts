import type { AuditEventEnvelope } from '@stynx-nyx/contracts';
import type { Transaction } from '@stynx-nyx/data';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  DetranLocalTokenVerifier,
  DetranDurableIdempotencyBackend,
  DetranPersistedAuditSink,
  DetranPipelineSqlExecutor,
  DetranPolicyEvaluator,
  detranDataOptions,
  detranPipelineOptions,
  detranRuntimeProfile,
  detranSessionsOptions,
  detranFullAuthOptions,
  detranStorageOptions,
  detranTokenVerifier,
} from './detran-runtime.js';

const keys = [
  'DATABASE_URL',
  'DETRAN_AUTH_MODE',
  'DETRAN_LOCAL_ACTOR_ID',
  'DETRAN_LOCAL_ROLES',
  'DETRAN_LOCAL_TENANT_ID',
  'DETRAN_RUNTIME_PROFILE',
  'NODE_ENV',
  'STYNX_APP_DATABASE_URL',
  'STYNX_COGNITO_ISSUER',
  'STYNX_COGNITO_JWKS_URI',
  'STYNX_OWNER_DATABASE_URL',
  'STYNX_READER_DATABASE_URL',
  'STYNX_REDIS_URL',
  'STYNX_SESSION_ISSUER',
  'STYNX_SESSION_JWKS_URI',
  'STYNX_SESSION_SIGNING_KEY_SET',
  'STYNX_SESSION_SIGNING_SECRET_ID',
] as const;
const original = Object.fromEntries(keys.map((key) => [key, process.env[key]]));

afterEach(() => {
  for (const key of keys) {
    const value = original[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

describe('DETRAN runtime hooks', () => {
  it('accepts exactly four profiles', () => {
    for (const profile of [
      'local-sandbox',
      'test',
      'staging-like',
      'production',
    ]) {
      process.env.DETRAN_RUNTIME_PROFILE = profile;
      expect(detranRuntimeProfile()).toBe(profile);
    }
    process.env.DETRAN_RUNTIME_PROFILE = 'development';
    expect(() => detranRuntimeProfile()).toThrow(
      'Unsupported DETRAN_RUNTIME_PROFILE',
    );
  });

  it('refuses local verification outside local profiles', async () => {
    process.env.DETRAN_RUNTIME_PROFILE = 'production';
    await expect(
      new DetranLocalTokenVerifier().verifyAuthorizationHeader(undefined),
    ).rejects.toThrow('not allowed in production');
  });

  it('reads the local actor for each test-profile verification', async () => {
    process.env.DETRAN_RUNTIME_PROFILE = 'test';
    process.env.DETRAN_LOCAL_ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
    const verifier = new DetranLocalTokenVerifier();
    await expect(
      verifier.verifyAuthorizationHeader('Bearer local'),
    ).resolves.toMatchObject({
      principal: { id: '00000000-0000-4000-8000-0000b0000001' },
    });

    process.env.DETRAN_LOCAL_ACTOR_ID = '00000000-0000-4000-8000-0000b0000005';
    await expect(
      verifier.verifyAuthorizationHeader('Bearer local'),
    ).resolves.toMatchObject({
      principal: { id: '00000000-0000-4000-8000-0000b0000005' },
    });
  });

  it('fails non-local verifier construction without Cognito', () => {
    process.env.DETRAN_RUNTIME_PROFILE = 'staging-like';
    delete process.env.DETRAN_AUTH_MODE;
    delete process.env.STYNX_COGNITO_ISSUER;
    expect(() => detranTokenVerifier()).toThrow(
      'requires DETRAN_AUTH_MODE=cognito',
    );
  });

  it('requires separated non-local database principals', () => {
    process.env.DETRAN_RUNTIME_PROFILE = 'production';
    process.env.STYNX_OWNER_DATABASE_URL = 'postgresql://postgres:x@db/detran';
    process.env.STYNX_APP_DATABASE_URL = 'postgresql://postgres:x@db/detran';
    process.env.STYNX_READER_DATABASE_URL = 'postgresql://postgres:x@db/detran';
    expect(() => detranDataOptions()).toThrow(
      'distinct owner/app/reader principals',
    );
  });

  it('requires externally signed TLS-backed sessions outside local profiles', () => {
    process.env.DETRAN_RUNTIME_PROFILE = 'production';
    process.env.STYNX_SESSION_ISSUER = 'https://sessions.example.test';
    process.env.STYNX_REDIS_URL = 'rediss://redis.example.test:6380';
    process.env.STYNX_SESSION_SIGNING_SECRET_ID = 'detran/session-signing';
    expect(detranSessionsOptions()).toMatchObject({
      issuer: 'https://sessions.example.test',
      redis: { url: 'rediss://redis.example.test:6380' },
      jwt: { secretId: 'detran/session-signing' },
    });

    process.env.STYNX_SESSION_SIGNING_KEY_SET = '{"keys":[]}';
    expect(() => detranSessionsOptions()).toThrow(
      'Inline STYNX session signing',
    );
    delete process.env.STYNX_SESSION_SIGNING_KEY_SET;
    process.env.STYNX_REDIS_URL = 'redis://redis.example.test:6379';
    expect(() => detranSessionsOptions()).toThrow('must use TLS');
  });

  it('requires HTTPS external JWT trust configuration', () => {
    process.env.DETRAN_RUNTIME_PROFILE = 'staging-like';
    process.env.STYNX_COGNITO_ISSUER = 'https://cognito.example.test';
    process.env.STYNX_SESSION_ISSUER = 'https://sessions.example.test';
    process.env.STYNX_SESSION_JWKS_URI = 'https://keys.example.test/jwks';
    process.env.STYNX_REDIS_URL = 'rediss://redis.example.test:6380';
    expect(detranFullAuthOptions()).toMatchObject({
      cognito: { issuer: 'https://cognito.example.test' },
      stynx: { jwksUri: 'https://keys.example.test/jwks' },
      permissions: { dbFallbackOnRedisDown: false },
    });
    process.env.STYNX_SESSION_JWKS_URI = 'http://keys.example.test/jwks';
    expect(() => detranFullAuthOptions()).toThrow('must use HTTPS');
  });

  it('builds the storage, rate-limit, and idempotency hook configuration', () => {
    expect(detranStorageOptions().collections).toMatchObject({
      evidence: { classificationDefault: 'restricted' },
      'signed-documents': { classificationDefault: 'confidential' },
      exports: { classificationDefault: 'confidential' },
    });
    expect(detranPipelineOptions()).toMatchObject({
      rateLimit: {
        defaultLimit: 120,
        distributedStrict: true,
        store: expect.anything(),
      },
      idempotency: {
        ttlMs: 86_400_000,
        waitAttempts: 100,
        waitIntervalMs: 50,
        durableStrict: true,
        store: expect.anything(),
      },
    });
  });

  it('serializes concurrent idempotency owners in this process', async () => {
    const backend = new DetranDurableIdempotencyBackend();
    const context = { compositeKey: 'same-request' } as never;

    await expect(backend.acquireLock(context, 'owner-1')).resolves.toBe(true);
    await expect(backend.acquireLock(context, 'owner-2')).resolves.toBe(false);
    await expect(backend.isLocked(context)).resolves.toBe(true);

    await backend.releaseLock(context, 'owner-2');
    await expect(backend.isLocked(context)).resolves.toBe(true);

    await backend.releaseLock(context, 'owner-1');
    await expect(backend.isLocked(context)).resolves.toBe(false);
    await expect(backend.acquireLock(context, 'owner-2')).resolves.toBe(true);

    await backend.set(context, {
      requestFingerprint: 'fingerprint',
      statusCode: 200,
      body: { ok: true },
      headers: {},
      expiresAt: Date.now() + 60_000,
      status: 'completed',
    });
    await backend.releaseLock(context, 'owner-2');
    await expect(backend.get(context)).resolves.toMatchObject({
      body: { ok: true },
      status: 'completed',
    });
    await expect(backend.acquireLock(context, 'owner-3')).resolves.toBe(false);
  });

  it('executes pipeline persistence through the request-bound app role only', async () => {
    const executor = new DetranPipelineSqlExecutor();
    await expect(executor.query('select 1')).rejects.toThrow(
      'requires the Database provider',
    );
    const query = vi
      .fn()
      .mockResolvedValue({ rows: [{ value: 1 }], rowCount: 1 });
    const tx = vi.fn(
      async (work: (transaction: Transaction) => Promise<unknown>) =>
        work({ query } as unknown as Transaction),
    );
    executor.bindDatabase({ tx } as never);
    await expect(executor.query('select $1', [1])).resolves.toEqual({
      rows: [{ value: 1 }],
      rowCount: 1,
    });
    expect(tx).toHaveBeenCalledWith(expect.any(Function), { role: 'app' });
  });

  it('persists audit envelopes and has no unbound/in-memory fallback', async () => {
    const sink = new DetranPersistedAuditSink();
    const event: AuditEventEnvelope = {
      occurredAt: new Date().toISOString(),
      tenantId: '11111111-1111-4111-8111-111111111111',
      actorId: '22222222-2222-4222-8222-222222222222',
      action: 'CREATE',
      entity: 'test.entity',
      requestId: 'request-1',
    };
    await expect(sink.write(event)).rejects.toThrow(
      'requires the Database provider',
    );

    const query = vi.fn().mockResolvedValue({ rows: [], rowCount: 1 });
    const tx = vi.fn(
      async (work: (transaction: Transaction) => Promise<void>) =>
        work({ query } as unknown as Transaction),
    );
    sink.bindDatabase({ tx } as never);
    await sink.write(event);
    expect(query.mock.calls[0]?.[0]).toContain('select audit.write');
    expect(query.mock.calls[0]?.[1]?.[0]).toBe(event.tenantId);
  });

  it('adapts namespaced policy evaluation without weakening STYNX requirements', () => {
    const evaluator = new DetranPolicyEvaluator();
    expect(
      evaluator.evaluate({
        principal: {
          id: 'actor',
          roles: ['field-agent'],
          permissions: [],
          tenants: ['tenant'],
          claims: {},
        },
        requirements: {},
        resource: 'inf:ait',
        action: 'finalize',
      }),
    ).toBe(true);
    expect(
      evaluator.evaluate({
        principal: {
          id: 'actor',
          roles: ['field-agent'],
          permissions: [],
          tenants: ['tenant'],
          claims: {},
        },
        requirements: { roles: { roles: ['traffic-authority'] } },
        resource: 'inf:ait',
        action: 'finalize',
      }),
    ).toBe(false);
  });
});
