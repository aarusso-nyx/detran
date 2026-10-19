// Generated from BP-INF-RAIT-CASE-001 v1.2.0 sha256:e9e4916988b2bb485cd08216fc2bf2b441c013a55c05124de7f731eb9229ac17
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
