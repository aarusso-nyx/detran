// Generated from BP-INF-RAIT-CASE-001 v1.0.0 sha256:aa7b398ec04e8ec20dddff316e606e4dc5b3dcad6348495f967681cbaf63f107
export interface CreateRaitDecisionDto {
  case_id: string;
  circuit: number;
  decision_kind: string;
  grounds: string;
  decided_by: string;
  decided_at?: string;
  session_id?: string | null;
  signature_kind?: string | null;
  signature_ref?: string | null;
  published_at?: string | null;
}
