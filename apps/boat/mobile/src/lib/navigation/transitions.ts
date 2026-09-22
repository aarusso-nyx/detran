type NavigationTransition = Readonly<{
  from: string;
  action: string;
  to: string;
  condition: string;
  type: string;
  notes: string;
}>;

const transition = (
  from: string,
  action: string,
  to: string,
  condition: string,
  type: string,
  notes: string,
): NavigationTransition => ({ from, action, to, condition, type, notes });

const crashScreens = [
  'crash-start',
  'crash-location',
  'crash-conditions',
  'crash-vehicles',
  'crash-people',
  'crash-victims',
  'crash-dynamics',
  'crash-sketch',
  'crash-evidence',
  'crash-ait-links',
  'crash-review',
] as const;

const crashNavigationSources = [
  'shift-context',
  'operation-select',
  'open-shift',
  'home',
  'close-shift',
  'shift-summary',
  'vehicle-search',
  'vehicle-result',
  'vehicle-divergence',
  'driver-search',
  'driver-result',
  'query-failure',
  'ait-start',
  'ait-vehicle',
  'ait-driver',
  'ait-frame',
  'ait-frame-detail',
  'ait-location',
  'ait-notes',
  'ait-validations',
  'ait-evidence',
  'ait-measures',
  'ait-signature',
  'ait-review',
  'ait-done',
  'ait-print',
  'ait-shift-detail',
  'measure-start',
  'retention',
  'removal',
  'inventory',
  'transshipment',
  'measure-term',
  'measure-done',
  'alcohol-start',
  'alcohol-device',
  'alcohol-result',
  'alcohol-refusal',
  'alcohol-signs',
  'alcohol-forward',
  'alcohol-links',
  'alcohol-term',
] as const;

const postCrashNavigationSources = [
  'sync',
  'sync-item',
  'sync-conflict',
  'diagnostics',
  'support',
  'messages',
  'approach-no-ait',
  'document-check',
  'special-inspection',
  'context-help',
  'local-settings',
] as const;

const bottomNavigationTargets = [
  ['Nav Início', 'home'],
  ['Nav AIT', 'ait-start'],
  ['Nav Medidas', 'measure-start'],
  ['Nav Sinistro', 'crash-start'],
  ['Nav Sync', 'sync'],
] as const;

export const transitions: readonly NavigationTransition[] = [
  ...crashScreens.flatMap((screen) => [
    transition(
      screen,
      'Voltar',
      '__previous__',
      'quando houver histórico de navegação',
      'global',
      'Usar stack de navegação; se não houver histórico, ir para home.',
    ),
    transition(
      screen,
      'Ajuda contextual',
      'context-help',
      'quando o usuário tocar em ajuda/orientação',
      'global',
      'Preservar origem para retorno.',
    ),
  ]),
  transition('home', 'Sinistro', 'crash-start', '', 'home_action', ''),
  ...crashNavigationSources.map((source) =>
    transition(source, 'Nav Sinistro', 'crash-start', '', 'bottom_nav', ''),
  ),
  ...[
    ['Nav Início', 'home'],
    ['Nav AIT', 'ait-start'],
    ['Nav Medidas', 'measure-start'],
    ['Nav Sync', 'sync'],
  ].map(([action, to]) =>
    transition('crash-start', action, to, '', 'bottom_nav', ''),
  ),
  ...crashScreens
    .slice(1)
    .flatMap((screen) =>
      bottomNavigationTargets.map(([action, to]) =>
        transition(screen, action, to, '', 'bottom_nav', ''),
      ),
    ),
  ...postCrashNavigationSources.map((source) =>
    transition(source, 'Nav Sinistro', 'crash-start', '', 'bottom_nav', ''),
  ),
  transition(
    'vehicle-result',
    'Usar em Sinistro',
    'crash-vehicles',
    '',
    'secondary',
    '',
  ),
  ...crashScreens
    .slice(0, -1)
    .map((from, index) =>
      transition(
        from,
        'Continuar',
        crashScreens[index + 1],
        'dados mínimos da etapa satisfeitos',
        'primary',
        '',
      ),
    ),
  transition(
    'crash-vehicles',
    '+ Veículo',
    'vehicle-search',
    'reusar consulta veicular',
    'secondary',
    '',
  ),
  transition(
    'crash-people',
    '+ Pessoa',
    'driver-search',
    'reusar consulta de condutor quando aplicável',
    'secondary',
    '',
  ),
  transition(
    'crash-victims',
    'Adicionar vítima',
    'crash-victims',
    'adiciona novo card de vítima',
    'in_place',
    '',
  ),
  transition(
    'crash-sketch',
    'Anexar croqui',
    'crash-evidence',
    '',
    'secondary',
    '',
  ),
  transition(
    'crash-ait-links',
    'Criar AIT decorrente',
    'ait-start',
    '',
    'secondary',
    '',
  ),
  transition(
    'crash-ait-links',
    'Criar medida vinculada',
    'measure-start',
    '',
    'secondary',
    '',
  ),
  transition(
    'crash-review',
    'Finalizar registro',
    'sync',
    'se offline ou com evidências pendentes',
    'primary',
    '',
  ),
  transition(
    'crash-review',
    'Gerar relatório preliminar',
    'crash-review',
    'gera PDF/termo e permanece na revisão',
    'in_place',
    '',
  ),
];

export const crashDamagesTransitions: readonly NavigationTransition[] = [
  transition(
    'crash-ait-links',
    'Continuar',
    'crash-damages',
    'quando os dados mínimos da etapa estiverem completos',
    'primary',
    '',
  ),
  transition(
    'crash-damages',
    'Continuar',
    'crash-review',
    'quando os dados mínimos da etapa estiverem completos',
    'primary',
    '',
  ),
];
