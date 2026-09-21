// Generated from BP-DASH-MONITOR-001 v1.0.0 sha256:f6f02498282fa6757196ac8b711a05e41a930f7e3980a3b9e96f62a2438e24ab
export interface CreateAlertTrailDto {
  alert_id: string;
  seq: number;
  from_state?: string | null;
  to_state: string;
  actor_kind: string;
  actor_ref?: string | null;
  occurred_at?: string;
  note?: string | null;
  root_cause_category?: string | null;
  event_id?: string | null;
}
