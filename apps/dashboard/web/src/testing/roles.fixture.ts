// R-0016 TASK-0004 (Inspector). Transcrição independente de `backend/domains/shared/src/roles.ts`
// linhas 60-95 (`DETRAN_ROLES`, 36 códigos, mesma ordem de `PEC_ROLES` + os granulares + os
// dois auxiliares finais) e de `policy.ts` linhas 1508-1538 (`DASH_AREA_MANAGERS`, `DASH_TECH`,
// `DASH_N0_ROLES`, `DASH_EXPORT_ROLES`). Este arquivo NUNCA importa `roles.ts`/`policy.ts` nem
// `src/app/app.route-manifest.ts` (ADR-0001; `CTG-0002.md` §12) — é comparado campo a campo pelos
// specs, nunca reexportado pelo app.
export const DETRAN_ROLES_FIXTURE = [
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

export type DetranRoleFixture = (typeof DETRAN_ROLES_FIXTURE)[number];

// policy.ts linhas 1720-1725 (`GLOBAL_ADMIN_ROLES`).
export const GLOBAL_ADMIN_ROLES_FIXTURE = [
  'ADMIN',
  'GESTOR_DETRAN',
  'SUPORTE',
  'technical-admin',
] as const;

// policy.ts linhas 1513-1519 (`DASH_AREA_MANAGERS`).
export const AREA_MANAGERS_FIXTURE = [
  'rait-manager',
  'rait-coordinator',
  'rait-chair',
  'traffic-authority',
  'GESTOR',
] as const;

// policy.ts linhas 1520-1523 (`DASH_TECH`).
export const TECH_FIXTURE = [
  'technical-admin',
  'integration-operator',
] as const;

// policy.ts linhas 1528-1530 (`DASH_N0_ROLES` = DETRAN_ROLES menos CANDIDATO e CIDADAO, 34).
export const N0_ROLES_FIXTURE: readonly string[] = DETRAN_ROLES_FIXTURE.filter(
  (role) => role !== 'CANDIDATO' && role !== 'CIDADAO',
);

// policy.ts linhas 1531-1539 (`DASH_EXPORT_ROLES`, 12).
export const EXPORT_ROLES_FIXTURE: readonly string[] = [
  'agency-admin',
  'GESTOR_DETRAN',
  ...AREA_MANAGERS_FIXTURE,
  'dash-operator',
  'dash-duty-owner',
  ...TECH_FIXTURE,
  'bi-analyst',
];

// Sessão sem papel canônico (C-01-06; `canonicalRole` de `roles.ts` devolve `undefined` para
// qualquer código fora de DETRAN_ROLES_FIXTURE — a facade não canonicaliza e o papel bruto entra
// só como `role:x-unknown` em `permissions`, nunca em nenhuma matriz de `DASHBOARD_RULES`).
export const NO_CANONICAL_ROLE_SESSION = { roles: ['x-unknown'] } as const;
