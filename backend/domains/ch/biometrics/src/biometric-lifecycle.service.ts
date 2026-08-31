import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import type { Transaction } from '@stynx-nyx/data';

import type { BiometricCheck } from './entities/biometric-check.entity.js';
import type { BiometricException } from './entities/biometric-exception.entity.js';
import type { BiometricFingerCondition } from './entities/biometric-finger-condition.entity.js';
import { BiometricVerificationHttpAdapter } from './biometric-verification.http-adapter.js';
import { BiometricCheckRepository } from './repositories/biometric-check.repository.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};

export interface RecordBiometricCheckInput {
  appointmentId?: string;
  encounterId?: string;
  stationId: string;
  subjectPatientId?: string;
  subjectProfessionalId?: string;
  kind: 'CHECKIN' | 'MEDICAL' | 'PSYCH';
  modality: 'FINGERPRINT' | 'FACE';
  fallbackFromFingerprint?: boolean;
  captureReference: string;
}

export interface RecordFingerConditionInput {
  patientId: string;
  fingerCode:
    'LT' | 'LI' | 'LM' | 'LR' | 'LL' | 'RT' | 'RI' | 'RM' | 'RR' | 'RL';
  condition: 'AVAILABLE' | 'TEMP_UNAVAILABLE' | 'PERMANENT_ABSENT';
  reason?: string;
}

export interface RequestBiometricExceptionInput {
  appointmentId?: string;
  encounterId?: string;
  clinicId: string;
  stationId: string;
  biometricCheckId: string;
  scope: 'CHECKIN' | 'MEDICAL' | 'PSYCH';
  reason: string;
  justification?: string;
  attachmentDocumentIds?: string[];
  expiresAt: string;
}

interface ScopeGate {
  clinic_id: string;
  patient_id: string;
  status: string;
  provider_code: string;
  device_certificate_fingerprint: string;
  lfd_capable: boolean;
}

@Injectable()
export class BiometricLifecycleService {
  constructor(
    private readonly checks: BiometricCheckRepository,
    private readonly requestContext: RequestContext,
    private readonly provider: BiometricVerificationHttpAdapter,
  ) {}

  async recordCheck(input: RecordBiometricCheckInput): Promise<BiometricCheck> {
    const actorId = this.requireActorId();
    const gate = await this.checks.transaction(async (transaction) => {
      const tx = transaction as SqlTransaction;
      const scope = await this.requireScope(tx, input);
      if (input.modality === 'FINGERPRINT' && !scope.lfd_capable) {
        throw new BadRequestException('Fingerprint station must support LFD');
      }
      if (input.fallbackFromFingerprint) {
        if (input.modality !== 'FACE' || !input.subjectPatientId) {
          throw new BadRequestException(
            'Fingerprint fallback must use facial validation for the patient',
          );
        }
        const unavailable = await tx.query<{ total: number }>(
          `select count(*)::integer as total
             from ch.biometric_finger_condition
            where patient_id = $1
              and condition in ('TEMP_UNAVAILABLE','PERMANENT_ABSENT')`,
          [input.subjectPatientId],
        );
        if (!unavailable.rows[0]?.total) {
          throw new BadRequestException(
            'Facial fallback requires a structured unavailable-finger record',
          );
        }
      }
      return scope;
    });

    const receipt = await this.provider.verify({
      providerCode: gate.provider_code,
      stationId: input.stationId,
      deviceCertificateFingerprint: gate.device_certificate_fingerprint,
      captureReference: input.captureReference,
      modality: input.modality,
      kind: input.kind,
      subjectReference: {
        ...(input.subjectPatientId
          ? { patientId: input.subjectPatientId }
          : {}),
        ...(input.subjectProfessionalId
          ? { professionalId: input.subjectProfessionalId }
          : {}),
      },
    });

    return this.checks.transaction(async (transaction) => {
      const tx = transaction as SqlTransaction;
      const result = await tx.query<BiometricCheck & Record<string, unknown>>(
        `insert into ch.biometric_check
          (appointment_id, encounter_id, clinic_id, station_id,
           subject_patient_id, subject_professional_id, kind, modality,
           score, lfd_score, passed, evidence_document_id,
           evidence_sha256, reason, created_by)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
                 $13, $14, $15)
         returning *`,
        [
          input.appointmentId ?? null,
          input.encounterId ?? null,
          gate.clinic_id,
          input.stationId,
          input.subjectPatientId ?? null,
          input.subjectProfessionalId ?? null,
          input.kind,
          input.modality,
          receipt.score,
          receipt.lfdScore,
          receipt.passed,
          receipt.evidenceDocumentId,
          receipt.evidenceSha256,
          receipt.reason,
          actorId,
        ],
      );
      if (receipt.passed && input.kind === 'CHECKIN') {
        await tx.query(
          `update ch.appointment set status = 'CHECKED_IN', updated_at = now()
            where id = $1 and status = 'SCHEDULED'`,
          [input.appointmentId],
        );
      } else if (
        receipt.passed &&
        input.subjectPatientId &&
        input.kind !== 'CHECKIN'
      ) {
        await tx.query(
          `update ch.encounter set status = 'IN_PROGRESS', updated_at = now()
            where id = $1 and status in ('OPEN','IN_PROGRESS')`,
          [input.encounterId],
        );
      }
      return result.rows[0] as BiometricCheck;
    });
  }

