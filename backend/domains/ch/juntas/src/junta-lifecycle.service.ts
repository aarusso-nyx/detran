import { createHash } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import type { Transaction } from '@stynx-nyx/data';

import type { JuntaCase } from './entities/junta-case.entity.js';
import type { JuntaDecision } from './entities/junta-decision.entity.js';
import { JuntaSigningAdapter } from './junta-signing.adapter.js';
import { JuntaCaseRepository } from './repositories/junta-case.repository.js';

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};

export type JuntaTrack = 'MEDICAL' | 'PSYCH';
export type JuntaOutcome = 'REVERSED' | 'UPHELD' | 'COMPLEMENT_REQUIRED';

export interface SubmitJuntaCaseInput {
  encounterId: string;
  applicantPatientId: string;
  track: JuntaTrack;
  reasonCode:
    | 'RESULT_DISAGREEMENT'
    | 'PERMANENT_INAPTITUDE'
    | 'CLINICAL_DIVERGENCE'
    | 'OTHER_DOCUMENTED';
  reasonDetail?: string;
  resultKnownAt: string;
  requestedAt: string;
}

export interface JuntaMemberInput {
  professionalId: string;
  role: 'CHAIR' | 'MEMBER';
  specialist: boolean;
}

export interface DesignateBoardInput {
  members: JuntaMemberInput[];
  designatedAt: string;
  designationDeadlineAt?: string;
}

export interface DecideJuntaInput {
  outcome: JuntaOutcome;
  rationale: string;
}

export interface FileAppealInput {
  sourceDecisionId: string;
  applicantPatientId: string;
  resultKnownAt: string;
  filedAt: string;
  forwardingDeadlineAt: string;
}

interface CasePreflight {
  id: string;
  applicant_patient_id: string;
  track: JuntaTrack;
  status: string;
}

interface BoardPreflight {
  id: string;
  case_id: string;
  instance: 'SECOND' | 'SPECIAL';
  status: string;
  track: JuntaTrack;
}

interface ProfessionalRow {
  id: string;
  person_name: string;
  professional_kind: string;
  council_type: string;
  council_number: string;
  council_state: string;
  user_id: string | null;
  is_active: boolean;
}

const CASE_REASONS = new Set([
  'RESULT_DISAGREEMENT',
  'PERMANENT_INAPTITUDE',
  'CLINICAL_DIVERGENCE',
  'OTHER_DOCUMENTED',
]);

function instant(value: string, label: string): Date {
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) {
    throw new BadRequestException(`${label} must be an ISO-8601 instant`);
  }
  return parsed;
}

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((entry) => canonicalJson(entry)).join(',')}]`;
  }
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => `${JSON.stringify(key)}:${canonicalJson(entry)}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

function sha256(value: unknown): string {
  return createHash('sha256').update(canonicalJson(value)).digest('hex');
}

@Injectable()
export class JuntaLifecycleService {
  constructor(
    private readonly cases: JuntaCaseRepository,
    private readonly requestContext: RequestContext,
    private readonly signing: JuntaSigningAdapter,
  ) {}

  submit(input: SubmitJuntaCaseInput): Promise<JuntaCase> {
    const actorId = this.requireActor();
    if (!CASE_REASONS.has(input.reasonCode)) {
      throw new BadRequestException('Unsupported Junta reason code');
    }
    const knownAt = instant(input.resultKnownAt, 'resultKnownAt');
    const requestedAt = instant(input.requestedAt, 'requestedAt');
    const deadline = new Date(knownAt);
    deadline.setUTCDate(deadline.getUTCDate() + 30);
    if (requestedAt > deadline) {
      throw new BadRequestException(
        'Junta request is outside the 30-day filing period',
      );
    }
    const detail = input.reasonDetail?.trim() || null;

    return this.cases.transaction(async (transaction) => {
      const result = await (transaction as SqlTransaction).query<
        JuntaCase & Record<string, unknown>
      >(
        `insert into ch.junta_case
          (encounter_id, applicant_patient_id, track, reason_code, reason_detail,
           result_known_at, requested_at, request_deadline_at, status, submitted_by)
         select encounter.id, encounter.patient_id, $3, $4, $5, $6, $7,
                $6::timestamptz + interval '30 days', 'SUBMITTED', $8
           from ch.encounter encounter
          where encounter.id = $1 and encounter.patient_id = $2
         returning *`,
        [
          input.encounterId,
          input.applicantPatientId,
          input.track,
          input.reasonCode,
          detail,
          knownAt.toISOString(),
          requestedAt.toISOString(),
          actorId,
        ],
      );
      const row = result.rows[0];
      if (!row) {
        throw new NotFoundException('Encounter and candidate do not match');
      }
      return row;
    });
  }

