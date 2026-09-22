// R-0016 TASK-0004 (Inspector). Transcrição independente de `route-manifest.md` §D
// ("DASHBOARD_LAYER_BY_ROLE") e de `policy.ts` linhas 1866-1921 (`DASHBOARD_LAYER_RANK`,
// `DASHBOARD_LAYER_BY_ROLE`, `dashboardLayerFor`, `dashboardLayerAllows`). Nunca importa
// `core/layer-table.ts` do app (ADR-0001; `CTG-0002.md` §Decisões 4 e §12) — o app tem a mesma
// tabela com o cabeçalho "transcrição de policy.ts; OD-D16-006" e este arquivo a transcreve de
// novo, de forma independente, para que o spec compare as duas.
export type DashboardLayerFixture = 'N0' | 'N1' | 'N2';
export type DashboardLayerRequirementFixture = DashboardLayerFixture | 'N3';

export const LAYER_RANK_FIXTURE: Readonly<
  Record<DashboardLayerFixture, number>
> = {
  N0: 0,
  N1: 1,
  N2: 2,
};

// route-manifest.md §D / policy.ts 1882-1899 — 14 entradas, mesma ordem.
export const LAYER_BY_ROLE_FIXTURE: Readonly<
  Record<string, DashboardLayerFixture>
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

// roles.ts `canonicalRole`: trim; 'auditor' → 'AUDITOR'; demais inalterados.
export function canonicalRoleCodeFixture(role: string): string {
  const trimmed = role.trim();
  return trimmed === 'auditor' ? 'AUDITOR' : trimmed;
}

// policy.ts 1901-1910 — máximo; papel ausente da tabela conta como 'N0'.
export function layerForFixture(
  roles: readonly string[],
): DashboardLayerFixture {
  let max: DashboardLayerFixture = 'N0';
  for (const role of roles) {
    const canonical = canonicalRoleCodeFixture(role);
    const layer = LAYER_BY_ROLE_FIXTURE[canonical];
    if (layer && LAYER_RANK_FIXTURE[layer] > LAYER_RANK_FIXTURE[max]) {
      max = layer;
    }
  }
  return max;
}

// policy.ts 1912-1921 — 'N3' nega sempre.
export function layerAllowsFixture(
  roles: readonly string[],
  required: DashboardLayerRequirementFixture,
): boolean {
  if (required === 'N3') return false;
  return (
    LAYER_RANK_FIXTURE[layerForFixture(roles)] >= LAYER_RANK_FIXTURE[required]
  );
}
