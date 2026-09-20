// Generated from BP-INF-RAIT-CASE-001 v1.1.7 sha256:682b384b42c731e2e1120383e4c3bca4fabaa1afe2ac1360ca258758b6814154
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
