// Manifesto de rotas do Portal (plan.md M7): uma entrada por rota de portal-frontends.md §4 +
// as rotas auxiliares fixadas em M7, transcrito de work/rounds/R-0014/route-manifest.md
// (38 rotas, 27 telas, 14 módulos). É a fonte única de `PORTAL_ROUTES` (`app.routes.ts` deriva
// guardas, `title`, `data.screen` e módulo de cada entrada) e a tabela que os testes
// tela ↔ ficha ↔ rota ↔ guarda verificam. Não importa `src/testing/` (transcrição independente).

export type PortalAccess =
  'anonimo' | 'simples' | 'avancada' | 'nenhum_ou_simples';

export type EntitlementKind =
  'ait' | 'request' | 'vehicle' | 'crash' | 'exam' | 'manifestation';

export type PortalModule =
  | 'core'
  | 'catalogo'
  | 'autos'
  | 'defesa'
  | 'indicacao'
  | 'pagamento'
  | 'processos'
  | 'notificacoes'
  | 'documentos'
  | 'sinistros'
  | 'exames'
  | 'atendimento'
  | 'privacidade'
  | 'assinatura';

export interface RouteManifestEntry {
  /** Como na tabela §4, sem barra inicial. */
  readonly path: string;
  readonly screen: `T-${string}` | null;
  readonly sheet: `IU-PORTAL-T${string}` | null;
  readonly module: PortalModule;
  readonly access: PortalAccess;
  readonly entitlement?: {
    readonly kind: EntitlementKind;
    readonly param: string;
  };
  readonly serviceKey?: string;
  readonly journeys: readonly string[];
}

