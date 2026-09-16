// CTG-0004 §3.1 (R-0008, TASK-0009, [WF-TEAT-005] §Limiares) — classificação
// do resultado considerado pelos limiares da tabela metrológica.
export type AlcoholResultClassification =
  'RESULTADO_ABAIXO_LIMITE' | 'RESULTADO_ADMINISTRATIVO' | 'RESULTADO_CRIME';

export function classifyConsidered(
  consideredMgL: number,
  thresholds: { administrative: number; crime: number },
): AlcoholResultClassification {
  if (consideredMgL >= thresholds.crime) return 'RESULTADO_CRIME';
  if (consideredMgL >= thresholds.administrative)
    return 'RESULTADO_ADMINISTRATIVO';
  return 'RESULTADO_ABAIXO_LIMITE';
}
