// Generated from BP-DASH-MONITOR-001 v1.1.0 sha256:db365ada798a2115de6d57a3153f93d3657948f6562dab9927f4e35f0a8c765a
export interface DutyCycle {
  id: string;
  tenant_id: string;
  duty_code: string;
  period: string;
  state: string;
  deadline_on?: string | null;
  opened_at: string;
  started_at?: string | null;
  prepared_at?: string | null;
  submitted_at?: string | null;
  proved_at?: string | null;
  archived_at?: string | null;
  late_at?: string | null;
  unfulfilled_at?: string | null;
  draft_ref?: string | null;
  evidence_protocol?: string | null;
  evidence_capture_uri?: string | null;
  evidence_hash?: string | null;
  version: number;
  created_at: string;
  updated_at?: string | null;
}
