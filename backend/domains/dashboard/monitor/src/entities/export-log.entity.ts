// Generated from BP-DASH-MONITOR-001 v1.0.0 sha256:f6f02498282fa6757196ac8b711a05e41a930f7e3980a3b9e96f62a2438e24ab
export interface ExportLog {
  id: string;
  tenant_id: string;
  user_ref: string;
  user_role: string;
  scope: string;
  filters_json: Record<string, unknown>;
  format: string;
  layer: string;
  purpose?: string | null;
  row_count: number;
  status: string;
  justification?: string | null;
  approved_by?: string | null;
  approved_at?: string | null;
  watermark?: string | null;
  suppressed_cells: number;
  origin?: string | null;
  requested_at: string;
  created_at: string;
  updated_at?: string | null;
}
