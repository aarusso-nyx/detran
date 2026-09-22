// Generated from BP-DASH-MONITOR-001 v1.0.0 sha256:f6f02498282fa6757196ac8b711a05e41a930f7e3980a3b9e96f62a2438e24ab
export interface PrescriptionRisk {
  id: string;
  tenant_id: string;
  case_id: string;
  clock_code: string;
  indicator_code: string;
  clock_id?: string | null;
  instance?: string | null;
  flag?: string | null;
  days_remaining?: number | null;
  ceiling_on?: string | null;
  received_on?: string | null;
  case_state?: string | null;
  pool_id?: string | null;
  timer_code?: string | null;
  ceiling_effect?: string | null;
  ceiling_reached_on?: string | null;
  extinct_state?: string | null;
  flag_changed_at?: string | null;
  last_event_id: string;
  event_schema_version: number;
  aggregate_version: number;
  created_at: string;
  updated_at?: string | null;
}
