import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import type { Transaction } from '@stynx-nyx/data';

import type { RetentionCase } from './entities/retention-case.entity.js';
import type { RetentionDisposition } from './entities/retention-disposition.entity.js';
import type { RetentionHold } from './entities/retention-hold.entity.js';
import { RetentionCaseRepository } from './repositories/retention-case.repository.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};

export type RetentionDestination = 'RETURN' | 'EXTEND' | 'DELETE';

@Injectable()
export class RetentionLifecycleService {
  constructor(
    private readonly cases: RetentionCaseRepository,
    private readonly requestContext: RequestContext,
  ) {}

  assess(patientId: string): Promise<RetentionCase> {
    const actorId = this.requireActor();
    return this.cases.transaction(async (transaction) => {
      const tx = transaction as SqlTransaction;
      const assessment = await tx.query<{
        birth_date: string | null;
        last_record_at: string;
        eligible_after: string;
        has_active_hold: boolean;
        floor_elapsed: boolean;
      }>(
        `select patient.birth_date,
                timeline.last_record_at,
                (timeline.last_record_at::date + interval '20 years')::date as eligible_after,
                exists (
                  select 1
                    from ch.retention_case existing_case
                    join ch.retention_hold hold
                      on hold.retention_case_id = existing_case.id
                     and hold.status = 'ACTIVE'
                   where existing_case.patient_id = patient.id
                ) as has_active_hold,
                current_date >= (timeline.last_record_at::date + interval '20 years')::date
                  as floor_elapsed
           from ch.patient patient
           cross join lateral (
             select max(recorded_at) as last_record_at
               from (
                 select patient.created_at as recorded_at
                 union all select patient.updated_at
                 union all
                 select encounter.created_at from ch.encounter encounter
                  where encounter.patient_id = patient.id
                 union all
                 select encounter.updated_at from ch.encounter encounter
                  where encounter.patient_id = patient.id
                 union all
                 select encounter.closed_at from ch.encounter encounter
                  where encounter.patient_id = patient.id
                 union all
                 select report.created_at
                   from ch.report report
                   join ch.encounter encounter on encounter.id = report.encounter_id
                  where encounter.patient_id = patient.id
                 union all
                 select report.updated_at
                   from ch.report report
                   join ch.encounter encounter on encounter.id = report.encounter_id
                  where encounter.patient_id = patient.id
                 union all
                 select report.signed_at
                   from ch.report report
                   join ch.encounter encounter on encounter.id = report.encounter_id
                  where encounter.patient_id = patient.id
                 union all
                 select addendum.created_at
                   from ch.report_addendum addendum
                   join ch.report report on report.id = addendum.report_id
                   join ch.encounter encounter on encounter.id = report.encounter_id
                  where encounter.patient_id = patient.id
                 union all
                 select addendum.updated_at
                   from ch.report_addendum addendum
                   join ch.report report on report.id = addendum.report_id
                   join ch.encounter encounter on encounter.id = report.encounter_id
                  where encounter.patient_id = patient.id
                 union all
                 select addendum.signed_at
                   from ch.report_addendum addendum
                   join ch.report report on report.id = addendum.report_id
                   join ch.encounter encounter on encounter.id = report.encounter_id
                  where encounter.patient_id = patient.id
                 union all
                 select document.created_at from ch.clinical_document document
                  where document.patient_id = patient.id
                 union all
                 select document.updated_at from ch.clinical_document document
                  where document.patient_id = patient.id
               ) records
          ) timeline
          where patient.id = $1`,
        [patientId],
      );
      const row = assessment.rows[0];
      if (!row) throw new NotFoundException(`Patient ${patientId} not found`);

      const underage = this.isUnderage(row.birth_date);
      const blockReasons = [
        ...(!row.floor_elapsed ? ['TWENTY_YEAR_FLOOR'] : []),
        ...(underage ? ['UNDERAGE_LEGAL_REVIEW'] : []),
        ...(row.has_active_hold ? ['ACTIVE_LEGAL_HOLD'] : []),
        'PAdES_LTA_REQUIRED',
      ];
      const status =
        underage || row.has_active_hold
          ? 'LEGAL_REVIEW'
          : row.floor_elapsed
            ? 'ELIGIBLE_BLOCKED'
            : 'RETAINED';
      const result = await tx.query<RetentionCase & Record<string, unknown>>(
        `insert into ch.retention_case
          (patient_id, custodian, last_record_at, eligible_after,
           preservation_status, status, block_reasons, assessed_by, assessed_at)
         values ($1, 'PLATFORM', $2, $3, 'PAdES_LTA_REQUIRED', $4, $5::jsonb, $6, now())
         on conflict (tenant_id, patient_id) do update
           set last_record_at = excluded.last_record_at,
               eligible_after = excluded.eligible_after,
               preservation_status = excluded.preservation_status,
               status = excluded.status,
               block_reasons = excluded.block_reasons,
               assessed_by = excluded.assessed_by,
               assessed_at = excluded.assessed_at,
               updated_at = now()
         returning *`,
        [
          patientId,
          row.last_record_at,
          row.eligible_after,
          status,
          JSON.stringify(blockReasons),
          actorId,
        ],
      );
      return result.rows[0] as RetentionCase;
    });
  }

