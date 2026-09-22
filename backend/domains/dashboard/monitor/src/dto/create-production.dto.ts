// Generated from BP-DASH-MONITOR-001 v1.0.0 sha256:f6f02498282fa6757196ac8b711a05e41a930f7e3980a3b9e96f62a2438e24ab
export interface CreateProductionDto {
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
  transitions?: number;
  last_event_id: string;
  event_schema_version: number;
  aggregate_version: number;
}
