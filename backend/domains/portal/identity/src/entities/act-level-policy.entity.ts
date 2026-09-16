// Generated from BP-PORTAL-IDENTITY-001 v1.0.2 sha256:bbfa6f4431768ff2ab5f9af097062b47775c79afb1a954ff7fb21b2c7743e4ea
export interface ActLevelPolicy {
  id: string;
  tenant_id: string;
  act_key: string;
  minimum_assurance: string;
  legal_basis: string;
  decision_ref?: string | null;
  enabled: boolean;
  effective_from: string;
  effective_to?: string | null;
  created_at: string;
  updated_at?: string | null;
}
