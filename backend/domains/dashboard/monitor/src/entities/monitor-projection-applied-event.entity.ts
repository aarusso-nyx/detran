// Generated from BP-DASH-MONITOR-001 v1.0.0 sha256:f6f02498282fa6757196ac8b711a05e41a930f7e3980a3b9e96f62a2438e24ab
export interface MonitorProjectionAppliedEvent {
  id: string;
  tenant_id: string;
  projection_name: string;
  event_id: string;
  event_type: string;
  event_schema_version: number;
  aggregate_version: number;
  occurred_at: string;
  applied_at: string;
  created_at: string;
  updated_at?: string | null;
}
