// CTG-0003 §4.11 (RN-TEAT-142, R-0008, TASK-0007) — `POST
// /v1/ops/evidence-access-requests/{id}/deliver`. Só de `approved`;
// `delivery_media_ref` e `delivered_at` andam juntos (check
// `ck_ops_evidence_access_delivered_complete`). A entrega **é** evento de
// custódia: é a única da família de acesso com token em §8.
import { DetranError } from '@detran/shared';

import {
  appendEvent,
  findRow,
  insertRow,
  inTenantTransaction,
  isEvidenceAccessRequesterRole,
  nextCustodyVersion,
  patchRow,
  requesterNotInRol,
  scopeOf,
  stringOf,
  tenantMismatch,
  validationFailed,
  type EvidenceDeps,
} from './evidence-runtime.js';
import { accessDeliveredEvent } from './events.js';

export interface DeliverAccessRequestInput {
  delivery_media_ref: string;
  user_ref?: string;
}

export interface DeliverAccessRequestResult {
  id: string;
  status: 'delivered';
  delivery_media_ref: string;
  delivered_at: string;
  custody_event_id: string;
}

export class DeliverAccessRequestCommand {
  constructor(private readonly deps: EvidenceDeps) {}

  async execute(
    requestId: string,
    input: DeliverAccessRequestInput,
  ): Promise<DeliverAccessRequestResult> {
    const scope = scopeOf(this.deps);
    const deliveryMediaRef = stringOf(input?.delivery_media_ref ?? '').trim();

    return inTenantTransaction(this.deps, async (tx) => {
      const request = await findRow(this.deps, tx, 'accessRequests', requestId);
      if (!request) throw tenantMismatch({ requestId });
      const currentState = stringOf(request.status);
      if (currentState !== 'approved')
        throw new DetranError('TEAT.EVIDENCE_ACCESS_STATE_INVALID', {
          status: 409,
          context: { requestId, currentState, allowed: ['approved'] },
          message: 'Entrega só é possível sobre requisição aprovada.',
        });
      if (!deliveryMediaRef)
        throw validationFailed([
          { path: 'delivery_media_ref', rule: 'required' },
        ]);

      await patchRow(this.deps, tx, 'accessRequests', requestId, {
        status: 'delivered',
        delivery_media_ref: deliveryMediaRef,
        delivered_at: scope.occurredAt,
      });

      const evidenceId = stringOf(request.evidence_id);
      // O check da DDL 17 fecha o rol; se a linha o violar, a entrega não
      // pode seguir com um papel fora do art. 13.
      const requesterRole = stringOf(request.requester_role);
      if (!isEvidenceAccessRequesterRole(requesterRole))
        throw requesterNotInRol(requesterRole);
      const investigationRef = stringOf(request.investigation_ref);
      const version = await nextCustodyVersion(this.deps, tx, evidenceId);
      const custodyEvent = await insertRow(this.deps, tx, 'custodyEvents', {
        evidence_id: evidenceId,
        event_type: 'access_delivered',
        event_at: scope.occurredAt,
        user_ref: stringOf(input.user_ref ?? scope.actorId),
        system_name: 'detran-backend',
        details_json: {
          accessRequestId: requestId,
          deliveryMediaRef,
          requesterRole,
          investigationRef,
        },
      });

      await appendEvent(
        this.deps,
        tx,
        accessDeliveredEvent(
          scope,
          {
            evidenceId,
            accessRequestId: requestId,
            custodyEventId: stringOf(custodyEvent.id),
            eventType: 'access_delivered',
            requesterRole,
            eventAt: scope.occurredAt,
          },
          version,
        ),
      );

      return {
        id: requestId,
        status: 'delivered',
        delivery_media_ref: deliveryMediaRef,
        delivered_at: scope.occurredAt,
        custody_event_id: stringOf(custodyEvent.id),
      };
    });
  }
}
