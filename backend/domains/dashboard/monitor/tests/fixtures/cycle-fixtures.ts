// Fixtures EM CÓDIGO da suíte do ciclo (CTG-0002 §15.1, C-0002-01…49;
// Inspector TASK-0004). Três famílias de valores, todas transcritas (nunca
// inventadas):
//   (1) ids do seed `81-fixtures-dashboard-state.sql` (CTG-0001 §5.3) — só
//       LEITURA; a suíte nunca escreve neles (prompt TASK-0004);
//   (2) namespace `0083…` desta suíte: `00000000-0000-7000-8000-0083SSNNNNNN`
//       (`SS` = spec, `NNNNNN` = sequência), disjunto de `80…`/`81…` (seed) e
//       `82…` (replay CTG-0001, `tests/fixtures/outbox-events.ts`);
//   (3) tokens de estado/trilha/timer/papel/erro dos catálogos (DDL 19,
//       CTG-0001 §3, `roles.ts` via `auth.role_catalog`, catálogo de erros) e
//       usuários de `00-fixtures-core.sql`.
// As tabelas de casos (§6.8 SLA, §7.1 data-limite, §8.1 frescor) estão nos
// specs que as usam, literalmente como no contrato.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import type { CalendarJson } from '@detran/inf-deadlines';

export const FIXTURE_TENANT_ID = '00000000-0000-7000-8000-00000000a001';
export const FIXTURE_TENANT_TZ = 'America/Manaus';
/** Segundo tenant já semeado em `auth.tenants` (C-0002-49, varredura por
 * tenant); nada é criado nele fora do que o `afterAll` do spec apaga. */
export const SECOND_TENANT_ID = '00000000-0000-7000-8000-000000000001';
export const SECOND_TENANT_TZ = 'America/Sao_Paulo';

/** Usuários de `00-fixtures-core.sql` (papéis lidos de `auth.membership_roles`
 * no `detran_r11`). O ciclo recebe `ctx.actor.roles` já resolvidos pela
 * superfície (CTG-0002 §14.3: "o ciclo não conhece Request"), por isso os
 * papéis `dash-operator`/`dash-duty-owner` — sem usuário próprio no seed core
 * (OD proposta no relatório) — são atribuídos no contexto, com o id de um
 * usuário canônico. */
export const USERS = {
  raitManager: '00000000-0000-4000-8000-0000b0000012', // rait-manager
  raitAnalyst: '00000000-0000-4000-8000-0000b0000001', // rait-analyst
  raitCoordinator: '00000000-0000-4000-8000-0000b0000004', // rait-analyst,rait-coordinator
  auditor: '00000000-0000-4000-8000-0000b0000015', // AUDITOR
  agencyAdmin: '00000000-0000-4000-8000-0000b0000016', // agency-admin
  integrationOperator: '00000000-0000-4000-8000-0000b0000017', // integration-operator
  raitSecretary: '00000000-0000-4000-8000-0000b0000005', // rait-secretary
} as const;

export const ROLES = {
  raitAnalyst: 'rait-analyst',
  raitCoordinator: 'rait-coordinator',
  raitManager: 'rait-manager',
  raitChair: 'rait-chair',
  auditor: 'AUDITOR',
  gestor: 'GESTOR',
  trafficAuthority: 'traffic-authority',
  dashOperator: 'dash-operator',
  dashDutyOwner: 'dash-duty-owner',
  agencyAdmin: 'agency-admin',
  raitSecretary: 'rait-secretary',
} as const;

/** Objetos de origem já semeados por outros domínios (CTG-0001 §5.3:
 * "nunca id inventado sem fixture"): casos de `20-fixtures-rait.sql` e a
 * manifestação de `70-fixtures-portal.sql`. */
export const ORIGIN_OBJECTS = {
  raitCase02: '00000000-0000-7000-8000-000010000002', // usado pelo seed 81 (18 alertas abertos/fechados) — nunca alvo de `detect` da suíte
  raitCase08: '00000000-0000-7000-8000-000010000008',
  raitCase09: '00000000-0000-7000-8000-000010000009',
  raitCase10: '00000000-0000-7000-8000-000010000010',
  raitCase11: '00000000-0000-7000-8000-000010000011',
  raitCase12: '00000000-0000-7000-8000-000010000012',
  raitCase13: '00000000-0000-7000-8000-000010000013',
  raitCase14: '00000000-0000-7000-8000-000010000014',
  manifestation01: '00000000-0000-7000-8000-000070700001', // usado pelo seed 81
  manifestation02: '00000000-0000-7000-8000-000070700002',
  manifestation03: '00000000-0000-7000-8000-000070700003',
  manifestation04: '00000000-0000-7000-8000-000070700004',
} as const;