  designateSecond(caseId: string, input: DesignateBoardInput) {
    if (!input.designationDeadlineAt) {
      throw new BadRequestException(
        'A holiday-aware 15-business-day designation deadline is required',
      );
    }
    return this.designate(caseId, 'SECOND', input);
  }

  designateSpecial(caseId: string, input: DesignateBoardInput) {
    if (input.designationDeadlineAt) {
      throw new BadRequestException(
        'Junta Especial designation deadline has no sourced numeric value',
      );
    }
    return this.designate(caseId, 'SPECIAL', input);
  }

  private designate(
    caseId: string,
    instance: 'SECOND' | 'SPECIAL',
    input: DesignateBoardInput,
  ) {
    this.requireActor();
    this.validateMemberShape(input.members, instance);
    const designatedAt = instant(input.designatedAt, 'designatedAt');
    const designationDeadline = input.designationDeadlineAt
      ? instant(input.designationDeadlineAt, 'designationDeadlineAt')
      : null;

    return this.cases.transaction(async (transaction) => {
      const tx = transaction as SqlTransaction;
      const caseResult = await tx.query<CasePreflight>(
        'select id, applicant_patient_id, track, status from ch.junta_case where id = $1 for update',
        [caseId],
      );
      const current = caseResult.rows[0];
      if (!current)
        throw new NotFoundException(`Junta case ${caseId} not found`);
      const allowed =
        instance === 'SECOND'
          ? current.status === 'SUBMITTED'
          : current.status === 'APPEALED';
      if (!allowed) {
        throw new ConflictException(
          `Cannot designate ${instance} board from ${current.status}`,
        );
      }
      await this.validateProfessionals(
        tx,
        current.track,
        input.members,
        instance,
      );

      const boardResult = await tx.query<Record<string, unknown>>(
        `insert into ch.junta_board
          (case_id, instance, designated_by, designated_at,
           designation_deadline_rule, designation_deadline_at, decision_deadline_at)
         values ($1, $2, $3, $4, $5, $6,
                 case when $2::varchar = 'SECOND' then $4::timestamptz + interval '30 days' else null end)
         returning *`,
        [
          caseId,
          instance,
          instance === 'SECOND' ? 'DETRAN' : 'CETRAN',
          designatedAt.toISOString(),
          instance === 'SECOND' ? '15_BUSINESS_DAYS' : null,
          designationDeadline?.toISOString() ?? null,
        ],
      );
      const board = boardResult.rows[0];
      if (!board) throw new Error('Junta board insert returned no row');
      for (const member of input.members) {
        await tx.query(
          `insert into ch.junta_board_member
            (board_id, professional_id, role, specialist)
           values ($1, $2, $3, $4)`,
          [board.id, member.professionalId, member.role, member.specialist],
        );
      }
      await tx.query(
        `update ch.junta_case set status = 'UNDER_REVIEW', updated_at = now()
          where id = $1`,
        [caseId],
      );
      if (instance === 'SPECIAL') {
        await tx.query(
          `update ch.junta_appeal set status = 'DESIGNATED', updated_at = now()
            where case_id = $1 and status in ('FILED','FORWARDED')`,
          [caseId],
        );
      }
      return board;
    });
  }

