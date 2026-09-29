import { randomUUID } from 'node:crypto';

import type { Client } from 'pg';

export const rlsTargets = [
  'appointment',
  'biometric_check',
  'encounter',
  'medical_exam',
  'report',
  'encounter_restriction',
  'telehealth_session',
  'clinical_control_event',
  'junta_case',
  'retention_case',
  'periodic_toxicology_result',
  'inconsistency',
  'clinic',
  'operational_record',
  'process_block',
] as const;

export type RlsTarget = (typeof rlsTargets)[number];

type Fixture = {
  tenantA: string;
  tenantB: string;
  targetIdA: string;
  targetIdB: string;
};

type TenantFixture = {
  tenantId: string;
  userId: string;
  clinicId: string;
  patientId: string;
  professionalId: string;
  stationId: string;
  appointmentId: string;
  encounterId: string;
  medicalExamId: string;
  restrictionCodeId: string;
};

const sha256 = 'a'.repeat(64);

async function insertBaseFixture(
  client: Client,
  tenantId: string,
  ordinal: number,
) {
  const fixture: TenantFixture = {
    tenantId,
    userId: randomUUID(),
    clinicId: randomUUID(),
    patientId: randomUUID(),
    professionalId: randomUUID(),
    stationId: randomUUID(),
    appointmentId: randomUUID(),
    encounterId: randomUUID(),
    medicalExamId: randomUUID(),
    restrictionCodeId: randomUUID(),
  };
  const tag = `r31-${tenantId}`;

  await client.query(
    'insert into auth.tenants (id, slug, name) values ($1, $2, $3)',
    [tenantId, tag, `R31 ${tag}`],
  );
  await client.query(
    'insert into auth.users (id, tenant_id, email, display_name) values ($1, $2, $3, $4)',
    [fixture.userId, tenantId, `${tag}@detran.invalid`, `R31 ${ordinal}`],
  );
  await client.query(
    `insert into ch.clinic (id, tenant_id, code, cnpj, name, region_code)
     values ($1, $2, $3, $4, $5, 'source_pending')`,
    [
      fixture.clinicId,
      tenantId,
      tag,
      `0000000000000${ordinal}`,
      `R31 clinic ${ordinal}`,
    ],
  );
  await client.query(
    `insert into ch.patient (id, tenant_id, clinic_id, user_id, national_id, name)
     values ($1, $2, $3, $4, $5, $6)`,
    [
      fixture.patientId,
      tenantId,
      fixture.clinicId,
      fixture.userId,
      `0000000000${ordinal}`,
      `R31 patient ${ordinal}`,
    ],
  );
  await client.query(
    `insert into ch.professional
       (id, tenant_id, clinic_id, person_name, professional_kind, council_type, council_number, council_state)
     values ($1, $2, $3, $4, 'MEDICO', 'CRM', '1', 'AM')`,
    [
      fixture.professionalId,
      tenantId,
      fixture.clinicId,
      `R31 professional ${ordinal}`,
    ],
  );
  await client.query(
    `insert into ch.biometric_station
       (id, tenant_id, clinic_id, name, fingerprint_hash, provider_code, device_certificate_fingerprint)
     values ($1, $2, $3, $4, $5, 'R31', $5)`,
    [
      fixture.stationId,
      tenantId,
      fixture.clinicId,
      `R31 station ${ordinal}`,
      sha256,
    ],
  );
  await client.query(
    `insert into ch.restriction_code
       (id, tenant_id, code, legal_label, annex_version, source_reference, effective_from)
     values ($1, $2, $3, 'source_pending', 'source_pending', 'source_pending', current_date)`,
    [
      fixture.restrictionCodeId,
      tenantId,
      `r31-${tenantId.replaceAll('-', '').slice(0, 28)}`,
    ],
  );
  await client.query(
    `insert into ch.appointment
       (id, tenant_id, clinic_id, patient_id, professional_id, scheduled_at)
     values ($1, $2, $3, $4, $5, now())`,
    [
      fixture.appointmentId,
      tenantId,
      fixture.clinicId,
      fixture.patientId,
      fixture.professionalId,
    ],
  );
  await client.query(
    `insert into ch.encounter (id, tenant_id, clinic_id, patient_id, appointment_id)
     values ($1, $2, $3, $4, $5)`,
    [
      fixture.encounterId,
      tenantId,
      fixture.clinicId,
      fixture.patientId,
      fixture.appointmentId,
    ],
  );
  await client.query(
    `insert into ch.medical_exam
       (id, tenant_id, encounter_id, professional_id, statutory_valid_until, valid_until, data, result)
     values ($1, $2, $3, $4, current_date + 30, current_date + 30, '{}'::jsonb, 'APTO')`,
    [
      fixture.medicalExamId,
      tenantId,
      fixture.encounterId,
      fixture.professionalId,
    ],
  );
  return fixture;
}

