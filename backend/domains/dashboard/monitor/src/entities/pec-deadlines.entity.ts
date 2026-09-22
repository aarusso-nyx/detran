// Generated from BP-DASH-MONITOR-001 v1.0.0 sha256:f6f02498282fa6757196ac8b711a05e41a930f7e3980a3b9e96f62a2438e24ab
export interface PecDeadlines {
  id: string;
  tenant_id: string;
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
  created_at: string;
  updated_at?: string | null;
}
