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
    return this.encounters.transaction(async (transaction) => {
      const tx = transaction as SqlTransaction;
      const appointment = await this.resolveCheckedInAppointment(tx, input);
      const result = await tx.query<Encounter & Record<string, unknown>>(
        `insert into ch.encounter
          (clinic_id, patient_id, appointment_id, renach_process_key, status)
         values ($1, $2, $3, $4, 'OPEN')
         returning *`,
        [
          appointment.clinic_id,
          input.patientId,
          appointment.id,
          input.renachProcessKey ?? null,
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
                   and biometric.passed
              )
            limit 1`,
          [input.appointmentId],
        )
      : await tx.query<AppointmentGate>(
          `select id, clinic_id, patient_id, status
             from ch.appointment
            where patient_id = $1 and status = 'CHECKED_IN'
              and exists (
                select 1 from ch.biometric_check biometric
                 where biometric.appointment_id = ch.appointment.id
                   and biometric.kind = 'CHECKIN'
                   and biometric.passed
              )
            order by scheduled_at desc
            limit 1`,
          [input.patientId],
        );
    const appointment = result.rows[0];
    if (
      !appointment ||
      appointment.patient_id !== input.patientId ||
      appointment.status !== 'CHECKED_IN' ||
      (input.clinicId && appointment.clinic_id !== input.clinicId)
    ) {
      throw new BadRequestException(
        'Biometric check-in is required before opening encounter',
      );
    }
    return appointment;
  }
}
