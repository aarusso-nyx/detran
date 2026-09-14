// Generated from BP-OPS-SNAPSHOTS-001 v1.0.0 sha256:bebc10f45ae4f8887acc821ee7211894780dd9bd4b5a67d1edfbd371f54a21c4
export interface VehicleSnapshot {
  id: string;
  tenant_id: string;
  vehicle_id?: string | null;
  plate_snapshot: string;
  renavam_snapshot?: string | null;
  make_model_snapshot?: string | null;
  species_snapshot?: string | null;
  category_snapshot?: string | null;
  color_snapshot?: string | null;
  data_source: string;
  external_query_id?: string | null;
  divergence_recorded: boolean;
  payload_json?: Record<string, unknown> | null;
  created_at: string;
  updated_at?: string | null;
}
