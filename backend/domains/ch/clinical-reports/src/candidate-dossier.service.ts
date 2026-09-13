import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import type { Transaction } from '@stynx-nyx/data';

import type { FeedbackRequest } from './entities/feedback-request.entity.js';
import { legalResultLabel } from './report-lifecycle.service.js';
import { ReportRepository } from './repositories/report.repository.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};

export interface CandidateDossier {
  encounter_id: string;
  encounter_status: string;
  patient_id: string;
  patient_name: string;
  reports: Array<Record<string, unknown>>;
  feedback_requests: Array<Record<string, unknown>>;
}

export interface ScheduleFeedbackInput {
  scheduledAt: string;
}

export interface CompleteFeedbackInput {
  summary: string;
}

interface FeedbackSource {
  report_id: string;
  encounter_id: string;
  patient_id: string;
  professional_id: string;
  result: string;
}

@Injectable()
export class CandidateDossierService {
  constructor(
    private readonly reports: ReportRepository,
    private readonly requestContext: RequestContext,
  ) {}

  getOwn(encounterId: string): Promise<CandidateDossier> {
    const actorId = this.requireActorId();
    return this.reports.transaction(async (transaction) => {
      const tx = transaction as SqlTransaction;
      const result = await tx.query<CandidateDossier>(
        `select encounter.id as encounter_id,
                encounter.status as encounter_status,
                patient.id as patient_id, patient.name as patient_name,
                coalesce((
                  select jsonb_agg(jsonb_build_object(
                    'reportId', report.id,
                    'kind', report.kind,
                    'resultCode', coalesce(amended.result, medical.result, psych.result),
                    'resultLabel', case coalesce(amended.result, medical.result, psych.result)
                      when 'APTO' then 'Apto'
                      when 'APTO_COM_RESTRICOES' then 'Apto com restrições'
                      when 'INAPTO_TEMPORARIO' then 'Inapto temporário'
                      when 'INAPTO' then 'Inapto'
                    end,
                    'validUntil', coalesce(amended.valid_until, medical.valid_until::text, psych.valid_until::text),
                    'inaptitudeUntil', coalesce(amended.inaptitude_until, medical.inaptitude_until::text, psych.inaptitude_until::text),
                    'storageDocumentId', report.storage_document_id,
                    'artifactSha256', report.artifact_sha256,
                    'signedAt', report.signed_at,
                    'addenda', coalesce((
                      select jsonb_agg(jsonb_build_object(
                        'id', addendum.id,
                        'reason', addendum.reason,
                        'content', addendum.content,
                        'storageDocumentId', addendum.storage_document_id,
                        'artifactSha256', addendum.artifact_sha256,
                        'signedAt', addendum.signed_at
                      ) order by addendum.signed_at)
                        from ch.report_addendum addendum
                       where addendum.report_id = report.id
                         and addendum.status = 'SIGNED'
                    ), '[]'::jsonb)
                  ) order by report.signed_at)
                    from ch.report report
                    left join ch.medical_exam medical
                      on report.kind = 'MEDICAL'
                     and medical.id = report.source_exam_id
                    left join ch.psychological_exam psych
                      on report.kind = 'PSYCH'
                     and psych.id = report.source_exam_id
                    left join lateral (
                      select addendum.content->>'result' as result,
                             addendum.content->>'validUntil' as valid_until,
                             addendum.content->>'inaptitudeUntil' as inaptitude_until
                        from ch.report_addendum addendum
                       where addendum.report_id = report.id
                         and addendum.status = 'SIGNED'
                         and addendum.content ? 'result'
                       order by addendum.signed_at desc
                       limit 1
                    ) amended on true
                   where report.encounter_id = encounter.id
                ), '[]'::jsonb) as reports,
                coalesce((
                  select jsonb_agg(jsonb_build_object(
                    'id', feedback.id,
                    'reportId', feedback.report_id,
                    'status', feedback.status,
                    'resultLabel', feedback.legal_result_label,
                    'requestedAt', feedback.requested_at,
                    'scheduledAt', feedback.scheduled_at,
                    'completedAt', feedback.completed_at,
                    'completionSummary', feedback.completion_summary
                  ) order by feedback.requested_at)
                    from ch.feedback_request feedback
                   where feedback.encounter_id = encounter.id
                     and feedback.patient_id = patient.id
                ), '[]'::jsonb) as feedback_requests
           from ch.encounter encounter
           join ch.patient patient on patient.id = encounter.patient_id
          where encounter.id = $1 and patient.user_id = $2`,
        [encounterId, actorId],
      );
      const dossier = result.rows[0];
      if (!dossier) {
        throw new NotFoundException('Candidate dossier not found');
      }
      return dossier;
    });
  }

