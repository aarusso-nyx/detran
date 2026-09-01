import { createHash, randomBytes, randomUUID } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import type { Transaction } from '@stynx-nyx/data';

import { ProfessionalScheduleRepository } from './repositories/professional-schedule.repository.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};

type Track = 'MEDICAL' | 'PSYCH';

interface PoolCandidate {
  clinic_id: string;
  professional_id: string;
  professional_kind: 'MEDICO' | 'PSICOLOGO';
  assignment_count: number;
}

interface Selection {
  clinicId: string;
  byTrack: Record<Track, PoolCandidate | undefined>;
  pool: PoolCandidate[];
}

export interface CreateDistributedAppointmentInput {
  encounterId: string;
  regionCode: string;
  scheduledAt: string;
}

export interface DistributedAppointment {
  appointmentId: string;
  clinicId: string;
  assignments: Array<{ track: Track; professionalId: string }>;
}

@Injectable()
export class AppointmentDistributionService {
  constructor(
    private readonly schedules: ProfessionalScheduleRepository,
    private readonly requestContext: RequestContext,
  ) {}

  create(
    input: CreateDistributedAppointmentInput,
  ): Promise<DistributedAppointment> {
    const actorId = this.requireActorId();
    const scheduledAt = this.requireScheduledAt(input.scheduledAt);
    const seed = randomBytes(32).toString('hex');
    return this.schedules
      .transaction(async (transaction) => {
        const tx = transaction as SqlTransaction;
        const gate = await this.loadEligibilityGate(tx, input.encounterId);
        if (!gate.exam_eligible) {
          throw new ConflictException(
            `RENACH exam eligibility blocks scheduling: ${gate.eligibility_reasons.join('; ') || 'no reason supplied'}`,
          );
        }
        const tracks: Track[] = gate.requires_psychological
          ? ['MEDICAL', 'PSYCH']
          : ['MEDICAL'];
        const pool = await this.loadPool(
          tx,
          input.regionCode,
          scheduledAt,
          tracks,
        );
        const selection = this.select(pool, tracks, seed);
        const appointmentId = randomUUID();
        const primary = selection.byTrack.MEDICAL ?? selection.byTrack.PSYCH;
        await tx.query(
          `insert into ch.appointment
            (id, clinic_id, patient_id, professional_id, scheduled_at,
             status, created_by)
           values ($1, $2, $3, $4, $5, 'SCHEDULED', $6)`,
          [
            appointmentId,
            selection.clinicId,
            gate.patient_id,
            primary?.professional_id,
            scheduledAt,
            actorId,
          ],
        );
        await this.persistDraws(tx, {
          appointmentId,
          regionCode: input.regionCode,
          scheduledAt,
          seed,
          actorId,
          tracks,
          selection,
        });
        return this.present(appointmentId, selection, tracks);
      })
      .catch((error: unknown) => {
        if (isAppointmentSlotConflict(error)) {
          throw new ConflictException(
            'Appointment already exists for this patient, clinic and time',
          );
        }
        throw error;
      });
  }

  private async loadEligibilityGate(
    tx: SqlTransaction,
    encounterId: string,
  ): Promise<{
    patient_id: string;
    exam_eligible: boolean;
    requires_psychological: boolean;
    eligibility_reasons: string[];
  }> {
    const result = await tx.query<{
      patient_id: string;
      exam_eligible: boolean;
      requires_psychological: boolean;
      eligibility_reasons: string[];
    }>(
      `select patient_id, exam_eligible, requires_psychological,
              eligibility_reasons
         from ch.encounter
        where id = $1 and renach_process_key is not null
          and eligibility_checked_at is not null
        for share`,
      [encounterId],
    );
    const gate = result.rows[0];
    if (!gate) {
      throw new ConflictException(
        'Authoritative RENACH exam eligibility is required before scheduling',
      );
    }
    return gate;
  }

