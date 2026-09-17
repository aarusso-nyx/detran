// Source events: PENALIDADE_DEFINITIVA (inf.infraction.penalty-final)
//
// Projeção `portal.points_view` (work/rounds/R-0009/contracts/CTG-0002.md
// §7.2, §7.4; plan R-0009 M16). Chave `(tenant, subject_cpf_hash)`: o CPF vem
// da `infraction_view` do AIT (ausente → `PORTAL.INTERNAL:infraction_view:<aitId>`);
// `definitive_points += points`; `disputed_points` inalterado (pontuação por
// AIT em disputa é OD-P34); `last_12_months_json` na janela
// `addCalendarMonths(today, -12)`; `by_vehicle_json` acumulado por placa da
// view; `cached_at` inalterado (leitura RENACH é OD-P21).
import { z } from 'zod';
import { addCalendarMonths } from '@detran/inf-deadlines';

import {
  asArray,
  projectionError,
  type PortalConsumedEvent,
  type ProjectionContext,
  type ProjectionResult,
  type Projector,
} from './projection-contract.js';

export interface PointsMonthEntry {
  aitId: string;
  finalOn: string;
  points: number;
}

export interface PointsVehicleEntry {
  plate: string;
  points: number;
}

const PENALTY_DATA = z
  .object({
    aitId: z.uuid(),
    finalOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    points: z.number().int().min(0),
  })
  .passthrough();

const VIEW_SQL = `select subject_cpf_hash, plate
     from portal.infraction_view
    where ait_id = $1
    limit 1`;

const POINTS_FOR_UPDATE_SQL = `select id, definitive_points, disputed_points, by_vehicle_json, last_12_months_json
     from portal.points_view
    where subject_cpf_hash = $1
    for update`;

/** `tenant_id` pela trigger `auth.enforce_tenant_id` (DDL 65). */
const INSERT_POINTS_SQL = `insert into portal.points_view
      (subject_cpf_hash, definitive_points, disputed_points, by_vehicle_json,
       last_12_months_json, last_event_id, cached_at, created_at)
    values ($1, $2, 0, $3::jsonb, $4::jsonb, $5, null, $6)`;

const UPDATE_POINTS_SQL = `update portal.points_view
      set definitive_points = $2, by_vehicle_json = $3::jsonb, last_12_months_json = $4::jsonb,
          last_event_id = $5, updated_at = $6
    where id = $1`;

const RESET_SQL = `delete from portal.points_view where last_event_id = any($1)`;

interface PointsRow extends Record<string, unknown> {
  id: string;
  definitive_points: number | string;
  disputed_points: number | string;
  by_vehicle_json: unknown;
  last_12_months_json: unknown;
}

/** Janela de 12 meses (§7.4): `finalOn ≥ today − 12 meses`. */
export function twelveMonthWindowStart(today: string): string {
  return addCalendarMonths(today, -12);
}

export class PointsViewProjector implements Projector {
  readonly projection = 'points_view' as const;
  readonly sourceEvents = ['PENALIDADE_DEFINITIVA'] as const;

  async apply(
    event: PortalConsumedEvent,
    context: ProjectionContext,
  ): Promise<ProjectionResult> {
    if (event.domainEvent !== 'PENALIDADE_DEFINITIVA') {
      return { kind: 'skipped', reason: 'not_consumed' };
    }
    const parsed = PENALTY_DATA.safeParse(event.data);
    if (!parsed.success) return projectionError('data', event.id);
    const data = parsed.data;
    const view = (
      await context.tx.query<{ subject_cpf_hash: string; plate: string }>(
        VIEW_SQL,
        [data.aitId],
      )
    ).rows[0];
    if (!view) return projectionError('infraction_view', data.aitId);
    const row = (
      await context.tx.query<PointsRow>(POINTS_FOR_UPDATE_SQL, [
        view.subject_cpf_hash,
      ])
    ).rows[0];
    const windowStart = twelveMonthWindowStart(context.today);
    const lastTwelve = asArray<PointsMonthEntry>(
      row?.last_12_months_json,
    ).filter((entry) => entry.finalOn >= windowStart);
    if (data.finalOn >= windowStart) {
      lastTwelve.push({
        aitId: data.aitId,
        finalOn: data.finalOn,
        points: data.points,
      });
    }
    const byVehicle = asArray<PointsVehicleEntry>(row?.by_vehicle_json).map(
      (entry) => ({ ...entry }),
    );
    const vehicle = byVehicle.find((entry) => entry.plate === view.plate);
    if (vehicle) vehicle.points += data.points;
    else byVehicle.push({ plate: view.plate, points: data.points });
    const definitive = Number(row?.definitive_points ?? 0) + data.points;
    if (row) {
      await context.tx.query(UPDATE_POINTS_SQL, [
        row.id,
        definitive,
        JSON.stringify(byVehicle),
        JSON.stringify(lastTwelve),
        event.id,
        context.now,
      ]);
    } else {
      await context.tx.query(INSERT_POINTS_SQL, [
        view.subject_cpf_hash,
        definitive,
        JSON.stringify(byVehicle),
        JSON.stringify(lastTwelve),
        event.id,
        context.now,
      ]);
    }
    return { kind: 'applied' };
  }

  async reset(
    context: ProjectionContext,
    windowEventIds: readonly string[],
  ): Promise<void> {
    if (windowEventIds.length === 0) return;
    await context.tx.query(RESET_SQL, [[...windowEventIds]]);
  }
}
