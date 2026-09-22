// Source events: SINISTRO_* (aggregate.kind = crash | crash-record |
// crash-renaest-submission). A leitura cruzada permitida continua no dispatcher
// da outbox; este projetor só recebe o envelope canônico.
//
// Projeção `portal.crash_view` (work/rounds/R-0009/contracts/CTG-0002.md §7.2;
// plan R-0009 M16): só a tabela + projetor esqueleto — um evento de agregado
// `crash` grava `last_event_id` na linha existente; sem linha → `not_consumed`
// (nada gravado). O produtor real (est/crash, R-0010) fixa o `data`.
export const consumedEvents = ['SINISTRO_*'] as const;

import type { PortalSqlTransaction } from '@detran/portal-identity';

import {
  PROJECTION_SENTINEL_EVENT_ID,
  type PortalConsumedEvent,
  type ProjectionContext,
  type ProjectionResult,
  type Projector,
} from './projection-contract.js';

export const CRASH_AGGREGATE_KIND = [
  'crash',
  'crash-record',
  'crash-renaest-submission',
] as const;

const ROW_SQL = `select id from portal.crash_view where crash_id = $1 for update`;

const TOUCH_SQL = `update portal.crash_view set last_event_id = $2, updated_at = $3 where id = $1`;

const RESET_SQL = `update portal.crash_view set last_event_id = $2, updated_at = $3 where last_event_id = any($1)`;

/** Esqueleto comum de `crash_view`/`exam_view`: só `last_event_id` (§7.2). */
export async function touchSkeletonRow(
  tx: PortalSqlTransaction,
  rowSql: string,
  touchSql: string,
  targetId: string,
  eventId: string,
  now: Date,
): Promise<ProjectionResult> {
  const row = (await tx.query<{ id: string }>(rowSql, [targetId])).rows[0];
  if (!row) return { kind: 'skipped', reason: 'not_consumed' };
  await tx.query(touchSql, [row.id, eventId, now]);
  return { kind: 'applied' };
}

export class CrashViewProjector implements Projector {
  readonly projection = 'crash_view' as const;
  readonly sourceEvents = [
    'SINISTRO_* (aggregate.kind = crash | crash-record | crash-renaest-submission)',
  ] as const;

  apply(
    event: PortalConsumedEvent,
    context: ProjectionContext,
  ): Promise<ProjectionResult> {
    if (!CRASH_AGGREGATE_KIND.includes(event.aggregate.kind as never)) {
      return Promise.resolve({ kind: 'skipped', reason: 'not_consumed' });
    }
    if (
      event.aggregate.kind !== 'crash' &&
      event.data.identityStatus === 'source_pending'
    ) {
      // CPF ou hash enviado pela requisição não é vínculo canônico. A linha
      // cidadão só nasce quando o emissor trouxer a relação autorizada.
      return Promise.resolve({ kind: 'applied' });
    }
    return touchSkeletonRow(
      context.tx,
      ROW_SQL,
      TOUCH_SQL,
      event.aggregate.id,
      event.id,
      context.now,
    );
  }

  async reset(
    context: ProjectionContext,
    windowEventIds: readonly string[],
  ): Promise<void> {
    if (windowEventIds.length === 0) return;
    await context.tx.query(RESET_SQL, [
      [...windowEventIds],
      PROJECTION_SENTINEL_EVENT_ID,
      context.now,
    ]);
  }
}
