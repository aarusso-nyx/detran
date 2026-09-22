import 'reflect-metadata';
import type { INestApplication } from '@nestjs/common';
import type http from 'node:http';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  DETRAN_ROLES,
  dashboardLayerFor,
  type DashboardLayer,
} from '@detran/shared';

import {
  LOCAL,
  SEED,
  TENANT_ID,
  createDashboardApp,
  dbNow,
  headers,
  insertBiPanel,
  insertDataset,
  insertGeneratedReport,
  insertIndicatorConfig,
  newClient,
  openStream,
  insertSuiteSources,
  resetDashboardE2eRows,
  restoreEnv,
  DATASET_KEYS,
} from './dashboard-e2e.support.js';

/**
 * R-0011 CTG-0002 §4 (TASK-0014, M25) — C-0002-50 (fechamento rota ⇔ política
 * do domínio `dashboard`, dois sentidos, `GET stream` sob `dashboard:alert:read`)
 * e C-0002-51…82: a matriz de PRESENÇA E AUSÊNCIA das 32 chaves de §4.2, um
 * bloco por linha, dirigida por dados — as duas listas de cada linha são
 * TRANSCRITAS do contrato (nunca derivadas por analogia) e a iteração é sobre
 * `DETRAN_ROLES` de `@detran/shared` (36 papéis): papel na coluna
 * "Permitidos" → a sonda do caminho feliz mínimo devolve o status exato
 * esperado (200/201 ou o 4xx de pré-condição — nunca 403); papel na coluna
 * "Negados" → 403 do `DetranPolicyGuard` antes de qualquer guarda de negócio
 * (§4.4 ordem (1)). O spec ainda prova que `allowed ∪ denied = DETRAN_ROLES` em
 * cada linha (nenhum papel esquecido).
 *
 * Sondas não mutantes: comandos com `If-Match` obrigatório são chamados SEM o
 * cabeçalho (428 `DASH.IF_MATCH_REQUIRED`, §4.4 passo 3, sobre fixtures
 * existentes); criações recebem um corpo que a regra de negócio ou o zod
 * recusa antes de gravar (400). Forma de `policy-routes.e2e.spec.ts`
 * (`ModulesContainer` + metadados `@Resource/@Action`). Fica vermelho até
 * TASK-0013 montar os controllers de §14.2 e o `DashboardStreamController`.
 */
const client = newClient();
let app: INestApplication;
let port = 0;
let since = '';
const openRequests: http.ClientRequest[] = [];

const CONFIG_ID = LOCAL.indicatorConfig('01');
const PANEL_ID = LOCAL.biPanel('01');
const REPORT_ID = LOCAL.generatedReport('01');

interface Probe {
  method: 'get' | 'post' | 'patch';
  path: string;
  /** Status exato esperado para todo papel permitido com a camada mínima (nunca 403 de política). */
  status: number;
  /** `body.code` esperado quando o status é um 4xx de pré-condição. */
  code?: string;
  body?: Record<string, unknown>;
  stream?: boolean;
  /** Camada mínima da rota/recorte (§5.2); abaixo dela o gate responde 403 `DASH.LAYER_FORBIDDEN`. */
  minLayer?: DashboardLayer;
  /** Código do 403 de camada quando não é `DASH.LAYER_FORBIDDEN` (ex. `DASH.EXPORT_LAYER_EXCEEDED`, §9.1). */
  belowLayerCode?: string;
}

interface PolicyRow {
  criterion: string;
  key: string;
  allowed: readonly string[];
  denied: readonly string[];
  probes: Probe[];
}

// Sets de `policy.ts` 1513–1543, transcritos (CTG-0002 §3 "Papéis usados").
const AREA = [
  'rait-manager',
  'rait-coordinator',
  'rait-chair',
  'traffic-authority',
  'GESTOR',
] as const;
const PEC_STAFF = [
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
] as const;
const TEAT_STAFF = [
  'field-agent',
  'field-supervisor',
  'processing-operator',
  'traffic-authority',
  'agency-admin',
  'technical-admin',
  'bi-analyst',
  'integration-operator',
] as const;
const RAIT_STAFF = [
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
] as const;
const DASH_STAFF = ['dash-operator', 'dash-duty-owner'] as const;
/** §4.2 linhas 7, 8, 14, 31: `N0` = os 34 papéis fora `CANDIDATO`/`CIDADAO`. */
const N0_ALLOWED = [
  ...PEC_STAFF,
  ...TEAT_STAFF,
  ...RAIT_STAFF,
  ...DASH_STAFF,
] as const;
const N0_DENIED = ['CANDIDATO', 'CIDADAO'] as const;

const IF_MATCH_REQUIRED = { status: 428, code: 'DASH.IF_MATCH_REQUIRED' };

