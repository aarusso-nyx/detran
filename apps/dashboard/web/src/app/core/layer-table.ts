// Camadas de acesso do console — transcrição de policy.ts (linhas 1866-1921: `DASHBOARD_LAYER_RANK`,
// `DASHBOARD_LAYER_BY_ROLE`, `dashboardLayerFor`, `dashboardLayerAllows`) e de roles.ts
// (`canonicalRole`), enquanto OD-D16-006 não decide de onde o app lê a camada do usuário
// (subpath export de @detran/shared ou claim/endpoint de R-0011). Este arquivo é removido no
// mesmo PR que fechar a OD-D16-006; o backend permanece a autoridade (`DASH.LAYER_FORBIDDEN`).
import type { DashboardRoleCode } from '../app.route-manifest';

export type DashboardLayer = 'N0' | 'N1' | 'N2';
/** `'N3'` é exigência possível, nunca camada de usuário (manifesto invariante 4). */
export type DashboardLayerRequirement = DashboardLayer | 'N3';

export const DASHBOARD_LAYER_RANK: Readonly<Record<DashboardLayer, number>> = {
  N0: 0,
  N1: 1,
  N2: 2,
};

/** 14 entradas, mesma ordem da tabela original. */
export const DASHBOARD_LAYER_BY_ROLE: Readonly<
  Partial<Record<DashboardRoleCode, DashboardLayer>>
> = {
  'agency-admin': 'N2',
  GESTOR_DETRAN: 'N2',
  AUDITOR: 'N2',
  DPO: 'N2',
  'rait-manager': 'N2',
  'rait-coordinator': 'N2',
  'rait-chair': 'N2',
  'traffic-authority': 'N2',
  GESTOR: 'N2',
  'dash-operator': 'N1',
  'dash-duty-owner': 'N1',
  'technical-admin': 'N1',
  'integration-operator': 'N1',
  'bi-analyst': 'N1',
};

/** `canonicalRole`: `trim`; `'auditor'` → `'AUDITOR'`; demais inalterados. */
export function canonicalRoleCode(role: string): string {
  const trimmed = role.trim();
  return trimmed === 'auditor' ? 'AUDITOR' : trimmed;
}

/** Máximo das camadas dos papéis; papel fora da tabela conta como `N0`. */
export function dashboardLayerFor(roles: readonly string[]): DashboardLayer {
  let max: DashboardLayer = 'N0';
  for (const role of roles) {
    const layer =
      DASHBOARD_LAYER_BY_ROLE[canonicalRoleCode(role) as DashboardRoleCode];
    if (layer && DASHBOARD_LAYER_RANK[layer] > DASHBOARD_LAYER_RANK[max]) {
      max = layer;
    }
  }
  return max;
}

/** `'N3'` nega sempre — nenhuma camada de usuário alcança dado pessoal sensível. */
export function dashboardLayerAllows(
  roles: readonly string[],
  required: DashboardLayerRequirement,
): boolean {
  if (required === 'N3') return false;
  return (
    DASHBOARD_LAYER_RANK[dashboardLayerFor(roles)] >=
    DASHBOARD_LAYER_RANK[required]
  );
}
