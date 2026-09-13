/** PEC role codes are preserved verbatim to avoid changing origin authority. */
export const PEC_ROLES = [
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
] as const;

/** TEAT staff role codes are preserved except for the duplicate auditor alias. */
export const TEAT_STAFF_ROLES = [
  'field-agent',
  'field-supervisor',
  'processing-operator',
  'traffic-authority',
  'agency-admin',
  'technical-admin',
  'auditor',
  'bi-analyst',
  'integration-operator',
] as const;

/**
 * Source-to-canonical mapping. Only `auditor` is deduplicated because it is
 * the same role name with casing changed. Similar-looking roles retain their
 * source semantics; e.g. field-supervisor is not silently widened to PEC's
 * clinical SUPERVISOR.
 */
export const ROLE_ALIASES = {
  'field-agent': 'field-agent',
  'field-supervisor': 'field-supervisor',
  'processing-operator': 'processing-operator',
  'traffic-authority': 'traffic-authority',
  'agency-admin': 'agency-admin',
  'technical-admin': 'technical-admin',
  auditor: 'AUDITOR',
  'bi-analyst': 'bi-analyst',
  'integration-operator': 'integration-operator',
} as const;

/**
 * RAIT staff role codes (Owner decision 2026-09-12, recorded in
 * docs/framework/product/shared/actors.md §Papéis granulares RAIT and
 * ADR-0015). Codes are lowercase-kebab like the TEAT family; one person may
 * accumulate several (union semantics, ADR-0005).
 */
export const RAIT_ROLES = [
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

export const DETRAN_ROLES = [
  ...PEC_ROLES,
  'field-agent',
  'field-supervisor',
  'processing-operator',
  'traffic-authority',
  'agency-admin',
  'technical-admin',
  'bi-analyst',
  'integration-operator',
  ...RAIT_ROLES,
  'CIDADAO',
] as const;

export type DetranRole = (typeof DETRAN_ROLES)[number];

const CANONICAL_ROLE_SET = new Set<string>(DETRAN_ROLES);

export function canonicalRole(role: string): DetranRole | undefined {
  const trimmed = role.trim();
  if (trimmed === 'auditor') return 'AUDITOR';
  return CANONICAL_ROLE_SET.has(trimmed) ? (trimmed as DetranRole) : undefined;
}

export function canonicalRoles(roles: readonly string[]): DetranRole[] {
  return [
    ...new Set(
      roles
        .map(canonicalRole)
        .filter((role): role is DetranRole => role !== undefined),
    ),
  ];
}
