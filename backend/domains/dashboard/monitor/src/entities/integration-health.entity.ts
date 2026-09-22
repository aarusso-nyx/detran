// Generated from BP-DASH-MONITOR-001 v1.1.0 sha256:db365ada798a2115de6d57a3153f93d3657948f6562dab9927f4e35f0a8c765a
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
