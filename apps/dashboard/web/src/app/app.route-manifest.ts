// Manifesto de rotas do console (CTG-0002.md §2): transcrição literal de
// `work/rounds/R-0016/route-manifest.md` §A (20 linhas, mesma ordem) seguida das 2 filhas de §B,
// com os conjuntos nomeados de §D expandidos aos códigos literais. Nenhuma importação de
// `src/testing/` nem de `backend/**` (ADR-0001): o Inspector transcreve de novo, e os specs
// comparam as duas transcrições entrada a entrada.

/** Transcrição de `DETRAN_ROLES` (36 códigos, mesma ordem); só tipo e matrizes. */
export const DETRAN_ROLE_CODES = [
  'ADMIN',
  'ADMIN_CLINICA',
  'MEDICO',
  'PSICOLOGO',
  'RECEPCAO',
  'TECNICO_BIOMETRIA',
  'AUDITOR',
  'GESTOR',
  'SUPERVISOR',
  'GESTOR_DETRAN',
  'JUNTA',
  'CETRAN',
  'DPO',
  'SUPORTE',
  'CANDIDATO',
  'field-agent',
  'field-supervisor',
  'processing-operator',
  'traffic-authority',
  'agency-admin',
  'technical-admin',
  'bi-analyst',
  'integration-operator',
  'rait-analyst',
  'rait-coordinator',
  'rait-secretary',
  'rait-signing-authority',
  'rait-central-authority',
  'rait-rapporteur',
  'rait-chair',
  'rait-manager',
  'rait-hr',
  'rait-finance',
  'dash-operator',
  'dash-duty-owner',
  'CIDADAO',
] as const;

export type DashboardRoleCode = (typeof DETRAN_ROLE_CODES)[number];

/** As 10 pastas de feature (§Decisões 1) mais `core` (rotas auxiliares). */
export type DashboardModule =
  | 'core'
  | 'triage'
  | 'radar'
  | 'integrations'
  | 'duties'
  | 'comparison'
  | 'audit'
  | 'transparency'
  | 'crashes'
  | 'catalogue'
  | 'reports';

export type DashboardScreenId = `D-${string}`;
export type DashboardSheetId = `IU-DASH-D-${string}`;
export type DashboardPanel = `P-${string}`;
/** Coluna "Camada" da §4 do manifesto, literal. */
export type DashboardProductLayer =
  | 'Ação'
  | 'Ação/Técnico'
  | 'Técnico'
  | 'Ação/Vigilância'
  | 'Vigilância'
  | 'Contexto';
/** Nunca `'N3'` (manifesto invariante 4). */
export type DashboardAccess = 'N0' | 'N1' | 'N2';
export type DashboardPolicyKey = `dashboard:${string}:${string}`;
export type DashboardBlock = 'A' | 'B' | 'C' | 'D';
export type DashboardFormSlug =
  | 'ack-alerta'
  | 'encerrar-alerta'
  | 'causa-raiz'
  | 'avancar-ciclo'
  | 'finalidade-n2'
  | 'exportar'
  | 'configurar-indicador'
  | 'solicitar-relatorio'
  | 'auditoria-transparencia';
/** Sufixos de `dashboard.common.fixed.*` (M4). */
export type DashboardFixedText =
  | 'see_incident_inquiry'
  | 'no_deadline_defined'
  | 'candidate_deadline_preclusive'
  | 'manual_acknowledgement';
export type DashboardRouteKind = 'page' | 'auxiliary';
/** Todas `'L0'` nesta CTG (A5): sobem a `L2` quando o cliente gerado de R-0011 existir. */
export type DashboardRouteLevel = 'L0' | 'L2';

export interface DashboardRouteEntry {
  readonly path: string;
  readonly id: DashboardScreenId | null;
  readonly sheet: DashboardSheetId | null;
  readonly screen: DashboardPanel | null;
  readonly layer: DashboardProductLayer | null;
  readonly access: DashboardAccess | null;
  readonly policy: DashboardPolicyKey | null;
  readonly roles: readonly DashboardRoleCode[] | null;
  readonly module: DashboardModule;
  readonly slug: string;
  readonly uc: readonly string[];
  readonly journeys: readonly string[];
  readonly blocks: readonly DashboardBlock[];
  readonly forms: readonly DashboardFormSlug[];
  readonly fixed: readonly DashboardFixedText[];
  readonly kind: DashboardRouteKind;
  readonly level: DashboardRouteLevel;
  /** Caminho do pai só nas 2 filhas de §B (OD-D16-018). */
  readonly parent: string | null;
}

// §D "Chaves de política" — conjuntos nomeados expandidos, na ordem de policy.ts.
const AREA_MANAGERS = [
  'rait-manager',
  'rait-coordinator',
  'rait-chair',
  'traffic-authority',
  'GESTOR',
] as const satisfies readonly DashboardRoleCode[];

const ALERT_READ = [
  'dash-operator',
  ...AREA_MANAGERS,
  'agency-admin',
  'technical-admin',
  'AUDITOR',
] as const satisfies readonly DashboardRoleCode[];

const SOURCE_READ = [
  'technical-admin',
  'integration-operator',
  'dash-operator',
  'AUDITOR',
] as const satisfies readonly DashboardRoleCode[];

const COMPARISON_READ = [
  'agency-admin',
  ...AREA_MANAGERS,
  'bi-analyst',
  'AUDITOR',
] as const satisfies readonly DashboardRoleCode[];

