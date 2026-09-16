// CTG-0003 §4.5 e §11.8 (R-0008, TASK-0007) — `POST
// /v1/ops/evidence/{id}/custody-events`. A cadeia é append-only e registra
// tudo: nenhum estado é negado. `event_type` é vocabulário de modelagem desta
// rodada (onze tokens, sem check na coluna), não token canônico de workflow.
import { DetranError } from '@detran/shared';

import {
  appendEvent,
  CUSTODY_EVENT_TYPES,
  findRow,
  insertRow,
  inTenantTransaction,
  isCustodyEventType,
  isoOf,
  nextCustodyVersion,
  scopeOf,
  stringOf,
  tenantMismatch,
  type EvidenceDeps,
} from './evidence-runtime.js';
import { custodyRecordedEvent } from './events.js';

export {
  CUSTODY_EVENT_TYPES,
  isCustodyEventType,
  type CustodyEventType,
} from './evidence-runtime.js';

export interface AddCustodyEventInput {
  event_type: string;
  event_at?: string;
  user_ref?: string;
  system_name?: string;
  details_json?: Record<string, unknown>;
}

export interface AddCustodyEventResult {
  id: string;
  evidence_id: string;
  event_type: string;
  event_at: string;
}

export class AddCustodyEventCommand {
  constructor(private readonly deps: EvidenceDeps) {}

  async execute(
    evidenceId: string,
    input: AddCustodyEventInput,
  ): Promise<AddCustodyEventResult> {
    const eventType = stringOf(input?.event_type ?? '');
    if (!isCustodyEventType(eventType))
      throw new DetranError('TEAT.ENUM_INVALID', {
        status: 422,
        context: { field: 'event_type', allowed: [...CUSTODY_EVENT_TYPES] },
        message: 'Tipo de evento de custódia fora do vocabulário.',
      });

    const scope = scopeOf(this.deps);
    const eventAt = input.event_at ? isoOf(input.event_at) : scope.occurredAt;

    return inTenantTransaction(this.deps, async (tx) => {
      const evidence = await findRow(this.deps, tx, 'evidence', evidenceId);
      if (!evidence) throw tenantMismatch({ evidenceId });

      const version = await nextCustodyVersion(this.deps, tx, evidenceId);
      const custodyEvent = await insertRow(this.deps, tx, 'custodyEvents', {
        evidence_id: evidenceId,
        event_type: eventType,
        event_at: eventAt,
        user_ref: stringOf(input.user_ref ?? scope.actorId),
        system_name: stringOf(input.system_name ?? 'detran-backend'),
        details_json: input.details_json ?? null,
      });

      await appendEvent(
        this.deps,
        tx,
        custodyRecordedEvent(
          scope,
          {
            evidenceId,
            custodyEventId: stringOf(custodyEvent.id),
            eventType,
            eventAt,
          },
          version,
        ),
      );

      return {
        id: stringOf(custodyEvent.id),
        evidence_id: evidenceId,
        event_type: eventType,
        event_at: eventAt,
      };
    });
  }
}