async function insertTarget(
  client: Client,
  target: RlsTarget,
  fixture: TenantFixture,
): Promise<string> {
  if (target === 'appointment') return fixture.appointmentId;
  if (target === 'encounter') return fixture.encounterId;
  if (target === 'medical_exam') return fixture.medicalExamId;
  if (target === 'clinic') return fixture.clinicId;

  const id = randomUUID();
  switch (target) {
    case 'biometric_check':
      await client.query(
        `insert into ch.biometric_check
           (id, tenant_id, appointment_id, clinic_id, station_id, subject_patient_id, kind, modality, passed, evidence_document_id, evidence_sha256, created_by)
         values ($1, $2, $3, $4, $5, $6, 'CHECKIN', 'FACE', true, $7, $8, $9)`,
        [
          id,
          fixture.tenantId,
          fixture.appointmentId,
          fixture.clinicId,
          fixture.stationId,
          fixture.patientId,
          randomUUID(),
          sha256,
          fixture.userId,
        ],
      );
      break;
    case 'report':
      await client.query(
        `insert into ch.report
           (id, tenant_id, encounter_id, kind, source_exam_id, content_sha256, storage_document_id, artifact_sha256, signer_professional_id, signer_name, signer_council, signature_level, signature_format, signed_at, tsa_time, certificate_validation_source, certificate_validation_status, certificate_validated_at)
         values ($1, $2, $3, 'MEDICAL', $4, $5, $6, $5, $7, 'R31 signer', 'CRM/AM', 'ADVANCED', 'PAdES-TSA', now(), now(), 'OCSP', 'GOOD', now())`,
        [
          id,
          fixture.tenantId,
          fixture.encounterId,
          fixture.medicalExamId,
          sha256,
          randomUUID(),
          fixture.professionalId,
        ],
      );
      break;
    case 'encounter_restriction':
      await client.query(
        `insert into ch.encounter_restriction
           (id, tenant_id, encounter_id, restriction_code_id, prescribed_by)
         values ($1, $2, $3, $4, $5)`,
        [
          id,
          fixture.tenantId,
          fixture.encounterId,
          fixture.restrictionCodeId,
          fixture.professionalId,
        ],
      );
      break;
    case 'telehealth_session':
      await client.query(
        `insert into ch.telehealth_session
           (id, tenant_id, encounter_id, professional_id, appointment_id, provider, external_session_id, lfd_passed, created_by)
         values ($1, $2, $3, $4, $5, 'R31_PROVIDER', $6, true, $7)`,
        [
          id,
          fixture.tenantId,
          fixture.encounterId,
          fixture.professionalId,
          fixture.appointmentId,
          `r31-${id}`,
          fixture.userId,
        ],
      );
      break;
    case 'clinical_control_event':
      await client.query(
        `insert into ch.clinical_control_event
           (id, tenant_id, encounter_id, medical_exam_id, control_kind, payload, recorded_by)
         values ($1, $2, $3, $4, 'OPHTHALMOLOGY', '{}'::jsonb, $5)`,
        [
          id,
          fixture.tenantId,
          fixture.encounterId,
          fixture.medicalExamId,
          fixture.professionalId,
        ],
      );
      break;
    case 'junta_case':
      await client.query(
        `insert into ch.junta_case
           (id, tenant_id, encounter_id, applicant_patient_id, track, reason_code, result_known_at, requested_at, request_deadline_at, submitted_by)
         values ($1, $2, $3, $4, 'MEDICAL', 'RESULT_DISAGREEMENT', now(), now(), now() + interval '30 days', $5)`,
        [
          id,
          fixture.tenantId,
          fixture.encounterId,
          fixture.patientId,
          fixture.userId,
        ],
      );
      break;
    case 'retention_case':
      await client.query(
        `insert into ch.retention_case
           (id, tenant_id, patient_id, custodian, last_record_at, eligible_after, preservation_status, status, block_reasons, assessed_by, assessed_at)
         values ($1, $2, $3, 'PLATFORM', now(), (current_date + interval '20 years')::date, 'PAdES_LTA_REQUIRED', 'ELIGIBLE_BLOCKED', '[]'::jsonb, $4, now())`,
        [id, fixture.tenantId, fixture.patientId, fixture.userId],
      );
      break;
    case 'periodic_toxicology_result':
      await client.query(
        `insert into ch.periodic_toxicology_result
           (id, tenant_id, source_event_id, payload_sha256, patient_id, driver_cpf, category, result, collected_at, valid_until, occurred_at, laboratory_code, source_reference, driver_alert_status)
         values ($1, $2, $3, $4, $5, '00000000000', 'C', 'NEGATIVE', now(), now() + interval '90 days', now(), 'R31', 'source_pending', 'NOT_REQUIRED')`,
        [id, fixture.tenantId, `r31-${id}`, sha256, fixture.patientId],
      );
      break;
    case 'inconsistency':
      await client.query(
        `insert into ch.inconsistency
           (id, tenant_id, encounter_id, source_system, severity, detection_reason, due_at, created_by)
         values ($1, $2, $3, 'R31', 'LOW', 'source_pending', now(), $4)`,
        [id, fixture.tenantId, fixture.encounterId, fixture.userId],
      );
      break;
    case 'operational_record':
      await client.query(
        `insert into ch.operational_record
           (id, tenant_id, record_kind, subject_type, clinic_id, status, payload, created_by)
         values ($1, $2, 'CLINIC_INSPECTION', 'CLINIC', $3, 'RECORDED', '{}'::jsonb, $4)`,
        [id, fixture.tenantId, fixture.clinicId, fixture.userId],
      );
      break;
    case 'process_block':
      await client.query(
        `insert into ch.process_block
           (id, tenant_id, encounter_id, block_kind, message, created_by)
         values ($1, $2, $3, 'R31_BLOCK', 'source_pending', $4)`,
        [id, fixture.tenantId, fixture.encounterId, fixture.userId],
      );
      break;
  }
  return id;
}

