// Generated from BP-DASH-MONITOR-001 v1.1.0 sha256:db365ada798a2115de6d57a3153f93d3657948f6562dab9927f4e35f0a8c765a
export interface DutyEvidence {
  id: string;
  tenant_id: string;
  duty_code: string;
  period: string;
  indicator_code?: string | null;
  state: string;
  deadline_on?: string | null;
  opened_at?: string | null;
  proved_at?: string | null;
  late: boolean;
  evidence_hash?: string | null;
  last_event_id: string;
  event_schema_version: number;
  aggregate_version: number;
  created_at: string;
  updated_at?: string | null;
}
