// Generated from BP-DASH-MONITOR-001 v1.0.0 sha256:f6f02498282fa6757196ac8b711a05e41a930f7e3980a3b9e96f62a2438e24ab
export interface CreateDutyCycleDto {
  duty_code: string;
  period: string;
  state: string;
  deadline_on?: string | null;
  opened_at?: string;
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
  version?: number;
}
