// CTG-0004 §2, §4.5 (R-0008, TASK-0009, RN-TEAT-126, OD-T05) —
// `POST administrative-measures/{id}/terms`.
import { createHash } from 'node:crypto';

import { DetranError } from '@detran/shared';

import { measureTermIssuedEvent } from './events.js';
import { TERM_REMOVAL_REQUIRED_KEYS, missingKeys } from './term-content.js';
import {
  appendEvent,
  assertMeasureAllowed,
  findRow,
  inTenantTransaction,
  insertRow,
  recordHistory,
  scopeOf,
  stringOf,
  tenantMismatch,
  type MeasureDeps,
} from './measure-runtime.js';

const ALLOWED = [
  'RETIDO',
  'LIBERADO_LOCAL',
  'LIBERADO_COM_PRAZO',
  'REGULARIZADO',
  'CONVERTIDO_REMOCAO',
  'REMOVIDO',
] as const;

export interface IssueTermInput {
  term_type: string;
  term_number: string;
  content_hash?: string;
  file_evidence_id?: string;
  issued_at?: string;
  signed_by_person_id?: string;
  withdrawal_deadline_at?: string;
  field_details_json?: Record<string, unknown>;
  user_ref?: string;
  reason?: string;
  details_json?: Record<string, unknown>;
}

function dateOnly(value: unknown, fallback: string): string {
  const iso = stringOf(value || fallback);
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime())
    ? fallback.slice(0, 10)
    : parsed.toISOString().slice(0, 10);
}

function defaultContentHash(measureId: string, input: IssueTermInput): string {
  return createHash('sha256')
    .update(JSON.stringify({ measure_id: measureId, term: input }))
    .digest('hex');
}

export class IssueTermCommand {
  constructor(private readonly deps: MeasureDeps) {}

  async execute(
    measureId: string,
    input: IssueTermInput,
  ): Promise<Record<string, unknown>> {
    const scope = scopeOf(this.deps);
    const isRemoval = input.term_type === 'removal';

    if (isRemoval && !input.withdrawal_deadline_at) {
      throw new DetranError('TEAT.MEASURE_TERM_DEADLINE_MISSING', {
        status: 422,
        context: { missing: ['withdrawal_deadline_at'] },
        message:
          'Termo de remoção sem o prazo de retirada (Res. 1.025 art. 14 §1º).',
      });
    }
    if (isRemoval) {
      const missing = missingKeys(
        input.field_details_json,
        TERM_REMOVAL_REQUIRED_KEYS,
      );
      if (missing.length > 0)
        throw new DetranError('TEAT.MEASURE_TERM_MINIMUM_CONTENT', {
          status: 422,
          context: { missing },
          message:
            'Termo de remoção sem os sete elementos do caput do art. 14.',
        });
    }

    return inTenantTransaction(this.deps, async (tx) => {
      const measure = await findRow(this.deps, tx, 'measures', measureId);
      if (!measure) throw tenantMismatch({ measureId });
      const currentState = assertMeasureAllowed(
        measure,
        measureId,
        ALLOWED,
        'apply-term',
      );

      const issuedAt = input.issued_at ?? scope.occurredAt;
      let ctbDeadlineAt: string | null = null;
      if (isRemoval) {
        const startOn = dateOnly(issuedAt, scope.occurredAt.slice(0, 10));
        const due = await this.deps.deadlines.computeMeasureDue(
          'T-DEPOSITO6M',
          startOn,
          scope.tenantId,
        );
        ctbDeadlineAt = due.dueOn;
      }

      const contentHash =
        input.content_hash ?? defaultContentHash(measureId, input);
      const term = await insertRow(this.deps, tx, 'terms', {
        measure_id: measureId,
        term_type: input.term_type,
        term_number: input.term_number,
        content_hash: contentHash,
        file_evidence_id: input.file_evidence_id ?? null,
        issued_at: issuedAt,
        signed_by_person_id: input.signed_by_person_id ?? null,
        withdrawal_deadline_at: input.withdrawal_deadline_at ?? null,
        ctb_deadline_at: ctbDeadlineAt,
        field_details_json: input.field_details_json ?? null,
        status: 'issued',
      });
      await recordHistory(
        this.deps,
        tx,
        measureId,
        currentState,
        'Administrative term issued',
        scope.actorId,
      );
      await appendEvent(
        this.deps,
        tx,
        measureTermIssuedEvent(scope, {
          measureId,
          termId: stringOf(term.id),
          termType: input.term_type,
          termNumber: input.term_number,
          issuedAt,
          withdrawalDeadlineAt: input.withdrawal_deadline_at ?? null,
          ctbDeadlineAt,
          contentHash,
        }),
      );

      return {
        id: stringOf(term.id),
        measure_id: measureId,
        term_type: input.term_type,
        term_number: input.term_number,
        content_hash: contentHash,
        withdrawal_deadline_at: input.withdrawal_deadline_at ?? null,
        ctb_deadline_at: ctbDeadlineAt,
        status: 'issued',
      };
    });
  }
}
