// R-0016 TASK-0004 (Inspector). Transcrição independente de `work/rounds/R-0016/route-manifest.md`
// §A (20 linhas), §B (2 filhas), §D (papéis × camadas, "Resultado esperado por rota"), §E (passe
// global), §H (títulos) e §I (menu). Referência dos testes tela ↔ rota ↔ guarda ↔ menu; o código
// de produção (`src/app/app.route-manifest.ts`, TASK-0005) NÃO é importado aqui — cada um é
// escrito de forma independente e comparado entrada a entrada pelos specs (ADR-0001;
// `CTG-0002.md` §12).
import {
  AREA_MANAGERS_FIXTURE,
  GLOBAL_ADMIN_ROLES_FIXTURE,
  N0_ROLES_FIXTURE,
  TECH_FIXTURE,
} from './roles.fixture.js';
import { LAYER_RANK_FIXTURE, layerForFixture } from './layer-table.fixture.js';

export interface RouteManifestFixtureEntry {
  readonly path: string;
  readonly id: string | null;
  readonly sheet: string | null;
  readonly screen: string | null;
  readonly layer: string | null;
  readonly access: 'N0' | 'N1' | 'N2' | null;
  readonly policy: string | null;
  readonly roles: readonly string[] | null;
  readonly module: string;
  readonly slug: string;
  readonly uc: readonly string[];
  readonly journeys: readonly string[];
  readonly blocks: readonly string[];
  readonly forms: readonly string[];
  readonly fixed: readonly string[];
  readonly kind: 'page' | 'auxiliary';
  readonly level: 'L0';
  readonly parent: string | null;
}

// route-manifest.md §D "Chaves de política" — grupos nomeados expandidos, ordem de policy.ts.
const ALERT_READ = [
  'dash-operator',
  ...AREA_MANAGERS_FIXTURE,
  'agency-admin',
  'technical-admin',
  'AUDITOR',
] as const;
const SOURCE_READ = [...TECH_FIXTURE, 'dash-operator', 'AUDITOR'] as const;
const COMPARISON_READ = [
  'agency-admin',
  ...AREA_MANAGERS_FIXTURE,
  'bi-analyst',
  'AUDITOR',
] as const;
const AUDIT_TRAIL_READ = [
  'AUDITOR',
  'DPO',
  'agency-admin',
  ...AREA_MANAGERS_FIXTURE,
] as const;
const TRANSPARENCY_AUDIT_READ = [
  'technical-admin',
  'agency-admin',
  'AUDITOR',
] as const;
const GENERATED_REPORT_READ = [
  'bi-analyst',
  'agency-admin',
  'technical-admin',
  'AUDITOR',
] as const;
const KPI_READ = ['agency-admin', 'dash-operator', 'AUDITOR'] as const;

