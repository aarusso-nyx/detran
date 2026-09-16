// Generated from BP-OPS-SNAPSHOTS-001 v1.1.0 sha256:c995962d248172eeb08cd92993fc4cafac0eada70cdbf240c54a4c69ce94edc4
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
