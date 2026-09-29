// R-0022 CTG-0006 §4 — caracterização da assinatura clínica pela porta DETRAN
// (S-01, S-03, S-05, S-06). Válida antes e depois da migração para
// `@stynx-nyx/signature`: nenhum caso importa o pacote STYNX, afirma texto de
// mensagem do mecanismo que sai ou ordem de chamadas HTTP.
import { afterEach, describe, expect, it, vi } from 'vitest';

import { EncounterClosureService } from '../../src/encounter-closure.service.js';
import {
  PadesSigningHttpAdapter,
  type ClinicalArtifactReceipt,
  type ClinicalArtifactRequest,
} from '../../src/pades-signing.http-adapter.js';
import {
  ReportLifecycleService,
  contentSha256,
} from '../../src/report-lifecycle.service.js';

const TOKEN = 'fixture-bearer-token';
const ACTOR = 'fixture-clinical-actor';
const PROFESSIONAL = 'fixture-clinical-professional';
const ENCOUNTER = 'fixture-clinical-encounter';

const keys = [
  'DETRAN_CLINICAL_SIGNING_HEALTH_URL',
  'DETRAN_CLINICAL_SIGNING_TOKEN',
  'DETRAN_CLINICAL_SIGNING_URL',
  'DETRAN_RUNTIME_PROFILE',
] as const;
const original = Object.fromEntries(keys.map((key) => [key, process.env[key]]));

const request: ClinicalArtifactRequest = {
  documentType: 'REPORT',
  contentSha256: 'a'.repeat(64),
  content: { encounterId: ENCOUNTER },
  signer: {
    professionalId: PROFESSIONAL,
    name: 'Professional fixture',
    council: 'CRM/fixture',
  },
  minimumSignatureLevel: 'QUALIFIED',
};

const receipt: ClinicalArtifactReceipt = {
  contentSha256: request.contentSha256,
  storageDocumentId: 'fixture-storage-document',
  artifactSha256: 'b'.repeat(64),
  signatureLevel: 'QUALIFIED',
  signatureFormat: 'PAdES-TSA',
  signedAt: '2026-09-27T12:00:00.000Z',
  tsaTime: '2026-09-27T12:00:01.000Z',
  certificateValidationSource: 'OCSP',
  certificateValidationStatus: 'GOOD',
  certificateValidatedAt: '2026-09-27T12:00:02.000Z',
};

const completeCapabilities = {
  pades: true,
  tsa: true,
  lta: true,
  certificateValidation: ['OCSP'],
};

function configure(profile = 'production'): void {
  process.env.DETRAN_RUNTIME_PROFILE = profile;
  process.env.DETRAN_CLINICAL_SIGNING_URL = 'https://trust.fixture.test/sign';
  process.env.DETRAN_CLINICAL_SIGNING_HEALTH_URL =
    'https://trust.fixture.test/health';
  process.env.DETRAN_CLINICAL_SIGNING_TOKEN = TOKEN;
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
  return error;
}

async function expectRedactedRejection(
  work: () => Promise<unknown>,
): Promise<void> {
  const error = await rejection(work);
  expect(JSON.stringify(error)).not.toContain(TOKEN);
  expect(String((error as Error).message)).not.toContain(TOKEN);
  expect(String((error as Error).stack)).not.toContain(TOKEN);
}

