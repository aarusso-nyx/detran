// Generated from BP-PORTAL-IDENTITY-001 v1.0.1 sha256:1a840b3372310d8bdecab94f05cd0978fdb1f53e677cc55361bf6d6f479c723c
export interface Subject {
  id: string;
  tenant_id: string;
  cpf_hash: string;
  name: string;
  govbr_level_observed?: string | null;
  assurance_level_observed: string;
  observed_at: string;
  version: number;
  created_at: string;
  updated_at?: string | null;
}
