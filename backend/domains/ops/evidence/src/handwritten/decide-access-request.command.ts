// CTG-0003 §4.10 (RN-TEAT-142, R-0008, TASK-0007) — `POST
// /v1/ops/evidence-access-requests/{id}/approve` e `.../deny`. Só de
// `requested`; a autorização é motivada, então `approve` exige `legal_basis`.
// Nenhum evento de domínio (§11.7).
import { DetranError } from '@detran/shared';

import {
  findRow,
  insertRow,
  inTenantTransaction,
  nextCustodyVersion,
  patchRow,
  scopeOf,
  stringOf,
  tenantMismatch,
  validationFailed,
  type EvidenceDeps,
} from './evidence-runtime.js';

export type AccessDecision = 'approve' | 'deny';

const STATUS_BY_DECISION: Record<AccessDecision, 'approved' | 'denied'> = {
  approve: 'approved',
  deny: 'denied',
};

const CUSTODY_EVENT_BY_DECISION: Record<
  AccessDecision,
  'access_approved' | 'access_denied'
> = {
  approve: 'access_approved',
  deny: 'access_denied',
};

export interface DecideAccessRequestInput {
  user_ref?: string;
  legal_basis?: string;
  reason?: string;
}

export interface DecideAccessRequestResult {
  id: string;
  status: 'approved' | 'denied';
  decided_by_user_ref: string;
}

export class DecideAccessRequestCommand {
  constructor(private readonly deps: EvidenceDeps) {}

  async execute(
    requestId: string,
    decision: AccessDecision,
    input: DecideAccessRequestInput = {},
  ): Promise<DecideAccessRequestResult> {
    if (decision !== 'approve' && decision !== 'deny')
      throw validationFailed([{ path: 'decision', rule: 'enum' }]);
    const scope = scopeOf(this.deps);
    const decidedBy = stringOf(input.user_ref ?? scope.actorId);

    return inTenantTransaction(this.deps, async (tx) => {
      const request = await findRow(this.deps, tx, 'accessRequests', requestId);
      if (!request) throw tenantMismatch({ requestId });
      const currentState = stringOf(request.status);
      if (currentState !== 'requested')
        throw new DetranError('TEAT.EVIDENCE_ACCESS_STATE_INVALID', {
          status: 409,
          context: { requestId, currentState, allowed: ['requested'] },
          message: 'Requisição de acesso fora do estado admitido.',
        });
      if (decision === 'approve' && !stringOf(input.legal_basis ?? '').trim())
        throw validationFailed([{ path: 'legal_basis', rule: 'required' }]);

      const status = STATUS_BY_DECISION[decision];
      await patchRow(this.deps, tx, 'accessRequests', requestId, {
        status,
        decided_by_user_ref: decidedBy,
        ...(decision === 'approve'
          ? { legal_basis: stringOf(input.legal_basis) }
          : {}),
      });

      const evidenceId = stringOf(request.evidence_id);
      const version = await nextCustodyVersion(this.deps, tx, evidenceId);
      await insertRow(this.deps, tx, 'custodyEvents', {
        evidence_id: evidenceId,
        event_type: CUSTODY_EVENT_BY_DECISION[decision],
        event_at: scope.occurredAt,
        user_ref: decidedBy,
        system_name: 'detran-backend',
        details_json: {
          accessRequestId: requestId,
          reason: input.reason ?? null,
          version,
        },
      });

      return { id: requestId, status, decided_by_user_ref: decidedBy };
    });
  }
}
