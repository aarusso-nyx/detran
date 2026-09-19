// Generated from BP-INF-MEASURES-001 v1.2.0 sha256:f6d05352d77e9c4f6fc86a4c3453ea23771ab90fc5f1cdb0482a10c0cb5dfb8b
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