afterEach(() => {
  vi.unstubAllGlobals();
  for (const key of keys) {
    const value = original[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

// --- Dublês de consumidor (S-03): porta, contexto e transação observada ---

interface SqlCall {
  sql: string;
  values: readonly unknown[];
}

type SqlHandler = (sql: string) => Record<string, unknown>[];

function repository(calls: SqlCall[], handler: SqlHandler) {
  const tx = {
    query: vi.fn(async (sql: string, values: readonly unknown[] = []) => {
      calls.push({ sql, values });
      return { rows: handler(sql) };
    }),
  };
  return {
    transaction: vi.fn(async (work: (transaction: unknown) => unknown) =>
      work(tx),
    ),
  };
}

function requestContext() {
  return { snapshot: () => ({ actorId: ACTOR }) };
}

function signingPort(
  renderAndSign: (input: ClinicalArtifactRequest) => Promise<unknown>,
) {
  return {
    renderAndSign: vi.fn(renderAndSign),
    checkCapabilities: vi.fn(async () => undefined),
  };
}

const exam = {
  exam_id: 'fixture-clinical-medical-exam',
  exam_data: { acuity: 'fixture' },
  exam_result: 'APTO',
  inaptitude_until: null,
  professional_id: PROFESSIONAL,
  professional_name: 'Professional fixture',
  professional_council: 'CRM/fixture',
  professional_user_id: ACTOR,
  professional_biometric_passed: true,
};

function reportHandler(sql: string): Record<string, unknown>[] {
  if (sql.includes('professional_biometric_passed')) return [exam];
  if (sql.startsWith('select * from ch.report where encounter_id')) return [];
  if (/insert into ch\.report\s/u.test(sql))
    return [{ id: 'fixture-clinical-report' }];
  return [];
}

const addendumContent = { result: 'APTO', note: 'fixture addendum' };
const addendumSource = {
  id: 'fixture-clinical-addendum',
  report_id: 'fixture-clinical-report',
  reason: 'fixture reason',
  content: addendumContent,
  content_sha256: contentSha256(addendumContent),
  signer_professional_id: PROFESSIONAL,
  signer_name: 'Professional fixture',
  signer_council: 'CRM/fixture',
  professional_user_id: ACTOR,
  report_kind: 'MEDICAL',
  encounter_id: ENCOUNTER,
  report_artifact_sha256: 'b'.repeat(64),
};

function addendumHandler(sql: string): Record<string, unknown>[] {
  if (sql.includes("addendum.status = 'APPROVED'")) return [addendumSource];
  if (sql.includes('update ch.report_addendum'))
    return [
      {
        id: addendumSource.id,
        report_id: addendumSource.report_id,
        content: addendumContent,
      },
    ];
  return [];
}

const closureSnapshot = {
  encounter_id: ENCOUNTER,
  status: 'SIGNED',
  patient_id: 'fixture-clinical-patient',
  patient_name: 'Patient fixture',
  started_at: '2026-09-27T10:00:00.000Z',
  renach_process_key: 'fixture-renach-process',
  medical_exam: { id: 'fixture-clinical-medical-exam', result: 'APTO' },
  psychological_exam: { id: 'fixture-clinical-psych-exam', result: 'APTO' },
  medical_result: 'APTO',
  reports: [
    { id: 'fixture-clinical-report', kind: 'MEDICAL' },
    { id: 'fixture-clinical-psych-report', kind: 'PSYCH' },
  ],
  report_count: 2,
  active_block_count: 0,
  restriction_count: 0,
  renach_acked: true,
  documents: [],
  closer_professional_id: PROFESSIONAL,
  closer_name: 'Professional fixture',
  closer_council_type: 'CRM',
  closer_council_number: 'fixture',
  closer_council_state: 'RS',
};

function closureHandler(sql: string): Record<string, unknown>[] {
  if (sql.includes('from ch.encounter encounter')) return [closureSnapshot];
  if (sql.includes('to_regclass')) return [{ available: true }];
  if (sql.includes('from ch.junta_case')) return [{ pending: false }];
  if (sql.includes('insert into ch.episode_export'))
    return [{ id: 'fixture-clinical-episode-export' }];
  if (sql.includes('update ch.encounter'))
    return [{ id: ENCOUNTER, status: 'CLOSED' }];
  return [];
}

function closureContent(): Record<string, unknown> {
  return {
    documentType: 'EPISODE_EXPORT',
    encounter: {
      id: closureSnapshot.encounter_id,
      patientId: closureSnapshot.patient_id,
      patientName: closureSnapshot.patient_name,
      startedAt: closureSnapshot.started_at,
      renachProcessKey: closureSnapshot.renach_process_key,
    },
    medicalExam: closureSnapshot.medical_exam,
    psychologicalExam: closureSnapshot.psychological_exam,
    reports: closureSnapshot.reports,
    clinicalDocuments: closureSnapshot.documents,
  };
}

function reportService(
  calls: SqlCall[],
  port: ReturnType<typeof signingPort>,
  handler: SqlHandler,
): ReportLifecycleService {
  return new ReportLifecycleService(
    repository(calls, handler) as never,
    requestContext() as never,
    port as unknown as PadesSigningHttpAdapter,
  );
}

function closureService(
  calls: SqlCall[],
  port: ReturnType<typeof signingPort>,
): EncounterClosureService {
  return new EncounterClosureService(
    repository(calls, closureHandler) as never,
    requestContext() as never,
    port as unknown as PadesSigningHttpAdapter,
  );
}

describe('R-0022 CTG-0006 — assinatura clínica caracterizada pela porta DETRAN', () => {
  // C-06-01
  it('C-06-01 dado laudo pronto quando create assina então chama renderAndSign uma vez com REPORT, QUALIFIED, signatário do profissional e hash DETRAN, e persiste o recibo', async () => {
    const calls: SqlCall[] = [];
    const port = signingPort(async () => receipt);
    const input = {
      encounterId: ENCOUNTER,
      kind: 'MEDICAL' as const,
      templateVersion: 'fixture-template-v1',
    };

    await reportService(calls, port, reportHandler).create(input);

    const content = {
      encounterId: ENCOUNTER,
      kind: 'MEDICAL',
      sourceExamId: exam.exam_id,
      examResult: exam.exam_result,
      examData: exam.exam_data,
      templateVersion: input.templateVersion,
    };
    expect(port.renderAndSign).toHaveBeenCalledTimes(1);
    expect(port.renderAndSign).toHaveBeenCalledWith({
      documentType: 'REPORT',
      contentSha256: contentSha256(content),
      content,
      signer: {
        professionalId: PROFESSIONAL,
        name: exam.professional_name,
        council: exam.professional_council,
      },
      minimumSignatureLevel: 'QUALIFIED',
    });
    const insert = calls.find((call) =>
      /insert into ch\.report\s/u.test(call.sql),
    );
    expect(insert?.values).toEqual(
      expect.arrayContaining([
        contentSha256(content),
        receipt.storageDocumentId,
        receipt.artifactSha256,
        receipt.signatureLevel,
        receipt.signatureFormat,
        receipt.signedAt,
        receipt.tsaTime,
        receipt.certificateValidationSource,
        receipt.certificateValidationStatus,
        receipt.certificateValidatedAt,
      ]),
    );
  });

  // C-06-01
  it('C-06-01 dado adendo aprovado quando signAddendum assina então chama renderAndSign uma vez com REPORT_ADDENDUM, QUALIFIED, signatário original e hash DETRAN do conteúdo', async () => {
    const calls: SqlCall[] = [];
    const port = signingPort(async () => receipt);

    await reportService(calls, port, addendumHandler).signAddendum(
      addendumSource.id,
    );

    expect(port.renderAndSign).toHaveBeenCalledTimes(1);
    expect(port.renderAndSign).toHaveBeenCalledWith({
      documentType: 'REPORT_ADDENDUM',
      contentSha256: contentSha256(addendumContent),
      content: {
        reportId: addendumSource.report_id,
        originalArtifactSha256: addendumSource.report_artifact_sha256,
        reason: addendumSource.reason,
        content: addendumContent,
      },
      signer: {
        professionalId: PROFESSIONAL,
        name: addendumSource.signer_name,
        council: addendumSource.signer_council,
      },
      minimumSignatureLevel: 'QUALIFIED',
    });
    const update = calls.find((call) =>
      call.sql.includes('update ch.report_addendum'),
    );
    expect(update?.values).toEqual(
      expect.arrayContaining([
        receipt.storageDocumentId,
        receipt.artifactSha256,
        receipt.signedAt,
        receipt.tsaTime,
        receipt.certificateValidationSource,
        receipt.certificateValidationStatus,
        receipt.certificateValidatedAt,
      ]),
    );
  });

  // C-06-01
  it('C-06-01 dado atendimento assinado quando close exporta então chama renderAndSign uma vez com EPISODE_EXPORT, QUALIFIED, signatário que encerra e hash DETRAN do export', async () => {
    const calls: SqlCall[] = [];
    const port = signingPort(async () => receipt);

    await closureService(calls, port).close(ENCOUNTER);

    const content = closureContent();
    expect(port.renderAndSign).toHaveBeenCalledTimes(1);
    expect(port.renderAndSign).toHaveBeenCalledWith({
      documentType: 'EPISODE_EXPORT',
      contentSha256: contentSha256(content),
      content,
      signer: {
        professionalId: PROFESSIONAL,
        name: closureSnapshot.closer_name,
        council: 'CRM/RS fixture',
      },
      minimumSignatureLevel: 'QUALIFIED',
    });
    const insert = calls.find((call) =>
      call.sql.includes('insert into ch.episode_export'),
    );
    expect(insert?.values).toEqual(
      expect.arrayContaining([
        contentSha256(content),
        receipt.storageDocumentId,
        receipt.artifactSha256,
        receipt.signatureLevel,
        receipt.signatureFormat,
        receipt.signedAt,
        receipt.tsaTime,
        receipt.certificateValidationSource,
        receipt.certificateValidationStatus,
        receipt.certificateValidatedAt,
      ]),
    );
  });

  // C-06-02
  it.each([
    ['hash de conteúdo', { ...receipt, contentSha256: 'c'.repeat(64) }],
    ['hash do artefato', { ...receipt, artifactSha256: 'not-a-hash' }],
    ['storage', { ...receipt, storageDocumentId: '' }],
    ['formato', { ...receipt, signatureFormat: 'PAdES-B-LT' }],
    ['nível', { ...receipt, signatureLevel: 'BASIC' }],
    ['TSA', { ...receipt, tsaTime: '' }],
    ['certificado', { ...receipt, certificateValidationStatus: 'REVOKED' }],
    [
      'fonte do certificado',
      { ...receipt, certificateValidationSource: 'OTHER' },
    ],
  ])(
    'C-06-02 dado recibo com %s divergente quando renderiza e assina em produção então rejeita sem recibo e sem token',
    async (_name, invalidReceipt) => {
      configure();
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(response(invalidReceipt)),
      );

      await expectRedactedRejection(() =>
        new PadesSigningHttpAdapter().renderAndSign(request),
      );
    },
  );

  // C-06-03
  it.each([
    'DETRAN_CLINICAL_SIGNING_URL',
    'DETRAN_CLINICAL_SIGNING_HEALTH_URL',
    'DETRAN_CLINICAL_SIGNING_TOKEN',
  ] as const)(
    'C-06-03 dado %s ausente quando assina ou confere prontidão então rejeita sem recibo nem prontidão positiva e sem token',
    async (name) => {
      configure();
      delete process.env[name];
      vi.stubGlobal(
        'fetch',
        vi
          .fn()
          .mockImplementation(async (url: string) =>
            response(url.includes('health') ? completeCapabilities : receipt),
          ),
      );

      await expectRedactedRejection(() =>
        new PadesSigningHttpAdapter().renderAndSign(request),
      );
      await expectRedactedRejection(() =>
        new PadesSigningHttpAdapter().checkCapabilities(),
      );
    },
  );

  // C-06-03
  it('C-06-03 dado fetch rejeitado por timeout quando assina ou confere prontidão então rejeita sem recibo nem prontidão positiva e sem token', async () => {
    configure();
    const timeout = Object.assign(new Error('request timed out'), {
      name: 'TimeoutError',
    });
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(timeout));

    await expectRedactedRejection(() =>
      new PadesSigningHttpAdapter().renderAndSign(request),
    );
    await expectRedactedRejection(() =>
      new PadesSigningHttpAdapter().checkCapabilities(),
    );
  });

  // C-06-03
  it('C-06-03 dado HTTP 503 quando assina ou confere prontidão então rejeita sem recibo nem prontidão positiva e sem token', async () => {
    configure();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response({}, false, 503)));

    await expectRedactedRejection(() =>
      new PadesSigningHttpAdapter().renderAndSign(request),
    );
    await expectRedactedRejection(() =>
      new PadesSigningHttpAdapter().checkCapabilities(),
    );
  });

  // C-06-03 (prontidão por capacidade)
  it.each([
    ['lta:false', { ...completeCapabilities, lta: false }],
    ['tsa:false', { ...completeCapabilities, tsa: false }],
    ['pades:false', { ...completeCapabilities, pades: false }],
    [
      'certificateValidation:[]',
      { ...completeCapabilities, certificateValidation: [] },
    ],
  ])(
    'C-06-03 dado health com %s quando confere prontidão então rejeita',
    async (_name, health) => {
      configure();
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response(health)));

      await expectRedactedRejection(() =>
        new PadesSigningHttpAdapter().checkCapabilities(),
      );
    },
  );

  // C-06-04 (clínico)
  for (const profile of ['staging-like', 'production'] as const) {
    it.each([
      'DETRAN_CLINICAL_SIGNING_URL',
      'DETRAN_CLINICAL_SIGNING_HEALTH_URL',
    ] as const)(
      `C-06-04 dado %s com http: em ${profile} quando assina ou confere prontidão então rejeita sem nenhuma chamada a fetch`,
      async (name) => {
        configure(profile);
        process.env[name] = String(process.env[name]).replace(
          'https:',
          'http:',
        );
        const fetch = vi
          .fn()
          .mockImplementation(async (url: string) =>
            response(url.includes('health') ? completeCapabilities : receipt),
          );
        vi.stubGlobal('fetch', fetch);

        await expectRedactedRejection(() =>
          new PadesSigningHttpAdapter().renderAndSign(request),
        );
        await expectRedactedRejection(() =>
          new PadesSigningHttpAdapter().checkCapabilities(),
        );
        expect(fetch).not.toHaveBeenCalled();
      },
    );
  }

  // C-06-10
  it('C-06-10 dado porta clínica que rejeita quando create assina então propaga a rejeição sem laudo, outbox nem mudança de atendimento', async () => {
    const calls: SqlCall[] = [];
    const failure = new Error('fixture signature level not met');
    const port = signingPort(async () => Promise.reject(failure));

    await expect(
      reportService(calls, port, reportHandler).create({
        encounterId: ENCOUNTER,
        kind: 'MEDICAL',
        templateVersion: 'fixture-template-v1',
      }),
    ).rejects.toBe(failure);

    expect(port.renderAndSign).toHaveBeenCalledTimes(1);
    expect(
      calls.some((call) => /insert into ch\.report\s/u.test(call.sql)),
    ).toBe(false);
    expect(
      calls.some((call) => call.sql.includes('insert into integration.outbox')),
    ).toBe(false);
    expect(calls.some((call) => call.sql.includes('update ch.encounter'))).toBe(
      false,
    );
  });

  // C-06-10
  it('C-06-10 dado porta clínica que rejeita quando signAddendum assina então propaga a rejeição sem adendo assinado nem outbox', async () => {
    const calls: SqlCall[] = [];
    const failure = new Error('fixture signature level not met');
    const port = signingPort(async () => Promise.reject(failure));

    await expect(
      reportService(calls, port, addendumHandler).signAddendum(
        addendumSource.id,
      ),
    ).rejects.toBe(failure);

    expect(port.renderAndSign).toHaveBeenCalledTimes(1);
    expect(
      calls.some((call) => call.sql.includes('update ch.report_addendum')),
    ).toBe(false);
    expect(
      calls.some((call) => call.sql.includes('insert into integration.outbox')),
    ).toBe(false);
  });

  // C-06-10
  it('C-06-10 dado porta clínica que rejeita quando close exporta então propaga a rejeição sem export nem encerramento do atendimento', async () => {
    const calls: SqlCall[] = [];
    const failure = new Error('fixture signature level not met');
    const port = signingPort(async () => Promise.reject(failure));

    await expect(closureService(calls, port).close(ENCOUNTER)).rejects.toBe(
      failure,
    );

    expect(port.renderAndSign).toHaveBeenCalledTimes(1);
    expect(
      calls.some((call) => call.sql.includes('insert into ch.episode_export')),
    ).toBe(false);
    expect(
      calls.some(
        (call) =>
          call.sql.includes('update ch.encounter') &&
          call.sql.includes("'CLOSED'"),
      ),
    ).toBe(false);
    expect(
      calls.some((call) => call.sql.includes('insert into integration.outbox')),
    ).toBe(false);
  });
});