// route-manifest.md §A, 20 linhas na ordem `#`, seguidas das 2 filhas de §B (OD-D16-018).
export const DASHBOARD_ROUTE_MANIFEST_FIXTURE: readonly RouteManifestFixtureEntry[] =
  [
    {
      path: '/monitoramento',
      id: 'D-01',
      sheet: 'IU-DASH-D-01',
      screen: 'P-01',
      layer: 'Ação',
      access: 'N1',
      policy: 'dashboard:alert:read',
      roles: ALERT_READ,
      module: 'triage',
      slug: 'triagem',
      uc: ['UC-DASH-002'],
      journeys: ['JRN-DASH-001'],
      blocks: ['A', 'B', 'C', 'D'],
      forms: [],
      fixed: ['see_incident_inquiry'],
      kind: 'page',
      level: 'L0',
      parent: null,
    },
    {
      path: '/monitoramento/alertas/:id',
      id: 'D-02',
      sheet: 'IU-DASH-D-02',
      screen: null,
      layer: 'Ação',
      access: 'N1',
      policy: 'dashboard:alert:read',
      roles: ALERT_READ,
      module: 'triage',
      slug: 'alertas-id',
      uc: ['UC-DASH-002'],
      journeys: ['JRN-DASH-001'],
      blocks: ['A', 'B', 'C', 'D'],
      forms: ['ack-alerta', 'encerrar-alerta', 'finalidade-n2'],
      fixed: ['see_incident_inquiry', 'manual_acknowledgement'],
      kind: 'page',
      level: 'L0',
      parent: null,
    },
    {
      path: '/monitoramento/radar/rait',
      id: 'D-03',
      sheet: 'IU-DASH-D-03',
      screen: 'P-02',
      layer: 'Ação',
      access: 'N1',
      policy: 'dashboard:alert:read',
      roles: ALERT_READ,
      module: 'radar',
      slug: 'radar-rait',
      uc: ['UC-DASH-001'],
      journeys: ['JRN-DASH-002'],
      blocks: ['A'],
      forms: ['finalidade-n2'],
      fixed: [],
      kind: 'page',
      level: 'L0',
      parent: null,
    },
    {
      path: '/monitoramento/radar/pec',
      id: 'D-04',
      sheet: 'IU-DASH-D-04',
      screen: 'P-03',
      layer: 'Ação',
      access: 'N1',
      policy: 'dashboard:alert:read',
      roles: ALERT_READ,
      module: 'radar',
      slug: 'radar-pec',
      uc: ['UC-DASH-001'],
      journeys: ['JRN-DASH-007'],
      blocks: ['A', 'C'],
      forms: ['finalidade-n2'],
      fixed: ['candidate_deadline_preclusive'],
      kind: 'page',
      level: 'L0',
      parent: null,
    },
    {
      path: '/monitoramento/radar/teat',
      id: 'D-05',
      sheet: 'IU-DASH-D-05',
      screen: null,
      layer: 'Ação',
      access: 'N1',
      policy: 'dashboard:alert:read',
      roles: ALERT_READ,
      module: 'radar',
      slug: 'radar-teat',
      uc: [],
      journeys: [],
      blocks: ['A', 'C'],
      forms: ['finalidade-n2'],
      fixed: [],
      kind: 'page',
      level: 'L0',
      parent: null,
    },
    {
      path: '/monitoramento/integracoes',
      id: 'D-06',
      sheet: 'IU-DASH-D-06',
      screen: 'P-04',
      layer: 'Ação/Técnico',
      access: 'N1',
      policy: 'dashboard:source:read',
      roles: SOURCE_READ,
      module: 'integrations',
      slug: 'integracoes',
      uc: ['UC-DASH-006'],
      journeys: ['JRN-DASH-001', 'JRN-DASH-004'],
      blocks: ['D'],
      forms: [],
      fixed: [],
      kind: 'page',
      level: 'L0',
      parent: null,
    },
    {
      path: '/monitoramento/integracoes/:system',
      id: 'D-07',
      sheet: 'IU-DASH-D-07',
      screen: null,
      layer: 'Técnico',
      access: 'N1',
      policy: 'dashboard:source:read',
      roles: SOURCE_READ,
      module: 'integrations',
      slug: 'integracoes-system',
      uc: [],
      journeys: ['JRN-DASH-004'],
      blocks: ['D'],
      forms: ['causa-raiz'],
      fixed: [],
      kind: 'page',
      level: 'L0',
      parent: null,
    },
    {
      path: '/monitoramento/deveres',
      id: 'D-08',
      sheet: 'IU-DASH-D-08',
      screen: 'P-05',
      layer: 'Ação/Vigilância',
      access: 'N0',
      policy: 'dashboard:duty:read',
      roles: N0_ROLES_FIXTURE,
      module: 'duties',
      slug: 'deveres',
      uc: ['UC-DASH-003', 'UC-DASH-008'],
      journeys: ['JRN-DASH-003'],
      blocks: ['B'],
      forms: [],
      fixed: ['no_deadline_defined'],
      kind: 'page',
      level: 'L0',
      parent: null,
    },
    {
      path: '/monitoramento/deveres/:id/ciclos/:period',
      id: 'D-09',
      sheet: 'IU-DASH-D-09',
      screen: null,
      layer: 'Ação',
      access: 'N0',
      policy: 'dashboard:duty-cycle:read',
      roles: N0_ROLES_FIXTURE,
      module: 'duties',
      slug: 'deveres-id-ciclos-period',
      uc: ['UC-DASH-003'],
      journeys: ['JRN-DASH-003'],
      blocks: ['B'],
      forms: ['avancar-ciclo'],
      fixed: ['no_deadline_defined'],
      kind: 'page',
      level: 'L0',
      parent: null,
    },
    {
      path: '/monitoramento/comparativo',
      id: 'D-10',
      sheet: 'IU-DASH-D-10',
      screen: 'P-06',
      layer: 'Vigilância',
      access: 'N1',
      policy: 'dashboard:comparison:read',
      roles: COMPARISON_READ,
      module: 'comparison',
      slug: 'comparativo',
      uc: ['UC-DASH-005'],
      journeys: ['JRN-DASH-006'],
      blocks: ['A', 'B', 'C'],
      forms: ['finalidade-n2', 'exportar'],
      fixed: [],
      kind: 'page',
      level: 'L0',
      parent: null,
    },
    {
      path: '/monitoramento/auditoria',
      id: 'D-11',
      sheet: 'IU-DASH-D-11',
      screen: 'P-07',
      layer: 'Contexto',
      access: 'N2',
      policy: 'dashboard:audit-trail:read',
      roles: AUDIT_TRAIL_READ,
      module: 'audit',
      slug: 'auditoria',
      uc: ['UC-DASH-004'],
      journeys: ['JRN-DASH-005'],
      blocks: ['A', 'B', 'C', 'D'],
      forms: ['finalidade-n2', 'exportar'],
      fixed: [],
      kind: 'page',
      level: 'L0',
      parent: null,
    },
    {
      path: '/monitoramento/transparencia',
      id: 'D-12',
      sheet: 'IU-DASH-D-12',
      screen: 'P-08',
      layer: 'Vigilância',
      access: 'N0',
      policy: 'dashboard:transparency-audit:read',
      roles: TRANSPARENCY_AUDIT_READ,
      module: 'transparency',
      slug: 'transparencia',
      uc: ['UC-DASH-007'],
      journeys: [],
      blocks: ['B'],
      forms: ['auditoria-transparencia'],
      fixed: [],
      kind: 'page',
      level: 'L0',
      parent: null,
    },
    {
      path: '/monitoramento/sinistros',
      id: 'D-13',
      sheet: 'IU-DASH-D-13',
      screen: 'P-09',
      layer: 'Contexto',
      access: 'N0',
      policy: 'dashboard:comparison:read',
      roles: COMPARISON_READ,
      module: 'crashes',
      slug: 'sinistros',
      uc: ['UC-DASH-005'],
      journeys: [],
      blocks: ['B', 'C'],
      forms: [],
      fixed: [],
      kind: 'page',
      level: 'L0',
      parent: null,
    },
    {
      path: '/monitoramento/indicadores',
      id: 'D-14',
      sheet: 'IU-DASH-D-14',
      screen: null,
      layer: 'Contexto',
      access: 'N0',
      policy: 'dashboard:indicator:read',
      roles: N0_ROLES_FIXTURE,
      module: 'catalogue',
      slug: 'indicadores',
      uc: [],
      journeys: [],
      blocks: ['A', 'B', 'C', 'D'],
      forms: ['configurar-indicador'],
      fixed: [],
      kind: 'page',
      level: 'L0',
      parent: null,
    },
    {
      path: '/monitoramento/frescor',
      id: 'D-15',
      sheet: 'IU-DASH-D-15',
      screen: null,
      layer: 'Técnico',
      access: 'N0',
      policy: 'dashboard:source:read',
      roles: SOURCE_READ,
      module: 'catalogue',
      slug: 'frescor',
      uc: [],
      journeys: [],
      blocks: ['D'],
      forms: [],
      fixed: [],
      kind: 'page',
      level: 'L0',
      parent: null,
    },
    {
      path: '/monitoramento/relatorios',
      id: 'D-16',
      sheet: 'IU-DASH-D-16',
      screen: null,
      layer: 'Contexto',
      access: 'N1',
      policy: 'dashboard:generated-report:read',
      roles: GENERATED_REPORT_READ,
      module: 'reports',
      slug: 'relatorios',
      uc: [],
      journeys: [],
      blocks: [],
      forms: ['solicitar-relatorio', 'exportar'],
      fixed: [],
      kind: 'page',
      level: 'L0',
      parent: null,
    },
    {
      path: '/monitoramento/exportacoes',
      id: 'D-17',
      sheet: 'IU-DASH-D-17',
      screen: null,
      layer: 'Contexto',
      access: 'N1',
      policy: 'dashboard:audit-trail:read',
      roles: AUDIT_TRAIL_READ,
      module: 'reports',
      slug: 'exportacoes',
      uc: [],
      journeys: [],
      blocks: [],
      forms: [],
      fixed: [],
      kind: 'page',
      level: 'L0',
      parent: null,
    },
    {
      path: '/monitoramento/kpis',
      id: 'D-18',
      sheet: 'IU-DASH-D-18',
      screen: null,
      layer: 'Contexto',
      access: 'N0',
      policy: 'dashboard:kpi:read',
      roles: KPI_READ,
      module: 'catalogue',
      slug: 'kpis',
      uc: [],
      journeys: [],
      blocks: [],
      forms: [],
      fixed: [],
      kind: 'page',
      level: 'L0',
      parent: null,
    },
    {
      path: '/monitoramento/sem-permissao',
      id: null,
      sheet: null,
      screen: null,
      layer: null,
      access: null,
      policy: null,
      roles: null,
      module: 'core',
      slug: 'sem-permissao',
      uc: [],
      journeys: [],
      blocks: [],
      forms: [],
      fixed: [],
      kind: 'auxiliary',
      level: 'L0',
      parent: null,
    },
    {
      path: '/monitoramento/auth/callback',
      id: null,
      sheet: null,
      screen: null,
      layer: null,
      access: null,
      policy: null,
      roles: null,
      module: 'core',
      slug: 'auth-callback',
      uc: [],
      journeys: [],
      blocks: [],
      forms: [],
      fixed: [],
      kind: 'auxiliary',
      level: 'L0',
      parent: null,
    },
    // route-manifest.md §B — filhas de detalhe (fora da contagem 20; OD-D16-018): mesma
    // sheet/policy/access/roles/slug/layer/module/uc/journeys/blocks/forms/fixed do pai.
    {
      path: '/monitoramento/indicadores/:id',
      id: 'D-14',
      sheet: 'IU-DASH-D-14',
      screen: null,
      layer: 'Contexto',
      access: 'N0',
      policy: 'dashboard:indicator:read',
      roles: N0_ROLES_FIXTURE,
      module: 'catalogue',
      slug: 'indicadores',
      uc: [],
      journeys: [],
      blocks: ['A', 'B', 'C', 'D'],
      forms: ['configurar-indicador'],
      fixed: [],
      kind: 'page',
      level: 'L0',
      parent: '/monitoramento/indicadores',
    },
    {
      path: '/monitoramento/relatorios/:id',
      id: 'D-16',
      sheet: 'IU-DASH-D-16',
      screen: null,
      layer: 'Contexto',
      access: 'N1',
      policy: 'dashboard:generated-report:read',
      roles: GENERATED_REPORT_READ,
      module: 'reports',
      slug: 'relatorios',
      uc: [],
      journeys: [],
      blocks: [],
      forms: ['solicitar-relatorio', 'exportar'],
      fixed: [],
      kind: 'page',
      level: 'L0',
      parent: '/monitoramento/relatorios',
    },
  ];

