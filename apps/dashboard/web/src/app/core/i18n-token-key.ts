// Composição de chave i18n a partir de token (CTG-0002.md §10; CTG-0001.md §1.1): única forma
// admitida de montar uma chave `dashboard.*` fora da lista estática da §10. `dashboard.clocks.*`
// NÃO entra aqui — é tabela estática (`CLOCK_LABEL_KEYS`, §8 item 5; OD-D16-007).
export type DashboardTokenNamespace =
  | 'alert_states'
  | 'duty_states'
  | 'severity'
  | 'freshness'
  | 'blocks'
  | 'layers'
  | 'classification'
  | 'indicators'
  | 'errors'
  | 'screens'
  | 'shell';

/** `'dashboard.' + ns + '.' + token` em minúsculas com `-` → `_` (M5). */
export function tokenKey(ns: DashboardTokenNamespace, token: string): string {
  return `dashboard.${ns}.${token.toLowerCase().replace(/-/g, '_')}`;
}
