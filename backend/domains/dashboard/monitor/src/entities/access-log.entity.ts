// Generated from BP-DASH-MONITOR-001 v1.1.0 sha256:db365ada798a2115de6d57a3153f93d3657948f6562dab9927f4e35f0a8c765a
export interface AccessLog {
  id: string;
  tenant_id: string;
  user_ref: string;
  user_role: string;
  at: string;
  resource: string;
  filters_json: Record<string, unknown>;
  layer: string;
  row_count: number;
  origin?: string | null;
  purpose?: string | null;
  export_id?: string | null;
  created_at: string;
  updated_at?: string | null;
}