/**
 * A23 (a) (plan R-0011; precedente `policy-routes.e2e.spec.ts`, R-0008 CTG-0001
 * §7): `policy.ts` concede `'*'` a `GLOBAL_ADMIN_ROLES` por regra de plataforma
 * (`isDetranActionAllowed`), acima de `DASHBOARD_RULES`. As listas de §4.2
 * ficam transcritas como estão (`allowed`/`denied` de cada linha — a
 * cobertura `allowed ∪ denied = DETRAN_ROLES` é provada sobre elas); a
 * expectativa efetiva trata estes quatro papéis como permitidos em toda chave.
 * As camadas continuam a barrar N3 e a exigir finalidade (§5) — abaixo da
 * camada mínima da sonda (§5.2) o status é 403 `DASH.LAYER_FORBIDDEN` do
 * `DashboardLayerGate`, nunca o 403 de política (OD-D76 ao Owner).
 */
const GLOBAL_ADMIN_ROLE_GRANTS = [
  'ADMIN',
  'GESTOR_DETRAN',
  'SUPORTE',
  'technical-admin',
] as const;
const LAYER_RANK: Record<DashboardLayer, number> = { N0: 0, N1: 1, N2: 2 };

function isPermitted(row: PolicyRow, role: string): boolean {
  return (
    row.allowed.includes(role) ||
    (GLOBAL_ADMIN_ROLE_GRANTS as readonly string[]).includes(role)
  );
}

/** Status esperado da sonda para um papel permitido (política) — §5.2 abaixo da camada mínima. */
function expectedFor(
  entry: Probe,
  role: string,
): { status: number; code?: string } {
  if (
    entry.minLayer &&
    LAYER_RANK[dashboardLayerFor([role])] < LAYER_RANK[entry.minLayer]
  ) {
    return {
      status: 403,
      code: entry.belowLayerCode ?? 'DASH.LAYER_FORBIDDEN',
    };
  }
  return { status: entry.status, code: entry.code };
}
const DUTY_CYCLE_PATH = `/v1/dashboard/duties/${SEED.duty.duty01}/cycles/2026-09`;

