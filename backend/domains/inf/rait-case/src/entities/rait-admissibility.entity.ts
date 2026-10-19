// Generated from BP-INF-RAIT-CASE-001 v1.2.0 sha256:e9e4916988b2bb485cd08216fc2bf2b441c013a55c05124de7f731eb9229ac17
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
