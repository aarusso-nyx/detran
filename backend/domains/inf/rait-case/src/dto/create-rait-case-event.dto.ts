// Generated from BP-INF-RAIT-CASE-001 v1.1.8 sha256:c3426aeaab9b8399bba4a449964cd2a599291a377418469f82d2cf903840098d
export interface CreateRaitCaseEventDto {
  case_id: string;
  event_type: string;
  from_state?: string | null;
  to_state?: string | null;
  occurred_at?: string;
  actor_id?: string | null;
  payload?: Record<string, unknown> | null;
}