/** CTG-0002 §4.2 — as 32 linhas, transcritas (Permitidos / Negados). */
const MATRIX: PolicyRow[] = [
  {
    criterion: 'C-0002-51',
    key: 'dashboard:alert:read',
    allowed: [
      'dash-operator',
      ...AREA,
      'agency-admin',
      'technical-admin',
      'AUDITOR',
    ],
    denied: [
      'ADMIN',
      'ADMIN_CLINICA',
      'MEDICO',
      'PSICOLOGO',
      'RECEPCAO',
      'TECNICO_BIOMETRIA',
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
      'bi-analyst',
      'integration-operator',
      'rait-analyst',
      'rait-secretary',
      'rait-signing-authority',
      'rait-central-authority',
      'rait-rapporteur',
      'rait-hr',
      'rait-finance',
      'dash-duty-owner',
      'CIDADAO',
    ],
    probes: [
      {
        method: 'get',
        path: '/v1/dashboard/alerts',
        status: 200,
        minLayer: 'N1',
      },
      {
        method: 'get',
        path: `/v1/dashboard/alerts/${SEED.alert.detectadoIrregularity}`,
        status: 200,
        minLayer: 'N1',
      },
      // O stream não tem camada mínima em §5.2: a camada filtra os eventos
      // no SQL (§11, `objectLayer <= camada do papel`), não recusa o handshake.
      {
        method: 'get',
        path: '/v1/dashboard/stream',
        status: 200,
        stream: true,
      },
    ],
  },
  {
    criterion: 'C-0002-52',
    key: 'dashboard:alert:ack',
    allowed: [
      'dash-operator',
      ...AREA,
      'agency-admin',
      'technical-admin',
      'integration-operator',
    ],
    denied: [
      'ADMIN',
      'ADMIN_CLINICA',
      'MEDICO',
      'PSICOLOGO',
      'RECEPCAO',
      'TECNICO_BIOMETRIA',
      'AUDITOR',
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
      'bi-analyst',
      'rait-analyst',
      'rait-secretary',
      'rait-signing-authority',
      'rait-central-authority',
      'rait-rapporteur',
      'rait-hr',
      'rait-finance',
      'dash-duty-owner',
      'CIDADAO',
    ],
    probes: [
      {
        method: 'post',
        path: `/v1/dashboard/alerts/${SEED.alert.notificadoExtinction}/ack`,
        body: { channel: 'origin' },
        minLayer: 'N1',
        ...IF_MATCH_REQUIRED,
      },
    ],
  },
  {
    criterion: 'C-0002-53',
    key: 'dashboard:alert:treat',
    allowed: [
      ...AREA,
      'agency-admin',
      'technical-admin',
      'integration-operator',
    ],
    denied: [
      'ADMIN',
      'ADMIN_CLINICA',
      'MEDICO',
      'PSICOLOGO',
      'RECEPCAO',
      'TECNICO_BIOMETRIA',
      'AUDITOR',
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
      'bi-analyst',
      'rait-analyst',
      'rait-secretary',
      'rait-signing-authority',
      'rait-central-authority',
      'rait-rapporteur',
      'rait-hr',
      'rait-finance',
      'dash-operator',
      'dash-duty-owner',
      'CIDADAO',
    ],
    probes: [
      {
        method: 'post',
        path: `/v1/dashboard/alerts/${SEED.alert.reconhecidoExtinction}/treating`,
        body: {},
        minLayer: 'N1',
        ...IF_MATCH_REQUIRED,
      },
    ],
  },
  {
    criterion: 'C-0002-54',
    key: 'dashboard:alert:close',
    allowed: ['dash-operator'],
    denied: [
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
      'dash-duty-owner',
      'CIDADAO',
    ],
    probes: [
      {
        method: 'post',
        path: `/v1/dashboard/alerts/${SEED.alert.verificadoIrregularity}/close`,
        body: {},
        minLayer: 'N1',
        ...IF_MATCH_REQUIRED,
      },
    ],
  },
  {
    criterion: 'C-0002-55',
    key: 'dashboard:alert:annotate',
    allowed: ['technical-admin', 'integration-operator'],
    denied: [
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
      'bi-analyst',
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
    ],
    probes: [
      {
        method: 'post',
        path: `/v1/dashboard/alerts/${SEED.alert.notificadoExtinction}/root-cause`,
        body: { category: 'transport', description: 'sonda e2e TASK-0014' },
        minLayer: 'N1',
        ...IF_MATCH_REQUIRED,
      },
    ],
  },
  {
    criterion: 'C-0002-56',
    key: 'dashboard:incident:read',
    allowed: [...AREA, 'agency-admin', 'AUDITOR'],
    denied: [
      'ADMIN',
      'ADMIN_CLINICA',
      'MEDICO',
      'PSICOLOGO',
      'RECEPCAO',
      'TECNICO_BIOMETRIA',
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
      'technical-admin',
      'bi-analyst',
      'integration-operator',
      'rait-analyst',
      'rait-secretary',
      'rait-signing-authority',
      'rait-central-authority',
      'rait-rapporteur',
      'rait-hr',
      'rait-finance',
      'dash-operator',
      'dash-duty-owner',
      'CIDADAO',
    ],
    // Alerta N1 fora de `INCIDENTE_REGISTRADO`: a camada servida é N1 (sem
    // `X-Purpose`/escopo) e a guarda de estado responde 404 para todos os
    // papéis permitidos — sonda sem N2, sem 403 de escopo.
    probes: [
      {
        method: 'get',
        path: `/v1/dashboard/alerts/${SEED.alert.detectadoIrregularity}/incident`,
        status: 404,
        code: 'DASH.ALERT_INCIDENT_NOT_FOUND',
        minLayer: 'N1',
      },
    ],
  },
  {
    criterion: 'C-0002-57',
    key: 'dashboard:duty:read',
    allowed: N0_ALLOWED,
    denied: N0_DENIED,
    probes: [{ method: 'get', path: '/v1/dashboard/duties', status: 200 }],
  },
  {
    criterion: 'C-0002-58',
    key: 'dashboard:duty-cycle:read',
    allowed: N0_ALLOWED,
    denied: N0_DENIED,
    probes: [
      {
        method: 'get',
        path: `/v1/dashboard/duties/${SEED.duty.duty01}/cycles`,
        status: 200,
      },
      { method: 'get', path: DUTY_CYCLE_PATH, status: 200 },
    ],
  },
  {
    criterion: 'C-0002-59',
    key: 'dashboard:duty-cycle:start',
    allowed: ['dash-duty-owner', 'agency-admin'],
    denied: [
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
      'CIDADAO',
    ],
    probes: [
      {
        method: 'post',
        path: `${DUTY_CYCLE_PATH}/start`,
        body: {},
        ...IF_MATCH_REQUIRED,
      },
    ],
  },
  {
    criterion: 'C-0002-60',
    key: 'dashboard:duty-cycle:prepare',
    allowed: ['dash-duty-owner', 'agency-admin'],
    denied: [
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
      'CIDADAO',
    ],
    probes: [
      {
        method: 'post',
        path: `${DUTY_CYCLE_PATH}/prepare`,
        body: {},
        ...IF_MATCH_REQUIRED,
      },
    ],
  },
  {
    criterion: 'C-0002-61',
    key: 'dashboard:duty-cycle:submit',
    allowed: ['dash-duty-owner', 'agency-admin'],
    denied: [
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
      'CIDADAO',
    ],
    probes: [
      {
        method: 'post',
        path: `${DUTY_CYCLE_PATH}/submit`,
        body: { submittedAt: '2026-09-14T12:00:00.000Z' },
        ...IF_MATCH_REQUIRED,
      },
    ],
  },
  {
    criterion: 'C-0002-62',
    key: 'dashboard:duty-cycle:prove',
    allowed: ['dash-duty-owner', 'agency-admin'],
    denied: [
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
      'CIDADAO',
    ],
    probes: [
      {
        method: 'post',
        path: `${DUTY_CYCLE_PATH}/prove`,
        body: { evidence: { hash: 'a'.repeat(64) } },
        ...IF_MATCH_REQUIRED,
      },
    ],
  },
  {
    criterion: 'C-0002-63',
    key: 'dashboard:duty-cycle:archive',
    allowed: ['dash-operator', 'agency-admin'],
    denied: [
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
      'dash-duty-owner',
      'CIDADAO',
    ],
    probes: [
      {
        method: 'post',
        path: `${DUTY_CYCLE_PATH}/archive`,
        body: {},
        ...IF_MATCH_REQUIRED,
      },
    ],
  },
  {
    criterion: 'C-0002-64',
    key: 'dashboard:indicator:read',
    allowed: N0_ALLOWED,
    denied: N0_DENIED,
    probes: [
      { method: 'get', path: '/v1/dashboard/indicators', status: 200 },
      {
        method: 'get',
        path: '/v1/dashboard/indicators/IND-DASH-101',
        status: 200,
      },
    ],
  },
  {
    criterion: 'C-0002-65',
    key: 'dashboard:indicator-config:read',
    allowed: ['bi-analyst', 'agency-admin', 'technical-admin', 'AUDITOR'],
    denied: [
      'ADMIN',
      'ADMIN_CLINICA',
      'MEDICO',
      'PSICOLOGO',
      'RECEPCAO',
      'TECNICO_BIOMETRIA',
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
    ],
    probes: [
      { method: 'get', path: '/v1/dashboard/indicator-configs', status: 200 },
      {
        method: 'get',
        path: `/v1/dashboard/indicator-configs/${CONFIG_ID}`,
        status: 200,
      },
    ],
  },
  {
    criterion: 'C-0002-66',
    key: 'dashboard:indicator-config:update',
    allowed: ['bi-analyst', 'agency-admin', 'technical-admin'],
    denied: [
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
    ],
    probes: [
      {
        method: 'patch',
        path: `/v1/dashboard/indicator-configs/${CONFIG_ID}`,
        body: { name: 'sonda e2e TASK-0014' },
        ...IF_MATCH_REQUIRED,
      },
    ],
  },
  {
    criterion: 'C-0002-67',
    key: 'dashboard:indicator-config:publish',
    allowed: ['bi-analyst', 'agency-admin', 'technical-admin'],
    denied: [
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
    ],
    probes: [
      {
        method: 'post',
        path: `/v1/dashboard/indicator-configs/${CONFIG_ID}/publish`,
        body: {},
        ...IF_MATCH_REQUIRED,
      },
    ],
  },
  {
    criterion: 'C-0002-68',
    key: 'dashboard:bi-panel:read',
    allowed: ['bi-analyst', 'agency-admin', 'technical-admin', 'AUDITOR'],
    denied: [
      'ADMIN',
      'ADMIN_CLINICA',
      'MEDICO',
      'PSICOLOGO',
      'RECEPCAO',
      'TECNICO_BIOMETRIA',
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
    ],
    probes: [
      { method: 'get', path: '/v1/dashboard/bi-panels', status: 200 },
      {
        method: 'get',
        path: `/v1/dashboard/bi-panels/${PANEL_ID}`,
        status: 200,
      },
    ],
  },
  {
    criterion: 'C-0002-69',
    key: 'dashboard:bi-panel:publish',
    allowed: ['bi-analyst', 'agency-admin', 'technical-admin'],
    denied: [
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
    ],
    probes: [
      // `POST bi-panels` (IK, sem IM): corpo vazio → zod `.strict()` 400 antes de gravar.
      {
        method: 'post',
        path: '/v1/dashboard/bi-panels',
        body: {},
        status: 400,
        code: 'DASH.VALIDATION_FAILED',
      },
      {
        method: 'patch',
        path: `/v1/dashboard/bi-panels/${PANEL_ID}`,
        body: { name: 'sonda e2e TASK-0014' },
        ...IF_MATCH_REQUIRED,
      },
      {
        method: 'post',
        path: `/v1/dashboard/bi-panels/${PANEL_ID}/publish`,
        body: {},
        ...IF_MATCH_REQUIRED,
      },
    ],
  },
  {
    criterion: 'C-0002-70',
    key: 'dashboard:generated-report:read',
    allowed: ['bi-analyst', 'agency-admin', 'technical-admin', 'AUDITOR'],
    denied: [
      'ADMIN',
      'ADMIN_CLINICA',
      'MEDICO',
      'PSICOLOGO',
      'RECEPCAO',
      'TECNICO_BIOMETRIA',
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
    ],
    probes: [
      { method: 'get', path: '/v1/dashboard/generated-reports', status: 200 },
      {
        method: 'get',
        path: `/v1/dashboard/generated-reports/${REPORT_ID}`,
        status: 200,
      },
    ],
  },
  {
    criterion: 'C-0002-71',
    key: 'dashboard:generated-report:request',
    allowed: ['bi-analyst', 'agency-admin', 'technical-admin'],
    denied: [
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
    ],
    probes: [
      {
        method: 'post',
        path: '/v1/dashboard/generated-reports',
        body: { reportType: 'x', layer: 'N0' },
        status: 400,
        code: 'DASH.REPORT_TYPE_INVALID',
      },
    ],
  },
  {
    criterion: 'C-0002-72',
    key: 'dashboard:generated-report:complete',
    allowed: ['bi-analyst', 'technical-admin'],
    denied: [
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
    ],
    probes: [
      {
        method: 'post',
        path: `/v1/dashboard/generated-reports/${REPORT_ID}/complete`,
        body: {
          fileUri: 'https://fixtures.detran-am.invalid/reports/sonda.csv',
          fileHash: 'a'.repeat(64),
        },
        ...IF_MATCH_REQUIRED,
      },
    ],
  },
  {
    criterion: 'C-0002-73',
    key: 'dashboard:generated-report:fail',
    allowed: ['bi-analyst', 'technical-admin'],
    denied: [
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
    ],
    probes: [
      {
        method: 'post',
        path: `/v1/dashboard/generated-reports/${REPORT_ID}/fail`,
        body: { failureCode: 'sonda-e2e' },
        ...IF_MATCH_REQUIRED,
      },
    ],
  },
  {
    criterion: 'C-0002-74',
    key: 'dashboard:source:read',
    allowed: [
      'technical-admin',
      'integration-operator',
      'dash-operator',
      'AUDITOR',
    ],
    denied: [
      'ADMIN',
      'ADMIN_CLINICA',
      'MEDICO',
      'PSICOLOGO',
      'RECEPCAO',
      'TECNICO_BIOMETRIA',
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
      'bi-analyst',
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
      'dash-duty-owner',
      'CIDADAO',
    ],
    probes: [
      {
        method: 'get',
        path: '/v1/dashboard/sources',
        status: 200,
        minLayer: 'N1',
      },
      {
        method: 'get',
        path: `/v1/dashboard/sources/${SEED.source.raitOutbox}`,
        status: 200,
        minLayer: 'N1',
      },
    ],
  },
  {
    criterion: 'C-0002-75',
    key: 'dashboard:export:create',
    allowed: [
      'agency-admin',
      'GESTOR_DETRAN',
      ...AREA,
      'dash-operator',
      'dash-duty-owner',
      'technical-admin',
      'integration-operator',
      'bi-analyst',
    ],
    denied: [
      'ADMIN',
      'ADMIN_CLINICA',
      'MEDICO',
      'PSICOLOGO',
      'RECEPCAO',
      'TECNICO_BIOMETRIA',
      'AUDITOR',
      'SUPERVISOR',
      'JUNTA',
      'CETRAN',
      'DPO',
      'SUPORTE',
      'CANDIDATO',
      'field-agent',
      'field-supervisor',
      'processing-operator',
      'rait-analyst',
      'rait-secretary',
      'rait-signing-authority',
      'rait-central-authority',
      'rait-rapporteur',
      'rait-hr',
      'rait-finance',
      'CIDADAO',
    ],
    // Recorte `alerts` (N1, todos os 12 papéis têm ≥ N1) com formato
    // proprietário: a regra de formato (§9.1) responde 400 sem gravar.
    probes: [
      {
        method: 'post',
        path: '/v1/dashboard/exports',
        body: { scope: 'alerts', filters: {}, format: 'xlsx' },
        status: 400,
        code: 'DASH.EXPORT_FORMAT_NOT_OPEN',
        minLayer: 'N1',
        belowLayerCode: 'DASH.EXPORT_LAYER_EXCEEDED',
      },
    ],
  },
  {
    criterion: 'C-0002-76',
    key: 'dashboard:export:approve',
    allowed: ['agency-admin'],
    denied: [
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
    ],
    // Fixture 0501 (`pending-approval`) com corpo vazio: `justification`
    // obrigatória → 400 do zod, sem aprovar a fixture do seed.
    probes: [
      {
        method: 'post',
        path: `/v1/dashboard/exports/${SEED.exportPendingApproval}/approve`,
        body: {},
        status: 400,
        code: 'DASH.VALIDATION_FAILED',
      },
    ],
  },
  {
    criterion: 'C-0002-77',
    key: 'dashboard:audit-trail:read',
    allowed: ['AUDITOR', 'DPO', 'agency-admin', ...AREA],
    denied: [
      'ADMIN',
      'ADMIN_CLINICA',
      'MEDICO',
      'PSICOLOGO',
      'RECEPCAO',
      'TECNICO_BIOMETRIA',
      'SUPERVISOR',
      'GESTOR_DETRAN',
      'JUNTA',
      'CETRAN',
      'SUPORTE',
      'CANDIDATO',
      'field-agent',
      'field-supervisor',
      'processing-operator',
      'technical-admin',
      'bi-analyst',
      'integration-operator',
      'rait-analyst',
      'rait-secretary',
      'rait-signing-authority',
      'rait-central-authority',
      'rait-rapporteur',
      'rait-hr',
      'rait-finance',
      'dash-operator',
      'dash-duty-owner',
      'CIDADAO',
    ],
    probes: [
      {
        method: 'get',
        path: '/v1/dashboard/audit-trail',
        status: 200,
        minLayer: 'N1',
      },
    ],
  },
  {
    criterion: 'C-0002-78',
    key: 'dashboard:comparison:read',
    allowed: ['agency-admin', ...AREA, 'bi-analyst', 'AUDITOR'],
    denied: [
      'ADMIN',
      'ADMIN_CLINICA',
      'MEDICO',
      'PSICOLOGO',
      'RECEPCAO',
      'TECNICO_BIOMETRIA',
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
      'technical-admin',
      'integration-operator',
      'rait-analyst',
      'rait-secretary',
      'rait-signing-authority',
      'rait-central-authority',
      'rait-rapporteur',
      'rait-hr',
      'rait-finance',
      'dash-operator',
      'dash-duty-owner',
      'CIDADAO',
    ],
    probes: [
      {
        method: 'get',
        path: '/v1/dashboard/comparisons?dimension=pool',
        status: 200,
        minLayer: 'N1',
      },
    ],
  },
  {
    criterion: 'C-0002-79',
    key: 'dashboard:transparency-audit:read',
    allowed: ['technical-admin', 'agency-admin', 'AUDITOR'],
    denied: [
      'ADMIN',
      'ADMIN_CLINICA',
      'MEDICO',
      'PSICOLOGO',
      'RECEPCAO',
      'TECNICO_BIOMETRIA',
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
    ],
    probes: [
      {
        method: 'get',
        path: '/v1/dashboard/transparency/checklist',
        status: 200,
      },
    ],
  },
  {
    criterion: 'C-0002-80',
    key: 'dashboard:transparency-audit:audit',
    allowed: ['technical-admin', 'agency-admin'],
    denied: [
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
    ],
    // Período fora da forma mensal → 400 `DASH.DUTY_PERIOD_INVALID` sem gravar.
    probes: [
      {
        method: 'post',
        path: '/v1/dashboard/transparency/audits',
        body: { period: '2026-9', checklist: {}, result: 'sonda' },
        status: 400,
        code: 'DASH.DUTY_PERIOD_INVALID',
      },
    ],
  },
  {
    criterion: 'C-0002-81',
    key: 'dashboard:dataset:read',
    allowed: N0_ALLOWED,
    denied: N0_DENIED,
    probes: [
      { method: 'get', path: '/v1/dashboard/datasets', status: 200 },
      {
        method: 'get',
        path: `/v1/dashboard/open-data/${DATASET_KEYS.alertsBySeverityMonth}`,
        status: 200,
      },
    ],
  },
  {
    criterion: 'C-0002-82',
    key: 'dashboard:kpi:read',
    allowed: ['agency-admin', 'dash-operator', 'AUDITOR'],
    denied: [
      'ADMIN',
      'ADMIN_CLINICA',
      'MEDICO',
      'PSICOLOGO',
      'RECEPCAO',
      'TECNICO_BIOMETRIA',
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
      'dash-duty-owner',
      'CIDADAO',
    ],
    probes: [{ method: 'get', path: '/v1/dashboard/kpis', status: 200 }],
  },
];

