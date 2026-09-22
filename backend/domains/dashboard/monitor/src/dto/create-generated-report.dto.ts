// Generated from BP-DASH-MONITOR-001 v1.1.0 sha256:db365ada798a2115de6d57a3153f93d3657948f6562dab9927f4e35f0a8c765a
export interface CreateGeneratedReportDto {
  user_ref: string;
  report_type: string;
  filters_json?: Record<string, unknown> | null;
  layer: string;
  purpose?: string | null;
  requested_at?: string;
  completed_at?: string | null;
  status?: string;
  file_uri?: string | null;
  file_hash?: string | null;
  watermark?: string | null;
  failure_code?: string | null;
  version?: number;
}
