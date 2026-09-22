// Generated from BP-DASH-MONITOR-001 v1.1.0 sha256:db365ada798a2115de6d57a3153f93d3657948f6562dab9927f4e35f0a8c765a
export interface CreateTeatMeasuresDto {
  indicator_code: string;
  object_kind: string;
  object_ref: string;
  state?: string | null;
  started_at?: string | null;
  ended_at?: string | null;
  deadline_at?: string | null;
  integrity_ok?: boolean | null;
  detail_json?: Record<string, unknown>;
  last_event_id: string;
  event_schema_version: number;
  aggregate_version: number;
}