  requestFeedback(encounterId: string): Promise<FeedbackRequest> {
    const actorId = this.requireActorId();
    return this.reports.transaction(async (transaction) => {
      const tx = transaction as SqlTransaction;
      const source = await tx.query<FeedbackSource>(
        `select report.id as report_id, report.encounter_id,
                encounter.patient_id,
                report.signer_professional_id as professional_id,
                coalesce(amended.result, exam.result) as result
           from ch.report report
           join ch.encounter encounter on encounter.id = report.encounter_id
           join ch.patient patient on patient.id = encounter.patient_id
           join ch.psychological_exam exam
             on report.kind = 'PSYCH' and exam.id = report.source_exam_id
           left join lateral (
             select addendum.content->>'result' as result
               from ch.report_addendum addendum
              where addendum.report_id = report.id
                and addendum.status = 'SIGNED'
                and addendum.content ? 'result'
              order by addendum.signed_at desc
              limit 1
           ) amended on true
          where report.encounter_id = $1 and patient.user_id = $2
            and coalesce(amended.result, exam.result)
                in ('INAPTO_TEMPORARIO','INAPTO')
          order by report.signed_at desc
          limit 1`,
        [encounterId, actorId],
      );
      const row = source.rows[0];
      if (!row) {
        throw new NotFoundException(
          'Own adverse psychological report was not found',
        );
      }
      try {
        const inserted = await tx.query<
          FeedbackRequest & Record<string, unknown>
        >(
          `insert into ch.feedback_request
            (report_id, encounter_id, patient_id, professional_id,
             requested_by, legal_result_label, status, requested_at)
           values ($1, $2, $3, $4, $5, $6, 'REQUESTED', now())
           returning *`,
          [
            row.report_id,
            row.encounter_id,
            row.patient_id,
            row.professional_id,
            actorId,
            legalResultLabel(row.result),
          ],
        );
        return inserted.rows[0] as FeedbackRequest;
      } catch (error) {
        if (
          typeof error === 'object' &&
          error !== null &&
          'code' in error &&
          error.code === '23505'
        ) {
          throw new ConflictException('An active feedback request exists');
        }
        throw error;
      }
    });
  }

  scheduleFeedback(
    id: string,
    input: ScheduleFeedbackInput,
  ): Promise<FeedbackRequest> {
    const actorId = this.requireActorId();
    const scheduledAt = new Date(input.scheduledAt);
    if (
      Number.isNaN(scheduledAt.valueOf()) ||
      scheduledAt.valueOf() <= Date.now()
    ) {
      throw new BadRequestException('Feedback schedule must be in the future');
    }
    return this.updateProfessionalRequest(
      id,
      actorId,
      `set status = 'SCHEDULED', scheduled_at = $3, updated_at = now()`,
      [input.scheduledAt],
      'Feedback request is not schedulable by this professional',
    );
  }

  completeFeedback(
    id: string,
    input: CompleteFeedbackInput,
  ): Promise<FeedbackRequest> {
    const actorId = this.requireActorId();
    const summary = input.summary.trim();
    if (!summary) {
      throw new BadRequestException('Feedback completion summary is required');
    }
    return this.updateProfessionalRequest(
      id,
      actorId,
      `set status = 'COMPLETED', completed_at = now(),
           completion_summary = $3, updated_at = now()`,
      [summary],
      'Scheduled feedback request is not completable by this professional',
      'SCHEDULED',
      'and feedback.scheduled_at <= now()',
    );
  }

  private updateProfessionalRequest(
    id: string,
    actorId: string,
    setSql: string,
    extraValues: readonly unknown[],
    notFoundMessage: string,
    currentStatus = 'REQUESTED',
    additionalWhere = '',
  ): Promise<FeedbackRequest> {
    return this.reports.transaction(async (transaction) => {
      const tx = transaction as SqlTransaction;
      const result = await tx.query<FeedbackRequest & Record<string, unknown>>(
        `update ch.feedback_request feedback
            ${setSql}
           from ch.professional professional
          where feedback.id = $1 and feedback.status = $2
            and professional.id = feedback.professional_id
            and professional.user_id = $4
            ${additionalWhere}
          returning feedback.*`,
        [id, currentStatus, ...extraValues, actorId],
      );
      const request = result.rows[0];
      if (!request) throw new NotFoundException(notFoundMessage);
      return request;
    });
  }

  private requireActorId(): string {
    const actorId = this.requestContext.snapshot().actorId;
    if (!actorId)
      throw new BadRequestException('Authenticated actor is required');
    return actorId;
  }
}