  reroll(
    appointmentId: string,
    reason: string,
  ): Promise<DistributedAppointment> {
    const actorId = this.requireActorId();
    if (!reason.trim()) {
      throw new BadRequestException('Reroll requires a recorded reason');
    }
    const seed = randomBytes(32).toString('hex');
    return this.schedules.transaction(async (transaction) => {
      const tx = transaction as SqlTransaction;
      const current = await tx.query<{
        draw_id: string;
        track: Track;
        region_code: string;
        requested_at: string;
        selected_clinic_id: string;
        status: string;
      }>(
        `select draw.id as draw_id, draw.track, draw.region_code,
                draw.requested_at, draw.selected_clinic_id,
                appointment.status
           from ch.appointment_assignment_draw draw
           join ch.appointment appointment on appointment.id = draw.appointment_id
          where draw.appointment_id = $1 and draw.superseded_at is null
          order by draw.track`,
        [appointmentId],
      );
      if (!current.rows.length)
        throw new NotFoundException('Appointment draw not found');
      if (current.rows.some((row) => row.status !== 'SCHEDULED')) {
        throw new ConflictException(
          'Only scheduled appointments may be rerolled',
        );
      }
      const tracks = current.rows.map((row) => row.track);
      const regionCode = current.rows[0].region_code;
      const scheduledAt = current.rows[0].requested_at;
      const excludedClinic = current.rows[0].selected_clinic_id;
      const pool = await this.loadPool(
        tx,
        regionCode,
        scheduledAt,
        tracks,
        excludedClinic,
      );
      const selection = this.select(pool, tracks, seed);
      await tx.query(
        `update ch.appointment_assignment_draw
            set superseded_at = now(), updated_at = now()
          where appointment_id = $1 and superseded_at is null`,
        [appointmentId],
      );
      const primary = selection.byTrack.MEDICAL ?? selection.byTrack.PSYCH;
      await tx.query(
        `update ch.appointment
            set clinic_id = $2, professional_id = $3, updated_by = $4,
                updated_at = now()
          where id = $1 and status = 'SCHEDULED'`,
        [appointmentId, selection.clinicId, primary?.professional_id, actorId],
      );
      await this.persistDraws(tx, {
        appointmentId,
        regionCode,
        scheduledAt,
        seed,
        actorId,
        tracks,
        selection,
        rerollReason: reason.trim(),
        rerollIds: Object.fromEntries(
          current.rows.map((row) => [row.track, row.draw_id]),
        ),
      });
      return this.present(appointmentId, selection, tracks);
    });
  }

  markNoShow(appointmentId: string): Promise<void> {
    return this.transition(
      appointmentId,
      ['SCHEDULED', 'CHECKED_IN'],
      'NO_SHOW',
    );
  }

  cancel(appointmentId: string): Promise<void> {
    return this.transition(appointmentId, ['SCHEDULED'], 'CANCELLED');
  }

  private async loadPool(
    tx: SqlTransaction,
    regionCode: string,
    scheduledAt: string,
    tracks: Track[],
    excludedClinic?: string,
  ): Promise<PoolCandidate[]> {
    const kinds = tracks.map((track) =>
      track === 'MEDICAL' ? 'MEDICO' : 'PSICOLOGO',
    );
    const result = await tx.query<PoolCandidate>(
      `select clinic.id as clinic_id,
              professional.id as professional_id,
              professional.professional_kind,
              count(history.id)::integer as assignment_count
         from ch.professional_schedule schedule
         join ch.clinic clinic
           on clinic.id = schedule.clinic_id and clinic.is_active
         join ch.professional professional
           on professional.id = schedule.professional_id
          and professional.clinic_id = clinic.id and professional.is_active
         left join ch.appointment_assignment_draw history
           on history.selected_professional_id = professional.id
          and history.created_at >= now() - interval '90 days'
        where clinic.region_code = $1
          and schedule.is_active
          and schedule.weekday = extract(dow from $2::timestamptz)::integer
          and schedule.start_time <= $2::timestamptz::time
          and schedule.end_time > $2::timestamptz::time
          and schedule.valid_from <= $2::date
          and (schedule.valid_to is null or schedule.valid_to >= $2::date)
          and professional.professional_kind = any($3::text[])
          and ($4::uuid is null or clinic.id <> $4::uuid)
        group by clinic.id, professional.id, professional.professional_kind`,
      [regionCode, scheduledAt, kinds, excludedClinic ?? null],
    );
    return result.rows;
  }

