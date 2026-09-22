// Generated from BP-DASH-MONITOR-001 v1.1.0 sha256:db365ada798a2115de6d57a3153f93d3657948f6562dab9927f4e35f0a8c765a
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
