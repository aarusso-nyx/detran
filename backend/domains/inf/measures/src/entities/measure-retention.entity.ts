// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:0d61bf54d2c0383839c31d1ecb76100ecb64d1f60e1285f5d621451b36d3995c
export interface MeasureRetention {
  id: string;
  tenant_id: string;
  measure_id: string;
  vehicle_snapshot_id: string;
  retention_reason: string;
  regularization_deadline_at?: string | null;
  regularization_deadline_days?: number | null;
  regularized_at?: string | null;
  released_at?: string | null;
  release_user_ref?: string | null;
  created_at: string;
  updated_at?: string | null;
}