interface RouteEntry {
  key: string;
  controller: string;
  method: string;
}

/** Cópia da coleta de `policy-routes.e2e.spec.ts` (metadados de `DetranPolicyGuard`). */
function collectMountedRoutes(
  modulesContainer: Iterable<{
    controllers: Map<unknown, { metatype?: unknown }>;
  }>,
  DETRAN_RESOURCE_METADATA_KEY: string,
  DETRAN_ACTION_METADATA_KEY: string,
  policyKey: (resource: string, action: string) => string,
): RouteEntry[] {
  const routes: RouteEntry[] = [];
  for (const module of modulesContainer) {
    for (const wrapper of module.controllers.values()) {
      const metatype = wrapper.metatype as
        (Function & { name: string }) | undefined;
      if (!metatype) continue;
      const classResource = Reflect.getMetadata(
        DETRAN_RESOURCE_METADATA_KEY,
        metatype,
      ) as string | undefined;
      const prototype = (metatype as unknown as { prototype: object })
        .prototype;
      for (const methodName of Object.getOwnPropertyNames(prototype)) {
        if (methodName === 'constructor') continue;
        const handler = (prototype as Record<string, unknown>)[methodName];
        if (typeof handler !== 'function') continue;
        const action = Reflect.getMetadata(
          DETRAN_ACTION_METADATA_KEY,
          handler,
        ) as string | undefined;
        if (!action) continue;
        const methodResource = Reflect.getMetadata(
          DETRAN_RESOURCE_METADATA_KEY,
          handler,
        ) as string | undefined;
        const resource = methodResource ?? classResource;
        if (!resource) continue;
        try {
          routes.push({
            key: policyKey(resource, action),
            controller: metatype.name,
            method: methodName,
          });
        } catch {
          // recurso mal formado; fora do escopo (verify:decorators cobre a forma).
        }
      }
    }
  }
  return routes;
}

