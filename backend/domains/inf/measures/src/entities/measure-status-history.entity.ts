// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:0d61bf54d2c0383839c31d1ecb76100ecb64d1f60e1285f5d621451b36d3995c
export interface MeasureStatusHistory {
  id: string;
  tenant_id: string;
  measure_id: string;
  status: string;
  changed_at: string;
  user_ref?: string | null;
  reason?: string | null;
  details_json?: Record<string, unknown> | null;
  created_at: string;
  updated_at?: string | null;
}
