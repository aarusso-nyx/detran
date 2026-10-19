// Generated from BP-INF-RAIT-CASE-001 v1.2.0 sha256:1b90179b79d5d4ff32396ee08e8b4f308b5c60a90cbf5cd3e6bf1d1fa400265f
export interface RaitCaseReadScope {
  id: string;
  tenant_id: string;
  actor_id: string;
  role: string;
  unit_id?: string | null;
  pool_id?: string | null;
  active: boolean;
  authorization_ref: string;
  created_at: string;
  updated_at?: string | null;
}
