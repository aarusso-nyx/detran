// Generated from BP-INF-RAIT-CASE-001 v1.2.0 sha256:e9e4916988b2bb485cd08216fc2bf2b441c013a55c05124de7f731eb9229ac17
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
