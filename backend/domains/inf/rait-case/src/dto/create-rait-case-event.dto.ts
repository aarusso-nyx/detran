// Generated from BP-INF-RAIT-CASE-001 v1.1.0 sha256:f85c2f343d3739d77786d05e0f2f98d07e00de6ca63aa3aaa743b5b949714f62
export interface CreateRaitCaseEventDto {
  case_id: string;
  event_type: string;
  from_state?: string | null;
  to_state?: string | null;
  occurred_at?: string;
  actor_id?: string | null;
  payload?: Record<string, unknown> | null;
}
