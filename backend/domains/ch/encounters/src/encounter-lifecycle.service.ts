import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Transaction } from '@stynx-nyx/data';

import type { Encounter } from './entities/encounter.entity.js';
import { EncounterRepository } from './repositories/encounter.repository.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};

interface AppointmentGate {
  id: string;
  clinic_id: string;
  patient_id: string;
  status: string;
}

export interface OpenEncounterInput {
  patientId: string;
  clinicId?: string;
  appointmentId?: string;
  renachProcessKey?: string;
  renachProcessType?:
    'FIRST_LICENSE' | 'RENEWAL' | 'CATEGORY_CHANGE' | 'CATEGORY_ADDITION';
  currentCategory?: string;
  requestedCategory?: string;
}

const CANCELLABLE_STATUSES = new Set([
  'OPEN',
  'IN_PROGRESS',
  'READY_FOR_SIGNATURE',
]);

@Injectable()
export class EncounterLifecycleService {
  constructor(private readonly encounters: EncounterRepository) {}

  open(input: OpenEncounterInput): Promise<Encounter> {
    if (Boolean(input.renachProcessKey) !== Boolean(input.renachProcessType)) {
      throw new BadRequestException(
        'RENACH process key and process type must be supplied together',
      );
    }
    return this.encounters.transaction(async (transaction) => {
      const tx = transaction as SqlTransaction;
      const appointment = await this.resolveCheckedInAppointment(tx, input);
      if (appointment.status === 'SCHEDULED') {
        await tx.query(
          `update ch.appointment set status = 'CHECKED_IN', updated_at = now()
            where id = $1 and status = 'SCHEDULED'`,
          [appointment.id],
        );
      }
      const result = await tx.query<Encounter & Record<string, unknown>>(
        `insert into ch.encounter
          (clinic_id, patient_id, appointment_id, renach_process_key,
           renach_process_type, current_category, requested_category, status)
         values ($1, $2, $3, $4, $5, $6, $7, 'OPEN')
         returning *`,
        [
          appointment.clinic_id,
          input.patientId,
          appointment.id,
          input.renachProcessKey ?? null,
          input.renachProcessType ?? null,
          input.currentCategory ?? null,
          input.requestedCategory ?? null,
        ],
      );
      const encounter = result.rows[0];
      if (!encounter) throw new Error('Encounter insert returned no row');
      return encounter;
    });
  }

  cancel(id: string, reason: string): Promise<Encounter> {
    const normalizedReason = reason.trim();
    if (!normalizedReason) {
      throw new BadRequestException(
        'Encounter cancellation reason is required',
      );
    }

    return this.encounters.transaction(async (transaction) => {
      const tx = transaction as SqlTransaction;
      const current = await tx.query<{ status: string }>(
        'select status from ch.encounter where id = $1 for update',
        [id],
      );
      const status = current.rows[0]?.status;
      if (!status) throw new NotFoundException(`Encounter ${id} not found`);
      if (!CANCELLABLE_STATUSES.has(status)) {
        throw new BadRequestException(
          `Cannot cancel encounter in status '${status}'`,
        );
      }

      const result = await tx.query<Encounter & Record<string, unknown>>(
        `update ch.encounter
            set status = 'CANCELLED',
                cancelled_at = now(),
                cancel_reason = $2,
                updated_at = now()
          where id = $1
          returning *`,
        [id, normalizedReason],
      );
      const encounter = result.rows[0];
      if (!encounter) throw new NotFoundException(`Encounter ${id} not found`);
      return encounter;
    });
  }

  private async resolveCheckedInAppointment(
    tx: SqlTransaction,
    input: OpenEncounterInput,
  ): Promise<AppointmentGate> {
    const result = input.appointmentId
      ? await tx.query<AppointmentGate>(
          `select id, clinic_id, patient_id, status
             from ch.appointment
            where id = $1
              and exists (
                select 1 from ch.biometric_check biometric
                 where biometric.appointment_id = ch.appointment.id
                   and biometric.kind = 'CHECKIN'
                   and (
                     biometric.passed
                     or exists (
                       select 1 from ch.biometric_exception exception
                        where exception.biometric_check_id = biometric.id
                          and exception.appointment_id = ch.appointment.id
                          and exception.scope = 'CHECKIN'
                          and exception.status = 'APPROVED'
                          and exception.expires_at > now()
                     )
                   )
              )
            limit 1`,
          [input.appointmentId],
        )
      : await tx.query<AppointmentGate>(
          `select id, clinic_id, patient_id, status
             from ch.appointment
            where patient_id = $1 and status in ('SCHEDULED','CHECKED_IN')
              and exists (
                select 1 from ch.biometric_check biometric
                 where biometric.appointment_id = ch.appointment.id
                   and biometric.kind = 'CHECKIN'
                   and (
                     biometric.passed
                     or exists (
                       select 1 from ch.biometric_exception exception
                        where exception.biometric_check_id = biometric.id
                          and exception.appointment_id = ch.appointment.id
                          and exception.scope = 'CHECKIN'
                          and exception.status = 'APPROVED'
                          and exception.expires_at > now()
                     )
                   )
              )
            order by scheduled_at desc
            limit 1`,
          [input.patientId],
        );
    const appointment = result.rows[0];
    if (
      !appointment ||
      appointment.patient_id !== input.patientId ||
      !['SCHEDULED', 'CHECKED_IN'].includes(appointment.status) ||
      (input.clinicId && appointment.clinic_id !== input.clinicId)
    ) {
      throw new BadRequestException(
        'Biometric check-in is required before opening encounter',
      );
    }
    return appointment;
  }
}
