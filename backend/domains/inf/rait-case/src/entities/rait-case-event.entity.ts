// Generated from BP-INF-RAIT-CASE-001 v1.0.0 sha256:badca32b76e1022606203a012cf996ec5b175c2226d13b99d80123cb84352167
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
