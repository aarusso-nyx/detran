// Generated from BP-DASH-MONITOR-001 v1.1.0 sha256:db365ada798a2115de6d57a3153f93d3657948f6562dab9927f4e35f0a8c765a
export interface CreatePecDeadlinesDto {
  case_id: string;
  indicator_code: string;
  from_state?: string | null;
  to_state: string;
  changed_at: string;
  due_on?: string | null;
  legal_basis?: string | null;
  last_event_id: string;
  event_schema_version: number;
  aggregate_version: number;
}
