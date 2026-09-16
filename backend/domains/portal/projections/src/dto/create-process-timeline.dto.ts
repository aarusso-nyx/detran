// Generated from BP-PORTAL-PROJECTIONS-001 v1.0.1 sha256:b30e4ad53da99d2d4e5fb17ef4f0c9c8cdf5814458a99505c92f04945c482281
export interface CreateProcessTimelineDto {
  request_id?: string | null;
  case_id: string;
  entries_json: Record<string, unknown>;
  deadlines_json: Record<string, unknown>;
  decision_json?: Record<string, unknown> | null;
  last_event_id: string;
}
