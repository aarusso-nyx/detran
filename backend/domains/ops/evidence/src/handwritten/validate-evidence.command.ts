// CTG-0003 §4.3 (M11, R-0008, TASK-0007) — `POST /v1/ops/evidence/{id}/validate`.
//
// `decision` é enum fechado (`valid|invalid`); `invalid` grava `rejected`,
// porque o check `ck_ops_evidence_status` não tem o token `invalid` (§13
// item 6, OD-T33). A validação não publica evento de domínio (§11.7): o
// registro observável é o `custody.event`.
import {
  appendEvent,
  findRow,
  insertRow,
  inTenantTransaction,
  nextCustodyVersion,
  patchRow,
  quarantined,
  scopeOf,
  stateTransitionFailed,
  stringOf,
  tenantMismatch,
  validationFailed,
  type EvidenceDeps,
} from './evidence-runtime.js';
import { custodyRecordedEvent } from './events.js';

const DECISIONS = ['valid', 'invalid'] as const;
type Decision = (typeof DECISIONS)[number];

const STATUS_BY_DECISION: Record<Decision, 'validated' | 'rejected'> = {
  valid: 'validated',
  invalid: 'rejected',
};

const CUSTODY_EVENT_BY_DECISION: Record<Decision, 'validated' | 'rejected'> = {
  valid: 'validated',
  invalid: 'rejected',
};

export interface ValidateEvidenceInput {
  decision?: Decision;
  reason?: string;
  user_ref?: string;
}

export interface ValidateEvidenceResult {
  id: string;
  status: 'validated' | 'rejected';
  custody_event_id: string | null;
}

export class ValidateEvidenceCommand {
  constructor(private readonly deps: EvidenceDeps) {}

  async execute(
    evidenceId: string,
    input: ValidateEvidenceInput = {},
  ): Promise<ValidateEvidenceResult> {
    const decision = (input?.decision ?? 'valid') as Decision;
    if (!DECISIONS.includes(decision))
      throw validationFailed([{ path: 'decision', rule: 'enum' }]);
    const scope = scopeOf(this.deps);
    const target = STATUS_BY_DECISION[decision];

    return inTenantTransaction(this.deps, async (tx) => {
      const evidence = await findRow(this.deps, tx, 'evidence', evidenceId);
      if (!evidence) throw tenantMismatch({ evidenceId });
      if (evidence.status === 'quarantined') throw quarantined(evidenceId);

      // Idempotência: repetir a mesma decisão sobre a evidência que já a
      // carrega não é transição nenhuma, e por isso não é 422 (§4.3 trata
      // `validate` como decisão registrada, não como avanço obrigatório).
      if (evidence.status === target)
        return { id: evidenceId, status: target, custody_event_id: null };

      if (evidence.status !== 'uploaded') throw stateTransitionFailed();

      await patchRow(this.deps, tx, 'evidence', evidenceId, {
        status: target,
      });
      const version = await nextCustodyVersion(this.deps, tx, evidenceId);
      const custodyEvent = await insertRow(this.deps, tx, 'custodyEvents', {
        evidence_id: evidenceId,
        event_type: CUSTODY_EVENT_BY_DECISION[decision],
        event_at: scope.occurredAt,
        user_ref: stringOf(input.user_ref ?? scope.actorId),
        system_name: 'detran-backend',
        details_json: { reason: input.reason ?? null },
      });

      await appendEvent(
        this.deps,
        tx,
        custodyRecordedEvent(
          scope,
          {
            evidenceId,
            custodyEventId: stringOf(custodyEvent.id),
            eventType: CUSTODY_EVENT_BY_DECISION[decision],
            eventAt: scope.occurredAt,
          },
          version,
        ),
      );

      return {
        id: evidenceId,
        status: target,
        custody_event_id: stringOf(custodyEvent.id),
      };
    });
  }
}
