// Generated from BP-DASH-MONITOR-001 v1.0.0 sha256:f6f02498282fa6757196ac8b711a05e41a930f7e3980a3b9e96f62a2438e24ab
export interface GeneratedReport {
  id: string;
  tenant_id: string;
  user_ref: string;
  report_type: string;
  filters_json?: Record<string, unknown> | null;
  layer: string;
  purpose?: string | null;
  requested_at: string;
  completed_at?: string | null;
  status: string;
  file_uri?: string | null;
  file_hash?: string | null;
  watermark?: string | null;
  failure_code?: string | null;
  version: number;
  created_at: string;
  updated_at?: string | null;
}
