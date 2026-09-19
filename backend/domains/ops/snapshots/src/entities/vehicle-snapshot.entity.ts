// Generated from BP-OPS-SNAPSHOTS-001 v1.1.0 sha256:be057438a0ae6bba679549fa27603002919b4035701f4ea81d9ed853b9c00734
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
