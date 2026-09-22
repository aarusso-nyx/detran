// Generated from BP-DASH-MONITOR-001 v1.0.0 sha256:f6f02498282fa6757196ac8b711a05e41a930f7e3980a3b9e96f62a2438e24ab
export interface PortalServiceMetrics {
  id: string;
  tenant_id: string;
  indicator_code: string;
  object_kind: string;
  object_ref: string;
  service_key?: string | null;
  state?: string | null;
  period_start: string;
  opened_at: string;
  closed_at?: string | null;
  due_on?: string | null;
  extended: boolean;
  score?: number | null;
  detail_json: Record<string, unknown>;
  last_event_id: string;
  event_schema_version: number;
  aggregate_version: number;
  created_at: string;
  updated_at?: string | null;
}