// path → slug, as 22 entradas (§A + §B).
export const DASHBOARD_SCREEN_SLUGS_FIXTURE: Readonly<Record<string, string>> =
  Object.fromEntries(
    DASHBOARD_ROUTE_MANIFEST_FIXTURE.map((entry) => [entry.path, entry.slug]),
  );

// route-manifest.md §H — título visível por segmento i18n (slug_), 20 entradas (18 + 2 auxiliares).
export const SCREEN_TITLES_FIXTURE: Readonly<Record<string, string>> = {
  triagem: 'Triagem do turno',
  alertas_id: 'Detalhe do alerta',
  radar_rait: 'Radar de prescrição RAIT',
  radar_pec: 'Escada de prazos PEC',
  radar_teat: 'Radar TEAT',
  integracoes: 'Saúde técnica',
  integracoes_system: 'Detalhe da integração',
  deveres: 'Deveres periódicos',
  deveres_id_ciclos_period: 'Ciclo do dever',
  comparativo: 'Comparativo',
  auditoria: 'Trilha de auditoria',
  transparencia: 'Transparência ativa',
  sinistros: 'Estatística de sinistros',
  indicadores: 'Catálogo de indicadores',
  frescor: 'Frescor das fontes',
  relatorios: 'Relatórios',
  exportacoes: 'Exportações',
  kpis: 'KPIs do painel',
  sem_permissao: 'Sem permissão',
  auth_callback: 'Retorno de autenticação',
};

