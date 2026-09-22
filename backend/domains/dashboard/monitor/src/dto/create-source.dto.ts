// Generated from BP-DASH-MONITOR-001 v1.0.0 sha256:f6f02498282fa6757196ac8b711a05e41a930f7e3980a3b9e96f62a2438e24ab
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
