// R-0022 CTG-0006 §5.2 (M-06-P) e Adenda A §A.1/§A.5 — paridade da confiança
// documental na composição real do `AppModule` (TASK-0021, parte 1).
//
// Só existem depois de TASK-0009 partes B e A:
// - OD-R22-13 (a): `StynxSignatureModule.forRoot` montado uma vez no app, com
//   `SignatureManifestService` e `SignatureWithdrawalVerifier` construídos na
//   mesma composição e fornecidos por DI (§A.5). O token de DI assumido é a
//   própria classe publicada (o único identificador publicado desses serviços).
// - D-07-5 (OD-R22-07 (b)): as operações resolvem os artefatos pelas
//   referências na tabela de §A.1.4, sob RLS; referência ausente → rejeição com
//   o código S-08 da operação. Recusa do resolvedor de perfil (§A.2.4 item 8)
//   usa o mesmo código. Nas duas hipóteses o código é `RAIT.SIGNATURE_FAILED`.
//
// M-06-P1 e a cláusula clínica de M-06-P2 estão em checkpoint (OD-R22-40, §A.3).
import type { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  SignatureManifestService,
  SignatureService,
  SignatureWithdrawalVerifier,
} from '@stynx-nyx/signature';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { DocumentTrustHttpAdapter } from '@detran/shared';

import { AppModule } from '../../src/app.module.js';

const DOCUMENT_TOKEN = 'fixture-document-token';
const TENANT = '00000000-0000-7000-8000-00000000a001';
const BATCH = '00000000-0000-7000-8000-000028000001';
const SESSION = '00000000-0000-7000-8000-000030000003';
const MINUTES = '00000000-0000-7000-8000-000034000001';
const DOCUMENT = '00000000-0000-7000-8000-000012000001';
const CHAIR = '00000000-0000-4000-8000-0000b0000011';
const CASE = 'fixture-rait-case';
const PARTY = 'fixture-withdrawal-party';
const CONTENT_HASH = 'a'.repeat(64);
const SNAPSHOT_HASH = 'b'.repeat(64);
/** Referência sem artefato registrado em `storage.signature_evidence`. */
const ABSENT_SIGNATURE_REF = 'fixture-absent-signature-reference';