// route-manifest.md §D "Chaves de política" — as 10 chaves de leitura → papéis literais.
export const POLICY_MATRIX_FIXTURE: Readonly<
  Record<string, readonly string[]>
> = {
  'dashboard:alert:read': ALERT_READ,
  'dashboard:source:read': SOURCE_READ,
  'dashboard:duty:read': N0_ROLES_FIXTURE,
  'dashboard:duty-cycle:read': N0_ROLES_FIXTURE,
  'dashboard:comparison:read': COMPARISON_READ,
  'dashboard:audit-trail:read': AUDIT_TRAIL_READ,
  'dashboard:transparency-audit:read': TRANSPARENCY_AUDIT_READ,
  'dashboard:indicator:read': N0_ROLES_FIXTURE,
  'dashboard:generated-report:read': GENERATED_REPORT_READ,
  'dashboard:kpi:read': KPI_READ,
};

// route-manifest.md §I — grupos de navegação, ordem fixa Ação › Vigilância › Contexto › Técnico.
export const NAV_GROUPS_FIXTURE: readonly {
  readonly key: 'acao' | 'vigilancia' | 'contexto' | 'tecnico';
  readonly ids: readonly string[];
}[] = [
  { key: 'acao', ids: ['D-01', 'D-03', 'D-04', 'D-05', 'D-06', 'D-08'] },
  { key: 'vigilancia', ids: ['D-10', 'D-12'] },
  {
    key: 'contexto',
    ids: ['D-11', 'D-13', 'D-14', 'D-16', 'D-17', 'D-18'],
  },
  { key: 'tecnico', ids: ['D-15'] },
];

