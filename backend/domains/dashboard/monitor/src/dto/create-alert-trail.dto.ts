// Generated from BP-DASH-MONITOR-001 v1.1.0 sha256:db365ada798a2115de6d57a3153f93d3657948f6562dab9927f4e35f0a8c765a
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
