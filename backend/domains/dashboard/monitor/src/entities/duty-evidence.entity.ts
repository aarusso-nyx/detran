// Generated from BP-DASH-MONITOR-001 v1.0.0 sha256:f6f02498282fa6757196ac8b711a05e41a930f7e3980a3b9e96f62a2438e24ab
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
