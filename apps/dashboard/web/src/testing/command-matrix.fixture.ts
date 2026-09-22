// R-0016 TASK-0004 (Inspector). Transcrição independente dos grants de comando de
// `backend/domains/shared/src/policy.ts` (`DASHBOARD_RULES` linhas 1561-1638 e as cinco linhas
// `(=)` 846-869: `generated-report:request`, `indicator-config:publish`) citados em
// `route-manifest.md` §D "Chaves de comando" e em `CTG-0001.md` §4 C-01-11. Nunca importa
// `policy.ts` (ADR-0001; `CTG-0002.md` §12) — cada comando é transcrito de novo aqui.
import {
  AREA_MANAGERS_FIXTURE,
  EXPORT_ROLES_FIXTURE,
  GLOBAL_ADMIN_ROLES_FIXTURE,
  TECH_FIXTURE,
} from './roles.fixture.js';

// policy.ts 1561: 'ack' = ['dash-operator', ...DASH_ALERT_OWNERS] = ['dash-operator',
// ...DASH_AREA_MANAGERS, 'agency-admin', ...DASH_TECH] (9).
const ALERT_ACK = [
  'dash-operator',
  ...AREA_MANAGERS_FIXTURE,
  'agency-admin',
  ...TECH_FIXTURE,
] as const;

// policy.ts 1562: 'treat' = DASH_ALERT_OWNERS = [...DASH_AREA_MANAGERS, 'agency-admin',
// ...DASH_TECH] (8).
const ALERT_TREAT = [
  ...AREA_MANAGERS_FIXTURE,
  'agency-admin',
  ...TECH_FIXTURE,
] as const;

// policy.ts: 'incident read' = [...DASH_AREA_MANAGERS, 'agency-admin', 'AUDITOR'] (7).
const INCIDENT_READ = [
  ...AREA_MANAGERS_FIXTURE,
  'agency-admin',
  'AUDITOR',
] as const;

// 16 comandos com grant próprio de C-01-11 (route-manifest.md §D "Chaves de comando").
export const COMMAND_MATRIX_FIXTURE: Readonly<
  Record<string, readonly string[]>
> = {
  'dashboard:alert:ack': ALERT_ACK,
  'dashboard:alert:treat': ALERT_TREAT,
  'dashboard:alert:close': ['dash-operator'],
  'dashboard:alert:annotate': TECH_FIXTURE,
  'dashboard:incident:read': INCIDENT_READ,
  'dashboard:duty-cycle:start': ['dash-duty-owner', 'agency-admin'],
  'dashboard:duty-cycle:prepare': ['dash-duty-owner', 'agency-admin'],
  'dashboard:duty-cycle:submit': ['dash-duty-owner', 'agency-admin'],
  'dashboard:duty-cycle:prove': ['dash-duty-owner', 'agency-admin'],
  'dashboard:duty-cycle:archive': ['dash-operator', 'agency-admin'],
  'dashboard:indicator-config:update': [
    'bi-analyst',
    'agency-admin',
    'technical-admin',
  ],
  'dashboard:indicator-config:publish': [
    'bi-analyst',
    'agency-admin',
    'technical-admin',
  ],
  'dashboard:generated-report:request': [
    'bi-analyst',
    'agency-admin',
    'technical-admin',
  ],
  'dashboard:export:create': EXPORT_ROLES_FIXTURE,
  'dashboard:export:approve': ['agency-admin'],
  'dashboard:transparency-audit:audit': ['technical-admin', 'agency-admin'],
};

/** role ∈ matriz[command] || role ∈ GLOBAL_ADMIN_ROLES_FIXTURE (passe '*', §E). */
export function expectedCommandResult(command: string, role: string): boolean {
  const grant = COMMAND_MATRIX_FIXTURE[command] ?? [];
  return (
    grant.includes(role) || GLOBAL_ADMIN_ROLES_FIXTURE.includes(role as never)
  );
}