// ---------------------------------------------------------------------------
// Seed 81 (só leitura)
// ---------------------------------------------------------------------------

export type AlertState =
  | 'DETECTADO'
  | 'CLASSIFICADO'
  | 'NOTIFICADO'
  | 'RECONHECIDO'
  | 'EM_TRATAMENTO'
  | 'VERIFICADO'
  | 'ENCERRADO'
  | 'ESCALONADO'
  | 'CRITICO_EXTINCAO'
  | 'INCIDENTE_REGISTRADO';
export type AlertTrack = 'extinction' | 'irregularity';

export const ALERT_STATES: readonly AlertState[] = [
  'DETECTADO',
  'CLASSIFICADO',
  'NOTIFICADO',
  'RECONHECIDO',
  'EM_TRATAMENTO',
  'VERIFICADO',
  'ENCERRADO',
  'ESCALONADO',
  'CRITICO_EXTINCAO',
  'INCIDENTE_REGISTRADO',
];
export const TERMINAL_ALERT_STATES: readonly AlertState[] = [
  'ENCERRADO',
  'INCIDENTE_REGISTRADO',
];

/** Os 18 alertas de `81-fixtures-dashboard-state.sql` (matriz estado ×
 * trilha, ids `…0000810001<nn>` na ordem da tabela de CTG-0001 §5.3). */
export interface SeedAlertFixture {
  id: string;
  state: AlertState;
  track: AlertTrack;
  severity: 'N1' | 'N2' | 'N3' | 'CRITICO';
  indicatorCode: 'IND-DASH-101' | 'IND-DASH-301';
  ownerRole: 'rait-manager' | 'dash-duty-owner';
}

const seedAlert = (
  nn: string,
  state: AlertState,
  track: AlertTrack,
  severity: SeedAlertFixture['severity'],
): SeedAlertFixture => ({
  id: `00000000-0000-7000-8000-0000810001${nn}`,
  state,
  track,
  severity,
  indicatorCode: track === 'extinction' ? 'IND-DASH-101' : 'IND-DASH-301',
  ownerRole: track === 'extinction' ? 'rait-manager' : 'dash-duty-owner',
});

export const SEED_ALERTS: readonly SeedAlertFixture[] = [
  seedAlert('01', 'DETECTADO', 'extinction', 'N1'),
  seedAlert('02', 'DETECTADO', 'irregularity', 'N1'),
  seedAlert('03', 'CLASSIFICADO', 'extinction', 'N1'),
  seedAlert('04', 'CLASSIFICADO', 'irregularity', 'N1'),
  seedAlert('05', 'NOTIFICADO', 'extinction', 'N2'),
  seedAlert('06', 'NOTIFICADO', 'irregularity', 'N2'),
  seedAlert('07', 'RECONHECIDO', 'extinction', 'N2'),
  seedAlert('08', 'RECONHECIDO', 'irregularity', 'N2'),
  seedAlert('09', 'EM_TRATAMENTO', 'extinction', 'N2'),
  seedAlert('10', 'EM_TRATAMENTO', 'irregularity', 'N2'),
  seedAlert('11', 'VERIFICADO', 'extinction', 'N2'),
  seedAlert('12', 'VERIFICADO', 'irregularity', 'N2'),
  seedAlert('13', 'ENCERRADO', 'extinction', 'N2'),
  seedAlert('14', 'ENCERRADO', 'irregularity', 'N2'),
  seedAlert('15', 'ESCALONADO', 'extinction', 'N3'),
  seedAlert('16', 'ESCALONADO', 'irregularity', 'N3'),
  seedAlert('17', 'CRITICO_EXTINCAO', 'extinction', 'CRITICO'),
  seedAlert('18', 'INCIDENTE_REGISTRADO', 'extinction', 'CRITICO'),
];