async function probe(
  role: string,
  entry: Probe,
): Promise<{ status: number; body: Record<string, unknown> }> {
  if (entry.stream) {
    const stream = openStream(
      port,
      entry.path,
      { ...headers(role), accept: 'text/event-stream' },
      openRequests,
    );
    await stream.opened;
    const status = stream.status();
    stream.close();
    return { status, body: {} };
  }
  const agent = request(app.getHttpServer());
  const req =
    entry.method === 'get'
      ? agent.get(entry.path)
      : entry.method === 'post'
        ? agent.post(entry.path)
        : agent.patch(entry.path);
  const response = await req.set(headers(role)).send(entry.body ?? {});
  return { status: response.status, body: response.body };
}

beforeAll(async () => {
  await client.connect();
  since = await dbNow(client);
  await resetDashboardE2eRows(client, since);
  await insertSuiteSources(client);
  await insertIndicatorConfig(client, '01', 'IND-DASH-401');
  await insertBiPanel(client, '01', 'N0');
  await insertGeneratedReport(client, '01', { layer: 'N0' });
  await insertDataset(client, '01', DATASET_KEYS.alertsBySeverityMonth, true);
  app = await createDashboardApp();
  await app.listen(0);
  const address = app.getHttpServer().address();
  port = typeof address === 'object' && address ? address.port : 0;
}, 60_000);

