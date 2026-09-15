// Generated from BP-INF-RAIT-CASE-001 v1.1.0 sha256:f85c2f343d3739d77786d05e0f2f98d07e00de6ca63aa3aaa743b5b949714f62
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
