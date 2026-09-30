// Prova de concorrência de `refreshEncounterSignatureStatus` (hotfix B9,
// defeito 5): laudos MEDICAL e PSYCH assinados juntos. T1 assina o MEDICAL e
// fica aberta; T2 assina o PSYCH; T1 commita. Com os dois laudos gravados, o
// atendimento tem de terminar SIGNED, não READY_FOR_SIGNATURE. A assinatura
// PAdES é serviço HTTP externo e fica como dublê (recibo fixo).
import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import type { ClinicalArtifactReceipt } from '../../src/pades-signing.http-adapter.js';
import { ReportLifecycleService } from '../../src/report-lifecycle.service.js';
import { ReportRepository } from '../../src/repositories/report.repository.js';
import {
  RaceSession,
  cloneDatabase,
  interleave,
  summarize,
  type RaceDatabase,
} from './race-harness.js';

let clone: RaceDatabase;
let owner: pg.Client;
let first: RaceSession;
let second: RaceSession;
const tenantId = randomUUID();
const medicalActor = randomUUID();
const psychActor = randomUUID();
const clinicId = randomUUID();
const patientId = randomUUID();
const encounterId = randomUUID();
const medicalProfessional = randomUUID();
const psychProfessional = randomUUID();
const instrumentId = randomUUID();
const stationId = randomUUID();

function receipt(): ClinicalArtifactReceipt {
  return {
    contentSha256: '',
    storageDocumentId: randomUUID(),
    artifactSha256: 'b'.repeat(64),
    signatureLevel: 'QUALIFIED',
    signatureFormat: 'PAdES-TSA',
    signedAt: '2026-09-29T12:00:00.000Z',
    tsaTime: '2026-09-29T12:00:01.000Z',
    certificateValidationSource: 'OCSP',
    certificateValidationStatus: 'GOOD',
    certificateValidatedAt: '2026-09-29T12:00:02.000Z',
  } as ClinicalArtifactReceipt;
}

/** `create` abre três transações (preflight, laudo existente, gravação); só
 * a terceira — a que grava o laudo e o status — fica aberta. */
function sign(
  session: RaceSession,
  actorId: string,
  kind: 'MEDICAL' | 'PSYCH',
  hold?: () => Promise<void>,
) {
  let calls = 0;
  const plain = session.database(tenantId, actorId);
  const held = session.database(tenantId, actorId, hold);
  const database = {
    tx: <T>(work: (tx: never) => Promise<T>) =>
      ((calls += 1) === 3 && hold ? held : plain).tx(
        work as never,
      ) as Promise<T>,
  };
  const requestContext = {
    hasActiveContext: () => true,
    snapshot: () => ({ tenantId, actorId }),
  };
  return new ReportLifecycleService(
    new ReportRepository(database as never, requestContext as never),
    requestContext as never,
    { renderAndSign: async () => receipt() } as never,
  ).create({ encounterId, kind, templateVersion: 'race-1' });
}

