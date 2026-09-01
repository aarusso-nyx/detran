import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import type { Transaction } from '@stynx-nyx/data';

import type { MedicalExam } from './entities/medical-exam.entity.js';
import type { PsychologicalExam } from './entities/psychological-exam.entity.js';
import { MedicalExamRepository } from './repositories/medical-exam.repository.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};

export type MedicalResult =
  'APTO' | 'APTO_COM_RESTRICOES' | 'INAPTO_TEMPORARIO' | 'INAPTO';
export type PsychologicalResult = 'APTO' | 'INAPTO_TEMPORARIO' | 'INAPTO';

export interface CreateMedicalExamInput {
  encounterId: string;
  professionalId: string;
  performedAt?: string;
  validUntil?: string;
  validityReductionReason?: string;
  inaptitudeUntil?: string;
  data: Record<string, unknown>;
  result: MedicalResult;
}

export interface CreatePsychologicalExamInput {
  encounterId: string;
  professionalId: string;
  instrumentId: string;
  performedAt?: string;
  validUntil?: string;
  validityReductionReason?: string;
  inaptitudeUntil?: string;
  data: Record<string, unknown>;
  result: PsychologicalResult;
}

interface ExamGate {
  birth_date: string | null;
  professional_kind: string;
  user_id: string | null;
  encounter_status: string;
  biometric_passed: boolean | null;
}

const MEDICAL_RESULTS = new Set<MedicalResult>([
  'APTO',
  'APTO_COM_RESTRICOES',
  'INAPTO_TEMPORARIO',
  'INAPTO',
]);
const PSYCHOLOGICAL_RESULTS = new Set<PsychologicalResult>([
  'APTO',
  'INAPTO_TEMPORARIO',
  'INAPTO',
]);