  async decide(
    boardId: string,
    input: DecideJuntaInput,
  ): Promise<JuntaDecision> {
    const actorId = this.requireActor();
    const rationale = input.rationale.trim();
    if (!rationale)
      throw new BadRequestException('Decision rationale is required');
    const preflight = await this.cases.transaction(async (transaction) => {
      const tx = transaction as SqlTransaction;
      const boardResult = await tx.query<BoardPreflight>(
        `select board.id, board.case_id, board.instance, board.status, case_record.track
           from ch.junta_board board
           join ch.junta_case case_record on case_record.id = board.case_id
          where board.id = $1`,
        [boardId],
      );
      const board = boardResult.rows[0];
      if (!board)
        throw new NotFoundException(`Junta board ${boardId} not found`);
      if (board.status === 'DECIDED') {
        throw new ConflictException(
          'Junta board already has a conclusive decision',
        );
      }
      const professionals = await tx.query<
        ProfessionalRow & { role: string; specialist: boolean }
      >(
        `select professional.id, professional.person_name,
                professional.professional_kind, professional.council_type,
                professional.council_number, professional.council_state,
                professional.user_id,
                professional.is_active, member.role, member.specialist
           from ch.junta_board_member member
           join ch.professional professional on professional.id = member.professional_id
          where member.board_id = $1
          order by member.role, professional.id`,
        [boardId],
      );
      this.assertPersistedComposition(board, professionals.rows, actorId);
      return { board, members: professionals.rows };
    });

    const content = {
      caseId: preflight.board.case_id,
      boardId,
      instance: preflight.board.instance,
      track: preflight.board.track,
      outcome: input.outcome,
      rationale,
      members: preflight.members.map((member) => ({
        professionalId: member.id,
        role: member.role,
        specialist: member.specialist,
        council: `${member.council_type}-${member.council_state} ${member.council_number}`,
      })),
    };
    const contentSha256 = sha256(content);
    const chair = preflight.members.find((member) => member.role === 'CHAIR');
    if (!chair) throw new BadRequestException('Junta chair is required');
    const receipt = await this.signing.renderAndSign({
      documentType: 'JUNTA_DECISION',
      contentSha256,
      content,
      signer: {
        professionalId: chair.id,
        name: chair.person_name,
        council: `${chair.council_type}-${chair.council_state} ${chair.council_number}`,
      },
      minimumSignatureLevel: 'QUALIFIED',
    });

    return this.cases.transaction(async (transaction) => {
      const tx = transaction as SqlTransaction;
      const lock = await tx.query<BoardPreflight>(
        `select board.id, board.case_id, board.instance, board.status, case_record.track
           from ch.junta_board board
           join ch.junta_case case_record on case_record.id = board.case_id
          where board.id = $1 for update of board, case_record`,
        [boardId],
      );
      const board = lock.rows[0];
      if (!board || board.status === 'DECIDED') {
        throw new ConflictException('Junta board no longer accepts a decision');
      }
      const result = await tx.query<JuntaDecision & Record<string, unknown>>(
        `insert into ch.junta_decision
          (case_id, board_id, outcome, rationale, content_sha256,
           storage_document_id, artifact_sha256, signature_level,
           signature_format, signed_at, tsa_time, certificate_validation_source,
           certificate_validation_status, certificate_validated_at, decided_at,
           recorded_by, administrative_exhausted)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
                 $12, $13, $14, now(), $15, $16)
         returning *`,
        [
          board.case_id,
          boardId,
          input.outcome,
          rationale,
          contentSha256,
          receipt.storageDocumentId,
          receipt.artifactSha256,
          receipt.signatureLevel,
          receipt.signatureFormat,
          receipt.signedAt,
          receipt.tsaTime,
          receipt.certificateValidationSource,
          receipt.certificateValidationStatus,
          receipt.certificateValidatedAt,
          actorId,
          board.instance === 'SPECIAL' &&
            input.outcome !== 'COMPLEMENT_REQUIRED',
        ],
      );
      const decision = result.rows[0];
      if (!decision) throw new Error('Junta decision insert returned no row');
      const conclusive = input.outcome !== 'COMPLEMENT_REQUIRED';
      if (conclusive) {
        await tx.query(
          `update ch.junta_board set status = 'DECIDED', updated_at = now() where id = $1`,
          [boardId],
        );
      }
      const nextStatus = !conclusive
        ? 'AWAITING_COMPLEMENT'
        : board.instance === 'SPECIAL'
          ? 'FINAL_DECIDED'
          : 'DECIDED';
      await tx.query(
        `update ch.junta_case
            set status = $2,
                finalized_at = case when $2::varchar in ('DECIDED','FINAL_DECIDED') then now() else null end,
                updated_at = now()
          where id = $1`,
        [board.case_id, nextStatus],
      );
      if (board.instance === 'SPECIAL' && conclusive) {
        await tx.query(
          `update ch.junta_appeal set status = 'DECIDED', updated_at = now()
            where case_id = $1 and status = 'DESIGNATED'`,
          [board.case_id],
        );
      }
      await tx.query(
        `insert into integration.outbox
          (topic, aggregate_type, aggregate_id, payload, idempotency_key, status, available_at)
         values ('ch.renach.junta-decision', 'ch.junta_decision', $1,
                 jsonb_build_object('decisionId', $1, 'caseId', $2, 'outcome', $3,
                                    'administrativeExhausted', $4,
                                    'remainingAppeal',
                                    case
                                      when $5 = 'SECOND' and $3 = 'UPHELD'
                                      then jsonb_build_object(
                                        'instance', 'SPECIAL',
                                        'designatingAuthority', 'CETRAN',
                                        'filingDeadlineRule', '30_CALENDAR_DAYS')
                                      else null
                                    end),
                 'ch.junta-decision:' || $1, 'pending', now())`,
        [
          decision.id,
          board.case_id,
          input.outcome,
          decision.administrative_exhausted,
          board.instance,
        ],
      );
      return decision;
    });
  }

