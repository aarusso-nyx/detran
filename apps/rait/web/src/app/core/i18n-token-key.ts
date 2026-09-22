// Composição das chaves i18n dos nove namespaces de token da semente (plan.md M5/A1; contrato
// CTG-0002a §9): `rait.caseState`, …, `rait.timer` não são allowlistáveis no verificador de
// parâmetros (gramática `[a-z][a-z0-9_]*`; `rait.timer` colide com as chaves de parâmetro `rait.timer` + `.T-…` do catálogo),
// então nenhum literal estático com esses prefixos existe em `src/**` — toda chave passa por
// `tokenKey`. O token vem dos contratos gerados; a UI só traduz o rótulo (glossário §2.1).

export const RAIT_TOKEN_NAMESPACES = [
  'caseState',
  'sessionState',
  'infractionState',
  'infractionSubstate',
  'riskFlag',
  'memberStatus',
  'orgState',
  'closureMotive',
  'timer',
] as const;

export type RaitTokenNamespace = (typeof RAIT_TOKEN_NAMESPACES)[number];

const ROOT = 'rait';

/** `tokenKey('caseState', 'ADMITIDO')` → chave do rótulo do token no catálogo. */
export function tokenKey(namespace: RaitTokenNamespace, token: string): string {
  return `${ROOT}.${namespace}.${token}`;
}
