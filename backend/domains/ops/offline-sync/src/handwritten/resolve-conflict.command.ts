// CTG-0002 §5.13 (R-0008, TASK-0005) — `POST /v1/ops/offline-sync/
// sync-conflicts/{id}/resolve`.
//
// `manual_review` grava a decisão e **mantém** o conflito `open`: num conflito
// de concorrência a apuração só se encerra por `aits/{id}/concurrency-review`
// (CTG-0001 §4.8), nunca por esta rota.
import { teatEventSink } from '@detran/ops-core';
import { DetranError } from '@detran/shared';

import {
  clockOf,
  tenantMismatch,
  tenantScope,
  validationFailed,
  type OfflineSyncDeps,
} from './batch-protocol.js';
import { syncConflictResolvedEvent } from './events.js';
import { inTransaction } from './numbering-sql.js';

const RESOLUTION_ACTIONS = [
  'manual_review',
  'accept_server',
  'reject',
  'retry_after_correction',
] as const;

type ResolutionAction = (typeof RESOLUTION_ACTIONS)[number];

/** §5.13 — efeito da ação sobre `ops.sync_queue_item`. */
const ITEM_STATUS: Readonly<Record<string, string>> = {
  accept_server: 'rejected',
  reject: 'rejected',
  retry_after_correction: 'pending',
};

export interface ResolveSyncConflictInput {
  resolved_by_user_ref?: string;
  resolution_action?: string;
  description?: string;
}

export interface ResolveSyncConflictResponse {
  id: string;
  status: string;
  resolution_action: string;
  resolved_at: string | null;
}

interface ConflictRow extends Record<string, unknown> {
  id: string;
  sync_queue_item_id: string;
  conflict_type: string;
  allowed_resolution_actions: string[] | null;
  status: string;
}

export class ResolveSyncConflictCommand {
  constructor(private readonly deps: OfflineSyncDeps) {}

  async execute(
    id: string,
    input: ResolveSyncConflictInput,
  ): Promise<ResolveSyncConflictResponse> {
    const { tenantId, actorId } = tenantScope(this.deps);
    const now = clockOf(this.deps).now();
    const action = String(input.resolution_action ?? '') as ResolutionAction;
    if (!RESOLUTION_ACTIONS.includes(action))
      throw validationFailed([{ path: 'resolution_action', rule: 'enum' }]);
    if (!input.resolved_by_user_ref)
      throw validationFailed([
        { path: 'resolved_by_user_ref', rule: 'required' },
      ]);

    return inTransaction(this.deps, async (scope) => {
      const found = await scope.query<ConflictRow>(
        `select * from ops.sync_conflict where tenant_id = $1 and id = $2 for update`,
        [tenantId, id],
      );
      const conflict = found.rows[0];
      if (!conflict) throw tenantMismatch();
      // `manual_review` não resolve: encaminha. É sempre admitido enquanto o
      // conflito está aberto; a lista `allowed_resolution_actions` governa as
      // ações que **encerram** o conflito (§5.13).
      const allowed = conflict.allowed_resolution_actions ?? [];
      if (
        conflict.status !== 'open' ||
        (action !== 'manual_review' && !allowed.includes(action))
      )
        throw new DetranError('TEAT.SYNC_ITEM_CONFLICT', {
          status: 409,
          context: {
            conflictId: conflict.id,
            conflictType: conflict.conflict_type,
          },
          message: 'Ação de resolução não admitida para este conflito.',
        });

      const details = { description: input.description ?? null };
      if (action === 'manual_review') {
        await scope.query(
          `update ops.sync_conflict
              set resolution_action = $2, resolution_details_json = $3::jsonb,
                  updated_at = now()
            where id = $1`,
          [conflict.id, action, JSON.stringify(details)],
        );
        return {
          id: conflict.id,
          status: 'open',
          resolution_action: action,
          resolved_at: null,
        };
      }

      await scope.query(
        `update ops.sync_conflict
            set status = 'resolved', resolved_by_user_ref = $2, resolved_at = $3,
                resolution_action = $4, resolution_details_json = $5::jsonb,
                updated_at = now()
          where id = $1`,
        [
          conflict.id,
          String(input.resolved_by_user_ref),
          now,
          action,
          JSON.stringify(details),
        ],
      );
      await scope.query(
        `update ops.sync_queue_item set status = $2, updated_at = now()
          where tenant_id = $1 and id = $3`,
        [tenantId, ITEM_STATUS[action]!, conflict.sync_queue_item_id],
      );
      await teatEventSink(this.deps.outbox).append(
        scope.transaction,
        syncConflictResolvedEvent(
          { tenantId, actorId, occurredAt: now },
          {
            conflictId: conflict.id,
            conflictType: conflict.conflict_type,
            resolutionAction: action,
            resolvedAt: now,
          },
        ),
      );
      return {
        id: conflict.id,
        status: 'resolved',
        resolution_action: action,
        resolved_at: now,
      };
    });
  }
}
