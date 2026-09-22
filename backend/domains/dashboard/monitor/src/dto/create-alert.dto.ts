// Generated from BP-DASH-MONITOR-001 v1.1.0 sha256:db365ada798a2115de6d57a3153f93d3657948f6562dab9927f4e35f0a8c765a
export interface CreateAlertDto {
  indicator_code: string;
  track: string;
  state: string;
  severity: string;
  block: string;
  source_app: string;
  object_kind: string;
  object_ref: string;
  object_layer: string;
  owner_role: string;
  owner_ref?: string | null;
  governing_clock?: string | null;
  next_milestone_at?: string | null;
  ceiling_on?: string | null;
  detected_at?: string;
  classified_at?: string | null;
  notified_at?: string | null;
  acknowledged_at?: string | null;
  treating_at?: string | null;
  verified_at?: string | null;
  closed_at?: string | null;
  escalated_at?: string | null;
  critical_at?: string | null;
  incident_at?: string | null;
  ack_channel?: string | null;
  escalation_level?: number;
  incident_ref?: string | null;
  source_event_id?: string | null;
  version?: number;
}
