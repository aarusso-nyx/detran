import type { AuditEventEnvelope } from '@stynx-nyx/contracts';
import type { Transaction } from '@stynx-nyx/data';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  DetranLocalTokenVerifier,
  DetranPersistedAuditSink,
  DetranPolicyEvaluator,
  detranDataOptions,
  detranPipelineOptions,
  detranRuntimeProfile,
  detranStorageOptions,
  detranTokenVerifier,
} from './detran-runtime.js';

const keys = [
  'DATABASE_URL',
  'DETRAN_AUTH_MODE',
  'DETRAN_RUNTIME_PROFILE',
  'NODE_ENV',
  'STYNX_APP_DATABASE_URL',
  'STYNX_COGNITO_ISSUER',
  'STYNX_OWNER_DATABASE_URL',
  'STYNX_READER_DATABASE_URL',
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

  it('builds the storage, rate-limit, and idempotency hook configuration', () => {
    expect(detranStorageOptions().collections).toMatchObject({
      evidence: { classificationDefault: 'restricted' },
      'signed-documents': { classificationDefault: 'confidential' },
      exports: { classificationDefault: 'confidential' },
    });
    expect(detranPipelineOptions()).toMatchObject({
      rateLimit: { defaultLimit: 120 },
      idempotency: { ttlMs: 86_400_000 },
    });
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