  recordFingerCondition(
    input: RecordFingerConditionInput,
  ): Promise<BiometricFingerCondition> {
    const actorId = this.requireActorId();
    if (input.condition !== 'AVAILABLE' && !input.reason?.trim()) {
      throw new BadRequestException(
        'Unavailable fingerprint requires a structured reason',
      );
    }
    return this.checks.transaction(async (transaction) => {
      const tx = transaction as SqlTransaction;
      const result = await tx.query<
        BiometricFingerCondition & Record<string, unknown>
      >(
        `insert into ch.biometric_finger_condition
          (patient_id, finger_code, condition, reason, recorded_by)
         values ($1, $2, $3, $4, $5)
         on conflict (tenant_id, patient_id, finger_code)
         do update set condition = excluded.condition, reason = excluded.reason,
                       recorded_by = excluded.recorded_by, updated_at = now()
         returning *`,
        [
          input.patientId,
          input.fingerCode,
          input.condition,
          input.reason?.trim() ?? null,
          actorId,
        ],
      );
      return result.rows[0] as BiometricFingerCondition;
    });
  }

  requestException(
    input: RequestBiometricExceptionInput,
  ): Promise<BiometricException> {
    const actorId = this.requireActorId();
    const expiresAt = new Date(input.expiresAt);
    if (Number.isNaN(expiresAt.valueOf()) || expiresAt <= new Date()) {
      throw new BadRequestException(
        'Biometric exception expiry must be future',
      );
    }
    if (!input.reason.trim()) {
      throw new BadRequestException('Biometric exception reason is required');
    }
    return this.checks.transaction(async (transaction) => {
      const tx = transaction as SqlTransaction;
      const failed = await tx.query<{ id: string }>(
        `select id from ch.biometric_check
          where id = $1 and not passed and station_id = $2 and kind = $3
            and clinic_id = $4
            and appointment_id is not distinct from $5
            and encounter_id is not distinct from $6`,
        [
          input.biometricCheckId,
          input.stationId,
          input.scope,
          input.clinicId,
          input.appointmentId ?? null,
          input.encounterId ?? null,
        ],
      );
      if (!failed.rows[0]) {
        throw new BadRequestException(
          'Biometric exception requires a matching failed check',
        );
      }
      const result = await tx.query<
        BiometricException & Record<string, unknown>
      >(
        `insert into ch.biometric_exception
          (appointment_id, encounter_id, clinic_id, station_id,
           biometric_check_id, scope, requested_by, reason, justification,
           attachment_document_ids, status, expires_at)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb,
                 'REQUESTED', $11)
         returning *`,
        [
          input.appointmentId ?? null,
          input.encounterId ?? null,
          input.clinicId,
          input.stationId,
          input.biometricCheckId,
          input.scope,
          actorId,
          input.reason.trim(),
          input.justification?.trim() ?? null,
          JSON.stringify(input.attachmentDocumentIds ?? []),
          input.expiresAt,
        ],
      );
      return result.rows[0] as BiometricException;
    });
  }