export const seedAlertBy = (
  state: AlertState,
  track: AlertTrack,
): SeedAlertFixture => {
  const found = SEED_ALERTS.find(
    (alert) => alert.state === state && alert.track === track,
  );
  if (!found) throw new Error(`sem fixture de seed para ${state}/${track}`);
  return found;
};

/** Os 8 ciclos de dever do seed 81 (`…0000810003<nn>`), CTG-0001 §5.3. */
export const SEED_DUTY_CYCLES = {
  janelaAberta: '00000000-0000-7000-8000-000081000301', // DUTY-01 2026-09
  emApuracao: '00000000-0000-7000-8000-000081000302', // DUTY-02 2026-09
  preparado: '00000000-0000-7000-8000-000081000303', // DUTY-07 2025
  submetidoPublicado: '00000000-0000-7000-8000-000081000304', // DUTY-10 2026
  comprovado: '00000000-0000-7000-8000-000081000305', // DUTY-01 2026-08
  arquivado: '00000000-0000-7000-8000-000081000306', // DUTY-01 2026-07
  atrasado: '00000000-0000-7000-8000-000081000307', // DUTY-02 2026-08
  naoCumprido: '00000000-0000-7000-8000-000081000308', // DUTY-02 2026-07
} as const;
export const SEED_DUTY_CYCLE_IDS: readonly string[] =
  Object.values(SEED_DUTY_CYCLES);

/** As 4 fontes do seed 81 (`…0000810004<nn>`), `acceptable_latency_minutes`
 * nulo em todas (M13). */
export const SEED_SOURCES = {
  raitOutbox: {
    id: '00000000-0000-7000-8000-000081000401',
    key: 'rait.outbox',
    state: 'FRESCO',
  },
  teatOfflineSync: {
    id: '00000000-0000-7000-8000-000081000402',
    key: 'teat.offline-sync',
    state: 'ATRASADO',
  },
  pecDeadlines: {
    id: '00000000-0000-7000-8000-000081000403',
    key: 'pec.deadlines',
    state: 'INDISPONIVEL',
  },
  boatCrashes: {
    id: '00000000-0000-7000-8000-000081000404',
    key: 'boat.crashes',
    state: 'DESATUALIZADO_MARCADO',
  },
} as const;
export const SEED_SOURCE_IDS: readonly string[] = Object.values(
  SEED_SOURCES,
).map((source) => source.id);

/** Deveres de `80-fixtures-dashboard-catalog.sql` (`…0000800010<nn>`). */
export const SEED_DUTIES = {
  'DUTY-01': '00000000-0000-7000-8000-000080001001',
  'DUTY-02': '00000000-0000-7000-8000-000080001002',
  'DUTY-03': '00000000-0000-7000-8000-000080001003',
  'DUTY-04': '00000000-0000-7000-8000-000080001004',
  'DUTY-05': '00000000-0000-7000-8000-000080001005',
  'DUTY-06': '00000000-0000-7000-8000-000080001006',
  'DUTY-07': '00000000-0000-7000-8000-000080001007',
  'DUTY-08': '00000000-0000-7000-8000-000080001008',
  'DUTY-10': '00000000-0000-7000-8000-000080001010',
  'DUTY-12': '00000000-0000-7000-8000-000080001012',
  'DUTY-PNATRANS': '00000000-0000-7000-8000-000080001015',
} as const;

// ---------------------------------------------------------------------------
// Vocabulário (DDL 19 / CTG-0001 §3 / CTG-0002 §2.3, §6.1) — transcrito
// ---------------------------------------------------------------------------

export interface AlertTransitionRow {
  seq: number;
  from: AlertState | null;
  to: AlertState;
  actor: 'system' | 'owner' | 'dash-operator' | 'owner|dash-operator';
  track: 'both' | 'extinction' | 'irregularity';
}