export async function createRlsFixture(client: Client, target: RlsTarget) {
  const tenantA = randomUUID();
  const tenantB = randomUUID();
  await client.query('begin');
  try {
    await client.query(`select set_config('app.role', 'owner', false)`);
    const fixtureA = await insertBaseFixture(client, tenantA, 1);
    const fixtureB = await insertBaseFixture(client, tenantB, 2);
    const fixture = {
      tenantA,
      tenantB,
      targetIdA: await insertTarget(client, target, fixtureA),
      targetIdB: await insertTarget(client, target, fixtureB),
    } satisfies Fixture;
    await client.query('commit');
    return fixture;
  } catch (error) {
    await client.query('rollback');
    throw error;
  }
}

export async function removeRlsFixture(
  client: Client,
  fixture: Fixture | undefined,
) {
  if (!fixture) return;
  const tenants = [fixture.tenantA, fixture.tenantB];
  await client.query(`select set_config('app.role', 'owner', false)`);
  for (const table of [
    'biometric_check',
    'clinical_control_event',
    'encounter_restriction',
    'junta_case',
    'retention_case',
    'periodic_toxicology_result',
    'inconsistency',
    'operational_record',
    'process_block',
    'telehealth_session',
    'report',
    'medical_exam',
    'encounter',
    'appointment',
    'biometric_station',
    'restriction_code',
    'professional',
    'patient',
    'clinic',
  ])
    await client.query(
      `delete from ch.${table} where tenant_id = any($1::uuid[])`,
      [tenants],
    );
  await client.query(
    'delete from auth.users where tenant_id = any($1::uuid[])',
    [tenants],
  );
  await client.query('delete from auth.tenants where id = any($1::uuid[])', [
    tenants,
  ]);
}

async function asTenant(
  client: Client,
  tenantId: string,
  sql: string,
  targetId: string,
) {
  await client.query('begin');
  try {
    await client.query('set local role role_app_backend');
    await client.query(`select set_config('app.tenant_id', $1, true)`, [
      tenantId,
    ]);
    const result = await client.query(sql, [targetId]);
    await client.query('commit');
    return result.rows;
  } catch (error) {
    await client.query('rollback');
    throw error;
  }
}

export async function assertTableTenantIsolation(
  client: Client,
  table: RlsTarget,
  fixture: Fixture,
) {
  const tenantARead = await asTenant(
    client,
    fixture.tenantA,
    `select id from ch.${table} where id = $1`,
    fixture.targetIdA,
  );
  if (tenantARead.length !== 1 || tenantARead[0]?.id !== fixture.targetIdA)
    throw new Error(`tenant A could not read its ${table} fixture`);
  const crossTenantRead = await asTenant(
    client,
    fixture.tenantA,
    `select id from ch.${table} where id = $1`,
    fixture.targetIdB,
  );
  const crossTenantMutation = await asTenant(
    client,
    fixture.tenantA,
    `update ch.${table} set updated_at = updated_at where id = $1 returning id`,
    fixture.targetIdB,
  );
  const ownerRead = await asTenant(
    client,
    fixture.tenantB,
    `select id from ch.${table} where id = $1`,
    fixture.targetIdB,
  );
  return { crossTenantRead, crossTenantMutation, ownerRead };
}
