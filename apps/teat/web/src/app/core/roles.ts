export const TEAT_WEB_ROLES = [
  'field-agent',
  'field-supervisor',
  'processing-operator',
  'traffic-authority',
  'agency-admin',
  'technical-admin',
  'AUDITOR',
  'bi-analyst',
  'integration-operator',
] as const;

export type TeatWebRole = (typeof TEAT_WEB_ROLES)[number];

export function canonicalRole(role: string): TeatWebRole | undefined {
  const candidate = role === 'auditor' ? 'AUDITOR' : role;
  return (TEAT_WEB_ROLES as readonly string[]).includes(candidate)
    ? (candidate as TeatWebRole)
    : undefined;
}
