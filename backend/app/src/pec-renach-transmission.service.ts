import { createHash } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import type {
  RenachPort,
  RenachExamReceipt,
  SubmitMedicalExamInput,
  SubmitPsychologicalEvaluationInput,
} from '@detran/senatran-adapter';
import { withTenantContext } from '@detran/shared';

export const PEC_RENACH_PORT = Symbol('PEC_RENACH_PORT');

type SqlTransaction = Transaction & {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};

interface ClaimedOutboxItem {
  id: string;
  payload: { reportId?: string; kind?: string };
  idempotency_key: string;
  attempts: number;
}

interface ReportTransmissionSource {
  report_id: string;
  kind: 'MEDICAL' | 'PSYCH';
  artifact_sha256: string;
  signed_at: string;
  renach_process_key: string | null;
  renach_process_type:
    | 'FIRST_LICENSE'
    | 'RENEWAL'
    | 'CATEGORY_CHANGE'
    | 'CATEGORY_ADDITION'
    | null;
  current_category: string | null;
  requested_category: string | null;
  appointment_id: string | null;
  clinic_code: string;
  clinic_cnpj: string;
  patient_cpf: string;
  patient_name: string;
  patient_birth_date: string | null;
  examiner_cpf: string | null;
  council_type: string | null;
  council_number: string | null;
  council_state: string | null;
  performed_at: string;
  result: string;
  valid_until: string | null;
  restrictions: Array<{ code: string; description?: string }>;
}

export interface DispatchResult {
  outboxId: string;
  status: 'acked' | 'error';
  providerProtocol?: string;
  error?: string;
}

