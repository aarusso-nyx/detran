// CTG-0002 §4.7 (M6, RN-TEAT-111, AC-TEAT-012-2/4/5) — detecção de
// concorrência entre dispositivos do mesmo agente.
import type { OpsRow } from '@detran/ops-core';

import { numberOf } from './batch-protocol.js';

/** Chave real do `parameter-catalogue.md` §TEAT (surface `teat`). */
export const CONCURRENCY_WINDOW_KEY = 'sync.concurrency_window_minutes';
export const CONCURRENCY_WINDOW_WARNING =
  'SYNC_CONCURRENCY_WINDOW_SOURCE_PENDING';

const MINUTE_MS = 60_000;

export interface ConcurrencyWindow {
  /** `null` ⇒ detecção desligada (linha ausente ou `value_json` nulo). */
  minutes: number | null;
}

export function windowFrom(row: {
  value_json?: unknown;
  source_pending?: boolean;
}): ConcurrencyWindow {
  const value = row.value_json;
  if (value === null || value === undefined) return { minutes: null };
  const minutes = numberOf(value);
  return Number.isFinite(minutes) ? { minutes } : { minutes: null };
}

function millis(value: unknown): number {
  return new Date(String(value)).getTime();
}

export interface CandidateQuery {
  items: readonly OpsRow[];
  handoffs: readonly OpsRow[];
  agentId: string;
  deviceId: string;
  createdLocallyAt: string;
  windowMinutes: number;
  excludeItemId: string;
}

/**
 * Itens `ait` do mesmo agente, em outro dispositivo, ainda não liquidados e
 * dentro da janela — descontados os pares cobertos por um handoff declarado
 * (AC-TEAT-012-4: troca autorizada não é anomalia).
 */
export function concurrentCandidates(query: CandidateQuery): OpsRow[] {
  const target = millis(query.createdLocallyAt);
  if (!Number.isFinite(target)) return [];
  const window = query.windowMinutes * MINUTE_MS;
  return query.items.filter((row) => {
    if (String(row.id) === query.excludeItemId) return false;
    if (String(row.entity_type) !== 'ait') return false;
    if (String(row.agent_id) !== query.agentId) return false;
    if (String(row.device_id) === query.deviceId) return false;
    const status = String(row.status ?? '');
    if (status !== 'pending' && status !== 'received') return false;
    const other = millis(row.created_locally_at);
    if (!Number.isFinite(other)) return false;
    if (Math.abs(other - target) > window) return false;
    return !coveredByHandoff(
      query.handoffs,
      query.agentId,
      target,
      other,
      window,
    );
  });
}

function coveredByHandoff(
  handoffs: readonly OpsRow[],
  agentId: string,
  first: number,
  second: number,
  window: number,
): boolean {
  const from = Math.min(first, second) - window;
  const to = Math.max(first, second) + window;
  return handoffs.some((row) => {
    if (
      String(row.from_agent_id) !== agentId &&
      String(row.to_agent_id) !== agentId
    )
      return false;
    const at = millis(row.handed_off_at);
    return Number.isFinite(at) && at >= from && at <= to;
  });
}

export function windowBounds(
  createdLocallyAt: string,
  windowMinutes: number,
): { windowStart: string; windowEnd: string } {
  const target = millis(createdLocallyAt);
  const window = windowMinutes * MINUTE_MS;
  return {
    windowStart: new Date(target - window).toISOString(),
    windowEnd: new Date(target + window).toISOString(),
  };
}
