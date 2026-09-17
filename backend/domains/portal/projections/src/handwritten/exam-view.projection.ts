// Source events: aggregate.kind = 'exam' (type ch.exam.*) — esqueleto (produtor PEC, OD-P19)
//
// Projeção `portal.exam_view` (work/rounds/R-0009/contracts/CTG-0002.md §7.2;
// plan R-0009 M16): só a tabela + projetor esqueleto — um evento de agregado
// `exam` grava `last_event_id` na linha existente; sem linha → `not_consumed`
// (nada gravado). O produtor real (PEC/ch) fixa o `data`.
import { touchSkeletonRow } from './crash-view.projection.js';
import {
  PROJECTION_SENTINEL_EVENT_ID,
  type PortalConsumedEvent,
  type ProjectionContext,
  type ProjectionResult,
  type Projector,
} from './projection-contract.js';

export const EXAM_AGGREGATE_KIND = 'exam';

const ROW_SQL = `select id from portal.exam_view where exam_id = $1 for update`;

const TOUCH_SQL = `update portal.exam_view set last_event_id = $2, updated_at = $3 where id = $1`;

const RESET_SQL = `update portal.exam_view set last_event_id = $2, updated_at = $3 where last_event_id = any($1)`;

export class ExamViewProjector implements Projector {
  readonly projection = 'exam_view' as const;
  readonly sourceEvents = ['ch.exam.* (aggregate.kind = exam)'] as const;

  apply(
    event: PortalConsumedEvent,
    context: ProjectionContext,
  ): Promise<ProjectionResult> {
    if (event.aggregate.kind !== EXAM_AGGREGATE_KIND) {
      return Promise.resolve({ kind: 'skipped', reason: 'not_consumed' });
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
