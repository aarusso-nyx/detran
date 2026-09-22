// Generated from BP-DASH-MONITOR-001 v1.1.0 sha256:db365ada798a2115de6d57a3153f93d3657948f6562dab9927f4e35f0a8c765a
export interface CreateExportLogDto {
  user_ref: string;
  user_role: string;
  scope: string;
  filters_json: Record<string, unknown>;
  format: string;
  layer: string;
  purpose?: string | null;
  row_count: number;
  status?: string;
  justification?: string | null;
  approved_by?: string | null;
  approved_at?: string | null;
  watermark?: string | null;
  suppressed_cells?: number;
  origin?: string | null;
  requested_at?: string;
}