afterAll(async () => {
  for (const req of openRequests.splice(0)) req.destroy();
  await app?.close();
  await resetDashboardE2eRows(client, since);
  await client.end();
  restoreEnv();
});

describe('CTG-0002 §4.3 — fechamento rota ⇔ política do domínio dashboard (C-0002-50)', () => {
  it('C-0002-50 — dado o AppModule real quando as rotas @Resource/@Action de domínio dashboard são coletadas então as 32 chaves de §4.2 fecham nos dois sentidos, com GET stream sob dashboard:alert:read', async () => {
    const { ModulesContainer } = await import('@nestjs/core');
    const {
      DETRAN_RESOURCE_METADATA_KEY,
      DETRAN_ACTION_METADATA_KEY,
      DETRAN_POLICY_MATRIX,
      policyKey,
    } = (await import('@detran/shared')) as unknown as {
      DETRAN_RESOURCE_METADATA_KEY: string;
      DETRAN_ACTION_METADATA_KEY: string;
      DETRAN_POLICY_MATRIX: Record<string, readonly string[]>;
      policyKey: (resource: string, action: string) => string;
    };
    const routes = collectMountedRoutes(
      app.get(ModulesContainer).values(),
      DETRAN_RESOURCE_METADATA_KEY,
      DETRAN_ACTION_METADATA_KEY,
      policyKey,
    ).filter((route) => route.key.startsWith('dashboard:'));

    // Sentido 1 — rota → regra.
    const missingRules = routes.filter(
      (route) => !(route.key in DETRAN_POLICY_MATRIX),
    );
    // Sentido 2 — regra → rota.
    const mountedKeys = new Set(routes.map((route) => route.key));
    const matrixKeys = Object.keys(DETRAN_POLICY_MATRIX).filter((key) =>
      key.startsWith('dashboard:'),
    );
    const missingRoutes = matrixKeys.filter((key) => !mountedKeys.has(key));
    expect(
      { missingRules, missingRoutes },
      [
        'Rotas dashboard:* sem chave em DETRAN_POLICY_MATRIX (sentido 1):',
        ...missingRules.map(
          (route) => `  ${route.key} (${route.controller}.${route.method})`,
        ),
        'Chaves dashboard:* em DETRAN_POLICY_MATRIX sem rota (sentido 2):',
        ...missingRoutes.map((key) => `  ${key}`),
      ].join('\n'),
    ).toEqual({ missingRules: [], missingRoutes: [] });

    // As 32 chaves de §4.2 são exatamente as chaves dashboard:* da matriz e
    // todas estão montadas (nenhuma ampliação, nenhuma exceção).
    const contractKeys = MATRIX.map((row) => row.key).sort();
    expect(matrixKeys.sort()).toEqual(contractKeys);
    expect([...mountedKeys].sort()).toEqual(contractKeys);
    expect(mountedKeys.size).toBe(32);

    // `GET /v1/dashboard/stream` sob `dashboard:alert:read` (§3.8/§11).
    const stream = routes.find(
      (route) =>
        route.key === 'dashboard:alert:read' &&
        route.controller === 'DashboardStreamController',
    );
    expect(
      stream,
      'DashboardStreamController com dashboard:alert:read',
    ).toBeDefined();
  });
});

