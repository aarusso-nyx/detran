// CTG-0003 §4.9 (RN-TEAT-142, R-0008, TASK-0007) — `POST
// /v1/ops/evidence-access-requests`. O rol do art. 13 é fechado e é o mesmo
// do check `ck_ops_evidence_access_requester_role` (DDL 17). Sem token em §8,
// nada é publicado (§11.7): o efeito observável é a linha `requested`.
import { DetranError } from '@detran/shared';

import {
  insertRow,
  inTenantTransaction,
  isEvidenceAccessRequesterRole,
  requesterNotInRol,
  stringOf,
  validationFailed,
  type EvidenceDeps,
} from './evidence-runtime.js';

export {
  EVIDENCE_ACCESS_REQUESTER_ROLES,
  isEvidenceAccessRequesterRole,
  requesterNotInRol,
  type EvidenceAccessRequesterRole,
} from './evidence-runtime.js';

export interface CreateAccessRequestInput {
  evidence_id: string;
  requester_name: string;
  requester_role: string;
  purpose: string;
  investigation_ref: string;
  legal_basis?: string;
}

export interface CreateAccessRequestResult {
  id: string;
  evidence_id: string;
  status: 'requested';
  requester_role: string;
  investigation_ref: string;
}

export class CreateAccessRequestCommand {
  constructor(private readonly deps: EvidenceDeps) {}

  async execute(
    input: CreateAccessRequestInput,
  ): Promise<CreateAccessRequestResult> {
    const requesterRole = stringOf(input?.requester_role ?? '');
    if (!isEvidenceAccessRequesterRole(requesterRole))
      throw requesterNotInRol(requesterRole);

    const evidenceId = stringOf(input?.evidence_id ?? '').trim();
    const requesterName = stringOf(input?.requester_name ?? '').trim();
    const purpose = stringOf(input?.purpose ?? '').trim();
    const investigationRef = stringOf(input?.investigation_ref ?? '').trim();
    const fields = [
      ...(evidenceId ? [] : [{ path: 'evidence_id', rule: 'required' }]),
      ...(requesterName ? [] : [{ path: 'requester_name', rule: 'required' }]),
      // A Portaria vincula o uso à finalidade da requisição (RN-TEAT-142).
      ...(purpose ? [] : [{ path: 'purpose', rule: 'required' }]),
      ...(investigationRef
        ? []
        : [{ path: 'investigation_ref', rule: 'required' }]),
    ];
    if (fields.length > 0) throw validationFailed(fields);

    return inTenantTransaction(this.deps, async (tx) => {
      const created = await insertRow(this.deps, tx, 'accessRequests', {
        evidence_id: evidenceId,
        requester_name: requesterName,
        requester_role: requesterRole,
        investigation_ref: investigationRef,
        purpose,
        legal_basis: input.legal_basis ?? null,
        status: 'requested',
      });
      return {
        id: stringOf(created.id),
        evidence_id: evidenceId,
        status: 'requested',
        requester_role: requesterRole,
        investigation_ref: investigationRef,
      };
    });
  }
}
