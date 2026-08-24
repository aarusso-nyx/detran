// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
export interface CreateMeasureRetentionDto {
  measure_id: string;
  vehicle_snapshot_id: string;
  retention_reason: string;
  regularized_at?: string | null;
  released_at?: string | null;
  release_user_ref?: string | null;
}
