// Generated from BP-INF-RAIT-CASE-001 v1.0.0 sha256:9d98d9786bc2f4b27bd75cb5516d4a00b6d74e520f3dbc52c39f33effb27f60e
export interface CreateRaitCaseEventDto {
  case_id: string;
  event_type: string;
  from_state?: string | null;
  to_state?: string | null;
  occurred_at?: string;
  actor_id?: string | null;
  payload?: Record<string, unknown> | null;
}
