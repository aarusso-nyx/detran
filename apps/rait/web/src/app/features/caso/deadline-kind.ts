// Classificação dos prazos exibidos nas abas do caso (contrato CTG-0002b §6.1 linha 13; ficha
// IU-RAIT-013; spec §9 "timers operacionais"): `T-DEC`, `T-JUL-24M`, `T-PAR-3A`, `T-R2`, `T-REM10`
// → `legal`; `T-DIL`, `T-VOTO`, `T-CONV` → `operacional`. Só rótulo: nenhum prazo é calculado
// aqui ([RN-RAIT-005]).
import type { RaitTimerCode } from '../../data/models';
import type { DeadlineKind } from '../../shared/deadline-chip.component';

const OPERATIONAL_TIMERS: ReadonlySet<RaitTimerCode> = new Set<RaitTimerCode>([
  'T-DIL',
  'T-VOTO',
  'T-CONV',
]);

export function deadlineKindOf(timerCode: RaitTimerCode): DeadlineKind {
  return OPERATIONAL_TIMERS.has(timerCode) ? 'operacional' : 'legal';
}