  imposeHold(retentionCaseId: string, reason: string): Promise<RetentionHold> {
    const actorId = this.requireActor();
    const normalizedReason = reason.trim();
    if (!normalizedReason)
      throw new BadRequestException('A legal-hold reason is required');
    return this.cases.transaction(async (transaction) => {
      const result = await (transaction as SqlTransaction).query<
        RetentionHold & Record<string, unknown>
      >(
        `insert into ch.retention_hold
          (retention_case_id, reason, status, imposed_by)
         select id, $2, 'ACTIVE', $3
           from ch.retention_case
          where id = $1
         returning *`,
        [retentionCaseId, normalizedReason, actorId],
      );
      if (!result.rows[0])
        throw new NotFoundException(
          `Retention case ${retentionCaseId} not found`,
        );
      return result.rows[0] as RetentionHold;
    });
  }

  releaseHold(holdId: string): Promise<RetentionHold> {
    const actorId = this.requireActor();
    return this.cases.transaction(async (transaction) => {
      const result = await (transaction as SqlTransaction).query<
        RetentionHold & Record<string, unknown>
      >(
        `update ch.retention_hold
            set status = 'RELEASED', released_by = $2, released_at = now(), updated_at = now()
          where id = $1 and status = 'ACTIVE'
         returning *`,
        [holdId, actorId],
      );
      if (!result.rows[0])
        throw new BadRequestException('Active retention hold not found');
      return result.rows[0] as RetentionHold;
    });
  }

  propose(
    retentionCaseId: string,
    destination: RetentionDestination,
    justification: string,
  ): Promise<RetentionDisposition> {
    const actorId = this.requireActor();
    if (!['RETURN', 'EXTEND', 'DELETE'].includes(destination)) {
      throw new BadRequestException('Invalid retention destination');
    }
    const normalizedJustification = justification.trim();
    if (!normalizedJustification)
      throw new BadRequestException('A disposition justification is required');
    return this.cases.transaction(async (transaction) => {
      const tx = transaction as SqlTransaction;
      const gate = await tx.query<{
        status: string;
        preservation_status: string;
        has_active_hold: boolean;
      }>(
        `select retention_case.status,
                retention_case.preservation_status,
                exists (
                  select 1 from ch.retention_hold hold
                   where hold.retention_case_id = retention_case.id
                     and hold.status = 'ACTIVE'
                ) as has_active_hold
           from ch.retention_case
          where retention_case.id = $1`,
        [retentionCaseId],
      );
      const row = gate.rows[0];
      if (!row) throw new NotFoundException('Retention case not found');
      if (row.status !== 'ELIGIBLE_BLOCKED' || row.has_active_hold) {
        throw new BadRequestException(
          'Only floor-eligible records without legal holds may enter disposition review',
        );
      }
      const proposalStatus =
        destination === 'DELETE' &&
        row.preservation_status !== 'PAdES_LTA_READY'
          ? 'BLOCKED'
          : 'PROPOSED';
      const result = await tx.query<
        RetentionDisposition & Record<string, unknown>
      >(
        `insert into ch.retention_disposition
          (retention_case_id, destination, status, justification,
           proposed_by, proposed_at, return_offered_at, reviewed_by, reviewed_at)
         values ($1, $2, $3, $4, $5, now(), now(),
                 case when $3 = 'BLOCKED' then $5 else null end,
                 case when $3 = 'BLOCKED' then now() else null end)
         returning *`,
        [
          retentionCaseId,
          destination,
          proposalStatus,
          normalizedJustification,
          actorId,
        ],
      );
      return result.rows[0] as RetentionDisposition;
    });
  }

  review(dispositionId: string): Promise<RetentionDisposition> {
    const actorId = this.requireActor();
    return this.cases.transaction(async (transaction) => {
      const result = await (transaction as SqlTransaction).query<
        RetentionDisposition & Record<string, unknown>
      >(
        `update ch.retention_disposition
            set status = 'DPO_REVIEWED', reviewed_by = $2,
                reviewed_at = now(), updated_at = now()
          where id = $1 and status = 'PROPOSED' and destination <> 'DELETE'
         returning *`,
        [dispositionId, actorId],
      );
      if (!result.rows[0]) {
        throw new BadRequestException(
          'Disposition is unavailable for DPO review; deletion remains disabled',
        );
      }
      return result.rows[0] as RetentionDisposition;
    });
  }

  private requireActor(): string {
    const actorId = this.requestContext.snapshot().actorId;
    if (!actorId)
      throw new BadRequestException('Authenticated actor is required');
    return actorId;
  }

  private isUnderage(birthDate: string | null): boolean {
    if (!birthDate) return true;
    const birth = new Date(`${birthDate}T00:00:00.000Z`);
    const now = new Date();
    let age = now.getUTCFullYear() - birth.getUTCFullYear();
    const birthdayPending =
      now.getUTCMonth() < birth.getUTCMonth() ||
      (now.getUTCMonth() === birth.getUTCMonth() &&
        now.getUTCDate() < birth.getUTCDate());
    if (birthdayPending) age -= 1;
    return age < 18;
  }
}
