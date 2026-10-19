// Generated from BP-INF-RAIT-CASE-001 v1.2.0 sha256:e9e4916988b2bb485cd08216fc2bf2b441c013a55c05124de7f731eb9229ac17
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
