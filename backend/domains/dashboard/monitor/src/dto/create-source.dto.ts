// Generated from BP-DASH-MONITOR-001 v1.1.0 sha256:db365ada798a2115de6d57a3153f93d3657948f6562dab9927f4e35f0a8c765a
export interface CreateSourceDto {
  source_key: string;
  app: string;
  state: string;
  last_seen_at?: string | null;
  last_read_at?: string | null;
  acceptable_latency_minutes?: number | null;
  heartbeat_contract?: string | null;
  stale_since?: string | null;
  hidden?: boolean;
  last_event_id?: string | null;
  version?: number;
}
