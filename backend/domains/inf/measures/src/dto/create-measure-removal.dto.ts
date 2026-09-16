// Generated from BP-INF-MEASURES-001 v1.2.0 sha256:f6d05352d77e9c4f6fc86a4c3453ea23771ab90fc5f1cdb0482a10c0cb5dfb8b
export interface CreateMeasureRemovalDto {
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
}