export function medicalValidityYears(
  birthDate: string,
  performedAt: string,
): 10 | 5 | 3 {
  const birth = new Date(`${birthDate}T00:00:00.000Z`);
  const performed = new Date(performedAt);
  if (Number.isNaN(birth.valueOf()) || Number.isNaN(performed.valueOf())) {
    throw new BadRequestException(
      'Valid birth and performed dates are required',
    );
  }
  let age = performed.getUTCFullYear() - birth.getUTCFullYear();
  const beforeBirthday =
    performed.getUTCMonth() < birth.getUTCMonth() ||
    (performed.getUTCMonth() === birth.getUTCMonth() &&
      performed.getUTCDate() < birth.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age < 50 ? 10 : age < 70 ? 5 : 3;
}

function addUtcYears(date: string, years: number): string {
  const value = new Date(date);
  value.setUTCFullYear(value.getUTCFullYear() + years);
  return value.toISOString().slice(0, 10);
}

@Injectable()
export class ExamLifecycleService {
  constructor(
    private readonly medicalExams: MedicalExamRepository,
    private readonly requestContext: RequestContext,
  ) {}

  createMedical(input: CreateMedicalExamInput): Promise<MedicalExam> {
    if (!MEDICAL_RESULTS.has(input.result)) {
      throw new BadRequestException('Unsupported federal medical result');
    }
    this.requireInaptitudePeriod(input.result, input.inaptitudeUntil);
    return this.medicalExams.transaction(async (transaction) => {
      const tx = transaction as SqlTransaction;
      const performedAt = input.performedAt ?? new Date().toISOString();
      const gate = await this.requireExamGate(
        tx,
        input.encounterId,
        input.professionalId,
        'MEDICAL',
      );
      if (!gate.birth_date) {
        throw new BadRequestException(
          'Patient birth date is required to calculate exam validity',
        );
      }
      const statutoryValidUntil = addUtcYears(
        performedAt,
        medicalValidityYears(gate.birth_date, performedAt),
      );
      const validUntil = input.validUntil ?? statutoryValidUntil;
      if (validUntil > statutoryValidUntil) {
        throw new BadRequestException(
          'Medical validity cannot exceed the statutory age band',
        );
      }
      if (
        validUntil < statutoryValidUntil &&
        !input.validityReductionReason?.trim()
      ) {
        throw new BadRequestException(
          'Reduced medical validity requires the examiner reason',
        );
      }
      try {
        const result = await tx.query<MedicalExam & Record<string, unknown>>(
          `insert into ch.medical_exam
            (encounter_id, professional_id, performed_at,
             statutory_valid_until, valid_until, inaptitude_until,
             validity_reduction_reason,
             data, result)
           values ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9)
           returning *`,
          [
            input.encounterId,
            input.professionalId,
            performedAt,
            statutoryValidUntil,
            validUntil,
            input.inaptitudeUntil ?? null,
            input.validityReductionReason?.trim() ?? null,
            JSON.stringify(input.data),
            input.result,
          ],
        );
        return result.rows[0] as MedicalExam;
      } catch (error) {
        this.rethrowDuplicate(error, 'Medical exam already recorded');
      }
    });
  }

  createPsychological(
    input: CreatePsychologicalExamInput,
  ): Promise<PsychologicalExam> {
    if (!PSYCHOLOGICAL_RESULTS.has(input.result)) {
      throw new BadRequestException('Unsupported federal psychological result');
    }
    this.requireInaptitudePeriod(input.result, input.inaptitudeUntil);
    if (input.validUntil && !input.validityReductionReason?.trim()) {
      throw new BadRequestException(
        'Reduced psychological validity requires the examiner reason',
      );
    }
    return this.medicalExams.transaction(async (transaction) => {
      const tx = transaction as SqlTransaction;
      const performedAt = input.performedAt ?? new Date().toISOString();
      await this.requireExamGate(
        tx,
        input.encounterId,
        input.professionalId,
        'PSYCH',
      );
      const instrument = await tx.query<{ id: string }>(
        `select id from ch.psych_instrument
          where id = $1
            and is_active
            and satepsi_status = 'FAVORABLE'
            and valid_from <= $2::date
            and (valid_to is null or valid_to >= $2::date)`,
        [input.instrumentId, performedAt],
      );
      if (!instrument.rows[0]) {
        throw new BadRequestException(
          'Psychological instrument must have a favorable SATEPSI opinion',
        );
      }
      try {
        const result = await tx.query<
          PsychologicalExam & Record<string, unknown>
        >(
          `insert into ch.psychological_exam
            (encounter_id, professional_id, instrument_id, performed_at,
             valid_until, inaptitude_until, validity_reduction_reason,
             data, result)
           values ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9)
           returning *`,
          [
            input.encounterId,
            input.professionalId,
            input.instrumentId,
            performedAt,
            input.validUntil ?? null,
            input.inaptitudeUntil ?? null,
            input.validityReductionReason?.trim() ?? null,
            JSON.stringify(input.data),
            input.result,
          ],
        );
        return result.rows[0] as PsychologicalExam;
      } catch (error) {
        this.rethrowDuplicate(error, 'Psychological exam already recorded');
      }
    });
  }

  private async requireExamGate(
    tx: SqlTransaction,
    encounterId: string,
    professionalId: string,
    kind: 'MEDICAL' | 'PSYCH',
  ): Promise<ExamGate> {
    const actorId = this.requestContext.snapshot().actorId;
    const result = await tx.query<ExamGate>(
      `select patient.birth_date,
              professional.professional_kind,
              professional.user_id,
              encounter.status as encounter_status,
              exists (
                select 1 from ch.biometric_check biometric
                 where biometric.encounter_id = encounter.id
                   and biometric.kind = $3
                   and biometric.subject_patient_id = patient.id
                   and (
                     biometric.passed
                     or exists (
                       select 1 from ch.biometric_exception exception
                        where exception.biometric_check_id = biometric.id
                          and exception.encounter_id = encounter.id
                          and exception.scope = $3
                          and exception.status = 'APPROVED'
                          and exception.expires_at > now()
                     )
                   )
              ) as biometric_passed
         from ch.encounter encounter
         join ch.patient patient on patient.id = encounter.patient_id
         join ch.professional professional on professional.id = $2
        where encounter.id = $1`,
      [encounterId, professionalId, kind],
    );
    const gate = result.rows[0];
    const requiredProfessionalKind =
      kind === 'MEDICAL' ? 'MEDICO' : 'PSICOLOGO';
    if (!gate || gate.encounter_status !== 'IN_PROGRESS') {
      throw new BadRequestException(
        'Encounter is not ready for exam recording',
      );
    }
    if (
      !actorId ||
      gate.user_id !== actorId ||
      gate.professional_kind !== requiredProfessionalKind
    ) {
      throw new BadRequestException(
        'Exam must be recorded by its responsible professional',
      );
    }
    if (!gate.biometric_passed) {
      throw new BadRequestException(
        `Biometric validation for ${kind.toLowerCase()} exam is required`,
      );
    }
    return gate;
  }

  private rethrowDuplicate(error: unknown, message: string): never {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === '23505'
    ) {
      throw new ConflictException(message);
    }
    throw error;
  }

  private requireInaptitudePeriod(
    result: MedicalResult | PsychologicalResult,
    inaptitudeUntil: string | undefined,
  ): void {
    if (result === 'INAPTO_TEMPORARIO' && !inaptitudeUntil) {
      throw new BadRequestException(
        'Temporary inaptitude requires an explicit end date',
      );
    }
    if (result !== 'INAPTO_TEMPORARIO' && inaptitudeUntil) {
      throw new BadRequestException(
        'Inaptitude end date is only valid for temporary inaptitude',
      );
    }
  }
}
