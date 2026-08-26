// Generated from BP-INF-RAIT-CASE-001 v1.0.0 sha256:badca32b76e1022606203a012cf996ec5b175c2226d13b99d80123cb84352167
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