/** CTG-0002 §6.1 / CTG-0001 §3.2 (13 linhas, inclui `seq 65` de A8). */
export const ALERT_TRANSITIONS: readonly AlertTransitionRow[] = [
  { seq: 10, from: null, to: 'DETECTADO', actor: 'system', track: 'both' },
  {
    seq: 20,
    from: 'DETECTADO',
    to: 'CLASSIFICADO',
    actor: 'system',
    track: 'both',
  },
  {
    seq: 30,
    from: 'CLASSIFICADO',
    to: 'NOTIFICADO',
    actor: 'system',
    track: 'both',
  },
  {
    seq: 40,
    from: 'CLASSIFICADO',
    to: 'CRITICO_EXTINCAO',
    actor: 'system',
    track: 'extinction',
  },
  {
    seq: 50,
    from: 'NOTIFICADO',
    to: 'RECONHECIDO',
    actor: 'owner|dash-operator',
    track: 'both',
  },
  {
    seq: 60,
    from: 'NOTIFICADO',
    to: 'ESCALONADO',
    actor: 'system',
    track: 'both',
  },
  {
    seq: 65,
    from: 'ESCALONADO',
    to: 'NOTIFICADO',
    actor: 'system',
    track: 'both',
  },
  {
    seq: 70,
    from: 'RECONHECIDO',
    to: 'EM_TRATAMENTO',
    actor: 'owner',
    track: 'both',
  },
  {
    seq: 80,
    from: 'EM_TRATAMENTO',
    to: 'VERIFICADO',
    actor: 'system',
    track: 'both',
  },
  {
    seq: 90,
    from: 'EM_TRATAMENTO',
    to: 'ESCALONADO',
    actor: 'system',
    track: 'both',
  },
  {
    seq: 100,
    from: 'VERIFICADO',
    to: 'ENCERRADO',
    actor: 'dash-operator',
    track: 'irregularity',
  },
  {
    seq: 101,
    from: 'VERIFICADO',
    to: 'ENCERRADO',
    actor: 'system',
    track: 'extinction',
  },
  {
    seq: 110,
    from: 'CRITICO_EXTINCAO',
    to: 'INCIDENTE_REGISTRADO',
    actor: 'system',
    track: 'extinction',
  },
];

export type DutyState =
  | 'JANELA_ABERTA'
  | 'EM_APURACAO'
  | 'PREPARADO'
  | 'SUBMETIDO_PUBLICADO'
  | 'COMPROVADO'
  | 'ARQUIVADO'
  | 'ATRASADO'
  | 'NAO_CUMPRIDO';
export const DUTY_STATES: readonly DutyState[] = [
  'JANELA_ABERTA',
  'EM_APURACAO',
  'PREPARADO',
  'SUBMETIDO_PUBLICADO',
  'COMPROVADO',
  'ARQUIVADO',
  'ATRASADO',
  'NAO_CUMPRIDO',
];
export const TERMINAL_DUTY_STATES: readonly DutyState[] = [
  'ARQUIVADO',
  'NAO_CUMPRIDO',
];

/** CTG-0001 §3.4 (11 linhas). */
export const DUTY_TRANSITIONS: readonly {
  seq: number;
  from: DutyState | null;
  to: DutyState;
  actor: 'system' | 'dash-duty-owner' | 'dash-duty-owner|dash-operator';
}[] = [
  { seq: 10, from: null, to: 'JANELA_ABERTA', actor: 'system' },
  {
    seq: 20,
    from: 'JANELA_ABERTA',
    to: 'EM_APURACAO',
    actor: 'dash-duty-owner',
  },
  { seq: 30, from: 'EM_APURACAO', to: 'PREPARADO', actor: 'dash-duty-owner' },
  {
    seq: 40,
    from: 'PREPARADO',
    to: 'SUBMETIDO_PUBLICADO',
    actor: 'dash-duty-owner',
  },
  {
    seq: 50,
    from: 'SUBMETIDO_PUBLICADO',
    to: 'COMPROVADO',
    actor: 'dash-duty-owner|dash-operator',
  },
  { seq: 60, from: 'COMPROVADO', to: 'ARQUIVADO', actor: 'system' },
  { seq: 70, from: 'JANELA_ABERTA', to: 'ATRASADO', actor: 'system' },
  { seq: 71, from: 'EM_APURACAO', to: 'ATRASADO', actor: 'system' },
  { seq: 72, from: 'PREPARADO', to: 'ATRASADO', actor: 'system' },
  {
    seq: 80,
    from: 'ATRASADO',
    to: 'SUBMETIDO_PUBLICADO',
    actor: 'dash-duty-owner',
  },
  { seq: 90, from: 'ATRASADO', to: 'NAO_CUMPRIDO', actor: 'system' },
];