// access mínimo por rota (18), derivado de route-manifest.md §C — usado só para calcular o passe
// global em expectedRouteResult (nunca redecide §C).
const ACCESS_BY_ID: Readonly<Record<string, 'N0' | 'N1' | 'N2'>> = {
  'D-01': 'N1',
  'D-02': 'N1',
  'D-03': 'N1',
  'D-04': 'N1',
  'D-05': 'N1',
  'D-06': 'N1',
  'D-07': 'N1',
  'D-08': 'N0',
  'D-09': 'N0',
  'D-10': 'N1',
  'D-11': 'N2',
  'D-12': 'N0',
  'D-13': 'N0',
  'D-14': 'N0',
  'D-15': 'N0',
  'D-16': 'N1',
  'D-17': 'N1',
  'D-18': 'N0',
};

// route-manifest.md §D "Resultado esperado por rota" — ativos SEM o passe global de §E.
export const EXPECTED_ACTIVE_FIXTURE: Readonly<
  Record<string, readonly string[]>
> = {
  'D-01': ALERT_READ,
  'D-02': ALERT_READ,
  'D-03': ALERT_READ,
  'D-04': ALERT_READ,
  'D-05': ALERT_READ,
  'D-06': SOURCE_READ,
  'D-07': SOURCE_READ,
  'D-08': N0_ROLES_FIXTURE,
  'D-09': N0_ROLES_FIXTURE,
  'D-10': COMPARISON_READ,
  'D-11': AUDIT_TRAIL_READ,
  'D-12': TRANSPARENCY_AUDIT_READ,
  'D-13': COMPARISON_READ,
  'D-14': N0_ROLES_FIXTURE,
  'D-15': SOURCE_READ,
  'D-16': GENERATED_REPORT_READ,
  'D-17': AUDIT_TRAIL_READ,
  'D-18': KPI_READ,
};

