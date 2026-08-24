import { NestFactory } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';

import { AppModule } from '../../src/app.module.js';

const keys = [
  'DETRAN_AUTH_MODE',
  'DETRAN_RUNTIME_PROFILE',
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

async function compileProfile(profile: string): Promise<void> {
  process.env.DETRAN_RUNTIME_PROFILE = profile;
  if (profile === 'staging-like' || profile === 'production') {
    process.env.DETRAN_AUTH_MODE = 'cognito';
    process.env.STYNX_COGNITO_ISSUER =
      'https://cognito-idp.sa-east-1.amazonaws.com/pool';
    process.env.STYNX_OWNER_DATABASE_URL =
      'postgresql://detran_owner:x@db/detran';
    process.env.STYNX_APP_DATABASE_URL = 'postgresql://detran_app:x@db/detran';
    process.env.STYNX_READER_DATABASE_URL =
      'postgresql://detran_reader:x@db/detran';
  }
  const module = await Test.createTestingModule({
    imports: [AppModule.forRoot()],
  }).compile();
  await module.init();
  await module.close();
}

describe('DETRAN runtime-profile boot contract', () => {
  for (const profile of [
    'local-sandbox',
    'test',
    'staging-like',
    'production',
  ]) {
    it(`boots the complete kernel in ${profile}`, async () => {
      await expect(compileProfile(profile)).resolves.toBeUndefined();
    });
  }

  it('refuses staging-like boot without Cognito', () => {
    process.env.DETRAN_RUNTIME_PROFILE = 'staging-like';
    delete process.env.DETRAN_AUTH_MODE;
    delete process.env.STYNX_COGNITO_ISSUER;
    expect(() => AppModule.forRoot()).toThrow(
      'requires DETRAN_AUTH_MODE=cognito',
    );
  });

  it('refuses production boot with one owner-like database identity', () => {
    process.env.DETRAN_RUNTIME_PROFILE = 'production';
    process.env.STYNX_COGNITO_ISSUER =
      'https://cognito-idp.sa-east-1.amazonaws.com/pool';
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
