// Generated from BP-DASH-MONITOR-001 v1.1.0 sha256:db365ada798a2115de6d57a3153f93d3657948f6562dab9927f4e35f0a8c765a
export interface CreatePortalServiceMetricsDto {
  indicator_code: string;
  object_kind: string;
  object_ref: string;
  service_key?: string | null;
  state?: string | null;
  period_start: string;
  opened_at: string;
  closed_at?: string | null;
  due_on?: string | null;
  extended?: boolean;
  score?: number | null;
  detail_json?: Record<string, unknown>;
  last_event_id: string;
  event_schema_version: number;
  aggregate_version: number;
}