describe('CTG-0002 §4.2 — matriz de política presença e ausência (C-0002-51…82)', () => {
  it('dado as 32 linhas transcritas quando comparadas a DETRAN_ROLES então cada linha cobre os 36 papéis sem sobra nem falta', () => {
    const canonical = [...DETRAN_ROLES].sort();
    expect(canonical).toHaveLength(36);
    for (const row of MATRIX) {
      const union = [...row.allowed, ...row.denied].sort();
      expect(union, `${row.key}: allowed ∪ denied`).toEqual(canonical);
      expect(
        row.allowed.filter((role) => row.denied.includes(role)),
        `${row.key}: interseção`,
      ).toEqual([]);
    }
    expect(MATRIX.map((row) => row.criterion)).toEqual(
      Array.from({ length: 32 }, (_, index) => `C-0002-${51 + index}`),
    );
  });

  for (const row of MATRIX) {
    describe(`${row.criterion} — ${row.key}`, () => {
      for (const role of DETRAN_ROLES) {
        if (isPermitted(row, role)) {
          it(`${row.criterion} — dado o papel permitido ${role}${row.allowed.includes(role) ? '' : ' (administrador global, A23 a)'} quando chama ${row.probes.map((entry) => `${entry.method.toUpperCase()} ${entry.path}`).join(' | ')} então nunca 403 de política (status do caminho feliz mínimo)`, async () => {
            for (const entry of row.probes) {
              const expected = expectedFor(entry, role);
              const result = await probe(role, entry);
              expect(
                result.status,
                `${role} ${entry.method.toUpperCase()} ${entry.path}: ${JSON.stringify(result.body)}`,
              ).toBe(expected.status);
              if (expected.code) expect(result.body.code).toBe(expected.code);
            }
          });
        } else {
          it(`${row.criterion} — dado o papel negado ${role} quando chama a rota então 403 do DetranPolicyGuard antes de qualquer guarda de negócio`, async () => {
            for (const entry of row.probes) {
              const result = await probe(role, entry);
              expect(
                result.status,
                `${role} ${entry.method.toUpperCase()} ${entry.path}: ${JSON.stringify(result.body)}`,
              ).toBe(403);
              // 403 de política, nunca um 403 de negócio do catálogo DASH.
              expect(result.body.code ?? '').not.toMatch(/^DASH\./);
            }
          });
        }
      }
    });
  }
});

// Sanidade dos ids usados nas sondas (fixtures canônicas do seed 81).
describe('CTG-0001 §5.3 — fixtures das sondas', () => {
  it('dado o seed 81 quando os ids das sondas são lidos então existem no tenant de fixtures', async () => {
    const result = await client.query<{ n: string }>(
      `select count(*)::text as n from dashboard.alert where tenant_id = $1 and id = any($2::uuid[])`,
      [
        TENANT_ID,
        [
          SEED.alert.detectadoIrregularity,
          SEED.alert.notificadoExtinction,
          SEED.alert.reconhecidoExtinction,
          SEED.alert.verificadoIrregularity,
        ],
      ],
    );
    expect(Number(result.rows[0]!.n)).toBe(4);
    const cycle = await client.query<{ n: string }>(
      `select count(*)::text as n from dashboard.duty_cycle where tenant_id = $1 and id = $2 and duty_code = 'DUTY-01' and period = '2026-09'`,
      [TENANT_ID, SEED.dutyCycle.duty01JanelaAberta2026_09],
    );
    expect(Number(cycle.rows[0]!.n)).toBe(1);
  });
});
