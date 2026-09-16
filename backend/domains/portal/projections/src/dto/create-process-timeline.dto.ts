// Generated from BP-PORTAL-PROJECTIONS-001 v1.0.0 sha256:0be808a8cab613c80b9fc898d70fcdf1323a979c488210bf692b3c489326b380
export interface CreateProcessTimelineDto {
  request_id?: string | null;
  case_id: string;
  entries_json: Record<string, unknown>;
  deadlines_json: Record<string, unknown>;
  decision_json?: Record<string, unknown> | null;
  last_event_id: string;
}
