// Generated from BP-DASH-MONITOR-001 v1.1.0 sha256:db365ada798a2115de6d57a3153f93d3657948f6562dab9927f4e35f0a8c765a
export interface Production {
  id: string;
  tenant_id: string;
  case_id: string;
  instance?: string | null;
  period_start: string;
  from_state?: string | null;
  current_state: string;
  state_changed_at: string;
  received_on?: string | null;
  decision_kind?: string | null;
  decided_on?: string | null;
  decision_published_on?: string | null;
  session_id?: string | null;
  agenda_outcome?: string | null;
  transitions: number;
  last_event_id: string;
  event_schema_version: number;
  aggregate_version: number;
  created_at: string;
  updated_at?: string | null;
}