/** CTG-0002 §2.3 (10 linhas). */
export const ESCALATION_CHAIN: readonly {
  sourceApp: string;
  level: number;
  role: string;
  status: 'vigente' | 'source_pending';
}[] = [
  { sourceApp: 'rait', level: 1, role: 'rait-analyst', status: 'vigente' },
  { sourceApp: 'rait', level: 2, role: 'rait-coordinator', status: 'vigente' },
  { sourceApp: 'rait', level: 3, role: 'rait-manager', status: 'vigente' },
  { sourceApp: 'rait', level: 4, role: 'rait-chair', status: 'vigente' },
  { sourceApp: 'rait', level: 5, role: 'AUDITOR', status: 'source_pending' },
  { sourceApp: 'pec', level: 1, role: 'GESTOR', status: 'source_pending' },
  {
    sourceApp: 'teat',
    level: 1,
    role: 'traffic-authority',
    status: 'source_pending',
  },
  {
    sourceApp: 'boat',
    level: 1,
    role: 'dash-operator',
    status: 'source_pending',
  },
  {
    sourceApp: 'portal',
    level: 1,
    role: 'dash-operator',
    status: 'source_pending',
  },
  {
    sourceApp: 'senatran-adapter',
    level: 1,
    role: 'dash-operator',
    status: 'source_pending',
  },
];

/** CTG-0001 §3.10 — os 14 códigos de `dashboard.timer_ref`. */
export const TIMER_CODES = [
  'T-DASH-ACK-N1',
  'T-DASH-ACK-N2',
  'T-DASH-ACK-N3',
  'T-DASH-ACK-CRITICO',
  'T-DASH-MARCO-50',
  'T-DASH-MARCO-75',
  'T-DASH-MARCO-90',
  'T-DASH-DUTY-201',
  'T-DASH-DUTY-202',
  'T-DASH-DUTY-PNATRANS',
  'T-DASH-DUTY-206',
  'T-DASH-DUTY-207',
  'T-DASH-DUTY-209',
  'T-DASH-PENDING-FLOOR',
] as const;

/** CTG-0002 §12 — tipos técnicos (montados por `topic(...)` no ciclo; aqui
 * são o VALOR ESPERADO na coluna `topic`/`payload.type` da outbox) e chaves
 * admitidas em `data` por tipo. */
export const EVENT_TYPES = {
  alertChanged: 'dashboard.alert.changed',
  dutyChanged: 'dashboard.duty.changed',
  sourceFreshness: 'dashboard.source.freshness',
  exportRegistered: 'dashboard.export.registered',
  reportChanged: 'dashboard.report.changed',
  indicatorConfigChanged: 'dashboard.indicator-config.changed',
} as const;

export const EVENT_DATA_KEYS: Record<string, readonly string[]> = {
  [EVENT_TYPES.alertChanged]: [
    'alertId',
    'indicatorCode',
    'track',
    'fromState',
    'toState',
    'severity',
    'block',
    'sourceApp',
    'objectKind',
    'objectLayer',
    'objectRef',
    'ownerRole',
    'escalationLevel',
    'recipientRole',
    'recipientLevel',
    'chainStatus',
    'ackChannel',
    'incidentRef',
    'nextMilestoneAt',
    'ceilingOn',
    'occurredAt',
    'sourceEventId',
  ],
  [EVENT_TYPES.dutyChanged]: [
    'dutyCycleId',
    'dutyCode',
    'indicatorCode',
    'period',
    'fromState',
    'toState',
    'deadlineOn',
    'late',
    'evidenceHash',
    'occurredAt',
  ],
  [EVENT_TYPES.sourceFreshness]: [
    'sourceId',
    'sourceKey',
    'app',
    'fromState',
    'toState',
    'hidden',
    'lastSeenAt',
    'staleSince',
    'acceptableLatencyMinutes',
    'occurredAt',
  ],
  [EVENT_TYPES.exportRegistered]: [
    'exportId',
    'userRef',
    'userRole',
    'scope',
    'format',
    'layer',
    'purpose',
    'rowCount',
    'suppressedCells',
    'status',
    'approvedBy',
    'occurredAt',
  ],
  [EVENT_TYPES.reportChanged]: [
    'reportId',
    'reportType',
    'layer',
    'purpose',
    'status',
    'fileHash',
    'failureCode',
    'occurredAt',
  ],
  [EVENT_TYPES.indicatorConfigChanged]: [
    'indicatorConfigId',
    'indicatorCode',
    'code',
    'status',
    'publishedBy',
    'publishedAt',
    'acceptableLatencyMinutes',
    'hasThreshold',
    'occurredAt',
  ],
};

