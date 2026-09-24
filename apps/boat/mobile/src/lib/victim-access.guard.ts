export interface VictimAccessContext {
  readonly role: string;
  readonly purpose: string;
  readonly audit: boolean;
}

const VICTIM_ROLES = new Set(['field-agent', 'field-supervisor']);

/** Client-side presentation guard; backend policy and audit remain authoritative. */
export function victimAccessGuard(context: VictimAccessContext): boolean {
  return (
    VICTIM_ROLES.has(context.role) &&
    context.purpose.trim().length > 0 &&
    context.audit
  );
}
