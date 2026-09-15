// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:0d61bf54d2c0383839c31d1ecb76100ecb64d1f60e1285f5d621451b36d3995c
export interface VehicleInventory {
  id: string;
  tenant_id: string;
  measure_id: string;
  vehicle_snapshot_id: string;
  inventory_json: Record<string, unknown>;
  damage_description?: string | null;
  signed_by_person_id?: string | null;
  created_at: string;
  updated_at?: string | null;
}
