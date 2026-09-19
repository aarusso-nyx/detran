// Timers `owner='portal'` de `inf.infraction_timer_ref` (DDL 14, manuscrito;
// work/rounds/R-0009/contracts/CTG-0002.md §6.3; plan R-0009 M14).
// `backend/domains/inf/deadlines` não é tocado (R-0007): o Portal mantém aqui
// o espelho tipado só dos quatro códigos e lê a duração do vocabulário
// manuscrito na transação do comando — o literal 30 nunca aparece em código.
// `T-LGPD-ACESSO` (`source_pending`, OD-P08) e `T-AVAL-CONVITE` (imediato)
// não têm `duration_value` e devolvem `null`.
import {
  PortalError,
  type PortalSqlTransaction,
} from '@detran/portal-identity';

export const PORTAL_TIMER_CODES = [
  'T-OUV-RESPOSTA',
  'T-OUV-INFO',
  'T-LGPD-ACESSO',
  'T-AVAL-CONVITE',
] as const;
export type PortalTimerCode = (typeof PORTAL_TIMER_CODES)[number];

/** Única unidade admitida para `addCalendarDays` (DDL 14: `dias_corridos`). */
const CALENDAR_DAYS_UNIT = 'dias_corridos';

const TIMER_SQL = `select duration_value, duration_unit
     from inf.infraction_timer_ref
    where code = $1
    limit 1`;

interface TimerRow extends Record<string, unknown> {
  duration_value: number | string | null;
  duration_unit: string | null;
}

/**
 * Duração em dias corridos do timer, lida de `inf.infraction_timer_ref`;
 * `null` quando o vocabulário não fixa valor. Linha ausente ou unidade fora
 * de `dias_corridos` é defeito de configuração (nunca um valor inventado).
 */
export async function durationOf(
  tx: PortalSqlTransaction,
  code: PortalTimerCode,
): Promise<number | null> {
  const row = (await tx.query<TimerRow>(TIMER_SQL, [code])).rows[0];
  if (!row) {
    throw new PortalError('PORTAL.INTERNAL', {
      status: 500,
      context: { timerCode: code },
    });
  }
  if (row.duration_value === null || row.duration_value === undefined) {
    return null;
  }
  if (row.duration_unit !== CALENDAR_DAYS_UNIT) {
    throw new PortalError('PORTAL.INTERNAL', {
      status: 500,
      context: { timerCode: code, durationUnit: row.duration_unit },
    });
  }
  return Number(row.duration_value);
}
