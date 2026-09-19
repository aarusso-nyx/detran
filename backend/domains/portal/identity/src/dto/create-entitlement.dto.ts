// Generated from BP-PORTAL-IDENTITY-001 v1.0.2 sha256:bbfa6f4431768ff2ab5f9af097062b47775c79afb1a954ff7fb21b2c7743e4ea
export interface CreateEntitlementDto {
  subject_id: string;
  target_kind: string;
  target_id: string;
  relation: string;
  origin: string;
  valid_from: string;
  valid_until?: string | null;
}