beforeAll(async () => {
  clone = await cloneDatabase();
  owner = new pg.Client({ connectionString: clone.url });
  await owner.connect();
  // Fixtures (owner, só no clone).
  await owner.query(`select set_config('app.role', 'owner', false)`);
  await owner.query(
    'insert into auth.tenants (id, slug, name) values ($1, $2, $3)',
    [tenantId, `report-race-${tenantId.slice(0, 8)}`, 'Report race'],
  );
  for (const userId of [medicalActor, psychActor]) {
    await owner.query(
      `insert into auth.users (id, tenant_id, email, display_name)
       values ($1, $2, $3, 'Report race')`,
      [userId, tenantId, `${userId}@detran.invalid`],
    );
  }
  await owner.query(
    `insert into ch.clinic (id, tenant_id, code, cnpj, name, region_code)
     values ($1, $2, 'REPORT-RACE', '00000000000191', 'Clínica prova', 'R1')`,
    [clinicId, tenantId],
  );
  await owner.query(
    `insert into ch.patient (id, tenant_id, clinic_id, national_id, name)
     values ($1, $2, $3, '00000000191', 'Paciente prova')`,
    [patientId, tenantId, clinicId],
  );
  await owner.query(
    `insert into ch.encounter (id, tenant_id, clinic_id, patient_id, status)
     values ($1, $2, $3, $4, 'IN_PROGRESS')`,
    [encounterId, tenantId, clinicId, patientId],
  );
  await owner.query(
    `insert into ch.professional
       (id, tenant_id, clinic_id, user_id, person_name, professional_kind,
        council_type, council_number, council_state)
     values ($1, $2, $3, $4, 'Médica prova', 'MEDICO', 'CRM', '12345', 'AM'),
            ($5, $2, $3, $6, 'Psicóloga prova', 'PSICOLOGO', 'CRP', '54321', 'AM')`,
    [
      medicalProfessional,
      tenantId,
      clinicId,
      medicalActor,
      psychProfessional,
      psychActor,
    ],
  );
  await owner.query(
    `insert into ch.medical_exam
       (tenant_id, encounter_id, professional_id, statutory_valid_until,
        valid_until, data, result)
     values ($1, $2, $3, current_date + 365, current_date + 365,
             '{}'::jsonb, 'APTO')`,
    [tenantId, encounterId, medicalProfessional],
  );
  await owner.query(
    `insert into ch.psych_instrument
       (id, tenant_id, code, name, version, satepsi_status, valid_from,
        source_reference)
     values ($1, $2, 'RACE', 'Instrumento prova', '1', 'FAVORABLE',
             '2026-01-01', 'SATEPSI prova')`,
    [instrumentId, tenantId],
  );
  await owner.query(
    `insert into ch.psychological_exam
       (tenant_id, encounter_id, professional_id, instrument_id, data, result)
     values ($1, $2, $3, $4, '{}'::jsonb, 'APTO')`,
    [tenantId, encounterId, psychProfessional, instrumentId],
  );
  await owner.query(
    `insert into ch.biometric_station
       (id, tenant_id, clinic_id, name, fingerprint_hash, provider_code,
        device_certificate_fingerprint)
     values ($1, $2, $3, 'Estação prova', 'f', 'P', 'd')`,
    [stationId, tenantId, clinicId],
  );
  for (const [kind, professionalId, actorId] of [
    ['MEDICAL', medicalProfessional, medicalActor],
    ['PSYCH', psychProfessional, psychActor],
  ] as const) {
    await owner.query(
      `insert into ch.biometric_check
         (tenant_id, encounter_id, clinic_id, station_id,
          subject_professional_id, kind, modality, passed,
          evidence_document_id, evidence_sha256, created_by)
       values ($1, $2, $3, $4, $5, $6, 'FINGERPRINT', true, $7, $8, $9)`,
      [
        tenantId,
        encounterId,
        clinicId,
        stationId,
        professionalId,
        kind,
        randomUUID(),
        'c'.repeat(64),
        actorId,
      ],
    );
  }
  first = await RaceSession.open(clone.url, 'race-report-t1');
  second = await RaceSession.open(clone.url, 'race-report-t2');
}, 60_000);

afterAll(async () => {
  await first?.end();
  await second?.end();
  await owner?.end();
  await clone?.drop();
}, 60_000);

describe('laudos: assinatura concorrente das duas trilhas', () => {
  it('dado atendimento com exame médico e psicológico quando os dois laudos são assinados em paralelo então o atendimento fica SIGNED', async () => {
    const outcome = await interleave({
      observer: owner,
      second,
      runFirst: (hold) => sign(first, medicalActor, 'MEDICAL', hold),
      runSecond: () => sign(second, psychActor, 'PSYCH'),
    });
    expect(outcome.first.status, JSON.stringify(summarize(outcome.first))).toBe(
      'fulfilled',
    );
    expect(
      outcome.second.status,
      JSON.stringify(summarize(outcome.second)),
    ).toBe('fulfilled');
    const encounter = await owner.query<{ status: string }>(
      'select status from ch.encounter where id = $1',
      [encounterId],
    );
    expect(encounter.rows[0]!.status).toBe('SIGNED');
    expect(outcome.secondWhileFirstOpen).toBe('blocked');
  });
});
