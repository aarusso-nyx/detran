import { NestFactory } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';

import type { BankPort } from '@detran/inf-collection';
import { AppModule } from '../../src/app.module.js';

const keys = [
  'DETRAN_AUTH_MODE',
  'DETRAN_CLINICAL_SIGNING_HEALTH_URL',
  'DETRAN_CLINICAL_SIGNING_TOKEN',
  'DETRAN_CLINICAL_SIGNING_URL',
  'DETRAN_RUNTIME_PROFILE',
  'DETRAN_SEFAZ_REAL_BASE_URL',
  'STYNX_APP_DATABASE_URL',
  'STYNX_COGNITO_ISSUER',
  'STYNX_OWNER_DATABASE_URL',
  'STYNX_READER_DATABASE_URL',
  'STYNX_REDIS_URL',
  'STYNX_SESSION_ISSUER',
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

function configureNonLocal(profile: 'staging-like' | 'production'): void {
  process.env.DETRAN_RUNTIME_PROFILE = profile;
  process.env.DETRAN_AUTH_MODE = 'cognito';
  process.env.STYNX_COGNITO_ISSUER =
    'https://cognito-idp.sa-east-1.amazonaws.com/pool';
  process.env.STYNX_SESSION_ISSUER = 'https://sessions.example.test';
  process.env.STYNX_REDIS_URL = 'rediss://redis.example.test:6380';
  process.env.STYNX_SESSION_SIGNING_SECRET_ID = 'detran/session-signing';
  process.env.DETRAN_CLINICAL_SIGNING_URL = 'https://trust.example.test/sign';
  process.env.DETRAN_CLINICAL_SIGNING_HEALTH_URL =
    'https://trust.example.test/capabilities';
  process.env.DETRAN_CLINICAL_SIGNING_TOKEN = 'injected-test-credential';
  process.env.DETRAN_SEFAZ_REAL_BASE_URL = 'https://sefaz.example.test';
  process.env.STYNX_OWNER_DATABASE_URL =
    'postgresql://detran_owner:x@db/detran';
  process.env.STYNX_APP_DATABASE_URL = 'postgresql://detran_app:x@db/detran';
  process.env.STYNX_READER_DATABASE_URL =
    'postgresql://detran_reader:x@db/detran';
}

async function compileLocalProfile(
  profile: 'local-sandbox' | 'test',
): Promise<BankPort> {
  process.env.DETRAN_RUNTIME_PROFILE = profile;
  const module = await Test.createTestingModule({
    imports: [AppModule.forRoot()],
  }).compile();
  try {
    await module.init();
    return module.get<BankPort>('BANK_PORT');
  } finally {
    await module.close();
  }
}

async function compileNonLocalProfile(
  profile: 'staging-like' | 'production',
): Promise<void> {
  configureNonLocal(profile);
  const module = await Test.createTestingModule({
    imports: [AppModule.forRoot()],
  }).compile();
  await module.close();
}

describe('DETRAN runtime-profile boot contract', () => {
  for (const profile of ['local-sandbox', 'test'] as const) {
    it(`dado o perfil ${profile} quando o kernel resolve BANK_PORT então compõe o mock explícito`, async () => {
      const bankPort = await compileLocalProfile(profile);

      await expect(
        bankPort.registerDocument({
          documentId: `runtime-profile-${profile}`,
          infractionId: 'runtime-profile-infraction',
          tier: 'desconto_80',
          amount: '150.00',
          validUntil: '2026-10-14',
        }),
      ).resolves.toMatchObject({
        pixReference: expect.stringMatching(/^PIX-MOCK-\d{24}$/),
      });
    });
  }

  for (const profile of ['staging-like', 'production'] as const) {
    it(`dado o perfil ${profile} sem provedor bancário real quando o app compõe então falha fechada por BANK_PORT`, async () => {
      await expect(compileNonLocalProfile(profile)).rejects.toThrow(
        'BANK_PORT',
      );
    });
  }

  it('dado um perfil de runtime desconhecido quando o app compõe então recusa o perfil antes de resolver BANK_PORT', () => {
    process.env.DETRAN_RUNTIME_PROFILE = 'unknown-profile';
    expect(() => AppModule.forRoot()).toThrow(
      'Unsupported DETRAN_RUNTIME_PROFILE: unknown-profile',
    );
  });

  it('refuses staging-like boot without Cognito', () => {
    configureNonLocal('staging-like');
    delete process.env.DETRAN_AUTH_MODE;
    delete process.env.STYNX_COGNITO_ISSUER;
    expect(() => AppModule.forRoot()).toThrow(
      'STYNX_COGNITO_ISSUER is required',
    );
  });

  it('refuses production boot with one owner-like database identity', () => {
    configureNonLocal('production');
    process.env.STYNX_OWNER_DATABASE_URL = 'postgresql://postgres:x@db/detran';
    process.env.STYNX_APP_DATABASE_URL = 'postgresql://postgres:x@db/detran';
    process.env.STYNX_READER_DATABASE_URL = 'postgresql://postgres:x@db/detran';
    expect(() => AppModule.forRoot()).toThrow(
      'distinct owner/app/reader principals',
    );
  });

  it('boots the real HTTP interceptor pipeline and serves health', async () => {
    process.env.DETRAN_RUNTIME_PROFILE = 'test';
    const app = await NestFactory.create(AppModule.forRoot(), {
      logger: false,
    });
    await app.init();
    try {
      const response = await request(app.getHttpServer()).get('/healthz');
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({ status: 'ok' });
    } finally {
      await app.close();
    }
  });
});
