// Generated from BP-INF-RAIT-CASE-001 v1.3.0 sha256:1cc510a10cfe7e10e232b53291df1132f8a90e54bce9c71c4e2c39acbfa41af2
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
