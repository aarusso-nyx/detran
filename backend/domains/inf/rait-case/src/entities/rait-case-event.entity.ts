// Generated from BP-INF-RAIT-CASE-001 v1.0.0 sha256:aa7b398ec04e8ec20dddff316e606e4dc5b3dcad6348495f967681cbaf63f107
export interface RaitCaseEvent {
  id: string;
  tenant_id: string;
  case_id: string;
  event_type: string;
  from_state?: string | null;
  to_state?: string | null;
  occurred_at: string;
  actor_id?: string | null;
  payload?: Record<string, unknown> | null;
  created_at: string;
  updated_at?: string | null;
}