export const PORTAL_ROUTE_MANIFEST: readonly RouteManifestEntry[] = [
  {
    path: '',
    screen: null,
    sheet: null,
    module: 'core',
    access: 'anonimo',
    journeys: [],
  },
  {
    path: 'carta-servicos',
    screen: 'T-25',
    sheet: 'IU-PORTAL-T25',
    module: 'catalogo',
    access: 'anonimo',
    journeys: [],
  },
  {
    path: 'carta-servicos/:serviceKey',
    screen: 'T-25',
    sheet: 'IU-PORTAL-T25',
    module: 'catalogo',
    access: 'anonimo',
    journeys: [],
  },
  {
    path: 'pontuacao/como-funciona',
    screen: 'T-15',
    sheet: 'IU-PORTAL-T15',
    module: 'catalogo',
    access: 'anonimo',
    journeys: ['JRN-PORTAL-004'],
  },
  {
    path: 'acessibilidade',
    screen: null,
    sheet: null,
    module: 'core',
    access: 'anonimo',
    journeys: [],
  },
  {
    path: 'auth/callback',
    screen: null,
    sheet: null,
    module: 'core',
    access: 'anonimo',
    journeys: [],
  },
  {
    path: 'inicio',
    screen: null,
    sheet: null,
    module: 'core',
    access: 'simples',
    journeys: [],
  },
  {
    path: 'autos',
    screen: 'T-14',
    sheet: 'IU-PORTAL-T14',
    module: 'autos',
    access: 'simples',
    serviceKey: 'consulta_multas',
    journeys: ['JRN-PORTAL-001', 'JRN-PORTAL-004', 'JRN-PORTAL-005'],
  },
  {
    path: 'autos/:aitId',
    screen: 'T-01',
    sheet: 'IU-PORTAL-T01',
    module: 'autos',
    access: 'simples',
    entitlement: { kind: 'ait', param: 'aitId' },
    serviceKey: 'consulta_multas',
    journeys: [
      'JRN-PORTAL-001',
      'JRN-PORTAL-002',
      'JRN-PORTAL-004',
      'JRN-PORTAL-005',
    ],
  },
  {
    path: 'autos/:aitId/defesa/nova',
    screen: 'T-02',
    sheet: 'IU-PORTAL-T02',
    module: 'defesa',
    access: 'avancada',
    entitlement: { kind: 'ait', param: 'aitId' },
    serviceKey: 'defesa_previa',
    journeys: ['JRN-PORTAL-001'],
  },
  {
    path: 'autos/:aitId/condutor/nova',
    screen: 'T-05',
    sheet: 'IU-PORTAL-T05',
    module: 'indicacao',
    access: 'avancada',
    entitlement: { kind: 'ait', param: 'aitId' },
    serviceKey: 'indicacao_condutor',
    journeys: ['JRN-PORTAL-002'],
  },
  {
    path: 'autos/:aitId/pagamento',
    screen: 'T-13',
    sheet: 'IU-PORTAL-T13',
    module: 'pagamento',
    access: 'simples',
    entitlement: { kind: 'ait', param: 'aitId' },
    serviceKey: 'pagamento',
    journeys: ['JRN-PORTAL-004', 'JRN-PORTAL-005', 'JRN-PORTAL-010'],
  },
  {
    path: 'autos/:aitId/pagamento/preservando-recurso',
    screen: 'T-23',
    sheet: 'IU-PORTAL-T23',
    module: 'pagamento',
    access: 'simples',
    entitlement: { kind: 'ait', param: 'aitId' },
    serviceKey: 'pagamento',
    journeys: ['JRN-PORTAL-010'],
  },
  {
    path: 'processos',
    screen: 'T-06',
    sheet: 'IU-PORTAL-T06',
    module: 'processos',
    access: 'simples',
    journeys: ['JRN-PORTAL-003'],
  },
  {
    path: 'processos/:requestId',
    screen: 'T-07',
    sheet: 'IU-PORTAL-T07',
    module: 'processos',
    access: 'simples',
    entitlement: { kind: 'request', param: 'requestId' },
    journeys: ['JRN-PORTAL-001', 'JRN-PORTAL-003'],
  },
  {
    path: 'processos/:requestId/diligencia/:diligenceId',
    screen: 'T-11',
    sheet: 'IU-PORTAL-T11',
    module: 'processos',
    access: 'simples',
    entitlement: { kind: 'request', param: 'requestId' },
    journeys: ['JRN-PORTAL-003'],
  },
  {
    path: 'processos/:requestId/desistencia',
    screen: 'T-08',
    sheet: 'IU-PORTAL-T08',
    module: 'processos',
    access: 'simples',
    entitlement: { kind: 'request', param: 'requestId' },
    journeys: [],
  },
  {
    path: 'processos/:requestId/decisao',
    screen: 'T-10',
    sheet: 'IU-PORTAL-T10',
    module: 'processos',
    access: 'simples',
    entitlement: { kind: 'request', param: 'requestId' },
    journeys: ['JRN-PORTAL-001', 'JRN-PORTAL-003'],
  },
  {
    path: 'processos/:requestId/jari/nova',
    screen: 'T-03',
    sheet: 'IU-PORTAL-T03',
    module: 'defesa',
    access: 'avancada',
    entitlement: { kind: 'request', param: 'requestId' },
    serviceKey: 'recurso_jari',
    journeys: ['JRN-PORTAL-001', 'JRN-PORTAL-010'],
  },
  {
    path: 'processos/:requestId/cetran/nova',
    screen: 'T-04',
    sheet: 'IU-PORTAL-T04',
    module: 'defesa',
    access: 'avancada',
    entitlement: { kind: 'request', param: 'requestId' },
    serviceKey: 'recurso_cetran',
    journeys: ['JRN-PORTAL-001'],
  },
  {
    path: 'notificacoes',
    screen: 'T-12',
    sheet: 'IU-PORTAL-T12',
    module: 'notificacoes',
    access: 'simples',
    journeys: ['JRN-PORTAL-002', 'JRN-PORTAL-003', 'JRN-PORTAL-005'],
  },
  {
    path: 'notificacoes/preferencias',
    screen: null,
    sheet: null,
    module: 'notificacoes',
    access: 'simples',
    journeys: [],
  },
  {
    path: 'sne',
    screen: 'T-09',
    sheet: 'IU-PORTAL-T09',
    module: 'notificacoes',
    access: 'simples',
    serviceKey: 'adesao_sne',
    journeys: ['JRN-PORTAL-005'],
  },
  {
    path: 'documentos/cnh-digital',
    screen: 'T-16',
    sheet: 'IU-PORTAL-T16',
    module: 'documentos',
    access: 'simples',
    serviceKey: 'consulta_cnh',
    journeys: ['JRN-PORTAL-006'],
  },
  {
    path: 'veiculos',
    screen: null,
    sheet: null,
    module: 'documentos',
    access: 'simples',
    journeys: [],
  },
  {
    path: 'veiculos/:vehicleId/crlv-e',
    screen: 'T-17',
    sheet: 'IU-PORTAL-T17',
    module: 'documentos',
    access: 'simples',
    entitlement: { kind: 'vehicle', param: 'vehicleId' },
    serviceKey: 'emissao_crlv',
    journeys: ['JRN-PORTAL-006'],
  },
  {
    path: 'sinistros',
    screen: 'T-18',
    sheet: 'IU-PORTAL-T18',
    module: 'sinistros',
    access: 'simples',
    serviceKey: 'consulta_bat',
    journeys: ['JRN-PORTAL-007'],
  },
  {
    path: 'sinistros/:crashId',
    screen: 'T-19',
    sheet: 'IU-PORTAL-T19',
    module: 'sinistros',
    access: 'simples',
    entitlement: { kind: 'crash', param: 'crashId' },
    serviceKey: 'consulta_bat',
    journeys: ['JRN-PORTAL-007'],
  },
  {
    path: 'exames',
    screen: 'T-20',
    sheet: 'IU-PORTAL-T20',
    module: 'exames',
    access: 'simples',
    serviceKey: 'consulta_exame',
    journeys: ['JRN-PORTAL-008'],
  },
  {
    path: 'exames/:examId/junta/nova',
    screen: null,
    sheet: null,
    module: 'exames',
    access: 'avancada',
    entitlement: { kind: 'exam', param: 'examId' },
    serviceKey: 'junta_medica',
    journeys: ['JRN-PORTAL-008'],
  },
  {
    path: 'ouvidoria/nova',
    screen: 'T-21',
    sheet: 'IU-PORTAL-T21',
    module: 'atendimento',
    access: 'nenhum_ou_simples',
    serviceKey: 'manifestar',
    journeys: ['JRN-PORTAL-009'],
  },
  {
    path: 'ouvidoria/:manifestationId',
    screen: 'T-22',
    sheet: 'IU-PORTAL-T22',
    module: 'atendimento',
    access: 'simples',
    entitlement: { kind: 'manifestation', param: 'manifestationId' },
    serviceKey: 'acompanhar_manifestacao',
    journeys: ['JRN-PORTAL-009'],
  },
  {
    path: 'avaliacao/:requestId',
    screen: 'T-26',
    sheet: 'IU-PORTAL-T26',
    module: 'atendimento',
    access: 'simples',
    entitlement: { kind: 'request', param: 'requestId' },
    serviceKey: 'avaliar',
    journeys: ['JRN-PORTAL-009'],
  },
  {
    path: 'privacidade/meus-dados',
    screen: 'T-24',
    sheet: 'IU-PORTAL-T24',
    module: 'privacidade',
    access: 'simples',
    serviceKey: 'lgpd_declaracao',
    journeys: ['JRN-PORTAL-011'],
  },
  {
    path: 'assinatura/elevacao',
    screen: 'T-27',
    sheet: 'IU-PORTAL-T27',
    module: 'assinatura',
    access: 'simples',
    journeys: ['JRN-PORTAL-001'],
  },
  {
    path: 'conta',
    screen: null,
    sheet: null,
    module: 'core',
    access: 'simples',
    journeys: [],
  },
  {
    path: 'vinculo/por-que-nao-vejo',
    screen: null,
    sheet: null,
    module: 'core',
    access: 'simples',
    journeys: [],
  },
  {
    path: 'servico-indisponivel/:serviceKey',
    screen: null,
    sheet: null,
    module: 'core',
    access: 'simples',
    journeys: [],
  },
];

/** Entradas de um módulo, na ordem do manifesto. */
export function manifestEntriesOf(
  module: PortalModule,
): readonly RouteManifestEntry[] {
  return PORTAL_ROUTE_MANIFEST.filter((entry) => entry.module === module);
}