const AUDIT_TRAIL_READ = [
  'AUDITOR',
  'DPO',
  'agency-admin',
  ...AREA_MANAGERS,
] as const satisfies readonly DashboardRoleCode[];

const TRANSPARENCY_AUDIT_READ = [
  'technical-admin',
  'agency-admin',
  'AUDITOR',
] as const satisfies readonly DashboardRoleCode[];

const GENERATED_REPORT_READ = [
  'bi-analyst',
  'agency-admin',
  'technical-admin',
  'AUDITOR',
] as const satisfies readonly DashboardRoleCode[];

const KPI_READ = [
  'agency-admin',
  'dash-operator',
  'AUDITOR',
] as const satisfies readonly DashboardRoleCode[];

/** `DETRAN_ROLE_CODES` menos `CANDIDATO` e `CIDADAO` (34), na mesma ordem. */
const N0_ROLES: readonly DashboardRoleCode[] = DETRAN_ROLE_CODES.filter(
  (role) => role !== 'CANDIDATO' && role !== 'CIDADAO',
);

/** 22 entradas: as 20 de §A (ordem `#`) e as 2 filhas de §B. */
export const DASHBOARD_ROUTE_MANIFEST: readonly DashboardRouteEntry[] = [
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
    // `dashboard:alert:read` transcrito com a marca OD-D16-002 (comentário, nunca parte do valor).
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
    // OD-D16-002.
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
    // OD-D16-002.
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
    roles: N0_ROLES,
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
    roles: N0_ROLES,
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
    // OD-D16-002.
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
    roles: N0_ROLES,
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
    // OD-D16-001.
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
  // §B — filhas de detalhe (fora da contagem 20; OD-D16-018): mesmas chaves do pai.
  {
    path: '/monitoramento/indicadores/:id',
    id: 'D-14',
    sheet: 'IU-DASH-D-14',
    screen: null,
    layer: 'Contexto',
    access: 'N0',
    policy: 'dashboard:indicator:read',
    roles: N0_ROLES,
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

/** Tabela literal `path` → `slug` (22 entradas; a regra é `screenSlugOf`). */
export const DASHBOARD_SCREEN_SLUGS: Readonly<Record<string, string>> = {
  '/monitoramento': 'triagem',
  '/monitoramento/alertas/:id': 'alertas-id',
  '/monitoramento/radar/rait': 'radar-rait',
  '/monitoramento/radar/pec': 'radar-pec',
  '/monitoramento/radar/teat': 'radar-teat',
  '/monitoramento/integracoes': 'integracoes',
  '/monitoramento/integracoes/:system': 'integracoes-system',
  '/monitoramento/deveres': 'deveres',
  '/monitoramento/deveres/:id/ciclos/:period': 'deveres-id-ciclos-period',
  '/monitoramento/comparativo': 'comparativo',
  '/monitoramento/auditoria': 'auditoria',
  '/monitoramento/transparencia': 'transparencia',
  '/monitoramento/sinistros': 'sinistros',
  '/monitoramento/indicadores': 'indicadores',
  '/monitoramento/frescor': 'frescor',
  '/monitoramento/relatorios': 'relatorios',
  '/monitoramento/exportacoes': 'exportacoes',
  '/monitoramento/kpis': 'kpis',
  '/monitoramento/sem-permissao': 'sem-permissao',
  '/monitoramento/auth/callback': 'auth-callback',
  '/monitoramento/indicadores/:id': 'indicadores',
  '/monitoramento/relatorios/:id': 'relatorios',
};

const MONITORAMENTO_PREFIX = '/monitoramento';

/** Regra da §A: segmentos após `/monitoramento`, sem `:`, unidos por `-`; a raiz é `triagem`. */
export function screenSlugOf(path: string): string {
  const rest = path.startsWith(MONITORAMENTO_PREFIX)
    ? path.slice(MONITORAMENTO_PREFIX.length)
    : path;
  const segments = rest.split('/').filter((segment) => segment.length > 0);
  if (segments.length === 0) return 'triagem';
  return segments.map((segment) => segment.replace(/^:/, '')).join('-');
}

/** Segmento i18n do slug (M5; §H): `-` → `_`. */
export function i18nSegmentOf(slug: string): string {
  return slug.replace(/-/g, '_');
}

/** O título é da rota, nunca do componente (§3). */
export function titleKeyOf(entry: DashboardRouteEntry): string {
  const segment = i18nSegmentOf(entry.slug);
  return entry.kind === 'page'
    ? `dashboard.screens.${segment}.title`
    : `dashboard.shell.title.${segment}`;
}

/** Entradas de um módulo, na ordem do manifesto (filhas depois do pai). */
export function manifestEntriesOf(
  module: DashboardModule,
): readonly DashboardRouteEntry[] {
  return DASHBOARD_ROUTE_MANIFEST.filter((entry) => entry.module === module);
}

/** Lança quando o caminho não está no manifesto (nunca `undefined`). */
export function manifestEntryOf(path: string): DashboardRouteEntry {
  const entry = DASHBOARD_ROUTE_MANIFEST.find((item) => item.path === path);
  if (!entry) throw new Error(`rota fora do manifesto: ${path}`);
  return entry;
}

/** Caminho relativo ao prefixo `/monitoramento`, sem barra inicial. */
export function routePathOf(entry: DashboardRouteEntry): string {
  const rest = entry.path.startsWith(MONITORAMENTO_PREFIX)
    ? entry.path.slice(MONITORAMENTO_PREFIX.length)
    : entry.path;
  return rest.replace(/^\//, '');
}
