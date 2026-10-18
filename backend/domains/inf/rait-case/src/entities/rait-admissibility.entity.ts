// Generated from BP-INF-RAIT-CASE-001 v1.1.8 sha256:c3426aeaab9b8399bba4a449964cd2a599291a377418469f82d2cf903840098d
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
