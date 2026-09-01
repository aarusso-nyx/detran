import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import type { Transaction } from '@stynx-nyx/data';

import type { Encounter } from '@detran/ch-encounters';

import { PadesSigningHttpAdapter } from './pades-signing.http-adapter.js';
import { ReportRepository } from './repositories/report.repository.js';
import { contentSha256 } from './report-lifecycle.service.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};

interface ClosureSnapshot {
  encounter_id: string;
  status: string;
  patient_id: string;
  patient_name: string;
  started_at: string;
  renach_process_key: string | null;
  medical_exam: Record<string, unknown> | null;
  psychological_exam: Record<string, unknown> | null;
  medical_result: string | null;
  reports: Array<Record<string, unknown>>;
  report_count: number;
  active_block_count: number;
  restriction_count: number;
  renach_acked: boolean;
  documents: Array<Record<string, unknown>>;
  closer_professional_id: string | null;
  closer_name: string | null;
  closer_council_type: string | null;
  closer_council_number: string | null;
  closer_council_state: string | null;
}

interface EpisodeExport {
  id: string;
  encounter_id: string;
  content_sha256: string;
  storage_document_id: string;
  artifact_sha256: string;
}

export interface EncounterClosureResult {
  encounter: Encounter;
  episodeExport: EpisodeExport;
}

export const CLOSURE_MISSING = {
  encounterSigned: 'encounter_not_signed',
  medicalExam: 'medical_exam_missing',
  psychologicalExam: 'psychological_exam_missing',
  medicalReport: 'medical_report_missing',
  psychologicalReport: 'psychological_report_missing',
  activeBlocks: 'active_process_blocks',
  juntaLedger: 'junta_ledger_unavailable',
  pendingJunta: 'pending_junta_case',
  restriction: 'restriction_required',
  renachProcess: 'renach_process_not_bound',
  renachAck: 'renach_transmission_not_acked',
  signer: 'authorized_closing_professional_missing',
} as const;

@Injectable()
export class EncounterClosureService {
  constructor(
    private readonly reports: ReportRepository,
    private readonly requestContext: RequestContext,
    private readonly signing: PadesSigningHttpAdapter,
  ) {}

  async close(encounterId: string): Promise<EncounterClosureResult> {
    const actorId = this.requireActorId();
    const prepared = await this.reports.transaction(async (transaction) => {
      const tx = transaction as SqlTransaction;
      const snapshot = await this.loadSnapshot(tx, encounterId, actorId, false);
      if (snapshot.status === 'CLOSED') return this.loadClosed(tx, encounterId);
      await this.assertClosureReady(tx, snapshot);
      return { snapshot, content: this.exportContent(snapshot) };
    });
    if ('encounter' in prepared) return prepared;

    const hash = contentSha256(prepared.content);
    const receipt = await this.signing.renderAndSign({
      documentType: 'EPISODE_EXPORT',
      contentSha256: hash,
      content: prepared.content,
      signer: {
        professionalId: prepared.snapshot.closer_professional_id as string,
        name: prepared.snapshot.closer_name as string,
        council: this.council(prepared.snapshot),
      },
      minimumSignatureLevel: 'QUALIFIED',
    });

    return this.reports.transaction(async (transaction) => {
      const tx = transaction as SqlTransaction;
      const snapshot = await this.loadSnapshot(tx, encounterId, actorId, true);
      if (snapshot.status === 'CLOSED') return this.loadClosed(tx, encounterId);
      await this.assertClosureReady(tx, snapshot);
      const currentContent = this.exportContent(snapshot);
      if (contentSha256(currentContent) !== hash) {
        throw new ConflictException(
          'Encounter evidence changed while the episode export was signed',
        );
      }

      const exported = await tx.query<EpisodeExport & Record<string, unknown>>(
        `insert into ch.episode_export
          (encounter_id, content_sha256, storage_document_id, artifact_sha256,
           signer_professional_id, signer_name, signer_council,
           signature_level, signature_format, signed_at, tsa_time,
           certificate_validation_source, certificate_validation_status,
           certificate_validated_at, created_by)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
         returning *`,
        [
          encounterId,
          hash,
          receipt.storageDocumentId,
          receipt.artifactSha256,
          snapshot.closer_professional_id,
          snapshot.closer_name,
          this.council(snapshot),
          receipt.signatureLevel,
          receipt.signatureFormat,
          receipt.signedAt,
          receipt.tsaTime,
          receipt.certificateValidationSource,
          receipt.certificateValidationStatus,
          receipt.certificateValidatedAt,
          actorId,
        ],
      );
      const episodeExport = exported.rows[0];
      if (!episodeExport)
        throw new Error('Episode export insert returned no row');

      const closed = await tx.query<Encounter & Record<string, unknown>>(
        `update ch.encounter
            set status = 'CLOSED', closed_at = now(), updated_by = $2,
                updated_at = now()
          where id = $1 and status = 'SIGNED'
          returning *`,
        [encounterId, actorId],
      );
      const encounter = closed.rows[0];
      if (!encounter) {
        throw new ConflictException('Encounter is no longer closeable');
      }
      return { encounter, episodeExport };
    });
  }