  decideException(
    id: string,
    approve: boolean,
    justification?: string,
  ): Promise<BiometricException> {
    const actorId = this.requireActorId();
    return this.checks.transaction(async (transaction) => {
      const tx = transaction as SqlTransaction;
      const result = await tx.query<
        BiometricException & Record<string, unknown>
      >(
        `update ch.biometric_exception
            set status = case when $2 then 'APPROVED' else 'REJECTED' end,
                approved_by = $3, approved_at = now(),
                justification = coalesce($4, justification), updated_at = now()
          where id = $1 and status = 'REQUESTED'
            and requested_by <> $3 and expires_at > now()
          returning *`,
        [id, approve, actorId, justification?.trim() ?? null],
      );
      const exception = result.rows[0];
      if (!exception) {
        throw new BadRequestException(
          'Exception decision requires a distinct supervisor before expiry',
        );
      }
      return exception;
    });
  }

  private async requireScope(
    tx: SqlTransaction,
    input: RecordBiometricCheckInput,
  ): Promise<ScopeGate> {
    const isCheckIn = input.kind === 'CHECKIN';
    const subjectCount =
      Number(Boolean(input.subjectPatientId)) +
      Number(Boolean(input.subjectProfessionalId));
    if (
      (isCheckIn && (!input.appointmentId || input.encounterId)) ||
      (isCheckIn && (!input.subjectPatientId || input.subjectProfessionalId)) ||
      (!isCheckIn && (!input.encounterId || input.appointmentId)) ||
      (!isCheckIn && subjectCount !== 1)
    ) {
      throw new BadRequestException('Invalid biometric check scope');
    }
    const sourceTable = isCheckIn ? 'ch.appointment' : 'ch.encounter';
    const sourceId = isCheckIn ? input.appointmentId : input.encounterId;
    const result = await tx.query<ScopeGate>(
      `select source.clinic_id, source.patient_id, source.status,
              station.provider_code, station.device_certificate_fingerprint,
              station.lfd_capable
         from ${sourceTable} source
         join ch.biometric_station station
           on station.id = $2 and station.clinic_id = source.clinic_id
          and station.is_active
        where source.id = $1`,
      [sourceId, input.stationId],
    );
    const gate = result.rows[0];
    if (!gate)
      throw new NotFoundException('Biometric scope or station not found');
    if (isCheckIn && gate.patient_id !== input.subjectPatientId) {
      throw new BadRequestException(
        'Appointment patient does not match subject',
      );
    }
    if (
      !isCheckIn &&
      input.subjectPatientId &&
      gate.patient_id !== input.subjectPatientId
    ) {
      throw new BadRequestException('Encounter patient does not match subject');
    }
    if (isCheckIn && gate.status !== 'SCHEDULED') {
      throw new BadRequestException(
        'Appointment is not available for check-in',
      );
    }
    if (!isCheckIn && gate.status === 'CLOSED') {
      throw new BadRequestException(
        'Closed encounter rejects biometric writes',
      );
    }
    if (input.subjectProfessionalId) {
      const expectedKind = input.kind === 'MEDICAL' ? 'MEDICO' : 'PSICOLOGO';
      const professional = await tx.query<{ id: string }>(
        `select id from ch.professional
          where id = $1 and clinic_id = $2 and professional_kind = $3
            and is_active`,
        [input.subjectProfessionalId, gate.clinic_id, expectedKind],
      );
      if (!professional.rows[0]) {
        throw new BadRequestException(
          'Professional biometric subject does not match encounter track',
        );
      }
    }
    return gate;
  }

  private requireActorId(): string {
    const actorId = this.requestContext.snapshot().actorId;
    if (!actorId)
      throw new BadRequestException('Authenticated actor is required');
    return actorId;
  }
}
