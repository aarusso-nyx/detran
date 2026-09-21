// Generated from BP-DASH-MONITOR-001 v1.0.0 sha256:f6f02498282fa6757196ac8b711a05e41a930f7e3980a3b9e96f62a2438e24ab
export interface IntegrationHealth {
  id: string;
  tenant_id: string;
  period_start: string;
  system_key: string;
  metric: string;
  metric_value: number;
  sample_count: number;
  last_error_code?: string | null;
  last_seen_at?: string | null;
  last_event_id: string;
  event_schema_version: number;
  aggregate_version: number;
  created_at: string;
  updated_at?: string | null;
}