  private async assertClosureReady(
    tx: SqlTransaction,
    snapshot: ClosureSnapshot,
  ): Promise<void> {
    const missing: string[] = [];
    if (snapshot.status !== 'SIGNED')
      missing.push(CLOSURE_MISSING.encounterSigned);
    if (!snapshot.medical_exam) missing.push(CLOSURE_MISSING.medicalExam);
    if (!snapshot.psychological_exam)
      missing.push(CLOSURE_MISSING.psychologicalExam);
    const kinds = new Set(snapshot.reports.map((report) => report.kind));
    if (!kinds.has('MEDICAL')) missing.push(CLOSURE_MISSING.medicalReport);
    if (!kinds.has('PSYCH')) missing.push(CLOSURE_MISSING.psychologicalReport);
    if (snapshot.active_block_count > 0)
      missing.push(CLOSURE_MISSING.activeBlocks);

    const catalog = await tx.query<{ available: boolean }>(
      "select to_regclass('ch.junta_case') is not null as available",
    );
    if (!catalog.rows[0]?.available) {
      missing.push(CLOSURE_MISSING.juntaLedger);
    } else {
      const pending = await tx.query<{ pending: boolean }>(
        `select exists (
           select 1 from ch.junta_case
            where encounter_id = $1 and status <> 'DECIDED'
         ) as pending`,
        [snapshot.encounter_id],
      );
      if (pending.rows[0]?.pending) missing.push(CLOSURE_MISSING.pendingJunta);
    }

    if (
      snapshot.medical_result === 'APTO_COM_RESTRICOES' &&
      snapshot.restriction_count === 0
    ) {
      missing.push(CLOSURE_MISSING.restriction);
    }
    if (!snapshot.renach_process_key)
      missing.push(CLOSURE_MISSING.renachProcess);
    if (!snapshot.renach_acked) missing.push(CLOSURE_MISSING.renachAck);
    if (
      !snapshot.closer_professional_id ||
      !snapshot.closer_name ||
      !snapshot.closer_council_type ||
      !snapshot.closer_council_number ||
      !snapshot.closer_council_state
    ) {
      missing.push(CLOSURE_MISSING.signer);
    }
    if (missing.length) {
      throw new BadRequestException({
        message: 'Encounter closure requirements are not satisfied',
        missing,
      });
    }
  }

