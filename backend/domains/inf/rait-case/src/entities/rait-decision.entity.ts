// Generated from BP-INF-RAIT-CASE-001 v1.1.0 sha256:f85c2f343d3739d77786d05e0f2f98d07e00de6ca63aa3aaa743b5b949714f62
export interface RaitDecision {
  id: string;
  tenant_id: string;
  case_id: string;
  circuit: number;
  decision_kind: string;
  grounds: string;
  decided_by: string;
  decided_at: string;
  session_id?: string | null;
  signature_kind?: string | null;
  signature_ref?: string | null;
  published_at?: string | null;
  created_at: string;
  updated_at?: string | null;
}
