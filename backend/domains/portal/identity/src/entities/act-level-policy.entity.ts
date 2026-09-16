// Generated from BP-PORTAL-IDENTITY-001 v1.0.1 sha256:1a840b3372310d8bdecab94f05cd0978fdb1f53e677cc55361bf6d6f479c723c
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
