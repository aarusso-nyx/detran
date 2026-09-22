// Generated from BP-DASH-MONITOR-001 v1.0.0 sha256:f6f02498282fa6757196ac8b711a05e41a930f7e3980a3b9e96f62a2438e24ab
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
