// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:0d61bf54d2c0383839c31d1ecb76100ecb64d1f60e1285f5d621451b36d3995c
export interface MeasureRemoval {
  id: string;
  tenant_id: string;
  measure_id: string;
  vehicle_snapshot_id: string;
  tow_provider_id?: string | null;
  yard_id?: string | null;
  requested_at?: string | null;
  tow_arrived_at?: string | null;
  delivered_at?: string | null;
  regularization_deadline_at?: string | null;
  regularization_deadline_days?: number | null;
  destination_description?: string | null;
  created_at: string;
  updated_at?: string | null;
}