  private select(
    pool: PoolCandidate[],
    tracks: Track[],
    seed: string,
  ): Selection {
    const byClinic = new Map<string, PoolCandidate[]>();
    for (const candidate of pool) {
      const candidates = byClinic.get(candidate.clinic_id) ?? [];
      candidates.push(candidate);
      byClinic.set(candidate.clinic_id, candidates);
    }
    const eligible = [...byClinic.entries()].filter(([, candidates]) =>
      tracks.every((track) =>
        candidates.some(
          (candidate) =>
            candidate.professional_kind ===
            (track === 'MEDICAL' ? 'MEDICO' : 'PSICOLOGO'),
        ),
      ),
    );
    if (!eligible.length) {
      throw new ConflictException(
        'No eligible clinic and professional pool for requested region and time',
      );
    }
    eligible.sort(([leftId, left], [rightId, right]) => {
      const count =
        left.reduce((sum, item) => sum + item.assignment_count, 0) -
        right.reduce((sum, item) => sum + item.assignment_count, 0);
      return (
        count ||
        this.score(seed, leftId).localeCompare(this.score(seed, rightId))
      );
    });
    const [clinicId, clinicPool] = eligible[0];
    const byTrack: Record<Track, PoolCandidate | undefined> = {
      MEDICAL: undefined,
      PSYCH: undefined,
    };
    for (const track of tracks) {
      const kind = track === 'MEDICAL' ? 'MEDICO' : 'PSICOLOGO';
      byTrack[track] = clinicPool
        .filter((candidate) => candidate.professional_kind === kind)
        .sort(
          (left, right) =>
            left.assignment_count - right.assignment_count ||
            this.score(seed, left.professional_id).localeCompare(
              this.score(seed, right.professional_id),
            ),
        )[0];
    }
    return { clinicId, byTrack, pool };
  }

  private async persistDraws(
    tx: SqlTransaction,
    input: {
      appointmentId: string;
      regionCode: string;
      scheduledAt: string;
      seed: string;
      actorId: string;
      tracks: Track[];
      selection: Selection;
      rerollReason?: string;
      rerollIds?: Partial<Record<Track, string>>;
    },
  ): Promise<void> {
    for (const track of input.tracks) {
      const selected = input.selection.byTrack[track];
      if (!selected) throw new Error(`Missing selected ${track} professional`);
      await tx.query(
        `insert into ch.appointment_assignment_draw
          (appointment_id, track, region_code, requested_at, seed_hex,
           considered_pool, selected_clinic_id, selected_professional_id,
           reroll_of, reroll_reason, drawn_by)
         values ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9, $10, $11)`,
        [
          input.appointmentId,
          track,
          input.regionCode,
          input.scheduledAt,
          input.seed,
          JSON.stringify(input.selection.pool),
          input.selection.clinicId,
          selected.professional_id,
          input.rerollIds?.[track] ?? null,
          input.rerollReason ?? null,
          input.actorId,
        ],
      );
    }
  }

  private transition(
    appointmentId: string,
    from: string[],
    to: 'NO_SHOW' | 'CANCELLED',
  ): Promise<void> {
    const actorId = this.requireActorId();
    return this.schedules.transaction(async (transaction) => {
      const tx = transaction as SqlTransaction;
      const result = await tx.query<{ id: string }>(
        `update ch.appointment set status = $2, updated_by = $3,
                updated_at = now()
          where id = $1 and status = any($4::text[]) returning id`,
        [appointmentId, to, actorId, from],
      );
      if (!result.rows[0]) {
        throw new ConflictException(`Appointment cannot transition to ${to}`);
      }
    });
  }

  private present(
    appointmentId: string,
    selection: Selection,
    tracks: Track[],
  ): DistributedAppointment {
    return {
      appointmentId,
      clinicId: selection.clinicId,
      assignments: tracks.map((track) => ({
        track,
        professionalId: selection.byTrack[track]!.professional_id,
      })),
    };
  }

  private score(seed: string, value: string): string {
    return createHash('sha256').update(`${seed}:${value}`).digest('hex');
  }

  private requireScheduledAt(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.valueOf()) || date <= new Date()) {
      throw new BadRequestException('Appointment time must be in the future');
    }
    return date.toISOString();
  }

  private requireActorId(): string {
    const actorId = this.requestContext.snapshot().actorId;
    if (!actorId)
      throw new BadRequestException('Authenticated actor is required');
    return actorId;
  }
}

function isAppointmentSlotConflict(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === '23505' &&
    'constraint' in error &&
    (error as { constraint?: unknown }).constraint === 'ux_ch_appointment_slot'
  );
}