/** `aggregate.kind` por tipo (§12). */
export const EVENT_AGGREGATE_KIND: Record<string, string> = {
  [EVENT_TYPES.alertChanged]: 'alert',
  [EVENT_TYPES.dutyChanged]: 'duty_cycle',
  [EVENT_TYPES.sourceFreshness]: 'source',
  [EVENT_TYPES.exportRegistered]: 'export_log',
  [EVENT_TYPES.reportChanged]: 'generated_report',
  [EVENT_TYPES.indicatorConfigChanged]: 'indicator_config',
};

/** Chaves que NUNCA podem aparecer em `data` (§12: nome, placa, nº de
 * processo, texto livre). */
export const FORBIDDEN_EVENT_DATA_KEYS = [
  'note',
  'description',
  'name',
  'plate',
  'processNumber',
  'personName',
  'justification',
] as const;

/** §6.6 — chaves de `AlertView` (anatomia mínima), sem outras. */
export const ALERT_VIEW_KEYS = [
  'id',
  'indicatorCode',
  'track',
  'state',
  'severity',
  'block',
  'sourceApp',
  'object',
  'ownerRole',
  'ownerRef',
  'governingClock',
  'nextMilestoneAt',
  'ceilingOn',
  'escalationLevel',
  'ackChannel',
  'incidentRef',
  'timestamps',
  'trail',
  'timers',
  'version',
  'meta',
] as const;

// ---------------------------------------------------------------------------
// Namespace `0083…` (ids desta suíte)
// ---------------------------------------------------------------------------

/** `00000000-0000-7000-8000-0083<SS><NNNNNN>` — `spec` 2 dígitos hex, `n`
 * até 6 dígitos hex. */
export function cycleId(spec: string, n: number): string {
  if (!/^[0-9a-f]{2}$/.test(spec)) throw new Error(`spec inválido: ${spec}`);
  return `00000000-0000-7000-8000-0083${spec}${n.toString(16).padStart(6, '0')}`;
}

/** Fontes próprias da suíte (nenhuma colide com o seed 81; CTG-0002 §8.3 mapa
 * projeção → `source_key`). `portal.outbox` e `dashboard` não têm seed —
 * pelo §8.3 "fonte sem linha = INDISPONIVEL", o que tornaria todo comando
 * sobre alerta de `portal`/dever 409 `DASH.ALERT_SOURCE_STALE`; a suíte
 * insere-as `FRESCO` (com `heartbeat_contract`) e as apaga no `afterAll`
 * (OD proposta no relatório). */
export const SUITE_SOURCE_KEYS = {
  portalOutbox: 'portal.outbox',
  dashboardOwnState: 'dashboard',
} as const;

// ---------------------------------------------------------------------------
// Calendário 2026
// ---------------------------------------------------------------------------

export function loadCalendar2026(): CalendarJson {
  return JSON.parse(
    readFileSync(
      fileURLToPath(
        new URL(
          '../../../../../../docs/framework/arch/fixtures/calendar-2026.json',
          import.meta.url,
        ),
      ),
      'utf8',
    ),
  ) as CalendarJson;
}

/** Instante ISO de uma data-hora civil em `America/Manaus` (UTC−04:00, sem
 * horário de verão) — usado para escrever os casos de §6.8/§13.2 na forma
 * em que o contrato os enuncia (hora local) e compará-los em UTC. */
export function manaus(localIso: string): Date {
  return new Date(`${localIso}-04:00`);
}

/** Fim do dia civil `YYYY-MM-DD` em Manaus (`23:59:59.999`, §13.2). */
export function endOfDayManaus(day: string): Date {
  return manaus(`${day}T23:59:59.999`);
}