  fileAppeal(caseId: string, input: FileAppealInput) {
    const actorId = this.requireActor();
    const knownAt = instant(input.resultKnownAt, 'resultKnownAt');
    const filedAt = instant(input.filedAt, 'filedAt');
    const deadline = new Date(knownAt);
    deadline.setUTCDate(deadline.getUTCDate() + 30);
    if (filedAt > deadline) {
      throw new BadRequestException(
        'Appeal is outside the 30-day filing period',
      );
    }
    const forwardingDeadline = instant(
      input.forwardingDeadlineAt,
      'forwardingDeadlineAt',
    );
    if (forwardingDeadline <= filedAt) {
      throw new BadRequestException('Forwarding deadline must follow filing');
    }

    return this.cases.transaction(async (transaction) => {
      const result = await (transaction as SqlTransaction).query<
        Record<string, unknown>
      >(
        `insert into ch.junta_appeal
          (case_id, source_decision_id, applicant_patient_id, result_known_at,
           filed_at, filing_deadline_at, forwarding_deadline_rule,
           forwarding_deadline_at, status, filed_by)
         select case_record.id, decision.id, case_record.applicant_patient_id,
                $4, $5, $4::timestamptz + interval '30 days',
                '20_BUSINESS_DAYS', $6, 'FILED', $7
           from ch.junta_case case_record
           join ch.junta_decision decision on decision.case_id = case_record.id
          where case_record.id = $1
            and decision.id = $2
            and case_record.applicant_patient_id = $3
            and case_record.status = 'DECIDED'
            and decision.outcome = 'UPHELD'
            and not decision.administrative_exhausted
         returning *`,
        [
          caseId,
          input.sourceDecisionId,
          input.applicantPatientId,
          knownAt.toISOString(),
          filedAt.toISOString(),
          forwardingDeadline.toISOString(),
          actorId,
        ],
      );
      const appeal = result.rows[0];
      if (!appeal) {
        throw new ConflictException(
          'Appeal requires the candidate and an upheld second-instance decision',
        );
      }
      await (transaction as SqlTransaction).query(
        `update ch.junta_case set status = 'APPEALED', finalized_at = null, updated_at = now()
          where id = $1`,
        [caseId],
      );
      return appeal;
    });
  }

