// R-0022 CTG-0006 §4 — caracterização da composição de confiança por perfil
// (S-05, S-06, S-07). Segue `runtime-profiles.e2e.spec.ts`; válida antes e
// depois da migração para `@stynx-nyx/signature` (nenhum import do pacote
// STYNX, nenhum texto de mensagem do mecanismo que sai). `JuntaSigningAdapter`
// fica fora: `@detran/ch-juntas` não o exporta (CTG-0006 §4, regras de escrita).
import { NestFactory } from '@nestjs/core';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PadesSigningHttpAdapter } from '@detran/ch-clinical-reports';
import { DocumentTrustHttpAdapter } from '@detran/shared';

import { AppModule } from '../../src/app.module.js';
import {
  DetranClinicalTrustReadiness,
  DetranClinicalTrustReadinessBinder,
} from '../../src/detran-clinical-trust.js';

const CLINICAL_TOKEN = 'fixture-bearer-token';
const DOCUMENT_TOKEN = 'fixture-document-token';

const TRUST_KEYS = [
  'DETRAN_CLINICAL_SIGNING_HEALTH_URL',
  'DETRAN_CLINICAL_SIGNING_TOKEN',
  'DETRAN_CLINICAL_SIGNING_URL',
  'DETRAN_DOCUMENT_TRUST_HEALTH_URL',
  'DETRAN_DOCUMENT_TRUST_TOKEN',
  'DETRAN_DOCUMENT_TRUST_URL',
] as const;
const keys = [
  ...TRUST_KEYS,
  'DETRAN_AUTH_MODE',
  'DETRAN_RUNTIME_PROFILE',
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
  vi.unstubAllGlobals();
  for (const key of keys) {
    const value = original[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

function configureTrust(): void {
  process.env.DETRAN_CLINICAL_SIGNING_URL = 'https://trust.fixture.test/sign';
  process.env.DETRAN_CLINICAL_SIGNING_HEALTH_URL =
    'https://trust.fixture.test/health';
  process.env.DETRAN_CLINICAL_SIGNING_TOKEN = CLINICAL_TOKEN;
  process.env.DETRAN_DOCUMENT_TRUST_URL = 'https://trust.fixture.test/verify';
  process.env.DETRAN_DOCUMENT_TRUST_HEALTH_URL =
    'https://trust.fixture.test/document-health';
  process.env.DETRAN_DOCUMENT_TRUST_TOKEN = DOCUMENT_TOKEN;
}

/** Mesmo ambiente não local de `runtime-profiles.e2e.spec.ts`. */
function configureNonLocal(profile: 'staging-like' | 'production'): void {
  process.env.DETRAN_RUNTIME_PROFILE = profile;
  process.env.DETRAN_AUTH_MODE = 'cognito';
  process.env.STYNX_COGNITO_ISSUER =
    'https://cognito-idp.sa-east-1.amazonaws.com/pool';
  process.env.STYNX_SESSION_ISSUER = 'https://sessions.example.test';
  process.env.STYNX_REDIS_URL = 'rediss://redis.example.test:6380';
  process.env.STYNX_SESSION_SIGNING_SECRET_ID = 'detran/session-signing';
  process.env.STYNX_OWNER_DATABASE_URL =
    'postgresql://detran_owner:x@db/detran';
  process.env.STYNX_APP_DATABASE_URL = 'postgresql://detran_app:x@db/detran';
  process.env.STYNX_READER_DATABASE_URL =
    'postgresql://detran_reader:x@db/detran';
  configureTrust();
}

function response(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: vi.fn(async () => body),
  } as unknown as Response;
}

async function rejection(work: () => Promise<unknown>): Promise<unknown> {
  let resolved: unknown;
  const error = await work().then(
    (value: unknown) => {
      resolved = value;
      return undefined;
    },
    (caught: unknown) => caught,
  );
  expect(resolved).toBeUndefined();
  expect(error).toBeInstanceOf(Error);
  const serialized = `${JSON.stringify(error)} ${String((error as Error).message)}`;
  expect(serialized).not.toContain(CLINICAL_TOKEN);
  expect(serialized).not.toContain(DOCUMENT_TOKEN);
  return error;
}

describe('R-0022 CTG-0006 — composição de confiança por perfil', () => {
  // C-06-04 (composição)
  for (const profile of ['local-sandbox', 'test'] as const) {
    it(`C-06-04 dado ${profile} sem as seis variáveis de confiança quando o AppModule real sobe então /healthz responde 200 e as portas da composição rejeitam sem backend simulado`, async () => {
      process.env.DETRAN_RUNTIME_PROFILE = profile;
      for (const key of TRUST_KEYS) delete process.env[key];
      vi.stubGlobal(
        'fetch',
        vi.fn().mockRejectedValue(new Error('fixture network disabled')),
      );

      const app = await NestFactory.create(AppModule.forRoot(), {
        logger: false,
      });
      await app.init();
      try {
        const health = await request(app.getHttpServer()).get('/healthz');
        expect(health.status).toBe(200);

        const signing = app.get(PadesSigningHttpAdapter, { strict: false });
        const trust = app.get(DocumentTrustHttpAdapter, { strict: false });
        expect(signing).toBeInstanceOf(PadesSigningHttpAdapter);
        expect(trust).toBeInstanceOf(DocumentTrustHttpAdapter);

        await rejection(() =>
          signing.renderAndSign({
            documentType: 'REPORT',
            contentSha256: 'a'.repeat(64),
            content: { encounterId: 'fixture-clinical-encounter' },
            signer: {
              professionalId: 'fixture-clinical-professional',
              name: 'Professional fixture',
              council: 'CRM/fixture',
            },
            minimumSignatureLevel: 'QUALIFIED',
          }),
        );
        await rejection(() =>
          trust.verifySignatureEvidence({
            tenantId: '00000000-0000-7000-8000-00000000a001',
            signatureRef: 'fixture-signature-reference',
            documentId: '00000000-0000-7000-8000-000012000001',
            contentHash: 'a'.repeat(64),
            expectedSignerPersonId: '00000000-0000-4000-8000-0000b0000011',
          }),
        );
      } finally {
        await app.close();
      }
    });
  }

  // C-06-11
  it('C-06-11 dado indicador clinical-trust sem vínculo quando consultado então fica down, nunca up', async () => {
    const readiness = new DetranClinicalTrustReadiness();

    expect(readiness.name).toBe('clinical-trust');
    await expect(readiness.check()).resolves.toMatchObject({ status: 'down' });
  });

  // C-06-11
  it('C-06-11 dado indicador vinculado a porta cuja prontidão rejeita quando consultado então fica down com motivo sem o token', async () => {
    process.env.DETRAN_RUNTIME_PROFILE = 'production';
    configureTrust();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response({}, false, 503)));
    const readiness = new DetranClinicalTrustReadiness();
    readiness.bind(new PadesSigningHttpAdapter());

    const result = await readiness.check();

    expect(result.status).toBe('down');
    expect(result.details?.reason).toEqual(expect.any(String));
    expect(JSON.stringify(result)).not.toContain(CLINICAL_TOKEN);
  });

  // C-06-11
  it('C-06-11 dado indicador vinculado a porta cuja prontidão resolve quando consultado então fica up', async () => {
    const readiness = new DetranClinicalTrustReadiness();
    readiness.bind({
      checkCapabilities: async () => undefined,
    } as unknown as PadesSigningHttpAdapter);

    await expect(readiness.check()).resolves.toMatchObject({ status: 'up' });
    expect(readiness.name).toBe('clinical-trust');
  });

  // C-06-12
  for (const profile of ['staging-like', 'production'] as const) {
    it(`C-06-12 dado ${profile} sem as variáveis clínicas quando o binder inicia então rejeita e o indicador fica down`, async () => {
      configureNonLocal(profile);
      delete process.env.DETRAN_CLINICAL_SIGNING_URL;
      delete process.env.DETRAN_CLINICAL_SIGNING_HEALTH_URL;
      delete process.env.DETRAN_CLINICAL_SIGNING_TOKEN;
      vi.stubGlobal(
        'fetch',
        vi.fn().mockRejectedValue(new Error('fixture network disabled')),
      );
      const readiness = new DetranClinicalTrustReadiness();

      await rejection(() =>
        new DetranClinicalTrustReadinessBinder(
          new PadesSigningHttpAdapter(),
          readiness,
        ).onModuleInit(),
      );
      await expect(readiness.check()).resolves.toMatchObject({
        status: 'down',
      });
    });

    it(`C-06-12 dado ${profile} com health que rejeita quando o binder inicia então rejeita e o indicador fica down`, async () => {
      configureNonLocal(profile);
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(response({}, false, 503)),
      );
      const readiness = new DetranClinicalTrustReadiness();

      await rejection(() =>
        new DetranClinicalTrustReadinessBinder(
          new PadesSigningHttpAdapter(),
          readiness,
        ).onModuleInit(),
      );
      const result = await readiness.check();
      expect(result.status).toBe('down');
      expect(JSON.stringify(result)).not.toContain(CLINICAL_TOKEN);
    });

    it(`C-06-12 dado ${profile} com as seis variáveis HTTPS quando AppModule.forRoot() é chamado então constrói a composição`, () => {
      configureNonLocal(profile);

      expect(AppModule.forRoot()).toMatchObject({ module: AppModule });
    });
  }
});