  private async loadSnapshot(
    tx: SqlTransaction,
    encounterId: string,
    actorId: string,
    lock: boolean,
  ): Promise<ClosureSnapshot> {
    const result = await tx.query<ClosureSnapshot & Record<string, unknown>>(
      `select encounter.id as encounter_id, encounter.status,
              encounter.patient_id, patient.name as patient_name,
              encounter.started_at, encounter.renach_process_key,
              (select jsonb_build_object(
                        'id', exam.id, 'performedAt', exam.performed_at,
                        'result', exam.result, 'validUntil', exam.valid_until,
                        'data', exam.data)
                 from ch.medical_exam exam
                where exam.encounter_id = encounter.id) as medical_exam,
              (select jsonb_build_object(
                        'id', exam.id, 'performedAt', exam.performed_at,
                        'result', exam.result, 'validUntil', exam.valid_until,
                        'data', exam.data)
                 from ch.psychological_exam exam
                where exam.encounter_id = encounter.id) as psychological_exam,
              (select exam.result from ch.medical_exam exam
                where exam.encounter_id = encounter.id) as medical_result,
              coalesce((select jsonb_agg(jsonb_build_object(
                                  'id', report.id, 'kind', report.kind,
                                  'contentSha256', report.content_sha256,
                                  'artifactSha256', report.artifact_sha256,
                                  'signedAt', report.signed_at,
                                  'tsaTime', report.tsa_time,
                                  'certificateValidationSource',
                                    report.certificate_validation_source)
                                order by report.kind)
                          from ch.report report
                         where report.encounter_id = encounter.id), '[]'::jsonb)
                as reports,
              (select count(*)::int from ch.report report
                where report.encounter_id = encounter.id) as report_count,
              (select count(*)::int from ch.process_block block
                where block.encounter_id = encounter.id and block.active)
                as active_block_count,
              (select count(*)::int from ch.encounter_restriction restriction
                where restriction.encounter_id = encounter.id)
                as restriction_count,
              (select count(*) = 2 and bool_and(outbox.status = 'acked')
                 from integration.outbox outbox
                 join ch.report report
                   on report.id::text = outbox.aggregate_id
                where report.encounter_id = encounter.id
                  and outbox.topic = 'ch.renach.exam-result') as renach_acked,
              coalesce((select jsonb_agg(jsonb_build_object(
                                  'id', document.id, 'kind', document.kind,
                                  'sha256', document.sha256,
                                  'storageDocumentId', document.storage_document_id)
                                order by document.created_at, document.id)
                          from ch.clinical_document document
                         where document.encounter_id = encounter.id), '[]'::jsonb)
                as documents,
              closer.id as closer_professional_id,
              closer.person_name as closer_name,
              closer.council_type as closer_council_type,
              closer.council_number as closer_council_number,
              closer.council_state as closer_council_state
         from ch.encounter encounter
         join ch.patient patient on patient.id = encounter.patient_id
         left join ch.professional closer
           on closer.user_id = $2 and closer.clinic_id = encounter.clinic_id
          and closer.is_active
        where encounter.id = $1
        ${lock ? 'for update of encounter' : ''}`,
      [encounterId, actorId],
    );
    const snapshot = result.rows[0];
    if (!snapshot)
      throw new NotFoundException(`Encounter ${encounterId} not found`);
    return snapshot;
  }

  private exportContent(snapshot: ClosureSnapshot): Record<string, unknown> {
    return {
      documentType: 'EPISODE_EXPORT',
      encounter: {
        id: snapshot.encounter_id,
        patientId: snapshot.patient_id,
        patientName: snapshot.patient_name,
        startedAt: snapshot.started_at,
        renachProcessKey: snapshot.renach_process_key,
      },
      medicalExam: snapshot.medical_exam,
      psychologicalExam: snapshot.psychological_exam,
      reports: snapshot.reports,
      clinicalDocuments: snapshot.documents,
    };
  }

  private async loadClosed(
    tx: SqlTransaction,
    encounterId: string,
  ): Promise<EncounterClosureResult> {
    const encounter = await tx.query<Encounter & Record<string, unknown>>(
      "select * from ch.encounter where id = $1 and status = 'CLOSED'",
      [encounterId],
    );
    const exported = await tx.query<EpisodeExport & Record<string, unknown>>(
      'select * from ch.episode_export where encounter_id = $1',
      [encounterId],
    );
    if (!encounter.rows[0] || !exported.rows[0]) {
      throw new ConflictException(
        'Closed encounter has no immutable signed episode export',
      );
    }
    return { encounter: encounter.rows[0], episodeExport: exported.rows[0] };
  }

  private council(snapshot: ClosureSnapshot): string {
    return `${snapshot.closer_council_type}/${snapshot.closer_council_state} ${snapshot.closer_council_number}`;
  }

  private requireActorId(): string {
    const actorId = this.requestContext.snapshot().actorId;
    if (!actorId)
      throw new BadRequestException('Authenticated actor is required');
    return actorId;
  }
}