  forwardAppeal(appealId: string, forwardedAt: string) {
    this.requireActor();
    const instantValue = instant(forwardedAt, 'forwardedAt');
    return this.cases.transaction(async (transaction) => {
      const result = await (transaction as SqlTransaction).query<
        Record<string, unknown>
      >(
        `update ch.junta_appeal
            set status = 'FORWARDED', forwarded_at = $2, updated_at = now()
          where id = $1 and status = 'FILED'
         returning *`,
        [appealId, instantValue.toISOString()],
      );
      const appeal = result.rows[0];
      if (!appeal) throw new ConflictException('Filed appeal not found');
      return appeal;
    });
  }

  private validateMemberShape(
    members: JuntaMemberInput[],
    instance: 'SECOND' | 'SPECIAL',
  ): void {
    if (
      members.length !== 3 ||
      new Set(members.map((item) => item.professionalId)).size !== 3
    ) {
      throw new BadRequestException(
        'A Junta requires exactly three distinct members',
      );
    }
    if (members.filter((item) => item.role === 'CHAIR').length !== 1) {
      throw new BadRequestException('A Junta requires exactly one chair');
    }
    if (
      instance === 'SPECIAL' &&
      members.filter((item) => item.specialist).length < 2
    ) {
      throw new BadRequestException(
        'Junta Especial requires at least two specialists',
      );
    }
  }

  private async validateProfessionals(
    tx: SqlTransaction,
    track: JuntaTrack,
    members: JuntaMemberInput[],
    instance: 'SECOND' | 'SPECIAL',
  ): Promise<void> {
    const result = await tx.query<ProfessionalRow>(
      `select id, person_name, professional_kind, council_type, council_number,
              council_state, user_id, is_active
         from ch.professional where id = any($1::uuid[])`,
      [members.map((member) => member.professionalId)],
    );
    const expectedKind = track === 'MEDICAL' ? 'MEDICO' : 'PSICOLOGO';
    if (
      result.rows.length !== members.length ||
      result.rows.some(
        (professional) =>
          !professional.is_active ||
          professional.professional_kind !== expectedKind,
      )
    ) {
      throw new BadRequestException(
        'Junta members must be active professionals for its track',
      );
    }
    if (instance === 'SPECIAL') {
      const specialists = new Set(
        members
          .filter((member) => member.specialist)
          .map((member) => member.professionalId),
      );
      if (
        result.rows.filter((professional) => specialists.has(professional.id))
          .length < 2
      ) {
        throw new BadRequestException(
          'Junta Especial specialist evidence is incomplete',
        );
      }
    }
  }

  private assertPersistedComposition(
    board: BoardPreflight,
    members: Array<ProfessionalRow & { role: string; specialist: boolean }>,
    actorId: string,
  ): void {
    this.validateMemberShape(
      members.map((member) => ({
        professionalId: member.id,
        role: member.role as 'CHAIR' | 'MEMBER',
        specialist: member.specialist,
      })),
      board.instance,
    );
    const expectedKind = board.track === 'MEDICAL' ? 'MEDICO' : 'PSICOLOGO';
    if (
      members.some(
        (member) =>
          !member.is_active || member.professional_kind !== expectedKind,
      )
    ) {
      throw new BadRequestException('Junta composition is no longer valid');
    }
    if (!members.some((member) => member.user_id === actorId)) {
      throw new BadRequestException(
        'Only a designated Junta member may record its decision',
      );
    }
  }

  private requireActor(): string {
    const actorId = this.requestContext.snapshot().actorId;
    if (!actorId) throw new BadRequestException('Actor context is required');
    return actorId;
  }
}
