// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
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
  destination_description?: string | null;
  created_at: string;
  updated_at?: string | null;
}