const keys = [
  'DETRAN_DOCUMENT_TRUST_HEALTH_URL',
  'DETRAN_DOCUMENT_TRUST_TOKEN',
  'DETRAN_DOCUMENT_TRUST_URL',
  'DETRAN_RUNTIME_PROFILE',
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

/** Portão S-05 satisfeito (OD-R22-68 (a)); rede externa desligada. */
function configureTest(): void {
  process.env.DETRAN_RUNTIME_PROFILE = 'test';
  process.env.DETRAN_DOCUMENT_TRUST_URL = 'https://trust.fixture.test/verify';
  process.env.DETRAN_DOCUMENT_TRUST_HEALTH_URL =
    'https://trust.fixture.test/health';
  process.env.DETRAN_DOCUMENT_TRUST_TOKEN = DOCUMENT_TOKEN;
  vi.stubGlobal(
    'fetch',
    vi.fn().mockRejectedValue(new Error('fixture network disabled')),
  );
}

async function withApp(
  work: (app: INestApplication) => Promise<void>,
): Promise<void> {
  const app = await NestFactory.create(AppModule.forRoot(), {
    logger: false,
    abortOnError: false,
  });
  await app.init();
  try {
    await work(app);
  } finally {
    await app.close();
  }
}

function statusOf(error: unknown): unknown {
  const candidate = error as { getStatus?: () => number; status?: number };
  return typeof candidate.getStatus === 'function'
    ? candidate.getStatus()
    : candidate.status;
}

/** `DetranError` `RAIT.SIGNATURE_FAILED` (502), sem resultado, token nem hash. */
async function expectSignatureFailed(
  work: () => Promise<unknown>,
): Promise<void> {
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
  expect((error as { code?: unknown }).code).toBe('RAIT.SIGNATURE_FAILED');
  expect(statusOf(error)).toBe(502);
  const serialized = `${JSON.stringify(error)} ${String((error as Error).message)}`;
  expect(serialized).not.toContain(DOCUMENT_TOKEN);
  expect(serialized).not.toContain(CONTENT_HASH);
  expect(serialized).not.toContain(SNAPSHOT_HASH);
}

type Operation = {
  id: string;
  name: string;
  run: (trust: DocumentTrustHttpAdapter) => Promise<unknown>;
};

const unregisteredArtifactOperations: Operation[] = [
  {
    id: 'M-06-P3',
    name: 'getSessionMinutesManifest',
    run: (trust) =>
      trust.getSessionMinutesManifest({
        tenantId: TENANT,
        sessionId: SESSION,
        minutesId: MINUTES,
        snapshotHash: SNAPSHOT_HASH,
      }),
  },
  {
    id: 'M-06-P3',
    name: 'verifySessionMinutesEvidence',
    run: (trust) =>
      trust.verifySessionMinutesEvidence({
        tenantId: TENANT,
        sessionId: SESSION,
        minutesId: MINUTES,
        signatureRef: ABSENT_SIGNATURE_REF,
        documentId: DOCUMENT,
        contentHash: CONTENT_HASH,
        snapshotHash: SNAPSHOT_HASH,
        expectedSignerPersonId: CHAIR,
      }),
  },
  {
    id: 'M-06-P3',
    name: 'getBatchMinutesManifest',
    run: (trust) =>
      trust.getBatchMinutesManifest({
        tenantId: TENANT,
        batchId: BATCH,
        snapshotHash: SNAPSHOT_HASH,
      }),
  },
  {
    id: 'M-06-P4',
    name: 'verifySignatureEvidence',
    run: (trust) =>
      trust.verifySignatureEvidence({
        tenantId: TENANT,
        signatureRef: ABSENT_SIGNATURE_REF,
        documentId: DOCUMENT,
        contentHash: CONTENT_HASH,
        expectedSignerPersonId: CHAIR,
      }),
  },
  {
    id: 'M-06-P4',
    name: 'verifyBatchMinutesEvidence',
    run: (trust) =>
      trust.verifyBatchMinutesEvidence({
        tenantId: TENANT,
        batchId: BATCH,
        signatureRef: ABSENT_SIGNATURE_REF,
        documentId: DOCUMENT,
        contentHash: CONTENT_HASH,
        snapshotHash: SNAPSHOT_HASH,
        expectedSignerPersonId: CHAIR,
      }),
  },
  {
    id: 'M-06-P5',
    name: 'verifyWithdrawalEvidence',
    run: (trust) =>
      trust.verifyWithdrawalEvidence({
        tenantId: TENANT,
        caseId: CASE,
        documentId: DOCUMENT,
        contentHash: CONTENT_HASH,
        eligiblePartyIds: [PARTY],
      }),
  },
];

describe('R-0022 CTG-0006 M-06-P — confiança documental na composição do AppModule', () => {
  // OD-R22-13 (a), §A.5
  it('M-06-P (OD-R22-13) dado o AppModule real em test quando a composição sobe então SignatureService é resolvido e é uma única instância', async () => {
    configureTest();

    await withApp(async (app) => {
      const first = app.get(SignatureService, { strict: false });
      const second = app.get(SignatureService, { strict: false });

      expect(first).toBeInstanceOf(SignatureService);
      expect(second).toBe(first);
    });
  });

  // OD-R22-13 (a), §A.5
  it('M-06-P (OD-R22-13) dado o AppModule real em test quando a composição sobe então SignatureManifestService e SignatureWithdrawalVerifier são resolvidos por DI', async () => {
    configureTest();

    await withApp(async (app) => {
      expect(
        app.get(SignatureManifestService, { strict: false }),
      ).toBeInstanceOf(SignatureManifestService);
      expect(
        app.get(SignatureWithdrawalVerifier, { strict: false }),
      ).toBeInstanceOf(SignatureWithdrawalVerifier);
    });
  });

  // D-07-5; M-06-P3 ("unavailable → rejeição"), M-06-P4, M-06-P5 ("outro
  // documento → RAIT.SIGNATURE_FAILED"); S-08.
  for (const operation of unregisteredArtifactOperations) {
    it(`${operation.id} dado o AppModule real em test com o portão S-05 satisfeito e nenhum artefato registrado para a referência no tenant quando ${operation.name} é chamado pela porta da composição então rejeita com RAIT.SIGNATURE_FAILED 502 sem resultado`, async () => {
      configureTest();

      await withApp(async (app) => {
        const trust = app.get(DocumentTrustHttpAdapter, { strict: false });

        await expectSignatureFailed(() => operation.run(trust));
      });
    });
  }
});