// route-manifest.md §E — passe global de GLOBAL_ADMIN_ROLES (transcrição literal, cruzada com
// o cálculo genérico de expectedRouteResult abaixo).
export const GLOBAL_PASS_FIXTURE: Readonly<
  Record<
    'ADMIN' | 'SUPORTE' | 'GESTOR_DETRAN' | 'technical-admin',
    { readonly active: readonly string[]; readonly blocked: readonly string[] }
  >
> = {
  ADMIN: {
    active: ['D-12', 'D-13', 'D-15', 'D-18'],
    blocked: [
      'D-01',
      'D-02',
      'D-03',
      'D-04',
      'D-05',
      'D-06',
      'D-07',
      'D-10',
      'D-11',
      'D-16',
      'D-17',
    ],
  },
  SUPORTE: {
    active: ['D-12', 'D-13', 'D-15', 'D-18'],
    blocked: [
      'D-01',
      'D-02',
      'D-03',
      'D-04',
      'D-05',
      'D-06',
      'D-07',
      'D-10',
      'D-11',
      'D-16',
      'D-17',
    ],
  },
  GESTOR_DETRAN: {
    active: [
      'D-01',
      'D-02',
      'D-03',
      'D-04',
      'D-05',
      'D-06',
      'D-07',
      'D-10',
      'D-11',
      'D-12',
      'D-13',
      'D-15',
      'D-16',
      'D-17',
      'D-18',
    ],
    blocked: [],
  },
  'technical-admin': {
    active: ['D-10', 'D-13', 'D-17', 'D-18'],
    blocked: ['D-11'],
  },
};

/**
 * route-manifest.md §D+§E: 'active' ⇔ role ∈ EXPECTED_ACTIVE_FIXTURE[id] || (role ∈
 * GLOBAL_ADMIN_ROLES_FIXTURE && layerRank(layerForFixture([role])) ≥ rank(access[id])).
 * `id` é o código `D-nn` (as duas filhas de §B usam o `id` do pai, D-14/D-16). Rotas auxiliares
 * (sem `id`) ficam fora desta função (C-01-08).
 */
export function expectedRouteResult(
  id: string,
  role: string,
): 'active' | 'forbidden' {
  const active = EXPECTED_ACTIVE_FIXTURE[id] ?? [];
  if (active.includes(role)) return 'active';
  if (GLOBAL_ADMIN_ROLES_FIXTURE.includes(role as never)) {
    const access = ACCESS_BY_ID[id];
    if (
      access &&
      LAYER_RANK_FIXTURE[layerForFixture([role])] >= LAYER_RANK_FIXTURE[access]
    ) {
      return 'active';
    }
  }
  return 'forbidden';
}
