import { createHash } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import type { Transaction } from '@stynx-nyx/data';

import type { Report } from './entities/report.entity.js';
import type { ReportAddendum } from './entities/report-addendum.entity.js';
import {
  PadesSigningHttpAdapter,
  type ClinicalArtifactReceipt,
} from './pades-signing.http-adapter.js';
import { ReportRepository } from './repositories/report.repository.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};

export interface CreateReportInput {
  encounterId: string;
  kind: 'MEDICAL' | 'PSYCH';
  templateVersion: string;
}

export interface RequestAddendumInput {
  reason: string;
  content: Record<string, unknown>;
}

interface ReportPreflight {
  exam_id: string;
  exam_data: Record<string, unknown>;
  exam_result: string;
  professional_id: string;
  professional_name: string;
  professional_council: string;
  professional_user_id: string | null;
  professional_biometric_passed: boolean | null;
}

interface ExistingReport extends Report {
  content_sha256: string;
}

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalJson(item)).join(',')}]`;
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).sort(
      ([left], [right]) => left.localeCompare(right),
    );
    return `{${entries
      .map(([key, item]) => `${JSON.stringify(key)}:${canonicalJson(item)}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

export function contentSha256(value: unknown): string {
  return createHash('sha256').update(canonicalJson(value)).digest('hex');
}

@Injectable()
export class ReportLifecycleService {
  constructor(
    private readonly reports: ReportRepository,
    private readonly requestContext: RequestContext,
    private readonly signing: PadesSigningHttpAdapter,
  ) {}

  async create(input: CreateReportInput): Promise<Report> {
    const actorId = this.requireActorId();
    const preflight = await this.reports.transaction(async (transaction) => {
      const tx = transaction as SqlTransaction;
      return this.preflight(tx, input, actorId);
    });
    const content = {
      encounterId: input.encounterId,
      kind: input.kind,
      sourceExamId: preflight.exam_id,
      examResult: preflight.exam_result,
      examData: preflight.exam_data,
      templateVersion: input.templateVersion,
    };
    const hash = contentSha256(content);
    const existing = await this.findExisting(input.encounterId, input.kind);
    if (existing) {
      if (existing.content_sha256 === hash) return existing;
      throw new ConflictException(
        'A signed report already exists for this encounter and track',
      );
    }

    const receipt = await this.signing.renderAndSign({
      documentType: 'REPORT',
      contentSha256: hash,
      content,
      signer: {
        professionalId: preflight.professional_id,
        name: preflight.professional_name,
        council: preflight.professional_council,
      },
      minimumSignatureLevel: 'QUALIFIED',
    });

    return this.reports.transaction(async (transaction) => {
      const tx = transaction as SqlTransaction;
      const result = await tx.query<Report & Record<string, unknown>>(
        `insert into ch.report
          (encounter_id, kind, source_exam_id, content_sha256,
           storage_document_id, artifact_sha256, signer_professional_id,
           signer_name, signer_council, signature_level, signature_format,
           signed_at, tsa_time, certificate_validation_source,
           certificate_validation_status, certificate_validated_at)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
                 $12, $13, $14, $15, $16)
         returning *`,
        [
          input.encounterId,
          input.kind,
          preflight.exam_id,
          hash,
          receipt.storageDocumentId,
          receipt.artifactSha256,
          preflight.professional_id,
          preflight.professional_name,
          preflight.professional_council,
          receipt.signatureLevel,
          receipt.signatureFormat,
          receipt.signedAt,
          receipt.tsaTime,
          receipt.certificateValidationSource,
          receipt.certificateValidationStatus,
          receipt.certificateValidatedAt,
        ],
      );
      await this.refreshEncounterSignatureStatus(tx, input.encounterId);
      return result.rows[0] as Report;
    });
  }

  requestAddendum(
    reportId: string,
    input: RequestAddendumInput,
  ): Promise<ReportAddendum> {
    const actorId = this.requireActorId();
    const reason = input.reason.trim();
    if (!reason) throw new BadRequestException('Addendum reason is required');
    return this.reports.transaction(async (transaction) => {
      const tx = transaction as SqlTransaction;
      const report = await tx.query<{ id: string }>(
        'select id from ch.report where id = $1',
        [reportId],
      );
      if (!report.rows[0]) throw new NotFoundException('Report not found');
      const hash = contentSha256(input.content);
      const result = await tx.query<ReportAddendum & Record<string, unknown>>(
        `insert into ch.report_addendum
          (report_id, reason, content, content_sha256, status, requested_by)
         values ($1, $2, $3::jsonb, $4, 'REQUESTED', $5)
         returning *`,
        [reportId, reason, JSON.stringify(input.content), hash, actorId],
      );
      return result.rows[0] as ReportAddendum;
    });
  }

  approveAddendum(id: string): Promise<ReportAddendum> {
    const actorId = this.requireActorId();
    return this.reports.transaction(async (transaction) => {
      const tx = transaction as SqlTransaction;
      const result = await tx.query<ReportAddendum & Record<string, unknown>>(
        `update ch.report_addendum
            set status = 'APPROVED', approved_by = $2,
                approved_at = now(), updated_at = now()
          where id = $1 and status = 'REQUESTED' and requested_by <> $2
          returning *`,
        [id, actorId],
      );
      const addendum = result.rows[0];
      if (!addendum) {
        throw new BadRequestException(
          'Addendum approval requires a distinct actor and REQUESTED status',
        );
      }
      return addendum;
    });
  }

  async signAddendum(id: string): Promise<ReportAddendum> {
    const actorId = this.requireActorId();
    const source = await this.reports.transaction(async (transaction) => {
      const tx = transaction as SqlTransaction;
      const result = await tx.query<{
        id: string;
        report_id: string;
        reason: string;
        content: Record<string, unknown>;
        content_sha256: string;
        signer_professional_id: string;
        signer_name: string;
        signer_council: string;
        professional_user_id: string | null;
      }>(
        `select addendum.id, addendum.report_id, addendum.reason,
                addendum.content, addendum.content_sha256,
                report.signer_professional_id, report.signer_name,
                report.signer_council,
                professional.user_id as professional_user_id
           from ch.report_addendum addendum
           join ch.report report on report.id = addendum.report_id
           join ch.professional professional
             on professional.id = report.signer_professional_id
          where addendum.id = $1 and addendum.status = 'APPROVED'`,
        [id],
      );
      const row = result.rows[0];
      if (!row) throw new BadRequestException('Addendum is not approved');
      if (row.professional_user_id !== actorId) {
        throw new BadRequestException(
          'Addendum must be signed by the original report professional',
        );
      }
      return row;
    });
    const receipt = await this.signing.renderAndSign({
      documentType: 'REPORT_ADDENDUM',
      contentSha256: source.content_sha256,
      content: {
        reportId: source.report_id,
        reason: source.reason,
        content: source.content,
      },
      signer: {
        professionalId: source.signer_professional_id,
        name: source.signer_name,
        council: source.signer_council,
      },
      minimumSignatureLevel: 'QUALIFIED',
    });
    return this.persistSignedAddendum(id, receipt);
  }

  private async preflight(
    tx: SqlTransaction,
    input: CreateReportInput,
    actorId: string,
  ): Promise<ReportPreflight> {
    const examTable =
      input.kind === 'MEDICAL' ? 'ch.medical_exam' : 'ch.psychological_exam';
    const result = await tx.query<ReportPreflight>(
      `select exam.id as exam_id, exam.data as exam_data,
              exam.result as exam_result,
              professional.id as professional_id,
              professional.person_name as professional_name,
              professional.council_type || '/' || professional.council_number
                as professional_council,
              professional.user_id as professional_user_id,
              (select biometric.passed
                 from ch.biometric_check biometric
                where biometric.encounter_id = exam.encounter_id
                  and biometric.kind = $3
                  and biometric.subject_professional_id = professional.id
                order by biometric.performed_at desc
                limit 1) as professional_biometric_passed
         from ${examTable} exam
         join ch.professional professional
           on professional.id = exam.professional_id
        where exam.encounter_id = $1 and professional.user_id = $2`,
      [input.encounterId, actorId, input.kind],
    );
    const row = result.rows[0];
    if (!row) {
      throw new BadRequestException(
        'Report must be signed by the responsible exam professional',
      );
    }
    if (!row.professional_biometric_passed) {
      throw new BadRequestException(
        'Professional biometric validation is required before signing',
      );
    }
    return row;
  }

  private findExisting(
    encounterId: string,
    kind: 'MEDICAL' | 'PSYCH',
  ): Promise<ExistingReport | undefined> {
    return this.reports.transaction(async (transaction) => {
      const tx = transaction as SqlTransaction;
      const result = await tx.query<ExistingReport>(
        'select * from ch.report where encounter_id = $1 and kind = $2',
        [encounterId, kind],
      );
      return result.rows[0];
    });
  }

  private async refreshEncounterSignatureStatus(
    tx: SqlTransaction,
    encounterId: string,
  ): Promise<void> {
    await tx.query(
      `update ch.encounter encounter
          set status = case
            when (select count(*) from (
                    select encounter_id, 'MEDICAL' kind from ch.medical_exam
                    union all
                    select encounter_id, 'PSYCH' kind from ch.psychological_exam
                  ) exams where exams.encounter_id = encounter.id) > 0
             and not exists (
                   select 1 from (
                     select encounter_id, 'MEDICAL' kind from ch.medical_exam
                     union all
                     select encounter_id, 'PSYCH' kind from ch.psychological_exam
                   ) exams
                  where exams.encounter_id = encounter.id
                    and not exists (
                      select 1 from ch.report report
                       where report.encounter_id = exams.encounter_id
                         and report.kind = exams.kind
                    )
                 ) then 'SIGNED'
            else 'READY_FOR_SIGNATURE'
          end,
          updated_at = now()
        where encounter.id = $1
          and encounter.status in ('IN_PROGRESS','READY_FOR_SIGNATURE')`,
      [encounterId],
    );
  }

  private persistSignedAddendum(
    id: string,
    receipt: ClinicalArtifactReceipt,
  ): Promise<ReportAddendum> {
    return this.reports.transaction(async (transaction) => {
      const tx = transaction as SqlTransaction;
      const result = await tx.query<ReportAddendum & Record<string, unknown>>(
        `update ch.report_addendum
            set status = 'SIGNED', storage_document_id = $2,
                artifact_sha256 = $3, signed_at = $4, tsa_time = $5,
                certificate_validation_source = $6,
                certificate_validation_status = $7,
                certificate_validated_at = $8,
                updated_at = now()
          where id = $1 and status = 'APPROVED'
          returning *`,
        [
          id,
          receipt.storageDocumentId,
          receipt.artifactSha256,
          receipt.signedAt,
          receipt.tsaTime,
          receipt.certificateValidationSource,
          receipt.certificateValidationStatus,
          receipt.certificateValidatedAt,
        ],
      );
      const addendum = result.rows[0];
      if (!addendum)
        throw new ConflictException('Addendum is no longer signable');
      return addendum;
    });
  }

  private requireActorId(): string {
    const actorId = this.requestContext.snapshot().actorId;
    if (!actorId)
      throw new BadRequestException('Authenticated actor is required');
    return actorId;
  }
}
