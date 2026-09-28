import { Test, type TestingModule } from '@nestjs/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PadesSigningHttpAdapter } from '@detran/ch-clinical-reports';

import { AppModule } from '../../src/app.module.js';
import {
  DetranClinicalTrustReadiness,
  DetranClinicalTrustReadinessBinder,
} from '../../src/detran-clinical-trust.js';

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

function configureNonLocal(profile: 'staging-like' | 'production'): void {
  process.env.DETRAN_RUNTIME_PROFILE = profile;
  process.env.DETRAN_AUTH_MODE = 'cognito';
  process.env.STYNX_COGNITO_ISSUER = 'https://cognito.fixture.test/pool';
  process.env.STYNX_SESSION_ISSUER = 'https://sessions.fixture.test';
  process.env.STYNX_REDIS_URL = 'rediss://redis.fixture.test:6380';
  process.env.STYNX_SESSION_SIGNING_SECRET_ID = 'fixture/session-key';
  process.env.STYNX_OWNER_DATABASE_URL =
    'postgresql://detran_owner:fixture@db.fixture.test/detran';
  process.env.STYNX_APP_DATABASE_URL =
    'postgresql://detran_app:fixture@db.fixture.test/detran';
  process.env.STYNX_READER_DATABASE_URL =
    'postgresql://detran_reader:fixture@db.fixture.test/detran';
  process.env.DETRAN_CLINICAL_SIGNING_URL = 'https://trust.fixture.test/sign';
  process.env.DETRAN_CLINICAL_SIGNING_HEALTH_URL =
    'https://trust.fixture.test/health';
  process.env.DETRAN_CLINICAL_SIGNING_TOKEN = 'fixture-trust-token';
  process.env.DETRAN_SEFAZ_REAL_BASE_URL = 'https://sefaz.fixture.test';
}

async function composedTrust(): Promise<{
  module: TestingModule;
  adapter: PadesSigningHttpAdapter;
  binder: DetranClinicalTrustReadinessBinder;
  readiness: DetranClinicalTrustReadiness;
}> {
  const module = await Test.createTestingModule({
    imports: [AppModule.forRoot()],
  }).compile();
  return {
    module,
    adapter: module.get(PadesSigningHttpAdapter),
    binder: module.get(DetranClinicalTrustReadinessBinder),
    readiness: module.get(DetranClinicalTrustReadiness),
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  for (const key of keys) {
    const value = original[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

describe('R-0021 perfis de confiança', () => {
  it.each(['local-sandbox', 'test'] as const)(
    'dado perfil %s sem serviço clínico quando a composição completa inicia então a prontidão clínica permanece desligada',
    async (profile) => {
      process.env.DETRAN_RUNTIME_PROFILE = profile;
      delete process.env.DETRAN_CLINICAL_SIGNING_URL;
      delete process.env.DETRAN_CLINICAL_SIGNING_HEALTH_URL;
      delete process.env.DETRAN_CLINICAL_SIGNING_TOKEN;
      const module = await Test.createTestingModule({
        imports: [AppModule.forRoot()],
      }).compile();
      try {
        expect(() => module.get(DetranClinicalTrustReadiness)).toThrow(
          'provider does not exist',
        );
      } finally {
        await module.close();
      }
    },
  );

  it.each(['staging-like', 'production'] as const)(
    'dado perfil %s e confiança HTTPS completa quando a composição é vinculada então usa o adaptador HTTP e fica pronta',
    async (profile) => {
      configureNonLocal(profile);
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({
            pades: true,
            tsa: true,
            lta: true,
            certificateValidation: ['OCSP'],
          }),
        }),
      );
      const trust = await composedTrust();
      try {
        expect(trust.adapter).toBeInstanceOf(PadesSigningHttpAdapter);
        await expect(trust.binder.onModuleInit()).resolves.toBeUndefined();
        await expect(trust.readiness.check()).resolves.toEqual({
          status: 'up',
        });
      } finally {
        await trust.module.close();
      }
    },
  );

  it.each(['staging-like', 'production'] as const)(
    'dado perfil %s com HTTP claro ou configuração ausente quando a composição é vinculada então falha fechada sem fallback local',
    async (profile) => {
      for (const absent of [false, true]) {
        configureNonLocal(profile);
        if (absent) delete process.env.DETRAN_CLINICAL_SIGNING_TOKEN;
        else
          process.env.DETRAN_CLINICAL_SIGNING_URL =
            'http://trust.fixture.test/sign';
        const trust = await composedTrust();
        try {
          await expect(trust.binder.onModuleInit()).rejects.toThrow(
            absent ? 'is not configured' : 'must use HTTPS outside local/test',
          );
          await expect(trust.readiness.check()).resolves.toMatchObject({
            status: 'down',
          });
        } finally {
          await trust.module.close();
        }
      }
    },
  );
});
