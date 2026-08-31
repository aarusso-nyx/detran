// Generated from BP-INF-RAIT-CASE-001 v1.0.0 sha256:9d98d9786bc2f4b27bd75cb5516d4a00b6d74e520f3dbc52c39f33effb27f60e
export interface RaitAdmissibility {
  id: string;
  tenant_id: string;
  case_id: string;
  criterion: string;
  verdict: boolean;
  reason?: string | null;
  evaluated_at: string;
  evaluated_by: string;
  created_at: string;
  updated_at?: string | null;
}
