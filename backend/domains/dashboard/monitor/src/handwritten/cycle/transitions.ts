// Guardas de transição do ciclo (CTG-0002 §6.1, §7.3, §14.1): a guarda lê as
// tabelas `dashboard.alert_transition_ref` (13 linhas, A8) e
// `dashboard.duty_transition_ref` (11 linhas, CTG-0001 §3.4) — nunca uma
// matriz em código. Uma transição `(from_state, to_state)` do alerta é
// permitida quando existe linha com `track ∈ {'both', alert.track}`; o ator
// (`system`, `owner`, `dash-operator`, `owner|dash-operator`) é a coluna
// `actor`. Estados terminais são os sem linha de saída (ENCERRADO,
// INCIDENTE_REGISTRADO; ARQUIVADO, NAO_CUMPRIDO). Tabelas globais (sem
// `tenant_id`, DDL 19).
import { DetranError } from '@detran/shared';

import type { AlertState, AlertTrack, DutyState } from './tokens.js';
import { query, type CycleSqlTransaction } from './tokens.js';

export type AlertTransitionActor = 'system' | 'owner' | 'dash-operator';
export type DutyTransitionActor =
  'system' | 'dash-duty-owner' | 'dash-operator';

export interface AlertTransitionRow extends Record<string, unknown> {
  seq: number;
  from_state: AlertState | null;
  to_state: AlertState;
  actor: string;
  track: 'both' | AlertTrack;
}

export interface DutyTransitionRow extends Record<string, unknown> {
  seq: number;
  from_state: DutyState | null;
  to_state: DutyState;
  actor: string;
}

export async function loadAlertTransitions(
  tx: CycleSqlTransaction,
): Promise<AlertTransitionRow[]> {
  const result = await query<AlertTransitionRow>(
    tx,
    `select seq, from_state, to_state, actor, track
       from dashboard.alert_transition_ref order by seq`,
  );
  return result.rows.map((row) => ({ ...row, seq: Number(row.seq) }));
}

export async function loadDutyTransitions(
  tx: CycleSqlTransaction,
): Promise<DutyTransitionRow[]> {
  const result = await query<DutyTransitionRow>(
    tx,
    `select seq, from_state, to_state, actor
       from dashboard.duty_transition_ref order by seq`,
  );
  return result.rows.map((row) => ({ ...row, seq: Number(row.seq) }));
}

const actorAdmits = (column: string, actor: string): boolean =>
  column.split('|').includes(actor);

// ---------------------------------------------------------------------------
// alerta (§6.1)
// ---------------------------------------------------------------------------

export interface AlertTransitionSubject {
  state: AlertState;
  track: AlertTrack;
  id?: string;
}

/** Linhas de saída de `(state, track)` na ordem de `seq`. */
export function alertTransitionsFrom(
  transitions: readonly AlertTransitionRow[],
  alert: AlertTransitionSubject,
): AlertTransitionRow[] {
  return transitions.filter(
    (row) =>
      row.from_state === alert.state &&
      (row.track === 'both' || row.track === alert.track),
  );
}

/** Destinos permitidos (distintos, ordem de `seq`) — `context.allowed`. */
export function allowedAlertTargets(
  transitions: readonly AlertTransitionRow[],
  alert: AlertTransitionSubject,
): AlertState[] {
  return [
    ...new Set(alertTransitionsFrom(transitions, alert).map((r) => r.to_state)),
  ];
}

/** Só o estado: `DASH.ALERT_STATE_INVALID` (409, `allowed[]`) quando o par
 *  `(state → to)` não existe para a trilha. Devolve as linhas do par. */
export function assertAlertState(
  transitions: readonly AlertTransitionRow[],
  alert: AlertTransitionSubject,
  to: AlertState,
): AlertTransitionRow[] {
  const candidates = alertTransitionsFrom(transitions, alert);
  const rows = candidates.filter((row) => row.to_state === to);
  if (rows.length === 0) {
    throw new DetranError('DASH.ALERT_STATE_INVALID', {
      status: 409,
      context: {
        ...(alert.id ? { alertId: alert.id } : {}),
        currentState: alert.state,
        track: alert.track,
        allowed: [...new Set(candidates.map((row) => row.to_state))],
      },
    });
  }
  return rows;
}

/** Estado + ator: `DASH.ALERT_STATE_INVALID` (409) quando o par não existe
 *  na tabela; `DASH.FORBIDDEN_ACTION` (403, `attemptedAction`) quando existe
 *  mas nenhuma linha admite o ator. Devolve a linha que casou. */
export function assertAlertTransition(
  transitions: readonly AlertTransitionRow[],
  alert: AlertTransitionSubject,
  to: AlertState,
  actor: AlertTransitionActor,
): AlertTransitionRow {
  const rows = assertAlertState(transitions, alert, to);
  const matched = rows.find((row) => actorAdmits(row.actor, actor));
  if (!matched) {
    throw new DetranError('DASH.FORBIDDEN_ACTION', {
      status: 403,
      context: {
        ...(alert.id ? { alertId: alert.id } : {}),
        attemptedAction: `${alert.state}->${to}`,
        actor,
        currentState: alert.state,
      },
    });
  }
  return matched;
}

/** Terminal = sem linha de saída (ENCERRADO, INCIDENTE_REGISTRADO). */
export function isTerminalAlertState(
  transitions: readonly AlertTransitionRow[],
  state: AlertState,
): boolean {
  return !transitions.some((row) => row.from_state === state);
}

// ---------------------------------------------------------------------------
// dever (§7.3)
// ---------------------------------------------------------------------------

export interface DutyTransitionSubject {
  state: DutyState;
  dutyId: string;
  period: string;
}

export function isTerminalDutyState(
  transitions: readonly DutyTransitionRow[],
  state: DutyState,
): boolean {
  return !transitions.some((row) => row.from_state === state);
}

/** Guardas 2 e 3 de §7.3: terminal → `DASH.DUTY_ALREADY_ARCHIVED` (409);
 *  par ausente → `DASH.DUTY_STATE_INVALID` (409, `dutyId`, `period`,
 *  `currentState`). `actor` só participa quando informado. */
export function assertDutyTransition(
  transitions: readonly DutyTransitionRow[],
  cycle: DutyTransitionSubject,
  to: DutyState,
  actor?: DutyTransitionActor,
): DutyTransitionRow {
  if (isTerminalDutyState(transitions, cycle.state)) {
    throw new DetranError('DASH.DUTY_ALREADY_ARCHIVED', {
      status: 409,
      context: {
        dutyId: cycle.dutyId,
        period: cycle.period,
        currentState: cycle.state,
      },
    });
  }
  const rows = transitions.filter(
    (row) => row.from_state === cycle.state && row.to_state === to,
  );
  if (rows.length === 0) {
    throw new DetranError('DASH.DUTY_STATE_INVALID', {
      status: 409,
      context: {
        dutyId: cycle.dutyId,
        period: cycle.period,
        currentState: cycle.state,
        allowed: [
          ...new Set(
            transitions
              .filter((row) => row.from_state === cycle.state)
              .map((row) => row.to_state),
          ),
        ],
      },
    });
  }
  const matched = actor
    ? rows.find((row) => actorAdmits(row.actor, actor))
    : rows[0];
  if (!matched) {
    throw new DetranError('DASH.FORBIDDEN_ACTION', {
      status: 403,
      context: {
        dutyId: cycle.dutyId,
        period: cycle.period,
        attemptedAction: `${cycle.state}->${to}`,
        actor,
      },
    });
  }
  return matched;
}