@Injectable()
export class PecRenachTransmissionService {
  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
    @Inject(PEC_RENACH_PORT) private readonly renach: RenachPort,
  ) {}

  async dispatchDue(limit = 25): Promise<DispatchResult[]> {
    const boundedLimit = Number.isFinite(limit)
      ? Math.max(1, Math.min(25, Math.floor(limit)))
      : 25;
    const claimed = await this.transaction((tx) =>
      tx.query<ClaimedOutboxItem>(
        `with due as (
           select id
             from integration.outbox
            where topic = 'ch.renach.exam-result'
              and (
                (status in ('pending', 'error') and available_at <= now())
                or (status = 'processing' and dispatched_at <= now() - interval '15 minutes')
              )
            order by created_at
            limit $1
            for update skip locked
         )
         update integration.outbox outbox
            set status = 'processing', attempts = outbox.attempts + 1,
                dispatched_at = now(), last_error = null, updated_at = now()
           from due
          where outbox.id = due.id
         returning outbox.id, outbox.payload, outbox.idempotency_key, outbox.attempts`,
        [boundedLimit],
      ),
    );

    const results: DispatchResult[] = [];
    for (const item of claimed.rows) results.push(await this.dispatch(item));
    return results;
  }

  private async dispatch(item: ClaimedOutboxItem): Promise<DispatchResult> {
    let request: SubmitMedicalExamInput | SubmitPsychologicalEvaluationInput;
    try {
      const source = await this.loadSource(item.payload.reportId);
      if (item.payload.kind !== source.kind) {
        throw new Error(
          `Outbox report kind ${String(item.payload.kind)} does not match ${source.kind}`,
        );
      }
      request = this.toRequest(source);
    } catch (error) {
      return this.recordError(item, undefined, error);
    }

    const requestHash = sha256(request);
    try {
      const context = this.requestContext.snapshot();
      const integrationContext = {
        tenantId: context.tenantId,
        actorId: context.actorId,
        correlationId: context.requestId,
        metadata: { idempotencyKey: item.idempotency_key },
      };
      const receipt =
        requestKind(request) === 'MEDICAL'
          ? await this.renach.submitMedicalExam(
              request as SubmitMedicalExamInput,
              integrationContext,
            )
          : await this.renach.submitPsychologicalEvaluation(
              request as SubmitPsychologicalEvaluationInput,
              integrationContext,
            );
      await this.recordSuccess(item, requestHash, receipt);
      return {
        outboxId: item.id,
        status: 'acked',
        ...(receipt.protocol ? { providerProtocol: receipt.protocol } : {}),
      };
    } catch (error) {
      return this.recordError(item, requestHash, error);
    }
  }

  private async loadSource(
    reportId: string | undefined,
  ): Promise<ReportTransmissionSource> {
    if (!reportId) throw new Error('Outbox item has no reportId');
    const result = await this.transaction((tx) =>
      tx.query<ReportTransmissionSource>(
        `select report.id as report_id, report.kind, report.artifact_sha256,
                report.signed_at, encounter.renach_process_key,
                encounter.renach_process_type, encounter.current_category,
                encounter.requested_category, encounter.appointment_id,
                clinic.code as clinic_code, clinic.cnpj as clinic_cnpj,
                patient.national_id as patient_cpf, patient.name as patient_name,
                patient.birth_date as patient_birth_date,
                professional.document_cpf as examiner_cpf,
                professional.council_type, professional.council_number,
                professional.council_state,
                coalesce(medical.performed_at, psychological.performed_at) as performed_at,
                coalesce(medical.result, psychological.result) as result,
                coalesce(medical.valid_until, psychological.valid_until) as valid_until,
                coalesce((
                  select jsonb_agg(jsonb_build_object(
                           'code', restriction_code.code,
                           'description', restriction_code.legal_label
                         ) order by restriction_code.code)
                    from ch.encounter_restriction applied
                    join ch.restriction_code restriction_code
                      on restriction_code.id = applied.restriction_code_id
                   where applied.encounter_id = encounter.id
                ), '[]'::jsonb) as restrictions
           from ch.report report
           join ch.encounter encounter on encounter.id = report.encounter_id
           join ch.clinic clinic on clinic.id = encounter.clinic_id
           join ch.patient patient on patient.id = encounter.patient_id
           join ch.professional professional
             on professional.id = report.signer_professional_id
           left join ch.medical_exam medical
             on report.kind = 'MEDICAL' and medical.id = report.source_exam_id
           left join ch.psychological_exam psychological
             on report.kind = 'PSYCH' and psychological.id = report.source_exam_id
          where report.id = $1`,
        [reportId],
      ),
    );
    const source = result.rows[0];
    if (!source) throw new Error(`Report ${reportId} not found`);
    return source;
  }

  private toRequest(
    source: ReportTransmissionSource,
  ): SubmitMedicalExamInput | SubmitPsychologicalEvaluationInput {
    const required = {
      renachNumber: source.renach_process_key,
      appointmentId: source.appointment_id,
      examinerCpf: source.examiner_cpf,
      councilNumber: source.council_number,
      councilState: source.council_state,
    };
    for (const [field, value] of Object.entries(required)) {
      if (!value) throw new Error(`RENACH transmission requires ${field}`);
    }
    const common = {
      renachNumber: source.renach_process_key as string,
      appointmentId: source.appointment_id as string,
      clinic: { code: source.clinic_code, cnpj: source.clinic_cnpj },
      examiner: {
        cpf: source.examiner_cpf as string,
        councilNumber: source.council_number as string,
        state: source.council_state as string,
      },
      performedAt: source.performed_at,
      validUntil: source.valid_until ?? undefined,
      signature: {
        hash: source.artifact_sha256,
        signedAt: source.signed_at,
      },
    };
    if (source.kind === 'MEDICAL') {
      if (source.council_type !== 'CRM')
        throw new Error('Medical RENACH result requires a CRM examiner');
      if (!source.renach_process_type || !source.patient_birth_date) {
        throw new Error(
          'Medical RENACH result requires process type and driver birth date',
        );
      }
      return {
        ...common,
        driver: {
          cpf: source.patient_cpf,
          name: source.patient_name,
          birthDate: source.patient_birth_date,
        },
        process: {
          type: source.renach_process_type,
          currentCategory: source.current_category ?? undefined,
          requestedCategory: source.requested_category ?? undefined,
        },
        result: medicalResult(source.result),
        restrictions: source.restrictions,
      };
    }
    if (source.council_type !== 'CRP')
      throw new Error('Psychological RENACH result requires a CRP examiner');
    return { ...common, result: psychologicalResult(source.result) };
  }

  private async recordSuccess(
    item: ClaimedOutboxItem,
    requestHash: string,
    receipt: RenachExamReceipt,
  ): Promise<void> {
    await this.transaction(async (tx) => {
      await tx.query(
        `insert into integration.delivery_attempt
          (outbox_id, attempt_number, status, provider_protocol,
           request_sha256, response_sha256, completed_at)
         values ($1, $2, 'acked', $3, $4, $5, now())
         on conflict (tenant_id, outbox_id, attempt_number) do nothing`,
        [
          item.id,
          item.attempts,
          receipt.protocol ?? null,
          requestHash,
          sha256(receipt),
        ],
      );
      await tx.query(
        `update integration.outbox
            set status = 'acked', completed_at = now(), available_at = now(),
                last_error = null, updated_at = now()
          where id = $1 and status = 'processing'`,
        [item.id],
      );
    });
  }

  private async recordError(
    item: ClaimedOutboxItem,
    requestHash: string | undefined,
    error: unknown,
  ): Promise<DispatchResult> {
    const message = error instanceof Error ? error.message : String(error);
    const providerCode =
      typeof error === 'object' && error && 'providerCode' in error
        ? String((error as { providerCode?: unknown }).providerCode ?? '')
        : null;
    await this.transaction(async (tx) => {
      await tx.query(
        `insert into integration.delivery_attempt
          (outbox_id, attempt_number, status, provider_code,
           provider_message, request_sha256, completed_at)
         values ($1, $2, 'error', $3, $4, $5, now())
         on conflict (tenant_id, outbox_id, attempt_number) do nothing`,
        [
          item.id,
          item.attempts,
          providerCode,
          message,
          requestHash ?? sha256(item.payload),
        ],
      );
      await tx.query(
        `update integration.outbox
            set status = 'error', last_error = $2,
                available_at = now() + interval '15 minutes', updated_at = now()
          where id = $1 and status = 'processing'`,
        [item.id, message],
      );
    });
    return { outboxId: item.id, status: 'error', error: message };
  }

  private transaction<T>(
    work: (transaction: SqlTransaction) => Promise<T>,
  ): Promise<T> {
    return withTenantContext(this.database, this.requestContext, (tx) =>
      work(tx as SqlTransaction),
    );
  }
}

function sha256(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function medicalResult(result: string): SubmitMedicalExamInput['result'] {
  if (
    result === 'APTO' ||
    result === 'APTO_COM_RESTRICOES' ||
    result === 'INAPTO_TEMPORARIO' ||
    result === 'INAPTO'
  ) {
    return result;
  }
  throw new Error(`Unsupported medical RENACH result: ${result}`);
}

function psychologicalResult(
  result: string,
): SubmitPsychologicalEvaluationInput['result'] {
  if (
    result === 'APTO' ||
    result === 'INAPTO_TEMPORARIO' ||
    result === 'INAPTO'
  ) {
    return result;
  }
  throw new Error(`Unsupported psychological RENACH result: ${result}`);
}

function requestKind(
  request: SubmitMedicalExamInput | SubmitPsychologicalEvaluationInput,
): 'MEDICAL' | 'PSYCH' {
  return 'driver' in request ? 'MEDICAL' : 'PSYCH';
}
